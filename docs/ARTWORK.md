# Article artwork — the design language

Every article gets one piece of artwork. It is not decoration and it is not a
stock photo of a laptop. It is the article's central idea, drawn as a shape.

This file is the spec. It is also the prompt: paste the block at the bottom into
any image tool, or hand it to a search for stock imagery, so the result belongs
to this site instead of to whatever the generator felt like that day.

---

## 1. The rules

**Ground and ink.** Two colours carry every piece: the paper and the ink. Nothing
sits on white. Nothing sits on black. `--paper` and `--ink` are the frame; the six
earths are accents used one or two at a time, never all six.

**One idea, one mark.** If you cannot say in one sentence what the drawing means,
it is a pattern, not artwork. The reader should be able to look at the image after
finishing the piece and see the argument in it.

**Geometry, not illustration.** Circles, rules, grids, marks, fields of dots.
No characters, no scenes, no icons of people at desks, no isometric 3D, no
clipart. The site's aesthetic is a printed plate, not a marketing page.

**Imperfection on purpose.** Wabi-sabi is the whole premise of this blog. Every
piece should contain exactly one deliberate break in the order: an open circle,
a mark out of alignment, a missing element in an otherwise complete grid. That
break is usually where the meaning lives.

**Restraint over density.** Generous negative space. If the composition needs a
legend to be understood, it is a diagram — put it in the body as an inline SVG
instead, where it can be read properly.

**No text, or almost none.** Headings and numbers belong in the article. A short
label is allowed when it is genuinely part of the image. Long strings never are.

**Texture.** A fractal-noise overlay at 3–5% sits over every piece, matching the
`body` background. It is what stops a flat vector from looking like a slide.

### Forbidden

Gradients used as decoration, drop shadows, glossy or 3D bevels, neon, pastel,
rounded friendly bubbles, emoji, photographs of screens or offices, "AI brain"
imagery, circuit-board motifs, glowing blue humanoids.

### Required

Flat fills. Sharp or lightly-rounded corners. Hairline rules. Inter, or the
system sans it falls back to. One accent colour, two at most.

---

## 2. Colour

Sources live in `site/assets-src/art/*.svg` and use **placeholder tokens**, not
hex. `scripts/make-images.mjs` substitutes the real palette twice and emits a
light and a dark PNG per piece.

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

**Never write a hex value into an artwork source.** A baked light background is
exactly the bug that made the first attempt at this look broken in dark mode.

Accent by subject, loosely: `--mizu` for systems and process, `--hanko` for the
human and for anything contested, `--plum` for measurement and statistics,
`--ochre` for money and incentives, `--moss` for research, `--indigo` for data.

---

## 3. Mechanics

- Canvas **1600×900** (16:9). It crops to 1200×630 for the social card without
  losing the subject, so keep the meaning in the middle two thirds.
- Author in `site/assets-src/art/<slug>.svg`.
- Run `npm run images`. It writes `site/src/assets/art/<slug>-light.png` and
  `-dark.png`.
- Reference both in the article's frontmatter as `heroImage` and `heroImageDark`,
  with a required `heroAlt`.
- Alt text describes **what is drawn**, not what it means. The meaning is the
  article's job.
- **No caption on artwork.** `heroCaption` exists for a real caption — a source
  line, a photographer credit — never to explain the drawing. A caption that
  says what the shape stands for is explaining the joke; if the piece needs
  that, the piece is wrong.

---

## 4. The reusable instruction block

> Create a 16:9 abstract geometric composition for an article titled "TITLE",
> whose central argument is: ARGUMENT IN ONE SENTENCE.
>
> Visual language: a printed plate, not a marketing graphic. Flat fills only.
> The ground is a warm off-white paper tone (#F6F4EF) and the ink is a deep
> desaturated navy (#1A2639). Use at most one accent colour, a dusty and
> desaturated ACCENT — never a saturated or neon version of it. A fine
> fractal-noise texture at about 4% opacity sits over the whole image.
>
> Composition: geometric only — circles, straight rules, grids, fields of small
> dots, hairline strokes. Generous negative space. Include exactly one deliberate
> imperfection: an unclosed circle, one element out of alignment, or one gap in
> an otherwise regular grid, placed so it carries the article's argument.
>
> FORBIDDEN: gradients, drop shadows, 3D or bevelled effects, glossy surfaces,
> neon or pastel colours, rounded cartoon shapes, clipart icons, human figures,
> scenes, photographs, circuit-board or glowing-brain AI imagery, and any text
> longer than a two-word label.
>
> The subject must sit in the middle two thirds of the frame so a 1200×630 centre
> crop still reads.

For stock photography, the same constraints translate to: muted natural light,
warm neutral or paper tones, a single subject, strong negative space, texture
over gloss, no people at computers, no blue-tinted technology imagery. If nothing
matches, draw it instead — the generated route is the default here, not the
fallback.

---

## 5. Unsplash

Wired up at `.mcp.json` in the repo root, using `@jeff_kit/unsplash-mcp-server`.
It reads `UNSPLASH_ACCESS_KEY` from the environment and **there is no key set
yet** — the server will fail to start until there is one:

1. Register an application at https://unsplash.com/oauth/applications (Demo tier
   is free, 50 requests/hour).
2. Put the Access Key in the environment as `UNSPLASH_ACCESS_KEY`. Do not paste
   it into `.mcp.json` — that file is committed.
3. Restart Claude Code; the `unsplash` server appears in `claude mcp list`.

### Where it should and should not be used

Not for article heroes. A photograph on the paper ground fights everything in
§1 — the generated route stays the default for hero artwork.

It earns its place for: a piece that is genuinely *about* a photograph or a
physical subject, texture plates, and any future page where a real image beats
a drawn one. Reach for it when the article names something you can point a
camera at.

### Two obligations that come with it

- **Attribution is required**, not optional: the photographer's name and a link
  back to their Unsplash profile, both with the `?utm_source` parameters the API
  returns. Use `heroCaption` for it.
- **The download endpoint must be triggered** when an image is actually used.
  Unsplash counts this, and skipping it breaks their API terms. Self-hosting the
  file locally (which this site does for every other image) is permitted only
  alongside that call — so any Unsplash image needs the trigger wired in, not
  just a `curl` of the raw file.
