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
async function parseHeaderCallout(list) {
  if (list[0]?.type !== 'callout') return { header: null, body: list };

  const parts = [plain(list[0].callout.rich_text)];
  if (list[0].has_children) {
    for (const child of await blocks(list[0].id)) {
      parts.push(plain(child[child.type]?.rich_text));
    }
  }
  const text = parts.filter(Boolean).join('\n');

  const grab = (label) =>
    text.match(new RegExp(`${label}\\s*:?\\s*\\**\\s*(.+)`, 'i'))?.[1]?.trim() || null;

  return {
    header: { description: grab('Meta description'), slug: grab('Slug') },
    body: list.slice(1),
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
const problems = [];

for (const page of rows) {
  const p = page.properties;
  const title = plain(p.Name?.title).trim();
  const id = page.id;

  if (existingIds.has(id) || existingIds.has(id.replace(/-/g, ''))) {
    skipped.push(`${title} — already in the repo`);
    continue;
  }

  const list = await blocks(id);
  const { header, body } = await parseHeaderCallout(list);

  const slug = header?.slug || slugify(title);
  const description = header?.description ?? '';
  const file = join(BLOG, `${slug}.md`);

  if (existsSync(file)) {
    skipped.push(`${title} — ${slug}.md exists but carries no notionId; link it by hand`);
    continue;
  }

  // Fail loudly and specifically. These caps are deliberate: they already
  // caught a 193-character description that search would have truncated.
  if (title.length > MAX_TITLE) {
    problems.push(`"${title}" — title is ${title.length} chars, max ${MAX_TITLE}. Shorten it in Notion.`);
    continue;
  }
  if (!description) {
    problems.push(`"${title}" — no "Meta description:" found in the opening callout.`);
    continue;
  }
  if (description.length > MAX_DESC) {
    problems.push(`"${title}" — description is ${description.length} chars, max ${MAX_DESC}.`);
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

  // Editorial track. Notion holds it title-cased ("Systems"); the content
  // schema wants the lowercase id. Anything unset or unrecognised falls back to
  // systems, which is also the schema default — a missing Track must never be
  // able to fail a build.
  const TRACKS = ['systems', 'practice', 'demand'];
  const rawTrack = (p['Track']?.select?.name ?? '').trim().toLowerCase();
  const track = TRACKS.includes(rawTrack) ? rawTrack : 'systems';
  if (rawTrack && !TRACKS.includes(rawTrack)) {
    problems.push(`"${title}" — unknown Track "${rawTrack}"; filed under systems.`);
  }

  // The reader question the piece answers. Optional, capped to match the schema.
  const question = plain(p['Reader Question']?.rich_text).trim();
  if (question.length > MAX_QUESTION) {
    problems.push(
      `"${title}" — Reader Question is ${question.length} chars, max ${MAX_QUESTION}. Shorten it in Notion.`
    );
    continue;
  }

  // Not fatal — a missing TL;DR is a review note, not a broken article. But it
  // used to be silent, and "the generator does not write a TL;DR" then sat in
  // the docs as a permanent manual step.
  if (!hasTldr) {
    problems.push(
      `"${title}" — no "## Executive TL;DR" section at the top; the post will publish without the summary plate.`
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
}

for (const s of skipped) console.log(`· ${s}`);
for (const w of written) console.log(`+ ${w}`);
for (const p of problems) console.error(`✗ ${p}`);

if (written.length) {
  console.log(
    `\n${written.length} article(s) staged. Still needed before these are worth shipping:\n` +
      `  · artwork — see docs/ARTWORK.md, then npm run images\n` +
      `  · an Executive TL;DR block, to match the other posts\n`
  );
}
if (!written.length && !problems.length) console.log('Nothing approved and unpublished.');

// A malformed draft is a real failure and should turn the run red.
process.exit(problems.length ? 1 : 0);
