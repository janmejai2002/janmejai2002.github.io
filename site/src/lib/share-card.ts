/**
 * Social share cards: the 1200x630 image a link unfurls into on LinkedIn, X,
 * WhatsApp, Slack, iMessage and the rest.
 *
 * The card is the site in miniature: a dark plate, a gold fracture where it
 * meets the paper, and the paper carrying the name. A feed is mostly white,
 * so the dark plate is what stops the thumb. Most platforms now hide the
 * og:title under (or instead of) the image, so the card itself has to carry
 * the headline and the hook.
 *
 * Layout is done by satori (flexbox → SVG with text as outlined paths), so the
 * card renders in the site's own Inter and Newsreader on any machine, CI
 * included. The art and the plate are drawn as plain SVG and rasterised by
 * sharp; the text layer is composited on top.
 */
import satori from 'satori';
import sharp from 'sharp';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
// @ts-expect-error — plain .mjs module shared with scripts/make-images.mjs
import { paint, PALETTE } from '../../scripts/lib/palette.mjs';

export const W = 1200;
export const H = 630;

const ROOT = process.cwd();
const C = {
  plate: '#141E2E',
  tile: '#1C2840',
  cream: '#F6F4EF',
  dim: 'rgba(246,244,239,0.66)',
  faint: 'rgba(246,244,239,0.42)',
  hair: 'rgba(246,244,239,0.16)',
  paper: PALETTE.light.paper as string,
  ink: PALETTE.light.ink as string,
  inkSoft: '#5A6474',
  gold: '#DDB667',
  goldDeep: '#C2913A',
  hanko: PALETTE.light.hanko as string,
};

/** Accents as they read on the dark plate (the dark-theme values). */
export const ACCENT: Record<string, string> = {
  mizu: PALETTE.dark.mizu,
  ochre: PALETTE.dark.ochre,
  plum: PALETTE.dark.plum,
  moss: PALETTE.dark.moss,
  hanko: PALETTE.dark.hanko,
  indigo: PALETTE.dark.indigo,
};

// ---- fonts ----------------------------------------------------------------
const font = (pkg: string, file: string) =>
  readFileSync(join(ROOT, 'node_modules', '@fontsource', pkg, 'files', file));
let fonts: Parameters<typeof satori>[1]['fonts'] | undefined;
function loadFonts() {
  fonts ??= [
    { name: 'Inter', data: font('inter', 'inter-latin-500-normal.woff'), weight: 500, style: 'normal' },
    { name: 'Inter', data: font('inter', 'inter-latin-700-normal.woff'), weight: 700, style: 'normal' },
    { name: 'Inter', data: font('inter', 'inter-latin-800-normal.woff'), weight: 800, style: 'normal' },
    { name: 'Newsreader', data: font('newsreader', 'newsreader-latin-400-italic.woff'), weight: 400, style: 'italic' },
    { name: 'Newsreader', data: font('newsreader', 'newsreader-latin-500-italic.woff'), weight: 500, style: 'italic' },
  ];
  return fonts;
}

// ---- tiny element builder (satori takes React-shaped objects) ------------
type Node = { type: string; props: Record<string, unknown> } | string | null | false | undefined;
const h = (type: string, style: Record<string, unknown>, ...children: Node[]): Node => ({
  type,
  props: { style: { display: 'flex', ...style }, children: children.filter((c) => c !== null && c !== false && c !== undefined) },
});
const img = (src: string, style: Record<string, unknown>): Node => ({ type: 'img', props: { src, style } });

// ---- the plate, the fracture and the paper --------------------------------
function rng(seed: string) {
  let s = [...seed].reduce((a, ch) => (Math.imul(a, 31) + ch.charCodeAt(0)) | 0, 11) >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const EDGE_Y = 536;
/** The broken edge: a zigzag with one deeper break, seeded so each card's
 *  fracture is its own and stays the same between builds. */
function fracture(seed: string) {
  const rand = rng(seed);
  const steps = 34;
  const brk = Math.round(steps * (0.55 + rand() * 0.3));
  const pts: [number, number][] = [];
  let side = 1;
  for (let i = 0; i <= steps; i++) {
    const x = i === 0 || i === steps ? (i / steps) * W : ((i + (rand() - 0.5) * 0.7) / steps) * W;
    side = -side;
    const reach = rand() < 0.22 ? 7 + rand() * 6 : 1.5 + rand() * 3.5;
    const lift = Math.abs(i - brk) <= 1 ? -10 : 0;
    pts.push([x, EDGE_Y + lift + side * reach]);
  }
  return pts;
}

function ground(seed: string) {
  const edge = fracture(seed);
  const line = edge.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>
      <radialGradient id="glow" cx="78%" cy="40%" r="62%">
        <stop offset="0" stop-color="#22314A"/><stop offset="1" stop-color="${C.plate}"/>
      </radialGradient>
      <linearGradient id="gold" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stop-color="${C.goldDeep}"/><stop offset=".5" stop-color="#F0D592"/><stop offset="1" stop-color="${C.goldDeep}"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="${C.paper}"/>
    <polygon points="0,0 ${W},0 ${[...edge].reverse().map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')}" fill="url(#glow)"/>
    <polyline points="${line}" fill="none" stroke="url(#gold)" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>
  </svg>`;
}

// ---- article artwork --------------------------------------------------------
const artCache = new Map<string, string | null>();
/** The article's drawing, re-painted so its ground is the plate's colour and
 *  cropped to the square at its centre, where every piece keeps its subject. */
async function art(slug: string, size: number, ground = C.plate, float = false): Promise<string | null> {
  const key = `${slug}:${size}:${ground}:${float}`;
  if (artCache.has(key)) return artCache.get(key)!;
  let out: string | null = null;
  const src = join(ROOT, 'assets-src', 'art', `${slug}.svg`);
  try {
    let buf: Buffer | null = null;
    if (existsSync(src)) {
      let source = readFileSync(src, 'utf8');
      // Floating art drops its ground so it sits on the plate's glow, not in a box.
      if (float) source = source.replace('<rect width="1600" height="900" fill="{{paper}}"/>', '');
      const svg = paint(source, 'dark', { paper: ground, paper2: ground })
        // The grain overlay is paper texture; at thumbnail size it is noise
        // that triples the file and gets mushed by every platform's re-encode.
        .replace(/<rect[^>]*filter="url\(#grain\)"[^>]*\/>/g, '');
      // Two passes: a single sharp chain applies only its last resize.
      const full = await sharp(Buffer.from(svg), { density: 72 }).resize(1600, 900).png().toBuffer();
      buf = await sharp(full)
        .extract({ left: 350, top: 0, width: 900, height: 900 })
        .resize(size, size)
        .png()
        .toBuffer();
    } else {
      const raster = join(ROOT, 'src', 'assets', 'art', `${slug}-dark.webp`);
      if (existsSync(raster)) {
        buf = await sharp(raster).resize(size, size, { fit: 'cover' }).png().toBuffer();
      }
    }
    if (buf) out = `data:image/png;base64,${buf.toString('base64')}`;
  } catch (err) {
    console.warn(`share-card: art for ${slug} skipped (${(err as Error).message})`);
  }
  artCache.set(key, out);
  return out;
}

/** The kintsugi plate from the favicon, for cards with no article art. */
function mark(size: number, accent: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="-130 -130 260 260">
    <rect x="-104" y="-104" width="208" height="208" fill="none" stroke="${C.cream}" stroke-opacity=".22" stroke-width="5"/>
    <rect x="-74" y="-74" width="148" height="148" fill="none" stroke="${C.cream}" stroke-opacity=".1" stroke-width="3"/>
    <polyline points="8,-104 -8,-58 12,-14 -8,34 10,72 -4,104" fill="none" stroke="${accent}" stroke-width="7" stroke-linejoin="round"/>
  </svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

// ---- shared pieces ----------------------------------------------------------
const marker = (color: string) =>
  h('div', { width: 12, height: 12, background: color, transform: 'rotate(45deg)', marginRight: 16 });

function kicker(label: string, color: string, meta?: string) {
  return h(
    'div',
    { alignItems: 'center', fontFamily: 'Inter', fontWeight: 700, fontSize: 25, color },
    marker(color),
    label,
    meta ? h('span', { color: C.faint, fontWeight: 500, marginLeft: 14 }, `·  ${meta}`) : null
  );
}

function strip(right: string) {
  return h(
    'div',
    {
      position: 'absolute',
      left: 72,
      top: EDGE_Y + 14,
      width: W - 144,
      height: H - EDGE_Y - 14,
      alignItems: 'center',
      justifyContent: 'space-between',
      fontFamily: 'Inter',
    },
    h(
      'div',
      { fontSize: 32, fontWeight: 800, letterSpacing: -0.5, color: C.ink },
      'w',
      h('span', { color: C.hanko }, 'AI'),
      'bi-sabi'
    ),
    h('div', { fontSize: 22, fontWeight: 500, color: C.inkSoft }, right)
  );
}

/** The first figure in a headline — "$900m", "20%", "3x", "11", "20-Year-Old". */
const FIGURE = /^(?:[$£€₹]?\d[\d.,]*(?:%|x|k|m|bn|[KMB])?(?:-[A-Za-z]+)*|[$£€₹]\d[\d.,]*)[,.:;]?$/;

/** Headline as word spans, so the figure the piece is about can carry the accent. */
function headline(text: string, size: number, accent: string, color = C.cream) {
  let lit = false;
  const words = text.split(/\s+/).map((w) => {
    // A bare year ("2026:") is a date, not the number the piece is about.
    const hot = !lit && FIGURE.test(w) && !/^(19|20)\d\d\W?$/.test(w);
    if (hot) lit = true;
    return h('span', { color: hot ? accent : color, marginRight: size * 0.24 }, w);
  });
  return h(
    'div',
    {
      flexWrap: 'wrap',
      fontFamily: 'Inter',
      fontWeight: 800,
      fontSize: size,
      lineHeight: 1.06,
      letterSpacing: -size * 0.03,
      color,
    },
    ...words
  );
}

const fit = (text: string, steps: [number, number][]) =>
  steps.find(([max]) => text.length <= max)?.[1] ?? steps[steps.length - 1][1];

function question(text: string, size = 30, lines = 2) {
  return h(
    'div',
    {
      fontFamily: 'Newsreader',
      fontStyle: 'italic',
      fontWeight: 400,
      fontSize: size,
      lineHeight: 1.25,
      color: C.dim,
      // satori honours line-clamp only on a block box
      display: 'block',
      lineClamp: lines,
    },
    text
  );
}

async function render(seed: string, tree: Node) {
  const text = await satori(tree as never, { width: W, height: H, fonts: loadFonts() });
  const base = await sharp(Buffer.from(ground(seed))).png().toBuffer();
  return sharp(base)
    .composite([{ input: Buffer.from(text) }])
    .png({ compressionLevel: 9, palette: false })
    .toBuffer();
}

const frame = (...children: Node[]) =>
  h('div', { position: 'relative', width: W, height: H }, ...children);

// ---- the article card -------------------------------------------------------
export interface ArticleCard {
  slug: string;
  title: string;
  question?: string;
  trackLabel: string;
  accent: string;
  readingTime?: string;
}

export async function articleCard(a: ArticleCard) {
  const accent = ACCENT[a.accent] ?? C.gold;
  const pic = await art(a.slug, 500, C.plate, true);
  const size = fit(a.title, [[34, 76], [46, 68], [58, 62], [70, 56]]);
  const textW = pic ? 670 : 1000;
  const tree = frame(
    pic && img(pic, { position: 'absolute', left: 706, top: 24, width: 490, height: 490 }),
    // Wide drawings reach under the text column; this scrim keeps the words
    // on clean ground without boxing the art in.
    pic &&
      h('div', {
        position: 'absolute',
        left: 560,
        top: 0,
        width: 300,
        height: EDGE_Y,
        backgroundImage: 'linear-gradient(90deg, rgba(23,34,52,1) 0%, rgba(23,34,52,0.92) 45%, rgba(23,34,52,0) 100%)',
      }),
    h(
      'div',
      {
        position: 'absolute',
        left: 72,
        top: 54,
        width: textW,
        height: EDGE_Y - 96,
        flexDirection: 'column',
        justifyContent: 'space-between',
      },
      kicker(a.trackLabel, accent, a.readingTime),
      h(
        'div',
        { flexDirection: 'column' },
        a.question && h('div', { marginBottom: 22, width: textW - 30 }, question(a.question, 29, 3)),
        headline(a.title, size, accent)
      )
    ),
    strip('Janmejai Singh Minhas  ·  janmejai2002.github.io')
  );
  return render(a.slug, tree);
}

// ---- page cards ---------------------------------------------------------------
export interface PageCard {
  key: string;
  label: string;
  title: string;
  hook?: string;
  meta?: string;
  accent?: string;
  /** Up to three article slugs whose art fans out on the right. */
  arts?: string[];
  /** Or up to three short lines (news headlines) stacked on the right. */
  lines?: { text: string; tag: string; accent?: string }[];
  footer?: string;
}

async function fan(slugs: string[]) {
  const tiles = (await Promise.all(slugs.slice(0, 3).map((s) => art(s, 300, C.tile)))).filter(Boolean) as string[];
  if (!tiles.length) return null;
  const spots = [
    { left: 0, top: 120, rotate: -8 },
    { left: 150, top: 40, rotate: 4 },
    { left: 76, top: 196, rotate: -1 },
  ];
  return h(
    'div',
    { position: 'absolute', left: 690, top: 18, width: 480, height: 500 },
    ...tiles.map((src, i) =>
      h(
        'div',
        {
          position: 'absolute',
          left: spots[i].left,
          top: spots[i].top,
          width: 300,
          height: 300,
          border: `2px solid ${C.hair}`,
          borderRadius: 18,
          overflow: 'hidden',
          transform: `rotate(${spots[i].rotate}deg)`,
          boxShadow: '0 18px 40px rgba(0,0,0,0.45)',
        },
        img(src, { width: 300, height: 300 })
      )
    )
  );
}

function stack(lines: NonNullable<PageCard['lines']>) {
  return h(
    'div',
    { position: 'absolute', left: 708, top: 70, width: 430, flexDirection: 'column' },
    ...lines.slice(0, 3).map((l, i) =>
      h(
        'div',
        {
          flexDirection: 'column',
          background: C.tile,
          border: `2px solid ${C.hair}`,
          borderLeft: `6px solid ${l.accent ?? C.gold}`,
          borderRadius: 14,
          padding: '18px 22px',
          marginBottom: 18,
          marginLeft: i * 18,
          opacity: 1 - i * 0.14,
        },
        h('div', { fontFamily: 'Inter', fontWeight: 700, fontSize: 17, color: l.accent ?? C.gold, marginBottom: 8 }, l.tag),
        h(
          'div',
          { fontFamily: 'Inter', fontWeight: 700, fontSize: 22, lineHeight: 1.22, color: C.cream, display: 'block', lineClamp: 2 },
          l.text
        )
      )
    )
  );
}

export async function pageCard(p: PageCard) {
  const accent = ACCENT[p.accent ?? 'ochre'] ?? C.gold;
  const side = p.arts?.length ? await fan(p.arts) : p.lines?.length ? stack(p.lines) : null;
  const right = side ?? img(mark(420, accent), { position: 'absolute', left: 726, top: 58, width: 420, height: 420 });
  const size = fit(p.title, [[24, 80], [38, 70], [52, 62], [80, 54]]);
  const tree = frame(
    right,
    h(
      'div',
      {
        position: 'absolute',
        left: 72,
        top: 54,
        width: 640,
        height: EDGE_Y - 96,
        flexDirection: 'column',
        justifyContent: 'space-between',
      },
      kicker(p.label, accent, p.meta),
      h(
        'div',
        { flexDirection: 'column' },
        headline(p.title, size, accent),
        p.hook && h('div', { marginTop: 24, width: 600 }, question(p.hook, 29, 3))
      )
    ),
    strip(p.footer ?? 'Applied AI by Janmejai Singh Minhas')
  );
  return render(p.key, tree);
}

export const png = (buf: Buffer) =>
  new Response(new Uint8Array(buf), {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=86400' },
  });
