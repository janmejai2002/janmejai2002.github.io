/**
 * An article's artwork as live parts. The sources in assets-src/art are plain
 * geometry with colour tokens, so each mark can be its own element on the page.
 * The ground and the grain are dropped, because the art now sits directly on
 * whatever is behind it, and every mark gets a stable place to fly in from.
 * Runs at build time. Nothing is authored per article.
 */
import { rng } from './bowl';

const sources = import.meta.glob('/assets-src/art/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const MARK = /<(?:rect|circle|ellipse|line|polyline|polygon|path)\b[^>]*\/>|<text\b[\s\S]*?<\/text>/g;
const DEFS = /<defs>[\s\S]*?<\/defs>/g;
/** How long, in ms, the last mark waits before it starts moving. */
const SPREAD = 1100;

const EARTHS = 'mizu|hanko|moss|ochre|plum|indigo';
const OWN_ACCENT = new RegExp(`(?:stroke|fill)="var\\(--(${EARTHS})\\)"`);
const ACCENT_GROUP = new RegExp(`<g\\b([^>]*)(?:stroke|fill)="var\\(--(${EARTHS})\\)"[^>]*>[\\s\\S]*?<\\/g>`, 'g');
const MOST_GLOWING = 24;
const DASHED_GROUP = /<g\b[^>]*stroke-dasharray[^>]*>[\s\S]*?<\/g>/g;
/** Above this many marks a drawing is already busy enough to assemble as it is. */
const DENSE = 50;
const PIECE_LENGTH = 230;
const MOST_PIECES = 12;

const num = (mark: string, name: string) => parseFloat(mark.match(new RegExp(`\\b${name}="([-\\d.]+)"`))?.[1] ?? '0');

/**
 * Splits one long stroke into several, so a ring arrives as broken arcs. Each
 * piece is the same element showing a different stretch of its own line, which
 * needs no geometry beyond a rough length. Shapes with a fill stay whole, and so
 * does anything with dashes, markers or rounded ends, where a split would show.
 */
function fragments(mark: string): string[] {
  const tag = mark.match(/^<(\w+)/)?.[1];
  if (!tag || tag === 'text') return [mark];
  if (tag !== 'line' && !/\bfill="none"/.test(mark)) return [mark];
  if (/data-whole|stroke-dasharray|marker-|stroke-linecap="(?:round|square)"|pathLength/.test(mark)) return [mark];

  const length =
    tag === 'circle' ? 2 * Math.PI * num(mark, 'r')
    : tag === 'line' ? Math.hypot(num(mark, 'x2') - num(mark, 'x1'), num(mark, 'y2') - num(mark, 'y1'))
    : tag === 'rect' ? 2 * (num(mark, 'width') + num(mark, 'height'))
    : tag === 'ellipse' ? 2 * Math.PI * Math.max(num(mark, 'rx'), num(mark, 'ry'))
    : 1200;
  const n = Math.min(MOST_PIECES, Math.round(length / PIECE_LENGTH));
  if (n < 2) return [mark];

  // A sliver of overlap, so no hairline shows at the joins once it is whole.
  const stretch = 1 / n + 0.003;
  return Array.from({ length: n }, (_, i) =>
    mark.replace(
      /\/>$/,
      ` pathLength="1" stroke-dasharray="${stretch.toFixed(4)} ${(1 - stretch).toFixed(4)}" stroke-dashoffset="${(-i / n).toFixed(4)}"/>`
    )
  );
}

export function liveArt(name: string): { markup: string; parts: number } | undefined {
  const source = sources[`/assets-src/art/${name}.svg`];
  if (!source) return undefined;

  const inner = source
    .replace(/^[\s\S]*?<svg\b[^>]*>/, '')
    .replace(/<\/svg>\s*$/, '')
    .replace(/<title>[\s\S]*?<\/title>/g, '')
    .replace(/<desc>[\s\S]*?<\/desc>/g, '')
    .replace(/<filter\b[\s\S]*?<\/filter>/g, '')
    // The full-canvas ground and grain rectangles.
    .replace(/<rect\b(?=[^>]*\bwidth="1600")(?=[^>]*\bheight="900")[^>]*\/>/g, '')
    .replace(/\{\{([\w-]+)\}\}/g, (_, token) => `var(--${token === 'paper2' ? 'paper-2' : token})`);

  // Definitions stay out of the wrapping, or a pattern's own marks would fly too.
  const defs: string[] = [];
  const body = inner.replace(DEFS, (d) => {
    defs.push(d);
    return `\u0000${defs.length - 1}\u0000`;
  });

  // A mark drawn in one of the earths is the one carrying the argument; the rest
  // of each drawing is ink. Groups pass that colour down to their marks.
  const keyed = body.replace(ACCENT_GROUP, (group, _attrs, accent) =>
    group.replace(MARK, (m) => (OWN_ACCENT.test(m) ? m : m.replace(/\/>$/, ` data-key="${accent}"/>`)))
  );

  // Dashed groups keep their dashes, so their marks are never split.
  const marked = keyed.replace(DASHED_GROUP, (group) =>
    group.replace(MARK, (m) => m.replace(/\/>$/, ' data-whole="1"/>'))
  );
  const sparse = (marked.match(MARK)?.length ?? 0) <= DENSE;
  const split = (sparse ? marked.replace(MARK, (m) => fragments(m).join('')) : marked).replace(/ data-whole="1"/g, '');

  const total = split.match(MARK)?.length ?? 0;
  if (!total) return undefined;

  const accentOf = (mark: string) => mark.match(OWN_ACCENT)?.[1] ?? mark.match(/ data-key="(\w+)"/)?.[1];
  // Glow is the costly effect, and a field of glowing marks says nothing anyway.
  const glows = (split.match(MARK) ?? []).filter(accentOf).length <= MOST_GLOWING;

  const rand = rng([...name].reduce((s, ch) => (Math.imul(s, 31) + ch.charCodeAt(0)) | 0, 17));
  let i = 0;
  const wrapped = split.replace(MARK, (rawMark) => {
    const accent = glows ? accentOf(rawMark) : undefined;
    const mark = rawMark.replace(/ data-key="\w+"/, '');
    const angle = rand() * Math.PI * 2;
    const reach = 340 + rand() * 620;
    const dx = Math.round(Math.cos(angle) * reach);
    const dy = Math.round(Math.sin(angle) * reach * 0.7);
    const turn = Math.round((rand() - 0.5) * 240);
    const size = (0.35 + rand() * 1.25).toFixed(2);
    const delay = Math.round((i / Math.max(1, total - 1)) * SPREAD + rand() * 90);
    i++;
    const glow = accent ? `;--glow:var(--${accent})` : '';
    return `<g class="p${accent ? ' p--key' : ''}" style="--dx:${dx}px;--dy:${dy}px;--r:${turn}deg;--s:${size};--d:${delay}ms${glow}">${mark}</g>`;
  });

  return {
    markup: wrapped.replace(/\u0000(\d+)\u0000/g, (_, n) => defs[+n]).replace(/\n\s*/g, ''),
    parts: total,
  };
}
