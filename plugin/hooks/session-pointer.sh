#!/bin/sh
# Prints a one-line pointer at session start, but only when the working
# directory is the wAIbi-sabi blog repo. Always exits 0.

if [ -f "docs/HANDOFF.md" ] && [ -d "site" ] && [ -f "site/astro.config.mjs" ]; then
  printf '%s\n' "waibi-sabi-os active. /blog-start for the full pickup, /blog-status for pipeline state. Rules that never bend: never set Draft Status = Approved; never commit to notion/approved-articles."
fi

exit 0
