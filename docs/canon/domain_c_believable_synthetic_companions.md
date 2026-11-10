# Canon: Believable Companions & Ambient Synthetic Agents

## 1. Bruce Blumberg & Synthetic Characters Group (MIT Media Lab, 1996–2002)
*\"Action Selection in Hamsterdam\", \"Building Believable Creatures\", and \"Multi-Level Control of Autonomous Synthetic Agents\"*

### The Ethological Model of Action Selection
Bruce Blumberg, working at the MIT Media Lab, investigated how to build autonomous synthetic creatures (such as Silas the dog and autonomous robotic animals) that feel genuinely alive, intentional, and dignified rather than robotic or reactive:
- **Autonomous Internal Drives**: A creature must not simply wait for external user input like a command-line script or an obedient chatbot. It must possess internal motivational variables—energy, curiosity, fatigue, social comfort, playfulness. In the absence of external input, the creature pursues its own internal goals (e.g., sleeping, grooming, gazing across the horizon, arranging its craft tools).
- **Hierarchical Releasing Mechanisms & Competency Groups**: Behavior is organized hierarchically. Low-level motor controllers handle continuous equilibrium, spring physics, and inverse kinematics (e.g., pupils tracking a moving stimulus, chest expanding with respiration). Mid-level action selectors resolve competing desires (e.g., should Oops fix the bowl or scramble away in panic?). High-level episodic state machines orchestrate narrative arcs over prolonged time horizons.
- **The Dignity of Inattention & Silence**: Real living creatures do not stare unblinkingly at humans or beg for attention. A sleeping cat, a potter focused on spinning clay, or an owl perched quietly in a cedar tree is compelling precisely because it is self-contained. Silence is not an absence of interaction; it is a manifestation of presence and composure.

---

## 2. Mascot Anti-Patterns: The Clippy Anatomy of Failure
*Why Office Assistant \"Clippy\" and Modern AI Chat Popups Cause Cognitive Revulsion*

Microsoft Clippy (and its modern incarnation: floating AI chatbot bubbles with pulsating notification badges in the bottom-right corner of SaaS websites) is widely considered the quintessential user interface antipattern. Why do users detest it?
1. **Unsolicited Cognitive Hijacking**: Clippy interrupted the user's active mental model with modal dialogs (\"It looks like you're writing a letter!\"). It converted a private, focused creative workspace into an annoying social confrontation.
2. **False Agency & Brittle Heuristics**: Clippy pretended to understand human intent while running naive substring matching, causing profound embarrassment and loss of trust.
3. **Repetitive, Performative Animation**: Every time Clippy moved, it tapped the glass, morphed into a bicycle, or blinked frantically, forcing the human eye to track irrelevant movement.
4. **Chat Spam vs. Tactile Physics**: Clippy forced communication into clumsy text speech bubbles, ignoring that humans communicate far more naturally through physical embodiment, spatial positioning, and tactile resistance.

---

## 3. The Living Terrarium & Handcrafted Netsuke Model
*The Antidote: Tactile Pottery Figurines Inhabiting Negative Space*

To liberate synthetic web companions from the Clippy trap, **wAIbi-sabi** implements the **Living Terrarium**:
- **Mascots as Handcrafted Ceramic Netsuke**: Oops, Tsugi, Kiki, Fude, and Uso are not animated cartoons or conversational customer support bots. They are heavy, textured pottery figurines (netsuke / hanko seals) resting on the negative space of a cedar workbench or ceramic plate.
- **Micro-Sensory Kinematics over Speech**:
  - Gaze Inverse Kinematics: Their pupils track the pointer subtly within physically realistic angular limits (no creepy 360-degree rotations).
  - Harmonic Respiration: Subtle sine-wave breathing expansion (0.8Hz to 1.8Hz) with distinct phase offsets ensures they feel biologically asynchronous.
  - Spring-Damper Inertia: When bumped or dragged, their bodies behave like real clay figurines with mass, stiffness, and damping, exhibiting authentic squash-and-stretch ($S_x, S_y$).
- **Strict Speech Budgeting & Bayesian Invariance**: Mascots speak only when a significant narrative inflection point is reached (e.g. fracture impact, repair completion, reaching the climax of an article). Their dialogue is concise (under 8 words), poetic, and self-clearing.
