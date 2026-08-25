---
title: 'Gemini 3.7 Flash and DeepSeek V4: Fast, Cheap Vision Models'
description: 'Gemini 3.7 Flash and DeepSeek''s new vision model just cut the price of AI image understanding twice in eight days. Here''s what changed and why.'
pubDate: 2026-08-25
keywords:
  - Gemini 3.7
  - DeepSeek V4
  - Vision Models
  - LLM releases
readingTime: '7 min read'
notionId: '3c7ced67-050a-81f0-ba5e-f113720a72c8'
heroImage: '../../assets/art/gemini-3-7-flash-deepseek-v4-cheap-vision-models-light.webp'
heroImageDark: '../../assets/art/gemini-3-7-flash-deepseek-v4-cheap-vision-models-dark.webp'
heroAlt: 'A stepped line falls steeply from the upper left, its steps growing shorter and shallower as it goes. A long horizontal dashed rule crosses the frame. The staircase meets that rule, continues below it, and runs off the lower right edge.'
---

<div class="tldr">

## Executive TL;DR

- Gemini 3.7 Flash launched on 13 August 2026 at $0.75 per million input tokens. Eight days later DeepSeek opened a vision model built on a text model that already undercuts that by more than half.
- Text pricing did this first. GPT-4 arrived at $30 per million input tokens in 2023; GPT-5.4 does comparable work at $2.50. The budget tier fell roughly 300x. Vision is running the same script on a shorter clock.
- Gemini leads on agentic and web work and runs about three times as fast — roughly 340 tokens per second against 113. DeepSeek answers with price: the same sample workload costs about 7.6x less. Neither lab is trying to win the same argument.
- Gemini 3.7 Flash is closed. DeepSeek's V4 family ships as open weights, so it can be run rather than rented.
- Read the small print: the $0.75 rate is introductory and doubles on 1 January 2027.

</div>

On August 13, 2026, Google cut the price of getting an AI to look at a picture. Eight days later, DeepSeek cut it again.

That's not a metaphor. [Gemini 3.7 Flash launched at $0.75 per million input tokens](https://www.marktechpost.com/2026/08/13/google-ai-just-released-gemini-3-7-flash/), reading text, images, audio, and video through the same meter. On August 21, [DeepSeek opened its own vision model, DeepSeek-V4-Flash-Vision-Exp, to developers through its API](https://www.caixinglobal.com/2026-08-22/deepseek-enters-the-multimodal-ai-race-with-experimental-vision-model-102476706.html), built on a text model that already undercuts Gemini's price by more than half. Two labs, eight days apart, both racing toward the same number: as close to free as they can get away with.

To understand why that race is happening now, and not two years ago, it helps to know what these models are actually doing when you hand them a photo.

## What a vision model actually does

Strip away the branding and a vision-language model has two parts working together. A vision encoder looks at the image and turns it into a grid of numbers, visual tokens, that describe shapes, colors, and spatial layout the way a sentence describes an event. A language model backbone then reads those visual tokens next to your text prompt and generates a response, the same way it would if you'd typed the description yourself.

That's the whole trick: make an image look like a paragraph the language model already knows how to read.

The type of vision model matters here. Early systems bolted a vision encoder onto a language model that was never trained to expect it, an adapter stitched onto a model built for something else. The [2025-2026 generation of frontier models moved away from that](https://arxiv.org/html/2501.02189), pretraining a single multimodal trunk that learns text and images together from the start rather than teaching an old model to tolerate a new input. Gemini 3.6 Flash, Claude Opus 4.6, GPT-5.6 Sol, and Qwen3.8-Max all belong to this second category, and Gemini 3.7 Flash and DeepSeek's vision model both descend from it.

The reason this matters for cost: every image gets sliced into hundreds of visual tokens before the model ever reads your question, and you pay for those tokens the same way you pay for text. A single high-resolution photo can cost as much as a page of prose. That's [the practical ceiling that has kept vision AI expensive](https://www.analyticsvidhya.com/blog/2026/07/modern-vlms-explained/): processing many images, or a long video, adds up fast, and for most of this technology's short history, "fast" and "cheap" were not words anyone used to describe it.

## How we got here

Vision-language models are barely four years old as a serious product category. DeepMind's Flamingo and Google's PaLM-E opened the door in 2022, more research demo than usable tool. 2023 is when it turned into a race: MiniGPT-4, Alibaba's Qwen-VL, OpenAI's GPT-4V, and Google's first Gemini models all shipped that year, each one racing to prove a model could describe a photo as well as it could finish a sentence.

2024 is when the adapters started disappearing. GPT-4o merged text, vision, and audio into one assistant instead of three bolted-together tools. Qwen2-VL sharpened visual perception enough to read dense documents. Meta's Llama 3.2 brought vision to an open-weight model for the first time at real scale.

By 2025, the labs had stopped treating vision as a feature and started treating it as a foundation. That's the shift that produced the single-trunk architectures behind today's models, and it's also the shift that made the current price war possible. When vision stops being an add-on, it stops carrying an add-on's inflated cost.

Which brings us to August 2026, and two models built on opposite sides of that trunk.

## Vision is just catching up to text

None of this is unique to images. Text models went through the same collapse first. [GPT-4 launched in March 2023 at $30 per million input tokens](https://tokencost.app/blog/ai-price-index); by March 2026, GPT-5.4 was doing comparable work for $2.50, a 12x drop at the frontier. The budget tier fell even harder: DeepSeek V3 landed at $0.14 per million tokens in December 2024, and by 2025, models like Gemini 2.0 Flash were quoting $0.10, roughly a 300x reduction from where GPT-4 started. The pattern that pricing analysts have settled on is that the floor drops faster than the ceiling, the cheap tier gets cheaper quicker than the flagship tier gets cheaper.

Vision is running the same script on a shorter clock. It took text models about three years to fall 90%+. Gemini 3.7 Flash and DeepSeek's vision model just repeated that curve for images in eight days, because the two labs didn't have to invent a new architecture this time. They just had to point the same cost-cutting playbook that gutted text pricing at a modality that used to be exempt from it.

## The showdown, spec for spec

Gemini 3.7 Flash isn't a new model from scratch. Its [model card describes it as algorithmic improvements layered onto the Gemini 3.6 Flash reasoning foundation](https://deepmind.google/models/model-cards/gemini-3-7-flash/), shipped just three weeks after 3.6. It reads text, images, audio, and video across a 1-million-token context window, and Google tuned this release for coding and agent work rather than raw reasoning: 65.3% on the DeepSWE v1.1 software engineering benchmark, up from 48.6% for the previous version, and 85.4% on LVBench, a video-understanding test, against 84.2% before. Worth noting what that jump does not buy: [on the same benchmark, OpenAI's GPT-5.6 Terra scores 69.6%](https://www.marktechpost.com/2026/08/13/google-ai-just-released-gemini-3-7-flash/). This is a cheap model closing on the frontier, not passing it. Pricing starts at $0.75 per million input tokens and $3.75 per million output tokens, an introductory rate that holds through December 31, 2026, before doubling on January 1, 2027.

DeepSeek's move came from a different direction. [DeepSeek V4 and V4-Pro shipped on 22 April under an MIT licence, the first open-weight frontier model of 2026 to arrive as a two-tier release](https://docs.clore.ai/guides/language-models/deepseek-v4), and V4-Flash has been running at aggressive pricing ever since — $0.14 per million input tokens and $0.28 per million output on DeepSeek's own API. On August 21, DeepSeek extended that model with vision. [DeepSeek-V4-Flash-Vision-Exp builds on the V4-Flash series by adding visual understanding](https://emergent.sh/news/deepseek-v4-flash-vision-exp-officially), and arrived as an experimental release: DeepSeek has published neither vision benchmarks nor vision-specific pricing, and [licensing terms for this particular model are not yet public](https://emergent.sh/news/deepseek-v4-flash-vision-exp-officially) either. What is known is the text model underneath it, and that already runs at a fraction of Gemini's rate.

Put the two side by side on comparable footing and the pattern holds. [Gemini 3.7 Flash leads on agentic depth and web work, while DeepSeek's equivalent Flash release holds up well on bounded coding and tool use — and Gemini runs roughly three times as fast, about 340 tokens per second against 113](https://www.orcarouter.ai/blog/gemini-3-7-flash-vs-deepseek-v4-flash). DeepSeek answers with price. On a sample workload of 20M input and 4M output tokens, the same job runs about $3.92 on DeepSeek against roughly $30 on Gemini — a 7.6x gap, and that is while Gemini's introductory rate still holds. After it expires on January 1, the gap widens to about fifteen times. Speed and capability on one side, an order of magnitude on price on the other. Neither company is trying to win the same argument.

## Why the small players should be paying attention

This is where the "who's winning" framing misses the point. The interesting story isn't Google versus DeepSeek. It's what happens below them.

A year ago, adding vision to a product meant picking the one frontier lab whose model you could afford and living with its limits. Now a startup can route the routine 80% of its image traffic, product photo checks, document reads, screenshot parsing, to whichever model is cheapest that week, and reserve the expensive frontier calls for the cases that actually need them. That kind of routing wasn't worth building when the price gap between "good" and "cheap" was ten times over. At today's prices, it's worth building for almost anyone processing images at volume.

Google is defending that gap with speed and benchmark scores, betting that reliability and raw capability are worth paying for. DeepSeek is closing it with price, betting that "close enough" at a fraction of the cost wins more workloads than it loses. Both bets can be right for different builders. Neither company gets to set the price alone anymore.

There's a second axis to that bet, too: Gemini 3.7 Flash is closed, available only through Google's API on Google's terms. DeepSeek's V4 family ships as open weights, which is what let it arrive as the [first open-weight frontier model of 2026 to ship in two tiers](https://docs.clore.ai/guides/language-models/deepseek-v4) and why a developer can, in principle, run a version of it without paying anyone per token at all, hardware cost aside. That's a second front in the same price war: Google is racing DeepSeek's price, and DeepSeek is racing everyone's assumption that a frontier vision model has to be rented rather than owned.

That's the actual headline: eight days apart, two labs proved that in vision AI, there is no longer a floor.

## Sources

- [Google AI Just Released Gemini 3.7 Flash: A Coding and Agent Model at $0.75/1M Input Tokens — MarkTechPost](https://www.marktechpost.com/2026/08/13/google-ai-just-released-gemini-3-7-flash/)
- [Gemini 3.7 Flash - Model Card — Google DeepMind](https://deepmind.google/models/model-cards/gemini-3-7-flash/)
- [Gemini 3.7 Flash launches three weeks after last model, live in Spark — 9to5Google](https://9to5google.com/2026/08/13/gemini-3-7-flash-launch/)
- [DeepSeek Enters the Multimodal AI Race with Experimental Vision Model — Caixin Global](https://www.caixinglobal.com/2026-08-22/deepseek-enters-the-multimodal-ai-race-with-experimental-vision-model-102476706.html)
- [DeepSeek-V4-Flash-Vision-Exp: New Multimodal AI Launch — Emergent](https://emergent.sh/news/deepseek-v4-flash-vision-exp-officially)
- [DeepSeek V4 (1.6T MoE, Multimodal) — Clore.ai Guides](https://docs.clore.ai/guides/language-models/deepseek-v4)
- [Gemini 3.7 Flash vs DeepSeek V4 Flash: Open vs Closed — OrcaRouter](https://www.orcarouter.ai/blog/gemini-3-7-flash-vs-deepseek-v4-flash/)
- [Modern VLMs Explained: How GPT-4o, Gemini, Claude Vision, and Qwen-VL Work — Analytics Vidhya](https://www.analyticsvidhya.com/blog/2026/07/modern-vlms-explained/)
- [Frontier Vision-Language Models: Architectural Evolution, Benchmarks, Applications, and Challenges — arXiv](https://arxiv.org/html/2501.02189)
- [AI Price Index: LLM Costs Dropped 300x (2023-2026) — TokenCost](https://tokencost.app/blog/ai-price-index)
