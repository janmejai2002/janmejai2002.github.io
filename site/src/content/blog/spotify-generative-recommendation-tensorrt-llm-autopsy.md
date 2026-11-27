---
title: 'Spotify AI Autopsy: Soft Tokens and a 54% Beam Search Cost Cut'
description: 'Spotify cut beam search inference costs by 54% on Qwen3-1.7B with TensorRT-LLM and soft-token embeddings while expanding Q3 2026 gross margin to 33.0%.'
pubDate: 2026-11-27
publishedAt: '2026-11-27T20:21:23.454Z'
track: case-studies
question: 'How did Spotify replace text-heavy recommendation prompts with soft tokens and cut beam search costs by 54%?'
heroImage: '../../assets/art/spotify-generative-recommendation-tensorrt-llm-autopsy-light.webp'
heroImageDark: '../../assets/art/spotify-generative-recommendation-tensorrt-llm-autopsy-dark.webp'
heroAlt: 'Geometric diagram showing fine text lines compressing into a single moss-filled soft-token circle feeding a branching beam-search tree and unified GPU sampler, with a stalled dashed branch below.'
readingTime: '6 min read'
notionId: '425ced67-050a-81f9-88d8-d8a0d7adbc01'
---
<div class="tldr">

## Executive TL;DR

- Spotify [reported](https://newsroom.spotify.com/2026-10-22/spotify-q3-2026-earnings/) €5.0 billion in Q3 2026 revenue (up 16% year over year) across 788 million monthly active users and 306 million Premium subscribers, while expanding gross margin by 136 basis points year over year to 33.0%.
- Rather than stuffing listening histories into long text prompts, [Spotify Engineering](https://engineering.atspotify.com/2026/10/advancing-generative-recommendation-inference-our-collaboration-with-nvidia-on-tensorrt-llm) projects existing user embeddings into a single LLM soft token (`Embedding to Prefix`) and translates beam-searched semantic IDs back into catalog items.
- In its initial January 2026 podcast launch on vLLM, CPU-side beam search bottlenecks and partial KV-block recomputation prevented full utilization of high-end GPUs, forcing Spotify onto lower-tier accelerators.
- Working with NVIDIA to add out-of-tree `Qwen3` soft-token plugins, PyTorch-backed sampler beam search, and multi-item scoring to TensorRT-LLM cut `Qwen3-1.7B` inference costs by up to 54% on beam search and 7% on candidate scoring.
- On the Q3 2026 earnings call, early AI taste-model deployments drove double-digit discovery gains, while management framed entertainment as structurally insulated from agentic substitution ("nobody asks an agent to summarize a song").

</div>

## 1. The Deployment

Traditional recommendation stacks at Spotify rely on multi-stage pipelines per surface: separate candidate generation, ranking, and dense user embeddings for Home, Next Song, and Podcasts. Starting in January 2026, Spotify moved toward generative recommendation using a Large Personalized Language Model grounded in semantic IDs rather than raw item IDs.

Four architectural components make up the production inference system:

1. **Embedding-to-Prefix Soft Token Projection**: Instead of serializing a listener's history as plain text, Spotify trains a projection layer that maps an existing dense user vector directly into the LLM's embedding space as a single soft token, fine-tuning a subset of model weights to condition generation on that vector.
1. **Semantic ID Beam Search**: For podcast discovery, the model decodes constrained token sequences via beam search to explore multiple recommendation paths concurrently, then translates top-scoring sequences (semantic IDs) into playable catalog items.
1. **Multi-Item Candidate Scoring**: For ranking workloads, rather than fanning out one separate HTTP request per candidate item, the engine applies candidate masking to score multiple items in a single forward pass and extract log probabilities (`logprobs`) in linear time.
1. **Unified TensorRT-LLM Serving Layer (`Qwen3-1.7B`)**: With NVIDIA engineers, Spotify consolidated beam search, multi-item scoring, and an out-of-tree `Qwen3` extension plugin (injecting user vectors via multi-modal `image_embeds` parameters) into TensorRT-LLM (`v1.2.0rc3` through `v1.3.0rc20`), replacing a split vLLM and SGLang stack.

When a Spotify surface requests real-time generative recommendations, the request flows through five steps:

1. The caller passes the user's dense embedding vector and request context (plus recent real-time streams when needed) to the custom serving layer.
1. The serving layer tokenizes the prompt and packages the user vector as a multi-modal embedding parameter (`image_embeds`).
1. Inside TensorRT-LLM, Spotify's out-of-tree `Qwen3` plugin projects the user vector and replaces the placeholder soft token before the initial forward pass executes.
1. Depending on the surface, the PyTorch-backed sampler either runs overlap-scheduled beam search to emit top semantic ID sequences or runs candidate masking to compute multi-item log probabilities in one pass.
1. Downstream catalog services map the returned semantic IDs or ranked logprobs back to playable podcasts, music, or audiobooks within the surface's real-time latency budget.

## 2. The Balance Sheet

Spotify's [Q3 2026 SEC filing](https://www.sec.gov/Archives/edgar/data/1639920/000114036126040435/ef20084028_ex99-1.htm) (quarter ended September 30, 2026) shows gross margin expansion even as generative AI workloads scaled across 788 million monthly active users (up 11% year over year) and 306 million Premium subscribers (up 9% year over year). Total revenue climbed 16% year over year (14% constant currency) to €5.0 billion, with Premium revenue reaching €4,487 million (ARPU €4.95, up 7.5% constant currency). Consolidated gross margin rose 136 basis points year over year to 33.0% (34.5% in Premium, 18.7% in Ad-Supported), driving €672 million in operating income, €3.2 billion in trailing 12-month free cash flow, and €9.9 billion in cash and equivalents with zero debt beyond lease liabilities.

The inference economics explain why Spotify avoided the gross-margin compression seen at pure-play wrapper apps. By keeping its production generative model compact (`Qwen3-1.7B`) and eliminating text-history prompt bloat through single soft tokens, Spotify kept per-request token counts tiny. Consolidating onto TensorRT-LLM then cut GPU cost further without sacrificing personalization quality.

| System / Financial Metric | Baseline Architecture / Prior Year | Current / Optimized State | Measured Impact |
| --- | --- | --- | --- |
| Q3 2026 Revenue & Gross Margin | 31.6% GM in Q3 2025 | €5.0B revenue, 33.0% GM | +136 bps YoY GM expansion |
| Beam Search Inference (`Qwen3-1.7B`) | vLLM on lower-tier GPUs | TensorRT-LLM PyTorch sampler | Up to 54% lower cost |
| Multi-Item Scoring (`Qwen3-1.7B`) | SGLang candidate masking | TensorRT-LLM Python Score API | Up to 7% lower cost |
| User Personalization Context | Plain user text (high latency) | 1 projected soft token | Minimal prompt token overhead |
| Mixed Playlists & AI Taste Model | Initial rollout (~1 year prior) | ~40M Premium users (+90% QoQ) | Double-digit discovery gains |

On the [Q3 2026 earnings remarks](https://s29.q4cdn.com/175625835/files/content_files/Q3_26-Earnings-Call-Prepared-Remarks.pdf), management noted that nearly 40 million Premium users now listen to mixed playlists (consumption growing 90% quarter over quarter) and early AI taste-model rollouts (such as U.S. Beta Taste Profile) produced double-digit gains in discovery and time spent in algorithmic sets. Just as important, Spotify kept its Q4 2026 operating income guidance at €820 million with moderating OpEx growth into 2027, treating custom inference engineering as margin defense rather than an unbudgeted GPU tax.

## 3. The Edge Cases and Breakages

Moving generative recommendations from research notebooks into real-time traffic exposed four technical bottlenecks that forced Spotify to rethink both prompt design and serving engines:

1. **Plain user text blew latency and GPU budgets**: Serializing a listener's playback and interaction history as plain text created oversized prompts whose prefill latency exceeded real-time request budgets and drove up GPU memory burn. Spotify restricted plain text to tiny real-time slices (such as the most recent streams) and abandoned full text histories for production personalization.
1. **User Semantic IDs lacked production readiness**: Encoding user history into extended-vocabulary semantic IDs (as explored in the PLUM literature) kept prompts short with zero custom serving code, yet fine-tuning across an extended user-token vocabulary proved brittle and remains confined to research experiments rather than live traffic.
1. **vLLM beam search stranded high-end GPUs**: At Spotify's January 2026 podcast launch, vLLM executed beam search logic outside the core GPU engine. That architecture triggered CPU-side coordination bottlenecks and forced the GPU to recompute partially filled KV blocks. Because high-end GPUs sat underutilized waiting on host CPU work, Spotify had to deploy onto lower-tier accelerators just to maintain an acceptable cost-to-load ratio.
1. **Fragmented two-engine stack and TensorRT-LLM feature gaps**: To get candidate masking for multi-item ranking, Spotify added SGLang alongside vLLM, creating two separate serving stacks to operate. Moving to TensorRT-LLM solved GPU utilization, yet initial releases lacked multi-sequence beam returns, out-of-tree plugin support in `trtllm-serve`, multi-modal embedding injection, and SGLang's Score API. Spotify and NVIDIA had to land four distinct upstream releases (`v1.2.0rc3` through `v1.3.0rc20`) and build a custom serving layer for tokenization and batching while waiting for native prefill-only embedding support.

## 4. The Reusable Blueprint

1. **Project dense embeddings into soft tokens instead of serializing user histories**: If your product already maintains high-quality user or item embeddings, map those vectors into one soft token via a learned projection (`Embedding to Prefix`) rather than burning thousands of prompt tokens describing behavior in English.
1. **Score candidates in one masked forward pass**: Never fan out `N` separate LLM requests to rank `N` items. Use candidate masking (via SGLang or TensorRT-LLM's Score API) so shared prefix compute runs once and scoring scales linearly with candidate count.
1. **Audit engine internals against your exact decoding mode**: Standard throughput benchmarks on greedy or single-sequence completions hide catastrophic CPU and KV-recomputation bottlenecks in beam search or constrained decoding. Profile your actual decoding path before sizing GPU tiers.
1. **Hold the model size at 1.7B when latency and margin govern**: Domain-tuned small models (`Qwen3-1.7B`) paired with overlap-scheduled samplers let consumer platforms deploy generative retrieval across hundreds of millions of users while expanding gross margins.

## Sources

- [Advancing Generative Recommendation Inference: our collaboration with NVIDIA on TensorRT LLM](https://engineering.atspotify.com/2026/10/advancing-generative-recommendation-inference-our-collaboration-with-nvidia-on-tensorrt-llm)
- [Spotify Reports Third Quarter 2026 Earnings](https://newsroom.spotify.com/2026-10-22/spotify-q3-2026-earnings/)
- [Spotify Q3 2026 SEC Form 6-K Exhibit 99.1](https://www.sec.gov/Archives/edgar/data/1639920/000114036126040435/ef20084028_ex99-1.htm)
- [Spotify Q3 2026 Earnings Call Prepared Remarks](https://s29.q4cdn.com/175625835/files/content_files/Q3_26-Earnings-Call-Prepared-Remarks.pdf)

<!--
Artwork brief — from the writer routine. Draw per docs/ARTWORK.md,
then delete this comment.

- Argument in one sentence: Collapsing bloated plain-text user histories into a single projected soft token and unifying split beam-search and scoring engines onto one GPU sampler cuts inference cost by 54%.
- Geometry: On the left, a dense horizontal block of fine text lines compresses through a diagonal projection funnel into a single moss-filled soft-token circle; on the right, a branching beam-search tree feeds cleanly into a unified moss-accented GPU sampler bar, while one severed branch below represents the retired CPU-bound vLLM path.
- Accent: {{moss}}
- Deliberate imperfection: One detached, dashed beam branch below the unified sampler stalls against a small vertical bar, representing the CPU-side bottleneck and partial KV-block recomputation that stranded high-end GPUs in Spotify's initial vLLM launch.
-->
