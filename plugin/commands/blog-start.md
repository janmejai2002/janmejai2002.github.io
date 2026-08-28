---
description: Pick up the wAIbi-sabi blog — read the handoffs, report the live state of the repo, build, deploy and Notion pipeline, and propose what to do next.
---

Read the `blog-os` skill first, then run the session pickup. Do the reads and
checks yourself; do not ask the user to.

## 1. Read the handoffs

In this order, from `C:\Users\Janmejai\PluginsClaude`:

1. `docs/HANDOFF-NEXT-SESSION.md` — where the last session stopped, and its
   "Watch for" / "still not done" items.
2. `docs/HANDOFF.md` §0 (editorial spine) and §8 (open items) — skim the rest.
3. `docs/LESSONS.md` — the newest entries especially.

## 2. Report the state — one screen, facts only

- **Git:** current branch, `git status --short`, `git log --oneline -5`, whether
  local is ahead/behind `origin/main`. Flag if HEAD is on `notion/approved-articles`
  (you must not commit there).
- **Build:** has anything under `site/src`, `site/scripts`, `site/public` or
  `site/astro.config.mjs` changed since the last commit? If so say
  "unverified — run `/blog-verify`".
- **Deploy:** `gh run list --limit 5` — last deploy / publish-from-notion status.
- **Open PRs:** `gh pr list` — any `notion/approved-articles` PR waiting for a
  read-through.
- **Notion pipeline** (via the Notion MCP, SQL mode):
  - 📝 AI Blog OS Pipeline `511e41a3-c1cd-47e0-8fa2-d319feef0ced` — count of
    unrated `Radar Idea` rows (no `Interest Rating`), and any rated 4/5 not yet
    promoted. Unrated ideas are the throughput gate.
  - ✍️ Article Production `d39ea073-cc87-4c25-8a3c-d9f276a59b68` — rows by
    `Draft Status` (`Draft Ready`, `Approved`, `Needs Revision` + its
    `Blocked Reason`, `Published`).
- **Routines:** `scheduled-tasks` MCP `list_scheduled_tasks` — last run / next
  run / any failures for the seven blog routines (see the `blog-routines` skill
  for which are the blog's).

## 3. Propose next steps

Two or three concrete things, ordered, grounded in what you just found. Call out
anything that is genuinely the owner's decision (never set `Draft Status =
Approved`; design/logo/sponsorship calls) separately as "your call".

Do not start multi-step work until the user responds — but small, safe,
obviously-follows-from-the-handoff fixes can go ahead.
