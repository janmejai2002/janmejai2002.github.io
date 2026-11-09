---
title: 'Fine-tuning vs prompting: which one your problem actually needs'
description: 'Should we fine-tune a model or just write better prompts?'
pubDate: 2026-09-01
track: business
question: 'Should we fine-tune a model or just write better prompts?'
keywords:
  - fine-tuning vs prompting
  - when to fine-tune
  - prompt engineering vs fine-tuning
  - AI customization cost
heroImage: '../../assets/art/fine-tuning-vs-prompting-when-light.webp'
heroImageDark: '../../assets/art/fine-tuning-vs-prompting-when-dark.webp'
heroAlt: 'A regular grid of 8 by 4 small ink circles on a paper ground. One position in the grid is not filled in — it is drawn only as a dashed outlined circle in a single accent colour.'
readingTime: '3 min read'
notionId: '3ceced67-050a-8188-b579-f05b4182936d'
---
<div class="tldr">

## Executive TL;DR

- [Fine-tuning changes model weights while prompting changes input context](https://platform.claude.com/docs/en/about-claude/glossary): "Fine-tuning adapts model parameters to specific domains while prompt engineering structures input context."
- [Prompting handles 80-90% of business use cases at zero upfront capital cost](https://redis.io/blog/rag-vs-large-context-window-ai-apps/): "Prompt engineering with retrieval handles the vast majority of enterprise requirements without model training expense."
- [Fine-tuning is required when task format, style, or strict output constraints must be guaranteed across millions of calls](https://platform.claude.com/docs/en/build-with-claude/context-windows): "Model fine-tuning locks in behavioral format and output structure."
- [Fine-tuned models lock in base model dependencies that retire when the base model shuts down](https://arxiv.org/abs/2005.11401): "Base model retirement invalidates fine-tuned weights, requiring retraining."

</div>

## Understanding RAG: Parametric vs Non-Parametric Memory

Retrieval-Augmented Generation (RAG) was formally introduced by [Lewis et al. (2020)](https://arxiv.org/abs/2005.11401) as a general-purpose fine-tuning recipe combining pre-trained parametric memory (the sequence-to-sequence model) with explicit non-parametric memory (a dense vector index over external documentation). While pre-trained LLMs store vast factual knowledge in their weights, their ability to precisely manipulate and update that knowledge remains fundamentally constrained without an external index.

In standard RAG architectures, a neural retriever identifies the top-k passages relevant to a query, which are then passed into the prompt context to ground generation. This pattern delivers three distinct production advantages: reducing hallucinations through verifiable source grounding, bypassing frozen knowledge cutoff dates, and enabling domain-specific customization without the immense expense of model fine-tuning.

## The 1M-Token Window Era and Context Rot

With frontier models like [Claude Sonnet 5 providing a 1M-token context window](https://platform.claude.com/docs/en/build-with-claude/context-windows) and [Gemini 1.5 Pro expanding up to 2M tokens](https://developers.googleblog.com/en/new-features-for-the-gemini-api-and-google-ai-studio/), product teams naturally ask whether retrieval infrastructure has become obsolete. If an entire codebase or documentation library fits directly into the prompt, why bother with chunking, embedding, vector databases, and similarity search?

The operational reality is that context capacity does not equal context utilization. As Anthropic's engineering documentation notes, accuracy and recall degrade predictably as token counts expand — a phenomenon known as [context rot](https://platform.claude.com/docs/en/build-with-claude/context-windows). Simply filling a context window with uncurated documents degrades response quality and increases latency.

## The "Lost in the Middle" Degradation

The foundational research on long-context retrieval performance by [Liu et al. (2023)](https://arxiv.org/abs/2307.03172) demonstrated that language models exhibit severe position bias. When relevant information is placed in the middle of long input contexts, model accuracy drops by 10 to 20+ percentage points compared to when the same information appears at the beginning or end.

This U-shaped performance curve (primacy and recency bias) affects both standard and explicitly fine-tuned long-context models. As a result, relying on long-context prompting for precise factual retrieval over multi-megabyte inputs introduces unpredictable failure modes where key facts are silently ignored.

## Economic and Latency Trade-offs

Beyond accuracy, the computational physics of transformer attention imposes steep economic costs. Standard multi-head self-attention scales with quadratic computational complexity $O(n^2)$ relative to sequence length. As analyzed by [Redis AI benchmarks](https://redis.io/blog/rag-vs-large-context-window-ai-apps/), doubling context length roughly quadruples the attention compute overhead, driving up time-to-first-token (TTFT) and per-query API costs.

Under long-context prompting, every single request pays the full input token cost for the entire window on every turn. In contrast, RAG retrieves only a targeted subset of relevant passages (typically 2,000–4,000 tokens), keeping input token consumption flat regardless of how large the underlying knowledge repository grows.

## Benchmark Divergence and The Hybrid Architecture

Empirical evaluations across 12 question-answering benchmarks show that RAG and long-context prompting yield identical answers on [roughly 60% of test queries](https://redis.io/blog/rag-vs-large-context-window-ai-apps/). However, performance diverges significantly on the remaining 40%: long-context models excel at synthesizing global narrative relationships across entire documents, while RAG wins on precise factual retrieval, exact numerical queries, and verifiable source attribution.

Modern AI engineering is therefore converging on a hybrid architecture: using RAG and semantic caching to perform fast, sub-second candidate retrieval over massive datasets, followed by targeted long-context reasoning over the retrieved document set.

## Sources

- [Primary Source — https://platform.claude.com/docs/en/about-claude/glossary](https://platform.claude.com/docs/en/about-claude/glossary)
- [Primary Source — https://redis.io/blog/rag-vs-large-context-window-ai-apps/](https://redis.io/blog/rag-vs-large-context-window-ai-apps/)
- [Primary Source — https://platform.claude.com/docs/en/build-with-claude/context-windows](https://platform.claude.com/docs/en/build-with-claude/context-windows)
- [Primary Source — https://arxiv.org/abs/2005.11401](https://arxiv.org/abs/2005.11401)

<!--
Artwork brief — from the writer routine. Draw per docs/ARTWORK.md,
then delete this comment.

- **Argument in one sentence** — Two intersecting paths of customization
- **Geometry** — a straight vertical line for prompting and a gradual curve for fine-tuning
- **Accent** — ochre
- **The deliberate imperfection** — a dot at the junction where prompt context budget exceeds fine-tuning ROI
-->
