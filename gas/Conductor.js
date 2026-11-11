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
 *        Repair Sections — in "sections" mode, only the sections that failed
 *                        (the Repairer returns patches; code keeps the rest)
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
    safe_(log, 'tabs', function () { ensureTabs_(); return 'ok'; });
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

  var status = [], queue = [], sections = [];
  var patches = null; // Repair Patches tab, read only when something is queued
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

    // Same rule as routeFailure() in site/harness/registry.mjs. Warning codes
    // alone never queue a repair; they ride along on a row queued for a block code.
    var unrepairable = !codes.length || codes.some(function (c) { return !REGISTRY.FAILURES[c] || REGISTRY.FAILURES[c].noRepair; });
    var blocking = codes.some(function (c) { return (REGISTRY.FAILURES[c] || {}).class === 'block'; });
    if (draftStatus === 'Needs Revision' && attempts < max && !unrepairable && blocking) {
      var mine = outbox.filter(function (r) { return r.Key === key; })
        .sort(function (a, b) { return Number(b.Attempt) - Number(a.Attempt); });
      var latest = mine[0];
      var playbook = codes.map(function (c) {
        var f = REGISTRY.FAILURES[c];
        return f ? c + ' (' + f.summary + '): ' + f.playbook : c;
      }).join('\n\n');
      var notes = latest ? 'Attempt ' + latest.Attempt + ' changed: ' + latest.Changed + ' | not fixed: ' + latest['Not Fixed'] : '';
      // The draft the row holds now: the original plus every accepted attempt
      // (same rule as draftAt() in site/scripts/lib/repair.mjs).
      var rejected = rejectedFor_(plain_(pr['Rejected Attempts']), reason);
      if (latest && rejected.indexOf(Number(latest.Attempt)) !== -1) notes = 'REFUSED by the publishing system, see Blocked Reason. ' + notes;
      if (patches === null) patches = readTab_(ss, 'Repair Patches');
      var draft = draftAt_(sourceDraft_(ss, key), outbox, patches, key, attempts, rejected) || '';

      // Send only the flagged sections when every code is tied to sections
      // and they are all in the draft; otherwise the whole draft, as before.
      var plan = sectionPlan_(codes, parseFindings_(pr.Findings), draft);
      if (plan) {
        plan.forEach(function (s) { sections.push([key, attempts + 1, s.id, s.heading, s.findings, s.text.slice(0, 49000)]); });
        queue.push([key, title, track, attempts + 1, 'sections', codes.join(', '), reason, playbook, notes,
          '(sections mode: the ' + plan.length + ' section(s) to fix are in the Repair Sections tab)']);
      } else {
        queue.push([key, title, track, attempts + 1, 'full', codes.join(', '), reason, playbook, notes, draft.slice(0, 49000)]);
      }
    }
  });

  status.sort(function (a, b) { return String(b[8]).localeCompare(String(a[8])); });
  writeTab_(ss, 'Status', status);
  writeTab_(ss, 'Repair Queue', queue);
  writeTab_(ss, 'Repair Sections', sections);
  return status.length + ' status, ' + queue.length + ' queued, ' + sections.length + ' section(s)';
}

/* ───────────── section patches (SECTIONS in site/harness/registry.mjs) ───────────── */

/** Must match sectionId() in site/harness/rules.mjs. */
function sectionId_(index, heading) {
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, heading, Utilities.Charset.UTF_8);
  var hex = bytes.map(function (b) { var v = (b < 0 ? b + 256 : b).toString(16); return v.length === 1 ? '0' + v : v; }).join('');
  return 'S' + index + '-' + hex.slice(0, REGISTRY.SECTIONS.hashLength);
}

/** Must match splitDraft() in site/harness/rules.mjs (the regression test runs both). */
function splitDraft_(md) {
  var out = [{ heading: REGISTRY.SECTIONS.opening, lines: [] }];
  var fence = false;
  String(md || '').replace(/\r\n/g, '\n').split('\n').forEach(function (line) {
    if (/^\s*```/.test(line)) fence = !fence;
    var h = !fence && line.match(/^##\s+(.+?)\s*$/);
    if (h) out.push({ heading: h[1], lines: [line] });
    else out[out.length - 1].lines.push(line);
  });
  return out.map(function (s, i) {
    return { id: sectionId_(i, s.heading), heading: s.heading, text: s.lines.join('\n').trim() };
  });
}

function joinDraft_(sections) {
  return sections.map(function (s) { return s.text.trim(); }).filter(function (t) { return t; }).join('\n\n') + '\n';
}

/** Must match applyPatches() in site/scripts/lib/repair.mjs. */
function applyPatches_(draft, patches) {
  var sections = splitDraft_(draft);
  patches.forEach(function (p) {
    var id = String(p['Section ID']).trim();
    var s = sections.filter(function (x) { return x.id === id; })[0];
    if (!s) return;
    var text = String(p.Text || '').replace(/\r\n/g, '\n').trim();
    if (s.heading !== REGISTRY.SECTIONS.opening && !/^##\s+/.test(text)) text = '## ' + s.heading + '\n\n' + text;
    s.text = text;
  });
  return joinDraft_(sections);
}

/** "PATCHES: 2" → 2; a full draft → null. */
function patchCount_(cell) {
  var t = String(cell || '').trim();
  if (t.indexOf(REGISTRY.SECTIONS.patchMarker) !== 0) return null;
  return Number(t.slice(REGISTRY.SECTIONS.patchMarker.length).trim()) || 0;
}

/** Must match draftAt() in site/scripts/lib/repair.mjs. */
function draftAt_(source, outbox, patches, key, upTo, rejected) {
  var draft = source || null;
  outbox
    .filter(function (o) { return o.Key === key && Number(o.Attempt) <= upTo && rejected.indexOf(Number(o.Attempt)) === -1 && o.Draft; })
    .sort(function (a, b) { return Number(a.Attempt) - Number(b.Attempt); })
    .forEach(function (o) {
      if (patchCount_(o.Draft) === null) draft = o.Draft;
      else if (draft !== null) draft = applyPatches_(draft, patches.filter(function (p) { return p.Key === key && Number(p.Attempt) === Number(o.Attempt); }));
    });
  return draft;
}

/** The Findings property (JSON [{c, s, e}]), or null when absent or unreadable. */
function parseFindings_(prop) {
  var raw = plain_(prop);
  if (!raw) return null;
  try { var v = JSON.parse(raw); return Array.isArray(v) ? v : null; } catch (e) { return null; }
}

/**
 * The sections a repair may change, or null for a whole-draft repair. Null when
 * any code is not tied to a section (scope 'article' or unknown), when there
 * are no located findings, or when a named section is not in the draft.
 */
function sectionPlan_(codes, findings, draft) {
  if (!findings || !draft) return null;
  var ok = codes.every(function (c) { var f = REGISTRY.FAILURES[c]; return f && (f.scope === 'section' || f.scope === 'none'); });
  if (!ok) return null;
  var located = findings.filter(function (f) { var d = REGISTRY.FAILURES[f.c]; return d && d.scope === 'section' && f.s && f.s !== '(title)'; });
  var titleOnly = findings.some(function (f) { return f.s === '(title)'; });
  if (!located.length && !titleOnly) return null;
  var sections = splitDraft_(draft);
  var names = {};
  located.forEach(function (f) { names[f.s] = true; });
  var missing = Object.keys(names).filter(function (n) { return !sections.some(function (s) { return s.heading === n; }); });
  if (missing.length) return null;
  return sections
    .filter(function (s) { return names[s.heading]; })
    .map(function (s) {
      var mine = located.filter(function (f) { return f.s === s.heading; })
        .map(function (f) { return f.c + (f.e ? ': ' + f.e : ''); });
      return { id: s.id, heading: s.heading, text: s.text, findings: mine.join('\n') };
    });
}

/** Every refused attempt: the Rejected Attempts property plus any in Blocked Reason. Mirrors rejectedFor() in site/scripts/lib/repair.mjs. */
function rejectedFor_(prop, reason) {
  var seen = {};
  String(prop || '').split(',').map(function (n) { return Number(n.trim()); })
    .concat(rejectedAttempts_(reason))
    .forEach(function (n) { if (n > 0) seen[n] = true; });
  return Object.keys(seen).map(Number).sort(function (a, b) { return a - b; });
}

/** Attempt numbers in a "Repair rejected (attempts 2, 3): …" Blocked Reason. Mirrors rejectedAttempts() in site/scripts/lib/repair.mjs. */
function rejectedAttempts_(reason) {
  var prefix = REGISTRY.REPAIR.rejectedPrefix;
  if (!reason || reason.indexOf(prefix) !== 0) return [];
  return reason.slice(prefix.length).split(')')[0].split(',')
    .map(function (n) { return Number(n.trim()); })
    .filter(function (n) { return n > 0; });
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

/**
 * One-time fix (2026-11-11): the news always lived in the first tab, named
 * "Sheet1", and the first install created an empty "News" tab beside it. Rename
 * the real one to "News" and drop the empty copy. Safe: only runs when the
 * first tab really holds news, and only deletes a "News" tab with no data rows.
 * Renaming keeps gid=0, which is what sync-news.mjs reads.
 */
function migrateNewsTab_(ss) {
  var first = ss.getSheets()[0];
  if (first.getName() === 'News') return 'ok';
  var head = first.getRange(1, 1, 1, 3).getDisplayValues()[0].join('|');
  if (head !== 'Date|Category|Headline') return 'first tab is not news; left alone';
  var empty = ss.getSheetByName('News');
  if (empty) {
    if (empty.getLastRow() > 1) return 'both tabs have news; left alone';
    ss.deleteSheet(empty);
  }
  first.setName('News');
  return 'renamed ' + 'first tab to News';
}

function ensureTabs_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  migrateNewsTab_(ss);
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
