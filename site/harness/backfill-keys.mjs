/**
 * One-time (re-runnable) migration: writes `Sheet Key` onto Article Production
 * rows that were imported from the Sheet before keys existed, matched by title.
 * Rows from the Claude era have no Sheet row and stay keyless on purpose, which
 * keeps them out of the Repair Queue.
 *
 *   node site/harness/backfill-keys.mjs [--commit]
 */
import { api, PRODUCTION_DS, queryAll, plain } from '../scripts/lib/notion.mjs';
import { sheetKey } from './rules.mjs';
import { SHEET } from './registry.mjs';

const commit = process.argv.includes('--commit');
const parseCSV = (t) => { const o = []; let r = [], f = '', q = false; for (let i = 0; i < t.length; i++) { const c = t[i], n = t[i + 1]; if (c === '"') { if (q && n === '"') { f += '"'; i++; } else q = !q; } else if (c === ',' && !q) { r.push(f); f = ''; } else if ((c === '\n' || c === '\r') && !q) { if (c === '\r' && n === '\n') i++; r.push(f); f = ''; if (r.some((x) => x.trim())) o.push(r); r = []; } else f += c; } if (f || r.length) { r.push(f); o.push(r); } return o; };

const byTitle = new Map();
for (const tab of ['Drafts', 'Case Studies', 'Talks']) {
  const res = await fetch(`https://docs.google.com/spreadsheets/d/${SHEET.id}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tab)}`);
  const rows = parseCSV(await res.text());
  const h = rows[0].map((x) => x.trim());
  for (const r of rows.slice(1)) {
    const date = r[h.indexOf('Date')]?.trim(), title = r[h.indexOf('Title')]?.trim();
    if (date && title) byTitle.set(title.slice(0, 70).toLowerCase(), sheetKey(tab, date, title));
  }
}

let n = 0;
for (const p of await queryAll(PRODUCTION_DS)) {
  if (plain(p.properties['Sheet Key']?.rich_text).trim()) continue;
  const key = byTitle.get(plain(p.properties.Name?.title).trim().slice(0, 70).toLowerCase());
  if (!key) continue;
  console.log(`${key}  ${plain(p.properties.Name?.title)}`);
  if (commit) await api(`/pages/${p.id}`, { method: 'PATCH', body: { properties: { 'Sheet Key': { rich_text: [{ type: 'text', text: { content: key } }] } } } });
  n++;
}
console.log(`${n} row(s) ${commit ? 'keyed' : 'would be keyed'}.`);
