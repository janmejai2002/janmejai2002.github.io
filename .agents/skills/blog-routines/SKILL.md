---
name: blog-routines
description: How the wAIbi-sabi scheduled routines work — the seven local blog routines plus the cloud news feeder, what each one does, the cadence-drift trap, the Track hardcode checklist, how to change a schedule, and the per-run token cost model. Use whenever a task involves a routine, a radar, a writer, the artwork routine, a cron expression, changing a cadence, or "did the routine run".
---

# The scheduled routines

Two scheduling systems, both called "routines". Know which one before you ask
whether it ran — they have separate lists, logs and failure modes.

- **Local `scheduled-tasks`** — prompts at `~/.claude/scheduled-tasks/<id>/SKILL.md`,
  run on this PC, can read the repo, need the machine awake. Managed with the
  `scheduled-tasks` MCP (`list_scheduled_tasks`, `update_scheduled_task`, …).
- **Cloud routines** — `/schedule` / `RemoteTrigger`, sandboxed, no local disk,
  1-hour minimum interval.

Full split and migration order: `docs/research/token-and-cloud-audit.md`.
Prompt review history: `docs/research/routine-review.md`.

## The seven blog routines (local)

| Routine | Cadence | What it does |
|---|---|---|
| `daily-ai-seo-radar` | daily ~07:10 | Technical theme. Discovers topics, writes a 100-word pitch, files as `Radar Idea`. Waits for a human rating. |
| `business-radar` | daily `12 7 * * *` | Business theme (advisory + marketing). ≤2 ideas; a quiet day is a valid result. |
| `basics-radar` | daily `16 7 * * *` | Basics theme. Weighted to questions people actually ask; a false mental model is worse than no article. |
| `ai-article-writer` | every 4h | Picks up radar ideas rated 4/5, promotes to Article Production, researches, drafts, sets `Draft Ready`. ≤2 per run. **Forbidden from publishing.** |
| `artwork-routine` | every 4h at :35 | Reads `Draft Ready` / `Approved` rows, draws the plate per `docs/ARTWORK.md`, files the SVG into the Notion page. ≤3 per run. Also backfills a missing TL;DR. |
| `talks-writer` | daily ~08:33 | Picks one talk/keynote/podcast from a curated allowlist, pulls the transcript credential-free, drafts a Talks article straight to `Draft Ready`. |
| `case-studies-writer` | daily ~08:52 | One named company's real AI deployment from primary sources, evidence graded honestly — or files nothing. Ends with a "What you could apply" section. |

`case-comp` and `mind-the-pour-seo-aeo-check` in the same folder are **other
projects** — not part of this blog.

## The one cloud routine

The **news feeder** for `/news/` — files stories into the Interview News Archive
database dated by the story's own publication date. `sync-news.mjs` +
`sync-news.yml` then pull that database into `src/data/news.json` daily at 04:35
and commit to `main`.

## The writer routines were hardened after a fact-check

Every error in the 2026-08-25 fact-check traced to an SEO aggregator; where a
routine cited a primary source it was accurate. So the writers now require:

- a **claim ledger** — claim, URL, and the source sentence quoted verbatim. No
  row, no draft.
- a **Step 4.5 verification pass** over the finished text.
- a **pre-file cap gate** counting `Name` (≤70), meta description (≤160) and
  `Reader Question` (≤120) against the finished text — the model was estimating
  and breaching roughly one run in fifteen.

Skills the writers use: `seo-topic-research` (forbids inventing search volume,
difficulty, CPC or rank), `viral-hooks`, `storytelling`, and `anti-ai-writing`
as a **mandatory** final filter.

## Cadence lives in two places that drift apart

The cron expression is in the `scheduled-tasks` registry; the sentence claiming
what the cadence *is* lives in the prompt's own text; the `description` is what
the owner sees in the sidebar. Nothing checks them against each other, and a
cold routine believes its own prompt. **When you change a schedule:** update the
cron, grep the prompt for its cadence claim and fix it, and fix the registry
`description` — all in the same change. Do not leave a prompt that argues with
its own cron.

```
scheduled-tasks MCP → update_scheduled_task → cronExpression
```

Stagger times so five routines do not fire at once.

## The Track hardcode checklist

Track values (`Technical` / `Business` / `Basics`) are hardcoded in **five**
places, and a rename has already missed one:

1. the Zod enum in `site/src/content.config.ts`
2. `TRACKS` / `AUTO_TRACKS` in `site/scripts/publish-article.mjs`
3. `site/src/data/tracks.ts`
4. the six routine prompts that write a Track value (three radars,
   `ai-article-writer`, `talks-writer`, `case-studies-writer`)
5. the Notion `Track` select options themselves

Full file-by-file list: `docs/research/routine-review.md` §C.

## Per-run cost

A routine that finds nothing still costs most of what a routine that finds
something costs — MCP tool schemas, skill descriptions and the agent listing are
all paid at session start, before the routine does any work (~100k tokens on
this machine, mostly fixed). Cutting cadence is therefore a bad cost lever: it
loses throughput and saves little. The good lever is **constraining each
routine's tool surface** — it saves the same tokens on every run forever. A CLI
called through Bash has zero schema cost; an MCP server has a schema cost on
every cold start.

**Full accounting and current state: `docs/research/token-and-cloud-audit.md` §5
(2026-08-28).** Headline: 26 claude.ai MCP connectors are now connected, none of
the seven routines declares an `allowed_tools` list, and `vibevoice` fails on
every cold start. The three unpulled levers are — disable the ~22 unused
connectors, give each routine the cloud news routine's 6-tool `allowed_tools`,
and register Notion with `mcporter` so it is a Bash CLI call with zero schema.

Also: `ai-article-writer` only picks up ideas rated 4 or 5. More radar runs
without more ratings just grows the queue — ratings are the throughput gate, not
cadence.
