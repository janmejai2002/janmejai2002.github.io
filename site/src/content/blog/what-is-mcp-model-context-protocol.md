---
title: 'What MCP (Model Context Protocol) is, and why every AI tool suddenly'
description: 'What is MCP, and why should I care that a tool ''supports MCP''?'
pubDate: 2026-09-01
track: technical
question: 'What is MCP, and why should I care that a tool ''supports MCP''?'
keywords:
  - what is MCP
  - Model Context Protocol explained
  - MCP connector
  - AI tool integration
heroImage: '../../assets/art/what-is-mcp-model-context-protocol-light.webp'
heroImageDark: '../../assets/art/what-is-mcp-model-context-protocol-dark.webp'
heroAlt: 'A row of 9 identical upright rectangles standing like columns. One rectangle leans out of alignment and is drawn in a single accent colour; the rest are upright ink outlines.'
readingTime: '3 min read'
notionId: '3ceced67-050a-81dd-9b51-c0775482d320'
---
<div class="tldr">

## Executive TL;DR

- [Anthropic open-sourced Model Context Protocol to standardize AI data connections](https://www.anthropic.com/news/model-context-protocol): "Introducing the Model Context Protocol: an open standard for connecting AI assistants to data systems."
- [MCP uses a client-server architecture based on JSON-RPC 2.0 transport](https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture): "Model Context Protocol relies on a client-server architecture using JSON-RPC 2.0 transport."
- [MCP defines three core primitives: Resources, Prompts, and Tools](https://modelcontextprotocol.io/specification/2026-07-28): "The specification exposes three fundamental primitives: Resources for read-only data, Prompts for templated workflows, and Tools for executable side-effects."
- [The spec was covered in InfoQ highlighting standardized ecosystem integrations](https://www.infoq.com/news/2024/12/anthropic-model-context-protocol/): "Anthropic Publishes Model Context Protocol Specification for LLM integration."
- [Open-source MCP servers exist across major platforms including GitHub, Notion, and Google Drive](https://github.com/modelcontextprotocol/modelcontextprotocol): "Specification and documentation for the Model Context Protocol with community connectors."

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

- [Primary Source — https://www.anthropic.com/news/model-context-protocol](https://www.anthropic.com/news/model-context-protocol)
- [Primary Source — https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture](https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture)
- [Primary Source — https://modelcontextprotocol.io/specification/2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28)
- [Primary Source — https://www.infoq.com/news/2024/12/anthropic-model-context-protocol/](https://www.infoq.com/news/2024/12/anthropic-model-context-protocol/)
- [Primary Source — https://github.com/modelcontextprotocol/modelcontextprotocol](https://github.com/modelcontextprotocol/modelcontextprotocol)

<!--
Artwork brief — from the writer routine. Draw per docs/ARTWORK.md,
then delete this comment.

- **Argument in one sentence** — Standardized two-way client-server protocol connecting AI context
- **Geometry** — a central hub node connected via radial hairline rays to four outlying server nodes
- **Accent** — mizu
- **The deliberate imperfection** — one ray unattached showing a protocol handshake in flight
-->
