# Harness repair plan — after the first live repair (2026-11-11)

Status: **Phases 1, 2 and 3 implemented (2026-11-11).** Written by Claude after agy's Task A/B run and the
first end-to-end repair of `DR-20261111-9f8879` ("Flaky Agent Evals…"). Start a new chat with:

> Read AGENTS.md, then docs/HARNESS-REPAIR-PLAN.md. Do Phase 1. Show me the diff and the test
> output before committing. Do not push.

Fixtures for testing: `site/harness/fixtures/DR-20261111-9f8879.original.md` (what the Writer
filed) and `.repaired.md` (what the Repairer filed). Both are exact copies of the Sheet cells.

---

## 1. What actually happened (the autopsy)

The loop worked end to end: the article was blocked, queued, repaired, re-gated and published.
But the repair cost far more than it needed to, and the reasons are mostly in **our** code, not in
Gemini.

| Finding | Evidence | Whose fault |
|---|---|---|
| The repair rewrote ~75% of the article. Only 11 of 42 paragraphs survived verbatim; 1,770 words were new or edited; a whole section ("Where Deterministic Trajectory Gates Break Down") was deleted. | Paragraph diff of the two fixtures | Mostly the playbook (next rows) |
| **G-LATEX should never have reached the Repairer.** `normalizeProse` already auto-converts LaTeX, but its inline regex (`publish-article.mjs:236`) has no `.` `%` or `≥≤≈×·∞∈` in its character class, so `$p_{step} = 0.95$`, `$0.95^{12} = 54.0\%$` slip through. Those are exactly the "2 fragments" in Blocked Reason. | Regex test against the original draft | Normaliser bug |
| **G-LENGTH and G-STYLE were (very likely) phantom codes.** Today's gate reports neither on the original draft, raw or after a simulated Sheet→Notion→markdown round trip. The check that set them ran at 01:35 UTC, before the rules were first committed (01:51 UTC). Unconfirmed but the fixes below are the same either way. | `checkArticle` on the fixture | Stale codes, never re-checked |
| **Warning codes travel without their messages.** `publish-article.mjs:503` puts only *blocking* messages into Blocked Reason, but puts block **and** warn codes into Failure Codes. The Repairer got "G-LENGTH, G-STYLE" with no word count and no offending words → ~15 turns comparing against 16 other drafts. | Code + Gemini transcript | Gate output |
| **The G-LENGTH playbook is stricter than the gate.** Playbook: "cut to 1,400–1,800". Gate: warns only above `CAPS.wordsMax = 2200`. The Repairer obeyed the playbook and cut ~1,000 words. | `registry.mjs` | Registry |
| **No counting rule is stated.** Repairer computed 2,511, then 1,797, then 1,557 words, unsure what counts. The gate counts prose with fenced code and inline code stripped and HTML tags removed, after the Artwork sections are lifted out. | `rules.mjs` | Skill |
| **The Repairer chased rules the gate doesn't have** (double hyphens, "not X, but Y"). It loaded `antiaiwriting`, `humanize-ai-text`, `tech-article-engine` from its own library mid-run. | Gemini transcript | Prompt (no skill fence) |
| Repair path replaces the whole Notion page with the whole new draft. Nothing checks the repair before it is applied. | `sync-drafts.mjs:130` | Design |
| Homepage: the published article sits at #8 of 8 because same-day ties sort reverse-alphabetically by slug. | `index.astro:14` | Site |

**Strip away the bugs and the only genuine repair was one ASCII-diagram code block.** That is the
headline: the harness should have sent Gemini a ~600-character job, and it sent a 25,000-character
one with four codes, two of them wrong.

### Claims from agy NOT to build on
- "Gemini's Sheets tool truncates at ~500 characters" — inferred from a transcript line about
  *lines* over 500 chars. Unmeasured. Measure it with the probe in §6 before Phase 3.
- "The repair was surgical" — the diff says otherwise (see above).
- Sheets permission prompt: the owner clicked "Allow" once; it is not expected to ask again.
  Not a work item.

---

## 2. The harness in parts, and what each part should do better

```
Writer ─► Sheet tab ─► sync-drafts ─► Notion ─► NORMALISER ─► GATE ─► build ─► live
                                                    │            │
                                                    ▼            ▼ Needs Revision
                                              (auto-fix)    CONDUCTOR packs Repair Queue
                                                                 │
                                       REPAIRER (Gemini) ◄───────┘
                                                 │ Repair Outbox
                                                 ▼
                                   APPLY (sync-drafts) ─► Notion ─► gate again
```

| Part | Principle | Change |
|---|---|---|
| **Normaliser** (`normalizeProse`) | Anything deterministic is fixed by code, never sent to an LLM. | Widen inline-LaTeX class; also auto-replace em dashes with a comma (choosing comma vs colon needs judgement, so comma is the safe default) and convert `$$…$$` blocks fully. Promote these to `class: 'fix'` where safe. |
| **Gate** (`rules.mjs`) | Every finding carries *where* and *what*, not just a count. | Return `instances: [{ section, line, excerpt }]` per code, measured against the **Sheet draft text the Repairer edits** (section heading + quoted excerpt is robust; raw line numbers alone drift through the Notion round trip). Include warn findings in what's persisted. |
| **Findings store** | Codes are never older than the rules. | Stamp findings with a `RULES_VERSION` (hash of registry FAILURES + CAPS + STYLE). When packing the queue, if the version differs, re-run the gate on the current draft first. Cheapest place: `sync-drafts.mjs` (Node, has the rules) writes a fresh `Findings` JSON to Notion for every Needs Revision row each sync. |
| **Routing** (`routeFailure`) | Warnings never trigger a repair by themselves, and never order deletions. | A row is queued only for **block** codes. Warn codes ride along as "fix if cheap, never cut content for them". G-LENGTH never queues alone. |
| **Conductor** (Repair Queue packing) | Send the smallest job that contains the problem. | See §3 — send only flagged sections. |
| **Repairer** (skills + prompt) | Fixed skill set, explicit counting rules, no detective work. | Prompt fence: "use only waibi-repair, waibi-house-style, waibi-artwork, waibi-sheet-contract; do not load other writing skills; do not read other drafts". Findings column is authoritative: "if a listed instance is not found, say so in Not Fixed and move on". |
| **Apply** (`sync-drafts`) | Never apply a repair that makes things worse. | Before touching Notion: run `checkArticle` on the merged draft. Reject (write reason to Status, count the attempt) if it adds any new code or if unflagged sections changed. This is the most valuable single change after Phase 1. |
| **Site** | Freshly published work surfaces first. | Tie-break same-day posts by publish timestamp (write a full ISO `pubDate` time, or a `publishedAt` field) instead of slug. |

---

## 3. Your "one cell per line" idea — the version that works

The instinct is right: the Repairer should **edit only what failed**, and code should guarantee
the rest is byte-identical. One cell per *line* is the wrong grain though:

- Tables, fenced code blocks, lists and the one-line Artwork SVG span many lines; splitting them
  makes the Repairer reassemble structure across cells (exactly where it breaks things).
- A 2,000-word article is ~200 rows per attempt; ordering and re-joining become a new failure mode.
- The Repairer would have to write many rows, which is slower and costlier than one cell.

**Use one row per H2 section instead** ("section patches"):

1. **Conductor / sync** splits the draft at `## ` headings into sections `S0` (callouts + TL;DR),
   `S1…Sn`, `Sources`, `Artwork`. Each has a stable ID: `S<index>-<6-char hash of the heading>`.
2. New code-owned tab **Repair Sections**: `Key | Attempt | Section ID | Heading | Findings (this section only, with excerpts) | Text`. Only **flagged** sections are written. Each cell is ~1–4k characters, which also sidesteps whatever the Sheets tool's real read limit is.
3. **Repair Outbox** gains a `Patches` mode: the Repairer appends one row per section it changed:
   `Date | Key | Attempt | Section ID | Replacement text` (or `(delete)` — only allowed when the
   Findings say so). The old whole-draft column stays for backwards compatibility during rollout.
4. **Apply** (`sync-drafts`) rebuilds the draft = original sections with patched ones swapped in by
   ID, runs the gate (§2 Apply), and only then replaces the Notion page.
5. Unflagged sections are copied by code, so "change nothing else" becomes a **guarantee instead
   of an instruction**.

For this incident the job would have been: one row, section "Architecture of a Deterministic
Trajectory Gate", one finding ("code block starting `[Git PR / Agent Prompt]`"). Everything else
untouched.

Cost of the idea: real but contained — ~1 new tab in the registry, split/merge helpers shared by
Node and Apps Script, skill + prompt update. Do it in Phase 3, after Phases 1–2 remove most of
the bogus repairs (they may make it far less urgent).

---

## 4. Phases

**Rules for every phase:** every rule/skill change goes `site/harness/registry.mjs` →
`node site/harness/generate.mjs` → commit (generated files: `gas/Registry.js`,
`gemini/skills/*`; the build fails on drift — never hand-edit them). Then, as needed:
`clasp push` for the Conductor (second login, `-u waibi`), re-zip/re-upload the skills to Gemini
(owner does this), and **pushing to main deploys the site**. Nothing ships without the owner's
go-ahead. Never set Approved.

### Phase 1 — stop sending bogus work (small, do first)
1. `publish-article.mjs:236` — widen the inline-LaTeX character class to include `.` `,` `%`
   `≥≤≈×·∞∈`. Leave currency (`$38.40`) alone (existing digits-only guard; add a test for
   "$38.40 to $45").
2. `publish-article.mjs:503` — Blocked Reason carries **all** findings, block first, then warn,
   each `CODE: message`. Keep under 2,000 chars (truncate per-message excerpts, not codes).
3. `registry.mjs` — G-LENGTH playbook: "Only if the gate's count is over 2,200 words (prose only:
   code blocks, inline code, Sources links' markup and the Artwork sections not counted). Cut the
   least-supported paragraphs until under 2,200. Never delete a limitations/trade-offs section."
   Use `CAPS.wordsMax` in the text, not a hard-coded number.
4. `routeFailure` + Conductor's copy: queue only when at least one **block** code is present.
5. Regression test (`node --test`): normalise + `checkArticle` on
   `fixtures/DR-20261111-9f8879.original.md` → expect **only** G-ASCII. Repaired fixture → expect
   none. Confirm `check-build.mjs:149` doesn't trip on Unicode inside backticks (it matches `$`
   and backslash commands only, so it shouldn't).
6. Homepage tie-break (`index.astro:14`) by publish time.

### Phase 2 — fresh, located findings + verify-before-apply
1. `rules.mjs`: per-instance `{ section, excerpt }` for every code.
2. `RULES_VERSION` stamp; `sync-drafts` re-gates Needs Revision rows whose stamp is stale and
   rewrites Failure Codes + Blocked Reason.
3. `sync-drafts` repair path: gate the merged draft before applying; reject regressions.
4. Repairer prompt (`gemini/TASK-PROMPTS.md` §6) + `waibi-repair` skill: skill fence, "don't read
   other drafts", "Findings are authoritative", counting rule.

### Phase 3 — section patches (§3)
Registry tab + split/merge helpers (Node + GAS, generated from one spec) + Conductor packing +
skill/prompt + apply path. Run one manual repair on a test row before enabling the schedule.

### Later / optional
- Port the pure-regex part of `checkArticle` into generated Apps Script so the Conductor can
  pre-check an Outbox row within 15 minutes, without a GitHub run.
- Measure the Gemini Sheets tool's real read limit with a known-length test cell.

---

### Also add (from the follow-up review)
- **Repair stall alert.** `TASKS` gives the Repairer `expectBy: null`, so nothing alerts if a
  Repair Queue row sits unrepaired across a 09:00/19:00 slot. Conductor: push an alert when a
  queue row has no matching Outbox row by 11:00 / 21:00. Repairer's Runs note must list the
  keys it handled.
- **Churn metric.** The apply step records, per repair: codes in, codes out, % of unflagged text
  changed (must be 0 with section patches), words removed. Write it to Status (or a code-owned
  `Repair Log` tab). This makes "surgical" measurable instead of claimed.
- **Prevent at the source.** Every code the Repairer fixes is a code the Writer produced. Feed the
  same gate checklist (generated from the registry) into the Writer's skill as a pre-file
  self-check, starting with the top recurring codes in the Repair Log.

---

## 5. Owner questions (answer at the start of the next chat)
1. OK to stop queueing repairs for warning-only rows (they'd publish with the warning logged)?
2. Keep the deleted "Where Deterministic Trajectory Gates Break Down" section out, or restore it
   to the live article from the original fixture?

---

## 6. Probe: the Gemini Sheets tool's real read limit
1. In the Sheet, add a tab named `Probe` (not in the registry, so the Conductor ignores it).
2. Paste the contents of `probe-A2-single-line.txt` into A2 and `probe-B2-paragraphs.txt` into B2.
   Each is 30,000 characters; a marker like `[04200]` ends exactly at character 4,200. B2 has a
   line break every 400 characters (like real paragraphs).
3. In Gemini web, new chat, ask:
   > Using only the Google Sheets tool (no downloads, no exports), read cells A2 and B2 of the
   > "Probe" tab in my wAIbi-sabi News Feed sheet. For each cell, tell me the LAST `[nnnnn]`
   > marker you can see and whether the text looked cut off. Do not write anything.
4. The last marker = the limit. If both show `[30000]`, there is no practical limit at draft size
   and the xlsx workaround was a different problem. Delete the `Probe` tab after.
