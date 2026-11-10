# Domain J: Synthetic Character Architecture, Ethological Action Selection, and Game AI Canon

## 1. Ethological Action Selection and Drive Fatigue: Bruce Blumberg (MIT Media Lab)

Bruce Blumberg’s seminal work (*Building Companions, Not Slaves: Ethologically Grounded Approaches to Believable Autonomous Agents*, MIT Media Lab Synthetic Characters Group, 1996–2002) establishes the foundational framework for synthetic creatures that evoke genuine empathy without breaking user concentration.

### 1.1 The Ethological Drive-Fatigue State Engine
Traditional video game NPCs and software mascots suffer from repetitive looping behaviors and erratic, machine-like state flipping. In ethology (Lorenz, Tinbergen, McFarland), animal behavior is governed by competing internal motivational drives modulated by sensory releasers and action fatigue.

For an autonomous figurine $i$ in the wAIbi-sabi Terrarium, behavior is not selected by static nested `if/else` checks. Instead, each figurine maintains an internal drive vector $\vec{D}_i(t) \in [0, 1]^K$:
$$D_k(t + \Delta t) = \text{clamp}\left( D_k(t) + \alpha_k \Delta t - \beta_k \cdot \mathbf{1}_{\{A(t) = a_k\}} \cdot \Delta t + \gamma_k \cdot R_k(\vec{X}_{\text{user}}), 0, 1 \right)$$
Where:
- $\alpha_k$ is the endogenous build-up rate of drive $k$ (e.g., curiosity, resting fatigue, inspection urge).
- $\beta_k$ is the action fatigue / satiety coefficient that decays the drive as the corresponding action $a_k$ is actively expressed.
- $\gamma_k$ is the sensory releaser gain triggered by external user gesture features $\vec{X}_{\text{user}}$ (such as cursor proximity, rapid jerk, or lacquer dragging).
- $R_k(\cdot)$ is the sensory filtering transfer function.

### 1.2 Sensory Filtering & Non-Verbal State Signaling
- **Sensory Filtering**: Companions do not perceive the raw DOM or raw coordinate streams directly. Incoming raw pointer positions $(x, y)$ pass through spatial receptive fields and peripheral vision cones (angular aperture $\theta_{\text{fov}} \approx 135^\circ$). Stimuli outside the field of view undergo attenuated gain or require neck saccades before registering as active releasers.
- **Non-Verbal State Signaling**: Synthetic characters must communicate intentionality, fatigue, and comprehension *non-verbally* through posturing, gaze direction, and harmonic respiration. Unsolicited dialogue boxes or floating tooltips break immersion and cognitive calm; subtle head tilts, pupil convergence, and harmonic weight shifts communicate internal state with zero text occlusion.

---

## 2. Multi-Attribute Utility Theory (MAUT) & Continuous Response Curves: Dave Mark & Damian Isla

Finite State Machines (FSMs) and simple hierarchical state machines (HFSMs) scale quadratically in complexity ($O(N^2)$ transitions) and produce brittle, robotic transitions. Dave Mark (*Behavioral Mathematics for Game AI*) and Damian Isla (GDC 2005, *Halo 2* AI Architecture) formalized Multi-Attribute Utility Theory (MAUT) as the superior continuous mathematical paradigm for synthetic character decision-making.

### 2.1 Continuous Utility Scoring over Brittle FSMs
In an action selection cycle, each prospective behavior $a \in \mathcal{A}$ evaluates a set of normalized considerations $c_{a, j} \in [0, 1]$. Rather than binary gating, each consideration is mapped through a continuous mathematical response curve $f_j(x)$ (logistic, exponential, linear, or polynomial):
$$f_{\text{logistic}}(x; k, x_0) = \frac{1}{1 + e^{-k(x - x_0)}}$$
$$f_{\text{polynomial}}(x; m, c) = m \cdot x^c$$

The total utility score $U(a)$ for action $a$ is the weighted geometric mean or normalized product of its considerations, preventing any action from executing if a critical veto consideration drops to zero:
$$U(a) = \prod_{j=1}^{M_a} \left[ (1 - w_{a, j}) + w_{a, j} \cdot f_j(c_{a, j}) \right]$$
Where $w_{a, j} \in [0, 1]$ represents the weight/importance of consideration $j$.

### 2.2 Momentum, Inertia, and Action Persistence
To eradicate high-frequency dithering between two behaviors with nearly identical utility scores, MAUT integrates a behavioral inertia bonus $\Lambda(a)$:
$$\tilde{U}(a) = U(a) + \lambda \cdot \mathbf{1}_{\{a = a_{\text{current}}\}}$$
An action change occurs only if an alternative action’s utility exceeds the current action by an explicit hysteresis threshold:
$$\arg\max_{a'} \tilde{U}(a') \quad \text{such that} \quad U(a') - U(a_{\text{current}}) > \delta_{\text{hysteresis}}$$

This guarantees deliberate, calm physical transitions matching the contemplative ethos of wabi-sabi.

---

## 3. Kinematic Minimum-Jerk Trajectory Models: Flash & Hogan (1985)

Tamar Flash and Neville Hogan (*The Coordination of Arm Movements: An Experimentally Confirmed Mathematical Model*, The Journal of Neuroscience, 1985) demonstrated that voluntary human motor control inherently minimizes the third time-derivative of position—**jerk** ($J = \frac{d^3 \vec{x}}{dt^3} = \dddot{\vec{x}}$)—over movement duration $T$:
$$C_J = \frac{1}{2} \int_0^T \left( \left(\frac{d^3 x}{dt^3}\right)^2 + \left(\frac{d^3 y}{dt^3}\right)^2 \right) dt$$

### 3.1 Characteristic Equation for Minimum-Jerk Motion
Between boundary conditions $(x_0, v_0 = 0, a_0 = 0)$ at $t = 0$ and $(x_f, v_f = 0, a_f = 0)$ at $t = T$, the closed-form coordinate trajectory follows a smooth 5th-order polynomial:
$$x(t) = x_0 + (x_f - x_0) \left( 10 \left(\frac{t}{T}\right)^3 - 15 \left(\frac{t}{T}\right)^4 + 6 \left(\frac{t}{T}\right)^5 \right)$$

### 3.2 Human Cursor Kinematics & Intent Classification
In the wAIbi-sabi Terrarium, raw mouse and touch inputs are sampled into a high-precision circular ring buffer $(t_k, x_k, y_k)_{k=1}^N$. From this buffer, numerical differentiation yields velocity $\vec{v}(t)$, acceleration $\vec{a}(t)$, and jerk $\vec{j}(t)$:
$$\vec{v}_k = \frac{\vec{x}_k - \vec{x}_{k-1}}{\Delta t_k}, \quad \vec{a}_k = \frac{\vec{v}_k - \vec{v}_{k-1}}{\Delta t_k}, \quad \vec{j}_k = \frac{\vec{a}_k - \vec{a}_{k-1}}{\Delta t_k}$$

Key kinematic signatures distinguish intentional human states:
1. **Contemplative Reading**: Low velocity ($\|\vec{v}\| \le 40\text{ px/s}$), near-zero jerk, prolonged dwell time in text zones.
2. **Playful Exploration**: Smooth minimum-jerk bell-shaped velocity profiles ($\|\vec{v}\| \in [100, 500]\text{ px/s}$, low normalized jerk ratio $\frac{\|\vec{j}\|}{\|\vec{v}\|^2} \le \kappa_{\text{smooth}}$).
3. **Deliberate Strike (Oops Trigger)**: High instantaneous acceleration, rapid deceleration upon click, localized energy burst.
4. **Lacquer Painting (Tsugi Interaction)**: Trajectory curvature matching fracture line tangents, steady contact velocity ($\|\vec{v}\| \in [50, 250]\text{ px/s}$), continuous button/pointer down state.
5. **Scattered Agitation**: High variance in angular heading $\Delta \theta$, severe non-minimum jerk ($\frac{\|\vec{j}\|}{\|\vec{v}\|} \gg \kappa_{\text{erratic}}$), erratic direction reversals without dwell.

---

## 4. Lloyd’s Relaxation, Voronoi Duals, and Sub-Pixel Fracture Geometry

Kintsugi crack generation and real-time repair hit-testing rely on computational geometry principles derived from Voronoi diagrams and Lloyd's Centroidal Voronoi Tessellation (Lloyd, 1982).

### 4.1 Ceramic Fracture Topology via Lloyd-Relaxed Duals
Realistic ceramic shear fractures do not resemble random noise; they follow stress-relief patterns along crystalline grain boundaries:
1. A set of seed generators $\{P_i\}_{i=1}^M$ is distributed across the circular plate unit disk $\mathbb{D} = \{ (x, y) \mid x^2 + y^2 \le R_{\text{plate}}^2 \}$.
2. Iterative Lloyd relaxation shifts each seed toward its Voronoi cell centroid:
   $$P_i^{(n+1)} = \frac{\int_{\Omega_i} \vec{x} \, dA}{\int_{\Omega_i} dA}$$
3. Cracks propagate along the Delaunay triangulation dual edges or Voronoi ridges, perturbed by fractional Brownian motion (fBm) noise to simulate brittle ceramic tensile failure.

### 4.2 Sub-Pixel Line Segment Proximity Calculation
The crack network is represented as a directed topological graph $\mathcal{G} = (\mathcal{V}, \mathcal{E})$, where each edge $e = (A, B) \in \mathcal{E}$ is a line segment from $A = (x_A, y_A)$ to $B = (x_B, y_B)$.

When the reader drags a brush or pointer at position $\vec{p} = (x_p, y_p)$, the orthogonal projection parameter $t^*$ onto segment $e$ is:
$$t^* = \text{clamp}\left( \frac{(\vec{p} - A) \cdot (B - A)}{\|B - A\|^2}, 0, 1 \right)$$
The shortest Euclidean distance from $\vec{p}$ to segment $e$ is:
$$d(\vec{p}, e) = \|\vec{p} - (A + t^* (B - A))\|$$

### 4.3 Gold Seal Parameterization & Coverage Transfer
- A segment edge $e$ is considered contacted if:
  $$d(\vec{p}, e) \le R_{\text{brush}}$$
- Each crack segment maintains a continuous gold seal saturation state $s_e \in [0, 1]$.
- Upon contact during a brush drag event, the gold deposit increments proportionally to contact dwell and brush speed:
  $$\Delta s_e = \eta_{\text{gold}} \cdot \left( 1 - \frac{d(\vec{p}, e)}{R_{\text{brush}}} \right) \cdot \Delta t$$
- The overall vessel restoration index $\Phi(t) \in [0, 1]$ is the length-weighted sum over all fracture edges:
  $$\Phi(t) = \frac{\sum_{e \in \mathcal{E}} \|e\| \cdot s_e(t)}{\sum_{e \in \mathcal{E}} \|e\|}$$
- This parameter $\Phi(t)$ directly drives both the WebGL fragment shader uniform `uGold` and the autonomous assist behaviors of Tsugi and Fude.

---

## 5. Architectural Synthesis: The 5-Figurine Terrarium Engine Specification

Integrating Blumberg's ethology, Mark's MAUT, Flash-Hogan kinematics, and Voronoi fracture geometry yields the architecture for the 5 companions:

| Companion | Archetype & Tool | Ethological Role | MAUT Primary Drivers | Harmonic Respiration ($\omega, \phi$) |
| :--- | :--- | :--- | :--- | :--- |
| **Tsugi** | Master Craftsman (Gold Brush) | Active Mending & Guidance | Repair Urge, Craft Perfection, Serenity | $\omega = 0.8\text{ rad/s}, \phi = 0.0$ |
| **Oops** | Curious Apprentice (Iron Mallet) | Playful Tension & Stress Testing | Mischief Urge, Impact Fascination, Timidity | $\omega = 1.3\text{ rad/s}, \phi = \frac{\pi}{3}$ |
| **Kiki** | Feline Radar (Ear Horn / Bell) | Peripheral Saccades & Curiosity | Acoustic Alertness, Cursor Stalking, Slumber | $\omega = 1.8\text{ rad/s}, \phi = \frac{2\pi}{3}$ |
| **Fude** | Diligent Scribe (Quill & Ink) | Ledger Recording & Audit Logging | Ledger Inscription, Precision Focus, Stillness | $\omega = 0.6\text{ rad/s}, \phi = \pi$ |
| **Uso** | Rigorous Skeptic (Loupe / Glass) | Unit Economics & Flaw Audit | Flaw Detection, Scrutiny, Distance Keeping | $\omega = 0.9\text{ rad/s}, \phi = \frac{4\pi}{3}$ |

### 5.1 Volume-Conserving Harmonic Respiration
To ensure physical believability without robotic scaling, each figurine's SVG root element computes an asynchronous breathing deformation scale vector $(S_x(t), S_y(t))$:
$$S_y(t) = 1.0 + A_i \sin(\omega_i t + \phi_i)$$
$$S_x(t) = \frac{1.0}{S_y(t)} \approx 1.0 - A_i \sin(\omega_i t + \phi_i)$$
Strict volume preservation ($S_x(t) \cdot S_y(t) \equiv 1.0$) prevents unnatural rubbery expansion, maintaining the illusion of solid physical craftsmanship.

### 5.2 Gaze Inverse Kinematics (IK)
Pupil circles (`<circle class="k">`) are constrained within their respective sclera orbits of radius $r_{\text{orbit}}$:
$$\vec{u}_{\text{target}} = \frac{\vec{p}_{\text{cursor}} - \vec{p}_{\text{eye}}}{\|\vec{p}_{\text{cursor}} - \vec{p}_{\text{eye}}\| + \epsilon}$$
$$\Delta \vec{p}_{\text{pupil}} = r_{\text{orbit}} \cdot \tanh\left( \frac{\|\vec{p}_{\text{cursor}} - \vec{p}_{\text{eye}}\|}{D_{\text{attract}}} \right) \cdot \vec{u}_{\text{target}}$$
This soft saturation curve produces natural focal convergence for near targets without pupil clipping or eye strain artifacts.
