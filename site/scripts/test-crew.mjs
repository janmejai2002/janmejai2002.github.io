// Checks the crew director's restraint rules against hand-worked timelines,
// and that every line in crew-lines.ts fills cleanly. Run: npm run test:crew
// (Node 23.6+ runs the .ts imports directly.)
import assert from 'node:assert/strict';
import { createDirector, fill, choose } from '../src/lib/crew-director.ts';
import { LINES } from '../src/lib/crew-lines.ts';

let failed = 0;
const test = (name, fn) => {
  try {
    fn();
    console.log(`  ok    ${name}`);
  } catch (e) {
    failed++;
    console.log(`  FAIL  ${name}\n        ${e.message}`);
  }
};

test('a quiet gap separates any two lines', () => {
  const d = createDirector({ gapMs: 10000, budget: 10 });
  assert.equal(d.take('a', 0), true);
  assert.equal(d.take('b', 9999), false);
  assert.equal(d.take('b', 10000), true);
});

test('the budget caps lines per page view', () => {
  const d = createDirector({ gapMs: 0, budget: 2 });
  assert.deepEqual([d.take('a', 0), d.take('b', 1), d.take('c', 2)], [true, true, false]);
});

test('a once moment never repeats', () => {
  const d = createDirector({ gapMs: 0, budget: 9, rules: { greet: { once: true } } });
  assert.equal(d.take('greet', 0), true);
  assert.equal(d.take('greet', 1e9), false);
});

test('a cooldown applies to its own moment only', () => {
  const d = createDirector({ gapMs: 0, budget: 9, rules: { m: { cooldownMs: 5000 } } });
  d.take('m', 0);
  assert.equal(d.take('m', 4999), false);
  assert.equal(d.take('other', 4999), true);
  assert.equal(d.take('m', 5000), true);
});

test('priority moments skip the gap and the budget, but not once', () => {
  const d = createDirector({ gapMs: 1e9, budget: 1, rules: { end: { priority: true, once: true } } });
  d.take('a', 0);
  assert.equal(d.take('b', 1), false);
  assert.equal(d.take('end', 2), true);
  assert.equal(d.take('end', 3), false);
});

test('no input, no lines: the director never speaks on its own', () => {
  const d = createDirector();
  assert.equal(d.spoken().length, 0);
});

test('fill leaves an unknown hole visible', () => {
  assert.equal(fill('{n} of {total}', { n: 3, total: 43 }), '3 of 43');
  assert.equal(fill('{n} of {totl}', { n: 3 }), '3 of {totl}');
});

test('choose is stable for a seed and stays in range', () => {
  const items = ['a', 'b', 'c'];
  assert.equal(choose(items, 'seed'), choose(items, 'seed'));
  for (let i = 0; i < 50; i++) assert.ok(items.includes(choose(items, `s${i}`)));
});

test('every line fills with the numbers the pages pass', () => {
  const vars = { n: 3, total: 43 };
  for (const [moment, byWho] of Object.entries(LINES)) {
    for (const [who, lines] of Object.entries(byWho)) {
      for (const line of lines) {
        const out = fill(line, vars);
        assert.ok(!/\{\w+\}/.test(out), `${moment}/${who}: "${line}" has a hole no page fills`);
        assert.ok(out.length <= 80, `${moment}/${who}: "${line}" is too long for its slot`);
      }
    }
  }
});

if (failed) {
  console.log(`\n${failed} crew test(s) failed`);
  process.exit(1);
}
console.log('\ncrew director: all checks passed');
