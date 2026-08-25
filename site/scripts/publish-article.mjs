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

  const markdown = toMarkdown(body);
  const words = markdown.split(/\s+/).filter((w) => /\w/.test(w)).length;
  const keywords = plain(p['SEO Keywords']?.rich_text)
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);
  const pubDate = p['Draft Completed']?.date?.start ?? new Date().toISOString().slice(0, 10);

  const frontmatter = [
    '---',
    `title: ${yaml(title)}`,
    `description: ${yaml(description)}`,
    `pubDate: ${pubDate}`,
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

  mkdirSync(BLOG, { recursive: true });
  writeFileSync(file, frontmatter + markdown, 'utf8');
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
