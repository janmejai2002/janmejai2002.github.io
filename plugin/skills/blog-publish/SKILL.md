---
name: blog-publish
description: The wAIbi-sabi publish pipeline operating manual — the two paths, the AUTO_TRACKS switch, the frontmatter the generator produces, the guardrails, the dry-run commands, and what happens when a draft is refused. Use whenever a task touches publishing, Draft Status, the publish-from-notion PR, close-loop, publish-article.mjs, or "why isn't this article live".
---

# Publishing — Notion to live

Canonical: `docs/PUBLISHING.md`. This is the working summary. Read the full doc
before changing pipeline code.

## The two paths — the Track decides

| Path | Tracks | What you do |
|---|---|---|
| **Unattended** | Talks, Case Studies, Basics | Nothing. Routine files a finished draft → commits to `main` → deploys. |
| **Reviewed** | Technical, Business | Flip `Draft Status = Approved` in ✍️ Article Production → a PR appears → read it → merge → deploys. |

The switch is the `AUTO_TRACKS` array in `site/scripts/publish-article.mjs`.
Moving a track between paths = editing that one array.

Either way the article arrives **complete**: Executive TL;DR enforced at
generation, artwork carried through the Notion page, Notion reconciled
automatically once the URL serves.

## The pieces

| Piece | What it does |
|---|---|
| `site/scripts/lib/notion.mjs` | REST helpers + blocks→markdown. Throws on unknown block types rather than dropping content. |
| `site/scripts/publish-article.mjs` | Approved / unattended `Draft Ready` rows → `src/content/blog/<slug>.md`. Enforces the 70/160 caps itself. |
| `site/scripts/close-loop.mjs` | Issues a real request; writes `Published` + `Post URL` + `Publish Date` back only on a 200. |
| `.github/workflows/publish-from-notion.yml` | Polls every 30 min (also `repository_dispatch: notion-changed`), builds, pushes unattended articles to `main`, opens a PR for the rest. |
| `close-loop` job in `deploy.yml` | Runs after every Pages deploy. `continue-on-error`. |
| `site/scripts/sync-news.mjs` + `sync-news.yml` | Refreshes `src/data/news.json` from the news DB daily at 04:35; commits straight to `main`. |

## Run by hand — both are safe to re-run

```bash
cd site
node scripts/publish-article.mjs --dry-run
node scripts/close-loop.mjs --dry-run
```

`publish-article` skips anything whose `notionId` is already in the repo;
`close-loop` skips rows already marked Published.

## Frontmatter the generator produces

```yaml
title:        # Notion page name — hard-capped at 70 chars
description:  # "Meta description:" in the opening callout — capped at 160
pubDate:      # Draft Completed, else today
track:        # Track, kebab-cased — technical | business | basics | case-studies | talks
question:     # Reader Question, if set — capped at 120
keywords:     # SEO Keywords, split on commas
readingTime:  # computed at ~220 wpm
notionId:     # back-reference; close-loop.mjs matches on this. Delete it and the row is never marked Published.
```

## The guardrails

- **`Approved` is the owner's alone.** No routine writes it on any track. On
  unattended tracks publishing does not wait for it, but no routine may set it.
- **Never commit to `notion/approved-articles`.** `peter-evans/create-pull-request`
  resets that branch from `main` on every poll. Artwork, a TL;DR, or any edit
  added there is wiped at the next poll. Improvements go on `main` after merge.
- **The automated gates apply to every track equally** and are the real safety
  net: title length, meta description, mandatory Executive TL;DR, artwork
  rendering, full `npm run build` including `check-build`. A draft failing any of
  them is moved to `Needs Revision` with the reason on the Notion row — never
  published.
- **Nothing is recorded as Published until it is.** `close-loop.mjs` refuses to
  touch Notion on anything but a 200. *The 95% Number* was once live for a day
  with its row still reading `Drafting`.
- **A handled rejection must not also fail the run.** `publish-article.mjs` exits
  non-zero only when the Notion write-back itself failed and nothing else
  shipped.

## When it refuses

```
✗ "Some Very Long Title…" — title is 71 chars, max 70. Shorten it in Notion.
```

Fix it in Notion — the row is the source of truth until the file exists. Set
`Draft Status` back to `Approved` (reviewed tracks) and the next run picks it up
and clears `Blocked Reason`. `toMarkdown()` throws on any unrecognised Notion
block type — add the case, do not let it silently drop a paragraph.

## Making it reactive

Both workflows accept `repository_dispatch` (`notion-changed`, `news-changed`)
so a Notion automation can trigger them instantly instead of waiting for the
poll. Wiring it needs a fine-grained PAT (Contents + Actions, this repo only) —
that is the owner's to create. The polling schedule stays as the fallback.

Note: a push with the default `GITHUB_TOKEN` does **not** trigger other
workflows. Any bot that commits to `main` must dispatch `deploy.yml` explicitly
(and needs `actions: write`) or its commit sits unpublished.
