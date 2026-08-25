# Handoff — start here in a new chat

Paste the block at the bottom into a fresh session. Everything above it is
context for whoever reads this file directly.

Last session ended 2026-08-26 (second session that day), at commit `c25eba0` on
`main`. Working tree clean, everything pushed, build green, `check-build`
passing, 11 pages.

**That session did queue items 1–4:** the rename to `wAIbi-sabi` with a wordmark
component and a new favicon/mark, the BSchool and Setups heading fixes, the
rewrite of `/blog/how-this-blog-builds-itself/`, and — found along the way —
`/status/` was only counting three of the five themes. Items 5, 6 and 7 below
are untouched.

The blocked-on-owner list is unchanged and was re-checked: Actions still cannot
open PRs (`can_approve_pull_request_reviews: false` via the API), so the two
finished articles are still sitting on the branch.

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

1. **IndexNow.** The owner found it and it fits their stated preference for auth
   that cannot expire — the key is a static text file at the site root, no login,
   no token. Wire a ping into `deploy.yml` after a successful deploy.
2. **Verify motion in a real browser.** The Browser pane never fires
   `requestAnimationFrame`, so the WebGL grain field, the theme-card mark
   animations and every CSS transition are correct by construction but have
   never been seen running. `npm run dev --prefix site` and look. The new
   wordmark and favicon have also only been checked in the built HTML and as
   rendered PNGs, never on a live tab.
3. **`/projects/` and `/news/` still have not had the UI pass** the index and
   the article template got. Their headings are now right; their layouts are
   still the older generation.
4. **Ideas, untouched:** persist the claim ledger and publish a corrections log;
   a link-rot and claim-drift watchdog over published posts; reader analytics
   feeding back into the radars.

### Done 2026-08-26 (second session)

- **Renamed to `wAIbi-sabi`.** `src/components/Wordmark.astro` renders the name
  with the `AI` in hanko and `text-transform: none` so nothing re-cases it; the
  literal string is used where the name is data (titles, JSON-LD, RSS, the OG
  card). JSON-LD keeps `alternateName: 'Wabi Sabi'`. The favicon seats a
  geometric `AI` — strokes, not a font, so it renders anywhere — inside the open
  ensō, which stays the deliberate imperfection.
- **Headings match the nav:** BSchool News Archive, Setups, and the About link.
  Routes still unchanged, deliberately.
- **`/status/` now shows all five themes.** `sync-status.mjs` only tallied three,
  so Case Studies and Talks were invisible. The two writer themes print `—` for
  topics-found rather than a misleading `0`, since they skip the radar.
- **`/blog/how-this-blog-builds-itself/` rewritten** and given an `updatedDate`.

## Traps that cost real time last session

- **The Bash tool's cygwin heap error is intermittent, not permanent.** It
  failed all of 2026-08-25 and worked for the whole of the second 2026-08-26
  session. Try it once; fall back to PowerShell if it dies. Two things that do
  still bite in Bash: `git` occasionally fails with "the paging file is too
  small" (re-run it), and PowerShell mangles UTF-8 in `Select-String` output —
  read files with the Read tool when characters matter.
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
Continuing work on the wAIbi-sabi blog at C:\Users\Janmejai\PluginsClaude
(live at https://janmejai2002.github.io, repo janmejai2002/janmejai2002.github.io).

Read docs/HANDOFF.md first — it documents the whole system, the Notion control
plane, the publish pipeline, the design and artwork specs, and the gotchas.
Then read docs/HANDOFF-NEXT-SESSION.md for where the last session stopped and
what is queued. Then docs/PUBLISHING.md and docs/ARTWORK.md before touching
publishing or images.

Two environment facts up front: the Bash tool's cygwin heap error is
intermittent — try it once, fall back to PowerShell if it dies. And the Browser
pane cannot screenshot and never composites, so verify with javascript_tool
reading computed styles, pass tabId explicitly, and do not trust anything that
depends on requestAnimationFrame.

State: renamed to wAIbi-sabi, five themes, seven scheduled routines, 5
published articles, 2 more waiting on a branch. Google and Bing verification is
live.

Start with these, in order:

1. Wire IndexNow into deploy.yml after a successful deploy. The key is a static
   text file at the site root — no login and no token, which is the property
   this system requires of anything unattended.
2. Run the site in a real browser and actually look at it. Nothing that depends
   on requestAnimationFrame has ever been seen running: the WebGL grain field,
   the theme-card mark animations, every CSS transition. The new wordmark and
   favicon have only been checked in built HTML and as rendered PNGs.
3. Give /projects/ and /news/ the UI pass the index and the article template
   got. Their headings are correct now; the layouts are a generation behind.

Verify with `npm run build` in site/ (dev server must be stopped; it runs
check-build). Commit in logical chunks and push — pushing deploys.

Before you start, tell me anything in that queue you think is the wrong
priority, and check whether the owner has yet enabled "Allow GitHub Actions to
create and approve pull requests" in repo settings, because two finished
articles are blocked on it. Check it with:
gh api repos/janmejai2002/janmejai2002.github.io/actions/permissions/workflow
```
