---
name: geo-aeo-seo-writer
description: "Authoring and optimization engine for publication-grade articles engineered to rank simultaneously in traditional search engines (SEO), trigger direct zero-click answers in featured snippets and voice search (AEO), and earn citations across AI search engines like Perplexity, ChatGPT Search, Gemini, and Google AI Overviews (GEO)."
---

# GEO, AEO & SEO Master Article Writing Engine

This skill codifies the complete authoring architecture, retrieval mechanics, and editorial standards required to produce articles that dominate across all three search paradigms:
1. **SEO (Search Engine Optimization)**: Traditional algorithmic ranking, semantic topical authority, entity salience, and crawlability.
2. **AEO (Answer Engine Optimization)**: Zero-click featured snippets, voice search synthesis, Knowledge Panels, and "People Also Ask" (PAA) carousels.
3. **GEO (Generative Engine Optimization)**: High-confidence citations and recommendations inside LLM-synthesized answers (Perplexity, ChatGPT Search, Claude, Google AI Overviews, Microsoft Copilot).

It operationalizes the Princeton/Georgia Tech/Allen AI/IIT Delhi empirical GEO benchmark (*"GEO: Generative Engine Optimization"*), the Google E-E-A-T Search Quality Rater Guidelines, Schema.org semantic specifications, and the Wikipedia `WP:AISIGNS` Anti-Slop editorial standard.

---

## 1. The Tri-Search Paradigm Matrix

| Dimension | Traditional SEO | Answer Engine Optimization (AEO) | Generative Engine Optimization (GEO) |
| :--- | :--- | :--- | :--- |
| **Primary Target** | Google / Bing crawler & ranker (PageRank, RankBrain) | Google Featured Snippets, Siri, Alexa, PAA | LLM RAG pipelines (Perplexity, ChatGPT Search, AI Overviews) |
| **User Objective** | Find relevant blue links to click and browse | Get an immediate, definitive answer (zero-click) | Receive synthesized multi-source consensus & recommendation |
| **Winning Metric** | SERP Rank (#1–#3), Organic Clicks, CTR | Snippet Ownership, Voice Share, PAA expansion | Share of Model (SoM), Citation Frequency, Recommendation Rate |
| **Formatting Key** | H1/H2 hierarchy, semantic keywords, internal links | 40–60 word answer boxes, tables, `<ol>` steps | Verifiable data, named expert quotes, high information gain |
| **Failure Mode** | Keyword cannibalization, thin content, slow LCP | Ambiguous answers, conversational fluff, buried facts | Generic AI slop, unverified assertions, zero statistical grounding |

---

## 2. The Architectural Formula: The RAG-Optimized Inverted Pyramid

Every article written under this standard must follow a strict modular structure optimized for both human reading and machine chunking (vector database embedding chunks of 250–500 tokens).

### 2.1 Title & H1 Mechanics
- **SEO/GEO Format**: `[Specific Outcome / Definitive Subject]: [Methodology, Data, or Strategic Angle]`
- **Length Constraint**: Maximum 65–70 characters to avoid SERP truncation.
- **Intent Alignment**: Must resolve an exact informational, commercial, or investigative intent without bait-and-switch clickbait.

### 2.2 The "Executive Answer Block" (AEO Zero-Click Snippet)
- **Position**: Immediately below the H1 (or below a 1-sentence context setter).
- **Format**: Bolded, definitive 42–58 word paragraph.
- **Syntax**: Subject + Active Verb + Definitive Explanation + Key Parameter.
- **Prohibition**: Never start with "In this article, we will explore..." or "Have you ever wondered...". Answer the core question directly in sentence one.

### 2.3 Semantic Section Architecture (The Query Fan-Out)
- Structure headings (`H2`, `H3`) as explicit queries or entity-specific statements.
- **The Answer-First Subsection Rule**: The first sentence directly under every `H2` must deliver the bottom-line takeaway before presenting background analysis or supporting context.
- **Self-Contained Chunks**: Each subsection must make complete logical sense if extracted in isolation by a RAG retrieval pipeline. Avoid dangling referents (e.g., "As mentioned above" or "This system").

### 2.4 Structural Data Elements (Markdown Tables, Diagrams & Math)
- Whenever comparing 2+ options, tools, or concepts: **Provide a Markdown Table** with explicit column headers (`Feature | Option A | Option B | Practical Verdict`). **Critical**: Tables must have continuous rows with *zero blank lines* in between so markdown compiles into styled `<table>` elements.
- **Architectural Diagrams**: **Never emit ASCII box-drawing flowcharts** (`┌─┐`, `+---+`, `[Client] ──> [Server]`) in code blocks. Author diagrams as native `<figure class="diagram"><svg viewBox="0 0 W H" ...>` using wAIbi-sabi CSS tokens (`var(--card)`, `var(--border)`, `var(--ink)`, `var(--ink-soft)`, and track accents like `var(--mizu)` or `var(--ochre)`). *Rule*: Zero blank lines inside the `<svg>` tag so CommonMark does not split the HTML block.
- **Formulas and Equations**: **Never emit raw LaTeX math** (`$...$`, `$$...$$`, `\sqrt`, `\frac`, `\approx`, `\sum`). Astro does not run client-side LaTeX compilers, causing dollar signs and backslashes to leak into prose as broken glitches. Use clean Unicode symbols and inline code (`cos(θ) = (A · B) / (‖A‖ × ‖B‖)`, `‖A‖ = √(1² + 2² + 2²) = 3.0`, `P_i = exp(z_i / T) / ∑ exp(z_j / T)`) or styled code cards.
- Whenever describing a sequence: **Provide a numbered list** with imperative active verbs (`1. Download...`, `2. Configure...`).
- Whenever detailing specifications: Use bulleted attribute-value pairs (`- Latency: < 15ms`).

### 2.5 Machine-Readable FAQ Section
- 4 to 6 real conversational long-tail queries mirroring PAA, Reddit threads, and search autocomplete.
- Answers must be concise (2 to 3 sentences, 40–60 words each), crisp, and self-contained.
- Paired with valid `FAQPage` JSON-LD schema.

---

## 3. The Princeton GEO Benchmark: 6 Proven Citation Triggers

According to empirical research across 10,000+ generative search queries, applying specific content transformations boosts LLM citation likelihood by **up to 40%**. Every article must incorporate these six triggers:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   PRINCETON GEO CITATION TRIGGERS                      │
├────────────────────────────┬───────────────────────────────────────────┤
│ 1. Statistical Density     │ Embed verifiable numbers, %, dates, costs │
│ 2. Quotation Addition      │ Cite named experts with titles/affiliations│
│ 3. Source Transparency     │ Hyperlink primary sources & benchmarks    │
│ 4. Unique Information Gain │ Introduce proprietary data/frameworks     │
│ 5. Technical Precision     │ Use exact domain nouns; avoid vague terms │
│ 6. Linguistic Burstiness   │ Anti-slop syntax; eliminate AI boilerplate│
└────────────────────────────┴───────────────────────────────────────────┘
```

1. **Statistical Density**: Never state a trend without a metric.
   - *Bad*: "Cloud egress costs have grown significantly."
   - *GEO-Optimized*: "In 2025, enterprise cloud egress expenses rose 28.4% year-over-year, averaging $0.09 per gigabyte across primary availability zones."
2. **Authoritative Quotation & Attribution**: Name primary human sources.
   - *Format*: `"According to [Full Name], [Role/Title] at [Institution/Company]..."`
   - Explicitly establishes entity nodes in the search knowledge graph.
3. **Primary-Source Transparency**:
   - Reference whitepapers, RFCs, official earnings filings, or benchmark suites.
   - LLMs rely on source credibility heuristics; articles citing primary documentation are selected as authoritative reference nodes.
4. **Unique Information Gain**:
   - AI search engines penalize commodity summaries. Provide at least one proprietary element: an original benchmark test, a custom decision matrix, a teardown, or a first-hand workflow.
5. **Technical Precision & Entity Salience**:
   - Explicitly name protocols, standards, model architectures, and regulatory frameworks (e.g., `ISO 27001`, `HTTP/3`, `FlashAttention-2`, `GDPR Article 17`).
6. **Linguistic Fluency & Anti-Slop Discipline**:
   - Generative models reward authentic human cadence and penalize synthetic fluff.

---

## 4. The Anti-AI Editorial Standard (Zero Slop)

The writing must pass the rigorous `anti-ai-writing` editorial audit before finalization:

### 4.1 Strictly Banned AI Tropes
- **Banned Inflations**: *stands as a testament*, *serves as a stark reminder*, *plays a crucial/pivotal role*, *marks a shift*, *evolving landscape*, *delve / delving into*, *indelible mark*, *testament to the enduring power*.
- **Banned Participial Tails**: Delete any sentence that ends with `, highlighting/underscoring/reflecting/fostering/ensuring X`. Split the sentence into two independent clauses.
- **Banned Clichés**: *In the fast-paced world of*, *At the end of the day*, *A double-edged sword*, *It is not a question of if, but when*, *Consider the case of*.

### 4.2 Perplexity & Burstiness Enforcement
- **Sentence Length Variation**: Alternate sharply between punchy 4-word declarative sentences and 25-to-35-word complex sentences.
- **Cut Adverbs**: Eliminate *critically*, *fundamentally*, *exponentially*, *drastically*. Use strong, active motion verbs (*cut*, *routed*, *halted*, *bypassed*).

---

## 5. Technical Schema & Entity Integration

Every published piece must include valid, minified or structured JSON-LD in the page metadata:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      "@id": "https://example.com/article-slug#article",
      "headline": "Exact H1 Title Under 70 Characters",
      "description": "Meta description under 160 characters answering search intent.",
      "datePublished": "2026-11-09T00:00:00+00:00",
      "dateModified": "2026-11-09T00:00:00+00:00",
      "author": {
        "@type": "Person",
        "name": "Author Name",
        "jobTitle": "Domain Specialist",
        "sameAs": ["https://www.linkedin.com/in/..."]
      },
      "publisher": {
        "@type": "Organization",
        "name": "Publication Name",
        "url": "https://example.com"
      }
    },
    {
      "@type": "FAQPage",
      "@id": "https://example.com/article-slug#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is the primary difference between AEO and GEO?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "AEO optimizes content for immediate zero-click snippet extraction in search engines and voice assistants, whereas GEO optimizes content to be retrieved, cited, and recommended inside generative multi-source LLM answers such as Perplexity and ChatGPT Search."
          }
        }
      ]
    }
  ]
}
```

---

## 6. Pre-Publication GEO/AEO/SEO Audit Checklist

Before any article is published, audit against these 8 gates:

1. **Gate 1: The 50-Word Core**: Does the top of the article contain a direct, bolded answer snippet under 60 words that can be quoted without modification?
2. **Gate 2: Statistical Grounding**: Does every major claim contain an exact verifiable metric, percentage, date, or primary benchmark?
3. **Gate 3: Named Quotes & Citations**: Are there at least two direct quotations from accredited subject matter experts or official technical bodies?
4. **Gate 4: Structural Data**: Is there at least one clean Markdown comparison table and at least one ordered procedural list?
5. **Gate 5: Conversational FAQ**: Does the article conclude with 4+ real conversational questions answered in 40–60 words each?
6. **Gate 6: Zero AI Slop**: Has every instance of *delve*, *pivotal*, *testament*, *evolving landscape*, and trailing *-ing* participial clauses been stripped?
7. **Gate 7: Burstiness & Cadence**: Does the sentence rhythm fluctuate naturally with zero monotonous paragraphs?
8. **Gate 8: Valid Schema.org**: Is JSON-LD (`Article`, `FAQPage`) ready for embedding?
