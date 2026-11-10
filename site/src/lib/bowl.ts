/**
 * The geometry of the archive bowl, shared by the index and the small bowl at
 * the foot of every article, so a post's shard is the same shape in both.
 *
 * A sunflower spiral, so the bowl grows outward as posts are added without
 * existing shards moving much. `capacity` is always ahead of the post count, so
 * there is always an unwritten outer ring. Runs at build time only.
 */
// @ts-expect-error d3-delaunay ships no types, and this is its only call site.
import { Delaunay } from 'd3-delaunay';

export const SIZE = 1000;
export const C = SIZE / 2;
export const R = 476;
const GOLDEN = Math.PI * (3 - Math.sqrt(5));

type Pt = [number, number];

// A seeded generator, so the same posts always produce the same bowl.
export const rng = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

function build(n: number) {
  const capacity = Math.ceil((n + 12) / 20) * 20;
  const rand = rng(2002);
  const spacing = R * Math.sqrt(1 / capacity);

  const points: Pt[] = [];
  for (let i = 0; i < capacity; i++) {
    const r = R * Math.sqrt((i + 0.55) / capacity);
    const a = i * GOLDEN + 0.7;
    points.push([
      C + r * Math.cos(a) + (rand() - 0.5) * spacing * 0.95,
      C + r * Math.sin(a) + (rand() - 0.5) * spacing * 0.95,
    ]);
  }
  // A ring of unrendered sites so the outermost real cells close near the rim.
  const RING = 64;
  for (let i = 0; i < RING; i++) {
    const a = (i / RING) * Math.PI * 2;
    points.push([C + (R + spacing * 0.95) * Math.cos(a), C + (R + spacing * 0.95) * Math.sin(a)]);
  }

  const voronoi = Delaunay.from(points).voronoi([-200, -200, SIZE + 200, SIZE + 200]);

  // Every edge is roughened once, keyed on its two ends, so both neighbours get
  // exactly the same broken line and no gaps open along a join.
  const edges = new Map<string, Pt[]>();
  const key = (p: readonly number[]) => `${p[0].toFixed(2)},${p[1].toFixed(2)}`;
  const roughen = (a: readonly number[], b: readonly number[]) => {
    const ka = key(a);
    const kb = key(b);
    const forward = ka < kb;
    const id = forward ? `${ka}|${kb}` : `${kb}|${ka}`;
    if (!edges.has(id)) {
      const [p, q] = forward ? [a, b] : [b, a];
      let line: Pt[] = [[p[0], p[1]], [q[0], q[1]]];
      const local = rng([...id].reduce((s, ch) => (Math.imul(s, 31) + ch.charCodeAt(0)) | 0, 7));
      for (let depth = 0, amp = 0.14; depth < 3; depth++, amp *= 0.56) {
        const next: Pt[] = [line[0]];
        for (let i = 0; i < line.length - 1; i++) {
          const [x0, y0] = line[i];
          const [x1, y1] = line[i + 1];
          const off = (local() - 0.5) * amp;
          next.push([(x0 + x1) / 2 - (y1 - y0) * off, (y0 + y1) / 2 + (x1 - x0) * off]);
          next.push(line[i + 1]);
        }
        line = next;
      }
      edges.set(id, line);
    }
    const line = edges.get(id)!;
    return forward ? line : [...line].reverse();
  };

  const cells: Pt[][] = [];
  for (let i = 0; i < capacity; i++) {
    const poly = voronoi.cellPolygon(i);
    const out: Pt[] = [];
    for (let k = 0; k < poly.length - 1; k++) out.push(...roughen(poly[k], poly[k + 1]).slice(0, -1));
    cells.push(out);
  }
  return { capacity, cells, tones: Array.from({ length: n }, () => 0.72 + rand() * 0.28) };
}

// Every article page asks for the same bowl, so it is worked out once per build.
const memo = new Map<number, ReturnType<typeof build>>();
export function bowlGeometry(n: number) {
  if (!memo.has(n)) memo.set(n, build(n));
  return memo.get(n)!;
}

export const toPath = (pts: Pt[], decimals = 1) =>
  `M${pts.map(([x, y]) => `${x.toFixed(decimals)} ${y.toFixed(decimals)}`).join('L')}Z`;

/**
 * The broken edge of a plate, unique to each article and the same on every
 * build. Returns [x in %, depth in px], left to right, with one step down at the
 * break, the same step the homepage plate has.
 */
export const EDGE_DEPTH = 22;
export function plateEdge(seed: string): Pt[] {
  const rand = rng([...seed].reduce((s, ch) => (Math.imul(s, 31) + ch.charCodeAt(0)) | 0, 11));
  const STEPS = 46;
  const brk = Math.round(STEPS * (0.16 + rand() * 0.2));
  const out: Pt[] = [];
  let side = 1;
  for (let i = 0; i <= STEPS; i++) {
    const base = i < brk ? 15 : 5;
    const x = i === 0 || i === STEPS ? (i / STEPS) * 100 : ((i + (rand() - 0.5) * 0.7) / STEPS) * 100;
    // Alternating sides give a fracture's zigzag; a smooth random walk reads as a wave.
    side = -side;
    const reach = rand() < 0.2 ? 3.5 + rand() * 2.5 : 0.6 + rand() * 1.6;
    out.push([x, Math.min(EDGE_DEPTH - 1, Math.max(1, base + side * reach))]);
  }
  return out;
}
