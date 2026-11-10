# wAIbi-sabi — B-School News Redesign & 3D Interactive Dossier
## Consolidated Architecture, Task Matrix & Seamless Baton-Handoff Protocol

> **Target Workspace**: `C:\Users\Janmejai\janmejai2002.github.io`  
> **Git Branch**: `feature/bschool-news` (isolated from `main` and external worktrees)  
> **Active Dev Port**: `4323` (`npm --prefix site run dev -- --port 4323`)  
> **Status**: Static build verified (`check-build: all assertions passed`), 3D card flip & SVG domain marks live.

---

## 1. Consolidated Instruction Matrix & Completed Deliverables

| Area | Original User Request / Problem Identified | Completed Implementation & Architectural Fix | Files Modified / Created |
| :--- | :--- | :--- | :--- |
| **Workspace & Branch Isolation** | Prevent interference with other active workspaces (`janmejai2002.github.io-redesign`). Separate work into clean branches. | Created and checked out `feature/bschool-news` and `feature/projects` from `main`. Bound local Astro dev server exclusively to port `4323`. Terminated port 4321 conflicts. | Git branches: `feature/bschool-news`, `feature/projects` |
| **Hero & Atmosphere** | Reintegrate Kiki ceramic crew member (*"I read the business pages so you can pretend you did"*), match homepage aesthetic with shader & kintsugi plate. | Added `.pg-plate` with radial gradients (`--ochre` and `--plum` washes over `--tldr-bg`), Kiki ceramic pottery figure with speech bubble, and underlying SVG kintsugi fracture polyline (`.pg-edge`). Enabled WebGL grain shader (`grain={true}`). | `site/src/pages/news/index.astro`, `site/src/components/Crew.astro`, `site/src/lib/crew.ts`, `site/src/styles/crew.css` |
| **Archive Count Discrepancy** | Header showed "618 in archive" but button/doors showed "All 102". | Removed the 14-day date slice limitation. Bound index page directly to `allNews` (618 briefings) across all dates with full search and filtering capabilities. | `site/src/pages/news/index.astro`, `site/src/components/NewsBrowser.astro` |
| **Grid Void Bug & Artificial Bloat** | Awkward empty black spaces (e.g. 66% stranded column voids on 5-item days) and layered artificial cards shown in user screenshots. | Replaced the rigid 3-column grid and pinned 13.5rem left sidebar with horizontal editorial datelines (`.day-head` with golden hairline seam) and an organic 2-column balanced grid (`.briefings-grid`). Zero stranded holes. | `site/src/components/NewsBrowser.astro` |
| **Text Truncation Bug** | Body summary paragraph was clamped mid-sentence at 4 lines (`-webkit-line-clamp: 4`). | Removed text clamping; full factual summary displays with Newsreader/system typography, relaxed line-height (1.62), and high editorial readability. | `site/src/components/NewsBrowser.astro` |
| **3D Card Flip & Active Recall** | Put the interview angle on the backside of each card with a 3D perspective and tactile animation inviting the user to flip it. | Engineered dual-sided 3D card architecture with `perspective: 1600px`, `transform-style: preserve-3d`, and 180° smooth flip (`cubic-bezier(0.2, 0.85, 0.25, 1)`).<br>• **Front Face**: News briefing, peeking tactile edge (`HOT SEAT ↷`), flip button with pulsing indicator, and source link.<br>• **Back Face**: Authentic wabi-sabi interview dossier with gold fracture seam, domain watermark, "THE INTERVIEW CHAIR · CROSS-EXAMINATION" badge, angle in Newsreader serif, copy button, and practice tracking button.<br>• Added **"Flip all: Hot Seat mode"** toolbar toggle for full-archive active recall drilling. | `site/src/components/NewsBrowser.astro` |
| **Zero Emojis & Kinetic SVGs** | Replace all emojis and generic icons with hand-crafted, animated geometric SVGs for all functional domain tabs following `TrackMark.astro`. | Authored `DomainMark.astro` with broken symmetry for each functional domain that heals/levels/closes on hover or active selection:<br>• **Consulting**: 2×2 Strategy matrix with breakout vector in `--hanko` (seal red).<br>• **Finance**: Valuation balance scale that levels out of disequilibrium in `--ochre` (gold).<br>• **Marketing**: Perception diffusion wave arcs in `--mizu` (water blue).<br>• **Operations**: Supply chain network with link that connects in `--moss` (moss green).<br>• **Product Management**: Sprint iteration loop with toggle switch in `--plum` (plum).<br>• **All Tracks**: Concentric Enso rings with golden kintsugi fracture.<br>• Replaced all unicode characters (like `✓`) with clean inline SVGs. | `site/src/components/DomainMark.astro`, `site/src/components/NewsBrowser.astro` |
| **AEO, GEO & SEO Structure** | Enhance search and answer engine discoverability for AI overviews (Perplexity, Google AI Overviews, Gemini, ChatGPT). | Injected Schema.org `CollectionPage` + `FAQPage` with top 15 Q&A pairs (linking headlines to interview cross-examinations) and `NewsArticle` semantic microdata on every card. | `site/src/pages/news/index.astro`, `site/src/components/NewsBrowser.astro` |

---

## 2. Segmented & Prioritized Remaining Backlog

### Sprint Phase 1: Archive Sub-Route Parity
- [ ] **Task 1.1**: Update `site/src/pages/news/[archive].astro` to ensure functional domain archive sub-routes (`/news/consulting/`, `/news/finance/`, `/news/marketing/`, `/news/operations/`, `/news/product-management/`) and monthly archives (`/news/2026-11/`, etc.) share the exact hero kintsugi plate, `grain={true}`, and enhanced AEO JSON-LD FAQ schemas.
- [ ] **Task 1.2**: Verify that the domain-specific metrics cards on `[archive].astro` align seamlessly with the new wabi-sabi visual system.

### Sprint Phase 2: Responsive & Cross-Browser Verification
- [ ] **Task 2.1**: Audit mobile viewport (390px width) to verify:
  - Function door horizontal scrolling (`scroll-snap-type: x proximity`).
  - 3D card touch-flip responsiveness on iOS Safari and Android Chrome.
  - No horizontal layout spill or overflow.
- [ ] **Task 2.2**: Audit tablet viewport (768px - 1024px) for 2-column grid balance.
- [ ] **Task 2.3**: Verify `prefers-reduced-motion: reduce` fallback gracefully switches from 3D rotation to instantaneous face toggle.

### Sprint Phase 3: Final Build Verification & Remote Sync
- [ ] **Task 3.1**: Run `npm --prefix site run build` to verify all 69 static pages and `check-build.mjs` assertions pass.
- [ ] **Task 3.2**: Run `node site/scripts/doctor.mjs` for pipeline integrity check.
- [ ] **Task 3.3**: Stage modified files, create git commit: `feat(news): 3d card flip interview dossier, kinetic domain svgs, and aeo schema`, and push to `origin/feature/bschool-news`.

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
1. **3D Card Flip Hot Seat Dossier**:
   - Implemented interactive 3D flip card system in `site/src/components/NewsBrowser.astro`.
   - **Front Face**: Clean wabi-sabi reading card, headline, full factual summary (no 4-line truncation), source link, and peeking 3D edge (`HOT SEAT ↷`).
   - **Back Face**: Hot seat cross-examination angle in Newsreader serif, gold kintsugi fracture seam, domain watermark, copy angle button, and practice status tracking (`localStorage`).
   - **Toolbar**: Added "Flip all: Hot Seat mode" button for instant active recall drilling across the entire archive.
2. **Kinetic Wabi-Sabi Domain SVGs (Zero Emojis)**:
   - Built `site/src/components/DomainMark.astro` following the `TrackMark.astro` broken-symmetry philosophy for all functional doors (Consulting 2x2 breakout vector, Finance balance scale, Marketing perception waves, Operations supply link, PM iteration loop, and All Tracks Enso).
   - Removed all emojis and unicode checkmarks (`✓`), replacing them with crisp inline theme SVGs.
3. **Hero & Aesthetic Parity**:
   - `site/src/pages/news/index.astro` updated with Kiki ceramic crew member (*"I read the business pages so you can pretend you did."*), WebGL grain shader (`grain={true}`), and kintsugi gold fracture plate (`.pg-plate`).
   - Fixed count discrepancy: full archive of 618 briefings loaded and searchable.
4. **Build Verification**:
   - Ran `npm --prefix site run build` — `check-build: all assertions passed` across all 69 static pages.
   - Tested dev server on `http://localhost:4323/news/` and verified 3D card flips with Playwright.

### Your Immediate Sprint Tasks:
1. **Archive Sub-Route Parity (`site/src/pages/news/[archive].astro`)**:
   - Update `[archive].astro` to integrate `grain={true}`, the Kiki atmospheric plate styling, and FAQPage JSON-LD schema so category sub-routes (`/news/finance/`, `/news/consulting/`, etc.) match `/news/` in fidelity.
2. **Responsive Polish Audit**:
   - Verify layout and 3D touch interaction at 390px (mobile) and 768px (tablet). Ensure zero horizontal overflow and flawless door snapping.
3. **Verification & Git Commit**:
   - Run `npm --prefix site run build` to confirm all check-build assertions pass.
   - Run `node site/scripts/doctor.mjs` to ensure pipeline health.
   - Commit all changes to `feature/bschool-news` and push to `origin/feature/bschool-news`.

### Invariant Guardrails:
- Windows 11 PowerShell syntax only (no `cd`, use `-Path` or absolute paths).
- No hardcoded hex colors — use wAIbi-sabi design tokens (`--paper`, `--ink`, `--card`, `--border`, the 5 earths: `--moss`, `--hanko`, `--ochre`, `--plum`, `--mizu`).
- Exactly one `<h1>` per page (enforced by `check-build.mjs`).
- Never touch Notion status or commit to `notion/approved-articles`.
- Dev server must remain on port `4323`.

Begin immediately by inspecting `site/src/pages/news/[archive].astro` and executing Sprint Task 1.
```
