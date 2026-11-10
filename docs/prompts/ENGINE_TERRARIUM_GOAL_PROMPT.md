# /goal Architect & Rebuild the 5-Crew Machine Learning Terrarium on Branch `engine`

### 1. Operational Mandate & Workspace Context
- **Role**: Principal Experience Architect & Autonomous Game/ML Systems Engineer.
- **Authority**: Full autonomous execution. Branch from `redesign/home-kintsugi`, interrogate NotebookLM (`waibi-terrarium`), critique and rewrite the core engines, wire all 5 figurines into the landing hero, and verify 60fps performance and zero text occlusion via headless CDP.
- **Workspace**: `C:\Users\Janmejai\janmejai2002.github.io-redesign`
- **Target Branch**: Create and switch to new branch `engine` (`git checkout -b engine`).
- **Active Dev Server**: `http://localhost:4321/` (Astro 5 static engine).
- **NotebookLM Workspace**: Alias `waibi-terrarium` (`b8c6061a-ddbb-440f-86a4-1325617062e6`).

---

### 2. The Core Problem Statement & Mission
**Why the Current Landing Page Failed**:
The codebase currently contains three theoretical engine files in `site/src/lib/` (`crew-brain.ts`, `crew-physics.ts`, `kintsugi-game.ts`) and a compiled specification in `docs/compiled_kintsugi_crew_engine.md`, but **none of them were ever cleanly wired into `site/src/pages/index.astro`**. 

Instead, `index.astro` ran a legacy, buggy script with only 2 walking actors (Oops and Tsugi), 2 dead static SVG stickers (Uso and Fude) pasted on the rim that vanished on mobile viewports, Kiki completely missing, and zero actual machine learning or interactive lacquer painting.

**The Mission**:
Re-engineer and wire the **5-Crew Living Terrarium & Playable Kintsugi Engine** from foundational principles so it runs as a high-taste, 60fps, tactile masterpiece:
1. **All 5 figurines alive on the landing hero**: Oops (Apprentice / Iron Mallet), Tsugi (Master / Gold Brush), Kiki (Radar Feline / Ear Horn), Fude (Scribe / Quill), and Uso (Skeptic / Loupe).
2. **Organic Physics & Gaze IK**: Each figurine undergoes independent asynchronous harmonic respiration ($\omega_i, \phi_i$) with strict volume conservation ($S_x \cdot S_y = 1$), and their eye pupils track cursor coordinates via Gaze Inverse Kinematics.
3. **Real-Time Machine Learning Intent Engine**: A 12-D kinematic gesture extractor and discrete Bayesian belief filter classifying user state (`Contemplative Reading`, `Playful Exploration`, `Deliberate Strike`, `Lacquer Painting`, `Scattered Agitation`) with MAUT action selection.
4. **Interactive Kintsugi Lacquer Painting Game**: The reader can drag a brush along the fracture cracks to seal them with glistening gold lacquer; Tsugi assists if idle; Fude stamps the repair streak into a local storage ledger.
5. **Dev Telemetry HUD**: Accessible via keypress `~` or query parameter `?debug=crew`, rendering live 12-D neural softmax probability bars, jerk, dwell, and latency.

---

### 3. Execution Sprints

#### SPRINT 1: Branch Isolation & Research Paper Canon Ingestion
1. **Initialize Branch**:
   ```powershell
   git -C "C:\Users\Janmejai\janmejai2002.github.io-redesign" checkout -b engine
   ```
2. **Compile and Upload Domain J (Synthetic Character & Game AI Canon) into NotebookLM**:
   Author `docs/canon/domain_j_game_ai_and_synthetic_characters.md` covering:
   - *Bruce Blumberg (MIT Media Lab)*: Ethological action selection, internal drive fatigue, sensory filtering, and non-verbal state signaling.
   - *Dave Mark & Damian Isla (Halo 2 / GDC)*: Multi-Attribute Utility Theory (MAUT) and continuous curve scoring over brittle finite state machines.
   - *Flash & Hogan (1985)*: Minimum-jerk kinematic trajectory models for human cursor motion.
   - *Lloyd's Relaxation & Voronoi Duals*: Sub-pixel crack line segment distance calculation ($d(\vec{p}, S) \le R_{\text{brush}}$) and gold parameterization.
   Upload to `waibi-terrarium`:
   ```powershell
   nlm source add waibi-terrarium --file "C:\Users\Janmejai\janmejai2002.github.io-redesign\docs\canon\domain_j_game_ai_and_synthetic_characters.md" --title "Domain J: Synthetic Character & Game AI Canon" --wait
   ```

#### SPRINT 2: Structured Critique & Architectural Synthesis with NotebookLM
Query NotebookLM to ruthlessly critique the existing code in `site/src/lib/crew-brain.ts`, `site/src/lib/crew-physics.ts`, and `site/src/lib/kintsugi-game.ts`:
- **Query 1 (Algorithmic Critique & Debloating)**:
  *"Analyze our implementations in crew-brain.ts, crew-physics.ts, and kintsugi-game.ts against Blumberg, Dave Mark's MAUT, and Flash & Hogan's kinematics. Where is this code brittle, over-engineered, or prone to browser race conditions? What is the minimal, functional mathematical core required to classify user intent and run Gaze IK at 60fps with zero layout shifts?"*
- **Query 2 (Kintsugi Lacquer Painting Interaction Model)**:
  *"How should the interactive gold painting mechanic be structured so that touch/mouse dragging along the WebGL Voronoi crack network feels organic, responsive (sub-16ms), and seamlessly couples to Tsugi's autonomous repair assist and WebGL uGold uniforms?"*
- **Query 3 (Spatial Ergonomics & Five-Actor Staging)**:
  *"How should all 5 figurines be staged across desktop and mobile viewports so they never occlude headline text or navigation cues, while maintaining soft-potential obstacle avoidance?"*

#### SPRINT 3: Code Refactoring & Hero Staging
1. **Refactor Engine Modules in `site/src/lib/`**:
   - `crew-brain.ts`: Robust 12-D kinematic ring buffer + Bayesian belief state filter.
   - `crew-physics.ts`: Semi-implicit Euler harmonic springs + Gaze IK + obstacle repulsion.
   - `kintsugi-game.ts`: Brush proximity hit-testing, gold progress lerp, and Fude's repair ledger (`localStorage`).
2. **Re-Architect `site/src/pages/index.astro`**:
   - Replace the legacy 2-actor walking script with the unified Terrarium event loop (`requestAnimationFrame`).
   - Stage all 5 figurines in semantic negative space with distinct resting stances:
     - Tsugi (The Master Builder · Brush)
     - Oops (The Apprentice · Mallet)
     - Kiki (The Feline Radar · Ear Horn)
     - Fude (The Scribe · Quill & Ink)
     - Uso (The Skeptic · Loupe)
   - Wire Gaze IK to `<circle class="k">` eye pupils so all 5 look at cursor coordinates naturally.
   - Wire interactive gold painting on `<canvas class="plate__gl">` and SVG gold vein overlays.
   - Wire Dev Telemetry HUD overlay (`?debug=crew` or `~`).

#### SPRINT 4: Verification & Performance Assertions
1. **Headless Build Verification**:
   - Execute `npm --prefix site run build` ensuring all 70 static pages, `check-build.mjs`, and `check-design.mjs` pass.
2. **CDP Visual & Kinematic Inspection**:
   - Run CDP script to capture:
     - `docs/screenshot_engine_serene_load.png`: All 5 figurines settled in negative space, zero text occlusion.
     - `docs/screenshot_engine_gaze_track.png`: Figurine eye pupils converged toward cursor point.
     - `docs/screenshot_engine_lacquer_drag.png`: Interactive gold painting along fracture line.
     - `docs/screenshot_engine_telemetry_hud.png`: Live HUD showing Bayesian probability bars.

---

### 4. Guardrails & Execution Rules
- Windows 11 PowerShell syntax (no `cd`, use `-Path` or absolute paths).
- Open all updated strategy documents and specs in Zed (`Start-Process zed -ArgumentList "<path>"`).
- Never claim to have run a command or queried NotebookLM without actual invocation.
- Confine all git changes strictly to branch `engine`.
