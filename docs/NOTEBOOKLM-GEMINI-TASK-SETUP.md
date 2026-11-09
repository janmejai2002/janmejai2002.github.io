# wAIbi-sabi — NotebookLM & Gemini Task Operational Setup

**Notebook Title**: `wAIbi-sabi Editorial Engine: Case Studies & Talks`  
**Notebook ID**: `498dbdfa-987e-4fb9-ba6f-2ed82389ce26`  
**Notebook URL**: [https://notebook.google.com/notebook/498dbdfa-987e-4fb9-ba6f-2ed82389ce26](https://notebook.google.com/notebook/498dbdfa-987e-4fb9-ba6f-2ed82389ce26)  
**Local CLI Alias**: `waibi-sabi`

---

## 1. What Has Been Initialized in Your Notebook

Your dedicated NotebookLM notebook has been created and loaded with 5 verified knowledge sources and 1 master operational directive:

| Source ID | Document | Purpose & Scope |
|---|---|---|
| `e250367b...` | `01-editorial-constitution-and-blog-os.md` | Core mission, Astro 5 SSG engine, strict caps (70/160/120), and unattended publishing pipeline. |
| `403166ed...` | `02-case-studies-track-blueprint.md` | 4-part autopsy structure, primary SEC/postmortem sources, `--moss` accent (#52694a), and unit economics. |
| `c56bc061...` | `03-talks-track-blueprint.md` | YouTube audio/lecture decomposition, timestamped inflection points, `--hanko` accent (#b83b26). |
| `69abb767...` | `04-anti-ai-writing-and-claim-ledger.md` | Wikipedia WP:AISIGNS standards, banned AI tropes (no negative parallelism, zero em dashes), South Park narrative engine. |
| `ed30aae1...` | `05-svg-artwork-and-semantic-design-tokens.md` | Strict 1600x900 SVG rules, semantic tokens (`{{paper}}`, `{{ink}}`, `{{border}}`, `{{moss}}`, `{{hanko}}`), zero hex codes. |
| `0c0c733f...` | `Master System Directives` (Note) | Executive operational directive for Gemini Tasks referencing both tracks. |

---

## 2. Connecting to Gemini Tasks in Gemini Web

When setting up your **Gemini Task / Scheduled Prompt** in [gemini.google.com](https://gemini.google.com) (with your Google AI Pro account):

### Step A: Connect the Notebook
In Gemini Web:
1. Open or create your Gemini Task / Scheduled Action.
2. Select the **NotebookLM extension** (or click **+ Add Context / Notebook**).
3. Select **`wAIbi-sabi Editorial Engine: Case Studies & Talks`**.

---

### Step B: The Gemini Task Prompt for `Talks` (YouTube Grounding)

Set this task to run or trigger on-demand when you want to convert a keynote, lecture, or podcast:

```markdown
Connect to my NotebookLM notebook "wAIbi-sabi Editorial Engine: Case Studies & Talks".
Obey all rules from "01-editorial-constitution-and-blog-os.md", "03-talks-track-blueprint.md", "04-anti-ai-writing-and-claim-ledger.md", and "05-svg-artwork-and-semantic-design-tokens.md".

TASK:
1. Using NotebookLM and YouTube grounding, analyze this technical talk/keynote:
   Target Talk: [Paste YouTube Video URL or Keynote Name]
2. Synthesize the talk into a publication-grade wAIbi-sabi article under Track: Talks.
3. Editorial Enforcements:
   - Title: Maximum 70 characters (names the speaker and the contrarian shift).
   - Meta description: Maximum 160 characters.
   - Reader Question: Maximum 120 characters (authentic practitioner friction question).
   - Layout:
     > **Meta description:** [Under 160 chars]
     > **Slug:** [kebab-case-slug]
     > **Reader Question:** [Under 120 chars]

     ## Executive TL;DR
     [4 to 6 data-dense bullets with core thesis, benchmarks, and latency/model metrics]

     ## 1. The Core Argument in Three Sentences
     ## 2. Five Timestamped Inflection Points (use [MM:SS] format with verbatim quotes)
     ## 3. What Was Claimed vs. What Benchmarks Prove (Contrarian fact-check)
     ## 4. What This Changes for Applied Engineers

     ## Artwork brief
     [1-sentence argument, geometry, accent hanko, deliberate wAIbi-sabi imperfection]

     ## Artwork SVG
     Alt: [One sentence description]
     [Valid 1600x900 SVG using strictly {{paper}}, {{ink}}, {{border}}, {{hanko}}; zero hex codes]
4. Anti-AI Standard: Zero em dashes, zero negative parallelism, zero banned buzzwords.
5. Ingress: Append the completed article as a new row into the "Talks" tab of my Google Sheet:
   https://docs.google.com/spreadsheets/d/1-UcD-C4My_Zp4aH3n-5dB3JQNtDN_MSAK6vTCPt8LY0/edit
   Columns: Date | Track | Title | DocUrl | Draft | Status
```

---

### Step C: The Gemini Task Prompt for `Case Studies` (Deep Research Grounding)

Set this task to research real enterprise AI rollouts from in-vogue research papers, corporate postmortems, or SEC filings:

```markdown
Connect to my NotebookLM notebook "wAIbi-sabi Editorial Engine: Case Studies & Talks".
Obey all rules from "01-editorial-constitution-and-blog-os.md", "02-case-studies-track-blueprint.md", "04-anti-ai-writing-and-claim-ledger.md", and "05-svg-artwork-and-semantic-design-tokens.md".

TASK:
1. Using deep research search and primary filings (SEC 10-K, official engineering postmortems, research papers):
   Target Deployment: [Company / System, e.g. Uber QueryGPT / Klarna AI Customer Service / Commonwealth Bank Fraud AI]
2. Conduct an unvarnished technical and financial autopsy of the deployment.
3. Editorial Enforcements:
   - Title: Maximum 70 characters (names the company and the concrete result).
   - Meta description: Maximum 160 characters.
   - Reader Question: Maximum 120 characters.
   - Layout:
     > **Meta description:** [Under 160 chars]
     > **Slug:** [kebab-case-slug]
     > **Reader Question:** [Under 120 chars]

     ## Executive TL;DR
     [4 to 6 data-dense bullets with unit economics, latency SLA numbers, and deflection rates]

     ## 1. The Deployment (Stack, models, SLA constraints, ASCII architecture graph)
     ## 2. The Balance Sheet (Hard unit economics, GPU cluster costs, net savings vs. human labor)
     ## 3. The Edge Cases (Hallucinations, drift, failure modes, customer churn)
     ## 4. The Reusable Blueprint (3-4 principles any engineering lead can copy)

     ## Artwork brief
     [1-sentence argument, geometry, accent moss, deliberate wAIbi-sabi imperfection]

     ## Artwork SVG
     Alt: [One sentence description]
     [Valid 1600x900 SVG using strictly {{paper}}, {{ink}}, {{border}}, {{moss}}; zero hex codes]
4. Anti-AI Standard: Zero em dashes, zero negative parallelism, level 3-4 concrete specificity.
5. Ingress: Append the completed article as a new row into the "Case Studies" tab of my Google Sheet:
   https://docs.google.com/spreadsheets/d/1-UcD-C4My_Zp4aH3n-5dB3JQNtDN_MSAK6vTCPt8LY0/edit
   Columns: Date | Track | Title | DocUrl | Draft | Status
```

---

## 3. Zero-Touch Publishing Loop

As soon as Gemini writes to either the `Case Studies` or `Talks` tab in Google Sheets:
1. GitHub Actions fetches the rows automatically via `sync-drafts.mjs`.
2. Creates the page in Notion Article Production at `Draft Ready`.
3. Because both tracks are configured in `AUTO_TRACKS`, the cloud publisher compiles the Astro markdown, generates the light/dark WebP artwork, and commits directly to `main`.
4. The post is live on `https://janmejai2002.github.io` within 3 minutes with zero human intervention required.
