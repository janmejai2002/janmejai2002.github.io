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
