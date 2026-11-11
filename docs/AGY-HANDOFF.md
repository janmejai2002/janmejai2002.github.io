# Handoff to agy — 2026-11-11 (from Claude)

Read this whole file before doing anything. It replaces every older handoff. Work in **`C:\Users\Janmejai\janmejai2002.github.io`** on branch **`harness-upgrade`**. Before starting, run `git pull origin main` so you have the robots' latest commits. Ignore the folder `janmejai2002.github.io-redesign`: it is empty and dead.

## 0. Ground rules (do not break these)

1. **Pushing to `main` deploys the live website.** Only push when the owner asks, and only after `npm --prefix site run build` passes. The robots also commit to `main` (news syncs, published articles), so always `git pull origin main` before you push.
2. **Never set `Draft Status = Approved`** in Notion. Never commit to the branch `notion/approved-articles`.
3. **Every rule lives in one file: `site/harness/registry.mjs`.** Caps (70/160/120), tracks, Sheet tabs, failure codes and the repair limit are all there. If you change it, run `node site/harness/generate.mjs` and commit the files it changes. Never copy a rule into another file.
4. **Never weaken a check** in `site/harness/rules.mjs` or `site/scripts/check-build.mjs` to make an article pass. Fix the article text. If a check is truly wrong (a false alarm), fix the check narrowly and explain why in the commit.
5. **Read a file before editing it.** Make small changes. Build after each change.
6. If you are unsure, **stop and ask the owner** rather than guessing.

## 1. How the system works (5 minutes)

Read `docs/HOW-IT-WORKS.md` (plain English). Short version:

```
Gemini tasks (Google cloud) ──append rows──> Google Sheet
Conductor (Apps Script inside the Sheet, every 15 min) ──> mirrors Notion into the Sheet's grey tabs,
                                                           wakes GitHub when new rows appear
GitHub Actions ──> sync-drafts (Sheet → Notion) ──> publish-article (checks) ──> build ──> live site
A draft that fails a check → Notion "Needs Revision" + Failure Codes → Sheet "Repair Queue"
  → Gemini Repairer task fixes it → "Repair Outbox" → back through the checks
After 4 failed repairs → GitHub issue labelled needs-human (that's your queue)
```

Key places:

| What | Where |
|---|---|
| All rules | `site/harness/registry.mjs` |
| Article checks (before build) | `site/harness/rules.mjs` |
| Checks on the built HTML | `site/scripts/check-build.mjs` |
| Sheet → Notion import + repairs | `site/scripts/sync-drafts.mjs`, `site/scripts/import-draft.mjs` |
| Notion → site file | `site/scripts/publish-article.mjs` |
| Pull a broken article out of a build | `site/scripts/quarantine-build.mjs` |
| Open a needs-human issue | `site/scripts/open-issues.mjs` |
| Conductor (Apps Script) | `gas/Conductor.js` (+ generated `gas/Registry.js`) |
| Gemini prompts and skills | `gemini/TASK-PROMPTS.md`, `gemini/skills/` |
| Owner setup steps | `docs/OWNER-SETUP.md` |

## 2. State right now

- **Done and live:** all the GitHub-side harness code, the Notion fields (Sheet Key, Repair Attempts, Failure Codes), and the Conductor, installed and ticking every 15 minutes. The owner has uploaded the 4 skills and pasted the new prompts.
- **In progress, the end-to-end test:** the owner pressed "Run now" on the Gemini **Repairer**. It should fix the article **"Flaky Agent Evals…"** (Sheet Key `DR-20261111-9f8879`), which failed on `G-ASCII` (text-drawn diagram) and `G-LATEX` (LaTeX maths).
- **Waiting on the Conductor:** a fix that renames the Sheet's first tab **Sheet1 → News** and deletes the empty "News" tab the first install created. It runs on the next tick. Do not rename or delete tabs by hand.
- Today's 5 news stories are live.

## 3. Your first tasks, in order

### Task A: confirm the News tab rename (read-only)
Open the Sheet: https://docs.google.com/spreadsheets/d/1-UcD-C4My_Zp4aH3n-5dB3JQNtDN_MSAK6vTCPt8LY0/edit
- Expected: the first tab is called **News** and holds the news rows. There is no "Sheet1" and no second empty "News".
- If after 30 minutes it is still "Sheet1", ask the owner to open the Apps Script editor (Extensions → Apps Script), run `tick` once, and send you the log. Do not edit tabs by hand.

### Task B: follow the repair test through
1. In the Sheet, tab **Repair Outbox**: there should be one row with Key `DR-20261111-9f8879`, Attempt `1`, a full Draft, and Changed / Not Fixed notes.
2. Within 15 minutes, GitHub runs "Sync news archive" then "Publish from Notion". Check with:
   ```
   gh run list --limit 6
   ```
3. Check the article's state:
   ```
   node site/scripts/doctor.mjs
   ```
   Look at the "Self-healing — Repair Queue" line and the Notion row for Flaky.
4. Three possible outcomes:
   - **It goes live** (`Draft Status = Published`, the URL serves the article): the harness works end to end. Tell the owner.
   - **It fails again:** the row is back at Needs Revision with Repair Attempts = 1 and new Failure Codes. That is the loop working. The Repairer will try again at its next scheduled time (09:00 / 19:00 IST). Do nothing.
   - **Nothing happens** (Outbox row exists but Notion unchanged after 30 min): run `node site/scripts/sync-drafts.mjs` (a dry run that writes nothing) and read what it says about the repair. Report to the owner before running anything with `--commit`.

### Task C: rewrite the public post (only after Task B succeeds, and only when the owner says go)
The owner wants `site/src/content/blog/how-this-blog-builds-itself.md` rewritten so a non-technical reader understands the new system. Base it on `docs/HOW-IT-WORKS.md`.
- Keep its frontmatter fields. Its description must be **160 characters or fewer** (it is 161 now) and the title 70 or fewer.
- It is missing `notionId:`. Leave that as is unless the owner gives you the Notion page id.
- Run `npm --prefix site run build`. It must pass. Only then commit, and push only if the owner says so.

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
npm --prefix site run build                              # the gate: must pass before any commit
node site/scripts/doctor.mjs                             # health check (read-only)
node site/scripts/publish-article.mjs --check <page-id>  # every check on one draft (read-only)
node site/scripts/sync-drafts.mjs                        # Sheet → Notion DRY RUN (read-only)
node site/harness/generate.mjs                           # after editing registry.mjs
cd gas; clasp -u waibi push -f                           # upload Conductor changes (personal Google login)
gh run list --limit 6                                    # recent GitHub Actions runs
```

Machine notes:
- Stop any dev server before `npm run build`.
- `clasp` has two logins. Always use `-u waibi` (janmejai2002@gmail.com); the default login is an XLRI account with no access.
- On Windows, a script may print `Assertion failed: !(handle->flags & UV_HANDLE_CLOSING)` after finishing. That is a Node quirk on exit, not a failure, if the output before it looks right.
- Write commit messages to a file and use `git commit -F <file>` (PowerShell breaks on apostrophes).

## 6. Known open items (do not start these without the owner)

- `G-SOURCES` (fewer than 3 sources) is a warning only. The plan is to make it blocking after a week on the new prompts.
- Build failures that can't be traced to one article: the first is retried; the second marks the row Needs Revision with `G-BUILD` and opens an issue.
- Older (pre-Gemini) Notion rows without a Sheet Key are outside the repair loop on purpose, e.g. "Your AI Isn't Lying…" (Needs Revision since August).
- Gmail stays connected in Gemini for the owner's other tasks. Every wAIbi prompt forbids using it. Keep that line in any prompt you edit.
