/**
 * Ingests one markdown article draft into Notion Article Production at
 * `Draft Status = Draft Ready`.
 *
 *   node site/scripts/import-draft.mjs <draft.md> [--key DR-20261111-3fa9c2] [--commit]
 *
 * Also used as a module by sync-drafts.mjs (importDraft), including repair mode:
 * `replace: <pageId>` archives the old Notion page and creates the repaired one
 * in its place, carrying Sheet Key, Repair Attempts and the radar link over.
 * (Notion has no "replace page body" call; archive-and-recreate is one request
 * instead of one per block.)
 *
 * Accepts YAML frontmatter or the opening callout lines the Gemini tasks write:
 *   > **Meta description:** ...
 *   > **Slug:** ...
 *   > **Reader Question:** ...
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { api, PRODUCTION_DS } from './lib/notion.mjs';
import { markdownToBlocks, rich } from '../harness/md-to-notion.mjs';
import { TRACKS, CAPS } from '../harness/registry.mjs';

const unquote = (s) => (s ? s.trim().replace(/^["']|["']$/g, '').trim() : '');
const clean = (s) => (s ?? '').replace(/^[*_:\s]+|[*_\s]+$/g, '').trim();

export function parseDraft(raw, defaults = {}) {
  raw = raw.replace(/\r\n/g, '\n');
  const fm = {};
  let body = raw;
  const m = raw.match(/^---\n([\s\S]*?)\n---\n/);
  if (m) {
    for (const k of ['title', 'track', 'question', 'description', 'slug', 'keywords', 'source_idea', 'sourceIdea'])
      fm[k] = unquote(m[1].match(new RegExp(`^${k}:\\s*(.*)$`, 'm'))?.[1]);
    body = raw.slice(m[0].length);
  }
  // Gemini sometimes wraps the whole draft in a ```markdown fence.
  body = body.trim().replace(/^```(?:markdown|md)\s*\n([\s\S]*?)\n```\s*$/i, '$1');
  const label = (name) => clean(body.match(new RegExp(`(?:\\*\\*|__)?${name}:(?:\\*\\*|__)?\\s*([^\\n]+)`, 'i'))?.[1]);

  const title = clean(fm.title || defaults.title || body.match(/^#\s+(.+)$/m)?.[1] || 'Untitled Draft');
  const trackRaw = fm.track || defaults.track || 'Technical';
  const track = TRACKS.find((t) => t.notion.toLowerCase() === trackRaw.toLowerCase())?.notion ?? 'Technical';
  return {
    title,
    track,
    description: fm.description || label('Meta description'),
    slug: (fm.slug || label('Slug') || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')).toLowerCase().replace(/^\/+|\/+$/g, ''),
    question: fm.question || label('Reader Question') || defaults.question || '',
    keywords: fm.keywords || label('SEO Keywords') || defaults.keywords || '',
    sourceIdea: fm.source_idea || fm.sourceIdea || defaults.sourceIdea || '',
    body: body.replace(/^#\s+[^\n]+\n+/, ''), // a body H1 is never allowed
  };
}

/**
 * @param {string} raw  markdown draft
 * @param {object} opts { key, attempt, replace (pageId), carry (properties to copy), commit, defaults }
 * @returns {Promise<{page?:object, draft:object}>}
 */
export async function importDraft(raw, opts = {}) {
  const draft = parseDraft(raw, opts.defaults);
  let body = draft.body;
  // The opening callout must survive as a quote/callout so publish-article's
  // parseHeader finds it. If the draft has none, synthesise one.
  if (!/^\s*>\s*\*{0,2}Meta description/i.test(body)) {
    const lines = [];
    if (draft.description) lines.push(`> **Meta description:** ${draft.description}`);
    lines.push(`> **Slug:** ${draft.slug}`);
    body = lines.join('\n') + '\n\n' + body;
  }
  const blocks = markdownToBlocks(body);
  const today = new Date().toISOString().slice(0, 10);

  const properties = {
    ...(opts.carry ?? {}),
    Name: { title: rich(draft.title.slice(0, CAPS.title)) },
    'Draft Status': { select: { name: opts.status ?? 'Draft Ready' } },
    Track: { select: { name: draft.track } },
    'Reader Question': { rich_text: rich(draft.question.slice(0, CAPS.question)) },
    'Draft Completed': { date: { start: today } },
  };
  if (!opts.carry?.['Promoted On']) properties['Promoted On'] = { date: { start: today } };
  if (draft.keywords) properties['SEO Keywords'] = { rich_text: rich(draft.keywords.slice(0, 2000)) };
  if (draft.sourceIdea) properties['Source Idea'] = { relation: [{ id: draft.sourceIdea }] };
  if (opts.key) properties['Sheet Key'] = { rich_text: rich(opts.key) };
  if (opts.attempt != null) properties['Repair Attempts'] = { number: opts.attempt };

  console.log(
    `  ${opts.replace ? 'REPAIR' : 'IMPORT'} "${draft.title}" (${draft.title.length}/${CAPS.title}) [${draft.track}] ` +
      `key=${opts.key ?? '-'} meta=${draft.description.length}/${CAPS.description} q=${draft.question.length}/${CAPS.question} blocks=${blocks.length}`
  );
  if (!opts.commit) return { draft };

  const page = await api('/pages', {
    method: 'POST',
    body: { parent: { type: 'data_source_id', data_source_id: PRODUCTION_DS }, properties, children: blocks.slice(0, 100) },
  });
  for (let i = 100; i < blocks.length; i += 100) {
    await api(`/blocks/${page.id}/children`, { method: 'PATCH', body: { children: blocks.slice(i, i + 100) } });
  }
  if (opts.replace) await api(`/pages/${opts.replace}`, { method: 'PATCH', body: { in_trash: true } });
  if (draft.sourceIdea && !opts.replace) {
    try {
      await api(`/pages/${draft.sourceIdea}`, { method: 'PATCH', body: { properties: { Status: { select: { name: 'Drafting' } } } } });
    } catch (err) {
      console.warn(`  could not mark radar idea ${draft.sourceIdea} Drafting: ${err.message.split('\n')[0]}`);
    }
  }
  console.log(`  ✓ ${page.url}`);
  return { page, draft };
}

// CLI
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const file = process.argv[2];
  if (!file || file.startsWith('--') || !existsSync(resolve(file))) {
    console.log('Usage: node site/scripts/import-draft.mjs <draft.md> [--key <sheet key>] [--commit]');
    process.exit(1);
  }
  const argv = process.argv;
  const key = argv.includes('--key') ? argv[argv.indexOf('--key') + 1] : undefined;
  const commit = argv.includes('--commit');
  const { page } = await importDraft(readFileSync(resolve(file), 'utf8'), { key, commit });
  if (!commit) console.log('\n[DRY RUN] Pass --commit to create the Notion page.');
  else console.log(`\nPreflight: node site/scripts/publish-article.mjs --check ${page.id}`);
}
