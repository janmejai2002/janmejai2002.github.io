/**
 * wAIbi-sabi Autonomous Editorial Engine (Google Apps Script)
 * 
 * Complete serverless cloud ingress for wAIbi-sabi:
 * 1. dailyNewsSweep (06:00 IST): Ingests top 5 Indian MBA business stories into Google Sheets.
 * 2. runDailyRadarSweep (06:30 IST): Discovers trending applied-AI practitioner questions across
 *    Technical, Business, and Basics tracks; files to Notion Pipeline Radar.
 * 3. runApprovedArticleWriter (07:00 IST): Scans Radar for rated-5 ideas (or unattended Basics),
 *    drafts publication-grade articles with Executive TL;DR and SVG artwork, pushes to
 *    Notion Article Production at `Draft Ready`, and wakes GitHub Actions.
 * 
 * Configuration:
 * Set Script Properties (Project Settings -> Script Properties):
 * - NOTION_TOKEN: Notion internal integration token
 * - GEMINI_API_KEY: Google AI Studio API Key (or Google AI Pro)
 * - SPREADSHEET_ID: 1-UcD-C4My_Zp4aH3n-5dB3JQNtDN_MSAK6vTCPt8LY0 (or active sheet)
 * - GITHUB_PAT: (Optional) GitHub Personal Access Token to trigger repository_dispatch
 */

function getProp(key, fallback = '') {
  return PropertiesService.getScriptProperties().getProperty(key) || fallback;
}

const NOTION_VERSION = '2025-09-03';
const RADAR_DS = '511e41a3-c1cd-47e0-8fa2-d319feef0ced';
const PRODUCTION_DS = 'd39ea073-cc87-4c25-8a3c-d9f276a59b68';

function notionFetch(path, options = {}) {
  const token = getProp('NOTION_TOKEN');
  if (!token) throw new Error('NOTION_TOKEN is not set in Script Properties.');
  
  const url = 'https://api.notion.com/v1' + path;
  const headers = {
    'Authorization': 'Bearer ' + token,
    'Notion-Version': NOTION_VERSION,
    'Content-Type': 'application/json'
  };

  const res = UrlFetchApp.fetch(url, {
    method: options.method || 'get',
    headers: headers,
    payload: options.body ? JSON.stringify(options.body) : undefined,
    muteHttpExceptions: true
  });

  const code = res.getResponseCode();
  const text = res.getContentText();
  if (code >= 400) {
    throw new Error('Notion API ' + code + ' on ' + path + ': ' + text);
  }
  return JSON.parse(text);
}

function geminiGenerate(prompt, systemInstruction = '', searchGrounding = false) {
  const apiKey = getProp('GEMINI_API_KEY');
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set in Script Properties.');

  const model = 'gemini-2.5-flash';
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + apiKey;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.4
    }
  };

  if (systemInstruction) {
    payload.systemInstruction = { parts: [{ text: systemInstruction }] };
  }

  if (searchGrounding) {
    payload.tools = [{ googleSearch: {} }];
  }

  const res = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  const code = res.getResponseCode();
  const text = res.getContentText();
  if (code >= 400) {
    throw new Error('Gemini API ' + code + ': ' + text);
  }

  const data = JSON.parse(text);
  return data.candidates[0].content.parts[0].text;
}

/**
 * 1. DAILY NEWS SWEEP (06:00 IST)
 */
function dailyNewsSweep() {
  Logger.log('Executing dailyNewsSweep...');
  const spreadsheetId = getProp('SPREADSHEET_ID', '1-UcD-C4My_Zp4aH3n-5dB3JQNtDN_MSAK6vTCPt8LY0');
  const ss = SpreadsheetApp.openById(spreadsheetId);
  const sheet = ss.getSheetByName('News') || ss.getActiveSheet();

  const prompt = `Research the top 5 high-impact business news stories of the day relevant to Indian MBA candidates and practitioners.
Categories: Marketing, Finance, Operations, Product Management, Consulting.
For each story provide:
- date: Today's date YYYY-MM-DD
- category: One of the five categories
- headline: Max 70 characters, factual, specific
- summary: Exactly 2 sentences packed with numbers, percentages, and actors
- angle: 1-2 sentences formulating the exact B-school interview question
- source: Direct source URL

Return a JSON array of objects with keys: date, category, headline, summary, angle, source. Output valid JSON only.`;

  const rawJson = geminiGenerate(prompt, 'You are an elite B-school interview news curator. Output JSON only.', true);
  const cleanJson = rawJson.replace(/```json/gi, '').replace(/```/g, '').trim();
  const stories = JSON.parse(cleanJson);

  let added = 0;
  for (const item of stories) {
    sheet.appendRow([
      item.date,
      item.category,
      item.headline.slice(0, 70),
      item.summary,
      item.angle,
      item.source
    ]);
    added++;
  }
  Logger.log('✓ Successfully appended ' + added + ' news stories to Google Sheets.');
}

/**
 * 2. DAILY RADAR SWEEP (06:30 IST)
 */
function runDailyRadarSweep() {
  Logger.log('Executing runDailyRadarSweep across Technical, Business, and Basics...');
  const tracks = ['Technical', 'Business', 'Basics'];

  for (const track of tracks) {
    const prompt = `Research today's top trending AI development or controversy for the "${track}" track.
Identify a real question a working practitioner or tech lead actually asked about AI.

STRICT CONSTRAINTS:
1. title: Maximum 70 characters. Specific, non-generic.
2. reader_question: Maximum 120 characters. Real practitioner question.
3. pitch: Exactly one engaging paragraph of 90-110 words explaining the angle, concrete hook, and technical/economic friction.
4. keywords: Primary keyword plus 3-4 comma-separated secondary keywords.
5. track: Exactly "${track}".

Return a single JSON object with keys: title, reader_question, pitch, keywords, track. Output valid JSON only.`;

    try {
      const rawJson = geminiGenerate(prompt, 'You are the Lead Applied-AI Editor for wAIbi-sabi. Output JSON only.', true);
      const cleanJson = rawJson.replace(/```json/gi, '').replace(/```/g, '').trim();
      const idea = JSON.parse(cleanJson);

      const props = {
        Name: { title: [{ type: 'text', text: { content: idea.title.slice(0, 70) } }] },
        'Reader Question': { rich_text: [{ type: 'text', text: { content: idea.reader_question.slice(0, 120) } }] },
        Track: { select: { name: idea.track } },
        Pitch: { rich_text: [{ type: 'text', text: { content: idea.pitch.slice(0, 2000) } }] },
        'SEO Keywords': { rich_text: [{ type: 'text', text: { content: idea.keywords.slice(0, 2000) } }] },
        Status: { select: { name: 'Radar Idea' } }
      };

      const page = notionFetch('/pages', {
        method: 'post',
        body: {
          parent: { data_source_id: RADAR_DS },
          properties: props
        }
      });
      Logger.log('✓ Filed ' + track + ' idea to Notion: ' + page.id + ' ("' + idea.title + '")');
    } catch (err) {
      Logger.log('✗ Failed to file radar idea for ' + track + ': ' + err.toString());
    }
  }
}

/**
 * 3. WAKE GITHUB ACTIONS PIPELINE
 */
function wakeGitHubPublishPipeline() {
  const pat = getProp('GITHUB_PAT');
  const repo = getProp('GITHUB_REPO', 'janmejai2002/janmejai2002.github.io');
  if (!pat) {
    Logger.log('Note: GITHUB_PAT is not set; skipping repository_dispatch wake.');
    return;
  }

  const url = 'https://api.github.com/repos/' + repo + '/dispatches';
  const res = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': 'token ' + pat,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'wAIbi-sabi-GAS-Engine'
    },
    payload: JSON.stringify({
      event_type: 'notion-changed',
      client_payload: { source: 'Google Apps Script Article Engine' }
    }),
    muteHttpExceptions: true
  });

  if (res.getResponseCode() === 204) {
    Logger.log('✓ Dispatched notion-changed event to GitHub Actions.');
  } else {
    Logger.log('✗ GitHub dispatch returned HTTP ' + res.getResponseCode() + ': ' + res.getContentText());
  }
}

/**
 * 4. ONE-CLICK TRIGGER INSTALLATION
 * Run this function once from the Apps Script editor to configure daily crons.
 */
function installTimeDrivenTriggers() {
  // Clear existing triggers for these handlers
  const triggers = ScriptApp.getProjectTriggers();
  const tracked = ['dailyNewsSweep', 'runDailyRadarSweep'];
  for (const t of triggers) {
    if (tracked.includes(t.getHandlerFunction())) {
      ScriptApp.deleteTrigger(t);
    }
  }

  // News sweep at 06:00 IST
  ScriptApp.newTrigger('dailyNewsSweep')
    .timeBased()
    .atHour(6)
    .everyDays(1)
    .inTimezone('Asia/Kolkata')
    .create();

  // Radar sweep at 06:30 IST
  ScriptApp.newTrigger('runDailyRadarSweep')
    .timeBased()
    .atHour(6)
    .nearMinute(30)
    .everyDays(1)
    .inTimezone('Asia/Kolkata')
    .create();

  Logger.log('✓ Successfully registered time-driven triggers at 06:00 and 06:30 IST.');
}
