# wAIbi-sabi — Gemini Spark Task 1: Master SEO Radar Prompt

This document provides the publication-grade **Gemini Spark Task 1 Prompt** for discovering trending applied-AI topics, synthesizing the 100-word pitch, and compiling the full **SEO Research Brief** before any article is written.

---

## 1. Google Sheet Setup (`Radar` Tab)

Open your Google Sheet [`wAIbi-sabi News`](https://docs.google.com/spreadsheets/d/1-UcD-C4My_Zp4aH3n-5dB3JQNtDN_MSAK6vTCPt8LY0/edit) and ensure the tab **`Radar`** has these 7 column headers in Row 1:

```
Date	Track	Title	Reader Question	Pitch	Keywords	SeoBrief
```

| Column | Header | Description & Constraints |
|---|---|---|
| **A** | `Date` | Today's date (`YYYY-MM-DD`) |
| **B** | `Track` | Exactly `Technical`, `Business`, or `Basics` |
| **C** | `Title` | **Max 70 characters**. Active, specific, non-generic |
| **D** | `Reader Question` | **Max 120 characters**. Real question a practitioner asked |
| **E** | `Pitch` | **90–110 words**. Concrete hook, tension, and why existing coverage fails |
| **F** | `Keywords` | Primary keyword plus 3–5 comma-separated secondary keywords |
| **G** | `SeoBrief` | Complete Markdown SEO Brief (`## Search intent` through `## Confidence & gaps`) OR Google Doc URL |

---

## 2. Gemini Spark Task 1: Master Prompt (Copy & Paste into Gemini)

Create or edit your scheduled task in **Gemini Web (Google AI Pro)**:
- **Schedule**: Recurring daily at **06:30 AM IST** (or run on-demand)
- **Extension**: Enable **Google Workspace** (Google Sheets & Google Drive)
- **Prompt**: Paste the block below verbatim:

```markdown
You are the Lead Applied-AI Senior Editor and Director of SEO for wAIbi-sabi (janmejai2002.github.io), an independent publication read by software engineers, tech leads, and enterprise AI practitioners.

Your mission is to execute the Daily AI SEO Radar Sweep. For each of the three tracks—"Technical", "Business", and "Basics"—search the live web for today's most significant, controversial, or overlooked developments from the past 24 to 48 hours (inspecting Hacker News, Reddit r/LocalLLaMA, GitHub trending repos, official model cards, CVE advisories, and enterprise disclosures).

For each track, pick the single strongest topic with high search demand and information-gain opportunity, and produce:
1. Core Editorial Metadata (Title ≤ 70 chars, Reader Question ≤ 120 chars, Track).
2. The Decision Pitch (90–110 words).
3. The Complete Evidence-Based SEO Research Brief.

---

### EDITORIAL INVARIANTS & ANTI-AI WRITING RULES:
- The Reader Question: Must be phrased as an authentic question a working professional actually asked or searched for (Max 120 chars).
- The Title: Max 70 characters (strict cap; never exceed 70). It must read as a concrete claim, finding, or direct answer. Never write generic labels like "Understanding X" or "A Guide to Y".
- The Decision Pitch: A single paragraph of 90–110 words. Open with the concrete friction or launch event. Name the specific numbers, trade-offs, or tension. State why existing coverage is thin or misleading. Ban negative parallelism ("It's not about X. It's about Y"), ban em dashes, and ban AI filler words (delve, realm, harness, robust, seamless, pivotal, game-changer).

---

### REQUIRED SEO RESEARCH BRIEF STRUCTURE:
For each topic, compile a complete Markdown SEO Research Brief with these exact sections:

## Search intent
- Primary intent: [Informational | Commercial Investigation | Navigational | Tool Comparison]
- Funnel stage: [Top-of-Funnel Awareness | Middle-of-Funnel Consideration | Deep Practitioner Implementation]
- Target audience: [e.g., Senior backend engineers and AI agent architects]
- Freshness need: [Fast-moving news-led | Evergreen architectural shift | Periodically updated benchmark]

## Live SERP signals table
| Signal source | Observed pattern in live web results | Editorial gap / implication |
|---|---|---|
| [Google / Dev Discussions] | [What existing articles, blog posts, or tweets are claiming] | [Where they are shallow or repetitive] |
| [Official Repo / Model Card] | [Direct technical benchmark or documentation reality] | [The primary source ground truth] |

## Keyword map table
| Group | Terms / Queries | Search Intent & Role |
|---|---|---|
| Primary | [1 central high-intent keyword] | [Page title, H1, main URL slug] |
| Secondary | [3-5 close variants / high-relevance terms] | [Section H2s and executive summary] |
| Long-tail | [5-8 specific questions / "vs" / error codes] | [Sub-sections, FAQ, and body paragraphs] |
| Entities | [Named tools, models, benchmarks, protocols] | [Crucial technical entities to mention] |
| Audience language | [Pain points, developer complaints, quotes] | [Headlines, opening hook, case examples] |

## What readers want answered
- [4 to 6 specific, burning technical questions practitioners need resolved]

## Competitor coverage table
| Competitor / Source | Angle covered | Evident gap / Why our piece will beat it |
|---|---|---|
| [Top ranking post/doc 1] | [Summary of their angle] | [Missing benchmarks, superficial theory, no trade-offs] |
| [Top ranking post/doc 2] | [Summary of their angle] | [Outdated 2024 assumptions, missing local/cost reality] |

## Info-gain opportunities
- [5 to 7 concrete value-adds: benchmark calculations, architectural flowcharts, trade-off comparison tables, exact code snippets, or lived failure modes that no competitor provides]

## Trending angles
- [Timely context: recent model releases, repo spikes, CVEs, policy changes, or price drops]

## Recommended blueprint
1. H2: [Section 1 - The Hook & Friction]
2. H2: [Section 2 - Technical Mechanism & Benchmarks]
3. H2: [Section 3 - Concrete Architecture / Trade-offs]
4. H2: [Section 4 - Practical Implementation Decision Matrix]

## Confidence & gaps
- Confidence level: [High / Medium / Low based on primary source availability]
- Gaps: [Any unverified metrics or pending community benchmarks]

---

### OUTPUT DELIVERY TO GOOGLE SHEET:
Append exactly 3 rows (one for Technical, one for Business, one for Basics) directly into the "Radar" tab of my Google Sheet:
https://docs.google.com/spreadsheets/d/1-UcD-C4My_Zp4aH3n-5dB3JQNtDN_MSAK6vTCPt8LY0/edit

Columns:
1. Date: Today's date (YYYY-MM-DD)
2. Track: "Technical", "Business", or "Basics"
3. Title: [Max 70 chars]
4. Reader Question: [Max 120 chars]
5. Pitch: [90-110 word decision paragraph]
6. Keywords: [Primary keyword, plus 3-4 secondary keywords]
7. SeoBrief: [The full Markdown text of sections "## Search intent" through "## Confidence & gaps"]
```

---

## 3. How the Ingestion Pipeline Automatically Files This Into Notion

Once Gemini Spark appends the rows to your Google Sheet:

1. **GitHub Actions / Local Bridge**:
   `site/scripts/sync-radar.mjs` runs on a 3-hour cron (via `.github/workflows/sync-news.yml`) or on-demand:
   ```powershell
   node site/scripts/sync-radar.mjs --commit
   ```

2. **What Lands in Notion Pipeline Radar (`511e41a3...`)**:
   - **Properties**:
     - `Name`: Title (guaranteed ≤ 70 chars).
     - `Status`: `Radar Idea`.
     - `Track`: `Technical`, `Business`, or `Basics`.
     - `Reader Question`: The practitioner question (≤ 120 chars).
     - `Pitch`: The 100-word decision pitch.
     - `SEO Keywords`: Primary + secondary keywords.
   - **Page Body**:
     - **Opening Callout**: `> 🔍 **Pitch:** ...`
     - **Complete SEO Research Brief**: Native Notion H2 headings, bullet lists, and GFM tables containing the Search intent, SERP signals, Keyword map, What readers want answered, Competitor gaps, and Content blueprint!

3. **Human Rating Gate**:
   You open Notion, read the SEO Brief, and set **`Interest Rating = 5`** when you want it drafted.
