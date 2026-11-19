/**
 * The bowl built from its pieces, as a thing to handle (drawn by
 * scripts/bowl-3d-gl.ts, markup in components/Bowl.astro).
 *
 *  - Drag sideways to turn it on its wheel. Let go mid-turn and it coasts.
 *  - Rest on a piece: it eases out of the wall, its drawing bursts out of it and
 *    reassembles as its card, which settles beside it.
 *  - Click the piece or its card to go in (scripts/bowl-warp.ts).
 *  - On a phone, a tap does what resting does; a tap on the card goes in.
 *  - Keyboard: arrows move piece to piece, Enter goes in, Escape lets go.
 *
 * The SVG pieces in the markup stay as the state the page reads and writes
 * (read, off, on, gilding), so the page and the crew work the same either way.
 */
import { createBowl3dGL, type Bowl3dGL } from './bowl-3d-gl';
import { warpTo } from './bowl-warp';
import type { Bowl, BowlOptions } from './bowl-svg';
import { FRAME } from '../lib/bowl-form';
import { resolveColor } from '../lib/gold';

const TAU = Math.PI * 2;
const norm = (d: number) => ((((d + 180) % 360) + 360) % 360) - 180;
const easeOut = (t: number) => 1 - (1 - t) ** 3;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

const artCache = new Map<string, Promise<string | null>>();
const artFor = (slug: string) => {
  if (!artCache.has(slug))
    artCache.set(slug, fetch(`/bowl-art/${slug}.txt`).then((r) => (r.ok ? r.text() : null)).catch(() => null));
  return artCache.get(slug)!;
};

export function createBowl3d(o: BowlOptions): Bowl | null {
  const { root, reduced } = o;
  const canvas = root.querySelector<HTMLCanvasElement>('[data-bowl-3d]');
  if (!canvas) return null;
  const body = root.querySelector<HTMLElement>('[data-bowl-body]')!;
  const card = root.querySelector<HTMLElement>('[data-bowl-card]')!;
  const warpEl = root.querySelector<HTMLElement>('[data-warp]');
  const inCard = <T extends Element>(s: string) => card.querySelector<T>(s)!;
  const frameBox = inCard<HTMLElement>('.bowl__frame');
  const artSvg = frameBox.querySelector<SVGSVGElement>('.bowl__art')!;
  const artImg = frameBox.querySelector<HTMLImageElement>('img')!;

  const pieces = [...root.querySelectorAll<SVGElement>('[data-shard]')].sort((a, b) => Number(a.dataset.i) - Number(b.dataset.i));
  const slugs = pieces.map((p) => p.dataset.shard!);
  const index = new Map(slugs.map((s, i) => [s, i]));
  const isDark = o.isDark;

  // Each piece's glaze, from its theme's accent, the way the CSS mixes it.
  const glazes: [number, number, number][] = [];
  const readGlazes = () => {
    const dark = isDark();
    const host = canvas.parentElement ?? canvas;
    const floor = resolveColor(host, 'var(--glaze-in)');
    pieces.forEach((p, i) => {
      const cs = getComputedStyle(p);
      const accent = resolveColor(host, cs.getPropertyValue('--accent') || 'gray');
      const mix = parseFloat(cs.getPropertyValue(dark ? '--mix-d' : '--mix-l')) / 100 || 0.25;
      glazes[i] = [0, 1, 2].map((k) => accent[k] * mix + floor[k] * (1 - mix)) as [number, number, number];
    });
  };
  readGlazes();

  const lift = new Float32Array(pieces.length);
  const gildFrom = new Map<number, number>();
  let hovered = -1;
  let opened: string | null = null;

  let g: Bowl3dGL | null = null;
  try {
    g = createBowl3dGL(canvas, {
      n: pieces.length,
      counts: canvas.dataset.wallCounts ?? '',
      data: canvas.dataset.wall ?? '',
      atlas: { light: canvas.dataset.atlasLight ?? '', dark: canvas.dataset.atlasDark ?? '', cols: Number(canvas.dataset.atlasCols ?? 10) },
      isDark,
      reduced,
      glaze: (i) => glazes[i] ?? [0.8, 0.8, 0.8],
      state(i) {
        const c = pieces[i].classList;
        const from = gildFrom.get(i);
        return {
          read: c.contains('read'),
          lift: lift[i],
          off: c.contains('off'),
          gild: from === undefined ? -1 : Math.min(1, (performance.now() - from) / 1600),
        };
      },
    });
  } catch (e) {
    console.warn('bowl: 3D unavailable', e);
    return null;
  }
  if (!g) return null;
  const gl3 = g;
  root.classList.add('gl3d');

  const handlers: Record<string, ((...a: never[]) => void)[]> = {};
  const emit = (ev: string, ...a: unknown[]) => handlers[ev]?.forEach((f) => (f as (...x: unknown[]) => void)(...a));

  /* ---------- lifting pieces out of the wall ---------- */
  let liftRaf = 0;
  const target = (i: number) => (i === hovered || slugs[i] === opened ? 1 : 0);
  const liftStep = () => {
    liftRaf = 0;
    let moving = false;
    for (let i = 0; i < lift.length; i++) {
      const t = target(i);
      if (lift[i] === t) continue;
      lift[i] += (t - lift[i]) * (reduced ? 1 : 0.22);
      if (Math.abs(t - lift[i]) < 0.01) lift[i] = t;
      else moving = true;
    }
    gl3.draw();
    if (moving) liftRaf = requestAnimationFrame(liftStep);
  };
  const relift = () => {
    if (!liftRaf) liftRaf = requestAnimationFrame(liftStep);
  };

  // Any change to a piece's state (read, dimmed, gilded) is a reason to redraw.
  new MutationObserver((list) => {
    for (const m of list) {
      const el = m.target as SVGElement;
      const i = Number(el.dataset?.i);
      if (Number.isNaN(i)) continue;
      if (el.classList.contains('gilding')) {
        if (!gildFrom.has(i)) gildFrom.set(i, performance.now());
      } else gildFrom.delete(i);
    }
    gl3.draw();
  }).observe(root.querySelector('.bowl__shards')!, { attributes: true, attributeFilter: ['class'], subtree: true });
  const repalette = () => {
    readGlazes();
    gl3.readPalette();
  };
  new MutationObserver(repalette).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', repalette);

  /* ---------- turning ---------- */
  let angle = 0; // degrees
  let coast = 0;
  let tween = 0;
  let vel = 0;
  const setAngle = (next: number) => {
    const delta = next - angle;
    angle = next;
    gl3.setAngle((angle * Math.PI) / 180);
    if (opened) placeCard(opened);
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
      vel *= Math.exp(-2.2 * dt);
      setAngle(angle + vel * dt);
      coast = Math.abs(vel) > 4 ? requestAnimationFrame(step) : 0;
    };
    coast = requestAnimationFrame(step);
  };

  /* ---------- pointer ---------- */
  const local = (e: { clientX: number; clientY: number }) => {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top, w: r.width, h: r.height };
  };
  const pxPerUnit = () => canvas.clientWidth / (2 * FRAME.x);
  let down: { id: number; x: number; y: number; from: number } | null = null;
  let dragging = false;
  let justDragged = false;
  let lastPointer = 'mouse';
  let samples: { t: number; a: number }[] = [];

  canvas.addEventListener('pointerdown', (e) => {
    lastPointer = e.pointerType || 'mouse';
    if (e.button !== 0 || !e.isPrimary) return;
    stopMotion();
    down = { id: e.pointerId, x: e.clientX, y: e.clientY, from: angle };
    samples = [{ t: performance.now(), a: angle }];
  });
  canvas.addEventListener('pointermove', (e) => {
    const p = local(e);
    // The lamp hangs where the pointer is, in the bowl's frame.
    gl3.setLight((p.x / p.w) * 2 * FRAME.x - FRAME.x, FRAME.yMax - (p.y / p.h) * (FRAME.yMax - FRAME.yMin));
    if (down && e.pointerId === down.id) {
      if (!dragging) {
        if (Math.abs(e.clientX - down.x) < 7) return;
        dragging = true;
        root.classList.add('dragging');
        setHover(-1);
        if (cardMode === 'hover') api.close();
        emit('grab');
        try {
          canvas.setPointerCapture(e.pointerId);
        } catch {
          // The pointer went away. The drag simply ends.
        }
      }
      // Sideways is round: the front of the bowl follows the finger.
      setAngle(down.from - ((e.clientX - down.x) / pxPerUnit()) * (180 / Math.PI));
      const now = performance.now();
      samples.push({ t: now, a: angle });
      while (samples.length > 2 && now - samples[0].t > 90) samples.shift();
      return;
    }
    if (e.pointerType === 'mouse') hoverAt(p.x, p.y);
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
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);
  canvas.addEventListener('pointerleave', (e) => {
    if (e.pointerType !== 'mouse' || dragging) return;
    setHover(-1);
    scheduleClose();
  });

  canvas.addEventListener('click', (e) => {
    if (justDragged) return;
    const p = local(e);
    const i = gl3.pick(p.x, p.y);
    if (i < 0) {
      if (opened) api.close();
      return;
    }
    const slug = slugs[i];
    // A mouse has already seen the card; a finger sees it first, then goes in.
    if (lastPointer === 'mouse' || lastPointer === 'pen' || opened === slug) go(slug);
    else api.open(slug);
  });

  let hoverRaf = 0;
  let hoverXY = { x: 0, y: 0 };
  let dwell = 0;
  const hoverAt = (x: number, y: number) => {
    hoverXY = { x, y };
    if (hoverRaf) return;
    hoverRaf = requestAnimationFrame(() => {
      hoverRaf = 0;
      const i = gl3.pick(hoverXY.x, hoverXY.y);
      setHover(i);
    });
  };
  const setHover = (i: number) => {
    if (i === hovered) return;
    hovered = i;
    canvas.style.cursor = i >= 0 ? 'pointer' : '';
    relift();
    clearTimeout(dwell);
    if (i < 0) {
      root.classList.remove('hot');
      scheduleClose();
      return;
    }
    o.preview(slugs[i]);
    // Rest on it a moment and its card comes out of it.
    const slug = slugs[i];
    if (opened && cardMode === 'hover') {
      api.open(slug, { mode: 'hover' });
      return;
    }
    dwell = window.setTimeout(() => hovered === i && !dragging && api.open(slug, { mode: 'hover' }), 150);
  };

  /* ---------- the card that comes out of a piece ---------- */
  let cardMode: 'hover' | 'pinned' = 'hover';
  let closeTimer = 0;
  const scheduleClose = () => {
    if (cardMode !== 'hover' || !opened) return;
    clearTimeout(closeTimer);
    closeTimer = window.setTimeout(() => {
      if (!card.matches(':hover') && hovered < 0) api.close();
    }, 260);
  };
  card.addEventListener('pointerenter', () => clearTimeout(closeTimer));
  card.addEventListener('pointerleave', () => scheduleClose());

  const pieceScreen = (slug: string) => {
    const c = gl3.centre(index.get(slug)!);
    const p = gl3.project(c.u, c.phi);
    const cr = canvas.getBoundingClientRect();
    const br = body.getBoundingClientRect();
    return { x: p.x + cr.left - br.left, y: p.y + cr.top - br.top };
  };
  const placeCard = (slug: string) => {
    const p = pieceScreen(slug);
    const bw = body.clientWidth;
    const cw = card.offsetWidth;
    const ch = card.offsetHeight;
    let x: number;
    if (bw < cw * 1.7) x = (bw - cw) / 2; // narrow: over the bowl
    else x = p.x < bw / 2 ? p.x + 28 : p.x - cw - 28; // beside the piece
    x = Math.max(-bw * 0.08, Math.min(bw - cw * 0.92, x));
    const y = Math.max(-ch * 0.15, Math.min(body.clientHeight - ch * 0.6, p.y - ch * 0.45));
    card.style.left = `${x.toFixed(0)}px`;
    card.style.top = `${y.toFixed(0)}px`;
    return p;
  };

  const showArt = (slug: string, from: { x: number; y: number }) => {
    const s = pieces[index.get(slug)!];
    const info = o.info(slug);
    if (info) artImg.alt = `Artwork for ${info.title}`;
    const src = isDark() ? s.dataset.cardDark : s.dataset.cardLight;
    if (src) artImg.src = src;
    frameBox.classList.remove('live');
    artSvg.replaceChildren();
    artSvg.classList.remove('play', 'bloom');
    frameBox.dataset.for = slug;
    if (!s.hasAttribute('data-live')) return;
    artFor(slug).then((markup) => {
      if (!markup || frameBox.dataset.for !== slug) return;
      artSvg.innerHTML = markup;
      // The drawing comes out of the piece: every mark starts from where the
      // piece sits in the bowl, in the drawing's own units.
      const fr = frameBox.getBoundingClientRect();
      const br = body.getBoundingClientRect();
      const k = 1600 / Math.max(1, fr.width);
      artSvg.style.setProperty('--ox', `${((br.left + from.x - (fr.left + fr.width / 2)) * k).toFixed(0)}px`);
      artSvg.style.setProperty('--oy', `${((br.top + from.y - (fr.top + fr.height / 2)) * k).toFixed(0)}px`);
      frameBox.classList.add('live');
      void artSvg.getBoundingClientRect();
      artSvg.classList.add('bloom');
    });
  };

  const go = (slug: string) => {
    const info = o.info(slug);
    if (!info) return;
    const s = pieces[index.get(slug)!];
    if (!opened) api.open(slug, { mode: 'hover' });
    warpTo(info.href, {
      warp: warpEl,
      art: frameBox.classList.contains('live') ? artSvg : null,
      from: frameBox.getBoundingClientRect(),
      who: info.who,
      accent: s.style.getPropertyValue('--accent'),
      reduced,
    });
  };
  card.addEventListener('click', (e) => {
    const t = e.target as Element;
    if (t.closest('[data-card-another], [data-card-close]')) return;
    e.preventDefault();
    if (opened) go(opened);
  });
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
    else if ((e.key === 'Enter' || e.key === ' ') && api.selected) {
      e.preventDefault();
      go(api.selected);
      return;
    } else return;
    e.preventDefault();
    if (!next) return;
    api.selected = next;
    o.preview(next);
    api.turnTo(next, { at: 90, ms: 420 }).then(() => api.selected === next && api.open(next, { mode: 'pinned' }));
  });

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
      const i = index.get(slug);
      if (i === undefined) return Promise.resolve();
      stopMotion();
      const at = opts.at ?? -90;
      const base = gl3.centre(i).u * 360;
      const from = angle;
      const to = from + norm(at - (base + from)) + (opts.spins ?? 0) * 360;
      if (reduced || opts.ms === 0) {
        setAngle(to);
        return Promise.resolve();
      }
      const ms = opts.ms ?? 700;
      const t0 = performance.now();
      const ease = opts.spins ? easeOut : easeInOut;
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
      const info = o.info(slug);
      const i = index.get(slug);
      if (!info || i === undefined) return;
      clearTimeout(closeTimer);
      const fresh = opened !== slug || card.hidden;
      cardMode = opts.mode ?? 'pinned';
      opened = slug;
      api.selected = slug;
      relift();
      if (!fresh) return;
      const s = pieces[i];
      card.style.setProperty('--accent', s.style.getPropertyValue('--accent'));
      inCard('[data-card-track]').textContent = info.meta;
      inCard('[data-card-ask]').textContent = info.ask;
      inCard('[data-card-title]').textContent = info.title;
      inCard<HTMLElement>('[data-card-read]').hidden = !info.read;
      inCard<HTMLAnchorElement>('[data-card-go]').href = info.href;
      card.hidden = false;
      card.classList.add('bloom');
      card.classList.remove('in', 'away');
      const from = placeCard(slug);
      showArt(slug, from);
      void card.offsetWidth;
      if (!reduced) card.classList.add('in');
      if (opts.focus) inCard<HTMLElement>('[data-card-go]').focus({ preventScroll: true });
      // Most readers who look this closely go in: have it ready.
      if (!document.querySelector(`link[rel="prefetch"][href="${info.href}"]`)) {
        const l = document.createElement('link');
        l.rel = 'prefetch';
        l.href = info.href;
        document.head.append(l);
      }
      // A glance is not a choice: only a piece the reader asked for counts as opened.
      if (cardMode === 'pinned') emit('open', slug);
    },
    close() {
      if (!opened) return;
      const slug = opened;
      opened = null;
      relift();
      card.classList.remove('in');
      card.hidden = true;
      frameBox.dataset.for = '';
      emit('close', slug);
    },
    shard: (slug) => pieces[index.get(slug) ?? -1],
    rim(deg) {
      // Along the top of the written pieces, at a bowl angle, in the stage's pixels.
      const top = Math.max(...pieces.slice(-12).map((_, k) => gl3.centre(pieces.length - 1 - k).phi)) + 0.015;
      const u = ((deg * Math.PI) / 180 - (angle * Math.PI) / 180) / TAU;
      const here = gl3.project(u, top);
      const ahead = gl3.project(u + 0.004, top);
      const cr = canvas.getBoundingClientRect();
      const st = root.querySelector<HTMLElement>('[data-bowl-stage]')!.getBoundingClientRect();
      const slope = (Math.atan2(ahead.y - here.y, ahead.x - here.x) * 180) / Math.PI;
      return { x: here.x + cr.left - st.left, y: here.y + cr.top - st.top, tilt: Math.abs(slope) < 90 ? slope * 0.5 : 0 };
    },
    async nudge() {
      if (reduced || dragging || coast || tween) return;
      const from = angle;
      const t0 = performance.now();
      await new Promise<void>((done) => {
        const step = (now: number) => {
          const t = Math.min(1, (now - t0) / 1500);
          setAngle(from + 18 * Math.sin(t * Math.PI) * (1 - t * 0.35));
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
      (handlers[ev] ??= []).push(fn as never);
    },
  };
  return api;
}
