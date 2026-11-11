# Handoff — 2026-11-11, end of day (from Claude)

Read this whole file before doing anything. It replaces every older handoff. Work in **`C:\Users\Janmejai\janmejai2002.github.io`** on branch **`harness-upgrade`** (it is level with `main`). Before starting, run `git pull origin main` so you have the robots' latest commits. Ignore the folder `janmejai2002.github.io-redesign`: it is empty and dead.

## 0. Ground rules (do not break these)

1. **Pushing to `main` deploys the live website.** Only push when the owner asks, and only after `npm --prefix site run build` passes. The robots also commit to `main` (news syncs, published articles), so always `git pull origin main` before you push.
2. **Never set `Draft Status = Approved`** in Notion. Never commit to the branch `notion/approved-articles`.
3. **Every rule lives in one file: `site/harness/registry.mjs`.** Caps (70/160/120), tracks, Sheet tabs, failure codes and their `scope`, the repair limit and the section-patch spec are all there. If you change it, run `node site/harness/generate.mjs` and commit the files it changes. Never copy a rule into another file, and never hand-edit `gas/Registry.js` or `gemini/skills/*/` generated files.
4. **Never weaken a check** in `site/harness/rules.mjs` or `site/scripts/check-build.mjs` to make an article pass. Fix the article text. If a check is truly wrong (a false alarm), fix the check narrowly and explain why in the commit.
5. **Read a file before editing it.** Make small changes. Build after each change. The build runs the regression tests first (`npm --prefix site test`).
6. If you are unsure, **stop and ask the owner** rather than guessing.

## 1. How the system works

Read `docs/HOW-IT-WORKS.md` (plain English) and `docs/HARNESS-REPAIR-PLAN.md` (why the repair loop is built the way it is). Short version:

```
Gemini tasks ──append rows──> Google Sheet
Conductor (Apps Script in the Sheet, every 15 min) ──> mirrors Notion into the grey tabs, wakes GitHub
GitHub Actions ──> sync-drafts (Sheet → Notion) ──> publish-article (gate) ──> build ──> live site

A draft that fails the gate:
  Notion "Needs Revision" + Failure Codes + Findings (where each problem is) + Blocked Reason
  → Conductor → Repair Queue row, Mode "sections" or "full"
      sections: only the broken sections go to the Repair Sections tab (a few thousand characters)
      full:     the whole draft (only when a code has no single place: G-SOURCES, G-BLOCK, build codes)
  → Gemini Repairer → Repair Patches (one row per fixed section) + Repair Outbox ("PATCHES: n")
  → sync-drafts rebuilds the draft in code, VERIFIES it, applies it → gate again
  Verify refuses a repair that changes a section no finding named, or adds a blocking problem.
After 4 failed repairs → GitHub issue labelled needs-human (your queue)
```

Key places:

| What | Where |
|---|---|
| All rules | `site/harness/registry.mjs` |
| Article checks, findings with section + excerpt, section split | `site/harness/rules.mjs` |
| The gate as one function (publish, sync and tests share it) | `site/scripts/lib/gate.mjs` |
| Verify, patch, rebuild-the-draft logic | `site/scripts/lib/repair.mjs` |
| Normaliser (auto-fixes LaTeX, tables, etc.) | `site/scripts/lib/prose.mjs` |
| Sheet → Notion import, repairs, stale re-check, repair tests | `site/scripts/sync-drafts.mjs` |
| Notion → site file | `site/scripts/publish-article.mjs` |
| Regression tests (fixtures from the first live repair) | `site/harness/regression.test.mjs`, `site/harness/fixtures/` |
| Conductor (Apps Script) | `gas/Conductor.js`, `gas/RepairTest.js` (+ generated `gas/Registry.js`) |
| Gemini prompts and skills | `gemini/TASK-PROMPTS.md`, `gemini/skills/` |

## 2. What was done on 2026-11-11 (all pushed and live)

The first live repair (`DR-20261111-9f8879`, "Flaky Agent Evals…") worked but rewrote ~75% of the article. The causes and fixes, in three phases (details in `docs/HARNESS-REPAIR-PLAN.md`):

- **Phase 1 — stop sending bogus work.** The normaliser converts decimal/percent LaTeX itself. Blocked Reason carries every finding with its message. Warning-only rows are never queued (owner's decision): they publish with the warning logged. G-LENGTH playbook matches the gate (2,200 words, never delete a trade-offs section). Same-day homepage posts sort newest first (`publishedAt`).
- **Phase 2 — locate findings, re-check stale codes, verify before applying.** Every finding names its section and quotes the text. Blocked Reason is stamped `[rules xxxxxxxx]`; sync-drafts re-gates rows checked by older rules. The repaired draft is gated before it touches Notion and refused if it changes unnamed sections or adds a blocking code. Repairer is fenced to its four skills.
- **Phase 3 — section patches.** Gemini gets and returns only the broken sections; code copies the rest. Notion gained `Findings` and `Rejected Attempts`. The Sheet gained `Repair Sections` (grey), `Repair Patches`, `Repair Tests` (grey). Node and Apps Script implement the same split; the regression test loads the real `gas/Conductor.js` to prove it.
- **Result, measured on the same article:** before, 9 of 11 sections changed, 329–718 words removed, refused. After, 1 of 10 sections changed, 0 unflagged, 0 words removed, would be applied; queue to filed in about 7 minutes.
- The section "Where Deterministic Trajectory Gates Break Down", deleted by the first repair, was restored to the live article.
- **Homepage hero:** the cracked-claim plate now shows one article per track, picked at random on every visit (hand-written claims from `src/data/claims.ts` plus each track's newest posts, which use their Reader Question and meta description). The pick is a small inline script in `src/pages/index.astro`.

## 3. Testing the repair loop (one click)

In the Sheet: **wAIbi → Start a repair test**. It files the fixture `site/harness/fixtures/repair-test.md` (one ASCII diagram + one em dash, both in one section) into the `Repair Tests` tab and wakes GitHub. sync-drafts creates its Notion row (key prefix `RT-`); the next Conductor tick queues it in sections mode; the owner fires the Repairer; sync-drafts writes the verdict on the Notion row ("TEST RUN (not applied) … WOULD BE APPLIED / REFUSED") and parks it at `Queued`. A test row is never applied or published. Starting a new test deletes the previous test's Notion row. **wAIbi → Show repair test result** reports the stage.

To read a result yourself: `node site/scripts/sync-drafts.mjs` (dry run) prints the verdict and churn for any filed repair.

## 4. If a "needs-human" GitHub issue appears

```
gh issue list --label needs-human
```
Each issue has the Notion page link, the failure codes and the standard fix. To fix one:
1. Open the Notion page and edit the text to remove the problem. Each code's fix is in `gemini/skills/waibi-repair/failure-codes.md`.
2. Check it: `node site/scripts/publish-article.mjs --check <notion-page-id>`. It must say `PREFLIGHT PASSED`.
3. In Notion, set **Draft Status** to **Draft Ready**. The next publish run ships it.
4. Close the issue with a one-line comment saying what you changed.

## 5. Commands you will need

```powershell
npm --prefix site run build                              # the gate: tests + build + checks; must pass before any commit
npm --prefix site test                                   # regression tests only
node site/scripts/doctor.mjs                             # health check (read-only)
node site/scripts/publish-article.mjs --check <page-id>  # every check on one draft (read-only)
node site/scripts/sync-drafts.mjs                        # Sheet → Notion DRY RUN (read-only): repairs, verdicts, re-checks
node site/harness/generate.mjs                           # after editing registry.mjs
node site/harness/notion-schema.mjs                      # add any new harness property to Notion (additive)
cd gas; clasp -u waibi push -f                           # upload Conductor changes (personal Google login)
gh run list --limit 6                                    # recent GitHub Actions runs
```

Machine notes:
- Stop any dev server before `npm run build`.
- `clasp` has two logins. Always use `-u waibi`; the default login is an XLRI account with no access.
- On Windows, a script may print `Assertion failed: !(handle->flags & UV_HANDLE_CLOSING)` after finishing. That is a Node quirk on exit, not a failure, if the output before it looks right.
- Write commit messages to a file and use `git commit -F <file>` (PowerShell breaks on apostrophes).
- The Sheet's Date columns are real dates; the Sheet's public CSV export blanks text in them. Never write a date as text (no leading apostrophe) except in the code-owned `Repair Tests` tab, which the menu formats as plain text on purpose.
- When copying a UTF-8 file to the clipboard in Windows PowerShell 5.1, use `Get-Content -Raw -Encoding UTF8`, or special characters arrive garbled.

## 6. Known open items (do not start these without the owner)

- **Gemini's Sheets read limit is unmeasured.** The probe in `docs/HARNESS-REPAIR-PLAN.md` §6 (files `site/harness/fixtures/probe-*.txt`) would settle it. Sections mode made it much less urgent; whole-draft mode still sends up to 49,000 characters in one cell.
- **Not built from the plan's "later" list:** a repair-stall alert (queue row with no Outbox row by 11:00 / 21:00), a code-owned `Repair Log` tab for the churn numbers (they are in each row's Blocked Reason for now), and feeding the gate checklist into the Writer's skill so fewer drafts fail in the first place.
- **The restored article section is in the site file only**, not in its Notion page. Harmless (publish never re-imports a live article), but the Notion copy is out of date.
- Rewrite of the public post `site/src/content/blog/how-this-blog-builds-itself.md` for non-technical readers, based on `docs/HOW-IT-WORKS.md`: still wanted, only when the owner says go. Its description must drop to 160 characters (it is 161), and it has no `notionId:`.
- `G-SOURCES` (fewer than 3 sources) is a warning only. The plan is to make it blocking after a week on the new prompts.
- Older (pre-Gemini) Notion rows without a Sheet Key are outside the repair loop on purpose.
- Gmail stays connected in Gemini for the owner's other tasks. Every wAIbi prompt forbids using it. Keep that line in any prompt you edit.
- `docs/HOW-IT-WORKS.md` predates section patches; it still describes whole-draft repairs.
