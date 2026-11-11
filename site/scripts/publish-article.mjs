/**
 * Turns every Approved article in Notion into a markdown file in the site.
 *
 *   node scripts/publish-article.mjs               # write any that are missing
 *   node scripts/publish-article.mjs --dry-run     # report only
 *   node scripts/publish-article.mjs --check <id>  # run one page through every
 *                                                  # gate and report; write
 *                                                  # nothing, touch no Notion row
 *
 * The --check mode is the writer routines' preflight. It evaluates a single
 * page by id regardless of its Draft Status, so a routine can confirm its own
 * finished draft passes the real validator — the same code the cloud runs —
 * before it hands the draft off, instead of eyeballing the caps and hoping.
 *
 * There are two triggers, because there are two kinds of track.
 *
 * `Draft Status = Approved` is the reviewed path. It is a value only a human
 * writes — no routine is permitted to set it — and it covers the tracks where
 * the owner wants a read-through before anything ships.
 *
 * `Draft Status = Draft Ready` also publishes, but only for the tracks in
 * AUTO_TRACKS. Those routines are meant to run end to end with nobody in the
 * loop, so waiting on an approval that never comes is the failure, not the
 * safeguard: a finished Talks piece sat at Draft Ready for days for exactly
 * that reason. The automated gates below still apply in full — title length,
 * meta description, the Executive TL;DR — and a draft that fails one is still
 * bounced to Needs Revision rather than published.
 *
 * This script stops at a file on disk. Nothing here pushes or deploys; the
 * workflow decides whether that file goes to main directly or through a PR,
 * and close-loop.mjs writes back to Notion after the deploy.
 *
 * It exits 0 having written nothing when there is no work, so it is safe to run
 * on a schedule.
 */
import { writeFileSync, existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { api, queryAll, blocks, blocksDeep, toMarkdown, plain, inline, flagBlocked, clearBlockedReason, PRODUCTION_DS } from './lib/notion.mjs';
import { fallbackArt } from './lib/fallback-art.mjs';
import { CAPS, TRACKS as TRACK_REGISTRY, AUTO_TRACKS, REPAIR, routeFailure } from '../harness/registry.mjs';
import { formatFindings, findingsJson } from '../harness/rules.mjs';
import { gateBody } from './lib/gate.mjs';
import { recordNeedsHuman } from '../harness/needs-human.mjs';
import { notify } from './notify.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const BLOG = join(here, '..', 'src', 'content', 'blog');
// The page id passed to --check, if any. It runs one row through every gate and
// reports; like --dry-run it writes no file and touches no Notion row.
const checkId = process.argv.includes('--check')
  ? process.argv[process.argv.indexOf('--check') + 1]
  : null;
const dryRun = process.argv.includes('--dry-run') || Boolean(checkId);

// Caps, tracks and failure codes live in site/harness/registry.mjs.
const MAX_TITLE = CAPS.title;

const slugify = (s) =>
  s.toLowerCase().replace(/['']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const yaml = (s) => `'${String(s).replace(/'/g, "''")}'`;

function readingTime(words) {
  return `${Math.max(1, Math.round(words / 220))} min read`;
}

/**
 * The writer routine opens every draft with a callout holding slug + meta.
 *
 * Notion splits a multi-line callout across the block's own rich_text and its
 * children, so reading only the block itself silently loses the slug — which is
 * how the first test run produced a 69-character filename from the title.
 */
/**
 * Reads the metadata header the writer routine puts above the article.
 *
 * It accepts a **callout or a quote**, and a run of them, because that is what
 * the routine actually produces. Notion turns `> **Meta description:** ...` into
 * a quote, not a callout, and the two drafts approved on 2026-08-25 were both
 * rejected as "no Meta description found" when they had a perfectly good one —
 * it was just in the other block type. Insisting on `callout` was the bug.
 *
 * A multi-line callout is also split across the block's own rich_text *and its
 * children*; reading only the block silently loses the slug. See HANDOFF §6.
 */
const HEADER_TYPES = new Set(['callout', 'quote']);

async function parseHeader(list) {
  // Consume the leading run — the description and slug are sometimes one block
  // with a line break, sometimes two consecutive blocks.
  let end = 0;
  while (end < list.length && HEADER_TYPES.has(list[end]?.type)) end++;
  if (end === 0) return { header: null, body: list };

  const parts = [];
  for (const block of list.slice(0, end)) {
    parts.push(plain(block[block.type]?.rich_text));
    if (block.has_children) {
      for (const child of await blocks(block.id)) {
        parts.push(plain(child[child.type]?.rich_text));
      }
    }
  }
  const text = parts.filter(Boolean).join('\n');

  // Tolerates "Meta description:", "**Meta description:**", and stray bold
  // markers, and stops at the end of the line so the slug does not get swept in.
  const grab = (label) =>
    text.match(new RegExp(`\\**\\s*${label}\\s*\\**\\s*:?\\s*\\**\\s*([^\\n]+)`, 'i'))?.[1]
      ?.replace(/\*+$/, '')
      .trim() || null;

  return {
    header: { description: grab('Meta description'), slug: grab('Slug') },
    body: list.slice(end),
  };
}

const existingIds = new Set(
  existsSync(BLOG)
    ? readdirSync(BLOG)
        .filter((f) => f.endsWith('.md'))
        .map((f) => readFileSync(join(BLOG, f), 'utf8').match(/^notionId:\s*'?([\w-]+)'?/m)?.[1])
        .filter(Boolean)
    : []
);

// Tracks that publish themselves (AUTO_TRACKS) come from site/harness/registry.mjs.
// Adding a track there removes the human gate for it and nothing else — every
// automated check still runs.

async function fetchCheckPage(id) {
  try {
    return await api(`/pages/${id}`);
  } catch (err) {
    console.error(`✗ PREFLIGHT — could not read page ${id}: ${err.message.split('\n')[0]}`);
    console.error('  Pass the Article Production page id (the 32-char id from its URL), and make sure it is shared with the integration.');
    process.exit(1);
  }
}

const rows = checkId
  ? [await fetchCheckPage(checkId)]
  : await queryAll(PRODUCTION_DS, {
      or: [
        { property: 'Draft Status', select: { equals: 'Approved' } },
        ...AUTO_TRACKS.map((t) => ({
          and: [
            { property: 'Draft Status', select: { equals: 'Draft Ready' } },
            { property: 'Track', select: { equals: t } },
          ],
        })),
      ],
    });

const written = [];
const skipped = [];
// Split by which gate each article came through — see AUTO_TRACKS above.
const manifest = { auto: [], reviewed: [] };

// Rejections used to be strings printed to a log nobody reads. The run went red
// in Actions and the human, who works in Notion, never found out why their
// approved article did not appear. Each entry now carries the page it belongs
// to so the reason can be written back to the row itself.
const problems = [];
const blocked = (id, title, reason, codes = ['G-BLOCK'], attempts = 0, extra = {}) =>
  problems.push({ id, title, reason, codes, attempts, fatal: true, ...extra });
const note = (id, title, reason) => problems.push({ id, title, reason, fatal: false });
// Rows that published cleanly this run, so any Blocked Reason left over from a
// previous failure can be wiped.
const clearBlocked = [];

for (const page of rows) {
  const p = page.properties;
  const title = plain(p.Name?.title).trim();
  const id = page.id;
  const attempts = p['Repair Attempts']?.number ?? 0;
  const sheetKey = plain(p['Sheet Key']?.rich_text).trim();
  const trackLabel = p['Track']?.select?.name ?? '';

  if (existingIds.has(id) || existingIds.has(id.replace(/-/g, ''))) {
    skipped.push(`${title} — already in the repo`);
    continue;
  }

  // blocksDeep, not blocks: it also pulls table rows so toMarkdown() can render
  // a table instead of throwing on it and crashing the whole poll.
  const list = await blocksDeep(id);
  const { header, body } = await parseHeader(list);

  // toMarkdown throws on any Notion block it does not support, on purpose —
  // losing a paragraph silently is worse than failing. But that throw is this
  // draft's problem, not the whole run's: caught here it becomes a Needs
  // Revision with a clear reason on the row, and the other drafts in the run
  // still ship. Uncaught, one exotic block (a table, a toggle) crashed the
  // entire poll with no Notion write-back at all.
  let renderedBody;
  try {
    renderedBody = toMarkdown(body);
  } catch (err) {
    blocked(
      id,
      title,
      `G-BLOCK: The page has a block the generator cannot convert — ${err.message} Rewrite it as a paragraph, list, quote, or code block.`,
      ['G-BLOCK'],
      attempts,
      { key: sheetKey, track: trackLabel }
    );
    continue;
  }

  // The routine writes the slug as a path ("/mcp-stateless-spec-..."), so strip
  // the slashes — otherwise the leading one lands in the filename and the post
  // is written to the wrong place.
  const slug = (header?.slug || slugify(title)).replace(/^\/+|\/+$/g, '').trim();
  const description = header?.description ?? '';
  const file = join(BLOG, `${slug}.md`);

  if (existsSync(file)) {
    skipped.push(`${title} — ${slug}.md exists but carries no notionId; link it by hand`);
    continue;
  }

  const keywords = plain(p['SEO Keywords']?.rich_text)
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);
  const pubDate = p['Publish Date']?.date?.start ?? new Date().toISOString().slice(0, 10);

  // Editorial theme. Notion holds it title-cased ("Technical"); the content
  // schema wants the lowercase id. Anything unset or unrecognised falls back to
  // technical, which is also the schema default — a missing Track must never be
  // able to fail a build. These three strings must match the enum in
  // src/content.config.ts and the Notion select exactly.
  const TRACKS = TRACK_REGISTRY.map((t) => t.id);
  // "Case Studies" in Notion becomes "case-studies" as a track id.
  const rawTrack = (p['Track']?.select?.name ?? '').trim().toLowerCase().replace(/\s+/g, '-');
  const track = TRACKS.includes(rawTrack) ? rawTrack : 'technical';
  if (rawTrack && !TRACKS.includes(rawTrack)) {
    note(id, title, `Unknown Track "${rawTrack}" — filed under technical.`);
  }

  // The reader question the piece answers. Optional, capped to match the schema.
  const question = plain(p['Reader Question']?.rich_text).trim();

  // Every content rule, every violation, each with a failure code — so a repair
  // pass sees the whole list at once instead of discovering one problem per
  // attempt. Rules and codes: site/harness/rules.mjs + registry.mjs. The same
  // gateBody() runs in sync-drafts and the tests, so they all agree.
  const gate = gateBody(renderedBody, { title, description, question, track: rawTrack }, { slug });
  for (const reason of gate.artWarnings) note(id, title, reason);
  const { markdown, findings } = gate;
  const lifted = { brief: gate.brief };
  const liftedArt = { svg: gate.svg, alt: gate.alt };
  const words = markdown.split(/\s+/).filter((w) => /\w/.test(w)).length;
  const blocking = findings.filter((f) => f.class === 'block');
  const warnings = findings.filter((f) => f.class === 'warn');
  for (const w of warnings) if (w.code !== 'G-ART') note(id, title, `${w.code}: ${w.message}`);
  if (blocking.length) {
    // Warnings travel with their messages too: Failure Codes carries both
    // classes, so Blocked Reason must explain both.
    blocked(
      id,
      title,
      formatFindings(findings),
      [...new Set([...blocking, ...warnings].map((f) => f.code))],
      attempts,
      { key: sheetKey, track: trackLabel, findings: findingsJson(findings) }
    );
    continue;
  }

  // Every draft leaves here with artwork, so the PR never needs a human commit
  // — which matters because the publish poll resets the PR branch from main
  // twice an hour and destroys anything a human added to it. Routine-authored
  // SVG from the Notion page wins; otherwise deterministic fallback art. The
  // one exception: a source SVG already sitting on disk for this slug (artwork
  // landed on main ahead of the publish) is someone's real drawing — never
  // overwrite it with a placeholder, and leave the hero fields to its author.
  const ART_SRC = join(here, '..', 'assets-src', 'art');
  const svgFile = join(ART_SRC, `${slug}.svg`);
  let art = null;
  if (liftedArt.svg) {
    art = { svg: liftedArt.svg, alt: liftedArt.alt, label: 'routine artwork from Notion' };
  } else if (existsSync(svgFile)) {
    const existingSvg = readFileSync(svgFile, 'utf8');
    const existingAlt = liftedArt.alt || title;
    art = { svg: existingSvg, alt: existingAlt, label: 'existing artwork from disk' };
    note(id, title, `assets-src/art/${slug}.svg already exists — using it with hero fields.`);
  } else {
    art = { ...fallbackArt(slug, track), label: 'deterministic fallback art' };
  }

  const heroFields = art
    ? [
        `heroImage: ${yaml(`../../assets/art/${slug}-light.webp`)}`,
        `heroImageDark: ${yaml(`../../assets/art/${slug}-dark.webp`)}`,
        `heroAlt: ${yaml(art.alt)}`,
      ]
    : [];

  const frontmatter = [
    '---',
    `title: ${yaml(title)}`,
    `description: ${yaml(description)}`,
    `pubDate: ${pubDate}`,
    // Same-day posts sort by this, newest first (src/lib/posts.ts).
    `publishedAt: ${yaml(new Date().toISOString())}`,
    `track: ${track}`,
    ...(question ? [`question: ${yaml(question)}`] : []),
    ...(keywords.length ? ['keywords:', ...keywords.map((k) => `  - ${k}`)] : []),
    ...heroFields,
    `readingTime: ${yaml(readingTime(words))}`,
    // The back-reference that lets close-loop.mjs find this row again.
    `notionId: ${yaml(id)}`,
    '---',
    '',
  ].join('\n');

  // Record how this article should reach the site. The workflow needs it to
  // decide between a direct push to main and a pull request, and that has to
  // be per article: a run can mix an unattended Talks piece with a Technical
  // draft the owner is still reviewing.
  //
  // The TRACK decides this, not the status. An unattended track goes straight
  // to main whether it arrived as Draft Ready or as Approved — the owner
  // ticking Approved on a Case Study is them agreeing with a decision that was
  // already automatic, and it must not demote the article into a queue that
  // waits on them again.
  //
  // Recorded before the dry-run exit so a dry run reports the real split.
  const trackName = (p['Track']?.select?.name ?? '').trim();
  const auto = AUTO_TRACKS.includes(trackName);
  // `id` rides along so a later pipeline failure (build, artwork, PR) can write
  // its reason back onto this exact row — see flag-pipeline-failure.mjs.
  manifest[auto ? 'auto' : 'reviewed'].push({ id, slug, title, track: trackName, key: sheetKey, attempts });

  if (dryRun) {
    written.push(`${slug}.md (${words} words) [dry run]`);
    continue;
  }

  // The artwork brief rides along as a comment so it is visible in the PR diff,
  // right where the artwork still needs drawing, and invisible to readers.
  const trailer = lifted.brief
    ? `\n<!--\nArtwork brief — from the writer routine. Draw per docs/ARTWORK.md,\nthen delete this comment.\n\n${lifted.brief}\n-->\n`
    : '';

  mkdirSync(BLOG, { recursive: true });
  writeFileSync(file, frontmatter + markdown + trailer, 'utf8');
  if (art) {
    mkdirSync(ART_SRC, { recursive: true });
    writeFileSync(svgFile, art.svg.endsWith('\n') ? art.svg : art.svg + '\n', 'utf8');
    console.log(`  · ${slug}.svg — ${art.label}; render with npm run images`);
  }
  written.push(`${slug}.md (${words} words)`);
  clearBlocked.push({
    id,
    title,
    warnCodes: [...new Set(warnings.map((w) => w.code))],
    // A "publishing then failed" note from a previous run must survive until the
    // article is actually live (close-loop clears it), or flag-pipeline-failure
    // could never tell a second failure from a first one.
    keepReason: plain(p['Blocked Reason']?.rich_text).includes('publishing then failed at'),
  });
}

// A manifest rather than parsed stdout. `git status` cannot tell an unattended
// article from a reviewed one, and guessing from the diff is how a draft that
// was still being reviewed would end up pushed to main.
//
// A dry run reports and writes nothing at all, this file included.
if (!dryRun) {
  writeFileSync(join(here, '..', 'publish-manifest.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8');
}

for (const s of skipped) console.log(`· ${s}`);
for (const w of written) console.log(`+ ${w}`);
for (const p of problems) console.error(`${p.fatal ? '✗' : '!'} "${p.title}" — ${p.reason}`);

// --check is the writer routines' preflight: one page, every gate, a plain
// verdict and an exit code they can branch on. It writes nothing and never
// touches Notion (checkId forces dryRun above).
if (checkId) {
  const mine = problems.filter((p) => p.fatal);
  if (mine.length) {
    console.error('\n✗ PREFLIGHT FAILED — this draft would be bounced to Needs Revision:');
    for (const p of mine) console.error(`  • ${p.reason}`);
    console.error('\nFix these in the Notion page, then run --check again.');
    process.exit(1);
  }
  for (const p of problems) console.log(`! note: ${p.reason}`);
  if (skipped.length && !written.length) {
    console.log(`\n✓ PREFLIGHT — nothing to do (${skipped[0]}).`);
  } else {
    console.log('\n✓ PREFLIGHT PASSED — this draft clears every publish gate.');
  }
  process.exit(0);
}

// Tell Notion, not just the log.
//
// The whole point of the Approved gate is that a human flips it and walks away.
// When the generator then refuses, the only signal used to be a red run in
// GitHub Actions — a place nobody watches. So an approved article could sit
// unpublished indefinitely with no indication of why. The reason now goes back
// onto the row the human is already looking at, and anything blocking is moved
// out of Approved so the queue reflects reality.
const fatal = problems.filter((p) => p.fatal);
// Drafts whose rejection never made it onto the Notion row. Starts at "all of
// them" and counts down as each write-back succeeds; whatever is left is the
// only thing a red Actions run would still be telling anyone (see the exit
// condition at the bottom).
let unreported = fatal.length;
if (!dryRun && fatal.length) {
  const exhausted = [];
  for (const p of fatal) {
    // Only Sheet-harness rows (keyed) escalate; pre-harness rows keep the old
    // behaviour of waiting in Needs Revision for the owner.
    const route = routeFailure({ key: p.key, attempts: p.attempts, codes: p.codes });
    const atLimit = route === 'human';
    if (atLimit) {
      exhausted.push(p.title);
      recordNeedsHuman({ id: p.id, title: p.title, key: p.key, track: p.track, codes: p.codes, attempts: p.attempts, reason: p.reason });
    }
    const reason = atLimit ? `NEEDS YOU (${p.attempts} repair attempts; not auto-repairable). ${p.reason}` : p.reason;
    if (await flagBlocked(p.id, reason, { needsRevision: true, codes: p.codes, findings: p.findings })) {
      unreported--;
      console.error(`  ↳ marked "${p.title}" Needs Revision in Notion [${p.codes.join(', ')}]`);
    }
    // flagBlocked already logged a ::warning:: if it could not write; that row
    // stays counted in `unreported`, which keeps the run red — Actions is then
    // the last signal left.
  }
  if (exhausted.length) {
    await notify(
      'Article needs you',
      `${exhausted.length} draft(s) need you (repair limit ${REPAIR.maxAttempts} reached, or not auto-repairable): ${exhausted.slice(0, 3).join(', ')}. A GitHub issue has the details.`,
      { url: 'https://www.notion.so/d39ea073cc874c258a3cd9f276a59b68' }
    );
  }
}

// Clear a stale block off anything that has now published successfully, and
// record any warn-level codes it shipped with (that is the failure log).
if (!dryRun) {
  for (const { id, title, warnCodes, keepReason } of clearBlocked) {
    if (!(await clearBlockedReason(id, warnCodes, { keepReason }))) {
      console.error(`  ↳ could not clear Blocked Reason for "${title}"`);
    }
  }
}

if (written.length) {
  console.log(`\n${written.length} article(s) staged. Run npm run images to render any new artwork.`);
  if (manifest.auto.length) {
    console.log(`  ${manifest.auto.length} from an unattended track — these go straight to main.`);
  }
  if (manifest.reviewed.length) {
    console.log(`  ${manifest.reviewed.length} awaiting a read-through — these go out as a pull request.`);
  }
  console.log('');
}
if (!written.length && !problems.length) console.log('Nothing to publish.');

// A malformed draft is a real failure — but it is *that draft's* failure, and it
// has already been bounced to Needs Revision in Notion, which is where the owner
// actually looks. Failing the whole step on it strands every healthy article in
// the same run: on 2026-08-26 one over-long title held two finished, valid
// articles out of the PR entirely.
//
// Once the reason is on the Notion row, the handling is complete. Turning the
// Actions run red on top of that just cries wolf in a place nobody watches — the
// 2026-08-27 16:33 run went red purely for two over-long meta descriptions that
// were both correctly bounced. So the run now fails only when a rejection could
// NOT be written back to Notion and nothing else shipped: that is the one case
// where a red run is the last remaining signal. A clean rejection is a yellow
// ::warning:: annotation (emitted above), not a failure.
if (fatal.length) {
  const verb = dryRun ? 'would be rejected' : 'rejected and marked Needs Revision in Notion';
  console.error(
    `\n${fatal.length} draft(s) ${verb}:\n` +
      fatal.map((f) => `  ✗ ${f.title} — ${f.reason}`).join('\n') +
      '\n'
  );
}
process.exit(!dryRun && unreported > 0 && !written.length ? 1 : 0);
