/**
 * Share cards for every page that is not an article: the copy lives here, the
 * drawing in src/lib/share-card.ts, the route in src/pages/og/page/[key].png.ts.
 *
 * Each card leads with a claim or a question in the reader's terms, not the
 * page's name. Listing pages show their newest artwork or headlines, so the
 * card changes as the site does and a re-share never looks stale.
 *
 * Voice rules apply (docs/DESIGN-SYSTEM.md): plain, dry, specific, sentence
 * case, no exclamation marks.
 */
import { getCollection } from 'astro:content';
import { TRACKS } from './tracks';
import { TOPICS } from './topics';
import { allNews, categories, catSlug, months, monthLabel, NEWS_ACCENT } from './news-archive';
import { newestFirst } from '../lib/posts';
import { ACCENT, type PageCard } from '../lib/share-card';

/** The path a page passes to <Base image=…>. */
export const cardFor = (key: string) => `/og/page/${key}.png`;

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

let built: Promise<PageCard[]> | undefined;
/** Every page card, built once per build. */
export const pageCards = () => (built ??= buildCards());
export const findCard = async (key: string) => (await pageCards()).find((c) => c.key === key);

async function buildCards(): Promise<PageCard[]> {
  const posts = (await getCollection('blog', ({ data }) => !data.draft)).sort(newestFirst);
  const newest = (filter: (p: (typeof posts)[number]) => boolean = () => true) =>
    posts.filter(filter).slice(0, 3).map((p) => p.id);
  const headlines = (items: typeof allNews) =>
    items.slice(0, 3).map((i) => ({
      text: i.headline,
      tag: i.category,
      accent: ACCENT[NEWS_ACCENT[i.category] ?? 'ochre'],
    }));

  const cards: PageCard[] = [
    {
      key: 'home',
      label: 'Applied-AI journal',
      title: 'Applied AI, written while it is still wrong.',
      hook: 'What benchmarks leave out, what breaks in production, and what the research says past the abstract.',
      meta: plural(posts.length, 'piece'),
      accent: 'hanko',
      arts: newest(),
    },
    {
      key: 'default',
      label: 'Applied-AI journal',
      title: 'Applied AI, written while it is still wrong.',
      hook: 'Notes on building AI systems that are never finished.',
      accent: 'hanko',
    },
    {
      key: 'blog',
      label: 'Every piece',
      title: `${posts.length} questions about AI, answered in full.`,
      hook: 'How models work, what they cost, and what happened when companies shipped them.',
      accent: 'mizu',
      arts: newest(),
    },
    ...TRACKS.map((t) => {
      const n = posts.filter((p) => p.data.track === t.id).length;
      return {
        key: `track-${t.id}`,
        label: t.label,
        title: t.share,
        hook: t.ask + '.',
        meta: plural(n, 'piece'),
        accent: t.accent,
        arts: newest((p) => p.data.track === t.id),
      };
    }),
    ...TOPICS.map((t) => {
      const slugs = (t.slugs as readonly string[]).filter((s) => posts.some((p) => p.id === s));
      return {
        key: `topic-${t.id}`,
        label: `Reading path: ${t.label}`,
        title: t.question,
        hook: t.intro.slice(0, t.intro.indexOf('.') + 1),
        meta: plural(slugs.length, 'piece'),
        accent: 'indigo',
        arts: slugs.slice(0, 3),
      };
    }),
    {
      key: 'news',
      label: 'BSchool news',
      title: 'The business news your panel will ask about.',
      hook: 'Each story comes with the angle an interviewer is primed to push on.',
      meta: plural(allNews.length, 'story', 'stories'),
      accent: 'ochre',
      lines: headlines(allNews),
      footer: 'For Indian B-school interviews',
    },
    ...categories.map((c) => {
      const items = allNews.filter((i) => i.category === c);
      return {
        key: `news-${catSlug(c)}`,
        label: `BSchool news: ${c}`,
        title: `${c} news, read the way an interviewer reads it.`,
        hook: 'Each story with the follow-up question a panel is primed to ask.',
        meta: plural(items.length, 'story', 'stories'),
        accent: NEWS_ACCENT[c] ?? 'ochre',
        lines: headlines(items),
        footer: 'For Indian B-school interviews',
      };
    }),
    ...months.map((m) => {
      const items = allNews.filter((i) => i.date.startsWith(m));
      return {
        key: `news-${m}`,
        label: 'BSchool news',
        title: `${monthLabel(m)}: the business news worth knowing cold.`,
        hook: 'Each story with the angle an interviewer is likely to push on.',
        meta: plural(items.length, 'story', 'stories'),
        accent: 'ochre',
        lines: headlines(items),
        footer: 'For Indian B-school interviews',
      };
    }),
    {
      key: 'about',
      label: 'About',
      title: 'Janmejai Singh Minhas',
      hook: 'Credit risk modelling at American Express. Clinical computer vision. Frontier-model red teaming.',
      accent: 'ochre',
    },
    {
      key: 'tracker',
      label: 'AI claims tracker',
      title: 'AI deployment claims, checked against the evidence.',
      hook: 'Each public claim gets a verdict and the primary source behind it.',
      accent: 'moss',
    },
    {
      key: 'prompt-caching-calculator',
      label: 'Free calculator',
      title: 'Will prompt caching actually save you money?',
      hook: 'Cost per run, monthly savings, and the number of calls it takes to break even.',
      accent: 'mizu',
    },
    {
      key: 'crew',
      label: 'The crew',
      title: 'Five small pieces of pottery run this site.',
      hook: 'One mends, one breaks, one listens, one writes, and one doubts everything.',
      accent: 'hanko',
    },
  ];
  return cards;
}
