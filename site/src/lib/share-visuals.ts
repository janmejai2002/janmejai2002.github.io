/**
 * The drawings share cards borrow from the site: the crew, the archive bowl,
 * and two small data pictures (a break-even chart, a cracked claim). Each comes
 * back as a PNG data URI ready to drop into a satori tree.
 *
 * The site styles the crew and the bowl with CSS variables and color-mix(),
 * which librsvg cannot resolve, so the on-plate values are written out here.
 * They mirror styles/crew.css (.on-plate) and the dark-theme tokens.
 */
import sharp from 'sharp';
import { drawCrew, CREW_VIEW, type Who, type Mood } from './crew';
import { bowlGeometry, toPath, SIZE as BOWL, C as MID, R as RIM } from './bowl';
// @ts-expect-error — plain .mjs module shared with scripts/make-images.mjs
import { PALETTE } from '../../scripts/lib/palette.mjs';

const D = PALETTE.dark as Record<string, string>;
const CREAM = '#F6F4EF';
const GOLD = '#DDB667';

const uri = (buf: Buffer) => `data:image/png;base64,${buf.toString('base64')}`;
const raster = async (svg: string, w: number, h = w) =>
  uri(await sharp(Buffer.from(svg), { density: 216 }).resize(w, h).png().toBuffer());

// ---- the crew ----------------------------------------------------------------
// Copied from the #crew-wash filter in layouts/Base.astro: the watercolour edge.
const WASH_FILTER = `<filter id="crew-wash" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".04" numOctaves="3" seed="4" result="big"/><feDisplacementMap in="SourceGraphic" in2="big" scale="7" xChannelSelector="R" yChannelSelector="G" result="edge"/><feTurbulence type="fractalNoise" baseFrequency=".022" numOctaves="2" seed="21" result="soft"/><feColorMatrix in="soft" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -2.6 2" result="pooling"/><feComposite in="edge" in2="pooling" operator="in" result="body"/><feMorphology in="edge" operator="erode" radius="1.3" result="inner"/><feComposite in="edge" in2="inner" operator="out" result="rim"/><feMerge><feMergeNode in="body"/><feMergeNode in="rim"/></feMerge></filter>`;

const CREW_CSS = `
  .crew-ink{fill:none;stroke:${CREAM};stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
  .crew-ink .k,.crew-ink .f{fill:${CREAM};stroke:none}
  .crew-ink .gold-seam{stroke:${GOLD};stroke-width:2.4}
  .crew-ink .gold-line{stroke:${GOLD};stroke-width:2.2}
  .crew-ink .gold{fill:${GOLD}}
  .crew-ink .wash-ink{fill:rgba(246,244,239,.26)}
  .crew-ink .glass{fill:rgba(78,205,216,.18)}
  .crew-ink .drop{fill:rgba(78,205,216,.55);stroke-width:1.2}
  .crew-note{fill:${CREAM};stroke:none;font-family:Georgia,serif;font-style:italic;font-size:13px}
  .crew-note.big{font-size:20px}
  .crew-wash{filter:url(#crew-wash);opacity:.8}
  .crew-pool{filter:url(#crew-wash);opacity:.52}
  ${['mizu', 'hanko', 'moss', 'ochre', 'indigo', 'plum'].map((k) => `.wash-${k}{fill:${D[k]}}`).join('')}
`;

const crewCache = new Map<string, string>();
/** One crew member, drawn for the dark plate. */
export async function crew(who: Who, mood: Mood, size: number) {
  const key = `${who}:${mood}:${size}`;
  if (!crewCache.has(key)) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${CREW_VIEW}" width="142" height="142"><defs>${WASH_FILTER}<style>${CREW_CSS}</style></defs>${drawCrew(who, mood)}</svg>`;
    crewCache.set(key, await raster(svg, size));
  }
  return crewCache.get(key)!;
}

// ---- the archive bowl -----------------------------------------------------------
/**
 * The homepage bowl, one shard per article (oldest at the centre), each tinted
 * by its track and joined in gold. Unwritten shards stay as faint outlines,
 * because the bowl is not finished. `accents` is oldest-first, one per post.
 */
export async function bowl(accents: string[], size: number, lit?: boolean[]) {
  const n = accents.length;
  const { capacity, cells, tones } = bowlGeometry(n);
  // With `lit`, only those shards take their colour (a track's or a topic's
  // share of the whole); the rest stay as quiet glaze.
  const shards = accents
    .map((a, i) => {
      const on = lit ? lit[i] : true;
      const fill = on ? D[a] ?? GOLD : CREAM;
      const op = lit ? (on ? 0.62 + tones[i] * 0.36 : 0.05) : i >= n - 3 ? 0.95 : 0.2 + tones[i] * 0.36;
      return `<path d="${toPath(cells[i])}" fill="${fill}" fill-opacity="${op.toFixed(2)}"/>`;
    })
    .join('');
  const ghosts = Array.from({ length: capacity - n }, (_, k) => `<path d="${toPath(cells[n + k])}"/>`).join('');
  const seams = cells.slice(0, n).map((c) => `<path d="${toPath(c)}"/>`).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${BOWL} ${BOWL}" width="${BOWL}" height="${BOWL}">
    <defs>
      <clipPath id="disc"><circle cx="${MID}" cy="${MID}" r="${RIM}"/></clipPath>
      <radialGradient id="body" cx="50%" cy="42%" r="60%"><stop offset="0" stop-color="#22314A"/><stop offset="1" stop-color="#16213A"/></radialGradient>
      <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#C2913A"/><stop offset=".5" stop-color="#F3DA9C"/><stop offset="1" stop-color="#B8862F"/></linearGradient>
    </defs>
    <circle cx="${MID}" cy="${MID + 18}" r="${RIM + 6}" fill="#000" opacity=".35"/>
    <circle cx="${MID}" cy="${MID}" r="${RIM}" fill="url(#body)"/>
    <g clip-path="url(#disc)">
      ${shards}
      <g fill="none" stroke="${CREAM}" stroke-opacity=".14" stroke-width="2" stroke-dasharray="5 7">${ghosts}</g>
      <g fill="none" stroke="url(#gold)" stroke-width="5" stroke-linejoin="round">${seams}</g>
    </g>
    <circle cx="${MID}" cy="${MID}" r="${RIM}" fill="none" stroke="url(#gold)" stroke-width="7"/>
  </svg>`;
  return raster(svg, size);
}

// ---- the break-even chart (prompt caching calculator) -----------------------------
/** Cost against calls: no cache rises steadily; cached starts higher (the
 *  write premium) and climbs slower. Illustrative shape, no figures. */
export async function breakEven(w: number, h: number) {
  const pad = 26;
  const x = (t: number) => pad + t * (w - pad * 2);
  const y = (v: number) => h - pad - v * (h - pad * 2);
  const plain = (t: number) => 0.06 + 0.9 * t;
  const cached = (t: number) => 0.3 + 0.32 * t;
  const cross = (0.3 - 0.06) / (0.9 - 0.32);
  const line = (f: (t: number) => number) =>
    Array.from({ length: 21 }, (_, i) => `${x(i / 20).toFixed(1)},${y(f(i / 20)).toFixed(1)}`).join(' ');
  const saved = `${x(cross)},${y(cached(cross))} ${line((t) => (t < cross ? cached(cross) : cached(t)))
    .split(' ')
    .filter((_, i) => i / 20 >= cross)
    .join(' ')} ${line(plain)
    .split(' ')
    .filter((_, i) => i / 20 >= cross)
    .reverse()
    .join(' ')}`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <rect width="${w}" height="${h}" rx="22" fill="#1C2840" stroke="${CREAM}" stroke-opacity=".16" stroke-width="2"/>
    ${[0.25, 0.5, 0.75].map((g) => `<line x1="${pad}" x2="${w - pad}" y1="${y(g)}" y2="${y(g)}" stroke="${CREAM}" stroke-opacity=".07" stroke-width="2"/>`).join('')}
    <polygon points="${saved}" fill="${D.moss}" fill-opacity=".22"/>
    <polyline points="${line(plain)}" fill="none" stroke="${D.hanko}" stroke-width="7" stroke-linecap="round"/>
    <polyline points="${line(cached)}" fill="none" stroke="${D.mizu}" stroke-width="7" stroke-linecap="round"/>
    <line x1="${x(cross)}" x2="${x(cross)}" y1="${y(cached(cross))}" y2="${h - pad}" stroke="${GOLD}" stroke-width="3" stroke-dasharray="7 7"/>
    <rect x="${x(cross) - 11}" y="${y(cached(cross)) - 11}" width="22" height="22" fill="${GOLD}" transform="rotate(45 ${x(cross)} ${y(cached(cross))})"/>
  </svg>`;
  return { src: await raster(svg, w, h), cross: { x: x(cross), y: y(cached(cross)) } };
}

// ---- a crack across a line of text (claims tracker) ---------------------------------
export async function crack(w: number, h: number, seamPct: number, seed = 1) {
  let s = seed;
  const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const cx = (seamPct / 100) * w;
  const pts: string[] = [];
  for (let i = 0; i <= 8; i++) pts.push(`${(cx + (i % 2 ? 9 : -9) + (r() - 0.5) * 8).toFixed(1)},${((i / 8) * h).toFixed(1)}`);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <polyline points="${pts.join(' ')}" fill="none" stroke="${GOLD}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>
  </svg>`;
  return raster(svg, w, h);
}
