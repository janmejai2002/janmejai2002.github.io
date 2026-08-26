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
