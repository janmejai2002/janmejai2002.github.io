/**
 * One bad article must not hold the batch hostage.
 *
 * Runs only after `npm run build` failed in publish-from-notion.yml. Reads
 * check-build-report.json (written by check-build.mjs), and for every failure
 * that belongs to an article in this run's publish manifest:
 *   - writes the failure codes + messages onto that Notion row and moves it to
 *     Needs Revision (so it enters the Repair Queue),
 *   - deletes that article's generated files from the working tree,
 *   - removes it from site/publish-manifest.json.
 * The workflow then rebuilds once with what is left.
 *
 * Exit codes:
 *   0  — every failure was attributable to a manifest article and has been
 *        quarantined; rebuild.
 *   1  — something failed that is not one of this run's articles (an old post,
 *        a page, astro itself). Nothing is quarantined; the run stays red and
 *        the existing failure notifications fire.
 *
 *   node scripts/quarantine-build.mjs [--dry-run]
 */
import { readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { flagBlocked } from './lib/notion.mjs';
import { routeFailure } from '../harness/registry.mjs';
import { recordNeedsHuman } from '../harness/needs-human.mjs';
import { notify } from './notify.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const site = join(here, '..');
const dryRun = process.argv.includes('--dry-run');

const reportPath = join(site, 'check-build-report.json');
const manifestPath = join(site, 'publish-manifest.json');

if (!existsSync(reportPath)) {
  console.error('No check-build-report.json — the build failed before check-build ran (astro error). Not attributable.');
  process.exit(1);
}
const report = JSON.parse(readFileSync(reportPath, 'utf8'));
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : { auto: [], reviewed: [] };
const entries = [...(manifest.auto ?? []), ...(manifest.reviewed ?? [])];
const bySlug = new Map(entries.map((e) => [e.slug, e]));

if (!report.length) {
  console.error('check-build reported no failures, so the build failed elsewhere (check-design or astro). Not attributable.');
  process.exit(1);
}

const orphan = report.filter((r) => !r.slug || !bySlug.has(r.slug));
if (orphan.length) {
  console.error('Failures outside this run\'s articles — cannot quarantine:');
  for (const r of orphan) console.error(`  ✗ ${r.rel}: [${r.code}] ${r.message}`);
  process.exit(1);
}

const grouped = new Map();
for (const r of report) {
  if (!grouped.has(r.slug)) grouped.set(r.slug, []);
  grouped.get(r.slug).push(r);
}

const pulled = [];
for (const [slug, fails] of grouped) {
  const entry = bySlug.get(slug);
  const codes = [...new Set(fails.map((f) => f.code))];
  let reason = 'Failed the site build: ' + fails.map((f) => `${f.code}: ${f.message}`).join(' | ');
  const route = routeFailure({ key: entry.key, attempts: entry.attempts ?? 0, codes });
  if (route === 'human') reason = `NEEDS YOU (${entry.attempts ?? 0} repair attempts; not auto-repairable). ${reason}`;
  console.log(`✗ quarantining ${slug} [${codes.join(', ')}] → ${route}`);
  pulled.push(`${entry.title} [${codes.join(', ')}] → ${route}`);
  if (dryRun) continue;
  if (entry.id) await flagBlocked(entry.id, reason, { needsRevision: true, codes });
  if (route !== 'repair' && entry.id)
    recordNeedsHuman({ id: entry.id, title: entry.title, key: entry.key, track: entry.track, codes, attempts: entry.attempts ?? 0, reason });
  for (const f of [
    `src/content/blog/${slug}.md`,
    `assets-src/art/${slug}.svg`,
    `src/assets/art/${slug}-light.webp`,
    `src/assets/art/${slug}-dark.webp`,
  ]) {
    rmSync(join(site, f), { force: true });
  }
}

if (!dryRun) {
  manifest.auto = (manifest.auto ?? []).filter((e) => !grouped.has(e.slug));
  manifest.reviewed = (manifest.reviewed ?? []).filter((e) => !grouped.has(e.slug));
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  rmSync(reportPath, { force: true });
}
console.log(`${grouped.size} article(s) quarantined; ${manifest.auto.length + manifest.reviewed.length} left to publish.`);
// Keep this as visible as the red run it replaces: one push per run.
if (!dryRun && pulled.length)
  await notify('Article held back', `${pulled.length} article(s) failed the build and were held back; the rest are publishing. ${pulled.join('; ')}`, {
    url: 'https://github.com/janmejai2002/janmejai2002.github.io/actions/workflows/publish-from-notion.yml',
  });
process.exit(0);
