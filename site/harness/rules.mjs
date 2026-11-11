/**
 * Article content rules, run on the generated markdown BEFORE the site build.
 *
 * Every rule reports every violation it finds (not just the first), each tagged
 * with a failure code from registry.mjs and located by section heading + quoted
 * excerpt, so one repair pass can fix them all without hunting.
 * check-build.mjs still runs the rendered-HTML backstops after the build.
 */
import { createHash } from 'node:crypto';
import { CAPS, STYLE, FAILURES, SHEET, KEY_RULE, SECTIONS } from './registry.mjs';

/** Stable row key — see KEY_RULE in registry.mjs. Must match gas/Conductor.js. */
export function sheetKey(tab, date, title) {
  const prefix = SHEET.tabs[tab]?.keyPrefix;
  if (!prefix) throw new Error(`tab "${tab}" has no keyPrefix`);
  const d = String(date).trim();
  const hash = createHash('sha256').update(`${tab}|${d}|${String(title).trim()}`).digest('hex').slice(0, KEY_RULE.hashLength);
  return `${prefix}-${d.replace(/-/g, '')}-${hash}`;
}

/**
 * The rules version: a short hash of every rule input (caps, style, failure
 * codes). Stamped into each Blocked Reason as "[rules xxxxxxxx]", so code can
 * tell when a row's failure codes were computed by older rules and re-check it
 * (sync-drafts.mjs) instead of sending a repair for a code that no longer fires.
 */
export const RULES_VERSION = createHash('sha256').update(JSON.stringify({ CAPS, STYLE, FAILURES })).digest('hex').slice(0, 8);
export const RULES_STAMP_RE = /\[rules ([0-9a-f]{8})\]/;

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
 * An article split at its "## " headings, for locating findings and for the
 * verify-before-apply check. The text before the first H2 (the callout header)
 * is the section named "(opening)". Headings inside code blocks are ignored.
 * @returns {{ heading: string, text: string }[]}
 */
export function splitSections(md) {
  return splitDraft(md).map((s) => ({ heading: s.heading, text: s.body }));
}

/** Section id per SECTIONS in registry.mjs. Must match sectionId_ in gas/Conductor.js. */
export function sectionId(index, heading) {
  return `S${index}-${createHash('sha256').update(heading, 'utf8').digest('hex').slice(0, SECTIONS.hashLength)}`;
}

/**
 * A draft as sections, per SECTIONS in registry.mjs. Must match splitDraft_ in
 * gas/Conductor.js (the regression test runs both).
 * @returns {{ id, heading, text, body }[]}  text = heading line + body, trimmed
 */
export function splitDraft(md) {
  const out = [{ heading: SECTIONS.opening, lines: [] }];
  let fence = false;
  for (const line of String(md).replace(/\r\n/g, '\n').split('\n')) {
    if (/^\s*```/.test(line)) fence = !fence;
    const h = !fence && line.match(/^##\s+(.+?)\s*$/);
    if (h) out.push({ heading: h[1], lines: [line] });
    else out[out.length - 1].lines.push(line);
  }
  return out.map((s, i) => {
    const text = s.lines.join('\n').trim();
    const body = (i === 0 ? text : s.lines.slice(1).join('\n')).trim();
    return { id: sectionId(i, s.heading), heading: s.heading, text, body };
  });
}

/** Sections back into a draft: non-empty texts, one blank line apart. */
export function joinDraft(sections) {
  return sections.map((s) => s.text.trim()).filter(Boolean).join('\n\n') + '\n';
}

/**
 * Findings as the compact JSON stored in Notion's Findings property, which the
 * Conductor reads to pick the sections to send: [{c, s, e}] (code, section, excerpt).
 */
export function findingsJson(findings, maxInstances = 40) {
  const rows = findings.flatMap((f) => (f.instances?.length ? f.instances : [{ section: '', excerpt: '' }]).map((i) => ({ c: f.code, s: i.section, e: i.excerpt.slice(0, 160) })));
  return JSON.stringify(rows.slice(0, maxInstances));
}

/** The section heading in force at character `index` of `text`. */
function sectionAt(text, index) {
  let heading = '(opening)';
  for (const m of text.slice(0, index).matchAll(/^##\s+(.+?)\s*$/gm)) heading = m[1];
  return heading;
}

/** A short one-line excerpt around `index`. */
function excerptAt(text, index, length = 0, pad = 30) {
  const from = Math.max(0, index - pad);
  const to = Math.min(text.length, index + length + pad);
  return (from > 0 ? '…' : '') + text.slice(from, to).replace(/\s+/g, ' ').trim() + (to < text.length ? '…' : '');
}

/** ` Where: "Section" ("excerpt"); …` — at most `limit`, then "+N more". */
function where(instances, limit = 4) {
  if (!instances?.length) return '';
  const shown = instances.slice(0, limit).map((i) => (i.excerpt ? `"${i.section}" (${i.excerpt})` : `"${i.section}"`));
  const more = instances.length > limit ? `; +${instances.length - limit} more` : '';
  return ` Where: ${shown.join('; ')}${more}.`;
}

/**
 * Every finding as "CODE: message Where: …", block codes first, then warnings,
 * joined with " | ", stamped with the rules version and kept within
 * CAPS.blockedReason. When it is too long the messages are shortened evenly;
 * codes are never dropped, because a code without its message is what sent the
 * Repairer hunting (HARNESS-REPAIR-PLAN §1).
 */
export function formatFindings(findings, max = CAPS.blockedReason) {
  const stamp = ` [rules ${RULES_VERSION}]`;
  max -= stamp.length;
  const rank = { block: 0, warn: 1 };
  const ordered = [...findings].sort((a, b) => (rank[a.class] ?? 0) - (rank[b.class] ?? 0));
  const msg = (f) => f.message + where(f.instances);
  const full = ordered.map((f) => `${f.code}: ${msg(f)}`).join(' | ');
  if (full.length <= max) return full + stamp;
  const sep = ' | '.length * Math.max(0, ordered.length - 1);
  const fixed = ordered.reduce((n, f) => n + f.code.length + 2, 0);
  const per = Math.max(0, Math.floor((max - sep - fixed) / ordered.length));
  const cut = (m) => (m.length <= per ? m : `${m.slice(0, Math.max(0, per - 1))}…`);
  return ordered.map((f) => `${f.code}: ${cut(msg(f))}`).join(' | ').slice(0, max) + stamp;
}

/**
 * @param {string} md        the article body as it will be written (after normalisation)
 * @param {object} meta      { title, description, question, track }
 * @returns {{code:string, class:string, message:string, instances:{section:string, excerpt:string}[]}[]}
 *          `instances` locate each finding by section heading + quoted text,
 *          which survives the Sheet → Notion → markdown round trip (line
 *          numbers do not). An empty list means "not tied to one place".
 */
export function checkArticle(md, meta = {}) {
  const out = [];
  const add = (code, message, instances = []) => out.push({ code, message, class: FAILURES[code].class, instances });
  const opening = [{ section: '(opening)', excerpt: '' }];

  // Caps
  if ((meta.title ?? '').length > CAPS.title)
    add('G-TITLE', `Title is ${meta.title.length} characters; the maximum is ${CAPS.title}.`, [{ section: '(title)', excerpt: '' }]);
  if (!meta.description) add('G-META', 'No "Meta description:" line found in the opening callout.', opening);
  else if (meta.description.length > CAPS.description)
    add('G-META', `Meta description is ${meta.description.length} characters; the maximum is ${CAPS.description}.`, opening);
  if ((meta.question ?? '').length > CAPS.question)
    add('G-QUESTION', `Reader Question is ${meta.question.length} characters; the maximum is ${CAPS.question}.`, opening);

  // Structure
  if (!md.trimStart().startsWith('<div class="tldr">'))
    add('G-TLDR', 'The draft does not open with an "## Executive TL;DR" H2 and bullets.', opening);

  // ASCII diagrams in code blocks (not the artwork SVG)
  const ascii = [...md.matchAll(/```([^\n]*)\n([\s\S]*?)```/g)]
    .filter((m) => !/^(xml|svg)$/i.test(m[1].trim()) && !/^\s*<svg/.test(m[2]))
    .filter((m) => ASCII_PATTERNS.some((re) => re.test(m[2])));
  if (ascii.length) {
    const firstLine = (m) => (m[2].split('\n').find((l) => l.trim()) ?? '').trim().slice(0, 60);
    add(
      'G-ASCII',
      `${ascii.length} code block(s) draw a diagram with text characters (first starts: "${firstLine(ascii[0])}").`,
      ascii.map((m) => ({ section: sectionAt(md, m.index), excerpt: `code block starting "${firstLine(m)}"` }))
    );
  }

  // LaTeX left after normalisation
  const prose = stripCode(md);
  const latex = [...prose.matchAll(/\$\$|\\(?:frac|sqrt|approx|times|cdot|sum|mathbb|text|left|right)\b|(?<![\w$])\$[a-zA-Z_\\][^$\n]{0,40}\$(?![\w$])/g)];
  if (latex.length)
    add(
      'G-LATEX',
      `${latex.length} LaTeX fragment(s) left in prose, e.g. "${latex[0][0].slice(0, 40)}".`,
      latex.map((m) => ({ section: sectionAt(prose, m.index), excerpt: `"${excerptAt(prose, m.index, m[0].length, 15)}"` }))
    );

  // Sources
  const links = new Set([...md.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)].map((m) => m[1]));
  const hasSources = /^##\s+Sources\b/im.test(md);
  if (links.size < CAPS.minSources || !hasSources)
    add(
      'G-SOURCES',
      `${links.size} distinct outbound link(s)${hasSources ? '' : ' and no "## Sources" section'}; at least ${CAPS.minSources} expected.`,
      [{ section: 'Sources', excerpt: '' }]
    );

  // Length — counted as the G-LENGTH playbook describes. The instances list the
  // longest sections, for information only: G-LENGTH never makes a section
  // "flagged" for the verify-before-apply check (`scope` in registry.mjs).
  const count = (t) => t.replace(/<[^>]+>/g, ' ').split(/\s+/).filter((w) => /\w/.test(w)).length;
  const words = count(prose);
  if (words > CAPS.wordsMax) {
    const longest = splitSections(prose)
      .map((s) => ({ section: s.heading, words: count(s.text) }))
      .sort((a, b) => b.words - a.words)
      .slice(0, 3);
    add('G-LENGTH', `${words} words; the budget is ${CAPS.wordsMax}.`, longest.map((s) => ({ section: s.section, excerpt: `${s.words} words` })));
  }

  // Style — every occurrence, located
  const style = [...prose.matchAll(new RegExp(`\\b(${STYLE.bannedWords.join('|')})\\b`, 'gi')), ...prose.matchAll(/—/g)].sort(
    (a, b) => a.index - b.index
  );
  if (style.length) {
    const banned = [...new Set(style.filter((m) => m[0] !== '—').map((m) => m[0].toLowerCase()))];
    const dashes = style.filter((m) => m[0] === '—').length;
    add(
      'G-STYLE',
      [banned.length && `banned words: ${banned.join(', ')}`, dashes && `${dashes} em dash(es)`].filter(Boolean).join('; ') + '.',
      style.map((m) => ({ section: sectionAt(prose, m.index), excerpt: `"${excerptAt(prose, m.index, m[0].length, 20)}"` }))
    );
  }

  return out;
}
