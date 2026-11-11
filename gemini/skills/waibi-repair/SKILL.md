---
name: waibi-repair
description: How to fix a wAIbi-sabi draft the publishing system rejected. Use in the Repairer task, or whenever asked to repair a draft from the Repair Queue tab. failure-codes.md has the exact fix for every failure code.
---

# Repairing a rejected wAIbi-sabi draft

The publishing system rejected a draft and wrote down why. Each row of the **Repair Queue** tab is one rejected article:

| Column | Meaning |
|---|---|
| Key | The article's permanent ID. Copy it exactly into your output. |
| Title | Current title |
| Track | Its track |
| Next Attempt | The attempt number you are making (write this in Attempt) |
| Mode | `sections` (fix only the sections in the **Repair Sections** tab) or `full` (fix the whole Current Draft) |
| Failure Codes | What failed, e.g. `G-ASCII, G-LATEX` |
| Blocked Reason | Every finding, blocking first: `CODE: message Where: "Section" (quoted text); …` |
| Playbook | The standard fix for each code (same as failure-codes.md) |
| Previous Notes | What the last repair attempt changed and could not fix |
| Current Draft | The full draft to fix (`full` mode only; empty in `sections` mode) |

In `sections` mode the **Repair Sections** tab holds one row per section you may change: `Key | Attempt | Section ID | Heading | Findings | Text`. Findings lists that section's problems; Text is the section exactly as it is now, starting with its `## ` heading line. Every other section is copied by the system unchanged, so you cannot damage it.

## The method

0. **Use only these skills:** `waibi-repair`, `waibi-house-style`, `waibi-artwork`, `waibi-sheet-contract`. Do not load any other writing, style or "humanize" skill, and do not open other drafts or articles to compare. The rules you need are all here.
1. **Blocked Reason is the job.** Each code is followed by `Where:` with the section heading and the quoted text that failed. Edit only those sections. The publishing system compares your draft with the previous one and **refuses the repair** (it still costs an attempt) if a section that no finding names has changed, or if you add a new blocking problem. Codes with no `Where:` (G-SOURCES, G-BLOCK and the build codes) may need edits anywhere, but still change as little as possible.
2. **Blocking codes first; warnings only if cheap.** Warning codes (G-LENGTH, G-STYLE, G-SOURCES, G-ART) never justify cutting or rewriting content. Fix a warning only inside a section you are already editing. Never delete a section to save words.
3. **Findings are authoritative.** Fix every instance listed (`+N more` means search that section for the rest). If a listed instance is not in the draft, say so in Not Fixed and move on. Do not hunt for problems the findings do not list.
4. **Count words the way the gate does:** prose only. Code blocks, inline `code`, HTML tags and the Artwork sections are not counted. The limit is in failure-codes.md under G-LENGTH.
5. **Never invent facts.** If a fix needs a source (G-SOURCES), open the pages and follow the claim-ledger rule in `waibi-house-style`. If a claim cannot be sourced, delete it. Never add a link you have not opened.
6. **Read Previous Notes first.** If they start with "REFUSED", your last attempt was thrown away: the Current Draft is the one before it, and Blocked Reason says why it was refused. If the last attempt says something could not be fixed, try a different approach, not the same one.
7. **Keep the skeleton intact:** the three callout lines first, `## Executive TL;DR`, the body, `## Sources`, `## Artwork brief`, `## Artwork SVG`. Keep every heading's wording unless the finding is about that heading.
8. **Re-check before filing.** For each code, confirm it is gone. Count the title, meta description and Reader Question characters.
9. **Skip what you cannot help.** Any code marked "NOT repairable" in failure-codes.md: skip the row.

## Output — `sections` mode

1. For each section you changed, append one row to **Repair Patches**:
   `Date | Key (copied exactly) | Attempt (= Next Attempt) | Section ID (copied exactly from Repair Sections) | Text (the whole fixed section, starting with its unchanged "## " heading line)`
   Copy the section's Text and edit only what the findings name; everything else in it stays word for word. One row per section; skip sections you did not change.
2. **Then** append one row to **Repair Outbox**, with `PATCHES: <number of Repair Patches rows you wrote>` in the Draft column:
   `Date | Key | Attempt | Title (new if you changed it, else unchanged) | PATCHES: 1 | Changed | Not Fixed`
   Write the patches first and the Outbox row last: the system waits until it sees as many patch rows as the Outbox row promises.
3. Never paste the whole article anywhere in this mode.

## Output — `full` mode

Append one row to **Repair Outbox**:

`Date | Key (copied exactly) | Attempt (= Next Attempt) | Title (new if you changed it, else unchanged) | Draft (the full fixed markdown) | Changed (one line per code: what you did) | Not Fixed (anything you could not fix and why, or "none")`

Copy the whole Current Draft and change only what the findings name. Do not retype it from memory: the system compares every section with the previous draft and refuses the repair if any unnamed section differs.

Never write a second Outbox row (or a second set of patches) for the same Key and Attempt. If one already exists, skip that article. Sheet tabs are append-only: never edit or delete a row you or anyone else wrote, even to correct it; if a filed row is wrong, say so in the chat summary and stop.
