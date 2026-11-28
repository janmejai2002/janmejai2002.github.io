import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  INFERENCE_STATS,
  INFERENCE_TRACK_GROUPS,
  INFERENCE_UNITS,
  INFERENCE_GLOSSARY,
  INFERENCE_SKUS,
  INFERENCE_CAMPUS_TIERS,
  INFERENCE_FAQS,
  getCheckoutHref,
} from './inference.ts';

const here = dirname(fileURLToPath(import.meta.url));
const freeDir = join(here, '..', 'content', 'inference');

test('syllabus covers all 36 units across 7 domains + inserts with 5 free and 31 paid', () => {
  assert.equal(INFERENCE_STATS.unitsTotal, 36);
  assert.equal(INFERENCE_UNITS.length, 36);
  assert.equal(INFERENCE_TRACK_GROUPS.length, 8); // 7 domains + Quarterly Inserts

  const free = INFERENCE_UNITS.filter((u) => u.isFree);
  const paid = INFERENCE_UNITS.filter((u) => !u.isFree);
  assert.equal(free.length, 5);
  assert.equal(paid.length, 31);

  for (const u of free) {
    assert.ok(u.freeSlug, `Free unit ${u.id} must have a freeSlug`);
  }
});

test('glossary contains all 116 non-empty terms mapped to valid tracks and units', () => {
  assert.equal(INFERENCE_STATS.glossaryTerms, 116);
  assert.equal(INFERENCE_GLOSSARY.length, 116);

  const trackIds = new Set(INFERENCE_TRACK_GROUPS.map((g) => g.id));
  const unitIds = new Set(INFERENCE_UNITS.map((u) => u.id));
  const seenIds = new Set<string>();

  for (const item of INFERENCE_GLOSSARY) {
    assert.ok(item.id.length > 0);
    assert.ok(!seenIds.has(item.id), `Duplicate glossary id: ${item.id}`);
    seenIds.add(item.id);
    assert.ok(item.term.trim().length > 0, `Empty term for ${item.id}`);
    assert.ok(item.def.trim().length > 10, `Empty/short def for ${item.id}`);
    assert.ok(trackIds.has(item.trackId), `Invalid trackId ${item.trackId} on ${item.id}`);
    assert.ok(unitIds.has(item.unitId), `Invalid unitId ${item.unitId} on ${item.id}`);
  }
});

test('free edition markdown files match the 5 allowed units and have zero leftover directives', () => {
  const files = readdirSync(freeDir).filter((f) => f.endsWith('.md')).sort();
  assert.deepEqual(files, [
    'ai-casebook-preview.md',
    'ai-in-one-sitting.md',
    'india-briefing.md',
    'kinds-of-ai.md',
    'state-of-play.md',
  ]);

  for (const f of files) {
    const raw = readFileSync(join(freeDir, f), 'utf8');
    assert.ok(!raw.includes(':::'), `${f} contains unconverted ::: directive`);
    assert.ok(!/\{\{|\}\}/.test(raw), `${f} contains unconverted {{ }} tag`);
    assert.ok(!/\[\[|\]\]/.test(raw), `${f} contains unconverted [[ ]] wikilink`);
    assert.ok(!/\[@[a-z0-9-]+\]/i.test(raw), `${f} contains unconverted [@citation]`);
    assert.ok(!/\$\$|\\frac|\\text|\\approx/.test(raw), `${f} contains uncompiled LaTeX`);
  }

  // Ensure ai-casebook-preview only contains Case 1 and NOT Case 2-10
  const casePreview = readFileSync(join(freeDir, 'ai-casebook-preview.md'), 'utf8');
  assert.ok(casePreview.includes('Case 1: PE Due Diligence'));
  assert.ok(!casePreview.includes('Case 2:'));
  assert.ok(!casePreview.includes('Guesstimate 1:'));
});

test('pricing SKUs, campus tiers, checkout URLs, and editorial voice checks pass', () => {
  assert.equal(INFERENCE_SKUS.length, 4);
  const full = INFERENCE_SKUS.find((s) => s.id === 'full-edition');
  assert.equal(full?.priceInr, 1999);
  assert.equal(full?.priceUsd, 49);
  assert.equal(full?.highlighted, true);

  const track = INFERENCE_SKUS.find((s) => s.id === 'domain-track');
  assert.equal(track?.priceInr, 499);
  assert.equal(track?.priceUsd, 19);

  const bundle = INFERENCE_SKUS.find((s) => s.id === 'placement-accelerator');
  assert.equal(bundle?.priceInr, 3499);
  assert.equal(bundle?.priceUsd, 79);

  assert.ok(INFERENCE_CAMPUS_TIERS.some((t) => t.priceInr === '₹45,000'));
  assert.ok(INFERENCE_CAMPUS_TIERS.some((t) => t.priceInr === '₹1,40,000'));

  assert.ok(getCheckoutHref('domain-track', 'INR', 'finance').includes('finance'));
  assert.ok(getCheckoutHref('full-edition', 'USD').includes('49'));
  assert.equal(getCheckoutHref('campus-bulk', 'INR'), '/inference/campus/');

  // Voice rule: dry editorial tone, zero exclamation marks
  for (const faq of INFERENCE_FAQS) {
    assert.ok(!faq.question.includes('!'), 'FAQ question must not have exclamation mark');
    assert.ok(!faq.answer.includes('!'), 'FAQ answer must not have exclamation mark');
  }
});
