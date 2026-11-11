<!-- GENERATED from site/harness/registry.mjs by site/harness/generate.mjs. Do not edit; edit the registry and regenerate. -->

# wAIbi-sabi hard rules (enforced by the publishing system)

## Character caps

| Field | Maximum |
|---|---|
| Title | 70 characters |
| Meta description | 160 characters |
| Reader Question | 120 characters |
| Body length | 1200–2200 words (aim for 1,400–1,800) |
| Sources | at least 3 distinct links in a "## Sources" section |

## Tracks

| Track (exact value) | Artwork accent token | Sheet tab |
|---|---|---|
| Technical | {{mizu}} | Drafts |
| Business | {{ochre}} | Drafts |
| Basics | {{plum}} | Drafts |
| Case Studies | {{moss}} | Case Studies |
| Talks | {{hanko}} | Talks |

## Banned words

delve, realm, tapestry, robust, seamless, seamlessly, pivotal, game-changer, transformative, unlock, leverage, foster, holistic, testament, intricate, uncharted, landscape

Banned openings: "In today's…", "It is important to remember…", "Let's dive in…", "In the ever-evolving…"

No em dashes (—) anywhere.

## What gets a draft rejected automatically

- **G-TITLE** — Title over 70 characters. Rewrite the title to 70 characters or fewer, keeping the main keyword and the specific claim. Count the characters. Put the new title in the Title column of your Repair Outbox row. Change nothing else.
- **G-META** — Meta description missing or over 160 characters. The first lines of the draft must be the callout "> **Meta description:** ..." then "> **Slug:** ...". Write a meta description of 160 characters or fewer stating the thesis and one number. Count the characters.
- **G-QUESTION** — Reader Question over 120 characters. Shorten the "> **Reader Question:**" line in the opening callout to 120 characters or fewer. It must still be a question a practitioner would actually ask.
- **G-TLDR** — No Executive TL;DR at the top. Directly after the opening callout, add an H2 reading exactly "## Executive TL;DR" followed by 4 to 6 bullets carrying the article's actual findings and numbers (taken from the body, nothing new).
- **G-BLOCK** — Contains formatting the site cannot convert. Rewrite the section named in Blocked Reason using only paragraphs, H2/H3 headings, bullet or numbered lists, quotes, normal markdown tables, and code blocks for real code.
- **G-ASCII** — Diagram drawn with text characters. Find every code block that draws boxes, arrows or flows with characters (+---+, |, v, ->, -->, ┌─┐). Replace each one with a numbered list of steps ("1. The request reaches the router. 2. ...") or a markdown table. Keep every fact the diagram carried.
- **G-LATEX** — Maths written in LaTeX. Remove all LaTeX: $...$, $$...$$, \frac, \sqrt, \times, \approx, \cdot, \sum. Write each formula as plain text inside backticks, e.g. `cost = tokens × price`. Single variables in prose become plain words or backticked names (`k`).
- **G-TABLE** — Markdown table broken into paragraphs. Tables must be continuous: header row, |---| row, data rows, no blank lines between rows, never inside a code block.
- **G-HTML** — Raw HTML broke and leaked into the page as text. Remove any raw HTML (<div>, <figure>, <svg>) from the article body. Only the Artwork SVG section may contain SVG, and it must have no blank lines.
- **G-HEADING** — Body starts with a "# Title" heading. Delete any "# " (H1) heading in the body. Body headings start at "## ".
- **G-IMAGE** — Image without alt text in the body. Remove every markdown image (![...](...)) and <img> from the article body. The only picture an article has is its Artwork SVG.
