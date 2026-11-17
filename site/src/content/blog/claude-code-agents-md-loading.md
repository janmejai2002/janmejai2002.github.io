---
title: 'Claude Code Skips AGENTS.md in 1 in 6 Dual-File GitHub Repos'
description: 'An audit of 3,905 GitHub repos shows Claude Code skips AGENTS.md in 16% of dual-file projects and Codex truncates past 32 KiB. Fix it with @AGENTS.md imports.'
pubDate: 2026-11-15
publishedAt: '2026-11-15T23:21:29.598Z'
track: technical
question: 'Why does Claude Code ignore our repository AGENTS.md rules even when both files sit at the root?'
keywords:
  - Claude Code AGENTS.md
  - CLAUDE.md Import Rules
  - Coding Agent Instruction Drift
  - Context File Linting
heroImage: '../../assets/art/claude-code-agents-md-loading-light.webp'
heroImageDark: '../../assets/art/claude-code-agents-md-loading-dark.webp'
heroAlt: 'Minimalist geometric diagram showing two stacked left document blocks where the top block connects via a solid mizu line into a right agent node, while the bottom block''s mizu line stops mid-air across an unbridged gap.'
readingTime: '8 min read'
notionId: '419ced67-050a-8121-8d77-d22650ea1cc9'
---
<div class="tldr">

## Executive TL;DR

- **Claude Code skips `AGENTS.md` whenever `CLAUDE.md` is present:** Per [Anthropic's Claude Code memory documentation](https://code.claude.com/docs/en/memory) and [Harbor's November 14, 2026 audit of 3,905 GitHub files](https://dev.to/shoustak/we-checked-3905-claudemd-and-agentsmd-files-on-github-in-1-in-6-repos-claude-never-reads-the-7lh), `36%` of root `AGENTS.md` files sit beside a `CLAUDE.md`, and in **16% (1 in 6) of those dual-file repos**, `CLAUDE.md` never mentions `AGENTS.md`, so Claude Code never loads it.
- **Plain-text pointers fail non-deterministically in 15% of repos:** Another **15%** of dual-file repos write a prose sentence such as `"Read AGENTS.md before starting"` inside `CLAUDE.md`, which is treated as text instead of an import and only works if the model chooses to invoke a file-read tool ([DEV Community Study](https://dev.to/shoustak/we-checked-3905-claudemd-and-agentsmd-files-on-github-in-1-in-6-repos-claude-never-reads-the-7lh)).
- **Copied files drift apart and rules go stale:** In **7%** of dual-file repos, `CLAUDE.md` and `AGENTS.md` started as copies and drifted apart by 5 or more lines, while a companion audit of 10 popular open-source repos found **8 of 10 contained at least one stale rule** that actively misleads coding agents ([Shoustak 10-Repo Audit](https://dev.to/shoustak/we-audited-the-agent-rules-files-of-10-popular-open-source-repos-8-had-a-line-that-sends-the-agent-43p1)).
- **Hidden size caps truncate rules silently:** Across GitHub, **19% of `CLAUDE.md` files exceed Anthropic's 200-line ceiling** (median `81` lines, 10% over `309` lines), and **30,080 `AGENTS.md` files (`2.6%`) exceed OpenAI Codex's `32 KiB` default cap (`project_doc_max_bytes`)**, silently dropping trailing rules ([DEV Community Study](https://dev.to/shoustak/we-checked-3905-claudemd-and-agentsmd-files-on-github-in-1-in-6-repos-claude-never-reads-the-7lh)).
- **One-line fix plus CI linting:** Put `@AGENTS.md` on its own line at the top of `CLAUDE.md` instead of using OS symlinks (which break on Windows when `core.symlinks` is off), strip directory trees and HTML comments, and enforce `< 200` lines and `< 24 KiB` in CI.

</div>

## The Silent Skip: Why 1 in 6 Dual-File Repos Never Reach Claude Code

Engineering teams adopting multiple AI coding tools (`Claude Code`, `OpenAI Codex`, `Cursor`, and `Windsurf`) routinely place both `AGENTS.md` and `CLAUDE.md` at the root of their repository. The assumption is straightforward: `Codex` and `Cursor` will read `AGENTS.md`, and `Claude Code` will read both.

On November 14, 2026, Roei Shoustak at Harbor published an empirical study of **3,905 `CLAUDE.md` and `AGENTS.md` files** sampled across public GitHub repositories (`839,680` `CLAUDE.md` files and `1,142,784` `AGENTS.md` files indexed on GitHub as of October 18, 2026, excluding forks) ([DEV Community Study](https://dev.to/shoustak/we-checked-3905-claudemd-and-agentsmd-files-on-github-in-1-in-6-repos-claude-never-reads-the-7lh); [Emergent](https://emergent.sh/news/claude-code-skips-agents-md-1-6-repos-study)). The audit exposed a widespread initialization blind spot: **Claude Code does not read `AGENTS.md` by default when `CLAUDE.md` exists**.

As documented in [Anthropic's Claude Code memory guide](https://code.claude.com/docs/en/memory), if a repository contains `CLAUDE.md`, `.claude/CLAUDE.md`, or `CLAUDE.local.md` in the working directory or an ancestor folder, `Claude Code` loads only the `CLAUDE.md` hierarchy. Across GitHub, **36% of root `AGENTS.md` files have a `CLAUDE.md` sitting right beside them** (`745` dual-file repositories in the weighted sample). Here is what those `745` repositories actually do ([DEV Community Study](https://dev.to/shoustak/we-checked-3905-claudemd-and-agentsmd-files-on-github-in-1-in-6-repos-claude-never-reads-the-7lh)):

| How `CLAUDE.md` Handles the Sibling `AGENTS.md` | Share of Dual-File Repos (`n = 745`) | Does `AGENTS.md` Reach Claude Code? | Primary Failure Mode in Production |
| --- | --- | --- | --- |
| **Imports via `@AGENTS.md` directive** | **25%** | **Yes (Deterministic)** | None; pre-loaded into context at session startup |
| **OS Symlink (`CLAUDE.md` to `AGENTS.md`)** | **23%** | **Yes (Unix) / Breaks on Windows** | Windows clones with `core.symlinks=false` turn symlink into a 1-line text file ([Claude Docs](https://code.claude.com/docs/en/memory)) |
| **Never mentions `AGENTS.md` at all** | **16% (1 in 6)** | **No (0% loaded)** | Claude Code silently ignores all architectural and test rules in `AGENTS.md` |
| **Plain-text sentence (`"Read AGENTS.md"` )** | **15%** | **Only if Claude runs a tool call** | Model skips the file read on fast edits or loses it after context compaction |
| **Copied once, then drifted apart** | **7%** | **Partly (Contradictory)** | Missing 5+ lines; Codex and Claude enforce conflicting build/test commands |
| **Exact duplicate copy of all lines** | **7%** | **Yes (Until next PR)** | High maintenance burden; guaranteed to drift on future edits |
| **`CLAUDE.md` holds all; `AGENTS.md` is <5-line stub** | **5%** | **Nothing to miss** | Leaves Codex and other `AGENTS.md` tools without instructions |
| **Imports other files (indeterminate)** | **2%** | **Unknown** | Nested import chains obscure token budgets |

Add the failure buckets together: in **38% of dual-file repositories** (`16%` silent skip + `15%` non-deterministic prose request + `7%` drifted copy), developers believe their coding agents share a unified rulebook while `Claude Code` operates with missing, optional, or contradicted instructions.

## Text Pointers, Symlinks, and Drift: How Multi-Agent Rules Break in Practice

Why do so many senior engineers get caught by the `15%` "sentence pointer" trap and the `23%` symlink pattern? Because they confuse **preprocessor directives** with **prompt text**.

Compare how `Claude Code` initializes a session across the four common setups:

1. **The `@AGENTS.md` Preprocessor Import (`25%` of repos):** When `CLAUDE.md` contains `@AGENTS.md` on its own line, the `Claude Code` CLI runtime resolves the path on disk *before* sending the initial request and injects the full text of `AGENTS.md` into the system context alongside `CLAUDE.md` ([Claude Code Memory Docs](https://code.claude.com/docs/en/memory)). You can verify this in any session by running `/context all` ([Claude Code Best Practices](https://code.claude.com/docs/en/best-practices)).
1. **The Prose Sentence Trap (`15%` of repos, plus `6%` of all `CLAUDE.md` files overall):** Writing *"Please read `AGENTS.md` before starting any task"* inside `CLAUDE.md` does not trigger the CLI preprocessor. The model receives only that 8-word sentence. To see the rules, the LLM must decide to spend its first turn invoking its `Read` tool on `AGENTS.md`. On quick one-line prompts or after context compaction, models frequently skip that optional tool call.
1. **The Windows Symlink Trap (`23%` of repos):** Nearly a quarter of dual-file repos make `CLAUDE.md` a POSIX symlink pointing to `AGENTS.md`. On macOS and Linux, `Claude Code` follows the symlink cleanly (unless it points outside the working directory during a desktop Cowork session, where external symlinks are blocked for security per [Claude Code Memory Docs](https://code.claude.com/docs/en/memory)). On Windows, however, Git's default `core.symlinks=false` configuration checks out a symlink as a plain text file containing the single string `AGENTS.md`. When a Windows developer starts `Claude Code`, their entire instruction file is literally the nine characters `AGENTS.md`.
1. **Stale Rules Are Worse Than Missing Rules:** In a companion November 2026 audit of 10 popular, well-maintained open-source repositories ([Shoustak 10-Repo Audit](https://dev.to/shoustak/we-audited-the-agent-rules-files-of-10-popular-open-source-repos-8-had-a-line-that-sends-the-agent-43p1)), **8 out of 10 repositories had at least one rule in `CLAUDE.md`, `AGENTS.md`, or `.cursorrules` that pointed to deleted file paths, renamed CLI flags, or deprecated test runners**. Unlike irrelevant background noise, a stale rule activates on the exact task it governs and commands the agent to write broken code.

## Hidden Truncation Ceilings: The 200-Line and 32 KiB Cutoffs

Even when `AGENTS.md` and `CLAUDE.md` load properly, teams hit two undocumented or overlooked size ceilings that degrade agent compliance:

- **Anthropic's 200-Line Adherence Ceiling (`19%` of repos fail):** [Anthropic's memory documentation](https://code.claude.com/docs/en/memory) and [best-practices guide](https://code.claude.com/docs/en/best-practices) explicitly recommend keeping each `CLAUDE.md` file **under 200 lines** (and note that `@path` imports expand inline at startup, so importing a 300-line file still consumes the full context budget). In the 3,905-repo audit, the median `CLAUDE.md` is `81` lines, **19% exceed 200 lines**, `10%` exceed `309` lines, and `4%` exceed `500` lines ([DEV Community Study](https://dev.to/shoustak/we-checked-3905-claudemd-and-agentsmd-files-on-github-in-1-in-6-repos-claude-never-reads-the-7lh)).
- **OpenAI Codex's Hard `32 KiB` Byte Cutoff (`30,080` repos fail):** OpenAI's Codex CLI concatenates `AGENTS.md` files from the repository root downward and stops reading at **`32 KiB` (`32,768` bytes, controlled by `project_doc_max_bytes`)** by default ([DEV Community Study](https://dev.to/shoustak/we-checked-3905-claudemd-and-agentsmd-files-on-github-in-1-in-6-repos-claude-never-reads-the-7lh)). Across GitHub, **30,080 public `AGENTS.md` files (`2.6%`) exceed 32 KiB**, and **51,840 exceed 24 KiB**, where a single subdirectory `AGENTS.md` pushes the combined payload over the cliff. When Codex hits `32 KiB`, it truncates the tail of the file silently with zero terminal warning.

Where does all that bloat come from? The study flagged two prime culprits:

- **Hardcoded ASCII Directory Trees (`17%` of `CLAUDE.md` and `11%` of `AGENTS.md` files):** Dumping a 90-line `tree` output into your context file wastes thousands of bytes, goes stale the moment a developer renames a folder, and provides zero measurable navigation benefit since agents can run `glob` or `find` directly ([DEV Community Study](https://dev.to/shoustak/we-checked-3905-claudemd-and-agentsmd-files-on-github-in-1-in-6-repos-claude-never-reads-the-7lh)).
- **Instructions Inside HTML Comments (`6%` of `CLAUDE.md` files):** `Claude Code` strips block-level HTML comments (HTML comment blocks) before sending `CLAUDE.md` to the model. Any rule wrapped inside an HTML comment block is deleted before inference starts ([DEV Community Study](https://dev.to/shoustak/we-checked-3905-claudemd-and-agentsmd-files-on-github-in-1-in-6-repos-claude-never-reads-the-7lh)).

## Hardening Repo Context: Deterministic Imports and CI Linting Gates

To make repository instructions work reliably across `Claude Code`, `Codex`, and `Cursor` on every operating system, standardize on a single source of truth (`AGENTS.md` at the repo root for shared rules, plus scoped `.claude/rules/` files for path-specific rules) and make `CLAUDE.md` begin with a deterministic `@AGENTS.md` import:

```
@AGENTS.md

## Claude Code Specific Overrides
- Use `/doctor prompt-audit` when modifying build scripts.
- Enforce typechecks via `.claude/settings.json` Stop hooks.
```

Then add this lightweight Python CI linter to your pull-request workflow to block silent `AGENTS.md` skips, Windows symlink bugs, `32 KiB` Codex truncations, `200`-line `CLAUDE.md` bloat, and dead file references before they merge:

```python
import re
import sys
from pathlib import Path

MAX_CLAUDE_LINES = 200
MAX_CODEX_BYTES = 24576  # 24 KiB safety threshold below Codex 32 KiB cap
PATH_TOKEN_RE = re.compile(r"`((?:src|app|pkg|scripts|tests|\.claude)/[a-zA-Z0-9_./-]+)`")

def lint_agent_context(repo_root: Path):
    errors = []
    agents_md = repo_root / "AGENTS.md"
    claude_md = repo_root / "CLAUDE.md"

    if claude_md.is_symlink():
        errors.append("CLAUDE.md is a symlink (breaks on Windows core.symlinks=false). Use @AGENTS.md instead.")

    if agents_md.exists() and claude_md.exists() and not claude_md.is_symlink():
        c_text = claude_md.read_text(encoding="utf-8")
        if "@AGENTS.md" not in c_text.splitlines():
            errors.append("CLAUDE.md exists beside AGENTS.md but lacks an explicit '@AGENTS.md' import line.")

    for doc in [p for p in (agents_md, claude_md) if p.exists() and not p.is_symlink()]:
        raw = doc.read_bytes()
        lines = raw.decode("utf-8").splitlines()
        if len(lines) > MAX_CLAUDE_LINES:
            errors.append(f"{doc.name} has {len(lines)} lines (exceeds {MAX_CLAUDE_LINES}-line adherence target).")
        if len(raw) > MAX_CODEX_BYTES:
            errors.append(f"{doc.name} is {len(raw)} bytes (risks Codex 32 KiB silent truncation).")
        for match in PATH_TOKEN_RE.findall(raw.decode("utf-8")):
            if "*" not in match and not (repo_root / match).exists():
                errors.append(f"{doc.name} references non-existent repo path: {match}")

    return errors

if __name__ == "__main__":
    issues = lint_agent_context(Path("."))
    if issues:
        print("; ".join(issues))
        sys.exit(1)
```

Pair this script in CI with `Claude Code`'s built-in `/doctor prompt-audit` command ([Claude Code Best Practices](https://code.claude.com/docs/en/best-practices)), which scans `CLAUDE.md` and `.claude/rules/` for conflicting rules and deleted file paths, keeping your agent context lean, deterministic, and synchronized across every developer tool.

## Sources

- [We checked 3,905 CLAUDE.md and AGENTS.md files on GitHub. In 1 in 6 repos, Claude never reads the AGENTS.md: DEV Community / Harbor](https://dev.to/shoustak/we-checked-3905-claudemd-and-agentsmd-files-on-github-in-1-in-6-repos-claude-never-reads-the-7lh): Empirical audit of 3,905 files (`745` dual-file root pairs) showing 16% silent skip, 15% prose pointers, 7% drifted copies, 25% `@AGENTS.md` imports, 23% symlinks, 19% over 200 lines, and 30,080 (`2.6%`) `AGENTS.md` files over Codex's 32 KiB limit.
- [We audited the agent rules files of 10 popular open-source repos. 8 had a line that sends the agent the wrong way: DEV Community](https://dev.to/shoustak/we-audited-the-agent-rules-files-of-10-popular-open-source-repos-8-had-a-line-that-sends-the-agent-43p1): Manual commit-pinned verification showing 80% of audited OSS repositories contain stale rules that mislead coding agents.
- [How Claude remembers your project: Claude Code Docs](https://code.claude.com/docs/en/memory): Official Anthropic specification for `CLAUDE.md` loading priority, the 200-line target ceiling, `@path` import expansion, HTML comment stripping, and Cowork symlink restrictions.
- [Best practices for Claude Code: Claude Code Docs](https://code.claude.com/docs/en/best-practices): Official guidance on `/context all`, `/init`, `/doctor prompt-audit`, and enforcing checks via Stop hooks instead of prose lines.
- [Claude Code Skips AGENTS.md in 1 in 6 Repos, Study Finds: Emergent](https://emergent.sh/news/claude-code-skips-agents-md-1-6-repos-study): Independent summary of the November 14, 2026 Harbor study and multi-tool instruction loading hierarchy.

<!--
Artwork brief — from the writer routine. Draw per docs/ARTWORK.md,
then delete this comment.

- Argument in one sentence: Without an explicit `@AGENTS.md` import bridge, `Claude Code` locks onto `CLAUDE.md` at session startup and leaves the sibling `AGENTS.md` rulebook completely disconnected.
- Geometry: Two parallel vertical document blocks on the left (`CLAUDE.md` on top, `AGENTS.md` on bottom) facing a central agent initialization gate on the right; the upper `CLAUDE.md` block connects cleanly into the gate via a solid `mizu` conduit, while the lower `AGENTS.md` conduit terminates in an unbridged gap short of the gate, accompanied by a vertical `mizu` truncation tick at the 200-line/32-KiB mark.
- Accent: mizu
- Deliberate imperfection: A severed horizontal `mizu` conduit from the lower `AGENTS.md` block that stops 90 pixels short of the initialization node, visually depicting the 1-in-6 dual-file repositories where `AGENTS.md` is silently skipped.
-->
