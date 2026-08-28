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
 *
 * There are up to two rows behind an article: the Article Production row, which
 * always exists, and the radar idea it was promoted from, which does not.
 * Talks and Case Studies are researched straight into production and have no
 * radar row at all. They are reconciled on the production row alone.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { api, flagBlocked } from './lib/notion.mjs';

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

  // Not every article comes from the radar, and a missing Source Idea is
  // therefore normal rather than broken. Talks and Case Studies are researched
  // straight into Article Production by their own routines — there is no radar
  // idea upstream to relate to, and there never was.
  //
  // This used to be a hard failure, which had a nastier consequence than a red
  // log line: the `continue` meant the PRODUCTION row was never marked
  // Published either, even though the article was live and serving. Every Talks
  // and Case Studies article silently stayed at Draft Ready or Approved for
  // ever, and /status/ reported live articles as still awaiting review.
  //
  // A radar row that cannot be reached is simply skipped now. The production
  // row is reconciled on its own, which is the half that always exists.
  const pipelineId = production.properties?.['Source Idea']?.relation?.[0]?.id;
  const pipeline = pipelineId ? await api(`/pages/${pipelineId}`) : null;

  // Both rows are checked independently. They used to be coupled: the script
  // read only the radar row, and if that already said Published it skipped the
  // article entirely — so a production row left at "Draft Ready" could never
  // catch up. That is exactly what happened to the first four articles, and it
  // made the /status/ page report drafts awaiting review that were already live.
  // No radar row is "done" for this purpose: there is nothing left to update.
  const radarDone = !pipelineId || pipeline.properties?.Status?.select?.name === 'Published';
  const productionDone = production.properties?.['Draft Status']?.select?.name === 'Published';

  if (radarDone && productionDone) {
    console.log(`· ${post.slug}: already Published`);
    continue;
  }

  // Never record a Published state for a URL that is not actually serving.
  const res = await fetch(url, { method: 'HEAD' }).catch(() => null);
  if (!res?.ok) {
    const status = res?.status ?? 'no response';
    console.error(`✗ ${post.slug}: ${url} returned ${status} — leaving Notion alone`);
    // The row still says Draft Ready / Approved and the article is not live —
    // exactly the silent-stall the close-loop exists to prevent. Say so on the
    // row. Not needsRevision: the draft is fine, the deploy is what did not land.
    await flagBlocked(
      post.notionId,
      `The article was generated and merged but ${url} is still returning ${status}, so it has not been marked Published. Re-run the deploy; if it keeps failing the build or Pages step is broken, not this draft.`
    );
    failures++;
    continue;
  }

  const todo = [!radarDone && 'radar', !productionDone && 'production'].filter(Boolean);

  if (dryRun) {
    console.log(`+ ${post.slug}: would mark ${todo.join(' + ')} Published [dry run]`);
    updated++;
    continue;
  }

  if (!radarDone) {
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
  }

  if (!productionDone) {
    await api(`/pages/${post.notionId}`, {
      method: 'PATCH',
      body: { properties: { 'Draft Status': { select: { name: 'Published' } } } },
    });
  }

  console.log(`+ ${post.slug}: ${todo.join(' + ')} → Published, ${url}`);
  updated++;
}

console.log(`\n${updated} row(s) reconciled, ${failures} problem(s).`);
process.exit(failures ? 1 : 0);
