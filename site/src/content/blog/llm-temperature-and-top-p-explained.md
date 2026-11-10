---
title: 'Temperature and Top P Sampling Demystify the AI Creativity Knob'
description: 'Learn how LLM temperature and top-p sampling reshape token probabilities, stop hallucinations, and give you predictable AI outputs across every daily task.'
pubDate: 2026-11-10
track: basics
question: 'What actually happens when you adjust temperature and top-p in an AI model?'
keywords:
  - LLM Temperature Explained
  - Top-P Nucleus Sampling
  - AI Sampling Parameters
  - Predictable Prompting
heroImage: '../../assets/art/llm-temperature-and-top-p-explained-light.webp'
heroImageDark: '../../assets/art/llm-temperature-and-top-p-explained-dark.webp'
heroAlt: 'Minimalist technical diagram showing five vertical token probability bars shaped by a Boltzmann temperature curve and truncated after the third bar by a vertical moss-colored Top-P nucleus cutoff line.'
readingTime: '6 min read'
notionId: '414ced67-050a-8156-8454-d2453acfbc77'
---
<div class="tldr">

## Executive TL;DR

- **Models calculate probabilities, never finished sentences:** Every time an AI generates text, its neural network outputs raw unnormalized scores called logits (zᵢ) across its vocabulary of 100,000+ subword tokens, per the [Hugging Face Transformers Generation Guide](https://huggingface.co/docs/transformers/main_classes/text_generation).
- **Temperature reshapes the probability curve before sampling:** Dividing each logit by temperature (T) inside the softmax function (`Pᵢ = exp(zᵢ / T) / ∑ exp(zⱼ / T)`) sharpens selection toward greedy argmax as T → 0 and flattens the curve across lower-ranked words as T > 1.0 ([Holtzman et al., ICLR 2020](https://arxiv.org/abs/1904.09751)).
- **Top-P (nucleus sampling) slices off the noisy long tail:** Introduced by [Ari Holtzman et al. (arXiv:1904.09751)](https://arxiv.org/abs/1904.09751), `top_p` sorts tokens by descending probability and keeps only the smallest core set whose cumulative mass reaches threshold `p`, blocking thousands of near-zero words from derailing coherence.
- **API providers warn against tuning both knobs at once:** Both the [OpenAI Chat Completions Reference](https://developers.openai.com/api/reference/resources/chat/subresources/completions/methods/create) and [Anthropic Claude Docs](https://platform.claude.com/docs/en/cli-sdks-libraries/libraries/openai-sdk) instruct developers to modify either `temperature` or `top_p` alone, and Anthropic deprecated manual sampling overrides in [Claude API version 2026-10-21](https://platform.claude.com/docs/en/about-claude/model-deprecations).
- **Zero temperature does not guarantee 100% GPU determinism:** Even at `temperature = 0`, parallel matrix reductions and Mixture-of-Experts (MoE) batch routing introduce floating-point non-associativity that can flip tie-breaker tokens across runs ([Thinking Machines Lab](https://thinkingmachines.ai/blog/defeating-nondeterminism-in-llm-inference/); [arXiv:2609.25624](https://arxiv.org/html/2609.25624v1)).

</div>

## The creativity slider myth: what large language models are actually doing

Open any AI playground and you see `temperature` next to `top_p`. Most guides call these `llm creativity settings`, hiding how do language models pick the next word under the hood. A neural network has no imagination dial; raising temperature simply changes the odds of a weighted lottery at the final millisecond of inference ([Hugging Face Decoding Blog](https://huggingface.co/blog/how-to-generate)).

To build an accurate `how ai sampling works mental model`, picture ordering dinner at a bistro with a 50-item menu where every dish has a crowd rating from past orders:

- **Greedy Regular (`temperature = 0`):** Always picks the #1 dish (the house burger), giving identical meals every night.
- **Roulette Diner (`temperature = 1.0`):** Spins a wheel weighted by past orders (64% burger, 24% short ribs, 9% risotto).
- **Daredevil Tourist (`temperature = 2.0`):** Flattens the wheel so the #1 burger and #50 squid-ink gelatin share similar odds.
- **Quality Bouncer (`top_p = 0.90`):** Sums top dishes from #1 down until they cover 90% of diner votes and crosses off the rest.

On a prompt like `"The espresso tasted "`, transformer layers output unnormalized scores called **logits** (zᵢ) across the vocabulary ([Hugging Face Generation Guide](https://huggingface.co/docs/transformers/main_classes/text_generation)), and the sampler converts those logits into a token choice.

## The probability curve: how temperature reshapes word selection

Having `llm temperature and top p explained` from first principles starts with the **softmax function**, adapted from Ludwig Boltzmann's statistical mechanics equations. Raw logits can be any real number (+4.0 or -1.0). To turn them into probabilities summing to 1.0 (100%), the engine divides each logit zᵢ by temperature T before exponentiating ([Holtzman et al., ICLR 2020](https://arxiv.org/html/1904.09751v2)):

```
P_i = exp(z_i / T) / ∑ exp(z_j / T)
```

Because T sits in the denominator inside an exponential, small changes in T reshape the gaps between candidate words. Trace a five-token vocabulary completing `"The espresso tasted "` with raw logits `"rich"` (z₁ = 4.0), `"bitter"` (z₂ = 3.0), `"fruity"` (z₃ = 2.0), `"burnt"` (z₄ = 1.0), and `"purple"` (z₅ = -1.0):

| Token | Logit (z_i) | Low (T=0.2) | Baseline (T=1.0) | High (T=2.0) | Cum. Mass (T=1.0) | Status at `top_p=0.90` (T=1.0) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `"rich"` | 4.0 | 99.33% | 64.11% | 43.87% | 64.11% | Kept (66.52% re-norm) |
| `"bitter"` | 3.0 | 0.67% | 23.59% | 26.61% | 87.70% | Kept (24.48% re-norm) |
| `"fruity"` | 2.0 | <0.01% | 8.68% | 16.14% | 96.38% | Kept (9.00% re-norm) |
| `"burnt"` | 1.0 | <0.01% | 3.19% | 9.79% | 99.57% | Pruned (0.00%) |
| `"purple"` | -1.0 | 0.00% | 0.43% | 3.60% | 100.00% | Pruned (0.00%) |

At T = 1.0, dividing by 1.0 preserves the native distribution (`"rich"` at 64.11%). Dropping to T = 0.2 multiplies logits by 5 (20, 15, 10, 5, -5), so exp(20) dominates and `"rich"` absorbs 99.33%. Raising to T = 2.0 halves every logit (2.0, 1.5, 1.0, 0.5, -0.5), causing `"purple"` to jump eightfold from 0.43% to 3.60%.

```
T = 0.2 (Cold / Focused: Top token absorbs 99.3% mass)
  "rich"   (z=4.0) |################################################## 99.3%
  "bitter" (z=3.0) | 0.7%

T = 1.0 (Baseline Softmax + Top-P = 0.90 Cutoff)
  "rich"   (z=4.0) |################################ 64.1%  <-- Kept (Cum: 64.1%)
  "bitter" (z=3.0) |############ 23.6%                      <-- Kept (Cum: 87.7%)
  "fruity" (z=2.0) |#### 8.7%                               <-- Kept (Cum: 96.4% >= 90%)
  .................|.......................................... [TOP-P = 0.90 CUTOFF]
  "burnt"  (z=1.0) |## 3.2%                                 <-- Pruned
  "purple" (z=-1.) | 0.4%                                   <-- Pruned

T = 2.0 (Hot / Flattened: Long-tail noise surges >8x)
  "rich"   (z=4.0) |###################### 43.9%
  "bitter" (z=3.0) |############# 26.6%
  "fruity" (z=2.0) |######## 16.1%
  "burnt"  (z=1.0) |##### 9.8%
  "purple" (z=-1.) |## 3.6%  <-- Hallucination risk spikes
```

Even `temperature = 0` is not 100% deterministic on GPU clusters ([Anthropic Docs](https://platform.claude.com/docs/en/build-with-claude/working-with-messages); [Thinking Machines Lab](https://thinkingmachines.ai/blog/defeating-nondeterminism-in-llm-inference/)): IEEE 754 floating-point non-associativity (`(a + b) + c ≠ a + (b + c)`) across dynamic GPU batches nudges tied logits by 10⁻⁶ ([arXiv:2609.25624](https://arxiv.org/html/2609.25624v1)), and Mixture-of-Experts (MoE) batch buffer routing can flip tie-breakers.

## Trimming the long tail: why top-p prevents hallucinated gibberish

Why does high temperature cause hallucinations across a 128,000-token vocabulary? Even when 120,000 tail tokens hold 0.0005% each, their combined mass equals 60%. Drawing one off-topic token like `"purple"` feeds `"The espresso tasted purple"` back into context, compounding into a hallucination spiral.

Early systems pruned this tail via **Top-K sampling** ([Fan et al., arXiv:1805.04833](https://arxiv.org/abs/1805.04833)), keeping a fixed number K of tokens. Fixed K fails when context certainty shifts: after `"I walked into the kitchen and saw a "`, K = 10 cuts valid nouns; after `"The capital of France is "`, K = 50 admits 49 bad tokens alongside `"Paris"`.

[Ari Holtzman et al. (ICLR 2020, arXiv:1904.09751)](https://arxiv.org/abs/1904.09751) solved this with **Top-P (nucleus) sampling**. Any `nucleus sampling beginner guide` follows one dynamic rule: sort tokens from highest to lowest probability, sum them cumulatively, and stop as soon as the sum reaches threshold `p`. Answering `what does top p 0.9 actually mean`: in our table at T = 1.0, `"rich"` (64.11%), `"bitter"` (23.59%), and `"fruity"` (8.68%) sum to 96.38% ≥ 90%. The engine keeps those three, zeroes out `"burnt"` and `"purple"`, and re-normalizes the three survivors.

Modern local engines also support **Min-P sampling** ([Nguyen et al., ICLR 2025 Oral, arXiv:2407.01082](https://arxiv.org/abs/2407.01082)) in [Hugging Face GenerationConfig](https://huggingface.co/docs/transformers/main_classes/text_generation). Comparing `temperature vs top p plain english` against Min-P, `min_p` sets a relative floor against the top token's probability `p_max`: `Threshold = min_p × p_max`. At `min_p = 0.10` and `p_max = 64.11%`, tokens below 6.41% are dropped, preserving coherence even at T = 1.3 ([arXiv:2407.01082](https://arxiv.org/html/2407.01082v8)).

Why do API providers warn against tuning both `temperature` and `top_p`? Because engines divide logits by `temperature` **first** and apply `top_p` **second** ([Hugging Face Docs](https://huggingface.co/docs/transformers/main_classes/text_generation)). The [OpenAI API Reference](https://developers.openai.com/api/reference/resources/completions/methods/create) advises changing only one, while the [Claude OpenAI SDK Guide](https://platform.claude.com/docs/en/cli-sdks-libraries/libraries/openai-sdk) returns a `400` error if both are passed and deprecated manual sampling on newest reasoning models in [API version 2026-10-21](https://platform.claude.com/docs/en/build-with-claude/working-with-messages).

## The practical playbook: choosing the right settings for daily tasks

When selecting a `temperature setting for coding vs writing`, tune one primary knob (`temperature` on cloud APIs, or `min_p` locally) and leave `top_p = 1.0`:

| Workflow | `temperature` | `top_p` | Local `min_p` | Rationale & Failure Mode Prevented |
| :--- | :--- | :--- | :--- | :--- |
| **Code & SQL Generation** | `0.0` - `0.2` | `1.0` | `0.0` | Maximizes syntax accuracy ([OpenAI Docs](https://developers.openai.com/api/reference/resources/completions/methods/create)); stops broken schemas. |
| **Data Extraction / JSON** | `0.0` | `1.0` | `0.0` | Locks greedy argmax so enum labels and figures stay reproducible. |
| **RAG & Factual Q&A** | `0.1` - `0.3` | `1.0` | `0.05` | Anchors answers to retrieved chunks while avoiding repetition loops. |
| **Technical Docs** | `0.4` - `0.6` | `1.0` | `0.08` | Balances natural sentence rhythm with factual precision. |
| **Customer Chatbots** | `0.7` - `0.8` | `1.0` | `0.10` | Warm phrasing while pruning sub-1% tail noise ([Holtzman, 2020](https://arxiv.org/abs/1904.09751)). |
| **Creative Ideation** | `1.0` - `1.3` | `0.92` | `0.10` - `0.15` | Surfaces fresh metaphors while [Min-P (arXiv:2407.01082)](https://arxiv.org/abs/2407.01082) blocks gibberish. |

This PyTorch snippet implements the three-step sampling pipeline:

```
import torch
import torch.nn.functional as F

def sample_next_token(logits: torch.Tensor, temp: float = 1.0, top_p: float = 1.0, min_p: float = 0.0) -> int:
    if temp <= 0.0:
        return int(torch.argmax(logits, dim=-1).item())
    probs = F.softmax(logits / temp, dim=-1)
    if 0.0 < min_p < 1.0:
        probs = torch.where(probs < (min_p * torch.max(probs, dim=-1, keepdim=True).values), 0.0, probs)
    if 0.0 < top_p < 1.0:
        s_probs, s_idx = torch.sort(probs, descending=True, dim=-1)
        s_probs[(torch.cumsum(s_probs, dim=-1) - s_probs) >= top_p] = 0.0
        probs = torch.zeros_like(probs).scatter(-1, s_idx, s_probs)
    return int(torch.multinomial(probs / torch.sum(probs, dim=-1, keepdim=True), 1).item())
```

## Sources

- [Holtzman et al. Nucleus Sampling (arXiv:1904.09751)](https://arxiv.org/abs/1904.09751), [Nguyen et al. Min-P Sampling (arXiv:2407.01082)](https://arxiv.org/abs/2407.01082), [Fan et al. Top-K Sampling (arXiv:1805.04833)](https://arxiv.org/abs/1805.04833), [OpenAI API Reference](https://developers.openai.com/api/reference/resources/completions/methods/create), [Anthropic Messages API Docs](https://platform.claude.com/docs/en/build-with-claude/working-with-messages), [Anthropic OpenAI SDK Guide](https://platform.claude.com/docs/en/cli-sdks-libraries/libraries/openai-sdk), [Anthropic Deprecations](https://platform.claude.com/docs/en/about-claude/model-deprecations), [Hugging Face Generation Docs](https://huggingface.co/docs/transformers/main_classes/text_generation), [Hugging Face Decoding Blog](https://huggingface.co/blog/how-to-generate), [Thinking Machines Lab Nondeterminism](https://thinkingmachines.ai/blog/defeating-nondeterminism-in-llm-inference/), [LLM Nondeterminism Mitigation (arXiv:2609.25624)](https://arxiv.org/html/2609.25624v1).

<!--
Artwork brief — from the writer routine. Draw per docs/ARTWORK.md,
then delete this comment.

- Argument in one sentence: Temperature stretches or compresses the vertical height of a token probability curve, while Top-P drops a vertical cutoff gate across the horizontal axis to sever the noisy long tail.
- Geometry: Five vertical probability columns descending across a hairline Cartesian grid, overlaid with a Boltzmann decay curve and a vertical dashed moss cutoff gate between the third and fourth columns.
- Accent: moss
- Deliberate imperfection: The third probability bar slightly pierces above the cubic Bezier curve, and the vertical Top-P cutoff line terminates in an offset tick mark at the baseline axis.
-->
