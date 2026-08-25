# Publishing — from Approved in Notion to live

## The short version

You flip `Draft Status` to **Approved** in Article Production. Within half an
hour a pull request appears with the article as markdown, **complete**: the
Executive TL;DR is enforced at generation, and artwork arrives with it —
routine-drawn from the Notion page when the artwork routine has been there,
deterministic fallback art otherwise. You read it through, merge, and it
deploys. Notion gets updated automatically once the URL is actually serving.

**Do not commit to the PR branch** — the poll regenerates
`notion/approved-articles` from main twice an hour and destroys anything added
there. Post-merge improvements (better artwork, edits) go to `main`.

Nothing else needs your laptop to be on.

---

## One-time setup — done

The workflows need a **`NOTION_TOKEN`** repository secret. It was added on
2026-08-25 and both halves have since been verified running in CI. It is the
same integration token `sync-news.mjs` uses locally, from
`C:/Users/Janmejai/Notion/.env`.

If it is ever rotated, replace it at
`https://github.com/janmejai2002/janmejai2002.github.io/settings/secrets/actions`
→ **New repository secret** → name `NOTION_TOKEN`.

Without it:

- `publish-from-notion` fails on every run.
- The `close-loop` job in the deploy workflow skips itself with a note and does
  not fail the deploy.

Both Notion databases must also be shared with that integration
(database → ••• → Connections). They already are.

---

## What runs, and when

| Piece | Trigger | What it does |
|---|---|---|
| `.github/workflows/publish-from-notion.yml` | every 30 min, or manually | Queries for `Draft Status = Approved`, writes markdown, builds, opens a PR |
| `site/scripts/publish-article.mjs` | called by the above, or by hand | Notion page → `src/content/blog/<slug>.md` |
| `close-loop` job in `deploy.yml` | after every Pages deploy from `main` | Verifies each URL is live, then writes `Published` + `Post URL` + `Publish Date` back to the radar row |
| `site/scripts/close-loop.mjs` | called by the above, or by hand | The reconciliation itself |

Run either by hand:

```bash
cd site
node scripts/publish-article.mjs --dry-run
node scripts/close-loop.mjs --dry-run
```

Both are safe to re-run. `publish-article` skips anything whose `notionId` is
already in the repo; `close-loop` skips rows already marked Published.

---

## Why a PR and not a straight push

A generated draft is not a finished post. It arrives with no artwork and no
Executive TL;DR, and it was written by a routine that nobody has read yet. The
PR is where that gets fixed, and the checklist is in the PR body.

The build — including `check-build.mjs` — has to pass before the PR is opened,
so a broken article never reaches your review queue.

---

## The two guardrails that matter

**`Approved` is yours alone.** No routine writes it. `publish-article.mjs` never
decides *whether* to publish; it only does the mechanical part after you have
decided. That is why the trigger is a human-only field.

**Nothing is recorded as Published until it is.** `close-loop.mjs` issues a real
request and refuses to touch Notion on anything but a 200. This exists because
the failure already happened: *The 95% Number* was live for a day with its row
still reading `Drafting` and an empty `Post URL`, because publishing and
recording-the-publish were two manual steps and only the first one got done.

---

## Frontmatter the generator produces

```yaml
title:        # the Notion page name — hard-capped at 70 chars
description:  # from "Meta description:" in the opening callout — capped at 160
pubDate:      # Draft Completed, else today
track:        # Track, kebab-cased — technical | business | basics | case-studies | talks
question:     # Reader Question, if set — capped at 120 chars
keywords:     # SEO Keywords, split on commas
readingTime:  # computed at ~220 wpm
notionId:     # back-reference; this is what close-loop.mjs matches on
```

`track` decides which section of the index the post files under. An unset or
unrecognised Track falls back to `technical` and logs a note rather than failing —
a taxonomy mistake should never block a publish. `question` is what prints above
the title; it is optional, and the five posts written before the field existed
do not have one.

`notionId` is the link between a file and its Notion row. Delete it and the row
will never be marked Published.

Artwork fields (`heroImage`, `heroImageDark`, `heroAlt`) **are** generated as
of 2026-08-26 — see "What the generator now handles itself" below.

---

## When it refuses

The caps are enforced in the script so you get a readable message instead of a
Zod error mid-build:

```
✗ "Gemini 3.7 Flash and DeepSeek V4: The Rise of Fast, Cheap Vision Models"
  — title is 71 chars, max 70. Shorten it in Notion.
```

That is a real example from the first run. Fix it in Notion, not in the repo —
the Notion row is the source of truth until the file exists.

`toMarkdown()` throws on any Notion block type it does not recognise rather than
dropping it. If a draft starts using tables or images, add the case; do not let
it silently lose a paragraph.

---

## When it refuses, it tells Notion

`publish-article.mjs` used to reject a malformed draft by printing a line and
exiting 1. The run went red in GitHub Actions and that was the entire signal —
so an approved article could sit unpublished indefinitely while the person who
approved it, who works in Notion, had no idea anything was wrong. That is
exactly what happened on 2026-08-25.

A blocking problem now writes itself back onto the row:

- `Draft Status` → **Needs Revision**, so it leaves the Approved queue
- `Blocked Reason` → the specific, actionable reason and a UTC timestamp

Fix the row, set it back to Approved, and the next run picks it up and clears
`Blocked Reason`. Non-blocking remarks (a missing TL;DR, an unknown Track) are
printed and do **not** fail the run or move the row.

## Making it reactive instead of polled

Both workflows accept a `repository_dispatch` event, so Notion can trigger them
directly rather than the pipeline waiting up to half an hour to notice:

| Workflow | Event type |
|---|---|
| `publish-from-notion.yml` | `notion-changed` |
| `sync-news.yml` | `news-changed` |

**To wire it up** (this needs you — it involves creating a token, which is not
something an agent should do on your behalf):

1. Create a **fine-grained personal access token** scoped to this repository
   only, with **Contents: read and write** and **Actions: read and write**. No
   other scopes, no other repos — that is the entire blast radius.
2. In Notion, on ✍️ Article Production, add an automation: **when `Draft Status`
   becomes `Approved` → Send webhook**, to
   `https://api.github.com/repos/janmejai2002/janmejai2002.github.io/dispatches`
   with headers `Authorization: Bearer <token>`,
   `Accept: application/vnd.github+json`, and body
   `{"event_type": "notion-changed"}`.
3. Repeat on the news archive database with `{"event_type": "news-changed"}` if
   you want the archive live too.

**The polling schedule stays.** It is the fallback: if the webhook is removed,
misconfigured, or its token expires, the pipeline gets slower rather than
silently stopping. Reactive on the happy path, polled underneath.

**Why this also gives you a live dashboard.** `/status/` is rendered at build
time from `status.json`. A rebuild-on-change means the page reflects Notion
within about a minute of an edit, without the site needing to call an API at
runtime — which it could not do anyway, since that would mean putting a Notion
token in the browser. Reactive rebuilds get the liveness without giving up the
static-site property or adding a server.

## Known limits

- **Polling, not push.** Notion cannot reach this repo directly without a public
  endpoint. Thirty minutes of latency is the cost, and for a blog it does not
  matter. If it ever does, a Notion webhook automation posting to GitHub's
  `repository_dispatch` would make it instant — at the price of storing a GitHub
  token inside Notion.
- **Second and later runs on the same PR branch** amend the existing
  `notion/approved-articles` branch rather than opening a new PR.

## What the generator now handles itself

Everything that used to be on the publish PR checklist except the read-through.

**The Executive TL;DR — enforced, not just wrapped.** The writer routine opens
the article with an H2 reading exactly `Executive TL;DR` and 4-6 bullets, as an
ordinary Notion heading and list. `wrapTldr()` in `publish-article.mjs` wraps
that section in the styled `.tldr` plate. The blank lines it inserts around the
content are load-bearing — they are what let the markdown inside the div still
parse as markdown (the *opposite* of the inline-`<svg>` rule in HANDOFF §6). As
of 2026-08-26 a draft with **no** TL;DR is blocked: the row is moved to Needs
Revision with the reason, because the first two pipeline articles proved a
log-only note is a requirement being quietly missed. The artwork routine
(below) backfills a missing TL;DR at Draft Ready time, so a bounce should be
rare. `check-build` also asserts the plate on every article page.

**A leading body H1 is stripped.** The layout renders the frontmatter title as
the page `<h1>`; both first-run articles opened with a duplicate `# Title`,
which also sat above the TL;DR heading and silently defeated the wrap.
`check-build` asserts exactly one `<h1>` per page.

**Artwork.** Two sources, in order:

1. **Routine-authored.** The `artwork-routine` scheduled task (every 4 hours,
   :35 past 01/05/09/13/17/21) picks up `Draft Ready`/`Approved` rows, reads
   the article and its Artwork brief, draws the plate per `docs/ARTWORK.md`,
   and files it into the Notion page as an `## Artwork SVG` section — an
   `Alt:` line plus a code block. `liftArtworkSvg()` extracts and validates it
   (palette placeholders, no hex, alt present), writes
   `assets-src/art/<slug>.svg`, and wires the hero frontmatter. Travelling
   through Notion means no new credential and nothing for the poll to destroy.
2. **Deterministic fallback** (`scripts/lib/fallback-art.mjs`): an on-spec
   plate seeded from the slug — track accent, one deliberate imperfection,
   grain — byte-identical on every poll. It cannot mean anything; it exists so
   no article ever ships bare. Replace it on `main` after merge if it deserves
   better.

A pre-existing hand-drawn `assets-src/art/<slug>.svg` is never overwritten;
hero fields are left to its author. The publish workflow renders new art with
`node scripts/make-images.mjs --new-art-only` before building — new sources
only, fixed assets untouched, because sharp output is not byte-stable across
environments and re-encoding everything would churn the PR diff.

**The read-through stays manual, deliberately.** That is the one step worth a
person's time, and after the 2026-08-25 fact-check it is the step that matters
most.

## IndexNow

After every successful Pages deploy from a push, the `indexnow` job in
`deploy.yml` diffs the pushed range, maps changed files to routes, and submits
only those URLs via `scripts/indexnow.mjs`. The key is a static text file in
`site/public/` (no login, no token — nothing to expire). The script treats
`429` as back-off and never exits non-zero, so a ping can never fail a deploy.
Bing, Yandex, Seznam and Naver consume IndexNow; Google does not.
