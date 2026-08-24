// Refreshes src/data/news.json from the "Wabi Sabi - Interview News Archive"
// Notion database.
//
//   node scripts/sync-news.mjs
//
// PREREQUISITE: the database must be shared with the Notion integration whose
// token you use. In Notion: open the database → ••• → Connections → add the
// integration. Without that you get a 404 "Could not find data_source".
//
// Token comes from $NOTION_TOKEN, else C:/Users/Janmejai/Notion/.env.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const OUT = join(here, '..', 'src', 'data', 'news.json');
const DATA_SOURCE_ID = '288c805b-3d3f-46ae-98e4-893ab3e6d562';
const ENV_PATH = 'C:/Users/Janmejai/Notion/.env';

function token() {
  if (process.env.NOTION_TOKEN) return process.env.NOTION_TOKEN;
  const line = readFileSync(ENV_PATH, 'utf8')
    .split(/\r?\n/)
    .find((l) => l.startsWith('NOTION_TOKEN='));
  if (!line) throw new Error(`No NOTION_TOKEN in env or ${ENV_PATH}`);
  return line.slice('NOTION_TOKEN='.length).trim().replace(/^["']|["']$/g, '');
}

const plain = (rich) => (rich ?? []).map((r) => r.plain_text).join('').trim();

const auth = token();
const rows = [];
let cursor;

do {
  const res = await fetch(`https://api.notion.com/v1/data_sources/${DATA_SOURCE_ID}/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${auth}`,
      'Notion-Version': '2025-09-03',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      page_size: 100,
      ...(cursor ? { start_cursor: cursor } : {}),
      sorts: [{ property: 'Date', direction: 'descending' }],
    }),
  });

  if (!res.ok) {
    console.error(`Notion ${res.status}: ${await res.text()}`);
    console.error('\nIf this is a 404, share the database with your integration (see header).');
    console.error('src/data/news.json was left unchanged.');
    process.exit(1);
  }

  const json = await res.json();

  for (const page of json.results) {
    const p = page.properties;
    const headline = plain(p.Headline?.title);
    const date = p.Date?.date?.start ?? null;
    if (!headline || !date) continue;
    rows.push({
      headline,
      date,
      category: p.Category?.select?.name ?? 'Uncategorised',
      summary: plain(p.Summary?.rich_text),
      angle: plain(p['Interview Angle']?.rich_text),
      source: p.Source?.url ?? null,
    });
  }

  cursor = json.has_more ? json.next_cursor : undefined;
} while (cursor);

rows.sort((a, b) => b.date.localeCompare(a.date) || a.headline.localeCompare(b.headline));

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(rows, null, 2) + '\n', 'utf8');

console.log(`Wrote ${rows.length} entries → src/data/news.json`);
console.log(`Range: ${rows.at(-1).date} → ${rows[0].date}`);
console.log(`Categories: ${[...new Set(rows.map((r) => r.category))].sort().join(', ')}`);
