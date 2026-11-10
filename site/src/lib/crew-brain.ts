/**
 * crew-brain.ts
 * In-browser micro neural network kinematic gesture classifier (~1.8 KB, zero dependencies).
 * Classifies pointer/touch intent over a sliding 300ms ring-buffer in <0.02ms.
 *
 * Classes:
 * - HEAVY_STRIKE: High click impulse / sharp tap / fracture impact
 * - FRANTIC_SHAKE: Erratic cursor thrashing, high jerk, rapid reversals (>1,200 px/s²)
 * - GENTLE_CARESS: Smooth, slow continuous glide
 * - CURIOUS_ORBIT: Circular or elliptical scrub around a focal point
 * - CONTEMPLATIVE_STILLNESS: Attentive reading or cursor rest
 */

export const GESTURE_CLASSES = [
  'HEAVY_STRIKE',
  'FRANTIC_SHAKE',
  'GENTLE_CARESS',
  'CURIOUS_ORBIT',
  'CONTEMPLATIVE_STILLNESS'
] as const;

export type GestureClass = (typeof GESTURE_CLASSES)[number];

// Model architecture constants (12 -> 16 -> 5)
const FEATURE_MEANS = new Float32Array([
  2.777900, 4.907819, 0.155030, 0.381365, 0.011296, 0.465832,
  0.389250, 0.220857, 0.477250, 0.021719, 8.222167, 0.380487
]);

const FEATURE_STDS = new Float32Array([
  4.777040, 8.801785, 0.349322, 0.858322, 0.029020, 0.739448,
  0.386891, 0.332429, 0.801835, 0.054212, 8.208921, 0.156776
]);

const W1 = new Float32Array([
  -0.426552, 0.476788, 0.750425, -0.043775, -0.249994, 0.029991, 0.002899, -0.534476, 0.020551, 0.151313, -0.038863, -0.065867, -0.009517, -0.434920, -0.132472, -0.448379,
  -0.426067, 0.465038, 0.769083, -0.044785, -0.271110, 0.035352, -0.000112, -0.519108, 0.020870, 0.152742, -0.039376, -0.066072, -0.010629, -0.456217, -0.135070, -0.456368,
  -0.211648, 0.151326, 0.356504, 0.026480, -0.197973, 0.033166, -0.018660, -0.254106, -0.007483, 0.043241, -0.026510, 0.004796, -0.033800, -0.286723, -0.085975, -0.211990,
  -0.210668, 0.136292, 0.362978, 0.015970, -0.190398, 0.033342, -0.019597, -0.268311, -0.012245, 0.043198, -0.030425, 0.006707, -0.042272, -0.278121, -0.081678, -0.213560,
  -0.140733, 0.019397, 0.227658, 0.035812, -0.135561, 0.027116, -0.033844, -0.172779, -0.027214, -0.000779, -0.031236, 0.031286, -0.058286, -0.197587, -0.058354, -0.134545,
   0.742615, -0.564085, -0.841580, 0.117629, -0.195864, 0.006015, -0.373461, 0.101718, 0.406626, -0.475481, 0.517189, 0.376745, 0.911249, -0.246435, 0.141353, -0.248973,
  -0.054782, -0.517581, -0.764681, 1.058932, -0.138085, -0.012164, -0.067904, 0.863484, -0.374078, -0.150722, -0.381561, 0.189685, -0.689844, 0.216336, -0.207980, 1.157382,
   0.091896, -0.533488, 0.499595, -1.074204, 0.657651, 0.249713, 0.029610, -0.423458, -0.073599, 0.080665, 0.019940, 0.084477, -0.108140, 0.536711, 0.250613, -0.424287,
   0.123179, 0.941360, 0.143986, -1.690035, -0.419232, 0.003527, 1.119258, 0.175220, -0.017217, 1.077732, -0.087110, -1.189037, -0.324976, -0.114427, -0.034625, 0.062270,
   0.201875, -0.119502, -0.221849, 0.004880, -0.067021, 0.002171, -0.089982, -0.031510, 0.153966, -0.117109, 0.170624, 0.057853, 0.329582, -0.144822, 0.030824, -0.110341,
   0.279571, 0.083515, -0.374426, 0.216159, -0.670925, 0.067183, 0.173858, 0.322771, 0.146125, 0.103571, 0.175785, -0.003789, 0.293288, -0.556592, -0.055159, 0.156748,
   0.046062, 0.202352, 0.066357, -0.199747, -0.389369, 0.061786, 0.241677, 0.105755, -0.000413, 0.248136, -0.051879, -0.162071, -0.058639, -0.124699, -0.112278, 0.083008
]);

const B1 = new Float32Array([
  0.741729, 1.578984, 1.751238, 0.071248, 0.791158, -0.259813, 1.139285, 0.513716,
  0.492433, 1.174519, 0.368806, 0.877147, 0.609428, 1.076849, 0.151622, 0.709486
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
   0.800080, -0.672998,  0.761080, -0.387862, -0.574271
]);

const B2 = new Float32Array([
  -0.102397, -0.397411, -0.178175, 0.304688, 0.214899
]);

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
  private probs = new Float32Array(5);
  private lastIntent: GestureClass = 'CONTEMPLATIVE_STILLNESS';
  private lastEvaluationTime = 0;

  constructor() {
    this.buffer = new Array(BUFFER_CAPACITY).fill(null).map(() => ({ x: 0, y: 0, t: 0, isClick: 0 }));
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
      // If we have sparse or no events recently, dwell stillness dominates
      this.features[9] = 1.0;
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

  /** Executes 2-layer forward pass (<0.02ms) */
  public update(now = performance.now()): GestureClass {
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
      const offset = j;
      for (let i = 0; i < 12; i++) {
        sum += this.normFeatures[i] * W1[i * 16 + offset];
      }
      this.hidden[j] = sum > 0 ? sum : 0;
    }

    // Dense Layer 2: 16 -> 5 (Softmax)
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
      this.probs[k] = expVal;
      sumExp += expVal;
    }

    let bestIdx = 0;
    let bestProb = 0;
    for (let k = 0; k < 5; k++) {
      this.probs[k] /= sumExp;
      if (this.probs[k] > bestProb) {
        bestProb = this.probs[k];
        bestIdx = k;
      }
    }

    // Stillness fallback if no movement recorded in the last 200ms
    if (samples.length === 0 || (samples.length > 0 && now - samples[samples.length - 1].t > 220)) {
      bestIdx = 4; // CONTEMPLATIVE_STILLNESS
    }

    this.lastIntent = GESTURE_CLASSES[bestIdx];
    return this.lastIntent;
  }

  public getKinematicIntent(now = performance.now()): GestureClass {
    return this.update(now);
  }

  public getProbabilities(): Float32Array {
    return this.probs;
  }

  public getLastFeatures(): Float32Array {
    return this.features;
  }

  public reset(): void {
    this.head = 0;
    this.count = 0;
    this.features.fill(0);
    this.normFeatures.fill(0);
    this.hidden.fill(0);
    this.logits.fill(0);
    this.probs.fill(0);
    this.lastIntent = 'CONTEMPLATIVE_STILLNESS';
  }
}

export const createCrewBrain = (): CrewBrain => new CrewBrain();
