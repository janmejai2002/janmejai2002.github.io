# wAIbi-sabi — B-School News Redesign & 3D Interactive Dossier
## Consolidated Architecture, Task Matrix & Seamless Baton-Handoff Protocol

> **Target Workspace**: `C:\Users\Janmejai\janmejai2002.github.io`  
> **Git Branch**: `feature/bschool-news` (isolated from `main` and external worktrees)  
> **Active Dev Port**: `4323` (`npm --prefix site run dev -- --port 4323`)  
> **Status**: Static build verified (`check-build: all assertions passed`), heroic Mon seals & mobile overhaul live.

---

## 1. Consolidated Instruction Matrix & Completed Deliverables

| Area | Original User Request / Problem Identified | Completed Implementation & Architectural Fix | Files Modified / Created |
| :--- | :--- | :--- | :--- |
| **Heroic Domain Artwork (Ceramic Mon Seals)** | Domain mark artwork was too small (~20px), squeezed beside the text, and "Product Manag..." was truncated with ellipses. | Created dedicated 56px (`3.5rem`) ceramic Mon seals (`.door__seal`) with subtle radial wash, hairline border, and 44px (`2.75rem`) kinetic geometric SVGs with broken symmetry. Allowed full un-truncated titles ("Product Management") and clean count pills (`122`). | `site/src/components/NewsBrowser.astro`, `site/src/components/DomainMark.astro` |
| **Comprehensive Mobile UX Pass** | Optimize for mobile users: touch targets, reading flow, switchboard layout, and personality. | • **Mobile Switchboard**: 2-column tactile grid on mobile screens (`repeat(2, minmax(0, 1fr))`) — all 6 domains visible at a glance without horizontal scroll friction.<br>• **Mobile Toolbar**: Clean stack with full-width search and 44px min-height sort & flip buttons.<br>• **Mobile Kiki Hero**: Reintegrated Kiki ceramic pottery crew companion and speech bubble into the mobile plate.<br>• **Mobile 3D Cards**: Full thumb tap-to-flip targets (>= 44px), comfortable serif reading line-height (1.55), zero horizontal overflow. | `site/src/components/NewsBrowser.astro`, `site/src/pages/news/index.astro` |
| **3D Card Flip Active Recall Dossier** | Put interview angle on the backside of each card with 3D perspective and tactile invitation to flip. | Engineered dual-sided 3D card architecture with `perspective: 1600px`, `transform-style: preserve-3d`, and 180° smooth flip.<br>• **Front Face**: News briefing, peeking tactile edge (`HOT SEAT ↷`), flip button with pulsing indicator, and source link.<br>• **Back Face**: Hot seat cross-examination angle in Newsreader serif, gold fracture seam, domain watermark, copy button, and practice tracking.<br>• Added **"Flip all: Hot Seat mode"** toolbar toggle for full-archive flashcard drilling. | `site/src/components/NewsBrowser.astro` |
| **Zero Emojis & Kinetic SVGs** | Replace all emojis and generic icons with hand-crafted, animated geometric SVGs following `TrackMark.astro`. | Authored `DomainMark.astro` with broken symmetry for each functional domain that heals/levels/closes on hover or active selection:<br>• **Consulting**: 2×2 Strategy matrix with breakout vector in `--hanko` (seal red).<br>• **Finance**: Valuation balance scale that levels out of disequilibrium in `--ochre` (gold).<br>• **Marketing**: Perception diffusion wave arcs in `--mizu` (water blue).<br>• **Operations**: Supply chain network with link that connects in `--moss` (moss green).<br>• **Product Management**: Sprint iteration loop with toggle switch in `--plum` (plum).<br>• **All Tracks**: Concentric Enso rings with golden kintsugi fracture.<br>• Replaced all unicode characters (like `✓`) with clean inline SVGs. | `site/src/components/DomainMark.astro`, `site/src/components/NewsBrowser.astro` |
| **AEO, GEO & SEO Structure** | Enhance search and answer engine discoverability for AI overviews (Perplexity, Google AI Overviews, Gemini, ChatGPT). | Injected Schema.org `CollectionPage` + `FAQPage` with top 15 Q&A pairs (linking headlines to interview cross-examinations) and `NewsArticle` semantic microdata on every card across both index and archive routes. | `site/src/pages/news/index.astro`, `site/src/pages/news/[archive].astro`, `site/src/components/NewsBrowser.astro` |

---

## 2. The Immediate Extension Hand-Off Prompt
*(Copy everything inside the block below and paste directly into the new chat after running `/clear`)*

```markdown
You are resuming the active, high-priority engineering task on **wAIbi-sabi** (https://janmejai2002.github.io).
We are working exclusively in the local repository:
- **Directory**: `C:\Users\Janmejai\janmejai2002.github.io`
- **Git Branch**: `feature/bschool-news` (Do NOT touch `main` or `C:\Users\Janmejai\janmejai2002.github.io-redesign`).
- **Dev Server**: Port `4323` (`npm --prefix site run dev -- --port 4323`).

### What Was Just Completed & Verified:
1. **Heroic Ceramic Mon Seals (Artwork Sizing & No Truncation)**:
   - Replaced tiny squeezed door icons with prominent 56px (`3.5rem`) tactile ceramic Mon seals (`.door__seal`).
   - SVG artwork sized generously to 44px (`2.75rem`), with animated broken symmetry fully legible.
   - Removed ellipsis truncation on "Product Management", providing balanced spacing across desktop (6 cols on wide, 3 cols on medium).
2. **Comprehensive Mobile UX Designthinking Pass**:
   - 2-column mobile switchboard grid (`repeat(2, minmax(0, 1fr))`) showing all 6 domains at a glance without horizontal scroll friction.
   - Reintegrated Kiki ceramic crew member and speech bubble on mobile hero plate.
   - Full 44px touch targets on toolbar buttons and card flip triggers.
   - 3D card perspective tuned for mobile thumb tap-to-flip with high serif readability.
3. **3D Card Flip Active Recall Dossier**:
   - Dual-sided 3D card with front factual briefing and back hot seat cross-examination.
   - "Flip all: Hot Seat mode" toolbar button for full-archive interview drilling.
4. **Build & Integrity Verification**:
   - `npm --prefix site run build` passed with 0 errors across all 69 pages.
   - Tested on desktop and mobile viewports with Playwright screenshots.
   - Committed (`6e2c030`) and pushed to `origin/feature/bschool-news`.

### Next Steps / Sprints:
- Continue testing user feedback and fine-tuning any edge animations.
- Maintain dev server exclusively on port `4323`.
```
