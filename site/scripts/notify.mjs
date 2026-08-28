/**
 * One push to the owner's phone with the reason already in it — so a failure
 * does not mean opening the GitHub app, finding the run, and scrolling a log.
 *
 *   node scripts/notify.mjs "<title>" "<body>" [--url <deep link>] [--tag warning] [--priority high]
 *
 * Transport is ntfy (https://ntfy.sh) — a topic is just a URL, there is no
 * login and nothing to expire, which is the only kind of credential this
 * project lets unattended automation use. Set the topic once:
 *
 *   - CI:    repo secret NOTIFY_TOPIC  (wired in the workflows)
 *   - local: NOTIFY_TOPIC= line in C:/Users/Janmejai/Notion/.env
 *
 * Self-hosted or a different server: set NOTIFY_BASE (default https://ntfy.sh).
 *
 * If no topic is configured this prints the message and exits 0 — a missing
 * notification channel must never fail the thing it was reporting on. Same
 * reason it never throws.
 */
import { readFileSync } from 'node:fs';

const LOCAL_ENV = 'C:/Users/Janmejai/Notion/.env';

function fromEnv(name) {
  if (process.env[name]) return process.env[name].trim();
  try {
    const line = readFileSync(LOCAL_ENV, 'utf8')
      .split(/\r?\n/)
      .find((l) => l.startsWith(`${name}=`));
    if (line) return line.slice(name.length + 1).trim().replace(/^["']|["']$/g, '');
  } catch {
    /* not on the authoring machine */
  }
  return null;
}

const argv = process.argv.slice(2);
const flag = (name, def = null) => {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : def;
};
const positional = argv.filter((a, i) => !a.startsWith('--') && !(i > 0 && argv[i - 1].startsWith('--')));

const title = positional[0] ?? 'wAIbi-sabi pipeline';
const body = positional[1] ?? '(no message)';
const url = flag('--url');
const tag = flag('--tag', 'warning');
const priority = flag('--priority', 'high');

export async function notify(t, b, { url, tag = 'warning', priority = 'high' } = {}) {
  const topic = fromEnv('NOTIFY_TOPIC');
  const base = fromEnv('NOTIFY_BASE') || 'https://ntfy.sh';
  if (!topic) {
    console.log(`::notice::notify skipped (no NOTIFY_TOPIC) — would have sent: ${t} — ${b}`);
    return false;
  }
  const headers = { Title: t, Tags: tag, Priority: priority };
  if (url) headers.Click = url;
  try {
    const res = await fetch(`${base.replace(/\/$/, '')}/${topic}`, {
      method: 'POST',
      headers,
      body: b,
    });
    if (!res.ok) {
      console.log(`::warning::notify POST returned ${res.status}`);
      return false;
    }
    return true;
  } catch (err) {
    console.log(`::warning::notify failed: ${err.message}`);
    return false;
  }
}

// Run directly → send now.
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('notify.mjs')) {
  const ok = await notify(title, body, { url, tag, priority });
  console.log(ok ? 'sent' : 'not sent');
}
