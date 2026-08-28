---
description: The pre-done gate for the wAIbi-sabi site — stop the dev server, run the full build with check-build, then confirm the changed live routes serve the actual content (not just a 200).
---

Nothing is "done" until this passes. Run every step; report pass/fail per step
with the evidence. Do not ask the user to check anything manually.

## 1. Build

- Make sure no Astro dev server is running (`npm run build` OOMs against it).
  Stop any preview server you started this session.
- From `C:\Users\Janmejai\PluginsClaude\site`:

  ```
  npm run build
  ```

  This runs `scripts/check-build.mjs` as its last step — it asserts on escaped
  markup (`&lt;svg`), `<text>` node counts, hardcoded colour, missing alt,
  missing `og:image`, exactly one `<h1>` per page, and a `.tldr` plate on every
  article. A green build is the gate; a red one is the answer.

## 2. Rendered output, not source

For any article markdown you touched:

- Grep `site/dist/**/*.html` for `&lt;svg` and for a plausible `<text>` count —
  inline SVG in markdown fails by gutting the element while leaving the container
  intact, so a source diff looks perfect.
- Confirm the hashed asset names exist in `dist/_astro/` for any new artwork
  (`<slug>-light.*.webp` / `-dark.*.webp`) — match the rendered filename shape,
  not the source path.

## 3. Live routes — content, not status

Only if changes have deployed (pushed to `main` and the `deploy` run is green).
For each changed route:

```
curl -s -H 'Cache-Control: no-cache' "https://janmejai2002.github.io/<route>/?cb=$(date +%s)" | grep -o -m1 '<distinctive string from the change>'
```

A 200 with pre-merge HTML looks exactly like a broken page — the CDN serves
stale for a minute or two after a merge. Verify against `dist/` first (it is
definitive about the code), then re-check live with the cache-buster.

## 4. Report

One line per check: `✓`/`✗`, what ran, what it showed. If anything is
unverified — not deployed yet, could not reach a route — say so explicitly
rather than implying it passed.
