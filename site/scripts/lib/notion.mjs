/**
 * Minimal Notion REST helpers, shared by the publish scripts.
 *
 * No SDK on purpose: sync-news.mjs already talks to the API with plain fetch,
 * and one dependency-free module is easier to run in CI than a package.
 *
 * Token resolution: $NOTION_TOKEN first (that is what GitHub Actions provides),
 * falling back to the local .env so the scripts also run on this machine.
 */
import { readFileSync } from 'node:fs';

const NOTION_VERSION = '2025-09-03';
const LOCAL_ENV = 'C:/Users/Janmejai/Notion/.env';

export const PIPELINE_DS = '511e41a3-c1cd-47e0-8fa2-d319feef0ced';
export const PRODUCTION_DS = 'd39ea073-cc87-4c25-8a3c-d9f276a59b68';

export function token() {
  if (process.env.NOTION_TOKEN) return process.env.NOTION_TOKEN.trim();
  try {
    const line = readFileSync(LOCAL_ENV, 'utf8')
      .split(/\r?\n/)
      .find((l) => l.startsWith('NOTION_TOKEN='));
    if (line) return line.slice('NOTION_TOKEN='.length).trim().replace(/^["']|["']$/g, '');
  } catch {
    /* not on the authoring machine — fall through to the error below */
  }
  throw new Error('No NOTION_TOKEN in the environment. In CI, set it as a repository secret.');
}

export async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(`https://api.notion.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token()}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) {
    throw new Error(`Notion ${res.status} on ${method} ${path}: ${await res.text()}`);
  }
  return res.json();
}

/**
 * Writes a reason onto a row's `Blocked Reason`, optionally flipping it to
 * `Needs Revision`. The one rule for unattended failure on this project: the
 * owner works in Notion, so a failure has to show up there and not only in a
 * red Actions run nobody watches. Shared by publish-article.mjs (draft
 * rejected), close-loop.mjs (a live URL never came up) and
 * flag-pipeline-failure.mjs (the build or the PR step failed in CI).
 *
 * Never throws — a failed write-back must not mask the failure it reports.
 * Returns true on success, false otherwise.
 */
export async function flagBlocked(pageId, reason, { needsRevision = false } = {}) {
  const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
  const properties = {
    'Blocked Reason': {
      rich_text: [{ type: 'text', text: { content: `${reason} (checked ${stamp} UTC)`.slice(0, 2000) } }],
    },
  };
  if (needsRevision) properties['Draft Status'] = { select: { name: 'Needs Revision' } };
  try {
    await api(`/pages/${pageId}`, { method: 'PATCH', body: { properties } });
    return true;
  } catch (err) {
    console.error(`::warning::could not write Blocked Reason to ${pageId}: ${err.message}`);
    return false;
  }
}

/** Wipes `Blocked Reason` off a row that has since gone through cleanly. Never throws. */
export async function clearBlockedReason(pageId) {
  try {
    await api(`/pages/${pageId}`, { method: 'PATCH', body: { properties: { 'Blocked Reason': { rich_text: [] } } } });
    return true;
  } catch {
    return false;
  }
}

/** Query a data source, following pagination. */
export async function queryAll(dataSourceId, filter) {
  const out = [];
  let cursor;
  do {
    const json = await api(`/data_sources/${dataSourceId}/query`, {
      method: 'POST',
      body: { page_size: 100, ...(filter ? { filter } : {}), ...(cursor ? { start_cursor: cursor } : {}) },
    });
    out.push(...json.results);
    cursor = json.has_more ? json.next_cursor : undefined;
  } while (cursor);
  return out;
}

export async function blocks(blockId) {
  const out = [];
  let cursor;
  do {
    const qs = new URLSearchParams({ page_size: '100', ...(cursor ? { start_cursor: cursor } : {}) });
    const json = await api(`/blocks/${blockId}/children?${qs}`);
    out.push(...json.results);
    cursor = json.has_more ? json.next_cursor : undefined;
  } while (cursor);
  return out;
}

/**
 * Like blocks(), but also pulls the rows of any `table` block and stashes them
 * on it as `table.children`, so the sync toMarkdown() can render the table
 * without doing I/O of its own.
 *
 * A table is the one nested structure the writer routines legitimately emit and
 * everything else the generator produces is flat, so the recursion is kept to
 * tables only: one extra request per table, and no risk of dragging in
 * unrelated nested content. Before this existed, a single table in a draft threw
 * "Unhandled Notion block type" and took the entire publish poll down with it.
 */
export async function blocksDeep(blockId) {
  const list = await blocks(blockId);
  for (const b of list) {
    if (b.type === 'table' && b.has_children) {
      b.table.children = await blocks(b.id);
    }
  }
  return list;
}

export const plain = (rich) => (rich ?? []).map((r) => r.plain_text).join('');

/** Rich text → inline markdown, preserving links and the usual annotations. */
export function inline(rich) {
  return (rich ?? [])
    .map((r) => {
      let t = r.plain_text;
      if (!t) return '';
      const a = r.annotations ?? {};
      // Code first: markdown does not nest emphasis inside a code span.
      if (a.code) return `\`${t}\``;
      if (a.bold) t = `**${t}**`;
      if (a.italic) t = `*${t}*`;
      if (a.strikethrough) t = `~~${t}~~`;
      if (r.href) t = `[${t}](${r.href})`;
      return t;
    })
    .join('');
}

/**
 * Notion blocks → markdown.
 *
 * Deliberately supports only what the writer routine actually emits. An
 * unknown block type throws rather than being silently dropped: losing a
 * paragraph quietly is much worse than failing the run.
 */
export function toMarkdown(list) {
  const lines = [];
  let lastType = null;

  for (const b of list) {
    const t = b.type;
    const rt = b[t]?.rich_text;
    const gap = () => {
      if (lines.length) lines.push('');
    };

    switch (t) {
      case 'paragraph': {
        const text = inline(rt);
        if (!text.trim()) break; // Notion emits empty paragraphs as spacing
        gap();
        lines.push(text);
        break;
      }
      case 'heading_1':
      case 'heading_2':
      case 'heading_3': {
        gap();
        lines.push(`${'#'.repeat(Number(t.slice(-1)))} ${inline(rt)}`);
        break;
      }
      case 'bulleted_list_item':
      case 'numbered_list_item': {
        if (lastType !== t) gap();
        lines.push(`${t === 'bulleted_list_item' ? '-' : '1.'} ${inline(rt)}`);
        break;
      }
      case 'quote': {
        gap();
        lines.push(`> ${inline(rt)}`);
        break;
      }
      case 'code': {
        gap();
        lines.push('```' + (b.code.language === 'plain text' ? '' : b.code.language));
        lines.push(plain(rt));
        lines.push('```');
        break;
      }
      case 'divider': {
        gap();
        lines.push('---');
        break;
      }
      case 'table': {
        // Rows arrive on b.table.children via blocksDeep(); a plain blocks()
        // fetch leaves them off and the table renders as nothing rather than
        // crashing.
        const rows = (b.table?.children ?? []).filter((r) => r.type === 'table_row');
        if (!rows.length) break;
        gap();
        const cellsOf = (r) =>
          (r.table_row.cells ?? []).map((c) => inline(c).replace(/\|/g, '\\|').replace(/\n+/g, ' ').trim());
        const width = Math.max(...rows.map((r) => cellsOf(r).length));
        const pad = (cs) => {
          while (cs.length < width) cs.push('');
          return cs;
        };
        // GFM needs a header row + separator. Use Notion's column header when it
        // has one; otherwise the first row stands in, which is how most
        // renderers degrade a headerless table anyway.
        rows.forEach((r, i) => {
          lines.push(`| ${pad(cellsOf(r)).join(' | ')} |`);
          if (i === 0) lines.push(`| ${Array(width).fill('---').join(' | ')} |`);
        });
        break;
      }
      case 'table_row':
        break; // consumed by the 'table' case above
      case 'callout': {
        // The writer's opening callout carries the slug and meta description,
        // which become frontmatter. Callers strip it before calling this.
        gap();
        lines.push(inline(rt));
        break;
      }
      case 'table_of_contents':
      case 'breadcrumb':
        break;
      default:
        throw new Error(
          `Unhandled Notion block type "${t}". Add it to toMarkdown() rather than losing the content.`
        );
    }
    lastType = t;
  }

  return lines.join('\n').trim() + '\n';
}
