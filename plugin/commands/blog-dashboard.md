---
description: Build and open the wAIbi-sabi ops dashboard — one HTML page with the whole pipeline: doctor findings, stuck rows, routine health, recent Actions runs, open PRs, and a copy-to-run command for every fix.
---

Produce the dashboard and put it in front of the user. Gather the live data
first; the generator cannot reach GitHub or the local scheduler on its own.

## 1. Gather the augment data

- `gh run list --limit 10 --json workflowName,status,conclusion,event,createdAt,url,databaseId`
- For each run whose `conclusion` is `failure`, also grab a short tail:
  `gh run view <databaseId> --log-failed` — keep ~15 lines with the error.
- `gh pr list --json number,title,headRefName,url,isDraft`
- `scheduled-tasks` MCP `list_scheduled_tasks` — the seven blog routines only.
- If you know it, the cloud news routine's next run (`RemoteTrigger` action
  `get`, or leave it out).

Write these into a JSON file in the scratchpad, shaped as:

```json
{
  "actionsRuns": [{ "workflow": "...", "status": "...", "conclusion": "...",
                    "event": "...", "createdAt": "...", "url": "...",
                    "id": 123, "logTail": "..." }],
  "prs": [{ "number": 1, "title": "...", "headRefName": "...", "url": "..." }],
  "routines": [{ "taskId": "...", "schedule": "...", "enabled": true,
                 "lastRunAt": "...", "nextRunAt": "...", "note": "" }],
  "cloudRoutine": { "name": "AutoSipNews", "cron": "57 0 * * *", "nextRunAt": "" },
  "notes": ["anything the doctor could not capture"]
}
```

Put a `note` on a routine only when something is off — e.g. `"collides with
basics-radar"`, `"last run failed"`.

## 2. Build it

From `C:\Users\Janmejai\PluginsClaude\site`:

```
node scripts/dashboard.mjs --augment <scratchpad>/aug.json --out <scratchpad>/blog-dashboard.html
```

The generator runs `doctor.mjs --deep` itself, merges the augment file, derives
the action list, and writes a self-contained page (no network, theme-aware).

## 3. Open it

Send the file to the user with `SendUserFile`, `display: "render"`, so it opens
in the side panel. Then say, in two or three lines, what the dashboard shows:
the verdict, the single most important stuck item, and how many actions it
lists.

## Acting on it

The dashboard's buttons **copy** a command; they do not run it. The user runs a
command themselves, or tells you **"run dashboard action N"** — then execute
that action's command (or the Notion/PR edit it stands for), re-run this command
to refresh the page, and report the new verdict.
