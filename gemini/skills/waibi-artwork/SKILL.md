---
name: waibi-artwork
description: How to draw the hero artwork SVG for a wAIbi-sabi article — the 1600×900 geometric plate in the "## Artwork SVG" section. Use whenever a wAIbi-sabi draft needs its Artwork brief and Artwork SVG. tokens.md has the allowed colour tokens; examples/ has three real plates.
---

# wAIbi-sabi artwork

Each article carries one geometric plate: a quiet, precise diagram of the article's core mechanism, with **one deliberate imperfection** that carries the meaning (wabi-sabi: the crack is the point). The site renders it in light and dark themes from colour tokens, so the SVG never contains a real colour.

## The contract (checked by code; a broken SVG is replaced by generic fallback art)

1. `viewBox="0 0 1600 900" width="1600" height="900" role="img"`, with `<title>` and `<desc>`.
2. First shape: `<rect width="1600" height="900" fill="{{paper}}"/>`.
3. Colours ONLY as tokens from `tokens.md`: `{{paper}}`, `{{ink}}`, `{{border}}` and the track's accent. **No hex (`#fff`), no `rgb()`, no named colours.**
4. Last shape: the grain overlay `<rect width="1600" height="900" filter="url(#grain)" opacity="0.05"/>`, with the grain filter in `<defs>` (see examples).
5. **No blank lines anywhere inside the SVG.**
6. Hairlines and geometry only: lines, circles, arcs, rectangles, ticks, grids. No text labels, no gradients, no images, no emoji.
7. **Draw this article's mechanism.** Do not reuse a previous plate's layout; the system rejects copied geometry. The examples show the style, not shapes to copy.
8. An `Alt:` line directly above the code block: one sentence describing the shapes for a screen reader.

## Writing the brief first

```
## Artwork brief
- Argument in one sentence: the thesis as geometry ("cache hits collapse when the prefix shifts")
- Geometry: what is drawn and where
- Accent: <track accent token name>
- Deliberate imperfection: the one broken/offset element and what it means
```

Then draw exactly that. Accent goes only on the element that carries the argument; ink and border carry everything else.
