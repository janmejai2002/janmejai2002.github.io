/**
 * One line of routine telemetry, appended to routines/runs.jsonl.
 *
 *   node scripts/log-run.mjs <routine-name> --found <n> [--model sonnet] [--note "..."]
 *
 * Token counts are not visible from inside a running session, so this records
 * only what the routine knows: which routine, when, how many things it filed,
 * which model. When the routines move to `claude -p --output-format json` the
 * wrapper captures the real `usage` block and merges it in by timestamp.
 *
 * The point is a trend line. Two weeks of this and "runs cost ~100k, rough"
 * becomes a number you can optimise against and A/B.
 */
import { appendFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const OUT = join(here, '..', '..', 'routines', 'runs.jsonl');

const argv = process.argv.slice(2);
const routine = argv.find((a) => !a.startsWith('--')) ?? 'unknown';
const val = (f, d = null) => {
  const i = argv.indexOf(f);
  return i >= 0 ? argv[i + 1] : d;
};

const row = {
  routine,
  ts: new Date().toISOString(),
  found: Number(val('--found', 0)) || 0,
  model: val('--model', process.env.ANTHROPIC_MODEL ?? null),
  note: val('--note') || undefined,
};

try {
  mkdirSync(dirname(OUT), { recursive: true });
  appendFileSync(OUT, JSON.stringify(row) + '\n', 'utf8');
  console.log(`logged: ${JSON.stringify(row)}`);
} catch (err) {
  console.error(`::warning::could not write telemetry: ${err.message}`);
}
