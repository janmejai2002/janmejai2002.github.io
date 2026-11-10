/**
 * Short scenes on the broken gold edge under the homepage plate.
 *
 * The edge is the crew's stage. They stand on the line itself, so nothing
 * covers a word, and taps and clicks pass straight through. Each scene belongs
 * to one character and lasts a few seconds. One plays at a time, at most a
 * few per visit, and a visitor sees a different one each time they come back.
 *
 * Every scene is driven from real moments (landing, scrolling the edge into
 * view, breaking or mending a claim, a quiet stretch), never on a loop.
 */
import type { Cast, Actor } from '../lib/crew-actor';

export type SceneName = 'surf' | 'gild' | 'tumble' | 'inspect' | 'ledger';

export interface EdgeStage {
  /** Play a scene now if nothing else is playing. A reply to something the
   *  reader just did skips the quiet gap between scenes. */
  play(name: SceneName, reply?: boolean): Promise<boolean>;
  /** Play the next scene this visitor has not seen, from those allowed. */
  playFresh(allowed?: SceneName[]): Promise<boolean>;
  readonly busy: boolean;
  /** True when the edge is on screen. */
  readonly inView: boolean;
}

interface Options {
  stage: HTMLElement;
  cast: Cast;
  reduced: boolean;
  /** Points of the edge polyline in its viewBox (x 0..1000, y 0..depth). */
  points: [number, number][];
  depth: number;
  /** Where a character sitting in the hero seat is, so they can hop down. */
  seatOf?: (who: string) => { x: number; y: number } | null;
  /** Called as a character leaves the seat and when they may come back. */
  onSeat?: (who: string, away: boolean) => void;
  maxPerView?: number;
  gapMs?: number;
}

const SEEN_KEY = 'waibi:scenes';
const ALL: SceneName[] = ['surf', 'inspect', 'tumble', 'ledger', 'gild'];

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export function createEdgeStage(o: Options): EdgeStage {
  const { stage, cast, reduced } = o;
  const svg = stage.querySelector<SVGSVGElement>('svg');
  const lit = stage.querySelector<SVGElement>('[data-edge-lit]');
  const board = stage.querySelector<HTMLElement>('[data-board]');
  const maxPerView = o.maxPerView ?? 4;
  const gap = o.gapMs ?? 16000;
  let busy = false;
  let played = 0;
  let lastEnd = -Infinity;
  let inView = false;

  new IntersectionObserver((e) => (inView = e[0].isIntersecting), { threshold: 0.5 }).observe(stage);

  const W = () => stage.clientWidth;
  const H = () => svg?.getBoundingClientRect().height || o.depth;
  const small = () => W() < 640;

  /** Height of the line at x (stage px), and its slope in degrees. */
  const lineAt = (x: number) => {
    const w = W();
    const k = H() / o.depth;
    const u = Math.max(0, Math.min(1000, (x / Math.max(1, w)) * 1000));
    const pts = o.points;
    let i = 1;
    while (i < pts.length - 1 && pts[i][0] < u) i++;
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const t = x1 === x0 ? 0 : (u - x0) / (x1 - x0);
    const y = (y0 + (y1 - y0) * t) * k;
    const slope = Math.atan2((y1 - y0) * k, ((x1 - x0) / 1000) * w) * (180 / Math.PI);
    return { y, slope };
  };

  /** The steepest step in the line between two x positions (stage px): where a
   *  running foot would catch. */
  const ledgeBetween = (from: number, to: number) => {
    const w = W();
    const lo = Math.min(from, to);
    const hi = Math.max(from, to);
    let best = -1;
    let at = (from + to) / 2;
    for (let i = 1; i < o.points.length; i++) {
      const mid = ((o.points[i][0] + o.points[i - 1][0]) / 2000) * w;
      if (mid < lo || mid > hi) continue;
      const d = Math.abs(o.points[i][1] - o.points[i - 1][1]);
      if (d > best) {
        best = d;
        at = mid;
      }
    }
    return at;
  };

  const pose = (a: Actor, x: number, y: number, tilt = 0, face?: number) => {
    a.place(x, y);
    a.el.style.setProperty('--tilt', `${tilt.toFixed(2)}deg`);
    if (face) a.el.style.setProperty('--face', String(face));
  };

  /** Light the seam between two x positions, as if freshly gilded. */
  const light = (from: number, to: number) => {
    if (!lit) return;
    const w = W();
    const l = Math.max(0, Math.min(from, to));
    const r = Math.min(w, Math.max(from, to));
    lit.style.clipPath = `inset(-12px ${Math.max(0, w - r).toFixed(0)}px -12px ${l.toFixed(0)}px)`;
    lit.classList.add('on');
  };
  const dim = () => lit?.classList.remove('on');

  /** Walk (or ride) along the line from x0 to x1. */
  const travel = (a: Actor, x0: number, x1: number, ms: number, opt: { tilt?: number; step?: (x: number) => void; walk?: boolean; lift?: number } = {}) =>
    new Promise<void>((done) => {
      const face = x1 < x0 ? -1 : 1;
      const t0 = performance.now();
      if (opt.walk !== false) a.el.classList.add('walking');
      const frame = (now: number) => {
        const t = Math.min(1, (now - t0) / ms);
        const x = x0 + (x1 - x0) * ease(t);
        const { y, slope } = lineAt(x);
        pose(a, x, y - (opt.lift ?? 0), slope * (opt.tilt ?? 0.25), face);
        opt.step?.(x);
        if (t < 1) requestAnimationFrame(frame);
        else {
          a.el.classList.remove('walking');
          done();
        }
      };
      requestAnimationFrame(frame);
    });

  /** A hop in an arc, from wherever they are to a point on the line. */
  const hop = (a: Actor, from: { x: number; y: number }, x1: number, ms = 520, extraDrop = 0) =>
    new Promise<void>((done) => {
      const t0 = performance.now();
      const peak = small() ? 34 : 48;
      const face = x1 < from.x ? -1 : 1;
      const frame = (now: number) => {
        const t = Math.min(1, (now - t0) / ms);
        const x = from.x + (x1 - from.x) * t;
        const y1 = lineAt(x1).y + extraDrop;
        const y = from.y + (y1 - from.y) * t - peak * 4 * t * (1 - t);
        pose(a, x, y, 0, face);
        if (t < 1) requestAnimationFrame(frame);
        else done();
      };
      requestAnimationFrame(frame);
    });

  const enter = (a: Actor, x: number) => {
    const { y } = lineAt(x);
    pose(a, x, y);
    a.show();
  };
  const leave = async (a: Actor) => {
    a.hide();
    await wait(320);
    a.el.style.removeProperty('--tilt');
  };

  /* ---------- the scenes ---------- */

  const scenes: Record<SceneName, () => Promise<void>> = {
    // Kiki rides a gold shard the whole length of the seam, which lights up behind her.
    async surf() {
      const a = cast.get('kiki');
      if (!a || !board) return;
      const w = W();
      a.mood('happy');
      const lift = small() ? 5 : 7;
      const place = (x: number) => {
        const { y, slope } = lineAt(x);
        board.style.setProperty('--x', `${x.toFixed(1)}px`);
        board.style.setProperty('--y', `${y.toFixed(1)}px`);
        board.style.setProperty('--tilt', `${(slope * 0.9).toFixed(2)}deg`);
      };
      place(-60);
      enter(a, -60);
      board.classList.add('on');
      await travel(a, -60, w + 60, small() ? 2600 : 3600, {
        tilt: 0.9,
        walk: false,
        lift,
        step: (x) => {
          place(x);
          light(0, x);
        },
      });
      board.classList.remove('on');
      await leave(a);
      setTimeout(dim, 900);
    },

    // Tsugi steps down from the seat and repaints the seam, end to end of his walk.
    async gild() {
      const a = cast.get('tsugi');
      if (!a) return;
      const w = W();
      const seat = o.seatOf?.('tsugi');
      const start = seat ? Math.min(w - 40, Math.max(40, seat.x)) : w * 0.86;
      const stop = w * (small() ? 0.16 : 0.12);
      a.mood('paint');
      if (seat) {
        o.onSeat?.('tsugi', true);
        pose(a, seat.x, seat.y);
        a.show();
        await hop(a, seat, start);
      } else enter(a, start);
      await travel(a, start, stop, small() ? 2800 : 3800, { tilt: 0.2, step: (x) => light(x, start) });
      a.mood('proud');
      a.hop();
      await wait(900);
      a.mood('idle');
      await travel(a, stop, -70, 900, { tilt: 0.2 });
      await leave(a);
      setTimeout(dim, 700);
      if (seat) o.onSeat?.('tsugi', false);
    },

    // Oops jumps down from the seat, runs, catches a foot on the ledge and goes over.
    async tumble() {
      const a = cast.get('oops');
      if (!a) return;
      const w = W();
      const seat = o.seatOf?.('oops');
      const start = seat ? Math.min(w - 40, seat.x) : w + 60;
      // He runs away from the seat, across the plate, and trips on the worst step.
      const trip = ledgeBetween(start - w * 0.62, start - w * 0.22);
      a.mood('swing');
      if (seat) {
        o.onSeat?.('oops', true);
        pose(a, seat.x, seat.y);
        a.show();
        await hop(a, seat, start, 480);
      } else enter(a, start);
      await travel(a, start, trip, small() ? 1500 : 1900, { tilt: 0.3 });
      a.mood('panic');
      a.hop();
      await wait(380);
      // Over the edge, onto the paper below, and gone.
      const here = { x: trip, y: lineAt(trip).y };
      a.el.classList.add('tumbling');
      await hop(a, here, trip - (small() ? 46 : 70), 560, small() ? 40 : 56);
      await leave(a);
      a.el.classList.remove('tumbling');
      // He climbs back into the seat once nobody is looking.
      if (seat) setTimeout(() => o.onSeat?.('oops', false), 2400);
    },

    // Uso stops on the seam, holds the loupe to it, and is not convinced.
    async inspect() {
      const a = cast.get('uso');
      if (!a) return;
      const w = W();
      const spot = w * (0.36 + Math.random() * 0.28);
      a.mood('idle');
      enter(a, w + 60);
      await travel(a, w + 60, spot, small() ? 1700 : 2200, { tilt: 0.25 });
      a.mood('doubt');
      await wait(1700);
      a.mood('sideeye');
      await wait(900);
      a.mood('idle');
      await travel(a, spot, w + 70, small() ? 1200 : 1500, { tilt: 0.25 });
      await leave(a);
    },

    // Fude walks out, writes the visit down on the seam, and walks back.
    async ledger() {
      const a = cast.get('fude');
      if (!a) return;
      const w = W();
      const spot = w * (small() ? 0.3 : 0.22);
      a.mood('idle');
      enter(a, -60);
      await travel(a, -60, spot, small() ? 1500 : 1900, { tilt: 0.25 });
      a.mood('scribble');
      await wait(2000);
      a.mood('idle');
      a.hop();
      await wait(350);
      await travel(a, spot, -70, small() ? 1200 : 1500, { tilt: 0.25 });
      await leave(a);
    },
  };

  const seen = (): SceneName[] => {
    try {
      return JSON.parse(localStorage.getItem(SEEN_KEY) ?? '[]');
    } catch {
      return [];
    }
  };
  const remember = (name: SceneName) => {
    try {
      const s = seen().filter((x) => x !== name);
      s.push(name);
      localStorage.setItem(SEEN_KEY, JSON.stringify(s));
    } catch {
      // Storage refused: scenes simply repeat more often.
    }
  };

  const api: EdgeStage = {
    async play(name, reply = false) {
      if (reduced || busy || played >= maxPerView) return false;
      if (!reply && performance.now() - lastEnd < gap) return false;
      busy = true;
      played++;
      remember(name);
      try {
        await scenes[name]();
      } finally {
        busy = false;
        lastEnd = performance.now();
      }
      return true;
    },
    playFresh(allowed = ALL) {
      // Least recently seen first, so every visit brings someone new.
      const order = seen();
      const pool = allowed.filter((n) => !order.includes(n));
      const pick = pool.length ? pool[Math.floor(Math.random() * pool.length)] : allowed.slice().sort((a, b) => order.indexOf(a) - order.indexOf(b))[0];
      return api.play(pick);
    },
    get busy() {
      return busy;
    },
    get inView() {
      return inView;
    },
  };
  return api;
}
