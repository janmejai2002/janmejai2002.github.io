---
title: 'Looped Layers Let 26B Inkling 2 Mini Beat Rivals at a Bandwidth Cost'
description: 'Thinking Machines Lab''s 26.4B Inkling 2 Mini hits 79.2 percent on SWE-bench Verified by looping 12 middle layers 3 times, trading bandwidth for depth.'
pubDate: 2026-11-21
publishedAt: '2026-11-21T23:06:26.280Z'
track: technical
question: 'How does looping middle transformer layers boost coding accuracy, and what does it cost in memory bandwidth?'
keywords:
  - Looped Transformer Architecture
  - Inkling 2 Mini Benchmarks
  - MoE Memory Bandwidth
  - Local Coding LLM Serving
heroImage: '../../assets/art/inkling-2-mini-looped-transformer-bandwidth-cost-light.webp'
heroImageDark: '../../assets/art/inkling-2-mini-looped-transformer-bandwidth-cost-dark.webp'
heroAlt: 'Four vertical transformer blocks with concentric mizu return arcs looping over the middle two blocks and thickening the memory bandwidth rail beneath them.'
readingTime: '7 min read'
notionId: '41fced67-050a-8157-99db-ebe2dd5a693d'
---
<div class="tldr">

## Executive TL;DR

- Released under Apache 2.0 on November 20, 2026, Thinking Machines Lab's [Inkling 2 Mini](https://thinkingmachines.ai/news/inkling-2-mini/) is a 26.4B-parameter Mixture-of-Experts (MoE) model with 3.4B active parameters per pass (5.4B effective active parameters across three middle-layer loops) inside a 20 GB checkpoint.
- On agentic coding benchmarks, it scores 79.2 percent on SWE-bench Verified, 77.9 percent on SWEBench Pro v2 (Hard), and 48.2 percent on DeepSWE v1.1, outperforming non-looped rivals like Gemma 4 31B and Qwen3.8-27B ([Model Card](https://thinkingmachines.ai/model-card/inkling-2-mini/)).
- Looping 12 middle layers three times gives 48 layer visits per token from 24 stored layers, delivering 1.51x to 1.91x training compute efficiency while forcing memory-bound decode hardware to reread those middle-layer weights and maintain 48 separate KV caches ([Thinking Machines Lab](https://thinkingmachines.ai/news/inkling-2-mini/); [NVIDIA Developer Forums](https://forums.developer.nvidia.com/t/inkling-2-mini/389745)).
- On 32 GB Apple Silicon Macs and single 32 GB GPUs, practitioners must size KV cache for 48 layer visits using hybrid global-local attention (`4 global + 20 local` layers with a `1,024`-token window) or enable FP8 KV quantization in vLLM.

</div>

## Depth without parameters: how Inkling 2 Mini loops layers to beat 31B rivals

For the past three years, scaling coding performance in open-weight models meant shipping larger parameter checkpoints or paying for higher active parameter counts per token. On November 20, 2026, Thinking Machines Lab broke that assumption with [Inkling 2 Mini](https://thinkingmachines.ai/news/inkling-2-mini/), an open-weight multimodal MoE model under Apache 2.0 that packs 26.4B total parameters into a roughly 20 GB mixed NVFP4/MXFP8 checkpoint yet beats 27B to 31B dense models on software engineering evaluations.

The core architectural trick is a **looped transformer** layout. Instead of executing 24 layers once from input to output, Inkling 2 Mini groups its 24 stored layers into four six-layer blocks and runs the middle two blocks (layers 6 to 17) three times per token ([Thinking Machines Lab](https://thinkingmachines.ai/news/inkling-2-mini/); [NVIDIA Developer Forums](https://forums.developer.nvidia.com/t/inkling-2-mini/389745)). Each token passes through the model in four distinct steps:

1. **Prelude block (layers 0 to 5):** Encodes incoming text or image tokens into hidden representations once.
1. **Middle loop pass 1 (layers 6 to 17):** Routes each token through 8 of 128 sparse MoE experts across the 12 middle layers.
1. **Middle loop passes 2 and 3 (layers 6 to 17 repeated):** Re-enters the exact same 12 layers twice more, combining the prelude output with a learned, gated message carrying the previous pass's intermediate state via attention residuals ([Thinking Machines Lab](https://thinkingmachines.ai/news/inkling-2-mini/)).
1. **Coda block (layers 18 to 23):** Runs the final six layers once in 8-bit MXFP8 precision to project the output token logits ([Thinking Machines Lab](https://thinkingmachines.ai/news/inkling-2-mini/)).

Because weights are shared across the three middle passes, Inkling 2 Mini executes 48 layer applications per token while storing only 24 physical layers on disk ([Model Card](https://thinkingmachines.ai/model-card/inkling-2-mini/)). Thinking Machines Lab reports that at training step 2,000, a non-looped baseline needed 1.51x to 1.91x as much compute to match the middle-looped model's loss, compared with 1.24x to 1.36x when looping the final 12 layers ([Thinking Machines Lab](https://thinkingmachines.ai/news/inkling-2-mini/)). Each extra loop adds roughly 1.0B effective active parameters, lifting per-pass active weights from 3.4B to 5.4B effective active parameters per token ([Model Card](https://thinkingmachines.ai/model-card/inkling-2-mini/)).

| Model | Architecture | Active / Total Params | SWE-bench Verified | SWEBench Pro v2 (Hard) | DeepSWE v1.1 | AA Index v5.0 |
| --- | --- | --- | --- | --- | --- | --- |
| **Inkling 2 Mini** | Looped MoE (3x middle) | 5.4B eff. (3.4B) / 26.4B | 79.2% | 77.9% | 48.2% | 20.1 |
| **Qwen3.8-27B** | Dense | 27.0B / 27.0B | 77.8% | 73.8% | 42.2% | 20.1 |
| **Gemma 4 31B** | Dense | 30.7B / 30.7B | 46.1% | 14.2% | 0.3% | 4.4 |
| **Nemotron 3.5 Super VL** | Sparse MoE | 12.0B / 124.5B | 71.1% | 44.1% | 24.7% | 13.6 |
| **Inkling 2 Small** | MoE (non-looped) | 17.0B / 594.0B | N/R | 86.3% | 72.1% | N/R |

All figures above come from the [Inkling 2 Mini Model Card](https://thinkingmachines.ai/model-card/inkling-2-mini/) and [Unsloth documentation](https://unsloth.ai/docs/models/inkling-2-small) for Inkling 2 Small. Independent analysis from [Artificial Analysis](https://artificialanalysis.ai/articles/inkling-2-mini) confirms that Inkling 2 Mini matches Qwen3.8-27B on the Intelligence Index (`20.1`) while using roughly 2.8x less total compute (`active parameters x output tokens`), even though Inkling 2 Mini generates roughly 38 percent more output tokens per task (`~152K` vs `~110K`).

## The bandwidth tax: why rereading middle weights three times limits decode speed

Launch coverage focused heavily on Thinking Machines Lab's offline MacBook Pro demo building a flight simulator in airplane mode ([Thinking Machines Lab](https://thinkingmachines.ai/news/inkling-2-mini/)). For inference engineers, however, looping introduces a hardware bottleneck that active parameter counts alone can obscure.

Autoregressive token decode at batch size 1 is strictly memory-bandwidth bound: the GPU or unified-memory controller must stream every active weight from HBM or DRAM into SRAM for each generated token. Because Inkling 2 Mini executes layers 6 to 17 three times per token, the memory controller must read 5.4B effective weights per token (`3.1B` unique weights across passes) rather than 3.4B ([Artificial Analysis](https://artificialanalysis.ai/articles/inkling-2-mini); [Model Card](https://thinkingmachines.ai/model-card/inkling-2-mini/)). In addition, the model uses sparse MoE routing (8 of 128 experts per layer), which creates scattered memory reads unless experts fit cleanly in cache.

Independent serving benchmarks reveal two critical caveats for production teams:

- **Reasoning effort and verbosity:** On OpenRouter and local vLLM deployments, default `high` reasoning settings can trigger extended thinking traces. In a November 22, 2026 [Real Python](https://realpython.com/ai-benchmark-inkling-2-mini/) evaluation across five coding tasks, Inkling 2 Mini consumed 25.2K thinking tokens out of 32.7K total output tokens over 5 minutes. Furthermore, Thinking Machines Lab warns in its [Model Card](https://thinkingmachines.ai/model-card/inkling-2-mini/) that the model can occasionally get stuck in repetitive debugging loops and that factual recall (`AA-Omniscience v1.1` score `-8.6`, 63.4 percent non-hallucination rate) lags behind larger models because looping adds reasoning depth without adding stored world knowledge.
- **Runtime kernel maturity:** Early `llama.cpp` builds without Unsloth's looped-layer patches fall back to slower CPU paths for relative-position bias tensors ([Unsloth](https://unsloth.ai/docs/models/inkling-2-mini)). Meanwhile, on NVIDIA Blackwell consumer cards (`sm_120`), vLLM's bundled `DSpark` speculative draft kernel currently raises a CUDA kernel image error, requiring operators to disable speculative decoding until upstream kernels land ([NVIDIA Developer Forums](https://forums.developer.nvidia.com/t/inkling-2-mini/389745)).

## Hybrid global-local KV cache: sizing VRAM on 32 GB Macs and single GPUs

Even more important than weight bandwidth is KV-cache memory. Although Inkling 2 Mini stores 24 physical layers on disk, every loop visit maintains its own separate KV cache and short-convolution state, meaning memory planners must budget KV cache as a **48-layer** model ([NVIDIA Developer Forums](https://forums.developer.nvidia.com/t/inkling-2-mini/389745)).

To keep the advertised 1M-token context window feasible on 32 GB hardware, Inkling 2 Mini uses a hybrid attention pattern across every six-layer block: five local-attention layers restricted to a `1,024`-token sliding window paired with one global full-attention layer ([Thinking Machines Lab](https://thinkingmachines.ai/model-card/inkling-2-mini/); [Oflight](https://www.oflight.co.jp/en/columns/inkling-2-mini-thinking-machines-requirements-vram-2026)). Across the 24 stored layers, that yields 4 global layers and 20 local layers. Using the baseline config estimate reported by [Oflight](https://www.oflight.co.jp/en/columns/inkling-2-mini-thinking-machines-requirements-vram-2026), the minimum per-sequence KV footprint scales as:

`KV_bytes = (4 global layers x 4,096 bytes x tokens) + (20 local layers x 4,096 bytes x 1,024)`

When multiplied across looped visits (`8 global visits + 40 local visits`), [NVIDIA Developer Forums](https://forums.developer.nvidia.com/t/inkling-2-mini/389745) reports that on a 32 GB GPU with ~18 GiB occupied by weights, only ~7 to 12 GiB remains for KV cache: a `262K` context window consumes `13.41 GiB` in BF16 KV versus `7.41 GiB` in FP8 KV. On 32 GB Apple Silicon Macs, macOS reserves a share of unified memory for the OS and window server, so running `UD-Q4_K_XL` (`17.63 GB`) plus the `639 MB` vision projector (`mmproj-F16.gguf`) leaves tight headroom above 32K to 64K context ([Unsloth](https://unsloth.ai/docs/models/inkling-2-mini); [Oflight](https://www.oflight.co.jp/en/columns/inkling-2-mini-thinking-machines-requirements-vram-2026)).

Before deploying Inkling 2 Mini locally or on single-GPU nodes, profile throughput and KV capacity with explicit serving flags:

```bash
vllm serve thinkingmachines/Inkling-2-Mini \
  --tensor-parallel-size 1 \
  --max-model-len 131072 \
  --kv-cache-dtype fp8 \
  --gpu-memory-utilization 0.95 \
  --enable-auto-tool-choice --tool-call-parser inkling
```

```bash
./llama.cpp/llama-server \
  --model Inkling-2-Mini-UD-Q4_K_XL.gguf \
  --jinja --ctx-size 32768 --n-gpu-layers 99 \
  --temp 1.0 --top-p 1.0 --top-k 0 --min-p 0.0
```

## Serving trade-offs: when looped transformers win over standard MoE models

Looped MoE architectures do not replace standard transformers across every workload; they shift the bottleneck from disk footprint and total active FLOPs to per-token weight reads and multi-pass KV allocation.

| Deployment scenario | Recommended choice | Why it wins |
| --- | --- | --- |
| 32 GB MacBook or DGX Spark local coding agent | **Inkling 2 Mini (`UD-Q4_K_XL` or NVFP4)** | Beats 27B to 31B dense rivals on SWEBench inside a 20 GB footprint ([Model Card](https://thinkingmachines.ai/model-card/inkling-2-mini/)) |
| High-concurrency multi-tenant API serving | **Standard non-looped MoE or Qwen3.8-27B** | Avoids 48-visit KV cache pressure and 38 percent higher reasoning token volume ([Artificial Analysis](https://artificialanalysis.ai/articles/inkling-2-mini)) |
| Closed-book factual QA or strict multi-constraint chat | **Qwen3.8-27B or larger non-looped model** | Higher non-hallucination rate (`71.4%` vs `63.4%`) and better `MultiChallenge` adherence ([Model Card](https://thinkingmachines.ai/model-card/inkling-2-mini/)) |

For teams running single-developer coding agents on 32 GB+ laptops or DGX Spark workstations, Inkling 2 Mini sets a new local quality bar under Apache 2.0. For cloud serving teams paying per-GPU-hour at high batch concurrency, measure actual tokens per second and KV memory at target context lengths before swapping out non-looped 27B baselines.

## Sources

- [Introducing Inkling 2 Mini](https://thinkingmachines.ai/news/inkling-2-mini/) : Thinking Machines Lab announcement detailing the 24-layer, 3-pass middle-loop architecture, 1.51x to 1.91x compute efficiency, NVFP4/MXFP8 training, and monitorability results.
- [Inkling 2 Mini Model Card](https://thinkingmachines.ai/model-card/inkling-2-mini/) : Official specifications (`26.4B` total, `3.4B` active, `5.4B` effective), full benchmark table vs Qwen3.8-27B, Gemma 4 31B, and Nemotron 3.5, plus safety and repetitive-loop limitations.
- [Inkling 2 Mini - Run Locally Guide](https://unsloth.ai/docs/models/inkling-2-mini) : Unsloth and `llama.cpp` GGUF quantization sizes (`UD-Q4_K_XL` at `17.63 GB`), `mmproj-F16.gguf` (`639 MB`), and serving flags.
- [Thinking Machines has released Inkling 2 Mini](https://artificialanalysis.ai/articles/inkling-2-mini) : Independent Intelligence Index (`20.1`), token verbosity (`~152K` vs `~110K`), and compute-efficiency comparison (`~2.8x` less compute than Qwen3.8-27B).
- [Inkling 2 Mini - DGX Spark / GB10](https://forums.developer.nvidia.com/t/inkling-2-mini/389745) : Empirical 48-visit KV-cache memory measurements (`13.41 GiB` BF16 vs `7.41 GiB` FP8 at `262K`) and vLLM serving flags.
- [Inkling 2 Mini Requirements: VRAM, GPU & Mac](https://www.oflight.co.jp/en/columns/inkling-2-mini-thinking-machines-requirements-vram-2026) : Hybrid 4 global + 20 local (`1,024`-token window) KV-cache formula and Apple Silicon unified memory limits.

<!--
Artwork brief — from the writer routine. Draw per docs/ARTWORK.md,
then delete this comment.

- Argument in one sentence: Repeating the middle 12 transformer layers three times deepens reasoning within a compact 24-layer checkpoint, while forcing the memory bus to stream those middle weights thrice per token.
- Geometry: Four vertical six-layer blocks (prelude, two middle blocks, coda) above a horizontal memory-bandwidth rail.
- Accent: {{mizu}}
- Deliberate imperfection: Two concentric return arcs in {{mizu}} loop backward over the middle blocks, creating a thickened triple-read congestion band along the memory bus underneath.
-->
