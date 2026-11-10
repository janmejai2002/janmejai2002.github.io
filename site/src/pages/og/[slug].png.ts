/**
 * Generates a 1200x630 headline card for every article. The hero art carries no
 * words, so a crop of it says nothing in a feed; this card shows the headline
 * and, when the title or description has one, the number the piece is about.
 */
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import sharp from 'sharp';

const ACCENT: Record<string, string> = {
  technical: '#00A9B8',
  business: '#C2913A',
  basics: '#8A6690',
  'case-studies': '#6E8C63',
  talks: '#D2543F',
};
const LABEL: Record<string, string> = {
  technical: 'TECHNICAL',
  business: 'BUSINESS',
  basics: 'BASICS',
  'case-studies': 'CASE STUDY',
  talks: 'TALK NOTES',
};
const FONT = "'Liberation Sans','DejaVu Sans',Arial,Helvetica,sans-serif";

export async function getStaticPaths() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.map((post) => ({ params: { slug: post.id }, props: { post } }));
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function wrap(text: string, width: number, maxLines: number) {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    if (line && (line + ' ' + word).length > width) {
      lines.push(line);
      line = word;
    } else line = line ? `${line} ${word}` : word;
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    lines.length = maxLines;
    lines[maxLines - 1] = lines[maxLines - 1].replace(/\s*\S*$/, '') + '…';
  }
  return lines;
}

export const GET: APIRoute = async ({ props }) => {
  const { title, description, track } = props.post.data;
  const accent = ACCENT[track];
  const stat = /\$[\d.,]*\d[KMB]?\b|\b\d+(?:\.\d+)?%|\b\d+x\b/.exec(`${title} ${description}`)?.[0];
  const lines = wrap(title, 30, 4);
  const size = 66;
  const lineHeight = 80;
  const top = 315 - ((lines.length - 1) * lineHeight) / 2;
  const headline = lines
    .map((l, i) => `<text x="88" y="${top + i * lineHeight}" font-size="${size}" font-weight="700" fill="#1A2639">${esc(l)}</text>`)
    .join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" font-family="${FONT}">
    <rect width="1200" height="630" fill="#F6F4EF"/>
    <rect x="0" y="0" width="20" height="630" fill="${accent}"/>
    <text x="88" y="96" font-size="26" font-weight="700" letter-spacing="4" fill="${accent}">${LABEL[track]}</text>
    ${stat ? `<text x="1128" y="112" font-size="76" font-weight="700" text-anchor="end" fill="${accent}">${esc(stat)}</text>` : ''}
    ${headline}
    <text x="88" y="566" font-size="28" font-weight="700" fill="#1A2639">wAIbi-sabi</text>
    <text x="1128" y="566" font-size="24" text-anchor="end" fill="#1A2639" opacity=".65">Janmejai Singh Minhas</text>
  </svg>`;

  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return new Response(png, { headers: { 'Content-Type': 'image/png' } });
};
