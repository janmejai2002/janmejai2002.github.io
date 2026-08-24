# DONE — full system documentation with diagrams

Shipped 2026-08-24 as [/blog/how-this-blog-builds-itself/](https://janmejai2002.github.io/blog/how-this-blog-builds-itself/),
linked from /projects/.

## What was actually done

1. **NotebookLM notebook built** — "Wabi Sabi Blog System — Architecture",
   `07433ab7-2691-4ae5-993b-60492e96224b`
   (https://notebooklm.google.com/notebook/07433ab7-2691-4ae5-993b-60492e96224b).
   The Library page was checked first: no duplicate existed.

   Nine sources, all real files rather than recollection:
   - both scheduled-task `SKILL.md` prompts
   - `~/.claude/skills/seo-topic-research/SKILL.md`
   - `~/.claude/CLAUDE.md`
   - `site/src/content.config.ts`, `astro.config.mjs`, `scripts/sync-news.mjs`,
     `scripts/make-images.mjs`
   - a transcription of all three live Notion schemas, taken from the MCP
     `fetch` output on the day

   Grounding was checked with two synthesis queries (the full idea lifecycle,
   and the token-cost model). Both returned correct answers citing across five
   of the nine sources, so retrieval is working, not just echoing the last
   upload.

2. **Four diagrams shipped**, matching the original list: end-to-end flow, the
   Notion control plane, the Claude Code layout, and the token-cost model.

3. **They are hand-drawn SVG, not NotebookLM infographics — deliberately.**
   The infographic tool emits a raster with a baked background, which breaks
   the site's dark mode, and its documented failure mode is garbling short
   labels into pixels nobody can spell-check. The notebook was used for what it
   is good at (grounded synthesis across nine files) and the drawing was done
   against the design tokens. Verified: zero hardcoded colours across all four,
   backgrounds and accents flip with the theme, no page overflow at 320px.

## Still open

- The task prompts are described in the walkthrough but not published verbatim.
  Worth doing — there is nothing sensitive in them and they are the most
  copyable part.
- No companion repo template yet.

## Note

`nlm` auth had expired; it was restored with `nlm-relogin.sh`, which force-restarts
Brave with a CDP port. The `notebooklm-mcp` MCP server reported healthy but its
tools were not exposed to the session, so all notebook work went through the `nlm`
CLI directly. Worth knowing before assuming the MCP is broken.
