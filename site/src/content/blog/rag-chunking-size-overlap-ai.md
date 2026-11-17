---
title: 'Bad Document Chunking Breaks RAG Search Before the AI Even Reads'
description: 'Bad RAG chunking slices PDF sentences and tables in half before search even starts. Learn why 512-token recursive chunks with 10 to 20% overlap win at 69%.'
pubDate: 2026-11-16
publishedAt: '2026-11-16T23:51:30.778Z'
track: basics
question: 'Why does my RAG assistant miss answers that are clearly written inside my uploaded PDFs?'
keywords:
  - RAG Chunking Explained
  - Document Chunk Size Overlap
  - Why RAG Misses Answers
  - PDF Splitting Mental Model
heroImage: '../../assets/art/rag-chunking-size-overlap-ai-light.webp'
heroImageDark: '../../assets/art/rag-chunking-size-overlap-ai-dark.webp'
heroAlt: 'Minimalist geometric diagram comparing a top row of non-overlapping rectangles where a vertical cut splits a block into two displaced pieces against a bottom row of rectangles connected by plum overlap bands that keep the block whole.'
readingTime: '8 min read'
notionId: '41aced67-050a-814b-ade2-f9c2e711795d'
---
<div class="tldr">

## Executive TL;DR

- **How you slice your PDFs matters as much as which embedding model you pick:** A peer-reviewed [Vectara study at NAACL 2025 (arXiv:2410.13070)](https://www.premai.io/blog/rag-chunking-strategies-the-2026-benchmark-guide/) tested `25` chunking configurations across `48` embedding models and found chunking changed retrieval accuracy as much as or more than the embedding model, while [Chroma Research](https://www.trychroma.com/research/evaluating-chunking) measured up to a **9% recall gap** between strategies on the same text.
- **Recursive splitting at 512 tokens with 10 to 20% overlap is the proven 2026 baseline:** Across `50` academic papers totaling **905,746 tokens** in the February 2026 FloTorch benchmark, **512-token recursive splitting won at 69% end-to-end answer accuracy** (`67%` for fixed-size `512` tokens) with zero LLM ingestion cost ([Prem AI 2026 Benchmark Guide](https://www.premai.io/blog/rag-chunking-strategies-the-2026-benchmark-guide/)).
- **Tiny chunks retrieve well but answer badly (`54%` accuracy):** Unfloored semantic chunking scored **91.9% retrieval recall** in Chroma's test yet dropped to **54% answer accuracy** in FloTorch because its chunks averaged just **43 tokens**, handing the AI isolated sentence fragments without enough context to answer ([Prem AI](https://www.premai.io/blog/rag-chunking-strategies-the-2026-benchmark-guide/)).
- **Giant chunks hit a "context cliff" above 2,500 tokens:** Stuffing multi-topic pages into one giant chunk dilutes the search vector, while splitting short `200`-word FAQ answers into smaller pieces actively ruins accuracy ([Prem AI](https://www.premai.io/blog/rag-chunking-strategies-the-2026-benchmark-guide/); [Firecrawl](https://www.firecrawl.dev/blog/best-chunking-strategies-rag)).
- **More overlap is not free:** Setting `50%` overlap (like OpenAI Assistants' default `800`-token chunk / `400`-token overlap) nearly doubles your vector storage bill and scored just **1.4% token efficiency (`IoU`)** in [Chroma's benchmark](https://www.trychroma.com/research/evaluating-chunking), compared to **3.6% `IoU` and 89.5% recall** for `400`-token recursive chunks.

</div>

## The Scissors Problem: Why Smart AI Models Miss Obvious Facts in Your PDFs

Suppose you upload a 100-page employee handbook PDF into a Retrieval-Augmented Generation (RAG) chatbot and ask: *"How many days of paternity leave do Bengaluru employees get if they joined four months ago?"* Page 42 states: *"Employees receive 15 days of paid paternity leave. However, employees with under 180 days of tenure receive 5 days."* Yet the bot confidently answers *"15 days,"* because **your chunking pipeline cut that paragraph in half before the search engine ever indexed it**.

Why do we have to slice documents into **chunks** in the first place?

When you build a RAG system, an **embedding model** turns each passage of text into a list of numbers (a spatial coordinate vector) so the database can find passages whose meaning matches the user's question ([Chroma Research](https://www.trychroma.com/research/evaluating-chunking)). If you compress an entire 50-page manual into a single coordinate vector, every topic in the manual blurs together into an average grey smudge. And even with 128,000-token language models, pasting irrelevant chapters into every prompt wastes money and distracts the generator ([Prem AI](https://www.premai.io/blog/rag-chunking-strategies-the-2026-benchmark-guide/); [Chroma Research](https://www.trychroma.com/research/evaluating-chunking)).

So every RAG pipeline cuts documents into smaller passages called **chunks** (measured in **tokens**, where `1 token` is roughly `0.75` English words). A peer-reviewed **Vectara study at NAACL 2025 (`arXiv:2410.13070`)** tested **25 chunking configurations across 48 embedding models** and proved that how you split your text has as much or more impact on retrieval quality as which embedding model you choose ([Prem AI](https://www.premai.io/blog/rag-chunking-strategies-the-2026-benchmark-guide/)).

## Too Small vs. Too Big: Finding the Sweet Spot Between Fragments and Topic Soup

Think of each chunk as an **index card** that you hand to the AI when it takes an open-book test. What happens if your index cards are too small or too big?

1. **The Fragment Trap (Chunks Too Small, `< 100` tokens):** Suppose you cut a recipe onto tiny strips of paper, one sentence per strip. If a user asks *"At what temperature do I bake the sourdough loaf?"*, the search engine might pull the strip reading *"Bake at 230 degrees Celsius for 20 minutes,"* while leaving behind the very next strip: *"then remove the lid and lower the oven to 200 degrees Celsius for 25 minutes."*

- **The Benchmark Proof:** In [Chroma Research's evaluation](https://www.trychroma.com/research/evaluating-chunking), semantic chunking scored an impressive **91.9% token recall**. Yet when the **February 2026 FloTorch benchmark** tested the exact same strategy on **50 academic papers (`905,746` tokens)** for end-to-end answer accuracy, semantic chunking collapsed to **54% accuracy**, losing by **15 percentage points** to simple **512-token recursive splitting (`69%` accuracy)** ([Prem AI](https://www.premai.io/blog/rag-chunking-strategies-the-2026-benchmark-guide/)). Why? Because without a minimum size floor, the semantic splitter created tiny fragments averaging just **43 tokens** (about 30 words), which matched keywords cleanly but starved the LLM of context!

1. **The Topic Soup Trap (Chunks Too Big, `> 1,500` tokens):** Now suppose you tape five chapters of a textbook onto a single giant poster board. One paragraph is about paternity leave, three pages are about cafeteria reimbursements, and two pages are about parking permits. When the embedding model averages all 2,500 tokens into one vector, the specific signal for "paternity leave exception" gets drowned out. A January 2026 analysis cited by [Prem AI](https://www.premai.io/blog/rag-chunking-strategies-the-2026-benchmark-guide/)[Prem AI](https://www.premai.io/blog/rag-chunking-strategies-the-2026-benchmark-guide/) and [Firecrawl](https://www.firecrawl.dev/blog/best-chunking-strategies-rag) identified a sharp **"context cliff" around 2,500 tokens** where answer quality drops.
1. **The Short-Document Exception (Do Not Split `200`-Word FAQs):** Slicing a `200`-word password-reset FAQ into three `70`-word fragments guarantees that at least one fragment is missing the final step. On short, single-topic FAQs, **keep the entire article as one chunk** ([Prem AI](https://www.premai.io/blog/rag-chunking-strategies-the-2026-benchmark-guide/)).

## How Chunk Overlap Saves Split Sentences (And When It Doubles Your Bill)

If you split a long PDF every `512` tokens, what stops the scissors from cutting right between a rule (at token `510`) and its exception (`"However, for new hires..."` at token `513`)?

That is the job of **chunk overlap** (also called a **sliding window**) ([Firecrawl](https://www.firecrawl.dev/blog/best-chunking-strategies-rag); [Cohere Docs](https://docs.cohere.com/page/chunking-strategies)). Instead of starting Chunk 2 at token `513`, an overlap of **10% to 20%** (`50 to 100` tokens) backs up and repeats the last `50 to 100` tokens of Chunk 1 at the top of Chunk 2.

Trace a concrete worked example on a **1,500-token policy PDF** to see how chunk size and overlap change both **boundary safety** and **your database bill**:

1. **Zero Overlap (`500`-token chunks, `0`-token overlap):**

- **Chunk 1:** Tokens `1` to `500`; **Chunk 2:** Tokens `501` to `1,000`; **Chunk 3:** Tokens `1,001` to `1,500`.
- **Total chunks stored & embedded:** `3` chunks (`1,500` total tokens indexed). Any sentence crossing token `500` or `1,000` is severed in half.

1. **15% Overlap (`500`-token chunks, `75`-token overlap, step size = `425` tokens):**

- **Chunk 1:** Tokens `1` to `500`; **Chunk 2:** Tokens `426` to `925` (repeats tokens `426` to `500` so boundary sentences stay whole!); **Chunk 3:** Tokens `851` to `1,350`; **Chunk 4:** Tokens `1,276` to `1,500`.
- **Total chunks stored & embedded:** `4` chunks (`1,725` total tokens indexed, a modest **15% storage overhead** that rescues split paragraphs).

1. **50% Overlap (`500`-token chunks, `250`-token overlap, step size = `250` tokens):**

- Produces **5 full chunks** totaling `2,500` indexed tokens (nearly **doubling your vector database cost**). Worse, when your retriever pulls the top 5 chunks for a question, two of those chunks will contain the exact same 250-token paragraph twice, wasting half of the AI's prompt budget!

In [Chroma Research's token-level evaluation](https://www.trychroma.com/research/evaluating-chunking) across `328,208` tokens (`State of the Union`, `WikiText`, `Chatlogs`, `ConvFinQA`, and `PubMed`), researchers measured **Intersection over Union (`IoU`)**: the percentage of retrieved tokens that are actually relevant without redundant overlap bloat. Look at how default fixed splitting with `50%` overlap (`800` tokens, `400` overlap, the default in OpenAI Assistants file search) compares against recursive and structure-aware strategies across the 2024 to 2026 benchmarks ([Chroma Research](https://www.trychroma.com/research/evaluating-chunking); [Prem AI](https://www.premai.io/blog/rag-chunking-strategies-the-2026-benchmark-guide/)):

| Chunking Strategy & Configuration | How It Decides Where to Cut | Chroma Retrieval Recall (`n=5`) | Chroma Token Efficiency (`IoU`) | FloTorch / NVIDIA End-to-End Answer Accuracy | Best Document Type |
| --- | --- | --- | --- | --- | --- |
| **Fixed Token Splitter (`800` tokens, `400` overlap / `50%`)** | Blindly cuts every 800 tokens regardless of sentences or tables (OpenAI Assistants default) | **87.9%** ([Chroma](https://www.trychroma.com/research/evaluating-chunking)) | **1.4%** (Lowest efficiency due to 50% duplicate bloat) | `67%` (at 512 tokens in [FloTorch](https://www.premai.io/blog/rag-chunking-strategies-the-2026-benchmark-guide/)) | Raw server logs or uniform plain-text dumps |
| **Recursive Character Splitter (`400` to `512` tokens, `0` to `20%` overlap)** | Tries paragraph breaks (`\n\n`) first, then lines (`\n`), then sentences/spaces | **88.1% to 89.5%** ([Chroma](https://www.trychroma.com/research/evaluating-chunking)) | **3.3% to 3.6%** (Over 2.3x more token-efficient than 800/400) | **69% (Winner)** across 50 papers in [FloTorch 2026](https://www.premai.io/blog/rag-chunking-strategies-the-2026-benchmark-guide/) | General handbooks, articles, policies, and research papers |
| **Page-Level / `1,024`-Token Document-Aware Splitting** | Splits on PDF page boundaries or Markdown headings (`#`, `##`, `###`) | N/A (Evaluated by NVIDIA) | High (Preserves whole tables & sections) | **0.648 (Page-level winner)** & **57.9% (1,024t)** on `FinanceBench` ([Prem AI](https://www.premai.io/blog/rag-chunking-strategies-the-2026-benchmark-guide/)) | Financial statements, PDF balance sheets, and structured Markdown docs |
| **Unfloored Semantic Chunking (`~43`-token avg fragments)** | Cuts whenever sentence-to-sentence embedding cosine similarity drops | **91.9%** (LLM) / **91.3%** (Cluster) ([Chroma](https://www.trychroma.com/research/evaluating-chunking)) | **3.9% to 4.5%** ([Chroma](https://www.trychroma.com/research/evaluating-chunking)) | **54% (Failed by 15 pts)** in [FloTorch 2026](https://www.premai.io/blog/rag-chunking-strategies-the-2026-benchmark-guide/) unless a `200+` token floor is set | Multi-topic transcripts *only* when `min_chunk_size >= 200` is enforced |

## The Starter Playbook: Splitting by Structure Before Counting Tokens

You do not need an expensive LLM chunker to fix missing answers in your RAG assistant. Follow these four practical rules validated across the [Chroma](https://www.trychroma.com/research/evaluating-chunking), [NVIDIA, Vectara, and FloTorch 2026 benchmarks](https://www.premai.io/blog/rag-chunking-strategies-the-2026-benchmark-guide/):

1. **Start with Recursive Splitting at `512` Tokens and `10% to 20%` (`50 to 100` Token) Overlap:** Configure your splitter to check paragraph breaks (`\n\n`) and sentence periods (`.`, `?`, `!`) before falling back to spaces ([Chroma Research](https://www.trychroma.com/research/evaluating-chunking); [Prem AI](https://www.premai.io/blog/rag-chunking-strategies-the-2026-benchmark-guide/)). This single setting won the 905,746-token FloTorch 2026 benchmark at `69%` accuracy and runs in milliseconds for free.
1. **Split on Headings First, and Prepend the Section Title to Every Chunk:** When a 10-page HR section titled `"Section 4: Bengaluru Leave Policy"` is split into six `512`-token chunks, Chunks 2 through 6 lose the main heading! Use a header-aware splitter (`MarkdownHeaderTextSplitter` or HTML/PDF title extraction) and automatically stamp the parent heading (`"[Document: HR_Manual_2026 | Section: Bengaluru Leave Policy]"`) at the top of every single chunk so the embedding model never loses track of what the pronoun *"it"* or *"they"* refers to ([Prem AI](https://www.premai.io/blog/rag-chunking-strategies-the-2026-benchmark-guide/)).
1. **Never Slice a Table Across Two Chunks:** A financial table or pricing grid cut at row 12 separates the numbers from their column headers, turning Chunk 2 into unsearchable gibberish. Extract PDF tables as intact Markdown tables, or use `1,024`-token / page-level chunks for financial PDFs (`57.9%` and `0.648` accuracy in NVIDIA's `FinanceBench` test per [Prem AI](https://www.premai.io/blog/rag-chunking-strategies-the-2026-benchmark-guide/)).
1. **Always Enforce a `200`-Token Minimum Size Floor:** Before indexing, inspect your smallest chunks (`min(chunk_lengths)`). If your splitter produces 15-word orphan chunks or you experiment with semantic chunking, set `min_chunk_size = 200` tokens so tiny fragments are merged into their neighbor rather than starving the AI of context ([Prem AI](https://www.premai.io/blog/rag-chunking-strategies-the-2026-benchmark-guide/)).

## Sources

- [RAG Chunking Strategies: The 2026 Benchmark Guide: Prem AI](https://www.premai.io/blog/rag-chunking-strategies-the-2026-benchmark-guide/): Comprehensive March 2026 synthesis of the FloTorch February 2026 benchmark (50 papers, 905,746 tokens: 69% recursive 512t vs 67% fixed 512t vs 54% semantic 43t fragments), NVIDIA FinanceBench (0.648 page-level, 57.9% 1,024t), Vectara NAACL 2025 (`arXiv:2410.13070`, 25 chunking configs across 48 embedding models), and the 2,500-token context cliff.
- [Evaluating Chunking Strategies for Retrieval: Chroma Technical Report](https://www.trychroma.com/research/evaluating-chunking): Primary benchmark by Brandon Smith and Anton Troynikov across 5 corpora (328,208 tokens, 472 queries) introducing token-level Intersection over Union (`IoU`), demonstrating up to a 9% recall gap and showing why OpenAI Assistants' 800-token / 400-overlap default scores just 1.4% `IoU` compared to 3.6% `IoU` and 89.5% recall for 400-token recursive chunks.
- [Best Chunking Strategies for RAG (and LLMs) in 2026: Firecrawl](https://www.firecrawl.dev/blog/best-chunking-strategies-rag): Practitioner guide on sliding-window overlap (10% to 20%), short-document fragmentation risks, and the 2,500-token context degradation threshold.
- [Effective Chunking Strategies for RAG: Cohere Documentation](https://docs.cohere.com/page/chunking-strategies): Technical documentation on 500-token baseline windows and boundary overlap trade-offs.

<!--
Artwork brief — from the writer routine. Draw per docs/ARTWORK.md,
then delete this comment.

- Argument in one sentence: A blind fixed-length cut slices a policy rule and its exception cleanly in two across a hard boundary, whereas a structure-aware recursive window with a 15% overlap band keeps the complete meaning intact inside a single retrievable card.
- Geometry: Two horizontal document tracks stacked vertically: on the top track (`Naive Fixed Cut`), three rigid rectangles meet at sharp butt joints where a vertical cut line severs a central policy block into two disconnected halves; on the bottom track (`Recursive + 15% Overlap`), three cards overlap across shaded `plum` sliding-window zones so the complete policy block sits unbroken inside the middle card.
- Accent: plum
- Deliberate imperfection: In the top fixed-size track, the second half of the severed sentence block is displaced downward and detached from its first half at x=640, illustrating how a zero-overlap fixed cut orphans an exception clause so retrieval misses it.
-->
