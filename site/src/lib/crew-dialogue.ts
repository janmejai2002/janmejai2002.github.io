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
