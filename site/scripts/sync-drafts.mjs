/**
 * Google Sheet → Notion Article Production.
 *
 *   node site/scripts/sync-drafts.mjs [--commit]
 *
 * Two jobs, both keyed on the stable Sheet Key (site/harness/rules.mjs sheetKey):
 *
 * 1. NEW DRAFTS — every row in the Drafts, Case Studies and Talks tabs whose key
 *    is not yet on a Notion row (and whose title isn't either, for rows filed
 *    before keys existed) is imported at Draft Ready. Rows whose Status column
 *    is anything other than empty/"Ready" are skipped, so the owner can park a
 *    row by typing "Hold".
 *
 * 2. REPAIRS — every row in the Repair Outbox tab whose key matches a Notion row
 *    at Needs Revision with fewer Repair Attempts than the row's Attempt number
 *    replaces that Notion page (archive-and-recreate) at Draft Ready, with
 *    Repair Attempts = Attempt. The publish run then re-checks it like any draft.
 *
 * The Sheet is read anonymously through its public CSV export (it is shared
 * "anyone with the link: Viewer"), so this needs no Google credential.
 */
import { api, PRODUCTION_DS, queryAll, plain } from './lib/notion.mjs';
import { importDraft } from './import-draft.mjs';
import { SHEET, TRACKS, REPAIR } from '../harness/registry.mjs';
import { sheetKey } from '../harness/rules.mjs';

const sheetId = process.env.GOOGLE_SHEET_ID || SHEET.id;
const commit = process.argv.includes('--commit');

export function parseCSV(text) {
  const out = [];
  let row = [], f = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i], n = text[i + 1];
    if (c === '"') { if (q && n === '"') { f += '"'; i++; } else q = !q; }
    else if (c === ',' && !q) { row.push(f); f = ''; }
    else if ((c === '\r' || c === '\n') && !q) {
      if (c === '\r' && n === '\n') i++;
      row.push(f); f = '';
      if (row.some((x) => x.trim())) out.push(row);
      row = [];
    } else f += c;
  }
  if (f || row.length) { row.push(f); if (row.some((x) => x.trim())) out.push(row); }
  return out;
}

/** Reads a tab as an array of {Header: value} objects using the registry's column names. */
export async function readTab(tab) {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tab)}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const rows = parseCSV(await res.text());
  if (rows.length < 2) return [];
  const headers = rows[0].map((h) => h.trim());
  // gviz returns the first tab when a tab name is unknown; refuse a tab whose
  // headers don't match what the registry says it should hold.
  const want = SHEET.tabs[tab]?.columns ?? [];
  if (want.length && !want.slice(0, 3).every((c) => headers.includes(c))) return [];
  return rows.slice(1).map((r, i) => Object.fromEntries([['_row', i + 2], ...headers.map((h, j) => [h, (r[j] ?? '').trim()])]));
}

console.log('── Sheet → Notion draft sync ' + (commit ? '' : '(dry run)'));

const prod = await queryAll(PRODUCTION_DS);
const keyOf = (p) => plain(p.properties['Sheet Key']?.rich_text).trim();
const byKey = new Map(prod.filter(keyOf).map((p) => [keyOf(p), p]));
const titles = new Set(prod.map((p) => plain(p.properties.Name?.title).trim().toLowerCase()));

// Radar rows give the Reader Question / keywords when a draft lacks them.
const radar = await readTab('Radar');
const radarFor = (title, radarTitle) => {
  if (radarTitle) {
    const exact = radar.find((r) => r.Title === radarTitle);
    if (exact) return exact;
  }
  // Fallback for rows written before the Radar Title column existed.
  const t = title.toLowerCase();
  return radar.find((r) => r.Title && (t.includes(r.Title.toLowerCase().slice(0, 25)) || r.Title.toLowerCase().includes(t.slice(0, 25))));
};

// 1. New drafts
let imported = 0;
for (const tab of ['Drafts', 'Case Studies', 'Talks']) {
  for (const r of await readTab(tab)) {
    if (!r.Title || !r.Date) continue;
    const key = sheetKey(tab, r.Date, r.Title);
    if (byKey.has(key) || titles.has(r.Title.toLowerCase()) || titles.has(r.Title.slice(0, 70).toLowerCase())) continue;
    if (r.Status && !/^ready$/i.test(r.Status)) {
      console.log(`· skip ${key} "${r.Title}" — Status is "${r.Status}"`);
      continue;
    }
    if (!r.Draft) {
      console.log(`· skip ${key} "${r.Title}" — Draft cell is empty`);
      continue;
    }
    const rr = radarFor(r.Title, r['Radar Title']);
    const track = TRACKS.find((t) => t.notion.toLowerCase() === (r.Track || '').toLowerCase())?.notion ?? TRACKS.find((t) => t.tab === tab)?.notion;
    await importDraft(r.Draft, {
      key,
      commit,
      defaults: { title: r.Title, track, question: rr?.['Reader Question'] ?? '', keywords: rr?.Keywords ?? '' },
    });
    imported++;
  }
}

// 2. Repairs
let repaired = 0;
const appliedThisRun = new Set(); // byKey is a snapshot; never apply two outbox rows for one key in a run
for (const r of await readTab('Repair Outbox')) {
  const attempt = Number(r.Attempt);
  if (!r.Key || !attempt || !r.Draft || appliedThisRun.has(r.Key)) continue;
  const page = byKey.get(r.Key);
  if (!page) { console.log(`· repair ${r.Key} — no Notion row with that key (already published, or never imported)`); continue; }
  const status = page.properties['Draft Status']?.select?.name;
  const done = page.properties['Repair Attempts']?.number ?? 0;
  if (attempt <= done) continue; // already applied
  if (status !== 'Needs Revision') { console.log(`· repair ${r.Key} — row is "${status}", not Needs Revision; ignoring`); continue; }
  if (attempt > REPAIR.maxAttempts) { console.log(`· repair ${r.Key} — attempt ${attempt} exceeds the limit of ${REPAIR.maxAttempts}; ignoring`); continue; }

  const p = page.properties;
  const carry = {};
  if (p['Source Idea']?.relation?.length) carry['Source Idea'] = { relation: p['Source Idea'].relation.map(({ id }) => ({ id })) };
  if (p['Promoted On']?.date) carry['Promoted On'] = { date: { start: p['Promoted On'].date.start } };
  if (p['SEO Keywords']?.rich_text?.length) carry['SEO Keywords'] = { rich_text: p['SEO Keywords'].rich_text.map((t) => ({ type: 'text', text: { content: t.plain_text } })) };
  carry['Blocked Reason'] = {
    rich_text: [{ type: 'text', text: { content: `Repair attempt ${attempt} applied. Changed: ${r.Changed || '-'}. Not fixed: ${r['Not Fixed'] || '-'}`.slice(0, 2000) } }],
  };
  await importDraft(r.Draft, {
    key: r.Key,
    attempt,
    replace: page.id,
    carry,
    commit,
    defaults: { title: r.Title || plain(p.Name?.title), track: p.Track?.select?.name, question: plain(p['Reader Question']?.rich_text) },
  });
  appliedThisRun.add(r.Key);
  repaired++;
}

console.log(`\n${imported} new draft(s), ${repaired} repair(s) ${commit ? 'applied' : 'would be applied'}.`);
