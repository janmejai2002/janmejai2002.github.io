/**
 * The bowl's wall, cut into one piece per article (scripts/bowl-3d.ts draws it).
 * Build time only.
 *
 * Sites are laid on the sphere evenly by area in a slow spiral, oldest at the
 * foot, so a new article always lands at the top. The Voronoi diagram is taken
 * in a conformal map of the sphere (u around, log-tan of phi up), so pieces keep
 * a natural shape at every height, and it wraps all the way round. Every join is
 * roughened once, so neighbours share exactly the same broken line, including
 * across the wrap.
 *
 * Shipped to the page packed as 16-bit integers, about 15 KB.
 */
// @ts-expect-error d3-delaunay ships no types.
import { Delaunay } from 'd3-delaunay';
import { rng } from './bowl';
import { PHI0, PHI1 } from './bowl-form';

const TAU = Math.PI * 2;
const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const toV = (phi: number) => Math.log(Math.tan(phi / 2));
const toPhi = (v: number) => 2 * Math.atan(Math.exp(v));

export interface Wall {
  capacity: number;
  /** Per cell: its polygon as [u, phi] pairs, u continuous (may leave 0..1 near the wrap). */
  cells: [number, number][][];
}

function build(n: number): Wall {
  const capacity = Math.ceil((n + 14) / 20) * 20;
  const rand = rng(1957);
  const c0 = Math.cos(PHI0);
  const c1 = Math.cos(PHI1);
  const sites: [number, number][] = [];
  for (let k = 0; k < capacity; k++) {
    // Even by area: equal steps in cos(phi).
    const a = (k + 0.5) / capacity;
    const phi = Math.acos(c0 - a * (c0 - c1));
    const u = ((k * GOLDEN) / TAU + (rand() - 0.5) * 0.04) % 1;
    const v = toV(phi) + (rand() - 0.5) * 0.04;
    sites.push([u * TAU, v]);
  }
  // Closing rows just under the foot and over the top, so edge cells end there.
  const vLo = toV(PHI0) - 0.09;
  const vHi = toV(PHI1) + 0.11;
  const ring: [number, number][] = [];
  const RING = 44;
  for (let i = 0; i < RING; i++) {
    ring.push([(i / RING) * TAU, vLo - 0.06]);
    ring.push([((i + 0.5) / RING) * TAU, vHi + 0.06]);
  }
  const all = [...sites, ...ring];
  // Three copies round the cylinder, so the middle copy's cells wrap correctly.
  const pts: [number, number][] = [];
  for (const shift of [-TAU, 0, TAU]) for (const [x, y] of all) pts.push([x + shift, y]);
  const mid = all.length;
  const voronoi = Delaunay.from(pts).voronoi([-TAU * 1.5, vLo - 1, TAU * 2.5, vHi + 1]);

  // One broken line per join, keyed on the join with its midpoint wrapped into
  // the first turn, so a cell and its neighbour across the wrap agree.
  const edges = new Map<string, [number, number][]>();
  const key = (p: readonly number[]) => `${p[0].toFixed(3)},${p[1].toFixed(3)}`;
  const roughen = (a: readonly number[], b: readonly number[]) => {
    const midU = (a[0] + b[0]) / 2;
    const shift = Math.floor(midU / TAU) * TAU;
    const pa = [a[0] - shift, a[1]];
    const pb = [b[0] - shift, b[1]];
    const ka = key(pa);
    const kb = key(pb);
    const forward = ka < kb;
    const id = forward ? `${ka}|${kb}` : `${kb}|${ka}`;
    if (!edges.has(id)) {
      const [p, q] = forward ? [pa, pb] : [pb, pa];
      let line: [number, number][] = [[p[0], p[1]], [q[0], q[1]]];
      const local = rng([...id].reduce((s, ch) => (Math.imul(s, 31) + ch.charCodeAt(0)) | 0, 7));
      for (let depth = 0, amp = 0.16; depth < 2; depth++, amp *= 0.55) {
        const next: [number, number][] = [line[0]];
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
    const ordered = forward ? line : [...line].reverse();
    return ordered.map(([x, y]) => [x + shift, y] as [number, number]);
  };

  const cells: [number, number][][] = [];
  for (let i = 0; i < capacity; i++) {
    const poly = voronoi.cellPolygon(mid + i);
    const out: [number, number][] = [];
    for (let k = 0; k < poly.length - 1; k++) out.push(...roughen(poly[k], poly[k + 1]).slice(0, -1));
    // Clamp to the shell: nothing below the foot or above the future rim.
    cells.push(out.map(([x, y]) => [x / TAU, toPhi(Math.max(toV(PHI0), Math.min(toV(PHI1), y)))]));
  }
  return { capacity, cells };
}

const memo = new Map<number, Wall>();
export function bowlWall(n: number) {
  if (!memo.has(n)) memo.set(n, build(n));
  return memo.get(n)!;
}

/** Packs the wall for the page: counts, then u in [-0.5, 1.5] and phi in [0, PI/2], as uint16. */
export function packWall(w: Wall) {
  const counts = w.cells.map((c) => c.length);
  const data = new Uint16Array(counts.reduce((a, b) => a + b, 0) * 2);
  let i = 0;
  for (const cell of w.cells)
    for (const [u, phi] of cell) {
      data[i++] = Math.round(((u + 0.5) / 2) * 65535);
      data[i++] = Math.round((phi / (Math.PI / 2)) * 65535);
    }
  return { counts: counts.join(','), data: Buffer.from(data.buffer).toString('base64') };
}
