/**
 * The flat archive bowl, for browsers without WebGL2 (the 3D bowl is
 * scripts/bowl-3d.ts; scripts/bowl.ts picks one). Markup in components/Bowl.astro, form
 * in lib/bowl-form.ts).
 *
 *  - Drag it to turn it, like a bowl on a wheel. Let go mid-turn and it coasts.
 *  - The gold catches a light that stays in the room while the bowl turns.
 *  - With a mouse, the piece under the pointer shows its card at a glance, its
 *    own drawing assembling, and a click goes straight to the article.
 *  - With a finger, a tap lifts the piece out into a card (there is no hover).
 *  - From the keyboard: arrows move piece to piece, Enter opens the article,
 *    Space lifts the piece out, Escape puts it back.
 *
 * It knows nothing about the question list or the crew. The page listens for
 * its events ('open', 'close', 'pick', 'another', 'ghost', 'flick', 'spin',
 * 'grab') and tells it what each piece is through `info`.
 */
import { createBowlGold, type BowlGold } from './bowl-gold';
import { K, C, R, W, RIM_Y, FLOOR_SCALE, FLOOR_DROP } from '../lib/bowl-form';

export interface PieceInfo {
  ask: string;
  title: string;
  track: string;
  meta: string;
  href: string;
  read: boolean;
  /** The crew member on this piece. */
  who?: string;
}

export interface BowlOptions {
  root: HTMLElement;
  reduced: boolean;
  info(slug: string): PieceInfo | null;
  /** Highlight a piece (and its row) while the reader explores. */
  preview(slug: string): void;
  /** The pieces the reader can currently move between, in list order. */
  order(): string[];
  isDark(): boolean;
}

type Events = {
  open: [slug: string];
  close: [slug: string];
  pick: [];
  another: [slug: string];
  ghost: [];
  /** Released mid-spin, in degrees per second (signed). */
  flick: [velocity: number];
  /** Every frame the bowl turns, by `delta` degrees. */
  spin: [angle: number, delta: number];
  /** The reader took hold of the bowl and started turning it. */
  grab: [];
};

export interface Bowl {
  readonly angle: number;
  readonly opened: string | null;
  readonly dragging: boolean;
  /** The piece arrow keys move from. */
  selected: string | null;
  /** Turn so the piece sits at angle `at` in the bowl (degrees, 0 = right, -90 = far side). */
  turnTo(slug: string, opts?: { at?: number; spins?: number; ms?: number }): Promise<void>;
  open(slug: string, opts?: { focus?: boolean; mode?: 'hover' | 'pinned' }): void;
  close(): void;
  shard(slug: string): SVGElement | undefined;
  /** A point on the rim in stage pixels, with the lean of someone standing there. */
  rim(deg: number): { x: number; y: number; tilt: number };
  /** A small turn there and back, to show a first-time reader that it moves. */
  nudge(): Promise<void>;
  on<K extends keyof Events>(ev: K, fn: (...a: Events[K]) => void): void;
}

const norm = (d: number) => ((((d + 180) % 360) + 360) % 360) - 180;
const easeOut = (t: number) => 1 - (1 - t) ** 3;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/** Each piece's live drawing (pages/bowl-art/[slug].txt.ts), fetched once. */
const artCache = new Map<string, Promise<string | null>>();
const artFor = (slug: string) => {
  if (!artCache.has(slug)) {
    artCache.set(
      slug,
      fetch(`/bowl-art/${slug}.txt`)
        .then((r) => (r.ok ? r.text() : null))
        .catch(() => null)
    );
  }
  return artCache.get(slug)!;
};

export function createBowlSvg(o: BowlOptions): Bowl {
  const { root, reduced } = o;
  const body = root.querySelector<HTMLElement>('[data-bowl-body]')!;
  // Events land on the pieces; positions are read off the outside, which never turns.
  const svg = root.querySelector<SVGSVGElement>('[data-bowl-svg]')!;
  const frameEl = root.querySelector<SVGSVGElement>('[data-bowl-frame]')!;
  const spinEl = root.querySelector<HTMLElement>('[data-spin]')!;
  const stage = root.querySelector<HTMLElement>('[data-bowl-stage]')!;
  const gold = root.querySelector<SVGLinearGradientElement>('[data-bowl-gold]');
  const card = root.querySelector<HTMLElement>('[data-bowl-card]')!;
  const peek = root.querySelector<HTMLElement>('[data-bowl-peek]')!;
  const inCard = <T extends Element>(s: string) => card.querySelector<T>(s)!;
  const inPeek = <T extends Element>(s: string) => peek.querySelector<T>(s)!;
  const cardGo = inCard<HTMLAnchorElement>('[data-card-go]');

  const shards = new Map<string, SVGElement>();
  const base = new Map<string, number>(); // each piece's angle before any turning
  for (const s of root.querySelectorAll<SVGElement>('[data-shard]')) {
    const slug = s.dataset.shard!;
    shards.set(slug, s);
    base.set(slug, (Math.atan2(Number(s.dataset.cy) - C, Number(s.dataset.cx) - C) * 180) / Math.PI);
  }

  const handlers: { [E in keyof Events]?: ((...a: Events[E]) => void)[] } = {};
  const emit = <E extends keyof Events>(ev: E, ...a: Events[E]) => handlers[ev]?.forEach((f) => f(...a));

  /* ---------- where things are ----------
     The rim's centre on screen, and a screen point brought into the bowl's own
     plane (undoing the tip), in the 1000-unit frame the pieces are drawn in. */
  const frame = () => {
    const b = frameEl.getBoundingClientRect();
    const s = b.width / W;
    return { s, cx: b.left + C * s, cy: b.top + RIM_Y * s };
  };
  // The pieces lie on the floor: lower than the rim, and drawn smaller.
  const toBowl = (x: number, y: number) => {
    const f = frame();
    const s = f.s * FLOOR_SCALE;
    return { x: C + (x - f.cx) / s, y: C + (y - (f.cy + FLOOR_DROP * f.s)) / (s * K) };
  };

  /* ---------- turning ---------- */
  let angle = 0;
  let vel = 0; // degrees per second, while coasting
  let coast = 0;
  let tween = 0;
  let light = { x: C * 0.55, y: C * 0.35 }; // in the bowl's plane, fixed in the room
  let dragging = false;

  /* ---------- live gold (scripts/bowl-gold.ts), or the SVG gradient without it ---------- */
  const byIndex: SVGElement[] = [];
  for (const s of shards.values()) byIndex[Number(s.dataset.i)] = s;
  const gildFrom = new Map<SVGElement, number>();
  let liveGold: BowlGold | null = null;
  const glCanvas = root.querySelector<HTMLCanvasElement>('[data-bowl-gl]');
  if (glCanvas && byIndex.length) {
    try {
      liveGold = createBowlGold(glCanvas, {
        reduced,
        paths: byIndex.map((s) => s.querySelector('.shard__ground')?.getAttribute('d') ?? ''),
        state(i) {
          const c = byIndex[i].classList;
          const from = gildFrom.get(byIndex[i]);
          return {
            read: c.contains('read'),
            lifted: c.contains('out') || (c.contains('on') && root.classList.contains('hot') && !dragging),
            off: c.contains('off'),
            gild: from === undefined ? -1 : Math.min(1, (performance.now() - from) / 1600),
          };
        },
      });
    } catch (e) {
      console.warn('bowl: live gold unavailable', e);
    }
  }
  if (liveGold) {
    root.classList.add('gl');
    // Any change to a piece (read, lifted, dimmed, gilded) is a reason to redraw.
    new MutationObserver((list) => {
      for (const m of list) {
        const el = m.target as SVGElement;
        if (el.classList?.contains('gilding')) {
          if (!gildFrom.has(el)) gildFrom.set(el, performance.now());
        } else gildFrom.delete(el);
      }
      liveGold?.draw();
    }).observe(root.querySelector('.bowl__shards')!, { attributes: true, attributeFilter: ['class'], subtree: true });
    new MutationObserver(() => liveGold?.draw()).observe(root, { attributes: true, attributeFilter: ['class'] });
    const repalette = () => liveGold?.readPalette();
    new MutationObserver(repalette).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', repalette);
  }

  // The light stays in the room, so turn it back into the turned frame.
  const lightInTurned = () => {
    const a = (-angle * Math.PI) / 180;
    const dx = light.x - C;
    const dy = light.y - C;
    return { x: C + dx * Math.cos(a) - dy * Math.sin(a), y: C + dx * Math.sin(a) + dy * Math.cos(a) };
  };
  let sheenRaf = 0;
  const sheen = () => {
    if (liveGold) {
      const l = lightInTurned();
      liveGold.setLight(l.x, l.y);
      return;
    }
    if (!gold || sheenRaf || reduced) return;
    sheenRaf = requestAnimationFrame(() => {
      sheenRaf = 0;
      const l = lightInTurned();
      gold.setAttribute('x1', String(l.x - 620));
      gold.setAttribute('y1', String(l.y - 620));
      gold.setAttribute('x2', String(l.x + 620));
      gold.setAttribute('y2', String(l.y + 620));
    });
  };

  const setAngle = (next: number) => {
    const delta = next - angle;
    angle = next;
    spinEl.style.transform = `rotate(${angle.toFixed(2)}deg)`;
    sheen();
    if (delta) emit('spin', angle, delta);
  };
  const stopMotion = () => {
    cancelAnimationFrame(coast);
    cancelAnimationFrame(tween);
    coast = tween = 0;
    vel = 0;
  };
  const coastFrom = (v: number) => {
    stopMotion();
    if (reduced) return;
    vel = v;
    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      vel *= Math.exp(-2.4 * dt);
      setAngle(angle + vel * dt);
      coast = Math.abs(vel) > 4 ? requestAnimationFrame(step) : 0;
    };
    coast = requestAnimationFrame(step);
  };

  /* ---------- dragging ---------- */
  let down: { id: number; x: number; y: number; from: number; at: number } | null = null;
  let justDragged = false;
  let lastPointer = 'mouse';
  let samples: { t: number; a: number }[] = [];
  const pointerAngle = (e: PointerEvent) => {
    const p = toBowl(e.clientX, e.clientY);
    return (Math.atan2(p.y - C, p.x - C) * 180) / Math.PI;
  };
  svg.addEventListener('pointerdown', (e) => {
    lastPointer = e.pointerType || 'mouse';
    if (e.button !== 0 || !e.isPrimary) return;
    stopMotion();
    down = { id: e.pointerId, x: e.clientX, y: e.clientY, from: angle, at: pointerAngle(e) };
    samples = [{ t: performance.now(), a: angle }];
  });
  svg.addEventListener('pointermove', (e) => {
    if (!down || e.pointerId !== down.id) return;
    if (!dragging) {
      if (Math.hypot(e.clientX - down.x, e.clientY - down.y) < 7) return;
      dragging = true;
      hidePeek(true);
      root.classList.add('dragging');
      emit('grab');
      try {
        svg.setPointerCapture(e.pointerId);
      } catch {
        // The pointer went away between events. The drag simply ends.
      }
    }
    // Unwrap, so dragging past the far side does not jump a full turn.
    const target = down.from + (pointerAngle(e) - down.at);
    setAngle(angle + norm(target - angle));
    const now = performance.now();
    samples.push({ t: now, a: angle });
    while (samples.length > 2 && now - samples[0].t > 90) samples.shift();
  });
  const release = (e: PointerEvent) => {
    if (!down || e.pointerId !== down.id) return;
    down = null;
    if (!dragging) return;
    dragging = false;
    justDragged = true;
    setTimeout(() => (justDragged = false), 0);
    root.classList.remove('dragging');
    const first = samples[0];
    const last = samples[samples.length - 1];
    const dt = (last.t - first.t) / 1000;
    const v = dt > 0.008 && performance.now() - last.t < 80 ? (last.a - first.a) / dt : 0;
    const capped = Math.max(-1400, Math.min(1400, v));
    if (Math.abs(capped) > 30) coastFrom(capped);
    if (Math.abs(capped) > 520) emit('flick', capped);
  };
  svg.addEventListener('pointerup', release);
  svg.addEventListener('pointercancel', release);

  // A drag that ends over a piece is not a click on it.
  root.addEventListener(
    'click',
    (e) => {
      if (!justDragged) return;
      e.preventDefault();
      e.stopPropagation();
    },
    true
  );

  // A mouse has already seen the piece's card on hover, so a click reads it.
  // A finger has not, so a tap lifts the piece out first.
  svg.addEventListener('click', (e) => {
    const t = e.target as Element;
    const s = t.closest<SVGElement>('[data-shard]');
    if (s) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (lastPointer === 'mouse' || lastPointer === 'pen') return; // the link does it
      e.preventDefault();
      if (opened === s.dataset.shard) api.close();
      else api.open(s.dataset.shard!);
      return;
    }
    if (t.closest('[data-ghost]')) {
      emit('ghost');
      return;
    }
    if (opened) api.close();
  });

  addEventListener(
    'pointermove',
    (e) => {
      const b = frameEl.getBoundingClientRect();
      if (b.bottom < 0 || b.top > innerHeight) return;
      const p = toBowl(e.clientX, e.clientY);
      // The lamp hangs a little above and in front of where the pointer is.
      light = { x: p.x, y: p.y - 60 };
      sheen();
    },
    { passive: true }
  );

  /* ---------- a piece's live drawing ---------- */
  const showArt = (frameBox: HTMLElement, slug: string) => {
    const s = shards.get(slug);
    const artSvg = frameBox.querySelector<SVGSVGElement>('.bowl__art')!;
    const img = frameBox.querySelector<HTMLImageElement>('img')!;
    const info = o.info(slug);
    if (info) img.alt = `Artwork for ${info.title}`;
    const src = o.isDark() ? s?.dataset.cardDark : s?.dataset.cardLight;
    if (src) img.src = src;
    frameBox.classList.remove('live');
    artSvg.replaceChildren();
    artSvg.classList.remove('play');
    if (!s?.hasAttribute('data-live')) return;
    frameBox.dataset.for = slug;
    artFor(slug).then((markup) => {
      // Still the same piece by the time it arrived?
      if (!markup || frameBox.dataset.for !== slug) return;
      artSvg.innerHTML = markup;
      frameBox.classList.add('live');
      void artSvg.getBoundingClientRect();
      artSvg.classList.add('play');
    });
  };

  /* ---------- the card at a glance (pointer only) ---------- */
  let peekFor: string | null = null;
  let peekTimer = 0;
  let hideTimer = 0;
  const hidePeek = (now = false) => {
    clearTimeout(peekTimer);
    clearTimeout(hideTimer);
    const go = () => {
      peek.hidden = true;
      peekFor = null;
    };
    if (now) go();
    else hideTimer = window.setTimeout(go, 140);
  };
  const placePeek = (slug: string) => {
    const s = shards.get(slug);
    if (!s) return;
    const bb = body.getBoundingClientRect();
    const sb = s.getBoundingClientRect();
    const pw = peek.offsetWidth;
    const ph = peek.offsetHeight;
    const x = Math.max(4, Math.min(bb.width - pw - 4, sb.left + sb.width / 2 - bb.left - pw / 2));
    // Above the piece if there is room in the window, else below it.
    const above = sb.top - ph - 14 > 70;
    const y = above ? sb.top - bb.top - ph - 12 : sb.bottom - bb.top + 12;
    peek.style.left = `${x.toFixed(0)}px`;
    peek.style.top = `${y.toFixed(0)}px`;
  };
  const showPeek = (slug: string) => {
    if (dragging || opened) return;
    const s = shards.get(slug);
    const info = o.info(slug);
    if (!s || !info) return;
    clearTimeout(hideTimer);
    if (peekFor === slug && !peek.hidden) return;
    const wasHidden = peek.hidden;
    peekFor = slug;
    peek.style.setProperty('--accent', s.style.getPropertyValue('--accent'));
    inPeek('[data-peek-meta]').textContent = info.meta;
    inPeek('[data-peek-ask]').textContent = info.ask;
    inPeek<HTMLElement>('[data-peek-read]').hidden = !info.read;
    showArt(inPeek<HTMLElement>('.bowl__frame'), slug);
    peek.hidden = false;
    placePeek(slug);
    if (wasHidden && !reduced) {
      peek.classList.add('enter');
      requestAnimationFrame(() => peek.classList.remove('enter'));
    }
  };
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (fine) {
    svg.addEventListener('pointerover', (e) => {
      if (e.pointerType !== 'mouse') return;
      const s = (e.target as Element).closest<SVGElement>('[data-shard]');
      if (!s) return;
      clearTimeout(peekTimer);
      // Already showing one: follow at once. Otherwise a moment's pause, so a
      // pointer sweeping across the bowl does not flicker cards.
      if (!peek.hidden) showPeek(s.dataset.shard!);
      else peekTimer = window.setTimeout(() => showPeek(s.dataset.shard!), 90);
    });
    svg.addEventListener('pointerout', (e) => {
      const to = (e.relatedTarget as Element | null)?.closest?.('[data-shard]');
      if (!to) hidePeek();
    });
  }

  /* ---------- the lifted piece ---------- */
  let opened: string | null = null;
  let setTimer = 0;
  const putBack = (slug: string) => {
    const s = shards.get(slug);
    if (!s) return;
    s.classList.remove('out');
    s.classList.add('set');
    clearTimeout(setTimer);
    setTimer = window.setTimeout(() => s.classList.remove('set'), 900);
  };

  card.querySelector('[data-card-close]')?.addEventListener('click', () => api.close());
  card.querySelector('[data-card-another]')?.addEventListener('click', () => opened && emit('another', opened));
  root.querySelector('[data-bowl-pick]')?.addEventListener('click', () => emit('pick'));
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && opened) {
      const inside = root.contains(document.activeElement);
      api.close();
      if (inside) body.focus({ preventScroll: true });
    }
  });
  // A press anywhere else on the page puts the piece back.
  document.addEventListener('pointerdown', (e) => {
    if (opened && !root.contains(e.target as Node)) api.close();
  });

  body.addEventListener('keydown', (e) => {
    if (e.target !== body) return;
    const list = o.order();
    if (!list.length) return;
    const at = api.selected ? list.indexOf(api.selected) : -1;
    let next: string | undefined;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = list[(at + 1) % list.length];
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = list[(at - 1 + list.length) % list.length];
    else if (e.key === 'Home') next = list[0];
    else if (e.key === 'End') next = list[list.length - 1];
    else if (e.key === 'Enter' && api.selected) {
      e.preventDefault();
      location.href = `/blog/${api.selected}/`;
      return;
    } else if (e.key === ' ') {
      e.preventDefault();
      api.open(api.selected ?? list[0], { focus: true });
      return;
    } else return;
    e.preventDefault();
    if (!next) return;
    api.selected = next;
    o.preview(next);
    api.turnTo(next, { at: 90, ms: 420 }).then(() => api.selected === next && showPeek(next));
  });
  body.addEventListener('blur', () => hidePeek(true));

  const api: Bowl = {
    get angle() {
      return angle;
    },
    get opened() {
      return opened;
    },
    get dragging() {
      return dragging;
    },
    selected: null,
    turnTo(slug, opts = {}) {
      const b = base.get(slug);
      if (b === undefined) return Promise.resolve();
      stopMotion();
      const at = opts.at ?? -90;
      const spins = opts.spins ?? 0;
      // The short way round, plus any whole turns for show.
      const from = angle;
      const to = from + norm(at - (b + from)) + spins * 360;
      if (reduced || opts.ms === 0) {
        setAngle(to);
        return Promise.resolve();
      }
      const ms = opts.ms ?? 700;
      const t0 = performance.now();
      const ease = spins ? easeOut : easeInOut;
      return new Promise((done) => {
        const step = (now: number) => {
          const t = Math.min(1, (now - t0) / ms);
          setAngle(from + (to - from) * ease(t));
          if (t < 1) tween = requestAnimationFrame(step);
          else {
            tween = 0;
            done();
          }
        };
        tween = requestAnimationFrame(step);
      });
    },
    open(slug, opts = {}) {
      const s = shards.get(slug);
      const info = o.info(slug);
      if (!s || !info) return;
      hidePeek(true);
      if (opened && opened !== slug) putBack(opened);
      opened = slug;
      api.selected = slug;
      s.classList.add('out');

      card.style.setProperty('--accent', s.style.getPropertyValue('--accent'));
      inCard('[data-card-track]').textContent = info.meta;
      inCard('[data-card-ask]').textContent = info.ask;
      inCard('[data-card-title]').textContent = info.title;
      inCard<HTMLElement>('[data-card-read]').hidden = !info.read;
      cardGo.href = info.href;
      showArt(inCard<HTMLElement>('.bowl__frame'), slug);

      card.classList.remove('away', 'in');
      card.hidden = false;
      // Grow out of the socket the piece came from.
      const sb = s.getBoundingClientRect();
      const cb = card.getBoundingClientRect();
      card.style.setProperty('--fx', `${(sb.left + sb.width / 2 - cb.left).toFixed(0)}px`);
      card.style.setProperty('--fy', `${(sb.top + sb.height / 2 - cb.top).toFixed(0)}px`);
      void card.offsetWidth;
      if (!reduced) card.classList.add('in');
      if (opts.focus) cardGo.focus({ preventScroll: true });
      emit('open', slug);
    },
    close() {
      if (!opened) return;
      const slug = opened;
      opened = null;
      putBack(slug);
      const hide = () => {
        if (!opened) card.hidden = true;
        card.classList.remove('away');
      };
      if (reduced) hide();
      else {
        card.classList.remove('in');
        card.classList.add('away');
        card.addEventListener('animationend', hide, { once: true });
      }
      emit('close', slug);
    },
    shard: (slug) => shards.get(slug),
    rim(deg) {
      // On the rim's ellipse, in the stage's pixels (the stage is the body's box).
      const s = (stage.clientWidth || frameEl.clientWidth) / W;
      const a = (deg * Math.PI) / 180;
      const x = (C + R * Math.cos(a)) * s;
      const y = (RIM_Y + R * K * Math.sin(a)) * s;
      // They stand up straight, leaning a little with the slope of the rim.
      const slope = (Math.atan2(R * K * Math.cos(a), -R * Math.sin(a)) * 180) / Math.PI;
      return { x, y, tilt: slope * 0.55 };
    },
    async nudge() {
      if (reduced || dragging || coast || tween) return;
      const from = angle;
      const t0 = performance.now();
      await new Promise<void>((done) => {
        const step = (now: number) => {
          const t = Math.min(1, (now - t0) / 1500);
          // Out, past, and back to rest, like a hand testing the weight.
          setAngle(from + 16 * Math.sin(t * Math.PI) * (1 - t * 0.35));
          if (t < 1 && !dragging) tween = requestAnimationFrame(step);
          else {
            tween = 0;
            if (!dragging) setAngle(from);
            done();
          }
        };
        tween = requestAnimationFrame(step);
      });
    },
    on(ev, fn) {
      (handlers[ev] ??= [] as never[]).push(fn as never);
    },
  };
  sheen();
  return api;
}
