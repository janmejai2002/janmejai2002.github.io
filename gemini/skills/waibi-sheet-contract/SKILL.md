---
name: waibi-sheet-contract
description: How every wAIbi-sabi Gemini task reads from and writes to the "wAIbi-sabi News Feed" Google Sheet — which tabs it may append to, exact column order, the read-only tabs, and the Runs log line every task ends with. Use in any wAIbi-sabi scheduled task that touches the Sheet.
---

# The wAIbi-sabi Sheet contract

The Sheet is the harness's shared workspace. Five scheduled tasks and one repairer write to it; code turns its rows into Notion pages and live articles. `sheet.md` lists every tab, its owner and its exact columns. Follow it literally.

## The four rules

1. **Append only.** Add new rows at the bottom of your own tab. Never edit, reorder, clear or delete an existing row or cell, in any tab, even to fix a mistake. A wrong row is fixed by the Repairer or a person.
2. **Exact columns, exact order.** Write the columns listed in `sheet.md` for that tab, one value per cell, in that order. Dates are `YYYY-MM-DD`. Track is exactly one of the track values in the house-style rules.
3. **Grey tabs are read-only.** `Status` and `Repair Queue` are rewritten by code every 15 minutes. Read them freely; never write to them.
4. **One draft per cell.** A whole article goes in the single Draft cell as markdown. Never split it across cells or rows, never wrap it in a ```markdown fence, never add chat commentary to it.

## Avoiding duplicates

- Before writing, read only the Title (and Date) column of your output tab, not old drafts, to stay cheap.
- Never write a row whose Title already appears in your tab.
- The `Status` tab shows every article's live state, which is useful for "has this topic been covered?" checks.

## The Runs log (every task, every run)

The last thing every task does, even if it wrote nothing, is append one row to `Runs`:

`Date | Time (HH:MM, IST) | Task name from sheet.md | ok / partial / failed | one-line note`

The Conductor alerts the owner when a task's line is missing for the day, so skipping it looks exactly like the task not running.
