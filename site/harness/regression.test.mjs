/**
 * Regression tests for the publish gate and the repair loop:
 *   npm --prefix site test        (also the first step of npm run build)
 *
 * The fixtures are exact copies of the Sheet cells from the first live repair
 * (DR-20261111-9f8879, 2026-11-11). Each draft goes through the same path a real
 * one does: Sheet markdown → Notion blocks → markdown → the publish gate
 * (scripts/lib/gate.mjs, shared with publish-article and sync-drafts).
 * See docs/HARNESS-REPAIR-PLAN.md for why each expectation matters.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkArticle, formatFindings, RULES_VERSION, RULES_STAMP_RE } from './rules.mjs';
import { routeFailure, REPAIR } from './registry.mjs';
import { normalizeProse } from '../scripts/lib/prose.mjs';
import { gateSheetDraft } from '../scripts/lib/gate.mjs';
import { verifyRepair, rejectedAttempts } from '../scripts/lib/repair.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const fixture = (name) => readFileSync(join(here, 'fixtures', name), 'utf8');
const ORIGINAL = fixture('DR-20261111-9f8879.original.md');
const REPAIRED = fixture('DR-20261111-9f8879.repaired.md');
const DEFAULTS = { title: 'Flaky Agent Evals Force CI Shift from LLM Judges to Trajectory Gates', track: 'Technical' };
// The codes the row actually carried into the live repair (two were stale).
const LIVE_CODES = ['G-ASCII', 'G-LATEX', 'G-LENGTH', 'G-STYLE'];

const codes = (findings) => findings.map((f) => f.code).sort();
const explain = (findings) => findings.map((f) => `${f.code}: ${f.message}`).join('\n');

/** The repair the harness should have asked for: swap the one diagram for a list. */
const SURGICAL = ORIGINAL.replace(/```[^\n]*\n\[Git PR \/ Agent Prompt\][\s\S]*?```/, '1. The pull request triggers the agent run.\n2. The gate replays recorded tool calls and runs the tests.\n3. The merge is blocked on any regression.');

// ── Phase 1 ──────────────────────────────────────────────────────────────────

test('original draft: the only real defect is the ASCII diagram', () => {
  const { findings } = gateSheetDraft(ORIGINAL, DEFAULTS);
  assert.deepEqual(codes(findings), ['G-ASCII'], explain(findings));
});

test('repaired draft: clears every gate', () => {
  const { findings } = gateSheetDraft(REPAIRED, DEFAULTS);
  assert.deepEqual(codes(findings), [], explain(findings));
});

test('normaliser converts inline LaTeX with decimals, percent and maths symbols', () => {
  const out = normalizeProse('A step succeeds with $p_{step} = 0.95$, so $0.95^{12} = 54.0\\%$ and $x \\le 1$.');
  assert.equal(out, 'A step succeeds with `p_step = 0.95`, so `0.95^12 = 54.0%` and `x ≤ 1`.');
  assert.deepEqual(checkArticle(out).filter((f) => f.code === 'G-LATEX'), []);
});

test('normaliser leaves currency alone', () => {
  const s = 'Per-commit cost drops from $38.40 to $45 and then $6.15.';
  assert.equal(normalizeProse(s), s);
  assert.equal(normalizeProse('It costs $38.40 to $45 a run.'), 'It costs $38.40 to $45 a run.');
});

test('routing: warnings alone never queue a repair', () => {
  assert.equal(routeFailure({ key: 'DR-1', codes: ['G-LENGTH'] }), 'publish');
  assert.equal(routeFailure({ key: 'DR-1', codes: ['G-LENGTH', 'G-STYLE'] }), 'publish');
  assert.equal(routeFailure({ key: 'DR-1', codes: ['G-ASCII', 'G-LENGTH'] }), 'repair');
  assert.equal(routeFailure({ key: 'DR-1', codes: ['G-BUILD'] }), 'human');
  assert.equal(routeFailure({ key: 'DR-1', attempts: 4, codes: ['G-ASCII'] }), 'human');
  assert.equal(routeFailure({ key: '', codes: ['G-ASCII'] }), 'legacy');
});

// ── Phase 2 ──────────────────────────────────────────────────────────────────

test('findings name the section and quote the text', () => {
  const [ascii] = gateSheetDraft(ORIGINAL, DEFAULTS).findings;
  assert.deepEqual(ascii.instances, [{ section: 'Architecture of a Deterministic Trajectory Gate', excerpt: 'code block starting "[Git PR / Agent Prompt]"' }]);
  const style = checkArticle('<div class="tldr">\n\n## Executive TL;DR\n- x\n\n</div>\n\n## Costs\n\nWe delve into it — fast.\n', { title: 't', description: 'd' }).find((f) => f.code === 'G-STYLE');
  assert.deepEqual(style.instances.map((i) => i.section), ['Costs', 'Costs']);
  assert.match(style.instances[0].excerpt, /delve/);
});

test('Blocked Reason carries every finding with its place, stamped with the rules version', () => {
  const reason = formatFindings(gateSheetDraft(ORIGINAL, DEFAULTS).findings);
  assert.match(reason, /^G-ASCII: .* Where: "Architecture of a Deterministic Trajectory Gate"/);
  assert.equal(RULES_STAMP_RE.exec(reason)?.[1], RULES_VERSION);
  const many = Array.from({ length: 30 }, (_, i) => ({ code: `G-X${i}`, class: i % 2 ? 'warn' : 'block', message: 'x'.repeat(200), instances: [] }));
  const long = formatFindings(many);
  assert.ok(long.length <= 1900, `${long.length} chars`);
  for (const f of many) assert.ok(long.includes(`${f.code}:`), `${f.code} dropped`);
});

test('verify: the live repair (rewrote ~75% of the article) is refused', () => {
  const v = verifyRepair(ORIGINAL, REPAIRED, DEFAULTS, LIVE_CODES);
  assert.equal(v.ok, false);
  assert.match(v.why, /changed section\(s\) no finding named/);
  assert.match(v.why, /Where Deterministic Trajectory Gates Break Down/);
  assert.ok(v.churn.unflaggedChanged >= 5, JSON.stringify(v.churn));
});

test('verify: a surgical repair of the flagged section is applied, with zero unflagged churn', () => {
  assert.notEqual(SURGICAL, ORIGINAL, 'fixture changed: the diagram block was not found');
  const v = verifyRepair(ORIGINAL, SURGICAL, DEFAULTS, LIVE_CODES);
  assert.equal(v.ok, true, v.why);
  assert.equal(v.churn.unflaggedChanged, 0);
  assert.equal(v.churn.sectionsChanged, 1);
  assert.deepEqual(codes(v.next.findings), []);
});

test('verify: a repair that adds a blocking problem is refused', () => {
  const worse = SURGICAL.replace('1. The pull request', '```\n[A] --> [B]\n```\n\n1. The pull request');
  const v = verifyRepair(SURGICAL, worse, DEFAULTS, ['G-LATEX']);
  assert.equal(v.ok, false);
  assert.match(v.why, /adds blocking code\(s\) G-ASCII/);
});

test('verify: codes with no single place lift the section restriction', () => {
  const v = verifyRepair(ORIGINAL, REPAIRED, DEFAULTS, ['G-ASCII', 'G-HTML']);
  assert.equal(v.churn.unflaggedChanged, null);
  assert.equal(v.ok, true, v.why);
});

test('rejected attempts round-trip through Blocked Reason', () => {
  assert.deepEqual(rejectedAttempts(`${REPAIR.rejectedPrefix} 2, 3): it changed …`), [2, 3]);
  assert.deepEqual(rejectedAttempts('G-ASCII: 1 code block …'), []);
});

// ── Phase 3: section patches ────────────────────────────────────────────────
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import { splitDraft, joinDraft, findingsJson } from './rules.mjs';
import { applyPatches, draftAt, patchCount } from '../scripts/lib/repair.mjs';

/** The real gas/Conductor.js + Registry.js, with Apps Script globals stubbed. */
function loadConductor() {
  const gas = (f) => readFileSync(join(here, '..', '..', 'gas', f), 'utf8');
  const ctx = vm.createContext({
    PropertiesService: { getScriptProperties: () => ({ getProperty: () => null, setProperty: () => {} }) },
    Utilities: {
      DigestAlgorithm: { SHA_256: 'sha256' },
      Charset: { UTF_8: 'utf8' },
      computeDigest: (alg, s) => [...createHash(alg).update(s, 'utf8').digest()].map((b) => (b > 127 ? b - 256 : b)),
    },
  });
  vm.runInContext(gas('Registry.js') + '\n' + gas('Conductor.js') + '\n' + gas('RepairTest.js'), ctx);
  return ctx;
}
const GAS = loadConductor();
const ARCH = 'Architecture of a Deterministic Trajectory Gate';
const plain = (x) => JSON.parse(JSON.stringify(x)); // vm objects → this realm

test('Node and the Conductor split drafts identically', () => {
  for (const d of [ORIGINAL, REPAIRED]) {
    const node = splitDraft(d).map(({ id, heading, text }) => ({ id, heading, text }));
    assert.deepEqual(plain(GAS.splitDraft_(d)), node);
    assert.equal(GAS.joinDraft_(node), joinDraft(node));
    const squash = (s) => s.replace(/\s+/g, ' ').trim();
    assert.equal(squash(joinDraft(splitDraft(d))), squash(d.replace(/\r\n/g, '\n')), 'split + join loses text');
  }
});

test('the Conductor sends only the flagged section, or the whole draft when a code has no place', () => {
  const findings = JSON.parse(findingsJson(gateSheetDraft(ORIGINAL, DEFAULTS).findings));
  const plan = plain(GAS.sectionPlan_(['G-ASCII'], findings, ORIGINAL));
  assert.deepEqual(plan.map((s) => s.heading), [ARCH]);
  assert.match(plan[0].findings, /^G-ASCII: code block starting/);
  assert.ok(plan[0].text.startsWith(`## ${ARCH}`));
  assert.ok(plan[0].text.length < ORIGINAL.length / 3, `${plan[0].text.length} of ${ORIGINAL.length} chars`);
  assert.equal(GAS.sectionPlan_(['G-ASCII', 'G-HTML'], findings, ORIGINAL), null);
  assert.equal(GAS.sectionPlan_(['G-ASCII'], null, ORIGINAL), null);
  assert.equal(GAS.sectionPlan_(['G-ASCII'], [{ c: 'G-ASCII', s: 'No such heading', e: '' }], ORIGINAL), null);
});

test('a section patch round-trips: Conductor plan → Repairer patch → Node apply → verify', () => {
  const findings = JSON.parse(findingsJson(gateSheetDraft(ORIGINAL, DEFAULTS).findings));
  const [section] = plain(GAS.sectionPlan_(['G-ASCII'], findings, ORIGINAL));
  const fixed = section.text.replace(/```[^\n]*\n\[Git PR \/ Agent Prompt\][\s\S]*?```/, '1. The pull request triggers the agent run.\n2. The gate replays recorded tool calls.\n3. The merge is blocked on any regression.');
  const patches = [{ Key: 'K', Attempt: '1', 'Section ID': section.id, Text: fixed }];
  const node = applyPatches(ORIGINAL, patches);
  assert.deepEqual(node.unknown, []);
  assert.equal(GAS.applyPatches_(ORIGINAL, patches), node.draft);
  const v = verifyRepair(ORIGINAL, node.draft, DEFAULTS, ['G-ASCII']);
  assert.equal(v.ok, true, v.why);
  assert.equal(v.churn.unflaggedChanged, 0);
  assert.deepEqual(codes(v.next.findings), []);
  // A patch that drops its heading line gets it back.
  const bare = applyPatches(ORIGINAL, [{ 'Section ID': section.id, Text: fixed.replace(/^## [^\n]*\n+/, '') }]).draft;
  assert.equal(bare, node.draft);
  assert.deepEqual(applyPatches(ORIGINAL, [{ 'Section ID': 'S99-000000', Text: 'x' }]).unknown, ['S99-000000']);
});

test('the current draft is rebuilt the same way in Node and the Conductor, skipping refused attempts', () => {
  const [section] = splitDraft(ORIGINAL).filter((s) => s.heading === ARCH);
  const outbox = [
    { Key: 'K', Attempt: '1', Draft: REPAIRED }, // refused
    { Key: 'K', Attempt: '2', Draft: 'PATCHES: 1' },
    { Key: 'X', Attempt: '2', Draft: 'PATCHES: 1' },
  ];
  const patches = [{ Key: 'K', Attempt: '2', 'Section ID': section.id, Text: `## ${ARCH}\n\nShort.` }];
  const node = draftAt({ source: ORIGINAL, outbox, patches, key: 'K', upTo: 2, rejected: [1] });
  assert.equal(GAS.draftAt_(ORIGINAL, outbox, patches, 'K', 2, [1]), node);
  assert.ok(node.includes(`## ${ARCH}\n\nShort.`) && node.includes('## Where Deterministic Trajectory Gates Break Down'));
  assert.equal(draftAt({ source: ORIGINAL, outbox, patches, key: 'K', upTo: 1, rejected: [] }), REPAIRED);
  assert.equal(patchCount('PATCHES: 3'), 3);
  assert.equal(patchCount(ORIGINAL), null);
  assert.deepEqual(plain(GAS.rejectedFor_('1, 3', `${REPAIR.rejectedPrefix} 2): x`)), [1, 2, 3]);
});

test('the one-click repair test article has exactly one fix to make, in one section', () => {
  const draft = readFileSync(join(here, '..', '..', REPAIR.testFixture), 'utf8');
  const { findings } = gateSheetDraft(draft, { title: 'TEST 2026-11-11 14:05 Repair loop check', track: 'Technical' });
  assert.deepEqual(codes(findings), ['G-ASCII', 'G-STYLE'], explain(findings));
  const plan = plain(GAS.sectionPlan_(['G-ASCII', 'G-STYLE'], JSON.parse(findingsJson(findings)), draft));
  assert.deepEqual(plan.map((s) => s.heading), [ARCH]);
  assert.equal(typeof GAS.startRepairTest, 'function');
});
