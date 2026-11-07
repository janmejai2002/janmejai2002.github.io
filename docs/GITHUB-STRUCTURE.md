# wAIbi-sabi — Repository & GitHub Infrastructure Guide

**Repository**: [`janmejai2002.github.io`](https://github.com/janmejai2002/janmejai2002.github.io)  
**Live Site**: [janmejai2002.github.io](https://janmejai2002.github.io)  
**Engine**: Astro 5 Static Site Generation (SSG) · Zero Client Runtime JS · GitHub Pages  
**Control Plane**: Notion (Pipeline Radar, Article Production, Interview News Archive)  

---

## 1. Executive Summary

This repository is **not** a standard static blog. It is an **autonomous applied-AI publication engine** operating as a distributed loop between:
1. **Notion** (the headless editorial and curated data control plane),
2. **GitHub Actions** (the cloud orchestrator polling, syncing, and deploying),
3. **Local Scheduled Routines** (Windows Task Scheduler driving autonomous AI agents), and
4. **Astro 5 on GitHub Pages** (the high-performance static reader frontend).

```
 ┌────────────────────────────────────────────────────────┐
 │                 Notion Control Plane                   │
 │  • Pipeline Radar   • Article Production  • News Archive│
 └─────────────┬───────────────────────────┬──────────────┘
               │                           │
      cloud poll (every 30m)       sync news (every 3h)
               │                           │
               ▼                           ▼
 ┌───────────────────────────┐   ┌────────────────────────┐
 │   publish-from-notion     │   │     sync-news.yml      │
 │  (Talks/Basics -> Direct) │   │ (updates news.json)    │
 │  (Tech/Biz   -> PR)       │   └─────────┬──────────────┘
 └─────────────┬─────────────┘             │
               │                           │
               ▼                           ▼
       Git Push to `main` ─────────────────┘
               │
               ▼
 ┌───────────────────────────┐
 │        deploy.yml         │  ──> Builds Astro 5 (40 pages)
 │  (GitHub Pages Deployer)  │  ──> Runs `check-build.mjs`
 └─────────────┬─────────────┘  ──> Publishes to Edge
               │
               ▼
 ┌───────────────────────────┐
 │   close-loop.mjs Check    │  ──> Verifies HTTP 200 Live
 │ (Marks Notion 'Published')│
 └───────────────────────────┘
```

---

## 2. GitHub Workflows (`.github/workflows/`)

| Workflow File | Trigger | Function & Responsibilities |
| :--- | :--- | :--- |
| [`deploy.yml`](file:///C:/Users/Janmejai/janmejai2002.github.io/.github/workflows/deploy.yml) | `push: [main]`, manual dispatch | Installs dependencies in `site/`, runs `npm run build` (Astro + `check-build.mjs` verification), and deploys the generated static artifacts to GitHub Pages. |
| [`sync-news.yml`](file:///C:/Users/Janmejai/janmejai2002.github.io/.github/workflows/sync-news.yml) | Every 3 hours (`cron: '0 */3 * * *'`) | Queries the Notion **Interview News Archive** (596+ entries), writes the latest records to [`site/src/data/news.json`](file:///C:/Users/Janmejai/janmejai2002.github.io/site/src/data/news.json), and commits directly to `main`. This is why remote `origin/main` regularly accumulates automated sync commits. |
| [`publish-from-notion.yml`](file:///C:/Users/Janmejai/janmejai2002.github.io/.github/workflows/publish-from-notion.yml) | Every 30 mins (`cron: '17,47 * * * *'`, `'3,33 * * * *'`) | Cloud engine for publishing articles. Splits by track:<br>• **Unattended Tracks** (`Talks`, `Case Studies`, `Basics`): Pulls markdown, compiles SVG hero artwork, runs tests, commits straight to `main`.<br>• **Reviewed Tracks** (`Technical`, `Business`): Converts approved Notion drafts and generates a Pull Request for human review. |
| [`sweep-stuck.yml`](file:///C:/Users/Janmejai/janmejai2002.github.io/.github/workflows/sweep-stuck.yml) | Daily at 06:40 UTC | Pipeline backstop watchdog. Detects drafts stuck in transition or unfulfilled states in Notion and flags them with diagnostic notes directly on the Notion row. |

---

## 3. Web Engine Architecture (`site/`)

The web frontend is isolated under `site/` with zero client-side JavaScript runtime overhead, ensuring near-instant page loads.

### Key Directories
- **`src/pages/`**:
  - `index.astro`: Main hub with track filters, latest articles, and curated sections.
  - `[track].astro`: Dedicated track pages (`/technical`, `/business`, `/basics`, `/case-studies`, `/talks`).
  - `blog/[...slug].astro`: Dynamic reader template for 29+ markdown essays.
  - `news/index.astro`: Searchable, categorized B-school interview and tech news archive (596+ items).
  - `projects.astro` & `about.astro`: Profile and portfolio pages.
  - `status.astro`: Live pipeline health, recent routine runs, and publication metrics.
  - `rss.xml.js` & `llms.txt.ts`: Machine-readable syndication and LLM ingestion endpoints.
- **`src/content/blog/`**:
  - Content collection holding 29 static Markdown articles.
  - Validated by [`site/src/content.config.ts`](file:///C:/Users/Janmejai/janmejai2002.github.io/site/src/content.config.ts) using Zod schemas.
- **`assets-src/art/`**:
  - Semantic SVG hero artwork sources for each blog post.
  - Uses geometric placeholder tokens (`{{paper}}`, `{{ink}}`, `{{mizu}}`, `{{kusa}}`, `{{hi}}`, `{{tsuchi}}`) rather than hardcoded hex codes.
- **`scripts/`**:
  - `check-build.mjs`: Strict assertion runner validating HTML structure, alt tags, and theme compliance.
  - `publish-article.mjs`: Notion block parser and markdown converter.
  - `make-images.mjs`: Sharp-based SVG rasterizer producing dual Light and Dark WebP hero assets.
  - `close-loop.mjs`: Validates that live URLs return HTTP 200 before advancing Notion state to `Published`.
  - `doctor.mjs`: Health-check diagnostic tool testing Notion connectivity, live links, and git freshness.

---

## 4. Local Autonomous Routines (`routines/`)

The `routines/` directory manages local Windows scheduled tasks that trigger AI agents (e.g. Claude) to research topics and write drafts:
- **Radars**:
  - `daily-ai-seo-radar`: Scours technical papers and search shifts.
  - `business-radar`: Identifies applied AI enterprise use cases.
  - `basics-radar`: Curates fundamental AI concept topics.
- **Writers**:
  - `ai-article-writer`: Autonomous technical writer.
  - `talks-writer`: Transcribes and synthesizes high-signal talks.
  - `case-studies-writer`: Formats real-world case studies (Klarna, CBA, Uber).
  - `artwork-routine`: Synthesizes geometric wAIbi-sabi SVGs for new articles.
- **Manager (`manager.ps1`)**:
  - Watchdog script running every 10 minutes to verify scheduled task health and prevent duplicate runs.

---

## 5. Invariant Guardrails & Project Governance

Codified in [`AGENTS.md`](file:///C:/Users/Janmejai/janmejai2002.github.io/AGENTS.md) and [`GEMINI.md`](file:///C:/Users/Janmejai/janmejai2002.github.io/GEMINI.md):
1. **Approved Gate is Human-Only**: Only the human owner can set `Draft Status = Approved` or assign an `Interest Rating` in Notion.
2. **Never Commit to `notion/approved-articles`**: This branch is ephemeral and overwritten during polling.
3. **Hard Editorial Character Caps**:
   - Title: `max 70 chars`
   - Meta Description: `max 160 chars`
   - Reader Question: `max 120 chars`
4. **Token-Only Artwork**: Artwork SVGs must use placeholder tokens and never hardcode static color hexes.
5. **Closed-Loop Reconciliation**: Notion database status never changes to `Published` until the post is live on the internet and returns HTTP 200 with matching content.
