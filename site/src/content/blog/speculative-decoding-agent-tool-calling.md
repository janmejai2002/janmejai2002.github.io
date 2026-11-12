---
title: 'Tool Calling Drops Speculative Decoding Acceptance Rates Below 25%'
description: 'Structured tool calls drop speculative decoding acceptance below 25%, causing a 13% to 15% latency slowdown. Dynamic routing in vLLM and SGLang fixes it.'
pubDate: 2026-11-12
publishedAt: '2026-11-12T23:21:46.327Z'
track: technical
question: 'Why does speculative decoding slow down inference during agent tool-calling loops?'
keywords:
  - Speculative Decoding Latency
  - Agent Tool Calling Acceptance
  - Draft Token Verification
  - vLLM Speculative Inference
heroImage: '../../assets/art/speculative-decoding-agent-tool-calling-light.webp'
heroImageDark: '../../assets/art/speculative-decoding-agent-tool-calling-dark.webp'
heroAlt: 'Minimalist geometric diagram showing aligned mizu draft arcs merging along a horizontal axis on the left, then fracturing into four severed dashed branches after crossing a vertical tool-call gate on the right.'
readingTime: '9 min read'
notionId: '416ced67-050a-81fe-a1b0-c18aa2a2bf0a'
---
<div class="tldr">

## Executive TL;DR

- **Synthetic tests overstate speculative throughput by 23%:** In [NVIDIA's SPEED-Bench evaluation (arXiv:2604.09557)](https://arxiv.org/html/2604.09557v2), random-token benchmarks overestimated real-world speculative decoding throughput by **23%** across `vLLM v0.13.0`, `SGLang v0.5.7`, and `TensorRT-LLM 1.2.0`.
- **Bimodal verification creates zero-acceptance stalls:** In NVIDIA's AIPerf reference run across 880 prompts in 11 categories, **13% of verification steps accepted zero draft tokens** (`AL = 1.0`) while 61% accepted the full 5-token draft ([Spheron SPEED-Bench Analysis](https://www.spheron.network/blog/myth-speculative-decoding-benchmarks-predict-your-production/)).
- **Long-context tool loops invert speedups into 13% to 15% slowdowns:** On [SPEED-Bench Table 10 (`Llama 3.3 70B`, `BS=16`, `DL=3`)](https://arxiv.org/html/2604.09557v2), moving an `EAGLE3` drafter from `1k` to `8k` input sequence length drops average accepted length (`AL`) from `2.93` to `1.19` (step acceptance below 19%), turning a `2.23x` speedup into a **`0.87x` slowdown** (`34.1 ms` vs `25.2 ms` per step), and **`0.85x`** on high-entropy prompts.
- **Pruned draft vocabularies miss schema and multilingual tokens:** Aggressive draft head pruning to `32k` tokens drops **5.3% to 5.5%** of overall target tokens and **21.9% to 23.1%** of multilingual tokens ([SPEED-Bench Table 14](https://arxiv.org/html/2604.09557v2)), causing immediate rejections on rare JSON keys and identifiers.
- **Dynamic draft gating and tool-memory drafters recover speed:** Disabling speculative drafting when tool tags open, or using live tool-call memory ([SPECMEM, arXiv:2610.31840](https://arxiv.org/pdf/2610.31840)) and parallel depth-conditioned drafters ([Tencent DSpine](https://www.mindstudio.ai/blog/tencent-dspine-speculative-decoding)), eliminates verification waste.

</div>

## The Speculative Speed Myth: When 3x Acceleration Collapses to Zero

Inference guides routinely present speculative decoding as a universal speedup for large language model serving. Because autoregressive decoding at low batch sizes is bottlenecked by High-Bandwidth Memory (HBM) reads instead of arithmetic compute, a small draft model (`M_d`) or attached head (`EAGLE3`, `Medusa`, or native Multi-Token Prediction) can guess `gamma` candidate tokens ahead, and the large target model (`M_t`) verifies all `gamma` tokens in one parallel forward pass ([Leviathan et al., arXiv:2211.17192](https://arxiv.org/pdf/2211.17192)). On single-turn Python completion or summarization benchmarks, that trade delivers `1.90x` to `2.23x` speedups ([NVIDIA SPEED-Bench, arXiv:2604.09557](https://arxiv.org/html/2604.09557v2)).

Deploy that exact same `vLLM` or `TensorRT-LLM` setup behind a multi-turn autonomous agent that calls external tools via JSON schemas, and p99 latency spikes above baseline greedy decoding. Instead of accelerating token emission, the speculative loop burns extra GPU compute verifying rejected drafts and rolling back the KV cache.

In May 2026, NVIDIA researchers quantified why lab benchmarks miss this production regression in [SPEED-Bench (arXiv:2604.09557)](https://arxiv.org/html/2604.09557v2). Evaluating `Llama 3.3 70B`, `GPT-OSS 120B`, `Qwen3 235B`, `Qwen3-Next`, and `DeepSeek-R1` across `vLLM`, `SGLang`, and `TensorRT-LLM` on `B200` GPUs, NVIDIA showed that synthetic random-token benchmarks overestimate speculative throughput by **23%**. Worse, acceptance rates follow a bimodal distribution: in NVIDIA's AIPerf trace across the 880-prompt Qualitative Split, **13% of verification steps accepted zero draft tokens**, forcing the server to pay full draft-plus-verify overhead just to emit a single fallback token ([Spheron SPEED-Bench Report](https://www.spheron.network/blog/myth-speculative-decoding-benchmarks-predict-your-production/)).

## Anatomy of a Rejection: Why JSON Schemas and Function Calls Break Draft Models

When an agent shifts from natural-language reasoning into a structured tool call (such as `<tool_call>{"name": "query_customer_ledger", "arguments": {"account_uuid": "9f8b..."}}`), draft acceptance collapses below 25% (`AL < 1.25` at draft length `gamma = 3`) for four mechanical reasons documented in [SPEED-Bench (arXiv:2604.09557)](https://arxiv.org/html/2604.09557v2) and [EAGLE-2 (arXiv:2406.16858)](https://arxiv.org/html/2406.16858v1):

1. **Draft Training Distribution Skew:** Post-trained speculative heads like `EAGLE3` are trained primarily on conversational datasets such as `UltraChat` and `Magpie-Llama-3.1-Pro-300K`. As NVIDIA audited in [SPEED-Bench Appendix J](https://arxiv.org/html/2604.09557v2), `UltraChat` has zero coding topics in its first 30-topic sector and only 2 coding topics across its remaining 40 sectors, while `Magpie` contains **less than 8% coding samples**. When an agent emits strict JSON tool invocations or repository identifiers, the draft head operates out of distribution.
1. **Long-Context RoPE Drift in Multi-Turn Agent Loops:** Tool-calling agents accumulate long input sequence lengths (`ISL` of `8k` to `32k` tokens) from system prompts, tool schemas, and prior turn observations. In [SPEED-Bench Table 10 and Appendix N](https://arxiv.org/html/2604.09557v2), publicly released `EAGLE3` checkpoints suffered severe accuracy decay at `8k+` ISL due to short training sequence lengths (`1k` to `4k`) and unscaled Rotary Position Embeddings (`original_max_position_embeddings = 8192`). On `Llama 3.3 70B` (`BS=16`, `DL=3`), moving from `1k` ISL to `8k` ISL dropped Low-Entropy `AL` from `2.93` down to **`1.19`**.
1. **Vocabulary Pruning Misses on Schema Identifiers:** To shrink the latency of the draft projection layer (`lm_head`), `EAGLE3` prunes its output vocabulary from `128k+` tokens down to the top `32k` most frequent training tokens. In [SPEED-Bench Table 14](https://arxiv.org/html/2604.09557v2), a `32k` pruned vocabulary misses **5.3% to 5.5%** of overall output tokens and **21.9% to 23.1%** of multilingual tokens. Whenever a tool call requires a rare subword token inside a camelCase parameter name, file path, or UUID, the pruned drafter cannot propose the token, guaranteeing a 0% acceptance rate at that step.
1. **High-Entropy Parameter Values:** While JSON punctuation (`{"`, `":`, `"}`) is low-entropy, the values inside tool arguments (timestamps, SQL filters, regex strings, user IDs) have low draft confidence. As [EAGLE-2 (arXiv:2406.16858)](https://arxiv.org/html/2406.16858v1) demonstrated on `Vicuna 7B`, when draft token confidence drops below `0.05`, empirical acceptance falls to **0.04 (4%)**, compared to **0.98 (98%)** when confidence exceeds `0.95`.

| Target Model & Speculator (`SPEED-Bench`) | Workload / ISL Regime | Batch & Draft | Mean `AL` | Step `AR` | Step Latency (`t_ar` vs `t_sd`) | Net Speedup vs Baseline |
| --- | --- | --- | --- | --- | --- | --- |
| `Llama 3.3 70B` + `EAGLE3` | Low Entropy (`1k` ISL) | `BS=16`, `DL=3` | **2.93** | ~78% | `19.6 ms` vs `25.9 ms` | **2.23x speedup** ([arXiv:2604.09557](https://arxiv.org/html/2604.09557v2)) |
| `Llama 3.3 70B` + `EAGLE3` | Low Entropy (`8k` ISL) | `BS=16`, `DL=3` | **1.19** | **< 19%** | `25.2 ms` vs `34.1 ms` | **0.87x (13% slowdown)** ([arXiv:2604.09557](https://arxiv.org/html/2604.09557v2)) |
| `Llama 3.3 70B` + `EAGLE3` | High Entropy (`8k` ISL) | `BS=16`, `DL=3` | **1.17** | **< 17%** | `25.2 ms` vs `34.1 ms` | **0.85x (15% slowdown)** ([arXiv:2604.09557](https://arxiv.org/html/2604.09557v2)) |
| `Llama 3.3 70B` + `N-Gram` | Qualitative (11 domains) | `BS=32`, `DL=3` | **1.41** | ~31% | Batch `BS=32` verify | **0.88x (12% slowdown)** ([arXiv:2604.09557](https://arxiv.org/html/2604.09557v2)) |
| `GPT-OSS 120B` + `N-Gram` | Qualitative (11 domains) | `BS=32`, `DL=3` | **1.31** | ~25% | Batch `BS=32` verify | **0.29x (71% slowdown)** ([arXiv:2604.09557](https://arxiv.org/html/2604.09557v2)) |
| `Llama 3.3 70B` + `Vanilla 1B` | Low Entropy (`8k` ISL) | `BS=16`, `DL=3` | **3.21** | ~83% | `25.2 ms` vs `59.9 ms` | **1.36x speedup** ([arXiv:2604.09557](https://arxiv.org/html/2604.09557v2)) |

Notice the contrarian result at `8k` ISL in [Table 10 of SPEED-Bench](https://arxiv.org/html/2604.09557v2): external `Vanilla SD` (`Llama 3.2 1B` drafting for `Llama 3.3 70B`) maintains an `AL` of `3.21` at `8k` ISL because the standalone `1B` model keeps a full unpruned vocabulary and proper `8k` RoPE scaling, delivering a `1.36x` speedup despite a `59.9 ms` step cost. Meanwhile, the unscaled `EAGLE3` head sees its `AL` collapse to `1.19`, dragging throughput **13% below standard autoregressive decoding**.

## The Math of Speculative Break-Even: Quantifying Verification Latency and Re-decoding Costs

To calculate when speculative decoding hurts latency on your cluster, use the domain-proxy equation validated in [Section 6 and Appendix H of SPEED-Bench (arXiv:2604.09557)](https://arxiv.org/html/2604.09557v2) and the capped geometric acceptance formula from [Leviathan et al. (arXiv:2211.17192)](https://arxiv.org/pdf/2211.17192).

When a drafter proposes `gamma` tokens with an independent per-token acceptance rate `alpha`, the expected number of tokens generated per target verification pass (`AL`, including the 1 guaranteed token from the target model's verification pass) is `AL = (1 - alpha^(gamma + 1)) / (1 - alpha)`. In each speculative step, the serving engine pays a step latency `t_sd` (`gamma` draft passes plus one `gamma + 1` token parallel target verification pass plus KV-cache rollback overhead), whereas standard autoregressive decoding pays `t_ar` to generate 1 token. The net speedup is `Speedup = (t_ar * AL) / t_sd`, which breaks even (`Speedup = 1.0`) only when `AL_breakeven = t_sd / t_ar`.

Plug in the production numbers measured on `Llama 3.3 70B` at `8k` ISL (`BS=16`, `DL=3`) from [SPEED-Bench Table 10](https://arxiv.org/html/2604.09557v2):

- **Baseline Autoregressive Step Time (`t_ar`):** `25.2 ms` per token (`39.68 tokens/sec` per sequence).
- **`EAGLE3` Speculative Step Time (`t_sd`):** `34.1 ms` per step (a **35.3% step-time overhead** from 3 draft steps, verifying 4 tokens in parallel at `BS=16`, and host-device synchronization).
- **Break-Even Acceptance Length (`AL_breakeven`):** `34.1 / 25.2 = 1.353` tokens per step, requiring a conditional per-token acceptance rate `alpha` above **27.8%**.
- **Actual Agent Tool-Loop Performance (`alpha < 25%`):** When `AL` drops to `1.19` (`alpha = 16.5%`), each step takes `34.1 ms` to produce `1.19` tokens (`34.90 tokens/sec`), yielding `Speedup = (25.2 * 1.19) / 34.1 = 0.879x` (a **12.1% to 13% latency regression**). On steps where the draft misses the very first token (`AL = 1.0`, occurring on **13% of all verify steps** in [AIPerf traces](https://www.spheron.network/blog/myth-speculative-decoding-benchmarks-predict-your-production/)), that step runs at `25.2 / 34.1 = 0.739x` speed (**a 26.1% slowdown**).

## Production Serving Architecture: Dynamic Draft Routing and Memory-Backed Tool Candidates

When a target model verifies a `gamma`-token draft inside `vLLM` or `TensorRT-LLM`, execution follows four steps:

1. **Draft Rollout:** The draft head or small model runs `gamma` autoregressive steps, writing speculative keys and values into temporary KV-cache slots.
1. **Parallel Target Verification:** The target model executes one forward pass over `[x_last, d_1, ..., d_gamma]`, computing target distributions `p(x)` for all `gamma + 1` positions at once.
1. **Rejection Sampling Scan:** The engine compares draft probabilities `q(x)` against `p(x)` from left to right, accepting the longest prefix `k` where `r < min(1, p(x_i) / q(x_i))` and sampling one corrected token at `k + 1` ([Leviathan et al., arXiv:2211.17192](https://arxiv.org/pdf/2211.17192)).
1. **KV-Cache Truncation and Rollback:** The engine discards the `gamma - k` rejected KV-cache slots and rewinds sequence position pointers across the batch.

As documented in [SPEED-Bench Appendix M](https://arxiv.org/html/2604.09557v2), `TensorRT-LLM` captures the draft-verify loop inside a single CUDA Graph for higher peak throughput, whereas `vLLM`'s piecewise graph construction enables **dynamic per-step draft length modulation**. Production teams combine three architectural fixes:

1. **Confidence-Gated Dynamic Draft Length (`DL = 0` on Tool Tags):** Following [EAGLE-2's calibration finding (arXiv:2406.16858)](https://arxiv.org/html/2406.16858v1), inspect the drafter's top-1 softmax probability and output token stream. When the model emits `<tool_call>` or draft confidence falls below `0.35`, set `num_speculative_tokens = 0` (or `DL = 1` at high batch sizes per [SPEED-Bench Figure 7](https://arxiv.org/html/2604.09557v2)) until `</tool_call>` closes.
1. **Live Tool-Call Memory (`SPECMEM`):** Because agents repeatedly invoke the same MCP tool names and schema keys, [SPECMEM (arXiv:2610.31840)](https://arxiv.org/pdf/2610.31840) maintains a managed live memory of verified tool calls behind the speculative decoder alongside a side-effect gate that blocks unsafe speculative tool execution.
1. **Parallel Depth-Conditioned Drafters (`DSpine` & Native `MTP`):** Replace conversational `EAGLE3` checkpoints with models using pre-trained **Multi-Token Prediction (`MTP`)** heads like `Qwen3-Next` (which achieved the highest `SPEED-Bench` Coding `AL` of **`3.34`** at `DL=3` in [Table 1](https://arxiv.org/html/2604.09557v2)) or parallel depth-conditioned drafters like [Tencent's DSpine for `Qwen3.8-27B`](https://www.mindstudio.ai/blog/tencent-dspine-speculative-decoding).

```python
from dataclasses import dataclass

@dataclass
class DynamicSpecConfig:
    default_gamma: int = 4
    min_confidence: float = 0.35
    breakeven_al: float = 1.35
    in_tool_call: bool = False
    rolling_al: float = 2.5

def select_next_draft_length(last_token: str, top1_prob: float, accepted: int, batch_size: int, cfg: DynamicSpecConfig):
    cfg.rolling_al = 0.8 * cfg.rolling_al + 0.2 * (accepted + 1)
    if "<tool_call>" in last_token or '{"name":' in last_token:
        cfg.in_tool_call = True
    elif "</tool_call>" in last_token:
        cfg.in_tool_call = False
    if batch_size >= 64:
        return 0 if cfg.in_tool_call else 1
    if cfg.in_tool_call and (top1_prob < cfg.min_confidence or cfg.rolling_al < cfg.breakeven_al):
        return 0
    return 1 if cfg.rolling_al < cfg.breakeven_al else cfg.default_gamma
```

## Sources

- [SPEED-Bench: A Unified and Diverse Benchmark for Speculative Decoding (arXiv:2604.09557)](https://arxiv.org/html/2604.09557v2): NVIDIA benchmark across vLLM, SGLang, and TensorRT-LLM showing 23% synthetic throughput overestimation, `0.85x` to `0.87x` slowdowns at `8k` ISL when `AL` drops to `1.17` to `1.19` (Table 10), `32k` vocabulary pruning token loss (Table 14), and UltraChat/Magpie training skew (Appendix J).
- [SPEED-Bench NVIDIA: The Speculative Decoding Benchmark Myth: Spheron Network](https://www.spheron.network/blog/myth-speculative-decoding-benchmarks-predict-your-production/): AIPerf reference run showing bimodal distribution where 13% of verification steps accept zero draft tokens and 61% accept all 5 draft tokens.
- [Fast Inference from Transformers via Speculative Decoding (arXiv:2211.17192)](https://arxiv.org/pdf/2211.17192): Foundational speculative sampling algorithm, rejection sampling proof, and capped geometric expected token formula.
- [EAGLE-2: Faster Inference of Language Models with Dynamic Draft Trees (arXiv:2406.16858)](https://arxiv.org/html/2406.16858v1): Empirical calibration showing draft tokens with confidence below `0.05` have ~4% acceptance rate versus ~98% above `0.95`.
- [SPECMEM: Accelerating Agentic Tool Calling via Live Memory (arXiv:2610.31840)](https://arxiv.org/pdf/2610.31840): Live tool-call memory lifecycle and severity-weighted side-effect gate for speculative tool calling.
- [Tencent DSpine: Faster Speculative Decoding for Qwen3.8-27B: MindStudio](https://www.mindstudio.ai/blog/tencent-dspine-speculative-decoding): Parallel depth-conditioned drafting evaluated on WorkBuddy agent tool-call benchmarks, SWE-bench Pro, and tau-squared-bench.

<!--
Artwork brief — from the writer routine. Draw per docs/ARTWORK.md,
then delete this comment.

- Argument in one sentence: Speculative draft chains glide smoothly through predictable prose but shatter at the boundary of a structured tool call, where rejected lookahead branches must be discarded and rolled back.
- Geometry: A horizontal timeline split by a vertical tool-call boundary gate; to the left, three `mizu` draft arcs lock cleanly onto the main `ink` execution spine, while to the right of the gate, four speculative `mizu` branches splay outward and terminate in severed stubs.
- Accent: mizu
- Deliberate imperfection: Four severed, dashed `mizu` lookahead branches breaking off at the first verification tick after the vertical tool-call boundary, depicting a zero-token acceptance step and KV-cache rollback.
-->
