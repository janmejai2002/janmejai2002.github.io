/**
 * Post-build assertions against the emitted HTML.
 *
 * These exist because of a real failure: a blank line inside a raw <svg> block
 * in markdown terminates the CommonMark HTML block, so the rest of the SVG gets
 * re-parsed as an indented code block. The page still had a <figure class="diagram">
 * containing a valid <svg> with the right viewBox, so every structural check
 * passed while three quarters of each drawing was rendering as visible source.
 *
 * The lesson generalised: assert on content, not on containers.
 *
 *   node scripts/check-build.mjs
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const failures = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (name.endsWith('.html')) check(p, readFileSync(p, 'utf8'));
  }
}

function check(path, html) {
  const rel = relative(dist, path);
  const fail = (msg) => failures.push(`${rel}: ${msg}`);

  const body = html.slice(html.indexOf('<div class="body">'));

  // 1. Escaped markup leaking into prose means a raw HTML block was broken.
  for (const tag of ['svg', 'g>', 'rect', 'figure', 'div']) {
    if (body.includes(`&#x3C;${tag}`) || body.includes(`&lt;${tag}`)) {
      fail(`escaped <${tag} in rendered prose — a raw HTML block was split (check for blank lines inside it)`);
    }
  }

  // 2. A diagram that lost its body still parses; count what is actually drawn.
  const figures = html.match(/<figure class="diagram">[\s\S]*?<\/figure>/g) ?? [];
  figures.forEach((fig, i) => {
    const texts = (fig.match(/<text/g) ?? []).length;
    if (texts < 6) fail(`diagram ${i + 1} has only ${texts} <text> elements — looks truncated`);
    if (!/<\/svg>/.test(fig)) fail(`diagram ${i + 1} has no closing </svg>`);
  });

  // 3. Diagrams must not hardcode colour; the site has a real dark mode.
  for (const fig of figures) {
    const hard = fig.match(/(?:fill|stroke)="(#[0-9a-f]{3,8}|white|black|rgb\()/gi);
    if (hard) fail(`diagram hardcodes colour: ${[...new Set(hard)].join(', ')}`);
  }

  // 4. Social cards were declared but missing once already.
  if (html.includes('twitter:card" content="summary_large_image') && !html.includes('property="og:image"')) {
    fail('declares summary_large_image with no og:image');
  }

  // 5. Every content image needs alt text.
  for (const img of html.match(/<img[^>]*>/g) ?? []) {
    if (!/\balt="[^"]+"/.test(img)) fail(`img without alt text: ${img.slice(0, 90)}`);
  }
}

walk(dist);

if (failures.length) {
  console.error(`\ncheck-build: ${failures.length} problem(s)\n`);
  for (const f of failures) console.error(`  ✗ ${f}`);
  process.exit(1);
}
console.log('check-build: all assertions passed');
