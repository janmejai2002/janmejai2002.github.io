# wAIbi-sabi Harness Plan — self-healing, sheet-centred

Written 2026-11-11 after a read of the repo, the live Sheet, the GitHub run history, Notion (via `doctor.mjs`) and Google's current Gemini docs. Supersedes the agy spec at `~/.gemini/antigravity-cli/brain/cbedb83e…/self-healing-pipeline-specification.md`, whose useful parts are folded in below.

## Build status (2026-11-11)

| Piece | State | Where |
|---|---|---|
| Rule registry (single source of truth) | **built** | `site/harness/registry.mjs` → `generate.mjs` |
| Per-article preflight with failure codes (all violations, not first) | **built** | `site/harness/rules.mjs`, `publish-article.mjs` |
| Build-check codes + per-article quarantine (one bad article no longer blocks the batch) | **built, tested locally** | `check-build.mjs`, `quarantine-build.mjs`, `publish-from-notion.yml` |
| Notion `Sheet Key`, `Repair Attempts`, `Failure Codes` | **built, 17 rows backfilled** | `harness/notion-schema.mjs`, `backfill-keys.mjs` |
| Sheet→Notion sync with keys, Status filter, real tables, repair mode | **built, round-trip tested on all 17 drafts** | `sync-drafts.mjs`, `import-draft.mjs`, `harness/md-to-notion.mjs` |
| Repair limit → GitHub issue (`needs-human`) | **built** (limit = 4) | `open-issues.mjs`, workflow step |
| Conductor (Apps Script) | **written, waiting on owner setup** | `gas/Conductor.js`, `docs/OWNER-SETUP.md` |
| Gemini skills (4) + rewritten task prompts + Repairer | **written, waiting on upload/paste** | `gemini/` |
| Dead code removed (`gas/ArticleEngine.js`, `gas-trigger.js`, `gemini-tasks.mjs`) | **done** | |
| Interest Rating | **retired** (radar self-scores) | doctor, AGENTS.md |

Where this document and the code disagree, the code (and the registry) wins. In particular the repair limit is **4** and the queue is split into a code-owned `Repair Queue` and an agent-owned `Repair Outbox`.

The original design follows, kept for the reasoning.

---

## 0. Do this week (time-boxed)

| # | What | Why now |
|---|---|---|
| 0a | Check whether `@tech-article-engine` and `@humanize-ai-text` are **Gems** or **Skills** (Gemini → Settings → Gems / Skills). | Gems go read-only on **17 Nov 2026** and are removed 17 Dec. The Article Writer depends on both. |
| 0b | Unblock today's batch: set **"Flaky Agent Evals…"** to `Needs Revision` in Notion. | **Happened 2026-11-11 00:56 UTC** (publish run failed). That draft's LaTeX tripped build rule 11, the whole build failed, and the two clean drafts (Byte Pair Encoding, Self Hosted Open Weight) were held with it. All three stay `Draft Ready` and fail again on every poll. Moving the one bad row out of `Draft Ready` lets the other two ship on the next run. No code change needed. Permanent fix: §6 P0 #1. |
| 0c | Tell me whether an Apps Script project is attached to the Sheet (Sheet → Extensions → Apps Script → Triggers). | `clasp list` shows no wAIbi project, so `gas/ArticleEngine.js` looks undeployed. The design below needs to know. |

---

## 1. What the system actually is today

Five Gemini scheduled **tasks** (Gemini web → Scheduled; they run in Google's cloud) write rows into one public-view Google Sheet. GitHub Actions read the Sheet with no login, copy rows into Notion, turn Notion rows into site pages, build, and deploy. Notion is the status board.

```
 Gemini tasks (Google cloud)            GitHub Actions (cloud)                     Site
 ───────────────────────────            ──────────────────────                     ────
 01:00 Case Studies ─┐
 03:00 Radar ────────┤
 03:45 Writer x3 ────┼──> Google Sheet ──> sync-news.yml ──> Notion ──> publish-from-notion.yml ──> build ──> GitHub Pages
 06:00 News ─────────┤    (tabs: Radar,    (sync-radar,      (Radar,     (publish-article.mjs,      (check-   close-loop.mjs
 13:00 Talks ────────┘    Drafts, Case     sync-drafts,      Production, gates, AUTO_TRACKS)        build)    marks Published
                          Studies, Talks,  sync-news)        News)
                          News)
```

Retired / dormant (confirmed 2026-11-11):
- Claude scheduled routines (`~/.claude/scheduled-tasks/*`) — prompts still on disk, not running.
- Local watchdog `routines/manager.ps1` — last tick 2026-10-09, not in Task Scheduler.
- `gas/ArticleEngine.js`, `site/scripts/gas-trigger.js`, `site/scripts/gemini-tasks.mjs` — API-key based duplicates of what the Gemini tasks now do. Not deployed as far as I can see. Should be deleted or clearly marked dead so nobody re-enables a second radar.
- Notion `Interest Rating` — the Gemini writer writes every radar row regardless of rating, so ratings currently steer nothing (27 unrated ideas sitting in Notion).

## 2. Measured failure modes (not guessed)

Audit of all 17 Gemini drafts in the Sheet (raw output, before anyone hand-fixed them):

| Failure | Drafts hit | Caught by | Root cause |
|---|---|---|---|
| ASCII box / arrow diagram | 8 / 17 | check-build rule 10 (fails whole build) | Case Studies prompt *asks* for one ("ASCII execution graph"); others drift into it |
| LaTeX (`$k$`, `$$…$$`) | 7 / 17 | check-build rule 11 + partial auto-convert | No prompt forbids it |
| Markdown tables broken by the pipeline | 4 real failures (run 42918796008) | check-build rule 9 | **Code bug**: `import-draft.mjs` turns each table row into its own Notion paragraph. Gemini's tables are fine. |
| No Sources section / zero links | 5 / 17 (all Case Studies + Talks) | **nothing** | Case Studies and Talks prompts never ask for Sources |
| Over word budget (2,300–2,900 vs 1,400–1,800) | 3 / 17 (all from 11 Nov) | nothing | Writer drift, possibly the model switch |
| Banned words / negative parallelism | 6 / 17 | nothing | Soft rule, Gemini partially ignores |
| SVG truncated (2,000-char Notion limit) | 1 real failure (run 42763646288) | make-images crash | Code bug, fixed in `4474cc8` |
| Unsupported Notion block (table) | 1 real failure (Aug) | toMarkdown throw | Code bug, fixed |
| Draft title > 70 / meta > 160 | **0 / 17** | publish gates | Gemini obeys these caps in drafts |
| Radar title > 70 | ≥1 (first Radar row is 77) | nothing: `sync-radar` silently cuts to 70 | Writer re-titles anyway, so harmless today |
| Reader Question > 120 | not measurable | publish gate | Writer's header never includes the question; it is fuzzy-matched from Radar by the first 20 characters of the title |

Live confirmation: publish run on 2026-11-11 00:56 UTC failed on G-LATEX in one draft and held back two clean ones (see §0b).

Conclusions:
1. Gemini keeps draft titles and meta descriptions within the caps. agy's catalogue leads with FM-02/03/04, which are not where the real failures are.
2. Half of the real breakage is **our code**, not the model (tables, SVG chunking, block types).
3. The biggest unattended risk is not formatting at all: **unsourced claims**. The old Claude writer had a claim ledger ("if you cannot paste the sentence, cut the claim"); the Gemini prompts dropped it, and no gate checks for sources.

## 3. Design principles

1. **Notion stays the one source of truth for article status.** The Sheet is the agents' workspace: a *mirror* of status they can read, plus *outbox* tabs they append to. No second queue (this is where agy's DLQ goes wrong).
2. **Agents only append rows.** 17 unattended appends have worked; editing existing rows is unproven and Google's docs say edits may ask for confirmation. Status columns are maintained by code, never by Gemini.
3. **Every row gets a stable key** that no AI writes — e.g. `D-20261111-TEC`. Titles change during repair; keys don't.
4. **Fail one article, not the batch.** A broken draft is quarantined with an exact reason; the rest ship.
5. **Prevent → auto-fix (meaning-preserving only) → AI repair (max 2 tries) → human.** In that order, and most effort on the first.
6. **No new Google credential outside Google.** No service-account key (agy's proposal); anything that writes to the Sheet runs as Apps Script inside your Google account.
7. **"Approved" stays human-only.** The repairer only ever resets a row to `Draft Ready`.

## 4. Target architecture

```
                    ┌──────────────── Google (your account) ───────────────┐
 Gemini tasks ──append──> SHEET ──────────────────────────────┐            │
  (writers,             Radar · Drafts · Case Studies · Talks │            │
   radar, news,         News · Repair Outbox (agent-owned)    │            │
   REPAIRER)            Status · Repair Queue (code-owned)     │            │
                        Runs (log)                             │            │
                            ▲                                  ▼            │
                            │        CONDUCTOR (Apps Script, every 15 min)  │
                            └────── writes Status + Repairs-open mirror     │
                                     from Notion; detects new rows;        │
                                     sends one dispatch to GitHub ─────────┼──┐
                    └──────────────────────────────────────────────────────┘  │
                                                                              ▼
            GitHub Actions: sync (Sheet→Notion, incl. repairs) → publish → per-article
            quarantine → build → deploy → close-loop (Notion = Published)
```

### The Conductor (new, small Apps Script bound to the Sheet)
- Every 15 min: if any tab has rows newer than last run → `workflow_dispatch` `sync-news.yml`. This replaces GitHub's starved cron (≈96 scheduled runs/day configured, 2–4 actually run).
- Every 15 min: read Article Production from Notion (read-only integration) and rewrite two **code-owned** tabs: `Status` (key, title, track, Notion status, live URL, blocked reason, attempts) and `Repair Queue` (only rows at `Needs Revision`, with codes and reason). These are rewritten whole each tick; no agent ever writes to them.
- Once a day: check the `Runs` tab and push one alert if a Gemini task didn't log a run (catches quota exhaustion — today invisible).
- Credentials, all inside Script Properties: a **fine-grained GitHub token, this repo only, `Actions: Read and write` only** (enough to trigger workflows, cannot push code), and a **read-only Notion integration** shared only with Article Production.
- Quota: consumer Apps Script allows **90 min/day of trigger runtime** and 6 min per run. 96 ticks a day at ~20 s each is about 32 min. Keep each tick under 30 s, or drop to every 30 min.

### Join key on the Notion side
Article Production gets two new properties: **`Sheet Key`** (text, e.g. `D-20261111-TEC`) and **`Repair Attempts`** (number). `sync-drafts` writes the key on ingest; archive-and-recreate carries both over. Every hop (Sheet row, Notion row, Status, Repair Queue, Repair Outbox) joins on `Sheet Key`, never on title.

### The Repairer (new Gemini task)
- Twice a day (e.g. 09:00, 19:00 IST). Reads `Repair Queue`, finds the original draft by `Sheet Key`, applies only the fixes named by the failure codes using the `waibi-repair` skill, and **appends** to `Repair Outbox` (agent-owned, append-only): key, attempt n, full fixed draft, "what I changed", "what I could not fix".
- `sync-drafts.mjs` (repair mode) picks up outbox rows by key + attempt, replaces that Notion page's body (archive-and-recreate, carrying `Sheet Key` and `Repair Attempts`), sets `Draft Status = Draft Ready`.
- Cell size: Sheets caps a cell at 50,000 characters. Drafts run 10–25k today, so this is fine, but the repairer must never paste two versions into one cell.
- Fails again → attempt 2 with the previous attempt's notes. Fails a third time → `NEEDS_HUMAN`, one push notification, nothing else retries it.

### Failure codes (set where the gate fires, so they match real gates)

| Code | Gate | Class |
|---|---|---|
| G-TITLE / G-META / G-QUESTION | caps in publish-article | block → AI repair |
| G-TLDR | missing Executive TL;DR | block → AI repair |
| G-BLOCK | unconvertible Notion block | block → code fix first |
| G-ASCII | ASCII diagram (rule 10) | block → AI repair (rewrite as list/table) |
| G-LATEX | LaTeX left after auto-convert (rule 11) | auto-fix, then block → AI repair |
| G-TABLE | broken markdown table (rule 9) | auto-fix (code) |
| G-HTML | escaped raw HTML / blank lines in SVG (rule 1) | auto-fix (code) |
| G-ART | artwork unusable | warn → fallback art (already) |
| G-SOURCES (new) | fewer than 3 outbound links (Talks: video URL counts) | **warn for one week** while the prompt fix lands, then block → AI repair. Blocking today would stop every Talks piece (both have zero links). |
| G-LENGTH (new) | > 2,400 words | warn |
| G-STYLE (new) | banned words / em dash | warn (logged, never blocks) |
| G-BUILD | anything unattributable | whole run red + human |

## 5. Skills: the knowledge layer

Gemini skills (launched 30 Sep 2026) are folders with a `SKILL.md` plus reference files (.md, .csv, .json…, ≤100 MB). Gemini auto-loads a skill when relevant, and a scheduled task can name one explicitly (type `/` or `@` in the task prompt). 100 can be active. This is where your "pre-knowledge" idea belongs. Not in Sheet tabs: skills are loaded into the agent's context automatically, versioned, and cost no Sheet reads.

Keep the source of every skill in this repo under `gemini/skills/<name>/` and upload from there, so rules are versioned and diffable.

| Skill | Used by | Contents |
|---|---|---|
| `waibi-house-style` | all writers, repairer | editorial spine per track, caps, structure contract, anti-AI rules, banned list |
| `waibi-claim-ledger` | all writers, repairer | ported from the old Claude writer (Steps 3, 4.5): primary-source ladder, verbatim-sentence rule, Sources section |
| `waibi-artwork` | all writers, repairer | SVG contract, tokens per track, 3 good examples, what the gates reject |
| `waibi-sheet-contract` | every task | tab names, exact columns, key format, "append only, never edit" |
| `waibi-repair` | repairer | one playbook per failure code: what it means, the exact fix, what not to touch |
| `waibi-diagrams` | writers, repairer | how to show a flow without ASCII art (numbered steps, tables) |

Task prompts then shrink to: role, which skills, what to read, what to append. Consistency comes from the skills, not from five copies of the same rules drifting apart (they already have: three different banned-word lists today).

## 6. Code changes, in order

**P0 — correctness (before any repair agent)**
1. **Per-article quarantine.** On build failure, map check-build's `blog/<slug>/` lines to manifest ids, flag only those rows `Needs Revision` with code + message, remove their files, rebuild the rest once. Today one bad draft blocks the batch, the rows stay `Draft Ready` (flag-pipeline-failure never sets Needs Revision), and the same failure repeats every poll.
2. Run check-build's article rules inside `--check` too, so preflight stops passing drafts the build rejects.
3. `import-draft.mjs`: build real Notion table blocks (the code already exists in `sync-radar.mjs`).
4. Remove the one-off `B_max` formula substitution in `normalizeProse` (publish-article.mjs ~line 223); it rewrites any future formula starting with B_max into one old article's text.
5. Failure codes, plus `Sheet Key` and `Repair Attempts` properties on Article Production.

**P1 — the loop**
6. Row keys: sync-drafts derives `D-<date>-<track>`; Writer copies Radar key into its row (exact Reader Question link instead of today's 20-char fuzzy title match).
7. `sync-drafts` honours `Status` column and gains repair mode.
8. Conductor Apps Script + `Status`, `Repairs`, `Runs` tabs.
9. G-SOURCES gate.
10. Repairer task + `waibi-repair` skill.

**P2 — hygiene**
11. Per-job least-privilege `permissions:` (the one agy item worth taking).
12. Delete or mark dead: `gas/`, `gas-trigger.js`, `gemini-tasks.mjs`, old Notion-MCP routine docs; fix stale docs that say Technical/Business are reviewed.
13. Public post `how-this-blog-builds-itself`: rewrite + add its missing `notionId`.

## 7. Schedule (IST; quota resets 03:30)

| Time | Task | Model | Change |
|---|---|---|---|
| 01:00 | Case Studies | Flash | unchanged (uses yesterday's leftover quota) |
| **03:35** | Radar | Flash | was 03:00 — move after reset so a spent quota can't starve it |
| **04:15 / 04:45 / 05:15** | Writer: Technical / Business / Basics | Argon | split one 3-article run into three (smaller, isolated failures; 50 schedules allowed) |
| 06:00 | News | Flash | unchanged |
| **09:00, 19:00** | Repairer | Argon if quota allows, else Flash | new |
| 13:00 | Talks | Flash | unchanged |
| every 15 min | Conductor (Apps Script) | — | new; replaces GitHub cron as the real trigger |

Writers claim Radar rows by key/status ("not yet drafted"), not "today's rows", because Gemini run times are approximate.

## 8. Account safety checklist

- [x] No credentials in repo or git history (scanned 2026-11-11).
- [x] Sheet sharing = Viewer.
- [ ] Remember the Sheet is world-readable: never put anything private in it.
- [ ] GitHub token in Apps Script: fine-grained, single repo, `Actions: RW` only, 90-day expiry.
- [ ] Notion: second integration, read-only capability, shared with Article Production only (Conductor). Existing pipeline token unchanged.
- [ ] Gemini API key (if any still exists for the dead `gas/` code): delete it.
- [ ] Apps Script: bound to the Sheet, `@OnlyCurrentDoc`, never deployed as a web app (no public endpoint).
- [ ] **Gemini → Settings → Connected apps: turn off everything the tasks don't use, Gmail especially.** The tasks read untrusted web pages while connected to apps that can write. A malicious page that says "forward the user's email" is a bigger risk than any token here. The tasks need Sheets/Drive, Gemini Notebook and YouTube (Talks), nothing else.

## 9. Open questions for the owner

1. Gems or Skills for the two `@` references? (§0a)
2. Today's batch: live test or a minimal patch first? (§0b)
3. Apps Script attached to the Sheet? (§0c)
4. Should `Interest Rating` mean anything again (e.g. writer skips radar rows rated 1–2), or retire it from the doc?
5. "Update how this blog works": the internal `docs/HOW-IT-WORKS.md`, the public post, or both?
