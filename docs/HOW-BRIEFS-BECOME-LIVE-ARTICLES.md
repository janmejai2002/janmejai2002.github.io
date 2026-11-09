# wAIbi-sabi — How Briefs Become Live Articles (The Zero-API End-to-End Pipeline)

This guide explains exactly how the 3 SEO briefs generated daily in the `Radar` tab are turned into complete published articles on [janmejai2002.github.io](https://janmejai2002.github.io).

---

## The 4-Stage Lifecycle

```
STAGE 1: DISCOVERY & BRIEF (Gemini Spark Task 1)
   • Runs daily at 06:30 AM IST
   • Appends 3 ideas + full SEO Research Briefs to Google Sheet `Radar` tab
   • `sync-radar.mjs` automatically pushes them to Notion Pipeline Radar (`511e41a3...`)
           │
           ▼
STAGE 2: ARTICLE DRAFTING (Gemini Spark Task 2)
   • You pick which brief to write (or let Basics draft automatically)
   • Gemini Spark reads the SEO Brief (Keyword map, questions, competitor gaps, blueprint)
   • Drafts 1,500 words with Executive TL;DR & compliant 1600x900 SVG
   • Appends the draft to Google Sheet `Drafts` tab (or saves a Google Doc)
           │
           ▼
STAGE 3: PRODUCTION INGESTION & PREFLIGHT (`sync-drafts.mjs`)
   • GitHub Actions (or local script) runs `sync-drafts.mjs`
   • Pulls the draft from Google Sheet, runs `import-draft.mjs`
   • Creates the Notion Article Production row (`d39ea073...`) at `Draft Ready`
   • Runs deterministic preflight assertions: `publish-article.mjs --check <id>`
           │
           ▼
STAGE 4: CLOUD COMPILATION & EDGE DEPLOYMENT (`publish-from-notion.yml`)
   • Basics Track (Unattended): Commits directly to `main` → Live in 3 mins.
   • Technical / Business Tracks (Reviewed): You flip `Draft Status = Approved` in Notion.
   • GitHub Actions converts SVG to dual Light/Dark WebPs via Sharp, runs Astro 5 build,
     and deploys live to https://janmejai2002.github.io/blog/<slug>/
   • `close-loop.mjs` tests live HTTP 200 and marks Notion row `Published`
```

---

## How to Trigger Stage 2: Drafting an Article with Gemini Spark

When you look at your 3 daily radar briefs (e.g. in your Google Sheet `Radar` tab or in Notion Radar):
- **Technical**: `Why Dynamic Tool Injection Breaks Agent Prefix Caching`
- **Business**: `Enterprise Agent Washing Faces a 40% Project Cancellation Reckoning`
- **Basics**: `Demystifying KV Cache: The Mental Model Behind Model Memory`

### Step 1: Give Gemini Spark the Task 2 Prompt
In **Gemini Web**, prompt Gemini Spark with the topic and brief:

```markdown
You are the Lead Applied-AI Editor for wAIbi-sabi (janmejai2002.github.io).
Write the publication-grade article for this topic using its approved SEO Research Brief:

Topic: "Why Dynamic Tool Injection Breaks Agent Prefix Caching"
Track: Technical (Accent: {{mizu}})
Reader Question: "Why does my agent run 5x slower and cost 8x more after adding dynamic tool schemas?"

CRITICAL EDITORIAL CONTRACT:
1. Caps: Title max 70 chars, Meta description max 160 chars, Reader Question max 120 chars.
2. Structure:
   - Line 1 callout:
     > **Meta description:** [Under 160 chars]
     > **Slug:** why-dynamic-tool-injection-breaks-prefix-caching
   - Section 2 MUST open with H2:
     ## Executive TL;DR
     Followed by 4-6 data-dense bullets with latency metrics (ms) and cache hit ratios.
   - No body "# Title".
   - Trailing "## Artwork brief" (1 sentence argument, geometry, accent mizu, deliberate imperfection).
   - Final "## Artwork SVG" (Alt: line plus valid 1600x900 SVG using ONLY {{paper}}, {{ink}}, {{border}}, {{mizu}}; zero hex codes).
3. Anti-AI Writing:
   - Level 3-4 concrete specificity (vLLM KV cache blocks, Claude prompt caching, SIMD, tokens).
   - Zero negative parallelism ("It's not about X. It's about Y").
   - Zero em dashes (—). Use periods, commas, colons, or parentheses.
   - Zero banned buzzwords (delve, realm, harness, robust, seamless, pivotal, game-changer).

Once drafted, append a row to the "Drafts" tab of my Google Sheet:
https://docs.google.com/spreadsheets/d/1-UcD-C4My_Zp4aH3n-5dB3JQNtDN_MSAK6vTCPt8LY0/edit
Columns: Date | Track | Title | DocUrl (leave empty) | Draft (paste the complete markdown text) | Status ("Ready")
```

---

## How Stages 3 & 4 Happen Automatically

1. **Automatic Pull**:
   Every 3 hours, GitHub Actions workflow `.github/workflows/sync-news.yml` automatically runs:
   ```bash
   node scripts/sync-drafts.mjs --commit
   ```
   *(Or you can run `node site/scripts/sync-drafts.mjs --commit` locally in PowerShell anytime for immediate ingestion!)*

2. **Preflight Assertion**:
   The draft is pushed to Notion Article Production database at `Draft Ready`, linked back to the radar idea, and verified against all publishing caps.

3. **Approval Gate & Going Live**:
   - For **Technical** or **Business**:
     Open Notion, click on the draft, do a quick read, and change `Draft Status` from `Draft Ready` to **`Approved`**.
   - For **Basics**:
     It is an unattended track and goes live automatically.
   - Within minutes, GitHub Actions builds the Astro 5 static site, converts the SVG to light and dark WebP hero images via Sharp, updates the RSS feed and sitemap, and deploys live to GitHub Pages.
   - `close-loop.mjs` verifies the live URL and marks the Notion row `Published`!
