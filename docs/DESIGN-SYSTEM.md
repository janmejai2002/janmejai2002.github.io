# wAIbi-sabi design system

The rules every page follows. If something is not covered here, copy the nearest
existing page. Do not invent a new pattern, colour, font, animation or joke.

## The idea

Kintsugi. Things break, and the repair is drawn in gold. A dark plate at the top of
a page, paper for reading, a gold fracture where they meet. The crew are the small
pottery characters who do the breaking and the mending.

## Tokens (`site/src/styles/global.css`)

Never write a hex colour in a page or component. Use these.

| Purpose | Token |
|---|---|
| Page ground, raised ground, card | `--paper`, `--paper-2`, `--card`, `--stone` |
| Text, secondary, tertiary | `--ink`, `--ink-soft`, `--ink-faint` |
| Lines | `--border`, `--border-soft` |
| Accents by theme | `--mizu` Technical, `--ochre` Business, `--plum` Basics, `--moss` Case Studies, `--hanko` Talks, `--indigo` data |
| Accent tints | `--wash-mizu` and so on |
| Dark plate | `--tldr-bg`, `--tldr-ink`, `--tldr-dim`, `--tldr-hair` |
| Solid buttons | `--solid` background, `--on-solid` text |
| Shader gold only | `--gold` |
| Motion | `--ease`, `--dur`, `--dur-fast` |

Light is the default. Dark is a re-skin: solid blocks of pigment and cream slabs are
not allowed on a dark page. Every new surface must be checked in both themes, and
under both the OS setting and the theme toggle.

## Type

- **Inter**: headings, interface, data, tables, captions. Headings are 800 with tight tracking.
- **Newsreader** (`--serif`): questions, prose, and anything spoken by the crew.
- Minimum 13px on screen. No new letter-spaced uppercase labels; use sentence case, weight 600 or 700.
- The site's questions are always serif. Titles are always Inter.

## Layout

- `<Base immersive>` for full-bleed pages. `.wrap` is the 88rem centred container.
- Reading column is 40rem. Article grid is `--cols` in `styles/article.css`.
- Breakpoints in use: 40rem phone, 48rem small tablet, 60rem, 64rem, 68rem, 84rem.
- No horizontal page scroll at 320px. Wide tables and diagrams scroll inside themselves.
- Tap targets at least 44px on touch.

## Reusable patterns

| Pattern | Where to copy it from |
|---|---|
| Dark plate with gold broken edge | `pages/index.astro`: `.plate`, `.plate-edge`, `plateEdge(seed)` from `lib/bowl.ts`. Use a seed unique to the page. |
| Filter doors, a swipe row below 68rem | `pages/index.astro`: `.doors`, `.door` |
| Question list row | `pages/index.astro`: `.q` |
| Quiet text link | `.linkish` |
| Solid button | `.more` |
| Gold marker | a 6px square rotated 45deg in `--ochre` |
| Read and New flags | `.q__flag` |
| Device-only reader memory | `store` in `pages/index.astro`. Keys start `waibi:`. Always try/catch. |

## Motion

Motion confirms something or tells the story of a repair. Nothing loops forever
except a glow on the artwork's accent mark, and that pauses off-screen. Everything
has a `prefers-reduced-motion` state showing the finished result.

## The archive bowl

The archive is a kintsugi bowl built from its articles, not a bowl holding them. Each article is one piece of the wall (`site/src/lib/bowl-wall.ts`): the oldest at the foot, each new one added at the rim, so the rim is always the newest work and is left as raw clay until the next pieces join it. The faint dashed outline above is where the bowl grows next. The joins are the site's gold; a piece the reader has finished gets a heavier seam and a breath of gold leaf.

- Drawn in 3D by `scripts/bowl-3d-gl.ts` (one draw, on demand), handled by `scripts/bowl-3d.ts`. Without WebGL2 the flat bowl (`scripts/bowl-svg.ts`) takes over through the same interface.
- Rest on a piece: it eases out of the wall, its own live drawing (`/bowl-art/<slug>.txt`, from `lib/art.ts`) bursts out of it and reassembles as its card. Click the piece or the card: the drawing rises to the centre, a gold seam crosses the page, the article's crew member arrives, and the article opens (`scripts/bowl-warp.ts`), carried on by a cross-document view transition into the article's plate.
- The minibowl at the foot of every article is the same bowl, turned so that article's piece faces the reader.
- Each piece's art comes from one atlas per theme (`/bowl/atlas-light.webp`, `/bowl/atlas-dark.webp`), built from `site/src/assets/art/`.

## Gold

There is one gold. It is decided once, in `site/src/lib/gold.ts`, and used two ways:

- **Live gold** wherever the gold is the thing being looked at: the hero plate (`scripts/kintsugi.ts`) and the archive bowl's seams (`scripts/bowl-gold.ts`). Both call the same shader, `kinGold`/`kinGoldG`: a bead brighter at its crown than its edges, brushed along the seam so it glints when it lies across the light and dulls when it points at it, with a light that follows the pointer and stays put while things turn. Seam width varies the way a brush leaves it, hairline to pooled. A new live surface uses this function. It never writes its own gold.
- **Flat gold** for small marks that cannot run a shader: the crew's seams, plate edges, the minibowl, icons. These use `var(--gold)` / `var(--ochre)`, which are the base of the live material, so the two agree.

Without WebGL2 the live surfaces fall back to SVG strokes in the same tokens.

## Performance rules

- Nothing on a page may run an SVG filter (`feTurbulence` and friends) as a page-wide background. The paper grain is pre-rendered by `site/scripts/make-paper-noise.mjs` to `public/textures/`; an inline turbulence background made every animated frame stutter site-wide.
- Full-screen layers do not use `mix-blend-mode`.
- Things that turn or slide move a composited layer (`will-change: transform`) and change nothing inside it per frame. Canvases draw on demand, not in a loop of their own.

## The crew (`site/src/lib/crew.ts`, `components/Crew.astro`, `styles/crew.css`)

Tsugi mends, Oops breaks, Kiki listens, Fude writes, Uso doubts.

- Use `<Crew who="…" mood="…" />`. Moods are listed in `MOODS`.
- On a dark surface, add the class `on-plate` to a parent.
- Choose by data, not by hand: `pickCrew()` casts articles from their title and keywords.
- At most one character per screenful, outside the homepage hero.
- Character lines are jokes about the crew and never factual claims about an article.
- Do not redraw characters, add new ones, or write new lines. New character work goes back to the owner.

## Voice

Plain, dry, specific. Sentence case. No exclamation marks, no "unlock", no "dive in".
Do not claim a human reviewed something: Talks, Case Studies and Basics publish unattended.

## How new things fit automatically

- A new article needs only its markdown and `site/assets-src/art/<slug>.svg`. Art, crew, related links, bowl shard and social card all generate.
- A new theme goes in `data/tracks.ts` and gets a rule in `FALLBACK` in `lib/crew.ts`.
- A new page starts from `docs/templates/new-page.astro.txt`.
- `npm run build` must pass, including `scripts/check-design.mjs` once it exists.
