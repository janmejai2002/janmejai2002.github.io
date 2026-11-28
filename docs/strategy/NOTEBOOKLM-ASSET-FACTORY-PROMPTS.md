# NotebookLM & Gemini Notebook Asset Factory Playbook

**Purpose:** Transform our existing knowledge base into 4 sellable companion asset packs (`Pack A`–`Pack D`) for `INFERENCE` (`₹499` / `₹1,999` / `₹3,499`) and the standalone `B-School 708-Story GDPI Dossier` (`₹999` / `$25`), plus high-converting ad/lead-magnet creatives.

---

## 0. Source Corpus Inventory & Notebook Architecture

### 0.1 Verified Knowledge Base Assets in This Repo

| Corpus Asset | Location / Generator | Exact Volume | Commercial Use |
|---|---|---|---|
| **INFERENCE Compendium (2027 v1.0)** | `site/src/data/inference.ts` + private `inference-compendium-pro` repo | **36 units** (`150,033` words), **7 domains + 2 Inserts**, **34 diagrams**, **178 sources**, **116 glossary terms** | Core syllabus for **Packs A, B, C** |
| **wAIbi-sabi Applied-AI Articles** | `site/src/content/blog/` (5 tracks in `site/src/data/tracks.ts`) | **132 markdown articles** (`Technical`, `Business`, `Basics`, `Case Studies`, `Talks`) | Supporting case evidence & real-world failure modes in **Packs A, B, C** |
| **B-School Interview News Archive** | `site/src/data/news.json` → `node site/scripts/generate-news-dossier.mjs` | **708 entries** (`Consulting`: 132, `Finance`: 152, `Marketing`: 143, `Operations`: 141, `Product Management`: 140; `2025-10-18` to `2026-11-28`, `53,000` words) | Primary input for **Pack D** + domain timeliness hooks |

### 0.2 NotebookLM Source Hygiene Rules (Prevent Hallucinations & Drift)

1. **One Notebook Per Domain (+ One GDPI Dossier Notebook):** Create **8 dedicated notebooks** (`INF-01-Foundations`, `INF-02-Consulting`, `INF-03-Finance`, `INF-04-Marketing`, `INF-05-Product`, `INF-06-Operations`, `INF-07-HR`, `INF-08-GDPI-708-Dossier`). Never dump all 150k words + 132 blog posts + 708 news items into one noisy notebook when generating domain-specific decks.
2. **Concatenate Blog Posts by Track Before Uploading:** NotebookLM caps standard notebooks at 50 sources (up to 500k words/source). Merge relevant `site/src/content/blog/*.md` posts into 1 Markdown bundle per track (`blog-case-studies.md`, `blog-business.md`, `blog-technical.md`) so you never hit source-count limits.
3. **Mandatory Grounding & Voice Guardrail:** Every prompt below enforces **wAIbi-sabi's editorial rules**:
   - **Zero invented numbers:** Cite only figures, unit economics, circulars, and case outcomes present in the uploaded sources. Flag missing data as `[NEEDS SOURCE CHECK]`.
   - **Dry, practitioner register:** Zero exclamation marks, zero "AI revolution" filler, zero generic prompt lists. Mechanism → Margin Math → Failure Mode → Interview Rubric.
   - **Visual token alignment:** When generating SVG/diagram specs, restrict colors to the wAIbi-sabi palette: Warm Paper (`#F4F1EA`), Dark Ceramic (`#15181D`), Ink (`#1C1917`), Mizu (`#3A7CA5`), Hanko (`#B83B2B`), Ochre (`#C47D1A`), Moss (`#4A7C59`), Plum (`#7A4E7A`), Indigo (`#3F51B5`).

---

## 1. Pack A — 7 Domain Executive Slide Decks

**Target SKU Integration:** Bundled inside `domain-track` (`₹499` / `$19`), `full-edition` (`₹1,999` / `$49`), `placement-accelerator` (`₹3,499` / `$79`), and `campus-bulk` (`₹45,000`).  
**Deliverable Format:** 12-to-15 slide widescreen (`16:9`) executive PDF deck per domain (7 decks total).

### 1.1 Master Slide-by-Slide NotebookLM Prompt (Copy-Paste & Swap Domain Variables)

Paste this into NotebookLM **Studio / Chat** inside the target domain notebook, replacing `[DOMAIN_NAME]`, `[CHAPTER_RANGE]`, and `[DOMAIN_ANCHORS]` from the table in §1.2:

```text
ROLE & OBJECTIVE:
You are an executive curriculum designer building a 14-slide, publication-grade reference deck for [DOMAIN_NAME] from the uploaded INFERENCE 2027 sources ([CHAPTER_RANGE]) and supporting wAIbi-sabi case studies.

STRICT GROUNDING RULES:
- Use ONLY numbers, frameworks, regulations, case studies, and glossary terms present in the uploaded sources.
- Cite the exact unit (e.g., "Ch 09", "Insert B") or blog case study on every slide footer.
- Tone: dry, analytical, boardroom-ready. Zero exclamation marks, zero hype adjectives.
- Keep each slide under 85 words so it stays scannable in a 16:9 layout.

OUTPUT FORMAT (EXACT 14-SLIDE BLUEPRINT):
For each slide, output: (1) Slide Title (<= 60 chars, insight-led headline, not a topic label), (2) Layout Type (Split-Stat / 2x2 Matrix / Mechanism Flow / Case Table / Rubric Grid), (3) Exact Slide Copy (max 4 bullets or 1 compact table), (4) Visual Diagram Spec (what chart/diagram sits on the right or center), and (5) Speaker Note (45-second verbal walkthrough for a consultant/MBA).

SLIDE SEQUENCE:
- Slide 1 (Cover): [DOMAIN_NAME] Applied-AI Playbook (INFERENCE 2027) + core thesis + source count.
- Slide 2 (Executive Summary): 3 quantitative truths about [DOMAIN_NAME] AI ROI from the sources.
- Slide 3 (Architecture & Tool Fit): Predictive ML vs. Generative LLM vs. Agentic workflow decision table for [DOMAIN_NAME].
- Slide 4 (Unit Economics): Cost drivers, latency/compute or margin math, and break-even threshold.
- Slide 5 (Where Pilots Stall): Top 3 deployment failure modes in [DOMAIN_NAME] from our case evidence.
- Slide 6 (Governance & Regulatory Boundary): Exact compliance rules, liability traps, and audit gates ([DOMAIN_ANCHORS]).
- Slide 7–8 (Deep-Dive Core Mechanics): Two core domain mechanisms & formulas from [CHAPTER_RANGE].
- Slide 9–10 (Worked Enterprise Cases): 2 named or modeled domain cases (Problem → Mechanism → Quantified Trade-off → Decision).
- Slide 11 (Guesstimate / Sizing Template): Step-by-step estimation tree & sanity bounds for [DOMAIN_NAME].
- Slide 12 (Interview Room Traps): 3 high-frequency panel questions + what separates a weak answer from a top-decile answer.
- Slide 13 (10-Term Domain Glossary): Crisp 1-line definitions from the 116-term INFERENCE glossary.
- Slide 14 (Pre-Meeting / Pre-Interview Audit Checklist): 5 non-negotiable questions to ask before approving an AI deployment.
```

### 1.2 Domain-Specific Anchor Variables (Plug into `[DOMAIN_NAME]`, `[CHAPTER_RANGE]`, `[DOMAIN_ANCHORS]`)

| # | `[DOMAIN_NAME]` | `[CHAPTER_RANGE]` | `[DOMAIN_ANCHORS]` (Must Appear in Deck) | Accent Color Token |
|---|---|---|---|---|
| **1** | **Consulting & Strategy** | Ch 08–13 (`who-pays`, `pilots-stall`, `work-changes`, `consulting-firm`, `ai-casebook`, `interview-room`) | Compute/data-centre capex stack, 95% pilot stall gap (workflow redesign vs tools), jagged frontier, outcome-based fees vs pyramid leverage, India Claude.ai volume vs per-capita split | `Hanko` (`#B83B2B`) |
| **2** | **Finance & Banking** | Ch 22–25 (`algorithmic-underwriting-and-credit-risk`, `financial-copilots-and-deal-diligence`, `financial-crime-fraud-and-rbi-free-ai`, `finance-casebook`) | 50 bps credit default reduction math, Basel III/IV & IFRS 9 ECL, SHAP/LIME explainability, VDR spreading + deterministic sandboxes, UPI mule detection, base rate fallacy in AML alerts, RBI FREE-AI & SEBI/DPDP | `Ochre` (`#C47D1A`) |
| **3** | **Marketing & Brand** | Ch 14–17 (`creative-at-scale`, `synthetic-audiences-and-attribution`, `brand-safety-boundary`, `marketing-casebook`) | 22 Indic languages creative localization, digital asset marginal cost collapse & agency retainers, LLM focus groups & algorithmic homophily, Bayesian MMM (Meridian & Robyn), ASCI guidelines & trademark/deepfake risk | `Mizu` (`#3A7CA5`) |
| **4** | **Product Management** | Ch 18–21 (`ai-product-lifecycle`, `product-architecture-economics`, `agentic-ux-and-interfaces`, `product-casebook`) | Golden eval harnesses as living PRDs, LLM-as-a-judge calibration, model drift, TTFT & TPS latency budgets, prompt caching economics, cascade routing, build-vs-buy TCO, ambient HUDs vs chat bubbles | `Plum` (`#7A4E7A`) |
| **5** | **Operations & Supply Chain** | Ch 26–29 (`predictive-maintenance-and-industrial-ai`, `supply-chain-planning-and-autonomous-replenishment`, `warehouse-automation-and-physical-ai`, `operations-casebook`) | Weibull hazard rate & RUL estimation, OEE optimization, hierarchical time-series & bullwhip dampening, MEIO safety stock vs SAP/ERP batch, PM GatiShakti, AOI computer vision, AMRs/SLAM, Blinkit/Zepto dark-store ergonomics | `Moss` (`#4A7C59`) |
| **6** | **HR & People** | Ch 30–33 (`ai-in-hiring`, `workforce-planning-and-skills`, `hr-copilots-and-people-analytics`, `hr-casebook`) | Four-fifths adverse impact rule, NYC Local Law 144 bias audits, EU AI Act high-risk employment & DPDP consent, O*NET/ESCO task exposure (50% time reduction threshold), build-buy-borrow-bot, deflection rate vs surveillance line | `Indigo` (`#3F51B5`) |
| **7** | **Foundations + Quarterly Inserts** | Ch 00–07 + Insert A (`state-of-play`) + Insert B (`india-briefing`) | Predictive vs generative split, tokenization cost asymmetry (Hindi vs English), pretraining/RLHF hallucination mechanics, delegation brief checklist, RAG vs long-context privacy, `0.95^12 = 54%` agent reliability math, prompt injection, 4-step output audit, DPDP/RBI FREE-AI/IndiaAI | `Mizu` (`#3A7CA5`) + `Ochre` (`#C47D1A`) |

### 1.3 Visual Diagram Prompt (For NotebookLM / Gemini SVG & Slide Charts)

Run this follow-up prompt after Slide 1–14 are generated to create exact diagram specs for Slides 3, 4, 6, and 7:

```text
Take Slides 3, 4, 6, and 7 from the deck above and generate self-contained SVG diagram specifications (1200x675 viewBox) for each.

DESIGN CONSTRAINTS:
- Background: Warm Paper (#F4F1EA) or Dark Ceramic Plate (#15181D) with 1px hairline borders (#D8D2C5 or #2A2F3A).
- Accent Color: [ACCENT_HEX] only for primary nodes/paths; Ink (#1C1917) or Off-white (#EDE9E0) for text.
- Typography: Inter (labels/numbers) and Newsreader (annotations).
- Zero text overlap: enforce minimum 24px padding inside boxes and explicit line-breaks for labels > 22 characters.
- Include exact numeric annotations from our uploaded INFERENCE sources on every arrow or box.
```

---

## 2. Pack B — "Night-Before-Placement" Audio Overview Series

**Target SKU Integration:** Primary differentiator inside `placement-accelerator` (`₹3,499` / `$79`) and `campus-200` (`₹1,40,000`) — *"Audio briefings across all 36 units for commute revision"*.  
**Format:** Seven 10-minute high-signal MP3 episodes (`128 kbps` mono/stereo), one per domain (`01-Foundations-and-Inserts.mp3` through `07-HR-and-People.mp3`).

### 2.1 NotebookLM Audio Overview "Customize" Prompt (Per-Domain)

In NotebookLM → **Studio → Audio Overview → Customize**, paste this exact customization prompt (under NotebookLM's character budget, ~800–1,000 chars):

```text
Target a 10-minute, high-signal "Night-Before-Placement" interview prep briefing for [DOMAIN_NAME] ([CHAPTER_RANGE]) aimed at MBA candidates and working practitioners.

Structure strictly into 4 segments:
1. (0:00–1:30) Core Thesis & 3 Hard Numbers: Why generic AI fails in [DOMAIN_NAME] and the key unit economics from our sources.
2. (1:30–6:00) 3 Interview Trap Questions: Walk through 3 realistic panel questions from the casebook—state the naive trap candidates fall into, then give the exact structured pivot (mechanism, financial trade-off, and governance check).
3. (6:00–8:30) 2 Production Failure Modes: Real breakdown examples from our sources (e.g., [DOMAIN_ANCHORS]) and how to audit them.
4. (8:30–10:00) Rapid-Fire Formula & Glossary Recap: 5 must-know terms and one 15-second closing rule.

Tone: calm, sharp, analytical—like a senior consultant debriefing a candidate in a cab before the final round. Zero hype, zero filler banter, cite only source-backed facts.
```

### 2.2 Domain-Specific Audio Focus Overrides

Append one of these 1-line focus tags to the bottom of the Customize box for each episode:
- **Ep 1 — Foundations & Inserts:** `Emphasize: predictive vs generative choice, 0.95^12=54% multi-step agent compounding failure, Hindi 3x token cost, and Insert B DPDP/RBI FREE-AI rules.`
- **Ep 2 — Consulting & Strategy:** `Emphasize: why 95% of pilots stall on workflow redesign, Bain/capex ROI math, jagged frontier risk, and outcome-based fee traps.`
- **Ep 3 — Finance & Banking:** `Emphasize: 50 bps default drop paying for stack, base-rate fallacy in 90%-accurate AML/invoice flags, SHAP vs black-box under RBI FREE-AI, and VDR deterministic sandboxes.`
- **Ep 4 — Marketing & Brand:** `Emphasize: 22-language localization economics, algorithmic homophily trap in synthetic focus groups, Bayesian MMM (Meridian/Robyn), and ASCI compliance.`
- **Ep 5 — Product Management:** `Emphasize: golden evals replacing static PRDs, TTFT vs TPS latency budgets, prompt caching & cascade routing unit economics, and ambient HUD UX.`
- **Ep 6 — Operations & Supply Chain:** `Emphasize: Weibull RUL maintenance vs reactive downtime, bullwhip dampening & MEIO safety stock, AOI computer vision gates, and dark-store Rs 98-100 delivery economics.`
- **Ep 7 — HR & People:** `Emphasize: four-fifths adverse impact rule, NYC Local Law 144 bias audits, task-level exposure (50% threshold) vs headcount cuts, and copilot deflection vs surveillance.`

### 2.3 Two-Host Script Prompt (Fallback for Custom Studio TTS / Gemini Audio)

If you want deterministic control over exact pronunciations (`INFERENCE`, `wAIbi-sabi`, `RBI FREE-AI`, `₹ crore`, `bps`), run this in Gemini Notebook first to generate a verbatim script, then record or synthesize:

```text
Write a 1,500-word (~10-minute at 150 wpm) two-speaker audio briefing script (HOST A: Analytical Moderator; HOST B: Senior Practitioner) covering [DOMAIN_NAME] ([CHAPTER_RANGE]) strictly from the uploaded sources.
Include [TIMESTAMPS] at 0:00, 1:30, 6:00, and 8:30. Spell out symbols for speech ("50 basis points", "rupees 5,000 crore", "zero point nine five to the power of twelve equals fifty-four percent"). Include zero greetings longer than 10 seconds and zero exclamation marks.
```

---

## 3. Pack C — Visual Concept Maps, One-Pagers & Ad Carousels

**Target SKU Integration:**
- **Lead Magnet (Tier 0, `₹0` email capture):** *"2027 AI Executive & Interview Cheat Sheet (PDF)"*
- **Paid Companion (`full-edition` & `placement-accelerator`):** Visual Concept Maps + 7 Domain One-Pagers
- **Paid Acquisition (`INFERENCE-PRODUCT-AND-FUNNEL-BLUEPRINT.md` §4.5):** LinkedIn & Meta 6-slide Document Carousels

### 3.1 Tier 0 Lead Magnet Prompt — "2027 AI Executive & Interview Cheat Sheet"

Run inside **`INF-01-Foundations`** (with `ai-in-one-sitting.md`, `kinds-of-ai.md`, `state-of-play.md`, `india-briefing.md`, `ai-casebook-preview.md` uploaded):

```text
Create a dense, printable 2-page A4 Reference Sheet titled "INFERENCE 2027 — AI Executive & Interview Cheat Sheet" using ONLY the uploaded 5 free units and glossary.

PAGE 1 — MECHANICS & ECONOMICS CHEAT SHEET:
1. Decision Matrix (Table): Rule-Based vs. Predictive ML vs. Generative LLM vs. Multi-Step Agent (Best For / Fails At / Cost Driver / Audit Gate).
2. 10 Essential Numbers & Formulas (Table): e.g., token-to-word ratio (~0.75 words/token), Hindi vs English token cost asymmetry, 12-step agent success math (0.95^12 = 54.0%), base-rate trap on rare events.
3. The 4-Step Output Audit Protocol (Prompt → Review → Challenge → Decide) in 4 crisp bullets.

PAGE 2 — INDIA & INTERVIEW ROOM BRIEFING:
1. India Regulatory Triad (Table): DPDP Act | RBI FREE-AI | IndiaAI Mission (Core Mandate / What It Forbids / Interview Question Trigger).
2. 5 Most-Asked Consulting & PM AI Questions (with 2-line model answer skeletons).
3. Footer CTA: "Read the 5 free units at /inference/read/ or explore all 36 units across 7 domains."

Formatting: Clean Markdown tables, <= 950 total words so it fits cleanly on 2 A4 pages in Typst/WeasyPrint.
```

### 3.2 Visual Mind-Map & Concept-Map Prompt (NotebookLM Mind Map + Mermaid Spec)

Use this prompt to generate structured concept maps connecting **Unit → Core Mechanism → Margin Math → Governance Risk → Interview Question**:

```text
Generate a hierarchical Concept Map for [DOMAIN_NAME] from the uploaded INFERENCE units and glossary.

Output TWO formats:
1. A clean **Mermaid `flowchart LR`** diagram (max 18 nodes, node labels quoted `id["Label"]`, <= 4 words per line using natural spacing—NO HTML tags like <br/>). Structure left-to-right: Domain Pillar → Core Units → Technical/Economic Lever → Failure Mode → Interview Metric.
2. A **Structured Concept Matrix (Markdown Table)** with 5 columns: `Unit` | `Core Mechanism` | `Economic / Margin Lever` | `Primary Failure Mode` | `Signature Interview Question`.

Restrict every node and cell strictly to facts in the uploaded sources.
```

### 3.3 LinkedIn & Meta 6-Slide Ad Creative Carousel Prompt

Aligned directly with `INFERENCE-PRODUCT-AND-FUNNEL-BLUEPRINT.md` §4.5 (Angle 1 India MBA & Angle 2 Consulting Carousels):

```text
Generate copy for a 6-slide square (1080x1080) LinkedIn PDF Carousel / Instagram Carousel promoting INFERENCE 2027 ([DOMAIN_NAME] or Full Edition), strictly following wAIbi-sabi's anti-hype editorial voice.

HARD CHARACTER BUDGETS (must fit large 48pt Inter headings cleanly):
- Slide 1 (Hook Cover): Eyebrow (<= 30 chars) + Headline (<= 55 chars, concrete problem or stat, zero clickbait like "This changes everything") + Subhead (<= 80 chars).
- Slides 2–4 (Three High-Density Insights from uploaded sources): Slide Title (<= 45 chars) + 1 Concrete Mechanism or Formula (<= 160 chars) + 1 Real Interview Trap or Margin Consequence (<= 120 chars).
- Slide 5 (Visual Proof / Comparison Table): Contrast "Generic AI Prep" (3 short flaws) vs. "INFERENCE 2027" (3 verifiable specs: 150,033 words, 34 diagrams, 178 primary sources).
- Slide 6 (CTA): Clear next step ("Read 5 units free at wAIbi-sabi — no signup needed for web reader" or "Get the [DOMAIN_NAME] Track — ₹499 / $19").

Visual Direction Note per Slide: Specify Dark Ceramic (#15181D) with Ochre/Hanko accent for Slide 1 & 6, and Warm Paper (#F4F1EA) with clean hairline borders for Slides 2–5.
```

---

## 4. Pack D — B-School GDPI 708-Story Dossier Companion

**Target SKU:** Standalone **B-School 708-Story GDPI Dossier** (`₹999` INR / `$25` USD) + bonus upsell inside `placement-accelerator`.  
**Source Pipeline:** `site/src/data/news.json` (708 entries across 5 domains, `2025-10-18` to `2026-11-28`) → `site/scripts/generate-news-dossier.mjs`.

### 4.1 Step-by-Step Generation & NotebookLM Ingestion Workflow

1. **Preview counts without writing files:**
   ```powershell
   node site/scripts/generate-news-dossier.mjs --dry-run
   ```
   *(Confirmed output: 708 stories — Consulting: 132 [10,267 words], Finance: 152 [11,333 words], Marketing: 143 [10,588 words], Operations: 141 [10,403 words], Product Management: 140 [10,409 words], plus 265 stories in the Last-90-Days Digest.)*
2. **Generate the clean Markdown dossiers into `site/dist-dossiers/`:**
   ```powershell
   node site/scripts/generate-news-dossier.mjs
   ```
   This emits 7 clean files inside `site/dist-dossiers/` (without touching `site/src/content/blog/`):
   - `INDEX.md` (manifest & recency matrix)
   - `00-latest-90-days-digest.md` (265 stories across all 5 domains)
   - `01-consulting-dossier.md` (132 stories)
   - `02-finance-dossier.md` (152 stories)
   - `03-marketing-dossier.md` (143 stories)
   - `04-operations-dossier.md` (141 stories)
   - `05-product-management-dossier.md` (140 stories)
3. **Upload to NotebookLM (`INF-08-GDPI-708-Dossier`):**
   - Upload `01` through `05` domain dossiers + `00-latest-90-days-digest.md` (6 sources total, ~53,000 corpus words—well inside NotebookLM's single-notebook window for 100% lossless cross-referencing).

### 4.2 Prompt D1 — Sector-by-Sector GDPI Placement Prep Deck (20 Slides)

```text
You are preparing a 20-slide Sector-by-Sector GDPI Placement Prep Deck for IIM / XLRI / ISB / SPJIMR candidates using the 5 uploaded domain dossiers (708 stories total, anchored at 2026-11-28).

REQUIREMENTS:
- Ground every claim, company figure, rupee/dollar metric, and policy milestone in the uploaded stories, citing `[YYYY-MM-DD | Domain]` inline.
- Prioritize stories in the "Last 30 Days (0–30d)" and "Recent Quarter (31–90d)" sections when illustrating current panel obsessions, using older stories only for multi-quarter trend confirmation.

DECK STRUCTURE:
- Slides 1–2: Cross-Sector Macro Synthesis (Top 5 forces hitting Indian & global corporates right now across all 5 dossiers).
- Slides 3–5 (Consulting — 132 stories): 3 dominant consulting themes (e.g., AI capex/revenue gap, Big Four regional delivery hubs, change-management clarity gap) + 3 panel questions + model 60-second frameworks.
- Slides 6–8 (Finance — 152 stories): RBI/SEBI regulatory shifts, FII rotation & crude/macro links, bank/fintech unit economics + 3 panel questions + model answers.
- Slides 9–11 (Marketing — 143 stories): Non-metro/D2C/quick-commerce shifts, men's grooming/category expansion, rebrand reversals & CAC/margin math + 3 panel questions.
- Slides 12–14 (Operations — 141 stories): Quick-commerce dark-store overcapacity, Section 301 tariff China+1 rebalancing, ocean freight congestion & reliability math + 3 panel questions.
- Slides 15–17 (Product Management — 140 stories): Agentic ops outcome pricing, AI coding-review bottlenecks, compute/distillation curbs & routing + 3 panel questions.
- Slides 18–20: 15 Cross-Functional Rapid-Fire GD Topics (3 per domain) with balanced Pro / Con / India Context talking points.
```

### 4.3 Prompt D2 — "Last 30 Days Hot Topics" 1-Page Rapid-Fire Sheet

Run against `00-latest-90-days-digest.md` (selecting only the `0–30d` stories, 23 per domain = 115 stories):

```text
Extract a crisp, 1-page printable "Last 30 Days GDPI Rapid-Fire Sheet" from the most recent 30 days of stories across all 5 domains in the uploaded digest.

Output exactly 5 compact domain blocks (5 bullets per domain = 25 high-probability interview hooks).
Format each bullet strictly as:
- **[Date | Company/Regulator]:** [1-sentence hard fact with exact number] → **Panel Question:** [1-sentence "Why / How" prompt] → **Key Lever:** [6-10 word analytical pivot].

Zero fluff, zero introductory paragraphs, strictly <= 750 words total.
```

### 4.4 Prompt D3 — Interactive Mock GDPI Panelist (Buyer Companion Prompt)

Include this copy-pasteable prompt inside the Pack D PDF appendix so buyers can also use their copy interactively inside Gemini / NotebookLM:

```text
Act as a sharp IIM / XLRI / MBB interview panelist. Pick ONE story from the uploaded domain dossier I specify ([Consulting / Finance / Marketing / Operations / Product Management]).

1. Ask me the exact "GDPI & Interview Panel Angle" question in your own words, adding one realistic quantitative constraint or follow-up curveball.
2. Wait for my answer.
3. Grade my response strictly on 4 criteria (0–5 each): (a) Structure / MECE framing, (b) Unit-economics / quantitative rigor, (c) Trade-off & second-order risk awareness, and (d) Alignment with the primary facts in the story.
4. Show me a 90-second model answer using the numbers from the dossier, then move to the next story.
```

---

## 5. Production Batch Checklist (Turning Assets Into Live SKUs)

- [ ] **Step 1 — Generate News Dossiers:** Run `node site/scripts/generate-news-dossier.mjs` and inspect `site/dist-dossiers/INDEX.md`.
- [ ] **Step 2 — Build 8 Notebooks:** Create `INF-01` through `INF-08` in NotebookLM / Gemini Notebook and upload clean Markdown sources.
- [ ] **Step 3 — Export Pack A (7 Slide Decks):** Run §1.1 + §1.3 per domain → typeset/export clean 16:9 PDFs → upload to private R2 `inference-vault/companions/slide-decks/`.
- [ ] **Step 4 — Export Pack B (7 Audio Briefings):** Run §2.1 per domain → download WAV/MP3 → normalize loudness (`-16 LUFS`), export `128 kbps` MP3s with clean ID3 metadata → upload to R2 `inference-vault/companions/audio-overview/`.
- [ ] **Step 5 — Export Pack C (Lead Magnet + Ads):** Compile the 2-page Tier 0 Cheat Sheet PDF (§3.1) into `inference-vault/lead-magnets/inference-2027-cheat-sheet.pdf` and design the 6-slide Meta/LinkedIn carousels (§3.3).
- [ ] **Step 6 — Export Pack D (GDPI 708-Story Companion):** Run §4.2 + §4.3 → compile `bschool-708-gdpi-dossier-2027.pdf` (Front matter + Pack D 20-slide sector deck + 5 recency-ordered domain appendices) → upload to R2 `masters/bschool-708-gdpi-dossier-2027.pdf`.
