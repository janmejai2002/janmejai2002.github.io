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
import { pickCrew } from '../lib/crew';
import { CLAIMS } from './claims';

/** The path a page passes to <Base image=…>. */
export const cardFor = (key: string) => `/og/page/${key}.png`;

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

let built: Promise<PageCard[]> | undefined;
/** Every page card, built once per build. */
export const pageCards = () => (built ??= buildCards());
export const findCard = async (key: string) => (await pageCards()).find((c) => c.key === key);

async function buildCards(): Promise<PageCard[]> {
  const posts = (await getCollection('blog', ({ data }) => !data.draft)).sort(newestFirst);
  const accentOf = Object.fromEntries(TRACKS.map((t) => [t.id, t.accent]));
  const newest = (filter: (p: (typeof posts)[number]) => boolean = () => true) =>
    posts.filter(filter).slice(0, 3).map((p) => p.id);
  // Oldest first, the order the homepage bowl lays its shards in.
  const chrono = [...posts].reverse();
  const bowlAccents = chrono.map((p) => accentOf[p.data.track]);
  /** The bowl with only the matching shards lit. */
  const litBowl = (match: (p: (typeof posts)[number]) => boolean, accent?: string) => ({
    kind: 'bowl' as const,
    accents: accent ? chrono.map(() => accent) : bowlAccents,
    lit: chrono.map(match),
  });
  const headlines = (items: typeof allNews) =>
    items.slice(0, 3).map((i) => ({
      text: i.headline,
      tag: i.category,
      accent: ACCENT[NEWS_ACCENT[i.category] ?? 'ochre'],
    }));
  const claims = CLAIMS.filter((c) => posts.some((p) => p.id === c.slug)).map((c) => ({
    subject: c.subject,
    claim: c.claim,
    seam: c.seam,
  }));
  const cast = (page: { slug: string; title: string; question?: string; track: string }) => {
    const { who, mood } = pickCrew(page);
    return { who, mood };
  };

  const cards: PageCard[] = [
    {
      key: 'home',
      label: 'Applied-AI journal',
      title: 'Applied AI, written while it is still wrong.',
      hook: `${plural(posts.length, 'piece')} on what benchmarks leave out and what breaks in production. The bowl is not finished.`,
      meta: 'Five themes',
      accent: 'hanko',
      visual: { kind: 'bowl', accents: bowlAccents },
      cast: { who: 'tsugi', mood: 'proud' },
    },
    {
      key: 'default',
      label: 'Applied-AI journal',
      title: 'Applied AI, written while it is still wrong.',
      hook: 'Notes on building AI systems that are never finished.',
      accent: 'hanko',
      visual: { kind: 'bowl', accents: bowlAccents },
      cast: { who: 'tsugi', mood: 'paint' },
    },
    {
      key: 'blog',
      label: 'Every piece',
      title: `${posts.length} questions about AI, answered in full.`,
      hook: 'How models work, what they cost, and what happened when companies shipped them.',
      accent: 'mizu',
      visual: { kind: 'fan', slugs: newest() },
      cast: { who: 'fude', mood: 'scribble' },
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
        visual: litBowl((p) => p.data.track === t.id),
        cast: cast({ slug: t.id, title: t.share, track: t.id }),
      };
    }),
    ...TOPICS.map((t) => {
      const slugs = (t.slugs as readonly string[]).filter((s) => posts.some((p) => p.id === s));
      return {
        key: `topic-${t.id}`,
        label: t.label,
        title: t.question,
        hook: t.intro.slice(0, t.intro.indexOf('.') + 1),
        meta: `Reading path, ${plural(slugs.length, 'piece')}`,
        accent: 'indigo',
        visual: litBowl((p) => slugs.includes(p.id), 'indigo'),
        cast: cast({ slug: t.id, title: t.question, track: 'technical' }),
      };
    }),
    {
      key: 'news',
      label: 'BSchool news',
      title: 'The business news your panel will ask about.',
      hook: 'Each story comes with the angle an interviewer is primed to push on.',
      meta: plural(allNews.length, 'story', 'stories'),
      accent: 'ochre',
      visual: { kind: 'lines', items: headlines(allNews) },
      cast: { who: 'kiki', mood: 'listen' },
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
        visual: { kind: 'lines' as const, items: headlines(items) },
        cast: { who: 'kiki' as const, mood: 'listen' as const },
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
        visual: { kind: 'lines' as const, items: headlines(items) },
        cast: { who: 'kiki' as const, mood: 'listen' as const },
        footer: 'For Indian B-school interviews',
      };
    }),
    {
      key: 'about',
      label: 'About',
      title: 'Janmejai Singh Minhas',
      hook: 'Credit risk modelling at American Express. Clinical computer vision. Frontier-model red teaming.',
      meta: `${plural(posts.length, 'piece')} so far`,
      accent: 'ochre',
      visual: { kind: 'bowl', accents: bowlAccents },
      cast: { who: 'fude', mood: 'scribble' },
    },
    {
      key: 'tracker',
      label: 'AI claims tracker',
      title: 'AI deployment claims, checked against the evidence.',
      hook: 'Each public claim gets a verdict and the primary source behind it.',
      meta: plural(claims.length, 'claim') + ' cracked open',
      accent: 'hanko',
      visual: { kind: 'claims', items: claims },
      cast: { who: 'uso', mood: 'doubt' },
    },
    {
      key: 'prompt-caching-calculator',
      label: 'Free calculator',
      title: 'Will prompt caching actually save you money?',
      hook: 'Cost per run, monthly savings, and the number of calls it takes to break even.',
      accent: 'mizu',
      visual: { kind: 'chart' },
      cast: { who: 'uso', mood: 'count' },
    },
    {
      key: 'crew',
      label: 'The crew',
      title: 'Five small pieces of pottery run this site.',
      hook: 'One mends, one breaks, one listens, one writes, and one doubts everything.',
      accent: 'hanko',
      visual: { kind: 'crew', accents: bowlAccents },
    },
    {
      key: 'inference',
      label: 'INFERENCE · 2027 Edition',
      title: '150,033 words of applied AI for business and placement rooms.',
      hook: '36 units across 7 domains, 34 vector diagrams, and 178 verified primary sources. Five units free to read.',
      meta: 'By Janmejai Singh Minhas & Chaitanya Sharma',
      accent: 'ochre',
      visual: {
        kind: 'lines',
        items: [
          { tag: 'Foundations & Inserts', text: 'Token economics, RAG privacy, and India DPDP / RBI FREE-AI', accent: ACCENT.mizu },
          { tag: 'Consulting & Finance', text: '10 enterprise cases, 10 guesstimates, and credit risk models', accent: ACCENT.ochre },
          { tag: 'Product, Marketing, Ops & HR', text: 'Eval harnesses, MMM attribution, RUL, and bias audits', accent: ACCENT.moss },
        ],
      },
      cast: { who: 'fude', mood: 'scribble' },
    },
    {
      key: 'inference-read',
      label: 'INFERENCE Free Edition',
      title: 'Five complete units of INFERENCE, open to read.',
      hook: 'Ch 00, Ch 01, State of Play (Nov 2026), India Briefing, and one worked Consulting Casebook case.',
      meta: '5 of 36 units free',
      accent: 'mizu',
      visual: {
        kind: 'lines',
        items: [
          { tag: 'Ch 00 & Ch 01', text: 'AI in one sitting & Not all AI is ChatGPT', accent: ACCENT.mizu },
          { tag: 'Insert A & Insert B', text: 'State of Play Nov 2026 & India DPDP / RBI FREE-AI', accent: ACCENT.ochre },
          { tag: 'Case 01 Preview', text: 'PE Due Diligence: Testing an 80% AI support claim', accent: ACCENT.hanko },
        ],
      },
      cast: { who: 'kiki', mood: 'listen' },
    },
    {
      key: 'inference-glossary',
      label: 'INFERENCE Glossary',
      title: '116 AI and business terms, defined without hype.',
      hook: 'From KV cache and speculative decoding to RBI FREE-AI, DPDP Data Fiduciary, and Weibull hazard modeling.',
      meta: '116 terms',
      accent: 'indigo',
      visual: {
        kind: 'lines',
        items: [
          { tag: 'Inference & Evals', text: 'Token, context caching, model routing, eval harness', accent: ACCENT.mizu },
          { tag: 'India & Finance', text: 'Data Fiduciary, RBI FREE-AI, ECL, base rate fallacy', accent: ACCENT.ochre },
          { tag: 'Ops, Marketing & HR', text: 'OEE, bullwhip effect, Bayesian MMM, four-fifths rule', accent: ACCENT.moss },
        ],
      },
      cast: { who: 'uso', mood: 'count' },
    },
    {
      key: 'inference-campus',
      label: 'INFERENCE Campus Licensing',
      title: 'Cohort licensing for B-school PlaceComs and clubs.',
      hook: '50-seat and 200-seat packs with custom club stamps, single invoices, and live AI case Q&A.',
      meta: '50 & 200 seat tiers',
      accent: 'ochre',
      visual: {
        kind: 'lines',
        items: [
          { tag: '50-Seat Club Pack', text: 'INR 45,000 for Consulting, ProdMan, or Finance clubs', accent: ACCENT.ochre },
          { tag: '200-Seat Batch Pack', text: 'INR 1,40,000 with Anki deck, 25 drills & live Q&A', accent: ACCENT.moss },
          { tag: '36/36 Units Included', text: 'Full 2027 Edition + 1 year of Insert A & B updates', accent: ACCENT.mizu },
        ],
      },
      cast: { who: 'tsugi', mood: 'proud' },
    },
  ];
  return cards;
}
