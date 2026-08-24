# Handoff — Wabi Sabi blog system

You are picking up a working, deployed system. Read this whole file before touching anything.

**Both goals from the previous handoff are done (2026-08-24).** Sections 3 and 4 below
are kept as the record of what was asked; see `docs/SESSION-2026-08-24.md` for what was
actually built, what changed since, and the two decisions still waiting on the owner.

In short: the site now has full image support (schema, `<Image>` hero, derived OG cards,
markdown figures, favicons), one article was published end to end through the real
pipeline, and the `/projects/` walkthrough with four diagrams now exists.

---

## 1. What this system is

**Wabi Sabi** — an applied-AI blog and evolving system belonging to **Janmejai Singh Minhas**
(GitHub `janmejai2002`, `janmejai2002@gmail.com`). It is a blog *and* a self-documenting
system: AI projects and how they were built, his thoughts on AI, and industry analysis.

The name is the Japanese aesthetic of imperfection, impermanence and incompleteness —
the site's whole thesis is that ML systems are never finished.

- **Live:** https://janmejai2002.github.io
- **Repo:** https://github.com/janmejai2002/janmejai2002.github.io (public)
- **Local:** `C:\Users\Janmejai\PluginsClaude`
- **Deploy:** push to `main` → GitHub Actions (`.github/workflows/deploy.yml`) → Pages.
  Pages is set to `build_type: workflow`; do not re-enable legacy branch builds.

### Pages
| Route | Source |
|---|---|
| `/` | `site/src/pages/index.astro` — hero + post list |
| `/projects/` | `site/src/pages/projects.astro` — documents this system |
| `/news/` | `site/src/pages/news/index.astro` — 221 filterable cards |
| `/about/` | `site/src/pages/about.astro` — stats, red teaming, papers, timeline |
| `/blog/[slug]/` | from `site/src/content/blog/*.md` |
| `/rss.xml`, `/404`, `/sitemap-index.xml` | generated |

---

## 2. Notion is the control plane

Three databases. **Never** hardcode content into the repo that belongs in Notion.

| Database | Data source ID |
|---|---|
| 📝 AI Blog OS Pipeline (radar ideas) | `511e41a3-c1cd-47e0-8fa2-d319feef0ced` |
| ✍️ Article Production (drafts) | `d39ea073-cc87-4c25-8a3c-d9f276a59b68` |
| Wabi Sabi – Interview News Archive | `288c805b-3d3f-46ae-98e4-893ab3e6d562` |

**Pipeline** fields: `Name`, `Pitch` (100-word decision surface), `SEO Keywords`, `Status`
(Radar Idea / Drafting / Ready for Polish / Published), **`Interest Rating`** and
**`Remarks`** — those last two are the human's alone, never write them.
Rating `4 - Strong interest` or `5 - Write this now` is the approval gate.

**Article Production** fields: `Name`, `Draft Status` (Queued / Researching / Writing /
Draft Ready / Needs Revision / Approved), `SEO Keywords`, `Interest Rating`, `My Remarks`,
`Word Count`, `Skills Used`, `Promoted On`, `Draft Completed`, `Source Idea` (relation).
**Never set `Approved`** — that is the human's decision.

The registry at `C:\Users\Janmejai\Notion\notion-registry.json` tracks these; register any
new tracked page with `node lib/register.js` (it auto-syncs `~/.claude/CLAUDE.md`).

### Scheduled agents
- **`daily-ai-seo-radar`** — 07:10 daily. Discovers trending AI topics, skips anything
  already covered or near a 1–2 rated topic, researches, writes a 100-word pitch, files as
  `Radar Idea`.
- **`ai-article-writer`** — every 4h. Picks up rating 4/5, promotes to Article Production,
  researches deeper, writes the full article, sets `Draft Ready`. Max 2 per run.

Prompts live in `~/.claude/scheduled-tasks/<id>/SKILL.md`. Each run starts cold — the
prompt must be fully self-contained.

Skills used: `seo-topic-research` (research protocol; forbids inventing search volume,
keyword difficulty, CPC or Google rank), `viral-hooks`, `storytelling`, and
`anti-ai-writing` as a **mandatory** final filter.

---

## 3. GOAL 1 — end-to-end pipeline test, with images

### The blocker you must solve first
**The site has no image support at all.** Verified:
- `site/src/content.config.ts` — no image field in the schema
- `site/src/components/SEO.astro` — **no `og:image`**, yet it declares
  `twitter:card = summary_large_image`. That is currently inconsistent and worth fixing.
- `site/public/` contains only `robots.txt` — no favicon, no default OG image
- `sharp@^0.33.5` **is** installed, so `astro:assets` / `<Image>` will work

So before the article, you need to:
1. Add an image field to the blog schema using the content-collections `image()` helper
   (hero image + alt text; make alt **required** — the site is otherwise accessible and
   should stay that way).
2. Render it in `site/src/layouts/Post.astro` with `<Image>` from `astro:assets`, with
   width/height set so nothing shifts on load.
3. Add `og:image` to `SEO.astro`, absolute URL, plus a sensible site-wide fallback.
4. Support inline images in article bodies.
5. Add a favicon while you are there.

Keep images **local** in the repo (`site/src/assets/…`) so Astro can optimise and hash them.
Do not hotlink remote images.

### Then run the pipeline
Do it the way the real system would, not by hand-writing a file:
1. Query the Pipeline DB for what already exists so you do not duplicate a topic.
2. Run `daily-ai-seo-radar`'s logic (or invoke the task) to discover and pitch a topic.
   Then act as the human gate: set a rating and remarks yourself, and **say clearly in your
   final report that you self-approved**, since no human rated it.
3. Run `ai-article-writer`'s logic to research and draft.
4. Publish: write the markdown into `site/src/content/blog/`, add the images, build, verify,
   commit, push, and confirm the live URL returns 200.
5. Update both Notion rows to reflect reality.

**Rules that are not negotiable:** every statistic, date and quote needs a real linked
source; no invented metrics; `anti-ai-writing` runs on the final draft; nothing gets marked
`Approved`.

---

## 4. GOAL 2 — NotebookLM diagrams

The `/projects/` page currently promises: *"A full walkthrough with architecture diagrams
is in progress — I am generating those from a NotebookLM notebook built on the actual
configuration files."* Make that true.

Full plan is in `docs/TODO-system-documentation.md`. Summary:

1. Use the **`notebooklm-mcp`** skill. **Check the NotebookLM Library Notion page first for
   a duplicate notebook** before creating one.
2. Build the notebook from the **actual files**, not from memory:
   - `~/.claude/scheduled-tasks/daily-ai-seo-radar/SKILL.md`
   - `~/.claude/scheduled-tasks/ai-article-writer/SKILL.md`
   - `~/.claude/skills/seo-topic-research/SKILL.md`
   - `~/.claude/CLAUDE.md` (the skills/agents split and token-discipline rationale)
   - `site/src/content.config.ts`, `site/astro.config.mjs`, `site/scripts/sync-news.mjs`
   - the three Notion schemas
3. Generate four diagrams via the infographic tool:
   - end-to-end flow: discovery → pitch → human rating → promotion → draft → review
   - the Notion control plane and the relation between the two databases
   - Claude Code layout: scheduled tasks, skills, agents, MCP connections
   - the token-cost model (why `~/.claude/skills/` is deliberately trimmed)
4. Bring them into the site. **They must be theme-aware** — no baked-in white backgrounds,
   the site has a real dark mode. Prefer inline SVG or the native mermaid support.
5. Write the long-form walkthrough under `/blog/` and link it from `/projects/`.

---

## 5. Design system — read before writing any CSS

`site/src/styles/global.css`. Ported from `wabi-sabi-template.html` (the owner's own
design, kept at repo root as reference). Deliberately **not** Tailwind — the template used
the Tailwind CDN script, which is render-blocking and bad for SEO.

**Six earths** (dusty, never neon): `--mizu` teal, `--hanko` seal red, `--moss`, `--ochre`,
`--plum`, `--indigo`, each with a `--wash-*` tint. Ground `--paper`, ink `--ink`.
`--gutter` is the single page-padding token. Font is Inter via Google Fonts (the only
external host allowed).

**Dark mode has three states** and all three are handled: bare `:root` (light),
`@media (prefers-color-scheme: dark)` guarded with `:root:not([data-theme='light'])`, and
`:root[data-theme='dark']`. Every colour is a token. `color-scheme` is set per state.
**Never declare a colour only inside a media or `[data-theme]` block.**

---

## 6. Hard-won gotchas — do not rediscover these

- **`[hidden]` loses to author `display` rules.** `[hidden]{display:none}` is specificity
  (0,1,0), same as `.card{display:flex}`, and author styles win. Anything hidden via the
  attribute must opt out explicitly. This silently broke every archive filter.
- **Descendant selectors leak into nested lists.** `.tl li` also matched bullets inside a
  role's nested `<ul>`, turning each into a 2-column grid that crushed text to 117px.
  Timeline rules are scoped `.tl > li` for this reason.
- **`contain-intrinsic-size` must scale with content.** A flat estimate made a 21-card day
  claim the same height as a 2-card day and the scroll position lurched. It is now
  `calc(var(--n) * var(--card-h))` per breakpoint.
- **Mobile overflow silently zooms the whole page.** Nav overflowed 68px at 320px and the
  browser scaled everything down. Always check `scrollWidth - clientWidth` at 320 and 360.
- **The Browser-pane preview does not composite frames.** Screenshots time out, CSS
  transitions never advance, and `scroll-behavior: smooth` never moves. Verify with
  `mcp__Claude_Browser__javascript_tool` reading computed styles, and **temporarily disable
  transitions** before measuring an animated property or you will read a frozen frame and
  diagnose a bug that is not there.
- **Do not run `npm run build` while the dev server is up** — they compete for memory and
  the build dies with a heap OOM.
- **Bash heredocs choke on the noise SVG data-URI.** Use the Write tool for CSS.
- The content schema caps `description` at 160 chars and `title` at 70. That is deliberate —
  it already caught a 193-char description that search would have truncated. Do not relax it.

---

## 7. Verify before you claim done

```bash
cd site && npm run build          # dev server must be stopped
```
Then confirm live routes return 200 and the new content is actually present:
```bash
curl -s -o /dev/null -w "%{http_code}\n" https://janmejai2002.github.io/blog/<new-slug>/
```
Astro extracts CSS into hashed `/_astro/*.css` — grepping the HTML for a CSS rule will
always fail. Fetch the asset instead.

---

## 8. Open decisions belonging to the owner — ask, do not assume

- **The blog has no final name.** Candidates discussed: `wAIbi-sabi` (his own, and the
  strongest — hides "AI" inside "wabi"), `wabisabi.ai`, `jaibisabi`, `Wabi-SOTA`.
  Avoid bare "Wabi" (reads as W&B / Weights & Biases) and "Wasabi" (existing company).
  No domain is bought; `astro.config.mjs` points at `janmejai2002.github.io`.
- **The About stat band** leads with three Gray Swan numbers against one research number.
  He has said red teaming is a **hobby, not work** — it was removed from the work timeline
  for that reason. He may want the band rebalanced toward work and research.
- **The Amex custom-GPT work** is a natural fourth entry on `/projects/` — same problem
  space as this pipeline. Offered, not yet approved.

Report honestly: if something is unverified, say so. Two "bugs" in the last session turned
out to be faulty tests, not faulty code — check your check before reporting a defect.
