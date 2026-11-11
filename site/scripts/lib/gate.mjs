/**
 * The publish gate as a pure function, shared by publish-article.mjs (Notion
 * page → findings), sync-drafts.mjs (Sheet draft → findings, before a repair is
 * applied and when re-checking stale codes) and the regression tests.
 *
 * Nothing here talks to Notion; a Sheet draft is pushed through the same
 * markdown → Notion blocks → markdown round trip in memory, so the findings are
 * what the real publish run would report.
 */
import { checkArticle } from '../../harness/rules.mjs';
import { markdownToBlocks } from '../../harness/md-to-notion.mjs';
import { parseDraft } from '../import-draft.mjs';
import { toMarkdown, plain } from './notion.mjs';
import { liftArtworkBrief, liftArtworkSvg, normalizeProse, stripLeadingH1, wrapTldr } from './prose.mjs';

/**
 * A rendered article body (header already removed) → findings.
 * @returns {{ markdown, findings, brief, svg, alt, artWarnings }}
 */
export function gateBody(renderedBody, meta = {}, { slug = null } = {}) {
  const artWarnings = [];
  const lifted = liftArtworkBrief(renderedBody);
  const art = liftArtworkSvg(lifted.markdown, (r) => artWarnings.push(r), slug);
  const markdown = normalizeProse(wrapTldr(stripLeadingH1(art.markdown)));
  const findings = checkArticle(markdown, meta);
  if (artWarnings.length) findings.push({ code: 'G-ART', class: 'warn', message: artWarnings.join(' '), instances: [{ section: 'Artwork SVG', excerpt: '' }] });
  return { markdown, findings, brief: lifted.brief, svg: art.svg, alt: art.alt, artWarnings };
}

/** What the Notion API returns for text we wrote: content also appears as plain_text. */
function asFetched(node) {
  if (Array.isArray(node)) return node.map(asFetched);
  if (!node || typeof node !== 'object') return node;
  const out = {};
  for (const [k, v] of Object.entries(node)) out[k] = asFetched(v);
  if (out.type === 'text' && out.text && out.plain_text === undefined) out.plain_text = out.text.content;
  return out;
}

/**
 * A Sheet draft (what the Writer or Repairer filed) → findings, via the same
 * path import-draft.mjs and publish-article.mjs take.
 * defaults: { title, question, track } as sync-drafts passes them.
 */
export function gateSheetDraft(raw, defaults = {}) {
  const draft = parseDraft(raw, defaults);
  let body = draft.body;
  if (!/^\s*>\s*\*{0,2}Meta description/i.test(body)) {
    body = [draft.description && `> **Meta description:** ${draft.description}`, `> **Slug:** ${draft.slug}`].filter(Boolean).join('\n') + '\n\n' + body;
  }
  const list = asFetched(markdownToBlocks(body));
  // publish-article parseHeader(): the leading run of quote/callout blocks.
  let end = 0;
  while (end < list.length && ['callout', 'quote'].includes(list[end]?.type)) end++;
  const header = list.slice(0, end).map((b) => plain(b[b.type]?.rich_text)).join('\n');
  const grab = (label) =>
    header.match(new RegExp(`\\**\\s*${label}\\s*\\**\\s*:?\\s*\\**\\s*([^\\n]+)`, 'i'))?.[1]?.replace(/\*+$/, '').trim() || '';
  const slug = (grab('Slug') || draft.slug).replace(/^\/+|\/+$/g, '').trim();
  let rendered;
  try {
    rendered = toMarkdown(list.slice(end));
  } catch (err) {
    return { findings: [{ code: 'G-BLOCK', class: 'block', message: err.message, instances: [] }], markdown: '' };
  }
  return gateBody(rendered, { title: draft.title, description: grab('Meta description'), question: draft.question, track: draft.track.toLowerCase() }, { slug });
}
