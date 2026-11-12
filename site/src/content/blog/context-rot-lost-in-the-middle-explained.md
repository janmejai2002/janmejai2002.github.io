---
title: 'Context Rot Explains Why Language Models Forget the Middle of Prompts'
description: 'Large context windows lose up to 22 points of accuracy on facts buried in the middle. Learn how context rot works and how to structure prompts so rules stick.'
pubDate: 2026-11-12
publishedAt: '2026-11-12T15:51:42.046Z'
track: basics
question: 'Why does an AI model with a million-token context window ignore data in the middle?'
keywords:
  - Context Rot Explained
  - Lost in the Middle LLM
  - Long Context Degradation
  - U-Shaped Attention Curve
heroImage: '../../assets/art/context-rot-lost-in-the-middle-explained-light.webp'
heroImageDark: '../../assets/art/context-rot-lost-in-the-middle-explained-dark.webp'
heroAlt: 'Minimalist geometric U-shaped plum curve spanning across 19 vertical tick marks, peaking at the left and right edges while sagging low over two broken center bars.'
readingTime: '8 min read'
notionId: '416ced67-050a-8157-84cd-ed72d9008c8b'
---
<div class="tldr">

## Executive TL;DR

- **Bigger windows do not equal uniform memory:** In [Chroma Research's July 2025 Context Rot study](https://aerospike.com/blog/context-engineering-ai-agents/) across 18 frontier models (including GPT-4.1, Claude 4, Gemini 2.5, and Qwen3) and 194,480 API calls, accuracy declined as input length grew in every experiment, long before hitting the maximum token limit.
- **The U-shaped recall curve:** In [Liu et al.'s "Lost in the Middle" study (arXiv:2307.03172)](https://aixblock.io/blogs/rag-evaluation-datasets), GPT-3.5-Turbo scored **75.8%** when the answer sat in passage 1 of 20, dropped **22 percentage points to 53.8%** at passage 10, and recovered to **63.2%** at passage 20.
- **Bad placement performs worse than zero context:** At passage 10 of 20, the model with retrieved documents (53.8%) actually scored **below its own closed-book baseline (56.1%)** with no documents provided at all ([AIxBlock summary of Liu et al.](https://aixblock.io/blogs/rag-evaluation-datasets)).
- **Focused prompts beat full chat histories:** In Chroma's conversational memory test, models answered more accurately from a focused ~300-token prompt than from the full ~113,000-token conversation history ([Aerospike Context Engineering](https://aerospike.com/blog/context-engineering-ai-agents/)).
- **Simple structural fixes restore recall:** Placing rules and key facts at the very top and bottom of a prompt ("sandwiching"), capping retrieved chunks at 10 to 20 passages ([Liu et al. review](https://medium.com/@sanjanapilli6/llms-do-not-read-your-context-equally-here-is-what-that-means-3699f3438802)), and pruning stale tool outputs prevent silent instruction drift.

</div>

## The Infinite Window Illusion: Why More Tokens Do Not Mean Better Answers

Paste a 60-page employee handbook into an AI chat window with a one-million-token limit, ask a specific policy question, and you might assume the model reads page 32 with the same sharp focus as page 1. After all, the prompt fit easily inside the advertised window without triggering an error.

Yet practitioners hit the same frustrating wall every week. The model follows your opening tone rule, obeys your final formatting instruction, and completely skips a crucial eligibility clause sitting on page 32. Researchers at Chroma gave this silent degradation a fitting name in July 2025: **context rot** ([ElixirData Context Rot Timeline](https://www.elixirdata.co/blog/what-is-context-rot)). Context overflow happens when a prompt exceeds the hard token ceiling and fails loudly; context rot happens when the call succeeds normally, returns a confident paragraph, and quietly drops facts buried in the middle.

To picture why this happens, imagine skimming a **500-page novel** in one sitting before taking a closed-book quiz. You remember the opening chapters vividly because they set the scene, and you remember the final chapters clearly because you just finished reading them five minutes ago. Ask yourself what color coat a minor character wore in Chapter 14 on page 240, and your recall blurs. A Transformer language model exhibits that exact same human-like memory curve, not because it gets tired, but because of how its **attention mechanism** allocates a fixed budget across tokens.

## The U-Shaped Blind Spot: How Attention Thins Out in the Center

Every time a language model generates the next word, its self-attention layer scores how relevant every earlier word (token) is to the current question. Those relevance scores must add up to 100% (`1.0`) via a mathematical step called **softmax** ([OvalEdge Context Rot Guide](https://www.ovaledge.com/blog/context-rot)).

Think of softmax attention as shining a single flashlight with a fixed amount of battery power across a dark warehouse:

- **At 500 tokens:** The beam is bright and concentrated. Each relevant sentence receives a large share of attention weight.
- **At 100,000 tokens:** That same 100% attention budget must now stretch across 200 times as many words. Even irrelevant filler paragraphs and near-duplicate distractors absorb tiny fractions of the beam, leaving less weight for the single clause that answers your question ([OvalEdge](https://www.ovaledge.com/blog/context-rot)).

Because of how autoregressive models are trained to predict the next token using positional encodings (such as RoPE, or Rotary Position Embeddings), two anchors attract disproportionate attention: the **very beginning** of the prompt (often called "attention sinks," where early instructions sit) and the **very end** (recency bias, right before the model starts answering).

Stanford and UC Berkeley researchers [Nelson F. Liu et al. (2023, TACL 2024)](https://aixblock.io/blogs/rag-evaluation-datasets) measured this U-shaped curve by placing one answer-bearing passage among 20 retrieved documents (~4,000 tokens) and sliding that single gold document from position 1 to position 20:

| Position of Gold Passage (out of 20) | GPT-3.5-Turbo Accuracy ([Liu et al.](https://aixblock.io/blogs/rag-evaluation-datasets)) | Comparison vs. Closed-Book Baseline (56.1%) |
| --- | --- | --- |
| **Position 1 (Start of prompt)** | **75.8%** | +19.7 percentage points above baseline |
| **Position 5 (Upper middle)** | **57.2%** | +1.1 percentage points above baseline |
| **Position 10 (Dead center)** | **53.8%** | **-2.3 percentage points BELOW baseline** |
| **Position 15 (Lower middle)** | **55.4%** | **-0.7 percentage points BELOW baseline** |
| **Position 20 (End of prompt)** | **63.2%** | +7.1 percentage points above baseline |
| **Oracle (Gold passage alone)** | **88.3%** | +32.2 percentage points above baseline |

Look closely at **Position 10**. When the exact right document sat in the middle of 20 passages, the model scored **53.8%**, which was worse than its **56.1%** accuracy when given *zero documents at all*. Adding extra background context did not merely fail to help; it actively hurt accuracy by burying the signal in distractors.

### Worked Example: Why Moving a Return Policy Breaks Customer Support Bots

Suppose you build a support assistant and paste 20 company policy excerpts (200 tokens each, 4,000 tokens total) into the prompt. Your **14-day refund exception for opened electronics** sits in excerpt #10, right in the center, surrounded by 19 similar-looking shipping and warranty paragraphs.

Based on the [Liu et al. multi-document curve](https://aixblock.io/blogs/rag-evaluation-datasets), placing that single rule at Position 1 gives the model a ~76% chance of applying it accurately. Shifting the exact same paragraph to Position 10 drops accuracy to ~54%, a **22-point drop** (nearly a 30% relative loss in reliability) without changing a single word of the policy. On a 1,000-ticket support day, that positional mistake alone creates roughly **220 wrong refund decisions**.

### What Chroma Found Across 18 Modern Models

You might wonder if 2025 and 2026 models with 1M-token windows solved this problem. [Chroma Research tested 18 frontier models](https://aerospike.com/blog/context-engineering-ai-agents/), including GPT-4.1, Claude 4, Gemini 2.5, and Qwen3, across 194,480 calls. Every single model degraded as input length grew. Even more telling, Chroma noted a subtle nuance that many summaries miss: on simple synthetic "needle-in-a-haystack" tests (finding one random sentence in filler text), frontier models scored well across positions, yet on realistic reasoning and conversational memory tasks, models answered **more accurately from a focused ~300-token snippet than from the full ~113,000-token history** ([TinyFish Context Rot Analysis](https://www.tinyfish.ai/blog/context-rot); [Aerospike](https://aerospike.com/blog/context-engineering-ai-agents/)). Realistic distractors that look similar to the right answer amplify context rot sharply as prompts grow.

## The Sandwich Strategy: Structuring Prompts so Critical Rules Are Never Lost

Since models attend most reliably to the opening and closing edges of a prompt, you can fix most context rot simply by rearranging where you put your instructions and data. Compare a typical monolithic prompt against a **sandwiched** layout:

| Prompt Zone | Poor Monolithic Layout | Optimized Sandwich Layout | Why It Works |
| --- | --- | --- | --- |
| **Top (Start of Prompt)** | Long background story or raw file dump | Core system role, hard constraints, and top-3 reference facts | Captures peak primacy attention (~75.8% zone) |
| **Middle (Center)** | Crucial formatting rules + policy exceptions mixed with logs | Supporting examples, secondary reference material, or raw data | Lowers risk of losing non-negotiable rules in the center |
| **Bottom (End of Prompt)** | A vague one-line question (`"Summarize above."`) | Specific task question, output schema, and repeated hard constraints | Captures recency attention (~63.2%+ recovery zone) |

Follow this four-step checklist before pasting any large document into an AI tool:

1. **Front-load hard rules:** Put "never do X" constraints and definitions in the first 300 tokens of the prompt.
1. **Prune stale chat turns and failed retries:** In multi-turn sessions, old errors, superseded drafts, and irrelevant search outputs accumulate in the middle and dilute attention ([OvalEdge](https://www.ovaledge.com/blog/context-rot)). Start a fresh chat thread whenever you switch sub-tasks.
1. **Cap pasted chunks:** In [Liu et al.'s scaling tests](https://medium.com/@sanjanapilli6/llms-do-not-read-your-context-equally-here-is-what-that-means-3699f3438802), expanding from 20 to 50 retrieved passages improved accuracy by only ~1.5% while multiplying cost and middle-position risk. Paste the 5 to 15 most relevant sections instead of the whole PDF.
1. **Repeat the critical rule at the end:** Close your prompt with the exact output format and the single most important constraint right before the model begins generating.

## Long Context vs. Search: The Simple Rule of Thumb for Big Documents

Large context windows still have clear strengths: they excel when you need an AI to synthesize *global* themes across one cohesive 30-page contract, compare two documents side by side, or trace a thread across a short codebase. Where monolithic prompts fail is **needle-finding inside noisy archives**, especially when your archive contains dozens of similar-looking versions, dates, or customer records that act as distractors.

Use this simple rule of thumb:

- **Under ~15,000 tokens (~25–30 pages) of clean, non-repetitive text:** Paste the document directly, placing your core instructions at the top and repeating the exact question and constraints at the bottom.
- **Over ~30,000 tokens or filled with similar-looking records (support tickets, product SKUs, chat logs):** Do not dump the archive into the prompt. Use **search-based retrieval (RAG)** to pull only the top 5 to 15 matching snippets into a lean prompt, giving the model a focused 300- to 3,000-token window where its attention stays sharp.

## Sources

- [Context Engineering for AI Agents and Where Memory Lives: Aerospike](https://aerospike.com/blog/context-engineering-ai-agents/): Summary of Chroma Research's July 2025 Context Rot report across 18 models (GPT-4.1, Claude 4, Gemini 2.5, Qwen3), 194,480 calls, and ~300 vs. ~113,000 token conversational accuracy.
- [RAG Evaluation Datasets: How to Build and Score Them: AIxBlock](https://aixblock.io/blogs/rag-evaluation-datasets): Exact positional accuracy numbers from Liu et al. ("Lost in the Middle", Table 1 and Table 6): 75.8% at position 1, 53.8% at position 10, 63.2% at position 20, 56.1% closed-book, 88.3% oracle.
- [Context Rot: How Long Inputs Degrade LLM Accuracy in 2026: TinyFish](https://www.tinyfish.ai/blog/context-rot): Nuance comparing synthetic needle-in-a-haystack stability against real-world repeated-words and distractor degradation.
- [What is Context Rot and Why it Breaks Production AI Systems: OvalEdge](https://www.ovaledge.com/blog/context-rot): Softmax attention dilution mechanics and multi-turn stale context accumulation.
- [LLMs Do Not Read Your Context Equally: Medium](https://medium.com/@sanjanapilli6/llms-do-not-read-your-context-equally-here-is-what-that-means-3699f3438802): Scaling comparison showing only ~1.5% gain when moving from 20 to 50 retrieved passages.
- [What Is Context Rot? Why AI Agents Get Worse as Context Grows: ElixirData](https://www.elixirdata.co/blog/what-is-context-rot): Historical timeline from Liu et al. (2023) through Chroma (July 2025) and Anthropic's context engineering framing (September 2025).

<!--
Artwork brief — from the writer routine. Draw per docs/ARTWORK.md,
then delete this comment.

- Argument in one sentence: Attention is a fixed budget concentrated at the opening and closing edges of a prompt, leaving the central span dim and prone to missed facts.
- Geometry: A horizontal sequence of 19 evenly spaced vertical tick bars across a Cartesian baseline, enclosed by a sweeping U-shaped `plum` curve that peaks high at both edges and sags deep in the center.
- Accent: plum
- Deliberate imperfection: Two broken, faint tick bars at positions 9 and 10 in the center of the sequence, representing critical facts dropped beneath the sagging `plum` attention curve.
-->
