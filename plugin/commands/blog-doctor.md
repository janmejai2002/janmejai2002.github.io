---
description: Full health check of the wAIbi-sabi pipeline — runs scripts/doctor.mjs, then adds the GitHub Actions and local-routine state it cannot see, and tells you what is stuck and on whom.
---

One pass over everything that can silently stall. Do the checks yourself; do not
ask the user to. Read the `blog-os` skill if it is not already in context.

## 1. Run the headless doctor

From `C:\Users\Janmejai\PluginsClaude\site`:

```
node scripts/doctor.mjs --deep
```

It checks, read-only: the Notion token, the radar (unrated ideas — the
throughput gate), Article Production (status spread, Needs Revision + reasons,
any row carrying a `Blocked Reason`, unattended rows ready too long), ready
drafts for Notion blocks `toMarkdown()` cannot convert, blog posts on disk vs
their live URLs, git branch / ahead-behind / dirty, build freshness, and that
the four workflows are present. Exit 1 means at least one check failed.

## 2. Add what the script cannot reach

- **GitHub Actions:** `gh run list --limit 8`. For `deploy`,
  `publish-from-notion`, `sync-news` and `sweep-stuck`, give the latest result.
  For any `failure`, run `gh run view <id> --log-failed` and quote the real
  error line — a fast-failing `publish-from-notion` is usually a draft the
  generator choked on, and the row will not always show it.
- **Local routines:** `scheduled-tasks` MCP `list_scheduled_tasks`. For the
  seven blog routines (`daily-ai-seo-radar`, `business-radar`, `basics-radar`,
  `talks-writer`, `case-studies-writer`, `ai-article-writer`, `artwork-routine`)
  report enabled state, last run, next run. Flag any two sharing a cron minute
  (they collide — cold sessions stack up).
- **Open PRs:** `gh pr list` — anything on `notion/approved-articles`.

## 3. Report

A short table of every check with ✓ / ! / ✗, then the fixes worth making as
ready-to-run commands. End with one sentence: what is blocked and whose move it
is (owner decisions — rating radar ideas, `Draft Status = Approved`, design
calls — are called out separately as "your call").

Do not start multi-step work without a yes. Small, obviously-correct fixes
(shorten an over-long meta description in Notion when asked, re-trigger a poll)
can go ahead.
