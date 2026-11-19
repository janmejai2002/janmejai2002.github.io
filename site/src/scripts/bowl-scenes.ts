/**
 * The crew on the rim of the archive bowl (scripts/bowl.ts).
 *
 * Same rules as the edge under the homepage plate (scripts/edge-scenes.ts):
 * every scene answers something the reader actually did or has done, one plays
 * at a time, and nothing happens on a timer by itself.
 *
 *  - gild:      Tsugi turns each piece read since the last visit to the top of
 *               the bowl and paints its seam gold. Reading is what fills the bowl.
 *  - pick:      Kiki listens at the rim while the bowl spins, and the piece she
 *               hears lands under her and lifts out.
 *  - flung:     spin the bowl hard and Oops, who was standing on it, is carried
 *               round and thrown off.
 *  - reread:    Uso comes to look at a piece the reader has already read.
 *  - tally:     Fude writes down a reading milestone.
 *  - unwritten: Fude, asked for a piece nobody has written yet.
 *
 * Lines go through the page's director, so the crew never talk over each other.
 */
import { follow, wait, type Actor, type Cast } from '../lib/crew-actor';
import type { Bowl } from './bowl';
import type { Moment } from '../lib/crew-lines';

export interface BowlScenes {
  gild(slugs: string[]): Promise<boolean>;
  pick(slug: string): Promise<void>;
  flung(velocity: number): void;
  reread(): void;
  tally(n: number): void;
  unwritten(): void;
  readonly busy: boolean;
}

interface Options {
  bowl: Bowl;
  cast: Cast;
  reduced: boolean;
  speak(moment: Moment, who: string, vars?: Record<string, number>): boolean;
}

// The arc of the rim they walk on, in screen degrees (-90 is the top).
const LEFT = -142;
const RIGHT = -38;
const TOP = -90;

export function createBowlScenes(o: Options): BowlScenes {
  const { bowl, cast, reduced } = o;
  let busy = false;
  let oopsRide: { stop(): void } | null = null;

  /** Feet on the rim at `deg`, standing straight out from it. */
  const stand = (a: Actor, deg: number, face = 1) => {
    const p = bowl.rim(deg);
    a.place(p.x, p.y);
    a.el.style.setProperty('--tilt', `${p.tilt.toFixed(2)}deg`);
    a.el.style.setProperty('--face', String(face));
  };
  /** Walk along the rim between two angles, at a steady pace. */
  const walk = (a: Actor, from: number, to: number) => {
    const ms = Math.max(350, Math.abs(to - from) * 22);
    const face = to > from ? 1 : -1;
    return follow(
      a,
      ms,
      (t) => {
        const p = bowl.rim(from + (to - from) * t);
        return { ...p, face };
      },
      { reduced }
    ).done;
  };
  const enter = (a: Actor, deg: number, mood: string, face = 1) => {
    a.mood(mood);
    stand(a, deg, face);
    a.show();
  };
  const leave = async (a: Actor) => {
    a.hide();
    await wait(320);
    a.el.style.removeProperty('--tilt');
  };
  /** One scene at a time. A scene the bowl is already busy with is dropped. */
  const run = async (fn: () => Promise<void>) => {
    if (busy) return false;
    busy = true;
    try {
      await fn();
    } finally {
      busy = false;
    }
    return true;
  };

  return {
    get busy() {
      return busy;
    },

    gild(slugs) {
      const a = cast.get('tsugi');
      if (!a || !slugs.length) return Promise.resolve(false);
      const mark = (slug: string) => {
        const s = bowl.shard(slug);
        if (!s) return;
        s.classList.add('read', 'gilding');
        setTimeout(() => s.classList.remove('gilding'), 1700);
      };
      if (reduced) {
        slugs.forEach(mark);
        o.speak('gilded', 'tsugi', { n: slugs.length });
        return Promise.resolve(true);
      }
      return run(async () => {
        enter(a, LEFT, 'idle', 1);
        await walk(a, LEFT, TOP);
        for (const slug of slugs.slice(0, 4)) {
          a.mood('idle');
          await bowl.turnTo(slug, { at: TOP + 8, ms: 900 });
          a.mood('paint');
          mark(slug);
          await wait(1100);
        }
        // Anything past the first few is gilded in one go.
        slugs.slice(4).forEach(mark);
        a.mood('proud');
        a.hop();
        o.speak('gilded', 'tsugi', { n: slugs.length });
        await wait(1500);
        a.mood('idle');
        await walk(a, TOP, RIGHT + 12);
        await leave(a);
      });
    },

    async pick(slug) {
      const a = cast.get('kiki');
      const spin = () => bowl.turnTo(slug, { at: TOP + 6, spins: reduced ? 0 : 2, ms: 1900 });
      if (!a || busy || reduced) {
        await spin();
        bowl.open(slug);
        return;
      }
      await run(async () => {
        enter(a, TOP, 'listen', -1);
        await spin();
        a.mood('happy');
        a.hop();
        o.speak('picked', 'kiki');
        await wait(260);
        bowl.open(slug);
        await wait(1400);
        a.mood('idle');
        await walk(a, TOP, LEFT - 4);
        await leave(a);
      });
    },

    flung(velocity) {
      const a = cast.get('oops');
      if (!a || busy || reduced || oopsRide) return;
      busy = true;
      const dir = Math.sign(velocity) || 1;
      let deg = TOP - dir * 20;
      a.mood('panic');
      stand(a, deg, dir);
      a.show();
      o.speak('spun', 'oops');
      // Carried round by the rim until he reaches the end of the arc.
      const me = { stop: () => void end() };
      const ride = (_angle: number, delta: number) => {
        if (oopsRide !== me) return;
        deg += delta * 0.8;
        stand(a, deg, dir);
        if (deg < LEFT - 10 || deg > RIGHT + 10) throwOff();
      };
      let ended = false;
      const end = async () => {
        if (ended) return;
        ended = true;
        oopsRide = null;
        await leave(a);
        a.el.classList.remove('tumbling');
        busy = false;
      };
      const throwOff = () => {
        if (oopsRide !== me) return;
        oopsRide = null;
        const p = bowl.rim(deg);
        // Off the tangent, then down, turning over as he goes.
        const tx = Math.cos(((deg + 90 * dir) * Math.PI) / 180);
        const ty = Math.sin(((deg + 90 * dir) * Math.PI) / 180);
        a.el.classList.add('tumbling');
        follow(
          a,
          700,
          (t) => ({ x: p.x + tx * 160 * t, y: p.y + ty * 160 * t + 260 * t * t, tilt: p.tilt + dir * 200 * t, face: dir }),
          { walk: false, ease: (t) => t }
        ).done.then(end);
      };
      oopsRide = me;
      bowl.on('spin', ride);
      // If the bowl slows before he reaches the end, he gives it a look and goes.
      setTimeout(async () => {
        if (oopsRide !== me) return;
        oopsRide = null;
        a.mood('sideeye');
        await wait(900);
        await end();
      }, 2400);
    },

    reread() {
      const a = cast.get('uso');
      if (!a) return;
      void run(async () => {
        enter(a, RIGHT + 14, 'idle', -1);
        await walk(a, RIGHT + 14, RIGHT - 14);
        a.mood('doubt');
        o.speak('reread', 'uso');
        await wait(1800);
        a.mood('sideeye');
        await wait(700);
        a.mood('idle');
        await walk(a, RIGHT - 14, RIGHT + 14);
        await leave(a);
      });
    },

    tally(n) {
      const a = cast.get('fude');
      if (!a) return;
      void run(async () => {
        enter(a, LEFT - 10, 'idle', 1);
        await walk(a, LEFT - 10, LEFT + 18);
        a.mood('scribble');
        o.speak('tally', 'fude', { n });
        await wait(2000);
        a.mood('proud');
        a.hop();
        await wait(700);
        await walk(a, LEFT + 18, LEFT - 10);
        await leave(a);
      });
    },

    unwritten() {
      const a = cast.get('fude');
      if (!a) return;
      void run(async () => {
        enter(a, LEFT + 6, 'idle', 1);
        o.speak('unwritten', 'fude');
        a.hop();
        await wait(2200);
        await leave(a);
      });
    },
  };
}
