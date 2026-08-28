# routines/ — the token-cheap way to run the scheduled routines

## Why this exists

A routine on the in-app `scheduled-tasks` runner starts a full interactive
Claude Code session and inherits, cold, everything the owner's machine has:

- 26 claude.ai account MCP connectors (Notion, Gmail, Figma, Canva, Supabase…)
- local MCP servers (playwright, unsplash)
- 27 agent personas, 60+ skill descriptions
- and there is **no field on the scheduled task to scope any of it**

A radar uses one Notion call and a web search. It should not be paying for the
other 25 connectors and the agent catalogue on every run. `docs/research/token-and-cloud-audit.md`
§5 has the full accounting.

## What this changes

`run.ps1` invokes the same prompt (`~/.claude/scheduled-tasks/<name>/SKILL.md`)
through `claude -p` with:

| Flag | Effect |
|---|---|
| `CLAUDE_CONFIG_DIR=routines/config` | empty `agents/`, 2 skills (`anti-ai-writing`, `seo-topic-research`), no plugins |
| `--strict-mcp-config --mcp-config routines/mcp.json` | **zero** MCP servers — `mcp.json` is `{}` |
| `--allowedTools "Bash WebSearch WebFetch Read Write Edit Glob Grep Skill"` | explicit allowlist |
| `--output-format json` | the real `usage` block is captured to `runs.jsonl` |

Notion is reached with `node site/scripts/notion.mjs` (a Bash call, zero schema
cost) instead of the MCP connector. The prompt is unchanged; only the runner is.

Expected saving: the fixed cold-start cost drops from ~100k toward ~20–30k.
Confirm it with `runs.jsonl` once a few runs have gone through.

## Bringing it up — do not big-bang this

0. **Rewrite the routine prompts to use the CLI.** The seven `SKILL.md` prompts
   currently tell the model to call `notion-query-data-sources`,
   `notion-create-pages`, `notion-fetch` and "Brave Search MCP". With
   `--strict-mcp-config` and an empty `mcp.json` those tools do not exist. Each
   prompt's Notion steps must be reworded to
   `node site/scripts/notion.mjs <verb>` and its search steps to
   `WebSearch` / `WebFetch`. Do this one prompt at a time and diff carefully —
   these are the same files the in-app runner uses, so a mistake breaks the
   live routine. (Bonus: once a prompt stops naming a Notion MCP tool, the
   in-app run stops expanding the ~40-tool Notion schema too — a partial saving
   before the cutover even happens.)
   Before rewriting the writer prompts, confirm `notion.mjs file-idea` and
   `promote` against the live database schema (property names, the
   Article ↔ Source Idea relation) — the read verbs are verified, those two
   writes are not.
1. **Prereqs**: `notion.mjs`, `notify.mjs`, `log-run.mjs` on `main`; `NOTION_TOKEN`
   in `C:/Users/Janmejai/Notion/.env` (already there).
2. **One dry run**: `pwsh routines/run.ps1 -Routine business-radar -DryRun`
   — prints the command, runs nothing.
3. **One real run by hand**: `pwsh routines/run.ps1 -Routine business-radar`
   Then check Notion: did it file an idea row that looks like a normal
   `business-radar` run? Check `routines/runs/` for the transcript and
   `routines/runs.jsonl` for the token count.
4. **If good**: add that one routine to Task Scheduler (`schtasks.md`) and
   disable its in-app twin (`update_scheduled_task { enabled: false }`).
   Keep the twin disabled-not-deleted for a week.
5. Repeat per routine. Radars first (they only file ideas — fully reversible),
   then the writers, `ai-article-writer` last, `artwork-routine` after that.
6. Once all seven are on Task Scheduler and stable, delete the in-app tasks.

## Trying Haiku on the radars

`pwsh routines/run.ps1 -Routine daily-ai-seo-radar -Model haiku`. Run both
models for two weeks; compare the owner's `Interest Rating`s on what each filed.
Keep the writers on `sonnet` regardless.

## Files

```
mcp.json            {} — the whole point
run.ps1             the wrapper
schtasks.md         Task Scheduler commands + rollback
config/settings.json  model, tight permissions
config/CLAUDE.md    routine-scoped instructions (use the notion CLI, the rules)
config/skills/      the 2 skills the writers need
config/agents/      empty on purpose
runs/               per-run JSON transcripts (gitignored)
runs.jsonl          one telemetry line per run (gitignored)
```
