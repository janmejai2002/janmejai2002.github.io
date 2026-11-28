/**
 * WebGL2 3D Compendium Monolith + Etched Causal Self-Attention Matrix
 * for /inference/.
 *
 * Matte dark ceramic + brushed kinpun maki-e kintsugi gold seams matching
 * bowl-3d-gl.ts and lib/gold.ts. Every colour is resolved live from wAIbi-sabi
 * CSS tokens via resolveColor() and goldBase(), and updates automatically on
 * light/dark theme changes. Draws on demand and rests when settled.
 *
 * Geometry:
 *  - Beveled matte ceramic hardcover monograph with curved 5-rib spine
 *  - Recessed stacked gilded ivory page block (top, bottom, fore-edge)
 *  - Front cover etched with an 8x8 Causal Self-Attention Matrix
 *    (lower-triangular earth-and-gold inlay cells, upper-triangular debossed pins)
 *    and embossed kinpun maki-e kintsugi gold seams
 *  - Inclined bronze-and-gold astrolabe orbital ring + 7 glazed ceramic domain nodes
 *
 * Interactivity:
 *  - Pointer-tracked brushed gold & ceramic specular lighting
 *  - Click-and-drag 3D orbit with smooth inertia coasting (mouse + touch)
 *  - Direct 3D ray-sphere picking on the 7 domain nodes
 *  - Subtle scroll-driven tilt & live setTrack(trackId) domain rotation
 *  - Transparent canvas background, reduced-motion safe, viewport-aware
 */

import { GOLD_GLSL, GOLD_FALL_GLSL, goldBase, resolveColor } from '../lib/gold';

export interface Inference3DNodeSpec {
  id: string;
  label: string;
  accent: 'mizu' | 'hanko' | 'ochre' | 'plum' | 'moss' | 'indigo';
  angle: number;
}

/** The 7 core INFERENCE domains arranged along the inclined orbital ring. */
export const INFERENCE_3D_NODES: readonly Inference3DNodeSpec[] = [
  { id: 'foundations', label: 'Foundations', accent: 'mizu', angle: 0 },
  { id: 'consulting', label: 'Consulting & Strategy', accent: 'hanko', angle: (Math.PI * 2 * 1) / 7 },
  { id: 'marketing', label: 'Marketing & Brand', accent: 'mizu', angle: (Math.PI * 2 * 2) / 7 },
  { id: 'product', label: 'Product Management', accent: 'plum', angle: (Math.PI * 2 * 3) / 7 },
  { id: 'operations', label: 'Operations & Supply Chain', accent: 'moss', angle: (Math.PI * 2 * 4) / 7 },
  { id: 'finance', label: 'Finance & Banking', accent: 'ochre', angle: (Math.PI * 2 * 5) / 7 },
  { id: 'hr', label: 'HR & People', accent: 'indigo', angle: (Math.PI * 2 * 6) / 7 },
] as const;

export interface Inference3DOptions {
  initialTrack?: string;
  onSelectTrack?: (trackId: string) => void;
  onHoverTrack?: (trackId: string | null) => void;
}

export interface Inference3DStage {
  setTrack(trackId: string): void;
  setScrollProgress(progress: number): void;
  readPalette(): void;
  resize(): void;
  destroy(): void;
}

export interface MeshData {
  /** Interleaved: pos(3), normal(3), uv(2), part(1), bevel(1) = 10 floats/vert */
  vertices: Float32Array;
  vertexCount: number;
}

export type Vec3 = [number, number, number];
export type Mat4 = Float32Array;

const STRIDE_FLOATS = 10;
const ORBIT_RADIUS = 1.62;
const ORBIT_TILT_X = 0.42;
const ORBIT_TILT_Z = -0.34;
const NODE_BASE_RADIUS = 0.088;

/* ==========================================================================
   Pure 3D Math Utilities (exported for unit verification)
   ========================================================================== */

export function vec3Sub(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

export function vec3Cross(a: Vec3, b: Vec3): Vec3 {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

export function vec3Dot(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

export function vec3Normalize(v: Vec3): Vec3 {
  const len = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / len, v[1] / len, v[2] / len];
}

export function mat4Identity(): Mat4 {
  const m = new Float32Array(16);
  m[0] = 1;
  m[5] = 1;
  m[10] = 1;
  m[15] = 1;
  return m;
}

export function mat4Multiply(a: Mat4, b: Mat4): Mat4 {
  const out = new Float32Array(16);
  for (let c = 0; c < 4; c++) {
    const b0 = b[c * 4];
    const b1 = b[c * 4 + 1];
    const b2 = b[c * 4 + 2];
    const b3 = b[c * 4 + 3];
    out[c * 4] = a[0] * b0 + a[4] * b1 + a[8] * b2 + a[12] * b3;
    out[c * 4 + 1] = a[1] * b0 + a[5] * b1 + a[9] * b2 + a[13] * b3;
    out[c * 4 + 2] = a[2] * b0 + a[6] * b1 + a[10] * b2 + a[14] * b3;
    out[c * 4 + 3] = a[3] * b0 + a[7] * b1 + a[11] * b2 + a[15] * b3;
  }
  return out;
}

export function mat4Perspective(fovRad: number, aspect: number, near: number, far: number): Mat4 {
  const f = 1 / Math.tan(fovRad / 2);
  const nf = 1 / (near - far);
  const out = new Float32Array(16);
  out[0] = f / Math.max(aspect, 0.1);
  out[5] = f;
  out[10] = (far + near) * nf;
  out[11] = -1;
  out[14] = 2 * far * near * nf;
  return out;
}

export function mat4Translate(x: number, y: number, z: number): Mat4 {
  const m = mat4Identity();
  m[12] = x;
  m[13] = y;
  m[14] = z;
  return m;
}

export function mat4Scale(sx: number, sy: number, sz: number): Mat4 {
  const m = mat4Identity();
  m[0] = sx;
  m[5] = sy;
  m[10] = sz;
  return m;
}

export function mat4RotateX(rad: number): Mat4 {
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  const m = mat4Identity();
  m[5] = c;
  m[6] = s;
  m[9] = -s;
  m[10] = c;
  return m;
}

export function mat4RotateY(rad: number): Mat4 {
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  const m = mat4Identity();
  m[0] = c;
  m[2] = -s;
  m[8] = s;
  m[10] = c;
  return m;
}

export function mat4RotateZ(rad: number): Mat4 {
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  const m = mat4Identity();
  m[0] = c;
  m[1] = s;
  m[4] = -s;
  m[5] = c;
  return m;
}

export function mat4TransformPoint(m: Mat4, p: Vec3): Vec3 {
  const x = p[0];
  const y = p[1];
  const z = p[2];
  const w = m[3] * x + m[7] * y + m[11] * z + m[15] || 1;
  return [
    (m[0] * x + m[4] * y + m[8] * z + m[12]) / w,
    (m[1] * x + m[5] * y + m[9] * z + m[13]) / w,
    (m[2] * x + m[6] * y + m[10] * z + m[14]) / w,
  ];
}

/**
 * Computes the target yaw/pitch/accent for a given INFERENCE track ID so the
 * 3D monolith smoothly pivots to highlight that domain's orbital node.
 */
export function computeTrackOrbitTarget(trackId: string): {
  nodeIndex: number;
  accent: Inference3DNodeSpec['accent'];
  yawOffset: number;
  pitchOffset: number;
} {
  const idx = INFERENCE_3D_NODES.findIndex((n) => n.id === trackId);
  if (idx < 0) {
    // Quarterly Inserts or unknown track: centre hero gold presentation
    return {
      nodeIndex: -1,
      accent: 'ochre',
      yawOffset: 0.08,
      pitchOffset: -0.06,
    };
  }
  const node = INFERENCE_3D_NODES[idx];
  // Gently turn the monolith toward the selected node without hiding the front cover
  const yawOffset = Math.sin(node.angle) * 0.28 + (idx % 2 === 0 ? -0.06 : 0.07);
  const pitchOffset = Math.cos(node.angle) * 0.11;
  return {
    nodeIndex: idx,
    accent: node.accent,
    yawOffset,
    pitchOffset,
  };
}

/** World position of orbital node `idx` given the monolith root matrix and ring precession. */
export function computeOrbitalNodePosition(
  ringMatrix: Mat4,
  nodeIndex: number,
  orbitPhase: number
): Vec3 {
  const node = INFERENCE_3D_NODES[nodeIndex];
  const theta = node.angle + orbitPhase;
  const local: Vec3 = [Math.cos(theta) * ORBIT_RADIUS, 0, Math.sin(theta) * ORBIT_RADIUS];
  return mat4TransformPoint(ringMatrix, local);
}

/**
 * Ray-sphere intersection in camera space for picking any of the 7 3D domain
 * nodes directly from pointer clicks/hovers on the canvas.
 */
export function hitTestOrbitalNode(
  ndcX: number,
  ndcY: number,
  aspect: number,
  fovRad: number,
  cameraZ: number,
  nodeWorldPositions: readonly Vec3[],
  hitRadius = 0.22
): number {
  const tanHalf = Math.tan(fovRad / 2);
  const rayDir = vec3Normalize([ndcX * aspect * tanHalf, ndcY * tanHalf, -1]);
  const rayOrigin: Vec3 = [0, 0, cameraZ];

  let bestIdx = -1;
  let bestT = Infinity;

  for (let i = 0; i < nodeWorldPositions.length; i++) {
    const oc = vec3Sub(rayOrigin, nodeWorldPositions[i]);
    const b = vec3Dot(oc, rayDir);
    const c = vec3Dot(oc, oc) - hitRadius * hitRadius;
    const disc = b * b - c;
    if (disc < 0) continue;
    const t = -b - Math.sqrt(disc);
    if (t > 0.1 && t < bestT) {
      bestT = t;
      bestIdx = i;
    }
  }
  return bestIdx;
}

/* ==========================================================================
   Procedural 3D Geometry Builders (Watertight Beveled Monograph + Ring + Orb)
   ========================================================================== */

function pushTri(
  out: number[],
  p0: Vec3,
  p1: Vec3,
  p2: Vec3,
  uv0: [number, number],
  uv1: [number, number],
  uv2: [number, number],
  part: number,
  bevel: number,
  customNormals?: [Vec3, Vec3, Vec3]
) {
  let n0: Vec3;
  let n1: Vec3;
  let n2: Vec3;
  if (customNormals) {
    [n0, n1, n2] = customNormals;
  } else {
    const n = vec3Normalize(vec3Cross(vec3Sub(p1, p0), vec3Sub(p2, p0)));
    n0 = n;
    n1 = n;
    n2 = n;
  }
  out.push(
    p0[0], p0[1], p0[2], n0[0], n0[1], n0[2], uv0[0], uv0[1], part, bevel,
    p1[0], p1[1], p1[2], n1[0], n1[1], n1[2], uv1[0], uv1[1], part, bevel,
    p2[0], p2[1], p2[2], n2[0], n2[1], n2[2], uv2[0], uv2[1], part, bevel
  );
}

function pushQuad(
  out: number[],
  a: Vec3,
  b: Vec3,
  c: Vec3,
  d: Vec3,
  uva: [number, number],
  uvb: [number, number],
  uvc: [number, number],
  uvd: [number, number],
  part: number,
  bevel: number,
  normals?: [Vec3, Vec3, Vec3, Vec3]
) {
  if (normals) {
    pushTri(out, a, b, c, uva, uvb, uvc, part, bevel, [normals[0], normals[1], normals[2]]);
    pushTri(out, a, c, d, uva, uvc, uvd, part, bevel, [normals[0], normals[2], normals[3]]);
  } else {
    pushTri(out, a, b, c, uva, uvb, uvc, part, bevel);
    pushTri(out, a, c, d, uva, uvc, uvd, part, bevel);
  }
}

/**
 * Builds a beveled hardcover monograph slab (used for both front and back boards)
 * with smooth chamfer normals so pointer specular glides across every rim.
 */
function appendCoverBoard(out: number[], isFront: boolean) {
  const x0 = -0.68;
  const x1 = 0.69;
  const y0 = -0.95;
  const y1 = 0.95;
  const bev = 0.026;
  const zOuter = isFront ? 0.145 : -0.145;
  const zInner = isFront ? 0.104 : -0.104;
  const zChamfer = isFront ? zOuter - 0.014 : zOuter + 0.014;
  const facePart = isFront ? 0.0 : 1.0;
  const edgePart = 2.0;

  // Inner face rectangle (inset by bevel on top, bottom, and fore-edge)
  const ix0 = x0 + 0.008;
  const ix1 = x1 - bev;
  const iy0 = y0 + bev;
  const iy1 = y1 - bev;

  if (isFront) {
    // Main front cover face (+Z)
    pushQuad(
      out,
      [ix0, iy0, zOuter],
      [ix1, iy0, zOuter],
      [ix1, iy1, zOuter],
      [ix0, iy1, zOuter],
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
      facePart,
      0.0
    );
    // Top bevel strip
    pushQuad(
      out,
      [ix0, iy1, zOuter],
      [ix1, iy1, zOuter],
      [x1, y1, zChamfer],
      [x0, y1, zChamfer],
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
      edgePart,
      1.0
    );
    // Bottom bevel strip
    pushQuad(
      out,
      [x0, y0, zChamfer],
      [x1, y0, zChamfer],
      [ix1, iy0, zOuter],
      [ix0, iy0, zOuter],
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
      edgePart,
      1.0
    );
    // Fore-edge (+X) bevel strip
    pushQuad(
      out,
      [ix1, iy0, zOuter],
      [x1, y0, zChamfer],
      [x1, y1, zChamfer],
      [ix1, iy1, zOuter],
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
      edgePart,
      1.0
    );
    // Spine join micro-bevel (-X)
    pushQuad(
      out,
      [x0, y0, zChamfer],
      [ix0, iy0, zOuter],
      [ix0, iy1, zOuter],
      [x0, y1, zChamfer],
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
      edgePart,
      0.7
    );
    // Side walls of the front board thickness (zChamfer -> zInner)
    pushQuad(out, [x1, y0, zInner], [x1, y1, zInner], [x1, y1, zChamfer], [x1, y0, zChamfer], [0, 0], [0, 1], [1, 1], [1, 0], edgePart, 0.85);
    pushQuad(out, [x0, y1, zChamfer], [x1, y1, zChamfer], [x1, y1, zInner], [x0, y1, zInner], [0, 0], [1, 0], [1, 1], [0, 1], edgePart, 0.85);
    pushQuad(out, [x0, y0, zInner], [x1, y0, zInner], [x1, y0, zChamfer], [x0, y0, zChamfer], [0, 0], [1, 0], [1, 1], [0, 1], edgePart, 0.85);
    // Underside overhang lip facing -Z
    pushQuad(out, [x0, y1, zInner], [x1, y1, zInner], [x1, y0, zInner], [x0, y0, zInner], [0, 1], [1, 1], [1, 0], [0, 0], edgePart, 0.25);
  } else {
    // Main back cover face (-Z), wound outward
    pushQuad(
      out,
      [ix1, iy0, zOuter],
      [ix0, iy0, zOuter],
      [ix0, iy1, zOuter],
      [ix1, iy1, zOuter],
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
      facePart,
      0.0
    );
    // Top bevel
    pushQuad(out, [x0, y1, zChamfer], [x1, y1, zChamfer], [ix1, iy1, zOuter], [ix0, iy1, zOuter], [0, 0], [1, 0], [1, 1], [0, 1], edgePart, 1.0);
    // Bottom bevel
    pushQuad(out, [ix0, iy0, zOuter], [ix1, iy0, zOuter], [x1, y0, zChamfer], [x0, y0, zChamfer], [0, 0], [1, 0], [1, 1], [0, 1], edgePart, 1.0);
    // Fore-edge bevel (+X)
    pushQuad(out, [x1, y0, zChamfer], [ix1, iy0, zOuter], [ix1, iy1, zOuter], [x1, y1, zChamfer], [0, 0], [1, 0], [1, 1], [0, 1], edgePart, 1.0);
    // Spine join micro-bevel (-X)
    pushQuad(out, [ix0, iy0, zOuter], [x0, y0, zChamfer], [x0, y1, zChamfer], [ix0, iy1, zOuter], [0, 0], [1, 0], [1, 1], [0, 1], edgePart, 0.7);
    // Board side walls
    pushQuad(out, [x1, y0, zChamfer], [x1, y1, zChamfer], [x1, y1, zInner], [x1, y0, zInner], [0, 0], [0, 1], [1, 1], [1, 0], edgePart, 0.85);
    pushQuad(out, [x0, y1, zInner], [x1, y1, zInner], [x1, y1, zChamfer], [x0, y1, zChamfer], [0, 0], [1, 0], [1, 1], [0, 1], edgePart, 0.85);
    pushQuad(out, [x0, y0, zChamfer], [x1, y0, zChamfer], [x1, y0, zInner], [x0, y0, zInner], [0, 0], [1, 0], [1, 1], [0, 1], edgePart, 0.85);
    // Inner overhang facing +Z
    pushQuad(out, [x0, y0, zInner], [x1, y0, zInner], [x1, y1, zInner], [x0, y1, zInner], [0, 0], [1, 0], [1, 1], [0, 1], edgePart, 0.25);
  }
}

/** Builds the curved hardcover spine connecting front and back covers along -X. */
function appendCurvedSpine(out: number[]) {
  const segs = 16;
  const xBase = -0.68;
  const rx = 0.088;
  const rz = 0.131;
  const y0 = -0.95;
  const y1 = 0.95;

  const pt = (t: number, y: number): Vec3 => {
    // t = 0 (+Z front) -> t = 1 (-Z back), arching outward into -X
    const a = t * Math.PI;
    return [xBase - Math.sin(a) * rx, y, Math.cos(a) * rz];
  };
  const norm = (t: number): Vec3 => {
    const a = t * Math.PI;
    return vec3Normalize([-Math.sin(a) / rx, 0, Math.cos(a) / rz]);
  };

  for (let i = 0; i < segs; i++) {
    const t0 = i / segs;
    const t1 = (i + 1) / segs;
    const a = pt(t0, y0);
    const b = pt(t0, y1);
    const c = pt(t1, y1);
    const d = pt(t1, y0);
    const n0 = norm(t0);
    const n1 = norm(t1);
    pushQuad(out, a, b, c, d, [t0, 0], [t0, 1], [t1, 1], [t1, 0], 3.0, 0.4, [n0, n0, n1, n1]);

    // Top & bottom spine caps (wound outward: +Y on top, -Y on bottom)
    const topCenter: Vec3 = [xBase, y1, 0];
    const botCenter: Vec3 = [xBase, y0, 0];
    pushTri(out, topCenter, c, b, [0.5, 0.5], [t1, 1], [t0, 1], 2.0, 0.5);
    pushTri(out, botCenter, a, d, [0.5, 0.5], [t0, 0], [t1, 0], 2.0, 0.5);
  }
}

/** Builds the recessed gilded page block (fore-edge, top-edge, bottom-edge). */
function appendPageBlock(out: number[]) {
  const x0 = -0.67;
  const x1 = 0.648;
  const y0 = -0.905;
  const y1 = 0.905;
  const z0 = -0.104;
  const z1 = 0.104;

  // Fore-edge (+X): uv.x runs across pages (z0..z1), uv.y runs vertically
  pushQuad(
    out,
    [x1, y0, z1],
    [x1, y0, z0],
    [x1, y1, z0],
    [x1, y1, z1],
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
    4.0,
    0.15
  );
  // Top page edge (+Y): uv.x runs across pages (z0..z1)
  pushQuad(
    out,
    [x0, y1, z1],
    [x1, y1, z1],
    [x1, y1, z0],
    [x0, y1, z0],
    [0, 0],
    [0, 1],
    [1, 1],
    [1, 0],
    4.0,
    0.15
  );
  // Bottom page edge (-Y): uv.x runs across pages (z0..z1)
  pushQuad(
    out,
    [x0, y0, z0],
    [x1, y0, z0],
    [x1, y0, z1],
    [x0, y0, z1],
    [1, 0],
    [1, 1],
    [0, 1],
    [0, 0],
    4.0,
    0.15
  );
}

/** Builds the full beveled hardcover book + page block + curved spine mesh. */
export function buildMonolithGeometry(): MeshData {
  const out: number[] = [];
  appendCoverBoard(out, true);
  appendCoverBoard(out, false);
  appendCurvedSpine(out);
  appendPageBlock(out);
  return {
    vertices: new Float32Array(out),
    vertexCount: out.length / STRIDE_FLOATS,
  };
}

/** Builds the slim 3D beveled astrolabe orbital ring around the monolith. */
export function buildOrbitalRingGeometry(radius = ORBIT_RADIUS, tube = 0.012, segs = 112, sides = 8): MeshData {
  const out: number[] = [];
  const TAU = Math.PI * 2;
  for (let i = 0; i < segs; i++) {
    const u0 = i / segs;
    const u1 = (i + 1) / segs;
    const a0 = u0 * TAU;
    const a1 = u1 * TAU;
    const ca0 = Math.cos(a0);
    const sa0 = Math.sin(a0);
    const ca1 = Math.cos(a1);
    const sa1 = Math.sin(a1);

    for (let j = 0; j < sides; j++) {
      const v0 = j / sides;
      const v1 = (j + 1) / sides;
      const b0 = v0 * TAU;
      const b1 = v1 * TAU;

      const pt = (ca: number, sa: number, b: number): [Vec3, Vec3] => {
        const cb = Math.cos(b);
        const sb = Math.sin(b);
        const r = radius + cb * tube * 1.45;
        const pos: Vec3 = [ca * r, sb * tube * 0.72, sa * r];
        const norm = vec3Normalize([ca * cb, sb * 1.4, sa * cb]);
        return [pos, norm];
      };

      const [p00, n00] = pt(ca0, sa0, b0);
      const [p10, n10] = pt(ca1, sa1, b0);
      const [p11, n11] = pt(ca1, sa1, b1);
      const [p01, n01] = pt(ca0, sa0, b1);

      // Wound CCW outward so (p01-p00) x (p11-p00) aligns with n00
      pushQuad(out, p00, p01, p11, p10, [u0, v0], [u0, v1], [u1, v1], [u1, v0], 5.0, 0.8, [n00, n01, n11, n10]);
    }
  }
  return {
    vertices: new Float32Array(out),
    vertexCount: out.length / STRIDE_FLOATS,
  };
}

/** Builds a luminous faceted domain orb + subtle equatorial gold bezel ring. */
export function buildNodeOrbGeometry(latSegs = 14, lonSegs = 22): MeshData {
  const out: number[] = [];
  const TAU = Math.PI * 2;

  for (let i = 0; i < latSegs; i++) {
    const v0 = i / latSegs;
    const v1 = (i + 1) / latSegs;
    const phi0 = v0 * Math.PI;
    const phi1 = v1 * Math.PI;

    for (let j = 0; j < lonSegs; j++) {
      const u0 = j / lonSegs;
      const u1 = (j + 1) / lonSegs;
      const th0 = u0 * TAU;
      const th1 = u1 * TAU;

      const sp = (phi: number, th: number): Vec3 => [
        Math.sin(phi) * Math.cos(th),
        Math.cos(phi),
        Math.sin(phi) * Math.sin(th),
      ];

      const p00 = sp(phi0, th0);
      const p10 = sp(phi0, th1);
      const p11 = sp(phi1, th1);
      const p01 = sp(phi1, th0);

      // Wound CCW outward so geometric normal matches radial outward normal
      if (i > 0) {
        pushTri(out, p00, p10, p11, [u0, v0], [u1, v0], [u1, v1], 6.0, 0.0, [p00, p10, p11]);
      }
      if (i < latSegs - 1) {
        pushTri(out, p00, p11, p01, [u0, v0], [u1, v1], [u0, v1], 6.0, 0.0, [p00, p11, p01]);
      }
    }
  }

  // Subtle gold equatorial halo collar around each orb (part 7.0), solid from all angles
  const collarSegs = 28;
  const rInner = 1.18;
  const rOuter = 1.38;
  const h = 0.08;
  for (let i = 0; i < collarSegs; i++) {
    const u0 = i / collarSegs;
    const u1 = (i + 1) / collarSegs;
    const a0 = u0 * TAU;
    const a1 = u1 * TAU;
    const c0 = Math.cos(a0);
    const s0 = Math.sin(a0);
    const c1 = Math.cos(a1);
    const s1 = Math.sin(a1);

    // Outer rim (+radial)
    pushQuad(
      out,
      [c0 * rOuter, -h, s0 * rOuter],
      [c0 * rOuter, h, s0 * rOuter],
      [c1 * rOuter, h, s1 * rOuter],
      [c1 * rOuter, -h, s1 * rOuter],
      [u0, 0],
      [u0, 1],
      [u1, 1],
      [u1, 0],
      7.0,
      1.0,
      [
        [c0, 0, s0],
        [c0, 0, s0],
        [c1, 0, s1],
        [c1, 0, s1],
      ]
    );
    // Inner rim (-radial)
    pushQuad(
      out,
      [c0 * rInner, -h, s0 * rInner],
      [c1 * rInner, -h, s1 * rInner],
      [c1 * rInner, h, s1 * rInner],
      [c0 * rInner, h, s0 * rInner],
      [u0, 0],
      [u1, 0],
      [u1, 1],
      [u0, 1],
      7.0,
      1.0,
      [
        [-c0, 0, -s0],
        [-c1, 0, -s1],
        [-c1, 0, -s1],
        [-c0, 0, -s0],
      ]
    );
    // Top face (+Y)
    pushQuad(
      out,
      [c0 * rInner, h, s0 * rInner],
      [c1 * rInner, h, s1 * rInner],
      [c1 * rOuter, h, s1 * rOuter],
      [c0 * rOuter, h, s0 * rOuter],
      [u0, 0],
      [u1, 0],
      [u1, 1],
      [u0, 1],
      7.0,
      1.0
    );
    // Bottom face (-Y)
    pushQuad(
      out,
      [c0 * rInner, -h, s0 * rInner],
      [c0 * rOuter, -h, s0 * rOuter],
      [c1 * rOuter, -h, s1 * rOuter],
      [c1 * rInner, -h, s1 * rInner],
      [u0, 0],
      [u0, 1],
      [u1, 1],
      [u1, 0],
      7.0,
      1.0
    );
  }

  return {
    vertices: new Float32Array(out),
    vertexCount: out.length / STRIDE_FLOATS,
  };
}

/* ==========================================================================
   WebGL2 Shaders (PBR-Inspired Ceramic + Kinpun Gold + Causal Attention Grid)
   ========================================================================== */

const VERT = `#version 300 es
layout(location = 0) in vec3 aPos;
layout(location = 1) in vec3 aNormal;
layout(location = 2) in vec2 aUv;
layout(location = 3) in float aPart;
layout(location = 4) in float aBevel;

uniform mat4 uModel;
uniform mat4 uViewProj;

out vec3 vWorldPos;
out vec3 vWorldNormal;
out vec2 vUv;
out float vPart;
out float vBevel;

void main() {
  vec4 wp = uModel * vec4(aPos, 1.0);
  vWorldPos = wp.xyz;
  vWorldNormal = normalize(mat3(uModel) * aNormal);
  vUv = aUv;
  vPart = aPart;
  vBevel = aBevel;
  gl_Position = uViewProj * wp;
}
`;

const FRAG = `#version 300 es
precision highp float;

in vec3 vWorldPos;
in vec3 vWorldNormal;
in vec2 vUv;
in float vPart;
in float vBevel;

uniform vec3 uCamPos;
uniform vec3 uLightPos;
uniform vec2 uPointer;     // -1..1 normalized pointer in canvas space
uniform float uTime;
uniform float uDark;
uniform float uReduced;

uniform vec3 uCoverBg;     // deep ceramic obsidian from --tldr-bg
uniform vec3 uPaper;       // warm ivory from --paper
uniform vec3 uGold;        // kinpun gold base from goldBase(--gold)
uniform vec3 uAccent;      // active domain accent colour
uniform vec3 uHanko;       // seal red for cover edition stamp
uniform float uTrackIdx;   // 0..6 or -1 for inserts
uniform float uTrackPulse; // 0..1 ripple when track switches

// Per-draw overrides for orbital nodes
uniform vec3 uNodeColor;
uniform float uNodeActive; // 0..1
uniform float uActiveAngle;// radians along ring

out vec4 outColor;

${GOLD_GLSL}
${GOLD_FALL_GLSL}

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
    mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 3; i++) {
    v += a * vnoise(p);
    p = rot * p * 2.05 + vec2(7.3, 4.1);
    a *= 0.5;
  }
  return v;
}

/** Distance to an organic kintsugi crack crossing the monograph cover. */
vec2 kintsugiCrack(vec2 uv) {
  float warpA = (fbm(uv * 5.2 + vec2(1.7, 3.1)) - 0.5) * 0.11;
  float lineA = abs((uv.y - 0.14) - (uv.x * 0.42 + 0.02) + warpA);
  // Secondary tributary vein near top-right corner
  float warpB = (fbm(uv * 6.8 + vec2(8.4, 2.2)) - 0.5) * 0.075;
  float lineB = abs((uv.x - 0.78) + (uv.y - 0.82) * 0.65 + warpB);
  float maskB = smoothstep(0.58, 0.74, uv.y) * smoothstep(0.55, 0.72, uv.x);
  float d = min(lineA, mix(1.0, lineB, maskB));
  float maskA = smoothstep(0.02, 0.08, uv.x) * smoothstep(0.98, 0.88, uv.x);
  d = mix(1.0, d, max(maskA, maskB));
  float width = 0.0042 + 0.0024 * vnoise(uv * 28.0);
  return vec2(d, width);
}

void main() {
  vec3 N = normalize(vWorldNormal);
  vec3 V = normalize(uCamPos - vWorldPos);
  vec3 L = normalize(uLightPos - vWorldPos);
  vec3 H = normalize(L + V);

  float NdotL = max(dot(N, L), 0.0);
  float NdotV = max(dot(N, V), 0.001);
  float fresnel = pow(1.0 - NdotV, 3.8);
  vec2 toPointer = uPointer - vWorldPos.xy * 0.65;
  float fall = kinFall(toPointer);

  // Subtle matte stoneware lift so the dark ceramic body reads cleanly on --tldr-bg
  vec3 stoneware = mix(uCoverBg, uPaper, 0.09);

  int part = int(floor(vPart + 0.5));

  // =========================================================================
  // PART 6: GLAZED CERAMIC DOMAIN NODE
  // =========================================================================
  if (part == 6) {
    float spec = pow(max(dot(N, H), 0.0), 56.0);
    vec3 glaze = mix(stoneware * 1.15, uNodeColor, 0.54 + 0.28 * uNodeActive);
    vec3 lit = glaze * (0.44 + 0.60 * NdotL);
    lit += uPaper * spec * (0.20 + 0.14 * uNodeActive);
    lit += uGold * fresnel * (0.10 + 0.28 * uNodeActive);
    lit = lit / (1.0 + max(vec3(0.0), lit - 0.88) * 0.75);
    outColor = vec4(lit, 1.0);
    return;
  }

  // =========================================================================
  // PART 7: NODE EQUATORIAL KINTSUGI GOLD COLLAR
  // =========================================================================
  if (part == 7) {
    vec3 g = kinGoldG(uGold, 0.28, normalize(vec2(-N.z, N.x + 1e-4)), toPointer, fall, 1.25);
    g = mix(g, uGold * vec3(0.36, 0.27, 0.20), 0.22);
    g *= (0.72 + 0.45 * NdotL + 0.18 * uNodeActive);
    g = g / (1.0 + max(vec3(0.0), g - 0.85) * 0.85);
    outColor = vec4(g, 1.0);
    return;
  }

  // =========================================================================
  // PART 5: BRUSHED GOLD & LACQUER ORBITAL RING
  // =========================================================================
  if (part == 5) {
    float ang = vUv.x * 6.2831853;
    float dAng = abs(atan(sin(ang - uActiveAngle), cos(ang - uActiveAngle)));
    float nearActive = exp(-dAng * dAng * 5.0);
    float ticks = smoothstep(0.86, 0.96, abs(sin(ang * 28.0)));
    float edgeT = abs(vUv.y - 0.5) * 1.6;
    vec3 g = kinGoldG(uGold, min(edgeT, 1.0), vec2(cos(ang), sin(ang)), toPointer, fall, 1.18);
    vec3 lacquer = mix(stoneware * 0.95, uGold * vec3(0.36, 0.27, 0.20), 0.48);
    vec3 col = mix(lacquer, g, 0.46 + 0.36 * nearActive);
    col = mix(col, mix(uGold, uAccent, 0.32), nearActive * 0.24);
    col += uGold * ticks * 0.12;
    col *= (0.68 + 0.46 * NdotL);
    col = col / (1.0 + max(vec3(0.0), col - 0.85) * 0.85);
    outColor = vec4(col, 0.92);
    return;
  }

  // =========================================================================
  // PART 4: STACKED GILDED IVORY PAGE BLOCK
  // =========================================================================
  if (part == 4) {
    float leafCoord = vUv.x * 68.0;
    float leafWave = sin(leafCoord * 6.2831853);
    float microVar = hash21(vec2(floor(leafCoord), 11.7));
    vec3 warmPaper = mix(uPaper, uGold, 0.20);
    vec3 pageCol = warmPaper * (0.76 + 0.12 * leafWave + 0.06 * microVar);

    vec3 gilded = kinGoldG(uGold, 0.36, vec2(0.0, 1.0), toPointer, fall, 1.20);
    float goldMix = 0.34 + 0.22 * pow(max(dot(N, H), 0.0), 16.0);
    vec3 col = mix(pageCol, gilded, goldMix);
    col *= (0.50 + 0.62 * NdotL);
    col = col / (1.0 + max(vec3(0.0), col - 0.90) * 0.70);
    outColor = vec4(col, 1.0);
    return;
  }

  // =========================================================================
  // PART 3: CURVED 5-RIB MATTE CERAMIC SPINE
  // =========================================================================
  if (part == 3) {
    float grain = fbm(vUv * vec2(18.0, 42.0));
    vec3 base = stoneware * (0.86 + 0.20 * grain);

    float rib = 0.0;
    for (int i = 0; i < 5; i++) {
      float ry = 0.14 + float(i) * 0.18;
      rib = max(rib, smoothstep(0.014, 0.004, abs(vUv.y - ry)));
    }
    vec3 goldRib = kinGoldG(uGold, 0.22, vec2(1.0, 0.0), toPointer, fall, 1.32);
    vec3 col = mix(base, goldRib, rib * 0.88);
    float spec = pow(max(dot(N, H), 0.0), 42.0);
    col *= (0.48 + 0.64 * NdotL);
    col += uPaper * spec * (0.09 + 0.14 * rib);
    col += uGold * fresnel * 0.14;
    col = col / (1.0 + max(vec3(0.0), col - 0.86) * 0.80);
    outColor = vec4(col, 1.0);
    return;
  }

  // =========================================================================
  // PART 2: BEVELED COVER EDGES & CHAMFERS
  // =========================================================================
  if (part == 2) {
    vec3 base = stoneware * 1.08;
    float spec = pow(max(dot(N, H), 0.0), 48.0);
    vec3 goldEdge = kinGoldG(uGold, 0.30, normalize(vec2(N.y, -N.x + 1e-4)), toPointer, fall, 1.28);
    vec3 col = mix(base, goldEdge, vBevel * 0.34);
    col *= (0.48 + 0.64 * NdotL);
    col += uPaper * spec * 0.14;
    col += uGold * fresnel * 0.18;
    col = col / (1.0 + max(vec3(0.0), col - 0.86) * 0.80);
    outColor = vec4(col, 1.0);
    return;
  }

  // =========================================================================
  // PART 0 & 1: FRONT & BACK MATTE CERAMIC COVERS
  // =========================================================================
  float weave = 0.5 + 0.5 * sin(vUv.x * 260.0) * sin(vUv.y * 340.0);
  float stone = fbm(vUv * 12.0);
  vec3 cover = stoneware * (0.86 + 0.18 * stone + 0.03 * weave);

  // Outer engraved hairline gold frame
  vec2 frameDist = min(abs(vUv - vec2(0.068, 0.056)), abs(vUv - vec2(0.932, 0.944)));
  float inFrameX = step(0.068, vUv.x) * step(vUv.x, 0.932);
  float inFrameY = step(0.056, vUv.y) * step(vUv.y, 0.944);
  float frameLine = max(
    smoothstep(0.0040, 0.0012, frameDist.x) * inFrameY,
    smoothstep(0.0030, 0.0010, frameDist.y) * inFrameX
  );

  vec3 goldMat = kinGoldG(uGold, 0.20, vec2(0.75, 0.66), toPointer, fall, 1.32);
  float goldMask = frameLine * 0.68;
  float specBoost = 0.0;

  if (part == 0) {
    // ── TOP EDITORIAL REGISTER (edition hairline + muted hanko seal) ──
    float topRule = smoothstep(0.0028, 0.0008, abs(vUv.y - 0.825)) * step(0.13, vUv.x) * step(vUv.x, 0.87);
    goldMask = max(goldMask, topRule * 0.55);

    float titleBar1 = smoothstep(0.0085, 0.0038, abs(vUv.y - 0.885)) * step(0.13, vUv.x) * step(vUv.x, 0.64);
    float titleBar2 = smoothstep(0.0042, 0.0014, abs(vUv.y - 0.855)) * step(0.13, vUv.x) * step(vUv.x, 0.44);
    goldMask = max(goldMask, max(titleBar1 * 0.78, titleBar2 * 0.40));

    // Hanko vermilion square seal top-right
    float hankoBox = step(0.805, vUv.x) * step(vUv.x, 0.870) * step(0.848, vUv.y) * step(vUv.y, 0.896);
    float hankoInner = step(0.814, vUv.x) * step(vUv.x, 0.861) * step(0.855, vUv.y) * step(vUv.y, 0.889);
    cover = mix(cover, uHanko * 0.88, hankoBox * 0.88);
    cover = mix(cover, stoneware, hankoInner * 0.58);

    // ── ETCHED 8x8 CAUSAL SELF-ATTENTION MATRIX (ceramic & gold inlay) ──
    vec2 mMin = vec2(0.135, 0.215);
    vec2 mMax = vec2(0.865, 0.770);
    if (vUv.x >= mMin.x && vUv.x <= mMax.x && vUv.y >= mMin.y && vUv.y <= mMax.y) {
      vec2 mUv = (vUv - mMin) / (mMax - mMin);
      float NGRID = 8.0;
      vec2 grid = mUv * NGRID;
      vec2 cell = floor(grid);
      vec2 f = fract(grid);

      float colIdx = cell.x;
      float rowIdx = (NGRID - 1.0) - cell.y;

      vec2 pad = abs(f - 0.5);
      float inCell = smoothstep(0.455, 0.415, max(pad.x, pad.y));
      float bevelEdge = smoothstep(0.47, 0.43, max(pad.x, pad.y)) - inCell;

      // Recessed matte stoneware matrix bed
      cover *= 0.80;
      goldMask = max(goldMask, bevelEdge * 0.14);

      if (rowIdx >= colIdx) {
        float distDiag = rowIdx - colIdx;
        float isDiag = 1.0 - step(0.5, distDiag);
        float isSink = 1.0 - step(0.5, colIdx);

        float seed = hash21(vec2(rowIdx * 3.1 + max(uTrackIdx, 0.0) * 1.7, colIdx * 5.7));
        float ripple = uTrackPulse * exp(-abs(rowIdx - (1.0 - uTrackPulse) * 7.5) * 0.9);

        float weight = clamp(
          0.22
          + 0.42 * isDiag
          + 0.20 * isSink
          + 0.22 * seed
          + 0.24 * ripple,
          0.18,
          1.0
        );

        // Muted earth glaze for off-diagonal tokens; brushed kintsugi gold along diagonal
        vec3 earthTile = mix(stoneware * 1.25, uAccent, 0.34 + 0.32 * weight);
        vec3 goldInlay = kinGoldG(uGold, clamp(length(f - 0.5) * 1.6, 0.0, 1.0), vec2(0.71, -0.71), toPointer, fall, 1.22);
        float goldRatio = clamp(0.14 + 0.64 * isDiag + 0.18 * isSink + 0.20 * ripple, 0.0, 0.88);
        vec3 tileColor = mix(earthTile, goldInlay, goldRatio);

        cover = mix(cover, tileColor, inCell * (0.72 + 0.22 * weight));
        goldMask = max(goldMask, bevelEdge * (0.24 + 0.38 * isDiag));
        specBoost = max(specBoost, inCell * (0.18 + 0.22 * isDiag));
      } else {
        // Masked upper-triangle (-infinity): quiet debossed gold pins
        float dotDist = length(f - 0.5);
        float dotMask = smoothstep(0.105, 0.055, dotDist);
        cover = mix(cover, mix(stoneware, uGold, 0.28), dotMask * 0.48);
        goldMask = max(goldMask, bevelEdge * 0.06);
      }
    }

    // Matrix perimeter hairline
    float mBoxX = (smoothstep(0.0036, 0.001, abs(vUv.x - mMin.x)) + smoothstep(0.0036, 0.001, abs(vUv.x - mMax.x)))
                  * step(mMin.y, vUv.y) * step(vUv.y, mMax.y);
    float mBoxY = (smoothstep(0.0028, 0.0009, abs(vUv.y - mMin.y)) + smoothstep(0.0028, 0.0009, abs(vUv.y - mMax.y)))
                  * step(mMin.x, vUv.x) * step(vUv.x, mMax.x);
    goldMask = max(goldMask, min(1.0, mBoxX + mBoxY) * 0.50);

    // ── BOTTOM 7-DOMAIN TRACK PIPS ──
    float botRule = smoothstep(0.0026, 0.0008, abs(vUv.y - 0.165)) * step(0.13, vUv.x) * step(vUv.x, 0.87);
    goldMask = max(goldMask, botRule * 0.46);

    for (int i = 0; i < 7; i++) {
      float px = 0.20 + float(i) * 0.10;
      float pd = length((vUv - vec2(px, 0.115)) * vec2(1.0, 1.38));
      float isSel = 1.0 - step(0.5, abs(float(i) - uTrackIdx));
      float pip = smoothstep(0.016 + 0.004 * isSel, 0.008, pd);
      cover = mix(cover, mix(uGold * 0.85, uAccent, isSel * 0.72), pip * (0.42 + 0.50 * isSel));
    }
  } else {
    // ── BACK COVER: ENGRAVED KINTSUGI ENSO COLOPHON ──
    vec2 ensoP = (vUv - vec2(0.5, 0.56)) * vec2(1.0, 1.38);
    float r = length(ensoP);
    float ang = atan(ensoP.y, ensoP.x);
    float gap = smoothstep(0.25, 0.65, abs(ang - 0.55));
    float ring = smoothstep(0.022, 0.006, abs(r - 0.22)) * gap;
    goldMask = max(goldMask, ring * 0.72);
  }

  // ── EMBOSSED KINTSUGI GOLD SEAMS WITH LACQUER EDGE (matching bowl-3d-gl.ts) ──
  vec2 seam = kintsugiCrack(vUv);
  float seamT = clamp(seam.x / seam.y, 0.0, 1.0);
  float seamMask = smoothstep(1.15, 0.45, seam.x / seam.y);
  vec3 seamGold = kinGoldG(uGold, seamT, normalize(vec2(0.92, 0.39)), toPointer, fall, 1.42);
  float lac = smoothstep(0.56, 0.96, seamT) * 0.52;
  seamGold = mix(seamGold, uGold * vec3(0.36, 0.27, 0.20), lac);

  // Matte stoneware diffuse + restrained ceramic specular + warm gold edge catch
  float spec = pow(max(dot(N, H), 0.0), 54.0);
  float keyLight = 0.50 + 0.60 * NdotL;

  vec3 surface = cover * keyLight;
  surface += uPaper * spec * (0.10 + specBoost * 0.22);
  surface += uGold * fresnel * 0.14;

  surface = mix(surface, goldMat * (0.72 + 0.44 * NdotL), clamp(goldMask, 0.0, 1.0));
  surface = mix(surface, seamGold * (0.74 + 0.44 * NdotL), seamMask * 0.96);

  // Tone-rolloff matching bowl-3d-gl.ts so metallic highlights stay rich gold
  surface = surface / (1.0 + max(vec3(0.0), surface - 0.86) * 0.80);
  outColor = vec4(surface, 1.0);
}
`;

/* ==========================================================================
   WebGL2 Stage Controller
   ========================================================================== */

function compileShader(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader {
  const s = gl.createShader(type);
  if (!s) throw new Error('WebGL2 createShader failed');
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(s) || 'shader compile error';
    gl.deleteShader(s);
    throw new Error(log);
  }
  return s;
}

function createVao(gl: WebGL2RenderingContext, mesh: MeshData): { vao: WebGLVertexArrayObject; vbo: WebGLBuffer } {
  const vao = gl.createVertexArray();
  const vbo = gl.createBuffer();
  if (!vao || !vbo) throw new Error('WebGL2 VAO/VBO allocation failed');

  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, mesh.vertices, gl.STATIC_DRAW);

  const stride = STRIDE_FLOATS * 4;
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 3, gl.FLOAT, false, stride, 0);
  gl.enableVertexAttribArray(1);
  gl.vertexAttribPointer(1, 3, gl.FLOAT, false, stride, 3 * 4);
  gl.enableVertexAttribArray(2);
  gl.vertexAttribPointer(2, 2, gl.FLOAT, false, stride, 6 * 4);
  gl.enableVertexAttribArray(3);
  gl.vertexAttribPointer(3, 1, gl.FLOAT, false, stride, 8 * 4);
  gl.enableVertexAttribArray(4);
  gl.vertexAttribPointer(4, 1, gl.FLOAT, false, stride, 9 * 4);

  gl.bindVertexArray(null);
  return { vao, vbo };
}

function isDarkTheme(): boolean {
  const explicit = document.documentElement.dataset.theme;
  if (explicit === 'dark') return true;
  if (explicit === 'light') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function createInference3DStage(
  canvas: HTMLCanvasElement,
  opts: Inference3DOptions = {}
): Inference3DStage | null {
  const gl = canvas.getContext('webgl2', {
    alpha: true,
    antialias: true,
    depth: true,
    premultipliedAlpha: false,
    powerPreference: 'high-performance',
  });
  if (!gl) return null;

  let prog: WebGLProgram;
  try {
    const vs = compileShader(gl, gl.VERTEX_SHADER, VERT);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG);
    prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(prog) || 'program link error');
    }
  } catch {
    return null;
  }

  gl.useProgram(prog);

  const monolithMesh = buildMonolithGeometry();
  const ringMesh = buildOrbitalRingGeometry();
  const orbMesh = buildNodeOrbGeometry();

  const monolithBuf = createVao(gl, monolithMesh);
  const ringBuf = createVao(gl, ringMesh);
  const orbBuf = createVao(gl, orbMesh);

  const uniformNames = [
    'uModel', 'uViewProj', 'uCamPos', 'uLightPos', 'uPointer', 'uTime', 'uDark', 'uReduced',
    'uCoverBg', 'uPaper', 'uGold', 'uAccent', 'uHanko', 'uTrackIdx', 'uTrackPulse',
    'uNodeColor', 'uNodeActive', 'uActiveAngle',
  ] as const;
  const U = Object.fromEntries(
    uniformNames.map((name) => [name, gl.getUniformLocation(prog, name)])
  ) as Record<(typeof uniformNames)[number], WebGLUniformLocation | null>;

  const reducedMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
  let reduced = reducedMedia.matches;

  // Palette resolved purely from CSS custom properties
  let palette = {
    coverBg: [0.08, 0.12, 0.18] as Vec3,
    paper: [0.96, 0.95, 0.93] as Vec3,
    gold: [0.92, 0.65, 0.21] as Vec3,
    hanko: [0.82, 0.33, 0.25] as Vec3,
    dark: false,
    accents: {} as Record<Inference3DNodeSpec['accent'], Vec3>,
  };

  let activeTrack = opts.initialTrack ?? 'foundations';
  let targetSpec = computeTrackOrbitTarget(activeTrack);
  let currentAccent: Vec3 = [0, 0.66, 0.72];
  let targetAccent: Vec3 = [0, 0.66, 0.72];
  let trackPulse = 0;

  // Interactive orbit + inertia + pointer + scroll choreography state
  const BASE_YAW = -0.38;
  const BASE_PITCH = 0.15;
  const FOV_RAD = (36 * Math.PI) / 180;

  let dragYaw = 0;
  let dragPitch = 0;
  let velYaw = 0;
  let velPitch = 0;
  let smoothYawOffset = targetSpec.yawOffset;
  let smoothPitchOffset = targetSpec.pitchOffset;

  let pointerTarget = { x: 0.35, y: 0.28 };
  let pointerCurr = { x: 0.35, y: 0.28 };
  let scrollTarget = 0;
  let scrollCurr = 0;
  const orbitTargetFor = (idx: number) => (idx >= 0 ? 0.55 - INFERENCE_3D_NODES[idx].angle : 0);
  let orbitTarget = orbitTargetFor(targetSpec.nodeIndex);
  let orbitPhase = orbitTarget;
  let hoveredNode = -1;
  let lastNodeWorldPositions: Vec3[] = INFERENCE_3D_NODES.map(() => [0, 0, 0]);
  let lastCameraZ = 5.15;

  // Pointer drag state
  let isDragging = false;
  let dragPointerId = -1;
  let dragLastX = 0;
  let dragLastY = 0;
  let dragMoved = 0;

  let rafId = 0;
  let lastNow = 0;
  let initialized = false;
  let inViewport = true;
  let destroyed = false;

  const readPalette = () => {
    const host = canvas.parentElement ?? canvas;
    const get = (token: string): Vec3 => resolveColor(host, `var(${token})`);
    palette = {
      coverBg: get('--tldr-bg'),
      paper: get('--tldr-ink'),
      gold: goldBase(get('--gold')),
      hanko: get('--hanko'),
      dark: isDarkTheme(),
      accents: {
        mizu: get('--mizu'),
        hanko: get('--hanko'),
        ochre: get('--ochre'),
        plum: get('--plum'),
        moss: get('--moss'),
        indigo: get('--indigo'),
      },
    };
    targetAccent = [...palette.accents[targetSpec.accent]] as Vec3;
    if (!initialized) {
      currentAccent = [...targetAccent] as Vec3;
      initialized = true;
    }
    requestFrame();
  };

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(rect.width * dpr));
    const h = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    requestFrame();
  };

  const readScroll = () => {
    const maxSpan = Math.max(window.innerHeight * 1.65, 900);
    const next = Math.max(0, Math.min(1, window.scrollY / maxSpan));
    if (Math.abs(next - scrollTarget) > 0.0005) {
      scrollTarget = next;
      requestFrame();
    }
  };

  const setTrack = (trackId: string) => {
    if (trackId === activeTrack && initialized) return;
    activeTrack = trackId;
    targetSpec = computeTrackOrbitTarget(trackId);
    targetAccent = [...(palette.accents[targetSpec.accent] ?? palette.gold)] as Vec3;
    // Shortest angular turn along the orbital ring toward the active domain
    const rawTarget = orbitTargetFor(targetSpec.nodeIndex);
    const delta = Math.atan2(Math.sin(rawTarget - orbitPhase), Math.cos(rawTarget - orbitPhase));
    orbitTarget = orbitPhase + delta;
    trackPulse = reduced ? 0 : 1.0;
    requestFrame();
  };

  const canvasNdc = (clientX: number, clientY: number) => {
    const r = canvas.getBoundingClientRect();
    const nx = ((clientX - r.left) / Math.max(1, r.width)) * 2 - 1;
    const ny = 1 - ((clientY - r.top) / Math.max(1, r.height)) * 2;
    return { nx, ny, aspect: Math.max(1, r.width) / Math.max(1, r.height) };
  };

  const onPointerDown = (e: PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    isDragging = true;
    dragPointerId = e.pointerId;
    dragLastX = e.clientX;
    dragLastY = e.clientY;
    dragMoved = 0;
    velYaw = 0;
    velPitch = 0;
    if (e.pointerType === 'mouse') {
      canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = 'grabbing';
    }
    requestFrame();
  };

  const onPointerMove = (e: PointerEvent) => {
    const { nx, ny, aspect } = canvasNdc(e.clientX, e.clientY);
    pointerTarget.x = Math.max(-1.2, Math.min(1.2, nx));
    pointerTarget.y = Math.max(-1.2, Math.min(1.2, ny));

    if (isDragging && e.pointerId === dragPointerId) {
      const dx = e.clientX - dragLastX;
      const dy = e.clientY - dragLastY;
      dragLastX = e.clientX;
      dragLastY = e.clientY;
      dragMoved += Math.hypot(dx, dy);

      const yawDelta = dx * 0.0085;
      const pitchDelta = e.pointerType === 'touch' ? dy * 0.0028 : dy * 0.0068;
      dragYaw += yawDelta;
      dragPitch = Math.max(-0.82, Math.min(0.82, dragPitch + pitchDelta));
      velYaw = yawDelta * 54;
      velPitch = pitchDelta * 54;
      requestFrame();
      return;
    }

    // Hover picking against the 7 orbiting domain nodes
    const hit = hitTestOrbitalNode(nx, ny, aspect, FOV_RAD, lastCameraZ, lastNodeWorldPositions);
    if (hit !== hoveredNode) {
      hoveredNode = hit;
      canvas.style.cursor = hit >= 0 ? 'pointer' : 'grab';
      opts.onHoverTrack?.(hit >= 0 ? INFERENCE_3D_NODES[hit].id : null);
    }
    requestFrame();
  };

  const endDrag = (e: PointerEvent) => {
    if (!isDragging || e.pointerId !== dragPointerId) return;
    isDragging = false;
    if (canvas.hasPointerCapture(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId);
    }

    // Short click picks an orbital domain node if one is under the pointer
    if (dragMoved < 7) {
      const { nx, ny, aspect } = canvasNdc(e.clientX, e.clientY);
      const hit = hitTestOrbitalNode(nx, ny, aspect, FOV_RAD, lastCameraZ, lastNodeWorldPositions, 0.25);
      if (hit >= 0) {
        const picked = INFERENCE_3D_NODES[hit];
        setTrack(picked.id);
        opts.onSelectTrack?.(picked.id);
      }
    }
    canvas.style.cursor = hoveredNode >= 0 ? 'pointer' : 'grab';
    requestFrame();
  };

  const onPointerLeave = () => {
    if (!isDragging) {
      pointerTarget = { x: 0.32, y: 0.25 };
      if (hoveredNode !== -1) {
        hoveredNode = -1;
        opts.onHoverTrack?.(null);
      }
      canvas.style.cursor = 'grab';
      requestFrame();
    }
  };

  // Global gentle pointer-light tracking across the hero plate
  const onWindowPointerMove = (e: PointerEvent) => {
    if (isDragging || !inViewport) return;
    const r = canvas.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return;
    const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
    const ny = 1 - ((e.clientY - r.top) / r.height) * 2;
    pointerTarget.x = Math.max(-1.25, Math.min(1.25, nx * 0.85));
    pointerTarget.y = Math.max(-1.25, Math.min(1.25, ny * 0.85));
    requestFrame();
  };

  const drawScene = (nowMs: number) => {
    rafId = 0;
    if (destroyed) return;

    const dt = lastNow ? Math.min(0.05, (nowMs - lastNow) / 1000) : 0.016;
    lastNow = nowMs;
    const tSec = nowMs / 1000;

    // Smooth inertia coasting after drag release
    if (!isDragging) {
      const damp = Math.exp(-dt * 4.4);
      dragYaw += velYaw * dt;
      dragPitch = Math.max(-0.82, Math.min(0.82, dragPitch + velPitch * dt));
      velYaw *= damp;
      velPitch *= damp;
      if (Math.abs(velYaw) < 0.0008) velYaw = 0;
      if (Math.abs(velPitch) < 0.0008) velPitch = 0;
    }

    // Smooth exponential interpolation for pointer, scroll, domain rotation, and accent
    const ease = reduced ? 1 : 1 - Math.exp(-dt * 6.5);
    pointerCurr.x += (pointerTarget.x - pointerCurr.x) * ease;
    pointerCurr.y += (pointerTarget.y - pointerCurr.y) * ease;
    scrollCurr += (scrollTarget - scrollCurr) * ease;
    smoothYawOffset += (targetSpec.yawOffset - smoothYawOffset) * ease;
    smoothPitchOffset += (targetSpec.pitchOffset - smoothPitchOffset) * ease;
    orbitPhase += (orbitTarget - orbitPhase) * ease;
    currentAccent[0] += (targetAccent[0] - currentAccent[0]) * ease;
    currentAccent[1] += (targetAccent[1] - currentAccent[1]) * ease;
    currentAccent[2] += (targetAccent[2] - currentAccent[2]) * ease;
    if (trackPulse > 0) trackPulse = Math.max(0, trackPulse - dt * 1.5);

    const w = canvas.width;
    const h = canvas.height;
    const aspect = w / Math.max(1, h);

    // Subtle scroll-driven tilt
    const camZ = 5.15 - scrollCurr * 0.36;
    const camY = 0.06 - scrollCurr * 0.18;
    lastCameraZ = camZ;

    const proj = mat4Perspective(FOV_RAD, aspect, 0.1, 30);
    const view = mat4Translate(0, -camY, -camZ);
    const viewProj = mat4Multiply(proj, view);

    const scrollYaw = scrollCurr * 0.48;
    const scrollPitch = scrollCurr * 0.18;

    const yaw = BASE_YAW + smoothYawOffset + dragYaw + scrollYaw;
    const pitch = BASE_PITCH + smoothPitchOffset + dragPitch + scrollPitch;
    const roll = -0.04 + pointerCurr.x * 0.024;

    const monolithModel = mat4Multiply(
      mat4RotateY(yaw),
      mat4Multiply(mat4RotateX(pitch), mat4RotateZ(roll))
    );

    // Inclined astrolabe orbital ring transform
    const ringTilt = mat4Multiply(
      mat4RotateY(dragYaw * 0.55 + scrollCurr * 0.4),
      mat4Multiply(mat4RotateX(ORBIT_TILT_X + dragPitch * 0.35), mat4RotateZ(ORBIT_TILT_Z))
    );

    const activeNodeIdx = targetSpec.nodeIndex;
    const activeAngle = activeNodeIdx >= 0 ? INFERENCE_3D_NODES[activeNodeIdx].angle : 0;

    // Upload shared frame uniforms
    gl.viewport(0, 0, w, h);
    gl.clearColor(0, 0, 0, 0);
    gl.clearDepth(1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.disable(gl.BLEND);

    gl.useProgram(prog);
    gl.uniformMatrix4fv(U.uViewProj, false, viewProj);
    gl.uniform3f(U.uCamPos, 0, camY, camZ);
    gl.uniform3f(U.uLightPos, pointerCurr.x * 3.0 + 0.8, pointerCurr.y * 2.2 + 1.5, 4.4);
    gl.uniform2f(U.uPointer, pointerCurr.x, pointerCurr.y);
    gl.uniform1f(U.uTime, tSec);
    gl.uniform1f(U.uDark, palette.dark ? 1 : 0);
    gl.uniform1f(U.uReduced, reduced ? 1 : 0);
    gl.uniform3fv(U.uCoverBg, palette.coverBg);
    gl.uniform3fv(U.uPaper, palette.paper);
    gl.uniform3fv(U.uGold, palette.gold);
    gl.uniform3fv(U.uAccent, currentAccent);
    gl.uniform3fv(U.uHanko, palette.hanko);
    gl.uniform1f(U.uTrackIdx, activeNodeIdx);
    gl.uniform1f(U.uTrackPulse, trackPulse);
    gl.uniform1f(U.uActiveAngle, activeAngle);

    // 1. Draw Beveled Compendium Monolith
    gl.uniformMatrix4fv(U.uModel, false, monolithModel);
    gl.bindVertexArray(monolithBuf.vao);
    gl.drawArrays(gl.TRIANGLES, 0, monolithMesh.vertexCount);

    // 2. Draw Inclined Orbital Ring
    const ringModel = mat4Multiply(ringTilt, mat4RotateY(-orbitPhase));
    gl.uniformMatrix4fv(U.uModel, false, ringModel);
    gl.bindVertexArray(ringBuf.vao);
    gl.drawArrays(gl.TRIANGLES, 0, ringMesh.vertexCount);

    // 3. Draw 7 Glazed Ceramic Domain Nodes along the orbital ring
    gl.bindVertexArray(orbBuf.vao);
    for (let i = 0; i < INFERENCE_3D_NODES.length; i++) {
      const node = INFERENCE_3D_NODES[i];
      const worldPos = computeOrbitalNodePosition(ringTilt, i, orbitPhase);
      lastNodeWorldPositions[i] = worldPos;

      const isActive = i === activeNodeIdx;
      const isHovered = i === hoveredNode;
      const scale = NODE_BASE_RADIUS * (isActive ? 1.38 : isHovered ? 1.2 : 1.0);

      const nodeModel = mat4Multiply(
        mat4Translate(worldPos[0], worldPos[1], worldPos[2]),
        mat4Multiply(mat4RotateY(node.angle + orbitPhase), mat4Multiply(mat4RotateX(0.32), mat4Scale(scale, scale, scale)))
      );

      const nodeRgb = palette.accents[node.accent] ?? palette.gold;
      gl.uniformMatrix4fv(U.uModel, false, nodeModel);
      gl.uniform3fv(U.uNodeColor, nodeRgb);
      gl.uniform1f(U.uNodeActive, isActive ? 1.0 : isHovered ? 0.6 : 0.0);
      gl.drawArrays(gl.TRIANGLES, 0, orbMesh.vertexCount);
    }

    gl.bindVertexArray(null);

    // Draw on demand: continue only while an interaction or transition is settling
    const stillSettling =
      isDragging ||
      Math.abs(velYaw) > 0.001 ||
      Math.abs(velPitch) > 0.001 ||
      trackPulse > 0.001 ||
      Math.abs(pointerTarget.x - pointerCurr.x) > 0.0015 ||
      Math.abs(pointerTarget.y - pointerCurr.y) > 0.0015 ||
      Math.abs(scrollTarget - scrollCurr) > 0.001 ||
      Math.abs(targetSpec.yawOffset - smoothYawOffset) > 0.001 ||
      Math.abs(targetSpec.pitchOffset - smoothPitchOffset) > 0.001 ||
      Math.abs(orbitTarget - orbitPhase) > 0.001 ||
      Math.abs(targetAccent[0] - currentAccent[0]) > 0.002 ||
      Math.abs(targetAccent[1] - currentAccent[1]) > 0.002 ||
      Math.abs(targetAccent[2] - currentAccent[2]) > 0.002;

    if (stillSettling && inViewport) {
      rafId = requestAnimationFrame(drawScene);
    } else {
      lastNow = 0;
    }
  };

  const requestFrame = () => {
    if (destroyed || rafId) return;
    rafId = requestAnimationFrame(drawScene);
  };

  // Wire up listeners & observers
  canvas.style.cursor = 'grab';
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);
  canvas.addEventListener('pointerleave', onPointerLeave);
  window.addEventListener('pointermove', onWindowPointerMove, { passive: true });
  window.addEventListener('scroll', readScroll, { passive: true });

  const onContextLost = (e: Event) => {
    e.preventDefault();
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  };
  canvas.addEventListener('webglcontextlost', onContextLost);

  const ro = new ResizeObserver(() => resize());
  ro.observe(canvas);

  const io = new IntersectionObserver(
    (entries) => {
      inViewport = entries.some((entry) => entry.isIntersecting);
      if (inViewport) requestFrame();
    },
    { threshold: 0.01 }
  );
  io.observe(canvas);

  const themeObserver = new MutationObserver(() => readPalette());
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });

  const colorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
  const onColorSchemeChange = () => readPalette();
  colorSchemeMedia.addEventListener('change', onColorSchemeChange);

  const onReducedChange = () => {
    reduced = reducedMedia.matches;
    requestFrame();
  };
  reducedMedia.addEventListener('change', onReducedChange);

  // Initial hydrate & first paint
  readPalette();
  readScroll();
  resize();
  requestFrame();

  return {
    setTrack,
    setScrollProgress(p: number) {
      scrollTarget = Math.max(0, Math.min(1, p));
      requestFrame();
    },
    readPalette,
    resize,
    destroy() {
      destroyed = true;
      if (rafId) cancelAnimationFrame(rafId);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', endDrag);
      canvas.removeEventListener('pointercancel', endDrag);
      canvas.removeEventListener('pointerleave', onPointerLeave);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      window.removeEventListener('pointermove', onWindowPointerMove);
      window.removeEventListener('scroll', readScroll);
      colorSchemeMedia.removeEventListener('change', onColorSchemeChange);
      reducedMedia.removeEventListener('change', onReducedChange);
      ro.disconnect();
      io.disconnect();
      themeObserver.disconnect();
      gl.deleteVertexArray(monolithBuf.vao);
      gl.deleteBuffer(monolithBuf.vbo);
      gl.deleteVertexArray(ringBuf.vao);
      gl.deleteBuffer(ringBuf.vbo);
      gl.deleteVertexArray(orbBuf.vao);
      gl.deleteBuffer(orbBuf.vbo);
      gl.deleteProgram(prog);
    },
  };
}
