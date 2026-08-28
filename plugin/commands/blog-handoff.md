---
description: Rewrite docs/HANDOFF-NEXT-SESSION.md so the next session can pick up cold — what landed and is verified, what is open, what to watch for, and the paste-in prompt.
---

Regenerate `C:\Users\Janmejai\PluginsClaude\docs\HANDOFF-NEXT-SESSION.md` from
this session's work. Match the existing file's structure and voice — read the
current version first.

## Include

- **Opening line:** date, the commit HEAD is at on `main`, working-tree state
  (clean / what is dirty and why), build + `check-build` status, page count,
  published article count.
- **THE ONE THING NOT DONE** (if anything) — the single most important unfinished
  item, stated as an instruction, at the top.
- **What landed this session** — only things actually done *and verified*. For
  each, one line on what it changes and how it was verified (build, live route,
  Notion reconciled). No aspirational entries.
- **Waiting on the owner** — decisions only the owner makes: rating radar ideas,
  `Draft Status = Approved`, design/logo/sponsorship calls, anything needing a
  credential created.
- **Watch for** — things that might look broken but are not, or first runs of
  new machinery that need a check.
- **Traps that still bite** — carry forward the environment/pipeline gotchas
  from the current file that are still true; drop any that no longer apply.
- **The prompt to paste** — a fenced block the owner can paste into a fresh
  session: what to read, the first job, the standing constraints (verify with
  `npm run build` in `site/`, check live content not 200, never set Approved).

## Also

- If you learned something durable this session, add it to `docs/LESSONS.md`
  (one entry: one-line heading, then why it mattered) rather than only putting
  it in the handoff.
- Do not commit — leave the file for the user to review, or fold it into the
  next `/blog-ship`.
