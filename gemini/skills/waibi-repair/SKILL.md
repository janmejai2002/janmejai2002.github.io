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
| Failure Codes | What failed, e.g. `G-ASCII, G-LATEX` |
| Blocked Reason | Every finding, blocking first: `CODE: message Where: "Section" (quoted text); …` |
| Playbook | The standard fix for each code (same as failure-codes.md) |
| Previous Notes | What the last repair attempt changed and could not fix |
| Current Draft | The full draft to fix |

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

## Output

For each repaired article append one row to **Repair Outbox**:

`Date | Key (copied exactly) | Attempt (= Next Attempt) | Title (new if you changed it, else unchanged) | Draft (the full fixed markdown) | Changed (one line per code: what you did) | Not Fixed (anything you could not fix and why, or "none")`

Never write a second Outbox row for the same Key and Attempt. If one already exists, skip that article.
