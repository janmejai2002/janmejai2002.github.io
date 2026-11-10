# Handoff to Antigravity

Written 2026-11-10. Work in this folder: `janmejai2002.github.io-redesign`, branch
`redesign/home-kintsugi`. `main` and this branch's last commit are the same (`f124a8b`).
The crew work and these docs are **uncommitted on purpose**. Do not discard them.
The other checkout, `janmejai2002.github.io`, is on an older branch. Leave it alone.

## Your role

Execution. The creative decisions are already made in `docs/DESIGN-SYSTEM.md` and
`docs/templates/`. Implement them as written. No new characters, art, copy, colours
or patterns. If a spec does not cover something, list it and move on.

## Rules

1. Do not commit or push unless the owner says so in the conversation. Pushing `main` deploys the site.
2. Never commit to `notion/approved-articles`. Never set `Draft Status = Approved` or `Interest Rating`.
3. Do not edit article markdown for looks, or the pipeline scripts in `site/scripts/` (except adding the check below).
4. `npm --prefix site run build` must pass, and do not weaken `scripts/check-build.mjs`.
5. Read a file before you change it. Make small changes and build after each task.
6. Stop any dev server before `npm run build`.

## Tasks, in order

### 1. Check the crew work that is already in the tree
Run the site. Confirm on the homepage: Oops swings as the plate cracks and runs off, Tsugi walks to the crack and paints, then a greeting appears. Confirm the article credit shows a character and a line, `/crew/` shows all 80 drawings, and the 404 page shows Oops. Check phone width, both themes and reduced motion. Fix layout bugs only.

Known to check: at 390px the hero actors may cover text, because a tap can land anywhere. If they do, keep the actors in the area below the headline on screens under 40rem. Do not remove them.

### 2. Redesign the BSchool News page
Implement `docs/templates/bschool-news-spec.md` exactly.

### 3. Add the design gate
Create `site/scripts/check-design.mjs` and run it from the `build` script after `check-build.mjs`. It fails the build, listing file and line, if `site/src/pages/**` or `site/src/components/**` contains:
- a hex or `rgb(` colour in a style rule. Allow `#000` inside `mask-image`, and allow `%23` inside data URIs.
- a `font-family` other than `var(--font)`, `var(--serif)`, `inherit` or `monospace`.

Fix what it finds using tokens. Report anything with no matching token instead of adding one.

### 4. Fix contrast in light mode
Small accent-coloured text fails on Projects, About, News, Tracker, Status and the theme pages. Change the small text to `--ink` or `--ink-soft`, and carry the accent in a dot or border. Do not change the token values.

### 5. Run the design pass
Follow `docs/prompts/design-pass.md`.

### 6. Write up what is left
Put these in your final report for the owner to decide. Do not act on them:
- Raw LaTeX such as `$q_3$` shows as text in `kv-cache-explained`, `prefix-caching-agent-harness`, `what-is-mcp-model-context-protocol` and `what-is-rag-retrieval-augmented-generation`.
- "How This Blog Builds Itself" may still say nothing auto-publishes, while Talks, Case Studies and Basics do.
- `openai-agent-stack-computer-use` and `why-coding-agents-replace-rag-local-search` had no clickable sources.
- The two Klarna case studies are near-duplicates, if both remain.
- `/crew/` is set to noindex until the owner approves it.

## Definition of done

Build passes, every acceptance item in the spec is checked by rendering rather than by reading code, and the report states exactly what was tested and what was not.
