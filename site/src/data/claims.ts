/**
 * The claims the index cracks open. Hand-picked, because the claim line is a
 * paraphrase of what circulated and the mend has to be something the linked
 * article actually establishes. This is the one part of the index that is not
 * generated from the posts. A slug that stops resolving is skipped with a build
 * warning, so a retired post can neither leave a dead hero nor block publishing.
 *
 * `seam` is where the fracture crosses the line, as a percentage of its width.
 */
export const CLAIMS = [
  {
    slug: 'klarna-ai-customer-service-graded-honestly',
    subject: 'Klarna',
    claim: "Klarna's AI did the work of 700 agents.",
    mend: 'Nobody outside Klarna has verified that number. Fourteen months later, it started rehiring humans.',
    seam: 42,
  },
  {
    slug: 'the-95-percent-number',
    subject: 'The 95%',
    claim: '95% of generative AI pilots failed.',
    mend: 'MIT found no measurable P&L impact, not technical failure. Mostly because nobody recorded a baseline.',
    seam: 36,
  },
  {
    slug: 'agent-memory-filesystem',
    subject: 'Agent memory',
    claim: 'Agent memory needs a vector database.',
    mend: 'In a UCLA benchmark the best pure-retrieval setup averaged 48.5%. A coding agent reading plain files averaged 69.3%.',
    seam: 47,
  },
  {
    slug: 'ai-overviews-traffic-loss-measure-your-own',
    subject: 'AI Overviews',
    claim: 'AI Overviews cut your traffic in half.',
    mend: 'Clicks roughly halved on searches where a summary shows. That is not the same as your traffic falling by half.',
    seam: 39,
  },
  {
    slug: 'eu-ai-act-timeline-chatgpt-kratsios',
    subject: 'EU AI Act',
    claim: "Europe's AI law was finalized before ChatGPT.",
    mend: 'The political deal was struck in December 2023, over a year after ChatGPT shipped.',
    seam: 44,
  },
] as const;
