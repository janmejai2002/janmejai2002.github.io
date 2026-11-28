# @3harness Improvement Notes (Observed During Live Multi-Worker Session)

**Observed on:** 2026-11-28  
**Session:** 3 parallel `role: "researcher"` / `preset: "scout"` dispatches on `janmejai2002.github.io` (`agy-a`, `agy-b`, `agy-c`) while coordinator edited `site/src/pages/index.astro` and ran browser audits.

---

## 1. Bug: `stagnant_turns` Counter Exceeds `turn_count` on Research Jobs
- **Observed:** On job `j_20261128-192620_9edb` (`agy-b`, `role: "researcher"`), `pool_status` reported `turn_count: 9`, `tool_calls: 27`, **`stagnant_turns: 16`**.
- **Root cause hypothesis:** `stagnant_turns` appears to increment per tool call / step without file mutation rather than per assistant turn without progress.
- **Impact:** Heavy read/search research jobs risk triggering `max_stagnant_turns` circuit-breakers prematurely while actively making research progress.
- **Suggested fix:** Count stagnation strictly per assistant turn, and treat read/search progress (new files read, new web queries executed) as non-stagnant for `role: "researcher"` / `preset: "scout"`.

## 2. `scout` Preset `max_turns` (25) Kills Workers Right Before Final Commit
- **Observed:** Job `j_20261128-192624_f099` (`agy-c`, `preset: "scout"`) completed writing its full 40.9 KB / 313-line report (`INVESTMENT-ROI-AND-MONETIZATION-MODEL.md`), then got terminated at turn 26 with `state: "stalled"` (`max_turns exceeded (26 > 25)`).
- **Impact:** Completed work is flagged as `stalled` and never cleanly committed or summarized; coordinator has to inspect the raw workspace dir `C:\agy-work\...` manually to recover the file.
- **Suggested fix:**
  1. Raise `scout` default `max_turns` from `25` to `35` (or `40`).
  2. Inject a **soft wrap-up warning** at `max_turns - 3` ("3 turns remaining: finalize your file, commit, and return summary").
  3. On `stalled` exit, still auto-commit or report any uncommitted modified files in `claimed_files` so the coordinator knows the deliverable exists.

## 3. Stale Worker List in MCP Tool Schema Descriptions
- **Observed:** `pool_accounts.json`, `pool_status.json`, and `pool_dispatch.json` descriptions hardcode `(agy-a, agy-b, agy-d)` even though `agy-c` is an active 4th worker in `agy-users.json`, `pool_doctor`, and `pool_status`.
- **Suggested fix:** Generate the worker list in tool descriptions dynamically from `agy-users.json` (or say "isolated agy worker accounts").

## 4. `pool_status` Payload Bloat & Missing `repo` Filter
- **Observed:** `pool_status` returns all running/recent jobs across *every* repo on the machine (`cordis`, `ddjflx4`, `janmejai2002.github.io`) plus full ledger and stats — exceeding tool output limits (~460 lines) and spilling to a temp file that costs an extra `read_file` turn.
- **Suggested fix:** Add optional parameters `repo` (filter to current workspace) and `compact: true` (return only job id, account, state, duration, turn_count, claimed files) to keep coordinator context ultra-lean.

## 5. Dirty-Tree-Safe Artifact Extraction (`pool_extract` / `filesOnly` Merge)
- **Observed:** When the coordinator is editing code in the main repo (`site/src/pages/index.astro`) while workers produce standalone docs in `docs/strategy/`, full git `pool_merge` risks colliding with the coordinator's uncommitted changes or auto-committing when the user hasn't asked to commit.
- **Suggested fix:** Add a `pool_extract` tool (or `pool_merge` option `mode: "checkout-files"`) that copies only the worker's claimed files from its branch into the main workspace without mutating git history or requiring a clean working tree.

## 6. Historical `runner died` Failures on Reviewer Jobs
- **Observed:** In `pool_status.recent`, 3 earlier `role: "reviewer"` jobs (`j_20261128-150103_987b`, `152843_0b74`, `152849_8722`) failed with `error: "runner died"` around the 65–72s mark.
- **Suggested fix:** Capture last stderr / exit code from `ptyrun.exe` / `agy.exe` into the job record so `runner died` is diagnosable (OOM vs auth vs pipe close).
