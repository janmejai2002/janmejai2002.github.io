# Share cards and link previews

What a link to this site turns into when it is pasted into LinkedIn, X,
WhatsApp, Slack, iMessage, Discord or Teams.

## Where things live

| What | File |
|---|---|
| The drawing (layout, fonts, plate, fracture, art) | `site/src/lib/share-card.ts` |
| Article cards, one per post | `site/src/pages/og/[slug].png.ts` → `/og/<slug>.png` |
| Page cards: copy and list | `site/src/data/share.ts` → `/og/page/<key>.png` |
| Track share headlines | `share:` in `site/src/data/tracks.ts` |
| Meta tags | `site/src/components/SEO.astro` |
| Palette (shared with hero art) | `site/scripts/lib/palette.mjs` |
| Guard | `check-build.mjs` §4b: every og:image was emitted and is under 300 KB |

## The article card

A dark plate (a feed is mostly white, so dark stops the thumb), the article's
own drawing repainted onto the plate, and the gold fracture above a paper strip
that carries the wordmark. Reading order:

1. Track and reading time, in the track's accent.
2. The reader's **question** (`question` frontmatter) in Newsreader italic. This
   is the hook: it says the reader's own worry back to them.
3. The **title** in Inter 800. Its first figure ("20-Year-Old", "$900m", "3x",
   "40%") is lit in the accent. Bare years are skipped.

4. A crew member stands on the gold edge: the same `pickCrew()` casting the
   article page uses, so the face on the card is the one the reader meets.

The art gets a soft glow in the track's accent. X and LinkedIn often show only
the image and the domain, so the card has to work without the text below it. A
hand-made `ogImage` in frontmatter still wins.

## Page visuals (`visual` in `share.ts`)

| Kind | Used by | What it shows |
|---|---|---|
| `bowl` | home, about, default | The archive bowl from the homepage: one shard per piece, track colours, gold seams, unwritten shards dashed |
| `bowl` + `lit` | tracks, topics | The same bowl with only that track's or topic's shards lit: "29 of the 93" at a glance |
| `fan` | all articles | The three newest artworks, fanned |
| `lines` | news pages | The three latest headlines with their function's accent |
| `claims` | tracker | Live claims from `claims.ts`, each with a gold crack |
| `chart` | calculator | The break-even shape the tool computes |
| `crew` | crew | All five on the edge, in front of the unfinished bowl |

The crew and the bowl are drawn by the site's own code (`lib/crew.ts`,
`lib/bowl.ts`); `lib/share-visuals.ts` only inlines the on-plate colours,
because librsvg cannot resolve CSS variables or `color-mix()`.

**The pipeline's best lever is the `question` field.** A specific question
("Is my agent framework exposed to…?") does more on the card than any styling.

## Page cards

Every non-article page passes `card="<key>"` to `<Base>`. That sets og:image,
and the card's headline becomes og:title, so feeds show "How AI actually works,
and how it breaks." instead of "Technical". The `<title>` for search is
unchanged. Listing cards (home, archive, tracks, topics, news) show their newest
art or headlines, so they refresh on every build. An unknown key fails the build.

To add a page: add an entry to `buildCards()` in `share.ts`, then put
`card="<key>"` on its `<Base>`.

## Meta tags emitted

`og:*` with image type, size and alt (title plus question); `article:author`,
`section` and `tag`; `twitter:card=summary_large_image`; and
`twitter:label1/data1` (reading time) and `label2/data2` (track), which Slack and
Discord print under the unfurl. The share button's native sheet passes the
question as its text.

## Refreshing a cached preview

Platforms cache cards for days. After a change, re-scrape:
- LinkedIn: https://www.linkedin.com/post-inspector/
- Facebook and WhatsApp: https://developers.facebook.com/tools/debug/ ("Scrape again")
- X: no tool; the cache expires in about a week.
