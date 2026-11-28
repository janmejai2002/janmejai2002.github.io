---
title: "State of play, November 2026"
unitNumber: "Insert A"
part: "Part IX · Inserts"
track: "Global Pulse"
accent: "indigo"
deck: "The frontier models, workhorse tiers, and open weights as of November 2026, and why single-model standardisation destroys unit economics."
hook: "A Mumbai financial services firm asks you to standardise all 5,000 employees on one model: $50/M output vs $0.50/M distilled. Why does picking a single model guarantee they either overpay or underperform?"
readingTime: "6 min read"
order: 3
nextLocked:
  id: "who-pays"
  title: "Ch 08 · Who pays for intelligence"
  track: "Consulting & Strategy (13 units)"
  words: "4,600 words · data centre capex, Big Tech debt, cloud API vs private silicon"
  outcomes:
    - "Evaluate a ₹5,000 crore Indian data-centre investment using utilisation and inference demand."
    - "Decide when an Indian bank should rent cloud APIs versus running open weights on private GPUs."
    - "Price an AI-assistant acquisition when token compute dominates gross margin."
---
In enterprise AI strategy, model names and version numbers expire within months. A technical choice frozen in March becomes economically uncompetitive by October. Yet beneath the rapid cadence of press releases lies a stable economic pattern: foundation labs sell a ladder of capabilities. <mark class="inf-mark">Model selection is an architectural portfolio decision, not a single brand choice: frontier models handle complex, ambiguous reasoning, while workhorse tiers execute high-volume operational tasks at a fraction of the cost.</mark>

This insert captures the frontier as of November 2026. For current pricing, context windows, and newly published releases, consult the living web edition.

## The model landscape (November 2026)

The market in late 2026 splits across three tiers: frontier reasoning engines, distilled workhorses, and open-weight models.

| Tier | Model | Developer | Launch Date | Pricing (In / Out per 1M) | Strategic Role |
|---|---|---|---|---|---|
| **Frontier** | Claude Fable 5.1 / Mythos 5.1 | Anthropic | 1 Sep 2026 | Reported ~$10 / $50 | General reasoning; Fable is public, Mythos has restricted access (Anthropic, Sep 2026) |
| **Frontier** | GPT-6 Astra | OpenAI | 3 Sep 2026 | $10 / $50 | Multimodal reasoning, deep research, coding (OpenAI, Sep 2026) |
| **Frontier** | Gemini 4 Argon | Google | 13 Oct 2026 | $2 / $10 (intro) | Long-context multimodal reasoning, developer tooling (Google, Oct 2026) |
| **Frontier** | Grok 4.7 | xAI | 21 Sep 2026 | Proprietary API | Real-time knowledge synthesis and coding (xAI, Sep 2026) |
| **Workhorse** | Claude Opus 5.5 | Anthropic | 22 Sep 2026 | $4 / $20 | Enterprise analysis, 40% cheaper than prior Opus (Anthropic, Sep 2026) |
| **Workhorse** | GPT-6.1 Sol | OpenAI | Late Sep 2026 | $2 / $10 | Near-frontier capability for a fifth of Astra's price (OpenAI, Sep 2026) |
| **Workhorse** | GPT-6.1 Terra | OpenAI | 26 Oct 2026 | $1 / $5 | High-throughput structured drafting and coding (OpenAI, Oct 2026) |
| **Distilled** | Claude Haiku 5.5 | Anthropic | 7 Oct 2026 | $0.10 / $0.50 | High-frequency classification, customer support (Anthropic, Oct 2026) |
| **Distilled** | GPT-6 Luna | OpenAI | 22 Sep 2026 | $0.10 / $0.50 | Real-time extraction, high-volume filtering (OpenAI, Sep 2026) |
| **Open** | Mistral Large 4 ("Le Chonk") | Mistral AI | 29 Oct 2026 | Open weights | 1-trillion parameter multimodal European model (Mistral AI, Oct 2026) |
| **Open** | Muse Spark 1.1 | Meta | 9 Jul 2026 | Open / Model API | Agentic multimodal workflows (Meta, Jul 2026) |
| **Indic** | Bulbul V4 Flash | Sarvam AI | 13 Oct 2026 | Proprietary API | Fast speech recognition across 11 Indian languages (Sarvam AI, Oct 2026) |

### Frontier systems

Frontier models represent the outer boundary of machine capability. OpenAI launched GPT-6 Astra in September 2026, positioning it as its flagship engine for complex multi-step research and autonomous problem-solving (OpenAI, Sep 2026). Anthropic released Claude Fable 5.1 and Claude Mythos 5.1 simultaneously (Anthropic, Sep 2026). Crucially, Fable and Mythos are the exact same underlying model; Anthropic deployed Fable 5.1 for general commercial access while reserving Mythos 5.1 for trusted-access deployments requiring heightened safeguards (Anthropic, Sep 2026). Google introduced Gemini 4 Argon in October 2026, pairing broad multimodal integration with an introductory price of $2 per million input tokens and $10 per million output tokens (Google, Oct 2026), following its September release of Gemini 3.8 Flash (Google, Sep 2026).

### The workhorse and distilled tier

The critical commercial breakthrough of late 2026 is the performance of distilled tier models. In previous product cycles, smaller models suffered severe accuracy drop-offs. In the current generation, workhorse models capture most frontier capabilities on everyday business tasks. 

OpenAI's launch post for GPT-6.1 Sol emphasizes that it delivers near-Astra intelligence at one-fifth the price (OpenAI, Sep 2026). Anthropic's Claude Haiku 5.5 costs $0.10 per million input tokens and $0.50 per million output tokens, an approximately 75% reduction in running costs compared to Haiku 4.5 baselines (Anthropic, Oct 2026). Running an extraction pipeline on Haiku 5.5 or GPT-6 Luna costs one-hundredth of the price of running the same prompt through Astra or Fable.

<aside class="inf-box inf-box--stat">

<p class="inf-box__stat">$0.10 / $0.50</p>

Per million input and output tokens for Claude Haiku 5.5 (down from $1.00 input on Haiku 4.5), reducing running costs by around 75%.
<span class="src">Source: (Anthropic, Oct 2026)</span>

</aside>

<aside class="inf-box inf-box--myth">

<p class="inf-box__label">Myth vs reality</p>

**Myth.** An enterprise should select one top-ranked AI model and mandate its use across all corporate applications.

**Reality.** Monolithic model adoption creates severe cost inefficiency. Deploying a $50-per-million-token frontier model to classify routine customer emails wastes capital, while assigning a distilled model to review cross-border tax treaties causes error cascades. High-performing architectures route queries dynamically across a model ladder (OpenAI, Sep 2026).

</aside>

## The economic principle: tiered routing

When advising corporate leadership, frame model selection as an optimization between inference cost and error risk.

<aside class="inf-box inf-box--principle">

<p class="inf-box__label">Principle · The model ladder</p>

1. Computational requirements scale with parameter count and reasoning depth. Frontier models consume significantly more server compute per generated token than distilled models.
2. Inference pricing reflects this compute disparity: frontier output costs $10 to $50 per million tokens, whereas distilled output costs $0.50 per million tokens.
3. In typical enterprise workloads (entity extraction, summarization, formatting, semantic search filtering), tasks do not require frontier reasoning depth.
4. Distilled models achieve high accuracy on structured tasks when provided with unambiguous instructions and few-shot examples.
5. Cost-effective enterprise architecture implements an automated router: cheap models handle high-volume routine tasks, escalating only complex, ambiguous, or high-liability queries to frontier models.

</aside>

According to the Stanford AI Index 2026 Report, benchmark performance on SWE-bench Verified surged from 60% to near 100% within twelve months, while organizational enterprise AI adoption reached 88% (Stanford HAI, 2026). As autonomous software workflows expand, raw token consumption multiplies exponentially. In a system where an agent executes twenty consecutive tool calls to process an invoice, using a frontier model for every call makes unit economics unsustainable.

<aside class="inf-box inf-box--case">

<p class="inf-box__label">Worked case · Illustrative · Tiered model routing at an Indian health insurer</p>

#### The situation
A health insurance provider in Pune processes 60,000 inbound hospital claims daily. Inquiries arrive as scanned hospital bills, doctor prescription notes, and voice recordings across Hindi, Marathi, and English. The technology team initially proposes routing every document to a top-tier frontier model.

#### The decision
The advisory team structures a three-tier routing architecture:
1. *Audio intake:* Sarvam Bulbul V4 Flash transcribes Hindi and Marathi hospital calls into structured text at low cost.
2. *Document parsing:* Claude Haiku 5.5 and GPT-6 Luna extract patient identifiers, invoice numbers, and billed line items into a standardized JSON schema. Over 52,000 routine claims (86%) pass automated validation at under ₹0.20 per claim.
3. *Adjudication escalation:* The remaining 8,000 complex claims (disputed diagnostic coverage or suspected billing irregularities) route to Gemini 4 Argon and GPT-6 Astra for multi-step policy evaluation.

#### Your move
By avoiding a monolithic frontier deployment, the insurer cuts daily inference expenditure from ₹2,40,000 to ₹18,500 while maintaining audit compliance. When asked in an interview how to cut AI operational expenditure, always propose an intelligent routing layer before suggesting renegotiating vendor enterprise licenses.

</aside>

- **Primary reading:** [Inside the AI Index: 12 Takeaways from the 2026 Report](https://hai.stanford.edu/news/inside-the-ai-index-12-takeaways-from-the-2026-report) (Stanford HAI, 2026)

<aside class="inf-box inf-box--check">

<p class="inf-box__label">Check yourself · Check yourself</p>

1. What is the operational distinction between Claude Fable 5.1 and Claude Mythos 5.1? <span class="lvl">recall</span>
2. Why is single-vendor model standardisation an anti-pattern for large enterprises? <span class="lvl">explain</span>
3. A client running an e-commerce catalog uses GPT-6 Astra to generate product tags for 500,000 items. Propose a more cost-effective model architecture. <span class="lvl">apply</span>
4. A vendor claims their model ranks number one globally based on their own published benchmark chart. What three questions do you ask before trusting the claim? <span class="lvl">judge</span>

</aside>

<details class="inf-answers">
<summary>Show answer key</summary>

1. They are the exact same underlying foundation model; Anthropic released Fable 5.1 for public commercial access while restricting Mythos 5.1 to vetted partners requiring specialized governance (Anthropic, Sep 2026).
2. Different tasks require vastly different reasoning capabilities and error tolerances. Deploying frontier models for routine tasks inflates token bills hundredfold, whereas deploying cheap models for complex edge cases increases failure rates.
3. Route the catalog extraction to a distilled workhorse model such as Claude Haiku 5.5 or GPT-6 Luna ($0.10 in / $0.50 out per million tokens), supported by structured JSON validation. This lowers inference expenditure by over 95% while maintaining tagging consistency (Anthropic, Oct 2026) (OpenAI, Sep 2026).
4. First, which benchmark was used, and is it independently audited or proprietary to the lab? Second, what prompt formatting and few-shot examples were applied? Third, how does the model perform on domain-specific test sets representing your production data distribution rather than public test suites?

</details>

<aside class="inf-box inf-box--recap">

<p class="inf-box__label">Night-before recap · The night-before page</p>

1. Models form a capability ladder: Frontier models (Astra, Fable/Mythos 5.1, Argon) lead reasoning; distilled tiers (Haiku 5.5, Luna, Sol) provide everyday operational power.
2. Price disparity is massive: Frontier outputs cost $10 to $50 per million tokens; distilled workhorse outputs cost $0.50 per million tokens.
3. Fable and Mythos are identical: Anthropic ships one model under two access policies (public Fable vs restricted Mythos).
4. Monolithic adoption is obsolete: Modern enterprise architecture routes 80% of volume through cheap models, escalating only complex exceptions to the frontier.
5. Benchmark skepticism is essential: Lab launch-day scores reflect vendor-curated tests; trust only independent production evals run on client data.

</aside>


## Primary sources cited in this unit

- [Introducing Claude Fable 5.1 and Claude Mythos 5.1](https://www.anthropic.com/claude-fable-and-mythos-5-1) — Anthropic, Sep 2026
- [GPT-6 Astra: A new generation of intelligence](https://openai.com/index/gpt-6-astra/) — OpenAI, Sep 2026
- [Gemini 4 Argon: Built to solve your hardest problems](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-argon/) — Google, Oct 2026
- [Inside the AI Index: 12 Takeaways from the 2026 Report](https://hai.stanford.edu/news/inside-the-ai-index-12-takeaways-from-the-2026-report) — Stanford HAI, 2026
