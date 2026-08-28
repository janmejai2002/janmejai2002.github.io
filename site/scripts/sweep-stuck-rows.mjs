/**
 * The backstop check: an unattended article that should be live and is not.
 *
 *   node scripts/sweep-stuck-rows.mjs            # flag stuck rows in Notion
 *   node scripts/sweep-stuck-rows.mjs --dry-run  # report only
 *
 * Everything else in the pipeline reports a *specific* failure — a rejected
 * draft, a failed build, a URL that will not serve. This catches the case where
 * none of those fired and the article still is not live: a poll that silently
 * stopped, a dispatch token that expired, a manifest step that never ran. It
 * knows nothing about *why*; it only knows the row has been ready too long.
 *
 * Scope is deliberately just the unattended tracks (Talks, Case Studies,
 * Basics). Those publish within an hour or two of reaching `Draft Ready` or
 * `Approved`, with no human in the path — so "ready for half a day and not
 * live" is unambiguous. A `Technical` or `Business` row sitting at `Approved`
 * is waiting on a human to merge its PR, which can legitimately take days; those
 * are left alone.
 *
 * Flags each stuck row's `Blocked Reason` once. A row that already carries a
 * reason is skipped, so this does not re-stamp the same rows every day.
 */
import { queryAll, plain, flagBlocked, PRODUCTION_DS } from './lib/notion.mjs';
import { notify } from './notify.mjs';

const dryRun = process.argv.includes('--dry-run');

// Must match AUTO_TRACKS in publish-article.mjs.
const AUTO_TRACKS = ['Talks', 'Case Studies', 'Basics'];
// How long an unattended row may sit ready before it counts as stuck. Generous
// on purpose: GitHub throttles scheduled workflows on quiet repos and gaps of
// several hours are normal, so this is set well beyond that.
const STALE_HOURS = 12;

const rows = await queryAll(PRODUCTION_DS, {
  and: [
    {
      or: [
        { property: 'Draft Status', select: { equals: 'Draft Ready' } },
        { property: 'Draft Status', select: { equals: 'Approved' } },
      ],
    },
    { or: AUTO_TRACKS.map((t) => ({ property: 'Track', select: { equals: t } })) },
  ],
});

const now = Date.now();
const stuck = [];

for (const page of rows) {
  const p = page.properties;
  const title = plain(p.Name?.title).trim() || '(untitled)';
  const status = p['Draft Status']?.select?.name ?? '?';
  const track = p['Track']?.select?.name ?? '?';

  // Age from the last edit — the write that filed it, or the owner's Approve.
  const ageH = (now - new Date(page.last_edited_time).getTime()) / 3.6e6;
  if (ageH < STALE_HOURS) continue;

  const alreadyFlagged = plain(p['Blocked Reason']?.rich_text).trim().length > 0;
  stuck.push({ id: page.id, title, status, track, ageH: Math.round(ageH), alreadyFlagged });
}

if (!stuck.length) {
  console.log(`No unattended row has been ready longer than ${STALE_HOURS}h. Pipeline looks healthy.`);
  process.exit(0);
}

let flagged = 0;
for (const s of stuck) {
  const line = `${s.title} — ${s.track}, ${s.status}, ${s.ageH}h old`;
  if (s.alreadyFlagged) {
    console.log(`· already flagged: ${line}`);
    continue;
  }
  if (dryRun) {
    console.log(`+ would flag: ${line}`);
    flagged++;
    continue;
  }
  const ok = await flagBlocked(
    s.id,
    `This ${s.track} draft has been "${s.status}" for about ${s.ageH} hours and is still not live. ` +
      `Unattended tracks normally publish within an hour or two, so the publish pipeline itself may be stuck — ` +
      `check that the "Publish from Notion" workflow is still running (Actions tab) and that its schedule has not been disabled.`
  );
  if (ok) {
    flagged++;
    console.log(`+ flagged: ${line}`);
  }
}

console.log(`\n${stuck.length} stuck row(s), ${flagged} newly flagged.`);

if (flagged > 0 && !dryRun) {
  const names = stuck.filter((s) => !s.alreadyFlagged).map((s) => s.title).slice(0, 3).join(', ');
  await notify(
    'An article is stuck in the pipeline',
    `${flagged} unattended draft(s) have been ready >${STALE_HOURS}h and are still not live: ${names}. ` +
      `The publish workflow itself may have stopped — check the Actions tab.`,
    { url: 'https://github.com/janmejai2002/janmejai2002.github.io/actions' }
  );
}
// A real red run here would be useful — but this job also runs `continue-on-error`
// in CI so it can never itself break anything, and the signal that matters is
// already on the Notion rows.
process.exit(0);
