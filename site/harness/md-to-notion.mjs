/**
 * Markdown → Notion blocks, for drafts arriving from the Google Sheet.
 *
 * Deliberately small: it emits only block types toMarkdown() in
 * scripts/lib/notion.mjs converts back losslessly (paragraph, heading_2/3,
 * bulleted/numbered list item, quote, divider, code, table). Inline markdown
 * (**bold**, [links](url), `code`) is kept as literal text; the site re-parses
 * it on the way out, so it round-trips.
 *
 * Tables become real Notion table blocks. They used to become one paragraph per
 * row, which broke four articles in one run (check-build rule 9).
 */

const MAX_RT = 2000; // Notion: characters per rich_text element

export function rich(text) {
  const t = text ?? '';
  if (!t) return [{ type: 'text', text: { content: '' } }];
  const out = [];
  for (let i = 0; i < t.length; i += MAX_RT) out.push({ type: 'text', text: { content: t.slice(i, i + MAX_RT) } });
  return out;
}

const isTableRow = (l) => /^\s*\|.*\|\s*$/.test(l);
const isSeparator = (l) => /^\s*\|(?:\s*:?-{2,}:?\s*\|)+\s*$/.test(l);

function tableBlock(lines) {
  const rows = lines
    .filter((l) => !isSeparator(l))
    .map((l) =>
      l
        .trim()
        .slice(1, -1)
        .split(/(?<!\\)\|/)
        .map((c) => c.trim().replace(/\\\|/g, '|'))
    );
  const width = Math.max(...rows.map((r) => r.length));
  return {
    object: 'block',
    type: 'table',
    table: {
      table_width: width,
      has_column_header: true,
      has_row_header: false,
      children: rows.map((r) => ({
        object: 'block',
        type: 'table_row',
        table_row: { cells: Array.from({ length: width }, (_, i) => rich((r[i] ?? '').slice(0, MAX_RT))) },
      })),
    },
  };
}

export function markdownToBlocks(md) {
  const blocks = [];
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  let i = 0;
  const push = (type, text) => blocks.push({ object: 'block', type, [type]: { rich_text: rich(text) } });

  while (i < lines.length) {
    const line = lines[i];
    const t = line.trim();
    if (!t) { i++; continue; }

    if (t.startsWith('```')) {
      const lang = t.slice(3).trim().toLowerCase();
      const body = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) body.push(lines[i++]);
      i++;
      const language = ['xml', 'svg'].includes(lang) ? 'xml' : ['html', 'python', 'javascript', 'typescript', 'json', 'yaml', 'bash', 'shell', 'sql', 'rust', 'go'].includes(lang) ? lang : 'plain text';
      blocks.push({ object: 'block', type: 'code', code: { language, rich_text: rich(body.join('\n')) } });
      continue;
    }
    if (isTableRow(t)) {
      const rows = [];
      // Tolerate blank lines between rows — Gemini sometimes adds them.
      while (i < lines.length && (isTableRow(lines[i]) || (!lines[i].trim() && isTableRow(lines[i + 1] ?? '')))) {
        if (lines[i].trim()) rows.push(lines[i]);
        i++;
      }
      if (rows.filter((r) => !isSeparator(r)).length) blocks.push(tableBlock(rows));
      continue;
    }
    if (/^###\s+/.test(t)) { push('heading_3', t.replace(/^###\s+/, '')); i++; continue; }
    if (/^##\s+/.test(t)) { push('heading_2', t.replace(/^##\s+/, '')); i++; continue; }
    if (/^#\s+/.test(t)) { push('heading_2', t.replace(/^#\s+/, '')); i++; continue; } // body H1 is never allowed
    if (/^[-*]\s+/.test(t)) { push('bulleted_list_item', t.replace(/^[-*]\s+/, '')); i++; continue; }
    if (/^\d+\.\s+/.test(t)) { push('numbered_list_item', t.replace(/^\d+\.\s+/, '')); i++; continue; }
    if (/^>\s?/.test(t)) {
      // Consecutive quote lines stay one quote, joined by newlines (the header
      // callout is three lines and parseHeader reads them as one block).
      const q = [];
      while (i < lines.length && /^>\s?/.test(lines[i].trim())) q.push(lines[i++].trim().replace(/^>\s?/, ''));
      push('quote', q.join('\n'));
      continue;
    }
    if (t === '---' || t === '***') { blocks.push({ object: 'block', type: 'divider', divider: {} }); i++; continue; }
    push('paragraph', t);
    i++;
  }
  return blocks;
}
