# Handoff — start here in a new chat

Paste the block at the bottom into a fresh session. Everything above it is
context for whoever reads this file directly.

Last session ended 2026-08-26, at commit `ef7a5a7` on `main`. Working tree clean,
everything pushed, build green, `check-build` passing, 11 pages.

---

## What changed last session, in one paragraph

The blog went from one undifferentiated stream to **five themes** (Technical,
Business, Basics, Case Studies, Talks), the home page was rebuilt around a
centred masthead and a sortable table, `/status/` was added, the news archive
sync was automated, two live articles were fact-checked and corrected, the
writer routine was hardened with a verbatim-quote claim ledger, and the publish
pipeline learned to report its own failures back into Notion. Google and Bing
verification went live at the very end.

## The five themes

| Track id | Notion `Track` | Accent | Routine |
|---|---|---|---|
| `technical` | Technical | mizu | `daily-ai-seo-radar` — daily 07:10 |
| `business` | Business | ochre | `business-radar` — Tue 07:20 |
| `basics` | Basics | plum | `basics-radar` — Thu 07:16 |
| `case-studies` | Case Studies | moss | `case-studies-writer` — Mon/Thu 08:40 |
| `talks` | Talks | hanko | `talks-writer` — daily 08:33 |

Plus `ai-article-writer` every 4h, which picks up radar ideas rated 4 or 5.

**The radars file Radar Ideas and wait for a rating. The two writers file drafts
directly at `Draft Ready`.** No routine may ever set `Approved`.

**If you rename a theme again**, five places hardcode the strings: the Zod enum
in `site/src/content.config.ts`, `TRACKS` in `site/scripts/publish-article.mjs`,
`TRACKS`/`LABELS` in `site/src/pages/index.astro`, the `TRACK` map in
`site/src/layouts/Post.astro`, and the `Track` value written by each routine
prompt in `~/.claude/scheduled-tasks/`. The last one was missed the first time
and would have broken every radar run.

---

## Blocked on the owner — nothing else moves until these happen

1. **Allow Actions to open PRs.** github.com/janmejai2002/janmejai2002.github.io
   → Settings → Actions → General → Workflow permissions → tick *"Allow GitHub
   Actions to create and approve pull requests"*. Off by default, and it is why
   `publish-from-notion` has never once succeeded at its final step. **Two
   finished articles are sitting on the `notion/approved-articles` branch right
   now** waiting for this.
2. **Click Verify** in Google Search Console (URL-prefix property) and Bing
   Webmaster Tools. Both tokens are live and confirmed serving. Then submit
   `sitemap-index.xml`.
3. **Rate the 5 unrated radar ideas.** Nothing downstream moves without a 4 or 5.
4. **Optional but high value — make it reactive.** Fine-grained PAT (this repo
   only, Contents + Actions read/write) → Notion automation on *Draft Status is
   Approved* → webhook to
   `https://api.github.com/repos/janmejai2002/janmejai2002.github.io/dispatches`
   with body `{"event_type":"notion-changed"}`. Full steps in `docs/PUBLISHING.md`.
   Both workflows already accept it; polling stays as the fallback.

---

## Queued work, roughly in priority order

1. **Rename the blog to `wAIbi-sabi`.** Approved last session, not started. It is
   in `site/src/layouts/Base.astro` (nav + footer), `SEO.astro` (`siteName`,
   JSON-LD), every page's `<Base title>`, `index.astro`'s masthead, `README`, and
   the docs. Decide whether the wordmark styles the `AI` differently — that is
   the whole point of the name and the reason it is worth doing carefully.
2. **A logo.** Requested, "keep it thoughtful". Must obey `docs/ARTWORK.md`:
   geometry, flat fills, palette tokens not hex, one deliberate imperfection.
   The obvious idea — the `AI` hiding inside `wabi` — is a typographic move, so
   consider a wordmark rather than a mark. Needs to work at favicon size.
3. **Page headings still say the old nav words.** `/news/` is titled "Interview
   News Archive" while the tab says BSchool; `/projects/` says "Projects" while
   the tab says Setups; `about.astro` has an inline link labelled "Projects".
4. **`/blog/how-this-blog-builds-itself/` is badly out of date.** It describes two
   routines and no themes. There are now seven routines, five themes, a status
   page, an automated news sync, a claim ledger, and a failure-reporting loop.
   On a blog whose premise is that it documents itself, this is the most
   conspicuous debt on the list.
5. **IndexNow.** The owner found it and it fits their stated preference for auth
   that cannot expire — the key is a static text file at the site root, no login,
   no token. Wire a ping into `deploy.yml` after a successful deploy.
6. **Verify motion in a real browser.** The Browser pane never fires
   `requestAnimationFrame`, so the WebGL grain field, the theme-card mark
   animations and every CSS transition are correct by construction but have
   never been seen running. `npm run dev --prefix site` and look.
7. **Ideas 1–3 from the earlier list, untouched:** persist the claim ledger and
   publish a corrections log; a link-rot and claim-drift watchdog over published
   posts; reader analytics feeding back into the radars.

---

## Traps that cost real time last session

- **The Bash tool is broken on this machine** (cygwin heap error). Use
  PowerShell. It also mangles UTF-8 in `Select-String` output — read files with
  the Read tool when characters matter, and set `$env:PYTHONIOENCODING="utf-8"`
  before Python that prints anything non-ASCII.
- **PowerShell writes a UTF-8 BOM** when you pipe or redirect to a file, which
  breaks `JSON.parse` and `json.load`. Read back with `utf-8-sig`, or write with
  `[System.IO.File]::WriteAllText`.
- **The Browser pane cannot screenshot and never composites**, so rAF and CSS
  transitions do not advance. Computed styles read mid-transition return the
  *start* value — kill transitions before reading, or you will diagnose a bug
  that is not there.
- **`git push` sometimes exceeds a 3-minute tool timeout** after the commit has
  already succeeded. Re-run the push alone rather than re-committing.
- **A blank line inside inline `<svg>` in markdown terminates the HTML block.**
  But the blank lines inside the `.tldr` div are load-bearing and must stay.
  Opposite rules, same file type.
- **Notion cannot recolour an existing select option** — it errors. Add new
  options, migrate rows, then drop the old ones.
- **A push made with the default `GITHUB_TOKEN` does not trigger other
  workflows.** Any bot that commits to main must dispatch `deploy.yml`
  explicitly and needs `actions: write`.

---

## The prompt to paste

```
Continuing work on the Wabi Sabi blog at C:\Users\Janmejai\PluginsClaude
(live at https://janmejai2002.github.io, repo janmejai2002/janmejai2002.github.io).

Read docs/HANDOFF.md first — it documents the whole system, the Notion control
plane, the publish pipeline, the design and artwork specs, and the gotchas.
Then read docs/HANDOFF-NEXT-SESSION.md for where the last session stopped and
what is queued. Then docs/PUBLISHING.md and docs/ARTWORK.md before touching
publishing or images.

Two environment facts up front: the Bash tool is broken here (cygwin heap
error) — use PowerShell. And the Browser pane cannot screenshot and never
composites, so verify with javascript_tool reading computed styles, pass tabId
explicitly, and do not trust anything that depends on requestAnimationFrame.

State: five themes, seven scheduled routines, 5 published articles, 2 more
waiting on a branch. Google and Bing verification is live.

Start with these, in order:

1. Rename the blog to wAIbi-sabi everywhere — nav, footer, SEO siteName,
   JSON-LD, page titles, masthead, README, docs. The name hides "AI" inside
   "wabi", so decide how the wordmark treats those two letters; that is the
   point of it.
2. Design a logo per docs/ARTWORK.md — geometry, flat fills, palette
   placeholder tokens never hex, one deliberate imperfection, and it has to
   still read at favicon size.
3. Fix the page headings that still say the old nav words: /news/ is titled
   "Interview News Archive" (tab says BSchool), /projects/ says "Projects" (tab
   says Setups), and about.astro has an inline link labelled "Projects".
4. Rewrite /blog/how-this-blog-builds-itself/ — it describes two routines and no
   themes, and is now years out of date relative to the system it documents.

Verify with `npm run build` in site/ (dev server must be stopped; it runs
check-build). Commit in logical chunks and push — pushing deploys.

Before you start, tell me anything in that queue you think is the wrong
priority, and check whether the owner has yet enabled "Allow GitHub Actions to
create and approve pull requests" in repo settings, because two finished
articles are blocked on it.
```
