/**
 * Regenerates every file derived from site/harness/registry.mjs.
 *
 *   node site/harness/generate.mjs           # write
 *   node site/harness/generate.mjs --check   # exit 1 if anything is stale (run by `npm run build`)
 *
 * Outputs:
 *   gas/Registry.js                                   — the Conductor's copy of the rules
 *   gemini/skills/waibi-house-style/rules.md          — caps, tracks, banned words, formatting
 *   gemini/skills/waibi-sheet-contract/sheet.md       — tabs, columns, keys, who writes what
 *   gemini/skills/waibi-repair/failure-codes.md       — every failure code and its fix
 *   gemini/skills/waibi-artwork/tokens.md             — palette tokens per track
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as R from './registry.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const check = process.argv.includes('--check');
const HEADER = '<!-- GENERATED from site/harness/registry.mjs by site/harness/generate.mjs. Do not edit; edit the registry and regenerate. -->\n\n';

const files = {};

files['gas/Registry.js'] =
  '// GENERATED from site/harness/registry.mjs by site/harness/generate.mjs — do not edit.\n' +
  'var REGISTRY = ' +
  JSON.stringify(
    { REPO: R.REPO, NOTION: R.NOTION, SHEET: R.SHEET, KEY_RULE: R.KEY_RULE, REPAIR: R.REPAIR, TASKS: R.TASKS, FAILURES: R.FAILURES, TRACKS: R.TRACKS },
    null,
    2
  ) +
  ';\n';

const table = (head, rows) => [`| ${head.join(' | ')} |`, `|${head.map(() => '---').join('|')}|`, ...rows.map((r) => `| ${r.join(' | ')} |`)].join('\n');

files['gemini/skills/waibi-house-style/rules.md'] =
  HEADER +
  '# wAIbi-sabi hard rules (enforced by the publishing system)\n\n' +
  '## Character caps\n\n' +
  table(['Field', 'Maximum'], [
    ['Title', `${R.CAPS.title} characters`],
    ['Meta description', `${R.CAPS.description} characters`],
    ['Reader Question', `${R.CAPS.question} characters`],
    ['Body length', `${R.CAPS.wordsMin}–${R.CAPS.wordsMax} words (aim for 1,400–1,800)`],
    ['Sources', `at least ${R.CAPS.minSources} distinct links in a "## Sources" section`],
  ]) +
  '\n\n## Tracks\n\n' +
  table(['Track (exact value)', 'Artwork accent token', 'Sheet tab'], R.TRACKS.map((t) => [t.notion, `{{${t.accent}}}`, t.tab])) +
  '\n\n## Banned words\n\n' +
  R.STYLE.bannedWords.join(', ') +
  '\n\nBanned openings: ' +
  R.STYLE.bannedOpenings.map((s) => `"${s}…"`).join(', ') +
  '\n\nNo em dashes (—) anywhere.\n\n' +
  '## What gets a draft rejected automatically\n\n' +
  Object.entries(R.FAILURES)
    .filter(([, f]) => f.class === 'block' && !f.noRepair)
    .map(([c, f]) => `- **${c}** — ${f.summary}. ${f.playbook}`)
    .join('\n') +
  '\n';

files['gemini/skills/waibi-sheet-contract/sheet.md'] =
  HEADER +
  `# The Google Sheet contract\n\nSheet ID: \`${R.SHEET.id}\`\nhttps://docs.google.com/spreadsheets/d/${R.SHEET.id}/edit\n\n` +
  '**Agent-owned** tabs: Gemini tasks only ever APPEND new rows, never edit or delete existing ones.\n' +
  '**Code-owned** tabs (grey): rewritten every 15 minutes by the Conductor. Read them; never write to them.\n\n' +
  table(
    ['Tab', 'Owner', 'Written by', 'Columns, in order'],
    Object.entries(R.SHEET.tabs).map(([name, t]) => [name, t.owner, t.writer ?? 'Conductor', t.columns.join(' · ')])
  ) +
  '\n\n## Row keys\n\n' +
  `Every article row gets a key like \`DR-20261111-3fa9c2\` (${R.KEY_RULE.format}), computed by code from the tab, the Date cell and the Title as first written. ` +
  'Agents never compute keys. The Repairer copies the Key from the Repair Queue row it is fixing.\n\n' +
  '## Runs tab\n\nEvery task appends exactly one row when it finishes: ' +
  R.SHEET.tabs.Runs.columns.join(' | ') +
  '. Result is "ok", "partial" or "failed". Task names:\n\n' +
  table(['Task', 'Name to write', 'Scheduled (IST)'], R.TASKS.map((t) => [t.label, t.name, t.at])) +
  '\n';

files['gemini/skills/waibi-repair/failure-codes.md'] =
  HEADER +
  `# Failure codes and how to fix each one\n\nA row in the Repair Queue lists one or more codes. Fix every code listed, and nothing else.\nAfter ${R.REPAIR.maxAttempts} failed repairs a person takes over.\n\n` +
  Object.entries(R.FAILURES)
    .map(([c, f]) => `## ${c} — ${f.summary}\n\nSeverity: ${f.class === 'block' ? 'blocks publishing' : f.class === 'warn' ? 'warning only (fix it if cheap while you are there; never cut or rewrite content for it)' : 'fixed automatically'}${f.noRepair ? ' · NOT repairable by you: skip this row' : ''}\n\n${f.playbook}\n`)
    .join('\n');

files['gemini/skills/waibi-artwork/tokens.md'] =
  HEADER +
  '# Artwork palette tokens\n\nUse ONLY these placeholders inside the SVG; never hex colours.\n\n' +
  R.ART_TOKENS.map((t) => `- \`{{${t}}}\``).join('\n') +
  '\n\n## Accent per track\n\n' +
  table(['Track', 'Accent'], R.TRACKS.map((t) => [t.notion, `{{${t.accent}}}`])) +
  '\n';

// TypeScript files the site needs at build time can't import the registry
// cleanly, so verify they agree with it instead.
const drift = [];
const cfg = readFileSync(join(root, 'site/src/content.config.ts'), 'utf8');
for (const [field, cap] of [['title', R.CAPS.title], ['description', R.CAPS.description], ['question', R.CAPS.question]]) {
  if (!new RegExp(`${field}:\\s*z\\.string\\(\\)\\.max\\(${cap}\\)`).test(cfg)) drift.push(`content.config.ts: ${field} cap is not ${cap}`);
}
const tracksTs = readFileSync(join(root, 'site/src/data/tracks.ts'), 'utf8');
for (const t of R.TRACKS) {
  if (!new RegExp(`id: '${t.id}',[\\s\\S]{0,80}?accent: '${t.accent}'`).test(tracksTs)) drift.push(`tracks.ts: ${t.id} accent is not ${t.accent}`);
}
if (drift.length) {
  console.error('harness: the site disagrees with site/harness/registry.mjs\n  ' + drift.join('\n  '));
  process.exit(1);
}

let stale = [];
for (const [rel, content] of Object.entries(files)) {
  const path = join(root, rel);
  const current = existsSync(path) ? readFileSync(path, 'utf8').replace(/\r\n/g, '\n') : null;
  if (current === content) continue;
  stale.push(rel);
  if (!check) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content);
  }
}
if (check && stale.length) {
  console.error(`harness: generated files are stale — run node site/harness/generate.mjs\n  ${stale.join('\n  ')}`);
  process.exit(1);
}
console.log(stale.length ? `harness: wrote ${stale.join(', ')}` : 'harness: generated files up to date');
