---
description: Quick state of the wAIbi-sabi pipeline — Notion queue, routine last-runs, last deploy, open PRs. No doc reading, no proposals.
---

A fast read of where the blog is right now. Do not read the handoff docs, do not
propose work — just report. For the full pickup use `/blog-start`.

Report, compactly:

1. **Notion — 📝 AI Blog OS Pipeline** (`511e41a3-c1cd-47e0-8fa2-d319feef0ced`,
   Notion MCP SQL mode): how many `Radar Idea` rows are unrated, how many rated
   4/5 await promotion, how many rated 1–3.
2. **Notion — ✍️ Article Production** (`d39ea073-cc87-4c25-8a3c-d9f276a59b68`):
   count by `Draft Status`. For any `Needs Revision`, print its `Blocked Reason`.
3. **Routines:** `scheduled-tasks` MCP `list_scheduled_tasks` — for the seven
   blog routines only, last run result and next scheduled run. Flag failures.
4. **Deploy:** `gh run list --limit 3` — status of the latest `deploy` and
   `publish-from-notion` runs.
5. **Open PRs:** `gh pr list` — anything on `notion/approved-articles` waiting
   for a read-through.
6. **Git:** branch + ahead/behind `origin/main`, in one line.

End with a single sentence: is anything blocked, and on whom.
