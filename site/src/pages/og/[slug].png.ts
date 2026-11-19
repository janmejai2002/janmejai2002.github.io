/**
 * One 1200x630 share card per article: its own drawing on the dark plate, the
 * reader's question as the hook, and the headline with its figure in the
 * track's accent. See src/lib/share-card.ts.
 */
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { TRACKS } from '../../data/tracks';
import { articleCard, png } from '../../lib/share-card';

export async function getStaticPaths() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.map((post) => ({ params: { slug: post.id }, props: { post } }));
}

export const GET: APIRoute = async ({ props }) => {
  const { title, question, track, readingTime } = props.post.data;
  const t = TRACKS.find((x) => x.id === track) ?? TRACKS[0];
  return png(
    await articleCard({
      slug: props.post.id,
      title,
      question,
      trackLabel: t.label,
      accent: t.accent,
      readingTime,
    })
  );
};
