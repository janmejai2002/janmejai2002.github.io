# wAIbi-sabi — Agent Project Constitution & Operating Manual

## 1. System Identity & Architecture

- **Project**: wAIbi-sabi (`https://janmejai2002.github.io`) — Applied-AI journal by Janmejai Singh Minhas and B-school interview news archive.
- **Engine**: Astro 5 (Static Site Generation), zero client runtime JS framework, Sharp for WebP optimization.
- **Local Workspace**: `C:\Users\Janmejai\janmejai2002.github.io` (`site/` contains web source).
- **Control Plane**: Notion (3 databases: Pipeline Radar, Article Production, Interview News Archive).
- **Deployment**: Push to `main` -> GitHub Actions (`deploy.yml`) -> GitHub Pages.

---

## 2. Invariant Guardrails — Never Violate

1. **Approved Gate is Human-Only**: `Draft Status = Approved` and `Interest Rating` in Notion are reserved strictly for the owner. No session or agent may set `Approved`.
2. **Never commit to `notion/approved-articles`**: The automated poll overwrites this branch from `main`. Commit post-merge edits to `main`.
3. **Hard Character Caps**:
   - Title: `max 70 chars`
   - Meta Description: `max 160 chars`
   - Reader Question: `max 120 chars`
   *(Do not relax caps in code; adjust content in Notion).*
4. **Artwork Rules**:
   - Sources in `site/assets-src/art/<slug>.svg` MUST use placeholder tokens (`{{paper}}`, `{{ink}}`, `{{mizu}}`...) and **never hardcoded hex codes**.
   - `heroAlt` is mandatory when `heroImage` is set.
5. **No Blind Publishing**:
   - Unattended tracks (`Talks`, `Case Studies`, `Basics`) publish directly.
   - Reviewed tracks (`Technical`, `Business`) require owner approval -> automated PR.
6. **Closed-Loop Reconciliation**:
   - `close-loop.mjs` verifies the live URL serves HTTP 200 with content before marking the Notion row `Published`.

---

## 3. Essential Commands & Tooling

```powershell
# Development server (http://localhost:4321)
npm --prefix site run dev

# Full production build + verification assertions (check-build.mjs)
npm --prefix site run build

# Generate Light & Dark WebP article hero images
npm --prefix site run images

# Pipeline healthcheck & diagnostic sweep
npm --prefix site run doctor
# Or with node directly:
node site/scripts/doctor.mjs

# Code knowledge graph navigation (codemap on PATH)
codemap analyze C:\Users\Janmejai\janmejai2002.github.io
codemap query <file> C:\Users\Janmejai\janmejai2002.github.io

# Token-cheap Notion CLI (replaces schema-heavy Notion MCP)
node site/scripts/notion.mjs radar
node site/scripts/notion.mjs covered
```

---

## 4. Associated Skills

The following skills are configured in `.agents/skills/` and global config:
- `blog-os`: The complete system map, 5 tracks, Notion databases, and gotchas.
- `blog-publish`: Publishing manual, dry-runs, PR lifecycle, and close-loop.
- `blog-artwork`: Geometric design language, SVG specs, and generation prompt.
- `blog-routines`: Scheduled routines reference, crons, token cost models.
- `seo-topic-research`: Grounded SEO opportunity research protocol.
- `waibi-sabi-design-language`: Master tokens, 5 earths, and dark-theme mechanics.
- `archify`: Architecture, workflow, and lifecycle interactive diagram generation.

---

## 5. System Architecture Visualizations

- **Architecture diagram spec**: `docs/architecture.json`
- **Rendered interactive HTML**: `docs/wAIbi-sabi-architecture.html`

---

## 6. Current handoff

Before doing any work, read `docs/AGY-HANDOFF.md` and `docs/DESIGN-SYSTEM.md`. They override older docs on design. Do not commit or push unless the owner asks in the conversation.
