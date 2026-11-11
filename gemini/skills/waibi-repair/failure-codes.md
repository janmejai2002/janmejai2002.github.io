<!-- GENERATED from site/harness/registry.mjs by site/harness/generate.mjs. Do not edit; edit the registry and regenerate. -->

# Failure codes and how to fix each one

A row in the Repair Queue lists one or more codes. Fix every code listed, and nothing else.
After 4 failed repairs a person takes over.

## G-TITLE — Title over 70 characters

Severity: blocks publishing

Rewrite the title to 70 characters or fewer, keeping the main keyword and the specific claim. Count the characters. Put the new title in the Title column of your Repair Outbox row. Change nothing else.

## G-META — Meta description missing or over 160 characters

Severity: blocks publishing

The first lines of the draft must be the callout "> **Meta description:** ..." then "> **Slug:** ...". Write a meta description of 160 characters or fewer stating the thesis and one number. Count the characters.

## G-QUESTION — Reader Question over 120 characters

Severity: blocks publishing

Shorten the "> **Reader Question:**" line in the opening callout to 120 characters or fewer. It must still be a question a practitioner would actually ask.

## G-TLDR — No Executive TL;DR at the top

Severity: blocks publishing

Directly after the opening callout, add an H2 reading exactly "## Executive TL;DR" followed by 4 to 6 bullets carrying the article's actual findings and numbers (taken from the body, nothing new).

## G-BLOCK — Contains formatting the site cannot convert

Severity: blocks publishing

Rewrite the section named in Blocked Reason using only paragraphs, H2/H3 headings, bullet or numbered lists, quotes, normal markdown tables, and code blocks for real code.

## G-ASCII — Diagram drawn with text characters

Severity: blocks publishing

Find every code block that draws boxes, arrows or flows with characters (+---+, |, v, ->, -->, ┌─┐). Replace each one with a numbered list of steps ("1. The request reaches the router. 2. ...") or a markdown table. Keep every fact the diagram carried.

## G-LATEX — Maths written in LaTeX

Severity: blocks publishing

Remove all LaTeX: $...$, $$...$$, \frac, \sqrt, \times, \approx, \cdot, \sum. Write each formula as plain text inside backticks, e.g. `cost = tokens × price`. Single variables in prose become plain words or backticked names (`k`).

## G-TABLE — Markdown table broken into paragraphs

Severity: blocks publishing

Tables must be continuous: header row, |---| row, data rows, no blank lines between rows, never inside a code block.

## G-HTML — Raw HTML broke and leaked into the page as text

Severity: blocks publishing

Remove any raw HTML (<div>, <figure>, <svg>) from the article body. Only the Artwork SVG section may contain SVG, and it must have no blank lines.

## G-HEADING — Body starts with a "# Title" heading

Severity: blocks publishing

Delete any "# " (H1) heading in the body. Body headings start at "## ".

## G-IMAGE — Image without alt text in the body

Severity: blocks publishing

Remove every markdown image (![...](...)) and <img> from the article body. The only picture an article has is its Artwork SVG.

## G-ART — Artwork SVG unusable, fallback art used

Severity: warning only (fix it anyway while you are there)

In "## Artwork SVG": an "Alt:" line, then one ```xml code block with a 1600x900 <svg> using only {{tokens}}, starting with <rect width="1600" height="900" fill="{{paper}}"/>. No hex colours, no blank lines.

## G-SOURCES — Fewer than 3 source links

Severity: warning only (fix it anyway while you are there)

Add a "## Sources" section before "## Artwork brief" with at least 3 bullets "[Page title](https://url) — what it supports", each a page that actually contains the claim. For Talks the first is the video URL. Remove any claim you cannot source.

## G-LENGTH — Article over the word budget

Severity: warning only (fix it anyway while you are there)

Cut to 1,400–1,800 words by removing the weakest section, not by compressing every paragraph.

## G-STYLE — Banned words or em dashes

Severity: warning only (fix it anyway while you are there)

Replace each banned word with a concrete verb and each em dash (—) with a period, comma, colon or parentheses.

## G-BUILD — Site build failed for a reason not tied to one article

Severity: blocks publishing · NOT repairable by you: skip this row

Not repairable by the Repairer. The owner (or Claude) must read the GitHub Actions log.
