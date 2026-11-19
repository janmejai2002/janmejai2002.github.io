/**
 * Each article's live artwork (lib/art.ts), as SVG inner markup, so the archive
 * bowl can show a piece's own drawing assembling itself when the reader looks at
 * it, without the homepage carrying all of them. Fetched on demand by
 * scripts/bowl.ts. Built statically, one small file per article.
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { liveArt } from '../../lib/art';

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.flatMap((p) => {
    const slug = p.id.replace(/\.md$/, '');
    const art = liveArt(slug);
    return art ? [{ params: { slug }, props: { markup: art.markup } }] : [];
  });
};

export const GET: APIRoute = ({ props }) =>
  new Response(String(props.markup), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
