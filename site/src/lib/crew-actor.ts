/**
 * The crew on screen: walking, changing mood, looking at things, saying one
 * line at a time. Runs in the browser. Pairs with components/CrewActor.astro,
 * which renders every mood a character needs up front.
 *
 * The animation loop only runs while something is actually moving, so a page
 * where nobody is doing anything costs nothing.
 */

export interface Actor {
  readonly who: string;
  readonly el: HTMLElement;
  x: number;
  y: number;
  /** Jump straight to a spot, feet at (x, y) in stage pixels. */
  place(x: number, y: number): void;
  /** Walk to a spot. Resolves on arrival, or at once with reduced motion. */
  go(x: number, y: number, speed?: number): Promise<void>;
  mood(m: string): void;
  show(): void;
  hide(): void;
  readonly visible: boolean;
  /** A small hop: surprise, a landing, a nod. */
  hop(): void;
  /** Play a one-off CSS action class (for example `hit` swings the hammer). */
  act(name: string, ms: number): void;
}

export interface Cast {
  get(who: string): Actor | undefined;
  /** Where every visible character looks, in viewport pixels; null to look ahead. */
  look(p: { x: number; y: number } | null): void;
  /** One voice at a time. The line goes into the stage's own [data-say] slot,
   *  which sits in the page layout, so nothing ever floats over the text. */
  say(actor: Actor, text: string, ms?: number): void;
  hush(): void;
  readonly speaking: string | null;
}

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export function createCast(
  stage: HTMLElement,
  opts: {
    reduced: boolean;
    /** The line slot, when it sits outside the stage (for example in a caption). */
    bubble?: HTMLElement | null;
    /** Gets `is-speaking` while a line shows, so its [data-quiet] text steps aside. */
    voice?: HTMLElement | null;
  }
): Cast {
  const { reduced } = opts;
  const bubble = opts.bubble ?? stage.querySelector<HTMLElement>('[data-say]');
  const voice = opts.voice ?? stage;
  const actors = new Map<string, ActorImpl>();
  let lookAt: { x: number; y: number } | null = null;
  let raf = 0;
  let last = 0;
  let speaking: string | null = null;
  let hushTimer = 0;

  interface ActorImpl extends Actor {
    tx: number;
    ty: number;
    speed: number;
    arrive: (() => void) | null;
    /** Set only while go() is walking them, so other movers keep their own step. */
    moving: boolean;
    pupils: SVGCircleElement[][];
    gx: number;
    gy: number;
    current: string;
  }

  const frame = (now: number) => {
    raf = 0;
    const dt = Math.min(0.05, (now - (last || now)) / 1000);
    last = now;
    let busy = false;
    for (const a of actors.values()) {
      const dx = a.tx - a.x;
      const dy = a.ty - a.y;
      const d = Math.hypot(dx, dy);
      if (d > 0.5) {
        // Constant pace, easing only over the last few steps.
        const step = Math.min(d, a.speed * dt * Math.min(1, 0.25 + d / 60));
        a.x += (dx / d) * step;
        a.y += (dy / d) * step;
        if (Math.abs(dx) > 2) a.el.style.setProperty('--face', dx < 0 ? '-1' : '1');
        a.el.classList.add('walking');
        busy = true;
      } else if (a.arrive || a.moving) {
        a.x = a.tx;
        a.y = a.ty;
        a.moving = false;
        a.el.classList.remove('walking');
        const done = a.arrive;
        a.arrive = null;
        done?.();
      }
      // Pupils turn toward whatever the cast is looking at.
      let gx = 0;
      let gy = 0;
      if (lookAt && a.visible) {
        const box = a.el.getBoundingClientRect();
        const ex = lookAt.x - (box.left + box.width / 2);
        const ey = lookAt.y - (box.top + box.height * 0.55);
        const r = Math.hypot(ex, ey) || 1;
        const k = 3.2 * Math.tanh(r / 160);
        gx = (ex / r) * k;
        gy = (ey / r) * k;
      }
      const ng = a.gx + (gx - a.gx) * Math.min(1, dt * 12);
      const nh = a.gy + (gy - a.gy) * Math.min(1, dt * 12);
      if (Math.abs(ng - a.gx) + Math.abs(nh - a.gy) > 0.01) busy = true;
      a.gx = ng;
      a.gy = nh;
      a.el.style.setProperty('--x', `${a.x.toFixed(1)}px`);
      a.el.style.setProperty('--y', `${a.y.toFixed(1)}px`);
      const face = a.el.style.getPropertyValue('--face') === '-1' ? -1 : 1;
      a.el.style.setProperty('--gx', `${(a.gx * face).toFixed(2)}px`);
      a.el.style.setProperty('--gy', `${a.gy.toFixed(2)}px`);
    }
    if (busy) wake();
  };
  const wake = () => {
    if (!raf) raf = requestAnimationFrame(frame);
  };

  for (const el of stage.querySelectorAll<HTMLElement>('[data-actor]')) {
    const who = el.dataset.actor!;
    const svgs = [...el.querySelectorAll<SVGSVGElement>('[data-m]')];
    const a: ActorImpl = {
      who,
      el,
      x: -999,
      y: -999,
      tx: -999,
      ty: -999,
      speed: 520,
      arrive: null,
      moving: false,
      pupils: [],
      gx: 0,
      gy: 0,
      current: el.dataset.mood ?? svgs[0]?.dataset.m ?? 'idle',
      get visible() {
        return el.classList.contains('on');
      },
      place(x, y) {
        a.x = a.tx = x;
        a.y = a.ty = y;
        el.style.setProperty('--x', `${x.toFixed(1)}px`);
        el.style.setProperty('--y', `${y.toFixed(1)}px`);
        const done = a.arrive;
        a.arrive = null;
        a.moving = false;
        done?.();
      },
      go(x, y, speed = 520) {
        if (reduced) {
          a.place(x, y);
          return Promise.resolve();
        }
        a.arrive?.();
        a.tx = x;
        a.ty = y;
        a.speed = speed;
        a.moving = true;
        wake();
        return new Promise<void>((res) => (a.arrive = res));
      },
      mood(m) {
        if (!svgs.some((s) => s.dataset.m === m)) return;
        a.current = m;
        el.dataset.mood = m;
        for (const s of svgs) s.style.display = s.dataset.m === m ? 'block' : 'none';
      },
      show() {
        el.classList.add('on');
        wake();
      },
      hide() {
        el.classList.remove('on');
        if (speaking === who) cast.hush();
      },
      hop() {
        if (reduced) return;
        el.classList.remove('hop');
        void el.offsetWidth;
        el.classList.add('hop');
      },
      act(name, ms) {
        if (reduced) return;
        el.classList.add(name);
        setTimeout(() => el.classList.remove(name), ms);
      },
    };
    a.mood(a.current);
    actors.set(who, a);
  }

  const cast: Cast = {
    get: (who) => actors.get(who),
    look(p) {
      lookAt = p;
      wake();
    },
    say(actor, text, ms = 4200) {
      if (!bubble) return;
      clearTimeout(hushTimer);
      speaking = actor.who;
      const name = actor.el.dataset.name ?? '';
      bubble.replaceChildren();
      if (name) {
        const who = document.createElement('span');
        who.className = 'crew-line__who';
        who.textContent = name;
        bubble.append(who, ' ');
      }
      bubble.append(text);
      voice.classList.add('is-speaking');
      hushTimer = window.setTimeout(() => cast.hush(), ms);
    },
    hush() {
      clearTimeout(hushTimer);
      speaking = null;
      voice.classList.remove('is-speaking');
    },
    get speaking() {
      return speaking;
    },
  };
  return cast;
}

export { wait };

/** Where a character stands at one moment of a path: feet at (x, y) in stage
 *  pixels, leaning by `tilt` degrees, facing `face` (1 right, -1 left). */
export interface Pose {
  x: number;
  y: number;
  tilt?: number;
  face?: number;
}

const smooth = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

/**
 * Carry a character along any path: a gold edge, a bowl's rim, a jump. `at(t)`
 * maps progress 0..1 (already eased) to a pose. With reduced motion they are
 * placed at the end at once. `stop()` on the returned handle ends it early, where
 * it is, and still resolves `done`.
 */
export function follow(
  a: Actor,
  ms: number,
  at: (t: number) => Pose,
  opts: { reduced?: boolean; walk?: boolean; ease?: (t: number) => number } = {}
): { done: Promise<void>; stop(): void } {
  const ease = opts.ease ?? smooth;
  const put = (p: Pose) => {
    a.place(p.x, p.y);
    a.el.style.setProperty('--tilt', `${(p.tilt ?? 0).toFixed(2)}deg`);
    if (p.face) a.el.style.setProperty('--face', String(p.face));
  };
  let stopped = false;
  let finish = () => {};
  const done = new Promise<void>((res) => (finish = res));
  if (opts.reduced || ms <= 0) {
    put(at(1));
    finish();
    return { done, stop() {} };
  }
  const t0 = performance.now();
  if (opts.walk !== false) a.el.classList.add('walking');
  const frame = (now: number) => {
    if (stopped) return;
    const t = Math.min(1, (now - t0) / ms);
    put(at(ease(t)));
    if (t < 1) requestAnimationFrame(frame);
    else {
      a.el.classList.remove('walking');
      finish();
    }
  };
  requestAnimationFrame(frame);
  return {
    done,
    stop() {
      stopped = true;
      a.el.classList.remove('walking');
      finish();
    },
  };
}
