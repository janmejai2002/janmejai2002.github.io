---
name: waibi-house-style
description: The wAIbi-sabi editorial contract for any article, case study, talk note or repair. Use whenever writing or fixing a draft for janmejai2002.github.io — structure, caps, formatting the site accepts, fact discipline and voice. The exact numbers are in rules.md.
---

# wAIbi-sabi house style

wAIbi-sabi is an applied-AI journal. **Every piece answers one question a working professional actually asked about AI.** That question is the Reader Question. The piece is not done until a reader would say it was answered, not circled.

Nothing a task writes is read by a person before it goes live. The publishing system checks the rules below by code and rejects drafts that break them. `rules.md` has the exact caps, tracks, accents and banned words; it always wins over anything remembered.

## 1. The draft skeleton (all article tracks)

```
> **Meta description:** <≤160 characters: the thesis plus one number>
> **Slug:** <url-safe-kebab-slug, ≤60 characters>
> **Reader Question:** <≤120 characters, in the reader's own words>

## Executive TL;DR
- 4 to 6 bullets carrying the actual findings and numbers, each sourced.

## <body sections, H2 and H3 only>

## Sources
- [Exact page title](https://full-url) — what it supports

## Artwork brief
- Argument in one sentence: …
- Geometry: …
- Accent: <the track's accent from rules.md>
- Deliberate imperfection: …

## Artwork SVG
Alt: <one sentence describing the shapes>
```xml
<svg …>…</svg>
```
```

- The three callout lines are the first thing in the draft. Nothing above them.
- Never a `# Title` (H1) in the body. The site prints the title.
- The TL;DR heading is exactly `## Executive TL;DR`.
- Artwork rules: use the `waibi-artwork` skill.

## 2. Formatting the site accepts

1. **No diagrams drawn with characters.** No boxes, arrows or flowcharts in code blocks (`+---+`, `|`, `v`, `->`, `-->`, `┌─┐`). Show a flow as a numbered list of steps, or a markdown table.
2. **No LaTeX.** No `$…$`, `$$…$$`, `\frac`, `\times`, `\approx`. Write formulas as plain text in backticks: `cost = tokens × price`. Variables in prose are backticked names: `k`.
3. **Tables** are normal markdown tables: header row, `|---|` row, data rows, no blank lines between rows, never inside a code block.
4. **Code blocks** only for real code, commands or config.
5. **No raw HTML** in the body (`<div>`, `<figure>`, inline `<svg>`). The only SVG is in `## Artwork SVG`.
6. **Length:** 1,400 to 1,800 words of body text. Over 2,000 is a failure, not extra value. Cut the weakest section rather than compressing every paragraph.

## 3. Fact discipline (the claim ledger)

Before you write, keep a private ledger: `claim as you will write it | URL | the sentence on that page, verbatim`.

- A claim enters the draft only if it has a ledger row whose third column is text you actually saw on that page. **If you cannot paste the sentence, you do not have the source. Cut the claim.**
- Prefer primary sources: the model card, pricing page, filing, paper, engineering blog, the talk itself. Trade press that names its source is second. SEO listicles and "N statistics" pages are never the source for a number you argue from.
- Link each number inline to the exact page it came from. Never attach the nearest topical link to a number you got elsewhere.
- Keep the source's qualifiers. "In one study" stays "in one study". Do not add names, companies or products the source does not list.
- A page's publication date is not the date of the event. Recompute every derived number (differences, multiples, day counts).
- Report the number that hurts your argument too.
- After writing, re-read the finished draft against the ledger, TL;DR and alt text included. Fix or cut anything that drifted.

## 4. Voice

- Concrete over general: exact versions, prices per million tokens, latency in ms, error codes, named systems.
- No negative parallelism ("It's not about X. It's about Y", "Less X, more Y").
- No dead openings, no hollow conclusion that restates the intro, no tricolon padding.
- No em dashes. Use periods, commas, colons or parentheses.
- None of the banned words in `rules.md`.
- India-market context where it genuinely applies, never bolted on.

## 5. Tracks and their readers

- **Technical:** engineers building with AI. Mechanisms, failure modes, benchmarks read properly, real trade-offs.
- **Business:** consultants, analysts, founders, buyers; commercially literate, not engineers. Economics, contracts, adoption reality. No code.
- **Basics:** smart professionals learning AI. First principles, physical analogies, worked numbers, every term explained.
- **Case Studies:** a named company's real AI deployment: the mechanism, the published numbers, how far the evidence carries, what others can reuse.
- **Talks:** one talk or podcast: what was claimed, verbatim and timestamped, and what holds up.

## 6. Before you file: count, do not estimate

Count the characters of the title, the meta description and the Reader Question. Check the TL;DR heading, the Sources section, and that no code block draws a diagram and no `$` wraps a formula. Fix and count again.
