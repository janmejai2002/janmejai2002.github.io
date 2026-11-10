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
    getMaxRadius,
    settle,
  };
}
