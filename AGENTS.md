# wAIbi-sabi — Agent Project Constitution & Operating Manual

## 1. System Identity & Architecture

- **Project**: wAIbi-sabi (`https://janmejai2002.github.io`) — Applied-AI journal by Janmejai Singh Minhas and B-school interview news archive.
- **Engine**: Astro 5 (Static Site Generation), zero client runtime JS framework, Sharp for WebP optimization.
- **Local Workspace**: `C:\Users\Janmejai\janmejai2002.github.io` (`site/` contains web source).
- **Content engine (since 2026-11)**: five Gemini scheduled tasks + a Repairer, all writing to one Google Sheet. The Claude scheduled routines are retired.
- **Control Plane**: Notion (3 databases: Pipeline Radar, Article Production, Interview News Archive). Notion is the one authority for article status.
- **Deployment**: Push to `main` -> GitHub Actions (`deploy.yml`) -> GitHub Pages.

**Read `docs/HOW-IT-WORKS.md` first** (plain English), then `docs/HARNESS-PLAN.md` (design). Every rule (caps, tracks, sheet tabs, failure codes, repair limit) lives in **`site/harness/registry.mjs`**; after editing it run `node site/harness/generate.mjs`. Never hardcode a rule elsewhere.

---

## 2. Invariant Guardrails — Never Violate

1. **Approved is Human-Only**: no session or agent may set `Draft Status = Approved`. (`Interest Rating` is retired — the radar scores topics itself.)
2. **Never commit to `notion/approved-articles`**: The automated poll overwrites this branch from `main`. Commit post-merge edits to `main`.
3. **Hard Character Caps**:
   - Title: `max 70 chars`
   - Meta Description: `max 160 chars`
   - Reader Question: `max 120 chars`
   *(Do not relax caps in code; adjust content in Notion).*
4. **Artwork Rules**:
   - Sources in `site/assets-src/art/<slug>.svg` MUST use placeholder tokens (`{{paper}}`, `{{ink}}`, `{{mizu}}`...) and **never hardcoded hex codes**.
   - `heroAlt` is mandatory when `heroImage` is set.
5. **Gates, not reviewers**: all five tracks publish automatically (owner's decision, 2026-11-11; `TRACKS[].auto` in the registry). The gates are the only safety net, so never weaken one; fix the content or the rule's false positive.
6. **Closed-Loop Reconciliation**:
   - `close-loop.mjs` verifies the live URL serves HTTP 200 with content before marking the Notion row `Published`.
7. **Self-healing loop**: a failed draft goes to `Needs Revision` with `Failure Codes`; the Conductor puts it in the Sheet's `Repair Queue`; the Gemini Repairer appends a fix to `Repair Outbox`; `sync-drafts.mjs` applies it. After `REPAIR.maxAttempts` (4) a GitHub issue labelled `needs-human` is opened. When asked to fix such an issue: edit the Notion page, run `node site/scripts/publish-article.mjs --check <id>`, set `Draft Ready`.
8. **Sheet tabs**: agents only append; `Status` and `Repair Queue` are code-owned. See `gemini/skills/waibi-sheet-contract/sheet.md`.

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

# Harness
node site/scripts/publish-article.mjs --check <notion-page-id>   # every gate on one draft
node site/scripts/sync-drafts.mjs                                # Sheet → Notion dry run (--commit to apply)
node site/harness/generate.mjs                                   # regenerate gas/Registry.js + Gemini skill files
node site/harness/notion-schema.mjs                              # add any new harness properties to Notion
cd gas; clasp -u waibi push -f                                   # deploy the Conductor (Apps Script, personal Google login)

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

Before doing any work, read `docs/AGY-HANDOFF.md` (current state and first tasks, 2026-11-11), then `docs/HOW-IT-WORKS.md`. For site design, `docs/DESIGN-SYSTEM.md` overrides older docs. Do not commit or push unless the owner asks in the conversation.
