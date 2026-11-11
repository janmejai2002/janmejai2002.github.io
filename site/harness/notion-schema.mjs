/**
 * Adds the harness properties to Article Production (additive only — never
 * removes or renames anything). Safe to re-run.
 *   node site/harness/notion-schema.mjs
 */
import { api } from '../scripts/lib/notion.mjs';
import { NOTION, NOTION_HARNESS_PROPS, FAILURES } from './registry.mjs';

const ds = await api(`/data_sources/${NOTION.production}`);
const have = Object.keys(ds.properties);
const add = {};
for (const [name, def] of Object.entries(NOTION_HARNESS_PROPS)) {
  if (name === 'Failure Codes') {
    const existing = ds.properties[name]?.multi_select?.options?.map((o) => o.name) ?? [];
    const missing = Object.keys(FAILURES).filter((c) => !existing.includes(c));
    if (!have.includes(name) || missing.length)
      add[name] = { multi_select: { options: [...existing, ...missing].map((n) => ({ name: n })) } };
  } else if (!have.includes(name)) add[name] = def;
}
if (!Object.keys(add).length) console.log('Article Production already has every harness property.');
else {
  await api(`/data_sources/${NOTION.production}`, { method: 'PATCH', body: { properties: add } });
  console.log('Added/updated:', Object.keys(add).join(', '));
}
