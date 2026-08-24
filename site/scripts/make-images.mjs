/**
 * Renders the site's fixed raster assets from SVG sources.
 *
 * Everything a crawler or an OS chrome needs (favicon.ico, apple-touch-icon,
 * the default OG card) has to be a real file at a fixed path, so it cannot live
 * in src/assets where Astro would hash the name. These land in public/.
 *
 *   node scripts/make-images.mjs
 */
import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const pub = join(here, '..', 'public');
const svgSrc = join(here, '..', 'assets-src');
mkdirSync(pub, { recursive: true });

const render = (svg, w, h) =>
  sharp(Buffer.from(svg), { density: 384 }).resize(w, h).png({ compressionLevel: 9 }).toBuffer();

/** ICO is happy to carry a PNG payload verbatim; this is the whole container. */
function ico(png, size) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // one image
  const entry = Buffer.alloc(16);
  entry[0] = size === 256 ? 0 : size; // width  (0 means 256)
  entry[1] = size === 256 ? 0 : size; // height
  entry[2] = 0; // palette
  entry[3] = 0; // reserved
  entry.writeUInt16LE(1, 4); // colour planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(header.length + entry.length, 12);
  return Buffer.concat([header, entry, png]);
}

const favicon = readFileSync(join(pub, 'favicon.svg'), 'utf8');

// The tab icon needs a ground of its own — a bare ring on a browser's grey
// chrome loses half its contrast.
const touch = favicon
  .replace('viewBox="0 0 32 32"', 'viewBox="0 0 32 32"')
  .replace('<path', '<rect width="32" height="32" rx="7" fill="#F6F4EF"/><path');

// Article heroes are hashed and optimised by Astro, so they belong in
// src/assets rather than public/.
const assets = join(here, '..', 'src', 'assets');
mkdirSync(assets, { recursive: true });
const heroes = [['agent-memory-hero', 1600, 900]];

for (const [name, w, h] of heroes) {
  const buf = await render(readFileSync(join(svgSrc, `${name}.svg`), 'utf8'), w, h);
  writeFileSync(join(assets, `${name}.png`), buf);
  console.log(`src/assets/${name}.png`.padEnd(38) + `${(buf.length / 1024).toFixed(1)} KB`);
}

const jobs = [
  ['apple-touch-icon.png', () => render(touch, 180, 180)],
  ['og-default.png', () => render(readFileSync(join(svgSrc, 'og-default.svg'), 'utf8'), 1200, 630)],
];

for (const [name, make] of jobs) {
  const buf = await make();
  writeFileSync(join(pub, name), buf);
  console.log(`${name.padEnd(24)} ${(buf.length / 1024).toFixed(1)} KB`);
}

const small = await render(favicon.replace('<path', '<rect width="32" height="32" rx="6" fill="#F6F4EF"/><path'), 32, 32);
writeFileSync(join(pub, 'favicon.ico'), ico(small, 32));
console.log('favicon.ico             written');
