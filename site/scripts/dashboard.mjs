/**
 * Renders the wAIbi-sabi ops dashboard — one self-contained HTML page showing
 * the whole pipeline at a glance: what the doctor found, where a row is stuck,
 * routine health, the last Actions runs, open PRs, and a copy-to-run command
 * for every fix worth making.
 *
 *   node scripts/dashboard.mjs                       # doctor pass → .blog-dashboard.html
 *   node scripts/dashboard.mjs --out path.html       # write somewhere else
 *   node scripts/dashboard.mjs --augment aug.json    # fold in gh / scheduled-task data
 *   node scripts/dashboard.mjs --json                # print the merged model, render nothing
 *
 * The page is static — a button copies its command to the clipboard, it does
 * not run it. To actually act, run the command, or tell the session
 * "run dashboard action N". The `/blog-dashboard` command gathers the augment
 * file (GitHub Actions runs, PRs, local scheduled-task last-runs — none of
 * which a node script can reach) and opens the result.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const SITE = join(here, '..');
const a = process.argv.slice(2);
const opt = (name, def = null) => {
  const i = a.indexOf(name);
  return i >= 0 ? a[i + 1] : def;
};
const outFile = opt('--out', join(SITE, '.blog-dashboard.html'));
const augFile = opt('--augment', null);
const jsonOnly = a.includes('--json');

// --- doctor pass -----------------------------------------------------------
let doctor;
try {
  const raw = execFileSync('node', [join(here, 'doctor.mjs'), '--json', '--deep'], {
    cwd: SITE,
    encoding: 'utf8',
    maxBuffer: 8 * 1024 * 1024,
  });
  doctor = JSON.parse(raw);
} catch (err) {
  // doctor.mjs exits 1 when a check fails — that is not an error for us, the
  // JSON is still on stdout. Only a parse failure is fatal.
  try {
    doctor = JSON.parse(err.stdout);
  } catch {
    console.error('Could not run doctor.mjs:', err.message);
    process.exit(1);
  }
}

// --- augment (optional) --------------------------------------------------
// Shape (all optional):
//   { actionsRuns: [{workflow, status, conclusion, event, createdAt, url, id, logTail}],
//     prs:         [{number, title, headRefName, url, isDraft, createdAt}],
//     routines:    [{taskId, schedule, enabled, lastRunAt, nextRunAt, lastResult, note}],
//     cloudRoutine:{name, cron, nextRunAt, note},
//     notes: [str] }
let aug = {};
if (augFile) {
  try {
    aug = JSON.parse(readFileSync(augFile, 'utf8'));
  } catch (err) {
    console.error(`--augment ${augFile}: ${err.message} — rendering without it`);
  }
}

const REPO = 'janmejai2002/janmejai2002.github.io';
const model = {
  generated: new Date().toISOString(),
  doctor,
  actionsRuns: aug.actionsRuns ?? [],
  prs: aug.prs ?? [],
  routines: aug.routines ?? [],
  cloudRoutine: aug.cloudRoutine ?? null,
  notes: aug.notes ?? [],
  repo: REPO,
};

if (jsonOnly) {
  process.stdout.write(JSON.stringify(model, null, 2) + '\n');
  process.exit(0);
}

// --- derive the action list --------------------------------------------
const actions = [];
const pushAction = (label, cmd, extra = {}) => actions.push({ n: actions.length + 1, label, cmd, ...extra });

for (const c of doctor.checks) {
  if (c.status === 'fail' || c.status === 'warn') {
    if (c.id === 'build-fresh') pushAction('Verify the build', 'cd site && npm run build');
    else if (c.id === 'git' && /not pushed/i.test(c.fix)) pushAction('Ship pending commits (deploys)', 'git -C . status && echo "then: /blog-ship"');
    else if (c.id === 'unattended-stuck') pushAction('Re-poll the publish pipeline', `gh workflow run publish-from-notion.yml --repo ${REPO}`);
    else if (c.id === 'production-blocked-reason') pushAction('Re-poll the publish pipeline', `gh workflow run publish-from-notion.yml --repo ${REPO}`);
    else if (c.id === 'live-routes' || c.id.startsWith('live-core')) pushAction('Re-run the deploy', `gh workflow run deploy.yml --repo ${REPO} --ref main`);
    else if (c.id === 'draft-block-types') pushAction('Inspect the offending draft in Notion', '# open the row named above; rewrite the flagged block as a paragraph/list/code');
  }
}
for (const r of model.actionsRuns) {
  if (r.conclusion === 'failure') pushAction(`Read the failing "${r.workflow}" run`, `gh run view ${r.id} --repo ${REPO} --log-failed`, { url: r.url });
}
for (const p of model.prs) {
  pushAction(`Review PR #${p.number} — ${p.title}`, `gh pr view ${p.number} --repo ${REPO} --web`, { url: p.url });
}
// De-dupe by command, renumber.
const seen = new Set();
const uniqueActions = actions.filter((x) => (seen.has(x.cmd) ? false : (seen.add(x.cmd), true))).map((x, i) => ({ ...x, n: i + 1 }));

// --- HTML ----------------------------------------------------------------
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));
const verdictColor = { healthy: 'var(--ok)', degraded: 'var(--warn)', failing: 'var(--fail)' }[doctor.summary.verdict] || 'var(--muted)';
const sGlyph = { ok: '✓', warn: '!', fail: '✗', skip: '·' };
const sColor = { ok: 'var(--ok)', warn: 'var(--warn)', fail: 'var(--fail)', skip: 'var(--muted)' };

const d = doctor.summary;

const pipe = (() => {
  const find = (id) => doctor.checks.find((c) => c.id === id);
  const radar = find('radar-unrated')?.detail ?? '';
  const prod = find('production-spread')?.detail ?? '';
  const m = radar.match(/(\d+) unrated/);
  const approved = radar.match(/(\d+) rated 4\/5/);
  const pub = prod.match(/Published: (\d+)/);
  const dr = prod.match(/Draft Ready: (\d+)/);
  const appr = prod.match(/Approved: (\d+)/);
  const nr = prod.match(/Needs Revision: (\d+)/);
  return { unrated: m?.[1] ?? '?', approvedIdeas: approved?.[1] ?? '0', draftReady: dr?.[1] ?? '0', approvedDrafts: appr?.[1] ?? '0', needsRev: nr?.[1] ?? '0', published: pub?.[1] ?? '?' };
})();

const runRow = (r) => `<tr>
  <td>${esc(r.workflow)}</td>
  <td><span class="pill" style="--c:${r.conclusion === 'success' ? 'var(--ok)' : r.conclusion === 'failure' ? 'var(--fail)' : 'var(--muted)'}">${esc(r.conclusion || r.status)}</span></td>
  <td>${esc(r.event || '')}</td>
  <td class="muted">${esc((r.createdAt || '').replace('T', ' ').replace('Z', ''))}</td>
  <td>${r.url ? `<a href="${esc(r.url)}" target="_blank" rel="noreferrer">open ↗</a>` : ''}</td>
</tr>${r.logTail ? `<tr><td colspan="5"><pre class="log">${esc(r.logTail)}</pre></td></tr>` : ''}`;

const routineRow = (r) => `<tr>
  <td>${esc(r.taskId)}</td>
  <td class="muted">${esc(r.schedule || '')}</td>
  <td><span class="pill" style="--c:${r.enabled === false ? 'var(--muted)' : 'var(--ok)'}">${r.enabled === false ? 'disabled' : 'enabled'}</span></td>
  <td class="muted">${esc((r.lastRunAt || '').replace('T', ' ').slice(0, 16))}</td>
  <td class="muted">${esc((r.nextRunAt || '').replace('T', ' ').slice(0, 16))}</td>
  <td>${r.note ? `<span class="pill" style="--c:var(--warn)">${esc(r.note)}</span>` : ''}</td>
</tr>`;

const checkRow = (c) => `<div class="check">
  <div class="check-h"><span class="g" style="color:${sColor[c.status]}">${sGlyph[c.status]}</span> <strong>${esc(c.title)}</strong></div>
  ${c.detail ? `<div class="check-d">${esc(c.detail).replace(/\n/g, '<br>')}</div>` : ''}
  ${c.fix ? `<div class="check-fix">→ ${esc(c.fix)}</div>` : ''}
</div>`;

const actionRow = (x) => `<li class="action">
  <div class="action-h"><span class="num">${x.n}</span> ${esc(x.label)} ${x.url ? `<a href="${esc(x.url)}" target="_blank" rel="noreferrer">↗</a>` : ''}</div>
  <div class="action-cmd"><code>${esc(x.cmd)}</code><button data-cmd="${esc(x.cmd)}">copy</button></div>
</li>`;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>wAIbi-sabi ops dashboard</title>
<style>
  :root{
    --bg:#faf9f6; --panel:#fff; --ink:#1c1b19; --muted:#6b6862; --line:#e6e2da;
    --ok:#3f7d4e; --warn:#b7791f; --fail:#b4402f; --accent:#7a6a58;
  }
  @media (prefers-color-scheme:dark){:root:not([data-theme="light"]){
    --bg:#16150f; --panel:#1e1d16; --ink:#eceae2; --muted:#9a968c; --line:#332f26;
    --ok:#7fb98a; --warn:#e0b062; --fail:#e08a78; --accent:#c8b79f;
  }}
  :root[data-theme="dark"]{
    --bg:#16150f; --panel:#1e1d16; --ink:#eceae2; --muted:#9a968c; --line:#332f26;
    --ok:#7fb98a; --warn:#e0b062; --fail:#e08a78; --accent:#c8b79f;
  }
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.55 ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;padding:24px}
  .wrap{max-width:960px;margin:0 auto}
  h1{font-size:20px;margin:0 0 2px}
  h2{font-size:14px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);margin:28px 0 10px}
  .sub{color:var(--muted);font-size:13px;margin-bottom:18px}
  .verdict{display:inline-block;padding:2px 10px;border-radius:999px;color:#fff;font-weight:600;font-size:13px}
  .panel{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:16px}
  .flow{display:flex;flex-wrap:wrap;gap:10px}
  .stage{flex:1;min-width:150px;background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:12px 14px}
  .stage .n{font-size:24px;font-weight:700}
  .stage .l{color:var(--muted);font-size:12px;text-transform:uppercase;letter-spacing:.05em}
  .stage small{display:block;color:var(--muted);margin-top:4px}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
  @media(max-width:680px){.grid{grid-template-columns:1fr}}
  .check{border:1px solid var(--line);border-radius:8px;padding:10px 12px;background:var(--panel)}
  .check-h{font-size:14px}
  .check-d{color:var(--muted);font-size:13px;margin-top:4px;white-space:normal}
  .check-fix{font-size:13px;margin-top:6px;color:var(--accent)}
  table{width:100%;border-collapse:collapse;font-size:13px}
  th,td{text-align:left;padding:7px 8px;border-bottom:1px solid var(--line);vertical-align:top}
  th{color:var(--muted);font-weight:600;text-transform:uppercase;font-size:11px;letter-spacing:.05em}
  .pill{display:inline-block;padding:1px 8px;border-radius:999px;font-size:11px;font-weight:600;color:#fff;background:var(--c,var(--muted))}
  .muted{color:var(--muted)}
  a{color:var(--accent)}
  pre.log{white-space:pre-wrap;font-size:11px;background:var(--bg);border:1px solid var(--line);border-radius:6px;padding:8px;margin:6px 0 0;overflow-x:auto}
  ul.actions{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:8px}
  .action{border:1px solid var(--line);border-radius:8px;padding:10px 12px;background:var(--panel)}
  .action-h{font-size:14px}
  .num{display:inline-block;min-width:20px;height:20px;line-height:20px;text-align:center;border-radius:6px;background:var(--accent);color:var(--bg);font-size:12px;font-weight:700;margin-right:6px}
  .action-cmd{display:flex;gap:8px;align-items:center;margin-top:6px}
  .action-cmd code{flex:1;background:var(--bg);border:1px solid var(--line);border-radius:6px;padding:5px 8px;font-size:12px;overflow-x:auto;white-space:pre}
  .action-cmd button{border:1px solid var(--line);background:var(--panel);color:var(--ink);border-radius:6px;padding:5px 12px;cursor:pointer;font-size:12px}
  .action-cmd button:hover{border-color:var(--accent)}
  .hint{font-size:12px;color:var(--muted);margin-top:8px}
  .empty{color:var(--muted);font-size:13px}
</style>
</head>
<body>
<div class="wrap">
  <h1>wAIbi-sabi ops dashboard</h1>
  <div class="sub">
    generated ${esc(model.generated.replace('T', ' ').replace('Z', ' UTC'))} ·
    <span class="verdict" style="background:${verdictColor}">${esc(doctor.summary.verdict)}</span>
    · ${d.ok} ok · ${d.warn} warn · ${d.fail} fail ·
    <a href="${esc(doctor.site)}" target="_blank" rel="noreferrer">${esc(doctor.site)}</a>
  </div>

  <h2>Pipeline</h2>
  <div class="flow">
    <div class="stage"><div class="l">Radar</div><div class="n">${pipe.unrated}</div><small>unrated — the throughput gate</small><small>${pipe.approvedIdeas} rated 4/5 waiting to promote</small></div>
    <div class="stage"><div class="l">Drafting</div><div class="n">${pipe.draftReady}</div><small>Draft Ready</small><small>${pipe.approvedDrafts} Approved · ${pipe.needsRev} Needs Revision</small></div>
    <div class="stage"><div class="l">Live</div><div class="n">${pipe.published}</div><small>published articles</small></div>
  </div>

  <h2>Actions worth taking (${uniqueActions.length})</h2>
  ${uniqueActions.length ? `<ul class="actions">${uniqueActions.map(actionRow).join('')}</ul>
  <div class="hint">Buttons copy the command — they do not run it. Run it yourself, or tell the session: <strong>run dashboard action N</strong>.</div>`
    : `<div class="panel empty">Nothing flagged. The pipeline is clear.</div>`}

  <h2>Checks</h2>
  <div class="grid">${doctor.checks.map(checkRow).join('')}</div>

  <h2>GitHub Actions — recent runs</h2>
  ${model.actionsRuns.length
    ? `<div class="panel"><table><thead><tr><th>Workflow</th><th>Result</th><th>Event</th><th>When</th><th></th></tr></thead><tbody>${model.actionsRuns.map(runRow).join('')}</tbody></table></div>`
    : `<div class="panel empty">No run data — pass <code>--augment</code> from the /blog-dashboard command.</div>`}

  <h2>Routines</h2>
  ${model.routines.length
    ? `<div class="panel"><table><thead><tr><th>Task</th><th>Schedule</th><th>State</th><th>Last run</th><th>Next run</th><th></th></tr></thead><tbody>${model.routines.map(routineRow).join('')}${model.cloudRoutine ? `<tr><td>${esc(model.cloudRoutine.name)} <span class="muted">(cloud)</span></td><td class="muted">${esc(model.cloudRoutine.cron || '')}</td><td><span class="pill" style="--c:var(--ok)">cloud</span></td><td class="muted">—</td><td class="muted">${esc((model.cloudRoutine.nextRunAt || '').replace('T', ' ').slice(0, 16))}</td><td>${esc(model.cloudRoutine.note || '')}</td></tr>` : ''}</tbody></table></div>`
    : `<div class="panel empty">No routine data — pass <code>--augment</code> from the /blog-dashboard command.</div>`}

  <h2>Open PRs</h2>
  ${model.prs.length
    ? `<div class="panel"><table><thead><tr><th>#</th><th>Title</th><th>Branch</th><th></th></tr></thead><tbody>${model.prs.map((p) => `<tr><td>${p.number}</td><td>${esc(p.title)}</td><td class="muted">${esc(p.headRefName || '')}</td><td>${p.url ? `<a href="${esc(p.url)}" target="_blank" rel="noreferrer">open ↗</a>` : ''}</td></tr>`).join('')}</tbody></table></div>`
    : `<div class="panel empty">No open PRs.</div>`}

  ${model.notes.length ? `<h2>Notes</h2><div class="panel">${model.notes.map((n) => `<div>• ${esc(n)}</div>`).join('')}</div>` : ''}
</div>
<script>
  document.querySelectorAll('.action-cmd button').forEach((b) => {
    b.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(b.dataset.cmd); const t = b.textContent; b.textContent = 'copied'; setTimeout(() => (b.textContent = t), 1200); }
      catch { b.textContent = 'copy failed'; }
    });
  });
</script>
</body>
</html>
`;

writeFileSync(outFile, html, 'utf8');
console.log(`Dashboard written to ${outFile}`);
console.log(`  verdict: ${doctor.summary.verdict} · ${d.ok} ok / ${d.warn} warn / ${d.fail} fail · ${uniqueActions.length} action(s)`);
