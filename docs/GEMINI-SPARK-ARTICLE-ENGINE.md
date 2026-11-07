# wAIbi-sabi — Gemini Spark Autonomous Article & Radar Engine

**Engine**: Google Cloud / Google Apps Script (GAS) + Notion REST API + GitHub Actions  
**Google Account**: `janmejai2002@gmail.com`  
**Subscription**: Google AI Pro (Gemini Spark / Gemini 2.5/Gemini 4 Argon)  
**Zero Claude Subscription / Token Costs**  

---

## 1. System Architecture

```
┌────────────────────────────────────────────────────────┐
│ GOOGLE APPS SCRIPT (GAS) TIME-DRIVEN TRIGGER           │
│   • Runs 100% in Google Cloud (Daily 06:30 AM IST)     │
│   • Account: janmejai2002@gmail.com                    │
└───────────────────────────┬────────────────────────────┘
                            │
               calls Gemini with Web Grounding
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ 1. RADAR ENGINE (daily-ai-seo-radar, business, basics) │
│   • Formats 100-word Pitch, Reader Question (≤120)     │
│   • Title (≤70), Track (Technical, Business, Basics)   │
│   • Pushes `Radar Idea` → Notion Pipeline DB           │
└───────────────────────────┬────────────────────────────┘
                            │
               Human Approval: Rating = 4 or 5
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ 2. ARTICLE WRITER ENGINE                               │
│   • Promotes approved idea to Article Production DB    │
│   • Gathers primary source facts & builds Claim Ledger │
│   • Drafts 1,400–2,000 words adhering to anti-ai-writing│
│   • Mandatory `Executive TL;DR` H2 (4–6 data bullets)  │
│   • Appends `Artwork brief` & compiles 1600x900 SVG   │
│   • Sets `Draft Status = Draft Ready`                  │
└───────────────────────────┬────────────────────────────┘
                            │
            Polled by GitHub Actions (every 30m)
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ 3. GITHUB ACTIONS: `publish-from-notion.yml`           │
│   • Unattended (`Basics`, `Case Studies`, `Talks`):    │
│     Pushes straight to `main` → Live Deployment        │
│   • Reviewed (`Technical`, `Business`):                │
│     Opens PR on `notion/approved-articles`             │
│   • `close-loop.mjs` verifies live HTTP 200            │
└────────────────────────────────────────────────────────┘
```

---

## 2. Google Apps Script Implementation (`ArticleEngine.js`)

You can paste this script into your existing Google Apps Script project at `script.google.com`:

```javascript
/**
 * wAIbi-sabi Autonomous Radar & Article Writer
 * Runs on a daily time-driven trigger in Google Apps Script.
 */
const NOTION_TOKEN = 'YOUR_NOTION_TOKEN_HERE';
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';

const RADAR_DB_ID = '511e41a3-c1cd-47e0-8fa2-d319feef0ced';
const PRODUCTION_DB_ID = 'd39ea073-cc87-4c25-8a3c-d9f276a59b68';

const NOTION_HEADERS = {
  'Authorization': `Bearer ${NOTION_TOKEN}`,
  'Notion-Version': '2025-09-03',
  'Content-Type': 'application/json'
};

/**
 * 1. DAILY RADAR SWEEP
 * Discovers trending questions, writes 100-word pitches, and files to Notion.
 */
function runDailyRadarSweep() {
  const tracks = ['Technical', 'Business', 'Basics'];
  
  for (const track of tracks) {
    const prompt = `You are the lead editor of wAIbi-sabi (an applied-AI journal for working practitioners).
Research today's top trending AI development or controversy for the "${track}" track.
Identify a real question a working professional actually asked about AI.

STRICT CONSTRAINTS:
1. title: Max 70 characters. Specific, non-generic.
2. reader_question: Max 120 characters. Real practitioner question.
3. pitch: Exactly one engaging paragraph of 90-110 words explaining the angle, the concrete hook, and the tension.
4. keywords: Primary keyword plus 3-4 comma-separated secondary keywords.
5. track: Exactly "${track}".

Return JSON object with keys: title, reader_question, pitch, keywords, track.`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    };

    const res = UrlFetchApp.fetch(geminiUrl, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload)
    });

    const data = JSON.parse(res.getContentText());
    const idea = JSON.parse(data.candidates[0].content.parts[0].text);

    // Push idea to Notion Pipeline Radar DB
    UrlFetchApp.fetch('https://api.notion.com/v1/pages', {
      method: 'post',
      headers: NOTION_HEADERS,
      payload: JSON.stringify({
        parent: { database_id: RADAR_DB_ID },
        properties: {
          'Name': { title: [{ text: { content: idea.title.slice(0, 70) } }] },
          'Status': { select: { name: 'Radar Idea' } },
          'Track': { select: { name: idea.track } },
          'Reader Question': { rich_text: [{ text: { content: idea.reader_question.slice(0, 120) } }] },
          'Pitch': { rich_text: [{ text: { content: idea.pitch } }] },
          'SEO Keywords': { rich_text: [{ text: { content: idea.keywords } }] }
        }
      })
    });
    
    Utilities.sleep(1000);
  }
}
```
