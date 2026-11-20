---
name: blog-os
description: The wAIbi-sabi blog system map — five tracks, the Gemini→Sheet→Notion→GitHub pipeline, the publish path, legacy Claude routines, guardrails, machine gotchas. Use at the start of ANY work in C:\Users\Janmejai\janmejai2002.github.io, or when a task touches the blog, an article, a routine, Notion, publishing, artwork or deployment.
---

# wAIbi-sabi blog OS

Last verified: 2026-11-20 against commit 37a60a0 (main).

A self-running applied-AI blog. Astro 5, static, eight dependencies (astro, rss,
sitemap, 2 fontsource, d3-delaunay, satori, sharp), on GitHub Pages. Drafts are
written by **Gemini scheduled tasks**, land in a Google Sheet, are mirrored to
Notion by GitHub Actions, gated by code and published with no human approval.
Also a B-school interview news archive at `/news/`.

- **Live:** https://janmejai2002.github.io
- **Repo:** https://github.com/janmejai2002/janmejai2002.github.io (public)
- **Local:** `C:\Users\Janmejai\janmejai2002.github.io` — site source in `site/`.
  (The old `C:\Users\Janmejai\PluginsClaude` no longer exists.)
- **Deploy:** push to `main` → GitHub Actions → Pages. Pushing *is* deploying.
  Robots also commit to `main`: `git pull origin main` first.

## The canonical docs — prefer code and git log over docs when they disagree

| File | When you need it |
|---|---|
| `docs/HOW-IT-WORKS.md` | Plain-English map of today's Gemini + Sheet + repair-loop system (2026-11-11). Start here |
| `docs/AGY-HANDOFF.md`, `HARNESS-REPAIR-PLAN.md` | Harness handoff + key-places table; why the repair loop is built so |
| `docs/OWNER-SETUP.md`, `gemini/README.md`, `gemini/TASK-PROMPTS.md` | Sheet / Gemini task setup |
| `docs/PUBLISHING.md` | Publish pipeline (2026-08-28, **partly stale**: still says Technical/Business open a PR) |
| `docs/HANDOFF.md`, `HANDOFF-NEXT-SESSION.md` | **Pre-harness** (08-28 / 11-07), historic; §6 gotchas still useful |
| `docs/LESSONS.md`, `docs/ARTWORK.md` | Running notes (last edit 08-28); before making any image (`blog-artwork`) |

`/blog-start` runs the pickup.
## Editorial spine

Every article answers **a question a working professional actually asked about
AI** (`Reader Question` in Notion, `question:` in frontmatter, cap 120).

## Five tracks (all five auto-publish)

| Track | Accent | Reader | Sheet tab / Gemini task |
|---|---|---|---|
| `technical` | `--mizu` | Engineers / people who build with AI | Drafts / Radar + Writer |
| `business` | `--ochre` | Consultants, analysts, marketers, founders — **not** engineers | Drafts / Radar + Writer |
| `basics` | `--plum` | Anyone getting up to speed; also where setups live | Drafts / Radar + Writer |
| `case-studies` | `--moss` | People who want precedent, graded honestly | Case Studies / case-studies |
| `talks` | `--hanko` | People who cannot watch everything | Talks / talks |

`track` defaults to `technical`, so a missing Track never fails a build. UI
themes live in `site/src/data/tracks.ts`; rules (accent, auto, Sheet tab) in
`TRACKS` in `site/harness/registry.mjs`. **Notion `Track` values:** `Technical`,
`Business`, `Basics`, `Case Studies`, `Talks`. Renaming one touches the registry,
the Zod enum in `content.config.ts`, `tracks.ts`, `sync-status.mjs` and every
prompt writing Track.

## How content flows today

```
Gemini scheduled tasks ──append rows──> Google Sheet  (id in registry SHEET.id)
Conductor (Apps Script in the Sheet, every 15 min) ──> grey tabs, wakes GitHub
sync-news.yml: sync-radar / sync-drafts (Sheet→Notion, repairs) / sync-status
publish-from-notion.yml: publish-article.mjs gate → build → commit to main
deploy.yml: Pages deploy → IndexNow → close-loop.mjs (marks Published after 200)
```

- Gemini tasks (per `docs/HOW-IT-WORKS.md`, IST): Case Studies ~01:00, Radar
  03:35, Writer 04:15, News 06:00, Repairer 09:00 + 19:00, Talks 13:00. Live
  schedules **unverified** (they sit in Gemini). News: Sheet `News` tab →
  `sync-news.mjs` → Notion → `/news/` (the Claude cloud news routine is gone).
- A failing draft gets `Needs Revision` + `Failure Codes` + `Findings` + `Blocked
  Reason`; the Conductor queues it, Gemini returns only broken sections
  (Repair Patches/Outbox), code rebuilds and verifies. After 4 attempts a
  `needs-human` GitHub issue opens.
- **One rule file:** `site/harness/registry.mjs`. Edit it, run `node
  site/harness/generate.mjs`, commit what it changes (`gas/Registry.js`,
  `gemini/skills/*`). The build fails on drift; never hand-edit generated files.
- `gas/README.md` is **stale** (old ArticleEngine); trust `gas/Conductor.js`.

## Notion is the status board

Data source IDs (= `NOTION` in registry.mjs): radar `511e41a3-c1cd-47e0-8fa2-d319feef0ced`,
Article Production `d39ea073-cc87-4c25-8a3c-d9f276a59b68`, Interview News
Archive `288c805b-3d3f-46ae-98e4-893ab3e6d562`.

**`Interest Rating` is retired** (2026-11-11, `doctor.mjs:109`): the Gemini
radar scores and picks its own topics; ratings gate nothing in the new flow
(old Claude routines still read them). **Statuses:** `Draft Ready` (publishes),
`Needs Revision` (repair loop), `Approved` (see below), `Published`.

## Publish path

`AUTO_TRACKS` comes from `registry.mjs`; all five tracks are `auto: true`. A
`Draft Ready` row is committed straight to `main` and deployed (the workflow
dispatches `deploy.yml`). The gates are the safety net: title ≤70, description ≤160, question ≤120,
Executive TL;DR, artwork render, the full `npm run build` incl. `check-build`.
One failing article is quarantined (`Needs Revision`), the rest ship. Artwork
travels as SVG through the Notion page (never a git commit); Notion is
reconciled by `close-loop.mjs` only after the live URL serves 200.

The **reviewed/PR path still exists in code** (`Approved` on a row whose Track
is *not* in `AUTO_TRACKS`, e.g. blank, opens a PR on `notion/approved-articles`)
but no current track uses it. Technical/Business went auto 2026-11-11
(`b938c80`). Workflow header comments and `docs/PUBLISHING.md` still describe
the old split: code wins.

## The legacy Claude routines (local `scheduled-tasks`)

`~/.claude/scheduled-tasks/` has 9 dirs; 7 are blog routines (`daily-ai-seo-radar`,
`business-radar`, `basics-radar`, `ai-article-writer`, `artwork-routine`,
`case-studies-writer`, `talks-writer`); `case-comp` and `mind-the-pour-seo-aeo-check`
are unrelated. Prompts last edited by 2026-08-28; `docs/HOW-IT-WORKS.md` says
they were **replaced by the Gemini tasks and stopped**; whether still enabled
is **unverified** (cron is in the app, not the files). **Four hardcode the dead
path `PluginsClaude`** and would fail if run. Treat as rule reference. The
`blog-routines` skill is stale.

## The guardrails that never bend

1. **No routine or session may set `Draft Status = Approved`** — the owner's
   alone (a plugin hook blocks it). It no longer gates publishing: the five
   tracks publish on `Draft Ready` once the gates pass, so "nothing publishes
   itself" is **no longer true**; the owner reads live articles afterwards.
2. **Never commit to the `notion/approved-articles` branch.** `peter-evans`
   resets it from `main` on every run (cron nominally 4x/hour, plus dispatches)
   and destroys additions. Improvements go on `main`.
3. **Unattended automation may only use credentials that cannot expire** —
   why IndexNow (static key file) fits and `talks-writer` read captions anonymously.
4. **Failures must surface in Notion** (`Needs Revision` + `Blocked Reason`),
   not an Actions log. `sweep-stuck.yml` (daily) flags silent stalls.
5. **Never weaken a check** (`rules.mjs`, `check-build.mjs`; caps 70/160/120 in
   `CAPS`). Fix the text, not the cap; a truly wrong check is fixed narrowly
   with the reason in the commit.
6. **A handled rejection must not also fail the build**: the run goes red only
   if the Notion write-back failed and nothing else shipped.

## Machine gotchas — do not rediscover these

- **The Bash tool is flaky** (`cygheap read copy failed`, "paging file too
  small"). Retry once; fall back to PowerShell.
- **PowerShell here-strings break on apostrophes** in commit messages: write
  the message to a file and `git commit -F <file>`.
- **PowerShell writes a UTF-8 BOM on redirect.** Use the Write tool for files
  other tools read.
- **The Browser pane cannot screenshot.** Verify via DOM / computed styles.
- **Do not run `npm run build` with the dev server up** — heap OOM. Run from `site/`.
- **A blank line inside a raw HTML block in markdown terminates it** — never
  put one inside inline `<svg>` in an article.
- **Verify rendered output, not source.** Astro hashes CSS into `/_astro/*.css`;
  fetch the asset. Check live routes for *content*, not a 200, and cache-bust
  right after a deploy.
- **`nlm` auth expires often.** `nlm-relogin.sh` force-kills the browser;
  check for open tabs first. Use the `nlm` CLI, not an MCP server.

## The verify gate

`cd site && npm run build` (dev server stopped) = crew test + regression test + `astro build` + `check-build` +
`check-design` + `generate.mjs --check`. Done = it passes and changed live
routes return 200 **with the content present**. `/blog-verify` runs this.

## Seeing where it is stuck

`/blog-doctor` is one read-only pass over everything that stalls silently — the
Notion token, the self-healing loop (`Needs Revision` rows, reasons, Repair
Attempts), rows with a `Blocked Reason`, drafts ready too long, drafts with a
Notion block `toMarkdown()` cannot convert, published posts whose live URL does
not serve, git state, build freshness — plus GitHub Actions and routine state.
`site/scripts/doctor.mjs` is the engine (`npm run doctor`, `--json`, `--deep`).

`/blog-dashboard` renders it as one HTML page with a copy-to-run command per fix
(`site/scripts/dashboard.mjs`).
