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

  const lines = [
    '# wAIbi-sabi',
    '',
    '> An applied-AI blog by Janmejai Singh Minhas. Every article answers a question a working professional actually asked, opens with an Executive TL;DR of the findings, and cites primary sources. Evidence is graded and corrections are published, not hidden.',
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
