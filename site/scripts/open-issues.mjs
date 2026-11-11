/**
 * Opens one GitHub issue per article the self-healing loop gave up on.
 *
 *   GITHUB_TOKEN=... GITHUB_REPOSITORY=owner/repo node scripts/open-issues.mjs
 *
 * Reads site/needs-human.json (written by publish-article.mjs and
 * quarantine-build.mjs). Skips any article that already has an open issue
 * (matched by its Notion id in the issue body), so re-runs never duplicate.
 * The issue body is written so it can be handed straight to Claude or agy.
 */
import { readFileSync, existsSync } from 'node:fs';
import { FAILURES, REPAIR, SHEET } from '../harness/registry.mjs';
import { NEEDS_HUMAN_FILE } from '../harness/needs-human.mjs';

if (!existsSync(NEEDS_HUMAN_FILE)) {
  console.log('Nothing needs a human.');
  process.exit(0);
}
const token = process.env.GITHUB_TOKEN;
const repo = process.env.GITHUB_REPOSITORY;
if (!token || !repo) {
  console.error('GITHUB_TOKEN and GITHUB_REPOSITORY are required.');
  process.exit(1);
}
const gh = async (path, opts = {}) => {
  const res = await fetch(`https://api.github.com${path}`, {
    ...opts,
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (!res.ok) throw new Error(`GitHub ${res.status} on ${path}: ${await res.text()}`);
  return res.status === 204 ? null : res.json();
};

const open = await gh(`/repos/${repo}/issues?state=open&labels=${REPAIR.issueLabel}&per_page=100`);
const runUrl = process.env.GITHUB_SERVER_URL ? `${process.env.GITHUB_SERVER_URL}/${repo}/actions/runs/${process.env.GITHUB_RUN_ID}` : '';

for (const e of JSON.parse(readFileSync(NEEDS_HUMAN_FILE, 'utf8'))) {
  if (open.some((i) => i.body?.includes(e.id))) {
    console.log(`· issue already open for "${e.title}"`);
    continue;
  }
  const codes = e.codes ?? [];
  const body = [
    `The self-healing loop tried **${e.attempts}** automatic repairs on this article and it still fails the publish gates. It will not retry again until a person fixes it.`,
    '',
    '| | |',
    '|---|---|',
    `| Title | ${e.title} |`,
    `| Track | ${e.track ?? '-'} |`,
    `| Sheet Key | \`${e.key || '(none)'}\` |`,
    `| Notion page | https://www.notion.so/${e.id.replace(/-/g, '')} |`,
    `| Notion id | \`${e.id}\` |`,
    runUrl ? `| Failing run | ${runUrl} |` : null,
    '',
    '## What is failing',
    '',
    e.reason,
    '',
    '## Failure codes and the standard fix',
    '',
    ...codes.map((c) => `- **${c}** (${FAILURES[c]?.summary ?? 'unknown'}): ${FAILURES[c]?.playbook ?? ''}`),
    '',
    '## How to fix',
    '',
    `1. Open the Notion page above and edit the text directly (or ask Claude: *"Fix the article in issue #<this issue>"*).`,
    `2. Check it: \`node site/scripts/publish-article.mjs --check ${e.id}\``,
    '3. Set **Draft Status** back to **Draft Ready**. The next publish run ships it and the issue can be closed.',
    '',
    `Previous repair notes are in the Sheet's **Repair Outbox** tab (key \`${e.key || '-'}\`): https://docs.google.com/spreadsheets/d/${SHEET.id}/edit`,
    '',
    'If the failure is a gate being wrong rather than the article, fix the rule in `site/harness/registry.mjs` / `rules.mjs` instead, never by relaxing a cap.',
  ]
    .filter((l) => l !== null)
    .join('\n');
  const issue = await gh(`/repos/${repo}/issues`, {
    method: 'POST',
    body: { title: `Needs you: ${e.title}`, body, labels: [REPAIR.issueLabel, 'content'] },
  });
  console.log(`✓ opened ${issue.html_url}`);
}
