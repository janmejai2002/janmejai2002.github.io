/**
 * Submits changed URLs to IndexNow (consumed by Bing, Yandex, Seznam, Naver —
 * and Bing's index is what ChatGPT and Copilot retrieval read from).
 *
 *   node scripts/indexnow.mjs https://janmejai2002.github.io/blog/foo/ [...]
 *
 * Chosen because it fits the standing rule that unattended automation may only
 * use credentials that cannot expire: the "key" is a static text file served
 * from the site root, no login, no token. The key is public by design — proof
 * of ownership is that the file exists on the host, not that the key is secret.
 *
 * Two rules from the protocol docs, honoured here: submit only URLs that
 * actually changed (the caller decides that; deploy.yml diffs the push), and
 * treat 429 as "back off", not "retry harder". Non-2xx never fails the caller —
 * a search-engine ping must not be able to fail a deploy.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HOST = 'janmejai2002.github.io';
const pub = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');

// The key file is the one 32-hex-named .txt in public/. Reading it from disk
// keeps this script and the served file incapable of disagreeing.
const keyFile = readdirSync(pub).find((f) => /^[0-9a-f]{32}\.txt$/.test(f));
if (!keyFile) {
  console.error('indexnow: no key file in site/public/ — nothing submitted');
  process.exit(0);
}
const key = readFileSync(join(pub, keyFile), 'utf8').trim();

const urls = process.argv
  .slice(2)
  .filter((u) => u.startsWith(`https://${HOST}/`));

if (!urls.length) {
  console.log('indexnow: no URLs to submit');
  process.exit(0);
}

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({
    host: HOST,
    key,
    keyLocation: `https://${HOST}/${keyFile}`,
    urlList: urls,
  }),
});

if (res.ok) {
  console.log(`indexnow: submitted ${urls.length} URL(s), HTTP ${res.status}`);
  for (const u of urls) console.log(`  · ${u}`);
} else if (res.status === 429) {
  console.error('indexnow: 429 — rate limited; the next deploy will resubmit. Not failing the run.');
} else {
  console.error(`indexnow: HTTP ${res.status} — ${await res.text()}. Not failing the run.`);
}
process.exit(0);
