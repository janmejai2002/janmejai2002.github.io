# wAIbi-sabi — B-School News Redesign & Interactive Dossier
## Consolidated Architecture, Task Matrix & Seamless Baton-Handoff Protocol

> **Target Workspace**: `C:\Users\Janmejai\janmejai2002.github.io`  
> **Git Branch**: `feature/bschool-news` (isolated from `main` and external worktrees)  
> **Active Dev Port**: `4323` (`npm --prefix site run dev -- --port 4323`)  
> **Status**: Static build verified (`check-build: all assertions passed`), seamless ceramic tile mosaic & debloated wabi-sabi cards live.

---

## 1. Consolidated Instruction Matrix & Completed Deliverables

| Area | Original User Request / Problem Identified | Completed Implementation & Architectural Fix | Files Modified / Created |
| :--- | :--- | :--- | :--- |
| **Removal of AI-Slop Left Border** | The colored 3.5px vertical bar on the left edge of each card looked like generic corporate AI slop. | Completely eliminated `border-left: 3.5px solid var(--accent)`. Replaced with flush ceramic tile edges and wabi-sabi gold kintsugi streaks. Domain accent is now expressed through the domain dot (`.card__dot`), subtle wash tint, and watermark on the backside. | `site/src/components/NewsBrowser.astro` |
| **Seamless Ceramic Tile Mosaic Layout** | Replace floating cards with a continuous tile layout that connects seamlessly from card to card via wabi-sabi streaks and physics glaze shaders. | • **Shared 1px Mortar Grid**: `.briefings-grid` uses `gap: 1px; background: var(--border-soft); border: 1px solid var(--border-soft); border-radius: 12px; overflow: hidden;` so cards sit flush as stoneware mosaic tiles sharing common seam lines.<br>• **Wabi-Sabi Kintsugi Streaks**: Every tile features a delicate gold fracture seam (`.tile-streak` with SVG polyline) along its top edge that illuminates on hover and seamlessly connects across to neighboring tiles.<br>• **Physics Glaze Specular Shader**: Added `.card__glaze-shader` with pointer coordinate tracking (`--mouse-x`, `--mouse-y`) casting an interactive soft specular ceramic glint across the matte tile surface without heavy GPU shaders. | `site/src/components/NewsBrowser.astro` |
| **Card Debloating & Micro-Copy Simplification** | Debloat cards by removing excessive button text and noisy labels; keep the focus on reading. | • **Front Button**: Replaced verbose "Reveal Hot Seat" and pulsing ring with a sleek, minimalist **"Hot Seat →"** action trigger.<br>• **Back Header**: Replaced loud "THE INTERVIEW CHAIR · CROSS-EXAMINATION" with clean **`{category} · Hot Seat`**.<br>• **Removed Noise**: Eliminated redundant "In WAT/GD/PI, they will push on:" prompt entirely; the question in Newsreader serif now speaks for itself.<br>• **Simplified Actions**: Shortened footer actions to clean **"Copy"** and **"Practised"** labels. | `site/src/components/NewsBrowser.astro` |
| **Segmented Track Door Panel (Homepage Parity)** | Match the exact continuous segmented panel from the homepage (`site/src/pages/index.astro`); remove bulky raised card bubbles and excessive 3D effects. | Replaced individual floating rounded card pills with a **single contiguous horizontal segmented strip**:<br>• `border-block: 1px solid var(--border)` with hairline dividers (`inset 1px 0 0 var(--border)`).<br>• Pure, unboxed vector `DomainMark` geometry on the left (`2.5rem`), bold label + count pill on top line, and subtitle on second line.<br>• Subtle background wash (`var(--tint)`) on hover and active bottom accent line (`::after`).<br>• On tablet & mobile (`<= 68rem`), smoothly transitions into a single swipeable row with `overflow-x: auto; scroll-snap-type: x proximity; scrollbar-width: none;` — exactly like the homepage. | `site/src/components/NewsBrowser.astro`, `site/src/components/DomainMark.astro` |
| **Pixel-Glitch Shatter Transition** | Replace 3D card flip with custom-designed pixel glitch animation where clicking shatters the card into parts and glitches into the backside hot seat. | Built a 16-shard kintsugi shatter matrix (`.card__shatter-matrix`, `.shatter-pixel`):<br>• On click or Enter, triggers `@keyframes pixel-shatter-burst` (380ms) with staggered delays, gold crack borders (`var(--ochre)`), and chromatic aberration (`var(--hanko)` / `var(--mizu)`).<br>• Simultaneously runs `@keyframes face-glitch-jitter` on card faces, dissolving cleanly between Front Briefing and Back Interview Chair.<br>• Toolbar button: **"Shatter all: Hot Seat mode"** triggers a staggered cascade across visible cards. | `site/src/components/NewsBrowser.astro` |
| **Mobile UX & Hero Plate Alignment** | Ensure mobile reading flow is clean, toolbar doesn't block cards, and Kiki pottery mascot is never clipped. | • Made toolbar `position: static` on mobile so it doesn't consume 160px of sticky vertical space and obscure card headings during scroll.<br>• Added `@media (max-width: 48rem)` layout to `.pg-plate__in` (`flex-direction: column; align-items: flex-start; gap: 1.5rem`), fitting headline, Kiki mascot, and speech bubble cleanly inside viewport. | `site/src/components/NewsBrowser.astro`, `site/src/pages/news/index.astro` |

---

## 2. Visual Verification Artifacts
- **Seamless Ceramic Tile Mosaic**: [`tiles-seamless-grid.png`](file:///C:/Users/Janmejai/.gemini/antigravity-cli/brain/2201e0df-c7cf-4498-8d4f-7a0f827de97b/tiles-seamless-grid.png)
- **Shattered Hot Seat Card**: [`tiles-shattered-hotseat-card.png`](file:///C:/Users/Janmejai/.gemini/antigravity-cli/brain/2201e0df-c7cf-4498-8d4f-7a0f827de97b/tiles-shattered-hotseat-card.png)
- **Mobile Mosaic View**: [`tiles-mobile-grid.png`](file:///C:/Users/Janmejai/.gemini/antigravity-cli/brain/2201e0df-c7cf-4498-8d4f-7a0f827de97b/tiles-mobile-grid.png)

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
1. **Removed Generic AI-Slop Left Border**:
   - Stripped `border-left: 3.5px solid var(--accent)` from all cards.
2. **Seamless Ceramic Tile Mosaic with Wabi-Sabi Streaks**:
   - Engineered `.briefings-grid` as a continuous stoneware mosaic floor (`gap: 1px; background: var(--border-soft); border-radius: 12px; overflow: hidden;`) with 1px mortar lines.
   - Added `.tile-streak` (gold kintsugi fracture seam across tile tops) that illuminates on hover and links neighboring tiles.
   - Integrated `.card__glaze-shader` with cursor coordinates (`--mouse-x`, `--mouse-y`) casting an interactive specular ceramic sheen.
3. **Debloated Cards & Micro-Copy**:
   - Front button simplified to sleek **"Hot Seat →"**.
   - Back header simplified to clean **`{category} · Hot Seat`** with `← Story` return trigger.
   - Removed repetitive "In WAT/GD/PI, they will push on:" micro-copy.
   - Footer buttons streamlined to simple **"Copy"** and **"Practised"**.
4. **Homepage Segmented Door Panel**:
   - Segmented strip with `border-block: 1px solid var(--border)` and `inset 1px 0 0 var(--border)` dividers.
   - On screens <= 68rem, transitions into a sleek horizontal swipe strip with scroll-snap.
5. **Build & Integrity Verification**:
   - `npm --prefix site run build` passed with 0 errors across all 69 pages (`check-build: all assertions passed`).
   - Committed and pushed to `origin/feature/bschool-news` (`d538f85`).

### Next Steps / Sprints:
- Continue testing user feedback and fine-tuning any edge animations.
- Maintain dev server exclusively on port `4323`.
```
