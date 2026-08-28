# Handoff — start here in a new chat

Last session ended 2026-08-26 (third session that day), at commit `f7f249f` on
`main`. Working tree clean, everything pushed, build green, `check-build`
passing, 18 pages, 7 published articles.

**The owner's standing brief is still `docs/BRIEF-NEXT-PHASE.md`.** Most of it
is now done — see below for what landed and what is left.

---

## Cadence change — DONE (2026-08-28), with two follow-ups

The owner's instruction ("change routines to be daily instead of the weekly")
was carried out. All three radars, `case-studies-writer` and `talks-writer` now
run daily; each routine's prompt text was updated to match (`case-studies-writer`
§ now reads *"Cadence is daily, and the quality bar — not the calendar — decides
whether you file"*).

Live crons (`list_scheduled_tasks`, 2026-08-28):

| Routine | Cron | Fires |
|---|---|---|
| `daily-ai-seo-radar` | `0 7 * * *` | 07:10 |
| `business-radar` | `10 7 * * *` | 07:10 |
| `basics-radar` | `10 7 * * *` | 07:10 |
| `talks-writer` | `30 8 * * *` | 08:33 |
| `case-studies-writer` | `45 8 * * *` | 08:52 |
| `ai-article-writer` | `0 */4 * * *` | every 4h |
| `artwork-routine` | `35 1,5,9,13,17,21 * * *` | every 4h at :35 |

**Follow-up 1 — the radars collide.** `business-radar` and `basics-radar` have
the *same* cron (`10 7 * * *`) and both overlap `daily-ai-seo-radar`. Three cold
sessions start inside ten minutes. Stagger them (e.g. business `12 7`, basics
`16 7`) and fix `plugin/skills/blog-routines/SKILL.md` + `docs/HANDOFF.md`,
which still claim `:20` / `:16`.

**Follow-up 2 — token cost.** See `docs/research/token-and-cloud-audit.md` §5
(added 2026-08-28). 26 claude.ai MCP connectors are now connected (the 26 Aug
audit said zero); no routine restricts its tool surface; `vibevoice` fails on
every cold start. Cadence is still not the lever — the tool surface is.

Also: there are unrated radar ideas in Notion, and `ai-article-writer` only
picks up ideas rated 4 or 5. More radar runs without more ratings just grows the
queue — ratings are the throughput gate, not cadence.

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
