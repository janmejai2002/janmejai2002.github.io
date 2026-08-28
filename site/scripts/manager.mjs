/**
 * The always-on watchdog. One tick: read the pipeline's state, fix what is
 * safely auto-fixable, push an alert for what is not, and once a day send a
 * plain-language digest.
 *
 *   node scripts/manager.mjs              # one tick, act
 *   node scripts/manager.mjs --dry-run    # decide and print, touch nothing
 *   node scripts/manager.mjs --digest     # also force the daily digest now
 *
 * Meant to run every ~10 minutes from Task Scheduler (routines/manager.ps1)
 * while the laptop is on. Stateless per tick: it re-derives everything from
 * doctor.mjs + `gh` + the repo, so a missed tick just means the next one
 * catches up. State it does keep (last digest date, today's action count) is a
 * rate-limit ledger, not knowledge.
 *
 * Hard limits, in code, not prose:
 *   - only ever dispatches deploy.yml or publish-from-notion.yml
 *   - never writes Notion, never runs git, never touches Draft Status
 *   - at most MAX_ACTIONS_PER_DAY workflow re-triggers in a rolling 24h
 *   - the digest LLM call is given no tools; it can only return text
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { notify } from './notify.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const SITE = join(here, '..');
const REPO = 'janmejai2002/janmejai2002.github.io';
const STATE = join(here, '..', '..', 'routines', '.manager-state.json');
const LOG = join(here, '..', '..', 'routines', 'manager.log');

const DRY = process.argv.includes('--dry-run');
const FORCE_DIGEST = process.argv.includes('--digest');
const MAX_ACTIONS_PER_DAY = 4;
const DIGEST_AFTER_HOUR = 9; // local

const now = new Date();
const log = (line) => {
  const s = `${now.toISOString()}  ${line}`;
  console.log(s);
  try {
    writeFileSync(LOG, s + '\n', { flag: 'a' });
  } catch {
    /* logging is best-effort */
  }
};

function loadState() {
  try {
    return JSON.parse(readFileSync(STATE, 'utf8'));
  } catch {
    return { lastDigestDate: null, actions: [] };
  }
}
function saveState(s) {
  if (DRY) return;
  try {
    writeFileSync(STATE, JSON.stringify(s, null, 2) + '\n');
  } catch (e) {
    log(`could not write state: ${e.message}`);
  }
}

function sh(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { cwd: SITE, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024, ...opts });
}

// --- gather -------------------------------------------------------------------

let doctor;
try {
  let raw;
  try {
    raw = sh('node', ['scripts/doctor.mjs', '--json', '--deep']);
  } catch (err) {
    raw = err.stdout; // doctor exits 1 when a check fails — JSON is still on stdout
  }
  doctor = JSON.parse(raw);
} catch (e) {
  log(`FATAL: could not run doctor.mjs: ${e.message}`);
  await notify('Pipeline watchdog is blind', `manager.mjs could not run doctor.mjs: ${e.message}`);
  process.exit(1);
}

let runs = [];
try {
  runs = JSON.parse(
    sh('gh', [
      'run', 'list', '--repo', REPO, '--limit', '20',
      '--json', 'databaseId,workflowName,name,status,conclusion,headSha,createdAt,event',
    ])
  );
} catch (e) {
  log(`warn: gh run list failed (${e.message}) — proceeding on doctor only`);
}

const latestOf = (wf) =>
  runs.filter((r) => r.workflowName === wf).sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];

// --- decide -----------------------------------------------------------------

const state = loadState();
const dayAgo = Date.now() - 24 * 3.6e6;
state.actions = (state.actions || []).filter((a) => new Date(a.ts).getTime() > dayAgo);
const actionsLeft = () => MAX_ACTIONS_PER_DAY - state.actions.length;

const fails = doctor.checks.filter((c) => c.status === 'fail');
const warns = doctor.checks.filter((c) => c.status === 'warn');

const plan = []; // { kind: 'retrigger'|'alert', target, why }

// Auto-fix 1: the newest Deploy run failed and nothing newer succeeded.
const dep = latestOf('Deploy to GitHub Pages');
if (dep && dep.status === 'completed' && dep.conclusion === 'failure') {
  plan.push({ kind: 'retrigger', target: 'deploy.yml', why: `latest Deploy run ${dep.databaseId} failed` });
}

// Auto-fix 2: the newest Publish run failed. The workflow already flags Notion
// and pushes a notification; this adds one retry in case it was transient.
const pub = latestOf('Publish from Notion');
if (pub && pub.status === 'completed' && pub.conclusion === 'failure') {
  plan.push({ kind: 'retrigger', target: 'publish-from-notion.yml', why: `latest Publish run ${pub.databaseId} failed` });
}

// Alert: any hard fail doctor raised that we are not already acting on.
for (const f of fails) {
  plan.push({ kind: 'alert', target: f.id, why: `${f.title}: ${f.detail}` });
}

// --- act ------------------------------------------------------------------

const retriggered = [];
const alerts = [];

for (const step of plan) {
  if (step.kind === 'retrigger') {
    // Do not re-fire the same workflow twice in one day.
    const already = state.actions.find((a) => a.target === step.target);
    if (already) {
      log(`skip retrigger ${step.target} — already retriggered today at ${already.ts}`);
      alerts.push(`${step.target} failed again after a retry today — needs a human. (${step.why})`);
      continue;
    }
    if (actionsLeft() <= 0) {
      log(`skip retrigger ${step.target} — daily action budget spent`);
      alerts.push(`${step.target} failed and the watchdog's retry budget for today is spent. (${step.why})`);
      continue;
    }
    if (DRY) {
      log(`[dry-run] would: gh workflow run ${step.target} — ${step.why}`);
    } else {
      try {
        sh('gh', ['workflow', 'run', step.target, '--repo', REPO, '--ref', 'main']);
        state.actions.push({ ts: now.toISOString(), kind: 'retrigger', target: step.target });
        log(`retriggered ${step.target} — ${step.why}`);
        retriggered.push(step.target);
      } catch (e) {
        log(`retrigger ${step.target} FAILED: ${e.message}`);
        alerts.push(`Tried to retrigger ${step.target} and the dispatch itself failed: ${e.message}`);
      }
    }
  } else {
    alerts.push(step.why);
  }
}

// One push covering everything that needs a human.
if (alerts.length) {
  const body = alerts.map((a) => `• ${a}`).join('\n');
  if (DRY) log(`[dry-run] would notify:\n${body}`);
  else await notify(`Pipeline needs you (${alerts.length})`, body, { url: `https://github.com/${REPO}/actions` });
}

if (retriggered.length) {
  await notify(
    'Watchdog retriggered a failed run',
    `${retriggered.join(', ')} failed and looked transient, so the watchdog re-ran ${retriggered.length === 1 ? 'it' : 'them'}. ` +
      `You will get another push if it fails again.`,
    { url: `https://github.com/${REPO}/actions` }
  );
}

// --- daily digest ---------------------------------------------------------

const todayLocal = now.toLocaleDateString('en-CA'); // YYYY-MM-DD
const digestDue =
  FORCE_DIGEST || (now.getHours() >= DIGEST_AFTER_HOUR && state.lastDigestDate !== todayLocal);

if (digestDue) {
  const jsonl = (() => {
    try {
      return readFileSync(join(here, '..', '..', 'routines', 'runs.jsonl'), 'utf8').trim().split('\n').slice(-30).join('\n');
    } catch {
      return '(no routine telemetry yet)';
    }
  })();

  const context = [
    `DOCTOR (${doctor.summary?.ok ?? '?'} ok / ${warns.length} warn / ${fails.length} fail):`,
    ...doctor.checks.map((c) => `  [${c.status}] ${c.title} — ${c.detail}${c.fix ? ` (fix: ${c.fix})` : ''}`),
    '',
    'RECENT WORKFLOW RUNS:',
    ...runs.slice(0, 10).map((r) => `  ${r.conclusion ?? r.status}  ${r.workflowName}  ${r.createdAt}`),
    '',
    'ROUTINE TELEMETRY (last 30 runs):',
    jsonl,
  ].join('\n');

  const prompt =
    `You are the ops manager for a self-running blog. Below is the machine's current state. ` +
    `Write ONE short paragraph (3-5 sentences, plain language, no bullet points) for the owner's phone: ` +
    `is the pipeline healthy, what — if anything — needs their attention today, and is anything trending wrong ` +
    `in the token telemetry. Do not use any tools. Output only the paragraph.\n\n${context}`;

  if (DRY) {
    log(`[dry-run] would send digest. Context:\n${context}`);
  } else {
    try {
      const out = execFileSync('claude', ['-p', prompt, '--model', 'sonnet'], {
        encoding: 'utf8',
        maxBuffer: 4 * 1024 * 1024,
        timeout: 180000,
      }).trim();
      await notify('Daily blog digest', out || '(the digest came back empty)', {
        url: 'https://janmejai2002.github.io/status/',
        priority: 'default',
        tag: 'newspaper',
      });
      state.lastDigestDate = todayLocal;
      log('sent daily digest');
    } catch (e) {
      log(`digest failed: ${e.message}`);
    }
  }
}

saveState(state);
log(`tick done — ${retriggered.length} retrigger(s), ${alerts.length} alert(s), digest ${digestDue ? 'yes' : 'no'}`);
