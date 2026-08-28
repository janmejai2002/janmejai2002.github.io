/**
 * The wAIbi-sabi pipeline doctor — one headless pass over everything that can
 * silently stall, so a session (or a human) can see where the system is stuck
 * without clicking through Notion, the Actions tab and the repo by hand.
 *
 *   node scripts/doctor.mjs              # pretty report, exit 1 if anything failed
 *   node scripts/doctor.mjs --json       # machine-readable, for the dashboard
 *   node scripts/doctor.mjs --out x.json # write the JSON to a file as well
 *   node scripts/doctor.mjs --deep       # also scan draft pages for unconvertible blocks (more Notion calls)
 *   node scripts/doctor.mjs --strict     # treat warnings as failures for the exit code
 *
 * What it CANNOT see (needs `gh` / the scheduled-tasks MCP, which a plain node
 * script has no access to) is left to the `/blog-doctor` command that wraps
 * this: GitHub Actions run results and the local scheduled-task last-runs. This
 * script owns everything reachable with the Notion token, the filesystem, git
 * and plain HTTP.
 *
 * Every check returns { id, title, status: 'ok'|'warn'|'fail'|'skip', detail, fix }.
 * Nothing here writes anything anywhere — it is read-only by design.
 */
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  PIPELINE_DS,
  PRODUCTION_DS,
  api,
  queryAll,
  blocks,
  plain,
  token,
} from './lib/notion.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, '..', '..');
const SITE = join(here, '..');
const BLOG = join(SITE, 'src', 'content', 'blog');
const LIVE = process.env.SITE_URL ?? 'https://janmejai2002.github.io';

// Notion select values that mean "the owner has approved this idea".
const APPROVE_RATINGS = ['4', '5'];
// Must track AUTO_TRACKS in publish-article.mjs — the tracks that publish with
// no human in the path, so "ready and not live for half a day" is unambiguous.
const AUTO_TRACKS = ['Talks', 'Case Studies', 'Basics'];
const STALE_HOURS = 12;
// Block types lib/notion.mjs' toMarkdown() knows how to render. Anything a draft
// page uses that is not on this list crashes the publish poll.
const SUPPORTED_BLOCKS = new Set([
  'paragraph', 'heading_1', 'heading_2', 'heading_3',
  'bulleted_list_item', 'numbered_list_item', 'quote', 'code',
  'divider', 'callout', 'table_of_contents', 'breadcrumb',
  'table', 'table_row',
]);

const args = new Set(process.argv.slice(2));
const asJson = args.has('--json');
const deep = args.has('--deep');
const strict = args.has('--strict');
const outFile = (() => {
  const a = process.argv.slice(2);
  const i = a.indexOf('--out');
  return i >= 0 ? a[i + 1] : null;
})();

const checks = [];
const add = (c) => checks.push({ status: 'ok', detail: '', fix: '', ...c });

const git = (cmd) => {
  try {
    return execFileSync('git', cmd, { cwd: ROOT, encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
};

async function headOk(url) {
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    return res.status;
  } catch {
    return 0;
  }
}

// ---------------------------------------------------------------------------
// 1. Notion token
// ---------------------------------------------------------------------------
let notionUp = false;
try {
  token();
  const me = await api('/users/me');
  notionUp = true;
  add({
    id: 'notion-token',
    title: 'Notion token',
    detail: `authenticated as "${me.name ?? me.bot?.owner?.type ?? 'integration'}"`,
  });
} catch (err) {
  add({
    id: 'notion-token',
    title: 'Notion token',
    status: 'fail',
    detail: err.message.split('\n')[0],
    fix: 'Set NOTION_TOKEN in the environment or C:/Users/Janmejai/Notion/.env. In CI it is the NOTION_TOKEN repo secret.',
  });
}

// ---------------------------------------------------------------------------
// 2. Radar — the throughput gate is unrated ideas
// ---------------------------------------------------------------------------
let radarRows = [];
if (notionUp) {
  try {
    radarRows = await queryAll(PIPELINE_DS);
    const rating = (p) => p.properties['Interest Rating']?.select?.name ?? null;
    const status = (p) => p.properties['Status']?.select?.name ?? null;
    const isIdea = (p) => status(p) === 'Radar Idea';

    const unrated = radarRows.filter((p) => isIdea(p) && !rating(p));
    const approvedNotMoved = radarRows.filter(
      (p) => isIdea(p) && APPROVE_RATINGS.includes((rating(p) ?? '').trim()[0])
    );
    const lowRated = radarRows.filter((p) => {
      const r = (rating(p) ?? '').trim()[0];
      return r === '1' || r === '2';
    });

    add({
      id: 'radar-unrated',
      title: 'Radar — unrated ideas',
      status: unrated.length > 25 ? 'warn' : 'ok',
      detail: `${unrated.length} unrated · ${approvedNotMoved.length} rated 4/5 still on the radar · ${lowRated.length} rated 1–2`,
      fix: unrated.length
        ? 'Rate ideas in 📝 AI Blog OS Pipeline. 4–5 approves and lets ai-article-writer promote it; 1–2 steers future radar runs away. Cadence is not the gate — ratings are.'
        : '',
    });
  } catch (err) {
    add({ id: 'radar-unrated', title: 'Radar — unrated ideas', status: 'warn', detail: `query failed: ${err.message.split('\n')[0]}` });
  }
}

// ---------------------------------------------------------------------------
// 3. Production — status spread, Needs Revision, anything carrying a Blocked Reason
// ---------------------------------------------------------------------------
let prodRows = [];
if (notionUp) {
  try {
    prodRows = await queryAll(PRODUCTION_DS);
    const dstatus = (p) => p.properties['Draft Status']?.select?.name ?? '(none)';
    const track = (p) => p.properties['Track']?.select?.name ?? '?';
    const name = (p) => plain(p.properties['Name']?.title).trim() || '(untitled)';
    const reason = (p) => plain(p.properties['Blocked Reason']?.rich_text).trim();

    const byStatus = {};
    for (const p of prodRows) byStatus[dstatus(p)] = (byStatus[dstatus(p)] ?? 0) + 1;

    const needsRev = prodRows.filter((p) => dstatus(p) === 'Needs Revision');
    add({
      id: 'production-spread',
      title: 'Production — draft status',
      detail: Object.entries(byStatus).map(([k, v]) => `${k}: ${v}`).join(' · ') || 'no rows',
    });

    add({
      id: 'production-needs-revision',
      title: 'Production — Needs Revision',
      status: needsRev.length ? 'warn' : 'ok',
      detail: needsRev.length
        ? needsRev.map((p) => `• ${name(p)} [${track(p)}] — ${reason(p) || 'no reason recorded'}`).join('\n')
        : 'none',
      fix: needsRev.length ? 'Fix the text in Notion (never relax the build cap), then set Draft Status back to Draft Ready / Approved.' : '',
    });

    // A Blocked Reason on a row that is NOT Needs Revision is the pipeline
    // telling you a post that passed every content gate still did not go live —
    // a failed build, a URL that never came up, a stuck poll.
    const stalled = prodRows.filter((p) => reason(p) && dstatus(p) !== 'Needs Revision');
    add({
      id: 'production-blocked-reason',
      title: 'Production — stalled after generation',
      status: stalled.length ? 'fail' : 'ok',
      detail: stalled.length
        ? stalled.map((p) => `• ${name(p)} [${track(p)}] (${dstatus(p)}) — ${reason(p)}`).join('\n')
        : 'none',
      fix: stalled.length ? 'Read the reason on the row, check the matching "Publish from Notion" / deploy run, fix the cause, then re-trigger the poll (or clear the Blocked Reason and wait).' : '',
    });

    // The sweep-stuck backstop, run live: unattended rows ready too long.
    const now = Date.now();
    const stuck = prodRows.filter((p) => {
      if (!AUTO_TRACKS.includes(track(p))) return false;
      if (!['Draft Ready', 'Approved'].includes(dstatus(p))) return false;
      return (now - new Date(p.last_edited_time).getTime()) / 3.6e6 >= STALE_HOURS;
    });
    add({
      id: 'unattended-stuck',
      title: 'Unattended tracks — ready but not live',
      status: stuck.length ? 'fail' : 'ok',
      detail: stuck.length
        ? stuck.map((p) => {
            const ageH = Math.round((now - new Date(p.last_edited_time).getTime()) / 3.6e6);
            return `• ${name(p)} [${track(p)}] ${dstatus(p)}, ${ageH}h old${reason(p) ? ` — ${reason(p)}` : ''}`;
          }).join('\n')
        : 'none',
      fix: stuck.length ? 'Talks / Case Studies / Basics publish within an hour or two. If one is this old the publish path is stuck — check the "Publish from Notion" workflow is enabled and its last run.' : '',
    });

    // Optional deep pass: does any ready draft contain a block toMarkdown cannot
    // convert? This is what crashed the whole poll on 2026-08-28 (a table).
    if (deep) {
      const candidates = prodRows.filter((p) => ['Draft Ready', 'Approved'].includes(dstatus(p)));
      const offenders = [];
      for (const p of candidates.slice(0, 8)) {
        try {
          const kids = await blocks(p.id);
          const bad = [...new Set(kids.map((b) => b.type).filter((t) => !SUPPORTED_BLOCKS.has(t)))];
          if (bad.length) offenders.push(`• ${name(p)} — ${bad.join(', ')}`);
        } catch {
          /* skip a page we cannot read */
        }
      }
      add({
        id: 'draft-block-types',
        title: 'Ready drafts — unconvertible blocks',
        status: offenders.length ? 'fail' : 'ok',
        detail: offenders.length ? offenders.join('\n') : `scanned ${Math.min(candidates.length, 8)} ready draft(s), all convertible`,
        fix: offenders.length ? 'lib/notion.mjs toMarkdown() throws on these and takes the whole publish poll down with it. Either add the block type to toMarkdown() or rewrite that block in Notion as a paragraph / list / code block.' : '',
      });
    }
  } catch (err) {
    add({ id: 'production-spread', title: 'Production — draft status', status: 'warn', detail: `query failed: ${err.message.split('\n')[0]}` });
  }
}

// ---------------------------------------------------------------------------
// 4. Content on disk + live-URL drift
// ---------------------------------------------------------------------------
let posts = [];
try {
  posts = readdirSync(BLOG)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const src = readFileSync(join(BLOG, f), 'utf8');
      const fm = (k) => src.match(new RegExp(`^${k}:\\s*'?"?([^'"\\n]+)`, 'm'))?.[1]?.trim();
      return { slug: f.replace(/\.md$/, ''), notionId: fm('notionId'), draft: fm('draft') };
    });
  const noId = posts.filter((p) => !p.notionId && p.draft !== 'true');
  add({
    id: 'content-notionid',
    title: 'Blog posts — Notion linkage',
    status: noId.length ? 'warn' : 'ok',
    detail: `${posts.length} posts on disk · ${noId.length} missing notionId`,
    fix: noId.length ? `close-loop.mjs cannot reconcile these: ${noId.map((p) => p.slug).join(', ')}. Add the notionId frontmatter by hand.` : '',
  });
} catch (err) {
  add({ id: 'content-notionid', title: 'Blog posts — Notion linkage', status: 'warn', detail: err.message });
}

// Every published post should serve 200. A non-200 here is the close-loop's
// "generated and merged but the URL never came up" case.
{
  const live = posts.filter((p) => p.draft !== 'true');
  const bad = [];
  for (const p of live) {
    const code = await headOk(`${LIVE}/blog/${p.slug}/`);
    if (code !== 200) bad.push(`• /blog/${p.slug}/ → ${code || 'no response'}`);
  }
  add({
    id: 'live-routes',
    title: 'Live routes — published posts',
    status: bad.length ? 'fail' : 'ok',
    detail: bad.length ? bad.join('\n') : `all ${live.length} published posts serve 200`,
    fix: bad.length ? 'The article is in the repo but not serving. Re-run deploy.yml; if it keeps failing the build or the Pages step is broken, not the draft.' : '',
  });
  // Core pages that must always serve. Not /blog/ — posts live at /blog/<slug>/
  // and there is no blog index route, so it 404s by design.
  for (const path of ['/', '/status/', '/news/', '/about/']) {
    const code = await headOk(`${LIVE}${path}`);
    if (code !== 200) {
      add({
        id: `live-core-${path}`,
        title: `Live route ${path}`,
        status: 'fail',
        detail: `${code || 'no response'}`,
        fix: 'A core page is down — check the latest deploy run.',
      });
    }
  }
}

// ---------------------------------------------------------------------------
// 5. Git + build freshness
// ---------------------------------------------------------------------------
{
  const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']);
  const dirty = git(['status', '--porcelain']).split('\n').filter(Boolean).length;
  let ahead = '0', behind = '0';
  const lr = git(['rev-list', '--left-right', '--count', 'origin/main...HEAD']);
  if (lr) [behind, ahead] = lr.split(/\s+/);
  const onPrBranch = branch === 'notion/approved-articles';
  add({
    id: 'git',
    title: 'Git',
    status: onPrBranch ? 'fail' : dirty > 0 ? 'warn' : 'ok',
    detail: `on ${branch} · ${ahead} ahead / ${behind} behind origin/main · ${dirty} file(s) dirty`,
    fix: onPrBranch
      ? 'HEAD is on notion/approved-articles — never commit here, the publish poll regenerates it from main twice an hour. Move to main.'
      : Number(ahead) > 0 ? 'Local commits are not pushed. Pushing main deploys — use /blog-ship.' : '',
  });

  const watch = git(['diff', '--name-only', 'HEAD', '--', 'site/src', 'site/scripts', 'site/public', 'site/astro.config.mjs'])
    .split('\n').filter(Boolean);
  add({
    id: 'build-fresh',
    title: 'Build freshness',
    status: watch.length ? 'warn' : 'ok',
    detail: watch.length ? `${watch.length} build-affecting file(s) changed since HEAD — unverified` : 'no build-affecting changes since HEAD',
    fix: watch.length ? 'Run `npm run build` in site/ (it runs check-build) before calling anything done — /blog-verify.' : '',
  });
}

// ---------------------------------------------------------------------------
// 6. Workflows present
// ---------------------------------------------------------------------------
{
  const wfDir = join(ROOT, '.github', 'workflows');
  const want = ['deploy.yml', 'publish-from-notion.yml', 'sync-news.yml', 'sweep-stuck.yml'];
  let have = [];
  try { have = readdirSync(wfDir); } catch { /* none */ }
  const missing = want.filter((w) => !have.includes(w));
  add({
    id: 'workflows',
    title: 'GitHub workflows',
    status: missing.length ? 'warn' : 'ok',
    detail: missing.length ? `missing: ${missing.join(', ')}` : `all ${want.length} present`,
  });
}

// ---------------------------------------------------------------------------
// Roll up + emit
// ---------------------------------------------------------------------------
const counts = checks.reduce((a, c) => ((a[c.status] = (a[c.status] ?? 0) + 1), a), {});
const failed = (counts.fail ?? 0) > 0;
const warned = (counts.warn ?? 0) > 0;
const report = {
  generated: new Date().toISOString(),
  site: LIVE,
  summary: {
    ok: counts.ok ?? 0,
    warn: counts.warn ?? 0,
    fail: counts.fail ?? 0,
    skip: counts.skip ?? 0,
    verdict: failed ? 'failing' : warned ? 'degraded' : 'healthy',
  },
  checks,
};

if (outFile) writeFileSync(outFile, JSON.stringify(report, null, 2) + '\n', 'utf8');

if (asJson) {
  process.stdout.write(JSON.stringify(report, null, 2) + '\n');
} else {
  const glyph = { ok: '✓', warn: '!', fail: '✗', skip: '·' };
  const line = '─'.repeat(64);
  console.log(`\nwAIbi-sabi pipeline doctor — ${report.summary.verdict.toUpperCase()}`);
  console.log(`${report.generated}  ·  ${LIVE}`);
  console.log(line);
  for (const c of checks) {
    console.log(`${glyph[c.status]} ${c.title}`);
    if (c.detail) for (const d of String(c.detail).split('\n')) console.log(`    ${d}`);
    if (c.fix) console.log(`    → ${c.fix}`);
  }
  console.log(line);
  console.log(`${report.summary.ok} ok · ${report.summary.warn} warn · ${report.summary.fail} fail`);
  if (!deep) console.log(`(run with --deep to also scan ready drafts for unconvertible Notion blocks)`);
  console.log(`\nGitHub Actions runs and local scheduled-task last-runs are not visible`);
  console.log(`to this script — use the /blog-doctor command for the full picture.\n`);
}

process.exit(strict ? (failed || warned ? 1 : 0) : failed ? 1 : 0);
