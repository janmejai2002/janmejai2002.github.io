# Handoff — wAIbi-sabi blog system

You are picking up a working, deployed system. Read this whole file before touching anything.
Last updated 2026-08-25.

---

## 0. Editorial spine — read this before writing or prompting anything

Every article answers **a question a working professional actually asked about
AI**. Not a topic, not a category — a question someone would type or ask a
colleague. It lives in `Reader Question` on the Notion row and in `question:` in
frontmatter, and it prints above the title and on the index card.

Five **tracks**, each with its own audience, its own feeding routine, and its
own accent. A post's `track` decides which section of the index it files
under, and each track has a permanent page at `/<track-id>/` as of 2026-08-26.
The three radar tracks wait for a human rating; the two writer tracks draft
directly at `Draft Ready`.

| Track | Accent | Reader | Routine |
|---|---|---|---|
| `technical` | `--mizu` | Engineers and people who build with AI | `daily-ai-seo-radar` (daily 07:10) |
| `business` | `--ochre` | Consultants, analysts, marketers, founders — **not** engineers | `business-radar` (Tue 07:20) |
| `basics` | `--plum` | Anyone getting up to speed; also where the setups live | `basics-radar` (Thu 07:16) |
| `case-studies` | `--moss` | People who want precedent, graded honestly | `case-studies-writer` (Mon/Thu 08:40) |
| `talks` | `--hanko` | People who cannot watch everything | `talks-writer` (daily 08:33) |

`track` defaults to `technical` in the content schema and in
`publish-article.mjs`, so a missing Track can never fail a build — it files
quietly under Technical instead.

**The Notion `Track` select accepts exactly `Technical`, `Business`, `Basics`.**
Any other value is rejected outright. These themes were renamed from
Systems/Practice/Demand on 2026-08-25 because the originals meant nothing to a
first-time visitor; all 19 rows across both databases were migrated and the old
options deleted. **If you rename them again, six routine prompts in
`~/.claude/scheduled-tasks/` hardcode the value they write** (the three
radars, `ai-article-writer`, `talks-writer`, `case-studies-writer`) — that was
missed the first time and would have failed the next radar run. The full
hardcode checklist, file by file, is in `docs/research/routine-review.md` §C.

`/projects/` stays its own page. The Basics panel on the index links across to
it rather than absorbing it.

---

## 1. What this is

**wAIbi-sabi** (renamed from Wabi Sabi on 2026-08-26; the capitals are the
point — "AI" surfacing inside "wabi") — an applied-AI blog and
self-documenting system belonging to
**Janmejai Singh Minhas** (GitHub `janmejai2002`, `janmejai2002@gmail.com`).
The name is the Japanese aesthetic of imperfection and incompleteness; the
site's thesis is that ML systems are never finished.

- **Live:** https://janmejai2002.github.io
- **Repo:** https://github.com/janmejai2002/janmejai2002.github.io (public)
- **Local:** `C:\Users\Janmejai\PluginsClaude`
- **Deploy:** push to `main` → GitHub Actions → Pages. `build_type: workflow`;
  do not re-enable legacy branch builds.

### Pages

| Route | Nav label | Source |
|---|---|---|
| `/` | Blog | `site/src/pages/index.astro` |
| `/projects/` | Setups | `site/src/pages/projects.astro` |
| `/news/` | BSchool | `site/src/pages/news/index.astro` — 221 filterable cards |
| `/about/` | Me | `site/src/pages/about.astro` |
| `/blog/[slug]/` | — | `site/src/content/blog/*.md` (5 posts) |

Nav labels were renamed 2026-08-25; **routes were deliberately left alone** so
nothing published or indexed breaks. The page headings still say the old words
("Interview News Archive", "Projects") — see §8.

---

## 2. Notion is the control plane

Three databases. Never hardcode into the repo anything that belongs in Notion.

| Database | Data source ID |
|---|---|
| 📝 AI Blog OS Pipeline (radar) | `511e41a3-c1cd-47e0-8fa2-d319feef0ced` |
| ✍️ Article Production (drafts) | `d39ea073-cc87-4c25-8a3c-d9f276a59b68` |
| Wabi Sabi – Interview News Archive | `288c805b-3d3f-46ae-98e4-893ab3e6d562` |

**Human-only fields, never written by a routine:** `Interest Rating` and
`Remarks` on the radar; `Draft Status = Approved` on production. Rating 4 or 5
is the approval gate. Ratings 1 and 2 also steer future radar runs away from
neighbouring topics.

The relation between the two pipeline databases is two-way (`Article` ↔
`Source Idea`), which is what answers "has this been written" in one query.

### Scheduled routines

Prompts live in `~/.claude/scheduled-tasks/<id>/SKILL.md`. **Each run starts
cold**, so the prompt must be fully self-contained.

- **`daily-ai-seo-radar`** — 07:10 daily. Technical theme. Discovers topics,
  writes a 100-word pitch, files as `Radar Idea`.
- **`business-radar`** — Tue 07:20. Business theme, covering both the advisory
  and the marketing audience. 2 ideas max, and explicitly told a quiet week is a
  valid result.
- **`basics-radar`** — Thu 07:16. Basics theme. Weighted toward questions people
  are actually asking rather than the news cycle, and told that a simplification
  leaving the reader with a false model is worse than no article.
- **`ai-article-writer`** — every 4h. Picks up rating 4/5, promotes, researches,
  drafts, sets `Draft Ready`. Max 2 per run. **Forbidden from publishing.**

All three radars write `Track` and `Reader Question`. The writer carries both
through to Article Production, and `publish-article.mjs` reads them into
frontmatter.

**The writer routine was hardened on 2026-08-25** after a fact-check found
statistics attributed to pages that did not contain them. It now requires a
**claim ledger** (claim, URL, and the source sentence quoted verbatim — no row,
no draft) and a **Step 4.5 verification pass** over the finished text. The
lesson that drove it: where the routine cited a primary source it was accurate;
every error traced to an SEO aggregator.

Skills used: `seo-topic-research` (forbids inventing search volume, difficulty,
CPC or rank), `viral-hooks`, `storytelling`, and `anti-ai-writing` as a
**mandatory** final filter.

---

## 3. Publishing — automated as of 2026-08-25

Full detail in **`docs/PUBLISHING.md`**. Summary:

You set `Draft Status = Approved` → within 30 minutes `publish-from-notion.yml`
opens a PR with the article as markdown, complete with TL;DR (enforced) and
artwork (routine-drawn from Notion, or deterministic fallback) → you read it
through → merge → deploys → the `close-loop` job writes `Published`, `Post URL`
and `Publish Date` back to Notion, but only after verifying the URL actually
serves. **Never commit to the PR branch** — the poll destroys additions; put
improvements on `main` after merge. The `indexnow` job then pings changed URLs.

| Piece | What it does |
|---|---|
| `site/scripts/lib/notion.mjs` | REST helpers + blocks→markdown. Throws on unknown block types rather than dropping content. |
| `site/scripts/publish-article.mjs` | Approved rows → `src/content/blog/<slug>.md`. Enforces the 70/160 caps itself. |
| `site/scripts/close-loop.mjs` | Verifies the URL is live, then reconciles Notion. |
| `.github/workflows/publish-from-notion.yml` | Polls every 30 min, builds, opens a PR. |
| `close-loop` job in `deploy.yml` | Runs after every Pages deploy. `continue-on-error`. |
| `site/scripts/sync-news.mjs` | Refreshes `src/data/news.json` from the news archive database. |
| `.github/workflows/sync-news.yml` | Runs the above daily at 04:35 and **commits straight to main**. |

**Why the news sync commits directly while articles get a PR:** an article is a
generated draft that still needs artwork, a TL;DR and a read-through, so a diff
is where that gets caught. A news card is data the human already curated in
Notion — there is nothing for a reviewer to add. The build still gates both.

**Gotcha now encoded in `sync-news.yml`:** a push made with the default
`GITHUB_TOKEN` does **not** trigger other workflows (GitHub blocks that to
prevent recursion), and `deploy.yml` listens on `push: branches: [main]`. Any
future bot that commits to main must dispatch `deploy.yml` explicitly — and needs
`actions: write` to do it — or its commit will sit unpublished until the next
human push.

`NOTION_TOKEN` is set as a repository secret and **both halves have been
verified running in CI**. Detection is polling, not push — Notion cannot reach
this repo without a public endpoint, and adding a server would cost the system
its "no infrastructure" property.

`notionId` in a post's frontmatter is the link back to its Notion row. Delete it
and that row will never be marked Published.

---

## 4. Design system — read before writing any CSS

`site/src/styles/global.css`. Ported from `wabi-sabi-template.html` at repo root.
Deliberately **not** Tailwind — the template used the CDN script, which is
render-blocking and bad for SEO.

**Width.** `.shell` caps at 96rem and `main` at 80rem; composition pages pass
`wide` to `Base.astro` to drop the column entirely (`main--wide`). Article prose
stays at `--measure: 44rem` — **do not widen it**, that limit is readability, not
habit. The old 80/64rem pair left a third of a laptop screen empty.

**`GrainField.astro`** paints a drifting fbm grain field behind everything: ~5KB
of raw WebGL, no three.js, reading the palette off the CSS custom properties so
it tracks all three theme states. 30fps cap, pauses on tab hide, one static frame
under reduced-motion, and silently absent if WebGL is missing.

**Motion tokens.** `--ease` and `--dur` / `--dur-fast` in `global.css`. Use them
rather than inventing a curve — the point is that nothing moves at a speed
nothing else moves at.

**Six earths** (dusty, never neon): `--mizu` teal, `--hanko` seal red, `--moss`,
`--ochre`, `--plum`, `--indigo`, each with a `--wash-*` tint. Ground `--paper`,
ink `--ink`. `--gutter` is the single page-padding token. Inter via Google Fonts
(the only external host allowed).

**Dark mode has three states** and all three are handled: bare `:root`,
`@media (prefers-color-scheme: dark)` guarded with `:root:not([data-theme='light'])`,
and `:root[data-theme='dark']`. **Never declare a colour only inside a media or
`[data-theme]` block.** Dark is a full re-skin, not an inversion — a plain
`var(--ink)`/`var(--paper)` swap produced a washed-out slab and had to be redone
with dedicated `--tldr-*` tokens.

---

## 5. Images and artwork

Read **`docs/ARTWORK.md`** before making any image. It is both the spec and a
reusable generation prompt.

- Every article gets one piece of artwork: geometry, one accent, and exactly one
  deliberate break in the order that carries the argument. No stock photos, no
  illustration, no captions explaining the drawing.
- Sources live in `site/assets-src/art/*.svg` and use **palette placeholders**
  (`{{paper}}`, `{{mizu}}` …), never hex. `npm run images` renders a light and a
  dark variant; the script **throws** if a source hardcodes a colour.
- Both variants ship and CSS picks one — `<picture>` only answers
  `prefers-color-scheme`, and this theme has three states.
- Artwork renders to **WebP**: the noise overlay defeats PNG entirely (1.3 MB vs
  ~25 KB).
- `heroAlt` is a **build error** when `heroImage` is set. Keep it that way.
- Fixed assets (favicon set, `og-default.png`) go to `public/`; article artwork
  goes to `src/assets/art/` so Astro can hash it.

**Unsplash** is wired in `.mcp.json` but has **no API key** — see ARTWORK.md §5
for setup, and the attribution and download-endpoint obligations that come with
it. It is not the default for hero art; drawn artwork is.

---

## 6. Hard-won gotchas — do not rediscover these

**Environment**
- **The Bash tool is broken on this machine** (`cygheap read copy failed`). Use
  the PowerShell tool. For POSIX scripts: `& "C:\Program Files\Git\bin\bash.exe" -lc "..."`.
- **PowerShell here-strings break on apostrophes** in commit messages. Write the
  message to a file and use `git commit -F <file>`.
- **`notebooklm-mcp` reports healthy but exposes no tools.** Use the `nlm` CLI.
  Note the subcommand: `nlm query notebook <id> "..."`. Auth expires often;
  `nlm-relogin.sh` fixes it but **force-kills Brave** — check for open tabs first.
- **The Browser pane cannot screenshot** (no frame compositing). Verify with
  `javascript_tool` reading computed styles. Tabs also drift — **pass `tabId`
  explicitly** or you will run against a stale tab pointing at the live site.

**Markdown and build**
- **A blank line inside a raw HTML block terminates it.** This shipped four
  broken diagrams: everything after the first `<g>` was re-parsed as markdown
  and, being indented, rendered as a visible code block. Never put a blank line
  inside inline `<svg>` in markdown.
- **Assert on content, not containers.** That bug survived verification because
  the checks confirmed `.diagram svg` existed with the right viewBox — all true
  of a gutted element. `site/scripts/check-build.mjs` now runs as part of
  `npm run build` and asserts on escaped markup, `<text>` counts, hardcoded
  colour, missing alt and `og:image`. It has been regression-tested both ways.
- **Notion splits multi-line callouts** across the block's `rich_text` *and its
  children*. Reading only the block silently loses the slug.
- The schema caps `title` at 70 and `description` at 160. **Deliberate** — they
  have already caught a 193-char description and a 71-char title. Do not relax
  them; fix the text in Notion, which is the source of truth until a file exists.

**CSS**
- **`[hidden]` loses to author `display` rules** (both are 0,1,0). Anything
  hidden by the attribute must opt out explicitly. This broke every archive filter.
- **Descendant selectors leak into nested lists.** Timeline rules are scoped
  `.tl > li` for this reason.
- **`contain-intrinsic-size` must scale with content** — it is
  `calc(var(--n) * var(--card-h))` per breakpoint.
- **Mobile overflow silently zooms the whole page.** Check
  `scrollWidth - clientWidth` at 320 and 360.
- **A dense SVG must not scale down to a phone.** `.diagram svg` has
  `min-width: 42rem` so it scrolls inside its box; unconstrained, a 700-unit
  viewBox renders 11px labels at 7px.
- **Do not run `npm run build` while the dev server is up** — heap OOM.
- **Bash heredocs choke on the noise SVG data-URI.** Use the Write tool for CSS.

---

## 7. Verify before you claim done

```bash
cd site && npm run build     # dev server must be stopped; includes check-build
```

Then confirm live routes return 200 **and the content is actually present**:

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://janmejai2002.github.io/blog/<slug>/
```

Astro extracts CSS into hashed `/_astro/*.css` — grepping the HTML for a rule
always fails. Fetch the asset instead.

Two "bugs" in one session turned out to be faulty tests. Check your check before
reporting a defect. And if something is unverified, say so.

---

## 8. Open — the owner's call

**Needs attention first**

- **Motion is unverified.** The Browser pane never fires `requestAnimationFrame`
  (no compositing — see §6), so the grain shader's drift, the track-card mark
  animations and every CSS transition are correct by construction but have not
  been seen running. Open `npm run dev` in a real browser and look.
- **`/projects/` and `/news/` have not had the UI pass** that the index, the
  article template and the About timeline got on 2026-08-25.
- **Practice and Demand have no published posts yet.** The index only renders a
  track's filter chip once that track has content, so the homepage currently
  shows all three panels but the archive filter is effectively single-track.
- **Page headings still say the old nav words.** `/news/` is titled "Interview
  News Archive" and `/projects/` says "Projects", while the tabs now read
  BSchool and Setups. Renaming the headings is a content decision, so it was left.
- **`about.astro` has an inline link labelled "Projects"** pointing at `/projects/`.

**Longer-standing**

- ~~The blog has no final name.~~ **Resolved 2026-08-26: `wAIbi-sabi`.** The
  literal string is used in titles, JSON-LD and RSS; the rendered wordmark
  (`src/components/Wordmark.astro`) colours the `AI` in hanko and defeats any
  inherited text-transform so the casing survives. **The mark is the kintsugi
  wordmark as of 2026-08-26** (owner-chosen, replacing the rejected ensō): an
  ochre fracture through the name with the pieces set out of true, and the
  final `i` drawn as a blinking caret (steady under reduced motion). The rail
  uses `<Wordmark plain />` — vertical writing rotates the drawn pieces. The
  favicon is the kintsugi plate: square vessel, gold crack, dark-mode colours
  embedded in the SVG. No domain bought; `astro.config.mjs` points at
  `janmejai2002.github.io`.
- **The About stat band** leads with three Gray Swan numbers against one research
  number. Red teaming is a **hobby, not work** — it was removed from the work
  timeline for that reason. The band may want rebalancing.
- **The Amex custom-GPT work** is a natural fourth `/projects/` entry. Offered,
  not approved.
- **Publishing the two task prompts verbatim** in `/blog/how-this-blog-builds-itself/`.
  They are the most copyable part and nothing in them is sensitive.
- **The radar has 5 unrated ideas** waiting on `Interest Rating`, plus 2 rated
  `3 - Maybe later`. Nothing moves until one is rated 4 or 5.

---

## 9. Recent history

`docs/SESSION-2026-08-24.md` records the image-support build and the first
end-to-end pipeline run. `docs/TODO-system-documentation.md` records how the
NotebookLM notebook and the four architecture diagrams were made (notebook ID
included). `docs/PUBLISHING.md` is the operating manual for the publish
pipeline. `docs/ARTWORK.md` is the artwork spec.
