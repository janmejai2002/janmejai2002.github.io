/**
 * The pure markdown transforms publish-article.mjs applies to a rendered draft,
 * in their own module so tests can run them without touching Notion.
 * Moved verbatim from publish-article.mjs (2026-11-11); only the exports were added.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// liftArtworkSvg resolves assets-src/art relative to site/scripts/.
const here = join(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Lifts the trailing "## Artwork brief" section out of the article body.
 *
 * The writer routine appends it because it has just read every source and is
 * the right one to decide what the plate should mean — but it is a note to
 * whoever draws the artwork, not something a reader should ever see. It is
 * re-emitted as an HTML comment at the end of the file, so it travels in the
 * PR diff, sits next to the work it describes, and renders as nothing.
 */
export function liftArtworkBrief(markdown) {
  const lines = markdown.split('\n');
  const start = lines.findIndex((l) => /^##\s+Artwork brief\s*$/i.test(l));
  if (start === -1) return { markdown, brief: null };

  // Runs to the next H2, or to the end — it is normally the last section.
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (/^##\s+/.test(lines[i])) {
      end = i;
      break;
    }
  }

  const brief = lines
    .slice(start + 1, end)
    .join('\n')
    .trim();
  const rest = [...lines.slice(0, start), ...lines.slice(end)].join('\n').trimEnd();
  return { markdown: rest + '\n', brief: brief || null };
}

/**
 * Lifts a trailing "## Artwork SVG" section out of the article body.
 *
 * This is how routine-authored artwork travels: the artwork routine reads the
 * draft in Notion, draws the plate per docs/ARTWORK.md, and files the SVG into
 * the page itself as an `Alt:` line plus a code block under an H2 reading
 * exactly `Artwork SVG`. Carrying it through Notion means it needs no new
 * credential and — unlike anything committed to the PR branch — it survives
 * the publish poll, which regenerates the branch from Notion every half hour.
 *
 * Returns { markdown, svg, alt }. svg/alt are null when the section is absent
 * or unusable; the caller falls back to deterministic art and says so.
 */
export function liftArtworkSvg(markdown, warn, slug = null) {
  const lines = markdown.split('\n');
  const start = lines.findIndex((l) => /^##\s+Artwork SVG\s*$/i.test(l));
  if (start === -1) return { markdown, svg: null, alt: null };

  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (/^##\s+/.test(lines[i])) {
      end = i;
      break;
    }
  }

  const section = lines.slice(start + 1, end).join('\n');
  const rest = [...lines.slice(0, start), ...lines.slice(end)].join('\n').trimEnd() + '\n';

  const alt = section.match(/^Alt:\s*(.+)$/m)?.[1]?.trim() || null;
  const svg = section.match(/^```[^\n]*\n([\s\S]*?)\n```/m)?.[1]?.trim() || null;

  // Validate here, with a reason, rather than letting make-images throw later
  // inside a CI run nobody is watching.
  const reasons = [];
  if (!svg || !svg.startsWith('<svg')) reasons.push('no <svg> code block');
  else {
    if (!svg.includes('{{paper}}')) reasons.push('no {{paper}} ground token');
    if (/(?:fill|stroke)="#/i.test(svg)) reasons.push('hardcodes a hex colour');

    // Anti-duplication guard: ensure an agent does not copy another article's SVG geometry
    if (slug) {
      const artDir = join(here, '..', 'assets-src', 'art');
      if (existsSync(artDir)) {
        const existingFiles = readdirSync(artDir).filter((f) => f.endsWith('.svg') && f !== `${slug}.svg`);
        // Strip common defs/filters/paper boilerplate before checking geometry
        const stripPreamble = (s) =>
          s.replace(/<defs[\s\S]*?<\/defs>/gi, '').replace(/<rect\s+[^>]*fill="{{paper}}"[^>]*\/>/gi, '').replace(/\s+/g, ' ').trim();
        const cleanGeo = stripPreamble(svg);
        if (cleanGeo.length > 80) {
          const sample = cleanGeo.slice(0, 180);
          for (const f of existingFiles) {
            try {
              const existingGeo = stripPreamble(readFileSync(join(artDir, f), 'utf8'));
              if (existingGeo.includes(sample)) {
                reasons.push(`artwork geometry duplicates ${f}`);
                break;
              }
            } catch {}
          }
        }
      }
    }
  }
  if (!alt) reasons.push('no "Alt:" line');

  if (reasons.length) {
    warn(`Artwork SVG section present but unusable (${reasons.join('; ')}) — using fallback art.`);
    return { markdown: rest, svg: null, alt: null };
  }
  return { markdown: rest, svg, alt };
}

/**
 * Normalizes article markdown to prevent common LLM formatting defects:
 * 1. Strips blank lines inside raw inline <svg> blocks so CommonMark doesn't break.
 * 2. Auto-converts ASCII-boxed tables in code blocks into semantic GFM Markdown tables.
 */
export function normalizeProse(markdown) {
  // 1. Remove blank lines inside raw inline SVG blocks
  let result = markdown.replace(/<svg[\s\S]*?<\/svg>/gi, (svgBlock) => {
    return svgBlock.split('\n').filter((l) => l.trim() !== '').join('\n');
  });

  // 2. Convert ASCII box tables inside code blocks to standard GFM tables ONLY if they are genuine tabular grids
  result = result.replace(/```(?:text)?\s*\n(\+[-=+]+\+[\s\S]*?\+[-=+]+\+)\s*```/g, (match, tableAscii) => {
    // If it contains directional arrows or flow transitions, it is a diagram, not a table
    if (/\b[vV\^]\b|-->|->|<-|\s+\|\s*\n\s+[vV]/.test(tableAscii)) {
      return match;
    }
    const lines = tableAscii.split('\n').map((l) => l.trim()).filter(Boolean);
    const rows = [];
    for (const line of lines) {
      if (line.startsWith('+') && line.endsWith('+')) continue; // separator line
      if (line.startsWith('|') && line.endsWith('|')) {
        const cells = line.slice(1, -1).split('|').map((c) => c.trim());
        rows.push(cells);
      } else {
        // Any non-table line inside disqualifies it as a pure data table
        return match;
      }
    }
    if (rows.length < 2) return match;
    const colCount = rows[0].length;
    if (colCount < 2) return match; // Single-column boxes are flow nodes, not data tables
    // Ensure all rows have the same column count
    if (!rows.every((r) => r.length === colCount)) return match;

    const header = rows[0];
    const dataRows = rows.slice(1);
    let gfm = `| ${header.join(' | ')} |\n| ${Array(colCount).fill('---').join(' | ')} |\n`;
    for (const row of dataRows) {
      gfm += `| ${row.join(' | ')} |\n`;
    }
    return `\n${gfm.trim()}\n`;
  });

  // 3. Collapse blank lines between markdown table rows so CommonMark doesn't break them into <p>
  while (/(\|[^\n]+\|)\n[ \t]*\n(?=[ \t]*\|[^\n]+\|)/.test(result)) {
    result = result.replace(/(\|[^\n]+\|)\n[ \t]*\n(?=[ \t]*\|[^\n]+\|)/g, '$1\n');
  }

  // 4. Sanitize uncompiled LaTeX math formulas into clean Unicode or formatted code blocks
  result = result
    .replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => `\n\`${math.replace(/[\r\n]+/g, ' ').trim()}\`\n`)
    .replace(/\\mathbb\{R\}\^\{[^}]+\}/g, 'R^|V|')
    .replace(/\\in\s*\{0,\s*-\\infty\}\^\{[^}]+\}/g, 'in {0, -inf}^|V|')
    .replace(/\\in\b/g, '∈')
    .replace(/\\le\b/g, '≤')
    .replace(/\\ge\b/g, '≥')
    .replace(/\\approx\b/g, '≈')
    .replace(/\\times\b/g, '×')
    .replace(/\\cdot\b/g, '·')
    .replace(/\\infty\b/g, '∞')
    .replace(/-\\infty\b/g, '-∞')
    .replace(/\\max\b/g, 'max')
    .replace(/\\min\b/g, 'min')
    .replace(/\\text\{([^}]+)\}/g, '$1')
    // Decimals, percents and the symbols converted above are part of the class:
    // without them `$p_{step} = 0.95$` and `$0.95^{12} = 54.0\%$` slipped
    // through to G-LATEX and a needless repair (HARNESS-REPAIR-PLAN §1).
    // Currency stays safe: "$38.40 to $45" never matches, because the closing
    // `$` is followed by a digit, which the lookahead refuses.
    .replace(/(?<![\$\w])\$([a-zA-Z0-9_+^={}()|\\ .,%≥≤≈×·∞∈-]+)\$(?![\$\w])/g, (match, inner) => {
      if (/^\s*\d+[\d,.]*\s*$/.test(inner)) return match; // skip currency
      const clean = inner
        .replace(/\\in\b/g, '∈')
        .replace(/\\le\b/g, '≤')
        .replace(/\\ge\b/g, '≥')
        .replace(/\\approx\b/g, '≈')
        .replace(/\\infty\b/g, '∞')
        .replace(/\\cdot\b/g, '·')
        .replace(/\\text\{([^}]+)\}/g, '$1')
        .replace(/_\{([^}]+)\}/g, '_$1')
        .replace(/\^\{([^}]+)\}/g, '^$1')
        .replace(/[\\]/g, '')
        .trim();
      return `\`${clean}\``;
    });

  return result;
}

/**
 * Drops a leading H1 from the article body.
 *
 * The layout renders the frontmatter title as the page's <h1>, so a body that
 * opens with `# Title` ships two <h1> elements, one a copy of the other. Both
 * articles from the pipeline's first run did exactly this — and because the H1
 * sat above the TL;DR heading, it also silently defeated wrapTldr(), which
 * requires the TL;DR to be the first content. The writer prompt now forbids the
 * heading, but the generator must not depend on a prompt being obeyed.
 */
export function stripLeadingH1(markdown) {
  const lines = markdown.split('\n');
  const first = lines.findIndex((l) => l.trim() !== '');
  if (first === -1 || !/^#\s+/.test(lines[first])) return markdown;
  return lines
    .slice(first + 1)
    .join('\n')
    .trimStart();
}

/**
 * Wraps a leading "## Executive TL;DR" section in the .tldr plate.
 *
 * The writer routine emits the TL;DR as an ordinary Notion heading plus bullets,
 * because asking it to hand-write raw HTML into a Notion block is a good way to
 * get a broken div. The markup is applied here instead, where it is
 * deterministic and testable.
 *
 * The blank lines around the content are load-bearing: they are what let the
 * markdown inside the div still be parsed as markdown. Do not "tidy" them away
 * — and note this is the opposite of the rule for inline <svg>, where a blank
 * line terminates the HTML block and breaks it. See docs/HANDOFF.md §6.
 */
export function wrapTldr(markdown) {
  const lines = markdown.split('\n');
  const start = lines.findIndex((l) => l.trim() !== '');
  if (start === -1 || !/^##\s+Executive TL;DR\s*$/i.test(lines[start])) return markdown;

  // The section runs until the next H2, or to the end if it is the only one.
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (/^##\s+/.test(lines[i])) {
      end = i;
      break;
    }
  }

  const body = lines.slice(start, end).join('\n').trimEnd();
  const rest = lines.slice(end).join('\n').trimStart();
  return `<div class="tldr">\n\n${body}\n\n</div>\n\n${rest}`;
}
