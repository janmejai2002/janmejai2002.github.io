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
| Blocked Reason | The system's exact message, with counts and the first offending text |
| Playbook | The standard fix for each code (same as failure-codes.md) |
| Previous Notes | What the last repair attempt changed and could not fix |
| Current Draft | The full draft to fix |

## The method

1. **Fix only what is listed.** Apply the playbook for every code in Failure Codes, including warning codes (G-SOURCES, G-LENGTH, G-STYLE). Do not rewrite sections that passed, change the argument, or "improve" the voice. A repair that rewrites the article creates new failures.
2. **Find every instance, not the first.** Blocked Reason shows the first offending text and a count. Search the whole draft: every code block, every `$`, every table.
3. **Never invent facts.** If a fix needs a source (G-SOURCES), open the pages and follow the claim-ledger rule in `waibi-house-style`. If a claim cannot be sourced, delete it. Never add a link you have not opened.
4. **Read Previous Notes first.** If the last attempt says something could not be fixed, try a different approach, not the same one.
5. **Keep the skeleton intact:** the three callout lines first, `## Executive TL;DR`, the body, `## Sources`, `## Artwork brief`, `## Artwork SVG`.
6. **Re-check before filing.** For each code, confirm it is gone. Count the title, meta description and Reader Question characters.
7. **Skip what you cannot help.** Any code marked "NOT repairable" in failure-codes.md: skip the row.

## Output

For each repaired article append one row to **Repair Outbox**:

`Date | Key (copied exactly) | Attempt (= Next Attempt) | Title (new if you changed it, else unchanged) | Draft (the full fixed markdown) | Changed (one line per code: what you did) | Not Fixed (anything you could not fix and why, or "none")`

Never write a second Outbox row for the same Key and Attempt. If one already exists, skip that article.
