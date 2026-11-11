// Refreshes src/data/news.json from:
//   1. Google Sheets (via CSV export from GOOGLE_SHEET_ID)
//   2. Notion database ("Wabi Sabi - Interview News Archive")
//
// When new rows appear in Google Sheets, it automatically pushes them to Notion
// using $NOTION_TOKEN so Notion remains the master archive and control plane.
//
// Dual-source: merges both sources with existing entries on disk, deduplicating
// by (date, headline).

import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const OUT = join(here, '..', 'src', 'data', 'news.json');
const DATA_SOURCE_ID = '288c805b-3d3f-46ae-98e4-893ab3e6d562';
const DEFAULT_SHEET_ID = '1-UcD-C4My_Zp4aH3n-5dB3JQNtDN_MSAK6vTCPt8LY0';

// 1. Load existing entries from disk
let existing = [];
if (existsSync(OUT)) {
  try {
    existing = JSON.parse(readFileSync(OUT, 'utf8'));
  } catch (err) {
    console.warn('Could not read existing news.json:', err.message);
  }
}

const entriesMap = new Map();
const keyOf = (r) => `${(r.date || '').trim()}|${(r.headline || '').trim().toLowerCase()}`;

for (const item of existing) {
  if (item.headline && item.date) {
    entriesMap.set(keyOf(item), item);
  }
}

// RFC 4180 CSV Parser
function parseCSV(text) {
  const lines = [];
  let row = [];
  let inQuotes = false;
  let field = '';

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];

    if (c === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      row.push(field);
      field = '';
    } else if ((c === '\r' || c === '\n') && !inQuotes) {
      if (c === '\r' && next === '\n') i++;
      row.push(field);
      field = '';
      if (row.length > 0 && row.some((f) => f.trim() !== '')) {
        lines.push(row);
      }
      row = [];
    } else {
      field += c;
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field);
    if (row.some((f) => f.trim() !== '')) lines.push(row);
  }
  return lines;
}

// 2. Ingest from Google Sheets
const sheetId = process.env.GOOGLE_SHEET_ID || DEFAULT_SHEET_ID;
const sheetCsvUrl =
  process.env.GOOGLE_SHEET_CSV_URL ||
  // gid=0 is the "News" tab (renamed from Sheet1 on 2026-11-11; renaming keeps the gid).
  (sheetId ? `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0` : null);

const sheetRows = [];

if (sheetCsvUrl) {
  try {
    console.log(`Fetching Google Sheet news feed: ${sheetCsvUrl}`);
    const res = await fetch(sheetCsvUrl);
    if (res.ok) {
      const csvText = await res.text();
      const rows = parseCSV(csvText);
      if (rows.length > 1) {
        const headers = rows[0].map((h) => h.trim().toLowerCase());
        const idx = {
          date: headers.indexOf('date'),
          category: headers.indexOf('category'),
          headline: headers.indexOf('headline'),
          summary: headers.indexOf('summary'),
          angle: headers.findIndex((h) => h.includes('angle')),
          source: headers.indexOf('source'),
        };

        for (let i = 1; i < rows.length; i++) {
          const r = rows[i];
          const headline = (r[idx.headline] ?? '').trim();
          const date = (r[idx.date] ?? '').trim();
          if (!headline || !date) continue;

          const item = {
            headline,
            date,
            category: (r[idx.category] ?? 'Uncategorised').trim() || 'Uncategorised',
            summary: (r[idx.summary] ?? '').trim(),
            angle: (r[idx.angle] ?? '').trim(),
            source: (r[idx.source] ?? '').trim() || null,
          };
          sheetRows.push(item);
          entriesMap.set(keyOf(item), item);
        }
        console.log(`✓ Parsed ${sheetRows.length} rows from Google Sheet`);
      }
    } else {
      console.warn(`Google Sheet fetch returned HTTP ${res.status}: ${res.statusText}`);
    }
  } catch (err) {
    console.warn(`Could not sync from Google Sheet: ${err.message}`);
  }
}

// 3. Ingest from Notion and push new Google Sheet items to Notion
let notionToken = process.env.NOTION_TOKEN;
if (!notionToken) {
  try {
    const { token } = await import('./lib/notion.mjs');
    notionToken = token();
  } catch {
    /* Notion token not configured locally */
  }
}

if (notionToken) {
  try {
    const { plain: plainRaw } = await import('./lib/notion.mjs');
    const plain = (rich) => plainRaw(rich).trim();

    const notionKeys = new Set();
    let cursor;
    let notionCount = 0;

    do {
      const res = await fetch(`https://api.notion.com/v1/data_sources/${DATA_SOURCE_ID}/query`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${notionToken.trim()}`,
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
        console.warn(`Notion ${res.status}: ${await res.text()}`);
        break;
      }

      const json = await res.json();
      for (const page of json.results) {
        const p = page.properties;
        const headline = plain(p.Headline?.title);
        const date = p.Date?.date?.start ?? null;
        if (!headline || !date) continue;
        const item = {
          headline,
          date,
          category: p.Category?.select?.name ?? 'Uncategorised',
          summary: plain(p.Summary?.rich_text),
          angle: plain(p['Interview Angle']?.rich_text),
          source: p.Source?.url ?? null,
        };
        const k = keyOf(item);
        notionKeys.add(k);
        entriesMap.set(k, item);
        notionCount++;
      }
      cursor = json.has_more ? json.next_cursor : undefined;
    } while (cursor);
    console.log(`✓ Parsed ${notionCount} rows from Notion`);

    // Cross-post: Push any row in Google Sheet that is NOT in Notion
    const toPushToNotion = sheetRows.filter((r) => !notionKeys.has(keyOf(r)));
    if (toPushToNotion.length > 0) {
      console.log(`Pushing ${toPushToNotion.length} new Google Sheet entries to Notion...`);
      for (const item of toPushToNotion) {
        try {
          const createRes = await fetch('https://api.notion.com/v1/pages', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${notionToken.trim()}`,
              'Notion-Version': '2025-09-03',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              parent: { type: 'data_source_id', data_source_id: DATA_SOURCE_ID },
              properties: {
                Headline: { title: [{ text: { content: item.headline } }] },
                Date: { date: { start: item.date } },
                Category: { select: { name: item.category } },
                Summary: { rich_text: [{ text: { content: item.summary } }] },
                'Interview Angle': { rich_text: [{ text: { content: item.angle } }] },
                ...(item.source ? { Source: { url: item.source } } : {}),
              },
            }),
          });
          if (createRes.ok) {
            console.log(`  ✓ Synced to Notion: "${item.headline}"`);
          } else {
            console.warn(`  ✗ Failed to sync "${item.headline}": ${await createRes.text()}`);
          }
        } catch (pushErr) {
          console.warn(`  ✗ Error syncing "${item.headline}": ${pushErr.message}`);
        }
      }
    }
  } catch (err) {
    console.warn(`Could not complete Notion sync: ${err.message}`);
  }
}

// 4. Combine, sort, and persist
const merged = Array.from(entriesMap.values());
merged.sort((a, b) => b.date.localeCompare(a.date) || a.headline.localeCompare(b.headline));

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(merged, null, 2) + '\n', 'utf8');

console.log(`Total: ${merged.length} entries written → src/data/news.json (previously ${existing.length})`);
if (merged.length > 0) {
  console.log(`Range: ${merged.at(-1).date} → ${merged[0].date}`);
  console.log(`Categories: ${[...new Set(merged.map((r) => r.category))].sort().join(', ')}`);
}
