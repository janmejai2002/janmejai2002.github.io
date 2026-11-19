/**
 * The way into an article from the bowl. The piece's own drawing leaves its
 * card and rises to the middle of the screen, a gold seam runs across the page
 * behind it, and the crew member who works on that article turns up beside it.
 * Then the article opens, and (where the browser supports cross-document view
 * transitions) the drawing carries straight on into the article's own plate.
 *
 * Under a second, and skipped entirely with reduced motion.
 */
import { createCast, type Cast } from '../lib/crew-actor';

let cast: Cast | null = null;
let busy = false;

export function warpTo(
  href: string,
  o: { warp: HTMLElement | null; art: SVGSVGElement | null; from: DOMRect | null; who?: string; accent: string; reduced: boolean }
) {
  if (busy) return;
  if (o.reduced || !o.warp) {
    location.assign(href);
    return;
  }
  busy = true;
  const warp = o.warp;
  if (warp.parentElement !== document.body) document.body.append(warp);
  warp.style.setProperty('--accent', o.accent);
  const holder = warp.querySelector<HTMLElement>('[data-warp-art]')!;
  const svg = holder.querySelector<SVGSVGElement>('svg')!;
  svg.innerHTML = o.art?.innerHTML ?? '';
  svg.classList.toggle('empty', !o.art?.childElementCount);
  warp.hidden = false;
  warp.classList.remove('go');

  // Where the drawing ends up: wide, in the middle, a little above centre.
  const W = Math.min(innerWidth * 0.86, 1000);
  const H = (W * 9) / 16;
  const L = (innerWidth - W) / 2;
  const T = innerHeight * 0.42 - H / 2;
  Object.assign(holder.style, { left: `${L}px`, top: `${T}px`, width: `${W}px`, height: `${H}px` });
  const f = o.from;
  holder.style.transition = 'none';
  holder.style.transform = f
    ? `translate(${f.left - L}px, ${f.top - T}px) scale(${f.width / W}, ${f.height / H})`
    : 'scale(.4)';
  void holder.offsetWidth;
  holder.style.transition = '';
  holder.style.transform = '';
  requestAnimationFrame(() => warp.classList.add('go'));

  // The crew member who works on this piece, beside it.
  const stage = warp.querySelector<HTMLElement>('[data-warp-crew]');
  if (stage && o.who) {
    cast ??= createCast(stage, { reduced: false });
    for (const id of ['tsugi', 'oops', 'kiki', 'fude', 'uso']) cast.get(id)?.hide();
    const a = cast.get(o.who);
    if (a) {
      // Standing on the drawing's lower edge, near its left corner.
      const x = L + W * 0.1;
      const y = T + H * 0.98;
      a.mood('idle');
      a.place(x - 90, y);
      a.show();
      a.go(x, y, 700).then(() => {
        a.mood('happy');
        a.hop();
      });
    }
  }

  const prefetched = document.querySelector(`link[rel="prefetch"][href="${href}"]`);
  if (!prefetched) {
    const l = document.createElement('link');
    l.rel = 'prefetch';
    l.href = href;
    document.head.append(l);
  }
  window.setTimeout(() => location.assign(href), 820);
}

// Coming back to the homepage from the article: the overlay must be gone.
addEventListener('pageshow', () => {
  busy = false;
  const w = document.querySelector<HTMLElement>('[data-warp]');
  if (w) {
    w.hidden = true;
    w.classList.remove('go');
  }
});
