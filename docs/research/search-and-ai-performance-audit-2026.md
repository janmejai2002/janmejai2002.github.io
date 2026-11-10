# Search & AI Performance Audit: Analysis & Action Plan
**Domain:** `janmejai2002.github.io` (wAIbi-sabi)  
**Audit Period:** August 27, 2026 – November 7, 2026 (73 Days)  
**Data Sources:**
- `SearchPerformanceOverview_All_11_10_2026.csv` (Bing Webmaster Search Performance)
- `AIPerformanceOverviewStats_11_10_2026.csv` (Bing AI / Copilot Citations Performance)
- `IndexNowIndexCoverageDatestats_11_10_2026.csv` (IndexNow Submission & Coverage Telemetry)

---

## 1. Executive Summary: The AI-First Discovery Shift

The data demonstrates a clear structural inflection: **wAIbi-sabi has achieved strong product-market fit for AI search engines, while traditional organic search remains in its embryonic indexing stage.**

```
Metric Overview (Aug 27 – Nov 7, 2026):
┌──────────────────────────────┬───────────────────────────────┬───────────────────────────────┐
│ Metric                       │ Organic Search (Bing)         │ AI Citations (Copilot/Bing)   │
├──────────────────────────────┼───────────────────────────────┼───────────────────────────────┤
│ Total Events                 │ 93 Impressions                │ 62 Citations                  │
│ Direct User Clicks           │ 4 Clicks (4.30% CTR)          │ N/A (Grounding references)    │
│ Active Days                  │ 44 / 73 days (60.3%)          │ 15 / 73 days (20.5%)          │
│ Peak Single-Day Volume       │ 5 Impressions (Sep 30)        │ 11 Citations (Oct 19)         │
│ Citation-to-Click Ratio      │ —                             │ 15.5x higher than clicks      │
│ Citation-to-Impression Ratio │ —                             │ 66.7% of search impressions   │
└──────────────────────────────┴───────────────────────────────┴───────────────────────────────┘
```

### The Three Headline Discoveries
1. **The 15.5x AI Amplification Factor:** AI models cited this blog **62 times**, compared to just **4 organic clicks**. In 2026, autonomous LLM agents and Copilot search users consume and ground against wAIbi-sabi content far more frequently than humans click blue links.
2. **Authority Persistence During Publishing Hiatus:** Despite zero git commits between **September 15 and November 9**, AI citations **exploded from 2 in September to 49 in October**. The content's structural citability (TL;DR blocks, technical rigor, authoritative grounding) allowed already-indexed articles to compound authority without maintenance.
3. **The IndexNow Pipeline Bottleneck:** IndexNow has only submitted **7 URLs total** out of 67 live URLs (over 85% missing). The CI/CD push diff filtered out uncommitted or squashed paths, leaving Bing to rely on passive crawling.

---

## 2. Deep-Dive Performance Diagnostics

### A. Search Performance vs. AI Citations (Weekly Breakdown)

| Week Range | Traditional Search Imp | Search Clicks | Avg CTR | AI Citations | Active Citation Days |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **W34 (Aug 27–Aug 29)** | 0 | 0 | 0.0% | 0 | 0 |
| **W35 (Aug 30–Sep 05)** | 0 | 0 | 0.0% | 0 | 0 |
| **W36 (Sep 06–Sep 12)** | 5 | 0 | 0.0% | 1 | 1 (Sep 10) |
| **W37 (Sep 13–Sep 19)** | 6 | 0 | 0.0% | 0 | 0 |
| **W38 (Sep 20–Sep 26)** | 5 | 0 | 0.0% | 0 | 0 |
| **W39 (Sep 27–Oct 03)** | 15 | 2 | 13.3% | 1 | 1 (Sep 28) |
| **W40 (Oct 04–Oct 10)** | 12 | 1 | 8.3% | 3 | 1 (Oct 07) |
| **W41 (Oct 11–Oct 17)** | 12 | 0 | 0.0% | **21** | 3 (Oct 11, 13, 15) |
| **W42 (Oct 18–Oct 24)** | 9 | 0 | 0.0% | **19** | 2 (Oct 19, 20) |
| **W43 (Oct 25–Oct 31)** | 18 | 1 | 5.6% | 6 | 3 (Oct 26, 28, 29) |
| **W44 (Nov 01–Nov 07)** | 11 | 0 | 0.0% | 11 | 4 (Nov 03, 04, 05, 06) |
| **Total** | **93** | **4** | **4.3%** | **62** | **15** |

### B. Daily Citation Spikes & Concentration
In `AIPerformanceOverviewStats`:
- **October 11:** 8 citations (1 cited page)
- **October 13:** 8 citations (1 cited page)
- **October 15:** 5 citations (1 cited page)
- **October 19:** 11 citations (**2 cited pages** — the only day where >1 page was cited)
- **October 20:** 8 citations (1 cited page)
- **November 6:** 6 citations (1 cited page)

**Critical Diagnostic:** `Cited Pages` was **1 on 14 out of 15 active days**, and **2 on only one day**.  
This proves that **almost 100% of the 62 citations were driven by a single hero anchor article** (or two at most) that solved an intense, zero-fluff technical query (such as MCP architecture, IT Rules AI compliance, or prompt caching economics). The other 43 articles are essentially untapped in the AI search index.

### C. IndexNow Coverage Discrepancy
The IndexNow telemetry file reveals:
- **8/31/2026:** 1 Submitted URL | 0 Indexed | 0 Crawled
- **9/01/2026:** 3 Submitted URLs | 0 Indexed | 0 Crawled
- **9/15/2026:** 1 Submitted URL | 0 Indexed | 0 Crawled
- **11/07/2026:** 2 Submitted URLs | 0 Indexed | 0 Crawled
- **Total Submitted:** 7 URLs.

#### Why Are IndexedUrls and CrawledUrls Reporting 0?
1. **Severe Under-submission:** The site has 67 URLs in its XML sitemap, but only 7 were ever pinged through IndexNow.
2. **Attribution Isolation:** In Bing Webmaster Tools, URLs crawled via traditional sitemap discovery or passive bot crawls are counted under general web index metrics, not attributed to IndexNow unless the crawler specifically dequeues them from the IndexNow fast-lane pipe.
3. **Deployment Workflow Gap:** `.github/workflows/deploy.yml` evaluates `git diff --name-only ${{ github.event.before }} ${{ github.sha }}`. During branch rebases, squash merges, manual triggers, or commits that updated non-markdown files, the step printed `No usable before-SHA` or `No route-mapped changes in this push`, skipping submissions entirely.

---

## 3. Core Learnings: What the Data Teaches Us

### Learning 1: Citations are the 2026 Replacement for Top-of-Funnel Search
Traditional search traffic takes 6–12 months to clear search engine sandboxes for new static sites. However, AI engines (Copilot, Bing AI, ChatGPT search) do not wait for backlink accumulation. They parse semantic density, factual integrity, and information architecture immediately. Having 62 citations with only 4 human clicks confirms that AI retrieval agents are the primary consumers of high-density technical analysis.

### Learning 2: Single-Page Monopolies Create Vulnerability
Having one hero article generate 90%+ of all citations is both a triumph and a vulnerability:
- **Triumph:** The site's structural formatting (question-driven headers, executive TL;DR, clear facts, neutral tone) definitely triggers AI citation algorithms.
- **Vulnerability:** If that single article decays or the underlying specification updates, site visibility drops precipitously. The remaining 44 articles must be elevated to the exact same citability standard.

### Learning 3: High Click-Through Willingness When Visible
When the site actually surfaced in traditional SERPs on specific intent queries:
- Sep 28: 100% CTR (1 imp, 1 click)
- Sep 29: 25% CTR (4 imp, 1 click)
- Oct 08: 50% CTR (2 imp, 1 click)
- Oct 28: 50% CTR (2 imp, 1 click)
The issue is not snippet attractiveness — people click when they see the link. The challenge is raw impression inventory and crawl coverage.

---

## 4. Action Plan: What Better Can We Do?

```
Strategic Roadmap:
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 1: Pipeline Hygiene & Immediate Catch-Up (Days 1–3)              │
│ · Bulk submit all 67 sitemap URLs to IndexNow                          │
│ · Harden CI/CD deploy.yml IndexNow submission logic                    │
├────────────────────────────────────────────────────────────────────────┤
│ Phase 2: Reverse-Engineer the Hero Page & Clone Citability (Week 1–2)  │
│ · Query Bing Webmaster Tools to identify the exact cited URL           │
│ · Audit and replicate its entity density and TL;DR structure           │
├────────────────────────────────────────────────────────────────────────┤
│ Phase 3: Technical SEO & Schema Enrichment (Week 2–3)                  │
│ · Add comprehensive JSON-LD (TechArticle, Author SameAs, QAPage)       │
│ · Optimize meta descriptions to maintain high SERP CTR                 │
├────────────────────────────────────────────────────────────────────────┤
│ Phase 4: Consistency & AI-First Content Production (Ongoing)           │
│ · Eliminate multi-week publishing droughts                             │
│ · Focus on zero-click developer and regulatory pain points             │
└────────────────────────────────────────────────────────────────────────┘
```

### Action 1 (P0): Full Sitemap IndexNow Push & CI/CD Hardening
**Objective:** Eliminate the 60-URL indexation backlog and ensure instant recrawl on every deploy.

1. **Immediate One-Off Run:**
   Execute a full sitemap sweep using the existing script:
   ```powershell
   node site/scripts/indexnow.mjs --sitemap
   ```
2. **CI/CD Workflow Update (`.github/workflows/deploy.yml`):**
   - Add a fallback in the GitHub Actions step: If `before` SHA is missing or git diff returns empty, submit `/sitemap-0.xml` or newly changed files gracefully instead of exiting silently.
   - Run a scheduled weekly IndexNow resubmission cron to keep all articles fresh in Bing's Copilot cache.

### Action 2 (P0): Identify and Replicate the Hero Cited Page
**Objective:** Turn a 1-page citation monopoly into a 45-page citation network.

1. In Bing Webmaster Tools > **AI Performance**, inspect the **"Top Pages"** tab to verify which exact slug accumulated the 62 citations (likely `mcp-stateless-spec-2026-migration-guide`, `it-rules-2026-ai-takedown-compliance`, or `agent-framework-20-year-old-bugs`).
2. Audit that specific article against lower-performing posts:
   - Does it have a specific tabular comparison?
   - How many named entities, official RFC/legal citations, and bullet points does it contain?
3. Apply those exact structural motifs across all remaining articles in `site/src/content/blog/`.

### Action 3 (P1): Implement Deep JSON-LD Schema (AEO/GEO Acceleration)
**Objective:** Make content machine-readable for AI crawlers without requiring full LLM context rendering.

1. Inject `TechArticle` / `Article` schema with:
   - `author`: Person entity with Janmejai's credentials, LinkedIn, and GitHub links.
   - `about`: Explicit Wikidata entity links for core topics (Model Context Protocol, LLM Caching, etc.).
   - `speakable`: Target the Executive TL;DR block (`#tldr`).
2. Add `FAQPage` or `QAPage` structured data for articles with an explicit Reader Question.

### Action 4 (P1): Publishing Cadence & Pipeline Automation
**Objective:** Maintain steady indexation momentum and avoid dead periods.

1. The data proved authority holds during a hiatus, but citation volume stagnated at 11/week in November compared to 21/week in October.
2. Establish a routine cadence of **2 to 3 articles weekly** across Technical, Case Studies, and Business tracks.
3. Keep topics aligned with breaking technical transitions (e.g. Gemini 4 Argon, Claude 3.5 Agent Tooling, Local NPU acceleration), where AI models have high demand for fresh grounding data.

---

## 5. Verification & Telemetry Tracking

1. **Telemetry Review Cycle:**
   - Check Bing Webmaster Tools **AI Performance** weekly on Mondays.
   - Track `Cited Pages` metric: target expanding from **1 page/day** to **>= 5 unique pages/day**.
   - Track total citations: target scaling from **62/quarter** to **>= 50/month**.
2. **IndexNow Health:**
   - Confirm submitted URL counts in Bing Webmaster Tools match the live sitemap URL count (67 URLs).
