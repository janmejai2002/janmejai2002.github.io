# Wiring the routines into Windows Task Scheduler

This replaces the in-app `scheduled-tasks` runner with `claude -p` invocations
that load a tiny surface (see `routines/README.md` for why). **Do this one
routine at a time**, and only after `run.ps1` has produced a good result by
hand.

## Per routine

`schtasks` uses local time. Stagger the three radars so they do not cold-start
inside the same minute (the current in-app crons have `business-radar` and
`basics-radar` both at 07:10).

```bat
:: technical radar — 07:08 daily
schtasks /create /tn "waibi\daily-ai-seo-radar" /sc daily /st 07:08 ^
  /tr "pwsh -NoProfile -File C:\Users\Janmejai\PluginsClaude\routines\run.ps1 -Routine daily-ai-seo-radar" /rl LIMITED /f

:: business radar — 07:12 daily
schtasks /create /tn "waibi\business-radar" /sc daily /st 07:12 ^
  /tr "pwsh -NoProfile -File C:\Users\Janmejai\PluginsClaude\routines\run.ps1 -Routine business-radar" /rl LIMITED /f

:: basics radar — 07:16 daily
schtasks /create /tn "waibi\basics-radar" /sc daily /st 07:16 ^
  /tr "pwsh -NoProfile -File C:\Users\Janmejai\PluginsClaude\routines\run.ps1 -Routine basics-radar" /rl LIMITED /f

:: writer — every 4 hours
schtasks /create /tn "waibi\ai-article-writer" /sc hourly /mo 4 /st 00:05 ^
  /tr "pwsh -NoProfile -File C:\Users\Janmejai\PluginsClaude\routines\run.ps1 -Routine ai-article-writer" /rl LIMITED /f

:: talks writer — 08:33 daily
schtasks /create /tn "waibi\talks-writer" /sc daily /st 08:33 ^
  /tr "pwsh -NoProfile -File C:\Users\Janmejai\PluginsClaude\routines\run.ps1 -Routine talks-writer" /rl LIMITED /f

:: case studies writer — 08:52 daily
schtasks /create /tn "waibi\case-studies-writer" /sc daily /st 08:52 ^
  /tr "pwsh -NoProfile -File C:\Users\Janmejai\PluginsClaude\routines\run.ps1 -Routine case-studies-writer" /rl LIMITED /f

:: artwork — every 4 hours at :35
schtasks /create /tn "waibi\artwork-routine" /sc hourly /mo 4 /st 01:35 ^
  /tr "pwsh -NoProfile -File C:\Users\Janmejai\PluginsClaude\routines\run.ps1 -Routine artwork-routine" /rl LIMITED /f
```

## The watchdog

Independent of the routine cutover — safe to add now.

```bat
schtasks /create /tn "waibi\manager" /sc minute /mo 10 ^
  /tr "pwsh -NoProfile -File C:\Users\Janmejai\PluginsClaude\routines\manager.ps1" /rl LIMITED /f
```

Test it first: `pwsh routines\manager.ps1 -DryRun`.

## Disable the in-app twin as each one is proven

In a Claude Code session, per routine:

```
scheduled-tasks MCP -> update_scheduled_task { taskId: "<id>", enabled: false }
```

Keep it disabled-not-deleted for a week as a fallback. If a Task Scheduler run
misbehaves, flip `enabled: true` back and delete the schtask.

## Rollback

```bat
schtasks /delete /tn "waibi\<routine>" /f
```

then re-enable the in-app task.

## Notes

- `run.ps1` needs the machine awake and signed in, same as the in-app runner.
- `-rl LIMITED` runs as the current user without elevation. If `claude` is not
  on `PATH` for the scheduler context, put its full path in `run.ps1`.
- Logs land in `routines/runs/<routine>-<timestamp>.json`; the token usage is
  appended to `routines/runs.jsonl`.
