/**
 * Repair verification, shared by sync-drafts.mjs and the regression tests.
 * See HARNESS-REPAIR-PLAN §2 ("Apply") — never apply a repair that makes the
 * draft worse or touches what it was not asked to touch.
 */
import { REPAIR, FAILURES, SECTIONS } from '../../harness/registry.mjs';
import { splitSections, splitDraft, joinDraft } from '../../harness/rules.mjs';
import { gateSheetDraft } from './gate.mjs';
import { parseDraft } from '../import-draft.mjs';

const numbers = (s = '') => String(s).split(',').map((n) => Number(n.trim())).filter((n) => n > 0);

/** Attempt numbers listed in a "Repair rejected (attempts 2, 3): …" Blocked Reason. */
export function rejectedAttempts(reason = '') {
  if (!reason.startsWith(REPAIR.rejectedPrefix)) return [];
  return numbers(reason.slice(REPAIR.rejectedPrefix.length).split(')')[0]);
}

/**
 * Every refused attempt for a row: the durable "Rejected Attempts" property,
 * plus any listed in Blocked Reason (rows refused before the property existed).
 * Same rule as rejectedFor_ in gas/Conductor.js.
 */
export function rejectedFor(rejectedProp = '', reason = '') {
  return [...new Set([...numbers(rejectedProp), ...rejectedAttempts(reason)])].sort((a, b) => a - b);
}

/** "PATCHES: 2" → 2; a full draft → null. */
export function patchCount(draftCell = '') {
  const t = String(draftCell).trim();
  if (!t.startsWith(SECTIONS.patchMarker)) return null;
  return Number(t.slice(SECTIONS.patchMarker.length).trim()) || 0;
}

/**
 * Swap patched sections into a draft by Section ID. A patch without its
 * "## " heading line gets the original one back. Same rule as applyPatches_ in
 * gas/Conductor.js.
 * @param patches [{ 'Section ID', Text }]  (later rows win)
 * @returns {{ draft, unknown: string[] }}
 */
export function applyPatches(draft, patches) {
  const sections = splitDraft(draft);
  const unknown = [];
  for (const p of patches) {
    const s = sections.find((x) => x.id === String(p['Section ID']).trim());
    if (!s) { unknown.push(String(p['Section ID'])); continue; }
    let text = String(p.Text ?? '').replace(/\r\n/g, '\n').trim();
    if (s.heading !== SECTIONS.opening && !/^##\s+/.test(text)) text = `## ${s.heading}\n\n${text}`;
    s.text = text;
  }
  return { draft: joinDraft(sections), unknown };
}

/**
 * The draft a row holds after applying every accepted attempt up to `upTo`:
 * the original Sheet draft, then each non-refused Outbox attempt in order (a
 * full draft replaces it; a PATCHES row patches it). Same rule as draftAt_ in
 * gas/Conductor.js.
 */
export function draftAt({ source, outbox, patches, key, upTo, rejected = [] }) {
  let draft = source ?? null;
  const rows = outbox
    .filter((o) => o.Key === key && Number(o.Attempt) <= upTo && !rejected.includes(Number(o.Attempt)) && o.Draft)
    .sort((a, b) => Number(a.Attempt) - Number(b.Attempt));
  for (const o of rows) {
    if (patchCount(o.Draft) === null) draft = o.Draft;
    else if (draft != null) draft = applyPatches(draft, patches.filter((p) => p.Key === key && Number(p.Attempt) === Number(o.Attempt))).draft;
  }
  return draft;
}

/**
 * Should a repair be applied? Gates both drafts with today's rules.
 * @param prevDraft  the draft the repair started from (Sheet markdown)
 * @param nextDraft  the repaired draft
 * @param defaults   { title, question, track } for the gate
 * @param rowCodes   Failure Codes on the Notion row (may include build-time codes)
 * @returns {{ ok, why, prev, next, churn }}
 */
export function verifyRepair(prevDraft, nextDraft, defaults, rowCodes = [], nextTitle = null) {
  const prev = gateSheetDraft(prevDraft, defaults);
  const next = gateSheetDraft(nextDraft, { ...defaults, title: nextTitle || defaults.title });
  const before = new Set([...prev.findings.map((f) => f.code), ...rowCodes]);
  const added = [...new Set(next.findings.filter((f) => f.class === 'block' && !before.has(f.code)).map((f) => f.code))];

  // Which sections the findings allow the repair to touch. A code with no single
  // place (scope 'article', or unknown) lifts the restriction entirely.
  const located = [...before].every((c) => FAILURES[c] && FAILURES[c].scope !== 'article');
  const allowed = new Set(prev.findings.filter((f) => FAILURES[f.code]?.scope === 'section').flatMap((f) => f.instances.map((i) => i.section)));

  const sections = (raw) => {
    const map = new Map();
    for (const s of splitSections(parseDraft(raw).body)) map.set(s.heading, ((map.get(s.heading) ?? '') + ' ' + s.text).replace(/\s+/g, ' ').trim());
    return map;
  };
  const a = sections(prevDraft);
  const b = sections(nextDraft);
  const changed = [...a.keys()].filter((h) => a.get(h) !== b.get(h));
  const offLimits = located ? changed.filter((h) => !allowed.has(h)) : [];
  const words = (raw) => parseDraft(raw).body.split(/\s+/).filter((w) => /\w/.test(w)).length;
  const churn = {
    codesIn: [...before],
    codesOut: [...new Set(next.findings.map((f) => f.code))],
    sectionsChanged: changed.length,
    sectionsTotal: a.size,
    unflaggedChanged: located ? offLimits.length : null,
    wordsRemoved: Math.max(0, words(prevDraft) - words(nextDraft)),
  };

  const why = [
    added.length && `it adds blocking code(s) ${added.join(', ')}`,
    offLimits.length && `it changed section(s) no finding named: ${offLimits.map((h) => `"${h}"`).join(', ')}`,
  ].filter(Boolean);
  return { ok: !why.length, why: why.join('; '), prev, next, churn };
}

export const churnLine = (c) =>
  `codes in ${c.codesIn.join(',') || '-'} → out ${c.codesOut.join(',') || 'none'}; ${c.sectionsChanged}/${c.sectionsTotal} sections changed` +
  (c.unflaggedChanged == null ? '' : ` (${c.unflaggedChanged} unflagged)`) +
  `; ${c.wordsRemoved} words removed`;

