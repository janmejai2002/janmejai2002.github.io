# Routine prompt review — the seven scheduled tasks

Fresh-eyes review of all seven `~/.claude/scheduled-tasks/<id>/SKILL.md` prompts
against the pipeline code (`site/scripts/publish-article.mjs`,
`site/src/content.config.ts`, `site/src/data/tracks.ts`,
`site/scripts/lib/fallback-art.mjs`) and its docs (`HANDOFF.md`,
`PUBLISHING.md`, `ARTWORK.md`). Today (2026-08-26) the pipeline changed:
missing TL;DR now blocks publish; a leading body H1 is stripped; artwork is
auto-generated. Quotes below are verbatim from the named file.

---

## 1. daily-ai-seo-radar — accurate, no code drift

- `Track: Technical` (Step 5) and "The Track values are exactly `Technical`,
  `Business`, `Basics`" (line 20) both check out against the **radar
  pipeline** select — correct, since this routine never touches Article
  Production.
- `Reader Question` cap "Max 120 characters" (line 63) matches
  `MAX_QUESTION = 120` in `publish-article.mjs`.
- Guardrails (lines 75-78) omit the explicit "never set Draft Status =
  Approved" line that both weekly siblings carry — low risk (this routine
  never writes to Article Production) but an unexplained gap in an otherwise
  identical trio.
- No mention of the new theme hub pages (see Gaps).
- Tightest of the three radar prompts; no compress candidates of note.

## 2. business-radar — one concrete factual error, otherwise accurate

- **Wrong cross-reference — flag first.** Step 1 (line 42): "There is a
  sibling scheduled task, `mind-the-pour-seo-aeo-check`, that already watches
  answer-engine behaviour. If it has produced findings, read them before
  researching the discovery side from scratch." I read that task's SKILL.md
  in full: it is a weekly SEO check for **"Mind the Pour"**, an unrelated
  student project about Indian alcohol-pricing economics
  (`mindthepour.space`), with its own tracking file under
  `Documents/Projects/Term4/...`. It has nothing to do with wAIbi-sabi or
  answer-engine research. This line should be deleted, not corrected — no
  actual sibling task does this work today.
- Track-values line (94) and `Reader Question` cap (87) both match the code.
- Has the "Never set Draft Status = Approved anywhere" guardrail (105).
- No mention of theme hub pages.
- Compress: the editorial-spine boilerplate duplicates the other two radars
  near-verbatim with small wording drifts already visible between copies —
  see Cross-cutting §A.

## 3. basics-radar — accurate, no drift

- Track-values (101) and question-cap (94) match the code and its siblings.
- Has the Approved guardrail (112).
- Source-discipline line 74 ("the two articles published on 2026-08-25")
  correctly anchors to the real fact-check incident in `HANDOFF.md` §2 —
  load-bearing, do not touch.
- No mention of theme hub pages. Same spine-duplication note as above.

## 4. ai-article-writer — strongest prompt, most stale on today's changes

**Drift from the code:**

1. **Understates the TL;DR consequence — highest-priority fix in this
   review.** Step 4 (line 76): "Get the heading text exactly right or the
   wrap silently will not happen." As of today `publish-article.mjs` (344-351)
   doesn't silently skip the wrap — it **blocks the publish**, sets
   `Draft Status` to `Needs Revision`, and writes a `Blocked Reason` back to
   the row. `artwork-routine` (line 37) already states this correctly: "The
   pipeline refuses to publish a draft without this section, so filling it
   here is what keeps an approved article from bouncing back as Needs
   Revision." This routine should say the equivalent.
2. **Stale reference to a retired MCP server.** Step 3 (line 56): "If
   `notebooklm-mcp` is connected, check whether a relevant notebook already
   exists..." Per this machine's own global config, the `notebooklm-mcp`
   server was removed from `.claude.json`; NotebookLM now runs through the
   `nlm` CLI. This condition can never fire anymore. Contrast `talks-writer`,
   which correctly explains why it avoids NotebookLM entirely.
3. **Doesn't say the Artwork brief now feeds an automated routine.** Step 5
   (117-124) frames the brief's consumer only as "whoever draws it." As of
   today that consumer is `artwork-routine`, running unattended every 4
   hours, treating the brief as authoritative ("usually right; follow it
   unless it violates the spec" — artwork-routine line 20). A vague brief now
   has a real, uncorrected downstream cost.
4. **No mention of theme hub pages** — the routine knows `Track` "drives
   which section of the site the piece lands in" (47) but not that this now
   means a permanent per-track landing page (`[track].astro`).

**Contradictions:** none load-bearing; see Cross-cutting §A for the
fixed-vs-chosen accent asymmetry with talks/case-studies writers.

**Over-prescription — compress candidate:** the six-way accent mapping in
Step 5 (line 121) duplicates `docs/ARTWORK.md` §2's own accent table
byte-for-byte, in the same paragraph that calls that file "binding." Two
independently-editable copies of the same mapping is exactly the drift risk
this review was asked to flag. **Safe to cut**: replace with "Pick the accent
using `docs/ARTWORK.md`'s mapping." Keep the Track/Reader/lands/wastes-time
table (16-20) as-is — it's doing real per-track editorial work, not
restating structure.

**Must never be touched:** the claim-ledger rule (63-67, "If you cannot paste
the sentence, you do not have the source. Cut the claim."); the full Step 4.5
verification pass (97-109); "do not invent work" (36); the hard-rules block
(85-96) — "Do not strengthen a source's claim," "Never add a specific to a
list the source does not contain," "Report the number that hurts your
argument too." These are specific, failure-anchored rules, not style advice.

## 5. talks-writer — solid, silent on today's changes

**Drift from the code:**

- Same TL;DR understatement (Step 3, line 55: "wraps this in the styled
  plate... do not hand-write HTML" — no mention of the publish block). Since
  this routine sets `Draft Status: Draft Ready` directly with no promotion
  step, and `artwork-routine`'s TL;DR backfill only fires on pages that don't
  already have an `Artwork SVG` section, a re-run draft with artwork but a
  broken TL;DR has no backstop.
- No mention that the Artwork brief feeds an unattended drawing routine —
  more consequential here since the accent is pre-decided (next point),
  leaving geometry and the imperfection as the brief's only real content.
- No mention of theme hub pages, though this routine's "what it means for the
  reader" closer is the most natural place to link `/talks/`.

**Contradiction:** accent is fixed per-track here ("`hanko` for this theme,"
Step 4 item 4, line 88) vs. `ai-article-writer`'s per-article choice from six
colors. `hanko` does match `tracks.ts`'s `accent: 'hanko'` for `talks`, so
it's not currently wrong — but the brief's "Accent" line is pure ceremony for
this routine (the answer never varies), and an editor unaware of that could
"fix" it into a real per-article choice, clashing with the fixed track icon
color used site-wide.

**Compress candidate:** the "Why this does not use NotebookLM" narrative
(12-16) could drop the auth-expiry detail down to the rule plus one clause of
why — but keep the rule itself ("Do not reintroduce NotebookLM into this
routine") verbatim; it's a real regression guardrail, not just color.

**Must never be touched:** the quoting limit (61: "at most a handful of
short direct quotations, none longer than about 25 words... If the piece
cannot stand without extended quotation, it is not an article and should not
be written") — legal/ethical, not style; "Never quote a figure from an
automatic transcript without confirming it elsewhere" (46); the Step 4.5
reference (65).

## 6. case-studies-writer — most carefully reasoned; same today's-changes gaps

**Drift from the code:** same TL;DR understatement (line 60); no mention the
brief feeds an automated routine; no mention of theme hub pages (`/case-studies/`
is exactly the kind of "precedent" page this routine's readers would want
linked).

**Contradiction:** same fixed-accent pattern as talks-writer ("`moss` for
this theme," line 92, matching `tracks.ts`). Same recommendation: either drop
the "why" framing for accent or state plainly it's fixed.

Not a contradiction but worth the owner's attention: the A–D evidence-grading
rubric (26-32) is unique to this routine, while `business-radar` (line 56)
flags the identical evidentiary problem ("A vendor's own study about the
vendor's own category is not evidence") with no formal grade to apply. Should
the grading scale travel to Business pieces too?

**Compress:** none — the "why two a week, not ten a day" rationale (10-14)
encodes a real policy with a number attached ("Do not increase the rate")
and should stay in full; nothing else in this 104-line prompt reads as
padding.

**Must never be touched:** the evidence-grading rubric in full (26-32; "being
the publication that grades honestly is the entire competitive position of
this theme"); "Never state an outcome as fact when the only source is the
company claiming it" (104); "One article per run. Do not batch." (102).

## 7. artwork-routine — accurate, current, tightest match to code

Written today alongside the pipeline change, and it shows:

- SVG format (Step 5, 43-49) matches `liftArtworkSvg()` exactly: H2 reading
  exactly `Artwork SVG`, a line starting `Alt:`, a fenced block starting
  `<svg`.
- Palette-placeholder rule (27) matches the hex-rejection and `{{paper}}`
  checks exactly.
- Correctly documents the TL;DR-blocks-publish consequence (37) — the one
  prompt in the set with this right.
- Correctly documents the leading-H1 strip (39).
- The body-edit allow-list ("the only body edits permitted are inserting the
  missing TL;DR, deleting a duplicate leading H1, and appending the Artwork
  SVG section," line 58) is a model for the rest of the set: exhaustive,
  checkable, appropriate for an unattended routine with write access to a
  human's draft.

**No drift, no compress candidates.** 60 lines, all load-bearing.

---

## Cross-cutting

### A. Contradictions between prompts

1. `business-radar` cites a nonexistent sibling (`mind-the-pour-seo-aeo-check`
   — an unrelated project). Delete.
2. Fixed accent (`talks-writer`, `case-studies-writer`) vs. chosen accent
   (`ai-article-writer` and the tracks it serves) — consistent with
   `tracks.ts` today, but an unstated asymmetry a future edit could break.
3. `daily-ai-seo-radar` lacks the "never set Draft Status = Approved"
   guardrail its two weekly siblings both carry.

### B. Gaps

1. **Theme hub pages exist and no prompt mentions them.**
   `site/src/pages/[track].astro` renders a permanent page per track
   (`/technical/`, `/business/`, `/basics/`, `/case-studies/`, `/talks/`),
   each with its own ask/blurb/question-led post list. Most relevant to
   `talks-writer` and `case-studies-writer`'s closing sections.
2. **No writer prompt knows its Artwork brief feeds an unattended drawing
   routine** — all three describe where the brief goes, none describe who
   reads it or that it's now load-bearing for what art actually ships.
3. **No writer prompt knows a missing/malformed TL;DR now blocks publish.**
   All three describe the wrap as cosmetic. Single highest-value, lowest-risk
   fix in this review — one sentence in each of three files.
4. **`ai-article-writer`'s NotebookLM check is dead code in prompt form** —
   update to reference `nlm`, or remove per `talks-writer`'s stance.

### C. Hardcoded-theme-name checklist

`site/src/data/tracks.ts` (lines 1-8) already names itself canonical and
lists remaining hardcode sites in its own header comment: "the Zod enum in
`content.config.ts`, `TRACKS` in `scripts/publish-article.mjs`, and the Track
value each routine prompt writes (see `docs/HANDOFF.md` §0 before renaming
anything)." Every hardcode across the seven prompts:

| File | Line(s) | What's hardcoded |
|---|---|---|
| daily-ai-seo-radar | 18 | `Track = Technical` (prose) |
| daily-ai-seo-radar | 20 | "exactly `Technical`, `Business`, `Basics`" |
| daily-ai-seo-radar | 62 | `Track`: `Technical` (property value written) |
| business-radar | 86 | `Track`: `Business` (property value written) |
| business-radar | 94 | "exactly `Technical`, `Business`, `Basics`" |
| basics-radar | 93 | `Track`: `Basics` (property value written) |
| basics-radar | 101 | "exactly `Technical`, `Business`, `Basics`" |
| ai-article-writer | 16-20 | Table keyed on `Technical`/`Business`/`Basics` |
| talks-writer | 73 | `Track`: `Talks` (property value written) |
| talks-writer | 88 | accent `hanko` tied to the `talks` id |
| case-studies-writer | 77 | `Track`: `Case Studies` (property value written) |
| case-studies-writer | 92 | accent `moss` tied to the `case-studies` id |
| artwork-routine | — | none found |

**Also found outside the seven, relevant to the same rename risk, currently
inconsistent with the above:**

- `docs/HANDOFF.md` §0 (33-34) says "**four** routine prompts... hardcode the
  value they write" — stale; should be **six** (the three radars,
  `ai-article-writer`, `talks-writer`, `case-studies-writer`).
- `docs/HANDOFF.md` §0's accent table (20-22) lists only
  technical/business/basics — predates `case-studies` (moss) and `talks`
  (hanko).
- `docs/PUBLISHING.md` frontmatter section (line 95): "`track:` ... systems |
  practice | demand" — the **pre-rename** names, retired 2026-08-25 per
  HANDOFF itself. Fully stale; should read the current five track ids.
- `site/src/pages/index.astro` (lines 63, 70, 82, 95, 107, 143) and
  `site/src/pages/[track].astro` (line 65) switch on literal track-id
  strings for per-track icon markup — a rename in `tracks.ts` alone would
  silently orphan these rather than fail a build.

---

## Prioritized action list

### Safe to apply now

1. Delete the `mind-the-pour-seo-aeo-check` reference in `business-radar`
   (line 42) — points at an unrelated project.
2. Fix the TL;DR consequence line in `ai-article-writer`, `talks-writer`,
   `case-studies-writer` — state it blocks publish and bounces to Needs
   Revision, matching `artwork-routine`'s correct wording.
3. Update or remove the `notebooklm-mcp` check in `ai-article-writer` (Step
   3, line 56) — the server no longer exists on this machine.
4. Correct `docs/HANDOFF.md` §0: "four" → "six," and add `case-studies`/
   `talks` to the accent table.
5. Correct `docs/PUBLISHING.md` line 95: replace "systems | practice |
   demand" with the current five track ids.
6. Add the explicit "never set Draft Status = Approved" guardrail to
   `daily-ai-seo-radar`, matching its siblings.

### Owner judgment needed

1. Whether/how to tell writers the Artwork brief now feeds an unattended
   drawing routine — could be one sentence, or could prompt rethinking how
   prescriptive the brief format needs to be with no human in the loop before
   drawing happens.
2. Whether to extract the near-duplicate "editorial spine" and "Track values"
   paragraphs shared across the three radar prompts into one referenced
   source, versus keeping each radar's explicit "runs cold, everything you
   need is in this file" self-containment. Real drift risk either way the
   owner should weigh.
3. Whether to compress `ai-article-writer`'s six-way accent mapping to a
   pointer at `ARTWORK.md` — low-risk cut, but touches the most carefully
   tuned file in the set, so flagging for sign-off rather than applying
   directly.
4. Whether `talks-writer`/`case-studies-writer` should keep asking the writer
   to justify a fixed accent as if it were a choice, or state plainly it's
   fixed by track.
5. Whether the case-studies A–D evidence grade should extend to
   Business-track pieces citing vendor claims.
6. Whether any prompt should reference the theme hub pages — most useful for
   `talks-writer`/`case-studies-writer`, lowest priority for the radars.
