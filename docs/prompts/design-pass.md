# Master design pass

Paste this any time, after any change, to bring the whole site back into line.

---

Run a design consistency pass over every page of this site. Read `AGENTS.md` and `docs/DESIGN-SYSTEM.md` first. You are enforcing the existing system, not designing: do not invent colours, fonts, patterns, characters, animations or copy. Where a page differs from the system, change the page.

1. List every route in `site/dist` after `npm --prefix site run build`.
2. For each route type, render it at 320, 390, 820, 1366 and 1920 wide, in light, OS dark and toggle dark. Look at the screenshots.
3. Check each one against the system: tokens only, Inter and Newsreader in their assigned roles, sentence-case labels, plate and gold edge on full-bleed pages, shared patterns reused rather than re-created, 44px touch targets, 13px minimum text, no horizontal scroll at 320, 4.5:1 contrast (3:1 for large text), a working reduced-motion state.
4. Fix differences at the shared level first: a token, a shared class, a component. Only then per page.
5. Anything the system does not cover goes in a written list for the owner. Do not resolve it yourself.
6. Finish with `npm --prefix site run build` and a table: route, widths and themes checked, what was wrong, what changed, what still needs a decision.

Never edit article markdown for looks, never touch the news pipeline, never commit to `notion/approved-articles`, never set `Draft Status = Approved`. Do not commit or push unless the owner says so in this conversation.
