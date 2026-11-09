---
title: 'What RAG (retrieval augmented generation) is, and when it beats a bi'
description: 'Do I need RAG, or can I just paste everything into a big context window?'
pubDate: 2026-09-01
track: technical
question: 'Do I need RAG, or can I just paste everything into a big context window?'
keywords:
  - what is RAG
  - retrieval augmented generation
  - RAG vs long context
  - grounding LLM answers
heroImage: '../../assets/art/what-is-rag-retrieval-augmented-generation-light.webp'
heroImageDark: '../../assets/art/what-is-rag-retrieval-augmented-generation-dark.webp'
heroAlt: 'A regular grid of 8 by 5 small ink circles on a paper ground. One position in the grid is not filled in — it is drawn only as a dashed outlined circle in a single accent colour.'
readingTime: '3 min read'
notionId: '3ceced67-050a-8128-bdf2-d86865c84cfb'
---
<div class="tldr">

## Executive TL;DR

- [RAG was defined as a fine-tuning recipe combining parametric and non-parametric memory for generation](https://arxiv.org/abs/2005.11401): "We explore a general-purpose fine-tuning recipe for retrieval-augmented generation (RAG) -- models which combine pre-trained parametric and non-parametric memory for language generation."
- [In the original RAG, non-parametric memory is a dense vector index of Wikipedia accessed by a neural retriever](https://arxiv.org/abs/2005.11401): "We introduce RAG models where the parametric memory is a pre-trained seq2seq model and the non-parametric memory is a dense vector index of Wikipedia, accessed with a pre-trained neural retriever."
- [The paper compared two formulations: one set of passages for the whole output vs different passages per token](https://arxiv.org/abs/2005.11401): "We compare two RAG formulations, one which conditions on the same retrieved passages across the whole generated sequence, the other can use different passages per token."
- [RAG generated more specific, diverse and factual language than a parametric-only baseline](https://arxiv.org/abs/2005.11401): "For language generation tasks, we find that RAG models generate more specific, diverse and factual language than a state-of-the-art parametric-only seq2seq baseline."
- [Provenance and updating world knowledge motivated RAG — they were open problems for parametric-only models](https://arxiv.org/abs/2005.11401): "Additionally, providing provenance for their decisions and updating their world knowledge remain open research problems."

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

- [Primary Source — https://arxiv.org/abs/2005.11401](https://arxiv.org/abs/2005.11401)
- [Primary Source — https://arxiv.org/abs/2307.03172](https://arxiv.org/abs/2307.03172)
- [Primary Source — https://platform.claude.com/docs/en/build-with-claude/context-windows](https://platform.claude.com/docs/en/build-with-claude/context-windows)
- [Primary Source — https://redis.io/blog/rag-vs-large-context-window-ai-apps/](https://redis.io/blog/rag-vs-large-context-window-ai-apps/)
- [Primary Source — https://developers.googleblog.com/en/new-features-for-the-gemini-api-and-google-ai-studio/](https://developers.googleblog.com/en/new-features-for-the-gemini-api-and-google-ai-studio/)

<!--
Artwork brief — from the writer routine. Draw per docs/ARTWORK.md,
then delete this comment.

- **Argument in one sentence** — Retrieval narrows a large corpus to the few passages that answer the query
- **Geometry** — a dense field of dots with a single hairline funnel selecting three
- **Accent** — mizu
- **The deliberate imperfection** — one dot outside the funnel left unselected, the fact the retriever missed
-->
