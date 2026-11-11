/**
 * Article content rules, run on the generated markdown BEFORE the site build.
 *
 * Every rule reports every violation it finds (not just the first), each tagged
 * with a failure code from registry.mjs, so one repair pass can fix them all.
 * check-build.mjs still runs the rendered-HTML backstops after the build.
 */
import { createHash } from 'node:crypto';
import { CAPS, STYLE, FAILURES, SHEET, KEY_RULE } from './registry.mjs';

/** Stable row key — see KEY_RULE in registry.mjs. Must match gas/Conductor.js. */
export function sheetKey(tab, date, title) {
  const prefix = SHEET.tabs[tab]?.keyPrefix;
  if (!prefix) throw new Error(`tab "${tab}" has no keyPrefix`);
  const d = String(date).trim();
  const hash = createHash('sha256').update(`${tab}|${d}|${String(title).trim()}`).digest('hex').slice(0, KEY_RULE.hashLength);
  return `${prefix}-${d.replace(/-/g, '')}-${hash}`;
}

/** Code blocks other than the artwork SVG. */
function proseCodeBlocks(md) {
  return [...md.matchAll(/```([^\n]*)\n([\s\S]*?)```/g)]
    .filter((m) => !/^(xml|svg)$/i.test(m[1].trim()) && !/^\s*<svg/.test(m[2]))
    .map((m) => m[2]);
}

const ASCII_PATTERNS = [
  /[┌├┬┴┐┘┼└│─]{2,}/, // box-drawing characters
  /\+[-=]{3,}\+/, // +---+ boxes
  /^\s*[|│]\s*$\n^\s*[vV▼↓]\s*$/m, // vertical arrow under a pipe
  /^\s*[vV▼↓]\s*$/m, // a lone "v" arrow line
  /\[[^\]\n]+\]\s*(?:-{2,}>|─+>|→|=>)\s*\[[^\]\n]+\]/, // [A] --> [B]
  /(?:-{2,}>|─+>)\s*\(/, // --> (node)
];

function stripCode(md) {
  return md.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');
}

/**
 * @param {string} md        the article body as it will be written (after normalisation)
 * @param {object} meta      { title, description, question, track }
 * @returns {{code:string, message:string}[]}
 */
export function checkArticle(md, meta = {}) {
  const out = [];
  const add = (code, message) => out.push({ code, message, class: FAILURES[code].class });

  // Caps
  if ((meta.title ?? '').length > CAPS.title) add('G-TITLE', `Title is ${meta.title.length} characters; the maximum is ${CAPS.title}.`);
  if (!meta.description) add('G-META', 'No "Meta description:" line found in the opening callout.');
  else if (meta.description.length > CAPS.description)
    add('G-META', `Meta description is ${meta.description.length} characters; the maximum is ${CAPS.description}.`);
  if ((meta.question ?? '').length > CAPS.question)
    add('G-QUESTION', `Reader Question is ${meta.question.length} characters; the maximum is ${CAPS.question}.`);

  // Structure
  if (!md.trimStart().startsWith('<div class="tldr">')) add('G-TLDR', 'The draft does not open with an "## Executive TL;DR" H2 and bullets.');

  // ASCII diagrams in code blocks
  const ascii = proseCodeBlocks(md).filter((c) => ASCII_PATTERNS.some((re) => re.test(c)));
  if (ascii.length) {
    const first = ascii[0].split('\n').find((l) => l.trim()) ?? '';
    add('G-ASCII', `${ascii.length} code block(s) draw a diagram with text characters (first starts: "${first.trim().slice(0, 60)}").`);
  }

  // LaTeX left after normalisation
  const prose = stripCode(md);
  const latex = prose.match(/\$\$|\\(?:frac|sqrt|approx|times|cdot|sum|mathbb|text|left|right)\b|(?<![\w$])\$[a-zA-Z_\\][^$\n]{0,40}\$(?![\w$])/g);
  if (latex) add('G-LATEX', `${latex.length} LaTeX fragment(s) left in prose, e.g. "${latex[0].slice(0, 40)}".`);

  // Sources
  const links = new Set([...md.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)].map((m) => m[1]));
  const hasSources = /^##\s+Sources\b/im.test(md);
  if (links.size < CAPS.minSources || !hasSources)
    add('G-SOURCES', `${links.size} distinct outbound link(s)${hasSources ? '' : ' and no "## Sources" section'}; at least ${CAPS.minSources} expected.`);

  // Length
  const words = prose.replace(/<[^>]+>/g, ' ').split(/\s+/).filter((w) => /\w/.test(w)).length;
  if (words > CAPS.wordsMax) add('G-LENGTH', `${words} words; the budget is ${CAPS.wordsMax}.`);

  // Style
  const banned = [...new Set((prose.match(new RegExp(`\\b(${STYLE.bannedWords.join('|')})\\b`, 'gi')) ?? []).map((w) => w.toLowerCase()))];
  const dashes = (prose.match(/—/g) ?? []).length;
  if (banned.length || dashes)
    add('G-STYLE', [banned.length && `banned words: ${banned.join(', ')}`, dashes && `${dashes} em dash(es)`].filter(Boolean).join('; ') + '.');

  return out;
}
