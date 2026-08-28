---
description: Commit the working tree in logical chunks in the repo's own terse style, push, and note that the push deploys. Runs the verify gate first.
argument-hint: "[optional note about what this batch of work is]"
---

Ship the current work. Pushing `main` deploys, so treat this as an outward
action: show the plan and get a yes before pushing.

## 1. Gate

Run `/blog-verify` (or confirm it has already passed this session). Do not
proceed on a red build.

## 2. Group the diff

`git status` + `git diff --stat`. Split the changes into logical commits — one
concern each, the way the existing history does it (`git log --oneline -15` for
the house style: terse, imperative, describes the effect not the mechanism —
e.g. "Stop the news archive drifting a day behind Notion", "Let the unattended
tracks publish themselves"). Show the proposed commit list and wait for a yes.

## 3. Commit each chunk

- Never stage or commit anything under `docs/EDITS-TO-APPLY.md`, `CONTEXT-INVENTORY.txt`,
  or files a prior session left modified that are unrelated to this work — call
  those out and leave them.
- **If on `notion/approved-articles`, stop.** Improvements go on `main`.
- PowerShell here-strings break on apostrophes. Write each commit message to a
  temp file and `git commit -F <file>`.
- End each message with the trailer:

  ```
  Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
  ```

## 4. Push

`git push`. Then:

- `gh run watch` or `gh run list --limit 3` — confirm the `deploy` run starts
  and goes green.
- If the change is data committed by a bot path, remember the `GITHUB_TOKEN`
  trap: a default-token push does not trigger `deploy.yml`.
- Report the deploy run URL and, once green, that it is live.
