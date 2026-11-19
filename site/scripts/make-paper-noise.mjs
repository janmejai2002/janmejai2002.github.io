// Renders the paper grain once, to small tiles, so the page never runs an SVG
// turbulence filter while it scrolls or animates. Run: node scripts/make-paper-noise.mjs
// The source SVGs are the ones global.css used to inline (same filter, same opacity).
import sharp from 'sharp';

const svg = (mono) => `<svg viewBox="0 0 200 200" width="200" height="200" xmlns="http://www.w3.org/2000/svg">
<filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/>${mono ? '<feColorMatrix type="saturate" values="0"/>' : ''}</filter>
<rect width="100%" height="100%" filter="url(#n)" opacity="${mono ? 0.03 : 0.04}"/></svg>`;

for (const [name, mono] of [['paper-noise', false], ['paper-noise-mono', true]]) {
  const out = `public/textures/${name}.webp`;
  const info = await sharp(Buffer.from(svg(mono))).webp({ quality: 70, alphaQuality: 60, effort: 6 }).toFile(out);
  console.log(out, info.size, 'bytes');
}
