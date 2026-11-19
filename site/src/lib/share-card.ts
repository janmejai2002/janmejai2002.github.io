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
import { crew, bowl, breakEven, crack } from './share-visuals';
import type { Who, Mood } from './crew';

export const W = 1200;
export const H = 630;

const ROOT = process.cwd();
const C = {
  plate: '#141E2E',
  tile: '#1C2840',
  cream: '#F6F4EF',
  dim: 'rgba(246,244,239,0.66)',
  bright: 'rgba(246,244,239,0.9)',
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

function ground(seed: string, glow?: { x: number; y: number; color: string }) {
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
      ${glow ? `<radialGradient id="accent" cx="${glow.x}" cy="${glow.y}" r="300" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${glow.color}" stop-opacity=".2"/><stop offset="1" stop-color="${glow.color}" stop-opacity="0"/></radialGradient>` : ''}
      <clipPath id="plate"><polygon points="0,0 ${W},0 ${[...edge].reverse().map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')}"/></clipPath>
    </defs>
    <rect width="${W}" height="${H}" fill="${C.paper}"/>
    <polygon points="0,0 ${W},0 ${[...edge].reverse().map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')}" fill="url(#glow)"/>
    ${glow ? `<rect width="${W}" height="${H}" fill="url(#accent)" clip-path="url(#plate)"/>` : ''}
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

function question(text: string, size = 30, lines = 2, color = C.dim) {
  return h(
    'div',
    {
      fontFamily: 'Newsreader',
      fontStyle: 'italic',
      fontWeight: 400,
      fontSize: size,
      lineHeight: 1.25,
      color,
      // satori honours line-clamp only on a block box
      display: 'block',
      lineClamp: lines,
    },
    text
  );
}

async function render(seed: string, tree: Node, glow?: { x: number; y: number; color: string }) {
  const text = await satori(tree as never, { width: W, height: H, fonts: loadFonts() });
  const base = await sharp(Buffer.from(ground(seed, glow))).png().toBuffer();
  return sharp(base)
    .composite([{ input: Buffer.from(text) }])
    // Quantised: flat colour quantises cleanly, and it keeps every card far
    // under WhatsApp's ~300 KB preview limit as the bowl gains shards.
    .png({ palette: true, quality: 95, dither: 1, effort: 10, compressionLevel: 9 })
    .toBuffer();
}

export interface Cast {
  who: Who;
  mood: Mood;
}

/** A crew member standing on the gold edge, bottom right. Their feet sit at
 *  y~126 of a 142 viewBox, so the image is lifted to put them on the line. */
async function standing(cast: Cast | undefined, size = 132, right = 30): Promise<Node> {
  if (!cast) return null;
  return h('div', { position: 'absolute', left: 0, top: 0, width: W, height: H }, ...(await standingParts(cast, size, right)));
}

async function standingParts(cast: Cast, size: number, right: number): Promise<Node[]> {
  const src = await crew(cast.who, cast.mood, size);
  const left = W - right - size;
  const top = EDGE_Y - size * 0.93 + 4;
  // A pool of plate colour behind the figure, so ink lines never tangle with art.
  const boxTop = top - size * 0.3;
  const boxH = EDGE_Y - 14 - boxTop;
  return [h(
    'div',
    { position: 'absolute', left: left - size * 0.35, top: boxTop, width: size * 1.7, height: boxH, overflow: 'hidden' },
    h('div', {
      position: 'absolute',
      left: 0,
      top: 0,
      width: size * 1.7,
      height: size * 1.5,
      backgroundImage: 'radial-gradient(closest-side, rgba(20,30,46,0.96) 45%, rgba(20,30,46,0) 100%)',
    })
  ), img(src, { position: 'absolute', left, top, width: size, height: size })];
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
  /** Who from the crew turns up: the same casting the article page uses. */
  cast?: Cast;
}

export async function articleCard(a: ArticleCard) {
  const accent = ACCENT[a.accent] ?? C.gold;
  const pic = await art(a.slug, 480, C.plate, true);
  const size = fit(a.title, [[34, 76], [46, 68], [58, 62], [70, 56]]);
  const textW = pic ? 670 : 1000;
  const tree = frame(
    pic && img(pic, { position: 'absolute', left: 696, top: 16, width: 480, height: 480 }),
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
        // The hook: the reader's own question, set off by an accent rule so it
        // reads as a voice, not a subtitle.
        a.question &&
          h(
            'div',
            { marginBottom: 24, width: textW - 30, borderLeft: `4px solid ${accent}`, paddingLeft: 20 },
            question(a.question, 30, 3, C.bright)
          ),
        headline(a.title, size, accent)
      )
    ),
    await standing(a.cast),
    strip('Janmejai Singh Minhas  ·  janmejai2002.github.io')
  );
  return render(a.slug, tree, pic ? { x: 936, y: 256, color: accent } : undefined);
}

// ---- page cards ---------------------------------------------------------------
export type Visual =
  | { kind: 'fan'; slugs: string[] }
  | { kind: 'lines'; items: { text: string; tag: string; accent?: string }[] }
  | { kind: 'bowl'; accents: string[]; lit?: boolean[] }
  | { kind: 'crew'; accents: string[] }
  | { kind: 'claims'; items: { subject: string; claim: string; seam: number }[] }
  | { kind: 'chart' };

export interface PageCard {
  key: string;
  label: string;
  title: string;
  hook?: string;
  meta?: string;
  accent?: string;
  visual?: Visual;
  /** A crew member standing on the edge. */
  cast?: Cast;
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
    { position: 'absolute', left: 670, top: 10, width: 480, height: 500 },
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

/** Rows that read like cards in a feed: tag, then two lines of text. */
function stack(items: { text: string; tag: string; accent?: string }[], cracks: (string | null)[] = []) {
  return h(
    'div',
    { position: 'absolute', left: 690, top: 52, width: 380, flexDirection: 'column' },
    ...items.slice(0, 3).map((l, i) =>
      h(
        'div',
        {
          position: 'relative',
          flexDirection: 'column',
          background: C.tile,
          border: `2px solid ${C.hair}`,
          borderLeft: `6px solid ${l.accent ?? C.gold}`,
          borderRadius: 14,
          padding: '18px 22px',
          marginBottom: 18,
          marginLeft: i * 18,
          opacity: 1 - i * 0.14,
          boxShadow: '0 12px 28px rgba(0,0,0,0.35)',
        },
        cracks[i] ? img(cracks[i]!, { position: 'absolute', left: 0, top: 0, width: 360 - i * 18, height: 108, opacity: 0.55 }) : null,
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

async function lineup(accents: string[]) {
  // All five on the gold edge, shoulder to shoulder, in front of the bowl they
  // are still mending.
  const cast: [Who, Mood, number][] = [
    ['oops', 'swing', 176],
    ['kiki', 'listen', 164],
    ['tsugi', 'proud', 204],
    ['fude', 'scribble', 172],
    ['uso', 'doubt', 176],
  ];
  const [back, ...pics] = await Promise.all([
    bowl(accents, 400, accents.map(() => false)),
    ...cast.map(([w, m, sz]) => crew(w, m, sz)),
  ]);
  let x = 612;
  return h(
    'div',
    { position: 'absolute', left: 0, top: 0, width: W, height: H },
    img(back, { position: 'absolute', left: 716, top: 14, width: 400, height: 400, opacity: 0.6 }),
    ...pics.map((src, i) => {
      const sz = cast[i][2];
      const node = img(src, { position: 'absolute', left: x, top: EDGE_Y - sz * 0.93 + 6, width: sz, height: sz });
      x += sz * 0.62;
      return node;
    })
  );
}

async function chart() {
  const w = 450;
  const hgt = 330;
  const { src, cross } = await breakEven(w, hgt);
  const left = 700;
  const top = 92;
  const tag = (text: string, color: string, x: number, y: number) =>
    h('div', { position: 'absolute', left: left + x, top: top + y, fontFamily: 'Inter', fontWeight: 700, fontSize: 20, color }, text);
  return h(
    'div',
    { position: 'absolute', left: 0, top: 0, width: W, height: H },
    img(src, { position: 'absolute', left, top, width: w, height: hgt, boxShadow: '0 18px 40px rgba(0,0,0,0.4)' }),
    tag('No cache', ACCENT.hanko, w - 140, 26),
    tag('Cached', ACCENT.mizu, w - 120, 148),
    tag('Break-even', C.gold, cross.x + 18, cross.y + 26)
  );
}

export async function pageCard(p: PageCard) {
  const accent = ACCENT[p.accent ?? 'ochre'] ?? C.gold;
  const v = p.visual;
  let side: Node = null;
  let glow: { x: number; y: number; color: string } | undefined = { x: 920, y: 260, color: accent };
  if (v?.kind === 'fan') side = await fan(v.slugs);
  else if (v?.kind === 'lines') side = stack(v.items);
  else if (v?.kind === 'claims') {
    const cracks = await Promise.all(v.items.slice(0, 3).map((c, i) => crack(360 - i * 18, 108, c.seam, i + 3)));
    side = stack(
      v.items.map((c) => ({ text: c.claim, tag: c.subject, accent: ACCENT.hanko })),
      cracks
    );
  } else if (v?.kind === 'chart') side = await chart();
  else if (v?.kind === 'crew') side = await lineup(v.accents);
  else {
    const size = 452;
    side = img(await bowl(v?.kind === 'bowl' ? v.accents : [], size, v?.kind === 'bowl' ? v.lit : undefined), {
      position: 'absolute',
      left: 676,
      top: 38,
      width: size,
      height: size,
    });
    glow = { x: 902, y: 264, color: C.gold };
  }
  const size = fit(p.title, [[24, 80], [36, 70], [46, 60], [80, 54]]);
  const tree = frame(
    side,
    h(
      'div',
      {
        position: 'absolute',
        left: 72,
        top: 54,
        width: 610,
        height: EDGE_Y - 96,
        flexDirection: 'column',
        justifyContent: 'space-between',
      },
      kicker(p.label, accent, p.meta),
      h(
        'div',
        { flexDirection: 'column' },
        headline(p.title, size, accent),
        p.hook && h('div', { marginTop: 24, width: 580 }, question(p.hook, 29, 3, C.bright))
      )
    ),
    await standing(p.cast),
    strip(p.footer ?? 'Applied AI by Janmejai Singh Minhas')
  );
  return render(p.key, tree, glow);
}

export const png = (buf: Buffer) =>
  new Response(new Uint8Array(buf), {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=86400' },
  });
