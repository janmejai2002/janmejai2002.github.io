---
title: 'Uber AI Autopsy: 70% Agent PRs and a 52% Session Cost Cut'
description: 'Uber generates over 70% of PRs with AI agents and cut cost per session 52% using 1-hour prompt caches, Code-Mode batching, and a 24M-node Context Graph.'
pubDate: 2026-11-24
publishedAt: '2026-11-24T19:51:39.649Z'
track: case-studies
question: 'How did Uber scale AI coding agents to 70% of pull requests while cutting cost per session by 52%?'
heroImage: '../../assets/art/uber-software-factory-code-mode-autopsy-light.webp'
heroImageDark: '../../assets/art/uber-software-factory-code-mode-autopsy-dark.webp'
heroAlt: 'Geometric diagram showing wide nested token blocks compressing into a moss-highlighted subprocess loop beside a circular node graph, with a broken detour line trailing below.'
readingTime: '7 min read'
notionId: '422ced67-050a-8117-a1cf-c84873383997'
---
<div class="tldr">

## Executive TL;DR

- Uber [attributes](https://www.uber.com/in/en/blog/efficient-software-factory/) more than 70% of its pull requests to local or cloud AI agents, running over 3,600 agent skills and 30,000 daily skill executions across its engineering organization.
- Between February and August 2026, weekly active users grew 7x and weekly agentic requests rose 9.4x, while total AI spend stabilized after April and cost per session fell 52% from its June peak (holding the underlying model constant).
- Replacing chatty MCP tool loops with subprocess `Code-Mode` batching cut token burn from 1,431,594 tokens to 900 tokens on wide-table SQL queries and by 55% to 71% on small queries.
- Grounding agents in Uber's 24-million-node AI Context Graph cut an analytical lookup from 20 minutes 9 seconds (with 3 errors and a false failure) down to 38 seconds.
- On the consumer side, Uber's [Q3 2026 earnings call](https://www.investing.com/news/transcripts/earnings-call-transcript-uber-tops-q3-2026-estimates-as-growth-stays-strong-93CH-4999599) revealed that third-party AI agents still generate tiny demand: roughly 500 Uber Eats orders and 4 Mobility rides out of 320 million weekly trips.

</div>

## 1. The Deployment

Uber runs its engineering automation as an internal "Software Factory" spanning interactive coding tools and autonomous managed agents for code review (`uReview`), self-healing CI, visual end-to-end PR validation, and on-call alert triage. According to Distinguished Engineer Uday Kiran Medisetty's [August 27, 2026 engineering post](https://www.uber.com/in/en/blog/efficient-software-factory/), weekly active users grew 7x and weekly agentic requests climbed 9.4x between February and August 2026, pushing AI-attributed pull requests past 70% of total volume.

Four architectural layers govern how Uber controls model choice, context, and spend:

1. **Unified Interactive Harness Wrapper**: Every local coding session runs through a standardized wrapper that handles installation, authentication, default model selection, a 400K-token automatic compaction threshold (even on 1M-context models), Medium reasoning effort defaults, and a live terminal cost counter.
1. **Gateway-Routed MCP and CLI Projection**: Uber routes more than 1,000 internal and SaaS Model Context Protocol (MCP) servers through one gateway. Rather than loading 100+ tool schemas upfront (which adds 50,000 to 70,000 tokens per turn), the gateway projects all 1,000+ tools as shell CLI commands and uses on-demand tool search.
1. **Code-Mode Subprocess Execution**: Over 25 pre-built `Code-Mode` skills wrap chatty multi-turn APIs (such as SQL query submission and status polling) into local Python scripts so intermediate payloads never enter the LLM context window.
1. **AI Context Graph**: A unified graph containing 24 million nodes and 80 million edges across 86 node types and 117 edge types indexes over 30 internal systems (services, team ownership, incident logs, PRs, design docs, datasets, and historical table queries).

When an engineer or managed agent investigates a codebase or data question, the request follows five steps:

1. The harness initializes with only core shell and discovery tools, keeping initial prompt overhead near zero instead of pre-loading 50,000 to 100,000 tokens of vendor MCP schemas.
1. The primary model plans the task and delegates bounded subtasks to subagents defaulted to a cheaper, smaller model with a 5-minute prompt cache Time-to-Live (TTL), while the main interactive thread uses a 1-hour cache TTL.
1. To locate unfamiliar services or tables, the agent queries the AI Context Graph in natural language, pulling verified ownership and historical query patterns in one hop.
1. When invoking internal tools or SaaS apps (workspace suites of 49 tools, messaging servers of 34 tools, or project trackers of 46 tools), the agent runs a CLI command or `Code-Mode` Python script in a subprocess, returning only a compact summary.
1. After execution, Uber's runtime automatically captures session traces into a zero-setup Session Analysis Dashboard that audits token waste across 16 known anti-patterns.

## 2. The Balance Sheet

Uber's [Q3 2026 financial release](https://investor.uber.com/news-events/news/press-release-details/2026/Uber-Announces-Results-for-Third-Quarter-2026/default.aspx) provides the financial backdrop for this internal discipline. Quarterly revenue rose 10% year over year to $14.8 billion on $59.8 billion in Gross Bookings (up 20% year over year), delivering $1.4 billion in GAAP operating income, $2.3 billion in non-GAAP operating income (3.9% of Gross Bookings), and $2.5 billion in quarterly free cash flow ($10.4 billion over the trailing 12 months).

While Uber's core marketplace prints cash, unconstrained internal AI coding spend spiked early in 2026 before stabilizing after April. Uber decomposes total AI spend into a six-term cost equation: `spend = users × (sessions / user) × (turns / session) × (requests / turn) × (tokens / request) × (price / token)`. Because Uber wants `users` and `sessions / user` to keep climbing, its engineering team focused strictly on the middle efficiency terms. Holding the underlying model constant between February and July 2026, cost per 1,000 model requests dropped nearly 34% from its peak, and cost per session fell 52% from its June peak.

| Optimization / Workload Metric | Baseline Cost or Latency | Optimized Cost or Latency | Measured Reduction |
| --- | --- | --- | --- |
| Model-Constant Unit Cost (Feb to Jul 2026) | Peak request & June session cost | Post-optimization baseline | -34% per 1K req / -52% per session |
| MCP Schema Overhead (100+ tools) | 50,000 to 70,000 tokens/turn | CLI projection + on-demand search | Eliminates static schema tax |
| SQL `SELECT 1` (1 row) | 903 tokens (LLM tool-use) | 402 tokens (`Code-Mode`) | 55% fewer tokens |
| SQL `GROUP BY LIMIT 20` (20 rows) | 1,600 tokens (LLM tool-use) | 457 tokens (`Code-Mode`) | 71% fewer tokens |
| SQL `SELECT *` Wide Table (50 rows) | 1,431,594 tokens (LLM tool-use) | 900 tokens (`Code-Mode`) | ~100% fewer tokens |
| Dataset Discovery Task | 20m 09s (ungrounded, 3 errors) | 38s (AI Context Graph) | 31.8x faster, accurate |

Prompt caching math illustrates why Uber tuned cache TTLs by workload shape. Subsequent cache reads cost `0.1x` the standard input rate, whereas writing a 5-minute cache costs `1.25x` and writing a 1-hour cache costs `2x`. Because human engineers routinely pause longer than 5 minutes between interactive turns, the default 5-minute TTL repeatedly expired and forced full-price prefix rebuilds. Switching main threads to a 1-hour TTL while keeping short-lived subagents on 5-minute TTLs cut net cache rebuild spend across multi-hour sessions.

On `uReview`, Uber's automated PR reviewer, the team benchmarked 10 model configurations against historical pull requests containing known bugs (graded easy, medium, and hard) to plot cost per review against F1 score, migrating workloads onto the Pareto frontier. By contrast, consumer-facing AI agent commerce remains negligible: on the [Q3 2026 earnings call](https://www.investing.com/news/transcripts/earnings-call-transcript-uber-tops-q3-2026-estimates-as-growth-stays-strong-93CH-4999599), CFO Balaji Krishnamurthy disclosed that during Halloween week (roughly 320 million trips across Mobility and Delivery), third-party AI agents generated only about 500 Uber Eats orders and 4 rides.

## 3. The Edge Cases and Breakages

Scaling agentic coding across thousands of engineers surfaced four concrete failure modes documented in Uber's [engineering post](https://www.uber.com/in/en/blog/efficient-software-factory/):

1. **Slow, expensive failures without graph grounding**: Without the AI Context Graph, an agent answering a data question spent 20 minutes and 9 seconds crawling service code, spawning 2 subagents, and hitting 3 execution errors before falsely concluding the dataset could not be queried. With the graph, the same model found the table used by 50+ analysts in 38 seconds.
1. **Wide-table and multi-turn polling blowups**: Standard MCP tool calling forces every polling step and raw database row into the LLM context window. On a 50-row `SELECT *` query against a wide table, standard tool-use consumed 1,431,594 tokens compared to 900 tokens when executed inside a `Code-Mode` Python subprocess.
1. **Third-party SaaS MCP schema bloat**: External vendors bundle entire product surfaces into single MCP servers (Uber measured 49 tools and ~22,000 schema tokens for a workspace suite, 34 tools for messaging, and 46 tools for project tracking). Loading just two or three SaaS MCP servers forced agents to carry more schema tokens than the source file under edit before reading the user's prompt.
1. **Sixteen recurring developer workflow anti-patterns**: Uber's Session Analysis Dashboard continuously flags waste in production traces, led by four primary patterns: routing simple multi-turn chats to Opus instead of Sonnet, leaving 40KB MCP responses pinned in context across turns, letting 5-minute prompt caches expire during coffee breaks, and pre-loading 100,000 tokens of system instructions and tool definitions before turn one.

Instead of hard shutoffs that block shipping, Uber uses a soft escalation loop: a live cost counter in the terminal status bar, shared harness spend pools with Slack alerts at 50%, 80%, and 100% of expected spend, fast manager sign-off for tier increases, and an on-demand cost-check skill that points engineers to specific trace fixes.

## 4. The Reusable Blueprint

1. **Measure cost per outcome, not just token price**: Track the six-term spend equation alongside outcome metrics (cost per merged PR, cost per review, revert rate, F1, and MTTR) so model swaps never silently degrade code quality while lowering unit token prices.
1. **Replace MCP schemas with CLI projection and `Code-Mode` scripts**: Put internal and third-party MCP servers behind one gateway, expose them as shell commands or on-demand search tools, and run polling loops or wide queries inside subprocess scripts that return only summaries.
1. **Match prompt cache TTLs and model tiers to thread lifetimes**: Use a 1-hour cache TTL on interactive main threads where humans pause, keep 5-minute TTLs on single-shot subagents, cap auto-compaction at 400K tokens, and default subagents to smaller models.
1. **Ground agents in an internal context graph before they search**: Indexing service ownership, incident history, and historical data queries turns 20-minute failing repo crawls into sub-minute lookups and cuts wasted agent turns at the root.

## Sources

- [Running a Software Factory Efficiently at Uber Scale](https://www.uber.com/in/en/blog/efficient-software-factory/)
- [Uber Announces Results for Third Quarter 2026](https://investor.uber.com/news-events/news/press-release-details/2026/Uber-Announces-Results-for-Third-Quarter-2026/default.aspx)
- [Earnings call transcript: Uber tops Q3 2026 estimates as growth stays strong](https://www.investing.com/news/transcripts/earnings-call-transcript-uber-tops-q3-2026-estimates-as-growth-stays-strong-93CH-4999599)

<!--
Artwork brief — from the writer routine. Draw per docs/ARTWORK.md,
then delete this comment.

- Argument in one sentence: Routing chatty agent tool loops through a subprocess Code-Mode layer and a dense Context Graph compresses sprawling token waste into a fast, bounded execution path.
- Geometry: On the left, a tall stack of nested wide rectangles narrows down into a compact moss-highlighted subprocess loop; on the right, a dense circular network of nodes (the 24M-node Context Graph) feeds straight into a clean horizontal timeline bar, with one jagged, broken line trailing off below to mark an ungrounded 20-minute search path.
- Accent: {{moss}}
- Deliberate imperfection: A broken, jagged detour line below the main timeline ends abruptly against an empty vertical tick, representing the ungrounded agent that burned 20 minutes and 3 errors before failing.
-->
