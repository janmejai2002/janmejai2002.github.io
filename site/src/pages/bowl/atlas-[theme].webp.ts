/**
 * Every article's artwork packed into one image per theme, in publication
 * order, ATLAS_COLS across, so the 3D bowl (scripts/bowl-3d.ts) can paint each
 * piece with its own drawing from a single texture. Built statically.
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { newestFirst } from '../../lib/posts';
import { ATLAS_COLS } from '../../lib/bowl-form';
const CELL_W = 192;
const CELL_H = 108;

export const getStaticPaths: GetStaticPaths = () => [{ params: { theme: 'light' } }, { params: { theme: 'dark' } }];

export const GET: APIRoute = async ({ params }) => {
  const posts = (await getCollection('blog', ({ data }) => !data.draft)).sort(newestFirst).reverse();
  const rows = Math.ceil(posts.length / ATLAS_COLS);
  // Bundled, this file no longer sits beside the art; the build runs from site/.
  const dir = `${resolve(process.cwd(), 'src/assets/art')}/`;
  const tiles = await Promise.all(
    posts.map(async (p, i) => {
      const slug = p.id.replace(/\.md$/, '');
      const file = `${dir}${slug}-${params.theme}.webp`;
      if (!existsSync(file)) return null;
      const input = await sharp(file).resize(CELL_W, CELL_H, { fit: 'cover' }).toBuffer();
      return { input, left: (i % ATLAS_COLS) * CELL_W, top: Math.floor(i / ATLAS_COLS) * CELL_H };
    })
  );
  const ground = params.theme === 'dark' ? { r: 21, g: 24, b: 29, alpha: 1 } : { r: 246, g: 244, b: 239, alpha: 1 };
  const img = await sharp({ create: { width: ATLAS_COLS * CELL_W, height: rows * CELL_H, channels: 4, background: ground } })
    .composite(tiles.filter((t): t is NonNullable<typeof t> => !!t))
    .webp({ quality: 72 })
    .toBuffer();
  return new Response(img, { headers: { 'Content-Type': 'image/webp' } });
};
