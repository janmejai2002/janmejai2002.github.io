/**
 * THE HARNESS REGISTRY — the one place every rule lives.
 *
 * Everything that used to be copied between files reads from here:
 *   - site/scripts/*            (gates, sync, quarantine, doctor)   — import it
 *   - gas/Registry.js           (the Apps Script Conductor)         — generated
 *   - gemini/skills/<name>/*    (the knowledge the Gemini tasks load) — generated
 *
 * To change a rule: edit this file, then run
 *     node site/harness/generate.mjs
 * and commit what it changes. Never hand-edit a generated file; the generator
 * overwrites it and the check in `npm run build` fails if they drift.
 *
 * Plain data only (no imports, no Node APIs) so it can be serialised for Apps
 * Script and for the skill reference files.
 */

export const SITE_URL = 'https://janmejai2002.github.io';
export const REPO = 'janmejai2002/janmejai2002.github.io';

export const NOTION = {
  version: '2025-09-03',
  radar: '511e41a3-c1cd-47e0-8fa2-d319feef0ced',
  production: 'd39ea073-cc87-4c25-8a3c-d9f276a59b68',
  news: '288c805b-3d3f-46ae-98e4-893ab3e6d562',
};

/** Hard caps. Mirrored by the Zod schema in src/content.config.ts. */
export const CAPS = {
  title: 70,
  description: 160,
  question: 120,
  slug: 60,
  wordsMin: 1200,
  wordsMax: 2200, // G-LENGTH warns above this; prompts ask for 1,400–1,800
  minSources: 3,
  // Blocked Reason budget. Notion allows 2,000 per rich_text; flagBlocked adds a
  // "(checked … UTC)" stamp and escalation adds a "NEEDS YOU (…)" prefix.
  blockedReason: 1900,
};

/**
 * The five tracks. `notion` is the exact Notion select value and the value the
 * Gemini tasks write in the Sheet's Track column. `auto: true` means a
 * Draft Ready row publishes straight to main with no human approval.
 */
export const TRACKS = [
  { notion: 'Technical', id: 'technical', accent: 'mizu', auto: true, tab: 'Drafts', task: 'writer' },
  { notion: 'Business', id: 'business', accent: 'ochre', auto: true, tab: 'Drafts', task: 'writer' },
  { notion: 'Basics', id: 'basics', accent: 'plum', auto: true, tab: 'Drafts', task: 'writer' },
  { notion: 'Case Studies', id: 'case-studies', accent: 'moss', auto: true, tab: 'Case Studies', task: 'case-studies' },
  { notion: 'Talks', id: 'talks', accent: 'hanko', auto: true, tab: 'Talks', task: 'talks' },
];
export const AUTO_TRACKS = TRACKS.filter((t) => t.auto).map((t) => t.notion);

/** Artwork palette tokens a draft's SVG may use. */
export const ART_TOKENS = ['paper', 'paper2', 'ink', 'border', 'card', 'mizu', 'hanko', 'moss', 'ochre', 'plum', 'indigo'];

/**
 * THE SHEET CONTRACT.
 *
 * owner: 'agent' — a Gemini task appends rows; nothing else writes here.
 *        'code'  — the Conductor rewrites the whole tab every tick; agents only read it.
 * Column order is the order agents must append in.
 */
export const SHEET = {
  id: '1-UcD-C4My_Zp4aH3n-5dB3JQNtDN_MSAK6vTCPt8LY0',
  tabs: {
    Radar: { owner: 'agent', writer: 'radar', columns: ['Date', 'Track', 'Title', 'Reader Question', 'Pitch', 'Keywords', 'SeoBrief'] },
    // Radar Title = the Radar row's Title copied verbatim: the exact link back to
    // the idea (dedupe + Reader Question lookup). Older rows leave it empty.
    Drafts: { owner: 'agent', writer: 'writer', keyPrefix: 'DR', columns: ['Date', 'Track', 'Title', 'DocUrl', 'Draft', 'Status', 'Radar Title'] },
    'Case Studies': { owner: 'agent', writer: 'case-studies', keyPrefix: 'CS', columns: ['Date', 'Track', 'Title', 'DocUrl', 'Draft', 'Status'] },
    Talks: { owner: 'agent', writer: 'talks', keyPrefix: 'TK', columns: ['Date', 'Track', 'Title', 'DocUrl', 'Draft', 'Status'] },
    News: { owner: 'agent', writer: 'news', columns: ['Date', 'Category', 'Headline', 'Summary', 'Interview Angle', 'Source'] },
    'Repair Outbox': {
      owner: 'agent',
      writer: 'repairer',
      columns: ['Date', 'Key', 'Attempt', 'Title', 'Draft', 'Changed', 'Not Fixed'],
    },
    Runs: { owner: 'agent', writer: 'all', columns: ['Date', 'Time', 'Task', 'Result', 'Note'] },
    Status: {
      owner: 'code',
      columns: ['Key', 'Title', 'Track', 'Draft Status', 'Failure Codes', 'Blocked Reason', 'Repair Attempts', 'Live URL', 'Updated'],
    },
    'Repair Queue': {
      owner: 'code',
      columns: ['Key', 'Title', 'Track', 'Next Attempt', 'Failure Codes', 'Blocked Reason', 'Playbook', 'Previous Notes', 'Current Draft'],
    },
  },
};

/**
 * The stable row key. Built only from values Gemini writes once and never
 * changes (tab, Date cell, the Title as first written), so it survives a repair
 * that renames the article. Both Node and Apps Script implement exactly this.
 *   e.g. DR-20261111-3fa9c2
 */
export const KEY_RULE = {
  hashInput: '<tab>|<date>|<title trimmed>',
  hashLength: 6, // first 6 hex chars of SHA-256
  format: '<prefix>-<YYYYMMDD>-<hash>',
};

/** Article Production properties the harness adds (additive; never removes). */
export const NOTION_HARNESS_PROPS = {
  'Sheet Key': { rich_text: {} },
  'Repair Attempts': { number: { format: 'number' } },
  'Failure Codes': { multi_select: {} },
};

export const REPAIR = {
  // After this many failed automatic repairs the row stops retrying, the owner
  // gets a push, and a GitHub issue is opened with the full context
  // (scripts/open-issues.mjs) so Claude or agy can take it from there.
  maxAttempts: 4,
  issueLabel: 'needs-human',
  // sync-drafts starts Blocked Reason with this when it refuses a repair (it
  // would add a blocking code, or it changed sections no finding named). The
  // Conductor reads the attempt numbers after it, so the next attempt starts
  // from the last good draft instead of the rejected one.
  rejectedPrefix: 'Repair rejected (attempts',
  // A source row whose Status cell is this is a dry run of the repair loop: it
  // is queued and repaired like any other, but sync-drafts only records the
  // verify result and parks the Notion row at `testParkStatus` (which nothing
  // acts on). It is never applied, so it can never publish.
  testStatus: 'Test',
  testParkStatus: 'Queued',
};

/** Gemini scheduled tasks (IST). `expectRun` = the Conductor alerts if no Runs row by this time. */
export const TASKS = [
  { name: 'case-studies', label: 'Case Studies', at: '01:00', model: 'Flash', expectBy: '03:00' },
  { name: 'radar', label: 'SEO Radar', at: '03:35', model: 'Flash', expectBy: '05:00' },
  { name: 'writer', label: 'Article Writer', at: '04:15', model: 'Argon', expectBy: '07:00' },
  { name: 'news', label: 'News', at: '06:00', model: 'Flash', expectBy: '08:00' },
  { name: 'repairer', label: 'Repairer', at: '09:00, 19:00', model: 'Argon', expectBy: null },
  { name: 'talks', label: 'Talks', at: '13:00', model: 'Flash', expectBy: '15:00' },
];

export const STYLE = {
  bannedWords: [
    'delve', 'realm', 'tapestry', 'robust', 'seamless', 'seamlessly', 'pivotal', 'game-changer', 'transformative',
    'unlock', 'leverage', 'foster', 'holistic', 'testament', 'intricate', 'uncharted', 'landscape',
  ],
  // "harness" is banned as a buzzword verb but is a real term on this blog (agent harness), so not listed.
  bannedOpenings: ["In today's", 'It is important to remember', "Let's dive in", 'In the ever-evolving'],
};

/**
 * FAILURE CODES — one entry per gate.
 *
 * class:  block  → the row goes to Needs Revision and into the Repair Queue
 *         warn   → logged on the row, article still publishes
 *         fix    → the pipeline corrects it itself; never reaches the repairer
 * where:  preflight (publish-article.mjs, per article, before build)
 *         build     (check-build.mjs, after astro build; quarantined per article)
 * scope:  how far a repair for this code may reach (sync-drafts checks it before
 *         applying a repair):
 *           section → only the sections the finding names may change
 *           article → the finding has no single place; any section may change
 *           none    → never a reason to change text (G-LENGTH is a warning)
 * playbook: what the Repairer must do. It is also printed into the Repair Queue
 *           row, so the fix instructions travel with the failure.
 */
export const FAILURES = {
  'G-TITLE': {
    class: 'block', where: 'preflight', scope: 'section',
    summary: 'Title over 70 characters',
    playbook: 'Rewrite the title to 70 characters or fewer, keeping the main keyword and the specific claim. Count the characters. Put the new title in the Title column of your Repair Outbox row. Change nothing else.',
  },
  'G-META': {
    class: 'block', where: 'preflight', scope: 'section',
    summary: 'Meta description missing or over 160 characters',
    playbook: 'The first lines of the draft must be the callout "> **Meta description:** ..." then "> **Slug:** ...". Write a meta description of 160 characters or fewer stating the thesis and one number. Count the characters.',
  },
  'G-QUESTION': {
    class: 'block', where: 'preflight', scope: 'section',
    summary: 'Reader Question over 120 characters',
    playbook: 'Shorten the "> **Reader Question:**" line in the opening callout to 120 characters or fewer. It must still be a question a practitioner would actually ask.',
  },
  'G-TLDR': {
    class: 'block', where: 'preflight', scope: 'section',
    summary: 'No Executive TL;DR at the top',
    playbook: 'Directly after the opening callout, add an H2 reading exactly "## Executive TL;DR" followed by 4 to 6 bullets carrying the article\'s actual findings and numbers (taken from the body, nothing new).',
  },
  'G-BLOCK': {
    class: 'block', where: 'preflight', scope: 'article',
    summary: 'Contains formatting the site cannot convert',
    playbook: 'Rewrite the section named in Blocked Reason using only paragraphs, H2/H3 headings, bullet or numbered lists, quotes, normal markdown tables, and code blocks for real code.',
  },
  'G-ASCII': {
    class: 'block', where: 'preflight', scope: 'section',
    summary: 'Diagram drawn with text characters',
    playbook: 'Find every code block that draws boxes, arrows or flows with characters (+---+, |, v, ->, -->, ┌─┐). Replace each one with a numbered list of steps ("1. The request reaches the router. 2. ...") or a markdown table. Keep every fact the diagram carried.',
  },
  'G-LATEX': {
    class: 'block', where: 'preflight', scope: 'section',
    summary: 'Maths written in LaTeX',
    playbook: 'Remove all LaTeX: $...$, $$...$$, \\frac, \\sqrt, \\times, \\approx, \\cdot, \\sum. Write each formula as plain text inside backticks, e.g. `cost = tokens × price`. Single variables in prose become plain words or backticked names (`k`).',
  },
  'G-TABLE': {
    // Normally auto-fixed by normalizeProse; if the build still catches one, the Repairer fixes it.
    class: 'block', where: 'build', scope: 'article',
    summary: 'Markdown table broken into paragraphs',
    playbook: 'Tables must be continuous: header row, |---| row, data rows, no blank lines between rows, never inside a code block.',
  },
  'G-HTML': {
    class: 'block', where: 'build', scope: 'article',
    summary: 'Raw HTML broke and leaked into the page as text',
    playbook: 'Remove any raw HTML (<div>, <figure>, <svg>) from the article body. Only the Artwork SVG section may contain SVG, and it must have no blank lines.',
  },
  'G-HEADING': {
    class: 'block', where: 'build', scope: 'article',
    summary: 'Body starts with a "# Title" heading',
    playbook: 'Delete any "# " (H1) heading in the body. Body headings start at "## ".',
  },
  'G-IMAGE': {
    class: 'block', where: 'build', scope: 'article',
    summary: 'Image without alt text in the body',
    playbook: 'Remove every markdown image (![...](...)) and <img> from the article body. The only picture an article has is its Artwork SVG.',
  },
  'G-ART': {
    class: 'warn', where: 'preflight', scope: 'section',
    summary: 'Artwork SVG unusable, fallback art used',
    playbook: 'In "## Artwork SVG": an "Alt:" line, then one ```xml code block with a 1600x900 <svg> using only {{tokens}}, starting with <rect width="1600" height="900" fill="{{paper}}"/>. No hex colours, no blank lines.',
  },
  'G-SOURCES': {
    class: 'warn', where: 'preflight', scope: 'article',
    summary: 'Fewer than 3 source links',
    playbook: 'Add a "## Sources" section before "## Artwork brief" with at least 3 bullets "[Page title](https://url) — what it supports", each a page that actually contains the claim. For Talks the first is the video URL. Remove any claim you cannot source.',
  },
  'G-LENGTH': {
    class: 'warn', where: 'preflight', scope: 'none',
    summary: 'Article over the word budget',
    playbook: `Only if the gate's count is over ${CAPS.wordsMax.toLocaleString('en-US')} words. The gate counts prose only: code blocks, inline code, HTML tags and the Artwork sections are not counted (Sources link text is). Cut the least-supported paragraphs until the count is under ${CAPS.wordsMax.toLocaleString('en-US')}. Never delete a limitations or trade-offs section. This is a warning: it never justifies rewriting the article.`,
  },
  'G-STYLE': {
    class: 'warn', where: 'preflight', scope: 'section',
    summary: 'Banned words or em dashes',
    playbook: 'Replace each banned word with a concrete verb and each em dash (—) with a period, comma, colon or parentheses.',
  },
  'G-BUILD': {
    class: 'block', where: 'build', scope: 'article',
    summary: 'Site build failed for a reason not tied to one article',
    playbook: 'Not repairable by the Repairer. The owner (or Claude) must read the GitHub Actions log.',
    noRepair: true,
  },
};

export const failureClass = (code) => FAILURES[code]?.class ?? 'block';

/**
 * Where a Needs Revision row goes next. One rule, used by the Conductor (via
 * Registry.js), doctor and the gates, so nothing can fall between them:
 *   'repair' — the Repairer takes it (keyed, under the attempt limit, every code repairable)
 *   'human'   — a GitHub issue (limit reached, or any code the Repairer cannot fix)
 *   'publish' — only warning codes: never queued (owner's decision, 2026-11-11).
 *               The gate publishes such a draft with the warnings logged; a row
 *               stuck in Needs Revision this way just needs Draft Ready again.
 *   'legacy'  — pre-harness row with no Sheet Key; left to the owner as before
 * Warn codes still ride along on a queued row, as "fix if cheap".
 */
export function routeFailure({ key, attempts = 0, codes = [] }) {
  if (!key) return 'legacy';
  if (attempts >= REPAIR.maxAttempts) return 'human';
  if (!codes.length || codes.some((c) => !FAILURES[c] || FAILURES[c].noRepair)) return 'human';
  if (!codes.some((c) => failureClass(c) === 'block')) return 'publish';
  return 'repair';
}
