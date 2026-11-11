/**
 * The hand-off from the self-healing loop to a person.
 *
 * Gates call recordNeedsHuman() when an article fails after REPAIR.maxAttempts
 * automatic repairs. Entries collect in site/needs-human.json (gitignored) and
 * the publish workflow's last step turns each into a GitHub issue
 * (scripts/open-issues.mjs).
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const NEEDS_HUMAN_FILE = join(dirname(fileURLToPath(import.meta.url)), '..', 'needs-human.json');

export function recordNeedsHuman(entry) {
  const list = existsSync(NEEDS_HUMAN_FILE) ? JSON.parse(readFileSync(NEEDS_HUMAN_FILE, 'utf8')) : [];
  if (!list.some((e) => e.id === entry.id)) list.push({ ...entry, at: new Date().toISOString() });
  writeFileSync(NEEDS_HUMAN_FILE, JSON.stringify(list, null, 2) + '\n');
}
