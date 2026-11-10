# Handoff: wAIbi-sabi 5-Crew Machine Learning Terrarium Engine

**Date**: November 11, 2026  
**Workspace**: `C:\Users\Janmejai\janmejai2002.github.io-redesign`  
**Branch**: `engine` (branched from `redesign/home-kintsugi`)  
**Dev Server**: `http://localhost:4321/`  
**NotebookLM Corpus**: Alias `waibi-terrarium` (`b8c6061a-ddbb-440f-86a4-1325617062e6`)  
**Production Build Status**: Passing all 70 static pages, `check-build.mjs`, and `check-design.mjs`

---

## 1. Executive Summary & Root Cause Findings

During the audit and testing of the living terrarium, four critical defects and ergonomic failure modes were diagnosed and resolved:

### Finding 1: Mobile Clutter & Typography Occlusion
- **Root Cause**: All 5 figurine elements were permanently set to `opacity: 1` and docked within the stage boundaries. On narrow viewports (<900px), this forced 4 figurines directly on top of the headline text ("Claimed", "Read the business piece →").
- **Resolution**: Replaced static permanent docking with **theatrical dynamic choreography**:
  - **Desktop Rest State**: Only **Kiki** (the frontier radar cat) perches quietly on the top-right rim shelf (`x: stageWidth - 68, y: 26`), completely clear of the headline text.
  - **Mobile Rest State**: **Zero figurines** on screen (`--vis: 0`). The typography breathes completely.
  - **Dynamic Entrance/Exit**: Figurines scurry in only when their diegetic role is needed, perform their action with flair, and gracefully walk off-stage!

### Finding 2: Algorithm Flip-Flop (Mouse Move = Agitated, Pause = Contemplating)
- **Root Cause**:
  1. *Quantization Noise*: Computing 3rd derivatives (jerk) on raw integer pixel coordinates without spatial filtering magnified 1-pixel browser discretization into tens of thousands of units of spurious jerk.
  2. *Heading Oscillation*: Calculating angle changes between consecutive 1-pixel steps triggered false "reversals" on normal diagonal mouse reaches.
  3. *Binary Dwell Step*: A hardcoded 160ms halt condition instantly snapped the classifier into contemplation.
- **Resolution**: Completely rebuilt `site/src/lib/crew-brain.ts`:
  - **5-tap Gaussian Convolution**: Spatial kernel $K = [0.061, 0.245, 0.388, 0.245, 0.061]$ applied across pointer history to eliminate coordinate quantization noise before derivative extraction.
  - **Macro Reversals Filter**: Agitation requires true frantic motor oscillation (at least 3 macro reversals of $\ge 22\text{px}$ within 450ms, path efficiency $\eta < 0.30$, and high speed). Normal reaches have reversals $< 2$ and efficiency $> 0.60$, clamping Agitated likelihood to $\le 0.005$!
  - **Continuous-Time Bayesian Belief Filter**: Prior transition matrix with cognitive persistence $\tau \approx 0.85\text{s}-1.5\text{s}$. Dwell accumulation follows smooth exponential saturation $(1 - e^{-t/1.2\text{s}})$, creating a gradual, organic transition over 1.2–1.8 seconds.

### Finding 3: Tsugi Disconnected from Crack Epicenter
- **Root Cause**: Tsugi was initialized at the left margin (`x: 30px`), while the fracture epicenter was at `impact.x` (~850px). When Tsugi assisted, the engine slowly dragged a spring target across the entire viewport while gold was already curing at the center.
- **Resolution**:
  - `strikePlate` now sets Tsugi's position **DIRECTLY AT THE CRACK EPICENTER**:
    `physics.setPosition('tsugi', impact.x, impact.y)`
  - Tsugi's brush position is locked directly onto the growing gold seam (`onTsugiStep`), painting the lacquer outward along the Voronoi vein from center to perimeter.
  - Calibrated Tsugi's assist step rate to 8.5 edges/s, producing a fluid ~4-second artisan sweep.

### Finding 4: Artificial Yellow Dotted Line Over WebGL Plate
- **Root Cause**: An SVG overlay (`crew-gold-overlay`, `.vein-crack`, `.vein-gold-segment`) was rendering a duplicate hardcoded SVG line over the WebGL2 shader fracture.
- **Resolution**: Completely purged the artificial SVG overlay. The genuine Inigo Quilez Voronoi fracture and glistening gold vein are rendered cleanly through the WebGL2 fragment shader and the 5-Crew terrarium canvas.

### Finding 5: Serene Initial Load & Mobile Strike Safe-Zone Clamping
- **Root Cause**:
  1. `startPlate()` was invoking `strikePlate(0)` immediately upon initial font load. This caused Oops and Tsugi to enter dynamically before the reader ever interacted, violating the zero-clutter serene resting state.
  2. On narrow screens (<640px / 40rem), an off-center tap on the headline could position Oops or Tsugi over the headline text during a strike.
- **Resolution**:
  - `startPlate()` now settles the vessel cleanly with `plate?.settle(0)` and initializes the crack trajectory geometry in `game` without triggering a strike.
  - On desktop load: Only Kiki perches serenely on the top-right shelf; all other 4 figurines park off-stage (`--vis: 0`).
  - On mobile load: All 5 figurines park off-stage (`--vis: 0`), guaranteeing 100% clean typography breathing room.
  - In `strikePlate`, if viewport width is < 640px, actor target Y is clamped below `.claim__said` (`safeY = Math.max(impact.y, saidBottom + 16)`), strictly honoring `docs/AGY-HANDOFF.md`.
  - Added `Page.bringToFront` and focus emulation in `docs/capture_engine_verification.py` to prevent background tab RAF/CSS transition throttling during headless CDP runs.

---

## 2. Modified & Verified Files on Branch `engine`

1. **`site/src/lib/crew-brain.ts`**:
   - Re-engineered 12-D kinematic feature extractor with 5-tap Gaussian spatial convolution.
   - Continuous-time Bayesian belief filter with Markov transition inertia and calibrated MAP state machine.
   - Crack proximity context integration (`setInteractionContext`).
2. **`site/src/lib/crew-physics.ts`**:
   - Off-stage bounds expansion (`[-160, stageWidth + 160]`) allowing characters to smoothly enter and exit.
   - Viewport-aware resting docks: desktop perches Kiki on top rim shelf; mobile parks all figurines off-stage.
3. **`site/src/lib/kintsugi-game.ts`**:
   - Added `getDistanceToCrack` and `getImpact`.
   - Calibrated autonomous Tsugi assist progression (`8.5 edges/s`) starting directly from `edge[0].p1 = impact`.
4. **`site/src/pages/index.astro`**:
   - CSS: Added `--vis: 0`, `transition: opacity 0.35s ease`, and `.is-active` pointer event gating.
   - Theatrical choreography:
     - **Oops**: Scurries in from right $\to$ swings mallet $\to$ plate fractures $\to$ panics $\to$ scurries off-stage right.
     - **Tsugi**: Enters directly at `(impact.x, impact.y)` $\to$ paints gold lacquer outward along crack $\to$ reaches 100% cure $\to$ strikes proud pose $\to$ walks off-stage left.
     - **Fude**: Enters on 100% cure $\to$ scribbles repair ledger $\to$ exits off-stage left.
     - **Uso**: Peeks in during deep contemplation ($> 3.5\text{s}$) with loupe $\to$ verifies lacquer $\to$ exits off-stage right.
5. **`site/src/components/Bowl.astro` & `MiniBowl.astro`**:
   - Subtle hairline borders (`stroke-dasharray: none`), zero yellow dotted lines.
6. **`docs/canon/domain_j_game_ai_and_synthetic_characters.md`**:
   - Grounding canon covering Blumberg, Dave Mark's MAUT, Flash & Hogan kinematics, and Voronoi gold parameterization.

---

## 3. Clear Baton Handoff Prompt for New Chat

Copy and paste the prompt below into the new chat session to continue automatically:

```markdown
# Autonomous Continuation: 5-Crew Machine Learning Terrarium on Branch `engine`

### Context & Current State
- **Workspace**: `C:\Users\Janmejai\janmejai2002.github.io-redesign`
- **Active Branch**: `engine`
- **Dev Server**: `http://localhost:4321/` (Astro 5 SSG)
- **NotebookLM Alias**: `waibi-terrarium` (`b8c6061a-ddbb-440f-86a4-1325617062e6`)
- **Key Files**:
  - `site/src/lib/crew-brain.ts` (12-D Bayesian ML intent classifier)
  - `site/src/lib/crew-physics.ts` (Euler harmonic springs, Gaze IK, dynamic off-stage staging)
  - `site/src/lib/kintsugi-game.ts` (Voronoi crack network, gold lacquer deposit, Tsugi assist)
  - `site/src/pages/index.astro` (Terrarium RAF loop, theatrical figurine entrances/exits)
  - `docs/HANDOFF_TERRARIUM_ENGINE.md` (Detailed architectural summary)

### Accomplishments from Previous Session
1. **Zero Text Clutter (Dynamic Theatrical Staging)**:
   - Desktop resting state: Only Kiki sits quietly on the upper rim shelf (`x: stageWidth - 68, y: 26`). All other 4 figurines park off-stage (`--vis: 0`).
   - Mobile resting state: All 5 figurines park off-stage by default (`--vis: 0`). Zero typography occlusion on narrow viewports.
   - Dynamic choreography: Characters only enter when their action is triggered:
     - Oops scurries in from right on strike $\to$ swings mallet $\to$ panics $\to$ exits off-stage right.
     - Tsugi appears directly at `(impact.x, impact.y)` $\to$ paints gold lacquer outward along the seam $\to$ strikes proud pose $\to$ exits off-stage left.
     - Fude steps in on 100% cure $\to$ scribbles ledger note $\to$ exits off-stage left.
     - Uso peeks in during deep contemplation (>3.5s) $\to$ checks seam with loupe $\to$ exits off-stage right.
2. **Upgraded ML Kinematic Engine (`crew-brain.ts`)**:
   - 5-tap Gaussian spatial smoothing eliminates discrete sub-pixel coordinate noise before velocity/acceleration/jerk extraction.
   - Replaced flawed angle-flip heuristics with true macro reversal detection ($\ge 22\text{px}$ reversals) and Flash-Hogan trajectory efficiency ($\eta = D_{\text{net}} / L_{\text{tot}}$).
   - Smooth continuous Bayesian belief filter: Normal mouse movement produces high `Exploring` ($>85\%$), stillness accumulates gradually into `Contemplating` over 1.2–1.8s, and frantic shaking triggers `Agitated` ($>90\%$).
3. **Tsugi Center-of-Crack Repair**:
   - Tsugi starts directly at `(impact.x, impact.y)` and follows the leading edge of the gold lacquer outward.
4. **Purged Artificial Line**:
   - Completely deleted the SVG yellow dotted overlay; only clean WebGL2 kintsugi lines are rendered.
5. **Production Build Verified**:
   - `npm --prefix site run build` passed with zero errors across all 70 static pages, `check-build.mjs`, and `check-design.mjs`.

### Next Actions for This Session
1. Verify `git status` on branch `engine` and launch modified files in Zed (`Start-Process zed -ArgumentList "<path>"`).
2. Run live verification in browser (`http://localhost:4321/` or `http://localhost:4321/?debug=crew`) to inspect figurine walk-in/walk-out animations, Tsugi's gold painting from crack center, and ML probability bars.
3. Fine-tune micro-timings, speech bubble strings, and WebAudio click sounds if needed.
4. Prepare clean commit on branch `engine` when approved by the user.
```
