/**
 * Ingests a markdown article draft into Notion Article Production.
 *
 * Usage:
 *   node site/scripts/import-draft.mjs <path-to-draft.md> [--commit]
 *
 * Parses:
 *   - Frontmatter or Callout (Title, Slug, Meta description, Track, Reader Question)
 *   - Executive TL;DR
 *   - Article body headings, paragraphs, lists
 *   - Artwork brief
 *   - Artwork SVG
 *
 * Pushes directly to Notion Article Production database with `Draft Status = Draft Ready`.
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { api, PRODUCTION_DS } from './lib/notion.mjs';

const fileArg = process.argv[2];
const commit = process.argv.includes('--commit');

if (!fileArg || fileArg.startsWith('--')) {
  console.log('Usage: node site/scripts/import-draft.mjs <file.md> [--commit]');
  process.exit(1);
}

const fullPath = resolve(fileArg);
if (!existsSync(fullPath)) {
  console.error(`File not found: ${fullPath}`);
  process.exit(1);
}

const raw = readFileSync(fullPath, 'utf8');

// 1. Parse Metadata / Frontmatter / Opening Callout
let title = '';
let track = 'Technical';
let question = '';
let description = '';
let slug = '';
let keywords = '';
let sourceIdea = '';

const unquote = (s) => (s ? s.trim().replace(/^["']|["']$/g, '').trim() : '');

// Check YAML frontmatter if present
if (raw.startsWith('---')) {
  const parts = raw.split(/^---$/m);
  if (parts.length >= 3) {
    const yaml = parts[1];
    title = unquote(yaml.match(/^title:\s*(.*)$/m)?.[1]);
    track = unquote(yaml.match(/^track:\s*(.*)$/m)?.[1]) || 'Technical';
    question = unquote(yaml.match(/^question:\s*(.*)$/m)?.[1]);
    description = unquote(yaml.match(/^description:\s*(.*)$/m)?.[1]);
    slug = unquote(yaml.match(/^slug:\s*(.*)$/m)?.[1]);
    keywords = unquote(yaml.match(/^keywords:\s*(.*)$/m)?.[1]);
    sourceIdea = unquote(yaml.match(/^(?:source_idea|sourceIdea|idea):\s*(.*)$/m)?.[1]);
  }
}

// Fallback regex parsing across body
if (!title) {
  title = raw.match(/^#\s+(.+)$/m)?.[1]?.trim() ||
          raw.match(/^Title:\s*(.+)$/im)?.[1]?.trim() ||
          'Untitled Draft';
}
if (!description) {
  description = raw.match(/(?:\*\*|__)?Meta description:(?:\*\*|__)?\s*([^\n]+)/i)?.[1]?.trim() || '';
}
if (!slug) {
  slug = raw.match(/(?:\*\*|__)?Slug:(?:\*\*|__)?\s*([^\n]+)/i)?.[1]?.trim() ||
         title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
if (!question) {
  question = raw.match(/(?:\*\*|__)?Reader Question:(?:\*\*|__)?\s*([^\n]+)/i)?.[1]?.trim() || '';
}
if (!keywords) {
  keywords = raw.match(/(?:\*\*|__)?SEO Keywords:(?:\*\*|__)?\s*([^\n]+)/i)?.[1]?.trim() || '';
}

// Strip any trailing markdown formatting characters from parsed strings
description = description.replace(/^[*_:\s]+|[*_\s]+$/g, '').trim();
slug = slug.replace(/^[*_:\s]+|[*_\s]+$/g, '').trim().toLowerCase();
question = question.replace(/^[*_:\s]+|[*_\s]+$/g, '').trim();
title = title.replace(/^[*_:\s]+|[*_\s]+$/g, '').trim();

// Ensure track matches valid Notion select options
const validTracks = ['Technical', 'Business', 'Basics', 'Case Studies', 'Talks'];
const matchedTrack = validTracks.find((t) => t.toLowerCase() === track.toLowerCase()) || 'Technical';

// Remove frontmatter from body
let bodyText = raw.replace(/^---[\s\S]*?---\s*/, '').trim();
// Strip leading H1 title if present
bodyText = bodyText.replace(/^#\s+[^\n]+\n+/, '');

// Convert markdown text to Notion blocks
function textToBlocks(text) {
  const blocks = [];
  const lines = text.split('\n');
  let i = 0;

  // Add opening callout with description and slug if present
  if (description || slug) {
    const calloutLines = [];
    if (description) calloutLines.push(`**Meta description:** ${description}`);
    if (slug) calloutLines.push(`**Slug:** ${slug}`);
    blocks.push({
      object: 'block',
      type: 'callout',
      callout: {
        rich_text: [{ type: 'text', text: { content: calloutLines.join('\n') } }],
        icon: { emoji: '💡' },
      },
    });
  }

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    // Code block
    if (trimmed.startsWith('```')) {
      const lang = trimmed.slice(3).trim() || 'plain text';
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      blocks.push({
        object: 'block',
        type: 'code',
        code: {
          language: lang === 'xml' || lang === 'svg' ? 'xml' : (lang === 'html' ? 'html' : 'plain text'),
          rich_text: [{ type: 'text', text: { content: codeLines.join('\n').slice(0, 2000) } }],
        },
      });
      continue;
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      blocks.push({
        object: 'block',
        type: 'heading_3',
        heading_3: { rich_text: [{ type: 'text', text: { content: trimmed.slice(4).slice(0, 2000) } }] },
      });
      i++;
      continue;
    }
    if (trimmed.startsWith('## ')) {
      blocks.push({
        object: 'block',
        type: 'heading_2',
        heading_2: { rich_text: [{ type: 'text', text: { content: trimmed.slice(3).slice(0, 2000) } }] },
      });
      i++;
      continue;
    }

    // Bulleted list item
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      blocks.push({
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: { rich_text: [{ type: 'text', text: { content: trimmed.slice(2).slice(0, 2000) } }] },
      });
      i++;
      continue;
    }

    // Numbered list item
    if (/^\d+\.\s+/.test(trimmed)) {
      const match = trimmed.match(/^\d+\.\s+(.+)$/);
      blocks.push({
        object: 'block',
        type: 'numbered_list_item',
        numbered_list_item: { rich_text: [{ type: 'text', text: { content: match[1].slice(0, 2000) } }] },
      });
      i++;
      continue;
    }

    // Quotes
    if (trimmed.startsWith('> ')) {
      blocks.push({
        object: 'block',
        type: 'quote',
        quote: { rich_text: [{ type: 'text', text: { content: trimmed.slice(2).slice(0, 2000) } }] },
      });
      i++;
      continue;
    }

    // Dividers
    if (trimmed === '---' || trimmed === '***') {
      blocks.push({ object: 'block', type: 'divider', divider: {} });
      i++;
      continue;
    }

    // Standard paragraph
    blocks.push({
      object: 'block',
      type: 'paragraph',
      paragraph: { rich_text: [{ type: 'text', text: { content: trimmed.slice(0, 2000) } }] },
    });
    i++;
  }

  return blocks;
}

const blocks = textToBlocks(bodyText);
const today = new Date().toISOString().slice(0, 10);

const properties = {
  Name: { title: [{ type: 'text', text: { content: title.slice(0, 70) } }] },
  'Draft Status': { select: { name: 'Draft Ready' } },
  Track: { select: { name: matchedTrack } },
  'Reader Question': { rich_text: [{ type: 'text', text: { content: question.slice(0, 120) } }] },
  'Draft Completed': { date: { start: today } },
  'Promoted On': { date: { start: today } },
};
if (keywords) {
  properties['SEO Keywords'] = { rich_text: [{ type: 'text', text: { content: keywords.slice(0, 2000) } }] };
}
if (sourceIdea) {
  properties['Source Idea'] = { relation: [{ id: sourceIdea }] };
}

console.log('──────────────────────────────────────────────────────');
console.log('ARTICLE IMPORT PREVIEW');
console.log('──────────────────────────────────────────────────────');
console.log(`Title:           "${title}" (${title.length}/70 chars)`);
console.log(`Track:           ${matchedTrack}`);
console.log(`Reader Question: "${question}" (${question.length}/120 chars)`);
console.log(`Meta Description:"${description}" (${description.length}/160 chars)`);
console.log(`Slug:            ${slug}`);
console.log(`Total Blocks:    ${blocks.length} blocks parsed`);
console.log('──────────────────────────────────────────────────────');

if (!commit) {
  console.log('\n[DRY RUN] Would create page in Notion Article Production.');
  console.log('Run with --commit to push directly to Notion:\n');
  console.log(`node site/scripts/import-draft.mjs "${fileArg}" --commit\n`);
  process.exit(0);
}

console.log('Pushing to Notion Article Production...');
// Notion limits initial children to 100 blocks
const firstBatch = blocks.slice(0, 100);
const remainingBlocks = blocks.slice(100);

const page = await api('/pages', {
  method: 'POST',
  body: {
    parent: { type: 'data_source_id', data_source_id: PRODUCTION_DS },
    properties,
    children: firstBatch,
  },
});

console.log(`✓ Created page: ${page.id} (${page.url})`);

// Append any remaining blocks in chunks of 100
let chunkIndex = 1;
while (remainingBlocks.length > 0) {
  const chunk = remainingBlocks.splice(0, 100);
  console.log(`  Appending block chunk ${chunkIndex++} (${chunk.length} blocks)...`);
  await api(`/blocks/${page.id}/children`, {
    method: 'PATCH',
    body: { children: chunk },
  });
}

if (sourceIdea) {
  try {
    await api(`/pages/${sourceIdea}`, {
      method: 'PATCH',
      body: { properties: { Status: { select: { name: 'Drafting' } } } },
    });
    console.log(`  Linked and marked radar idea ${sourceIdea} as Drafting.`);
  } catch (err) {
    console.warn(`  Could not update radar idea ${sourceIdea}: ${err.message}`);
  }
}

console.log('\n✓ Article draft successfully ingested into Notion at Draft Ready!');
console.log('To run preflight assertions:');
console.log(`node site/scripts/publish-article.mjs --check ${page.id}`);
