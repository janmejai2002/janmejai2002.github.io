/**
 * /llms.txt — a minimal machine-readable map of the site, per the llms.txt
 * proposal (H1, blockquote summary, H2-grouped links).
 *
 * Shipped with eyes open: as of 2026 no major assistant provider consumes
 * this file for retrieval (docs/research/ai-citability.md §3) — the one real
 * consumer class is coding agents pointed at a site. It is generated from the
 * content collection so it can never go stale, costs nothing to serve, and
 * gets deleted the day it proves useless. Do not invest further effort here.
 */
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const SITE = 'https://janmejai2002.github.io';

export const GET: APIRoute = async () => {
  const posts = (await getCollection('blog', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );
  const freeInference = (await getCollection('inference')).sort(
    (a, b) => a.data.order - b.data.order
  );

  const lines = [
    '# wAIbi-sabi',
    '',
    '> An applied-AI blog by Janmejai Singh Minhas. Every article answers a question a working professional actually asked, opens with an Executive TL;DR of the findings, and cites primary sources. Evidence is graded and corrections are published, not hidden.',
    '',
    '## INFERENCE Free Edition',
    `- [INFERENCE 2027 Edition Overview](${SITE}/inference/): 150,033-word applied-AI compendium across 36 units and 7 business domains by Janmejai Singh Minhas and Chaitanya Sharma.`,
    `- [INFERENCE Free Edition Hub](${SITE}/inference/read/): Five complete free units plus the 36-unit syllabus roadmap.`,
    ...freeInference.map(
      (u) => `- [${u.data.unitNumber}: ${u.data.title}](${SITE}/inference/read/${u.id}/): ${u.data.deck}`
    ),
    `- [INFERENCE 116-Term Glossary](${SITE}/inference/glossary/): Searchable AI and business glossary cross-linked to compendium tracks.`,
    `- [INFERENCE Campus & PlaceCom Licensing](${SITE}/inference/campus/): Bulk cohort seat licensing for B-school placement committees and clubs.`,
    '',
    '## Articles',
    ...posts.map((p) => {
      const slug = p.id.replace(/\.md$/, '');
      return `- [${p.data.title}](${SITE}/blog/${slug}/): ${p.data.description}`;
    }),
    '',
    '## Optional',
    `- [Sitemap](${SITE}/sitemap-index.xml)`,
    `- [RSS](${SITE}/rss.xml)`,
    `- [About the author](${SITE}/about/)`,
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
