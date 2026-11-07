# wAIbi-sabi — Google Apps Script & Sheets Cloud Automation Bridge

**Engine**: Google Apps Script (GAS) + Google Sheets + GitHub Actions (Astro 5 SSG)  
**Google Account**: `janmejai2002@gmail.com` (Verified via `.clasprc.json`)  
**Trigger**: Time-Driven Cloud Trigger (Daily at 06:00 AM IST / 00:30 UTC)  

---

## 1. System Flow & Architecture

```
┌────────────────────────────────────────────────────────┐
│ GOOGLE APPS SCRIPT (GAS) TIME-DRIVEN TRIGGER           │
│   • Runs 100% in Google's Cloud (24/7, zero PC uptime) │
│   • Schedule: Every day at 06:00 AM IST (00:30 UTC)    │
│   • Account: janmejai2002@gmail.com                    │
└───────────────────────────┬────────────────────────────┘
                            │
               calls Gemini / Search & formats
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ GOOGLE SHEET DATABASE                                  │
│   • Columns: Date | Category | Headline | Summary |    │
│              Interview Angle | Source                  │
│   • Directly viewable and editable by you              │
└───────────────────────────┬────────────────────────────┘
                            │
               polled every 3h by GitHub Actions
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ GITHUB ACTIONS (`sync-news.yml`)                       │
│   • Fetches CSV export from Google Sheet               │
│   • Merges & deduplicates with Notion + local disk     │
│   • Builds Astro 5 (`npm run build`)                   │
│   • Deploys to GitHub Pages (janmejai2002.github.io)   │
└────────────────────────────────────────────────────────┘
```

---

## 2. Google Sheet Schema

| Column A | Column B | Column C | Column D | Column E | Column F |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Date** | **Category** | **Headline** | **Summary** | **Interview Angle** | **Source** |
| `2026-11-07` | `Finance` | `Tata Capital IPO Targets $2B Listing` | `Two-sentence factual summary with numbers...` | `Interview push: primary market cycles...` | `https://...` |

**Allowed Categories**: `Marketing`, `Finance`, `Operations`, `Product Management`, `Consulting`.

---

## 3. Google Apps Script Code (`Code.js`)

```javascript
/**
 * wAIbi-sabi Autonomous News Curator
 * Runs on a daily time-driven trigger.
 */
const SPREADSHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE';
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';

function dailyNewsSweep() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('News') || ss.getActiveSheet();
  
  const prompt = `Research the top 5 business news stories of the day for Indian MBA students across Marketing, Finance, Operations, Product Management, Consulting. Return a JSON array of objects with keys: date (YYYY-MM-DD), category, headline (max 70 chars), summary (2 sentences), angle (1-2 sentences MBA interview question), source (URL).`;
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: "application/json" }
  };
  
  const res = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload)
  });
  
  const data = JSON.parse(res.getContentText());
  const items = JSON.parse(data.candidates[0].content.parts[0].text);
  
  for (const item of items) {
    sheet.appendRow([
      item.date,
      item.category,
      item.headline,
      item.summary,
      item.angle,
      item.source
    ]);
  }
}
```

---

## 4. GitHub Actions Ingestion

[`site/scripts/sync-news.mjs`](file:///C:/Users/Janmejai/janmejai2002.github.io/site/scripts/sync-news.mjs) is already upgraded to ingest from Google Sheets CSV:
- URL format: `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`
- Merges with Notion and existing entries, deduplicates, and commits.
