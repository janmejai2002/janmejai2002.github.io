---
name: blog-artwork
description: The wAIbi-sabi article artwork design language — the rules, the palette-placeholder table, the SVG mechanics the publish pipeline validates, and the reusable generation prompt. Use whenever making or reviewing an article hero image, an SVG plate, anything under site/assets-src/art/, or running npm run images.
---

# Article artwork

Canonical and binding: `docs/ARTWORK.md`. Read it in full before authoring a
plate. This is the summary plus the mechanics the pipeline enforces.

## The rules

- **Ground and ink.** Two colours carry every piece: `--paper` and `--ink`.
  Nothing on white, nothing on black. The six earths are accents, one or two at
  a time, never all six.
- **One idea, one mark.** If you cannot say in one sentence what the drawing
  means, it is a pattern, not artwork.
- **Geometry, not illustration.** Circles, rules, grids, marks, fields of dots.
  No characters, scenes, icons, isometric 3D, clipart, "AI brain", circuit
  boards, glowing humanoids.
- **Imperfection on purpose.** Exactly one deliberate break in the order — an
  open circle, a mark out of alignment, a gap in an otherwise regular grid —
  placed where it carries the argument.
- **Restraint over density.** Generous negative space. If it needs a legend it
  is a diagram — put it in the body as inline SVG instead.
- **Almost no text.** A two-word label at most. Long strings never.
- **Texture.** A fractal-noise overlay at 3–5% over every piece.

Forbidden: gradients as decoration, drop shadows, 3D/bevels, neon, pastel,
rounded friendly bubbles, emoji, photos of screens or offices.

## Colour — placeholders only, never hex

Sources in `site/assets-src/art/<slug>.svg` use placeholder tokens.
`scripts/make-images.mjs` substitutes the palette twice and emits a light and a
dark WebP. **A single hex value anywhere in a `fill` or `stroke` makes the
pipeline reject the SVG and ship deterministic fallback art.**

| Token | Light | Dark |
|---|---|---|
| `{{paper}}` | `#F6F4EF` | `#15181D` |
| `{{paper2}}` | `#EFEBE3` | `#1B1F26` |
| `{{ink}}` | `#1A2639` | `#E9E5DC` |
| `{{border}}` | `#DCD4C7` | `#2E343D` |
| `{{card}}` | `#EDE9E0` | `#1C2129` |
| `{{mizu}}` | `#00A9B8` | `#4ECDD8` |
| `{{hanko}}` | `#D2543F` | `#E87A64` |
| `{{moss}}` | `#6E8C63` | `#9BBA8E` |
| `{{ochre}}` | `#C2913A` | `#DDB667` |
| `{{plum}}` | `#8A6690` | `#B694BC` |
| `{{indigo}}` | `#4E6E9C` | `#85A5D0` |

Accent by subject, loosely: `--mizu` systems/process, `--hanko` the human and
anything contested, `--plum` measurement/statistics, `--ochre` money/incentives,
`--moss` research, `--indigo` data.

## Mechanics the pipeline validates

- Root: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" width="1600" height="900" role="img">` with `<title>` and `<desc>`.
- First child: full-frame `<rect width="1600" height="900" fill="{{paper}}"/>`.
- Last child: grain — `<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/></filter>` then `<rect width="1600" height="900" filter="url(#grain)" opacity="0.055"/>`.
- Keep the subject in the middle two thirds — the social card is a 1200×630 centre crop.
- `npm run images` writes `site/src/assets/art/<slug>-light.webp` and `-dark.webp`; the script **throws** if a source hardcodes a colour.
- Reference both as `heroImage` / `heroImageDark` with a required `heroAlt`.
  `heroAlt` is a **build error** when `heroImage` is set — keep it that way.
- Alt text describes **what is drawn**, not what it means. No caption that
  explains the drawing.

## Two sources, in order

1. **Routine-authored** — the `artwork-routine` scheduled task draws the plate
   and files it into the Notion page as an `## Artwork SVG` section (an `Alt:`
   line + a code block). `liftArtworkSvg()` extracts and validates it. Artwork
   travels through Notion, never a git commit.
2. **Deterministic fallback** — `site/scripts/lib/fallback-art.mjs`, seeded from
   the slug. On-spec and on-palette but means nothing. Exists so no article
   ever ships bare. A pre-existing hand-drawn source is never overwritten.

## The reusable generation prompt

> Create a 16:9 abstract geometric composition for an article titled "TITLE",
> whose central argument is: ARGUMENT IN ONE SENTENCE.
>
> Visual language: a printed plate, not a marketing graphic. Flat fills only.
> Ground is warm off-white paper (#F6F4EF); ink is deep desaturated navy
> (#1A2639). At most one accent colour, a dusty desaturated ACCENT — never
> saturated or neon. A fine fractal-noise texture at ~4% opacity over the whole
> image.
>
> Composition: geometric only — circles, straight rules, grids, fields of small
> dots, hairline strokes. Generous negative space. Exactly one deliberate
> imperfection — an unclosed circle, one element out of alignment, or one gap in
> an otherwise regular grid — placed so it carries the argument.
>
> FORBIDDEN: gradients, drop shadows, 3D/bevel, gloss, neon or pastel, rounded
> cartoon shapes, clipart icons, human figures, scenes, photographs,
> circuit-board or glowing-brain AI imagery, any text longer than a two-word
> label.
>
> The subject sits in the middle two thirds so a 1200×630 centre crop still
> reads.

## Unsplash

Wired in `.mcp.json` (`@jeff_kit/unsplash-mcp-server`) but **keyless** — it will
not start until `UNSPLASH_ACCESS_KEY` is in the environment. Not for article
heroes (a photo fights the paper ground). Earns its place only when an article
is genuinely *about* a photograph or a physical subject. If used: attribution
via `heroCaption` is required, and the download endpoint must be triggered.
