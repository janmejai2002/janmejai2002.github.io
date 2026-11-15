---
title: 'Why Anthropic''s Routines and Advisor Pattern Replace Manual Prompting'
description: 'Anthropic''s London 2026 keynote reveals advisor routing, MCP tunnels, and autonomous routines, while platform docs expose 30% tokenizer and cache traps.'
pubDate: 2026-11-15
publishedAt: '2026-11-15T08:36:22.020Z'
track: talks
question: 'When do Anthropic''s advisor tool, MCP tunnels, and autonomous routines beat single-model agent loops?'
heroImage: '../../assets/art/code-with-claude-london-2026-routines-advisor-light.webp'
heroImageDark: '../../assets/art/code-with-claude-london-2026-routines-advisor-dark.webp'
heroAlt: 'Geometric diagram of an executor-advisor loop connected through a pierced firewall line to a self-hosted sandbox with a broken cache boundary marked by a cinnabar seal.'
readingTime: '7 min read'
notionId: '419ced67-050a-8149-9c07-d9a6c8056cb7'
---
<div class="tldr">

## Executive TL;DR

- At Code with Claude London 2026, Anthropic reported 17x year-over-year API growth and 200% more PRs per engineer internally, while warning that rigid agent scaffolding now holds smarter models back.
- Anthropic's Advisor strategy pairs a cheaper executor (Sonnet or Haiku) with an Opus advisor inside a single Messages API call, cutting Eve Legal's inference bills by 5x at frontier quality.
- Claude Managed Agents added self-hosted sandboxes (Daytona, Cloudflare, Vercel, Modal) and private MCP tunnels (`tunnel.anthropic.com`) so agents reach firewalled data warehouses without public internet exposure.
- Anthropic's platform documentation shows that agentic loops scale quadratically with turn count, Claude 4.7+ tokenizers emit roughly 30% more tokens for identical text, and breaking prefix caches imposes a 20x to 25x cost penalty.
- Claude Code's new `routines` and `CI autofix` shift engineering workflows from interactive terminal prompting to webhook-triggered, schedule-driven agent loops that babysit PRs to green builds.

Most enterprise teams still treat AI coding assistants as interactive autocomplete inside a developer's terminal. At Anthropic's May 2026 Code with Claude London opening keynote, Boris Cherny, Cat, Lisa, Angela, and Caitlin laid out a different architecture where agents prompt themselves on schedules, route hard decisions to an advisor model, and execute inside customer-owned sandboxes.

Beneath the product demos, the keynote exposed a sharp tension: as model task horizons stretch from minutes to hours, old scaffolding breaks, and uncached multi-turn loops collide with real billing and latency math.

</div>

## 1. The Core Argument in Three Sentences

Enterprise software teams assumed that making AI agents reliable required wrapping models in rigid prompt graphs and running every step on the single largest frontier model. Anthropic's London 2026 keynote challenges that assumption by showing that smarter models perform better with minimal filesystem and sandbox primitives, delegating routine execution to smaller models via the Advisor tool while running autonomous routines on webhooks and schedules. If this pattern holds, engineering organizations will stop hand-prompting individual coding sessions and instead maintain thin, verifiable infrastructures where smaller executors, private MCP tunnels, and automated CI loops ship code continuously.

## 2. Five Timestamped Inflection Points

- **[08:40] The Exponential Capability vs. Linear Adoption Gap:** Boris Cherny framed the keynote's central problem, noting that "even though model capabilities are improving on an exponential most organizations are still adopting AI on a linear path that means there's a growing gap between what AI can do and what it's actually doing for people." Raw model intelligence is no longer the primary bottleneck for most teams. The bottleneck sits in integration plumbing, verification loops, and organizational workflow design.
- **[19:03] Scaffolding That Used to Help Now Holds Models Back:** Lisa from Anthropic's research PM team warned builders against over-engineering wrappers, stating that "scaffolding is what we call the parts of the agent that aren't Claude so the loops the instructions the tools we're seeing that as models get smarter the scaffolding that used to help can hold Claude back claude is intelligent and resourceful and more intelligent models can al often get further with generalized primitives like a file system and sandbox computing environment." Hardcoded chain-of-thought templates built for 2024 models constrain Opus 4.7 from exploring simpler solutions. Teams must strip away prescriptive step-by-step guardrails whenever they upgrade base weights.
- **[22:23] Splitting Execution from Advising for 5x Lower Cost:** Caitlin and Angela introduced multi-model delegation in the Messages API, explaining that "we're splitting execution from advising so in execution you can use a smaller model this will make it a bit cheaper but when that small model needs help it can reach out to a larger model for advice... eve Legal for example used the advisor strategy and they told us they got frontier model quality at five times lower cost." Most turns in a long coding or research loop are mechanical file reads or edits. Paying Opus output rates for every grep command wastes budget, whereas consulting an advisor only at architectural forks preserves both quality and margin.
- **[24:42] Self-Hosted Sandboxes and Private MCP Tunnels:** Angela announced enterprise isolation upgrades for Claude Managed Agents, stating that "you can now have Claude execute work on your own server the other thing is MCP tunnels and for many people who build internal agents being able to access your internal MCP servers securely is now possible on Cloud Manage agents through MCP tunnels." Cloud-hosted agent sandboxes fail security reviews when they require opening public firewall ports to internal databases. Routing tool calls through `tunnel.anthropic.com` while dispatching code execution onto customer-owned Vercel, Daytona, Cloudflare, or Modal queues keeps source code inside the enterprise perimeter.
- **[42:51] Routines as Higher-Order Prompts That Prompt Claude:** Boris Cherny described the shift away from interactive chat, explaining that "a lot of my code these days is written by routines i'm not the one doing the prompting i'm the one that creates a routine that does the prompting for the engineers in the room think of it like a higher order function routines are a higher order prompt." Interactive terminal sessions tie throughput to human typing and attention. Triggering `routines` and `CI autofix` via GitHub webhooks, schedules, and API calls turns code generation and flaky-test triage into asynchronous background jobs.

## 3. What Was Claimed vs. What Benchmarks Prove

Anthropic's keynote presents advisor routing, managed agent sandboxes, and scheduled routines as straightforward multipliers on engineering velocity. Checking those promises against Anthropic's own platform documentation and serving benchmarks reveals four concrete operational costs.

First, multi-turn agent loops carry quadratic token mechanics and a silent tokenizer tax. According to [Anthropic's cost and intelligence optimization guide](https://platform.claude.com/docs/en/about-claude/models/optimizing-for-cost-and-intelligence), a 40-turn agent task resends its first turn 40 times, meaning uncached input cost grows roughly with the square of turn count. Furthermore, [Anthropic's official pricing documentation](https://platform.claude.com/docs/en/about-claude/pricing) discloses that Claude 4.7 and newer models use an updated tokenizer that produces approximately 30% more tokens for the exact same text. Upgrading an unoptimized agent harness to newer models immediately inflates baseline token counts by nearly a third before a single tool call runs.

Second, prompt caching requires strict prefix discipline that dynamic routines easily break. Anthropic's benchmarks show that caching reads 89% to 93% of input tokens on steady loops, yet editing a system prompt mid-session breaks the cache and multiplies turn cost by 25x (from USD 0.020 to USD 0.50 on Opus 5.5, and USD 0.010 to USD 0.25 on Sonnet 5.5). Changing the `effort` parameter at the top level similarly triggers a 20x penalty, while idle pauses longer than 5 minutes expire default caches unless teams pay double base input rates for 1-hour TTL writes (whose break-even sits at roughly 1 gap in 30 turns).

Third, the Advisor strategy's 5x cost reduction narrows as executor models improve and requires careful model pairing. As documented in [Anthropic's Advisor tool specification](https://platform.claude.com/docs/en/agents-and-tools/tool-use/advisor-tool), the advisor reads the entire conversation history whenever consulted, and Anthropic explicitly notes that the cost-quality benefit shrinks as the executor's own capability approaches the advisor's. Teams running capable mid-tier executors must benchmark whether occasional advisor calls outperform simply lowering `effort` on a single unified model.

Fourth, asynchronous routines and self-hosted sandboxes trade interactive streaming for polling and queue latency. In [Anthropic's Managed Agents research post](https://www.anthropic.com/research/managed-agents), engineers note that Time-to-First-Token is the latency metric users feel most acutely when decoupling harnesses from sandboxes. In [Anthropic's Managed Agents test-fix cookbook](https://platform.claude.com/cookbook/managed-agents-cma-iterate-fix-failing-tests), engineers are warned that long-lived Server-Sent Events (SSE) streams drop on network blips with no clean resume path, forcing production routines onto stateless polling or `session.status_idled` webhooks that add polling-interval latency to every run.

## 4. What This Changes for Applied Engineers

- **Audit and delete prescriptive scaffolding on every model upgrade:** When moving to Claude 4.7 or newer weights, remove rigid step-by-step prompt guardrails and run your eval suite to verify whether raw filesystem and bash tools outperform your legacy wrapper.
- **Keep system prompts and top-level effort append-only:** Never mutate system instructions or top-level `output_config.effort` mid-session. Pass per-turn adjustments as appended user or system messages so you avoid the 20x to 25x prefix-cache invalidation penalty.
- **Benchmark Advisor routing against single-model effort tuning:** Before wiring the `advisor_20260301` tool into production, test a Sonnet executor plus Opus advisor against a standalone mid-effort model across 50 representative traces, measuring both pass rate and total billed dollars.
- **Pair scheduled routines with stateless webhook queues:** Run `routines` and `CI autofix` behind idempotent webhook handlers and explicit session spend caps avoiding fragile long-lived SSE connections from developer laptops.

## Sources

- [Code with Claude London 2026: Opening Keynote](https://www.youtube.com/watch?v=6amLO7I9xdg) : Primary keynote with Boris Cherny, Lisa, Angela, Caitlin, and Cat, including timestamps and verbatim quotes
- [Optimizing for cost and intelligence - Claude Platform Docs](https://platform.claude.com/docs/en/about-claude/models/optimizing-for-cost-and-intelligence) : Quadratic 40-turn cost scaling, 20x to 25x cache-break penalties, and 1-in-30 TTL break-even data
- [Pricing - Claude Platform Docs](https://platform.claude.com/docs/en/about-claude/pricing) : Claude 4.7+ tokenizer 30% token increase and Managed Agents token billing rules
- [Advisor tool - Claude Platform Docs](https://platform.claude.com/docs/en/agents-and-tools/tool-use/advisor-tool) : Full-context advisor reads and diminishing returns as executor capability rises
- [Managed Agents tutorial: iterate on a failing test suite](https://platform.claude.com/cookbook/managed-agents-cma-iterate-fix-failing-tests) : SSE stream fragility vs. stateless webhook polling tradeoffs

<!--
Artwork brief — from the writer routine. Draw per docs/ARTWORK.md,
then delete this comment.

- Argument in one sentence: A lightweight executor loop delegates hard forks upward to an advisor ring while private MCP tunnels bridge a firewall boundary into a self-hosted sandbox.
- Geometry: Two stacked horizontal execution tracks (executor and advisor), a vertical dashed firewall line pierced by two parallel tunnel channels, and a detached sandbox square on the right.
- Accent: hanko
- Deliberate imperfection: A broken vertical cache boundary line and an offset cinnabar seal at the advisor handoff point, representing the 25x cost spike when prefix state breaks.
-->
