# gemini/ — the Gemini side of the harness

| Path | What it is |
|---|---|
| `TASK-PROMPTS.md` | The prompt and schedule for every Gemini scheduled task. Paste from here. |
| `skills/<name>/` | The four skills the tasks load. Upload each folder to Gemini. |

## Uploading the skills (once, then whenever a skill changes)

Gemini → **Skills** → **New skill** → **Upload**, then pick a folder's files (`SKILL.md` plus everything next to it, including `examples/` for the artwork skill). Do this for each of the four:

- `waibi-house-style` — the editorial contract (`SKILL.md`, `rules.md`)
- `waibi-artwork` — the SVG plate contract (`SKILL.md`, `tokens.md`, `examples/*.svg.txt`)
- `waibi-sheet-contract` — how tasks use the Sheet (`SKILL.md`, `sheet.md`)
- `waibi-repair` — how to fix a rejected draft (`SKILL.md`, `failure-codes.md`)

To update a skill, open it in Gemini and replace its files with the new ones from this folder.

## Where the rules come from

`rules.md`, `sheet.md`, `failure-codes.md` and `tokens.md` are **generated** from `site/harness/registry.mjs`, the same file the publishing gates and the Conductor read. Change a rule there, run `node site/harness/generate.mjs`, and re-upload the changed file. The build fails if the generated files are out of date, so the skills can never quietly disagree with the gates.

The `SKILL.md` files are hand-written: they explain *how* to work; the generated files hold the *numbers*.
