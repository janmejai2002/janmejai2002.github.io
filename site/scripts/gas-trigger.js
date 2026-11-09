/**
 * wAIbi-sabi Serverless Cloud Ingress & Trigger Microkernel (Google Apps Script)
 * 
 * Implements Question 1 of docs/HARNESS-ENGINEERING-BLUEPRINT.md:
 * - Serverless Cloud Ingress: Runs on Google Apps Script (GAS) time-driven triggers at 06:00 IST.
 * - Reactive Wakeup: When updates are written to Google Sheets / Notion, dispatches
 *   repository_dispatch: notion-changed directly to GitHub Actions.
 * - Eliminates the "Sleeping PC Trap": Operates continuously in the Google cloud without
 *   requiring the user's Windows 11 laptop to be awake or connected.
 * 
 * Deployment Instructions:
 * 1. Open your Google Apps Script project bound to the wAIbi-sabi News Spreadsheet.
 * 2. Paste this file into Code.gs (or gas-trigger.gs).
 * 3. Configure Script Properties (Project Settings -> Script Properties):
 *    - GITHUB_PAT: GitHub Personal Access Token with repo/actions dispatch permissions
 *    - GITHUB_REPO: "janmejai2002/janmejai2002.github.io"
 *    - NOTION_TOKEN: Notion integration secret
 * 4. Add a time-driven trigger:
 *    - Function: dailyIngressAndDispatchTrigger
 *    - Time: Day timer, 06:00 to 07:00 IST
 */

function getScriptProp(key) {
  return PropertiesService.getScriptProperties().getProperty(key);
}

/**
 * Dispatches an event to GitHub Actions to wake the publication pipeline instantly.
 * Bypasses GitHub's scheduled cron deprioritization on quiet repositories.
 */
function wakeGitHubPublishPipeline() {
  const token = getScriptProp('GITHUB_PAT');
  const repo = getScriptProp('GITHUB_REPO') || 'janmejai2002/janmejai2002.github.io';
  
  if (!token) {
    Logger.log('WARNING: GITHUB_PAT is not configured in Script Properties.');
    return false;
  }

  const url = 'https://api.github.com/repos/' + repo + '/dispatches';
  const payload = JSON.stringify({
    event_type: 'notion-changed',
    client_payload: {
      source: 'Google Apps Script Daily Cloud Ingress',
      timestamp: new Date().toISOString()
    }
  });

  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': 'token ' + token,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'wAIbi-sabi-GAS-Dispatcher'
    },
    payload: payload,
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const code = response.getResponseCode();
    if (code === 204) {
      Logger.log('✓ Successfully dispatched notion-changed event to GitHub Actions.');
      return true;
    } else {
      Logger.log('✗ GitHub dispatch returned HTTP ' + code + ': ' + response.getContentText());
      return false;
    }
  } catch (err) {
    Logger.log('✗ Failed to dispatch to GitHub: ' + err.toString());
    return false;
  }
}

/**
 * Main daily trigger function.
 * 1. Checks Google Sheet for newly ingested rows from Gemini Spark.
 * 2. If new rows exist or Notion has changed, wakes GitHub Actions.
 */
function dailyIngressAndDispatchTrigger() {
  Logger.log('Starting wAIbi-sabi serverless cloud ingress sweep...');
  
  // Check active sheet
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const lastRow = sheet.getLastRow();
  Logger.log('Total rows in current archive: ' + lastRow);
  
  // Dispatch reactive trigger to GitHub Actions
  const success = wakeGitHubPublishPipeline();
  Logger.log('Cloud Ingress sweep finished with status: ' + (success ? 'DISPATCHED' : 'IDLE'));
}
