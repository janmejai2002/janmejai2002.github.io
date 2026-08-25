# Publishing — from Approved in Notion to live

## The short version

You flip `Draft Status` to **Approved** in Article Production. Within half an
hour a pull request appears with the article as markdown. You add artwork and a
TL;DR, merge, and it deploys. Notion gets updated automatically once the URL is
actually serving.

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
track:        # Track, lowercased — systems | practice | demand
question:     # Reader Question, if set — capped at 120 chars
keywords:     # SEO Keywords, split on commas
readingTime:  # computed at ~220 wpm
notionId:     # back-reference; this is what close-loop.mjs matches on
```

`track` decides which section of the index the post files under. An unset or
unrecognised Track falls back to `systems` and logs a note rather than failing —
a taxonomy mistake should never block a publish. `question` is what prints above
the title; it is optional, and the five posts written before the field existed
do not have one.

`notionId` is the link between a file and its Notion row. Delete it and the row
will never be marked Published.

Artwork fields are **not** generated — `heroImage`, `heroImageDark` and
`heroAlt` are added by hand after the piece is drawn. See `docs/ARTWORK.md`.

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

## Known limits

- **Polling, not push.** Notion cannot reach this repo directly without a public
  endpoint. Thirty minutes of latency is the cost, and for a blog it does not
  matter. If it ever does, a Notion webhook automation posting to GitHub's
  `repository_dispatch` would make it instant — at the price of storing a GitHub
  token inside Notion.
- **The generator does not write a TL;DR.** The other posts open with one, so a
  generated article looks inconsistent until someone adds it.
- **Second and later runs on the same PR branch** amend the existing
  `notion/approved-articles` branch rather than opening a new PR.
