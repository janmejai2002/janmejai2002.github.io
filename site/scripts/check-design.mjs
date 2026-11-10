/**
 * Design system gate: assert tokens only in pages and components.
 *
 * Fails the build, listing file and line, if site/src/pages/** or
 * site/src/components/** contains:
 * - a hex or rgb( colour in a style rule. Allows #000 inside mask-image,
 *   and allows %23 inside data URIs.
 * - a font-family other than var(--font), var(--serif), inherit or monospace.
 *
 *   node scripts/check-design.mjs
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = join(root, 'src');
const targets = [join(srcDir, 'pages'), join(srcDir, 'components')];

const failures = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      walk(p);
    } else if (name.endsWith('.astro') || name.endsWith('.css')) {
      checkFile(p);
    }
  }
}

function checkFile(filePath) {
  const rel = relative(root, filePath).replace(/\\/g, '/');
  const content = readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  let inStyle = false;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const lineNum = i + 1;

    if (filePath.endsWith('.css')) {
      checkCssLine(rawLine, rel, lineNum);
      continue;
    }

    if (rawLine.includes('<style')) {
      inStyle = true;
      // If style tag also has contents on the same line
      const afterTag = rawLine.slice(rawLine.indexOf('<style'));
      const endIdx = afterTag.indexOf('>');
      if (endIdx !== -1) {
        const rest = afterTag.slice(endIdx + 1);
        if (rest.trim()) checkCssLine(rest, rel, lineNum);
      }
      if (rawLine.includes('</style>')) inStyle = false;
      continue;
    }

    if (inStyle) {
      if (rawLine.includes('</style>')) {
        inStyle = false;
        const beforeTag = rawLine.slice(0, rawLine.indexOf('</style>'));
        if (beforeTag.trim()) checkCssLine(beforeTag, rel, lineNum);
        continue;
      }
      checkCssLine(rawLine, rel, lineNum);
      continue;
    }

    // Check inline style="..." or style={`...`}
    const styleAttrRegex = /\bstyle=(?:["']([^"']*)["']|\{`([^`]*)`\}|\{([^}]*)\})/g;
    let match;
    while ((match = styleAttrRegex.exec(rawLine)) !== null) {
      const styleContent = match[1] ?? match[2] ?? match[3] ?? '';
      checkCssLine(styleContent, rel, lineNum);
    }
  }
}

function checkCssLine(line, rel, lineNum) {
  // Strip CSS and JS comments
  let stripped = line.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/, '');

  // 1. font-family assertion
  // Allowed: var(--font), var(--serif), inherit, monospace
  const fontMatches = stripped.matchAll(/font-family\s*:\s*([^;!}\n]+)/g);
  for (const fm of fontMatches) {
    const val = fm[1].trim();
    const allowed = ['var(--font)', 'var(--serif)', 'inherit', 'monospace'];
    if (!allowed.includes(val)) {
      failures.push(`${rel}:${lineNum}: disallowed font-family '${val}' (allowed: var(--font), var(--serif), inherit, monospace)`);
    }
  }

  // 2. hex or rgb( color assertion
  // Allow #000 (and #000000) inside mask-image and -webkit-mask-image
  stripped = stripped.replace(/(-webkit-)?mask-image\s*:[^;!}]+/g, (m) =>
    m.replace(/#000000|#000/g, '')
  );

  // Allow data URIs (e.g. data:image/svg+xml,... and %23)
  stripped = stripped.replace(/url\([^)]+\)/g, '');

  // Check for hex colours: #[0-9a-fA-F]{3,8}\b
  const hexMatch = stripped.match(/#[0-9a-fA-F]{3,8}\b/);
  if (hexMatch) {
    failures.push(`${rel}:${lineNum}: hardcoded hex color '${hexMatch[0]}' in style rule`);
  }

  // Check for rgb( or rgba(
  const rgbMatch = stripped.match(/rgba?\s*\(/);
  if (rgbMatch) {
    failures.push(`${rel}:${lineNum}: hardcoded '${rgbMatch[0]}' in style rule`);
  }
}

for (const target of targets) {
  walk(target);
}

if (failures.length > 0) {
  console.error(`check-design failed with ${failures.length} issue(s):`);
  for (const f of failures) {
    console.error(`  ${f}`);
  }
  process.exit(1);
} else {
  console.log('check-design: all assertions passed');
  process.exit(0);
}
