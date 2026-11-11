/**
 * Repair verification, shared by sync-drafts.mjs and the regression tests.
 * See HARNESS-REPAIR-PLAN §2 ("Apply") — never apply a repair that makes the
 * draft worse or touches what it was not asked to touch.
 */
import { REPAIR, FAILURES } from '../../harness/registry.mjs';
import { splitSections } from '../../harness/rules.mjs';
import { gateSheetDraft } from './gate.mjs';
import { parseDraft } from '../import-draft.mjs';

/** Attempt numbers listed in a "Repair rejected (attempts 2, 3): …" Blocked Reason. */
export function rejectedAttempts(reason = '') {
  if (!reason.startsWith(REPAIR.rejectedPrefix)) return [];
  const list = reason.slice(REPAIR.rejectedPrefix.length).split(')')[0];
  return list.split(',').map((n) => Number(n.trim())).filter(Boolean);
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

