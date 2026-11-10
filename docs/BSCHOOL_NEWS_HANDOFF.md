# wAIbi-sabi — B-School News Redesign & Interactive Dossier
## Consolidated Architecture, Task Matrix & Seamless Baton-Handoff Protocol

> **Target Workspace**: `C:\Users\Janmejai\janmejai2002.github.io`  
> **Git Branch**: `feature/bschool-news` (isolated from `main` and external worktrees)  
> **Active Dev Port**: `4323` (`npm --prefix site run dev -- --port 4323`)  
> **Status**: Static build verified (`check-build: all assertions passed`), homepage-aligned segmented door panel & calm wabi-sabi landing live.

---

## 1. Consolidated Instruction Matrix & Completed Deliverables

| Area | Original User Request / Problem Identified | Completed Implementation & Architectural Fix | Files Modified / Created |
| :--- | :--- | :--- | :--- |
| **Segmented Track Door Panel (Homepage Parity)** | Match the exact continuous segmented panel from the homepage (`site/src/pages/index.astro`); remove bulky raised card bubbles and excessive 3D effects. | Replaced individual floating rounded card pills with a **single contiguous horizontal segmented strip**:<br>• `border-block: 1px solid var(--border)` with hairline dividers (`inset 1px 0 0 var(--border)`).<br>• Pure, unboxed vector `DomainMark` geometry on the left (`2.5rem`), bold label + count pill on top line, and subtitle on second line.<br>• Subtle background wash (`var(--tint)`) on hover and active bottom accent line (`::after`).<br>• On tablet & mobile (`<= 68rem`), smoothly transitions into a single swipeable row with `overflow-x: auto; scroll-snap-type: x proximity; scrollbar-width: none;` — exactly like the homepage. | `site/src/components/NewsBrowser.astro`, `site/src/components/DomainMark.astro` |
| **Removal of Excessive 3D Effects** | "please dont have execssive 3d effects in the landing" — eliminate bloated layered elements, bulky 3D seals, card tilt/bounce, and sticky viewport blockers. | • Removed all 3D raised seal boxes (`.door__seal`), inset shadows, and translateY card hover jumps (`transform: translateY(-3px)`).<br>• Removed `.card__edge-peek` (the artificial 3D fold flap on top-right).<br>• Softened card shadows to calm, natural wabi-sabi tones (`box-shadow: 0 4px 16px var(--shadow)`).<br>• Made mobile toolbar `position: static` so it doesn't consume 160px of vertical space and obscure card headings during scroll. | `site/src/components/NewsBrowser.astro` |
| **Pixel-Glitch Shatter Transition** | Replace 3D card flip with custom-designed pixel glitch animation where clicking shatters the card into parts and glitches into the backside hot seat. | Built a 16-shard kintsugi shatter matrix (`.card__shatter-matrix`, `.shatter-pixel`):<br>• On click or Enter, triggers `@keyframes pixel-shatter-burst` (380ms) with staggered delays, gold crack borders (`var(--ochre)`), and chromatic aberration (`var(--hanko)` / `var(--mizu)`).<br>• Simultaneously runs `@keyframes face-glitch-jitter` on card faces, dissolving cleanly between Front Briefing and Back Interview Chair.<br>• Toolbar button: **"Shatter all: Hot Seat mode"** triggers a staggered cascade across visible cards. | `site/src/components/NewsBrowser.astro` |
| **Mobile Hero Plate Alignment** | Ensure Kiki crew pottery companion and dialogue bubble are completely visible and never clipped on narrow mobile viewports. | Added `@media (max-width: 48rem)` layout to `.pg-plate__in` (`flex-direction: column; align-items: flex-start; gap: 1.5rem`), allowing both the headline and Kiki with speech bubble to fit naturally within viewport bounds without clipping. | `site/src/pages/news/index.astro` |
| **Zero Emojis & Kinetic SVGs** | Replace all emojis and generic icons with hand-crafted, animated geometric SVGs following `TrackMark.astro`. | Authored `DomainMark.astro` with broken symmetry for each functional domain that heals/levels/closes on hover or active selection:<br>• **Consulting**: 2×2 Strategy matrix with breakout vector in `--hanko` (seal red).<br>• **Finance**: Valuation balance scale that levels out of disequilibrium in `--ochre` (gold).<br>• **Marketing**: Perception diffusion wave arcs in `--mizu` (water blue).<br>• **Operations**: Supply chain network with link that connects in `--moss` (moss green).<br>• **Product Management**: Sprint iteration loop with toggle switch in `--plum` (plum).<br>• **All Tracks**: Concentric Enso rings with golden kintsugi fracture.<br>• Replaced all unicode characters (like `✓`) with clean inline SVGs. | `site/src/components/DomainMark.astro`, `site/src/components/NewsBrowser.astro` |
| **AEO, GEO & SEO Structure** | Enhance search and answer engine discoverability for AI overviews (Perplexity, Google AI Overviews, Gemini, ChatGPT). | Injected Schema.org `CollectionPage` + `FAQPage` with top 15 Q&A pairs (linking headlines to interview cross-examinations) and `NewsArticle` semantic microdata on every card across both index and archive routes. | `site/src/pages/news/index.astro`, `site/src/pages/news/[archive].astro`, `site/src/components/NewsBrowser.astro` |

---

## 2. Visual Verification Artifacts
- **Segmented Panel Matching Homepage**: [`news-segmented-doors-panel.png`](file:///C:/Users/Janmejai/.gemini/antigravity-cli/brain/2201e0df-c7cf-4498-8d4f-7a0f827de97b/news-segmented-doors-panel.png)
- **Desktop Landing View**: [`news-segmented-doors-desktop.png`](file:///C:/Users/Janmejai/.gemini/antigravity-cli/brain/2201e0df-c7cf-4498-8d4f-7a0f827de97b/news-segmented-doors-desktop.png)
- **Interactive Hover & Filter State**: [`news-segmented-doors-hover.png`](file:///C:/Users/Janmejai/.gemini/antigravity-cli/brain/2201e0df-c7cf-4498-8d4f-7a0f827de97b/news-segmented-doors-hover.png) and [`news-segmented-doors-filtered.png`](file:///C:/Users/Janmejai/.gemini/antigravity-cli/brain/2201e0df-c7cf-4498-8d4f-7a0f827de97b/news-segmented-doors-filtered.png)
- **Mobile Viewport & Clean Shatter**: [`news-mobile-doors-and-cards.png`](file:///C:/Users/Janmejai/.gemini/antigravity-cli/brain/2201e0df-c7cf-4498-8d4f-7a0f827de97b/news-mobile-doors-and-cards.png) and [`news-mobile-shattered-clean.png`](file:///C:/Users/Janmejai/.gemini/antigravity-cli/brain/2201e0df-c7cf-4498-8d4f-7a0f827de97b/news-mobile-shattered-clean.png)

---

## 3. The Immediate Extension Hand-Off Prompt
*(Copy everything inside the block below and paste directly into the new chat after running `/clear`)*

```markdown
You are resuming the active, high-priority engineering task on **wAIbi-sabi** (https://janmejai2002.github.io).
We are working exclusively in the local repository:
- **Directory**: `C:\Users\Janmejai\janmejai2002.github.io`
- **Git Branch**: `feature/bschool-news` (Do NOT touch `main` or `C:\Users\Janmejai\janmejai2002.github.io-redesign`).
- **Dev Server**: Port `4323` (`npm --prefix site run dev -- --port 4323`).

### What Was Just Completed & Verified:
1. **Homepage-Aligned Segmented Door Panel**:
   - Replaced floating card pills with a single continuous horizontal segmented strip matching the homepage (`border-block: 1px solid var(--border)`, `inset 1px 0 0 var(--border)` dividers, no gaps, no bulky boxes).
   - Pure vector `DomainMark` icons (2.5rem), title + count on top line, blurb below.
   - On screens <= 68rem, transitions into a sleek horizontal swipe strip with scroll-snap.
2. **Removed Excessive 3D Effects**:
   - Removed 3D raised seal discs, inset shadows, and translateY card hover jumps.
   - Removed `.card__edge-peek` artificial tab.
   - Softened card shadows to calm wabi-sabi tones.
   - Made mobile toolbar `position: static` so it doesn't block card headings during scroll.
3. **Pixel-Glitch Shatter Transition**:
   - 16-shard kintsugi shatter matrix with gold crack borders and chromatic aberration dissolving into the interview hot seat.
   - "Shatter all: Hot Seat mode" toolbar button with staggered cascade.
4. **Mobile Hero Plate Alignment**:
   - Fixed mobile layout so Kiki and her speech bubble are fully visible and never clipped.
5. **Build & Integrity Verification**:
   - `npm --prefix site run build` passed with 0 errors across all 69 pages (`check-build: all assertions passed`).
   - Committed and pushed to `origin/feature/bschool-news`.

### Next Steps / Sprints:
- Continue testing user feedback and fine-tuning any edge animations.
- Maintain dev server exclusively on port `4323`.
```
