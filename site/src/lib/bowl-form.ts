/**
 * The bowl's form: how the archive is seen as a vessel. Shared by the homepage
 * bowl, its script, and the minibowl at the foot of every article, so the bowl
 * is the same object everywhere. No dependencies, so the browser can import it.
 *
 * The pieces lie on the inside of the bowl, a disc in its own 1000-unit frame,
 * tipped back by TILT so the reader looks down into it. The body, foot and
 * shadow are drawn flat on screen in a frame W wide and H tall, with the rim's
 * centre at RIM_Y.
 */
export const TILT = 58;
export const K = Math.cos((TILT * Math.PI) / 180);
export const SIZE = 1000;
export const C = SIZE / 2;
export const R = 476;
export const W = 1000;
export const H = 840;
export const RIM_Y = 300;
/** Where the tipped disc's own frame starts, above the body's frame. */
export const DISC_TOP = RIM_Y - C;
/** The pieces lie on the bowl's floor, below and inside the rim: drawn this
 *  much smaller, and this far lower on screen, so the far inner wall shows as a
 *  band of glaze and the near edge slips behind the front of the lip. */
export const FLOOR_SCALE = 0.86;
export const FLOOR_DROP = 45;

const ry = (R * K).toFixed(1);
/** The outside of the bowl: down from the rim's two ends to the foot, and back along the front of the rim. */
export const BODY = `M${C - R} ${RIM_Y}C${C - R} 470 175 625 285 650Q500 700 715 650C825 625 ${C + R} 470 ${C + R} ${RIM_Y}A${R} ${ry} 0 0 1 ${C - R} ${RIM_Y}Z`;
/** The unglazed foot ring. */
export const FOOT = 'M285 650Q500 700 715 650L706 694Q500 744 294 694Z';
/** The front edge of the rim, where the glaze pools as it runs over. */
export const LIP_FRONT = `M${C - R + 6} ${RIM_Y + 8}A${R - 6} ${(R * K - 2).toFixed(1)} 0 0 0 ${C + R - 6} ${RIM_Y + 8}`;
/** A point on the front of the rim at screen angle `deg` (0 right, 90 nearest). */
export const rimFront = (deg: number) => {
  const a = (deg * Math.PI) / 180;
  return [C + R * Math.cos(a), RIM_Y + R * K * Math.sin(a)] as const;
};

/* ---------- the bowl built from its pieces (scripts/bowl-3d.ts) ----------
   A shell on a sphere of radius 1 centred one unit above the table. A point on
   it is (u, phi): u turns around the bowl (0..1), phi is the angle from the
   bottom. The oldest pieces sit at the foot (PHI0), each new one goes in a
   little higher, and the top of the written pieces is the rim, so the newest
   articles always make the rim. PHI1 is where the bowl will be when the next
   ring of pieces is written. */
export const PHI0 = 0.44;
export const PHI1 = 1.36;
/** How far the reader looks down into it, in degrees. */
export const ELEVATION = 30;
/** The canvas frame, in world units: x across, y up the screen. */
export const FRAME = { x: 1.1, yMin: -0.3, yMax: 1.42 };
/** Pieces across, in the artwork atlas (pages/bowl/atlas-[theme].webp.ts). */
export const ATLAS_COLS = 10;
