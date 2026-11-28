/**
 * Generates NotebookLM-ready and PDF-ready Markdown dossiers from
 * `site/src/data/news.json`, grouped by business domain/category and recency.
 *
 * Output defaults to `site/dist-dossiers/` so `site/src/content/blog/` stays untouched.
 *
 * Usage:
 *   node site/scripts/generate-news-dossier.mjs --dry-run
 *   node site/scripts/generate-news-dossier.mjs
 *   node site/scripts/generate-news-dossier.mjs --category Finance --since 2026-09-01
 *   node site/scripts/generate-news-dossier.mjs --out scratch/dossiers
 *   node site/scripts/generate-news-dossier.mjs --test
 */

import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = resolve(HERE, '..');
export const DEFAULT_NEWS_PATH = join(SITE_ROOT, 'src', 'data', 'news.json');
export const DEFAULT_OUT_DIR = join(SITE_ROOT, 'dist-dossiers');

const CATEGORY_ORDER = [
  'Consulting',
  'Finance',
  'Marketing',
  'Operations',
  'Product Management',
];

export const RECENCY_BUCKETS = [
  { id: '0-30d', label: 'Last 30 Days (0–30d)', maxDays: 30 },
  { id: '31-90d', label: 'Recent Quarter (31–90d)', maxDays: 90 },
  { id: '91-180d', label: 'Prior Quarter (91–180d)', maxDays: 180 },
  { id: '180d+', label: 'Archive (180+ Days)', maxDays: Number.POSITIVE_INFINITY },
];

const MS_PER_DAY = 86_400_000;

/**
 * Convert a category label to a URL- and filename-safe kebab slug.
 * @param {string} category
 * @returns {string}
 */
export function slugifyCategory(category) {
  return String(category || 'uncategorized')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Parse YYYY-MM-DD into a UTC epoch millisecond timestamp, returning null if invalid.
 * @param {string} dateStr
 * @returns {number | null}
 */
export function parseIsoDateUtc(dateStr) {
  if (typeof dateStr !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr.trim())) {
    return null;
  }
  const ms = Date.parse(`${dateStr.trim()}T00:00:00Z`);
  return Number.isNaN(ms) ? null : ms;
}

/**
 * Format a YYYY-MM string into a human-readable month label (e.g., "November 2026").
 * @param {string} monthKey
 * @returns {string}
 */
export function formatMonthLabel(monthKey) {
  if (!/^\d{4}-\d{2}$/.test(monthKey)) return monthKey || 'Undated';
  return new Date(`${monthKey}-01T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/**
 * Count words in a string cleanly.
 * @param {string} text
 * @returns {number}
 */
export function countWords(text) {
  const trimmed = String(text || '').trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

/**
 * Normalize and validate raw news entries, sorting newest-first then headline ascending.
 * @param {unknown[]} rawEntries
 * @returns {Array<{headline: string, date: string, category: string, summary: string, angle: string, source: string | null}>}
 */
export function normalizeNewsEntries(rawEntries) {
  if (!Array.isArray(rawEntries)) {
    throw new Error('Expected news.json root value to be a JSON array.');
  }

  return rawEntries
    .filter((item) => item && typeof item === 'object' && item.headline && item.date)
    .map((item) => ({
      headline: String(item.headline).trim(),
      date: String(item.date).trim(),
      category: String(item.category || 'Uncategorized').trim() || 'Uncategorized',
      summary: String(item.summary || '').trim(),
      angle: String(item.angle || '').trim(),
      source: item.source ? String(item.source).trim() : null,
    }))
    .sort((a, b) => b.date.localeCompare(a.date) || a.headline.localeCompare(b.headline));
}

/**
 * Load and normalize entries from disk.
 * @param {string} [newsPath]
 */
export function loadNews(newsPath = DEFAULT_NEWS_PATH) {
  if (!existsSync(newsPath)) {
    throw new Error(`News data file not found: ${newsPath}`);
  }
  const raw = JSON.parse(readFileSync(newsPath, 'utf8'));
  return normalizeNewsEntries(raw);
}

/**
 * Classify an entry date into one of the recency buckets relative to `anchorDate`.
 * @param {string} entryDate
 * @param {string} anchorDate
 * @returns {{ id: string, label: string, maxDays: number }}
 */
export function classifyRecency(entryDate, anchorDate) {
  const entryMs = parseIsoDateUtc(entryDate);
  const anchorMs = parseIsoDateUtc(anchorDate);
  if (entryMs === null || anchorMs === null) {
    return RECENCY_BUCKETS[RECENCY_BUCKETS.length - 1];
  }
  const ageDays = Math.max(0, Math.floor((anchorMs - entryMs) / MS_PER_DAY));
  return RECENCY_BUCKETS.find((bucket) => ageDays <= bucket.maxDays) ?? RECENCY_BUCKETS[RECENCY_BUCKETS.length - 1];
}

/**
 * Sort category keys canonically (5 primary B-school tracks first, then alphabetical).
 * @param {string[]} categories
 * @returns {string[]}
 */
export function sortCategories(categories) {
  return [...categories].sort((a, b) => {
    const ia = CATEGORY_ORDER.indexOf(a);
    const ib = CATEGORY_ORDER.indexOf(b);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.localeCompare(b);
  });
}

/**
 * Group normalized entries by category and recency bucket.
 * @param {ReturnType<typeof normalizeNewsEntries>} entries
 * @param {string} anchorDate
 */
export function groupNewsByCategoryAndRecency(entries, anchorDate) {
  const byCategory = new Map();

  for (const entry of entries) {
    if (!byCategory.has(entry.category)) {
      byCategory.set(entry.category, []);
    }
    byCategory.get(entry.category).push(entry);
  }

  return sortCategories([...byCategory.keys()]).map((category, idx) => {
    const items = byCategory.get(category);
    const recencyCounts = Object.fromEntries(RECENCY_BUCKETS.map((b) => [b.id, 0]));
    const bucketed = new Map(RECENCY_BUCKETS.map((b) => [b.id, []]));

    for (const item of items) {
      const bucket = classifyRecency(item.date, anchorDate);
      recencyCounts[bucket.id] += 1;
      bucketed.get(bucket.id).push(item);
    }

    const dates = items.map((i) => i.date).sort();
    const wordCount = items.reduce(
      (sum, item) => sum + countWords(`${item.headline} ${item.summary} ${item.angle}`),
      0
    );
    const prefix = String(idx + 1).padStart(2, '0');
    const filename = `${prefix}-${slugifyCategory(category)}-dossier.md`;

    return {
      category,
      slug: slugifyCategory(category),
      filename,
      count: items.length,
      minDate: dates[0] ?? 'n/a',
      maxDate: dates[dates.length - 1] ?? 'n/a',
      wordCount,
      recencyCounts,
      bucketed,
      items,
    };
  });
}

/**
 * Group items chronologically by YYYY-MM (newest month first).
 * @param {ReturnType<typeof normalizeNewsEntries>} items
 */
function groupByMonth(items) {
  const map = new Map();
  for (const item of items) {
    const monthKey = item.date.slice(0, 7);
    if (!map.has(monthKey)) map.set(monthKey, []);
    map.get(monthKey).push(item);
  }
  return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
}

/**
 * Render a single news item as clean Markdown for NotebookLM and PDF export.
 * @param {ReturnType<typeof normalizeNewsEntries>[number]} item
 * @returns {string}
 */
export function renderStoryMarkdown(item) {
  const lines = [
    `#### [${item.date}] ${item.headline}`,
    '',
  ];
  if (item.summary) {
    lines.push(`**What Happened:** ${item.summary}`, '');
  }
  if (item.angle) {
    lines.push(`**GDPI & Interview Panel Angle:** ${item.angle}`, '');
  }
  if (item.source) {
    lines.push(`**Primary Source:** <${item.source}>`, '');
  }
  lines.push('---', '');
  return lines.join('\n');
}

/**
 * Render a full domain dossier Markdown file grouped by recency tier and month.
 * @param {ReturnType<typeof groupNewsByCategoryAndRecency>[number]} group
 * @param {string} anchorDate
 * @returns {string}
 */
export function renderCategoryDossier(group, anchorDate) {
  const lines = [
    `# wAIbi-sabi B-School GDPI Dossier — ${group.category}`,
    '',
    `> **Domain Track:** ${group.category} | **Stories:** ${group.count} | **Date Span:** ${group.minDate} to ${group.maxDate} | **Anchor Date:** ${anchorDate} | **Approx. Words:** ${group.wordCount.toLocaleString('en-US')}`,
    '',
    'This dossier is structured for **NotebookLM source ingestion** and **PDF study compilation**. Stories are ordered newest-first inside recency tiers so interview panels and AI briefing generators prioritize current market dynamics.',
    '',
    '## Recency Breakdown',
    '',
    '| Recency Tier | Story Count | Share |',
    '|---|---:|---:|',
  ];

  for (const bucket of RECENCY_BUCKETS) {
    const c = group.recencyCounts[bucket.id] ?? 0;
    const pct = group.count > 0 ? ((c / group.count) * 100).toFixed(1) : '0.0';
    lines.push(`| ${bucket.label} | ${c} | ${pct}% |`);
  }
  lines.push('');

  for (const bucket of RECENCY_BUCKETS) {
    const bucketItems = group.bucketed.get(bucket.id) ?? [];
    if (bucketItems.length === 0) continue;

    lines.push(`## ${bucket.label} (${bucketItems.length} stories)`, '');
    for (const [monthKey, monthItems] of groupByMonth(bucketItems)) {
      lines.push(`### ${formatMonthLabel(monthKey)} (${monthKey}) — ${monthItems.length} stories`, '');
      for (const item of monthItems) {
        lines.push(renderStoryMarkdown(item));
      }
    }
  }

  return lines.join('\n');
}

/**
 * Render a cross-domain digest containing stories from the last 90 days.
 * @param {ReturnType<typeof normalizeNewsEntries>} entries
 * @param {string} anchorDate
 * @returns {{ markdown: string, count: number }}
 */
export function renderLatest90DaysDigest(entries, anchorDate) {
  const recent = entries.filter((item) => {
    const bucket = classifyRecency(item.date, anchorDate);
    return bucket.id === '0-30d' || bucket.id === '31-90d';
  });

  const byCat = new Map();
  for (const item of recent) {
    if (!byCat.has(item.category)) byCat.set(item.category, []);
    byCat.get(item.category).push(item);
  }

  const lines = [
    '# wAIbi-sabi B-School GDPI Hot-Topics Digest (Last 90 Days)',
    '',
    `> **Window:** Last 90 days ending ${anchorDate} | **Total Stories:** ${recent.length} | **Domains:** ${byCat.size}`,
    '',
    'Use this single file in NotebookLM for cross-sector "Current Affairs & Macro Trends" synthesis, Audio Overviews, and mock panel questions.',
    '',
  ];

  for (const category of sortCategories([...byCat.keys()])) {
    const items = byCat.get(category);
    lines.push(`## ${category} (${items.length} stories)`, '');
    for (const item of items) {
      lines.push(renderStoryMarkdown(item));
    }
  }

  return { markdown: lines.join('\n'), count: recent.length };
}

/**
 * Render the master INDEX.md manifest summarizing all generated dossiers.
 */
export function renderIndexManifest({ anchorDate, totalEntries, minDate, maxDate, groups, digestCount }) {
  const totalWords = groups.reduce((acc, g) => acc + g.wordCount, 0);
  const lines = [
    '# wAIbi-sabi 708-Story GDPI Dossier Index',
    '',
    `- **Source:** \`site/src/data/news.json\``,
    `- **Total Stories:** ${totalEntries}`,
    `- **Date Coverage:** ${minDate} to ${maxDate} (Recency anchor: ${anchorDate})`,
    `- **Total Corpus Words:** ${totalWords.toLocaleString('en-US')}`,
    '',
    '## Generated Files',
    '',
    '| File | Scope | Stories | Date Range | Approx. Words |',
    '|---|---|---:|---|---:|',
    `| \`00-latest-90-days-digest.md\` | All Domains (Last 90 Days) | ${digestCount} | Last 90d → ${anchorDate} | — |`,
  ];

  for (const g of groups) {
    lines.push(
      `| \`${g.filename}\` | ${g.category} | ${g.count} | ${g.minDate} to ${g.maxDate} | ${g.wordCount.toLocaleString('en-US')} |`
    );
  }

  lines.push(
    '',
    '## Recency Matrix by Domain',
    '',
    '| Domain | 0–30d | 31–90d | 91–180d | 180d+ | Total |',
    '|---|---:|---:|---:|---:|---:|'
  );

  for (const g of groups) {
    lines.push(
      `| ${g.category} | ${g.recencyCounts['0-30d']} | ${g.recencyCounts['31-90d']} | ${g.recencyCounts['91-180d']} | ${g.recencyCounts['180d+']} | ${g.count} |`
    );
  }

  lines.push('');
  return lines.join('\n');
}

/**
 * Parse CLI arguments cleanly without external libraries.
 * @param {string[]} argv
 */
export function parseCliArgs(argv) {
  const opts = {
    dryRun: false,
    test: false,
    help: false,
    outDir: DEFAULT_OUT_DIR,
    newsPath: DEFAULT_NEWS_PATH,
    category: null,
    since: null,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--dry-run') opts.dryRun = true;
    else if (arg === '--test') opts.test = true;
    else if (arg === '--help' || arg === '-h') opts.help = true;
    else if (arg === '--out' && argv[i + 1]) opts.outDir = resolve(argv[++i]);
    else if (arg === '--news' && argv[i + 1]) opts.newsPath = resolve(argv[++i]);
    else if (arg === '--category' && argv[i + 1]) opts.category = argv[++i];
    else if (arg === '--since' && argv[i + 1]) opts.since = argv[++i];
    else throw new Error(`Unknown or incomplete argument: ${arg}`);
  }

  if (opts.since && parseIsoDateUtc(opts.since) === null) {
    throw new Error(`Invalid --since date "${opts.since}". Expected YYYY-MM-DD.`);
  }

  return opts;
}

/**
 * Build the complete dossier generation plan in memory (shared by --dry-run and disk write).
 */
export function buildDossierPlan({ newsPath = DEFAULT_NEWS_PATH, category = null, since = null } = {}) {
  let entries = loadNews(newsPath);

  if (category) {
    const target = category.trim().toLowerCase();
    entries = entries.filter((e) => e.category.toLowerCase() === target);
  }
  if (since) {
    entries = entries.filter((e) => e.date >= since);
  }

  if (entries.length === 0) {
    throw new Error('No news entries matched the requested filters.');
  }

  const sortedDates = entries.map((e) => e.date).sort();
  const minDate = sortedDates[0];
  const maxDate = sortedDates[sortedDates.length - 1];
  const anchorDate = maxDate;

  const groups = groupNewsByCategoryAndRecency(entries, anchorDate);
  const digest = renderLatest90DaysDigest(entries, anchorDate);
  const indexMarkdown = renderIndexManifest({
    anchorDate,
    totalEntries: entries.length,
    minDate,
    maxDate,
    groups,
    digestCount: digest.count,
  });

  const files = [
    { filename: 'INDEX.md', content: indexMarkdown, count: entries.length, label: 'Manifest Index' },
    { filename: '00-latest-90-days-digest.md', content: digest.markdown, count: digest.count, label: 'All Domains (Last 90 Days)' },
    ...groups.map((g) => ({
      filename: g.filename,
      content: renderCategoryDossier(g, anchorDate),
      count: g.count,
      label: g.category,
    })),
  ];

  return {
    totalEntries: entries.length,
    minDate,
    maxDate,
    anchorDate,
    groups,
    digestCount: digest.count,
    files,
  };
}

function printSummary(plan, outDir, dryRun) {
  const mode = dryRun ? 'DRY RUN (no files written)' : `WRITTEN to ${outDir}`;
  console.log(`\n=== wAIbi-sabi B-School News Dossier Generator [${mode}] ===`);
  console.log(`Total Entries : ${plan.totalEntries}`);
  console.log(`Date Range    : ${plan.minDate} -> ${plan.maxDate} (anchor: ${plan.anchorDate})`);
  console.log(`90-Day Digest : ${plan.digestCount} stories\n`);

  console.log('Domain Breakdown (Category x Recency):');
  for (const g of plan.groups) {
    console.log(
      `  - ${g.category.padEnd(20)} | total: ${String(g.count).padStart(3)} | ` +
        `0-30d: ${String(g.recencyCounts['0-30d']).padStart(3)} | ` +
        `31-90d: ${String(g.recencyCounts['31-90d']).padStart(3)} | ` +
        `91-180d: ${String(g.recencyCounts['91-180d']).padStart(3)} | ` +
        `180d+: ${String(g.recencyCounts['180d+']).padStart(3)} | ` +
        `words: ${String(g.wordCount).padStart(6)} -> ${g.filename}`
    );
  }

  console.log('\nPlanned Output Files:');
  for (const f of plan.files) {
    const kb = (Buffer.byteLength(f.content, 'utf8') / 1024).toFixed(1);
    console.log(`  - ${join(outDir, f.filename)} (${f.count} stories, ${kb} KB)`);
  }
}

function runSelfTests() {
  const tests = [];
  const t = (name, fn) => tests.push({ name, fn });

  t('slugifyCategory normalizes spaces and punctuation', () => {
    assert.equal(slugifyCategory('Product Management'), 'product-management');
    assert.equal(slugifyCategory('Consulting'), 'consulting');
  });

  t('classifyRecency assigns expected buckets relative to anchor date', () => {
    assert.equal(classifyRecency('2026-11-28', '2026-11-28').id, '0-30d');
    assert.equal(classifyRecency('2026-10-29', '2026-11-28').id, '0-30d');
    assert.equal(classifyRecency('2026-10-28', '2026-11-28').id, '31-90d');
    assert.equal(classifyRecency('2026-07-15', '2026-11-28').id, '91-180d');
    assert.equal(classifyRecency('2025-10-18', '2026-11-28').id, '180d+');
  });

  t('normalizeNewsEntries sorts newest first and breaks date ties by headline', () => {
    const normalized = normalizeNewsEntries([
      { headline: 'Beta Story', date: '2026-11-01', category: 'Finance', summary: 'S2', angle: 'A2', source: null },
      { headline: 'Alpha Story', date: '2026-11-01', category: 'Finance', summary: 'S1', angle: 'A1', source: 'https://example.com' },
      { headline: 'Newest Story', date: '2026-11-20', category: 'Consulting', summary: 'S3', angle: 'A3', source: 'https://example.com/3' },
    ]);
    assert.deepEqual(
      normalized.map((n) => n.headline),
      ['Newest Story', 'Alpha Story', 'Beta Story']
    );
  });

  t('groupNewsByCategoryAndRecency preserves canonical domain ordering and sums', () => {
    const sample = normalizeNewsEntries([
      { headline: 'PM 1', date: '2026-11-25', category: 'Product Management', summary: 's', angle: 'a', source: null },
      { headline: 'Consult 1', date: '2026-11-28', category: 'Consulting', summary: 's', angle: 'a', source: null },
      { headline: 'Consult 2', date: '2026-01-10', category: 'Consulting', summary: 's', angle: 'a', source: null },
    ]);
    const groups = groupNewsByCategoryAndRecency(sample, '2026-11-28');
    assert.deepEqual(groups.map((g) => g.category), ['Consulting', 'Product Management']);
    assert.equal(groups[0].recencyCounts['0-30d'], 1);
    assert.equal(groups[0].recencyCounts['180d+'], 1);
    assert.equal(groups[0].filename, '01-consulting-dossier.md');
    assert.equal(groups[1].filename, '02-product-management-dossier.md');
  });

  t('renderCategoryDossier and renderLatest90DaysDigest emit structured Markdown', () => {
    const sample = normalizeNewsEntries([
      { headline: 'Recent Deal', date: '2026-11-20', category: 'Finance', summary: 'Bank raised capital.', angle: 'ROE impact.', source: 'https://example.com/deal' },
      { headline: 'Old Deal', date: '2025-11-01', category: 'Finance', summary: 'Old deal summary.', angle: 'Old angle.', source: 'https://example.com/old' },
    ]);
    const [finGroup] = groupNewsByCategoryAndRecency(sample, '2026-11-28');
    const md = renderCategoryDossier(finGroup, '2026-11-28');
    assert.ok(md.includes('# wAIbi-sabi B-School GDPI Dossier — Finance'));
    assert.ok(md.includes('## Last 30 Days (0–30d) (1 stories)'));
    assert.ok(md.includes('## Archive (180+ Days) (1 stories)'));
    assert.ok(md.includes('**GDPI & Interview Panel Angle:** ROE impact.'));

    const digest = renderLatest90DaysDigest(sample, '2026-11-28');
    assert.equal(digest.count, 1);
    assert.ok(digest.markdown.includes('Recent Deal'));
    assert.ok(!digest.markdown.includes('Old Deal'));
  });

  t('live site/src/data/news.json builds cleanly into 5 domain dossiers + digest + index', () => {
    const plan = buildDossierPlan({ newsPath: DEFAULT_NEWS_PATH });
    assert.equal(plan.totalEntries, 708);
    assert.equal(plan.groups.length, 5);
    const sumByGroups = plan.groups.reduce((acc, g) => acc + g.count, 0);
    assert.equal(sumByGroups, 708);
    assert.equal(plan.files.length, 7);
    for (const g of plan.groups) {
      const bucketSum = Object.values(g.recencyCounts).reduce((a, b) => a + b, 0);
      assert.equal(bucketSum, g.count, `Bucket sum mismatch for ${g.category}`);
    }
  });

  let passed = 0;
  for (const { name, fn } of tests) {
    fn();
    passed += 1;
    console.log(`PASS: ${name}`);
  }
  console.log(`\nAll ${passed}/${tests.length} self-tests passed.`);
}

function main() {
  const opts = parseCliArgs(process.argv.slice(2));

  if (opts.help) {
    console.log(
      [
        'Usage: node site/scripts/generate-news-dossier.mjs [options]',
        '',
        'Options:',
        '  --dry-run             Print domain breakdown and planned files without writing',
        '  --out <dir>           Output directory (default: site/dist-dossiers)',
        '  --category <name>     Filter to a single category (e.g. Finance)',
        '  --since <YYYY-MM-DD>  Include entries on or after this date',
        '  --test                Run unit tests and live dataset invariants',
        '  -h, --help            Show this help message',
      ].join('\n')
    );
    return;
  }

  if (opts.test) {
    runSelfTests();
    return;
  }

  const plan = buildDossierPlan({
    newsPath: opts.newsPath,
    category: opts.category,
    since: opts.since,
  });

  if (!opts.dryRun) {
    mkdirSync(opts.outDir, { recursive: true });
    for (const file of plan.files) {
      writeFileSync(join(opts.outDir, file.filename), file.content, 'utf8');
    }
  }

  printSummary(plan, opts.outDir, opts.dryRun);
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  main();
}
