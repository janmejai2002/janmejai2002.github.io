/**
 * The archive bowl's seams, in the same live gold as the hero plate
 * (lib/gold.ts), drawn by WebGL2 on one canvas over the pieces.
 *
 * The seam geometry is not shipped separately: it is read back out of the
 * shard paths already in the page. Every join is one segment drawn once, as a
 * short capsule whose depth is its distance from the crown, so where segments
 * meet the brighter crown always wins and the joins are invisible.
 *
 * The canvas turns with the pieces (it sits inside the same CSS-rotated layer),
 * so turning the bowl costs no geometry, only a redraw because the light, which
 * stays in the room, now falls on the seams from a different side. It draws only
 * when something changes, and never in a loop of its own.
 *
 * Without WebGL2 this returns null and the SVG seams stay in charge.
 */
import { GOLD_GLSL, GOLD_FALL_GLSL, goldBase, cssRgb } from '../lib/gold';


const SIZE = 1000;
const C = SIZE / 2;
const R = 476;

/** Per-piece state, set by scripts/bowl.ts before each draw. */
export interface CellState {
  read: boolean;
  /** Lifted clear of the bowl (hover) or taken out: its own SVG seam shows. */
  lifted: boolean;
  /** Dimmed by the reader's filter. */
  off: boolean;
  /** 0..1 while Tsugi is gilding it, else -1. */
  gild: number;
}

export interface BowlGold {
  /** Redraw on the next frame. Cheap to call often: frames coalesce. */
  draw(): void;
  /** The light, in viewBox units of the turned layer. */
  setLight(x: number, y: number): void;
  readPalette(): void;
}

const VERT = `#version 300 es
in vec2 aCorner;            // per vertex: x 0..1 along, y -1..1 across
in vec4 aSeg;               // per segment: p0.xy, p1.xy (viewBox units)
in vec2 aCells;             // per segment: the pieces on either side, -1 for none
uniform vec2 uRes;          // canvas px
uniform float uScale;       // canvas px per viewBox unit
uniform highp sampler2D uState;
uniform float uTime;
out vec2 vLocal;            // along, across, in viewBox units
out float vLen;
out float vW;
out vec2 vP;
out vec2 vDir;
out float vMolten;
out float vAlpha;

const float BASE = 3.25;    // half the seam's width, matching the SVG stroke of 6.5

vec4 cell(float id){
  return id < 0. ? vec4(0., 0., 0., 1.) : texelFetch(uState, ivec2(int(id), 0), 0);
}

void main(){
  vec2 p0 = aSeg.xy, p1 = aSeg.zw;
  vec4 a = cell(aCells.x), b = cell(aCells.y);
  // r: read, g: lifted, b: gilding (0 none, else 1..255 progress), a: dimmed.
  float read = max(a.r, b.r);
  float gA = a.b > 0. ? (a.b * 255. - 1.) / 254. : -1.;
  float gB = b.b > 0. ? (b.b * 255. - 1.) / 254. : -1.;
  float g = max(gA, gB);
  float w = BASE * mix(1., 9. / 6.5, read);
  // Gilding: the seam swells as the gold goes in, then settles to a read seam.
  if (g >= 0.) w = BASE * (g < .45 ? mix(.3, 2.3, g / .45) : mix(2.3, 9. / 6.5, (g - .45) / .55));
  vMolten = g >= 0. ? 1. - g : 0.;
  // A lifted piece draws its own seam, so the gold here steps aside for it.
  float lifted = max(a.g, b.g);
  float dim = min(a.a, b.a);
  vAlpha = (1. - lifted) * mix(1., .28, dim);

  vec2 d = p1 - p0;
  float len = max(length(d), 1e-3);
  vec2 dir = d / len;
  vec2 nrm = vec2(-dir.y, dir.x);
  float reach = w * 1.53 * 3.4;  // widest bead, then the warm halo beyond it
  float s = aCorner.x * (len + 2. * reach) - reach;
  float across = aCorner.y * reach;
  vec2 pos = p0 + dir * s + nrm * across;

  vLocal = vec2(s, across);
  vLen = len;
  vW = w;
  vP = pos;
  vDir = dir;
  vec2 clip = pos * uScale / uRes * 2. - 1.;
  gl_Position = vec4(clip.x, -clip.y, 0., 1.);
}`;

const FRAG = `#version 300 es
precision highp float;
in vec2 vLocal;
in float vLen;
in float vW;
in vec2 vP;
in vec2 vDir;
in float vMolten;
in float vAlpha;
uniform vec3 uAu;
uniform vec2 uLight;        // viewBox units
uniform float uTime;
uniform float uAA;          // one canvas pixel, in viewBox units
uniform float uExposure;    // deeper on paper, brighter on the dark glaze
uniform float uHalo;        // the warm light the gold throws beside itself
uniform float uLacquer;     // how much of the dark urushi bed shows at the bead's edge
out vec4 outColor;

${GOLD_GLSL}
${GOLD_FALL_GLSL}

float hash(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p), u = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}

void main(){
  if (vAlpha <= 0.) discard;
  // Only inside the bowl.
  vec2 c = vP - vec2(${C}.);
  if (dot(c, c) > ${R * R}.) discard;

  // Distance from the segment itself: a capsule, so joins round off.
  float s = clamp(vLocal.x, 0., vLen);
  float dist = length(vec2(vLocal.x - s, vLocal.y));
  // Hand-laid: the bead is fuller in places, the way a brush leaves it.
  // Like the hero's seams: hairline in places, pooled thick in others.
  float wv = noise(vP * .022 + 3.7);
  float w = vW * (.38 + 1.15 * wv * wv);
  float t = dist / w;
  if (t > 3.4) discard;

  // Units: the material was tuned on a plate one unit tall.
  vec2 toL = (uLight - vP) / ${SIZE}.;
  // The light hangs close over the bowl, so it falls off faster than on the
  // plate: a pool of glints follows the pointer and the far seams rest.
  float fall = kinFall(toL * 2.6);
  float aa = uAA / w;

  vec3 gold = kinGoldG(uAu, min(t, 1.), vDir, toL, fall, 1.4) * uExposure;
  gold += kinMolten(uAu, vLocal.x * .35 + wv * 5., uTime) * vMolten * .8;
  // Gold powder sits on a bed of dark urushi lacquer, which shows as a fine
  // brown edge either side of the bead. It is what seats the gold in the glaze
  // instead of laying it on top, and it matters most on pale ceramic.
  float lac = smoothstep(.58, .97, t) * uLacquer;
  gold = mix(gold, uAu * vec3(.36, .27, .2), lac);
  // Roll off instead of clipping, so a hot glint stays gold and never turns white.
  gold = gold / (1. + max(vec3(0.), gold - .85) * .9);
  float bead = smoothstep(1. + aa, 1. - aa, t);
  // The warm halo the gold throws on the glaze just beside the join.
  float halo = exp(-(t - 1.) * 2.6) * uHalo * (1. - bead) * step(1., t);

  float alpha = (bead + halo) * vAlpha;
  vec3 col = bead > 0. ? gold : uAu;
  // Nearer the crown is nearer the eye: joins resolve to the brightest bead.
  gl_FragDepth = t / 3.4;
  outColor = vec4(col * alpha, alpha);
}`;

export function createBowlGold(canvas: HTMLCanvasElement, opts: {
  /** Every written piece's path, in order, as the SVG has it. */
  paths: string[];
  state(i: number): CellState;
  reduced: boolean;
}): BowlGold | null {
  const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false, depth: true });
  if (!gl) return null;

  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'shader');
    return s;
  };
  let prog: WebGLProgram;
  try {
    prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) ?? 'link');
  } catch (e) {
    console.warn('bowl-gold: falling back to SVG seams', e);
    return null;
  }
  gl.useProgram(prog);

  /* ---------- the joins, read back out of the shard paths ---------- */
  const segs = new Map<string, { a: number[]; b: number[]; ca: number; cb: number }>();
  const key = (x: number, y: number) => `${Math.round(x * 2)},${Math.round(y * 2)}`;
  opts.paths.forEach((d, cell) => {
    const nums = d.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
    const pts: number[][] = [];
    for (let i = 0; i + 1 < nums.length; i += 2) pts.push([nums[i], nums[i + 1]]);
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      const q = pts[(i + 1) % pts.length];
      const kp = key(p[0], p[1]);
      const kq = key(q[0], q[1]);
      const k = kp < kq ? `${kp}|${kq}` : `${kq}|${kp}`;
      const seen = segs.get(k);
      if (seen) seen.cb = cell;
      else segs.set(k, { a: p, b: q, ca: cell, cb: -1 });
    }
  });
  const n = segs.size;
  const segData = new Float32Array(n * 4);
  const cellData = new Float32Array(n * 2);
  let i = 0;
  for (const s of segs.values()) {
    segData.set([s.a[0], s.a[1], s.b[0], s.b[1]], i * 4);
    cellData.set([s.ca, s.cb], i * 2);
    i++;
  }

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  const attr = (name: string, data: Float32Array, size: number, divisor: number) => {
    const loc = gl.getAttribLocation(prog, name);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(loc, divisor);
  };
  attr('aCorner', new Float32Array([0, -1, 1, -1, 0, 1, 1, 1]), 2, 0);
  attr('aSeg', segData, 4, 1);
  attr('aCells', cellData, 2, 1);

  /* ---------- per-piece state, one texel each ---------- */
  const cells = opts.paths.length;
  const stateTex = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, stateTex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  const stateBytes = new Uint8Array(cells * 4);
  gl.uniform1i(gl.getUniformLocation(prog, 'uState'), 0);

  const U = Object.fromEntries(
    ['uRes', 'uScale', 'uTime', 'uAu', 'uLight', 'uAA', 'uExposure', 'uHalo', 'uLacquer'].map((u) => [u, gl.getUniformLocation(prog, u)])
  ) as Record<string, WebGLUniformLocation | null>;

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LESS);

  let light = { x: C * 0.55, y: C * 0.45 };
  let raf = 0;
  let animating = false;

  const size = () => {
    const css = canvas.clientWidth || canvas.getBoundingClientRect().width;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const px = Math.max(1, Math.round(css * dpr));
    if (canvas.width !== px) {
      canvas.width = canvas.height = px;
    }
    gl.viewport(0, 0, px, px);
    gl.uniform2f(U.uRes, px, px);
    gl.uniform1f(U.uScale, px / SIZE);
    gl.uniform1f(U.uAA, (SIZE / px) * 0.9);
  };

  const frame = (now: number) => {
    raf = 0;
    animating = false;
    for (let c = 0; c < cells; c++) {
      const st = opts.state(c);
      stateBytes[c * 4] = st.read ? 255 : 0;
      stateBytes[c * 4 + 1] = st.lifted ? 255 : 0;
      stateBytes[c * 4 + 2] = st.gild >= 0 ? 1 + Math.round(Math.min(1, st.gild) * 254) : 0;
      stateBytes[c * 4 + 3] = st.off ? 255 : 0;
      if (st.gild >= 0 && st.gild < 1) animating = true;
    }
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, cells, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, stateBytes);
    gl.uniform1f(U.uTime, now / 1000);
    gl.uniform2f(U.uLight, light.x, light.y);
    gl.clearColor(0, 0, 0, 0);
    gl.clearDepth(1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, n);
    // Molten gold runs only while a seam is being filled.
    if (animating && !opts.reduced) raf = requestAnimationFrame(frame);
  };

  const api: BowlGold = {
    draw() {
      if (!raf) raf = requestAnimationFrame(frame);
    },
    setLight(x, y) {
      light = { x, y };
      api.draw();
    },
    readPalette() {
      gl.uniform3fv(U.uAu, goldBase(cssRgb(getComputedStyle(document.documentElement).getPropertyValue('--gold'))));
      const t = document.documentElement.dataset.theme;
      const dark = t ? t === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
      gl.uniform1f(U.uExposure, dark ? 0.86 : 0.98);
      gl.uniform1f(U.uHalo, dark ? 0.09 : 0);
      gl.uniform1f(U.uLacquer, dark ? 0.35 : 0.85);
      api.draw();
    },
  };

  size();
  api.readPalette();
  new ResizeObserver(() => {
    size();
    api.draw();
  }).observe(canvas);
  canvas.addEventListener('webglcontextlost', (e) => e.preventDefault());
  return api;
}
