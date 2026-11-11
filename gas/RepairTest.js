/**
 * One-click repair-loop test, from the Sheet menu "wAIbi → Start a repair test".
 *
 * Adds one row to the code-owned "Repair Tests" tab (key prefix RT) holding the
 * test article from the repo (REGISTRY.REPAIR.testFixture: one ASCII diagram and
 * one em dash, both in one section), with Status = Test, and wakes GitHub. From
 * there it runs by itself:
 *   sync-drafts      creates the Notion row at Needs Revision with its findings
 *   Conductor tick   puts it in Repair Queue (sections mode) + Repair Sections
 *   Repairer (you)   run it in Gemini, or wait for the 09:00 / 19:00 schedule
 *   sync-drafts      verifies the patch and writes the verdict on the Notion row
 *                    and the Status tab; a test row is never applied or published
 * Starting a new test removes the previous test rows, and sync-drafts then
 * deletes their Notion rows. Outbox / Patches rows stay (those tabs are append-only).
 */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('wAIbi')
    .addItem('Start a repair test', 'startRepairTest')
    .addItem('Show repair test result', 'showRepairTestResult')
    .addToUi();
}

function startRepairTest() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var name = REGISTRY.REPAIR.testTab;
  ensureTabs_();
  var res = UrlFetchApp.fetch('https://raw.githubusercontent.com/' + REGISTRY.REPO + '/main/' + REGISTRY.REPAIR.testFixture, { muteHttpExceptions: true });
  if (res.getResponseCode() !== 200) return say_('Could not fetch the test article (HTTP ' + res.getResponseCode() + ').');
  var draft = res.getContentText('UTF-8');

  var sh = ss.getSheetByName(name);
  if (sh.getLastRow() > 1) sh.deleteRows(2, sh.getLastRow() - 1); // one test at a time
  var now = new Date();
  var date = Utilities.formatDate(now, 'Asia/Kolkata', 'yyyy-MM-dd');
  var title = 'TEST ' + Utilities.formatDate(now, 'Asia/Kolkata', 'yyyy-MM-dd HH:mm') + ' Repair loop check';
  var cols = REGISTRY.SHEET.tabs[name].columns;
  var row = cols.map(function (c) {
    return { Date: date, Track: 'Technical', Title: title, Draft: draft, Status: REGISTRY.REPAIR.testStatus }[c] || '';
  });
  // Plain text, so the date reads back exactly as written (the key is built from it).
  sh.getRange(2, 1, 1, cols.length).setNumberFormat('@').setValues([row]);
  var key = sheetKey_(name, date, title);
  PROPS.setProperty('REPAIR_TEST_KEY', key);

  var woke = PROPS.getProperty('GITHUB_TOKEN') && dispatch_('sync-news.yml');
  say_('Repair test ' + key + ' filed.\n\n' +
    (woke ? 'GitHub is creating its Notion row now (about 2 minutes). ' : 'GitHub will pick it up within 30 minutes. ') +
    'It appears in Repair Queue on the next Conductor tick (15 minutes).\n\n' +
    'Then run the Repairer in Gemini. Use wAIbi → Show repair test result afterwards.');
}

function showRepairTestResult() {
  var key = PROPS.getProperty('REPAIR_TEST_KEY');
  if (!key) return say_('No repair test has been started yet.');
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var st = readTab_(ss, 'Status').filter(function (r) { return r.Key === key; })[0];
  var queued = readTab_(ss, 'Repair Queue').filter(function (r) { return r.Key === key; })[0];
  var filed = readTab_(ss, 'Repair Outbox').filter(function (r) { return r.Key === key; }).length;
  var stage = !st ? 'Waiting for GitHub to create the Notion row.'
    : /^TEST RUN/.test(st['Blocked Reason']) ? 'Done.'
    : filed ? 'The Repairer has filed; waiting for the next sync to verify it (up to 15 minutes).'
    : queued ? 'Queued (' + queued.Mode + ' mode). Run the Repairer in Gemini.'
    : 'In Notion at ' + st['Draft Status'] + '; waiting for the next Conductor tick to queue it.';
  say_(key + '\n\n' + stage + (st && /^TEST RUN/.test(st['Blocked Reason']) ? '\n\n' + st['Blocked Reason'] : ''));
}

function say_(msg) {
  try { SpreadsheetApp.getUi().alert(msg); } catch (e) { Logger.log(msg); }
}
