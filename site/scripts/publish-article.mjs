/**
 * Turns every Approved article in Notion into a markdown file in the site.
 *
 *   node scripts/publish-article.mjs           # write any that are missing
 *   node scripts/publish-article.mjs --dry-run # report only
 *
 * `Draft Status = Approved` is the trigger, and it is a value only a human
 * writes — no routine is permitted to set it. This script therefore never
 * decides *whether* to publish; it only does the mechanical part once that
 * decision has been made, and it stops at a file on disk. Nothing here pushes,
 * deploys, or writes back to Notion.
 *
 * It exits 0 having written nothing when there is no work, so it is safe to run
 * on a schedule.
 */
import { writeFileSync, existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { queryAll, blocks, toMarkdown, plain, inline, PRODUCTION_DS } from './lib/notion.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const BLOG = join(here, '..', 'src', 'content', 'blog');
const dryRun = process.argv.includes('--dry-run');

// These mirror src/content.config.ts. Failing here gives a readable message
// instead of a Zod error thrown halfway through an Astro build.
const MAX_TITLE = 70;
const MAX_DESC = 160;
// Matches the `question` cap in src/content.config.ts. Enforced here so the
// message is readable instead of a Zod error mid-build, same as the other two.
const MAX_QUESTION = 120;

const slugify = (s) =>
  s.toLowerCase().replace(/['']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const yaml = (s) => `'${String(s).replace(/'/g, "''")}'`;

function readingTime(words) {
  return `${Math.max(1, Math.round(words / 220))} min read`;
}

/**
 * Lifts the trailing "## Artwork brief" section out of the article body.
 *
 * The writer routine appends it because it has just read every source and is
 * the right one to decide what the plate should mean — but it is a note to
 * whoever draws the artwork, not something a reader should ever see. It is
 * re-emitted as an HTML comment at the end of the file, so it travels in the
 * PR diff, sits next to the work it describes, and renders as nothing.
 */
function liftArtworkBrief(markdown) {
  const lines = markdown.split('\n');
  const start = lines.findIndex((l) => /^##\s+Artwork brief\s*$/i.test(l));
  if (start === -1) return { markdown, brief: null };

  // Runs to the next H2, or to the end — it is normally the last section.
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (/^##\s+/.test(lines[i])) {
      end = i;
      break;
    }
  }

  const brief = lines
    .slice(start + 1, end)
    .join('\n')
    .trim();
  const rest = [...lines.slice(0, start), ...lines.slice(end)].join('\n').trimEnd();
  return { markdown: rest + '\n', brief: brief || null };
}

/**
 * Wraps a leading "## Executive TL;DR" section in the .tldr plate.
 *
 * The writer routine emits the TL;DR as an ordinary Notion heading plus bullets,
 * because asking it to hand-write raw HTML into a Notion block is a good way to
 * get a broken div. The markup is applied here instead, where it is
 * deterministic and testable.
 *
 * The blank lines around the content are load-bearing: they are what let the
 * markdown inside the div still be parsed as markdown. Do not "tidy" them away
 * — and note this is the opposite of the rule for inline <svg>, where a blank
 * line terminates the HTML block and breaks it. See docs/HANDOFF.md §6.
 */
function wrapTldr(markdown) {
  const lines = markdown.split('\n');
  const start = lines.findIndex((l) => l.trim() !== '');
  if (start === -1 || !/^##\s+Executive TL;DR\s*$/i.test(lines[start])) return markdown;

  // The section runs until the next H2, or to the end if it is the only one.
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (/^##\s+/.test(lines[i])) {
      end = i;
      break;
    }
  }

  const body = lines.slice(start, end).join('\n').trimEnd();
  const rest = lines.slice(end).join('\n').trimStart();
  return `<div class="tldr">\n\n${body}\n\n</div>\n\n${rest}`;
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

const rows = await queryAll(PRODUCTION_DS, {
  property: 'Draft Status',
  select: { equals: 'Approved' },
});

const written = [];
const skipped = [];

// Rejections used to be strings printed to a log nobody reads. The run went red
// in Actions and the human, who works in Notion, never found out why their
// approved article did not appear. Each entry now carries the page it belongs
// to so the reason can be written back to the row itself.
const problems = [];
const blocked = (id, title, reason) => problems.push({ id, title, reason, fatal: true });
const note = (id, title, reason) => problems.push({ id, title, reason, fatal: false });
// Rows that published cleanly this run, so any Blocked Reason left over from a
// previous failure can be wiped.
const clearBlocked = [];

for (const page of rows) {
  const p = page.properties;
  const title = plain(p.Name?.title).trim();
  const id = page.id;

  if (existingIds.has(id) || existingIds.has(id.replace(/-/g, ''))) {
    skipped.push(`${title} — already in the repo`);
    continue;
  }

  const list = await blocks(id);
  const { header, body } = await parseHeader(list);

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

  // Fail loudly and specifically. These caps are deliberate: they already
  // caught a 193-character description that search would have truncated.
  if (title.length > MAX_TITLE) {
    blocked(id, title, `Title is ${title.length} characters; the maximum is ${MAX_TITLE}. Shorten the page name.`);
    continue;
  }
  if (!description) {
    blocked(
      id,
      title,
      'No "Meta description:" line found in the opening callout. Add a callout at the top of this page containing a line like "Meta description: <under 160 characters>".'
    );
    continue;
  }
  if (description.length > MAX_DESC) {
    blocked(
      id,
      title,
      `Meta description is ${description.length} characters; the maximum is ${MAX_DESC}. Shorten it in the opening callout.`
    );
    continue;
  }

  const lifted = liftArtworkBrief(toMarkdown(body));
  const markdown = wrapTldr(lifted.markdown);
  const words = markdown.split(/\s+/).filter((w) => /\w/.test(w)).length;
  const hasTldr = markdown.startsWith('<div class="tldr">');
  const keywords = plain(p['SEO Keywords']?.rich_text)
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);
  const pubDate = p['Draft Completed']?.date?.start ?? new Date().toISOString().slice(0, 10);

  // Editorial theme. Notion holds it title-cased ("Technical"); the content
  // schema wants the lowercase id. Anything unset or unrecognised falls back to
  // technical, which is also the schema default — a missing Track must never be
  // able to fail a build. These three strings must match the enum in
  // src/content.config.ts and the Notion select exactly.
  const TRACKS = ['technical', 'business', 'basics'];
  const rawTrack = (p['Track']?.select?.name ?? '').trim().toLowerCase();
  const track = TRACKS.includes(rawTrack) ? rawTrack : 'technical';
  if (rawTrack && !TRACKS.includes(rawTrack)) {
    note(id, title, `Unknown Track "${rawTrack}" — filed under technical.`);
  }

  // The reader question the piece answers. Optional, capped to match the schema.
  const question = plain(p['Reader Question']?.rich_text).trim();
  if (question.length > MAX_QUESTION) {
    blocked(
      id,
      title,
      `Reader Question is ${question.length} characters; the maximum is ${MAX_QUESTION}. Shorten it.`
    );
    continue;
  }

  // Not fatal — a missing TL;DR is a review note, not a broken article. But it
  // used to be silent, and "the generator does not write a TL;DR" then sat in
  // the docs as a permanent manual step.
  if (!hasTldr) {
    note(
      id,
      title,
      'No "Executive TL;DR" heading at the top, so this published without the summary plate the other posts open with.'
    );
  }

  const frontmatter = [
    '---',
    `title: ${yaml(title)}`,
    `description: ${yaml(description)}`,
    `pubDate: ${pubDate}`,
    `track: ${track}`,
    ...(question ? [`question: ${yaml(question)}`] : []),
    ...(keywords.length ? ['keywords:', ...keywords.map((k) => `  - ${k}`)] : []),
    `readingTime: ${yaml(readingTime(words))}`,
    // The back-reference that lets close-loop.mjs find this row again.
    `notionId: ${yaml(id)}`,
    '---',
    '',
  ].join('\n');

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
  written.push(`${slug}.md (${words} words)`);
  clearBlocked.push({ id, title });
}

for (const s of skipped) console.log(`· ${s}`);
for (const w of written) console.log(`+ ${w}`);
for (const p of problems) console.error(`${p.fatal ? '✗' : '!'} "${p.title}" — ${p.reason}`);

// Tell Notion, not just the log.
//
// The whole point of the Approved gate is that a human flips it and walks away.
// When the generator then refuses, the only signal used to be a red run in
// GitHub Actions — a place nobody watches. So an approved article could sit
// unpublished indefinitely with no indication of why. The reason now goes back
// onto the row the human is already looking at, and anything blocking is moved
// out of Approved so the queue reflects reality.
const fatal = problems.filter((p) => p.fatal);
if (!dryRun && fatal.length) {
  for (const p of fatal) {
    try {
      await api(`/pages/${p.id}`, {
        method: 'PATCH',
        body: {
          properties: {
            'Draft Status': { select: { name: 'Needs Revision' } },
            'Blocked Reason': {
              rich_text: [
                {
                  type: 'text',
                  text: { content: `${p.reason} (checked ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC)`.slice(0, 2000) },
                },
              ],
            },
          },
        },
      });
      console.error(`  ↳ marked "${p.title}" Needs Revision in Notion`);
    } catch (err) {
      // Never let the write-back mask the original problem.
      console.error(`  ↳ could not update Notion for "${p.title}": ${err.message}`);
    }
  }
}

// Clear a stale block off anything that has now published successfully.
if (!dryRun) {
  for (const { id, title } of clearBlocked) {
    try {
      await api(`/pages/${id}`, {
        method: 'PATCH',
        body: { properties: { 'Blocked Reason': { rich_text: [] } } },
      });
    } catch {
      console.error(`  ↳ could not clear Blocked Reason for "${title}"`);
    }
  }
}

if (written.length) {
  console.log(
    `\n${written.length} article(s) staged. Still needed before these are worth shipping:\n` +
      `  · artwork — the brief is in an HTML comment at the foot of the file; see docs/ARTWORK.md, then npm run images\n` +
      `  · a read-through — these were drafted by a routine\n`
  );
}
if (!written.length && !problems.length) console.log('Nothing approved and unpublished.');

// A malformed draft is a real failure and should turn the run red — but only a
// blocking one. A note is a review remark, not a broken pipeline.
process.exit(fatal.length ? 1 : 0);
