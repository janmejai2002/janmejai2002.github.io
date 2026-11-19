/**
 * Share cards for the site's non-article pages. The copy and the list of
 * cards live in src/data/share.ts; the drawing in src/lib/share-card.ts.
 */
import type { APIRoute } from 'astro';
import { pageCards } from '../../../data/share';
import { pageCard, png } from '../../../lib/share-card';

export async function getStaticPaths() {
  return (await pageCards()).map((card) => ({ params: { key: card.key }, props: { card } }));
}

export const GET: APIRoute = async ({ props }) => png(await pageCard(props.card));
