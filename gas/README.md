# wAIbi-sabi Google Apps Script Engine Deployment Guide

This directory contains the 100% serverless, zero-cost Google Apps Script engine for wAIbi-sabi.
It runs 24/7 in Google's cloud without requiring your laptop to be awake.

---

## 1. Quick Deploy via Clasp (Recommended)

Since `clasp` is already installed and authenticated as `janmejai2002@gmail.com`:

```powershell
# From the project root:
cd gas
clasp create --title "wAIbi-sabi Editorial Engine" --type standalone
clasp push
```

---

## 2. Manual Web Deploy (Alternative)

1. Open [script.google.com](https://script.google.com) while logged into `janmejai2002@gmail.com`.
2. Click **New Project** and name it `wAIbi-sabi Editorial Engine`.
3. Copy the contents of `ArticleEngine.js` and paste it into `Code.gs`.
4. Copy `appsscript.json` (Project Settings -> show manifest).

---

## 3. Configure Script Properties

In Google Apps Script, navigate to **Project Settings (Gear icon) -> Script Properties**:

| Property | Value | Description |
|---|---|---|
| `NOTION_TOKEN` | `agynewsetup...` | Your Notion internal integration secret |
| `GEMINI_API_KEY` | `AIzaSy...` | Your Google AI Studio API key |
| `SPREADSHEET_ID` | `1-UcD-C4My_Zp4aH3n-5dB3JQNtDN_MSAK6vTCPt8LY0` | Live B-school news Google Sheet |
| `GITHUB_PAT` | `ghp_...` | (Optional) GitHub token for repository_dispatch |
| `GITHUB_REPO` | `janmejai2002/janmejai2002.github.io` | Your GitHub repository |

---

## 4. Install Automated Crons (One Click)

From the Apps Script editor toolbar:
1. Select function `installTimeDrivenTriggers`.
2. Click **Run**.
3. Authorize permissions when prompted.

This automatically configures:
- `dailyNewsSweep` at **06:00 AM IST**
- `runDailyRadarSweep` at **06:30 AM IST**
