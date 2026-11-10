---
title: 'Memory Bandwidth Not GPU Compute Limits LLM Token Generation Speed'
description: 'Autoregressive LLM decoding stalls on HBM bandwidth at ~1 FLOP/byte while H100 Tensor Cores need 295 FLOPs/byte. Learn KV cache math, GQA, and MLA.'
pubDate: 2026-11-09
track: technical
question: 'Why does token generation saturate GPU memory bandwidth while compute units sit idle?'
keywords:
  - KV Cache Memory Bandwidth
  - Arithmetic Intensity
  - Grouped-Query Attention
  - Prefill vs Decode Phase
heroImage: '../../assets/art/kv-cache-explained-light.webp'
heroImageDark: '../../assets/art/kv-cache-explained-dark.webp'
heroAlt: 'Minimalist geometric diagram contrasting a moss-accented memory bus of Key-Value tick marks against a mostly empty grid of GPU compute cores beneath a severed Roofline curve.'
readingTime: '6 min read'
notionId: '413ced67-050a-8162-a772-f9582771ce0d'
---
<div class="tldr">

## Executive TL;DR

- **Autoregressive decoding hits a memory bandwidth wall:** Single-stream decoding achieves ~1 FLOP/byte, while an [NVIDIA H100 SXM5 GPU](https://www.nvidia.com/en-us/data-center/h100/) needs 295.2 FLOPs/byte (989 TFLOPS FP16 / 3.35 TB/s HBM3) to saturate Tensor Cores, leaving >90% of compute idle at batch size 1.
- **Prefill and decode operate in opposite regimes:** Prefill multiplies prompt tokens in parallel at >2,000 FLOPs/byte (compute-bound), while decode streams gigabytes of weights and Key-Value (KV) states from HBM per output token (memory-bound).
- **Uncompressed KV caches outgrow weights at long contexts:** Under Multi-Head Attention, a [Llama 3.1 70B](https://arxiv.org/abs/2407.21783) baseline consumes 2.62 MB/token in FP16, taking 85.90 GB of VRAM for one 32,768-token session.
- **Modern attention primitives shrink memory traffic:** [Grouped-Query Attention (GQA)](https://arxiv.org/abs/2305.13245) cuts Llama 3.1 70B cache size by 8x (10.74 GB at 32K context), while [DeepSeek-V2 Multi-Head Latent Attention (MLA)](https://arxiv.org/abs/2405.04434) compresses KV states into latent vectors to cut cache memory by 93.3% and boost throughput by 5.76x.
- **Large batching and low-bit quantization flip the bottleneck back to compute:** Pushing batch sizes past 295 requests or running non-fused INT4 KV dequantization kernels drives operational intensity above the ridge point, shifting the bottleneck back to compute.

</div>

## Why does token generation leave GPU compute cores starving?

Engineers profiling large language model (LLM) serving often expect latency to scale with floating-point compute. When deployments lag, teams shop for higher teraFLOPS ratings. Production telemetry tells a different story: during token generation, GPU Tensor Cores spend up to 90% of their cycles stalled, waiting on High Bandwidth Memory (HBM) transfers.

To see why memory bandwidth vs compute in LLM serving favors bandwidth, picture a factory with 1,000 CNC milling machines (Tensor Cores) linked to a distant warehouse (off-chip HBM) by a two-lane road (the memory bus). For a bulk order of 2,048 aluminum blanks, one truck hauls a master blueprint once, and all 1,000 machines cut metal simultaneously (prompt prefill). Now picture a custom order where each part depends on measurements of every prior part. For every cut, a truck hauls the blueprint plus a growing archive of past measurements across the two-lane road, mills one piece in a microsecond, and waits. The machines sit idle while the road stays jammed.

The [Roofline performance model](https://doi.org/10.1145/1498765.1498785) formalizes this via arithmetic intensity: FLOPs executed per byte transferred across the memory bus. Dividing peak compute by peak bandwidth defines a GPU's ridge point. Per [NVIDIA H100 Tensor Core GPU specs](https://www.nvidia.com/en-us/data-center/h100/), the SXM5 delivers 989 TFLOPS dense FP16 compute and 3.35 TB/s HBM3 bandwidth, setting a ridge point of 295.2 FLOPs/byte. Kernels below 295 FLOPs/byte hit the memory roof before reaching peak compute.

| GPU Accelerator | VRAM | Bandwidth | Dense FP16 | Ridge Point | Batch-1 Decode (8B FP16) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| [NVIDIA RTX 4090](https://images.nvidia.com/aem-dam/Solutions/geforce/ada/nvidia-ada-gpu-architecture.pdf) | 24GB GDDR6X | 1,008GB/s | 165.2 TFLOPS | 163.9 FLOP/B | ~63.0 tok/s |
| [NVIDIA A100 SXM4](https://awesomeagents.ai/hardware/nvidia-a100/) | 80GB HBM2e | 2,039GB/s | 312.0 TFLOPS | 153.0 FLOP/B | ~127.4 tok/s |
| [NVIDIA H100 PCIe](https://www.thundercompute.com/blog/nvidia-h100-specs-full-guide) | 80GB HBM2e | 2,000GB/s | 756.0 TFLOPS | 378.0 FLOP/B | ~125.0 tok/s |
| [NVIDIA H100 SXM5](https://www.nvidia.com/en-us/data-center/h100/) | 80GB HBM3 | 3,350GB/s | 989.0 TFLOPS | 295.2 FLOP/B | ~209.4 tok/s |

Moving from an [A100 SXM4 80GB](https://awesomeagents.ai/hardware/nvidia-a100/) to an [H100 PCIe 80GB](https://www.thundercompute.com/blog/nvidia-h100-specs-full-guide) more than doubles FP16 compute (312 to 756 TFLOPS), yet batch-1 decode speed for a 16GB model stays flat (~127.4 vs. ~125.0 tok/s) because both share ~2.0 TB/s bandwidth. Streaming 16GB at 3,350 GB/s on an H100 SXM5 caps batch-1 speed at 209.4 tok/s.

## What do keys and values actually represent?

Understanding why is LLM generation memory bound requires inspecting what does KV cache actually store across steps. Inside each transformer layer, token embedding x_t multiplies against weight matrices (W_Q, W_K, W_V) to produce three vectors:

- **Query (Q_t):** Search vector representing what current token t looks for in prior tokens.
- **Key (K_t):** Index label describing what context token t holds, matched against queries via dot product (Q_t · K^T).
- **Value (V_t):** Payload vector holding token t's semantic content, weighted by softmax scores to form the output.

Because causal masking blocks future tokens, Key (K_i) and Value (V_i) vectors for past tokens i < t stay fixed when token t + 1 arrives. Without caching, generating token 1,000 requires re-multiplying all 999 prior tokens through W_K and W_V, creating an O(S²) penalty. Having the KV cache explained from first principles clarifies the fix: the runtime appends each new K_t and V_t to an HBM buffer and streams that buffer into SRAM on every decode step.

### The KV cache explained: vector flow across generation steps

<figure class="diagram">
<svg viewBox="0 0 680 340" role="img" aria-labelledby="kv-flow-title kv-flow-desc">
  <title id="kv-flow-title">KV Cache Vector Dataflow During Token Generation Step t=3</title>
  <desc id="kv-flow-desc">Dataflow diagram showing incoming token projection into query, key, and value vectors, appending keys and values to off-chip HBM KV cache, and streaming into on-chip SRAM for softmax attention calculation.</desc>
  <g font-family="inherit">
    <!-- Step Header -->
    <rect x="10" y="10" width="660" height="34" rx="6" fill="var(--wash-mizu)" stroke="var(--border)" stroke-width="1"/>
    <text x="25" y="32" font-size="11.5" font-weight="700" fill="var(--mizu)">STEP t=3: Generating 4th token after prompt [&quot;The&quot;, &quot;GPU&quot;, &quot;stalls&quot;]</text>
    <!-- Token Input -->
    <rect x="10" y="60" width="130" height="90" rx="8" fill="var(--card)" stroke="var(--border)" stroke-width="1.5"/>
    <text x="75" y="88" font-size="11" font-weight="700" fill="var(--ink)" text-anchor="middle">Token t=3</text>
    <rect x="25" y="102" width="100" height="26" rx="4" fill="var(--paper)" stroke="var(--border)" stroke-width="1"/>
    <text x="75" y="119" font-size="11.5" font-weight="700" fill="var(--mizu)" text-anchor="middle">&quot;stalls&quot;</text>
    <!-- Projections -->
    <!-- W_Q -> Query q_3 -->
    <path d="M 140 85 L 210 85" fill="none" stroke="var(--border)" stroke-width="1.5"/>
    <polygon points="208,81 216,85 208,89" fill="var(--border)"/>
    <rect x="220" y="66" width="170" height="38" rx="6" fill="var(--card)" stroke="var(--mizu)" stroke-width="1.2"/>
    <text x="232" y="84" font-size="10.5" font-weight="700" fill="var(--ink)">Query q_3 (W_Q)</text>
    <text x="232" y="96" font-size="9" fill="var(--mizu)">1×128 · Stays in On-Chip SRAM</text>
    <!-- W_K / W_V -> HBM Append -->
    <path d="M 140 125 L 210 125" fill="none" stroke="var(--border)" stroke-width="1.5"/>
    <polygon points="208,121 216,125 208,129" fill="var(--border)"/>
    <rect x="220" y="112" width="170" height="38" rx="6" fill="var(--card)" stroke="var(--border)" stroke-width="1.2"/>
    <text x="232" y="129" font-size="10.5" font-weight="700" fill="var(--ink)">Key k_3 &amp; Value v_3</text>
    <text x="232" y="142" font-size="9" fill="var(--ink-soft)">Appended to HBM Buffer</text>
    <!-- Arrow to HBM Cache -->
    <path d="M 390 131 L 430 131 L 430 180" fill="none" stroke="var(--mizu)" stroke-width="1.5"/>
    <polygon points="426,178 430,186 434,178" fill="var(--mizu)"/>
    <!-- Off-chip HBM KV Cache Card -->
    <rect x="10" y="176" width="660" height="76" rx="8" fill="var(--card)" stroke="var(--border)" stroke-width="1.5"/>
    <rect x="10" y="176" width="660" height="24" rx="8" fill="var(--wash-mizu)"/>
    <text x="25" y="193" font-size="10" font-weight="700" letter-spacing="0.05em" fill="var(--mizu)" text-transform="uppercase">Off-Chip HBM KV Cache (Streamed across 3.35 TB/s Bus Every Token)</text>
    <text x="25" y="222" font-size="10" font-family="monospace" fill="var(--ink)">Keys   K_1..3: [ k_1(&quot;The&quot;) | k_2(&quot;GPU&quot;) | k_3(&quot;stalls&quot;) ]</text>
    <text x="25" y="240" font-size="10" font-family="monospace" fill="var(--ink)">Values V_1..3: [ v_1(&quot;The&quot;) | v_2(&quot;GPU&quot;) | v_3(&quot;stalls&quot;) ]</text>
    <!-- Stream to SRAM Attention -->
    <path d="M 340 252 L 340 274" fill="none" stroke="var(--mizu)" stroke-width="1.5"/>
    <polygon points="336,272 340,280 344,272" fill="var(--mizu)"/>
    <!-- On-chip SRAM Softmax -->
    <rect x="10" y="278" width="660" height="46" rx="8" fill="var(--card)" stroke="var(--mizu)" stroke-width="1.5"/>
    <text x="25" y="297" font-size="10.5" font-weight="700" fill="var(--ink)">ON-CHIP SRAM ATTENTION COMPUTATION:</text>
    <text x="25" y="314" font-size="10.5" font-family="monospace" fill="var(--mizu)">s = softmax((q_3 @ K_1..3^T) / √d_h);   o_3 = s @ V_1..3  →  Emits Token 4</text>
  </g>
</svg>
<figcaption>Step t=3 attention dataflow: projecting the new token, appending to HBM, and streaming past keys and values into SRAM.</figcaption>
</figure>

In Step `t=3`, query `q_3` is a `1 × d_head` vector, making `q_3 @ K^T` a vector-matrix multiply (GEMV). Unlike matrix-matrix multiply (GEMM), GEMV reads each cached `k_i` and `v_i` from HBM, multiplies it once, and flushes it from SRAM.

## Prefill vs. decode: the tale of two computational regimes

Production LLM inference splits requests into two phases with opposite bottlenecks ([Optimizing Offline Inference with Resource-Aware Batching, arXiv:2411.16102](https://arxiv.org/html/2411.16102v2)). Contrasting the prefill vs decode phase numerically explains why is first token slower than rest in interactive apps.

Consider an 8B model (`P = 8 × 10⁹` parameters, `16GB` in FP16) on an [NVIDIA H100 SXM5](https://www.nvidia.com/en-us/data-center/h100/) (ridge point: `295.2 FLOPs/byte`):

1. **Prefill Phase (Time-to-First-Token / TTFT):** At sequence length `S = 2,048` prompt tokens (`B = 1`), the GPU loads `16GB` of weights once and multiplies them across all 2,048 tokens in parallel via GEMM kernels, executing `2 · P · S = 32.77 TFLOPs` while reading `16GB` of weights and writing `268.4MB` of KV states (`16.27GB` traffic). Arithmetic intensity hits `32.77 TFLOPs / 16.27GB ≈ 2,014 FLOPs/byte` ([NeevCloud / Databricks Analysis](https://neevcloud.com/blogs/gpu-memory-bandwidth-vs-compute-what-actually-limits-llm-inf)), nearly 7x above the `295.2 FLOPs/byte` ridge point. Prefill is compute-bound, waiting on Tensor Cores to finish `32.77 TFLOPs` before emitting token one.
2. **Decode Phase (Inter-Token Latency / ITL):** Generating `S_step = 1` token executes `16 GFLOPs` of weight math plus `1.07 GFLOPs` of attention (`17.07 GFLOPs` total) while streaming `16GB` of weights plus `268.4MB` of KV cache (`16.27GB`). Arithmetic intensity transformer decoding drops to `17.07 GFLOPs / 16.27GB ≈ 1.05 FLOPs/byte`, sitting 280x below the H100 ridge point. Even at batch size `B = 32`, reading `16GB` of shared weights plus `32 × 268.4MB = 8.59GB` of KV caches reaches only `≈ 22.2 FLOPs/byte`.

When does decoding flip back to compute-bound? First, when continuous batching in [vLLM](https://arxiv.org/abs/2309.06180) scales batch size past `B ≥ 296` at short contexts, weight reuse pushes intensity above `295.2 FLOPs/byte` and saturates Tensor Cores ([Spheron Batch Scaling Benchmarks](https://www.spheron.network/blog/myth-doubling-batch-size-doesn-t-double-your-inference-throu/)). Second, when INT4 KV quantization uses non-fused dequantization kernels, bitwise unpacking stalls CUDA cores before HBM saturates.

## Calculating cache footprint and taming the memory bottleneck with modern attention primitives

Knowing how to calculate KV cache VRAM usage prevents Out-of-Memory (OOM) crashes. Storing one Key and one Value vector (factor of 2) across layers, KV heads, head dimension, sequence length, and batch size requires:

```text
KV Cache Memory (Bytes) = 2 × Layers × KV Heads × Head Dimension × Sequence Length × Batch Size × Bytes per Param
```

Using official [Llama 3.1 70B parameters](https://arxiv.org/abs/2407.21783) (80 layers, head dimension 128) in FP16 (2 bytes per element) for one session (`B = 1`):

- **Baseline Multi-Head Attention (MHA, 64 KV heads):** Consumes `2 × 80 × 64 × 128 × 2 = 2.62 MB/token`. One session takes `85.90GB` at `S = 32,768` tokens (overflowing an 80GB H100) and `343.60GB` at `S = 131,072` tokens.
- **Grouped-Query Attention (GQA, 8 KV heads):** Generalizing [Multi-Query Attention (arXiv:1911.02150)](https://arxiv.org/abs/1911.02150), [Ainslie et al. (arXiv:2305.13245)](https://arxiv.org/abs/2305.13245) group 64 query heads into 8 clusters sharing 8 KV heads. That cuts grouped query attention memory by 8x to `327.68KB/token` (`10.74GB` at 32K context; `42.95GB` at 128K).
- **Multi-Head Latent Attention (MLA):** Introduced in [DeepSeek-V2 (arXiv:2405.04434)](https://arxiv.org/abs/2405.04434), MLA projects keys and values into a compressed 576-element latent vector per layer, cutting KV cache memory by `93.3%` versus MHA and raising maximum throughput by `5.76x`. Meanwhile, [FlashAttention (arXiv:2205.14135)](https://arxiv.org/abs/2205.14135) tiles attention in SRAM to avoid `O(S²)` HBM writes, and [PagedAttention (arXiv:2309.06180)](https://arxiv.org/abs/2309.06180) stores KV states in non-contiguous pages to cut fragmentation.

```python
def kv_profile(layers: int, q_h: int, kv_h: int, dim: int, params_b: float, seq: int, bw: float = 6700.0):
    kv_gb = (2 * layers * kv_h * dim * seq * 2) / 1e9
    tot_gb = (params_b * 2) + kv_gb
    ai = ((2 * params_b * 1e9) + (4 * layers * q_h * dim * seq)) / (tot_gb * 1e9)
    return round(kv_gb, 2), round(ai, 2), round(bw / tot_gb, 1)

for s in (4096, 32768, 131072):
    print(s, "MHA:", kv_profile(80, 64, 64, 128, 70.6, s), "GQA:", kv_profile(80, 64, 8, 128, 70.6, s))
```

Across two H100 SXM5 GPUs (`6,700GB/s` bandwidth) at `131,072` tokens, MHA streams `343.60GB` of KV cache plus `141.20GB` of weights per step (`13.8 tok/s`), whereas GQA streams `42.95GB` of KV cache to sustain `36.4 tok/s` at `1.22 FLOPs/byte`.

## Sources

- [NVIDIA H100 Datasheet](https://www.nvidia.com/en-us/data-center/h100/)
- [NVIDIA A100 Architecture](https://awesomeagents.ai/hardware/nvidia-a100/)
- [NVIDIA RTX 4090 Whitepaper](https://images.nvidia.com/aem-dam/Solutions/geforce/ada/nvidia-ada-gpu-architecture.pdf)
- [NVIDIA H100 PCIe vs SXM](https://www.thundercompute.com/blog/nvidia-h100-specs-full-guide)
- [Roofline Model (2009)](https://doi.org/10.1145/1498765.1498785)
- [Multi-Query Attention (arXiv:1911.02150)](https://arxiv.org/abs/1911.02150)
- [FlashAttention (arXiv:2205.14135)](https://arxiv.org/abs/2205.14135)
- [Grouped-Query Attention (arXiv:2305.13245)](https://arxiv.org/abs/2305.13245)
- [PagedAttention / vLLM (arXiv:2309.06180)](https://arxiv.org/abs/2309.06180)
- [DeepSeek-V2 MLA (arXiv:2405.04434)](https://arxiv.org/abs/2405.04434)
- [Llama 3 Herd (arXiv:2407.21783)](https://arxiv.org/abs/2407.21783)
- [Resource-Aware Batching (arXiv:2411.16102)](https://arxiv.org/html/2411.16102v2)
- [Bandwidth vs Compute (NeevCloud)](https://neevcloud.com/blogs/gpu-memory-bandwidth-vs-compute-what-actually-limits-llm-inf)
- [Batch Scaling (Spheron)](https://www.spheron.network/blog/myth-doubling-batch-size-doesn-t-double-your-inference-throu/)

