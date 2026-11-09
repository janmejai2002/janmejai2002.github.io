# wAIbi-sabi Editorial Constitution & Operating Manual

## 1. System Identity & Mission
wAIbi-sabi (https://janmejai2002.github.io) is an applied-AI technical journal by Janmejai Singh Minhas and an MBA interview archive.
Engine: Astro 5 Static Site Generation (zero client runtime JS, Sharp for dual light/dark WebP optimization).
Control Plane: Notion (Pipeline Radar, Article Production, Interview News Archive) and Google Sheets Relay.

## 2. The Editorial Spine: The Reader Question
Every single article answers a real question a working practitioner actually asked about AI.
It never covers a generic topic or category. It answers a concrete practitioner friction question with verified numbers, latency benchmarks, and operational mechanisms.

## 3. Strict Character Caps (Enforced by Automated Preflight)
- Title: Maximum 70 characters (strict cap, active voice, specific).
- Meta Description: Maximum 160 characters (strict cap, keyword-dense).
- Reader Question: Maximum 120 characters (strict cap, phrased as an authentic practitioner question).

## 4. Mandatory Section Structure
Every generated article draft must follow this exact layout:
1. Opening Callout / Quote:
   > **Meta description:** [Under 160 characters]
   > **Slug:** [kebab-case-slug]
   > **Reader Question:** [Under 120 characters]
2. Executive TL;DR:
   MUST open with heading exactly `## Executive TL;DR` (never `# Executive TL;DR` or other variants).
   Followed immediately by 4 to 6 data-dense bullet points with latency numbers (ms), cost ratios ($/MTok), or percentage deltas with inline hyperlinked citations to primary sources.
3. Core Body Sections (H2 and H3 headings only; never include a top-level `# Title`).
4. Trailing Artwork Brief:
   Section with heading `## Artwork brief` containing:
   - Argument in one sentence
   - Geometry description
   - Accent color token
   - Deliberate imperfection
5. Final Artwork SVG:
   Section with heading `## Artwork SVG` containing:
   Alt: [One sentence description]
   ```xml
   <svg ...> [1600x900 SVG using only semantic tokens] </svg>
   ```

## 5. Automated Unattended Publishing Path
- The tracks `Case Studies` and `Talks` belong to `AUTO_TRACKS`.
- When an article is appended to the Google Sheet tab (`Case Studies` or `Talks`), GitHub Actions ingests it into Notion at `Draft Ready`.
- Because they are unattended, the cloud runner compiles the markdown, renders the dual light/dark WebP hero artwork, and commits straight to `main` without requiring manual review.
