# wAIbi-sabi: Master Blog Experience Vision & Architectural Strategy
## The Living Terrarium, Diegetic Mascot Marginalia, and The Kintsugi Engineering Paradigm

> **Document Class**: Executive Architectural Strategy Memo & Implementation Blueprint  
> **Repository**: `janmejai2002.github.io-redesign` | **Branch**: `redesign/home-kintsugi`  
> **Grounding Corpus**: Curated NotebookLM Workspace `waibi-terrarium` (`b8c6061a-ddbb-440f-86a4-1325617062e6`)  
> **Foundational Canon**: Mark Weiser & John Seely Brown (PARC), Amber Case (Calm Technology), Soetsu Yanagi (Mingei / The Unknown Craftsman), Bruce Blumberg (MIT Synthetic Characters), Bret Victor (Explorable Explanations), Dieter Rams (Unobtrusive Utility / "Weniger, aber besser"), Edward Tufte (Data-Ink Ratio / Eradication of 1+1=3 Chartjunk), Kenya Hara (Emptiness / Ku), Naoto Fukasawa (Super Normal).

---

## 1. Executive Mandate & Architectural Vision

The modern technical web suffers from an epidemic of high-friction, cognitive-hijacking antipatterns: intrusive conversational chatbot modals in the bottom-right corner, neon progress bars pinned across viewports, unsolicited marketing popups, and synthetic "AI agents" that performatively spam the reader with canned one-liners.

On **wAIbi-sabi** (`https://janmejai2002.github.io`), we reject this paradigm entirely.

We treat the publication not as an advertising funnel, but as a **mindful Japanese ceramic workshop (工房 - Kōbō)**. The landing hero is an interactive glazed earthenware vessel, and our five companion characters—**Oops, Tsugi, Kiki, Fude, and Uso**—are not cartoon mascots or chat assistants. They are **handcrafted ceramic netsuke (根付)** and hanko seals resting quietly in the negative space of a cedar workbench.

```
       ┌──────────────────────────────────────────────────────────────┐
       │                 THE LIVING CERAMIC WORKSHOP                  │
       │                                                              │
       │   [Oops]         [Tsugi]        [Kiki]        [Fude]  [Uso]  │
       │  Apprentice      Master         Rim Feline    Scribe  Tester │
       │  Iron Mallet     Urushi Lacquer Vibration     Quill   Loupe  │
       │  --hanko         --mizu         --moss        --indigo--plum │
       └──────────────────────────────┬───────────────────────────────┘
                                      │
       ┌──────────────────────────────▼───────────────────────────────┐
       │                THE AMBIENT OPERATING PILLARS                 │
       ├──────────────────────────────┬───────────────────────────────┤
       │ 1. Calm Technology           │ Information resides in the    │
       │    (Weiser & Case)           │ periphery; zero focal spam    │
       ├──────────────────────────────┼───────────────────────────────┤
       │ 2. Wabi-Sabi & Kintsugi      │ Breakdowns honored with gold; │
       │    (Yanagi & Leach)          │ postmortems over concealment  │
       ├──────────────────────────────┼───────────────────────────────┤
       │ 3. Synthetic Dignity         │ Ethological drives, harmonic  │
       │    (Blumberg / MIT Media)    │ breathing, dignified silence  │
       ├──────────────────────────────┼───────────────────────────────┤
       │ 4. Active Reading            │ Reactive models, explorable   │
       │    (Victor & Talmudic Page)  │ math, zero-layout-shift notes │
       └──────────────────────────────────────────────────────────────┘
```

The core premise of this architecture is twofold:
1. **The Mascot Engine must be liberated from the landing page header** and woven into the entire publication anatomy (margins, reading depth tracking, interactive benchmark inspection, and postmortem closures) without ever occluding prose or breaking reading flow.
2. **Kintsugi (金継ぎ)** is not a cosmetic visual gimmick, but the **defining editorial philosophy of applied AI**: complex distributed systems, neural pipelines, and model orchestrations *will* fracture; true maturity lies in conducting rigorous, blameless postmortems that seal the failure in gold—leaving the architecture demonstrably stronger than before.

---

## 2. The Ambient Core: Kinematics, Decision Science & The Mathematics of Silence

### 2.1 Micro-Sensory Kinematics over Chat Spam
Amber Case’s fifth principle of calm technology states: *Technology can communicate, but does not need to speak.* The figurines communicate presence and life through physical embodiment and physics:

1. **Asynchronous Harmonic Respiration ($\omega_i, \phi_i$)**:
   Instead of static geometry or frantic loops, figurines undergo subtle sinusoidal chest expansion ($y$-scale oscillation $1.0 \pm 0.015$) calculated via semi-implicit integration in `crew-physics.ts`:
   $$S_y(t) = 1.0 + A_i \cdot \sin(\omega_i t + \phi_i)$$
   $$S_x(t) = \frac{1.0}{S_y(t)} \quad \text{(Strict Volume Conservation)}$$
   Each character possesses calibrated biological parameters:
   - **Tsugi (`--mizu`)**: Slow, grounded artisan breath ($\omega = 0.82\text{ rad/s}, \phi = 2.15$).
   - **Kiki (`--moss`)**: Light, rapid feline respiration ($\omega = 1.85\text{ rad/s}, \phi = 1.25$).
   - **Oops (`--hanko`)**: Eager, irregular apprentice cycle ($\omega = 1.35\text{ rad/s}, \phi = 0.42$).
   - **Fude (`--indigo`)**: Measured archival pacing ($\omega = 1.12\text{ rad/s}, \phi = 3.75$).
   - **Uso (`--plum`)**: Analytical, disciplined rhythm ($\omega = 0.94\text{ rad/s}, \phi = 4.80$).
   Because their breathing frequencies and phases are coprime, the workshop never synchronizes mechanically; it lives in the periphery like a quiet garden.

2. **Constrained Gaze Inverse Kinematics (IK)**:
   Pupils follow the cursor/touch coordinate $\vec{p}$ via sub-pixel damped interpolation, but displacement is strictly clamped within an anatomical socket radius:
   $$\vec{d} = \vec{p} - \vec{c}_{\text{eye}}, \quad \hat{u} = \frac{\vec{d}}{\|\vec{d}\|}$$
   $$\vec{r}_{\text{pupil}} = \hat{u} \cdot \min(\|\vec{d}\| \cdot k_{\text{gaze}},\, 2.4\text{px})$$
   Head tilt is bounded between $-4^\circ$ and $+4^\circ$. Mascots never exhibit uncanny $360^\circ$ spins or aggressive tracking that distracts from reading.

3. **Semi-Implicit Euler Spring Dynamics & Earthenware Mass**:
   Each figurine possesses mass $m$, spring stiffness $k$, and damping coefficient $c$:
   $$\vec{a}_t = \frac{-k(\vec{x}_t - \vec{x}_{\text{target}}) - c\vec{v}_t + \vec{F}_{\text{ext}}}{m}$$
   $$\vec{v}_{t+\Delta t} = \vec{v}_t + \vec{a}_t \Delta t, \quad \vec{x}_{t+\Delta t} = \vec{x}_t + \vec{v}_{t+\Delta t} \Delta t$$
   When tapped, Oops suffers an authentic squash-and-stretch tumble ($S_x = 1.45, S_y = 0.62$), restoring equilibrium over $600\text{ms}$ with zero synthetic easing curves.

---

### 2.2 Decision Science: The Mathematical Silence

```
                             [ Raw Pointer / Touch Stream ]
                                            │
                                            ▼
                             [ 300ms Ring Buffer (12-D) ]
                             • Velocity (v)       • Curvature (κ)
                             • Acceleration (a)   • Path Efficiency (η)
                             • Jerk (j)           • Dwell Ratio
                                            │
                                            ▼
                             [ 2-Layer Neural Classifier ]
                             W1 (12→16) + ReLU ──> W2 (16→5) + Softmax
                                            │
                                            ▼
                             [ P(ot | s) Observation Likelihood ]
                                            │
                                            ▼
    ┌───────────────────────────────────────┴───────────────────────────────────────┐
    │                    BAYESIAN BELIEF FILTER (crew-brain.ts)                     │
    │                                                                               │
    │       b_{t+1}(s) = η · P(ot | s) · Σ_{s'} T(s | s') · bt(s')                  │
    │                                                                               │
    │   States: [Contemplating]   [Exploring]   [Striking]   [Painting]   [Agitated]│
    └───────────────────────────────────────┬───────────────────────────────────────┘
                                            │
                                            ▼
    ┌───────────────────────────────────────────────────────────────────────────────┐
    │                MULTI-ATTRIBUTE UTILITY THEORY (MAUT EVALUATION)               │
    │                                                                               │
    │   U(a, bt) = Σ bt(s) · R_craft(a, s) - C_intrusion(a) - C_fatigue(a, Δt)      │
    │                                                                               │
    │   IF p_still > 0.40  ──>  C_intrusion(SPEECH) = +∞  ──>  DIGNIFIED SILENCE    │
    │   ELSE               ──>  Execute Action with Highest Net Utility             │
    └───────────────────────────────────────────────────────────────────────────────┘
```

The mascot volition model in `crew-brain.ts` operates on rigorous decision-theoretic principles:

1. **Latent Intent State Space**:
   $$S = \{\text{Contemplating}, \text{Exploring}, \text{Striking}, \text{Lacquer Painting}, \text{Agitated}\}$$
2. **Bayesian Belief Update**:
   Given kinematic observation vector $o_t$ sampled at $60\text{Hz}$ across a $300\text{ms}$ buffer:
   $$b_{t+1}(s) = \frac{P(o_t \mid s) \sum_{s' \in S} T(s \mid s') b_t(s')}{\sum_{s'' \in S} P(o_t \mid s'') \sum_{s' \in S} T(s'' \mid s') b_t(s')}$$
3. **The Logarithmic Dignified Silence Invariant**:
   Mascot speech utility $U(\text{SPEECH})$ is explicitly docked by an intrusion penalty:
   $$C_{\text{intrusion}}(\text{SPEECH}) = \alpha \cdot \log\left(1 + \frac{b_t(\text{Contemplating})}{1 - b_t(\text{Contemplating}) + \epsilon}\right)$$
   Whenever the user is reading ($b_t(\text{Contemplating}) \ge 0.40$), $C_{\text{intrusion}}$ exceeds all potential craft rewards. **Speech is mathematically impossible while a human is reading.**

4. **Micro-Speech Constraint**:
   When an action *does* trigger dialogue (e.g. initial fracture or repair completion), lines are constrained to **under 8 words**, poetic in tone, and self-clearing within $3.2\text{s}$.

---

## 3. Cross-Site Journey Map: Liberating the Crew Across the Publication Anatomy

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                           CROSS-SITE PUBLICATION ANATOMY                                │
└──────────────────────────────────────────┬──────────────────────────────────────────────┘
                                           │
  ┌────────────────────────────────────────┴──────────────────────────────────────────┐
  │ 1. LANDING PAGE HERO                                                              │
  │    • Interactive glazed ceramic plate (WebGL SDF Shader)                          │
  │    • All 5 figurines in resting formation across peripheral negative space        │
  │    • Fracture strike sandbox & golden lacquer painting game                       │
  │    • Fude's Hanko seal & repair streak ledger                                     │
  └────────────────────────────────────────┬──────────────────────────────────────────┘
                                           │
                                  Reader selects essay
                                           │
  ┌────────────────────────────────────────▼──────────────────────────────────────────┐
  │ 2. LONG-FORM ESSAYS & POSTMORTEMS (Talmudic Marginal Gutter Architecture)         │
  │                                                                                   │
  │   [ 280px Left Margin ]          [ 680px Core Editorial ]    [ 300px Right Margin]│
  │                                                                                   │
  │                                  # Article Title                                  │
  │   Kiki (Perched Sentinel) ─────> Reading Progress Track ───> Descends with scroll │
  │                                                                                   │
  │   Oops (Cautionary Shard) ─────> ### Outage Analysis ──────> Holds cracked shard  │
  │                                  Race condition exposed      at naive assumptions │
  │                                                                                   │
  │   Uso (Verification Loupe) ────> | Benchmark Table | ──────> Click to scrub math, │
  │                                  TTFT vs. Context Latency    expand assertions    │
  │                                                                                   │
  │   Fude (Archival Scribe) ──────> ### Architectural Pivots ─> Stamps margin hanko, │
  │                                  Core invariant defined      adds to reader notes │
  │                                                                                   │
  │   Tsugi (Master Artisan) ──────> ### Resolution & Mending ─> Dispenses gold seam, │
  │                                  Hardened resilience         seals postmortem     │
  └────────────────────────────────────────┬──────────────────────────────────────────┘
                                           │
                                  Scroll to conclusion
                                           │
  ┌────────────────────────────────────────▼──────────────────────────────────────────┐
  │ 3. PUBLICATION FOOTER & NEWS ARCHIVE                                              │
  │    • The Tranquil Kiln: Figures sleeping, sipping tea, or grinding lacquer        │
  │    • Lifetime Reading & Repair Chronicle: Total gold seams sealed, articles read  │
  └───────────────────────────────────────────────────────────────────────────────────┘
```

### 3.1 Mascot Contextual Specializations

| Mascot | Color Token | Article Landmark | Contextual Role & Kinetic Interaction |
| :--- | :--- | :--- | :--- |
| **Kiki** | `--moss` | Right-hand margin gutter | **Ambient Reading Depth Sentinel**: Replaces top-bar scroll meters. Perches at article top, descends smoothly with scroll velocity using spring damping. Curls into a contented nap (`mood="sleep"`) upon reaching the postmortem conclusion. |
| **Oops** | `--hanko` | Production outages, failure callouts | **The Cautionary Shard**: Docks beside descriptions of catastrophic bugs, memory leaks, or naive distributed assumptions. Holds a cracked pottery shard (`mood="sideeye"`), reminding readers that all resilient engineering begins with honest failure. |
| **Uso** | `--plum` | Benchmark tables, math formulas | **The Verification Loupe**: Sits beside empirical data with his magnifying loupe (`mood="doubt"`). Clicking Uso expands an Explorable Explanation allowing readers to scrub parameter sliders and verify confidence intervals. |
| **Fude** | `--indigo` | Architectural invariants, key takeaways | **Archival Scribe**: Inscribes vermilion red margin marks beside core takeaways. Clicking Fude saves the highlighted snippet to the reader's local reading chronicle. |
| **Tsugi** | `--mizu` | Root-cause resolution, lessons learned | **The Golden Seal**: Sits at the end of postmortems where fixes are detailed (`mood="proud"`). Tracing his brush across the divider paints a 24k gold vein, sealing the retrospective as cured. |

---

## 4. The Tactile Kintsugi System: Metaphor & Discovery

### 4.1 Fracture Cleavage & Word-Level Font Sampling
In `site/src/scripts/kintsugi.ts`, the ceramic vessel is rendered via a custom WebGL fragment shader:
1. **Log-Polar Voronoi Decomposition**:
   Space around the strike epicenter $\vec{p}_0 = (x_0, y_0)$ is mapped to log-polar coordinates:
   $$\vec{q} = \left(\ln\|\vec{p} - \vec{p}_0\| \cdot K_{\text{radial}},\, \text{atan2}(p_y - y_0, p_x - x_0) \cdot K_{\text{wedges}}\right)$$
   Voronoi distance fields in this space yield natural crack fanning that mirrors empirical ceramic brittle failure.
2. **Text Canvas Texture Inscription**:
   The editorial headline is inscribed into an offscreen high-DPI texture (`sampler2D uText`). When the plate fractures, each Voronoi shard computes independent rigid-body translation, shear, and spin matrices:
   $$\vec{u}_{\text{distorted}} = \mathbf{R}(\theta_c) \cdot (\vec{u} - \vec{c}) + \vec{c} + \vec{d}_c$$
   **The headline words physically fracture and shear out of alignment along the Voronoi faults.**
3. **Anisotropic Gold Powder (*Maki-e*) GGX Microfacets**:
   As the user paints lacquer, the crack boundary transitions into a microfacet metallic gold layer reacting dynamically to cursor illumination and viewport specular highlights.

```
          [ Mechanical Strike ]
                    │
                    ▼
     [ Log-Polar Voronoi Cleavage ]
                    │
                    ▼
     [ Offscreen Canvas Inscription ]
                    │
                    ▼
  [ Words Physically Fracture & Shear ]
                    │
                    ▼
    [ User & Tsugi Paint Gold Urushi ]
                    │
                    ▼
 [ 100% Cured: Golden Luster Wave Glow ]
                    │
                    ▼
   [ Fude Logs Fracture & Hanko Stamp ]
                    │
                    ▼
[ Content Bridge: Link to Postmortem Essay ]
```

### 4.2 Diegetic Content Bridging
The mini-game is never a dead end. When a fracture network reaches $100\%$ gold fill:
1. A soundless golden luster wave sheen sweeps across the WebGL ceramic glaze.
2. Fude stamps a vermilion wax hanko (`金継`) on the margin.
3. A quiet **Diegetic Content Bridge** emerges:
   > *“Seam #4 Restored: 'How We Recovered from a Cascading Agent Memory Leak' — Read Postmortem →”*
4. Interactive tactile curiosity converts directly into high-intent long-form reading dwell time.

---

## 5. Three Signature Engineering Hallmarks

To ensure wAIbi-sabi remains unforgettable to senior engineers, architects, and technical leaders, the system includes three distinct hallmarks:

### Hallmark 1: The Inspectable Decision-Science HUD (`~` Tilde Telemetry)
Pressing the tilde key (`~`) or appending `?debug=crew` exposes the complete runtime decision engine:
- Live 12-dimensional kinematic ingestion graph (acceleration, curvature, dwell).
- 2-layer neural classifier forward-pass probabilities ($12 \to 16 \to 5$) with execution latency ($< 0.02\text{ms}$).
- Bayesian belief bar chart illustrating $b_t(s)$ in real time.
- MAUT expected utility breakdown proving mathematically that mascot silence is enforced during reading.

### Hallmark 2: Log-Polar Voronoi Rigid Shard Font Fracture
Unlike generic canvas games that draw lines over static text, wAIbi-sabi binds DOM typography into the WebGL fragment shader. Shards translate and rotate under Newtonian impulses, causing the actual text glyphs to fracture along tectonic fault lines before being mended with 24k gold.

### Hallmark 3: Explorable "Ladder of Abstraction" via Uso's Verification Loupe
Grounding Bret Victor’s principles directly into technical postmortems:
Beside latency tables, throughput comparisons, or model token benchmarks, clicking Uso’s magnifying loupe transforms static markdown tables into reactive interactive models. Readers can scrub input variables (e.g., concurrency, batch size, context window depth) and observe the system latency curves recalculate live in the margin.

---

## 6. Phased Implementation Roadmap

```
2026 ROADMAP      SPRINT 1            SPRINT 2            SPRINT 3            SPRINT 4
                  [Decoupling]        [Talmudic Margins]  [Explorable Loupe]  [Ledger Sync]
                  ────────────────────────────────────────────────────────────────────────
Component Refactor│ █ Consolidated TS │                   │                   │
                  │ █ Clean Modules   │                   │                   │
                  │                   │                   │                   │
Marginalia Engine │                   │ █ Tufte Gutter    │                   │
                  │                   │ █ Kiki Sentinel   │                   │
                  │                   │ █ Oops Shard      │                   │
                  │                   │                   │                   │
Explorable System │                   │                   │ █ Uso Param Scrub │
                  │                   │                   │ █ Reactive Curves │
                  │                   │                   │                   │
Cross-Site Sync   │                   │                   │                   │ █ LocalStorage
                  │                   │                   │                   │ █ Hanko Ledger
                  │                   │                   │                   │ █ Doctor Audit
```

### Phase 1: Architectural Decoupling & Componentization (Sprint 1)
- **Objective**: Extract the monolithic terrarium script in `site/src/pages/index.astro` into modular, reusable components.
- **Action Items**:
  1. Create `site/src/components/kintsugi/TerrariumStage.astro` encapsulating DOM markup, WebGL canvas, and SVG vein overlay.
  2. Create `site/src/components/kintsugi/TelemetryHUD.astro` for the `~` inspectable HUD.
  3. Package mascot SVGs into `site/src/components/crew/MascotNetsuke.astro` with unified CSS variable bindings (`--pupil-x`, `--pupil-y`, `--scale-x`, `--scale-y`, `--tilt`).

### Phase 2: Article Marginalia Layout & Gutter Infrastructure (Sprint 2)
- **Objective**: Establish the non-intrusive Talmudic reading layout.
- **Action Items**:
  1. Refactor `site/src/layouts/ArticleLayout.astro` to introduce a $280\text{px}$ dedicated right-hand gutter (`.article__marginalia`) for desktop viewports ($\ge 1200\text{px}$).
  2. Implement `site/src/lib/crew-marginalia.ts` with `DOM TextQuoteAnchor` support to bind figurines to specific heading or paragraph IDs without DOM layout shift.
  3. Deploy **Kiki’s Reading Depth Sentinel** on the margin track with smooth spring damping.
  4. Deploy **Oops’s Cautionary Shard** to automatically render beside `<aside class="outage-postmortem">` blocks.

### Phase 3: Explorable Explanations via Uso's Loupe (Sprint 3)
- **Objective**: Bring Bret Victor's active reading to technical postmortems.
- **Action Items**:
  1. Build `site/src/components/explorable/ParamSlider.astro` and reactive calculation hooks in client-side TypeScript.
  2. Integrate **Uso’s Verification Loupe** into benchmark tables (e.g. inference throughput, A2A vs. MCP latency).
  3. Clicking Uso expands inline sensitivity curves without navigating away from the article.

### Phase 4: Cross-Article Ledger & Reading Streak Synchronization (Sprint 4)
- **Objective**: Connect the reader’s journey into a persistent, contemplative craft chronicle.
- **Action Items**:
  1. Refactor `site/src/lib/kintsugi-game.ts` into a unified `site/src/lib/kintsugi-ledger.ts` backed by `localStorage`.
  2. Synchronize repaired fractures on the hero plate with articles read, bookmarking stamped hanko seals (`金継`).
  3. Add Fude’s Chronicle drawer to the global footer, displaying lifetime reading depth and postmortem lessons mastered.

### Phase 5: Production Verification, LCP & GPU Memory Assertions (Sprint 5)
- **Objective**: Guarantee zero performance degradation.
- **Action Items**:
  1. Verify zero layout shift ($\text{CLS} = 0.00$) during mascot gaze tracking and respiration.
  2. Ensure WebGL contexts cleanly detach when scrolling past the hero plate to avoid mobile GPU memory pressure.
  3. Run `npm --prefix site run build` and `npm --prefix site run doctor` to enforce all blog-os invariants.

---

## 7. Architectural Alignment Invariants

1. **Human Dignity Over Engagement Hacking**: Mascots must never blink urgently, bounce to demand attention, or trigger sound effects. Interaction is always reader-initiated or ambiently peripheral.
2. **Deterministic Fallbacks**: If WebGL is unavailable or `prefers-reduced-motion` is enabled, the system cleanly renders static SVG netsuke in resting postures, preserving 100% of editorial readability.
3. **Zero Content Occlusion**: Figurines are strictly barred from obscuring primary editorial text, code blocks, or navigation links through soft potential repulsion fields.
4. **Honest Engineering**: Postmortems and failure analyses will always be treated as the highest form of literature, illuminated with golden lacquer as a testament to organizational resilience.

---

## 8. NotebookLM Grounded Synthesis: Minimalist Industrial Reform & Verified Visual Settle

On 2026-11-10, following rigorous interrogation of our dedicated NotebookLM corpus (`waibi-terrarium` / `b8c6061a-ddbb-440f-86a4-1325617062e6`), the system persona was calibrated as **Principal Experience Architect & Master Potter**, integrating:
- **Dieter Rams**: *Weniger, aber besser* (less, but better) — unobtrusive, honest tools.
- **Edward Tufte**: Maximum data-ink ratio; absolute eradication of chartjunk and spurious "1+1=3" visual noise.
- **Kenya Hara & Naoto Fukasawa**: Emptiness (*Ku*) and *Super Normal* design—negative space that welcomes contemplative projection.

### 8.1 Key Architectural Refinements Implemented & Verified

| Flaw Identified in NotebookLM Critique | Architectural Canon Violation | Surgical Reform Implemented | Verification Result |
| :--- | :--- | :--- | :--- |
| **Initial Load Speech Occlusion**: `restCrew()` spawned a 17-word dialogue bubble directly over the intro text. | **Edward Tufte** (Chartjunk / Text Occlusion) & **Mark Weiser** (Unsolicited Focal Demand) | Removed automated speech on load; mascots rest in 100% serene silence. | **Verified clean**: `docs/screenshot_v2_load.png` |
| **Plastic Isotropic Gold**: Fragment shader rendered gold as a round, plastic specular blob (`pow(dot(N, HG), 26.)`). | **Soetsu Yanagi** (Material Honesty) | Replaced with an anisotropic microfacet scatter model along crack tangent vector $\vec{T} = \text{norm}(-\text{dir}_y, \text{dir}_x)$ simulating brushed 24k *kinpun* powder. | **Verified luster**: High-fidelity metallic glint under cursor motion. |
| **Mid-Text Mascot Occlusion**: After mending, Oops and Tsugi settled at $y = \text{hit}_y + \text{size} \times 1.15$, clipping the "What the article found" mend text. | **Kenya Hara** (Loss of *Ku*) & **Dieter Rams** (Tool Obtrusion) | Re-engineered post-repair choreography: Tsugi finishes painting at $t=1950\text{ms}$ and glides smoothly into the right negative margin ($x=76\%, y=58\%$) at $t=2750\text{ms}$, standing proud beside Oops. | **Verified zero occlusion**: `docs/screenshot_v2_settled.png` |
| **Permanent Comic Bubbles**: Dialogue bubbles remained indefinitely once rendered. | **Amber Case** (Attention Budgeting) | Added an automatic $2.4\text{s}$ dismissal timer with bounding box guards preventing overlap with `.plate__id`. Clicking Oops or Tsugi directly triggers a brief, self-clearing quip. | **Verified transient**: Speech bubbles never linger or clutter editorial prose. |

### 8.2 Visual Verification Proof Matrix

- **Fresh Initial Load**: [`screenshot_v2_load.png`](file:///C:/Users/Janmejai/janmejai2002.github.io-redesign/docs/screenshot_v2_load.png) — Glazed plate, pristine typography, calm netsuke in negative space, zero dialogue popups.
- **Active Strike & Fracture**: [`screenshot_v2_mending.png`](file:///C:/Users/Janmejai/janmejai2002.github.io-redesign/docs/screenshot_v2_mending.png) — Analytical Voronoi fracture, Oops in responsive panic at impact epicenter, zero laser line clutter.
- **Lustrous Gold Settle**: [`screenshot_v2_settled.png`](file:///C:/Users/Janmejai/janmejai2002.github.io-redesign/docs/screenshot_v2_settled.png) — Anisotropic 24k gold veins, fully readable mend text and article link, figurines respectfully resting in the right-hand margin.

---

## 9. Epistemic Realignment: The Five Critical Editorial Lenses & Authoritative Marginalia

On 2026-11-10, following multi-hop interrogation of NotebookLM (`waibi-terrarium`), we executed the definitive de-gimmicking of the wAIbi-sabi companion architecture.

### 9.1 De-Gimmicking: Mascots vs. Critical Editorial Lenses

The figurines are **not** chatty video-game mascots or DevOps bot toys. Unprompted cartoon speech bubbles with theatrical lines (*"A river of gold across the ceramic!", "Tensile failure at (r, θ)"*) have been permanently eradicated from the repository (`crew-dialogue.ts` completely removed).

Instead, wAIbi-sabi’s five pottery figures represent **the five critical lenses** brought to every story:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                          THE FIVE CRITICAL EDITORIAL LENSES                            │
├─────────────┬───────────┬──────────────┬─────────────────────────┬─────────────────────┤
│ Track       │ Token     │ Lens Owner   │ Title & Archetype       │ Primary Function    │
├─────────────┼───────────┼──────────────┼─────────────────────────┼─────────────────────┤
│ Technical   │ --mizu    │ Tsugi        │ The Builder             │ Craftsman's lens    │
│             │ (Celadon) │              │ Systems & Invariants    │ Under the hood      │
├─────────────┼───────────┼──────────────┼─────────────────────────┼─────────────────────┤
│ Business    │ --ochre   │ Uso          │ The Skeptic             │ Auditor's lens      │
│             │ (Gold)    │ (嘘)         │ Unit Economics & P&L    │ Smells bad numbers  │
├─────────────┼───────────┼──────────────┼─────────────────────────┼─────────────────────┤
│ Case        │ --moss    │ Uso & Kiki   │ Precedent & Audit       │ Enterprise reality  │
│ Studies     │ (Green)   │              │ Holds to light / Radar  │ Klarna, Duolingo... │
├─────────────┼───────────┼──────────────┼─────────────────────────┼─────────────────────┤
│ Basics      │ --plum    │ Tsugi & Uso  │ Plain Language          │ Mental models       │
│             │ (Purple)  │              │ Zero tech-bro hype      │ Clear analogies     │
├─────────────┼───────────┼──────────────┼─────────────────────────┼─────────────────────┤
│ Talks       │ --hanko   │ Kiki & Oops  │ Filter & Reality Check  │ Frontier claims     │
│             │ (Iron Red)│              │ Listens / Skims / Faults│ vs. real collisions │
└─────────────┴───────────┴──────────────┴─────────────────────────┴─────────────────────┘
```

### 9.2 Header Brief Refactoring (`ahead__brief` in `Post.astro`)
The passive "The wAIbi-sabi agentic team / Beautifully unfinished" fluff has been replaced by a high-density, authoritative editorial badge:
- **Badge**: `[LENS_OWNER] · [DOMAIN] LENS` (e.g. `AUDITED BY USO · BUSINESS & AUDIT LENS`)
- **Role**: `The Skeptic · Verification & Due Diligence`
- **Lead Perspective**: `“Source? Check the denominator.”`

### 9.3 100% Serene Landing Page Load (`index.astro`)
- The landing page hero plate renders 100% settled, glazed, and serene upon initial page load (`plate.settle(0)`).
- The crew rests quietly in the right margin (`restCrew()`), with zero automated fracture animations, zero timers, and zero speech popups.
- Fractures occur only upon intentional reader action (tapping the plate or clicking a cue).
- Clicking an actor triggers restrained physical pantomime and a dry, single-sentence hairline docket byline (styled without cartoon bubble tails or rounded pill frames).

### 9.4 Verification Proof Matrix (CDP Headless Ingestion)
- **Serene Initial Load**: [`screenshot_v3_home_serene.png`](file:///C:/Users/Janmejai/janmejai2002.github.io-redesign/docs/screenshot_v3_home_serene.png) — Intact, settled glazed plate, gold kintsugi veins, calm netsuke in margin, zero speech bubbles.
- **Active Interactive Fracture**: [`screenshot_v3_home_mending.png`](file:///C:/Users/Janmejai/janmejai2002.github.io-redesign/docs/screenshot_v3_home_mending.png) — Voronoi fracture triggered by direct user tap.
- **Settled Mend**: [`screenshot_v3_home_settled.png`](file:///C:/Users/Janmejai/janmejai2002.github.io-redesign/docs/screenshot_v3_home_settled.png) — Mended second claim with 24k anisotropic gold luster.
- **Case Studies Editorial Lens**: [`screenshot_v3_post_lens_uso.png`](file:///C:/Users/Janmejai/janmejai2002.github.io-redesign/docs/screenshot_v3_post_lens_uso.png) — Uso Loupe Stamp, `AUDITED BY USO · BUSINESS & AUDIT LENS`, zero prose occlusion.
- **Technical Systems Lens**: [`screenshot_v3_post_lens_tsugi.png`](file:///C:/Users/Janmejai/janmejai2002.github.io-redesign/docs/screenshot_v3_post_lens_tsugi.png) — Tsugi Brush Stamp, `DECONSTRUCTED BY TSUGI · TECHNICAL LENS`, telemetry-grounded takeaways.

