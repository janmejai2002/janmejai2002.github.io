---
title: 'Mixture of Experts Runs Huge Models Using Only Active Specialists'
description: 'Mixture of Experts (MoE) models pack up to 1.6T parameters yet activate only 3% to 11% per word. Learn how the router delivers fast speed at high VRAM cost.'
pubDate: 2026-11-13
publishedAt: '2026-11-13T23:36:46.971Z'
track: basics
question: 'How can a trillion-parameter Mixture of Experts model respond faster than a smaller dense model?'
keywords:
  - Mixture of Experts Explained
  - Sparse Activation LLM
  - MoE Router Mental Model
  - Dense vs MoE Models
heroImage: '../../assets/art/mixture-of-experts-explained-simple-light.webp'
heroImageDark: '../../assets/art/mixture-of-experts-explained-simple-dark.webp'
heroAlt: 'Minimalist geometric diagram showing a left plum router circle connected to a vertical column of eight rectangular expert blocks, where only two plum blocks activate and merge on the right while six ink blocks remain dormant.'
readingTime: '8 min read'
notionId: '417ced67-050a-8171-9ae2-e57604683ede'
---
<div class="tldr">

## Executive TL;DR

- **Total parameters store knowledge; active parameters set speed:** A **Mixture of Experts (MoE)** model splits its feed-forward layers into dozens of smaller specialist subnetworks ("experts") and uses a lightweight **router** to wake up only 2 to 8 experts for each word ([Vector Institute MoE Guide](https://vectorinstitute.ai/mixture-of-experts-from-sparse-routing-to-multimodal-deployment/)).
- **Massive 2026 models run on tiny active fractions:** In recent open-weight releases, `LongCat-2.5` holds **1.6 trillion total parameters** while activating **`~48B` (3.0%)** per token ([LLM Releases](https://www.llm-releases.com/)), `MiniMax M2.7` activates **10B out of 230B (4.3%)** ([GitHub Open-Weight Models](https://github.com/xigh/open-weight-models)), `Recursive Flint` activates **2.5B out of 40B (6.25%)** ([OpenRouter](https://openrouter.ai/models)), and `Qwen3-30B-A3B-Base` activates **3.3B out of 30.5B (10.8%)** ([arXiv:2605.17598](https://arxiv.org/html/2605.17598v1)).
- **Why an MoE model outruns a smaller dense model:** A traditional **dense** 32B model must multiply every token through 100% of its 32 billion weights, whereas a 30.5B MoE model (`Qwen3-30B-A3B`) computes only **3.3 billion weights per token**, cutting arithmetic work per word by nearly **10x**.
- **The hardware catch is GPU memory (VRAM):** Even though 90% to 97% of the experts sleep during any single word, the next word might need a different expert, so **100% of the total parameters must stay loaded in fast RAM/VRAM** ([Arjun Jaggi MoE Analysis](https://arjunjaggi.com/blog/llm-mixture-of-experts)).
- **Experts specialize by token syntax, not human job titles:** Layer-by-layer routing audits show experts do not divide neatly into "the poetry expert" and "the law expert"; instead, they specialize in low-level token patterns like punctuation, Python indentation, conjunctions, or numerical prefixes ([Kaggle OLMoE Audit](https://www.kaggle.com/code/qmarva/transformer-architectures-07-mixture-of-experts); [Vector Institute](https://vectorinstitute.ai/mixture-of-experts-from-sparse-routing-to-multimodal-deployment/)).

</div>

## The Parameter Paradox: How Bigger AI Models Learned to Run Faster

Look at the spec sheets for the newest wave of open-weight AI models in late 2026, and the numbers look like a typo. `LongCat-2.5` lists **1.6 trillion parameters**, yet generates text at the speed of a mid-sized 48-billion-parameter model ([LLM Releases](https://www.llm-releases.com/)). Coding model `Flint` lists **40 billion parameters**, yet runs with the low latency of a tiny **2.5-billion-parameter** model ([OpenRouter](https://openrouter.ai/models)). Meanwhile, `Qwen3-30B-A3B` packs **30.5 billion parameters** and responds noticeably faster than a traditional 14-billion-parameter model ([arXiv:2605.17598](https://arxiv.org/html/2605.17598v1)).

For years, a simple rule governed artificial intelligence: **bigger models think better, but run slower**. In a traditional **dense** language model, every single parameter (weight) participates in generating every single word. If a dense model has 70 billion parameters and you type `"Hello"`, the graphics card has to multiply your word through all 70 billion numbers before it can print `"there"`.

**Mixture of Experts (MoE)** breaks that rule through **conditional computation** (also called **sparse activation**) ([Vector Institute](https://vectorinstitute.ai/mixture-of-experts-from-sparse-routing-to-multimodal-deployment/)). Instead of building one giant monolithic brain that fires 100% of its neurons on every word, an MoE model builds a large library of specialist sub-networks and wakes up only a tiny fraction, often **3% to 11% of the total weights**, for any individual token.

| Model Name | Total Parameters (Must Fit in Memory) | Active Parameters per Token (Sets Speed) | Active Fraction | Architecture & Routing Details |
| --- | --- | --- | --- | --- |
| **`LongCat-2.5`** | **1,600B (1.6T)** | **~48.0B** | **3.0%** | Multimodal agentic MoE ([LLM Releases](https://www.llm-releases.com/)) |
| **`Thinking Machines Inkling`** | **975B** | **41.0B** | **4.2%** | Multimodal reasoning & coding MoE ([WordGPTPro](https://wordgptpro.com/models/thinkingmachines/inkling)) |
| **`MiniMax M2.7`** | **230B** | **10.0B** | **4.3%** | Agentic MoE; fits in `60.7 GB` at `IQ1_M` ([GitHub Open-Weight](https://github.com/xigh/open-weight-models)) |
| **`DBRX`** | **132B** | **36.0B** | **27.3%** | 16 experts per layer, top-4 active; 4x faster pretraining ([Cameron Wolfe](https://cameronrwolfe.substack.com/p/moe-llms)) |
| **`Mixtral 8x7B`** | **46B** | **13.0B** | **28.3%** | 8 experts per layer, top-2 active; matches 70B dense ([Oxen.ai](https://www.oxen.ai/blog/arxiv-dives-mixture-of-experts-moe-with-mixtral-8x7b); [Arjun Jaggi](https://arjunjaggi.com/blog/llm-mixture-of-experts)) |
| **`Recursive Flint`** | **40B** | **2.5B** | **6.3%** | Coding-agent MoE built via Eureka Machine ([OpenRouter](https://openrouter.ai/models)) |
| **`Qwen3-30B-A3B-Base`** | **30.5B** | **3.3B** | **10.8%** | 48 layers, 128 experts per layer, top-8 active ([arXiv:2605.17598](https://arxiv.org/html/2605.17598v1)) |
| **`OLMoE (Allen AI)`** | **6.9B** | **1.3B** | **18.8%** | Fully open MoE trained on 5.1T tokens ([Kaggle](https://www.kaggle.com/code/qmarva/transformer-architectures-07-mixture-of-experts)) |

## Inside the Specialist Clinic: How the Router Picks Two Experts Per Word

To picture how a Mixture of Experts layer works without calculus, imagine comparing two hospitals:

- **The Dense Model is a General Assembly Line:** Every patient who walks through the front door, whether they have a sprained ankle, a toothache, or a rash, is forced to sit in a chair and get examined by **all 100 doctors in the building, one after another**. It is thorough, but agonizingly slow.
- **The Mixture of Experts Model is a Specialist Clinic with a Triage Nurse:** When a patient walks in, they spend two seconds at the front desk with a fast **Triage Nurse (the Router)**. The nurse glances at the chart and says: *"Go straight to Room 14 (Orthopedics, 70% match) and Room 42 (Radiology, 30% match)."* The other 98 doctors in the building do not even look up from their desks.

Inside a Transformer block, every layer has two main parts: the **Self-Attention** block (where words look at surrounding words for context) and the **Feed-Forward Network (`FFN`)** (where the model applies stored knowledge to each word individually) ([Oxen.ai Mixtral Guide](https://www.oxen.ai/blog/arxiv-dives-mixture-of-experts-moe-with-mixtral-8x7b)). MoE leaves the attention block intact and replaces that single giant `FFN` with a row of smaller `FFN` experts (`E_1, E_2, ..., E_n`) gated by a tiny linear matrix called the **Router (`W_r`)** ([Kaggle MoE Guide](https://www.kaggle.com/code/qmarva/transformer-architectures-07-mixture-of-experts)).

Trace what happens to a single word token (say, `"def"` in a Python script) as it crosses one layer of `Mixtral 8x7B` (which has 8 experts and picks the top 2 per word):

1. **Step 1 (Shared Attention):** The token `"def"` passes through self-attention just like a normal model, gathering context from nearby words.
1. **Step 2 (The Router Scores All Experts):** The router multiplies the token's vector `x` by its small routing table (`s = W_r * x`) to produce 8 quick scores, one for each of the 8 experts: `[0.05, 0.62, 0.01, 0.03, 0.28, 0.00, 0.01, 0.00]` ([Oxen.ai](https://www.oxen.ai/blog/arxiv-dives-mixture-of-experts-moe-with-mixtral-8x7b); [Kaggle](https://www.kaggle.com/code/qmarva/transformer-architectures-07-mixture-of-experts)).
1. **Step 3 (Top-`k` Selection):** The router keeps only the **top `k = 2` winners**, here **Expert #2** (score `0.62`) and **Expert #5** (score `0.28`), and normalizes their weights so they add to `1.0` (`0.69` and `0.31`). Experts #1, #3, #4, #6, #7, and #8 are completely skipped (`0` compute spent).
1. **Step 4 (Weighted Merge):** Expert #2 and Expert #5 each process the token in parallel, and their two outputs are blended by their router weights: `Output = 0.69 * E_2(x) + 0.31 * E_5(x)` ([Kaggle](https://www.kaggle.com/code/qmarva/transformer-architectures-07-mixture-of-experts)).

Some 2026 architectures add one extra twist: a **Shared Expert** ([arXiv:2605.17598](https://arxiv.org/html/2605.17598v1)). Instead of forcing all 128 specialists to re-learn basic English grammar, 1 always-on "general practitioner" expert runs on every token alongside the 6 or 8 routed specialists.

### Myth-Busting: Do Experts Specialize in "Poetry" vs. "Biology"?

Beginners often assume Expert #1 is "the History Expert" and Expert #2 is "the Coding Expert." When researchers audited which experts fire across Wikipedia articles versus Python standard library code in open models like `OLMoE` and `Mixtral` ([Kaggle OLMoE Notebook](https://www.kaggle.com/code/qmarva/transformer-architectures-07-mixture-of-experts); [Vector Institute](https://vectorinstitute.ai/mixture-of-experts-from-sparse-routing-to-multimodal-deployment/)), they found something much more granular: experts specialize at the **token and syntax level**. One expert fires heavily on whitespace indentation and closing brackets, another handles capitalized proper nouns, and another handles mathematical operators, even inside the same sentence!

## Fast Compute, Heavy Memory: The Hidden Catch of Storing Dormant Experts

If `Qwen3-30B-A3B` only activates **3.3 billion parameters** per word ([arXiv:2605.17598](https://arxiv.org/html/2605.17598v1)), why can't you run it on a cheap 4 GB smartphone just like a normal 3B model?

Because **sleeping doctors still need offices in the building**.

Walk through the exact hardware math comparing a **32B Dense model**, a **30.5B MoE model (`Qwen3-30B-A3B`, 3.3B active)**, and a **3B Dense model** running in 16-bit precision (`FP16`, where each billion parameters takes `2 GB` of memory):

- **Compute per Word (Speed):** While generating `"The cat sat"`, the 30.5B MoE model activates only `3.3B` parameters per word (`6.6 billion` floating-point multiply-adds per token), compared to `32B` parameters (`64 billion` ops) for the 32B Dense model. That **9.7x reduction in active weights** is why the 30.5B MoE streams words almost as fast as a tiny 3B model.
- **Memory Required (VRAM):** When the model generates `"The"`, the router might wake up Experts `#4` and `#19` in Layer 1. One millisecond later, when generating `"cat"`, the router might wake up Experts `#72` and `#105`. Because the computer cannot predict which 8 out of 128 experts the next word will need, and loading weights from a slow SSD takes seconds instead of microseconds, **all 30.5 billion parameters (`~61 GB` in FP16, or `~16 GB` in 4-bit quantization) must sit inside fast RAM or GPU VRAM the entire time** ([Arjun Jaggi](https://arjunjaggi.com/blog/llm-mixture-of-experts)).

## Dense vs. Mixture of Experts: Which Architecture Fits Your Hardware and Task

Use this comparison table whenever you choose between a dense model and an MoE model for local hardware or cloud APIs:

| Decision Factor | Traditional Dense Model (e.g., `32B Dense`) | Mixture of Experts Model (e.g., `30.5B Total / 3.3B Active`) | Winner & Why |
| --- | --- | --- | --- |
| **Token Generation Speed (Single User)** | Slower (reads all `32B` weights from memory per word) | **3x to 6x faster** (reads only `3.3B` active weights per word) | **MoE** wins on interactive speed |
| **Minimum RAM / VRAM to Load** | High (`~18 GB` at 4-bit for 32B quality) | High (`~17 GB` at 4-bit, despite only 3.3B active compute) | **Dense** gives more active reasoning per GB of RAM |
| **Pretraining Compute Cost** | Baseline (1.0x FLOPs) | **~4x more compute-efficient** to train ([Cameron Wolfe, DBRX](https://cameronrwolfe.substack.com/p/moe-llms)) | **MoE** is cheaper for labs to train |
| **Fine-Tuning Stability** | Straightforward on 1–4 GPUs | Tricky (routers can "collapse" and send all words to 1 expert) ([Vector Institute](https://vectorinstitute.ai/mixture-of-experts-from-sparse-routing-to-multimodal-deployment/)) | **Dense** is much easier to fine-tune |

- **Pick an MoE model** when you use a cloud API (where the provider pays for the giant VRAM cluster and passes the 3B-active speed savings to you in lower prices and faster streaming) or when you own a high-unified-memory Mac (`64 GB+` RAM) where memory is plentiful but compute bandwidth is tight.
- **Pick a Dense model** when you are VRAM-constrained on a single `8 GB` to `16 GB` consumer GPU: a **14B Dense model** activates all 14 billion parameters on every word and will often out-reason a 16B MoE model that only activates 2B parameters per word in that same memory footprint.

## Sources

- [Mixture-of-Experts: From sparse routing to multimodal deployment: Vector Institute](https://vectorinstitute.ai/mixture-of-experts-from-sparse-routing-to-multimodal-deployment/): First-principles explanation of conditional computation, top-k router gating, emergent syntax specialization, and multi-GPU fine-tuning challenges.
- [Mixture of Experts for Low-Resource LLMs (arXiv:2605.17598)](https://arxiv.org/html/2605.17598v1): Architectural specifications for `Qwen3-30B-A3B-Base` (30.5B total / 3.3B active, 48 layers, 128 routed experts, top-8 routing) and hybrid shared-expert MoE designs.
- [Transformer Architectures 07: Mixture of experts: Kaggle](https://www.kaggle.com/code/qmarva/transformer-architectures-07-mixture-of-experts): Router linear projection math (`s = W_r * x`), `OLMoE` specs (6.9B total / 1.3B active on 5.1T tokens), and empirical trace of expert firing on Wikipedia vs Python code.
- [Mixture of Experts in LLMs: How Sparse Models Scale: Arjun Jaggi](https://arjunjaggi.com/blog/llm-mixture-of-experts): Analysis of total-parameter VRAM residency versus active-parameter inference compute (46B total / 13B active vs 70B dense).
- [Mixture-of-Experts (MoE) LLMs: Cameron R. Wolfe, Ph.D.](https://cameronrwolfe.substack.com/p/moe-llms): `DBRX` specifications (132B total / 36B active, 16 experts, top-4 active, 4x pretraining efficiency).
- [How Mixture of Experts works with Mixtral 8x7B: Oxen.ai](https://www.oxen.ai/blog/arxiv-dives-mixture-of-experts-moe-with-mixtral-8x7b): Breakdown of replacing the single Transformer FFN with 8 FFN experts and top-2 softmax routing.
- [LLM Releases Tracker](https://www.llm-releases.com/) and [Curated Open-Weight AI Models: GitHub](https://github.com/xigh/open-weight-models): November 2026 specifications for `LongCat-2.5` (1.6T total / ~48B active) and `MiniMax M2.7` (230B total / 10B active, 4.3% ratio).

<!--
Artwork brief — from the writer routine. Draw per docs/ARTWORK.md,
then delete this comment.

- Argument in one sentence: A sparse router wakes up only two specialist expert blocks per token for fast computation while the remaining dormant experts still occupy physical memory space across the layer.
- Geometry: A single `plum` router node on the left projecting a fan of eight paths toward a vertical column of eight rectangular expert blocks on the right; only two expert blocks light up in bold `plum` and pass their outputs forward to the right-hand merge node, while the other six `ink` expert rectangles sit dormant.
- Accent: plum
- Deliberate imperfection: One of the six dormant `ink` expert blocks is drawn slightly offset and open-ended with a dashed outline, illustrating dormant parameters that consume memory capacity without contributing to the current token's forward pass.
-->
