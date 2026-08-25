/**
 * Marks published articles as Published in Notion — but only after checking
 * that the page is actually live.
 *
 *   node scripts/close-loop.mjs
 *   node scripts/close-loop.mjs --dry-run
 *
 * This is the step that was missing. "The 95% Number" sat live on the site for
 * a day while its pipeline row still said Drafting with an empty Post URL,
 * because publishing and recording-that-you-published were two manual steps and
 * only the first one happened.
 *
 * It verifies with a real request before writing anything, so a row can never
 * claim Published for a URL that 404s.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { api } from './lib/notion.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const BLOG = join(here, '..', 'src', 'content', 'blog');
const SITE = process.env.SITE_URL ?? 'https://janmejai2002.github.io';
const dryRun = process.argv.includes('--dry-run');

const front = (src, key) => src.match(new RegExp(`^${key}:\\s*'?([^'\\n]+)'?`, 'm'))?.[1]?.trim();

const posts = readdirSync(BLOG)
  .filter((f) => f.endsWith('.md'))
  .map((f) => {
    const src = readFileSync(join(BLOG, f), 'utf8');
    return { slug: f.replace(/\.md$/, ''), notionId: front(src, 'notionId'), draft: front(src, 'draft') };
  })
  .filter((p) => p.notionId && p.draft !== 'true');

if (!posts.length) {
  console.log('No posts carry a notionId. Nothing to reconcile.');
  process.exit(0);
}

let updated = 0;
let failures = 0;

for (const post of posts) {
  const url = `${SITE}/blog/${post.slug}/`;

  let production;
  try {
    production = await api(`/pages/${post.notionId}`);
  } catch (err) {
    console.error(`✗ ${post.slug}: could not read its Notion page — ${err.message}`);
    failures++;
    continue;
  }

  const pipelineId = production.properties?.['Source Idea']?.relation?.[0]?.id;
  if (!pipelineId) {
    console.error(`✗ ${post.slug}: production row has no Source Idea relation, cannot reach the radar row`);
    failures++;
    continue;
  }

  const pipeline = await api(`/pages/${pipelineId}`);
  if (pipeline.properties?.Status?.select?.name === 'Published') {
    console.log(`· ${post.slug}: already Published`);
    continue;
  }

  // Never record a Published state for a URL that is not actually serving.
  const res = await fetch(url, { method: 'HEAD' }).catch(() => null);
  if (!res?.ok) {
    console.error(`✗ ${post.slug}: ${url} returned ${res?.status ?? 'no response'} — leaving Notion alone`);
    failures++;
    continue;
  }

  if (dryRun) {
    console.log(`+ ${post.slug}: would set Published + Post URL [dry run]`);
    updated++;
    continue;
  }

  await api(`/pages/${pipelineId}`, {
    method: 'PATCH',
    body: {
      properties: {
        Status: { select: { name: 'Published' } },
        'Post URL': { url },
        'Publish Date': { date: { start: new Date().toISOString().slice(0, 10) } },
      },
    },
  });
  console.log(`+ ${post.slug}: Published, ${url}`);
  updated++;
}

console.log(`\n${updated} row(s) reconciled, ${failures} problem(s).`);
process.exit(failures ? 1 : 0);
