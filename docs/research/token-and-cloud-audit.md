# Token cost and cloud-execution audit

Written 2026-08-26. Answers three operational questions the owner raised: why
routine runs cost ~100k tokens even when they find nothing, which routines
actually run in the cloud, and whether the Claude Code setup on this machine has
gone stale.

---

## 1. Where the ~100k tokens actually go

A routine that "just does its checks" is not cheap, and the cost is almost
entirely paid **before the routine does any work**. Measured on this machine:

| Cost centre | Rough size | Paid when |
|---|---|---|
| MCP tool schemas (Notion 30 tools, GitHub 26, Playwright 25, Browser ~20, computer-use, …) | 40–70k if loaded eagerly | Session start |
| Skill descriptions (auto-injected, every session **and every sub-agent**) | ~1.2k for the kept 7 | Session start |
| Agent persona listing (`~/.claude/agents/`, ~27 personas) | ~10–15k | Session start |
| The routine's own `SKILL.md` | 4–13k | Session start |
| Actual research (WebSearch results, Notion query results) | 10–40k | During the run |

The `SKILL.md` files themselves are **not** the problem — all nine total 62 KB:

```
ai-article-writer  13,299     case-studies-writer  7,753
basics-radar        8,636     daily-ai-seo-radar   6,892
business-radar      8,672     talks-writer         6,811
artwork-routine     5,646     mind-the-pour        4,061
```

That is roughly 15k tokens **across all nine**. The tool surface is an order of
magnitude larger.

### What is already mitigating it

Claude Code now defers MCP tool schemas behind `ToolSearch` — only tool *names*
enter context until a tool is actually invoked. This session's system prompt
shows ~60 deferred tools whose schemas were never loaded. Published measurements
put the saving around 45%.

The global instructions in `~/.claude/CLAUDE.md` already applied the other big
lever twice: archiving 236 of 263 agent personas to `agents-library/`, and 57 of
64 skills to `skills-library/`. Both were the right call and should not be undone.

### The three levers that remain

**a. Constrain each routine's tool surface.** The cloud routine already does
this and is the model to copy:

```json
"allowed_tools": ["Bash", "WebSearch", "WebFetch",
                  "mcp__Notion__notion-create-pages",
                  "mcp__Notion__notion-update-page",
                  "mcp__Notion__notion-search"]
```

Six tools instead of the full surface. None of the eight **local** scheduled
tasks declare an equivalent restriction — they load everything. A radar routine
needs WebSearch, WebFetch, and three Notion tools. It does not need Playwright,
computer-use, GitHub, or the browser pane.

**b. Replace MCP servers with CLIs where a CLI exists.** A CLI invoked through
Bash costs *zero* schema tokens. This machine already has the tooling for it and
it is under-used — see §3.

**c. Stop paying for research that gets thrown away.** The radars re-read the
full Notion pipeline every run to answer "has this been covered?". Daily cadence
means that query now runs 3× more often than it did last week. A cached
`site/src/data/status.json`-style digest, refreshed once a day and read by all
three radars, would replace three full-table reads with three file reads.

### What is *not* the problem

Cadence. The owner's instinct that daily runs cost more is right in aggregate,
but the marginal cost of a run that finds nothing is small — it is the fixed
per-session baseline that dominates. Cutting cadence to save tokens would cost
throughput and save little. Cutting the tool surface saves the same tokens on
every run, forever, and costs nothing.

---

## 2. Cloud execution — only one routine actually runs in the cloud

There are **two separate scheduling systems** on this machine, and they are easy
to confuse because both are called "routines":

| | Local scheduled tasks | Cloud routines |
|---|---|---|
| Managed by | `scheduled-tasks` MCP | `RemoteTrigger` API / `/schedule` |
| Prompts live in | `~/.claude/scheduled-tasks/<id>/SKILL.md` | The trigger's JSON body |
| Listed by | `list_scheduled_tasks` | `https://claude.ai/code/routines` |
| Runs where | This PC | Anthropic's cloud, sandboxed |
| Needs the PC awake | **Yes** | No |
| Can read local files | Yes | **No** |
| Minimum interval | any | **1 hour** |

**Current split — 8 local, 1 cloud:**

- **Cloud (1):** `AutoSipNews - Daily SIP Prep Digest Research` — the news
  archive feeder, `57 0 * * *` UTC. Uses the Notion connector and a webhook.
- **Local (8):** `daily-ai-seo-radar`, `business-radar`, `basics-radar`,
  `ai-article-writer`, `talks-writer`, `case-studies-writer`, `artwork-routine`,
  and the disabled `mind-the-pour-seo-aeo-check`.

### Why the rest have not moved to the cloud

Two hard blockers, both reported by `/schedule` itself:

1. **GitHub is not connected** for `janmejai2002/janmejai2002.github.io`.
   Fix: run `/web-setup`, or install the Claude GitHub App at
   <https://claude.ai/code/onboarding?magic=github-app-setup>.
2. **No MCP connectors are registered** on the claude.ai account. The one cloud
   routine that works carries its own Notion connector inline. Every blog
   routine reads or writes Notion, so without a workspace-level connector at
   <https://claude.ai/customize/connectors> they cannot run.

A third, softer blocker is real and matters more:

3. **Two routines genuinely need the local machine.** `artwork-routine` and
   `talks-writer` both reference `C:\Users\Janmejai\PluginsClaude` by absolute
   path. A cloud agent gets a git checkout, not the local disk. `artwork-routine`
   reads `docs/ARTWORK.md` from the repo, so it ports cleanly once GitHub is
   connected; `talks-writer` needs an audit before it moves.

### Recommended migration order

Once GitHub and the Notion connector are wired, move them in this order — safest
first, each one verified before the next:

1. `basics-radar`, `business-radar`, `daily-ai-seo-radar` — Notion-only, publish
   nothing, fully reversible.
2. `case-studies-writer`, `talks-writer` — Notion + web only, but `talks-writer`
   needs its hardcoded local path removed first.
3. `ai-article-writer` — highest value (it is the throughput routine) but the
   most complex prompt.
4. `artwork-routine` — needs the repo checkout, so it goes last.

Leave `mind-the-pour-seo-aeo-check` disabled where it is; it belongs to a
different project.

---

## 3. Setup health

### The `anything` CLI tooling — under-used, and it is the token fix

Two relevant CLIs are installed globally but neither is on the shell `PATH` this
session sees; both must be invoked from `%APPDATA%\npm\`.

**`mcporter` (0.7.3)** — *this is the one that matters.* It turns an MCP server
into a plain CLI:

```bash
mcporter list --schema              # inspect a server's tools
mcporter call <server>.<tool> k=v   # invoke one, no schema in context
mcporter generate-cli --server <n>  # emit a standalone CLI
```

Currently only one server is registered with it (`linkedin`, 19 tools, healthy).
Registering **Notion** with `mcporter` and calling it from Bash inside the
routines would remove ~30 tool schemas from every single routine run — the
single largest available saving, and it applies to all eight local routines at
once.

**`opencli` (@jackwener/opencli 1.8.6)** — "make any website your CLI". Ships six
of its own skills (`opencli-usage` is the entry point) and is the browser backend
behind the `agent-reach` skill. Useful for driving logged-in sites without
Playwright's 25 tool schemas.

### Disk

`~/.claude` is ~670 MB. Almost all of it is legitimate:

```
projects  548M   plugins  80M   skills  19M   skills-library  8.7M
backups   4.8M   agents-library 4.1M   shell-snapshots 3.0M
```

`projects/` is session transcript history and is the only real growth. Two safe
reclaims, neither urgent: `shell-snapshots/` (3 MB, regenerated) and
`backups-20260825-205936/` (116 KB, a one-off from the skills split).

### Current best practice, checked against published guidance

- Keep Tool Search on — it is the default now and is doing the heaviest lifting.
- Disable MCP servers not needed for the session; most work touches one or two.
  Globally configured here: `github`, `playwright`, `vibevoice`. `playwright`
  duplicates the built-in Browser pane tools and is a candidate for removal.
- Prefer a CLI (`gh`, `nlm`, `mcporter`) over an MCP server wherever one exists —
  zero schema cost.
- Scope tools per task rather than exposing everything.

Sources: [getmaxim.ai](https://www.getmaxim.ai/articles/how-to-reduce-mcp-token-costs-for-claude-code-at-scale/),
[mcp.directory](https://mcp.directory/blog/mcp-context-bloat-fix-2026-tool-search-code-mode-progressive-disclosure),
[primeline.cc](https://primeline.cc/blog/context-management).

---

## 4. The news archive is not broken

The owner asked why `/news/` showed only two cards for 26 Aug. It is correct.

The cloud routine ran at 01:00 UTC and **filed 22 archive pages successfully** —
its run log confirms all five webhook POSTs returned `{"ok": true}` and all 22
Notion pages were created. The sync at 05:05 UTC picked them all up; `news.json`
holds 266 entries with **zero duplicate headlines**.

The routine dates each story by **the story's own publication date, not the run
date** — that is what its prompt asks for, and it is the right choice for an
archive. It runs at 06:27 IST, so on any given morning almost nothing has been
published yet under that day's date. Today's 22 stories were dated mostly 25 Aug.

That fully explains the apparent decline (30 → 22 → 22 → 15 → 18 → 4 → 5 → 11 →
7 → 2): recent dates have not finished filling in. 22 Aug and 23 Aug are low for
a different and equally ordinary reason — they were a Saturday and a Sunday.

**No fix needed.** If the owner wants the newest day to look fuller, the change
is presentational — group the index by *ingestion* date, or label the top group
"Latest" rather than by date — not a pipeline repair.

---

## 5. Update 2026-08-28 — full token accounting, and what changed since 26 Aug

Re-audited after the owner asked, again, why runs cost so much. Two of the three
levers in §1 are still not pulled, and the tool surface has **grown**, not shrunk.

### 5.1 Every token source in one cold routine run, biggest first

A local scheduled task starts a fresh Claude Code session on this PC. It inherits
the machine-wide config — MCP servers, plugins, skills, agents — because **none of
the seven blog routines declare a restricted tool set** (`ls ~/.claude/scheduled-tasks/*/`
shows a lone `SKILL.md` in each; no `allowed_tools`, no `--allowedTools`). The
one cloud routine restricts itself to six tools; the locals restrict nothing.

| # | Cost centre | Rough size (cold, before work) | Notes |
|---|---|---|---|
| 1 | **claude.ai account MCP connectors** | **largest single block** | `claude mcp list` shows **26 connected**: Notion, Gmail, Google Drive, Google Calendar, Figma, Canva, Supabase, Vercel, HubSpot, Apollo.io, Outreach, Lusha, Miro, Spotify, Context7, Ahrefs, Send, Mobbin, Mermaid Chart, TickTick, Todoist, MindMap, Higgsfield, HyperFrames, Anthropic Economic Index, Unsplash. Tool Search keeps *schemas* out until first call, but every server still spends its name + description every session, and the first Notion call in a routine loads the full ~40-tool Notion schema. **§2 of this doc said "No MCP connectors are registered on the claude.ai account." That is now false** — this is the biggest regression since 26 Aug. |
| 2 | **Local + project MCP servers** | 25–40k if a tool is touched | `playwright` (25 tools, duplicates the built-in Browser pane), `vibevoice` (**fails to connect — burns a 30s timeout on every cold start**), `unsplash` (local, missing its key). Plus built-ins always present: Browser pane (~25), computer-use (~14), ccd session-mgmt (~13), scheduled-tasks (4), mcp-registry (3), visualize (4). |
| 3 | **Agent persona listing** | ~10–15k | 27 personas in `~/.claude/agents/`, injected every session **and again into every sub-agent**. A radar uses none of them. |
| 4 | **Skill descriptions** | ~6–10k | `~/.claude/CLAUDE.md` still claims "10 skills / 1,406 tokens". Reality: enabled plugins are `claude-obsidian`, `stratx`, `waibi-sabi-os` (from `PluginsClaude/plugin/`), plus an auto-installed official marketplace pulling in `anthropic-skills` (~15 skills), `pdf-viewer` (7), `cowork-plugin-management` (2). `ponytail` (6) and `claude-mem` (18) caches are on disk. The live skill listing this session is 60+ skills, not 10. |
| 5 | **`~/.claude/CLAUDE.md`** | ~2k | The split-rationale essay itself is context on every run. |
| 6 | **The routine's own `SKILL.md`** | 1.5–5k | `wc -c`: `ai-article-writer` 18.3k, `case-studies-writer` 11.7k, `talks-writer` 9.8k, `business-radar` 8.7k, `basics-radar` 8.6k, `daily-ai-seo-radar` 6.9k, `artwork-routine` 5.6k. Not the problem — 74k chars across all nine. |
| 7 | Harness system prompt, `MEMORY.md`, SessionStart hook | ~3–5k | Fixed, unavoidable. |
| 8 | **The actual work** | 10–60k+ per run | WebSearch result sets (5–15k each), WebFetch of full pages (5–50k each; a radar fetches several), and the Notion pipeline read every radar does to answer "has this been covered?" (full data-source query, uncached). |
| 9 | **Sub-agent spawns** | **~100k each, multiplied** | Any `Task`/subagent re-pays items 1–7 in full. `ai-article-writer` doing multi-source research is the likely multiplier behind the worst runs. |

**Why a run that finds nothing still costs ~100k+:** items 1–7 are all paid at
session start, before the routine reads a single search result. Cadence barely
moves that number; the tool surface is the number.

### 5.2 What changed since the 26 Aug audit

| Change | Effect on cost |
|---|---|
| 26 claude.ai MCP connectors now connected (were zero) | **↑ large** — the dominant new cost |
| 3 radars + `case-studies-writer` + `talks-writer` all moved to **daily** crons (the "one thing not done" from the 26 Aug handoff — now done) | ↑ throughput of cold starts: ~20 local routine runs/day, each paying the full baseline |
| `waibi-sabi-os` plugin added, sourced from `PluginsClaude/plugin/` — adds 4 skills, 5 commands, 4 hooks (incl. a Bash `PreToolUse` guard that runs on every Bash call in every routine) | ↑ small, but the Bash hook adds latency to the busiest tool |
| New scripts `flag-pipeline-failure.mjs`, `sweep-stuck-rows.mjs` + `sweep-stuck.yml` | neutral — CI only, no session cost |
| `business-radar` and `basics-radar` crons are **identical** (`10 7 * * *`) and collide with `daily-ai-seo-radar` (`0 7 * * *`) | not a token cost, but three cold sessions fire inside ten minutes — the staggering §"Cadence lives in two places" prescribes was never applied |

### 5.3 The levers, ranked by saving × effort — none of the big ones are pulled

1. **Disable the ~22 unused claude.ai connectors.** A blog routine needs Notion
   and web fetch. Figma, Canva, Spotify, HubSpot, Apollo, Outreach, Lusha, Miro,
   Vercel, Supabase, Context7, Ahrefs, Send, Mobbin, Mermaid, TickTick, Todoist,
   MindMap, Higgsfield, HyperFrames, Econ Index, Google Drive/Calendar contribute
   nothing to any routine. Manage at <https://claude.ai/customize/connectors>.
   Largest single saving, applies to all seven routines and every interactive
   session, costs nothing.
2. **Give each routine an `allowed_tools` list** like the cloud news routine's
   (`Bash`, `WebSearch`, `WebFetch`, three Notion tools). This is the §1(a) lever,
   still unpulled. It caps the surface regardless of what the machine config grows
   to next.
3. **Register Notion with `mcporter` and call it from Bash.** `mcporter list`
   still shows only `linkedin` registered. A CLI call through Bash costs zero
   schema tokens; this removes ~40 tool schemas from every run that touches Notion
   — which is all of them.
4. **Remove `vibevoice` and `playwright` from the global MCP config.**
   `vibevoice` is dead weight that times out on every cold start; `playwright`
   duplicates the built-in Browser pane. Neither is used by any routine.
5. **Cache the Notion pipeline digest.** Refresh a `status.json`-style file once
   a day; the three radars read the file instead of each running a full
   data-source query. §1(c), still unpulled.
6. **Trim `~/.claude/agents/` for routine runs** — 27 personas injected into every
   run (and every sub-agent) that no radar or writer ever spawns.
7. **Stagger the radar crons** so three cold sessions do not start inside ten
   minutes — and fix the docs that still say `:16` / `:20`.

Cadence is still **not** the lever. Cutting daily radars back to weekly saves
~5 cold starts a day and loses five-sevenths of the idea flow; pulling lever 1
saves more than that on every remaining run and on every session the owner opens
by hand.
