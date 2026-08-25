/**
 * The five editorial themes — the one place in the site source that knows
 * their ids, labels, accents and door-copy. The index, the theme pages and
 * the article layout all import from here; the remaining hardcodings are the
 * Zod enum in content.config.ts, TRACKS in scripts/publish-article.mjs, and
 * the Track value each routine prompt writes (see docs/HANDOFF.md §0 before
 * renaming anything).
 */
export const TRACKS = [
  {
    id: 'technical',
    label: 'Technical',
    accent: 'mizu',
    ask: 'For people who build with AI',
    blurb:
      'How models and AI systems actually work, and how they break once they are doing real work.',
    cta: 'Read the technical posts',
  },
  {
    id: 'business',
    label: 'Business',
    accent: 'ochre',
    ask: 'For people who decide about AI',
    blurb:
      'What AI changes about consulting, marketing and strategy — and how to judge a claim without being an engineer.',
    cta: 'Read the business posts',
  },
  {
    id: 'basics',
    label: 'Basics',
    accent: 'plum',
    ask: 'For people getting up to speed',
    blurb:
      'AI explained in plain language, what is genuinely new this month, and the setups I have built.',
    cta: 'Start here',
  },
  {
    id: 'case-studies',
    label: 'Case Studies',
    accent: 'moss',
    ask: 'For people who want precedent',
    blurb:
      'What a named company actually did with AI in marketing and distribution — the mechanism, the numbers they published, and how much weight the evidence really carries.',
    cta: 'Read the case studies',
  },
  {
    id: 'talks',
    label: 'Talks',
    accent: 'hanko',
    ask: 'For people who cannot watch everything',
    blurb:
      'One talk, keynote or podcast at a time, from a fixed list of sources worth listening to — what was actually claimed, and what holds up.',
    cta: 'Read the talk notes',
  },
] as const;

export type Track = (typeof TRACKS)[number];
export type TrackId = Track['id'];

export const trackById = Object.fromEntries(TRACKS.map((t) => [t.id, t])) as Record<
  TrackId,
  Track
>;
