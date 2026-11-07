# wAIbi-sabi Article Writing Engine — Architecture, Quality Verification & Gemini Spark Migration

**Date**: 2026-11-07  
**Workspace**: `C:\Users\Janmejai\janmejai2002.github.io`  
**Control Plane**: Notion (`511e41a3-c1cd-47e0-8fa2-d319feef0ced` Radar, `d39ea073-cc87-4c25-8a3c-d9f276a59b68` Production)  
**Cloud Engine**: Google AI Pro / Gemini Spark + GitHub Actions + Astro 5 SSG  

---

## 1. How the Older Article Writing Routine Was Set Up

The wAIbi-sabi article pipeline was designed as an **autonomous, self-healing editorial engine** where content flows through strict quality gates from ideation to edge deployment.

### System Flow Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│ 1. THREE RADAR ROUTINES (Daily Staggered: 07:10, 07:12, 07:16)         │
│    • daily-ai-seo-radar   → Technical Track (mizu)                     │
│    • business-radar       → Business Track (ochre)                     │
│    • basics-radar         → Basics Track (plum)                        │
│    Discovers trending queries, writes 100-word pitch, files:           │
│    `Status = Radar Idea`, `Reader Question` (≤ 120 chars)              │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 2. NOTION PIPELINE RADAR DATABASE (`511e41a3...`)                      │
│    • Human Approval Gate: `Interest Rating` (4 or 5 approves)          │
│    • Ratings 1 or 2 steer future radar sweeps away from topic          │
│    • Unattended exception: `Basics` ideas can be drafted without rating│
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                       Promoted by Article Writer
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 3. ARTICLE PRODUCTION DATABASE (`d39ea073...`)                         │
│    • ai-article-writer   (every 4 hours, ≤ 2 articles/run)             │
│    • talks-writer        (daily 08:30, public captions anonymous)      │
│    • case-studies-writer (daily 08:52, A-D evidence grading)           │
│    • Sets `Draft Status = Draft Ready`                                 │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                       Drawn by Artwork Routine
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 4. ARTWORK ROUTINE (Every 4h at :35)                                   │
│    • Reads `Artwork brief` (Argument, Geometry, Accent, Imperfection)  │
│    • Generates 1600x900 SVG using semantic tokens ({{paper}}, {{mizu}}) │
│    • Enforces zero hex codes & grain turbulence overlay                │
│    • Backfills `Executive TL;DR` if missing, files `## Artwork SVG`    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                      Polled by GitHub Actions
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 5. GITHUB ACTIONS: `publish-from-notion.yml` (Every 30 min / dispatch) │
│    • Runs `scripts/publish-article.mjs` with `NOTION_TOKEN`            │
│    • Checks 70/160/120 char caps, extracts SVG artwork, builds WebPs   │
│    • Executes `npm run build` + `check-build.mjs`                      │
│    ├──────────────────────────────────┬────────────────────────────────┤
│    ▼                                  ▼                                │
│ [Unattended: Basics, Case Studies,    [Reviewed: Technical, Business]  │
│  Talks]                               Opens Pull Request on            │
│  Pushes directly to `main`            `notion/approved-articles`       │
│  Dispatches `deploy.yml`              Owner reads & merges to `main`   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 6. CLOSED-LOOP RECONCILIATION (`close-loop.mjs`)                       │
│    • Runs after GitHub Pages deploy                                    │
│    • Issues real HTTP GET to live URL                                  │
│    • Only upon HTTP 200 + verified content, writes `Published`,        │
│      `Post URL`, and `Publish Date` back to the Notion row             │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Invariant Quality Standards & Verification Gates

Every article published on wAIbi-sabi must pass six non-negotiable verification gates:

### Gate 1: The Editorial Spine (`Reader Question`)
- Every post answers a question a working professional actually asked about AI.
- Hard Character Cap: `Reader Question ≤ 120 characters`.
- Displayed prominently on the index card and above the article headline.

### Gate 2: The Hard Length Caps
- **Title (`Name`)**: Maximum **70 characters** (prevents SERP truncation).
- **Meta Description**: Maximum **160 characters** (must live in opening callout/quote).
- A draft exceeding these by even 1 character is bounced by `publish-article.mjs` to `Needs Revision` with `Blocked Reason` recorded in Notion.

### Gate 3: Structural Anatomy
- **No leading H1**: Page layout renders frontmatter title as `<h1>`. A body `# Title` duplicates H1 and breaks build.
- **Mandatory Executive TL;DR**: The body MUST open with an H2 reading exactly `Executive TL;DR`, followed by 4–6 data-driven bullet points.
- Automatically wrapped into `<div class="tldr">...</div>` plate by `publish-article.mjs`.

### Gate 4: Fact-Checking & The Claim Ledger
- Origin: Hardened on 2026-08-25 after an SEO aggregator fact-check failure.
- Every statistic, date, quote, and benchmark score requires a **Claim Ledger** entry containing the verbatim sentence from a primary source.
- Aggregators and listicles are forbidden as primary evidence.
- Derivations (e.g., "X times faster", date gaps) must be mathematically recomputed before filing.

### Gate 5: Anti-AI Writing Standard
- Eliminates AI slop: no "In today's rapidly evolving AI landscape", no throat-clearing, no tricolon padding, no generic conclusions.
- Enforces high perplexity, sentence burstiness, and concrete practitioner observation.

### Gate 6: Geometric Artwork Validation
- Dimensions: `1600 × 900` (`viewBox="0 0 1600 900"`).
- Background: Full-frame `<rect width="1600" height="900" fill="{{paper}}"/>`.
- Colors: **Zero hardcoded hex values** (`#...` is strictly rejected). Must use CSS tokens: `{{paper}}`, `{{paper2}}`, `{{ink}}`, `{{border}}`, `{{card}}`, `{{mizu}}`, `{{hanko}}`, `{{moss}}`, `{{ochre}}`, `{{plum}}`, `{{indigo}}`.
- Overlay: Grain turbulence filter `<rect filter="url(#grain)" opacity="0.055"/>`.

---

## 3. Audit of the 7 Waiting Drafts in Notion

### Current Database State (`d39ea073-cc87-4c25-8a3c-d9f276a59b68`)
- **Total Rows**: 41
- **Published**: 31 (29 on disk + 2 manually tracked)
- **In Flight**: 2
- **Approved**: 1 (*"The Big Four Blame AI for Grad Cuts. The Data Isn't So Sure"*)
- **Draft Ready**: 7 drafts

### Why Have the 7 Drafts Not Shipped?
1. **Reviewed Tracks vs. Unattended Tracks**:
   - The 7 drafts reside on the **Reviewed Tracks** (`Technical` and `Business`).
   - By design, `site/scripts/publish-article.mjs` only auto-publishes `Draft Ready` rows if their Track is in `AUTO_TRACKS = ['Talks', 'Case Studies', 'Basics']`.
   - On `Technical` and `Business`, the pipeline **demands human approval**. They intentionally sit at `Draft Ready` until you review them in Notion and set `Draft Status = Approved`.
2. **The 1 `Approved` Row**:
   - The row *"The Big Four Blame AI for Grad Cuts..."* was approved, but the file `site/src/content/blog/the-big-four-blame-ai-for-the-graduate-hiring-cuts-the-wider.md` already existed on disk from an earlier manual commit without its Notion ID linked. The pipeline safely skipped overwriting it.

### Action to Inspect & Approve:
1. To inspect locally using the CLI:
   Add `NOTION_TOKEN=<your_token>` to `C:\Users\Janmejai\.env.global`.
   Then run:
   ```powershell
   node site/scripts/notion.mjs covered
   ```
2. In Notion:
   Open the **✍️ Article Production** database. Read through the 7 `Draft Ready` articles. If they meet your standards, flip `Draft Status` from `Draft Ready` to `Approved`.
3. Within 30 minutes (or immediately via workflow dispatch), GitHub Actions will generate the markdown, validate the character caps, build the WebP artwork, run `npm run build`, and open a Pull Request for you to merge.

---

## 4. Re-establishing the System with Gemini Spark

We can run the entire Article Writing Engine on **Gemini Spark** (Google AI Pro subscription) with **zero Claude token costs**, using the exact dual-bridge pattern that restored the News Archive.

### Architecture Matrix

| Role | Previous Claude Setup | New Gemini Spark Architecture |
|---|---|---|
| **Technical Radar** | `daily-ai-seo-radar` in `~/.claude/` | Gemini Spark via Google Cloud / Apps Script daily sweep |
| **Business Radar** | `business-radar` in `~/.claude/` | Gemini Spark scheduled prompt analyzing market shifts |
| **Basics Radar** | `basics-radar` in `~/.claude/` | Gemini Spark analyzing search queries & beginner questions |
| **Article Writer** | `ai-article-writer` (Claude 3.7 Sonnet) | Gemini Spark / Gemini 4 Argon with Claim Ledger protocol |
| **Talks & Cases** | `talks-writer` / `case-studies-writer` | Gemini Spark with YouTube caption / primary filing ingestion |
| **Artwork Engine** | `artwork-routine` in `~/.claude/` | Gemini Spark SVG generator enforcing `{{paper}}` & semantic tokens |
| **Publishing Gate** | GitHub Actions (`publish-from-notion.yml`) | **Unchanged** — GitHub Actions builds & validates Astro 5 SSG |

### Gemini Spark Routine Prompts
The prompt templates in `~/.claude/scheduled-tasks/` are completely model-agnostic instructions. They can be:
1. Executed on a schedule via **Google Apps Script** in Google Cloud (connected to Notion REST API or Google Sheets).
2. Executed locally via **Antigravity CLI / Gemini 4 Argon** (`agy` or PowerShell runner) without Claude dependencies.
3. Executed via **GitHub Actions scheduled workflows** using `GEMINI_API_KEY` and `NOTION_TOKEN`.
