#!/bin/sh
# Blocks `git commit` / `git push` while HEAD is on notion/approved-articles.
# The publish poll regenerates that branch from main twice an hour and destroys
# anything committed to it. Improvements belong on main after merge.
#
# PreToolUse (matcher: Bash). Reads the tool call JSON on stdin. Exit 2 blocks
# and shows stderr to the model; anything else lets the call through.

payload=$(cat 2>/dev/null)

# Only care about git write commands.
printf '%s' "$payload" | grep -Eq 'git[[:space:]]+(commit|push)' || exit 0

# Which repo? Prefer the tool call's cwd, then CLAUDE_PROJECT_DIR, then $PWD.
cwd=$(printf '%s' "$payload" | sed -n 's/.*"cwd"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -n1)
[ -n "$cwd" ] || cwd="${CLAUDE_PROJECT_DIR:-$PWD}"

branch=$(git -C "$cwd" rev-parse --abbrev-ref HEAD 2>/dev/null)

if [ "$branch" = "notion/approved-articles" ]; then
  printf '%s\n' "BLOCKED: HEAD is on notion/approved-articles. The publish-from-notion poll resets this branch from main every 30 minutes and will destroy this commit. Switch to main (or a feature branch off main) and put the change there after the PR merges." >&2
  exit 2
fi

exit 0
