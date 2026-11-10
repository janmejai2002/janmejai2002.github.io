# Continuation Prompt: B-School News Hero Plate Redesign

> **How to use**: Run `/clear` in your chat, copy the entire prompt block below, and paste it into the new conversation to immediately continue.

```markdown
You are continuing engineering on **wAIbi-sabi** (https://janmejai2002.github.io).
- **Workspace**: `C:\Users\Janmejai\janmejai2002.github.io`
- **Active Branch**: `feature/bschool-news` (do NOT touch `main` or `janmejai2002.github.io-redesign`)
- **Dev Server**: Running on port `4323` (`http://localhost:4323/news/`)
- **Primary Target File**: `site/src/pages/news/index.astro` (Hero section `.pg-plate`, lines 90–245)

---

### What Was Just Completed & Committed
1. **Domain Track Doors**: Converted to a continuous, unified segmented door strip matching the homepage style 1:1 (`site/src/components/NewsBrowser.astro`).
2. **Tile Mosaic Grid**: Converted the news list into a seamless stoneware ceramic floor with 1px mortar seams, kintsugi gold streaks (`.tile-streak`), and cursor specular glaze reflections (`.card__glaze-shader`).
3. **Debloated Actions**: Removed bulky corporate badges and AI-slop 3.5px colored left borders. Simplified actions to clean "Hot Seat →", "Story", "Copy", and "Practised".
4. **Git State**: Clean working tree, all previous work committed up to `b1109fe` and pushed to `origin/feature/bschool-news`.

---

### Your Objective: Redesign & Polish the News Hero Plate
Redesign the upper Hero Plate (`.pg-plate`) of `http://localhost:4323/news/` (as seen in the provided screenshot). Eliminate cavernous empty space, elevate editorial typography, refine the Kiki pottery mascot lockup, and embody authentic wAIbi-sabi craftsmanship.

#### 1. Eliminate Cavernous Empty Space & Bridge Left/Right Void
- In the current desktop layout (1440px), there is an awkward, empty black expanse between the left text block and Kiki on the right.
- Bridge this gap gracefully:
  - Add a **"Today's Interview Hotlist"** or quick topic anchor strip (e.g., 3–5 compact pill cues representing today's stories like "Cash-to-GDP", "Zomato Q2", "Rupee Hedging") that candidates can glance at or click to jump straight to that story tile.
  - Or re-compose the layout into a tighter, cohesive editorial masthead where Kiki, the speech balloon, and the stats feel organically clustered rather than banished to opposite ends of the screen.

#### 2. Elevate Masthead Typography & Dateline
- **Headline (`<h1>`)**: "What will they ask you about today?"
  - Use wAIbi-sabi's signature editorial typography: high-contrast serif/sans balance (e.g., `font-family: var(--font-serif, Newsreader, Georgia, serif);` or styled sans with refined letter-spacing).
  - Add an animated ink caret or subtle warm ochre accent mark.
- **Subtitle (`.pg-plate__desc`)**:
  - Refine line length, line height, and muted ink tone (`var(--tldr-dim)` / `color-mix(in srgb, var(--tldr-ink) 78%, transparent)`).
- **Tactile Masthead Dateline Seal (`.pg-plate__stat`)**:
  - Replace the bare single text string ("• 5 stories today · 618 in the archive") with a tactile **Hanko / Ceramic Seal**:
    - Current briefing date: e.g. "Tuesday, 10 Nov 2026"
    - Story count badge: e.g. "5 fresh drills" with a glowing amber/ochre dot
    - Archive depth counter: "618 interview angles catalogued"

#### 3. Refine Kiki Pottery Mascot & Washi Speech Bubble
- **Speech Bubble (`.crew-say`)**:
  - Replace the generic rounded box with an authentic washi paper / slip ceramic speech balloon:
    - Subtle textured or deckle edge, authentic speech tail/pointer aiming towards Kiki.
    - Serif italic micro-copy: *"I read the business pages so you can pretend you did."*
- **Kiki Interaction (`<Crew who="kiki" />`)**:
  - Add interactive reactivity on hover/click:
    - Kiki shifts expression (`mood="listen"` -> `mood="curious"` or `mood="wabi-sabi"`).
    - Or clicking the speech bubble cycles through 3 short, witty B-school interview pro-tips.

#### 4. Atmospheric Background & Kintsugi Fracture Seam
- **Atmospheric Plate (`.pg-plate`)**:
  - Deepen the atmospheric gradient: warm charcoal/slate (`var(--tldr-bg)`) infused with soft radial ochre (`--ochre`) and deep plum (`--plum`) slip accents.
- **Kintsugi Seam (`.pg-edge` polyline)**:
  - Ensure the fracture line has a golden luminescence (`stroke: var(--ochre)` with subtle glow/hairline) that crisply separates the hero plate from the paper mosaic below without awkward gap glitches.

#### 5. Mobile & Tablet Ergonomics
- Test and verify at:
  - Mobile: `390px` width (stacked layout, readable headline, Kiki positioned elegantly below or alongside dateline).
  - Tablet: `768px` width.
  - Desktop: `1440px` width (balanced, no dead voids).

---

### Constraints & Rules
- **Design Tokens Only**: Use `var(--tldr-bg)`, `var(--tldr-ink)`, `var(--tldr-dim)`, `var(--ochre)`, `var(--paper)`, `var(--border-soft)`, etc. NO hardcoded hex codes.
- **Zero AI-Slop**: Avoid generic floating cards, neon borders, or gratuitous 3D transforms.
- **Semantic HTML**: Exactly one `<h1>` per page.
- **Port**: Keep dev server on port `4323`.
- **Open in Zed**: Per Rule 11, open any newly created files in Zed (`zed "<path>"`).

---

### Verification
1. Run Playwright script to capture screenshots:
   - Desktop hero: 1440x900
   - Mobile hero: 390x844
2. Run build verification:
   ```powershell
   npm --prefix site run build
   ```
3. Commit with an atomic, conventional commit message on `feature/bschool-news`.
```
