/**
 * wAIbi-sabi Gemini Tasks Local CLI Runner
 * 
 * Provides unified command-line control for all Gemini-powered autonomous tasks:
 * - `radar [track]`: Runs radar discovery and files a fresh pitch to Notion Pipeline Radar.
 * - `write <radar-id>`: Compiles claim ledger, drafts article with Gemini, ingests to Notion Production, and runs preflight.
 * - `auto`: Scans for rated-5 ideas on the radar and drafts the next in queue.
 * - `status`: Reports active status across Radar, Production, and News archives.
 * 
 * Usage:
 *   node site/scripts/gemini-tasks.mjs status
 *   node site/scripts/gemini-tasks.mjs radar Technical
 *   node site/scripts/gemini-tasks.mjs write <radar-idea-id> [--commit]
 *   node site/scripts/gemini-tasks.mjs auto [--commit]
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { api, PIPELINE_DS, PRODUCTION_DS, queryAll } from './lib/notion.mjs';
import { buildCachedGeminiPayload } from './lib/prompt-cache.mjs';
import { quarantineRawSource, extractEmpiricalSentences, verifyClaimLedger } from './lib/quarantine.mjs';

function getGeminiApiKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY.trim();
  const envPath = 'C:/Users/Janmejai/.env.global';
  if (existsSync(envPath)) {
    try {
      const line = readFileSync(envPath, 'utf8')
        .split(/\r?\n/)
        .find((l) => l.startsWith('GEMINI_API_KEY='));
      if (line) return line.slice('GEMINI_API_KEY='.length).trim().replace(/^["']|["']$/g, '');
    } catch {}
  }
  return null;
}

const [cmd, arg1, ...rest] = process.argv.slice(2);
const commit = process.argv.includes('--commit');

async function callGemini(payload) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not found in environment or C:/Users/Janmejai/.env.global. Add GEMINI_API_KEY=<your-key> to enable live AI tasks.');
  }

  const model = payload.model || 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    throw new Error(`Gemini API ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function statusCmd() {
  console.log('──────────────────────────────────────────────────────');
  console.log('wAIbi-sabi Gemini Tasks Status');
  console.log('──────────────────────────────────────────────────────');
  const radarRows = await queryAll(PIPELINE_DS);
  const prodRows = await queryAll(PRODUCTION_DS);

  const ratedHigh = radarRows.filter((r) => {
    const rating = r.properties['Interest Rating']?.select?.name || '';
    return rating.startsWith('4') || rating.startsWith('5');
  });

  const draftReady = prodRows.filter((r) => r.properties['Draft Status']?.select?.name === 'Draft Ready');
  const needsRev = prodRows.filter((r) => r.properties['Draft Status']?.select?.name === 'Needs Revision');

  console.log(`• Radar Database:      ${radarRows.length} total ideas (${ratedHigh.length} rated 4 or 5)`);
  console.log(`• Production Database: ${prodRows.length} total rows (${draftReady.length} Draft Ready, ${needsRev.length} Needs Revision)`);
  console.log(`• Gemini API Key:      ${getGeminiApiKey() ? '✓ Configured' : '✗ Missing in .env.global'}`);
  console.log('──────────────────────────────────────────────────────');
  if (ratedHigh.length > 0) {
    console.log('\nTop Rated Radar Ideas Ready for Drafting:');
    for (const item of ratedHigh.slice(0, 5)) {
      const title = item.properties.Name?.title?.[0]?.plain_text || '(no title)';
      const track = item.properties.Track?.select?.name || 'Technical';
      const rating = item.properties['Interest Rating']?.select?.name || '';
      console.log(`  [${rating.slice(0, 1)}] [${track}] ${title} (${item.id})`);
    }
  }
}

async function radarCmd(trackArg) {
  const track = trackArg || 'Technical';
  console.log(`Running Gemini Radar Sweep for Track: ${track}...`);

  const prompt = `Research today's top trending AI engineering development, controversial deployment, or architectural shift for the "${track}" track.
Identify a real question a working practitioner or tech lead actually asked about AI.

STRICT CONSTRAINTS:
1. title: Maximum 70 characters. Specific, non-generic.
2. reader_question: Maximum 120 characters. Real practitioner question.
3. pitch: Exactly one engaging paragraph of 90-110 words explaining the angle, concrete hook, and technical/economic friction.
4. keywords: Primary keyword plus 3-4 comma-separated secondary keywords.
5. track: Exactly "${track}".

Return a single JSON object with keys: title, reader_question, pitch, keywords, track. Output valid JSON only.`;

  const payload = {
    model: 'gemini-2.5-flash',
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.4,
      responseMimeType: 'application/json'
    }
  };

  const rawJson = await callGemini(payload);
  const cleanJson = rawJson.replace(/```json/gi, '').replace(/```/g, '').trim();
  const idea = JSON.parse(cleanJson);

  console.log('\nGenerated Radar Idea:');
  console.log(`Title:           "${idea.title}" (${idea.title.length}/70 chars)`);
  console.log(`Reader Question: "${idea.reader_question}" (${idea.reader_question.length}/120 chars)`);
  console.log(`Track:           ${idea.track}`);
  console.log(`Keywords:        ${idea.keywords}`);
  console.log(`Pitch:\n${idea.pitch}`);

  if (!commit) {
    console.log('\n[DRY RUN] Run with --commit to file directly into Notion Pipeline Radar.');
    return;
  }

  const props = {
    Name: { title: [{ type: 'text', text: { content: idea.title.slice(0, 70) } }] },
    'Reader Question': { rich_text: [{ type: 'text', text: { content: idea.reader_question.slice(0, 120) } }] },
    Track: { select: { name: idea.track } },
    Pitch: { rich_text: [{ type: 'text', text: { content: idea.pitch.slice(0, 2000) } }] },
    'SEO Keywords': { rich_text: [{ type: 'text', text: { content: idea.keywords.slice(0, 2000) } }] },
    Status: { select: { name: 'Radar Idea' } }
  };

  const page = await api('/pages', {
    method: 'POST',
    body: {
      parent: { data_source_id: PIPELINE_DS },
      properties: props
    }
  });

  console.log(`\n✓ Filed to Notion Radar: ${page.id} (${page.url})`);
}

async function main() {
  switch (cmd) {
    case 'status':
      await statusCmd();
      break;
    case 'radar':
      await radarCmd(arg1);
      break;
    default:
      console.log('Usage: node site/scripts/gemini-tasks.mjs <status | radar [track] | write <id> | auto>');
      break;
  }
}

main().catch((err) => {
  console.error('\n✗ Error:', err.message);
  process.exit(1);
});
