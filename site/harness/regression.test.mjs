/**
 * Regression tests for the publish gate, run with:  node --test site/harness/
 *
 * The fixtures are exact copies of the Sheet cells from the first live repair
 * (DR-20261111-9f8879, 2026-11-11). Each draft goes through the same path a real
 * one does: Sheet markdown → Notion blocks (md-to-notion) → markdown again
 * (toMarkdown) → the transforms and gate in publish-article.mjs. See
 * docs/HARNESS-REPAIR-PLAN.md §1 for why each expectation matters.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { markdownToBlocks } from './md-to-notion.mjs';
import { checkArticle } from './rules.mjs';
import { routeFailure } from './registry.mjs';
import { toMarkdown, plain } from '../scripts/lib/notion.mjs';
import { liftArtworkBrief, liftArtworkSvg, normalizeProse, stripLeadingH1, wrapTldr } from '../scripts/lib/prose.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const fixture = (name) => readFileSync(join(here, 'fixtures', name), 'utf8');

const TITLE = 'Flaky Agent Evals Force CI Shift from LLM Judges to Trajectory Gates';
const SLUG = 'ai-agent-eval-harness-ci-cd';

/** What the Notion API returns for text we wrote: content also appears as plain_text. */
function asFetched(node) {
  if (Array.isArray(node)) return node.map(asFetched);
  if (!node || typeof node !== 'object') return node;
  const out = {};
  for (const [k, v] of Object.entries(node)) out[k] = asFetched(v);
  if (out.type === 'text' && out.text && out.plain_text === undefined) out.plain_text = out.text.content;
  return out;
}

/** Sheet draft → every finding publish-article.mjs would report. */
function gate(draft, { title = TITLE, slug = SLUG } = {}) {
  const list = asFetched(markdownToBlocks(draft));
  // parseHeader(): the leading run of quote/callout blocks is the metadata header.
  let end = 0;
  while (end < list.length && ['callout', 'quote'].includes(list[end]?.type)) end++;
  const header = list.slice(0, end).map((b) => plain(b[b.type]?.rich_text)).join('\n');
  const grab = (label) =>
    header.match(new RegExp(`\\**\\s*${label}\\s*\\**\\s*:?\\s*\\**\\s*([^\\n]+)`, 'i'))?.[1]?.replace(/\*+$/, '').trim() || '';

  const artWarnings = [];
  const lifted = liftArtworkBrief(toMarkdown(list.slice(end)));
  const art = liftArtworkSvg(lifted.markdown, (r) => artWarnings.push(r), slug);
  const md = normalizeProse(wrapTldr(stripLeadingH1(art.markdown)));
  const findings = checkArticle(md, { title, description: grab('Meta description'), question: grab('Reader Question') });
  if (artWarnings.length) findings.push({ code: 'G-ART', class: 'warn', message: artWarnings.join(' ') });
  return { md, findings, codes: findings.map((f) => f.code).sort() };
}

test('original draft: the only real defect is the ASCII diagram', () => {
  const { codes, findings } = gate(fixture('DR-20261111-9f8879.original.md'));
  assert.deepEqual(codes, ['G-ASCII'], findings.map((f) => `${f.code}: ${f.message}`).join('\n'));
});

test('repaired draft: clears every gate', () => {
  const { codes, findings } = gate(fixture('DR-20261111-9f8879.repaired.md'));
  assert.deepEqual(codes, [], findings.map((f) => `${f.code}: ${f.message}`).join('\n'));
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
