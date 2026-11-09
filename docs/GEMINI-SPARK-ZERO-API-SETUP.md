# wAIbi-sabi — Gemini Spark Zero-API Autonomous Engine Setup

**Architecture**: Gemini Spark (Google AI Pro) + Google Sheets Bridge + GitHub Actions + Notion  
**Cost**: $0 in API Tokens (runs on your existing Google AI Pro subscription)  
**Laptop Uptime Required**: 0 hours (100% serverless cloud execution)  
**Live Google Sheet**: `https://docs.google.com/spreadsheets/d/1-UcD-C4My_Zp4aH3n-5dB3JQNtDN_MSAK6vTCPt8LY0/edit`  

---

## 1. The Zero-API Cloud Relay Architecture

You do not need a paid developer API key or credit card billing on Google Cloud.
The entire editorial engine runs through **Google Sheets as the Ingress Bus**:

```
┌─────────────────────────────────────────────────────────────┐
│ GEMINI SPARK (Google AI Pro / Workspace Extensions)         │
│   • Runs recurring background tasks in Google Cloud         │
│   • Web Search Grounding + Google Workspace integration     │
└──────────────────────────────┬──────────────────────────────┘
                               │
            Appends rows natively via Workspace
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ GOOGLE SHEET DATABASE (`1-UcD-C4My_Zp4aH3n-5dB3JQNtDN...`) │
│   • Tab 1: `News`   → Top 5 MBA stories (Already live!)    │
│   • Tab 2: `Radar`  → Daily trending AI ideas & pitches     │
│   • Tab 3: `Drafts` → Markdown drafts or Google Doc links   │
└──────────────────────────────┬──────────────────────────────┘
                               │
      Public CSV Export fetched every 3h by GitHub Actions
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ GITHUB ACTIONS (`sync-news.yml` & `publish-from-notion.yml`)│
│   • `sync-news.mjs`   → Updates `news.json` & Notion News   │
│   • `sync-radar.mjs`  → Appends fresh ideas to Notion Radar │
│   • `sync-drafts.mjs` → Ingests drafts to Notion Production │
│   • `npm run build`   → Builds Astro 5 and deploys to Pages │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Google Sheet Tab Setup (One-Time Setup)

In your existing Google Sheet [`wAIbi-sabi News`](https://docs.google.com/spreadsheets/d/1-UcD-C4My_Zp4aH3n-5dB3JQNtDN_MSAK6vTCPt8LY0/edit), create two additional tabs:

### Tab 1: `News` (Already Created & Working)
- Columns: `Date | Category | Headline | Summary | Interview Angle | Source`

### Tab 2: `Radar`
- Create a new tab named **`Radar`**.
- In Row 1, paste these exact column headers:
  ```
  Date	Track	Title	Reader Question	Pitch	Keywords
  ```

### Tab 3: `Drafts`
- Create a new tab named **`Drafts`**.
- In Row 1, paste these exact column headers:
  ```
  Date	Track	Title	DocUrl	Draft	Status
  ```

---

## 3. Gemini Spark Task 1: Daily Radar Sweep

In **Gemini Web** (with your Google AI Pro account):

1. Click on **Tasks** (or create a new Scheduled Action / Recurring Prompt).
2. Set the frequency to **Daily at 06:30 AM IST**.
3. Enable the **Google Workspace Extension** (Google Sheets).
4. Paste this exact prompt:

```markdown
Every day at 06:30 AM IST, search the live web for today's top trending AI engineering developments, architectural shifts, and enterprise controversies across three tracks: Technical, Business, and Basics.

For each track, formulate:
1. Date: Today's date (YYYY-MM-DD).
2. Track: Exactly "Technical", "Business", or "Basics".
3. Title: Maximum 70 characters (strict cap, specific and active).
4. Reader Question: Real question a practitioner actually asked, maximum 120 characters (strict cap).
5. Pitch: Exactly one engaging paragraph of 90-110 words explaining the technical hook, the core friction, and why it matters now.
6. Keywords: Primary keyword plus 3-4 comma-separated secondary keywords.

Append these 3 new rows directly into the "Radar" tab of my Google Sheet:
https://docs.google.com/spreadsheets/d/1-UcD-C4My_Zp4aH3n-5dB3JQNtDN_MSAK6vTCPt8LY0/edit
```

---

## 4. Gemini Spark Task 2: Article Writer Routine

When you want Gemini Spark to draft an article (either on a schedule or on-demand):

### Option A: Direct Google Sheet Cell Ingestion (Simplest)
Google Sheets supports up to 50,000 characters per cell. A 1,600-word article is ~10,000 characters.

Paste this prompt into Gemini Spark:

```markdown
You are the Lead Applied-AI Editor for wAIbi-sabi (janmejai2002.github.io).
Write a publication-grade article for the following topic:

Topic: "[PASTE TOPIC TITLE HERE]"
Track: [Technical | Business | Basics]
Reader Question: "[PASTE QUESTION HERE]"

STRICT PUBLISHING INVARIANTS:
1. Character Caps:
   - Title: Max 70 chars.
   - Meta Description: Max 160 chars.
   - Reader Question: Max 120 chars.
2. Structure:
   - Line 1 callout:
     > **Meta description:** [Under 160 chars]
     > **Slug:** [url-safe-slug]
   - Second section MUST open with:
     ## Executive TL;DR
     Followed by 4-6 concise data-driven bullets with numbers, latency metrics, or benchmarks.
   - No body "# Title".
   - Trailing "## Artwork brief" (1 sentence argument, geometry, accent, deliberate imperfection).
   - Final "## Artwork SVG" (Alt: line plus 1600x900 SVG using tokens {{paper}}, {{ink}}, {{border}}, and accent; zero hex codes).
3. Anti-AI Writing:
   - No negative parallelism ("It's not about X. It's about Y").
   - No em dashes (—). Use periods, commas, colons, or parentheses.
   - No banned words: delve, realm, harness, unlock, tapestry, leverage, seamless, robust, game-changer.
   - Level 3-4 concrete specificity.

Once drafted, append a single row to the "Drafts" tab of my Google Sheet:
https://docs.google.com/spreadsheets/d/1-UcD-C4My_Zp4aH3n-5dB3JQNtDN_MSAK6vTCPt8LY0/edit
Columns: Date | Track | Title | DocUrl (leave empty) | Draft (paste the complete markdown text) | Status ("Ready")
```

### Option B: Google Docs in Google Drive (For Long Drafts)
If you prefer drafting into Google Docs:
1. Ask Gemini Spark to save the draft into a Google Doc in your Google Drive.
2. Spark will append the Doc URL to the `Drafts` tab in the `DocUrl` column.
3. Our `sync-drafts.mjs` script automatically fetches the plain text export (`https://docs.google.com/document/d/<ID>/export?format=txt`), parses it, and pushes it to Notion!

---

## 5. How the Automated Ingestion Works

1. **Every 3 hours**, GitHub Actions runs `.github/workflows/sync-news.yml`:
   - Runs `sync-news.mjs` → pulls news to `news.json` and Notion News Archive.
   - Runs `sync-radar.mjs` → checks the `Radar` tab; if new ideas exist, pushes them to Notion Pipeline Radar (`511e41a3...`) at `Radar Idea`.
   - Runs `sync-drafts.mjs` → checks the `Drafts` tab; if new drafts exist, ingests them to Notion Article Production (`d39ea073...`) at `Draft Ready` and verifies preflight assertions.
2. **Human Approval**:
   - You review the draft in Notion.
   - Change `Draft Status` from `Draft Ready` to `Approved`.
3. **Automated Deployment**:
   - GitHub Actions `publish-from-notion.yml` renders WebP hero images via Sharp, compiles the Astro 5 static site, and opens the PR (or publishes immediately for unattended tracks).
   - Zero token costs, zero API subscriptions.
