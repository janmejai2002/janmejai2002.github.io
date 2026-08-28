/**
 * The pipeline's Notion access, as a CLI.
 *
 * The routines used to reach Notion through the account MCP connector — ~40 tool
 * schemas loaded into every cold run. A Bash call to this script costs zero
 * schema tokens and goes through the same REST helpers CI already uses
 * (lib/notion.mjs). Read verbs are safe to run anytime; write verbs touch the
 * live pipeline and print what they would do unless `--commit` is passed.
 *
 *   node scripts/notion.mjs radar [--unrated] [--track Technical] [--json]
 *   node scripts/notion.mjs covered "text to look for"
 *   node scripts/notion.mjs get <page-id> [--json]
 *   node scripts/notion.mjs set-status <page-id> "Draft Ready" [--commit]
 *   node scripts/notion.mjs file-idea --track Technical --title "..." --question "..." [--pitch-file p.md] [--keywords "a, b, c"] [--commit]
 *   node scripts/notion.mjs promote <radar-idea-id> [--commit]
 *
 * Property schema verified against the live databases 2026-08-28. `promote`
 * sets the Source Idea relation and flips the radar row to Status = Drafting.
 *
 * NEVER sets Draft Status = Approved — that is the owner's alone, on every
 * track. set-status refuses it outright.
 */
import { readFileSync } from 'node:fs';
import {
  api,
  queryAll,
  blocksDeep,
  toMarkdown,
  plain,
  PIPELINE_DS,
  PRODUCTION_DS,
} from './lib/notion.mjs';

const argv = process.argv.slice(2);
const verb = argv[0];
const has = (f) => argv.includes(f);
const val = (f, d = null) => {
  const i = argv.indexOf(f);
  return i >= 0 ? argv[i + 1] : d;
};
const commit = has('--commit');
const asJson = has('--json');
const die = (msg) => {
  console.error(msg);
  process.exit(1);
};

// Notion property helpers that do not assume a property name.
const titleKey = (props) =>
  Object.keys(props).find((k) => props[k]?.type === 'title') ?? 'Name';
const titleOf = (page) => plain(page.properties[titleKey(page.properties)]?.title).trim();
const sel = (props, name) => props[name]?.select?.name ?? null;
const rich = (props, name) => plain(props[name]?.rich_text).trim();

async function cmdRadar() {
  const track = val('--track');
  const rows = await queryAll(PIPELINE_DS);
  let list = rows.map((r) => ({
    id: r.id,
    title: titleOf(r),
    status: sel(r.properties, 'Status'),
    rating: sel(r.properties, 'Interest Rating'),
    track: sel(r.properties, 'Track'),
    question: rich(r.properties, 'Reader Question'),
    created: r.created_time,
  }));
  if (track) list = list.filter((r) => (r.track ?? '').toLowerCase() === track.toLowerCase());
  if (has('--unrated')) list = list.filter((r) => r.status === 'Radar Idea' && !r.rating);
  if (asJson) return void console.log(JSON.stringify(list, null, 2));
  if (!list.length) return void console.log('(no matching radar rows)');
  for (const r of list) {
    console.log(
      `${r.rating ? `[${r.rating[0]}]` : '[ ]'} ${r.track ?? '?'.padEnd(10)}  ${r.title}` +
        `\n      ${r.status ?? '?'} · ${r.id}`
    );
  }
}

async function cmdCovered() {
  const needle = argv.find((a, i) => i > 0 && !a.startsWith('--'));
  if (!needle) die('Usage: notion.mjs covered "text"');
  const q = needle.toLowerCase();
  const hits = [];
  for (const [label, ds] of [
    ['radar', PIPELINE_DS],
    ['production', PRODUCTION_DS],
  ]) {
    const rows = await queryAll(ds);
    for (const r of rows) {
      const t = titleOf(r);
      const question = rich(r.properties, 'Reader Question');
      if (t.toLowerCase().includes(q) || question.toLowerCase().includes(q)) {
        hits.push(`${label}: ${t}${question ? ` — "${question}"` : ''} (${sel(r.properties, 'Status') ?? sel(r.properties, 'Draft Status') ?? '?'})`);
      }
    }
  }
  if (!hits.length) {
    console.log(`CLEAR — nothing in the pipeline matches "${needle}".`);
    return;
  }
  console.log(`COVERED — ${hits.length} match(es) for "${needle}":`);
  for (const h of hits) console.log(`  · ${h}`);
}

async function cmdGet() {
  const id = argv[1];
  if (!id || id.startsWith('--')) die('Usage: notion.mjs get <page-id>');
  const page = await api(`/pages/${id}`);
  const props = page.properties;
  const summary = {
    id: page.id,
    title: titleOf(page),
    url: page.url,
    props: Object.fromEntries(
      Object.entries(props).map(([k, v]) => {
        if (v.type === 'select') return [k, v.select?.name ?? null];
        if (v.type === 'rich_text') return [k, plain(v.rich_text).trim()];
        if (v.type === 'title') return [k, plain(v.title).trim()];
        if (v.type === 'date') return [k, v.date?.start ?? null];
        if (v.type === 'url') return [k, v.url ?? null];
        if (v.type === 'multi_select') return [k, v.multi_select.map((s) => s.name)];
        return [k, `<${v.type}>`];
      })
    ),
  };
  if (asJson) {
    let body = '';
    try {
      body = toMarkdown(await blocksDeep(id));
    } catch (e) {
      body = `<<body did not convert: ${e.message}>>`;
    }
    return void console.log(JSON.stringify({ ...summary, body }, null, 2));
  }
  console.log(summary.title);
  console.log('─'.repeat(summary.title.length || 8));
  for (const [k, v] of Object.entries(summary.props)) console.log(`${k}: ${Array.isArray(v) ? v.join(', ') : v}`);
  console.log('\n--- body ---\n');
  try {
    console.log(toMarkdown(await blocksDeep(id)));
  } catch (e) {
    console.log(`<<body did not convert: ${e.message}>>`);
  }
}

async function cmdSetStatus() {
  const id = argv[1];
  const status = argv[2];
  if (!id || !status) die('Usage: notion.mjs set-status <page-id> "<status>" [--commit]');
  if (/^approved$/i.test(status.trim())) {
    die('Refusing to set Draft Status = Approved. That field is the owner\'s alone, on every track.');
  }
  if (!commit) {
    console.log(`[dry run] would set Draft Status = "${status}" on ${id}. Re-run with --commit.`);
    return;
  }
  await api(`/pages/${id}`, {
    method: 'PATCH',
    body: { properties: { 'Draft Status': { select: { name: status } } } },
  });
  console.log(`Draft Status = "${status}" set on ${id}.`);
}

async function cmdFileIdea() {
  const track = val('--track');
  const question = val('--question');
  const title = val('--title');
  const pitchFile = val('--pitch-file');
  if (!track || !title) die('Usage: notion.mjs file-idea --track <T> --title "..." [--question "..."] [--pitch-file p.md] [--commit]');
  const keywords = val('--keywords');
  const pitch = pitchFile ? readFileSync(pitchFile, 'utf8').trim() : '';
  // Schema (verified 2026-08-28): PIPELINE has Name(title), Status(select:
  // Radar Idea|Drafting|Ready for Polish|Published), Track(select), Pitch(rich_text),
  // Reader Question(rich_text), SEO Keywords(rich_text). Interest Rating + Remarks
  // are the owner's — never set here.
  const props = {
    Name: { title: [{ type: 'text', text: { content: title.slice(0, 2000) } }] },
    Status: { select: { name: 'Radar Idea' } },
    Track: { select: { name: track } },
  };
  if (question) props['Reader Question'] = { rich_text: [{ type: 'text', text: { content: question.slice(0, 2000) } }] };
  if (pitch) props['Pitch'] = { rich_text: [{ type: 'text', text: { content: pitch.slice(0, 2000) } }] };
  if (keywords) props['SEO Keywords'] = { rich_text: [{ type: 'text', text: { content: keywords.slice(0, 2000) } }] };
  const body = pitch
    ? { children: [{ object: 'block', type: 'paragraph', paragraph: { rich_text: [{ type: 'text', text: { content: pitch.slice(0, 1900) } }] } }] }
    : {};
  if (!commit) {
    console.log('[dry run] would create a Radar Idea row:');
    console.log(JSON.stringify({ properties: props, ...body }, null, 2));
    console.log('\nVerify the property names against the live database, then re-run with --commit.');
    return;
  }
  const page = await api('/pages', {
    method: 'POST',
    body: { parent: { data_source_id: PIPELINE_DS }, properties: props, ...body },
  });
  console.log(`Filed: ${page.id}`);
}

async function cmdPromote() {
  const ideaId = argv[1];
  if (!ideaId || ideaId.startsWith('--')) die('Usage: notion.mjs promote <radar-idea-id> [--commit]');
  const idea = await api(`/pages/${ideaId}`);
  const p = idea.properties;
  const title = titleOf(idea);
  const track = sel(p, 'Track');
  const question = rich(p, 'Reader Question');
  const keywords = rich(p, 'SEO Keywords');
  const rating = sel(p, 'Interest Rating');
  const today = new Date().toISOString().slice(0, 10);

  // Schema (verified 2026-08-28): PRODUCTION Draft Status is
  // Queued|Researching|Writing|Draft Ready|Needs Revision|Approved|Published —
  // a promoted-but-not-started row is "Queued". Source Idea is the relation back
  // to the radar row; Notion keeps the radar row's Article relation in sync.
  const props = {
    Name: { title: [{ type: 'text', text: { content: title.slice(0, 2000) } }] },
    'Draft Status': { select: { name: 'Queued' } },
    'Source Idea': { relation: [{ id: ideaId }] },
    'Promoted On': { date: { start: today } },
  };
  if (track) props.Track = { select: { name: track } };
  if (question) props['Reader Question'] = { rich_text: [{ type: 'text', text: { content: question.slice(0, 2000) } }] };
  if (keywords) props['SEO Keywords'] = { rich_text: [{ type: 'text', text: { content: keywords.slice(0, 2000) } }] };
  if (rating) props['Interest Rating'] = { rich_text: [{ type: 'text', text: { content: rating } }] };

  if (!commit) {
    console.log(`[dry run] would create an Article Production row from radar idea ${ideaId}:`);
    console.log(JSON.stringify({ properties: props }, null, 2));
    console.log(`\nand set the radar row's Status = "Drafting". Re-run with --commit.`);
    return;
  }
  const page = await api('/pages', {
    method: 'POST',
    body: { parent: { data_source_id: PRODUCTION_DS }, properties: props },
  });
  // Move the radar row out of the "Radar Idea" bucket so it is not re-picked.
  await api(`/pages/${ideaId}`, {
    method: 'PATCH',
    body: { properties: { Status: { select: { name: 'Drafting' } } } },
  });
  console.log(`Promoted to ${page.id}; radar row ${ideaId} → Drafting.`);
}

const table = {
  radar: cmdRadar,
  covered: cmdCovered,
  get: cmdGet,
  'set-status': cmdSetStatus,
  'file-idea': cmdFileIdea,
  promote: cmdPromote,
};

if (!table[verb]) {
  console.error('Verbs: radar | covered | get | set-status | file-idea | promote');
  console.error('Read verbs run anytime. Write verbs need --commit; without it they print the payload.');
  process.exit(1);
}

await table[verb]();
