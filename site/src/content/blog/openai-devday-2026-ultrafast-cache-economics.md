---
title: 'Inside OpenAI DevDay 2026: 300 tok/s Decode and 95% Cache Economics'
description: 'OpenAI DevDay 2026 unveils Dots, GPT-6.1 Soul with 95% cache discounts, and 300 tok/s Ultrafast mode at 6x price. Here is what hardware math proves.'
pubDate: 2026-11-24
publishedAt: '2026-11-24T13:51:40.779Z'
track: talks
question: 'When is paying 6x for 300 tokens per second worth it, and how do 95% cache discounts reshape agent loops?'
heroImage: '../../assets/art/openai-devday-2026-ultrafast-cache-economics-light.webp'
heroImageDark: '../../assets/art/openai-devday-2026-ultrafast-cache-economics-dark.webp'
heroAlt: 'Minimal geometric schematic contrasting a dense anchored stack of cached prefix blocks on the left with eight sparse high-velocity decode bars led by a vermilion hanko pulse on the right.'
readingTime: '6 min read'
notionId: '422ced67-050a-81a4-a6e7-eba78bf93103'
---
<div class="tldr">

## Executive TL;DR

- OpenAI DevDay 2026 shifted the product surface from interactive chat to 24/7 cloud agents (`Dots`), shared team canvases (`Space`), and cloud-hosted `Codex` sessions ([OpenAI DevDay 2026 Keynote](http://www.youtube.com/watch?v=Fls_onRviPM)).
- `GPT-6.1 Soul` targets daily coding and agent loops at one-fifth of Astra's price, pairing with a 95 percent cached input discount that rewards immutable prompt prefixes.
- `Ultrafast` mode reaches 300 tokens per second (8x standard speed) at 6x standard pricing, reflecting the HBM memory-bandwidth cost of low-batch GPU decoding ([NeevCloud](https://neevcloud.com/blogs/gpu-memory-bandwidth-vs-compute-what-actually-limits-llm-inf)).
- The new `Decisions API` constrains the `Luna` model to a fixed choice set for sub-second routing, image classification, and next-step computer use.
- Post-training lead Tel reported that models optimizing their own computer-use harness delivered a 2x latency gain and now complete over a third of day-long research tasks unassisted.

</div>

## 1. The Core Argument in Three Sentences

OpenAI's DevDay 2026 keynote frames the transition from reactive chat assistants to persistent cloud agents (`Dots` and cloud `Codex`) that share tools, memory, and browser sandboxes across teams. To make multi-hour agent loops economically viable, OpenAI pairs a 95 percent cached-input discount on `GPT-6.1 Soul` with specialized inference tiers spanning sub-second `Decisions API` routing and 300-token-per-second `Ultrafast` decoding. Yet hardware memory-bandwidth limits and reasoning-token latency mean engineers must still separate high-cache background work from expensive low-batch speed tiers.

## 2. Five Timestamped Inflection Points

### [00:05:59] From Chat Prompts to Always-On Delegates

Sam Altman opens the keynote by introducing `Dots`, always-on agents that monitor bug reports, draft PRs, and coordinate cross-app workflows without waiting for a user prompt. Giving agents persistent cloud computers and 4,000+ app connectors turns delegation into an asynchronous engineering pattern:

> "You just give Dots a responsibility like monitor incoming bug reports test and fixes and draft PRs kick off next year's budget planning cycle and keep all the teams on track find out what's slowing down our app Build a fix and show me how much faster it runs and your DOTs will just get to work and keep working"

### [00:20:03] GPT-6.1 Soul and the 95% Cached Input Discount

When developers asked for frontier reasoning without frontier bills, OpenAI answered with `GPT-6.1 Soul` and an aggressive prompt-caching discount. Because multi-turn coding agents resend long repository contexts on every tool call, cutting cached input rates by 95 percent changes the unit economics of iterative loops:

> "It gives you very near Astro level intelligence at a fifth of the price to help you code and build It's extremely affordable to run In fact the cache input costs are a 95% discount on standard input So this makes it much cheaper for agents to reuse context iterate on solutions and work through longer tasks"

### [00:20:49] Ultra Fast Mode at 300 Tokens Per Second

For interactive coding and real-time voice or UI generation, waiting on long reasoning chains breaks user flow. Altman introduces `Ultrafast` across the API, ChatGPT, and Codex, trading a steep token-rate multiplier for 300-token-per-second output:

> "Fast already gives you twice the speed at twice the price of standard but ultraast takes that to eight times the speed at six times the price of standard An incredible 300 tokens per second"

### [00:22:25] The Decisions API for Sub-Second Agent Routing

Full generative decoding is overkill when an agent only needs to pick the next UI click or route an incoming ticket. OpenAI previews the `Decisions API` powered by `Luna`, restricting output space to predefined options so control loops stay responsive:

> "the decisions API lets the model respond in a fraction of a second is so fast So it really feels almost instant to interact with You can see here it using a computer and how quickly it's moving through these steps This is not sped up This works by giving our Luna model a predefined set of options to choose from like routing a request classifying image deciding what agent should do next"

### [00:25:07] Self-Optimizing Harnesses and Day-Long Research Loops

Post-training lead Tel reveals that OpenAI's own models now profile and tune the production computer-use harness inside a continuous optimization loop. Combined with surging internal token consumption, that loop pushed autonomous research reliability from under 15 minutes in January to over a third of day-long tasks by July:

> "And we actually had the models run in a continuous loop to find wins in the harness that would improve latency and performance And then we pulled these into the real prod harness and post train on them And this has resulted in already a more than 2x latency win that we've shipped to all of you"

## 3. What Was Claimed vs. What Benchmarks Prove

External pricing analyses and GPU roofline physics explain both why OpenAI's 95 percent cache discount works and why `Ultrafast` carries a 6x surcharge. On OpenAI's standard API pricing for `GPT-6.2 Astra` (USD 8.00 per million input tokens and USD 40.00 per million output tokens), cached inputs drop to USD 0.40 per million tokens, confirming the 95 percent discount ([Emergent](https://emergent.sh/learn/gpt-6-2-astra-pricing)). However, implicit cache writes carry a 25 percent surcharge (USD 10.00 per million tokens for a 30-minute TTL), meaning prefix stability determines total spend: dropping cache hit rates from 95 percent to 0 percent on an 8,000-ticket workload inflates monthly bills nearly 5x from USD 222.40 to USD 1,134.40 ([eesel AI](https://www.eesel.ai/blog/gpt-6-2-astra-pricing)).

The 6x `Ultrafast` price (initially discounted to 3x through February 28, 2027 before stepping up to 6x on March 1, 2027) maps directly to GPU memory-bandwidth limits ([Emergent](https://emergent.sh/learn/gpt-6-2-astra-pricing)). LLM decode operates at roughly 1 FLOP/byte at batch size 1 and 32 FLOPs/byte at batch size 32, sitting well below the compute ridge point on H100 (3.35 TB/s), H200 (4.8 TB/s), and B200/B300 (8 TB/s) GPUs ([NeevCloud](https://neevcloud.com/blogs/gpu-memory-bandwidth-vs-compute-what-actually-limits-llm-inf)). Sustaining 300 tokens per second requires dedicating HBM bandwidth to tiny batch sizes per request, sacrificing serving throughput. Moreover, high output speed does not eliminate pre-answer thinking delays: Artificial Analysis measured `GPT-6.2 Astra` at 206.68 seconds to first answer token under Max reasoning effort compared to 3.87 seconds at Medium ([Emergent](https://emergent.sh/learn/gpt-6-2-astra-pricing)).

Meanwhile, Tel's report on internal autonomous research scaling aligns with OpenAI compute disclosures cited in independent reviews: over the six months leading into July 2026, OpenAI's share of research compute spent on internal coding inference rose 100x while internal agentic token usage climbed 22x ([BigGo Finance](https://finance.biggo.com/podcast/8696f3bca7cd59e8)).

## 4. What This Changes for Applied Engineers

1. **Lock prompt prefixes to capture the 95% cache discount.** Keep system instructions, tool schemas, and repository headers byte-identical at the start of every turn. A single shifting timestamp near the root turns a 95 percent savings into a 5x cost spike on iterative agent loops.
1. **Reserve 300 tok/s Ultrafast mode for synchronous user loops.** Use standard or batch tiers (50 percent off standard rates) for background `Dots` workflows, nightly CI sweeps, and asynchronous PR generation, paying the 3x to 6x speed premium only when a human is waiting live on screen.
1. **Offload control-flow branches to constrained-choice models.** Replace open-ended LLM router prompts with structured choice sets like the `Decisions API` (`Luna`) for UI click selection, triage, and next-action dispatch so orchestration overhead stays sub-second.
1. **Automate harness profiling alongside prompt tuning.** Follow OpenAI's internal loop by benchmarking tool-call latency, serialization overhead, and retry rates continuously, because cutting harness round-trips compounds across every multi-hour trajectory.

## Sources

- [OpenAI DevDay 2026 Keynote (FULL)](http://www.youtube.com/watch?v=Fls_onRviPM)
- [GPT-6.2 Astra Pricing: API Rates, Real Costs, and How to Cut Your Bill - Emergent](https://emergent.sh/learn/gpt-6-2-astra-pricing)
- [GPT-6.2 Astra Pricing: The Real Cost Per Task, Cache and Tier - eesel AI](https://www.eesel.ai/blog/gpt-6-2-astra-pricing)
- [GPU Memory Bandwidth vs Compute for LLM Inference Speed - NeevCloud](https://neevcloud.com/blogs/gpu-memory-bandwidth-vs-compute-what-actually-limits-llm-inf)
- [GPT-5.6: The Review (Internal Research Compute Breakdown) - BigGo Finance](https://finance.biggo.com/podcast/8696f3bca7cd59e8)

<!--
Artwork brief — from the writer routine. Draw per docs/ARTWORK.md,
then delete this comment.

Minimal geometric diagram on warm paper illustrating the trade-off between cached prefix reuse and memory-bandwidth-bound decode speed: on the left, a dense, anchored stack of horizontal ink prefix blocks sealed with a vermilion hanko square represents 95% cached input; on the right, a wide, sparse burst of eight thin horizontal velocity bars with a leading vermilion hanko pulse represents 300 tok/s Ultrafast decode. No text, no labels, strict paper, ink, border, and hanko palette.
-->
