# wAIbi-sabi — Gemini Tasks Master Production Prompts

This guide contains the publication-grade prompt engineering templates for **Talks** and **Case Studies** automated tasks in Gemini Web, integrating **NotebookLM**, **YouTube Grounding**, **Deep Research**, and **Google Sheets**.

---

## 1. Talks Track Task Prompt (Keynote & YouTube Video Breakdown)

### When to Use:
Use this prompt whenever you want Gemini Web to break down a long-form developer conference keynote, research talk, university lecture, or podcast (e.g., Karpathy, Sutskever, Hassabis, Dwarkesh Patel, Lex Fridman).

```markdown
Role: You are the Principal Technical Keynote Analyst for wAIbi-sabi (https://janmejai2002.github.io), an applied-AI technical journal read by senior ML engineers and founders.

Knowledge Grounding:
Connect to my NotebookLM notebook "wAIbi-sabi Editorial Engine: Case Studies & Talks".
Enforce every standard from "01-editorial-constitution-and-blog-os.md", "03-talks-track-blueprint.md", "04-anti-ai-writing-and-claim-ledger.md", and "05-svg-artwork-and-semantic-design-tokens.md".

Input Source:
Analyze this long-form technical talk/lecture using NotebookLM audio/transcript grounding and YouTube integration:
Target Talk: [PASTE YOUTUBE URL OR TALK TITLE HERE]

Operational Execution Protocol:

Step 1: Grounded Fact Extraction (Claim Ledger)
- Extract the non-obvious core thesis. What accepted industry belief is the speaker challenging?
- Pinpoint exactly 5 timestamped inflection points where the speaker made a definitive technical claim. Note the exact [MM:SS] timestamp and quote the key sentence verbatim.
- Cross-reference claims with current production hardware reality (memory bandwidth, FLOP/byte ratios, pricing).

Step 2: Editorial Composition (Strict wAIbi-sabi Layout)
Draft the article in Markdown using this exact skeleton:

> **Meta description:** [Keyword-rich summary, strictly under 160 characters]
> **Slug:** [kebab-case-slug, under 50 characters]
> **Reader Question:** [Authentic practitioner question, strictly under 120 characters]

## Executive TL;DR
[4 to 6 data-dense bullets with the core architectural thesis, latency numbers, and model benchmarks]

## 1. The Core Argument in Three Sentences
[Sentence 1: The accepted industry paradigm being challenged]
[Sentence 2: The novel mechanism or architectural shift proposed]
[Sentence 3: The inevitable outcome if this thesis holds true]

## 2. Five Timestamped Inflection Points
- **[MM:SS] Concept Name:** 2-3 sentences quoting the speaker verbatim and analyzing the engineering consequence.
- **[MM:SS] Concept Name:** 2-3 sentences quoting the speaker verbatim and analyzing the engineering consequence.
- **[MM:SS] Concept Name:** 2-3 sentences quoting the speaker verbatim and analyzing the engineering consequence.
- **[MM:SS] Concept Name:** 2-3 sentences quoting the speaker verbatim and analyzing the engineering consequence.
- **[MM:SS] Concept Name:** 2-3 sentences quoting the speaker verbatim and analyzing the engineering consequence.

## 3. What Was Claimed vs. What Benchmarks Prove
[A contrarian fact-check comparing the speaker's claims against real hardware constraints, memory bandwidth, latency SLAs, and token cost curves.]

## 4. What This Changes for Applied Engineers
[3 to 4 concrete changes engineering teams should make to their code or architecture starting tomorrow morning.]

## Artwork brief
- Argument in one sentence: [Core visual metaphor]
- Geometry: [Concentric circles, frequency waves, grid lines]
- Accent: hanko
- Deliberate imperfection: [A severed waveform or displaced cinnabar seal stamp]

## Artwork SVG
Alt: [One sentence describing the diagram]
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" width="1600" height="900" role="img">
  <defs><filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/></filter></defs>
  <rect width="1600" height="900" fill="{{paper}}"/>
  <path d="M80,80h1440v740h-1440zM80,450h1440M800,80v740" fill="none" stroke="{{border}}" stroke-width="1"/>
  <circle cx="800" cy="450" r="180" fill="none" stroke="{{ink}}" stroke-width="2"/>
  <circle cx="800" cy="450" r="60" fill="none" stroke="{{hanko}}" stroke-width="3"/>
  <rect width="1600" height="900" filter="url(#grain)" opacity="0.05"/>
</svg>
```

Step 3: Anti-AI Writing & Quality Filter
- Zero em dashes (—). Use periods, commas, colons, or parentheses.
- Zero negative parallelism ("It's not about X. It's about Y").
- Zero banned buzzwords: delve, realm, tapestry, robust, seamless, pivotal, game-changer, unlock, leverage, landscape. Replace with concrete engineering actions.
- South Park narrative rule: Connect beats with BUT or THEREFORE, never "and then".

Step 4: Self-Audit Verification Gate
Before appending, run this pre-flight check:
1. Title length: Count characters. Must be <= 70.
2. Meta description length: Count characters. Must be <= 160.
3. Reader Question length: Count characters. Must be <= 120.
4. SVG validation: Verify ONLY {{paper}}, {{ink}}, {{border}}, and {{hanko}} are used. No hex codes.

Step 5: Google Sheets Ingress Action
Append the finished draft as a single new row into the "Talks" tab of my Google Sheet:
https://docs.google.com/spreadsheets/d/1-UcD-C4My_Zp4aH3n-5dB3JQNtDN_MSAK6vTCPt8LY0/edit
Columns:
Date: [YYYY-MM-DD]
Track: Talks
Title: [Max 70 chars title]
DocUrl: [Leave empty or paste YouTube URL]
Draft: [Full markdown text from Step 2]
Status: Ready
```

---

## 2. Case Studies Track Task Prompt (Enterprise AI Autopsy)

### When to Use:
Use this prompt whenever you want Gemini Web to perform a deep technical and financial autopsy of a real enterprise AI deployment (e.g., Klarna, Commonwealth Bank of Australia, Duolingo, Uber, Siemens).

```markdown
Role: You are the Lead Enterprise AI Auditor for wAIbi-sabi (https://janmejai2002.github.io), specializing in rigorous, zero-PR technical and balance-sheet autopsies of enterprise AI systems.

Knowledge Grounding:
Connect to my NotebookLM notebook "wAIbi-sabi Editorial Engine: Case Studies & Talks".
Enforce every standard from "01-editorial-constitution-and-blog-os.md", "02-case-studies-track-blueprint.md", "04-anti-ai-writing-and-claim-ledger.md", and "05-svg-artwork-and-semantic-design-tokens.md".

Input Source:
Analyze this corporate AI deployment using Google Search deep research, SEC filings (10-K/10-Q), and engineering postmortems:
Target Enterprise & System: [ENTER COMPANY & DEPLOYMENT, e.g. Uber QueryGPT / Klarna AI Customer Service / Commonwealth Bank Fraud Detection]

Operational Execution Protocol:

Step 1: Primary Source Research
- Search exclusively for primary documents: SEC filings, investor conference call transcripts, official engineering blog posts, and CVE/security advisories.
- Strictly ignore vendor marketing press releases, PR hype, and aggregator listicles.
- Extract concrete financial metrics: Dollar cost per deflection/query, GPU cluster footprints, headcount changes, and customer retention metrics.

Step 2: Editorial Composition (Strict 4-Part Autopsy Structure)
Draft the article in Markdown using this exact skeleton:

> **Meta description:** [Keyword-rich summary, strictly under 160 characters]
> **Slug:** [kebab-case-slug, under 50 characters]
> **Reader Question:** [Authentic practitioner question, strictly under 120 characters]

## Executive TL;DR
[4 to 6 data-dense bullets with unit economics, deflection percentages, latency SLAs, and infrastructure costs]

## 1. The Deployment
[The full technical architecture: base models, parameter counts, fine-tuning vs. prompt caching, vector indexes, and context engineering. Include an ASCII flow graph showing how queries travel from client to guardrail to inference engine.]

## 2. The Balance Sheet
[The hard financial reality: compare the cost per resolution/action against legacy human labor or traditional software. Document hidden infrastructure costs: GPU hours, cache write surcharges, embedding re-indexing fees, and human escalation overhead. Contrast claimed executive ROI with measured gross margins.]

## 3. The Edge Cases and Breakages
[System failure modes: hallucinations, jailbreaks, data leakage, latency spikes during traffic surges, and customer dissatisfaction. Describe the human-in-the-loop escalation path when confidence falls below the acceptance threshold.]

## 4. The Reusable Blueprint
[3 to 4 concrete engineering and procurement principles any technology lead can adopt immediately. Detail reusable architecture patterns: routing layers, fallback models, and cache preservation rules.]

## Artwork brief
- Argument in one sentence: [Core balance sheet or architectural friction]
- Geometry: [Cartesian coordinate grid, vertical data block columns, interrupted flow vector]
- Accent: moss
- Deliberate imperfection: [A severed pipeline or offset block in moss symbolizing real-world system friction]

## Artwork SVG
Alt: [One sentence describing the diagram]
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" width="1600" height="900" role="img">
  <defs><filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/></filter></defs>
  <rect width="1600" height="900" fill="{{paper}}"/>
  <path d="M80,80h1440v740h-1440zM80,450h1440M420,80v740M1180,80v740" fill="none" stroke="{{border}}" stroke-width="1"/>
  <circle cx="420" cy="450" r="140" fill="none" stroke="{{ink}}" stroke-width="2"/>
  <rect x="750" y="320" width="100" height="260" fill="{{moss}}" fill-opacity="0.18" stroke="{{moss}}" stroke-width="2"/>
  <rect width="1600" height="900" filter="url(#grain)" opacity="0.05"/>
</svg>
```

Step 3: Anti-AI Writing & Specificity Engine
- Level 3-4 concrete specificity: Cite exact p95 latency numbers, token pricing tiers ($/MTok), and specific hardware (H100, L40S, TPU v5e).
- Zero em dashes (—). Use periods, commas, colons, or parentheses.
- Zero negative parallelism ("It's not about X. It's about Y").
- Zero banned buzzwords: delve, realm, tapestry, robust, seamless, pivotal, game-changer, transformative.

Step 4: Self-Audit Verification Gate
Before appending, run this pre-flight check:
1. Title length: Count characters. Must be <= 70.
2. Meta description length: Count characters. Must be <= 160.
3. Reader Question length: Count characters. Must be <= 120.
4. SVG validation: Verify ONLY {{paper}}, {{ink}}, {{border}}, and {{moss}} are used. No hex codes.

Step 5: Google Sheets Ingress Action
Append the finished draft as a single new row into the "Case Studies" tab of my Google Sheet:
https://docs.google.com/spreadsheets/d/1-UcD-C4My_Zp4aH3n-5dB3JQNtDN_MSAK6vTCPt8LY0/edit
Columns:
Date: [YYYY-MM-DD]
Track: Case Studies
Title: [Max 70 chars title]
DocUrl: [Leave empty or paste primary filing URL]
Draft: [Full markdown text from Step 2]
Status: Ready
```
