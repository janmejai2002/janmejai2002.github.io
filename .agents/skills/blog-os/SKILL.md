---
name: blog-os
description: The wAIbi-sabi blog system map — what it is, the five tracks and their routines, the Notion control plane, the two publish paths, the two scheduling systems, the unbreakable guardrails, and the machine gotchas. Use at the start of ANY work in C:\Users\Janmejai\PluginsClaude, or whenever a task touches the blog, an article, the pipeline, a routine, the Notion databases, publishing, artwork, or deployment.
---

# wAIbi-sabi blog OS

A self-running applied-AI blog. Astro 5, static, no framework, four dependencies,
deployed to GitHub Pages. Content is controlled from Notion and produced by
Claude Code scheduled routines. It also carries a B-school interview news
archive at `/news/`.

- **Live:** https://janmejai2002.github.io
- **Repo:** https://github.com/janmejai2002/janmejai2002.github.io (public)
- **Local:** `C:\Users\Janmejai\PluginsClaude` — site source in `site/`
- **Deploy:** push to `main` → GitHub Actions → Pages. Pushing *is* deploying.

## The canonical docs — read the relevant one, do not work from memory

| File | When you need it |
|---|---|
| `docs/HANDOFF.md` | The system reference: control plane, pipeline, design system, §6 gotchas |
| `docs/HANDOFF-NEXT-SESSION.md` | Where the last session stopped and what to watch for |
| `docs/LESSONS.md` | Running notes — read at session start, add to it as you learn |
| `docs/PUBLISHING.md` | Before touching the publish pipeline (see also the `blog-publish` skill) |
| `docs/ARTWORK.md` | Before making any image (see also the `blog-artwork` skill) |

`/blog-start` runs the full pickup for you. This skill is the always-loaded
summary so the rules are in context even when a doc has not been opened.

## Editorial spine

Every article answers **a question a working professional actually asked about
AI** — not a topic, not a category. It lives in `Reader Question` on the Notion
row and `question:` in frontmatter, and prints above the title.

## Five tracks

| Track | Accent | Reader | Feeding routine | Path |
|---|---|---|---|---|
| `technical` | `--mizu` | Engineers / people who build with AI | `daily-ai-seo-radar` | reviewed |
| `business` | `--ochre` | Consultants, analysts, marketers, founders — **not** engineers | `business-radar` | reviewed |
| `basics` | `--plum` | Anyone getting up to speed; also where setups live | `basics-radar` | reviewed |
| `case-studies` | `--moss` | People who want precedent, graded honestly | `case-studies-writer` | unattended |
| `talks` | `--hanko` | People who cannot watch everything | `talks-writer` | unattended |

The three radars file *ideas* and wait for a human rating. The two writers draft
directly. `track` defaults to `technical` everywhere, so a missing Track never
fails a build. The five themes live once in `site/src/data/tracks.ts`.

**Notion `Track` select accepts exactly `Technical`, `Business`, `Basics`.**
Renaming a track means editing five hardcoded places including six routine
prompts — the checklist is `docs/research/routine-review.md` §C.

## Notion is the control plane

Three databases. Never hardcode into the repo anything that belongs in Notion.

| Database | Data source ID |
|---|---|
| 📝 AI Blog OS Pipeline (radar) | `511e41a3-c1cd-47e0-8fa2-d319feef0ced` |
| ✍️ Article Production (drafts) | `d39ea073-cc87-4c25-8a3c-d9f276a59b68` |
| Wabi Sabi – Interview News Archive | `288c805b-3d3f-46ae-98e4-893ab3e6d562` |

**Human-only fields, never written by a routine or a session:** `Interest
Rating` and `Remarks` on the radar; `Draft Status = Approved` on production.
Rating 4 or 5 is the approval gate; 1 and 2 steer future radar runs away.

## Two publish paths — the Track decides

- **Unattended — Talks, Case Studies, Basics.** The routine picks the subject,
  checks claims, files a finished draft; the article commits to `main` and
  deploys. You find out it exists by seeing it live.
- **Reviewed — Technical, Business.** You flip `Draft Status = Approved` and a
  PR appears. Read it, merge, it deploys.

The list is `AUTO_TRACKS` in `site/scripts/publish-article.mjs`. Either way the
article arrives complete: Executive TL;DR enforced at generation, artwork
travels through the Notion page (never a git commit), Notion reconciled by
`close-loop.mjs` only after the URL actually serves 200.

## Two scheduling systems, both called "routines"

- **Local `scheduled-tasks`** — prompts in `~/.claude/scheduled-tasks/<id>/SKILL.md`,
  run on this PC, can read local files, need the machine awake. Eight of these.
- **Cloud routines** — `/schedule` / `RemoteTrigger`, sandboxed, no local disk,
  1-hour minimum interval. One of these (the news feeder).

"Did the routine run?" means nothing until you know which system it is in —
separate lists, logs and failure modes. See the `blog-routines` skill.

## The guardrails that never bend

1. **Nothing publishes itself.** `Draft Status = Approved` is the owner's alone.
   No routine and no session may set it, ever.
2. **Never commit to the `notion/approved-articles` branch.** The publish poll
   regenerates it from `main` twice an hour and destroys additions. Post-merge
   improvements go on `main`.
3. **Unattended automation may only use credentials that cannot expire.** This is
   why IndexNow (static key file) fits and why `talks-writer` reads public
   captions anonymously instead of using NotebookLM.
4. **Failures must surface in Notion**, not an Actions log or a red build badge —
   the owner works in Notion. `publish-article.mjs` writes `Needs Revision` +
   `Blocked Reason` onto the row.
5. **Do not relax the build assertions.** The 70/160 char caps and
   `check-build.mjs` have each caught real defects more than once. Fix the text
   in Notion, not the cap.
6. **A handled rejection must not also fail the build.** A draft that breaches a
   cap is bounced to `Needs Revision`; the run only goes red if the Notion
   write-back itself failed and nothing else shipped.

## Machine gotchas — do not rediscover these

- **The Bash tool is flaky, not broken** (`cygheap read copy failed`). Try it
  once; fall back to the PowerShell tool. `git` under Bash sometimes fails with
  "paging file is too small" — just re-run.
- **PowerShell here-strings break on apostrophes** in commit messages. Write the
  message to a file and `git commit -F <file>`.
- **PowerShell writes a UTF-8 BOM on redirect.** Use the Write tool for files
  other tools read, or `[System.IO.File]::WriteAllText`.
- **The Browser pane cannot screenshot** (no frame compositing). Verify with
  `javascript_tool` reading computed styles / DOM. Tabs drift — pass `tabId`
  explicitly.
- **Do not run `npm run build` while the dev server is up** — heap OOM. Build
  runs from `site/`.
- **A blank line inside a raw HTML block in markdown terminates it** — never put
  one inside inline `<svg>` in an article.
- **Verify rendered output, not source.** Astro extracts CSS to hashed
  `/_astro/*.css`; grepping the HTML for a rule always fails. Fetch the asset.
  Check live routes for *content*, not just a 200, and cache-bust straight after
  a deploy (the CDN serves pre-merge HTML for a minute or two).
- **`nlm` auth expires often.** `nlm-relogin.sh` fixes it but force-kills the
  browser — check for open tabs first. `notebooklm-mcp` reports healthy but
  exposes no tools; use the `nlm` CLI.

## The verify gate

Nothing is "done" until:

```
cd site && npm run build      # dev server stopped; runs check-build
```

passes, and the changed live routes return 200 **with the content actually
present**. `/blog-verify` runs this.

## Seeing where it is stuck

`/blog-doctor` is one read-only pass over everything that stalls silently — the
Notion token, unrated radar ideas (the throughput gate), Needs Revision rows and
their reasons, any row carrying a `Blocked Reason`, unattended drafts ready too
long, ready drafts containing a Notion block `toMarkdown()` cannot convert,
published posts whose live URL does not serve, git state, build freshness — then
adds the GitHub Actions and local-routine state from `gh` and the
`scheduled-tasks` MCP. `site/scripts/doctor.mjs` is the engine (`npm run doctor`,
`--json`, `--deep`).

`/blog-dashboard` renders the same picture as one self-contained HTML page with
a copy-to-run command for every fix (`site/scripts/dashboard.mjs`).
