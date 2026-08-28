# Handoff — start here in a new chat

Session `pluginsclaude` ended 2026-08-28. **10 commits on local `main`, ahead of
`origin/main`, NOT pushed.** Build green, `check-build` passing, `npm run doctor`
= 8 ok / 3 warn / 0 fail. The push is deliberately left to the owner — it
deploys, and the workflow changes want an eyeball first.

---

## First thing: push, then watch the deploy

```
cd C:\Users\Janmejai\PluginsClaude
git log --oneline origin/main..HEAD      # the 10 commits below
git push origin main
gh run watch --repo janmejai2002/janmejai2002.github.io
```

The 10 commits, oldest first:

| # | Commit | What |
|---|---|---|
| 1 | Surface unattended pipeline failures on the Notion row | `flagBlocked`/`clearBlockedReason` in `lib/notion.mjs`; `close-loop` writes a Blocked Reason; `flag-pipeline-failure.mjs` + `sweep-stuck-rows.mjs` + `sweep-stuck.yml` |
| 2 | `publish-article --check` preflight; isolate a bad draft | `--check <id>` runs one row through every gate; per-draft `try/catch` around `toMarkdown`; `blocksDeep` + table support |
| 3 | headless pipeline doctor + ops dashboard | `doctor.mjs`, `dashboard.mjs`, `npm run doctor` / `dashboard` |
| 4 | Docs: cadence daily, token audit, failure-surfacing | HANDOFF / token-audit §5 / blog-routines skill |
| 5 | Vendor the `waibi-sabi-os` plugin into the repo | `plugin/` — it was enabled from this path but untracked |
| 6 | site dev-server launch config | `site/.claude/launch.json` |
| 7 | Push a failure notification to the owner's phone | `notify.mjs` + threaded into the 3 failure scripts + a catch-all `if: failure()` step; `NOTIFY_TOPIC` env wired through 3 workflows |
| 8 | `scripts/notion.mjs` — Notion as a CLI, not an MCP | 5 verbs over `lib/notion.mjs`; read verbs verified; writes need `--commit`; refuses `Approved` |
| 9 | Scaffold `routines/` — headless `claude -p` runner | `run.ps1`, empty `mcp.json`, scoped `config/`, `schtasks.md`, `README.md`; `log-run.mjs` telemetry. **Not activated.** |
| 10 | Docs: notify + notion CLI + routines migration path | token-audit §5.4, HANDOFF §3, PUBLISHING, LESSONS |

## Also done live (not in git)

- **Radar crons staggered.** `business-radar` → `12 7 * * *`, `basics-radar` →
  `16 7 * * *` (`daily-ai-seo-radar` stays `0 7`). They shared `10 7` before.
- **`vibevoice` removed** from the MCP config (`claude mcp remove vibevoice`) —
  it failed to connect on every cold start.

## What is the owner's to do — the token-cost migration

Full detail + order in `routines/README.md` and `docs/research/token-and-cloud-audit.md` §5.4. In short:

1. **Prune the ~22 unused claude.ai connectors** at
   `claude.ai/customize/connectors` (keep Notion; Gmail/Drive only if a routine
   needs them). Biggest single saving, zero code.
2. **Set up the phone push.** Pick a private topic string; add it as repo secret
   `NOTIFY_TOPIC` (Settings → Secrets → Actions); install the ntfy app and
   subscribe. Add `NOTIFY_TOPIC=` to `C:/Users/Janmejai/Notion/.env` for local
   runs. Until then `notify.mjs` is a no-op.
3. **Rewrite the 7 routine prompts** to call `node site/scripts/notion.mjs`
   instead of `notion-query-data-sources` / `notion-create-pages` / `notion-fetch`,
   and `WebSearch`/`WebFetch` instead of "Brave Search MCP". One at a time, diff
   carefully — same files the in-app runner uses. This is also a partial saving
   *before* the `run.ps1` cutover: a prompt that never names a Notion MCP tool
   stops expanding the ~40-tool schema.
4. **Verify `notion.mjs file-idea` and `promote`** against the live DB schema
   (property names, the `Article ↔ Source Idea` relation) before the writer
   prompts depend on them.
5. **Cut over to `run.ps1`**, one routine at a time, radars first: run by hand,
   compare the Notion result to a normal run, then add to Task Scheduler
   (`routines/schtasks.md`) and `update_scheduled_task { enabled: false }` on the
   in-app twin. Keep twins disabled-not-deleted for a week.
6. **Decide on `playwright`** — still in the global MCP config, duplicates the
   built-in browser pane, no routine uses it.

Also: `ai-article-writer` only picks up radar ideas rated 4 or 5 — ratings are
the throughput gate, not cadence.

## Untracked, left for the owner's call

`ai-writing-signals/` at the repo root is a separate Claude Code plugin, not
part of this blog. It is untracked; decide whether it belongs in this repo or
its own.

---

## What landed this session (all deployed and verified live)

**The publish pipeline's three known defects — fixed at the generator, plus a
fourth nobody knew about.**

1. `publish-article.mjs` used the Notion `api()` helper **without ever importing
   it**, so the entire write-back-to-Notion path (Needs Revision, Blocked
   Reason) had thrown `ReferenceError` since birth, swallowed by its own catch
   block. Fixed; recorded in `docs/LESSONS.md`.
2. A leading body `# Title` is now stripped (it also silently defeated the TL;DR
   wrap, which is why both defects always appeared together).
3. A missing `Executive TL;DR` now **blocks** the publish and bounces the row to
   `Needs Revision` with the reason, instead of being a log-only note.
4. `check-build.mjs` asserts exactly one `<h1>` per page and a `.tldr` plate on
   every article. Both TL;DR-less live articles were backfilled by hand.

**Artwork is automated.** New `artwork-routine` task (every 4h at :35) reads
Draft Ready/Approved rows, draws the plate per `docs/ARTWORK.md`, and files the
SVG **into the Notion page** as an `## Artwork SVG` section (`Alt:` line + code
block). `publish-article.mjs` extracts and validates it; if absent,
`scripts/lib/fallback-art.mjs` generates a deterministic on-spec plate seeded
from the slug. **Artwork travels through Notion, never a git commit** — that is
the real fix for the poll destroying the PR branch. A PR now arrives complete;
the only human step left is a read-through.

**IndexNow** submits changed URLs after every deploy (static key file at the
site root, no credential to expire). **robots.txt** allows every
retrieval/search crawler explicitly and blocks pure training crawlers.
**`/llms.txt`** is generated from the content collection.

**Umami analytics is LIVE** — website ID `df2f7d8f-549a-412b-a2d5-be4d82ab4426`
in `site/src/seo.ts`, production-only. Google Search Console and Bing Webmaster
are verified and the sitemap is submitted to both.

**The logo was chosen by the owner: kintsugi + the caret.** An ochre fracture
runs through the wordmark with the pieces set out of true, and the final `i` is
a blinking caret (steady under reduced-motion). The rail uses
`<Wordmark plain />`. Favicon, touch icon and OG card are the kintsugi plate;
the ensō is retired. Favicon URLs carry `?v=2` to defeat browser favicon caching.

**The UI warmth pass** (from `docs/research/reading-experience.md`): theme hub
pages at `/technical/` `/business/` `/basics/` `/case-studies/` `/talks/`
(`src/pages/[track].astro`), an end-of-article block with a "Next question"
card, a serif drop cap in the track accent (first use of the long-dead
`--serif` token), a byline line, a footer colophon, honest empty-state copy
("Still taking root"), "Featured" renamed "Latest", cross-document View
Transitions, and the track marks finally drawing themselves in (the
`pathLength="100"` scaffolding was always there, unwired). `/projects/` got the
width pass it never had — its card was capped at the 44rem reading measure on
an 80rem page, leaving the right half of the page empty.

**The five themes now live once** in `site/src/data/tracks.ts`, shared by the
index, the hub pages and the article layout.

**Docs written:** `docs/MONETISATION-PLAN.md` (the plan the brief asked for) and
`docs/research/{ai-citability,monetisation,reading-experience,routine-review}.md`.

**Routine review applied** (`docs/research/routine-review.md`): all three writer
prompts were telling themselves a missing TL;DR was cosmetic; `business-radar`
cited a phantom sibling task from an unrelated project; `ai-article-writer`
checked for the retired `notebooklm-mcp`; `daily-ai-seo-radar` lacked the
never-set-Approved guardrail. All fixed. `case-studies-writer` was then
rewritten at the owner's request — broadened from marketing-only to nine
functional themes, with a "What you could apply" payoff section aimed at
working professionals.

---

## Waiting on the owner — nothing is blocked on code

1. **Sign off the sponsorship policy** drafted in `docs/MONETISATION-PLAN.md` §5,
   then publish it as a page. The clause needing explicit attention: a sponsor's
   products become *ineligible* for Case Studies.
2. **Rate the 5 unrated radar ideas.** Nothing writes until something is 4 or 5.
   This is the actual throughput gate.
3. **Buttondown newsletter** — owner deferred it. Account is theirs to create;
   form and digest wiring is about a day once it exists.
4. **A consulting line on `/about/`** — the monetisation plan's finding is that
   consulting is the only model with no audience threshold and the nearest
   realistic revenue. Owner decides which services to invite inquiries for.
5. **The owner's message that ended mid-sentence.** They wrote "...continue with
   the routine review and monetisation plan and also" — the third item was never
   said. Ask.

## Watch for

- **Google Search Console showed "Sitemap could not be read"** right after
  submission on 2026-08-26. The sitemap is valid and serving (verified by
  fetch); this is normal for a freshly submitted sitemap on a new property. If
  it still says that from 2026-08-28 onward, investigate properly.
- **The first `artwork-routine` run** had not happened when the session ended.
  Check it filed a well-formed `## Artwork SVG` section and that
  `publish-article.mjs` accepted it rather than falling back to deterministic art.
- **The first pipeline article since the fixes** — confirm it arrives with
  artwork and a TL;DR and needs no human commit to the branch.

## Traps that still bite

- **Never commit to the `notion/approved-articles` branch.** The poll
  regenerates it from main twice an hour and destroys additions. Improvements go
  to `main` after merge.
- `npm run build` must run from `site/`, with the dev server stopped.
- The Bash tool's cygwin failure is intermittent, not permanent — try it, fall
  back to PowerShell. Bash heredocs also choke on backticks and quotes in long
  documents; use the Write tool for those.
- PowerShell here-strings break on apostrophes in commit messages; write the
  message to a file and use `git commit -F`.
- PowerShell writes a UTF-8 BOM on redirect; use `[System.IO.File]::WriteAllText`.
- The Browser pane cannot screenshot and drifts between tabs — pass `tabId`
  explicitly.
- `docs/HANDOFF.md` is the system reference. `docs/LESSONS.md` is the running
  notes file: read it at session start, add to it as you learn.

---

## The prompt to paste

```
Picking up the wAIbi-sabi blog (C:\Users\Janmejai\PluginsClaude, live at
https://janmejai2002.github.io). Read docs/HANDOFF-NEXT-SESSION.md first — it
says where the last session stopped — then docs/HANDOFF.md for the system,
docs/LESSONS.md for running notes, and PUBLISHING.md / ARTWORK.md before you
touch publishing or images.

First job, from my last instruction that didn't get done: make the weekly
routines daily. business-radar and basics-radar are weekly and should be daily.
case-studies-writer is twice weekly — the handoff says its own prompt argues
against increasing that rate, so tell me what you think before changing it.

Then: whatever else needs a fix, do it. From today we run this blog properly.

Verify with `npm run build` in site/ (dev server stopped). Check live routes for
actual content, not just a 200. Commit in logical chunks and push — pushing
deploys. Never set Draft Status = Approved on anything.
```
