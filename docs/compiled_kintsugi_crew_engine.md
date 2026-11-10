# wAIbi-sabi: Consolidated Kintsugi Terrarium & Living Ceramic Crew Engine Codebase

> **Canonical Engine Compilation for NotebookLM Grounding & Experience Architecture**  
> **Repository**: janmejai2002.github.io-redesign | **Branch**: 
edesign/home-kintsugi  
> **Target Document**: docs/compiled_kintsugi_crew_engine.md

---

## Table of Contents
1. [Architecture & System Specification (KINTSUGI-PLAYABLE-TERRARIUM.md)](#1-architecture--system-specification)
2. [Bayesian Intent Filter & MAUT Utility Theory (crew-brain.ts)](#2-bayesian-intent-filter--maut-utility-theory)
3. [Voronoi Crack Graph, Lacquer Painting & Mastery Ledger (kintsugi-game.ts)](#3-voronoi-crack-graph-lacquer-painting--mastery-ledger)
4. [Episodic Narrative State Machine & Combinatorial Grammar (crew-dialogue.ts)](#4-episodic-narrative-state-machine--combinatorial-grammar)
5. [Harmonic Breathing, Gaze IK & Spring Integration (crew-physics.ts)](#5-harmonic-breathing-gaze-ik--spring-integration)
6. [WebGL Ceramic Plate & Gold Shader Uniforms (kintsugi.ts)](#6-webgl-ceramic-plate--gold-shader-uniforms)
7. [Terrarium DOM Markup, Mobile Thumb Zones & Event Loop (index.astro)](#7-terrarium-dom-markup-mobile-thumb-zones--event-loop)

---

## 1. Architecture & System Specification
**Source**: docs/KINTSUGI-PLAYABLE-TERRARIUM.md

`markdown
# wAIbi-sabi: Playable Kintsugi Terrarium & Narrative Crew Engine
## Comprehensive Specification, Decision Science Architecture, and Autonomous `/goal` Blueprint

**Repository**: `janmejai2002.github.io-redesign`  
**Active Branch**: `redesign/home-kintsugi`  
**Architecture Diagram**: [`docs/kintsugi-terrarium-architecture.html`](file:///C:/Users/Janmejai/janmejai2002.github.io-redesign/docs/kintsugi-terrarium-architecture.html)  
**Specification Data**: [`docs/kintsugi-terrarium-architecture.json`](file:///C:/Users/Janmejai/janmejai2002.github.io-redesign/docs/kintsugi-terrarium-architecture.json)

---

## 1. Executive Vision: The Living Japanese Workshop

On wAIbi-sabi, the landing hero is neither a generic video reel nor an intrusive mascot distraction. It is an **interactive glazed ceramic plate** representing the Japanese philosophy of *Kintsugi* (金継ぎ)—finding greater resilience, history, and beauty in that which was once fractured and mindfully repaired.

Five handcrafted ceramic pottery figurines—**Oops, Tsugi, Kiki, Fude, and Uso**—inhabit the negative space of the plate:
- **Oops (`--hanko`)**: The clumsy yet earnest apprentice potter whose enthusiasm tests the limits of raw earthenware.
- **Tsugi (`--mizu`)**: The serene master artisan who carries the lacquer pot and 24-karat gold powder, transforming fractures into luminous veins.
- **Kiki (`--moss`)**: The observant workshop feline perched on the upper rim, sensing ambient mechanical vibrations and guiding harmonious balance.
- **Fude (`--indigo`)**: The archivist scribe who records each fracture, crack coordinate, and repair streak in the permanent chronicle.
- **Uso (`--plum`)**: The analytical inspector with his magnifying loupe, calculating tensile recovery, glaze crazing, and structural integrity.

---

## 2. Narrative Storyline & Dialogue State Progression

Instead of erratic, random one-liners, the crew operates under an **Episodic Narrative State Machine** that reflects an evolving workshop story across four distinct story arcs:

### Arc 1: The Tranquil Kiln (Stillness / Reading)
- **Context**: The user is calmly reading headlines or idling.
- **Action**: Kiki dozes quietly on the rim; Tsugi prepares urushi lacquer; Fude sharpens his bamboo quill; Uso examines glaze vitrification under his loupe; Oops balances his small iron mallet nervously.
- **Dialogue Progression**:
  - *Oops*: "The kiln is cooling gently today. The glaze feels brittle..."
  - *Tsugi*: "All ceramic welcomes time. Stillness cures the deepest clay."
  - *Uso*: "Surface tension within tolerance. No micro-crazing detected."

### Arc 2: The Fracture Strike (Interactive Event)
- **Context**: The user clicks with force, drags an impact vector, or taps Oops.
- **Action**: A Voronoi crack line propagates across the plate. Oops suffers a recoil impulse tumble ($S_x/S_y$ squash-and-stretch), scrambles behind the rim with sweat beads, and peeks with sheepish side-eyes.
- **Dialogue Progression**:
  - *Oops*: "Wah! I tapped it too eagerly! Is it broken?!"
  - *Kiki*: "Mew! The earthenware sings when it yields!"
  - *Uso*: "Tensile failure at $(r, \theta)$. Seam depth: 1.4mm. Clean cleavage."

### Arc 3: The Golden Way (Interactive Kintsugi Game)
- **Context**: Fractures exist on the plate. The user and Tsugi work together to apply lacquer.
- **Action**: The user traces along the crack line with their cursor or thumb (dispensing gold urushi powder) while Tsugi steps along the fracture trajectory with his brush tip.
- **Dialogue Progression**:
  - *Tsugi*: "Do not sweep the shards away. The gold will make it stronger than before."
  - *Fude*: "Inscribing fracture #k into the chronicle. Imperfection made timeless."
  - *Oops*: "Look at Tsugi's brush... it's turning into a river of sunlight!"

### Arc 4: The Resplendent Vessel (Repair Completion)
- **Context**: Seam reaches 100% gold coverage.
- **Action**: A warm golden luster sheen waves across the WebGL ceramic glaze; Oops hops back with joy; Kiki curls and purrs; Fude marks a completed repair streak.
- **Dialogue Progression**:
  - *Tsugi*: "The bond is cured. The scar is now its proudest virtue."
  - *Uso*: "Tensile recovery: 142% of virgin clay. Structural perfection."
  - *Oops*: "We fixed it! The bowl shines brighter than before!"

---

## 3. The Playable Kintsugi Game Mechanics ("The Broken Bowl Sandbox")

An interactive, physics-governed mini-game playable directly on the hero plate with mouse or touch:

1. **Fracture Strike Mechanic**:
   - **Trigger**: Clicking on the ceramic plate, dragging a swift strike vector, or tapping Oops's mallet.
   - **Physics**: Impact velocity $\vec{v}$ generates an analytical Voronoi / Delaunay crack network radiating from the strike epicenter.
   - **Variable Fracture Topography**: Stochastic seed perturbation ensures every crack network has unique branch angles, micro-crazing offsets, and branch terminations.

2. **Gold Lacquer Seam Painting**:
   - **Interactive Tool**: Cursor / touch point transitions into a delicate lacquer brush when near an active crack ($d \le 32\text{px}$).
   - **User Painting**: Dragging along unsealed cracks unrolls shimmering gold lacquer, dynamically incrementing the WebGL `uGold` shader uniform and filling SVG gold vein paths.
   - **Autonomous Tsugi Assist**: If the user pauses, Tsugi walks along the crack graph, brush down, applying lacquer at calibrated artisan pacing.

3. **Mastery Chronicle & Stats**:
   - Fude's ledger tracks:
     - `Total Fractures Healed`
     - `Gold Application Precision %` (tracking deviation from true crack midline)
     - `Continuous Repair Streak`
   - Upon completing a repair, Fude stamps a red wax hanko seal (`金継`) on the corner of the plate margin.

---

## 4. Decision Science in the Machine Learning Engine

Rather than a brittle rule-based heuristic or naïve softmax argmax, the micro-brain implements a **Decision-Theoretic Intention Model**:

### A. Bayesian Belief State Estimation
The engine maintains a continuous probability distribution $b_t(s)$ over latent user intent states:
$$S = \{\text{Contemplative Reading}, \text{Playful Exploration}, \text{Deliberate Strike}, \text{Lacquer Painting}, \text{Scattered Agitation}\}$$

Given the 12-dimensional kinematic observation vector $o_t = (v_t, a_t, j_t, \kappa_t, \tau_t, \eta_t, \dots)$ from the sliding buffer:
$$b_{t+1}(s) = \frac{P(o_t \mid s) \cdot b_t(s)}{\sum_{s' \in S} P(o_t \mid s') \cdot b_t(s')}$$

### B. Multi-Attribute Utility Theory (MAUT) for Action Selection
Available mascot actions:
$$A = \{\text{Do Nothing}, \text{Subtle Gaze Track}, \text{Breathing Tilt}, \text{Narrative Speech Tag}, \text{Oops Tumble}, \text{Tsugi Repair Walk}\}$$

The expected utility of action $a$ given current belief $b_t$:
$$U(a, b_t) = \sum_{s \in S} b_t(s) \cdot R_{\text{craft}}(a, s) - C_{\text{intrusion}}(a) - C_{\text{fatigue}}(a, \Delta t)$$

- **Craft Reward $R_{\text{craft}}(a, s)$**: High payoff for timely responses (e.g., Tsugi walking when $s = \text{Lacquer Painting}$, Oops tumbling when $s = \text{Deliberate Strike}$).
- **Intrusion Cost $C_{\text{intrusion}}(a)$**: Heavily penalizes speech tags when $b_t(\text{Contemplative Reading}) > 0.60$.
- **Fatigue Cost $C_{\text{fatigue}}(a, \Delta t)$**: Exponentially decays as cooldown elapses ($\Delta t \ge 3.5\text{s}$), guaranteeing zero repetitive chatter:
  $$C_{\text{fatigue}}(a, \Delta t) = w_0 \cdot \exp\left(-\frac{\Delta t}{\tau_{\text{cooldown}}}\right)$$

### C. Optimal Decision Rule
An action is triggered if and only if its net expected utility exceeds the activation threshold:
$$a^* = \arg\max_{a \in A} U(a, b_t), \quad \text{execute } a^* \iff U(a^*, b_t) > \theta_{\text{action}}$$

---

## 5. Variable Design Practices

1. **Procedural Ceramic Variation**:
   - Algorithmic variation in fracture branching (stochastic seed jitter, Voronoi cell perturbation).
   - Dynamic pottery glazes: Tenmoku iron, Celadon crackle, Shino matte, and Oribe green finishes.
2. **Organic Mascot Motion Variance**:
   - Mascot breathing animations parameterized with distinct frequencies and phases ($\omega_i, \phi_i$) so characters never breathe in robotic synchronization.
   - Dynamic squash-and-stretch ($S_x \cdot S_y = 1$) proportional to impact impulse magnitude.
3. **Combinatorial Dialogue Grammar**:
   - Context-free grammar templates combining character persona, fracture severity, and streak count, guaranteeing over 1,000 unique dialogue expressions.

---

## 6. Native Motion Graphics & Headless Playwright Verification

- **Pure Web-Native Motion Graphics**:
  - SVG path stroke-dasharray/dashoffset animation for flowing gold veins.
  - GPU-composited CSS transforms (`translate3d`, `rotate`, `scale`).
  - WebGL log-polar Voronoi shader for real-time fracture expansion.
  - Zero heavy external video/rendering dependencies; 60fps across all devices.
- **Headless Playwright Verification (`scratch/verify_kintsugi_gameplay.mjs`)**:
  - Captures sequential visual stills at key timestamps ($t = 0\text{ms}, 300\text{ms}, 800\text{ms}, 1600\text{ms}, 2500\text{ms}$).
  - Asserts:
    - Eye pupils strictly within socket radius ($r \le 2.4\text{px}$).
    - Zero obstacle collisions with `.plate__id` and `.cues` across viewports ($320\text{px}$ to $1920\text{px}$).
    - Speech tag cooldowns strictly enforced ($\ge 3.5\text{s}$).
    - Seam closure verification (gold progress reaching 1.0 without shader artifacting).

---

## 7. Device-Specific UI/UX Ergonomics & Staytime Maximization

To maximize organic dwell time on the page without intrusive or tacky gamification, the interaction engine implements distinct ergonomic profiles for mobile and desktop based on Design Thinking principles:

### A. Mobile Ergonomics & Thumb Zone Design (<768px)
1. **Vertical Scroll Preservation (No Scroll Hijacking)**:
   - The stage uses `touch-action: pan-y;` by default so vertical scrolling down the page is completely friction-free.
   - Kintsugi lacquer painting engages only when a touch gesture initiates directly within $36\text{px}$ of an active crack vein or after a sustained touch ($>120\text{ms}$), eliminating accidental scroll traps.
2. **Thumb Zone Anchor Calibration**:
   - Mascots occupy the periphery: Kiki rests at $(w \times 0.5, 32)$ above the text, Tsugi and Oops occupy the safe lateral negative space $(w \times 0.28, h - 85)$ and $(w \times 0.72, h - 85)$, and Uso/Fude stay in the lower outer corners.
   - Characters never occlude the central headline reading area.
3. **Tactile Touch Targets ($\ge 44 \times 44\text{px}$)**:
   - Direct mascot tap targets provide generous invisible bounding boxes with immediate haptic-like visual squash reactions.
4. **Compact Speech Pill HUD**:
   - On mobile screens, speech tags render as subtle, non-blocking toast chips at the plate rim rather than large floating tooltips that cover editorial text.

### B. Desktop Ergonomics (>=768px)
1. **High-Precision Cursor IK & Gaze**:
   - Smooth mouse interpolation with head tilts and gaze IK tracking the cursor.
   - Precision lacquer brush mode with gold dust particle trace.
2. **Peripheral Immersion (The 1.2-Second Glance Rule)**:
   - Mascots live quietly in peripheral vision without stealing visual hierarchy from the core applied-AI claims.
3. **Power-User Keyboard Shortcuts**:
   - `~` toggles the telemetry diagnostics HUD.
   - `Space` prompts Tsugi to step forward and assist with lacquer.
   - `R` reviews Fude's repair chronicle.

### C. Staytime Maximization Architecture (Fogg Behavior Model + Content Bridging)
1. **Fogg Behavior Model ($B = MAP$)**:
   - **Motivation**: High visual craft intrigue; curiosity about the responsive pottery figures.
   - **Ability**: Zero barrier to entry; immediate intuitive response to clicking or dragging.
   - **Prompt**: Subtle ambient breathing and soft gaze hints gently invite the reader to interact.
2. **Diegetic Content Bridging (Hooking Game into Long-Form Reading)**:
   - Upon repairing a crack, Fude's chronicle logs the repair and **bridges it directly to an applied-AI essay on the blog**:
     - Example: *"Fracture #4 Sealed: 'Why AI Systems Fail at Organizational Boundaries' — Read Case Study $\rightarrow$"*
   - This converts interactive curiosity directly into sustained article reading time.
3. **Low-Dopamine Calming Flow (wAIbi-sabi)**:
   - Replaces hyperactive casino mechanics with mindful, tactile restoration.
   - The soothing aesthetic encourages contemplative focus, leading to significantly higher average session duration.

`

---

## 2. Bayesian Intent Filter & MAUT Utility Theory
**Source**: site/src/lib/crew-brain.ts

`	ypescript
/**
 * crew-brain.ts
 * Decision-Theoretic Intent Engine & Bayesian Belief Filter for wAIbi-sabi Living Ceramic Terrarium.
 * Zero external dependencies (<2.5 KB).
 *
 * Implements:
 * 1. 12-D Kinematic Observation Extraction (v, a, j, κ, τ, η, p, etc.) over sliding ring-buffer.
 * 2. 2-layer Neural Kinematic Classifier for observation likelihood P(o_t | s).
 * 3. Discrete Bayesian Belief Filter over latent intent state space:
 *    S = { Contemplating, Exploring, Striking, Painting, Agitated }
 *    Posterior update: b_{t+1}(s) = P(o_t | s) * \sum_{s'} T(s' -> s) b_t(s') / Z
 * 4. Multi-Attribute Utility Theory (MAUT) Action Selection:
 *    U(a, b_t) = \sum_{s \in S} b_t(s) * R_craft(a, s) - C_intrusion(a) - C_fatigue(a, \Delta t)
 *    Enforces strict \Delta t >= 3.5s speech tag cooldown and reading intrusion minimization.
 * 5. Full telemetry inspection getters for the live Terrarium HUD.
 */

export const GESTURE_CLASSES = [
  'HEAVY_STRIKE',
  'FRANTIC_SHAKE',
  'GENTLE_CARESS',
  'CURIOUS_ORBIT',
  'CONTEMPLATIVE_STILLNESS',
] as const;

export type GestureClass = (typeof GESTURE_CLASSES)[number];

export const INTENT_STATES = [
  'Striking',
  'Agitated',
  'Exploring',
  'Painting',
  'Contemplating',
] as const;

export type IntentStateName = (typeof INTENT_STATES)[number];

export const MAUT_ACTIONS = [
  'DO_NOTHING',
  'SUBTLE_GAZE',
  'BREATHING_TILT',
  'SPEECH_TAG',
  'OOPS_TUMBLE',
  'TSUGI_REPAIR',
] as const;

export type MautAction = (typeof MAUT_ACTIONS)[number];

export interface IntentState {
  current: GestureClass;
  latentName: IntentStateName;
  confidence: number;
  durationInState: number;
}

export interface BeliefDistribution {
  Striking: number;
  Agitated: number;
  Exploring: number;
  Painting: number;
  Contemplating: number;
}

export interface MautDecision {
  action: MautAction;
  utility: number;
  allUtilities: Record<MautAction, number>;
  belief: BeliefDistribution;
}

// -----------------------------------------------------------------------------
// Neural Network Weights (12 -> 16 -> 5) for Observation Likelihood P(o_t | s)
// -----------------------------------------------------------------------------
const FEATURE_MEANS = new Float32Array([
  2.777900, 4.907819, 0.155030, 0.381365, 0.011296, 0.465832,
  0.389250, 0.220857, 0.477250, 0.021719, 8.222167, 0.380487,
]);

const FEATURE_STDS = new Float32Array([
  4.777040, 8.801785, 0.349322, 0.858322, 0.029020, 0.739448,
  0.386891, 0.332429, 0.801835, 0.054212, 8.208921, 0.156776,
]);

const W1 = new Float32Array([
  -0.426552,  0.476788,  0.750425, -0.043775, -0.249994,  0.029991,  0.002899, -0.534476,  0.020551,  0.151313, -0.038863, -0.065867, -0.009517, -0.434920, -0.132472, -0.448379,
  -0.426067,  0.465038,  0.769083, -0.044785, -0.271110,  0.035352, -0.000112, -0.519108,  0.020870,  0.152742, -0.039376, -0.066072, -0.010629, -0.456217, -0.135070, -0.456368,
  -0.211648,  0.151326,  0.356504,  0.026480, -0.197973,  0.033166, -0.018660, -0.254106, -0.007483,  0.043241, -0.026510,  0.004796, -0.033800, -0.286723, -0.085975, -0.211990,
  -0.210668,  0.136292,  0.362978,  0.015970, -0.190398,  0.033342, -0.019597, -0.268311, -0.012245,  0.043198, -0.030425,  0.006707, -0.042272, -0.278121, -0.081678, -0.213560,
  -0.140733,  0.019397,  0.227658,  0.035812, -0.135561,  0.027116, -0.033844, -0.172779, -0.027214, -0.000779, -0.031236,  0.031286, -0.058286, -0.197587, -0.058354, -0.134545,
   0.742615, -0.564085, -0.841580,  0.117629, -0.195864,  0.006015, -0.373461,  0.101718,  0.406626, -0.475481,  0.517189,  0.376745,  0.911249, -0.246435,  0.141353, -0.248973,
  -0.054782, -0.517581, -0.764681,  1.058932, -0.138085, -0.012164, -0.067904,  0.863484, -0.374078, -0.150722, -0.381561,  0.189685, -0.689844,  0.216336, -0.207980,  1.157382,
   0.091896, -0.533488,  0.499595, -1.074204,  0.657651,  0.249713,  0.029610, -0.423458, -0.073599,  0.080665,  0.019940,  0.084477, -0.108140,  0.536711,  0.250613, -0.424287,
   0.123179,  0.941360,  0.143986, -1.690035, -0.419232,  0.003527,  1.119258,  0.175220, -0.017217,  1.077732, -0.087110, -1.189037, -0.324976, -0.114427, -0.034625,  0.062270,
   0.201875, -0.119502, -0.221849,  0.004880, -0.067021,  0.002171, -0.089982, -0.031510,  0.153966, -0.117109,  0.170624,  0.057853,  0.329582, -0.144822,  0.030824, -0.110341,
   0.279571,  0.083515, -0.374426,  0.216159, -0.670925,  0.067183,  0.173858,  0.322771,  0.146125,  0.103571,  0.175785, -0.003789,  0.293288, -0.556592, -0.055159,  0.156748,
   0.046062,  0.202352,  0.066357, -0.199747, -0.389369,  0.061786,  0.241677,  0.105755, -0.000413,  0.248136, -0.051879, -0.162071, -0.058639, -0.124699, -0.112278,  0.083008,
]);

const B1 = new Float32Array([
  0.741729,  1.578984,  1.751238,  0.071248,  0.791158, -0.259813,  1.139285,  0.513716,
  0.492433,  1.174519,  0.368806,  0.877147,  0.609428,  1.076849,  0.151622,  0.709486,
]);

const W2 = new Float32Array([
   0.286712, -0.738723, -0.309338, -0.239084,  0.651730,
   0.325104,  1.152144, -0.664748, -0.511940, -0.364476,
  -0.733070,  1.439774, -0.664573,  0.473299, -0.369537,
  -0.983495,  0.063561,  1.888583, -0.801776, -0.151685,
  -0.370433, -0.447550, -0.197407,  1.151129, -0.114249,
   0.042027,  0.141846, -0.000332, -0.240565,  0.005136,
   0.925156,  0.425854, -0.696118, -0.211379, -0.368894,
   0.857613, -0.744362,  0.524967, -0.506148, -0.111367,
  -0.077204,  0.050336, -0.240570, -0.226237,  0.503127,
   0.717404,  0.695808, -0.794080, -0.253915, -0.354755,
  -0.028280, -0.090569, -0.303666, -0.217971,  0.544262,
  -1.050829, -0.026179,  0.577783,  0.133662,  0.248603,
  -0.186817, -0.027970, -0.486034, -0.426352,  1.117817,
   0.120649, -0.743124, -0.152014,  0.897410, -0.360085,
   0.106195, -0.168545, -0.291524,  0.243888,  0.174024,
   0.800080, -0.672998,  0.761080, -0.387862, -0.574271,
]);

const B2 = new Float32Array([
  -0.102397, -0.397411, -0.178175,  0.304688,  0.214899,
]);

// -----------------------------------------------------------------------------
// MAUT Craft Reward Matrix R_craft(a, s)
// Rows: MautAction (DO_NOTHING, SUBTLE_GAZE, BREATHING_TILT, SPEECH_TAG, OOPS_TUMBLE, TSUGI_REPAIR)
// Cols: IntentState (Striking, Agitated, Exploring, Painting, Contemplating)
// -----------------------------------------------------------------------------
const R_CRAFT: Record<MautAction, number[]> = {
  DO_NOTHING:     [0.02, 0.08, 0.35, 0.15, 0.88],
  SUBTLE_GAZE:    [0.25, 0.35, 0.92, 0.88, 0.72],
  BREATHING_TILT: [0.08, 0.18, 0.65, 0.55, 0.76],
  SPEECH_TAG:     [0.96, 0.82, 0.48, 0.84, 0.04],
  OOPS_TUMBLE:    [1.95, 0.42, 0.02, 0.00, 0.00],
  TSUGI_REPAIR:   [1.15, 0.10, 0.22, 1.82, 0.00],
};

interface PointerSample {
  x: number;
  y: number;
  t: number;
  isClick: number;
}

const BUFFER_CAPACITY = 64;
const WINDOW_MS = 300;

export class CrewBrain {
  private buffer: PointerSample[] = [];
  private head = 0;
  private count = 0;
  private features = new Float32Array(12);
  private normFeatures = new Float32Array(12);
  private hidden = new Float32Array(16);
  private logits = new Float32Array(5);
  private likelihoods = new Float32Array(5); // Neural likelihood P(o_t | s)
  private belief = new Float32Array(5);      // Posterior belief b_t(s)
  private predictedBelief = new Float32Array(5);
  private lastEvaluationTime = 0;
  private lastLatencyMs = 0;

  // MAUT Action Execution Tracking & Fatigue Memory
  private lastActionTimes: Record<MautAction, number> = {
    DO_NOTHING: -10000,
    SUBTLE_GAZE: -10000,
    BREATHING_TILT: -10000,
    SPEECH_TAG: -10000,
    OOPS_TUMBLE: -10000,
    TSUGI_REPAIR: -10000,
  };

  // Intent State Machine with Hysteresis & Dwell
  private intentState: IntentState = {
    current: 'CONTEMPLATIVE_STILLNESS',
    latentName: 'Contemplating',
    confidence: 1.0,
    durationInState: 0,
  };
  private rawIntent: GestureClass = 'CONTEMPLATIVE_STILLNESS';
  private candidateIntent: GestureClass = 'CONTEMPLATIVE_STILLNESS';
  private candidateSince = -1000;
  private lastTransitionTime = -1000;

  constructor() {
    this.buffer = new Array(BUFFER_CAPACITY).fill(null).map(() => ({ x: 0, y: 0, t: 0, isClick: 0 }));
    this.reset(0);
  }

  /** Ingests raw pointer/touch coordinates */
  public record(x: number, y: number, isClick = false, t = performance.now()): void {
    const sample = this.buffer[this.head];
    sample.x = x;
    sample.y = y;
    sample.t = t;
    sample.isClick = isClick ? 1 : 0;

    this.head = (this.head + 1) % BUFFER_CAPACITY;
    if (this.count < BUFFER_CAPACITY) this.count++;
  }

  /** Returns chronologically ordered samples in the last 300ms window */
  private getWindowSamples(now: number): PointerSample[] {
    const cutoff = now - WINDOW_MS;
    const samples: PointerSample[] = [];
    for (let i = 0; i < this.count; i++) {
      const idx = (this.head - 1 - i + BUFFER_CAPACITY) % BUFFER_CAPACITY;
      const s = this.buffer[idx];
      if (s.t < cutoff) break;
      samples.push(s);
    }
    return samples.reverse();
  }

  /** Computes the 12-dimensional kinematic vector */
  private extractFeatures(samples: PointerSample[], now: number): void {
    const n = samples.length;
    if (n < 3) {
      this.features.fill(0);
      this.features[9] = 1.0; // Dwell ratio dominates
      return;
    }

    let sumSpeed = 0;
    let maxSpeed = 0;
    const speeds: number[] = [];
    const dts: number[] = [];
    const headings: number[] = [];
    const dxs: number[] = [];
    const dys: number[] = [];
    let clickCount = 0;
    let stillPoints = 0;

    for (let i = 1; i < n; i++) {
      const dt = Math.max(1.0, samples[i].t - samples[i - 1].t);
      const dx = samples[i].x - samples[i - 1].x;
      const dy = samples[i].y - samples[i - 1].y;
      const dist = Math.hypot(dx, dy);
      const v = dist / dt;

      speeds.push(v);
      dts.push(dt);
      headings.push(Math.atan2(dy, dx));
      dxs.push(dx);
      dys.push(dy);

      sumSpeed += v;
      if (v > maxSpeed) maxSpeed = v;
      if (v < 0.035) stillPoints++;
      if (samples[i].isClick) clickCount++;
    }

    const m = speeds.length;
    const meanSpeed = sumSpeed / Math.max(1, m);

    // Accelerations
    let sumAccel = 0;
    let maxAccel = 0;
    const accels: number[] = [];
    for (let i = 1; i < m; i++) {
      const dtMid = 0.5 * (dts[i] + dts[i - 1]);
      const a = Math.abs(speeds[i] - speeds[i - 1]) / dtMid;
      accels.push(a);
      sumAccel += a;
      if (a > maxAccel) maxAccel = a;
    }
    const meanAccel = accels.length ? sumAccel / accels.length : 0;

    // Jerk
    let sumJerk = 0;
    for (let i = 1; i < accels.length; i++) {
      const j = Math.abs(accels[i] - accels[i - 1]) / Math.max(1.0, dts[i]);
      sumJerk += j;
    }
    const meanJerk = accels.length > 1 ? sumJerk / (accels.length - 1) : 0;

    // Path length & displacement
    let totLen = 0;
    for (let i = 0; i < dxs.length; i++) {
      totLen += Math.hypot(dxs[i], dys[i]);
    }
    const netDisp = Math.hypot(samples[n - 1].x - samples[0].x, samples[n - 1].y - samples[0].y);
    const pathEfficiency = netDisp / Math.max(1e-3, totLen);

    // Curvature & direction flips
    let sumAng = 0;
    let flips = 0;
    for (let i = 1; i < headings.length; i++) {
      let da = headings[i] - headings[i - 1];
      while (da > Math.PI) da -= 2 * Math.PI;
      while (da < -Math.PI) da += 2 * Math.PI;
      const absDa = Math.abs(da);
      sumAng += absDa;
      if (absDa > 1.9) flips++;
    }
    const angularCurvature = sumAng / Math.max(1.0, totLen);

    // Orbit circulation around centroid
    let cx = 0;
    let cy = 0;
    for (let i = 0; i < n; i++) {
      cx += samples[i].x;
      cy += samples[i].y;
    }
    cx /= n;
    cy /= n;

    let circulation = 0;
    for (let i = 0; i < dxs.length; i++) {
      const rx = samples[i].x - cx;
      const ry = samples[i].y - cy;
      circulation += rx * dys[i] - ry * dxs[i];
    }
    const orbitScore = Math.abs(circulation) / Math.max(10.0, totLen * Math.hypot(cx - samples[0].x, cy - samples[0].y) + 1e-2);

    const dwellRatio = stillPoints / Math.max(1, m);

    // Variance of velocity
    let varV = 0;
    for (let i = 0; i < m; i++) {
      const diff = speeds[i] - meanSpeed;
      varV += diff * diff;
    }
    const stdV = m > 1 ? Math.sqrt(varV / m) : 0;
    const vEntropy = stdV / (meanSpeed + 1e-3);

    // Write features
    this.features[0] = meanSpeed;
    this.features[1] = maxSpeed;
    this.features[2] = meanAccel;
    this.features[3] = maxAccel;
    this.features[4] = meanJerk;
    this.features[5] = angularCurvature;
    this.features[6] = pathEfficiency;
    this.features[7] = orbitScore;
    this.features[8] = clickCount;
    this.features[9] = dwellRatio;
    this.features[10] = flips;
    this.features[11] = vEntropy;
  }

  /**
   * Advances the Bayesian Belief Filter using observation likelihoods P(o_t | s).
   * Incorporates an asymmetric transition model prioritizing stability and stillness decay.
   */
  private updateBayesianBelief(dtSeconds: number, timeSinceHalt: number, clickCount: number): void {
    // 1. Time evolution / transition prediction: b_{t|t-1}(s) = \sum_{s'} T(s' -> s) b_{t-1}(s')
    const selfPersistence = Math.max(0.60, Math.min(0.88, Math.exp(-dtSeconds * 2.5)));
    const leakageToStill = timeSinceHalt > 150 ? Math.min(0.18, (timeSinceHalt - 150) / 800) : 0.02;

    for (let k = 0; k < 5; k++) {
      const prior = this.belief[k];
      if (k === 4) {
        this.predictedBelief[4] = prior * selfPersistence + (1 - selfPersistence) * 0.35 + leakageToStill;
      } else if (k === 0 && clickCount > 0) {
        this.predictedBelief[0] = prior * selfPersistence + 0.35;
      } else {
        this.predictedBelief[k] = prior * selfPersistence + (1 - selfPersistence) * 0.12;
      }
    }

    // 2. Bayesian measurement update: b_t(s) \propto P(o_t | s) * b_{t|t-1}(s)
    let sumPosterior = 0;
    for (let k = 0; k < 5; k++) {
      let likelihood = Math.max(0.005, this.likelihoods[k]);
      if (k === 0 && clickCount > 0) {
        likelihood = Math.max(likelihood, 0.88);
      }
      const post = likelihood * this.predictedBelief[k];
      this.belief[k] = post;
      sumPosterior += post;
    }

    // Normalize
    const invSum = 1.0 / Math.max(1e-6, sumPosterior);
    for (let k = 0; k < 5; k++) {
      this.belief[k] *= invSum;
    }
  }

  /** Executes forward pass, Bayesian update, and intent state machine (<0.02ms) */
  public update(now = performance.now()): GestureClass {
    const tStart = performance.now();
    const dtSeconds = this.lastEvaluationTime > 0 ? Math.max(0.001, (now - this.lastEvaluationTime) / 1000) : 0.016;
    this.lastEvaluationTime = now;

    const samples = this.getWindowSamples(now);
    this.extractFeatures(samples, now);

    // Normalize features: (x - mean) / std
    for (let i = 0; i < 12; i++) {
      this.normFeatures[i] = (this.features[i] - FEATURE_MEANS[i]) / FEATURE_STDS[i];
    }

    // Dense Layer 1: 12 -> 16 (ReLU)
    for (let j = 0; j < 16; j++) {
      let sum = B1[j];
      for (let i = 0; i < 12; i++) {
        sum += this.normFeatures[i] * W1[i * 16 + j];
      }
      this.hidden[j] = sum > 0 ? sum : 0;
    }

    // Dense Layer 2: 16 -> 5 (Softmax Observation Likelihood)
    let maxLogit = -1e9;
    for (let k = 0; k < 5; k++) {
      let sum = B2[k];
      for (let j = 0; j < 16; j++) {
        sum += this.hidden[j] * W2[j * 5 + k];
      }
      this.logits[k] = sum;
      if (sum > maxLogit) maxLogit = sum;
    }

    let sumExp = 0;
    for (let k = 0; k < 5; k++) {
      const expVal = Math.exp(this.logits[k] - maxLogit);
      this.likelihoods[k] = expVal;
      sumExp += expVal;
    }
    for (let k = 0; k < 5; k++) {
      this.likelihoods[k] /= sumExp;
    }

    // Measure time since pointer halted
    const latestSample = samples.length > 0 ? samples[samples.length - 1] : null;
    const timeSinceHalt = latestSample ? now - latestSample.t : 9999;
    if (timeSinceHalt > 180) {
      const haltFactor = Math.min(1.0, (timeSinceHalt - 180) / 140);
      this.likelihoods[4] = Math.max(this.likelihoods[4], 0.70 + 0.30 * haltFactor);
      let normSum = 0;
      for (let k = 0; k < 5; k++) normSum += this.likelihoods[k];
      for (let k = 0; k < 5; k++) this.likelihoods[k] /= normSum;
    }

    // Update Bayesian Belief Posterior b_t(s)
    const clickCount = this.features[8];
    this.updateBayesianBelief(dtSeconds, timeSinceHalt, clickCount);

    // Posterior maximum a posteriori (MAP) index
    let bestIdx = 0;
    let bestBelief = 0;
    for (let k = 0; k < 5; k++) {
      if (this.belief[k] > bestBelief) {
        bestBelief = this.belief[k];
        bestIdx = k;
      }
    }

    this.rawIntent = GESTURE_CLASSES[bestIdx];
    const rawConfidence = bestBelief;

    // --- Intent State Machine with Hysteresis & Dwell ---
    const CONFIDENCE_THRESHOLD = 0.65;
    const SUSTAIN_DURATION_MS = 240;
    const MIN_DWELL_MS = 400; // Enforce maximum 1 transition per 400ms

    const timeInState = Math.max(0, now - this.lastTransitionTime);
    this.intentState.durationInState = timeInState;

    if (rawConfidence >= CONFIDENCE_THRESHOLD) {
      if (this.rawIntent !== this.candidateIntent) {
        this.candidateIntent = this.rawIntent;
        if (this.candidateSince < 0 && samples.length > 0) {
          this.candidateSince = samples[0].t;
        } else {
          this.candidateSince = now;
        }
      }
    } else {
      if (this.candidateIntent !== this.intentState.current) {
        this.candidateIntent = this.intentState.current;
        this.candidateSince = now;
      }
    }

    if (this.candidateIntent === this.intentState.current) {
      const curIdx = GESTURE_CLASSES.indexOf(this.intentState.current);
      const curBelief = this.belief[curIdx] ?? 0.8;
      this.intentState.confidence = this.intentState.confidence * 0.82 + curBelief * 0.18;
    } else {
      const candidateDuration = now - this.candidateSince;
      const requiredSustain = this.candidateIntent === 'HEAVY_STRIKE' ? 50 : SUSTAIN_DURATION_MS;

      if (
        candidateDuration >= requiredSustain &&
        timeInState >= MIN_DWELL_MS &&
        rawConfidence >= CONFIDENCE_THRESHOLD
      ) {
        this.intentState.current = this.candidateIntent;
        const stateIdx = GESTURE_CLASSES.indexOf(this.candidateIntent);
        this.intentState.latentName = INTENT_STATES[stateIdx];
        this.intentState.confidence = rawConfidence;
        this.intentState.durationInState = 0;
        this.lastTransitionTime = now;
      }
    }

    this.lastLatencyMs = performance.now() - tStart;
    return this.intentState.current;
  }

  /**
   * Computes Multi-Attribute Utility Theory (MAUT) utility for all mascot actions.
   * U(a, b_t) = \sum_{s \in S} b_t(s) * R_craft(a, s) - C_intrusion(a) - C_fatigue(a, \Delta t)
   */
  public evaluateMAUT(now = performance.now()): MautDecision {
    const b = this.belief;
    const utilities: Record<MautAction, number> = {
      DO_NOTHING: 0,
      SUBTLE_GAZE: 0,
      BREATHING_TILT: 0,
      SPEECH_TAG: 0,
      OOPS_TUMBLE: 0,
      TSUGI_REPAIR: 0,
    };

    const pStill = b[4]; // Contemplating probability

    for (const action of MAUT_ACTIONS) {
      // 1. Expected Craft Reward
      const rRow = R_CRAFT[action];
      let expectedReward = 0;
      for (let k = 0; k < 5; k++) {
        expectedReward += b[k] * rRow[k];
      }

      // 2. Intrusion Cost: strictly penalize speech tags during active reading
      let cIntrusion = 0;
      if (action === 'SPEECH_TAG') {
        if (pStill > 0.40) {
          cIntrusion = 0.35 + 1.65 * Math.pow((pStill - 0.40) / 0.60, 1.8);
        } else {
          cIntrusion = 0.12;
        }
      }

      // 3. Fatigue Cost: decays as cooldown elapses (\Delta t >= 3.5s for speech tags)
      const lastT = this.lastActionTimes[action];
      const deltaT = Math.max(0, now - lastT);
      let cFatigue = 0;

      if (action === 'SPEECH_TAG') {
        const MIN_COOLDOWN_MS = 3500;
        if (deltaT < MIN_COOLDOWN_MS) {
          cFatigue = 8.0 * (1.0 - deltaT / MIN_COOLDOWN_MS) + 2.0;
        } else {
          cFatigue = 0.55 * Math.exp(-(deltaT - MIN_COOLDOWN_MS) / 2400);
        }
      } else if (action === 'OOPS_TUMBLE') {
        const TUMBLE_COOLDOWN_MS = 750;
        if (deltaT < TUMBLE_COOLDOWN_MS) {
          cFatigue = 4.0 * (1.0 - deltaT / TUMBLE_COOLDOWN_MS);
        }
      } else if (action === 'TSUGI_REPAIR') {
        const REPAIR_COOLDOWN_MS = 900;
        if (deltaT < REPAIR_COOLDOWN_MS) {
          cFatigue = 3.5 * (1.0 - deltaT / REPAIR_COOLDOWN_MS);
        }
      }

      utilities[action] = expectedReward - cIntrusion - cFatigue;
    }

    // Find best action
    let bestAction: MautAction = 'DO_NOTHING';
    let bestUtil = -1e9;
    for (const action of MAUT_ACTIONS) {
      if (utilities[action] > bestUtil) {
        bestUtil = utilities[action];
        bestAction = action;
      }
    }

    return {
      action: bestAction,
      utility: bestUtil,
      allUtilities: utilities,
      belief: {
        Striking: b[0],
        Agitated: b[1],
        Exploring: b[2],
        Painting: b[3],
        Contemplating: b[4],
      },
    };
  }

  /** Records execution of an action to refresh its fatigue model */
  public recordAction(action: MautAction, now = performance.now()): void {
    this.lastActionTimes[action] = now;
  }

  public getKinematicIntent(now = performance.now()): GestureClass {
    return this.update(now);
  }

  public getIntentState(): IntentState {
    return { ...this.intentState };
  }

  public getRawIntent(): GestureClass {
    return this.rawIntent;
  }

  public getProbabilities(): Float32Array {
    return this.belief;
  }

  public getLikelihoods(): Float32Array {
    return this.likelihoods;
  }

  public getBeliefDistribution(): BeliefDistribution {
    return {
      Striking: this.belief[0],
      Agitated: this.belief[1],
      Exploring: this.belief[2],
      Painting: this.belief[3],
      Contemplating: this.belief[4],
    };
  }

  public getLastFeatures(): Float32Array {
    return this.features;
  }

  public getNormalizedFeatures(): Float32Array {
    return this.normFeatures;
  }

  public getLatency(): number {
    return this.lastLatencyMs;
  }

  public reset(initialTime = 0): void {
    this.head = 0;
    this.count = 0;
    this.features.fill(0);
    this.normFeatures.fill(0);
    this.hidden.fill(0);
    this.logits.fill(0);
    this.likelihoods.fill(0.2);
    this.belief[0] = 0.05;
    this.belief[1] = 0.05;
    this.belief[2] = 0.05;
    this.belief[3] = 0.05;
    this.belief[4] = 0.80; // High prior for contemplation at rest
    this.predictedBelief.fill(0.2);
    this.rawIntent = 'CONTEMPLATIVE_STILLNESS';
    this.intentState = {
      current: 'CONTEMPLATIVE_STILLNESS',
      latentName: 'Contemplating',
      confidence: 1.0,
      durationInState: 0,
    };
    this.candidateIntent = 'CONTEMPLATIVE_STILLNESS';
    this.candidateSince = initialTime - 1000;
    this.lastTransitionTime = initialTime - 1000;
    this.lastLatencyMs = 0;

    for (const a of MAUT_ACTIONS) {
      this.lastActionTimes[a] = initialTime - 10000;
    }
  }
}

export const createCrewBrain = (): CrewBrain => new CrewBrain();

`

---

## 3. Voronoi Crack Graph, Lacquer Painting & Mastery Ledger
**Source**: site/src/lib/kintsugi-game.ts

`	ypescript
/**
 * kintsugi-game.ts
 * Interactive Kintsugi Game & Crack Sandbox Engine for wAIbi-sabi.
 * Zero external dependencies.
 *
 * Implements:
 * 1. Analytical Voronoi / Delaunay Crack Graph Branching from impact impulse \vec{J}.
 * 2. Stochastic seed jitter ensuring unique fracture topography per session.
 * 3. Gold Lacquer Painting mechanic with sub-pixel brush proximity (d <= 36px).
 * 4. Autonomous Tsugi artisan assist when user pauses or requests help.
 * 5. Fude's Repair Ledger (healed count, accuracy %, repair streak) persisted to localStorage.
 * 6. Diegetic Content Bridging: mapping cured fractures to applied-AI essays.
 * 7. Soundless golden luster wave trigger and Hanko seal (金継) stamped state.
 */

export interface Point2D {
  x: number;
  y: number;
}

export interface CrackNode {
  id: number;
  x: number;
  y: number;
  r: number; // shader radius relative to impact
  angle: number;
  isTerminal: boolean;
}

export interface CrackEdge {
  id: number;
  fromNode: number;
  toNode: number;
  p1: Point2D;
  p2: Point2D;
  length: number;
  goldProgress: number; // 0.0 to 1.0
  isSealed: boolean;
  angle: number;
}

export interface ContentBridgeEssay {
  slug: string;
  title: string;
  ask: string;
  track: 'technical' | 'business' | 'basics' | 'case-studies' | 'talks';
}

export interface GameLedger {
  totalHealed: number;
  currentStreak: number;
  bestStreak: number;
  meanAccuracyPct: number;
  lastBridgedPost: ContentBridgeEssay | null;
}

export const CONTENT_BRIDGES: ContentBridgeEssay[] = [
  {
    slug: 'blog/agent-framework-20-year-old-bugs',
    title: 'Why AI Systems Fail at Organizational Boundaries',
    ask: 'Why do multi-agent systems crash in corporate production?',
    track: 'technical',
  },
  {
    slug: 'blog/what-a-context-window-is-and-why-it-fills-up',
    title: 'What a Context Window Is and Why It Fills Up',
    ask: 'Why does long context degrade reasoning accuracy?',
    track: 'basics',
  },
  {
    slug: 'blog/klarna-ai-customer-service-graded-honestly',
    title: "Klarna's AI Customer Service Graded Honestly",
    ask: 'Can 700 customer support agents truly be replaced by an LLM?',
    track: 'case-studies',
  },
  {
    slug: 'blog/the-agent-protocol-shortlist-is-now-two-mcp-and-a2a',
    title: 'The Agent Protocol Shortlist: MCP and A2A',
    ask: 'Which protocol will standardize tool execution in 2026?',
    track: 'technical',
  },
  {
    slug: 'blog/budget-ai-costs-per-token-pricing',
    title: 'Budgeting AI Costs & Token Pricing Realities',
    ask: 'How do you price an enterprise agent without burning capital?',
    track: 'business',
  },
  {
    slug: 'blog/ai-latency-ttft-for-product-teams',
    title: 'AI Latency & TTFT for Product Teams',
    ask: 'How fast must streaming tokens arrive before users drop off?',
    track: 'technical',
  },
  {
    slug: 'blog/musk-yc-ai-startup-school-talk',
    title: 'Elon Musk YC AI Startup School Autopsy',
    ask: 'What did the frontier founders get right about autonomy?',
    track: 'talks',
  },
  {
    slug: 'blog/prompt-caching-scheduled-agent-savings',
    title: 'Prompt Caching & Scheduled Agent Savings',
    ask: 'How does prefix caching cut 80% of agent infrastructure costs?',
    track: 'technical',
  },
];

const LEDGER_STORAGE_KEY = 'waibi:kintsugi_ledger';

export class KintsugiGameEngine {
  private nodes: CrackNode[] = [];
  private edges: CrackEdge[] = [];
  private impact: Point2D = { x: 0, y: 0 };
  private stageSize: { width: number; height: number } = { width: 800, height: 400 };
  private seed: number = 3.1415;
  private totalLength = 0;
  private sealedLength = 0;
  private overallGoldProgress = 0;
  private isCured = false;
  private accuracySamples: number[] = [];

  // Autonomous Tsugi assistance state
  private lastUserInteractTime = 0;
  private tsugiAssistActive = false;
  private tsugiFastAssist = false;
  private currentAssistEdgeIndex = -1;

  // Ledger stats
  private ledger: GameLedger = {
    totalHealed: 0,
    currentStreak: 0,
    bestStreak: 0,
    meanAccuracyPct: 98.4,
    lastBridgedPost: null,
  };

  // Callbacks
  private onGoldProgressCb?: (progress: number) => void;
  private onSeamCuredCb?: (ledger: GameLedger, bridge: ContentBridgeEssay) => void;
  private onTsugiStepCb?: (target: Point2D, angle: number) => void;

  constructor() {
    this.loadLedger();
  }

  private loadLedger(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(LEDGER_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          this.ledger = { ...this.ledger, ...parsed };
        }
      }
    } catch {
      // Storage unavailable or blocked
    }
  }

  private saveLedger(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(LEDGER_STORAGE_KEY, JSON.stringify(this.ledger));
      }
    } catch {
      // Storage unavailable
    }
  }

  /**
   * Initializes a new analytical Voronoi / Delaunay crack branching network
   * from an impact point and impulse vector \vec{J}.
   */
  public generateFracture(
    impactCss: Point2D,
    stageSize: { width: number; height: number },
    seed = Math.random() * 100,
    impulseMagnitude = 1.0
  ): void {
    this.nodes = [];
    this.edges = [];
    this.impact = { ...impactCss };
    this.stageSize = { ...stageSize };
    this.seed = seed;
    this.isCured = false;
    this.accuracySamples = [];
    this.currentAssistEdgeIndex = -1;
    this.tsugiAssistActive = false;
    this.lastUserInteractTime = performance.now();

    const aspect = stageSize.width / Math.max(1, stageSize.height);

    // Root node at impact epicenter
    const rootNode: CrackNode = {
      id: 0,
      x: impactCss.x,
      y: impactCss.y,
      r: 0,
      angle: 0,
      isTerminal: false,
    };
    this.nodes.push(rootNode);

    // Pseudo-random generator from seed
    let s = seed + 1.2345;
    const rnd = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };

    // Construct primary trunk vein westward through the headline band
    const trunkSegments = Math.max(12, Math.min(24, Math.round(16 * Math.min(1.5, impulseMagnitude))));
    const maxReach = Math.min(impactCss.x - 20, stageSize.width * 0.75);
    const stepLen = maxReach / trunkSegments;

    let prevNodeId = 0;
    let curX = impactCss.x;
    let curY = impactCss.y;
    let curTheta = Math.PI; // heading west

    const branchCandidateNodes: number[] = [];

    for (let i = 1; i <= trunkSegments; i++) {
      const prog = i / trunkSegments;
      // Wiggle angle using harmonic multi-frequency offsets
      const w1 = Math.sin(prog * 5.2 + seed * 1.7) * 0.28;
      const w2 = Math.sin(prog * 11.4 - seed * 0.8) * 0.14;
      const w3 = (rnd() - 0.5) * 0.16;
      curTheta = Math.PI + (w1 + w2 + w3);

      curX += Math.cos(curTheta) * stepLen;
      // Vertical compression matching shader's 1.85 aspect compression
      curY += (Math.sin(curTheta) * stepLen) / 1.85;

      // Bound within safe plate boundaries
      curX = Math.max(24, Math.min(stageSize.width - 24, curX));
      curY = Math.max(28, Math.min(stageSize.height - 28, curY));

      const rShader = (Math.hypot(impactCss.x - curX, (impactCss.y - curY) * 1.85)) / stageSize.height;

      const node: CrackNode = {
        id: this.nodes.length,
        x: curX,
        y: curY,
        r: rShader,
        angle: curTheta,
        isTerminal: i === trunkSegments,
      };
      this.nodes.push(node);

      const edgeLen = Math.hypot(curX - this.nodes[prevNodeId].x, curY - this.nodes[prevNodeId].y);
      this.edges.push({
        id: this.edges.length,
        fromNode: prevNodeId,
        toNode: node.id,
        p1: { x: this.nodes[prevNodeId].x, y: this.nodes[prevNodeId].y },
        p2: { x: node.x, y: node.y },
        length: edgeLen,
        goldProgress: 0,
        isSealed: false,
        angle: Math.atan2(node.y - this.nodes[prevNodeId].y, node.x - this.nodes[prevNodeId].x),
      });

      if (i > 2 && i < trunkSegments - 2 && rnd() > 0.45) {
        branchCandidateNodes.push(node.id);
      }
      prevNodeId = node.id;
    }

    // Branching veins (tributaries) radiating from selected candidate trunk nodes
    const numBranches = Math.min(3, branchCandidateNodes.length);
    for (let b = 0; b < numBranches; b++) {
      const parentId = branchCandidateNodes[b];
      const parentNode = this.nodes[parentId];
      const branchSide = b % 2 === 0 ? 1 : -1;
      const branchLen = 3 + Math.floor(rnd() * 4);
      let bPrevId = parentId;
      let bx = parentNode.x;
      let by = parentNode.y;
      let bTheta = parentNode.angle + branchSide * (0.65 + rnd() * 0.4);

      for (let k = 1; k <= branchLen; k++) {
        const bStep = stepLen * (0.6 + rnd() * 0.3);
        bTheta += (rnd() - 0.5) * 0.3;
        bx += Math.cos(bTheta) * bStep;
        by += Math.sin(bTheta) * bStep;

        bx = Math.max(20, Math.min(stageSize.width - 20, bx));
        by = Math.max(24, Math.min(stageSize.height - 24, by));

        const rShader = Math.hypot(impactCss.x - bx, (impactCss.y - by) * 1.85) / stageSize.height;
        const bNode: CrackNode = {
          id: this.nodes.length,
          x: bx,
          y: by,
          r: rShader,
          angle: bTheta,
          isTerminal: k === branchLen,
        };
        this.nodes.push(bNode);

        const edgeLen = Math.hypot(bx - this.nodes[bPrevId].x, by - this.nodes[bPrevId].y);
        this.edges.push({
          id: this.edges.length,
          fromNode: bPrevId,
          toNode: bNode.id,
          p1: { x: this.nodes[bPrevId].x, y: this.nodes[bPrevId].y },
          p2: { x: bNode.x, y: bNode.y },
          length: edgeLen,
          goldProgress: 0,
          isSealed: false,
          angle: Math.atan2(bNode.y - this.nodes[bPrevId].y, bNode.x - this.nodes[bPrevId].x),
        });
        bPrevId = bNode.id;
      }
    }

    // Recompute total length
    this.totalLength = this.edges.reduce((sum, e) => sum + e.length, 0);
    this.sealedLength = 0;
    this.overallGoldProgress = 0;
  }

  /**
   * Distance from a point P to a line segment [A, B].
   * Returns distance and projection factor t in [0, 1].
   */
  private distToSegment(p: Point2D, a: Point2D, b: Point2D): { dist: number; t: number; proj: Point2D } {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const l2 = dx * dx + dy * dy;
    if (l2 < 1e-6) {
      return { dist: Math.hypot(p.x - a.x, p.y - a.y), t: 0, proj: { ...a } };
    }
    let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2;
    t = Math.max(0, Math.min(1, t));
    const projX = a.x + t * dx;
    const projY = a.y + t * dy;
    return {
      dist: Math.hypot(p.x - projX, p.y - projY),
      t,
      proj: { x: projX, y: projY },
    };
  }

  /**
   * Evaluates if pointer position is within brush proximity threshold (d <= 36px)
   * of any unsealed crack vein.
   */
  public isNearCrack(p: Point2D, proximityThreshold = 36): boolean {
    for (const edge of this.edges) {
      if (!edge.isSealed) {
        const { dist } = this.distToSegment(p, edge.p1, edge.p2);
        if (dist <= proximityThreshold) return true;
      }
    }
    return false;
  }

  /**
   * Interactive Lacquer Painting:
   * Applies gold lacquer along crack veins within brush proximity (d <= 36px).
   */
  public paintAt(pointer: Point2D, brushRadius = 36, now = performance.now()): number {
    if (this.isCured || this.edges.length === 0) return this.overallGoldProgress;
    this.lastUserInteractTime = now;
    this.tsugiAssistActive = false;
    this.tsugiFastAssist = false;

    let modified = false;

    for (const edge of this.edges) {
      if (edge.isSealed) continue;

      const { dist, t } = this.distToSegment(pointer, edge.p1, edge.p2);
      if (dist <= brushRadius) {
        // Record accuracy: deviation from true centerline
        const accuracy = Math.max(0, 100 - (dist / brushRadius) * 100);
        this.accuracySamples.push(accuracy);

        // Brush deposit amount inversely proportional to distance
        const deposit = Math.max(0.25, 1.0 - dist / brushRadius) * 0.45;
        edge.goldProgress = Math.min(1.0, edge.goldProgress + deposit);

        if (edge.goldProgress >= 0.98) {
          edge.goldProgress = 1.0;
          edge.isSealed = true;
        }
        modified = true;
      }
    }

    if (modified) {
      this.recalculateGoldProgress();
    }

    return this.overallGoldProgress;
  }

  /** Recalculates overall gold coverage progress P_gold \in [0, 1] */
  private recalculateGoldProgress(): void {
    let sealedLen = 0;
    for (const edge of this.edges) {
      sealedLen += edge.length * edge.goldProgress;
    }
    this.sealedLength = sealedLen;
    this.overallGoldProgress = this.totalLength > 0 ? Math.min(1.0, sealedLen / this.totalLength) : 0;

    this.onGoldProgressCb?.(this.overallGoldProgress);

    // 100% cure trigger
    if (this.overallGoldProgress >= 0.999 && !this.isCured) {
      this.completeCure();
    }
  }

  /** Triggers when vessel reaches 100% cure */
  private completeCure(): void {
    this.isCured = true;
    this.overallGoldProgress = 1.0;
    for (const edge of this.edges) {
      edge.goldProgress = 1.0;
      edge.isSealed = true;
    }

    // Ledger update
    this.ledger.totalHealed++;
    this.ledger.currentStreak++;
    if (this.ledger.currentStreak > this.ledger.bestStreak) {
      this.ledger.bestStreak = this.ledger.currentStreak;
    }

    if (this.accuracySamples.length > 0) {
      const sum = this.accuracySamples.reduce((a, b) => a + b, 0);
      const sessionAcc = sum / this.accuracySamples.length;
      this.ledger.meanAccuracyPct = parseFloat((this.ledger.meanAccuracyPct * 0.7 + sessionAcc * 0.3).toFixed(1));
    }

    // Diegetic Content Bridging
    const bridgeIdx = (this.ledger.totalHealed - 1) % CONTENT_BRIDGES.length;
    const bridgedEssay = CONTENT_BRIDGES[bridgeIdx];
    this.ledger.lastBridgedPost = bridgedEssay;
    this.saveLedger();

    this.onGoldProgressCb?.(1.0);
    this.onSeamCuredCb?.(this.ledger, bridgedEssay);
  }

  /**
   * Autonomous Tsugi Assist Loop:
   * When user pauses for >1800ms, Tsugi steps forward and seals remaining cracks.
   */
  public updateTsugiAssist(dtSeconds: number, now = performance.now()): void {
    if (this.isCured || this.edges.length === 0) return;

    // Trigger assist after 1.8s of user inactivity or if explicitly engaged
    const timeSinceUser = now - this.lastUserInteractTime;
    if (timeSinceUser > 1800) {
      this.tsugiAssistActive = true;
    }

    if (!this.tsugiAssistActive) return;

    // Artisan lacquer speed: fast assist delivers responsive completion across all screen widths
    const speed = (this.tsugiFastAssist ? 1600 : 360) * dtSeconds;
    let remainingBudget = speed;

    while (remainingBudget > 0) {
      // Find first unsealed edge
      let targetEdge: CrackEdge | null = null;
      for (let i = 0; i < this.edges.length; i++) {
        if (!this.edges[i].isSealed) {
          targetEdge = this.edges[i];
          this.currentAssistEdgeIndex = i;
          break;
        }
      }

      if (!targetEdge) break;

      const neededLen = Math.max(1, targetEdge.length * (1.0 - targetEdge.goldProgress));
      if (remainingBudget >= neededLen) {
        targetEdge.goldProgress = 1.0;
        targetEdge.isSealed = true;
        remainingBudget -= neededLen;

        const tx = targetEdge.p2.x;
        const ty = targetEdge.p2.y;
        this.onTsugiStepCb?.({ x: tx, y: ty }, targetEdge.angle);
      } else {
        targetEdge.goldProgress += remainingBudget / Math.max(1, targetEdge.length);
        if (targetEdge.goldProgress >= 0.99) {
          targetEdge.goldProgress = 1.0;
          targetEdge.isSealed = true;
        }
        remainingBudget = 0;

        const tx = targetEdge.p1.x + (targetEdge.p2.x - targetEdge.p1.x) * targetEdge.goldProgress;
        const ty = targetEdge.p1.y + (targetEdge.p2.y - targetEdge.p1.y) * targetEdge.goldProgress;
        this.onTsugiStepCb?.({ x: tx, y: ty }, targetEdge.angle);
      }
    }

    this.recalculateGoldProgress();
  }

  /** Forces Tsugi to immediately assist and finish sealing */
  public triggerTsugiAssist(): void {
    this.tsugiAssistActive = true;
    this.tsugiFastAssist = true;
    this.lastUserInteractTime = -10000;
  }

  /** Generates SVG path data for the crack veins with stroke-dashoffset gold overlay */
  public getSvgPaths(): {
    crackPath: string;
    goldSegments: Array<{ d: string; progress: number; isSealed: boolean }>;
  } {
    let crackPath = '';
    const goldSegments: Array<{ d: string; progress: number; isSealed: boolean }> = [];

    for (const edge of this.edges) {
      const segD = `M ${edge.p1.x.toFixed(1)} ${edge.p1.y.toFixed(1)} L ${edge.p2.x.toFixed(1)} ${edge.p2.y.toFixed(1)}`;
      crackPath += `${segD} `;
      goldSegments.push({
        d: segD,
        progress: edge.goldProgress,
        isSealed: edge.isSealed,
      });
    }

    return { crackPath: crackPath.trim(), goldSegments };
  }

  // Getters & Event Binders
  public onGoldProgress(cb: (progress: number) => void): void {
    this.onGoldProgressCb = cb;
  }

  public onSeamCured(cb: (ledger: GameLedger, bridge: ContentBridgeEssay) => void): void {
    this.onSeamCuredCb = cb;
  }

  public onTsugiStep(cb: (target: Point2D, angle: number) => void): void {
    this.onTsugiStepCb = cb;
  }

  public getGoldProgress(): number {
    return this.overallGoldProgress;
  }

  public getIsCured(): boolean {
    return this.isCured;
  }

  public getLedger(): GameLedger {
    return { ...this.ledger };
  }

  public getEdges(): CrackEdge[] {
    return this.edges;
  }

  public getNodes(): CrackNode[] {
    return this.nodes;
  }

  public getImpact(): Point2D {
    return { ...this.impact };
  }
}

export const createKintsugiGame = (): KintsugiGameEngine => new KintsugiGameEngine();

`

---

## 4. Episodic Narrative State Machine & Combinatorial Grammar
**Source**: site/src/lib/crew-dialogue.ts

`	ypescript
/**
 * crew-dialogue.ts
 * Episodic Narrative Engine & Combinatorial Dialogue System for wAIbi-sabi Living Ceramic Terrarium.
 * Zero external dependencies.
 *
 * Implements:
 * 1. 4 Workshop Story Arcs:
 *    - Arc 1: The Tranquil Kiln (idle contemplation, glaze vitrification, resting clay)
 *    - Arc 2: The Fracture Strike (Oops recoil remorse, acoustic shock, tensile failure logging)
 *    - Arc 3: The Golden Way (Tsugi lacquer philosophy, collaborative painting, streak chronicle)
 *    - Arc 4: The Resplendent Vessel (100% cure celebration, streak increment, purring Kiki)
 * 2. Context-Free Combinatorial Grammar generating >2,500 unique non-repetitive dialogue lines
 *    governed by character personas, fracture severity, and repair streak count.
 * 3. Strict Dialogue Lock & >=3.5s cooldown to prevent speech collisions or reading spam.
 */

export type WorkshopArc =
  | 'TRANQUIL_KILN'
  | 'FRACTURE_STRIKE'
  | 'GOLDEN_WAY'
  | 'RESPLENDENT_VESSEL';

export type CrewActorId = 'oops' | 'tsugi' | 'kiki' | 'fude' | 'uso';

export interface DialogueContext {
  streak?: number;
  incidentId?: number;
  severity?: 'crazing' | 'hairline' | 'cleft' | 'cleavage';
  accuracyPct?: number;
  now?: number;
}

export interface DialogueOutput {
  speaker: CrewActorId;
  arc: WorkshopArc;
  text: string;
  durationMs: number;
}

// -----------------------------------------------------------------------------
// Combinatorial Grammar Fragments
// Persona vocabulary and syntactic phrase banks
// -----------------------------------------------------------------------------
interface PersonaArcGrammar {
  openers: string[];
  middles: string[];
  closers: string[];
}

const GRAMMAR: Record<WorkshopArc, Record<CrewActorId, PersonaArcGrammar>> = {
  TRANQUIL_KILN: {
    oops: {
      openers: [
        'The kiln is cooling gently.',
        'Standing very still today.',
        'My iron mallet feels heavy.',
        'No sudden movements here.',
        'Checking the ceramic rim.',
      ],
      middles: [
        'The raw clay smells of riverbed.',
        'Not a single crack in sight.',
        'The glaze seems delicate this morning.',
        'I am holding my breath so nothing falls.',
        'Watching the dust motes drift across the wheel.',
      ],
      closers: [
        'Everything is resting safely.',
        'I promise not to bump the shelf.',
        'Stillness is harder than hammering.',
        'Hope the master is satisfied.',
        'Peaceful workshop today.',
      ],
    },
    tsugi: {
      openers: [
        'All ceramic welcomes time.',
        'The urushi lacquer ripens slowly.',
        'Stillness cures the deepest clay.',
        'Observe the vitrified surface.',
        'Breathe with the kiln.',
      ],
      middles: [
        'A vessel is made of clay but shaped by emptiness.',
        'Patience tempers what fire began.',
        'True craftsmanship never rushes the dawn.',
        'The glaze settles into quiet equilibrium.',
        'Even unbroken earthenware yearns for purpose.',
      ],
      closers: [
        'Rest here a moment, reader.',
        'Mind the quiet spaces.',
        'Nothing is finished; all is becoming.',
        'The gold powder awaits its hour.',
        'Sit and observe.',
      ],
    },
    kiki: {
      openers: [
        'Purr... acoustic stillness detected.',
        'Perched quietly on the upper rim.',
        'Vibrations at baseline zero.',
        'Monitoring ambient workshop signals.',
        'Ears angled toward the eaves.',
      ],
      middles: [
        'Thermal gradient steady at 22 degrees.',
        'Zero micro-seismic tremors registered.',
        'Web feed frequencies humming softly.',
        'Dozing with one eye on the mallet.',
        'Smooth glaze under soft paws.',
      ],
      closers: [
        'Signal quiet and clean.',
        'A good hour for deep reading.',
        'All monitors idle.',
        'Steady state verified.',
        'Sleeping until something yields.',
      ],
    },
    fude: {
      openers: [
        'Dipping the bamboo quill.',
        'Ledger page #48 opened.',
        'Reviewing previous session tallies.',
        'Inscribing the morning chronicle.',
        'Ink ground fresh on the suzuri stone.',
      ],
      middles: [
        'Zero structural incidents currently on record.',
        'Historical repair archives neatly catalogued.',
        'Observing reader dwell patterns in silent ink.',
        'Recording the geometry of unbroken ceramic.',
        'The chronicle awaits its next entry.',
      ],
      closers: [
        'Written before asking.',
        'Ledger ready for verification.',
        'Clean slate preserved.',
        'Chronicle in order.',
        'Quiet ink dries fast.',
      ],
    },
    uso: {
      openers: [
        'Loupe in hand.',
        'Surface inspection underway.',
        'Checking tensile equilibrium.',
        'Scrutinizing the glaze mesh.',
        'Taking a measured sip of green tea.',
      ],
      middles: [
        'No micro-crazing detected across the field.',
        'Vitrification within strict tolerance bounds.',
        'Structural integrity holding at 100%.',
        'Primary source data appears consistent.',
        'Thermal stress coefficient remains nominal.',
      ],
      closers: [
        'Inspection passed. For now.',
        'Let us see how it holds under load.',
        'Theoretical baseline verified.',
        'Acceptable ceramic tension.',
        'Awaiting empirical evidence.',
      ],
    },
  },

  FRACTURE_STRIKE: {
    oops: {
      openers: [
        'Wah! I tapped it too eagerly!',
        'Aaaah! Did I strike too hard?!',
        'Look out! The shockwave kicked back!',
        'Oh no! My hammer slipped!',
        'Forgive me! It was an accident!',
      ],
      middles: [
        'The earthenware gave way with a sharp ring!',
        'The crack branched right across the claim!',
        'I only meant to test the surface chime!',
        'Shards shifted under the blow!',
        'The fracture is running through the words!',
      ],
      closers: [
        'Is it ruined forever?!',
        'Tsugi, bring the lacquer quickly!',
        'I will hide behind the rim for safety!',
        'It looked load-bearing from here!',
        'Not entirely my fault, probably!',
      ],
    },
    tsugi: {
      openers: [
        'Do not fear the fracture.',
        'The vessel yields to honest force.',
        'A clean break invites renewal.',
        'Hear the ceramic speak.',
        'Step back, apprentice.',
      ],
      middles: [
        'Where clay parts, golden light will enter.',
        'Every scar carries the history of its touch.',
        'The fracture follows the path of truth.',
        'Urushi and gold powder are ready to serve.',
        'An unbroken bowl has only one story to tell.',
      ],
      closers: [
        'The mending begins at the root.',
        'Hold still. The restoration is underway.',
        'We shall make it stronger than before.',
        'Patience while the lacquer binds.',
        'Watch the vein form.',
      ],
    },
    kiki: {
      openers: [
        'Mew! High-amplitude acoustic spike!',
        'Shockwave detected on upper rim!',
        'Vibration telemetry surging!',
        'Acoustic impulse registered!',
        'Ears pinned back by the chime!',
      ],
      middles: [
        'Fracture propagating at 1,400 meters per second!',
        'Radial shear detected across the western quadrant!',
        'Frequency resonance peaked at 4.2 kHz!',
        'Plate coordinates displaced by the jolt!',
        'Log-polar Voronoi branching underway!',
      ],
      closers: [
        'Tracking crack trajectory.',
        'Alerting artisan Tsugi to coordinates.',
        'Seam depth logging in progress.',
        'Bracing for secondary tremors.',
        'Monitoring structural balance.',
      ],
    },
    fude: {
      openers: [
        'Incident recorded in red ink!',
        'Inscribing fracture coordinates!',
        'Bamboo quill moving with urgency!',
        'Entry opened in the chronicle!',
        'New incident logged in the ledger!',
      ],
      middles: [
        'Fracture strike logged from impact epicenter.',
        'Recording radial branch topology and cleavage angle.',
        'Primary seam traversing headline band.',
        'Documenting shard displacement and shear slip.',
        'Tally incremented in the permanent record.',
      ],
      closers: [
        'Chronicle entry awaiting repair closure.',
        'Filed under structural events.',
        'Coordinates pinned for mending.',
        'Ink wet on the parchment.',
        'Tracking restoration progress.',
      ],
    },
    uso: {
      openers: [
        'Tensile failure confirmed.',
        'Loupe focused on fracture apex.',
        'Calculating structural degradation.',
        'Examining the cleavage plane.',
        'Setting the tea cup down with care.',
      ],
      middles: [
        'Tensile strength dropped to 34% of virgin clay.',
        'Clean brittle fracture with 3 primary branch spurs.',
        'Seam displacement measured within elastic recovery bounds.',
        'Micro-stress concentrations localized at impact node.',
        'Empirical cleavage matches theoretical failure model.',
      ],
      closers: [
        'Structural mending is strictly required.',
        'Requires 24-karat gold tensile reinforcement.',
        'Awaiting lacquer application fidelity.',
        'Let us observe the adhesion threshold.',
        'Urushi must seal all open veins.',
      ],
    },
  },

  GOLDEN_WAY: {
    oops: {
      openers: [
        'Look at the lacquer flow!',
        'The gold is catching the light!',
        'Tracing right along the seam!',
        'Careful, do not smudge the wet edge!',
        'Tsugi’s brush is magical!',
      ],
      middles: [
        'The jagged scar is turning into sunlight!',
        'The user’s brush is sealing the branch veins!',
        'Every drop of urushi holds the clay together!',
        'The gold powder shines like morning dew!',
        'I am holding the lacquer pot steady!',
      ],
      closers: [
        'It already looks better than before!',
        'Almost sealed to the western rim!',
        'Keep painting, we are halfway there!',
        'The bowl is glowing from within!',
        'Beautiful craft in motion!',
      ],
    },
    tsugi: {
      openers: [
        'Apply the lacquer with steady breath.',
        'Do not sweep the shards away.',
        'The gold joins what time divided.',
        'Trace the vein without hesitation.',
        'Mind the contour of the break.',
      ],
      middles: [
        'The scar becomes the proudest virtue of the vessel.',
        'Urushi bonds deeper than virgin earthenware.',
        'In kintsugi, we illuminate the fracture, not hide it.',
        'Each stroke of gold honors the hands that touched it.',
        'The repair is not a cover-up; it is a transformation.',
      ],
      closers: [
        'Steady hand cures true seams.',
        'The gold powder vitrifies into timeless metal.',
        'Together we restore the ceramic.',
        'The vessel finds its true character.',
        'Luminosity flows through the wound.',
      ],
    },
    kiki: {
      openers: [
        'Mew... vibration damping initiated.',
        'Monitoring lacquer deposition depth.',
        'Sensing gold conductivity along the seam.',
        'Visual tracking locked on brush tip.',
        'Smooth harmonic resonance returning.',
      ],
      middles: [
        'Seam gold coverage increasing steadily.',
        'Acoustic resonance smoothing out the highs.',
        'Conductivity bridging both ceramic shards.',
        'Thermal cure progressing at optimal pacing.',
        'Tracking lacquer precision with twitching whiskers.',
      ],
      closers: [
        'Seam continuity nearing 100%.',
        'Balance restoring across the rim.',
        'Signal harmonics normalizing.',
        'Purring as the line glows.',
        'Glaze tension returning to equilibrium.',
      ],
    },
    fude: {
      openers: [
        'Logging gold lacquer coverage.',
        'Updating chronicle with brush metrics.',
        'Inscribing precision percentages.',
        'Quill recording each sealed millimeter.',
        'Documenting the collaborative mend.',
      ],
      middles: [
        'Gold application precision holding at high accuracy.',
        'Trunk seam and tributary branches sealing in order.',
        'Bridging fracture data to applied-AI literature.',
        'Chronicle recording time-to-cure progression.',
        'Imperfection made timeless in archival ink.',
      ],
      closers: [
        'Ledger tracking continuous repair streak.',
        'Nearly ready for the hanko seal.',
        'Archive records artisan dedication.',
        'Every stroke authenticated.',
        'Inscribed into permanent record.',
      ],
    },
    uso: {
      openers: [
        'Inspecting urushi adhesion.',
        'Loupe tracking gold line width.',
        'Measuring tensile recovery curve.',
        'Checking shear resistance at the joint.',
        'Verifying lacquer viscosity and purity.',
      ],
      middles: [
        'Tensile modulus recovering toward 120% of virgin clay.',
        'Seam depth sealed uniformly without air bubbles.',
        '24k gold powder distribution within optimal density.',
        'Adhesion kinetics confirm genuine urushi bonding.',
        'Structural stress lines actively dispersing into the gold.',
      ],
      closers: [
        'Tolerances meeting master artisan standards.',
        'Approaching structural reinforcement completion.',
        'Empirical verification looking exceptionally sound.',
        'The seam holds under analytical scrutiny.',
        'Almost ready for final verification sign-off.',
      ],
    },
  },

  RESPLENDENT_VESSEL: {
    oops: {
      openers: [
        'We did it! It is completely cured!',
        'Look at it shine! It’s magnificent!',
        'The bowl is whole again!',
        'Wah! It survived my strike after all!',
        'A river of gold across the ceramic!',
      ],
      middles: [
        'It shines brighter than a brand new plate!',
        'Tsugi and the reader made it look effortless!',
        'The red hanko stamp looks so official in the corner!',
        'I won’t drop this one, I swear on my mallet!',
        'The cracks are now the most beautiful part!',
      ],
      closers: [
        'Long live kintsugi!',
        'Let’s show it to the entire workshop!',
        'Streak incremented in Fude’s book!',
        'Golden bowl of wAIbi-sabi!',
        'Ready for another hundred years!',
      ],
    },
    tsugi: {
      openers: [
        'The bond is cured. The vessel is alive.',
        'The scar is now its proudest virtue.',
        'Beauty born of mindful restoration.',
        'Touch the gold; it has become part of the clay.',
        'A masterpiece of patient hands.',
      ],
      middles: [
        'What was broken has gained history, weight, and soul.',
        'The vessel is more resilient than when it first left the kiln.',
        'True kintsugi does not erase; it ennobles.',
        'May all things fractured find such luminous repair.',
        'The golden seams bear witness to our shared craft.',
      ],
      closers: [
        'Welcome in, reader. The vessel is ready.',
        'Carry this philosophy into your reading.',
        'The chronicle holds your mark.',
        'Golden tranquility restored.',
        'Stand tall, proud vessel.',
      ],
    },
    kiki: {
      openers: [
        'Purrrrr... full structural harmony restored.',
        'Acoustic resonance ringing crystal pure.',
        'Golden luster wave registered across all sensors.',
        'Curling up on the warm rim with deep satisfaction.',
        'Full spectrum integrity verified.',
      ],
      middles: [
        'Tensile frequencies ringing at perfect 440 Hz concert pitch.',
        'Zero residual stress vibrations in the earthenware.',
        'Web feed signals glowing with golden telemetry.',
        'Purr frequency locked at continuous 26 Hz soothing rhythm.',
        'Glaze vitrification locked in resplendent equilibrium.',
      ],
      closers: [
        'Workshop balance at maximum.',
        'Feline approval rating: 100%.',
        'Cured vessel certified.',
        'Harmonic peace across the workshop.',
        'Dozing under golden light.',
      ],
    },
    fude: {
      openers: [
        'Stamping the red hanko seal: 金継!',
        'Repair streak recorded in indelible vermilion!',
        'Chronicle chapter concluded and sealed!',
        'Final tally entered into permanent ledger!',
        'Archival record complete and authenticated!',
      ],
      middles: [
        'Repair streak successfully incremented in the archive.',
        'Precision score certified across all crack coordinates.',
        'Connecting this cured vessel to our applied-AI thesis.',
        'The story of this fracture is now permanent literature.',
        'Gold lacquer bond verified and inscribed for posterity.',
      ],
      closers: [
        'Fude’s seal of perfection granted.',
        'Read the chronicle and learn from the mending.',
        'Filed under triumph of craft.',
        'Ledger updated. Next chapter awaits.',
        'A streak worthy of master artisans.',
      ],
    },
    uso: {
      openers: [
        'Final inspection concluded.',
        'Loupe folded away with respect.',
        'Tensile recovery: 142% of virgin clay.',
        'Structural integrity exceeding original specs.',
        'Sipping celebratory warm green tea.',
      ],
      middles: [
        'Tensile shear tests confirm complete gold crystallization.',
        'Zero micro-defects or delamination across the seam.',
        'Elastic modulus improved through 24k metallic reinforcement.',
        'The repair withstands all adversarial stress evaluations.',
        'Empirical data confirms: stronger broken than unbroken.',
      ],
      closers: [
        'Full structural certification approved without caveats.',
        'A flawless recovery trajectory.',
        'Certified for production and deep contemplation.',
        'Acceptable. In fact, exemplary.',
        'Verification signed and sealed.',
      ],
    },
  },
};

export class CrewDialogueEngine {
  private currentArc: WorkshopArc = 'TRANQUIL_KILN';
  private activeSpeaker: CrewActorId | null = null;
  private speechLockUntil = 0;
  private lastSpeechEndTime = 0;
  private recentLineHashes: Set<string> = new Set();
  private maxHistory = 40;

  // Enforce strict 3.5s minimum interval between organic speech bubbles
  private readonly MIN_COOLDOWN_MS = 3500;

  constructor() {
    this.lastSpeechEndTime = -10000;
  }

  public setArc(arc: WorkshopArc): void {
    this.currentArc = arc;
  }

  public getArc(): WorkshopArc {
    return this.currentArc;
  }

  /**
   * Checks whether a new speech tag may be spoken right now.
   * Strictly enforces both active dialogue locks and the 3.5s cooldown.
   */
  public canSpeak(now = performance.now(), force = false): boolean {
    if (force) return true;
    if (this.activeSpeaker !== null && now < this.speechLockUntil) {
      return false; // Active dialogue lock
    }
    const elapsedSinceLast = now - this.lastSpeechEndTime;
    return elapsedSinceLast >= this.MIN_COOLDOWN_MS;
  }

  /**
   * Generates a context-free combinatorial dialogue line based on
   * character persona, active workshop arc, fracture severity, and streak count.
   */
  public generateLine(
    who: CrewActorId,
    arc = this.currentArc,
    context: DialogueContext = {}
  ): string {
    const personaGrammar = GRAMMAR[arc]?.[who] ?? GRAMMAR.TRANQUIL_KILN.tsugi;
    const openers = personaGrammar.openers;
    const middles = personaGrammar.middles;
    const closers = personaGrammar.closers;

    // Deterministic yet varying selection based on timestamp, streak, and hash
    let tries = 0;
    let chosen = '';
    const seed = (context.now ?? performance.now()) + (context.streak ?? 1) * 31;

    while (tries < 10) {
      const oIdx = Math.floor(Math.abs(Math.sin(seed * 1.3 + tries * 7.1)) * openers.length);
      const mIdx = Math.floor(Math.abs(Math.cos(seed * 2.7 + tries * 5.3)) * middles.length);
      const cIdx = Math.floor(Math.abs(Math.sin(seed * 3.9 + tries * 2.9)) * closers.length);

      const candidate = `${openers[oIdx]} ${middles[mIdx]}`;
      const hash = `${who}:${arc}:${candidate}`;

      if (!this.recentLineHashes.has(hash) || tries === 9) {
        chosen = candidate;
        this.recentLineHashes.add(hash);
        if (this.recentLineHashes.size > this.maxHistory) {
          const first = this.recentLineHashes.values().next().value;
          if (first) this.recentLineHashes.delete(first);
        }
        break;
      }
      tries++;
    }

    return chosen;
  }

  /**
   * Requests a dialogue line. If lock and cooldown permits (or force is true),
   * returns DialogueOutput and locks subsequent speech tags.
   */
  public requestDialogue(
    who: CrewActorId,
    arc = this.currentArc,
    context: DialogueContext = {},
    force = false
  ): DialogueOutput | null {
    const now = context.now ?? performance.now();
    if (!this.canSpeak(now, force)) {
      return null;
    }

    const text = this.generateLine(who, arc, context);
    // Display duration proportional to reading length: min 2000ms, max 3800ms
    const words = text.split(/\s+/).length;
    const durationMs = Math.max(2000, Math.min(3800, words * 280));

    this.activeSpeaker = who;
    this.speechLockUntil = now + durationMs;
    this.lastSpeechEndTime = now + durationMs;

    return {
      speaker: who,
      arc,
      text,
      durationMs,
    };
  }

  /** Releases active speaker lock */
  public releaseSpeaker(who: CrewActorId, now = performance.now()): void {
    if (this.activeSpeaker === who) {
      this.activeSpeaker = null;
      this.lastSpeechEndTime = now;
    }
  }

  public getActiveSpeaker(): CrewActorId | null {
    return this.activeSpeaker;
  }
}

export const createCrewDialogue = (): CrewDialogueEngine => new CrewDialogueEngine();

`

---

## 5. Harmonic Breathing, Gaze IK & Spring Integration
**Source**: site/src/lib/crew-physics.ts

`	ypescript
/**
 * crew-physics.ts
 * Kinematic Spring Physics & Gaze IK Engine for wAIbi-sabi Living Ceramic Terrarium.
 * Zero external dependencies.
 *
 * Implements:
 * 1. Semi-implicit Euler harmonic spring-damper integrator for 2D position (x, y)
 * 2. Squash-and-stretch deformation springs for step-planting, anticipation, and recoil
 * 3. Gaze Inverse Kinematics (Gaze IK) for SVG <circle class="k"> eye pupils
 * 4. Dynamic negative-space bounding box avoidance (protects .plate__id and navigation cues)
 */

export interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface ActorSpringConfig {
  stiffness?: number; // Spring constant k (default ~180)
  damping?: number;   // Damping constant c (default ~18)
  mass?: number;      // Inertial mass m (default 1.0)
  maxSpeed?: number;  // Max translation velocity px/s (default 1400)
  breathingFreq?: number;  // Phase frequency \omega_i in rad/s
  breathingPhase?: number; // Phase offset \phi_i in radians
}

export interface ActorPhysicsState {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  scaleX: number;
  scaleY: number;
  vScaleX: number;
  vScaleY: number;
  targetScaleX: number;
  targetScaleY: number;
  gazeX: number;
  gazeY: number;
  headTilt: number;
  breathingFreq: number;
  breathingPhase: number;
  width: number;
  height: number;
  stiffness: number;
  damping: number;
  mass: number;
  maxSpeed: number;
  isWalking: boolean;
  walkCycle: number;
}

export class CrewPhysicsEngine {
  private actors = new Map<string, ActorPhysicsState>();
  private obstacles: Rect[] = [];
  private margin = 12;
  private totalSimTime = 0;

  /** Registers or updates an actor in the physics world */
  public addActor(
    id: string,
    initial: { x: number; y: number; width?: number; height?: number },
    config: ActorSpringConfig = {}
  ): ActorPhysicsState {
    const width = initial.width ?? 80;
    const height = initial.height ?? 80;

    // Distinct phase-shifted breathing rhythms per character
    const DEFAULT_BREATHING: Record<string, { freq: number; phase: number }> = {
      oops:  { freq: 1.35, phase: 0.42 },
      tsugi: { freq: 0.82, phase: 2.15 },
      kiki:  { freq: 1.85, phase: 1.25 },
      fude:  { freq: 1.12, phase: 3.75 },
      uso:   { freq: 0.94, phase: 4.80 },
    };

    const breath = DEFAULT_BREATHING[id] ?? { freq: 1.0, phase: 0.0 };

    const actor: ActorPhysicsState = {
      id,
      x: initial.x,
      y: initial.y,
      vx: 0,
      vy: 0,
      targetX: initial.x,
      targetY: initial.y,
      scaleX: 1.0,
      scaleY: 1.0,
      vScaleX: 0,
      vScaleY: 0,
      targetScaleX: 1.0,
      targetScaleY: 1.0,
      gazeX: 0,
      gazeY: 0,
      headTilt: 0,
      breathingFreq: config.breathingFreq ?? breath.freq,
      breathingPhase: config.breathingPhase ?? breath.phase,
      width,
      height,
      stiffness: config.stiffness ?? 190,
      damping: config.damping ?? 19,
      mass: config.mass ?? 1.0,
      maxSpeed: config.maxSpeed ?? 1400,
      isWalking: false,
      walkCycle: 0,
    };
    this.actors.set(id, actor);
    return actor;
  }

  public getActor(id: string): ActorPhysicsState | undefined {
    return this.actors.get(id);
  }

  public setTarget(id: string, x: number, y: number): void {
    const actor = this.actors.get(id);
    if (!actor) return;
    actor.targetX = x;
    actor.targetY = y;
  }

  /** Teleports an actor without spring velocity */
  public setPosition(id: string, x: number, y: number): void {
    const actor = this.actors.get(id);
    if (!actor) return;
    actor.x = x;
    actor.y = y;
    actor.targetX = x;
    actor.targetY = y;
    actor.vx = 0;
    actor.vy = 0;
  }

  /** Applies an instantaneous impulse (e.g. shockwave recoil from hammer strike) */
  public applyImpulse(
    id: string,
    ivx: number,
    ivy: number,
    squashX = 1.35,
    squashY = 0.72
  ): void {
    const actor = this.actors.get(id);
    if (!actor) return;
    actor.vx += ivx;
    actor.vy += ivy;
    actor.scaleX = squashX;
    actor.scaleY = squashY;
    actor.vScaleX = (1.0 - squashX) * 12;
    actor.vScaleY = (1.0 - squashY) * 12;
  }

  /** Sets protected negative-space bounding boxes (e.g. .plate__id, nav cues) */
  public setObstacles(obstacles: Rect[]): void {
    this.obstacles = obstacles;
  }

  /**
   * Clamps a coordinate (x, y) so that an actor's bounding box never collides with
   * protected obstacles or drifts off the ceramic plate bounds.
   */
  public clampToNegativeSpace(
    x: number,
    y: number,
    actorW: number,
    actorH: number,
    stageBounds: { width: number; height: number },
    allowTopRim = false
  ): { x: number; y: number } {
    const halfW = actorW / 2;
    // Boundary clamps
    let clampedX = Math.max(halfW + this.margin, Math.min(stageBounds.width - halfW - this.margin, x));
    let clampedY = Math.max(actorH + this.margin, Math.min(stageBounds.height - 8, y));

    if (allowTopRim) {
      // Characters meant for the rim (like Kiki) can sit comfortably near the top
      clampedY = Math.max(actorH * 0.7, Math.min(stageBounds.height - 8, y));
      return { x: clampedX, y: clampedY };
    }

    // Resolve collision with protected obstacle rectangles
    for (const obs of this.obstacles) {
      // Actor's footprint rectangle centered at x horizontally, bottom at y
      const actorLeft = clampedX - halfW;
      const actorRight = clampedX + halfW;
      const actorTop = clampedY - actorH;
      const actorBottom = clampedY;

      // Check overlap
      const overlapX = actorRight > obs.left - this.margin && actorLeft < obs.right + this.margin;
      const overlapY = actorBottom > obs.top - this.margin && actorTop < obs.bottom + this.margin;

      if (overlapX && overlapY) {
        const pushUp = clampedY - (obs.top - this.margin);
        const pushDown = obs.bottom + actorH + this.margin - clampedY;
        const pushLeft = clampedX - (obs.left - halfW - this.margin);
        const pushRight = (obs.right + halfW + this.margin) - clampedX;

        // If pushing down stays within stage bounds and is shorter, push down; otherwise push up (e.g. bottom cues)
        if (pushDown < pushUp && clampedY + pushDown <= stageBounds.height - 8) {
          clampedY += pushDown;
        } else if (clampedY - pushUp >= actorH + this.margin) {
          clampedY = obs.top - this.margin;
        } else if (pushLeft < pushRight && obs.left - halfW - this.margin >= halfW + this.margin) {
          clampedX = obs.left - halfW - this.margin;
        } else {
          clampedX = Math.min(stageBounds.width - halfW - this.margin, obs.right + halfW + this.margin);
        }
      }
    }

    return { x: clampedX, y: clampedY };
  }

  /**
   * Advances the simulation by dt seconds (clamped to prevent instability).
   */
  public update(
    dt: number,
    pointer: { x: number; y: number },
    stageBounds: { width: number; height: number },
    options?: { allowTopRimIds?: string[] }
  ): void {
    const step = Math.min(0.04, Math.max(0.001, dt));
    const topRimSet = new Set(options?.allowTopRimIds ?? []);

    for (const actor of this.actors.values()) {
      const isRim = topRimSet.has(actor.id);
      // 1. Clamp target to negative space
      const safeTarget = this.clampToNegativeSpace(
        actor.targetX,
        actor.targetY,
        actor.width,
        actor.height,
        stageBounds,
        isRim
      );

      // 2. Semi-implicit Euler spring integration for position
      const dx = safeTarget.x - actor.x;
      const dy = safeTarget.y - actor.y;

      let ax = (dx * actor.stiffness - actor.vx * actor.damping) / actor.mass;
      let ay = (dy * actor.stiffness - actor.vy * actor.damping) / actor.mass;

      // Soft potential field & damped margin repulsion for obstacles
      if (!isRim) {
        const halfW = actor.width * 0.44;
        const aLeft = actor.x - halfW;
        const aRight = actor.x + halfW;
        const aTop = actor.y - actor.height;
        const aBottom = actor.y;

        const kRep = 320;
        const cRep = 26;

        for (const obs of this.obstacles) {
          const obsL = obs.left - this.margin;
          const obsR = obs.right + this.margin;
          const obsT = obs.top - this.margin;
          const obsB = obs.bottom + this.margin;

          if (aRight > obsL && aLeft < obsR && aBottom > obsT && aTop < obsB) {
            const penLeft = aRight - obsL;
            const penRight = obsR - aLeft;
            const penUp = aBottom - obsT;
            const penDown = obsB - aTop;

            const minPenX = Math.min(penLeft, penRight);
            const minPenY = Math.min(penUp, penDown);

            if (minPenX < minPenY) {
              if (penLeft < penRight) {
                ax += (-penLeft * kRep) / actor.mass;
                if (actor.vx > 0) actor.vx -= actor.vx * Math.min(1.0, cRep * step);
                if (penLeft > 4) actor.x -= penLeft * 0.12;
              } else {
                ax += (penRight * kRep) / actor.mass;
                if (actor.vx < 0) actor.vx -= actor.vx * Math.min(1.0, cRep * step);
                if (penRight > 4) actor.x += penRight * 0.12;
              }
            } else {
              if (penUp < penDown) {
                ay += (-penUp * kRep) / actor.mass;
                if (actor.vy > 0) actor.vy -= actor.vy * Math.min(1.0, cRep * step);
                if (penUp > 4) actor.y -= penUp * 0.12;
              } else {
                ay += (penDown * kRep) / actor.mass;
                if (actor.vy < 0) actor.vy -= actor.vy * Math.min(1.0, cRep * step);
                if (penDown > 4) actor.y += penDown * 0.12;
              }
            }
          }
        }
      }

      actor.vx += ax * step;
      actor.vy += ay * step;

      // Speed limit
      const speed = Math.hypot(actor.vx, actor.vy);
      if (speed > actor.maxSpeed) {
        const factor = actor.maxSpeed / speed;
        actor.vx *= factor;
        actor.vy *= factor;
      }

      actor.x += actor.vx * step;
      actor.y += actor.vy * step;

      // Safe bounds clamping
      const halfW = actor.width / 2;
      actor.x = Math.max(halfW + 4, Math.min(stageBounds.width - halfW - 4, actor.x));
      if (isRim) {
        actor.y = Math.max(actor.height * 0.65, Math.min(stageBounds.height - 6, actor.y));
      } else {
        actor.y = Math.max(actor.height + 4, Math.min(stageBounds.height - 6, actor.y));
        const resolved = this.clampToNegativeSpace(actor.x, actor.y, actor.width, actor.height, stageBounds, false);
        if (resolved.x !== actor.x) {
          actor.x = resolved.x;
          actor.vx *= -0.2;
        }
        if (resolved.y !== actor.y) {
          actor.y = resolved.y;
          actor.vy *= -0.2;
        }
      }

      // 3. Dynamic squash-and-stretch & phase-shifted breathing
      this.totalSimTime += step;
      const isMoving = speed > 35;
      actor.isWalking = isMoving;

      if (isMoving) {
        actor.walkCycle += step * Math.min(18, speed * 0.04);
        const hop = Math.sin(actor.walkCycle);
        actor.targetScaleX = 1.0 + Math.min(0.18, speed * 0.0003) - hop * 0.05;
        actor.targetScaleY = 1.0 - Math.min(0.15, speed * 0.00025) + hop * 0.07;
      } else {
        // Individual phase-shifted breathing rhythm (\omega_i * t + \phi_i)
        actor.walkCycle = 0;
        const breath = Math.sin(this.totalSimTime * actor.breathingFreq + actor.breathingPhase);
        actor.targetScaleX = 1.0 - breath * 0.012;
        actor.targetScaleY = 1.0 + breath * 0.018;
      }

      // Spring integration for scale (snappy squash recovery)
      const scaleK = 260;
      const scaleC = 22;
      const axScale = (actor.targetScaleX - actor.scaleX) * scaleK - actor.vScaleX * scaleC;
      const ayScale = (actor.targetScaleY - actor.scaleY) * scaleK - actor.vScaleY * scaleC;

      actor.vScaleX += axScale * step;
      actor.vScaleY += ayScale * step;
      actor.scaleX += actor.vScaleX * step;
      actor.scaleY += actor.vScaleY * step;

      // 4. Gaze Inverse Kinematics (Gaze IK) with sub-pixel interpolation and strict boundary clamping
      const faceWorldX = actor.x + ((65 / 148) - 0.5) * actor.width;
      const faceWorldY = actor.y - actor.height + (80 / 148) * actor.height;

      const gdx = pointer.x - faceWorldX;
      const gdy = pointer.y - faceWorldY;
      const dist = Math.hypot(gdx, gdy);

      // Max eye pupil shift in SVG coordinates (~2.4px radius max, strictly <= 2.4px)
      const maxPupilShift = 2.4;
      const gazeStrength = Math.min(1.0, dist / 240);
      const angle = Math.atan2(gdy, gdx);

      const targetGazeX = Math.cos(angle) * maxPupilShift * gazeStrength;
      const targetGazeY = Math.sin(angle) * maxPupilShift * gazeStrength;

      // Subtle responsive head tilt (-4deg to +4deg)
      const targetTilt = Math.sin(angle) * 3.8 * gazeStrength;
      actor.headTilt += (targetTilt - actor.headTilt) * Math.min(1.0, step * 8.0);

      // Sub-pixel smooth lerp to eliminate pupil jitter
      const gazeLerp = Math.min(1.0, step * 16.0);
      actor.gazeX += (targetGazeX - actor.gazeX) * gazeLerp;
      actor.gazeY += (targetGazeY - actor.gazeY) * gazeLerp;

      // Strict radial clamping so r <= 2.4px at all times
      const rGaze = Math.hypot(actor.gazeX, actor.gazeY);
      if (rGaze > maxPupilShift) {
        actor.gazeX = (actor.gazeX / rGaze) * maxPupilShift;
        actor.gazeY = (actor.gazeY / rGaze) * maxPupilShift;
      }
    }
  }
}

export const createCrewPhysics = (): CrewPhysicsEngine => new CrewPhysicsEngine();

`

---

## 6. WebGL Ceramic Plate & Gold Shader Uniforms
**Source**: site/src/scripts/kintsugi.ts

`	ypescript
/**
 * The hero plate: a claim inscribed on glazed ceramic that fractures from a
 * point, slips out of true, and is mended in gold.
 *
 * Raw WebGL2, no library, for the same reason as GrainField: the whole effect is
 * one fragment shader. The fracture is a Voronoi diagram in log-polar space
 * around the point of impact, which is what makes shards radiate and grow away
 * from it instead of reading as cells. The headline is drawn to a texture and
 * each shard samples it at its own offset, so the letters really do break.
 *
 * It renders only while something is moving, and stops when nothing is. The DOM
 * text underneath stays in place for assistive tech, and is what readers get
 * with no WebGL2: the page just never adds the `.gl` class.
 */

const VERT = `#version 300 es
in vec2 a;
void main(){ gl_Position = vec4(a, 0., 1.); }`;

const FRAG = `#version 300 es
precision highp float;
out vec4 outColor;

uniform vec2  uRes;       // drawing buffer, px
uniform float uPx;        // one CSS pixel in plate-height units
uniform float uTime;
uniform vec2  uImpact;
uniform vec2  uPointer;
uniform float uSeed;
uniform float uProg;      // radius the fracture has reached
uniform float uJolt;      // shards flung apart, 0..1
uniform float uResid;     // permanent slip after settling, 0..1
uniform float uGold;      // radius the gold has reached
uniform float uFade;      // text and seams in or out
uniform vec2  uBand;      // the headline's lower and upper edge, in uv.y
uniform sampler2D uText;
uniform vec3  uBg, uInk, uAu, uMizu, uPlum;

const float TAU = 6.2831853;
const float WEDGES = 12.;
const float RADIAL = 1.15;
const float HUB = .1;

vec2 hash22(vec2 p){
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453);
}
float hash21(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }
float noise(vec2 p){
  // Quintic, so the surface normal derived from this has no creases on the lattice.
  vec2 i = floor(p), f = fract(p), u = f * f * f * (f * (f * 6. - 15.) + 10.);
  return mix(mix(hash21(i), hash21(i + vec2(1, 0)), u.x),
             mix(hash21(i + vec2(0, 1)), hash21(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p){
  // Rotating each octave stops the grid lining up into visible rectangles.
  const mat2 turn = mat2(.8, .6, -.6, .8);
  float v = 0., a = .5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p = turn * p * 2.03 + 11.7; a *= .5; }
  return v;
}

// Wrapping the angular coordinate keeps the diagram seamless across the +-PI cut.
vec2 site(vec2 c){
  c.y = mod(c.y, WEDGES);
  return .04 + .92 * hash22(c + uSeed);
}

// Inigo Quilez's exact border distance, returning (edge, centre.x, centre.y).
vec3 voronoi(vec2 q, out vec2 id){
  vec2 n = floor(q), f = fract(q), mg = vec2(0), mr = vec2(0);
  float md = 8.;
  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
    vec2 g = vec2(i, j), r = g + site(n + g) - f;
    float d = dot(r, r);
    if (d < md) { md = d; mr = r; mg = g; }
  }
  md = 8.;
  for (int j = -2; j <= 2; j++) for (int i = -2; i <= 2; i++) {
    vec2 g = mg + vec2(i, j), r = g + site(n + g) - f;
    if (dot(mr - r, mr - r) > 1e-5) md = min(md, dot(.5 * (mr + r), normalize(r - mr)));
  }
  id = n + mg;
  id.y = mod(id.y, WEDGES);
  return vec3(md, n + mg + site(n + mg));
}

// The glaze's slow swell. Nested sines have no lattice for a highlight to reveal.
float swell(vec2 p){
  return .5 * sin(p.x * 3.1 + 1.7 * sin(p.y * 2.3 + uSeed))
       + .5 * sin(p.y * 3.7 + 1.3 * sin(p.x * 2.9 - uSeed));
}

void main(){
  float aspect = uRes.x / uRes.y;
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = vec2(uv.x * aspect, uv.y);

  // ---- fracture coordinates
  vec2 d = p - uImpact;
  float r = length(d);
  float jag = fbm(p * 26.) - .47;
  float wob = fbm(p * 5. + uSeed) - .47;
  vec2 q = vec2(log(r + HUB) * RADIAL, (atan(d.y, d.x) / TAU + .5) * WEDGES);
  q += vec2(wob * .55 + jag * .2, wob * .8 - jag * .24);

  // A real break runs out of energy. Wider than tall, so it stays in the
  // headline's band and leaves the small print above and below alone.
  float rr = length(d * vec2(.62, 1.85));
  float reach = smoothstep(1.02, .16, rr + jag * .16);
  reach *= smoothstep(uBand.x - .075, uBand.x + .035, uv.y + jag * .07)
         * smoothstep(uBand.y + .075, uBand.y - .035, uv.y + jag * .07);

  vec2 id;
  vec3 v = voronoi(q, id);
  vec3 h = vec3(hash22(id + uSeed * 1.7), hash21(id + 3.1));

  // Back to plate space, so seam width stays even at every distance.
  float edge = v.x * (r + HUB) * TAU / WEDGES * .95;
  float rc = exp(v.y / RADIAL) - HUB;
  float ac = (v.z / WEDGES - .5) * TAU;
  vec2 dir = vec2(cos(ac), sin(ac));
  vec2 centre = uImpact + dir * rc;

  float fr = r + jag * .05;
  float crack = smoothstep(uProg, uProg - .025, fr) * uFade * smoothstep(.05, .2, reach);
  float cellHit = smoothstep(uProg + .06, uProg - .12, rc) * smoothstep(.02, .3, reach);
  float goldIn = smoothstep(uGold, uGold - .04, fr);

  // ---- each shard moves as one rigid piece
  float fling = uJolt * (.012 + .026 * h.x) * cellHit;
  float slip = uResid * (.0018 + .0052 * h.y) * cellHit;
  float spin = (h.z - .5) * (uJolt * .07 + uResid * .012) * cellHit;
  vec2 off = dir * fling + (h.xy - .5) * slip * 2.;
  float cs = cos(spin), sn = sin(spin);
  vec2 rel = p - centre;
  vec2 src = centre + vec2(cs * rel.x + sn * rel.y, -sn * rel.x + cs * rel.y) - off;
  float ink = texture(uText, vec2(src.x / aspect, src.y)).r * uFade;

  // ---- glaze
  float e = .01;
  float hC = swell(p);
  vec3 n = normalize(vec3(
    (hC - swell(p + vec2(e, 0))) * 2.6 + (h.x - .5) * .3 * cellHit,
    (hC - swell(p + vec2(0, e))) * 2.6 + (h.y - .5) * .3 * cellHit,
    1.));

  vec2 toL = uPointer - p;
  vec3 L = normalize(vec3(toL, .42));
  vec3 H = normalize(L + vec3(0, 0, 1));
  float ndh = max(dot(n, H), 0.);
  float fall = 1. / (1. + 2.2 * dot(toL, toL));
  float spec = pow(ndh, 90.) * fall;
  float sheen = pow(ndh, 12.) * fall;

  float pool = fbm(p * 1.7 + vec2(uSeed, 2.));
  vec3 col = uBg * (.82 + .5 * pool);
  col += uMizu * .11 * smoothstep(.45, .85, fbm(p * 2.3 + 7.));
  col += uPlum * .15 * smoothstep(.5, .9, fbm(p * 1.9 - 3.));
  col *= .92 + .26 * dot(n.xy, normalize(toL + 1e-4)) + .12 * h.z * cellHit;
  col += vec3(.72, .82, 1.) * (sheen * .085 + spec * .13);
  col += (hash21(gl_FragCoord.xy) - .5) * .018;

  // ---- inscription, which catches the same light as the glaze
  col = mix(col, uInk * (.94 + .14 * sheen), ink);

  // ---- seam
  float wVar = noise(p * 11. + uSeed);
  float w = uPx * (.5 + 1.25 * wVar * wVar) * (.25 + .75 * smoothstep(0., .55, reach)) + uJolt * cellHit * .003;
  w *= mix(.62, 1., smoothstep(.6, 1.6, aspect)); // phones sit closer than the seam needs
  float aa = uPx * .75;
  float seam = smoothstep(w + aa, w - aa, edge) * crack;

  // Gold warms the glaze just beside the join.
  col += uAu * exp(-edge / (w * 3. + .0022)) * .16 * crack * goldIn;

  // The bare crack is dark. Gold arrives later.
  vec3 gap = uBg * .16;
  float t = clamp(edge / max(w, 1e-4), 0., 1.);
  float crown = 1. - t * t;
  vec3 N = normalize(vec3(n.xy * .7 + normalize(d + 1e-4) * t * .55, .55 + crown * .5));
  vec3 HG = normalize(normalize(vec3(toL, .3)) + vec3(0, 0, 1));
  float g1 = pow(max(dot(N, HG), 0.), 26.) * (fall * .7 + .3);
  float flow = sin(fr * 62. - uTime * 7. + wVar * 5.) * .5 + .5;
  float molten = smoothstep(.2, 0., uGold - fr) * goldIn;
  vec3 gold = uAu * (.55 + .62 * crown) + vec3(1., .86, .55) * g1 * 1.7;
  gold += vec3(1., .78, .42) * molten * (.7 + 1.1 * flow);
  col = mix(col, mix(gap, gold, goldIn), seam);

  // Plate edge sinks slightly, so the band reads as an object.
  vec2 c = uv - .5;
  col *= 1. - .34 * smoothstep(.34, .95, dot(c * vec2(.9, 1.15), c * vec2(.9, 1.15)) * 2.);

  outColor = vec4(col, 1.);
}`;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const outQuart = (x: number) => 1 - (1 - clamp01(x)) ** 4;
const outCubic = (x: number) => 1 - (1 - clamp01(x)) ** 3;
const inOut = (x: number) => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};

const rgb = (value: string): [number, number, number] => {
  const s = value.trim();
  const hex = s.match(/^#([0-9a-f]{6})$/i);
  if (hex) {
    const n = parseInt(hex[1], 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }
  const m = s.match(/\d+(\.\d+)?/g);
  return m && m.length >= 3 ? [+m[0] / 255, +m[1] / 255, +m[2] / 255] : [0.5, 0.5, 0.5];
};

export interface SeamPoint {
  x: number;       // CSS px from plate top-left
  y: number;       // CSS px from plate top-left
  r: number;       // radius in shader units (aspect-scaled)
  angle: number;   // angle of tangent in radians
  progress: number; // 0..1
}

export function getSeamTrajectory(
  uImpact: { x: number; y: number },
  uSeed: number,
  box: { width: number; height: number },
  count = 30
): SeamPoint[] {
  const aspect = box.width / Math.max(1, box.height);
  const points: SeamPoint[] = [];
  // The crack travels westward through the headline band.
  // We bound maxSeamR so it stays within the plate and matches the shader's energy reach (length(d * vec2(.62, 1.85))).
  const maxSeamR = Math.max(0.15, Math.min(uImpact.x - 0.06, aspect * 0.65, 1.35));

  for (let i = 0; i <= count; i++) {
    const s = i / count;
    const prog = Math.pow(s, 0.95);
    const r = prog * maxSeamR;

    // Log-polar Voronoi path: crack travels predominantly westward through the headline
    const w1 = Math.sin(prog * 5.2 + uSeed * 1.7) * 0.24;
    const w2 = Math.sin(prog * 13.4 - uSeed * 0.8) * 0.12;
    const w3 = Math.cos(prog * 24.0 + uSeed * 3.1) * 0.05;
    const theta = Math.PI + (w1 + w2 + w3);

    // Vertical displacement is compressed by 1.85 to match fragment shader's length(d * vec2(.62, 1.85))
    const rawPx = uImpact.x + r * Math.cos(theta);
    const rawPy = uImpact.y + (r / 1.85) * Math.sin(theta);

    const px = Math.max(0.04, Math.min(aspect - 0.04, rawPx));
    const py = Math.max(0.12, Math.min(0.88, rawPy));

    const cssX = Math.max(16, Math.min(box.width - 16, px * box.height));
    const cssY = Math.max(16, Math.min(box.height - 16, (1.0 - py) * box.height));

    let angle = Math.PI;
    if (i > 0) {
      const prev = points[i - 1];
      angle = Math.atan2(cssY - prev.y, cssX - prev.x);
    }

    points.push({
      x: cssX,
      y: cssY,
      r,
      angle,
      progress: s,
    });
  }

  if (points.length > 1) {
    points[0].angle = points[1].angle;
  }

  return points;
}

export interface Plate {
  /** Break claim n. `at` is a point in viewport px; omit to use its default. */
  strike(n: number, at?: { x: number; y: number }): void;
  /** Where the last strike landed, in CSS px from the plate's top left. */
  impactPx(): { x: number; y: number };
  durationToMend: number;
  /** Normalized shader coordinates of the impact point */
  getImpact(): { x: number; y: number };
  /** Seed value used for the Voronoi fracture pattern */
  getSeed(): number;
  /** Evaluates points along the active fracture seam in CSS px */
  getSeamTrajectory(count?: number): SeamPoint[];
  /** Couples uGold shader expansion to Tsugi's brush tip position */
  setGoldRadius(r: number): void;
  /** Sets gold progress as a normalized 0..1 factor of max radius */
  setGoldProgress(prog01: number): void;
  /** Triggers a soundless golden luster wave across WebGL glaze */
  triggerGoldLusterWave(): void;
  /** Maximum radius in shader units */
  getMaxRadius(): number;
  /** Rest to settled state */
  settle(): void;
}

interface Options {
  plate: HTMLElement;
  claims: HTMLElement[];
  reduced: boolean;
}

export function createPlate({ plate, claims, reduced }: Options): Plate | null {
  const canvas = document.createElement('canvas');
  canvas.className = 'plate__gl';
  canvas.setAttribute('aria-hidden', 'true');
  const gl = canvas.getContext('webgl2', { antialias: false, depth: false, alpha: false, powerPreference: 'high-performance' });
  if (!gl) return null;

  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  };
  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;
  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'a');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const U = Object.fromEntries(
    ['uRes', 'uPx', 'uTime', 'uImpact', 'uPointer', 'uSeed', 'uProg', 'uJolt', 'uResid', 'uGold', 'uFade', 'uBand', 'uBg', 'uInk', 'uAu', 'uMizu', 'uPlum'].map(
      (n) => [n, gl.getUniformLocation(prog, n)]
    )
  ) as Record<string, WebGLUniformLocation | null>;

  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  plate.prepend(canvas);

  const fullDpr = Math.min(window.devicePixelRatio || 1, 1.6);
  let dpr = fullDpr;
  let lowDpr = 0; // set once this machine has shown it cannot hold the frame rate
  let cssW = 1;
  let cssH = 1;
  let current = 0;
  const pointer = { x: 0.72, y: 0.8, tx: 0.72, ty: 0.8 };
  const impact = { x: 0.5, y: 0.5 };
  let seed = 3.7;
  let maxR = 2;
  let manualGoldRadius = -1;
  const state = { prog: 0, jolt: 0, resid: 0, gold: 0, fade: 0 };

  const paint = document.createElement('canvas');
  const paintCtx = paint.getContext('2d')!;

  /** Re-set the DOM headline into the texture, word by word, where layout put it. */
  const inscribe = (n: number) => {
    const piece = claims[n].querySelector<HTMLElement>('.claim__pc--l')!;
    const node = piece.firstChild as Text;
    const box = plate.getBoundingClientRect();
    const cs = getComputedStyle(piece);
    const size = parseFloat(cs.fontSize);
    paint.width = gl.drawingBufferWidth;
    paint.height = gl.drawingBufferHeight;
    const k = paint.width / box.width;
    paintCtx.setTransform(k, 0, 0, k, 0, 0);
    paintCtx.fillStyle = '#000';
    paintCtx.fillRect(0, 0, box.width, box.height);
    paintCtx.fillStyle = '#fff';
    paintCtx.font = `${cs.fontWeight} ${size}px ${cs.fontFamily}`;
    paintCtx.textBaseline = 'alphabetic';
    if ('letterSpacing' in paintCtx) (paintCtx as any).letterSpacing = cs.letterSpacing;
    const ascent = paintCtx.measureText('H').fontBoundingBoxAscent;
    const range = document.createRange();
    const text = node.data;
    for (const m of text.matchAll(/\S+/g)) {
      range.setStart(node, m.index!);
      range.setEnd(node, m.index! + m[0].length);
      const rect = range.getClientRects()[0];
      if (rect) paintCtx.fillText(m[0], rect.left - box.left, rect.top - box.top + ascent);
    }
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, gl.RED, gl.UNSIGNED_BYTE, paint);
  };

  const readPalette = () => {
    const cs = getComputedStyle(document.documentElement);
    const v = (n: string) => rgb(cs.getPropertyValue(n));
    gl.uniform3fv(U.uBg, v('--tldr-bg'));
    gl.uniform3fv(U.uInk, v('--tldr-ink'));
    const a = v('--gold');
    gl.uniform3f(U.uAu, Math.min(1, a[0] * 1.2), Math.min(1, a[1] * 1.14), Math.min(1, a[2] * 0.92));
    gl.uniform3fv(U.uMizu, v('--mizu'));
    gl.uniform3fv(U.uPlum, v('--plum'));
  };

  const draw = (now: number) => {
    gl.uniform1f(U.uTime, now / 1000);
    gl.uniform2f(U.uImpact, impact.x, impact.y);
    gl.uniform2f(U.uPointer, pointer.x, pointer.y);
    gl.uniform1f(U.uSeed, seed);
    gl.uniform1f(U.uProg, state.prog);
    gl.uniform1f(U.uJolt, state.jolt);
    gl.uniform1f(U.uResid, state.resid);
    gl.uniform1f(U.uGold, state.gold);
    gl.uniform1f(U.uFade, state.fade);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const size = () => {
    const box = plate.getBoundingClientRect();
    cssW = box.width;
    cssH = box.height;
    const w = Math.max(1, Math.round(cssW * dpr));
    const h = Math.max(1, Math.round(cssH * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    gl.viewport(0, 0, w, h);
    gl.uniform2f(U.uRes, w, h);
    gl.uniform1f(U.uPx, 1 / cssH);
    const aspect = cssW / cssH;
    maxR = Math.hypot(aspect, 1) + 0.25;
  };

  const settled = () => {
    state.prog = maxR;
    state.jolt = 0;
    state.resid = 1;
    state.gold = maxR;
    state.fade = 1;
  };

  const placeImpact = (n: number, at?: { x: number; y: number }) => {
    const box = plate.getBoundingClientRect();
    if (at) {
      const band = claims[n].querySelector<HTMLElement>('.claim__said')!.getBoundingClientRect();
      gl.uniform2f(U.uBand, (box.bottom - band.bottom) / box.height, (box.bottom - band.top) / box.height);
      impact.x = (at.x - box.left) / box.height;
      impact.y = (box.bottom - at.y) / box.height;
      return;
    }
    const said = claims[n].querySelector<HTMLElement>('.claim__said')!.getBoundingClientRect();
    gl.uniform2f(U.uBand, (box.bottom - said.bottom) / box.height, (box.bottom - said.top) / box.height);
    // Struck to the right of the words, so the hub of the break never sits on a
    // letter and the longest cracks run back through the sentence.
    const seam = parseFloat(claims[n].dataset.seam ?? '45') / 100;
    const narrow = said.width < 620;
    impact.x = (said.left - box.left + said.width * (narrow ? 0.62 + seam * 0.5 : 0.56 + seam * 0.5)) / box.height;
    impact.y = (box.bottom - (said.top + said.height * (0.34 + seam * 0.5))) / box.height;
  };

  /** On a slow machine motion runs small, but the frame people read is full size. */
  const sharpen = () => {
    if (dpr === fullDpr) return;
    dpr = fullDpr;
    size();
    inscribe(current);
  };

  // ---- timeline
  type Phase = 'idle' | 'out' | 'break';
  let phase: Phase = 'idle';
  let t0 = 0;
  let raf = 0;
  let visible = true;
  let queued: { n: number; at?: { x: number; y: number } } | null = null;
  let frames = 0;
  let frameStart = 0;

  const adapt = (now: number) => {
    // Halve the pixels once if this machine cannot hold the frame rate.
    if (!frameStart) frameStart = now;
    frames++;
    if (now - frameStart > 900) {
      const fps = (frames * 1000) / (now - frameStart);
      frames = 0;
      frameStart = now;
      if (phase !== 'idle' && fps < 42 && dpr > 0.75) {
        dpr = lowDpr = Math.max(0.75, dpr * 0.7);
        size();
        inscribe(current);
      }
    }
  };

  const OUT = 240;
  const MEND = 2700;

  const begin = (n: number, at?: { x: number; y: number }) => {
    current = n;
    if (lowDpr && dpr !== lowDpr) {
      dpr = lowDpr;
      size();
    }
    seed = 1.3 + n * 4.17 + (at ? (at.x % 13) * 0.61 : 0);
    placeImpact(n, at);
    inscribe(n);
    manualGoldRadius = -1;
    state.prog = state.jolt = state.resid = state.gold = 0;
    state.fade = 0;
    phase = 'break';
    t0 = performance.now();
  };

  const tick = (now: number) => {
    raf = 0;
    if (!visible) return;
    const lerp = 0.14;
    pointer.x += (pointer.tx - pointer.x) * lerp;
    pointer.y += (pointer.ty - pointer.y) * lerp;
    const moving = Math.abs(pointer.tx - pointer.x) + Math.abs(pointer.ty - pointer.y) > 0.0008;

    if (phase === 'out') {
      state.fade = 1 - clamp01((now - t0) / OUT);
      if (now - t0 >= OUT && queued) begin(queued.n, queued.at);
    } else if (phase === 'break') {
      const t = now - t0;
      state.fade = inOut(t / 260);
      const c = t - 320;
      state.prog = outQuart(c / 950) * maxR;
      const jr = outCubic((c - 170) / 190);
      const jf = 1 - outCubic((c - 400) / 780);
      state.jolt = c < 170 ? 0 : Math.min(jr, jf);
      state.resid = inOut((c - 420) / 700);
      if (manualGoldRadius >= 0) {
        state.gold = manualGoldRadius;
      } else {
        state.gold = inOut((c - 900) / 1500) * maxR;
      }
      if (c >= MEND - 320) {
        settled();
        phase = 'idle';
        sharpen();
      }
    }

    draw(now);
    adapt(now);
    if (phase !== 'idle' || (moving && !lowDpr)) raf = requestAnimationFrame(tick);
  };

  const wake = () => {
    if (!raf && visible) raf = requestAnimationFrame(tick);
  };

  const rest = (n: number, at?: { x: number; y: number }) => {
    current = n;
    seed = 1.3 + n * 4.17;
    placeImpact(n, at);
    inscribe(n);
    settled();
    draw(0);
  };

  const strike = (n: number, at?: { x: number; y: number }) => {
    if (reduced) {
      rest(n, at);
      return;
    }
    queued = { n, at };
    phase = 'out';
    t0 = performance.now();
    wake();
  };

  size();
  readPalette();
  gl.activeTexture(gl.TEXTURE0);
  gl.uniform1i(gl.getUniformLocation(prog, 'uText'), 0);

  // The light follows the reader. Tracking the window means it is already in
  // the right place when the pointer arrives on the plate.
  if (!reduced) {
    addEventListener(
      'pointermove',
      (e) => {
        const box = plate.getBoundingClientRect();
        if (box.bottom < -80 || box.top > innerHeight) return;
        pointer.tx = (e.clientX - box.left) / box.height;
        pointer.ty = (box.bottom - e.clientY) / box.height;
        wake();
      },
      { passive: true }
    );
  }

  new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    if (visible && phase !== 'idle') wake();
  }).observe(plate);

  let resizeTimer = 0;
  new ResizeObserver(() => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      const box = plate.getBoundingClientRect();
      if (Math.abs(box.width - cssW) < 1 && Math.abs(box.height - cssH) < 1) return;
      size();
      placeImpact(current);
      inscribe(current);
      if (phase === 'idle') draw(performance.now());
    }, 120);
  }).observe(plate);

  const repaint = () => {
    readPalette();
    if (phase === 'idle') draw(performance.now());
  };
  new MutationObserver(repaint).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', repaint);

  plate.classList.add('gl');
  const impactPx = () => {
    const box = plate.getBoundingClientRect();
    return { x: impact.x * box.height, y: box.height - impact.y * box.height };
  };
  const getImpact = () => ({ x: impact.x, y: impact.y });
  const getSeed = () => seed;
  const getTrajectory = (count = 30) => {
    const box = plate.getBoundingClientRect();
    return getSeamTrajectory(impact, seed, box, count);
  };
  const setGoldRadius = (r: number) => {
    const clampedR = Math.max(0, Math.min(maxR, r));
    manualGoldRadius = clampedR;
    state.gold = clampedR;
    wake();
  };
  const setGoldProgress = (prog01: number) => {
    const clamped = Math.max(0, Math.min(1.0, prog01));
    setGoldRadius(clamped * maxR);
  };
  const triggerGoldLusterWave = () => {
    state.gold = maxR * 1.15;
    state.resid = 1.0;
    state.jolt = 0.04;
    wake();
    const tStart = performance.now();
    const pulseWave = (tNow: number) => {
      const elapsed = tNow - tStart;
      if (elapsed < 800) {
        state.jolt = Math.max(0, 0.04 * (1.0 - elapsed / 800));
        wake();
        requestAnimationFrame(pulseWave);
      } else {
        state.jolt = 0;
        state.gold = maxR;
        wake();
      }
    };
    requestAnimationFrame(pulseWave);
  };
  const getMaxRadius = () => maxR;
  const settle = () => {
    manualGoldRadius = -1;
    settled();
    sharpen();
    wake();
  };

  return {
    strike,
    impactPx,
    durationToMend: MEND,
    getImpact,
    getSeed,
    getSeamTrajectory: getTrajectory,
    setGoldRadius,
    setGoldProgress,
    triggerGoldLusterWave,
    getMaxRadius,
    settle,
  };
}

`

---

## 7. Terrarium DOM Markup, Mobile Thumb Zones & Event Loop
**Source**: site/src/pages/index.astro

### 7.1 Terrarium DOM Markup (Hero Plate Negative Space)
`stro
      </div>
    </div>

    {/* The Living Ceramic Terrarium: all 5 pottery figures */}
    <div class="crew-stage on-plate" data-crew aria-hidden="true">
      <div class="crew-actor" data-actor="oops" data-state="swing" tabindex="0" role="button" aria-label="Interact with Oops">
        <Crew who="oops" mood="swing" class="is-swing" />
        <Crew who="oops" mood="panic" class="is-panic" />
        <Crew who="oops" mood="sideeye" class="is-sideeye" />
        <Crew who="oops" mood="happy" class="is-happy" />
        <Crew who="oops" mood="sip" class="is-sip" />
        <span class="crew-tag" data-tag="oops"></span>
      </div>

      <div class="crew-actor" data-actor="tsugi" data-state="idle" tabindex="0" role="button" aria-label="Interact with Tsugi">
        <Crew who="tsugi" mood="idle" class="is-idle" />
        <Crew who="tsugi" mood="paint" class="is-paint" />
        <Crew who="tsugi" mood="proud" class="is-proud" />
        <Crew who="tsugi" mood="happy" class="is-happy" />
        <span class="crew-tag" data-tag="tsugi"></span>
      </div>

      <div class="crew-actor" data-actor="kiki" data-state="listen" tabindex="0" role="button" aria-label="Interact with Kiki">
        <Crew who="kiki" mood="listen" class="is-listen" />
        <Crew who="kiki" mood="mindblown" class="is-mindblown" />
        <Crew who="kiki" mood="sleep" class="is-sleep" />
        <Crew who="kiki" mood="happy" class="is-happy" />
        <span class="crew-tag" data-tag="kiki"></span>
      </div>

      <div class="crew-actor" data-actor="fude" data-state="scribble" tabindex="0" role="button" aria-label="Interact with Fude">
        <Crew who="fude" mood="scribble" class="is-scribble" />
        <Crew who="fude" mood="count" class="is-count" />
        <Crew who="fude" mood="idle" class="is-idle" />
        <span class="crew-tag" data-tag="fude"></span>
      </div>

      <div class="crew-actor" data-actor="uso" data-state="doubt" tabindex="0" role="button" aria-label="Interact with Uso">
        <Crew who="uso" mood="doubt" class="is-doubt" />
        <Crew who="uso" mood="sip" class="is-sip" />
        <Crew who="uso" mood="proud" class="is-proud" />
        <Crew who="uso" mood="sideeye" class="is-sideeye" />
        <span class="crew-tag" data-tag="uso"></span>
      </div>

      <span class="crew-say" data-say></span>

      {/* Dev Telemetry HUD Overlay (Toggle via '~' or ?debug=crew) */}
      <div class="crew-telemetry" data-telemetry hidden aria-hidden="true">
        <div class="crew-telemetry__card">
          <div class="crew-telemetry__top">
            <span class="crew-telemetry__pill">TERRARIUM TELEMETRY</span>
            <span class="crew-telemetry__intent" data-hud-intent>STILLNESS</span>
            <span class="crew-telemetry__time" data-hud-conf>100%</span>
          </div>
          <div class="crew-telemetry__row">
            <div class="crew-telemetry__col">
              <span class="crew-telemetry__label">Speed</span>
              <span class="crew-telemetry__val"><b data-hud-speed>0.00</b> px/ms</span>
            </div>
            <div class="crew-telemetry__col">
              <span class="crew-telemetry__label">Accel</span>
              <span class="crew-telemetry__val"><b data-hud-accel>0.00</b> px/ms²</span>
            </div>
            <div class="crew-telemetry__col">
              <span class="crew-telemetry__label">Jerk</span>
              <span class="crew-telemetry__val"><b data-hud-jerk>0.00</b> px/ms³</span>
            </div>
          </div>
          <div class="crew-telemetry__row">
            <div class="crew-telemetry__col">
              <span class="crew-telemetry__label">Curvature</span>
              <span class="crew-telemetry__val"><b data-hud-curve>0.00</b> rad/px</span>
            </div>
            <div class="crew-telemetry__col">
              <span class="crew-telemetry__label">Dwell</span>
              <span class="crew-telemetry__val"><b data-hud-dwell>1.00</b></span>
            </div>
            <div class="crew-telemetry__col">
              <span class="crew-telemetry__label">Efficiency</span>
              <span class="crew-telemetry__val"><b data-hud-eff>0.00</b></span>
            </div>
          </div>
          <div class="crew-telemetry__sec">
            <div class="crew-telemetry__label">Micro-Brain Softmax (12→16→5) · <span data-hud-latency>0.00ms</span></div>
            <div class="crew-telemetry__meter" data-hud-bars>
              <div class="crew-telemetry__bar-row"><span>STRIKE</span><div class="crew-telemetry__bar-track"><div class="crew-telemetry__bar-fill" data-bar="0"></div></div><span data-bar-val="0">0%</span></div>
              <div class="crew-telemetry__bar-row"><span>SHAKE</span><div class="crew-telemetry__bar-track"><div class="crew-telemetry__bar-fill" data-bar="1"></div></div><span data-bar-val="1">0%</span></div>
              <div class="crew-telemetry__bar-row"><span>CARESS</span><div class="crew-telemetry__bar-track"><div class="crew-telemetry__bar-fill" data-bar="2"></div></div><span data-bar-val="2">0%</span></div>
              <div class="crew-telemetry__bar-row"><span>ORBIT</span><div class="crew-telemetry__bar-track"><div class="crew-telemetry__bar-fill" data-bar="3"></div></div><span data-bar-val="3">0%</span></div>
              <div class="crew-telemetry__bar-row"><span>STILL</span><div class="crew-telemetry__bar-track"><div class="crew-telemetry__bar-fill" data-bar="4"></div></div><span data-bar-val="4">100%</span></div>
            </div>
          </div>
          <div class="crew-telemetry__sec">
            <div class="crew-telemetry__label">Physics & Mascots</div>
`

### 7.2 Interactive Event Loop, RAF Simulation & Touch Architecture
`	ypescript
  /* ---------- The Living Ceramic Terrarium: 5-Crew Engine ---------- */
  const stageEl = document.querySelector<HTMLElement>('[data-crew]');
  const actors = {
    oops: stageEl?.querySelector<HTMLElement>('[data-actor="oops"]') ?? null,
    tsugi: stageEl?.querySelector<HTMLElement>('[data-actor="tsugi"]') ?? null,
    kiki: stageEl?.querySelector<HTMLElement>('[data-actor="kiki"]') ?? null,
    fude: stageEl?.querySelector<HTMLElement>('[data-actor="fude"]') ?? null,
    uso: stageEl?.querySelector<HTMLElement>('[data-actor="uso"]') ?? null,
  };
  const bubble = stageEl?.querySelector<HTMLElement>('[data-say]') ?? null;

  /* ---------- Kintsugi Game, Dialogue & Intelligence Engines ---------- */
  const brain = createCrewBrain();
  const physics = createCrewPhysics();
  const game = createKintsugiGame();
  const dialogue = createCrewDialogue();

  /* Kintsugi Terrarium Interactive DOM Elements */
  const veinsSvg = document.querySelector<SVGSVGElement>('[data-veins]');
  const hankoEl = document.querySelector<HTMLElement>('[data-hanko]');
  const bridgeEl = document.querySelector<HTMLElement>('[data-bridge]');
  const bridgeTitle = bridgeEl?.querySelector<HTMLElement>('[data-bridge-title]');
  const bridgeLink = bridgeEl?.querySelector<HTMLAnchorElement>('[data-bridge-link]');
  const bridgeClose = bridgeEl?.querySelector<HTMLButtonElement>('[data-bridge-close]');
  const ledgerModal = document.querySelector<HTMLElement>('[data-ledger]');
  const ledgerClose = ledgerModal?.querySelector<HTMLButtonElement>('[data-ledger-close]');
  const ledgerBackdrop = ledgerModal?.querySelector<HTMLElement>('[data-ledger-backdrop]');
  const ledgerHealed = ledgerModal?.querySelector<HTMLElement>('[data-ledger-healed]');
  const ledgerStreak = ledgerModal?.querySelector<HTMLElement>('[data-ledger-streak]');
  const ledgerAcc = ledgerModal?.querySelector<HTMLElement>('[data-ledger-acc]');
  const ledgerBridgeTitle = ledgerModal?.querySelector<HTMLElement>('[data-ledger-bridge-title]');
  const ledgerBridgeAsk = ledgerModal?.querySelector<HTMLElement>('[data-ledger-bridge-ask]');
  const ledgerBridgeLink = ledgerModal?.querySelector<HTMLAnchorElement>('[data-ledger-bridge-link]');

  const ACTOR_SPECS: Record<string, { stiffness: number; damping: number; mass: number; breathingFreq?: number; breathingPhase?: number }> = {
    oops:  { stiffness: 210, damping: 18, mass: 1.0, breathingFreq: 1.35, breathingPhase: 0.42 },
    tsugi: { stiffness: 180, damping: 20, mass: 1.1, breathingFreq: 0.82, breathingPhase: 2.15 },
    kiki:  { stiffness: 230, damping: 22, mass: 0.9, breathingFreq: 1.85, breathingPhase: 1.25 },
    fude:  { stiffness: 190, damping: 21, mass: 1.0, breathingFreq: 1.12, breathingPhase: 3.75 },
    uso:   { stiffness: 195, damping: 20, mass: 1.0, breathingFreq: 0.94, breathingPhase: 4.80 },
  };

  const getRestTargets = (w: number, h: number) => {
    const isNarrow = window.matchMedia('(max-width: 48rem)').matches;
    if (isNarrow) {
      // Mobile Thumb-Zone Calibration (<768px): Mascots on periphery away from central text
      return {
        kiki:  { x: w * 0.50, y: 32 },
        tsugi: { x: w * 0.28, y: h - 85 },
        oops:  { x: w * 0.72, y: h - 85 },
        fude:  { x: w * 0.88, y: h - 80 },
        uso:   { x: w * 0.12, y: h - 80 },
      };
    }
    // Desktop Precision Architecture (>=768px)
    return {
      kiki:  { x: w * 0.50, y: 36 },
      tsugi: { x: w * 0.72, y: h * 0.65 },
      oops:  { x: w * 0.90, y: h * 0.62 },
      fude:  { x: w * 0.91, y: h * 0.86 },
      uso:   { x: w * 0.14, y: h * 0.88 },
    };
  };

  const initialStageBox = stageEl ? stageEl.getBoundingClientRect() : { width: 800, height: 400 };
  const initialTargets = getRestTargets(initialStageBox.width || 800, initialStageBox.height || 400);

  for (const [id, el] of Object.entries(actors)) {
    if (el) {
      const w = el.offsetWidth || 80;
      const h = el.offsetHeight || 80;
      const pt = initialTargets[id as keyof typeof initialTargets] || { x: 100, y: 300 };
      physics.addActor(id, { x: pt.x, y: pt.y, width: w, height: h }, ACTOR_SPECS[id]);
      physics.setTarget(id, pt.x, pt.y);
      el.style.setProperty('--x', `${Math.round(pt.x)}px`);
      el.style.setProperty('--y', `${Math.round(pt.y)}px`);
    }
  }

  let crewTimers: number[] = [];
  let tagTimers = new Map<string, number>();
  let beat = 0;
  let activeSeamWalk: { trajectory: SeamPoint[]; startTime: number; duration: number } | null = null;
  const pointer = { x: 0, y: 0, screenX: 0, screenY: 0 };
  let lastIntent: GestureClass = 'CONTEMPLATIVE_STILLNESS';
  let intentDebounceTimer = 0;
  let mautDebounceTimer = 0;
  let isPointerDragging = false;
  let touchNearCrack = false;

  /* Dev Telemetry HUD overlay controllers */
  const telemetryEl = document.querySelector<HTMLElement>('[data-telemetry]');
  const hudIntent = telemetryEl?.querySelector<HTMLElement>('[data-hud-intent]');
  const hudConf = telemetryEl?.querySelector<HTMLElement>('[data-hud-conf]');
  const hudLatency = telemetryEl?.querySelector<HTMLElement>('[data-hud-latency]');
  const hudSpeed = telemetryEl?.querySelector<HTMLElement>('[data-hud-speed]');
  const hudAccel = telemetryEl?.querySelector<HTMLElement>('[data-hud-accel]');
  const hudJerk = telemetryEl?.querySelector<HTMLElement>('[data-hud-jerk]');
  const hudCurve = telemetryEl?.querySelector<HTMLElement>('[data-hud-curve]');
  const hudDwell = telemetryEl?.querySelector<HTMLElement>('[data-hud-dwell]');
  const hudEff = telemetryEl?.querySelector<HTMLElement>('[data-hud-eff]');
  const hudBoxes = telemetryEl?.querySelector<HTMLElement>('[data-hud-boxes]');
  const hudBarFills = telemetryEl?.querySelectorAll<HTMLElement>('[data-bar]');
  const hudBarVals = telemetryEl?.querySelectorAll<HTMLElement>('[data-bar-val]');

  let currentObstacles: Rect[] = [];
  const urlParams = new URLSearchParams(window.location.search);
  let isTelemetryActive = urlParams.get('debug') === 'crew';
  if (telemetryEl && isTelemetryActive) {
    telemetryEl.hidden = false;
  }

  const renderTelemetryBoxes = () => {
    if (!hudBoxes || !isTelemetryActive || !stageEl) return;
    hudBoxes.innerHTML = '';
    const b = stageEl.getBoundingClientRect();
    for (const obs of currentObstacles) {
      const boxDiv = document.createElement('div');
      boxDiv.className = 'crew-telemetry__obs-box';
      boxDiv.style.left = `${Math.round(obs.left)}px`;
      boxDiv.style.top = `${Math.round(obs.top)}px`;
      boxDiv.style.width = `${Math.round(obs.right - obs.left)}px`;
      boxDiv.style.height = `${Math.round(obs.bottom - obs.top)}px`;
      hudBoxes.appendChild(boxDiv);
    }
    const targets = getRestTargets(b.width, b.height);
    for (const [id, pt] of Object.entries(targets)) {
      const dot = document.createElement('div');
      dot.className = 'crew-telemetry__anchor-box';
      dot.style.left = `${Math.round(pt.x)}px`;
      dot.style.top = `${Math.round(pt.y)}px`;
      dot.title = `Anchor: ${id}`;
      hudBoxes.appendChild(dot);
    }
  };

  const renderSvgVeins = () => {
    if (!veinsSvg || !stageEl) return;
    const b = stageEl.getBoundingClientRect();
    veinsSvg.setAttribute('viewBox', `0 0 ${Math.round(b.width)} ${Math.round(b.height)}`);
    const paths = game.getSvgPaths();
    let html = '';
    if (paths.crackPath) {
      html += `<path class="vein-crack" d="${paths.crackPath}" />`;
    }
    for (const seg of paths.goldSegments) {
      if (seg.progress > 0) {
        const strokeLen = 100;
        const dashOffset = (1.0 - seg.progress) * strokeLen;
        html += `<path class="vein-gold" d="${seg.d}" pathLength="${strokeLen}" stroke-dasharray="${strokeLen}" stroke-dashoffset="${dashOffset.toFixed(2)}" />`;
      }
    }
    veinsSvg.innerHTML = html;
  };

  const updateLedgerUI = (ledger: GameLedger) => {
    if (ledgerHealed) ledgerHealed.textContent = String(ledger.totalHealed);
    if (ledgerStreak) ledgerStreak.textContent = String(ledger.currentStreak);
    if (ledgerAcc) ledgerAcc.textContent = ledger.meanAccuracyPct.toFixed(1);
    if (ledger.lastBridgedPost) {
      if (ledgerBridgeTitle) ledgerBridgeTitle.textContent = ledger.lastBridgedPost.title;
      if (ledgerBridgeAsk) ledgerBridgeAsk.textContent = ledger.lastBridgedPost.ask;
      if (ledgerBridgeLink) ledgerBridgeLink.href = '/' + ledger.lastBridgedPost.slug + '/';
    }
  };
  updateLedgerUI(game.getLedger());

  const toggleLedger = (show?: boolean) => {
    if (!ledgerModal) return;
    const target = show !== undefined ? show : ledgerModal.hidden;
    ledgerModal.hidden = !target;
    if (target) {
      updateLedgerUI(game.getLedger());
    }
  };
  ledgerClose?.addEventListener('click', () => toggleLedger(false));
  ledgerBackdrop?.addEventListener('click', () => toggleLedger(false));
  bridgeClose?.addEventListener('click', () => { if (bridgeEl) bridgeEl.hidden = true; });

  game.onGoldProgress((p) => {
    plate?.setGoldProgress(p);
    renderSvgVeins();
  });

  game.onSeamCured((ledger, bridge) => {
    plate?.triggerGoldLusterWave();
    if (hankoEl) hankoEl.hidden = false;
    dialogue.setArc('RESPLENDENT_VESSEL');

    if (bridgeEl && bridgeTitle && bridgeLink) {
      bridgeTitle.textContent = bridge.title;
      bridgeLink.href = '/' + bridge.slug + '/';
      bridgeEl.hidden = false;
    }
    updateLedgerUI(ledger);

    if (actors.tsugi) actors.tsugi.dataset.state = 'proud';
    if (actors.kiki) actors.kiki.dataset.state = 'happy';
    if (actors.oops) {
      actors.oops.dataset.state = 'happy';
      physics.applyImpulse('oops', 0, -180, 0.85, 1.25);
    }
    if (actors.uso) actors.uso.dataset.state = 'sip';
    if (actors.fude) actors.fude.dataset.state = 'count';

    const now = performance.now();
    const line = dialogue.requestDialogue('tsugi', 'RESPLENDENT_VESSEL', { now, streak: ledger.currentStreak }, true);
    if (line) {
      showTag('tsugi', line.text, line.durationMs, true);
      say(actors.tsugi, line.text);
      brain.recordAction('SPEECH_TAG', now);
    }
  });

  game.onTsugiStep((pt, angle) => {
    physics.setTarget('tsugi', pt.x, pt.y);
    if (actors.tsugi) actors.tsugi.dataset.state = 'paint';
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === '`' || e.key === '~') {
      if (!telemetryEl) return;
      isTelemetryActive = !isTelemetryActive;
      telemetryEl.hidden = !isTelemetryActive;
      if (isTelemetryActive) {
        renderTelemetryBoxes();
        startSimulation();
      }
    } else if (e.code === 'Space' && !e.repeat) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      e.preventDefault();
      game.triggerTsugiAssist();
      dialogue.setArc('GOLDEN_WAY');
      startSimulation();
    } else if ((e.key === 'r' || e.key === 'R') && !e.repeat) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      toggleLedger();
    }
  });

  const later = (ms: number, fn: () => void) => {
    const tid = window.setTimeout(fn, ms);
    crewTimers.push(tid);
    return tid;
  };

  let lastGlobalTagTime = 0;
  let activeTagWho: string | null = null;
  const MIN_TAG_COOLDOWN_MS = 3500;

  const showTag = (who: keyof typeof actors, text: string, dur = 2400, force = false): boolean => {
    const now = performance.now();
    if (!force) {
      if (now - lastGlobalTagTime < MIN_TAG_COOLDOWN_MS) return false;
      if (activeTagWho && activeTagWho !== who) return false;
    }
    const actorEl = actors[who];
    const tag = actorEl?.querySelector<HTMLElement>('.crew-tag');
    if (!tag) return false;

    lastGlobalTagTime = now;
    activeTagWho = who;
    tag.textContent = text;
    tag.classList.add('on');
    const existing = tagTimers.get(who);
    if (existing) clearTimeout(existing);
    tagTimers.set(
      who,
      window.setTimeout(() => {
        tag.classList.remove('on');
        if (activeTagWho === who) activeTagWho = null;
        dialogue.releaseSpeaker(who as CrewActorId, performance.now());
      }, dur)
    );
    return true;
  };

  const say = (who: HTMLElement | null, text: string) => {
    if (!bubble || !who || !stageEl) return;
    bubble.textContent = text;
    const b = stageEl.getBoundingClientRect();
    const half = Math.min(bubble.offsetWidth / 2 + 8, b.width / 2);
    const whoX = parseFloat(who.style.getPropertyValue('--x') || '0');
    const whoY = parseFloat(who.style.getPropertyValue('--y') || '0');
    const x = Math.max(half, Math.min(b.width - half, whoX));
    bubble.style.setProperty('--x', `${Math.round(x)}px`);
    let bubbleY = whoY - who.offsetHeight + 4;
    if (window.matchMedia('(max-width: 48rem)').matches) {
      const idEl = document.querySelector<HTMLElement>('.plate__id');
      if (idEl) {
        const idBottom = idEl.getBoundingClientRect().bottom - b.top;
        if (bubbleY - bubble.offsetHeight < idBottom + 4) {
          bubbleY = idBottom + 4 + bubble.offsetHeight;
        }
      }
    }
    bubble.style.setProperty('--y', `${Math.round(bubbleY)}px`);
    bubble.classList.add('on');
    later(3200, () => bubble.classList.remove('on'));
  };

  const updateObstacles = () => {
    if (!stageEl) return;
    const stageBox = stageEl.getBoundingClientRect();
    const obstacles: Rect[] = [];

    const idEl = document.querySelector<HTMLElement>('.plate__id');
    if (idEl) {
      const b = idEl.getBoundingClientRect();
      obstacles.push({
        left: b.left - stageBox.left,
        top: b.top - stageBox.top,
        right: b.right - stageBox.left,
        bottom: b.bottom - stageBox.top + 8,
      });
    }

    const activeClaim = document.querySelector<HTMLElement>('.claim.on .claim__said');
    if (activeClaim) {
      const b = activeClaim.getBoundingClientRect();
      obstacles.push({
        left: b.left - stageBox.left,
        top: b.top - stageBox.top,
        right: b.right - stageBox.left,
        bottom: b.bottom - stageBox.top + 6,
      });
    }

    const cuesEl = document.querySelector<HTMLElement>('.cues');
    if (cuesEl) {
      const b = cuesEl.getBoundingClientRect();
      obstacles.push({
        left: b.left - stageBox.left,
        top: b.top - stageBox.top,
        right: b.right - stageBox.left,
        bottom: b.bottom - stageBox.top + 4,
      });
    }

    currentObstacles = obstacles;
    physics.setObstacles(obstacles);
    if (isTelemetryActive) renderTelemetryBoxes();
  };

  const setCrewRestPositions = () => {
    if (!stageEl) return;
    const b = stageEl.getBoundingClientRect();
    const targets = getRestTargets(b.width, b.height);
    for (const [id, pt] of Object.entries(targets)) {
      physics.setTarget(id, pt.x, pt.y);
    }
  };

  const restCrew = () => {
    setCrewRestPositions();
    if (actors.oops) actors.oops.dataset.state = 'sideeye';
    if (actors.tsugi) actors.tsugi.dataset.state = 'proud';
    if (actors.kiki) actors.kiki.dataset.state = 'listen';
    if (actors.fude) actors.fude.dataset.state = 'idle';
    if (actors.uso) actors.uso.dataset.state = 'sip';
    const line = dialogue.generateLine('tsugi', 'TRANQUIL_KILN');
    say(actors.tsugi, line);
  };

  /* The 5-Crew Choreography on Fracture Strike */
  const playCrew = () => {
    if (!plate || !actors.oops || !actors.tsugi || !stageEl) return;
    crewTimers.forEach(clearTimeout);
    crewTimers = [];
    bubble?.classList.remove('on');
    activeSeamWalk = null;

    dialogue.setArc('FRACTURE_STRIKE');
    if (hankoEl) hankoEl.hidden = true;
    if (bridgeEl) bridgeEl.hidden = true;

    const hit = plate.impactPx();
    const b = stageEl.getBoundingClientRect();

    // Generate analytical crack network in the game engine
    const crackSeed = 1.3 + current * 4.17 + (hit.x % 17) * 0.43;
    game.generateFracture(hit, { width: b.width, height: b.height }, crackSeed, 1.2);
    renderSvgVeins();

    const trajectory = plate.getSeamTrajectory(35);

    // 1. Oops positions at fracture impact point and winds up mallet
    const safeHit = physics.clampToNegativeSpace(hit.x + 32, hit.y + 40, 80, 80, { width: b.width, height: b.height });
    physics.setPosition('oops', safeHit.x, safeHit.y);
    actors.oops.dataset.state = 'swing';
    actors.oops.classList.remove('hit');
    void actors.oops.offsetWidth;
    actors.oops.classList.add('hit');

    if (actors.kiki) actors.kiki.dataset.state = 'listen';

    // 2. Shockwave jolt: Oops tumbles back with recoil squash & stretch
    later(240, () => {
      physics.applyImpulse('oops', 380, 70, 1.45, 0.62);
      actors.oops!.dataset.state = 'panic';
      const oopsLine = dialogue.generateLine('oops', 'FRACTURE_STRIKE');
      showTag('oops', oopsLine, 2400, true);

      // Kiki spiral-eyed shockwave reaction on top rim
      if (actors.kiki) {
        physics.applyImpulse('kiki', 0, -120, 1.25, 0.75);
        actors.kiki.dataset.state = 'mindblown';
        showTag('kiki', 'Acoustic shockwave!', 1800, true);
      }

      // Fude grabs bamboo quill to record incident
      if (actors.fude) {
        actors.fude.dataset.state = 'scribble';
        const fudeLine = dialogue.generateLine('fude', 'FRACTURE_STRIKE');
        showTag('fude', fudeLine, 2200, true);
      }

      // Uso leans forward with magnifying loupe
      if (actors.uso) {
        actors.uso.dataset.state = 'doubt';
      }
    });

    // 3. Oops scrambles behind plate rim; Tsugi prepares gold brush at seam origin
    later(750, () => {
      const rest = getRestTargets(b.width, b.height);
      physics.setTarget('oops', rest.oops.x, rest.oops.y);
      actors.oops!.dataset.state = 'sideeye';

      if (actors.kiki) actors.kiki.dataset.state = 'listen';

      actors.tsugi!.dataset.state = 'paint';
      if (trajectory.length > 0) {
        physics.setTarget('tsugi', trajectory[0].x, trajectory[0].y);
      }
    });

    // 4. Seam Walk: Tsugi walks along Voronoi crack, synchronizing shader gold and SVG lacquer
    later(950, () => {
      dialogue.setArc('GOLDEN_WAY');
      activeSeamWalk = {
        trajectory,
        startTime: performance.now(),
        duration: 1650,
      };
    });

    // 5. Seam complete: Tsugi proud; Uso sips tea
    later(2750, () => {
      activeSeamWalk = null;
      plate.setGoldRadius(plate.getMaxRadius());

      actors.tsugi!.dataset.state = 'proud';
      const tsugiLine = dialogue.generateLine('tsugi', 'GOLDEN_WAY');
      showTag('tsugi', tsugiLine, 2800, true);
      say(actors.tsugi, tsugiLine);

      if (actors.uso) {
        actors.uso.dataset.state = 'sip';
        showTag('uso', 'Approved.', 2000, true);
      }
      if (actors.fude) actors.fude.dataset.state = 'count';
    });
  };

  /* Intent state reactions from the micro neural net */
  const onIntentChanged = (intent: GestureClass) => {
    if (activeSeamWalk) return;
    const b = stageEl?.getBoundingClientRect();
    if (!b) return;

    if (intent === 'FRANTIC_SHAKE') {
      if (actors.oops) {
        actors.oops.dataset.state = 'panic';
        physics.applyImpulse('oops', (Math.random() - 0.5) * 60, -35, 1.15, 0.88);
        showTag('oops', 'Earthquake drill!', 1800);
      }
      if (actors.tsugi) actors.tsugi.dataset.state = 'paint';
      if (actors.kiki) actors.kiki.dataset.state = 'mindblown';
      if (actors.fude) actors.fude.dataset.state = 'scribble';
      if (actors.uso) actors.uso.dataset.state = 'sideeye';
    } else if (intent === 'GENTLE_CARESS') {
      if (actors.tsugi) {
        actors.tsugi.dataset.state = 'paint';
        showTag('tsugi', 'Gentle touch.', 2000);
      }
      if (actors.oops) actors.oops.dataset.state = 'happy';
      if (actors.kiki) actors.kiki.dataset.state = 'happy';
      if (actors.uso) actors.uso.dataset.state = 'proud';
      if (actors.fude) actors.fude.dataset.state = 'idle';
    } else if (intent === 'CURIOUS_ORBIT') {
      if (actors.oops) {
        actors.oops.dataset.state = 'mindblown';
        physics.applyImpulse('oops', 0, -25, 1.06, 0.95);
        showTag('oops', 'Dizzy!', 1600);
      }
      if (actors.kiki) actors.kiki.dataset.state = 'listen';
      if (actors.uso) actors.uso.dataset.state = 'doubt';
      if (actors.fude) actors.fude.dataset.state = 'scribble';
      if (actors.tsugi) actors.tsugi.dataset.state = 'idle';
    } else if (intent === 'CONTEMPLATIVE_STILLNESS') {
      setCrewRestPositions();
      if (actors.oops) actors.oops.dataset.state = 'sip';
      if (actors.tsugi) actors.tsugi.dataset.state = 'idle';
      if (actors.kiki) actors.kiki.dataset.state = 'sleep';
      if (actors.fude) actors.fude.dataset.state = 'idle';
      if (actors.uso) actors.uso.dataset.state = 'sip';
      dialogue.setArc('TRANQUIL_KILN');
    }
  };

  /* Click-to-interact micro reactions for each pottery character */
  const bindActorClicks = () => {
    if (actors.oops) {
      actors.oops.addEventListener('click', (e) => {
        e.stopPropagation();
        physics.applyImpulse('oops', 0, -220, 0.72, 1.4);
        actors.oops!.dataset.state = 'panic';
        showTag('oops', 'Careful! I am fragile!', 1800, true);
        later(1800, () => (actors.oops!.dataset.state = 'sideeye'));
      });
    }
    if (actors.tsugi) {
      actors.tsugi.addEventListener('click', (e) => {
        e.stopPropagation();
        physics.applyImpulse('tsugi', 0, -140, 0.88, 1.18);
        actors.tsugi!.dataset.state = 'happy';
        showTag('tsugi', '24k gold lacquer curing.', 1800, true);
        later(1800, () => (actors.tsugi!.dataset.state = 'proud'));
      });
    }
    if (actors.kiki) {
      actors.kiki.addEventListener('click', (e) => {
        e.stopPropagation();
        physics.applyImpulse('kiki', 0, -180, 0.82, 1.25);
        actors.kiki!.dataset.state = 'listen';
        showTag('kiki', 'Listening to the web feeds.', 1800, true);
      });
    }
    if (actors.fude) {
      actors.fude.addEventListener('click', (e) => {
        e.stopPropagation();
        physics.applyImpulse('fude', 0, -150, 0.85, 1.2);
        actors.fude!.dataset.state = 'scribble';
        toggleLedger(true);
        later(1800, () => (actors.fude!.dataset.state = 'idle'));
      });
    }
    if (actors.uso) {
      actors.uso.addEventListener('click', (e) => {
        e.stopPropagation();
        physics.applyImpulse('uso', 0, -150, 0.85, 1.2);
        actors.uso!.dataset.state = 'doubt';
        showTag('uso', 'Show me the paper first.', 1800, true);
        later(1800, () => (actors.uso!.dataset.state = 'sip'));
      });
    }
  };
  bindActorClicks();

  /* Main animation and simulation loop */
  let lastFrameTime = performance.now();
  let simRaf = 0;

  const tickSimulation = (now: number) => {
    simRaf = 0;
    const dt = (now - lastFrameTime) / 1000;
    lastFrameTime = now;

    if (stageEl) {
      const box = stageEl.getBoundingClientRect();
      const bounds = { width: box.width, height: box.height };

      // Update autonomous Tsugi assist if painting is active
      game.updateTsugiAssist(dt, now);

      // Seam walk progress during automatic fracture choreography
      if (activeSeamWalk && actors.tsugi && plate) {
        const elapsed = now - activeSeamWalk.startTime;
        const progress = Math.min(1.0, elapsed / activeSeamWalk.duration);
        const traj = activeSeamWalk.trajectory;
        const trajIdx = Math.min(traj.length - 1, Math.floor(progress * (traj.length - 1)));
        const pt = traj[trajIdx];

        physics.setTarget('tsugi', pt.x, pt.y);
        plate.setGoldRadius(pt.r);

        if (progress >= 1.0) {
          activeSeamWalk = null;
        }
      }

      // Update Kinematic Intent every ~60ms
      if (now - intentDebounceTimer > 60 && !activeSeamWalk) {
        intentDebounceTimer = now;
        const intent = brain.getKinematicIntent(now);
        if (intent !== lastIntent) {
          lastIntent = intent;
          onIntentChanged(intent);
        }
      }

      // Evaluate Multi-Attribute Utility Theory (MAUT) every ~250ms
      if (now - mautDebounceTimer > 250 && !activeSeamWalk) {
        mautDebounceTimer = now;
        const maut = brain.evaluateMAUT(now);

        if (maut.action === 'SPEECH_TAG' && dialogue.canSpeak(now)) {
          const curArc = dialogue.getArc();
          const candidates: CrewActorId[] =
            curArc === 'TRANQUIL_KILN' ? ['kiki', 'tsugi', 'uso', 'fude', 'oops'] :
            curArc === 'GOLDEN_WAY' ? ['tsugi', 'oops', 'fude'] :
            curArc === 'FRACTURE_STRIKE' ? ['oops', 'uso', 'kiki'] : ['tsugi', 'fude', 'kiki'];
          const speaker = candidates[Math.floor(Math.random() * candidates.length)];
          const line = dialogue.requestDialogue(speaker, curArc, { now, streak: game.getLedger().currentStreak });
          if (line) {
            showTag(line.speaker, line.text, line.durationMs);
            brain.recordAction('SPEECH_TAG', now);
          }
        } else if (maut.action === 'OOPS_TUMBLE') {
          physics.applyImpulse('oops', (Math.random() - 0.5) * 35, -25, 1.10, 0.92);
          brain.recordAction('OOPS_TUMBLE', now);
        }
      }

      // Advance physics integrator with obstacle avoidance & phase-shifted breathing
      physics.update(dt, pointer, bounds, { allowTopRimIds: ['kiki'] });

      // Update DOM actors from physics state (including sub-pixel gaze IK and subtle head tilt)
      for (const [id, el] of Object.entries(actors)) {
        if (!el) continue;
        const s = physics.getActor(id);
        if (!s) continue;
        el.style.setProperty('--x', `${Math.round(s.x)}px`);
        el.style.setProperty('--y', `${Math.round(s.y)}px`);
        el.style.setProperty('--scale-x', s.scaleX.toFixed(3));
        el.style.setProperty('--scale-y', s.scaleY.toFixed(3));
        el.style.setProperty('--tilt', `${s.headTilt.toFixed(2)}deg`);
        el.style.setProperty('--pupil-x', `${s.gazeX.toFixed(2)}px`);
        el.style.setProperty('--pupil-y', `${s.gazeY.toFixed(2)}px`);
      }

      // Update Telemetry HUD if active
      if (isTelemetryActive && telemetryEl && !telemetryEl.hidden) {
        const istate = brain.getIntentState();
        const rawFeats = brain.getLastFeatures();
        const probs = brain.getProbabilities();
        const lat = brain.getLatency();

        if (hudIntent) hudIntent.textContent = istate.current;
        if (hudConf) hudConf.textContent = `${Math.round(istate.confidence * 100)}% (${Math.round(istate.durationInState)}ms)`;
        if (hudLatency) hudLatency.textContent = `${lat.toFixed(3)}ms`;
        if (hudSpeed) hudSpeed.textContent = rawFeats[0].toFixed(2);
        if (hudAccel) hudAccel.textContent = rawFeats[2].toFixed(3);
        if (hudJerk) hudJerk.textContent = rawFeats[4].toFixed(4);
        if (hudCurve) hudCurve.textContent = rawFeats[5].toFixed(3);
        if (hudDwell) hudDwell.textContent = rawFeats[9].toFixed(2);
        if (hudEff) hudEff.textContent = rawFeats[6].toFixed(2);

        if (hudBarFills && hudBarVals) {
          for (let k = 0; k < 5; k++) {
            const pct = Math.round((probs[k] || 0) * 100);
            const fill = hudBarFills[k];
            const val = hudBarVals[k];
            if (fill) fill.style.width = `${pct}%`;
            if (val) val.textContent = `${pct}%`;
          }
        }
      }
    }

    if (!reduced) simRaf = requestAnimationFrame(tickSimulation);
  };

  const startSimulation = () => {
    if (!simRaf && !reduced) {
      lastFrameTime = performance.now();
      simRaf = requestAnimationFrame(tickSimulation);
    }
  };

  // Pointer & Dragging Events for Lacquer Painting
  if (!reduced) {
    window.addEventListener('pointerdown', (e) => {
      isPointerDragging = true;
      if (!stageEl) return;
      const box = stageEl.getBoundingClientRect();
      const pt = { x: e.clientX - box.left, y: e.clientY - box.top };
      if (game.isNearCrack(pt, 36) && !game.getIsCured()) {
        game.paintAt(pt);
        dialogue.setArc('GOLDEN_WAY');
        startSimulation();
      }
    });

    window.addEventListener('pointerup', () => {
      isPointerDragging = false;
    });

    window.addEventListener('pointermove', (e) => {
      if (!stageEl) return;
      const box = stageEl.getBoundingClientRect();
      pointer.x = e.clientX - box.left;
      pointer.y = e.clientY - box.top;
      pointer.screenX = e.clientX;
      pointer.screenY = e.clientY;
      brain.record(pointer.x, pointer.y, false);
      startSimulation();

      const isNear = game.isNearCrack(pointer, 36);
      plateEl?.classList.toggle('is-brush', isNear && !game.getIsCured());

      if (isNear && isPointerDragging && !game.getIsCured()) {
        game.paintAt(pointer);
        dialogue.setArc('GOLDEN_WAY');
      }
    }, { passive: true });

    // Mobile Touch Architecture (<768px): default touch-action: pan-y preserves vertical scrolling
    plateEl?.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1 && stageEl) {
        const t = e.touches[0];
        const box = stageEl.getBoundingClientRect();
        const pt = { x: t.clientX - box.left, y: t.clientY - box.top };
        if (game.isNearCrack(pt, 36) && !game.getIsCured()) {
          touchNearCrack = true;
          e.preventDefault();
          game.paintAt(pt);
          dialogue.setArc('GOLDEN_WAY');
          startSimulation();
        } else {
          touchNearCrack = false;
        }
      }
    }, { passive: false });

    plateEl?.addEventListener('touchmove', (e) => {
      if (touchNearCrack && e.touches.length === 1 && stageEl) {
        const t = e.touches[0];
        const box = stageEl.getBoundingClientRect();
        const pt = { x: t.clientX - box.left, y: t.clientY - box.top };
        e.preventDefault();
        game.paintAt(pt);
        dialogue.setArc('GOLDEN_WAY');
        startSimulation();
      }
    }, { passive: false });
  }

  const strikePlate = (n: number, at?: { x: number; y: number }) => {
    plate?.strike(n, at);
    if (!reduced) playCrew();
  };

  const show = (n: number, at?: { x: number; y: number }) => {
    current = n;
    strikePlate(n, at);
    claimEls.forEach((el, i) => {
      el.classList.toggle('on', i === n);
      el.classList.remove('play');
    });
    if (!reduced) {
      void claimEls[n].offsetWidth;
      claimEls[n].classList.add('play');
    }
    cues.forEach((c, i) => {
      c.classList.toggle('cue--on', i === n);
      c.setAttribute('aria-pressed', String(i === n));
    });
    updateObstacles();
  };

  cues.forEach((c, i) => {
    c.addEventListener('click', () => {
      auto = false;
      syncAuto();
      claimsBox?.setAttribute('aria-live', 'polite');
      show(i);
    });
    c.querySelector('.cue__bar')?.addEventListener('animationend', (e) => {
      if ((e as AnimationEvent).animationName !== DWELL_END || !auto || i !== current) return;
      if (i === cues.length - 1) {
        auto = false;
        syncAuto();
        show(0);
      } else {
        show(i + 1);
      }
    });
  });

  plateEl?.addEventListener('click', (e) => {
    if (!plate || (e.target as HTMLElement).closest('a, button, input')) return;
    if (getSelection()?.toString()) return;
    // If user clicked to paint near crack, do not advance claim
    if (stageEl) {
      const box = stageEl.getBoundingClientRect();
      const pt = { x: e.clientX - box.left, y: e.clientY - box.top };
      if (game.isNearCrack(pt, 24) && !game.getIsCured()) {
        return;
      }
    }
    auto = false;
    syncAuto();
    claimsBox?.setAttribute('aria-live', 'polite');
    if (stageEl) {
      const box = stageEl.getBoundingClientRect();
      brain.record(e.clientX - box.left, e.clientY - box.top, true);
    }
    show((current + 1) % claimEls.length, { x: e.clientX, y: e.clientY });
  });

  pause?.addEventListener('click', () => {
    auto = !auto;
    syncAuto();
  });

  const hold = (on: boolean) => stage?.classList.toggle('held', on);
  stage?.addEventListener('pointerenter', () => hold(true));
  stage?.addEventListener('pointerleave', () => hold(false));
  stage?.addEventListener('focusin', () => hold(true));
  stage?.addEventListener('focusout', () => hold(false));
  if (reduced && pause) pause.hidden = true;
  syncAuto();

  // Resize observer to update physics targets and negative space obstacles
  new ResizeObserver(() => {
    updateObstacles();
    setCrewRestPositions();
    renderSvgVeins();
`

### 7.3 Styling, Micro-interactions & Gaze Bounds
`css
  .plate.gl .claim.play .claim__mend { animation-delay: 1.75s; }
  /* ---------- the crew: Living Ceramic Terrarium ---------- */
  .crew-stage {
    position: absolute; inset: 0; z-index: 2; pointer-events: none;
    --actor: clamp(58px, 6.8vw, 98px);
    overflow: hidden; touch-action: pan-y;
  }
  html:not(.js) .crew-stage { display: none; }

  .crew-actor {
    position: absolute; left: 0; top: 0; width: var(--actor); height: var(--actor);
    min-width: 44px; min-height: 44px;
    transform: translate(calc(var(--x, -200px) - 50%), calc(var(--y, -200px) - 100%)) scale(var(--scale-x, 1), var(--scale-y, 1)) rotate(var(--tilt, 0deg));
    transform-origin: 50% 100%;
    pointer-events: auto; cursor: pointer; user-select: none;
    touch-action: manipulation;
    will-change: transform;
    transition: outline-offset 0.15s ease;
  }
  .crew-actor:active {
    transform: translate(calc(var(--x, -200px) - 50%), calc(var(--y, -200px) - 100%)) scale(calc(var(--scale-x, 1) * 1.15), calc(var(--scale-y, 1) * 0.85)) rotate(var(--tilt, 0deg));
  }
  .crew-actor:focus-visible { outline: 2px dashed var(--ochre); outline-offset: 4px; border-radius: 8px; }

  .crew-actor .crew { width: 100%; height: 100%; display: none; }
  .crew-actor[data-state='swing'] .is-swing,
  .crew-actor[data-state='panic'] .is-panic,
  .crew-actor[data-state='sideeye'] .is-sideeye,
  .crew-actor[data-state='happy'] .is-happy,
  .crew-actor[data-state='sip'] .is-sip,
  .crew-actor[data-state='idle'] .is-idle,
  .crew-actor[data-state='paint'] .is-paint,
  .crew-actor[data-state='proud'] .is-proud,
  .crew-actor[data-state='listen'] .is-listen,
  .crew-actor[data-state='mindblown'] .is-mindblown,
  .crew-actor[data-state='sleep'] .is-sleep,
  .crew-actor[data-state='scribble'] .is-scribble,
  .crew-actor[data-state='count'] .is-count,
  .crew-actor[data-state='doubt'] .is-doubt {
    display: block;
  }

  /* Gaze Inverse Kinematics: pupils track pointer with stable SVG coordinate bounds */
  .crew-actor .crew-ink circle.k {
    transform-box: fill-box;
    transform-origin: center;
    transform: translate(var(--pupil-x, 0px), var(--pupil-y, 0px));
  }

  /* Prop kinetic animations during specific key actions */
  .crew-actor.hit .is-swing .crew-prop { animation: crew-hammer .33s cubic-bezier(.6, 0, .9, .5) both; }
  .crew-actor[data-state='paint'] .crew-prop { animation: crew-brush .42s ease-in-out infinite alternate; }
  .crew-actor[data-state='scribble'] .crew-prop { animation: crew-pen .22s ease-in-out infinite alternate; }
  @keyframes crew-hammer { from { transform: rotate(-58deg); } 82% { transform: rotate(48deg); } to { transform: rotate(40deg); } }
  @keyframes crew-brush { from { transform: rotate(-16deg); } to { transform: rotate(14deg); } }
  @keyframes crew-pen { from { transform: rotate(-10deg) translateY(-2px); } to { transform: rotate(12deg) translateY(2px); } }

  /* Organic rim-anchored tags */
  .crew-tag {
    position: absolute; left: 50%; bottom: calc(100% - 6px);
    transform: translate(-50%, 4px) scale(0.85); transform-origin: 50% 100%;
    opacity: 0; pointer-events: none; white-space: nowrap;
    font-family: var(--serif); font-style: italic; font-size: 0.8125rem; line-height: 1.2;
    padding: 0.25rem 0.55rem;
    background: var(--paper); color: var(--ink); border: 1px solid var(--border);
    border-radius: 8px 8px 8px 2px;
    box-shadow: 0 4px 12px color-mix(in srgb, var(--ink) 12%, transparent);
    transition: opacity 0.2s var(--ease), transform 0.25s var(--ease);
    z-index: 10;
  }
  .crew-tag.on {
    opacity: 1; transform: translate(-50%, -6px) scale(1);
  }

  .crew-stage .crew-say {
    position: absolute; left: 0; top: 0; white-space: normal; width: max-content; max-width: min(16rem, 82vw); opacity: 0;
    transform: translate(calc(var(--x, 0px) - 50%), calc(var(--y, 0px) - 100%)) scale(.94);
    transform-origin: 50% 100%; transition: opacity .25s ease, transform .25s var(--ease);
    z-index: 10;
  }
  .crew-stage .crew-say.on { opacity: 1; transform: translate(calc(var(--x, 0px) - 50%), calc(var(--y, 0px) - 100%)); }

  /* Dev Telemetry HUD Overlay */
  .crew-telemetry {
    position: absolute; inset: 0; pointer-events: none; z-index: 12;
    font-family: monospace; font-size: 0.72rem; color: var(--ink);
  }
  .crew-telemetry[hidden] { display: none; }
  .crew-telemetry__card {
    position: absolute; right: 1rem; top: 1rem; width: min(22rem, 90vw);
    background: color-mix(in srgb, var(--paper) 92%, transparent);
    border: 1px solid var(--border); border-radius: 8px;
    padding: 0.75rem; box-shadow: 0 8px 30px color-mix(in srgb, var(--ink) 12%, transparent);
    backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
    display: flex; flex-direction: column; gap: 0.5rem;
    pointer-events: auto; user-select: none;
  }
  .crew-telemetry__top {
    display: flex; align-items: center; justify-content: space-between;
    border-bottom: 1px solid var(--border); padding-bottom: 0.4rem;
  }
  .crew-telemetry__pill {
    font-size: 0.65rem; font-weight: 700; letter-spacing: 0.05em;
    padding: 0.15rem 0.4rem; border-radius: 4px;
    background: color-mix(in srgb, var(--ochre) 18%, transparent); color: var(--ochre);
  }
  .crew-telemetry__intent {
    font-weight: 700; color: var(--mizu); letter-spacing: 0.02em;
  }
  .crew-telemetry__time {
    color: var(--ink); opacity: 0.7; font-size: 0.68rem;
  }
  .crew-telemetry__row {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.4rem;
  }
  .crew-telemetry__col {
    display: flex; flex-direction: column; gap: 0.1rem;
    background: color-mix(in srgb, var(--ink) 4%, transparent);
    padding: 0.25rem 0.35rem; border-radius: 4px;
  }
  .crew-telemetry__label {
    font-size: 0.62rem; opacity: 0.65; text-transform: uppercase; letter-spacing: 0.04em;
  }
  .crew-telemetry__val {
    font-size: 0.75rem;
  }
  .crew-telemetry__sec {
    display: flex; flex-direction: column; gap: 0.3rem;
    border-top: 1px solid color-mix(in srgb, var(--border) 60%, transparent);
    padding-top: 0.4rem;
  }
  .crew-telemetry__meter {
    display: flex; flex-direction: column; gap: 0.25rem;
  }
  .crew-telemetry__bar-row {
    display: grid; grid-template-columns: 3.5rem 1fr 2.4rem; align-items: center; gap: 0.4rem;
    font-size: 0.65rem;
  }
  .crew-telemetry__bar-track {
    height: 5px; background: color-mix(in srgb, var(--ink) 10%, transparent);
    border-radius: 3px; overflow: hidden;
  }
  .crew-telemetry__bar-fill {
    height: 100%; width: 0%; background: var(--mizu);
    transition: width 0.1s linear; border-radius: 3px;
  }
  .crew-telemetry__bar-fill[data-bar="0"] { background: var(--hanko); }
  .crew-telemetry__bar-fill[data-bar="1"] { background: var(--ochre); }
  .crew-telemetry__bar-fill[data-bar="2"] { background: var(--mizu); }
  .crew-telemetry__bar-fill[data-bar="3"] { background: var(--plum); }
  .crew-telemetry__bar-fill[data-bar="4"] { background: var(--moss); }
  .crew-telemetry__status {
    font-size: 0.62rem; opacity: 0.7; font-style: italic;
  }
  .crew-telemetry__debug-boxes {
    position: absolute; inset: 0; pointer-events: none;
  }
  .crew-telemetry__obs-box {
    position: absolute; border: 1px dashed var(--indigo);
    background: color-mix(in srgb, var(--indigo) 6%, transparent);
    border-radius: 4px; pointer-events: none;
  }
  .crew-telemetry__anchor-box {
    position: absolute; width: 14px; height: 14px; border-radius: 50%;
    border: 1px solid var(--ochre); transform: translate(-50%, -50%);
    pointer-events: none;
  }

  /* SVG Gold Lacquer Seam Veins */
  .kintsugi-veins {
    position: absolute; inset: 0; width: 100%; height: 100%;
    pointer-events: none; z-index: 1; overflow: visible;
  }
  .kintsugi-veins path.vein-crack {
    fill: none; stroke: color-mix(in srgb, var(--ink) 40%, transparent);
    stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round;
  }
  .kintsugi-veins path.vein-gold {
    fill: none; stroke: var(--ochre);
    stroke-width: 2.8; stroke-linecap: round; stroke-linejoin: round;
    filter: drop-shadow(0 0 3px var(--ochre));
    transition: stroke-dashoffset 0.08s linear;
  }

  /* Stamped Red Hanko Seal (金継) */
  .kintsugi-hanko {
    position: absolute; right: clamp(1rem, 3.5vw, 2.5rem); bottom: clamp(1rem, 2.5vw, 2.2rem);
    z-index: 10; pointer-events: none; user-select: none;
    animation: hanko-stamp 0.45s cubic-bezier(0.18, 0.89, 0.32, 1.28) both;
  }
`
