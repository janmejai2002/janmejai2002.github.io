/**
 * The archive bowl. Where WebGL2 runs, the bowl is built from its pieces in 3D
 * (scripts/bowl-3d.ts); elsewhere it is the flat bowl (scripts/bowl-svg.ts).
 * Both speak the same interface, so the page and the crew never need to know.
 */
import { createBowl3d } from './bowl-3d';
import { createBowlSvg, type Bowl, type BowlOptions } from './bowl-svg';

export type { Bowl, BowlOptions, PieceInfo } from './bowl-svg';

export function createBowl(o: BowlOptions): Bowl {
  return createBowl3d(o) ?? createBowlSvg(o);
}
