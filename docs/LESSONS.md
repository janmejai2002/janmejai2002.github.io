# Lessons

The running notes file. Read it at the start of a session; add to it as you go.

**Convention:** one lesson per entry, a one-line summary as the heading, then
why it mattered. Record confirmed approaches as well as corrections. Don't
record what the repo or git history already says. Update an existing entry
rather than adding a near-duplicate, and delete an entry that turns out to be
wrong.

`docs/HANDOFF.md` §6 holds the older consolidated gotchas about this machine and
this build. New lessons go here.

---

## The Bash tool's cygwin failure is intermittent, not permanent

It failed for entire sessions on 24–25 Aug 2026 and worked for an entire session
on 26 Aug. Every handoff until now recorded it as simply broken, which cost real
time working around a tool that was fine. Try it once; fall back to PowerShell if
it dies. Even when Bash works, `git` under it occasionally fails with "the paging
file is too small" — just re-run.

## A spec that gets quietly contradicted is worse than one that gets changed

`docs/ARTWORK.md` is strict about restraint. When a request arrives that conflicts
with it — as the owner's "make it exciting" brief does — the move is to revise the
spec deliberately with the owner, not to ship work that violates it and leave the
document standing as a lie. The spec's value is that it can be trusted.

## Build assertions earn their keep; do not relax them under deadline

The 160-character description cap rejected the rewritten
`how-this-blog-builds-itself` frontmatter on 26 Aug 2026. The right response was
to write a shorter description, which took a minute. The tempting response — widen
the cap — would have removed the only thing standing between the site and a
truncated search result. Same for `check-build.mjs`. These have now each caught
real defects more than once.

## Verify rendered output, not source, after editing article markdown

Inline SVG in markdown fails in a way that leaves the container intact and guts
the contents, so a source diff looks perfect. After editing any article with
diagrams, count `<text>` nodes and grep for escaped markup (`&lt;svg`) in
`dist/`, not in the `.md`. That check caught nothing on 26 Aug — which is the
point; it is cheap and it is the only way to know.

## The owner works in Notion, so failures must surface in Notion

Not in an Actions log, not in a red build badge. This was learned once already
with the publish pipeline's blocked-reason writeback, and it generalises: an
error message delivered where the person isn't looking is not error handling.
Applies to anything new that can fail unattended.

## Unattended automation may only use credentials that cannot expire

The standing architectural rule on this project. It is why `talks-writer` reads
public captions anonymously instead of using NotebookLM, and it is why IndexNow
(a static key file, no login, no token) fits this system so well. It has thrown
out more otherwise-good designs here than any question about model choice.

## An automated PR branch will destroy anything a human adds to it

`publish-from-notion` polls twice an hour and `peter-evans/create-pull-request`
resets `notion/approved-articles` from main on every run. Artwork or a TL;DR
committed to that branch survives only until the next poll, for as long as the
Notion rows are still approved and unpublished. The durable move is to put
additions on `main`, and the real fix is to generate them before the PR is opened
so the branch never needs a human commit at all. Generalises: any branch a bot
owns is a branch a human should not commit to.

## A catch block can hide that a feature never worked at all

`publish-article.mjs` used `api()` for its tell-Notion write-back without ever
importing it. Every call threw `ReferenceError: api is not defined` — inside a
try/catch whose message ("could not update Notion for …") made the failure look
like a transient API problem instead of dead code. The write-back machinery was
documented, reasoned about, and load-bearing in the docs, and had never once
run. When a catch prints a generic message, log `err.message` verbatim and read
it once from a real run before trusting the feature exists.

## Check what the pipeline generates, not just that it generated something

The first two articles through the publish pipeline both shipped a body `# H1`
duplicating the frontmatter title the layout already renders, and neither carried
the `Executive TL;DR` its own writer prompt requires. The build passed and
`check-build` passed, because neither asserts on those. A green pipeline says the
plumbing works, not that the output is right.

## A routine's cadence lives in two places that drift apart silently

The cron expression lives in the `scheduled-tasks` registry; the sentence
claiming what the cadence *is* lives in the prompt's own text. Nothing checks
them against each other. On 26 Aug 2026 all three "weekly" routines had already
been switched to daily crons by the owner, while `business-radar` still described
itself as weekly and `case-studies-writer` still said in bold *"Cadence is two a
week — do not increase it"* on a routine that had been running daily for a day.
A cold routine believes its own prompt. When you change a schedule, grep the
prompt for the cadence claim in the same change, and fix the registry
`description` too — it is the only thing the owner sees in the sidebar.

## An archive dated by source, not by run, always looks empty at the top

`/news/` showed two cards for 26 Aug and looked broken. It was not: the feeder
routine dates each story by the story's own publication date, runs at 06:27 IST,
and almost nothing has been published under that day's date yet. Its 22 rows that
morning were dated 25 Aug. Before treating a thin recent day as a sync failure,
check the run log for how many rows were actually created — the count and the
date distribution answer different questions. The correct fix for the *appearance*
is presentational, never a pipeline repair.

## There are two scheduling systems here and they are both called "routines"

Local `scheduled-tasks` (prompts in `~/.claude/scheduled-tasks/`, run on this PC,
can read local files, need the machine awake) and cloud routines (`RemoteTrigger`
/ `/schedule`, sandboxed, no local disk, 1-hour minimum interval). On 26 Aug 2026
eight were local and exactly one — the news feeder — was cloud. Asking "did the
routine run?" means nothing until you know which system it lives in; they have
separate lists, separate logs, and separate failure modes. `docs/research/token-and-cloud-audit.md`
has the split and the migration order.

## The fixed per-session baseline dominates routine cost, not the work

A routine that finds nothing still costs most of what a routine that finds
something costs, because MCP tool schemas, skill descriptions and agent listings
are all paid at session start. This is why cutting cadence is a bad lever for
cost — it loses throughput and saves little — and why constraining each routine's
tool surface is a good one: it saves the same tokens on every run forever and
costs nothing. A CLI called through Bash has zero schema cost; an MCP server has
a schema cost on every cold start.

## A handled rejection must not also fail the build, and routines must count not eyeball

Two thirds of the `publish-from-notion` red runs (78‑char title on 26 Aug, two
172/166‑char meta descriptions on 27 Aug) were the same shape: a routine-authored
draft breached a hard cap, was correctly bounced to `Needs Revision` in Notion,
and *then* also turned the Actions run red — a second alarm in a place nobody
watches, for a failure already fully handled where the owner does look.
`publish-article.mjs` now fails the run only when the Notion write-back itself
failed and nothing else shipped. The prevention is upstream: the three writer
routines said "under 160 chars" but let the model estimate, which breaches roughly
one run in fifteen. They now carry a pre-file gate that counts `Name` (≤70), the
meta description (≤160) and `Reader Question` (≤120) against the finished text
before filing. Caps unchanged — see the assertion-hygiene lesson above.

## A restated rule is not a check; run the real validator

The pre-file gate above still has the model grading its own homework. The durable
version is `publish-article.mjs --check <page-id>`: one row through every real
gate, writes nothing, exits 1 with the reasons. The writer routines run it against
their own draft before handing off — the same code the cloud runs, not a prose
description of it. Generalises: when a routine's output must satisfy a validator,
give the routine the validator, not a summary of what it wants.

## One malformed draft used to crash the whole poll

`toMarkdown` throws on an unsupported Notion block, on purpose. But that throw was
uncaught in `publish-article.mjs`'s row loop, so a single table in one Approved
draft would abort the entire run — every other ready article with it — and write
nothing back to Notion. Found live on 28 Aug: "Your Agent Framework Has 20‑Year‑Old
Bugs Underneath It" carried a table and had been silently failing every poll. The
loop now catches per draft: that row goes to Needs Revision with the block type
named, the rest of the run proceeds. Any unattended step that fans out over rows
should isolate a per-row failure to that row.

## Failures that were only ever a red run now land in Notion

The "surface it where the owner looks" rule was wired into `publish-article.mjs`'s
own rejections and nothing else. A failed `npm run build`, a failed PR step, a
`close-loop` URL that never served, a poll that silently stopped — each left the
Notion row untouched at `Approved`/`Draft Ready` with no hint. Now: an `if:
failure()` step flags every manifest row after a post-generation failure,
`close-loop.mjs` writes a `Blocked Reason` on a URL that won't serve, and a daily
`sweep-stuck.yml` flags any unattended row ready over 12h and still not live.

## Cache-bust when checking a live route straight after a deploy

Right after PR #2 merged, /business/ and /talks/ fetched clean over HTTPS and
still showed the empty state, which looked exactly like a broken track filter.
The build was correct all along — the CDN was serving pre-merge HTML. Two
minutes were nearly spent debugging a page that was already right. Verify
against `dist/` first (it is definitive about the code), and add a cache
buster plus `Cache-Control: no-cache` to the live fetch. Related: grep the
rendered filename shape, not the source path — hashed asset names like
`name-light.Bh9PS0_I_DPdEw.webp` do not match a naive `_astro/[a-z0-9-]*.webp`
pattern, and a bad pattern reports missing artwork that is present.

## The routine token cost is a blast-radius problem, not a prompt-size one

Measured 2026-08-28: a cold routine run inherits the interactive machine's whole
surface — 26 claude.ai MCP connectors, playwright, 27 agent personas, 60+ skills
— because the in-app `scheduled-tasks` runner shares the interactive process and
`update_scheduled_task` has no field to scope tools. The nine SKILL.md prompts
total 74 KB; the tool surface is an order of magnitude more. The fix is to run
routines as `claude -p --strict-mcp-config --mcp-config <tiny> --allowedTools
<allowlist>` with a scoped `CLAUDE_CONFIG_DIR` (empty `agents/`, 2 skills), and
to reach Notion through `site/scripts/notion.mjs` (a Bash call, zero schema)
instead of the MCP connector. Cutting cadence saves almost nothing by
comparison. Scaffolding is in `routines/`; the accounting is in
`docs/research/token-and-cloud-audit.md` §5.

## A failure has to reach the owner, not just be recordable where they could look

The "surface it in Notion" rule shipped as write-backs onto the row, but the
owner still went to the GitHub app to read a failure reason — because nothing
*pushed*. `notify.mjs` sends one ntfy message with the reason in the body. ntfy
fits the project's no-expiring-credential rule (a topic is just a URL) and the
script is a no-op when unconfigured, so it can never fail the thing it reports.
Recording a failure where someone *could* find it is not the same as telling
them.
