# Domain G: Digital Wabi-Sabi, Tactile Web Acoustics, and Physics of Stillness

## 1. The Physics of Tactile Dignity: Harmonic Springs vs. Cartoon Bounce

In digital UI animation, default CSS cubic-beziers (`ease-out`, `bounce`) feel synthetic, rubbery, and plastic. In physical craftsmanship, handcrafted materials possess density, inertia, friction, and restorative mechanical tension.

### 1. Second-Order Dynamical Systems (RK4 Spring-Damper)
$$m \ddot{x} + c \dot{x} + k(x - x_{\text{target}}) = F_{\text{ext}}$$
Where:
- $m$ is object mass (giving weight and inertia).
- $k$ is spring stiffness (tensile restorative force).
- $c$ is damping coefficient ($c = 2 \zeta \sqrt{k m}$).
- $\zeta$ is the damping ratio.

### 2. The Damping Spectrum:
- **Underdamped ($\zeta < 0.7$)**: Oscillates and jiggles repeatedly. Suitable for cartoon games or bouncy balls; **toxic to contemplative editorial design**.
- **Critically Damped ($\zeta = 1.0$)**: Settles in minimal time without any overshoot or jitter. Reflects high mechanical precision.
- **Slightly Underdamped Solid Resonance ($\zeta = 0.85 - 0.92$)**: Yields a single authoritative settle with a micro-compression that feels like dense porcelain hitting a felt-padded cedar table.
- **Rule for Mascot Physics**: Mascot movement (breathing, gaze IK, impact displacement) must use $\zeta \ge 0.88$. They must never "boing" like gelatin.

---

## 2. WebAudio Tactile Acoustics: Physical Modal Synthesis vs. Audio Cliches

Web interactions that blast recorded WAV/MP3 files feel cheap, repetitive, and grating. Procedural WebAudio synthesis, driven by real physical parameters, creates micro-haptic auditory depth.

### 1. Resonant Modal Synthesis of Ceramic (*Kintsugi Clink*)
- A fired ceramic plate rings with distinct inharmonic vibrational modes:
  $$f_n = f_0 \cdot \left(\frac{2n - 1}{2}\right)^\gamma$$
- An impact strike produces a brief burst of pink noise (contact duration $\approx 2-5\text{ms}$) fed into 3–4 parallel narrow bandpass biquad filters ($Q \approx 25-60$) at modal frequencies (e.g., $1820\text{Hz}, 2740\text{Hz}, 4120\text{Hz}$).
- High internal mechanical damping causes higher modes to decay within $40\text{ms}$, leaving a gentle, warm fundamental ringing for $150-250\text{ms}$.

### 2. The Urushi Lacquer Friction & Gold Dusting Sound
- As gold lacquer is brushed along a crack:
  - Low-pass filtered white noise ($f_c \approx 800\text{Hz}-1400\text{Hz}$) modulated by brush velocity $\frac{dx}{dt}$.
  - Creates the tactile, ASMR-like acoustic friction of hair bristle against unglazed bisque stoneware.
- Golden seal completion: A soft, warm chime (sine oscillator with smooth exponential gain decay and a touch of subtle saturation).

### 3. The Power of *Ma* (間 — The Interval of Silence)
- Sound in wAIbi-sabi must be opt-in, ultra-subtle, or muted by default.
- 99% of reader time is spent in complete auditory silence. The acoustics are meant to enhance the tactile illusion when explicitly tapped, never to autoplay or background-drone.

---

## 3. *Mono no Aware* (物の哀れ): The Pathos of Transient Systems

*Mono no aware*—an empathy toward things, accompanied by a gentle melancholy at their transience—is the philosophical twin of *Wabi-sabi*.

### Applied to Modern Software and AI Systems:
1. **The Myth of the Finished Model**:
   - Software engineering historically prized immutable, pristine architectures. But modern AI systems are living, decaying statistical organisms: models hallucinate, embeddings drift, GPUs exhaust VRAM, vendor APIs deprecate overnight.
2. **Kintsugi as Engineering Postmortem**:
   - In traditional engineering, failures are hidden, wiped, or papered over with PR spin.
   - In wAIbi-sabi, systems failures (the Klarna replacement claim, the 95% LLM cost reduction myth, the vector DB obsession) are fractured open deliberately. The crack reveals the exact failure mechanism.
   - The gold urushi repair is the postmortem analysis: the rigorous benchmark, the architectural lesson, the battle-tested truth that outlasts the hype.
   - The fracture line is not an error to be erased; it is the most valuable feature of the system.
