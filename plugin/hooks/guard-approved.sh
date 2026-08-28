#!/bin/sh
# Blocks any Notion write that sets Draft Status = Approved. That field is the
# owner's alone — no routine and no session may set it, on any track. It is the
# publish trigger for the reviewed tracks and the meaning holds for the rest.
#
# PreToolUse (matcher: notion-update-page|notion-update-data-source|notion-create-pages).
# Reads the tool call JSON on stdin. Exit 2 blocks; anything else lets it through.
#
# Deliberately narrow: it only fires when the payload carries BOTH a Draft Status
# reference AND the literal "Approved". Other status changes (Needs Revision,
# Draft Ready) pass untouched.

payload=$(cat 2>/dev/null)

lc=$(printf '%s' "$payload" | tr '[:upper:]' '[:lower:]')

case "$lc" in
  *draft*status*)
    case "$lc" in
      *approved*)
        printf '%s\n' "BLOCKED: this call sets Draft Status = Approved. That flag is the owner's alone — nothing automated may set it. If a draft is ready, leave it at 'Draft Ready' and tell the user it is waiting on their approval." >&2
        exit 2
        ;;
    esac
    ;;
esac

exit 0
