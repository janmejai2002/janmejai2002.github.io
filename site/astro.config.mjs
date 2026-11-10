import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { rehypeFigure } from './plugins/rehype-figure.mjs';
import { rehypeInternalLinks } from './plugins/rehype-internal-links.mjs';

// Post dates, read straight off the markdown so the sitemap can carry lastmod.
// The content collection is not available this early — the config is evaluated
// before Astro loads it — so this reads the frontmatter directly. Crawlers use
// lastmod to decide what is worth re-fetching; without it every URL looks
// equally stale and a corrected article can sit on an old snapshot for weeks.
const BLOG_DIR = new URL('./src/content/blog', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');

function postDates() {
  const map = new Map();
  let files = [];
  try {
    files = readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'));
  } catch {
    return map; // no posts yet is not an error
  }
  for (const file of files) {
    const raw = readFileSync(join(BLOG_DIR, file), 'utf8');
    const fm = raw.slice(0, raw.indexOf('\n---', 3));
    const updated = /^updatedDate:\s*'?([\d-]+)'?/m.exec(fm)?.[1];
    const published = /^pubDate:\s*'?([\d-]+)'?/m.exec(fm)?.[1];
    const date = updated ?? published;
    if (date) map.set(`/blog/${file.replace(/\.md$/, '')}/`, new Date(date).toISOString());
  }
  return map;
}

const DATES = postDates();
// The newest post is the best available signal for how fresh the index is.
const NEWEST = [...DATES.values()].sort().pop() ?? new Date().toISOString();

const newsFile = new URL('./src/data/news.json', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const NEWS_LATEST = JSON.parse(readFileSync(newsFile, 'utf8'))
  .map((item) => item.date)
  .sort()
  .pop();

// GitHub Pages user site → served at the root of janmejai2002.github.io.
// If you move this to a PROJECT repo instead (e.g. github.com/janmejai2002/wabi-sabi),
// add `base: '/wabi-sabi/'` below and keep `site` as the github.io origin.
// For a custom domain later: set `site` to it and drop a CNAME file in site/public/.
export default defineConfig({
  site: 'https://janmejai2002.github.io',
  // Static hosting has no server redirects, so Astro emits a page with an
  // instant refresh and a canonical pointing at the destination.
  redirects: {
    '/blog/klarna-ai-customer-service-case-study/': '/blog/klarna-ai-customer-service-graded-honestly/',
    '/topics/': '/blog/',
  },
  integrations: [
    sitemap({
      filter: (page) => !page.endsWith('/status/'),
      serialize(item) {
        const path = new URL(item.url).pathname;
        const lastmod = DATES.get(path);
        if (lastmod) {
          // An article: dated, and worth recrawling when it changes.
          return { ...item, lastmod, changefreq: 'monthly', priority: 0.8 };
        }
        if (path === '/') {
          return { ...item, lastmod: NEWEST, changefreq: 'weekly', priority: 1.0 };
        }
        // /news/ moves daily; the rest are effectively static.
        if (path === '/news/') {
          return { ...item, lastmod: new Date(NEWS_LATEST).toISOString(), changefreq: 'daily', priority: 0.7 };
        }
        if (path === '/tracker/' || path.startsWith('/topics/') || path.startsWith('/tools/')) {
          return { ...item, changefreq: 'weekly', priority: 0.8 };
        }
        return { ...item, changefreq: 'monthly', priority: 0.5 };
      },
    }),
  ],
  markdown: {
    shikiConfig: { theme: 'github-dark-dimmed', wrap: true },
    rehypePlugins: [rehypeFigure, rehypeInternalLinks],
  },
});
