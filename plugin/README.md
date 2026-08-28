# waibi-sabi-os

A Claude Code plugin that packages the operating knowledge and session rituals
for the **wAIbi-sabi blog OS** — the Notion-controlled, routine-driven Astro
publishing system in this repo (`C:\Users\Janmejai\PluginsClaude`, live at
<https://janmejai2002.github.io>).

It exists because every session on this project starts the same way — "read
`docs/HANDOFF-NEXT-SESSION.md`, then `HANDOFF.md`, then `LESSONS.md`, then
`PUBLISHING.md` / `ARTWORK.md`" — and ends the same way — `npm run build` from
`site/` with the dev server stopped, check live routes for content not a 200,
commit in logical chunks, push to deploy. This plugin makes that knowledge
loadable on demand and the rituals one command each, and it guards the two
rules that must never break.

## What's in it

### Skills (loaded by description, invoked on demand)

| Skill | Covers |
|---|---|
| `blog-os` | System map: the five tracks + routines, the Notion control plane and its three data-source IDs, the two publish paths, the two scheduling systems, the six unbreakable guardrails, the machine gotchas, the verify gate. The always-on summary of `docs/HANDOFF.md`. |
| `blog-publish` | The publish pipeline operating manual — `AUTO_TRACKS`, the frontmatter the generator produces, the dry-run commands, "when it refuses it tells Notion". Summary of `docs/PUBLISHING.md`. |
| `blog-artwork` | The artwork design language, the palette-placeholder table, the SVG mechanics the pipeline validates, the reusable generation prompt. Summary of `docs/ARTWORK.md`. |
| `blog-routines` | The seven local blog routines + the cloud news feeder, the cadence-drift trap, the Track hardcode checklist, how to change a schedule, the per-run token cost model. |

The skills are **summaries that point at `docs/` as canonical** — deliberately,
so a change to a rule lands in one place and the plugin does not drift from the
docs (that drift is itself one of the project's recorded lessons).

### Commands

| Command | Does |
|---|---|
| `/blog-start` | Full session pickup: reads the handoffs, reports git / build / deploy / Notion-pipeline / routine state, proposes next steps. |
| `/blog-status` | Fast pipeline read — Notion queue, routine last-runs, last deploy, open PRs. No doc reading. |
| `/blog-doctor` | Full health check: runs `site/scripts/doctor.mjs --deep` (Notion token, radar gate, Needs Revision + reasons, stalled/stuck rows, unconvertible draft blocks, live-URL drift, git, build freshness), then adds the GitHub Actions and local-routine state the script cannot see, and says what is stuck and on whom. |
| `/blog-dashboard` | Builds `site/scripts/dashboard.mjs` — one self-contained HTML page with the whole pipeline (doctor findings, stuck rows, routine health, recent Actions runs, open PRs) and a copy-to-run command for every fix — and opens it in the side panel. |
| `/blog-verify` | The pre-done gate: stop dev server → `npm run build` (runs `check-build`) → confirm changed live routes serve the actual content, cache-busted. |
| `/blog-ship` | Runs the gate, groups the diff into logical commits in the repo's terse house style, writes each message to a file (PowerShell apostrophe trap), pushes, watches the deploy run. |
| `/blog-handoff` | Rewrites `docs/HANDOFF-NEXT-SESSION.md` for a cold pickup — what landed and is verified, what's open, what to watch, the paste-in prompt. |

### Hooks

| Hook | Guard |
|---|---|
| `SessionStart` | One-line pointer to the commands and the two rules — only when cwd is this repo. |
| `PreToolUse` / `Bash` | Blocks `git commit` / `git push` while HEAD is on `notion/approved-articles` (the publish poll destroys commits there). |
| `PreToolUse` / Notion writes | Blocks any call that sets `Draft Status = Approved` — that flag is the owner's alone. |

## Install

This is a directory-source plugin, same shape as `stratx`.

```
/plugin marketplace add C:\Users\Janmejai\PluginsClaude\plugin
/plugin install waibi-sabi-os@waibi-sabi-os
```

Then restart Claude Code. `/blog-start` to confirm it is live.

## Layout

```
plugin/
  .claude-plugin/
    plugin.json
    marketplace.json
  skills/{blog-os,blog-publish,blog-artwork,blog-routines}/SKILL.md
  commands/{blog-start,blog-status,blog-doctor,blog-dashboard,blog-verify,blog-ship,blog-handoff}.md
  hooks/
    hooks.json
    session-pointer.sh
    guard-pr-branch.sh
    guard-approved.sh
```

## Maintenance

When a rule in `docs/` changes, update the matching skill in the same commit.
The skills carry the *summary and the IDs*; the docs carry the reasoning and the
history. If you rename a track, run the hardcode checklist in the `blog-routines`
skill — the plugin's skills are one more place the old value could linger.
