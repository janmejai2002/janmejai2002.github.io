> **Superseded 2026-11-11.** The engine described here was removed. See `docs/CREW.md` for how the crew work now.

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
