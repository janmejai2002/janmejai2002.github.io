/**
 * Writes a "publishing failed after generation" note onto every Notion row that
 * was in this run's publish manifest.
 *
 *   node scripts/flag-pipeline-failure.mjs "<phase that failed>"
 *
 * publish-article.mjs already puts its own rejections on the row it rejected.
 * This covers the steps *after* it — artwork rendering, `npm run build`, the
 * commit to main, the pull request — where a failure used to leave only a red
 * Actions run nobody watches while the Notion row sat at Approved / Draft Ready
 * with no hint that the article never went live.
 *
 * Called from an `if: failure()` step in publish-from-notion.yml, so it runs
 * only when an earlier step in that job failed. It reads site/publish-manifest.json
 * for the rows (and their ids) that were being published; if there is no
 * manifest or it is empty, there is nothing to flag and it exits 0.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { flagBlocked, api, plain } from './lib/notion.mjs';
import { notify } from './notify.mjs';
import { recordNeedsHuman } from '../harness/needs-human.mjs';

// The first failure may be a transient GitHub/network flake, so the row stays
// Draft Ready and the next poll retries it. A second consecutive failure is not
// a flake: the row moves to Needs Revision with G-BUILD and a needs-human issue
// is opened, instead of failing on every poll forever.
const MARKER = 'publishing then failed at';

const here = dirname(fileURLToPath(import.meta.url));
const phase = process.argv[2]?.trim() || 'a step after generation';

let manifest;
try {
  manifest = JSON.parse(readFileSync(join(here, '..', 'publish-manifest.json'), 'utf8'));
} catch {
  console.log('No publish-manifest.json — nothing to flag.');
  process.exit(0);
}

const rows = [...(manifest.auto ?? []), ...(manifest.reviewed ?? [])];
if (!rows.length) {
  console.log('Manifest is empty — nothing to flag.');
  process.exit(0);
}

let flagged = 0;
for (const r of rows) {
  if (!r.id) {
    console.error(`::warning::manifest row for "${r.slug}" has no id — cannot flag it`);
    continue;
  }
  let previous = '';
  try {
    previous = plain((await api(`/pages/${r.id}`)).properties['Blocked Reason']?.rich_text);
  } catch {}
  const repeat = previous.includes(MARKER);
  const reason =
    (repeat ? 'FAILED TWICE — needs you. ' : '') +
    `This draft passed every content gate, but ${MARKER} ${phase}, so the article is not live yet. ` +
    `Check the log for the failed "Publish from Notion" run, fix the cause, and set Draft Ready again.`;
  const ok = await flagBlocked(r.id, reason, repeat ? { needsRevision: true, codes: ['G-BUILD'] } : {});
  if (repeat)
    recordNeedsHuman({ id: r.id, title: r.title, key: r.key, track: r.track, codes: ['G-BUILD'], attempts: r.attempts ?? 0, reason });
  if (ok) {
    flagged++;
    console.log(`  ↳ flagged "${r.title}" (${r.slug})`);
  }
}

console.log(`\n${flagged}/${rows.length} row(s) flagged after failure at ${phase}.`);

if (flagged > 0) {
  const names = rows.map((r) => r.title).filter(Boolean).slice(0, 3).join(', ');
  await notify(
    'Publish failed after generation',
    `${flagged} article(s) generated fine but publishing failed at ${phase}: ${names}. ` +
      `The reason is on the Notion row(s); the Actions log has the detail.`,
    { url: 'https://github.com/janmejai2002/janmejai2002.github.io/actions/workflows/publish-from-notion.yml' }
  );
}

process.exit(0);
