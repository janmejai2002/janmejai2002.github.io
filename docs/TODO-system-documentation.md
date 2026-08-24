# TODO — full system documentation with diagrams

Goal: a replicable write-up of the whole Wabi Sabi stack, so someone else can rebuild it.
The short version now lives at /projects/. This is the long version.

## Plan

1. **Build a NotebookLM notebook** from the real configuration, not from memory:
   - `~/.claude/scheduled-tasks/daily-ai-seo-radar/SKILL.md`
   - `~/.claude/scheduled-tasks/ai-article-writer/SKILL.md`
   - `~/.claude/skills/seo-topic-research/SKILL.md`
   - `~/.claude/CLAUDE.md` (skills/agents split + token-discipline rationale)
   - `site/src/content.config.ts`, `astro.config.mjs`, `scripts/sync-news.mjs`
   - Notion schemas for both databases
   Use the `notebooklm-mcp` skill. Check the NotebookLM Library page first for a duplicate.

2. **Generate diagrams** via the NotebookLM infographic tool. Needed:
   - End-to-end flow: discovery → pitch → human rating → promotion → draft → review
   - The Notion control plane: two databases and the relation between them
   - Claude Code layout: scheduled tasks, skills, agents, MCP connections
   - Token-cost model: why the skills directory is trimmed

3. **Bring the diagrams into the site.** Export, then either inline as SVG or render
   with the native mermaid support. They must be theme-aware — no baked-in white
   backgrounds, since the site has a dark mode.

4. **Write the long-form piece** and publish under /blog/, linked from /projects/.

## Open questions

- Publish the actual task prompts verbatim? They are the most useful part for a reader,
  and there is nothing sensitive in them.
- Worth a companion repo template so someone can `git clone` the whole setup?
