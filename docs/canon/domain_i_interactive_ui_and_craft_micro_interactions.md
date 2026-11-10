# Domain I: Interactive UI Systems, Explorable Explanations, and Craft Micro-Interactions

## 1. Subdued Ambient Feedback: The Stripe & Linear Design Philosophies

The standard for modern digital craft is defined by restraint, tactile precision, and invisible state mechanics. Both Stripe and Linear demonstrate that high-status engineering tools build profound trust through what they *refrain* from doing.

### Linear: The Discipline of Invisible Precision
- **Eradication of Performative Delight**:
  - In consumer apps, design often relies on "performative delight"—bouncing modals, celebratory confetti, celebratory mascot speech bubbles, and bouncy spring curves.
  - Linear rejects this: software should feel like a calibrated Leica camera or a Dieter Rams calculator. When an issue is moved or an action completed, the feedback is near-instantaneous (sub-50ms), quiet, and localized.
  - **The 1px Hairline Aesthetic**:
    - Structural separation is achieved through subtle opacity shifts (`rgba(255, 255, 255, 0.08)` or `var(--line)`), never thick black borders or garish dropshadows.
    - Negative space and strict typography carry the hierarchy; borders exist only to demarcate hit targets and semantic seams.
- **Subdued Ambient Feedback**:
  - State changes happen in-place without shifting surrounding document layout (Zero Cumulative Layout Shift - CLS = 0).
  - Hover states are soft washes (2%–5% opacity shifts) rather than sudden color inversions.
  - The interface remains in a resting, dignified posture until explicitly summoned by the user's intent.

### Stripe: Mechanical Elegance & Tactile Integrity
- **Micro-Transitions as Logic Communicators**:
  - At Stripe, animation is never decorative; it is spatial continuity. When a navigation drawer expands or a payment modal reveals secondary inputs, elements morph along predictable geometric vectors.
  - The user's eye is never disoriented. Every pixel transition preserves the user's mental model of where state resides.
- **The Elimination of the "Chatty Assistant" Trap**:
  - Stripe's documentation and dashboard interfaces never feature a floating animated avatar or a conversational popover asking "Can I help you calculate your API fees?"
  - Support, telemetry, and critical caveats are embedded directly in the visual flow as clean, monospaced inline callouts or quiet margin indicators.

---

## 2. Explorable Explanations & Active Reading: Bret Victor & The Pudding

Reading complex technical and economic journalism should not be a passive chore of scrolling past static walls of text, nor should it be interrupted by arbitrary video game mechanics.

### Bret Victor: Reactive Documents and Direct Manipulation
- In *Explorable Explanations* and *Up and Down the Ladder of Abstraction*, Bret Victor established that true computational mediums should allow readers to poke, slide, and stress-test assumptions directly within the prose.
- **The Active Document Paradigm**:
  - When an author claims: *"At 500ms latency, user drop-off surges by 18%,"* the number 500ms should be an interactive slider or toggle. As the reader drags it, the adjacent curve recalculates live.
  - The interactive graphic is not a separate novelty widget; it is an active mathematical clause in the sentence.
- **Application to wAIbi-sabi**:
  - The landing hero plate (`site/src/pages/index.astro`) is an active document: it presents a real enterprise claim (e.g., *"Klarna slashed customer service costs by 40% with AI"*), fractures it at the precise structural point of failure, and mends it with the audited investigative reality.
  - The interaction serves comprehension of the editorial thesis, not entertainment.

### The Pudding: Narrative Scrollytelling without Gimmicks
- *The Pudding* demonstrates that visual journalism excels when visual assets are tightly locked to reading position.
- **Visual Continuity over Viewport Hijacking**:
  - The reader retains 100% control over scroll speed and reading cadence. The interface never hijacks scroll momentum, never locks the screen unexpectedly, and never forces the reader to watch a canned 5-second mascot animation before continuing.
  - Graphics mutate silently as the reader crosses section thresholds, providing contextual evidence exactly when the thesis demands it.

---

## 3. Micro-Interactions, Tactile Physics, and Invisible Interfaces: Rauno Freiberg & Paco Coursey

Modern interface pioneers like Rauno Freiberg (Vercel) and Paco Coursey (Craft, Family) have formalized the mathematics of tactile digital interactions.

### The Mathematics of Tactile Restraint (Rauno Freiberg)
- **Spring Physics without Bounce**:
  - Overdamped and critically damped springs ($$\zeta \ge 1.0$$) are essential for serious, dignified interfaces.
  - Underdamped oscillations ($$\zeta < 1.0$$), where elements bounce, wobble, or overshoot their targets, read as toy-like and cartoonish.
  - When a figurine or UI card settles, it snaps into place with a crisp, decisive deceleration curve:
    $$x(t) = e^{-\omega_0 t} (c_1 + c_2 t)$$
- **Invisible Interfaces & Focused Density**:
  - Controls should appear only when relevant and vanish into the paper grain when idle.
  - Micro-interactions (such as copying a code snippet, expanding a footnote, or inspecting a kintsugi fracture coordinate) should provide feedback through subtle haptic or visual micro-shifts (a quiet checkmark, a brief gold shimmer along the seam), never full-screen alerts.

### Paco Coursey: Spatial Sound & Gestural Respect
- **Tactile Soundscapes**:
  - Auditory feedback in digital interfaces must resemble the muted click of a high-end mechanical watch or the soft ceramic scrape of a tea cup resting on wood—sub-audible, transient, and felt rather than heard.
  - High-pitched "game-style" beeps or synthetic chirps destroy reader focus.
- **Respect for Reader Agency**:
  - The interface must never initiate an unprompted conversation. An ambient agent that pops up an unprompted message is the digital equivalent of an impolite stranger tapping your shoulder while you are reading a book.
  - Silence is the default state; utility is delivered only upon explicit query or focus.

---

## 4. The wAIbi-sabi Interface Contract: Engineering Invariants

To align the codebase with these design principles, all future frontend work on `site/` must obey the following architectural invariants:

1. **Serene Hero on Initial Load**:
   - The landing page hero plate must render completely settled, clean, and serene upon initial page load.
   - No unsolicited fracture animations, no shaking or vibrating elements, and zero automatic dialogue triggers.
2. **Eradication of Unprompted Speech Modals**:
   - The `<span class="crew-say">` speech bubble timer loop in `site/src/pages/index.astro` is permanently removed.
   - Companion figurines communicate exclusively through quiet resting postures, physical interaction states (e.g. Tsugi lifting a brush when a mend is active), or subtle, stationary attribution text.
3. **Subtle Hairline Badges in Article Anatomy**:
   - In `Post.astro`, the article brief (`ahead__brief`) replaces vague "agentic team" fluff with crisp, authoritative domain lens attribution:
     ```html
     <div class="ahead__lens">
       <span class="lens-tag">Audited by Uso · Business & Unit Economics Lens</span>
       <p class="lens-perspective">“Let me just hold this up to the light.”</p>
     </div>
     ```
   - This communicates the critical angle of the essay to an executive or senior engineer in under 2 seconds.
4. **Data-Ink Ratio Preservation**:
   - Any visual element that does not directly assist reading, clarify a failure point, or anchor navigation is eliminated.
