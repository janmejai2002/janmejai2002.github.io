/**
 * Draws the bowl built from its pieces (lib/bowl-wall.ts) in WebGL2.
 *
 * One shell, seen from above and in front: the front of the wall from outside,
 * the back of it from inside, so every piece shows wherever it has turned to.
 * Each piece is glazed in its theme's colour and carries its own article's
 * drawing (one atlas texture). The joins are the site's gold (lib/gold.ts),
 * measured in the shell's own space, so seams stay even all the way round. The
 * top of the written pieces is left as a raw clay edge: the bowl is still being
 * made. The unwritten pieces above it are only scored, faintly.
 *
 * It draws on demand. Turning, hovering and gilding ask for frames; nothing
 * loops by itself.
 */
import { GOLD_GLSL, GOLD_FALL_GLSL, goldBase, resolveColor } from '../lib/gold';
import { PHI0, ELEVATION, FRAME } from '../lib/bowl-form';

const TAU = Math.PI * 2;
const SE = Math.sin((ELEVATION * Math.PI) / 180);
const CE = Math.cos((ELEVATION * Math.PI) / 180);
const Y_MID = (FRAME.yMax + FRAME.yMin) / 2;
const Y_HALF = (FRAME.yMax - FRAME.yMin) / 2;

export interface CellState {
  read: boolean;
  /** 0..1, how far the piece has lifted out toward the reader. */
  lift: number;
  off: boolean;
  /** 0..1 while being gilded, else -1. */
  gild: number;
}

export interface Bowl3dGL {
  draw(): void;
  setAngle(radians: number): void;
  /** Pointer in frame units (x across, y up), for the glints. */
  setLight(x: number, y: number): void;
  /** Which written piece is under a canvas pixel, or -1. */
  pick(px: number, py: number): number;
  readPalette(): void;
  /** Screen position (canvas CSS px) of a point on the shell, and whether it faces the reader. */
  project(u: number, phi: number): { x: number; y: number; front: boolean };
  centre(i: number): { u: number; phi: number };
  readonly n: number;
}

const VERT = `#version 300 es
in vec2 aPos;       // (u, phi) on the shell; (u, h) on the foot
in float aMode;     // 0 shell, 1 foot ring
in float aCell;     // piece id, -1 for the plain floor and foot
in vec4 aEdge;      // this triangle's own join: two (u, phi)
in vec4 aAdj;       // the joins either side of it, by their far ends
in vec3 aCen;       // the piece's centre (u, phi) and size
in vec2 aKind;      // the cell across the join; and 1 if this piece is unwritten
uniform float uAngle;
uniform vec4 uView; // sinE, cosE, yMid, yHalf
uniform float uFrameX;
uniform highp sampler2D uState;
uniform float uPick;

out vec3 vW;
out vec3 vN;
out vec2 vLocal;
flat out vec3 vA, vB, vP, vQ;
flat out float vCell, vOther, vGhost;
flat out vec2 vAlong;
out vec2 vScr;

vec3 shell(vec2 up){
  float th = up.x * ${TAU} + uAngle;
  float s = sin(up.y);
  return vec3(s * cos(th), 1. - cos(up.y), s * sin(th));
}
vec2 scr(vec3 p){ return vec2(p.x, p.y * uView.y - p.z * uView.x); }

void main(){
  vec3 p; vec3 n;
  float lift = 0.;
  if (aCell >= 0.) lift = texelFetch(uState, ivec2(int(aCell), 0), 0).g;
  if (aMode < .5) {
    p = shell(aPos);
    n = normalize(p - vec3(0., 1., 0.));
  } else {
    float th = aPos.x * ${TAU} + uAngle;
    float r = sin(${PHI0}) * .9;
    float y0 = 1. - cos(${PHI0});
    p = vec3(r * cos(th), mix(y0 + .01, -.035, aPos.y), r * sin(th));
    n = vec3(cos(th), 0., sin(th));
  }
  // A piece being looked at comes a little way out of the wall, toward the reader.
  vec3 out_ = n * lift * .05;
  p += out_;
  vW = p; vN = n;
  vCell = aCell; vOther = aKind.x; vGhost = aKind.y;
  vA = shell(aEdge.xy) + out_; vB = shell(aEdge.zw) + out_;
  vP = shell(aAdj.xy) + out_;  vQ = shell(aAdj.zw) + out_;
  vAlong = normalize(scr(vB) - scr(vA) + 1e-6);
  // Local coordinates across the piece, for its drawing.
  float du = aPos.x - aCen.x; du -= floor(du + .5);
  vLocal = vec2(du * ${TAU} * sin(aCen.y), aPos.y - aCen.y) / max(aCen.z, 1e-3);
  vec2 s = scr(p);
  vScr = s;
  float depth = p.y * uView.x + p.z * uView.y;
  gl_Position = vec4(s.x / uFrameX, (s.y - uView.z) / uView.w, -depth * .35, 1.);
}`;

const FRAG = `#version 300 es
precision highp float;
in vec3 vW;
in vec3 vN;
in vec2 vLocal;
flat in vec3 vA, vB, vP, vQ;
flat in float vCell, vOther, vGhost;
flat in vec2 vAlong;
in vec2 vScr;
uniform highp sampler2D uState;
uniform sampler2D uAtlas;
uniform vec2 uAtlasGrid;    // cols, rows
uniform float uAtlasReady;
uniform float uDark;
uniform float uPick;
uniform float uGhostPass;
uniform vec3 uAu, uGlaze, uGlazeIn, uClay, uLight;
uniform vec2 uPointer;      // frame units
uniform vec2 uView2;        // sinE, cosE
uniform float uTime;
uniform float uSeam;        // half width, world units
uniform float uExposure, uLacquer;
uniform float uAmbient, uKey, uGloss; // light the glaze keeps in shade, takes from the lamp, and its shine
uniform float uN;           // written pieces
out vec4 outColor;

${GOLD_GLSL}
${GOLD_FALL_GLSL}

float hash(vec3 p){ return fract(sin(dot(p, vec3(41.3, 289.1, 113.7))) * 43758.5453); }
float noise(vec3 p){
  vec3 i = floor(p), f = fract(p), u = f * f * (3. - 2. * f);
  return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), u.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), u.x), u.y),
             mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), u.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), u.x), u.y), u.z);
}
float seg(vec3 p, vec3 a, vec3 b, out float along){
  vec3 ab = b - a;
  float t = clamp(dot(p - a, ab) / max(dot(ab, ab), 1e-9), 0., 1.);
  along = t * length(ab);
  return length(p - a - ab * t);
}

void main(){
  bool piece = vCell >= 0.;
  bool ghost = vGhost > .5;
  if (uPick > .5) {
    // Only written pieces can be picked.
    if (!piece || ghost) discard;
    float id = vCell + 1.;
    outColor = vec4(mod(id, 256.) / 255., floor(id / 256.) / 255., 0., 1.);
    return;
  }
  if ((uGhostPass > .5) != ghost) discard;

  // Outside if the wall's outward face is turned toward the reader.
  vec3 V = vec3(0., uView2.x, uView2.y);
  bool outside = dot(vN, V) > 0.;
  vec3 N = normalize(vN) * (outside ? 1. : -1.);
  vec3 L = normalize(uLight);
  vec4 st = piece ? texelFetch(uState, ivec2(int(vCell), 0), 0) : vec4(0.);

  // ---- glaze
  vec3 base;
  if (vCell < -1.5) base = uClay;
  else if (!piece) base = outside ? uGlaze : uGlazeIn;
  else base = texelFetch(uState, ivec2(int(vCell), 1), 0).rgb;

  if (piece && !ghost && uAtlasReady > .5) {
    // The piece's own drawing, from the centre of its artwork, upright up the
    // wall and the right way round from either side.
    vec2 l = vLocal;
    if (!outside) l.x = -l.x;
    vec2 uv = vec2(.5 + l.x * .3, .5 - l.y * .53);
    uv = clamp(uv, .02, .98);
    float c = mod(vCell, uAtlasGrid.x), r = floor(vCell / uAtlasGrid.x);
    vec3 art = texture(uAtlas, (vec2(c, r) + uv) / uAtlasGrid).rgb;
    // Ink on a pale glaze; light lines on a dark one.
    base = uDark > .5 ? 1. - (1. - base) * (1. - art * .95) : base * mix(vec3(1.), art, .9);
  }
  if (piece && st.a > .5) base = mix(base, vec3(dot(base, vec3(.3, .5, .2))), .7) * .72;
  if (piece && st.r > .5) base = mix(base, uAu, .1);

  float diff = max(dot(N, L), 0.);
  float spec = pow(max(dot(N, normalize(L + V)), 0.), 70.);
  float lit = uAmbient + uKey * diff;
  // The inside falls into shade toward the floor, and sits a little under the outside.
  if (!outside) lit *= mix(.58, .88, smoothstep(.0, .75, vW.y));
  vec3 col = base * lit + vec3(1.) * spec * uGloss;
  col *= 1. + st.g * .08;

  if (!piece) {
    outColor = vec4(col, 1.);
    return;
  }

  // ---- the joins
  float alA, alP, alQ;
  float dA = seg(vW, vA, vB, alA);
  float dP = seg(vW, vP, vA, alP);
  float dQ = seg(vW, vB, vQ, alQ);
  float d = min(dA, min(dP, dQ));
  bool own = dA <= min(dP, dQ);
  float wv = noise(vW * 34.);
  float w = uSeam * (.42 + 1.2 * wv * wv) * (st.r > .5 ? 1.35 : 1.);
  float g = st.b > 0. ? (st.b * 255. - 1.) / 254. : -1.;
  if (g >= 0.) w *= g < .45 ? mix(.3, 2.2, g / .45) : mix(2.2, 1.35, (g - .45) / .55);
  float t = d / w;
  float aa = fwidth(t) * 1.2;

  if (ghost) {
    // Not yet made: only scored, in dashes, where it will one day be joined.
    float dash = step(.5, fract(alA * 70.));
    float line = smoothstep(1.2 + aa, 1.2 - aa, dA / (uSeam * .5)) * dash;
    float a = line * .4 + .035;
    outColor = vec4(mix(uGlaze, uAu, line * .5) * a, a);
    return;
  }

  // The top of the written pieces has nothing joined to it yet: raw clay.
  bool open = own && (vOther < 0. || vOther >= uN) && vW.y > 1. - cos(${PHI0}) + .06;
  bool foot = own && vOther < 0. && !open;
  if (foot) {
    outColor = vec4(col, 1.);
    return;
  }
  float bead = smoothstep(1. + aa, 1. - aa, t);
  if (open) {
    float edge = smoothstep(1.6 + aa, 1.6 - aa, dA / uSeam);
    col = mix(col, uClay * (.8 + .3 * diff), edge);
    outColor = vec4(col, 1.);
    return;
  }

  vec2 toL = (uPointer - vScr) * .7;
  float fall = kinFall(toL);
  vec3 gold = kinGoldG(uAu, min(t, 1.), vAlong, toL, fall, 1.35) * uExposure;
  gold *= .7 + .45 * max(dot(N, L), 0.);
  if (g >= 0.) gold += kinMolten(uAu, alA * 60. + wv * 5., uTime) * (1. - g) * .8;
  float lac = smoothstep(.58, .97, t) * uLacquer;
  gold = mix(gold, uAu * vec3(.36, .27, .2), lac);
  gold = gold / (1. + max(vec3(0.), gold - .85) * .9);
  if (st.a > .5) gold = mix(gold, col, .55);
  col = mix(col, gold, bead);
  outColor = vec4(col, 1.);
}`;

/** Unpacks lib/bowl-wall.ts's packWall(). */
function unpack(counts: string, data: string) {
  const bin = atob(data);
  const u16 = new Uint16Array(bin.length / 2);
  for (let i = 0; i < u16.length; i++) u16[i] = bin.charCodeAt(i * 2) | (bin.charCodeAt(i * 2 + 1) << 8);
  const cells: [number, number][][] = [];
  let k = 0;
  for (const c of counts.split(',').map(Number)) {
    const cell: [number, number][] = [];
    for (let j = 0; j < c; j++, k += 2) cell.push([(u16[k] / 65535) * 2 - 0.5, (u16[k + 1] / 65535) * (Math.PI / 2)]);
    cells.push(cell);
  }
  return cells;
}

export function createBowl3dGL(
  canvas: HTMLCanvasElement,
  opts: {
    n: number;
    counts: string;
    data: string;
    atlas: { light: string; dark: string; cols: number };
    isDark(): boolean;
    state(i: number): CellState;
    /** Each written piece's glaze colour, 0..1 rgb. */
    glaze(i: number): [number, number, number];
    reduced: boolean;
  }
): Bowl3dGL | null {
  const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: true, depth: true });
  if (!gl) return null;
  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'shader');
    return s;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) ?? 'link');
  gl.useProgram(prog);

  const cells = unpack(opts.counts, opts.data);
  const cap = cells.length;
  const n = Math.min(opts.n, cap);

  /* ---------- who is across each join ---------- */
  const wrap = (u: number) => ((u % 1) + 1) % 1;
  const jkey = (a: [number, number], b: [number, number]) => {
    const ka = `${(wrap(a[0]) * 1000).toFixed(0)},${(a[1] * 1000).toFixed(0)}`;
    const kb = `${(wrap(b[0]) * 1000).toFixed(0)},${(b[1] * 1000).toFixed(0)}`;
    return ka < kb ? `${ka}|${kb}` : `${kb}|${ka}`;
  };
  const owners = new Map<string, number[]>();
  cells.forEach((poly, c) => {
    for (let k = 0; k < poly.length; k++) {
      const id = jkey(poly[k], poly[(k + 1) % poly.length]);
      const o = owners.get(id);
      if (o) o.push(c);
      else owners.set(id, [c]);
    }
  });

  /* ---------- the mesh ---------- */
  const centres: { u: number; phi: number; size: number }[] = [];
  const v: number[] = [];
  // aPos2 aMode1 aCell1 aEdge4 aAdj4 aCen3 aKind2 = 17 floats
  const push = (pos: number[], mode: number, cell: number, edge: number[], adj: number[], cen: number[], kind: number[]) =>
    v.push(pos[0], pos[1], mode, cell, ...edge, ...adj, ...cen, ...kind);
  cells.forEach((poly, c) => {
    let cu = 0;
    let cp = 0;
    for (const [u, p] of poly) {
      cu += u;
      cp += p;
    }
    cu /= poly.length;
    cp /= poly.length;
    let size = 0;
    for (const [u, p] of poly) size = Math.max(size, Math.hypot((u - cu) * TAU * Math.sin(cp), p - cp));
    centres.push({ u: cu, phi: cp, size });
    const ghost = c >= n ? 1 : 0;
    const L = poly.length;
    for (let k = 0; k < L; k++) {
      const a = poly[k];
      const b = poly[(k + 1) % L];
      const pr = poly[(k - 1 + L) % L];
      const nx = poly[(k + 2) % L];
      const other = (owners.get(jkey(a, b)) ?? []).find((o) => o !== c) ?? -1;
      const edge = [a[0], a[1], b[0], b[1]];
      const adj = [pr[0], pr[1], nx[0], nx[1]];
      const cen = [cu, cp, size];
      const kind = [other, ghost];
      push([cu, cp], 0, c, edge, adj, cen, kind);
      push(a, 0, c, edge, adj, cen, kind);
      push(b, 0, c, edge, adj, cen, kind);
    }
  });
  // The plain floor inside, below the oldest pieces, and the clay foot ring.
  const far = [9, 9, 9, 9];
  const SEG = 64;
  const RINGS = 6;
  for (let r = 0; r < RINGS; r++) {
    const p0 = (PHI0 * r) / RINGS;
    const p1 = (PHI0 * (r + 1)) / RINGS;
    for (let s = 0; s < SEG; s++) {
      const u0 = s / SEG;
      const u1 = (s + 1) / SEG;
      for (const [u, p] of [[u0, p0], [u1, p0], [u1, p1], [u0, p0], [u1, p1], [u0, p1]]) push([u, p], 0, -1, far, far, [0, 0, 1], [-1, 0]);
    }
  }
  for (let s = 0; s < SEG; s++) {
    const u0 = s / SEG;
    const u1 = (s + 1) / SEG;
    for (const [u, h] of [[u0, 0], [u1, 0], [u1, 1], [u0, 0], [u1, 1], [u0, 1]]) push([u, h], 1, -2, far, far, [0, 0, 1], [-1, 0]);
  }
  const verts = new Float32Array(v);
  const count = verts.length / 17;
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
  let off = 0;
  for (const [name, size] of [['aPos', 2], ['aMode', 1], ['aCell', 1], ['aEdge', 4], ['aAdj', 4], ['aCen', 3], ['aKind', 2]] as const) {
    const loc = gl.getAttribLocation(prog, name);
    if (loc >= 0) {
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 17 * 4, off * 4);
    }
    off += size;
  }

  const U = Object.fromEntries(
    [
      'uAngle', 'uView', 'uFrameX', 'uState', 'uPick', 'uAtlas', 'uAtlasGrid', 'uAtlasReady', 'uDark', 'uGhostPass',
      'uAu', 'uGlaze', 'uGlazeIn', 'uClay', 'uLight', 'uPointer', 'uView2', 'uTime', 'uSeam', 'uExposure', 'uLacquer', 'uN',
      'uAmbient', 'uKey', 'uGloss',
    ].map((u) => [u, gl.getUniformLocation(prog, u)])
  ) as Record<string, WebGLUniformLocation | null>;
  gl.uniform4f(U.uView, SE, CE, Y_MID, Y_HALF);
  gl.uniform2f(U.uView2, SE, CE);
  gl.uniform1f(U.uFrameX, FRAME.x);
  gl.uniform1f(U.uSeam, 0.0058);
  gl.uniform1f(U.uN, n);
  gl.uniform3f(U.uLight, -0.5, 0.78, 0.55);

  /* ---------- textures: per-piece state, and the artwork atlas ---------- */
  const stateTex = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, stateTex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  gl.uniform1i(U.uState, 0);
  const bytes = new Uint8Array(cap * 2 * 4);

  const atlasTex = gl.createTexture();
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, atlasTex);
  gl.uniform1i(U.uAtlas, 1);
  gl.uniform2f(U.uAtlasGrid, opts.atlas.cols, Math.ceil(n / opts.atlas.cols));
  gl.uniform1f(U.uAtlasReady, 0);
  let atlasTheme = '';
  const loadAtlas = () => {
    const theme = opts.isDark() ? 'dark' : 'light';
    if (theme === atlasTheme) return;
    atlasTheme = theme;
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      if (atlasTheme !== theme) return;
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, atlasTex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.uniform1f(U.uAtlasReady, 1);
      api.draw();
    };
    img.src = theme === 'dark' ? opts.atlas.dark : opts.atlas.light;
  };

  /* ---------- picking ---------- */
  const fbo = gl.createFramebuffer();
  const pickTex = gl.createTexture();
  const pickDepth = gl.createRenderbuffer();
  let pickW = 0;
  let pickH = 0;
  let pickDirty = true;

  let angle = 0;
  let pointer = { x: -0.4, y: 1.1 };
  let raf = 0;

  const size = () => {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(r.width * dpr));
    const h = Math.max(1, Math.round(r.height * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    pickDirty = true;
  };

  const upload = () => {
    let busy = false;
    for (let c = 0; c < cap; c++) {
      const s = c < n ? opts.state(c) : { read: false, lift: 0, off: false, gild: -1 };
      bytes[c * 4] = s.read ? 255 : 0;
      bytes[c * 4 + 1] = Math.round(Math.max(0, Math.min(1, s.lift)) * 255);
      bytes[c * 4 + 2] = s.gild >= 0 ? 1 + Math.round(Math.min(1, s.gild) * 254) : 0;
      bytes[c * 4 + 3] = s.off ? 255 : 0;
      if (s.gild >= 0 && s.gild < 1) busy = true;
      const g = c < n ? opts.glaze(c) : [0.9, 0.9, 0.9];
      const o = (cap + c) * 4;
      bytes[o] = g[0] * 255;
      bytes[o + 1] = g[1] * 255;
      bytes[o + 2] = g[2] * 255;
      bytes[o + 3] = 255;
    }
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, stateTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, cap, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, bytes);
    return busy;
  };

  const render = (pick: boolean) => {
    gl.uniform1f(U.uPick, pick ? 1 : 0);
    gl.bindVertexArray(vao);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);
    gl.disable(gl.CULL_FACE);
    gl.clearColor(0, 0, 0, 0);
    gl.clearDepth(1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.disable(gl.BLEND);
    gl.depthMask(true);
    gl.uniform1f(U.uGhostPass, 0);
    gl.drawArrays(gl.TRIANGLES, 0, count);
    if (pick) return;
    // The unwritten pieces, faint, over and behind the made ones.
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.depthMask(false);
    gl.uniform1f(U.uGhostPass, 1);
    gl.drawArrays(gl.TRIANGLES, 0, count);
    gl.depthMask(true);
  };

  const frame = (now: number) => {
    raf = 0;
    const busy = upload();
    gl.uniform1f(U.uAngle, angle);
    gl.uniform2f(U.uPointer, pointer.x, pointer.y);
    gl.uniform1f(U.uTime, now / 1000);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    render(false);
    pickDirty = true;
    if (busy && !opts.reduced) raf = requestAnimationFrame(frame);
  };

  const api: Bowl3dGL = {
    n,
    draw() {
      if (!raf) raf = requestAnimationFrame(frame);
    },
    setAngle(r) {
      angle = r;
      api.draw();
    },
    setLight(x, y) {
      pointer = { x, y };
      api.draw();
    },
    pick(px, py) {
      const w = canvas.width;
      const h = canvas.height;
      if (pickDirty || pickW !== w || pickH !== h) {
        if (pickW !== w || pickH !== h) {
          pickW = w;
          pickH = h;
          gl.bindTexture(gl.TEXTURE_2D, pickTex);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
          gl.bindRenderbuffer(gl.RENDERBUFFER, pickDepth);
          gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT24, w, h);
          gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
          gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, pickTex, 0);
          gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, pickDepth);
        }
        upload();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.viewport(0, 0, w, h);
        gl.uniform1f(U.uAngle, angle);
        render(true);
        pickDirty = false;
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      const out = new Uint8Array(4);
      const dpr = w / Math.max(1, canvas.clientWidth);
      gl.readPixels(Math.round(px * dpr), Math.round(h - py * dpr), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, out);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      const id = out[0] + out[1] * 256 - 1;
      return id >= 0 && id < n ? id : -1;
    },
    readPalette() {
      const host = canvas.parentElement ?? canvas;
      const v = (name: string) => resolveColor(host, `var(${name})`);
      const dark = opts.isDark();
      gl.uniform3fv(U.uAu, goldBase(v('--gold')));
      gl.uniform3fv(U.uGlaze, v('--glaze'));
      gl.uniform3fv(U.uGlazeIn, v('--glaze-in'));
      gl.uniform3fv(U.uClay, v('--clay'));
      gl.uniform1f(U.uDark, dark ? 1 : 0);
      gl.uniform1f(U.uExposure, dark ? 0.9 : 1);
      gl.uniform1f(U.uLacquer, dark ? 0.35 : 0.85);
      // Pale glaze stays pale in shade; the dark one keeps its depth.
      gl.uniform1f(U.uAmbient, dark ? 0.5 : 0.84);
      gl.uniform1f(U.uKey, dark ? 0.55 : 0.3);
      gl.uniform1f(U.uGloss, dark ? 0.14 : 0.1);
      loadAtlas();
      api.draw();
    },
    project(u, phi) {
      const th = u * TAU + angle;
      const s = Math.sin(phi);
      const x = s * Math.cos(th);
      const y = 1 - Math.cos(phi);
      const z = s * Math.sin(th);
      const sx = x;
      const sy = y * CE - z * SE;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      // Facing the reader from outside if it is on the front half.
      return { x: ((sx / FRAME.x + 1) / 2) * w, y: ((1 - (sy - Y_MID) / Y_HALF) / 2) * h, front: z > 0 };
    },
    centre: (i) => centres[i],
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
