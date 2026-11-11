/**
 * wAIbi-sabi CONDUCTOR — the harness's clock, running inside the owner's Google
 * account, bound to the "wAIbi-sabi News Feed" Sheet.
 *
 * Every 15 minutes (tick):
 *   1. Mirror Notion Article Production into the code-owned tabs:
 *        Status        — every article the Sheet produced, with its live state
 *        Repair Queue  — articles at Needs Revision the Repairer should fix,
 *                        each with its failure codes, the fix playbook, the
 *                        previous attempt's notes and the current draft text
 *   2. Wake GitHub when an agent tab gained rows (workflow_dispatch of
 *      sync-news.yml, which ingests and then publishes). GitHub's own cron is
 *      unreliable; this is the real trigger.
 *   3. Once a day, check the Runs tab and push one alert for any Gemini task
 *      that did not log a run.
 *
 * Never edits an agent-owned tab. Never writes to Notion (read-only token).
 * REGISTRY comes from Registry.js, generated from site/harness/registry.mjs —
 * do not edit rules here.
 *
 * Owner setup: docs/OWNER-SETUP.md. Run install() once from the editor.
 */

var PROPS = PropertiesService.getScriptProperties();

/* ───────────────────────── entry points ───────────────────────── */

/** Run once from the editor: grants consent, creates tabs, installs the timer. */
function install() {
  var missing = ['NOTION_TOKEN', 'GITHUB_TOKEN'].filter(function (k) { return !PROPS.getProperty(k); });
  ensureTabs_();
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'tick') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('tick').timeBased().everyMinutes(15).create();
  if (missing.length) {
    Logger.log('Installed the timer and tabs, but Script Properties are missing: ' + missing.join(', ') +
      '. Add them (Project Settings → Script Properties); the next tick picks them up.');
    return;
  }
  tick();
  Logger.log('✓ Conductor installed: tabs ready, 15-minute timer running, first tick done.');
}

/** The 15-minute heartbeat. Each part is isolated so one failure never stops the others. */
function tick() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return; // previous tick still running
  try {
    var log = [];
    safe_(log, 'mirror', mirrorNotion_);
    safe_(log, 'dispatch', dispatchIfNew_);
    safe_(log, 'runs', checkRunsDaily_);
    PROPS.setProperty('LAST_TICK', new Date().toISOString() + ' ' + log.join(' · '));
  } finally {
    lock.releaseLock();
  }
}

/** Manual button: force a GitHub sync+publish now. */
function syncNow() {
  Logger.log(dispatch_('sync-news.yml') ? '✓ dispatched sync-news.yml' : '✗ dispatch failed (see log)');
}

/* ───────────────────────── 1. mirror ───────────────────────── */

function mirrorNotion_() {
  var token = PROPS.getProperty('NOTION_TOKEN');
  if (!token) return 'no NOTION_TOKEN';
  var rows = notionQueryAll_(token, REGISTRY.NOTION.production);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var outbox = readTab_(ss, 'Repair Outbox');
  var max = REGISTRY.REPAIR.maxAttempts;

  var status = [], queue = [];
  rows.forEach(function (p) {
    var pr = p.properties;
    var key = plain_(pr['Sheet Key']);
    if (!key) return; // Claude-era rows: not part of the Sheet harness
    var draftStatus = (pr['Draft Status'] && pr['Draft Status'].select && pr['Draft Status'].select.name) || '';
    var codes = ((pr['Failure Codes'] && pr['Failure Codes'].multi_select) || []).map(function (o) { return o.name; });
    var attempts = (pr['Repair Attempts'] && pr['Repair Attempts'].number) || 0;
    var title = plain_(pr.Name);
    var track = (pr.Track && pr.Track.select && pr.Track.select.name) || '';
    var reason = plain_(pr['Blocked Reason']);
    var url = (pr['Post URL'] && pr['Post URL'].url) || '';
    status.push([key, title, track, draftStatus, codes.join(', '), reason, attempts, url, p.last_edited_time]);

    // Same rule as routeFailure() in site/harness/registry.mjs.
    var unrepairable = !codes.length || codes.some(function (c) { return !REGISTRY.FAILURES[c] || REGISTRY.FAILURES[c].noRepair; });
    if (draftStatus === 'Needs Revision' && attempts < max && !unrepairable) {
      var mine = outbox.filter(function (r) { return r.Key === key; })
        .sort(function (a, b) { return Number(b.Attempt) - Number(a.Attempt); });
      var latest = mine[0];
      var playbook = codes.map(function (c) {
        var f = REGISTRY.FAILURES[c];
        return f ? c + ' (' + f.summary + '): ' + f.playbook : c;
      }).join('\n\n');
      var notes = latest ? 'Attempt ' + latest.Attempt + ' changed: ' + latest.Changed + ' | not fixed: ' + latest['Not Fixed'] : '';
      var draft = latest ? latest.Draft : sourceDraft_(ss, key);
      queue.push([key, title, track, attempts + 1, codes.join(', '), reason, playbook, notes, (draft || '').slice(0, 49000)]);
    }
  });

  status.sort(function (a, b) { return String(b[8]).localeCompare(String(a[8])); });
  writeTab_(ss, 'Status', status);
  writeTab_(ss, 'Repair Queue', queue);
  return status.length + ' status, ' + queue.length + ' queued';
}

/** The original draft for a key, found by recomputing keys over the source tabs. */
function sourceDraft_(ss, key) {
  var prefix = key.split('-')[0];
  var tabName = Object.keys(REGISTRY.SHEET.tabs).filter(function (t) { return REGISTRY.SHEET.tabs[t].keyPrefix === prefix; })[0];
  if (!tabName) return '';
  var rows = readTab_(ss, tabName);
  for (var i = 0; i < rows.length; i++) {
    if (rows[i].Date && rows[i].Title && sheetKey_(tabName, rows[i].Date, rows[i].Title) === key) return rows[i].Draft;
  }
  return '';
}

/* ───────────────────────── 2. dispatch ───────────────────────── */

function dispatchIfNew_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var watched = Object.keys(REGISTRY.SHEET.tabs).filter(function (t) {
    var tab = REGISTRY.SHEET.tabs[t];
    return tab.owner === 'agent' && t !== 'Runs';
  });
  var fp = watched.map(function (t) {
    var sh = ss.getSheetByName(t);
    return t + ':' + (sh ? sh.getLastRow() : 0);
  }).join('|');
  var last = PROPS.getProperty('LAST_FINGERPRINT');
  if (fp === last) return 'no new rows';
  if (!PROPS.getProperty('GITHUB_TOKEN')) return 'new rows, but no GITHUB_TOKEN';
  if (last !== null && dispatch_('sync-news.yml')) {
    PROPS.setProperty('LAST_FINGERPRINT', fp);
    return 'new rows → dispatched';
  }
  if (last === null) { PROPS.setProperty('LAST_FINGERPRINT', fp); return 'baseline recorded'; }
  return 'dispatch failed';
}

function dispatch_(workflow) {
  var res = UrlFetchApp.fetch('https://api.github.com/repos/' + REGISTRY.REPO + '/actions/workflows/' + workflow + '/dispatches', {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + PROPS.getProperty('GITHUB_TOKEN'), Accept: 'application/vnd.github+json' },
    payload: JSON.stringify({ ref: 'main' }),
    muteHttpExceptions: true,
  });
  if (res.getResponseCode() !== 204) Logger.log('dispatch ' + workflow + ' → HTTP ' + res.getResponseCode() + ' ' + res.getContentText());
  return res.getResponseCode() === 204;
}

/* ───────────────────────── 3. daily run check ───────────────────────── */

function checkRunsDaily_() {
  var now = new Date();
  var today = Utilities.formatDate(now, 'Asia/Kolkata', 'yyyy-MM-dd');
  var hhmm = Utilities.formatDate(now, 'Asia/Kolkata', 'HH:mm');
  if (hhmm < '16:00' || PROPS.getProperty('RUNS_CHECKED') === today) return 'not due';
  var runs = readTab_(SpreadsheetApp.getActiveSpreadsheet(), 'Runs').filter(function (r) { return r.Date === today; });
  if (!runs.length && PROPS.getProperty('RUNS_EVER') !== 'yes') {
    PROPS.setProperty('RUNS_CHECKED', today);
    return 'Runs tab not in use yet';
  }
  PROPS.setProperty('RUNS_EVER', 'yes');
  var missing = REGISTRY.TASKS.filter(function (t) {
    return t.expectBy && !runs.some(function (r) { return String(r.Task).toLowerCase() === t.name; });
  });
  var failed = runs.filter(function (r) { return /fail/i.test(r.Result); });
  PROPS.setProperty('RUNS_CHECKED', today);
  if (!missing.length && !failed.length) return 'all tasks ran';
  notify_('Gemini tasks need a look',
    (missing.length ? 'Did not run today: ' + missing.map(function (t) { return t.label; }).join(', ') + '. ' : '') +
    (failed.length ? 'Reported failure: ' + failed.map(function (r) { return r.Task + ' (' + r.Note + ')'; }).join('; ') : ''));
  return missing.length + ' missing, ' + failed.length + ' failed';
}

/* ───────────────────────── helpers ───────────────────────── */

function ensureTabs_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(REGISTRY.SHEET.tabs).forEach(function (name) {
    var cols = REGISTRY.SHEET.tabs[name].columns;
    var sh = ss.getSheetByName(name);
    if (!sh) {
      sh = ss.insertSheet(name);
      sh.getRange(1, 1, 1, cols.length).setValues([cols]).setFontWeight('bold');
      sh.setFrozenRows(1);
    } else if (sh.getLastRow() === 0) {
      sh.getRange(1, 1, 1, cols.length).setValues([cols]).setFontWeight('bold');
    } else {
      // Add any registry column missing from an existing header (e.g. Drafts'
      // "Radar Title"), at the end of row 1. Never renames or moves a column.
      var lastCol = Math.max(sh.getLastColumn(), 1);
      var have = sh.getRange(1, 1, 1, lastCol).getDisplayValues()[0].map(function (h) { return String(h).trim(); });
      var add = cols.filter(function (c) { return have.indexOf(c) === -1; });
      if (add.length) sh.getRange(1, lastCol + 1, 1, add.length).setValues([add]).setFontWeight('bold');
    }
    if (REGISTRY.SHEET.tabs[name].owner === 'code') sh.setTabColor('#888888');
  });
}

/** Rows as objects keyed by the header row. Display values, so dates read exactly as typed. */
function readTab_(ss, name) {
  var sh = ss.getSheetByName(name);
  if (!sh || sh.getLastRow() < 2) return [];
  var vals = sh.getRange(1, 1, sh.getLastRow(), sh.getLastColumn()).getDisplayValues();
  var head = vals[0].map(function (h) { return String(h).trim(); });
  return vals.slice(1).map(function (r) {
    var o = {};
    head.forEach(function (h, i) { o[h] = String(r[i] || '').trim(); });
    return o;
  });
}

/** Rewrites a code-owned tab below its header. Refuses agent-owned tabs. */
function writeTab_(ss, name, rows) {
  if (REGISTRY.SHEET.tabs[name].owner !== 'code') throw new Error('refusing to write agent tab ' + name);
  var cols = REGISTRY.SHEET.tabs[name].columns;
  var sh = ss.getSheetByName(name) || ss.insertSheet(name);
  sh.clearContents();
  sh.getRange(1, 1, 1, cols.length).setValues([cols]).setFontWeight('bold');
  if (rows.length) sh.getRange(2, 1, rows.length, cols.length).setValues(rows);
}

/** Must match sheetKey() in site/harness/rules.mjs exactly. */
function sheetKey_(tab, date, title) {
  var prefix = REGISTRY.SHEET.tabs[tab].keyPrefix;
  var d = String(date).trim();
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, tab + '|' + d + '|' + String(title).trim(), Utilities.Charset.UTF_8);
  var hex = bytes.map(function (b) { var v = (b < 0 ? b + 256 : b).toString(16); return v.length === 1 ? '0' + v : v; }).join('');
  return prefix + '-' + d.replace(/-/g, '') + '-' + hex.slice(0, REGISTRY.KEY_RULE.hashLength);
}

function notionQueryAll_(token, ds) {
  var out = [], cursor = null;
  do {
    var body = { page_size: 100 };
    if (cursor) body.start_cursor = cursor;
    var res = UrlFetchApp.fetch('https://api.notion.com/v1/data_sources/' + ds + '/query', {
      method: 'post',
      contentType: 'application/json',
      headers: { Authorization: 'Bearer ' + token, 'Notion-Version': REGISTRY.NOTION.version },
      payload: JSON.stringify(body),
      muteHttpExceptions: true,
    });
    if (res.getResponseCode() >= 400) throw new Error('Notion ' + res.getResponseCode() + ': ' + res.getContentText().slice(0, 300));
    var json = JSON.parse(res.getContentText());
    out = out.concat(json.results);
    cursor = json.has_more ? json.next_cursor : null;
  } while (cursor);
  return out;
}

function plain_(prop) {
  if (!prop) return '';
  var rt = prop.title || prop.rich_text || [];
  return rt.map(function (t) { return t.plain_text; }).join('').trim();
}

function notify_(title, message) {
  var topic = PROPS.getProperty('NOTIFY_TOPIC');
  if (!topic) { Logger.log('notify (no topic): ' + title + ' — ' + message); return; }
  UrlFetchApp.fetch('https://ntfy.sh/' + topic, {
    method: 'post', payload: message, headers: { Title: title, Tags: 'warning' }, muteHttpExceptions: true,
  });
}

function safe_(log, name, fn) {
  try { log.push(name + ': ' + fn()); }
  catch (e) { log.push(name + ' ERROR ' + e.message); Logger.log(name + ' failed: ' + e.stack); }
}
