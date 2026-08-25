/**
 * Renders the site's raster assets from SVG sources.
 *
 * Article artwork is authored once in `assets-src/art/` using palette
 * placeholders ({{paper}}, {{ink}}, {{mizu}} …), never hex. This file
 * substitutes the light and the dark palette and emits one PNG for each, so a
 * piece of artwork cannot ship with a baked-in background that breaks the
 * other theme. See docs/ARTWORK.md.
 *
 * Fixed assets a crawler or OS chrome needs at a stable path (favicon.ico,
 * apple-touch-icon, the default OG card) go to public/. Article artwork goes to
 * src/assets/ so Astro can hash and optimise it.
 *
 *   npm run images
 */
import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, basename } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const pub = join(here, '..', 'public');
const svgSrc = join(here, '..', 'assets-src');
const artSrc = join(svgSrc, 'art');
const artOut = join(here, '..', 'src', 'assets', 'art');
mkdirSync(pub, { recursive: true });
mkdirSync(artOut, { recursive: true });

/** The two palettes, mirroring the tokens in src/styles/global.css. */
const PALETTE = {
  light: {
    paper: '#F6F4EF', paper2: '#EFEBE3', ink: '#1A2639', border: '#DCD4C7',
    card: '#EDE9E0', mizu: '#00A9B8', hanko: '#D2543F', moss: '#6E8C63',
    ochre: '#C2913A', plum: '#8A6690', indigo: '#4E6E9C',
  },
  dark: {
    paper: '#15181D', paper2: '#1B1F26', ink: '#E9E5DC', border: '#2E343D',
    card: '#1C2129', mizu: '#4ECDD8', hanko: '#E87A64', moss: '#9BBA8E',
    ochre: '#DDB667', plum: '#B694BC', indigo: '#85A5D0',
  },
};

function paint(svg, theme) {
  const p = PALETTE[theme];
  const out = svg.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    if (!(key in p)) throw new Error(`unknown palette token {{${key}}}`);
    return p[key];
  });
  const leftover = out.match(/\{\{\w+\}\}/);
  if (leftover) throw new Error(`unsubstituted token ${leftover[0]}`);
  return out;
}

const render = (svg, w, h) =>
  sharp(Buffer.from(svg), { density: 384 }).resize(w, h).png({ compressionLevel: 9 }).toBuffer();

// Artwork carries a fractal-noise overlay, which defeats PNG's lossless
// compression completely — the same file is 1.3 MB as PNG and ~90 KB as WebP
// with no visible difference. Astro re-encodes for delivery either way; this
// only decides what weight the repository carries.
const renderArt = (svg, w, h) =>
  sharp(Buffer.from(svg), { density: 384 }).resize(w, h).webp({ quality: 90 }).toBuffer();

/** ICO is happy to carry a PNG payload verbatim; this is the whole container. */
function ico(png, size) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);
  const entry = Buffer.alloc(16);
  entry[0] = size === 256 ? 0 : size;
  entry[1] = size === 256 ? 0 : size;
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(header.length + entry.length, 12);
  return Buffer.concat([header, entry, png]);
}

// ---- article artwork -------------------------------------------------------
const artFiles = readdirSync(artSrc).filter((f) => f.endsWith('.svg'));
for (const file of artFiles) {
  const slug = basename(file, '.svg');
  const svg = readFileSync(join(artSrc, file), 'utf8');
  if (/(?:fill|stroke)="#/i.test(svg)) {
    throw new Error(`${file} hardcodes a hex colour — use a {{token}} (docs/ARTWORK.md)`);
  }
  for (const theme of ['light', 'dark']) {
    const buf = await renderArt(paint(svg, theme), 1600, 900);
    writeFileSync(join(artOut, `${slug}-${theme}.webp`), buf);
    console.log(`art/${slug}-${theme}.webp`.padEnd(46) + `${(buf.length / 1024).toFixed(1)} KB`);
  }
}

// ---- fixed assets ----------------------------------------------------------
const favicon = readFileSync(join(pub, 'favicon.svg'), 'utf8');
const touch = favicon.replace('<path', '<rect width="32" height="32" rx="7" fill="#F6F4EF"/><path');

const jobs = [
  ['apple-touch-icon.png', () => render(touch, 180, 180)],
  ['og-default.png', () => render(paint(readFileSync(join(svgSrc, 'og-default.svg'), 'utf8'), 'light'), 1200, 630)],
];

for (const [name, make] of jobs) {
  const buf = await make();
  writeFileSync(join(pub, name), buf);
  console.log(name.padEnd(46) + `${(buf.length / 1024).toFixed(1)} KB`);
}

const small = await render(
  favicon.replace('<path', '<rect width="32" height="32" rx="6" fill="#F6F4EF"/><path'),
  32,
  32
);
writeFileSync(join(pub, 'favicon.ico'), ico(small, 32));
console.log('favicon.ico'.padEnd(46) + 'written');
