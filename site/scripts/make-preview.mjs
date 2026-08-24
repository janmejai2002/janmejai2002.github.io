import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const dist = new URL('../dist/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const out = process.argv[2];
if (!out) throw new Error('usage: node make-preview.mjs <outfile>');

const read = (p) => readFileSync(join(dist, p), 'utf8');

// Astro emits hashed css into _astro/
const cssFiles = readdirSync(join(dist, '_astro')).filter((f) => f.endsWith('.css'));
const css = cssFiles.map((f) => read(join('_astro', f))).join('\n');

const pick = (html) => {
  const body = html.slice(html.indexOf('<body'), html.lastIndexOf('</body>'));
  return body.slice(body.indexOf('>') + 1);
};

const article = pick(read(join('blog', 'the-95-percent-number', 'index.html')));

const page = `<title>The 95% Number</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
${css}
/* preview shell: the artifact host paints its own ground, so pin ours */
html,body{background-color:#F6F4EF !important;color:#1A2639 !important;}
.rail__home{pointer-events:none;opacity:.35}
</style>
${article}`;

writeFileSync(out, page, 'utf8');
console.log(`wrote ${out} (${(page.length / 1024).toFixed(1)} KB, css from ${cssFiles.length} file(s))`);
