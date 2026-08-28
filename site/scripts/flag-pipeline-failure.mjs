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
import { flagBlocked } from './lib/notion.mjs';

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
  const ok = await flagBlocked(
    r.id,
    `This draft passed every content gate, but publishing then failed at ${phase}, so the article is not live yet. ` +
      `Nothing needs to change on this row unless the GitHub Actions log points at its content — check the log for the failed ` +
      `"Publish from Notion" run, fix the cause, and re-trigger (or wait for the next poll).`
  );
  if (ok) {
    flagged++;
    console.log(`  ↳ flagged "${r.title}" (${r.slug})`);
  }
}

console.log(`\n${flagged}/${rows.length} row(s) flagged after failure at ${phase}.`);
process.exit(0);
