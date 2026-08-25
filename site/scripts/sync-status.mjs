// Writes src/data/status.json — a snapshot of the pipeline's own state, so the
// /status/ page can show the machine running rather than describe it.
//
//   node scripts/sync-status.mjs
//
// Reads the two pipeline databases. Nothing here is secret: the page shows
// counts and dates, never the pitches or the user's remarks, both of which are
// private editorial thinking.
//
// Token comes from $NOTION_TOKEN, else C:/Users/Janmejai/Notion/.env — same as
// every other script in here.

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PIPELINE_DS, PRODUCTION_DS, queryAll, plain } from './lib/notion.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const OUT = join(here, '..', 'src', 'data', 'status.json');

const TRACKS = ['Technical', 'Business', 'Basics'];
const sel = (p, name) => p[name]?.select?.name ?? null;
const dateOf = (p, name) => p[name]?.date?.start ?? null;

const tally = (rows, fn) => {
  const out = {};
  for (const r of rows) {
    const k = fn(r);
    if (k) out[k] = (out[k] ?? 0) + 1;
  }
  return out;
};

const radar = await queryAll(PIPELINE_DS);
const production = await queryAll(PRODUCTION_DS);

const radarRows = radar.map((r) => ({
  status: sel(r.properties, 'Status'),
  rating: sel(r.properties, 'Interest Rating'),
  track: sel(r.properties, 'Track'),
  created: r.created_time,
}));

const prodRows = production.map((r) => ({
  draft: sel(r.properties, 'Draft Status'),
  track: sel(r.properties, 'Track'),
  completed: dateOf(r.properties, 'Draft Completed'),
  question: plain(r.properties['Reader Question']?.rich_text).trim() || null,
}));

// "Waiting on you" is the number that actually matters: nothing downstream
// moves until a radar idea is rated 4 or 5.
const unrated = radarRows.filter((r) => r.status === 'Radar Idea' && !r.rating).length;
const maybeLater = radarRows.filter((r) => r.rating?.startsWith('3')).length;
const draftReady = prodRows.filter((r) => r.draft === 'Draft Ready').length;
const approved = prodRows.filter((r) => r.draft === 'Approved').length;
const inFlight = prodRows.filter((r) => r.draft === 'Researching' || r.draft === 'Writing').length;

const newest = (xs) => xs.filter(Boolean).sort().pop() ?? null;

const status = {
  generated: new Date().toISOString(),
  radar: {
    total: radarRows.length,
    unrated,
    maybeLater,
    byStatus: tally(radarRows, (r) => r.status),
    byTrack: Object.fromEntries(
      TRACKS.map((t) => [t, radarRows.filter((r) => r.track === t).length])
    ),
    newestIdea: newest(radarRows.map((r) => r.created)),
  },
  production: {
    total: prodRows.length,
    inFlight,
    draftReady,
    approved,
    byTrack: Object.fromEntries(
      TRACKS.map((t) => [t, prodRows.filter((r) => r.track === t).length])
    ),
    newestDraft: newest(prodRows.map((r) => r.completed)),
  },
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(status, null, 2) + '\n', 'utf8');

console.log(`Wrote status.json`);
console.log(`  radar: ${status.radar.total} ideas, ${unrated} unrated, ${maybeLater} maybe-later`);
console.log(`  production: ${status.production.total} rows, ${inFlight} in flight, ${draftReady} draft-ready, ${approved} approved`);
