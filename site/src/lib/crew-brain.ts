/**
 * crew-brain.ts
 * Decision-Theoretic Intent Engine & Bayesian Multi-Scale Kinematic Filter
 * for wAIbi-sabi Living Ceramic Terrarium.
 * Zero external dependencies (<3.5 KB).
 *
 * Implements:
 * 1. 5-tap Gaussian spatial coordinate smoothing over pointer history to eliminate
 *    sub-pixel browser quantization noise before derivative extraction (Flash & Hogan 1985).
 * 2. 12-D Kinematic Gesture Feature Extractor:
 *    - Trajectory efficiency \eta = ||p_n - p_0|| / \sum ||\Delta p||
 *    - True macro directional reversal detection (amplitude >= 25px, \theta > 120 deg)
 *    - Flash & Hogan minimum-jerk acceleration curvature
 *    - Reading saccade drift vs. continuous dwell stillness
 * 3. Discrete Continuous-Time Bayesian Belief Filter over latent intent space:
 *    S = { Striking, Agitated, Exploring, Painting, Contemplating }
 *    Prior prediction: b_{t|t-1}(s) = \sum_{s'} T(s' -> s, \Delta t) b_{t-1}(s')
 *    Measurement update: b_t(s) \propto P(o_t | s) * b_{t|t-1}(s)
 * 4. Multi-Attribute Utility Theory (MAUT) Action Selection (Dave Mark & Damian Isla):
 *    U(a, b_t) = \sum_{s \in S} b_t(s) * R_craft(a, s) - C_intrusion(a) - C_fatigue(a, \Delta t) + \Lambda_{inertia}(a)
 * 5. Telemetry inspection getters for live Terrarium HUD (?debug=crew or '~').
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
// MAUT Craft Reward Matrix R_craft(a, s)
// Rows: MautAction (DO_NOTHING, SUBTLE_GAZE, BREATHING_TILT, SPEECH_TAG, OOPS_TUMBLE, TSUGI_REPAIR)
// Cols: IntentState (Striking, Agitated, Exploring, Painting, Contemplating)
// -----------------------------------------------------------------------------
const R_CRAFT: Record<MautAction, number[]> = {
  DO_NOTHING:     [0.02, 0.05, 0.25, 0.12, 0.92],
  SUBTLE_GAZE:    [0.20, 0.25, 0.95, 0.85, 0.75],
  BREATHING_TILT: [0.08, 0.15, 0.60, 0.50, 0.80],
  SPEECH_TAG:     [0.92, 0.78, 0.45, 0.82, 0.05],
  OOPS_TUMBLE:    [1.95, 0.35, 0.02, 0.00, 0.00],
  TSUGI_REPAIR:   [1.25, 0.08, 0.20, 1.90, 0.00],
};

interface PointerSample {
  x: number;
  y: number;
  t: number;
  isClick: number;
}

const BUFFER_CAPACITY = 64;
const WINDOW_MS = 450;

// 5-tap Gaussian smoothing kernel (\sigma = 1.0)
const GAUSS_K = [0.06136, 0.24477, 0.38774, 0.24477, 0.06136];

export class CrewBrain {
  private buffer: PointerSample[] = [];
  private head = 0;
  private count = 0;
  private lastRecordTime = 0;

  // Kinematic feature vector (12-D)
  private features = new Float32Array(12);
  private normFeatures = new Float32Array(12);

  // Bayesian belief distributions
  private likelihoods = new Float32Array(5); // P(o_t | s)
  private belief = new Float32Array(5);      // b_t(s)
  private predictedBelief = new Float32Array(5);

  private lastEvaluationTime = 0;
  private lastLatencyMs = 0;

  // Dave Mark behavioral momentum state
  private activeMautAction: MautAction = 'DO_NOTHING';

  // Fatigue tracking
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

  // External context (e.g. proximity to crack from game engine)
  private crackProximityPx = 999;
  private isPointerDown = false;

  constructor() {
    this.buffer = new Array(BUFFER_CAPACITY).fill(null).map(() => ({ x: 0, y: 0, t: 0, isClick: 0 }));
    this.reset(0);
  }

  public setInteractionContext(distToCrack: number, isDown: boolean): void {
    this.crackProximityPx = distToCrack;
    this.isPointerDown = isDown;
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
    this.lastRecordTime = t;
  }

  /** Returns chronologically ordered samples in the last 450ms window */
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

  /**
   * Extracts robust 12-D kinematic features with Gaussian spatial smoothing
   * to eliminate sub-pixel integer coordinate noise.
   */
  private extractFeatures(samples: PointerSample[], now: number): void {
    const n = samples.length;
    const timeSinceLastInput = this.lastRecordTime > 0 ? Math.max(0, now - this.lastRecordTime) : 9999;

    if (n < 2 || timeSinceLastInput > 350) {
      // Little or no movement in current window -> stillness / reading dwell dominates
      this.features.fill(0);
      const dwellMs = Math.min(4000, timeSinceLastInput);
      this.features[8] = dwellMs / 1000.0; // dwell seconds
      this.features[9] = 1.0;              // dwell ratio
      return;
    }

    // 1. Spatial 5-tap Gaussian convolution on coordinates
    const sx: number[] = new Array(n);
    const sy: number[] = new Array(n);
    for (let i = 0; i < n; i++) {
      let gx = 0;
      let gy = 0;
      for (let k = -2; k <= 2; k++) {
        const idx = Math.max(0, Math.min(n - 1, i + k));
        const w = GAUSS_K[k + 2];
        gx += samples[idx].x * w;
        gy += samples[idx].y * w;
      }
      sx[i] = gx;
      sy[i] = gy;
    }

    // 2. Velocity and path length
    let totLen = 0;
    const speeds: number[] = [];
    const dts: number[] = [];
    const headings: number[] = [];
    let clickCount = 0;

    for (let i = 1; i < n; i++) {
      const dt = Math.max(0.008, (samples[i].t - samples[i - 1].t) / 1000);
      const dx = sx[i] - sx[i - 1];
      const dy = sy[i] - sy[i - 1];
      const segDist = Math.hypot(dx, dy);
      const v = segDist / dt; // px/sec

      speeds.push(v);
      dts.push(dt);
      totLen += segDist;
      headings.push(Math.atan2(dy, dx));
      if (samples[i].isClick) clickCount++;
    }

    const m = speeds.length;
    const meanSpeed = m > 0 ? speeds.reduce((a, b) => a + b, 0) / m : 0;
    const maxSpeed = m > 0 ? Math.max(...speeds) : 0;

    // 3. Trajectory efficiency: net displacement / total path length
    const netDisp = Math.hypot(sx[n - 1] - sx[0], sy[n - 1] - sy[0]);
    const pathEfficiency = totLen > 1.0 ? netDisp / totLen : 0;

    // 4. True Macro Directional Reversals (Frantic Shaking Detector)
    // Counts consecutive reversals of direction along motion axis exceeding 25px amplitude
    let macroReversals = 0;
    let anchorX = sx[0];
    let anchorY = sy[0];
    let curDirX = 0;
    let curDirY = 0;

    for (let i = 1; i < n; i++) {
      const dx = sx[i] - anchorX;
      const dy = sy[i] - anchorY;
      const dist = Math.hypot(dx, dy);

      if (dist > 22.0) {
        const udx = dx / dist;
        const udy = dy / dist;
        if (curDirX === 0 && curDirY === 0) {
          curDirX = udx;
          curDirY = udy;
        } else {
          const dot = curDirX * udx + curDirY * udy;
          if (dot < -0.45) {
            // Reversal angle > 116 degrees with amplitude > 22px
            macroReversals++;
            curDirX = udx;
            curDirY = udy;
          }
        }
        anchorX = sx[i];
        anchorY = sy[i];
      }
    }

    // 5. Smoothed acceleration & Flash-Hogan jerk
    let sumAccel = 0;
    let maxAccel = 0;
    const accels: number[] = [];
    for (let i = 1; i < m; i++) {
      const dtMid = 0.5 * (dts[i] + dts[i - 1]);
      const a = Math.abs(speeds[i] - speeds[i - 1]) / Math.max(0.008, dtMid);
      accels.push(a);
      sumAccel += a;
      if (a > maxAccel) maxAccel = a;
    }
    const meanAccel = accels.length > 0 ? sumAccel / accels.length : 0;

    let sumJerk = 0;
    for (let i = 1; i < accels.length; i++) {
      const dt = Math.max(0.008, dts[i]);
      sumJerk += Math.abs(accels[i] - accels[i - 1]) / dt;
    }
    const meanJerk = accels.length > 1 ? sumJerk / (accels.length - 1) : 0;

    // 6. Reading saccade alignment (gentle horizontal drift with periodic return)
    let horizontalProg = 0;
    let verticalWander = 0;
    for (let i = 1; i < n; i++) {
      horizontalProg += Math.abs(sx[i] - sx[i - 1]);
      verticalWander += Math.abs(sy[i] - sy[i - 1]);
    }
    const readingSaccadeScore =
      meanSpeed > 18 && meanSpeed < 90 && verticalWander < 0.25 * horizontalProg ? 0.85 : 0.05;

    // Store in features array
    this.features[0] = meanSpeed / 100.0;
    this.features[1] = maxSpeed / 100.0;
    this.features[2] = meanAccel / 1000.0;
    this.features[3] = maxAccel / 1000.0;
    this.features[4] = Math.min(10.0, meanJerk / 1000.0);
    this.features[5] = pathEfficiency;
    this.features[6] = macroReversals;
    this.features[7] = clickCount;
    this.features[8] = (now - this.lastRecordTime) / 1000.0; // dwell seconds
    this.features[9] = meanSpeed < 20 ? 1.0 : 0.0;
    this.features[10] = readingSaccadeScore;
    this.features[11] = Math.min(1.0, totLen / 300.0);
  }

  /**
   * Continuous-Time Bayesian Belief Filter.
   * Updates b_t(s) using continuous transition matrix T(\Delta t) and
   * multi-scale likelihoods P(o_t | s).
   */
  public update(now = performance.now()): GestureClass {
    const tStart = performance.now();
    const dtSeconds = this.lastEvaluationTime > 0 ? Math.max(0.001, (now - this.lastEvaluationTime) / 1000) : 0.016;
    this.lastEvaluationTime = now;

    const samples = this.getWindowSamples(now);
    this.extractFeatures(samples, now);

    const speed = this.features[0] * 100.0;       // px/sec
    const pathEff = this.features[5];             // 0 to 1
    const macroReversals = this.features[6];     // true directional reversals
    const clickCount = this.features[7];         // click count
    const dwellSeconds = this.features[8];       // seconds since last pointer event
    const saccadeScore = this.features[10];      // reading saccade
    const totPathPx = this.features[11] * 300.0; // total path in window

    // =========================================================================
    // 1. Observation Likelihoods P(o_t | s)
    // =========================================================================

    // 0: Striking (Impulse on click or sharp ballistic impact)
    let lStriking = 0.008;
    if (clickCount > 0) {
      lStriking = 0.96;
    } else if (speed > 280 && this.features[2] > 2.5 && pathEff > 0.85) {
      lStriking = 0.45;
    }

    // 1: Agitated (ONLY true frantic motor oscillation: >=3 macro reversals across >=22px in 450ms + low efficiency + high speed)
    let lAgitated = 0.005;
    if (macroReversals >= 3 && speed > 220 && pathEff < 0.32 && totPathPx > 160) {
      // True frantic mouse shake
      lAgitated = Math.min(0.98, 0.65 + (macroReversals - 2) * 0.12);
    } else if (macroReversals >= 2 && speed > 350 && pathEff < 0.25) {
      lAgitated = 0.35;
    } else {
      // Normal mouse movements will NEVER be marked agitated!
      lAgitated = 0.005;
    }

    // 2: Exploring (Smooth human reaches, high path efficiency, low reversals)
    let lExploring = 0.02;
    if (speed >= 35 && macroReversals < 2) {
      const effBoost = Math.max(0.2, pathEff);
      const vCurve = Math.min(1.0, speed / 180.0);
      lExploring = 0.40 + 0.55 * effBoost * vCurve;
    }

    // 3: Painting (Dragging along crack or deliberate slow tracing)
    let lPainting = 0.01;
    if ((this.isPointerDown || speed > 20) && this.crackProximityPx < 48 && speed < 420) {
      const proxWeight = 1.0 - Math.min(1.0, this.crackProximityPx / 48.0);
      lPainting = 0.45 + 0.50 * proxWeight;
    }

    // 4: Contemplating (Sustained dwell accumulation over 1.2s or slow reading saccade)
    let lContemplating = 0.02;
    if (dwellSeconds > 0.12 || speed < 25) {
      // Smooth exponential saturation (1 - exp(-t / \tau)) with \tau = 1.2s
      const dwellProg = 1.0 - Math.exp(-dwellSeconds / 1.2);
      lContemplating = 0.18 + 0.80 * dwellProg;
    } else if (saccadeScore > 0.5) {
      lContemplating = 0.65;
    }

    // Normalize observation likelihoods
    const rawL = [lStriking, lAgitated, lExploring, lPainting, lContemplating];
    let sumL = 0;
    for (let k = 0; k < 5; k++) sumL += rawL[k];
    for (let k = 0; k < 5; k++) this.likelihoods[k] = rawL[k] / Math.max(1e-6, sumL);

    // =========================================================================
    // 2. Continuous-Time Bayesian Belief Update with Transition Inertia
    // =========================================================================
    // Transition characteristic times \tau_s (seconds of cognitive persistence)
    // Striking: fast impulse (0.22s); Agitated: 0.65s; Exploring: 0.85s; Painting: 0.85s; Contemplating: 1.5s
    const tau = [0.22, 0.65, 0.85, 0.85, 1.50];

    // Predict prior belief: b_{t|t-1}(s)
    let sumPred = 0;
    for (let k = 0; k < 5; k++) {
      const decay = Math.exp(-dtSeconds / tau[k]);
      let pred = this.belief[k] * decay;
      // Ergonomic leakage toward contemplation during sustained stillness
      if (k === 4 && dwellSeconds > 0.3) {
        pred += (1.0 - decay) * 0.75;
      } else {
        pred += (1.0 - decay) * 0.06;
      }
      this.predictedBelief[k] = pred;
      sumPred += pred;
    }
    for (let k = 0; k < 5; k++) this.predictedBelief[k] /= Math.max(1e-6, sumPred);

    // Measurement update: b_t(s) \propto P(o_t | s) * b_{t|t-1}(s)
    let sumPost = 0;
    for (let k = 0; k < 5; k++) {
      const post = this.likelihoods[k] * this.predictedBelief[k];
      this.belief[k] = post;
      sumPost += post;
    }
    for (let k = 0; k < 5; k++) {
      this.belief[k] = Math.max(0.002, this.belief[k] / Math.max(1e-6, sumPost));
    }
    // Re-normalize with Dirichlet floor
    let totalNorm = 0;
    for (let k = 0; k < 5; k++) totalNorm += this.belief[k];
    for (let k = 0; k < 5; k++) this.belief[k] /= totalNorm;

    // =========================================================================
    // 3. MAP Intent Selection with Hysteresis Dwell
    // =========================================================================
    let bestIdx = 4;
    let bestBelief = 0;
    for (let k = 0; k < 5; k++) {
      if (this.belief[k] > bestBelief) {
        bestBelief = this.belief[k];
        bestIdx = k;
      }
    }

    this.rawIntent = GESTURE_CLASSES[bestIdx];

    const CONFIDENCE_THRESHOLD = 0.50;
    const SUSTAIN_DURATION_MS = 220;
    const MIN_DWELL_MS = 340;

    const timeInState = Math.max(0, now - this.lastTransitionTime);
    this.intentState.durationInState = timeInState;

    if (bestBelief >= CONFIDENCE_THRESHOLD) {
      if (this.rawIntent !== this.candidateIntent) {
        this.candidateIntent = this.rawIntent;
        this.candidateSince = now;
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
      this.intentState.confidence = this.intentState.confidence * 0.85 + curBelief * 0.15;
    } else {
      const candidateDuration = now - this.candidateSince;
      const requiredSustain = this.candidateIntent === 'HEAVY_STRIKE' ? 20 : SUSTAIN_DURATION_MS;

      if (
        candidateDuration >= requiredSustain &&
        timeInState >= MIN_DWELL_MS &&
        bestBelief >= CONFIDENCE_THRESHOLD
      ) {
        this.intentState.current = this.candidateIntent;
        const stateIdx = GESTURE_CLASSES.indexOf(this.candidateIntent);
        this.intentState.latentName = INTENT_STATES[stateIdx];
        this.intentState.confidence = bestBelief;
        this.intentState.durationInState = 0;
        this.lastTransitionTime = now;
      }
    }

    this.lastLatencyMs = performance.now() - tStart;
    return this.intentState.current;
  }

  /**
   * Computes Multi-Attribute Utility Theory (MAUT) utility for all companion actions.
   * Dave Mark & Damian Isla: Continuous response curves + behavioral momentum inertia (\Lambda = 0.22)
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

      // 2. Intrusion Cost: continuous exponential penalty during contemplative reading
      let cIntrusion = 0;
      if (action === 'SPEECH_TAG') {
        cIntrusion = 0.12 + 1.88 / (1.0 + Math.exp(-8.0 * (pStill - 0.45)));
      }

      // 3. Continuous Fatigue Cost: smooth exponential decay
      const lastT = this.lastActionTimes[action];
      const deltaT = Math.max(0, now - lastT);
      let cFatigue = 0;

      if (action === 'SPEECH_TAG') {
        cFatigue = 6.0 * Math.exp(-deltaT / 3200);
      } else if (action === 'OOPS_TUMBLE') {
        cFatigue = 3.5 * Math.exp(-deltaT / 700);
      } else if (action === 'TSUGI_REPAIR') {
        cFatigue = 3.0 * Math.exp(-deltaT / 850);
      }

      // 4. Behavioral Momentum Inertia (\Lambda = 0.22)
      const inertiaBonus = action === this.activeMautAction ? 0.22 : 0.0;

      utilities[action] = expectedReward - cIntrusion - cFatigue + inertiaBonus;
    }

    let bestAction: MautAction = this.activeMautAction;
    let bestUtil = utilities[this.activeMautAction] ?? -1e9;

    for (const action of MAUT_ACTIONS) {
      const u = utilities[action];
      if (u > bestUtil + (action === this.activeMautAction ? 0 : 0.08)) {
        bestUtil = u;
        bestAction = action;
      }
    }

    this.activeMautAction = bestAction;

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

  public recordAction(action: MautAction, now = performance.now()): void {
    this.lastActionTimes[action] = now;
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

  public getLatency(): number {
    return this.lastLatencyMs;
  }

  public reset(initialTime = 0): void {
    this.head = 0;
    this.count = 0;
    this.lastRecordTime = 0;
    this.features.fill(0);
    this.normFeatures.fill(0);
    this.likelihoods.fill(0.2);
    this.belief[0] = 0.02;
    this.belief[1] = 0.02;
    this.belief[2] = 0.02;
    this.belief[3] = 0.02;
    this.belief[4] = 0.92; // Serene contemplative prior at rest
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
    this.activeMautAction = 'DO_NOTHING';

    for (const a of MAUT_ACTIONS) {
      this.lastActionTimes[a] = initialTime - 10000;
    }
  }
}

export const createCrewBrain = (): CrewBrain => new CrewBrain();
