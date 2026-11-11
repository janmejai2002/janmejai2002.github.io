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
 *    VERIFY FIRST: the repaired draft is gated before anything is applied. It is
 *    refused (attempt counted, reason on the row, page untouched) if it adds a
 *    blocking code, or changes a section no finding named, when every code on
 *    the row is tied to a section (`scope` in registry.mjs).
 *
 * 3. STALE CODES — a Needs Revision row whose Blocked Reason was stamped by older
 *    rules (or not stamped) is re-gated on its current draft with today's rules,
 *    so the Repairer never gets a code that no longer fires. If nothing blocking
 *    is left it goes back to Draft Ready and publishes.
 *
 * The Sheet is read anonymously through its public CSV export (it is shared
 * "anyone with the link: Viewer"), so this needs no Google credential.
 */
import { api, PRODUCTION_DS, queryAll, plain } from './lib/notion.mjs';
import { importDraft } from './import-draft.mjs';
import { SHEET, TRACKS, REPAIR, FAILURES } from '../harness/registry.mjs';
import { sheetKey, formatFindings, findingsJson, RULES_VERSION, RULES_STAMP_RE } from '../harness/rules.mjs';
import { gateSheetDraft } from './lib/gate.mjs';
import { verifyRepair, rejectedFor, churnLine, patchCount, applyPatches, draftAt } from './lib/repair.mjs';
import { rich } from '../harness/md-to-notion.mjs';

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

/** Writes properties to a Notion row, or says what it would write. */
async function patch(page, properties, label) {
  if (!commit) return console.log(`  (dry run) would ${label}`);
  try {
    await api(`/pages/${page.id}`, { method: 'PATCH', body: { properties } });
    console.log(`  ✓ ${label}`);
  } catch (err) {
    console.error(`::warning::could not ${label}: ${err.message.split('\n')[0]}`);
  }
}
const text = (s) => ({ rich_text: [{ type: 'text', text: { content: String(s).slice(0, 2000) } }] });
const gateDefaults = (p, title) => ({ title: title || plain(p.Name?.title), track: p.Track?.select?.name, question: plain(p['Reader Question']?.rich_text) });

// 1. New drafts (and the original draft of every keyed row, for 2 and 3)
const sources = new Map();
const testKeys = new Set(); // Status = REPAIR.testStatus: repair loop dry runs, never applied
let imported = 0;
let seeded = 0;
const testTabKeys = new Set();
for (const tab of ['Drafts', 'Case Studies', 'Talks', REPAIR.testTab]) {
  for (const r of await readTab(tab)) {
    if (!r.Title || !r.Date) continue;
    const key = sheetKey(tab, r.Date, r.Title);
    if (r.Draft) sources.set(key, r.Draft);
    const isTest = tab === REPAIR.testTab || (r.Status || '').toLowerCase() === REPAIR.testStatus.toLowerCase();
    if (isTest) testKeys.add(key);
    if (tab === REPAIR.testTab) testTabKeys.add(key);
    if (byKey.has(key) || titles.has(r.Title.toLowerCase()) || titles.has(r.Title.slice(0, 70).toLowerCase())) continue;
    // A new repair test: create its Notion row as if the publish run had just
    // blocked it, so the Conductor queues it. It can never be applied (see 2).
    if (isTest && r.Draft) {
      const defaults = { title: r.Title, track: r.Track || 'Technical' };
      const { findings } = gateSheetDraft(r.Draft, defaults);
      console.log(`· test ${key} "${r.Title}" → Needs Revision [${findings.map((f) => f.code).join(', ')}]`);
      seeded++;
      const { page } = await importDraft(r.Draft, { key, commit, status: 'Needs Revision', defaults });
      if (page)
        await patch(
          page,
          {
            'Failure Codes': { multi_select: [...new Set(findings.map((f) => f.code))].map((name) => ({ name })) },
            'Blocked Reason': text(formatFindings(findings)),
            Findings: { rich_text: rich(findingsJson(findings)) },
            'Repair Attempts': { number: 0 },
          },
          `set findings on test ${key}`
        );
      continue;
    }
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

const outbox = await readTab('Repair Outbox');
const patches = await readTab('Repair Patches');
const rejectedOf = (p) => rejectedFor(plain(p['Rejected Attempts']?.rich_text), plain(p['Blocked Reason']?.rich_text));
/** The draft a row holds after every accepted attempt before `attempt` (lib/repair.mjs draftAt). */
const draftBefore = (key, attempt, rejected = []) => draftAt({ source: sources.get(key), outbox, patches, key, upTo: attempt - 1, rejected });

// 2. Repairs — verified before they are applied
let repaired = 0;
let refused = 0;
const handled = new Set(); // byKey is a snapshot; never act twice on one key in a run
for (const r of outbox) {
  const attempt = Number(r.Attempt);
  if (!r.Key || !attempt || !r.Draft || handled.has(r.Key)) continue;
  const page = byKey.get(r.Key);
  if (!page) { console.log(`· repair ${r.Key} — no Notion row with that key (already published, or never imported)`); continue; }
  const status = page.properties['Draft Status']?.select?.name;
  const done = page.properties['Repair Attempts']?.number ?? 0;
  if (attempt <= done) continue; // already applied
  if (status !== 'Needs Revision') { console.log(`· repair ${r.Key} — row is "${status}", not Needs Revision; ignoring`); continue; }
  if (attempt > REPAIR.maxAttempts) { console.log(`· repair ${r.Key} — attempt ${attempt} exceeds the limit of ${REPAIR.maxAttempts}; ignoring`); continue; }
  handled.add(r.Key);

  const p = page.properties;
  const rejected = rejectedOf(p);
  const rowCodes = (p['Failure Codes']?.multi_select ?? []).map((o) => o.name);
  const prevDraft = draftBefore(r.Key, attempt, rejected);
  const refuse = async (why, prevFindings) => {
    refused++;
    const list = [...rejected, attempt].join(', ');
    console.log(`  ✗ refused: ${why}`);
    await patch(
      page,
      {
        'Blocked Reason': text(`${REPAIR.rejectedPrefix} ${list}): ${why}. Start again from the previous draft; fix only these: ${formatFindings(prevFindings)}`),
        'Rejected Attempts': text(list),
        Findings: { rich_text: rich(findingsJson(prevFindings)) },
        'Repair Attempts': { number: attempt },
      },
      `mark ${r.Key} attempt ${attempt} refused`
    );
  };

  // Section patches: rebuild the full draft from the previous one by Section ID.
  let nextDraft = r.Draft;
  const expected = patchCount(r.Draft);
  if (expected !== null) {
    const mine = patches.filter((x) => x.Key === r.Key && Number(x.Attempt) === attempt);
    if (mine.length < expected) { console.log(`· repair ${r.Key} attempt ${attempt} — ${mine.length}/${expected} patch rows so far; waiting`); handled.delete(r.Key); continue; }
    if (!prevDraft) { console.log(`· repair ${r.Key} attempt ${attempt} — patches, but no earlier draft to apply them to; leaving it`); continue; }
    const merged = applyPatches(prevDraft, mine);
    if (merged.unknown.length) {
      await refuse(`patch(es) for section id(s) not in the draft: ${merged.unknown.join(', ')}`, gateSheetDraft(prevDraft, gateDefaults(p)).findings);
      continue;
    }
    nextDraft = merged.draft;
    console.log(`  repair ${r.Key} attempt ${attempt}: ${mine.length} section patch(es) applied to the previous draft`);
  }

  if (testKeys.has(r.Key) && !prevDraft) { console.log(`  ◇ test row ${r.Key} has no draft to compare against; leaving it`); continue; }
  let churn = '';
  if (prevDraft) {
    const v = verifyRepair(prevDraft, nextDraft, gateDefaults(p), rowCodes, r.Title);
    churn = churnLine(v.churn);
    console.log(`  repair ${r.Key} attempt ${attempt}: ${churn}`);
    if (testKeys.has(r.Key)) {
      const verdict = v.ok ? 'WOULD BE APPLIED' : `WOULD BE REFUSED: ${v.why}`;
      console.log(`  ◇ test row — ${verdict}; parking at ${REPAIR.testParkStatus}, not applying`);
      await patch(
        page,
        {
          'Blocked Reason': text(`TEST RUN (not applied). Attempt ${attempt} ${verdict}. Churn: ${churn}. Gate after repair: ${formatFindings(v.next.findings) || 'clean'}`),
          'Repair Attempts': { number: attempt },
          'Draft Status': { select: { name: REPAIR.testParkStatus } },
        },
        `record test result for ${r.Key}`
      );
      continue;
    }
    if (!v.ok) {
      await refuse(v.why, v.prev.findings);
      continue;
    }
  } else {
    console.log(`  repair ${r.Key} attempt ${attempt}: no earlier draft in the Sheet to compare against; applying unverified`);
  }

  const carry = {};
  if (p['Source Idea']?.relation?.length) carry['Source Idea'] = { relation: p['Source Idea'].relation.map(({ id }) => ({ id })) };
  if (p['Promoted On']?.date) carry['Promoted On'] = { date: { start: p['Promoted On'].date.start } };
  if (p['SEO Keywords']?.rich_text?.length) carry['SEO Keywords'] = { rich_text: p['SEO Keywords'].rich_text.map((t) => ({ type: 'text', text: { content: t.plain_text } })) };
  if (rejected.length) carry['Rejected Attempts'] = text(rejected.join(', '));
  carry['Blocked Reason'] = text(`Repair attempt ${attempt} applied. Changed: ${r.Changed || '-'}. Not fixed: ${r['Not Fixed'] || '-'}${churn ? `. Churn: ${churn}` : ''}`);
  await importDraft(nextDraft, {
    key: r.Key,
    attempt,
    replace: page.id,
    carry,
    commit,
    defaults: { ...gateDefaults(p, r.Title) },
  });
  repaired++;
}

// 3. Stale codes — re-gate Needs Revision rows checked by older rules
let regated = 0;
for (const page of prod) {
  const key = keyOf(page);
  const p = page.properties;
  if (!key || handled.has(key) || p['Draft Status']?.select?.name !== 'Needs Revision') continue;
  const reason = plain(p['Blocked Reason']?.rich_text);
  if (RULES_STAMP_RE.exec(reason)?.[1] === RULES_VERSION) continue;
  if (reason.startsWith(REPAIR.rejectedPrefix)) continue; // a refusal: the codes in it are current by construction
  const codes = (p['Failure Codes']?.multi_select ?? []).map((o) => o.name);
  // Only codes this gate can see. Build-time codes need the build; G-BLOCK is a
  // Notion block the Sheet draft does not have.
  if (!codes.length || codes.some((c) => FAILURES[c]?.where !== 'preflight' || c === 'G-BLOCK')) continue;
  const done = p['Repair Attempts']?.number ?? 0;
  const draft = draftBefore(key, done + 1, rejectedOf(p));
  if (!draft) { console.log(`· re-check ${key} — no draft in the Sheet; leaving it`); continue; }

  const { findings } = gateSheetDraft(draft, gateDefaults(p));
  const now = [...new Set(findings.map((f) => f.code))];
  const blocking = findings.some((f) => f.class === 'block');
  console.log(`· re-check ${key}: [${codes.join(', ')}] → [${now.join(', ') || 'clean'}]${blocking ? '' : ' → Draft Ready'}`);
  regated++;
  await patch(
    page,
    {
      'Failure Codes': { multi_select: now.map((name) => ({ name })) },
      'Blocked Reason': text(blocking ? formatFindings(findings) : `Re-checked with current rules: nothing blocking (${now.join(', ') || 'clean'}). [rules ${RULES_VERSION}]`),
      Findings: { rich_text: rich(findingsJson(findings)) },
      ...(blocking ? {} : { 'Draft Status': { select: { name: 'Draft Ready' } } }),
    },
    `re-check ${key}`
  );
}

// 4. Old repair tests — the menu keeps one test row in the Repair Tests tab; a
// test's Notion row whose Sheet row is gone is deleted (moved to Notion's trash).
// Only while a test row exists, so a failed Sheet read never deletes the live one.
const testPrefix = `${SHEET.tabs[REPAIR.testTab].keyPrefix}-`;
let cleared = 0;
if (testTabKeys.size) {
  for (const page of prod) {
    const key = keyOf(page);
    if (!key.startsWith(testPrefix) || testTabKeys.has(key)) continue;
    cleared++;
    if (!commit) { console.log(`  (dry run) would delete old test row ${key}`); continue; }
    try {
      await api(`/pages/${page.id}`, { method: 'PATCH', body: { in_trash: true } });
      console.log(`  ✓ deleted old test row ${key}`);
    } catch (err) {
      console.error(`::warning::could not delete old test row ${key}: ${err.message.split('\n')[0]}`);
    }
  }
}

console.log(
  `\n${imported} new draft(s), ${seeded} repair test(s) started, ${repaired} repair(s) ${commit ? 'applied' : 'would be applied'}, ` +
    `${refused} refused, ${regated} stale row(s) re-checked, ${cleared} old test row(s) deleted.`
);

