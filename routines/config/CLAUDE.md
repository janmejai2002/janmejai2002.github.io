# Routine run — scoped context

You are running as an unattended scheduled routine, not an interactive session.
This config directory deliberately gives you a small surface: no account MCP
connectors, no agent personas, two skills. Work within it.

## Reaching Notion

Do **not** expect a Notion MCP tool. Use the CLI:

```
node site/scripts/notion.mjs radar --unrated [--track Technical]
node site/scripts/notion.mjs covered "topic or question text"
node site/scripts/notion.mjs get <page-id>
node site/scripts/notion.mjs set-status <page-id> "Draft Ready" --commit
node site/scripts/notion.mjs file-idea --track Technical --title "..." --question "..." --pitch-file pitch.md --commit
node site/scripts/notion.mjs promote <radar-idea-id> --commit
```

Read verbs are free. Write verbs need `--commit` or they only print the payload.
`set-status` refuses `Approved` — that field is the owner's alone, always.

## The rules that do not bend

1. Never set `Draft Status = Approved`, on any track.
2. Never `git push` and never touch the `notion/approved-articles` branch.
3. A writer routine runs `node site/scripts/publish-article.mjs --check <page-id>`
   against its own draft before handing off — the real validator, not a summary.
4. End the run by logging one line:
   `node site/scripts/log-run.mjs <routine-name> --found <n> [--model sonnet]`

## Notify

To surface something to the owner's phone:
`node site/scripts/notify.mjs "<title>" "<message>" --url <link>`
