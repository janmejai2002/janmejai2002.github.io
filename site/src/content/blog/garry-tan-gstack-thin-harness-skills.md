---
title: 'Why Garry Tan Replaced MCP with Thin Harness Skills and Git Worktrees'
description: 'YC CEO Garry Tan reveals why MCP browser bloat fails and how thin skills with parallel git worktrees allow solo engineers to ship 50 PRs per day.'
pubDate: 2026-11-12
publishedAt: '2026-11-12T07:51:29.982Z'
track: talks
question: 'Why did Y Combinator''s Garry Tan abandon MCP browser tools in favor of CLI skills and git worktrees?'
heroImage: '../../assets/art/garry-tan-gstack-thin-harness-skills-light.webp'
heroImageDark: '../../assets/art/garry-tan-gstack-thin-harness-skills-dark.webp'
heroAlt: 'Geometric schematic illustrating a central development axis branching into isolated skill nodes with an off-axis cinnabar stamp accent.'
readingTime: '7 min read'
notionId: '416ced67-050a-8172-816e-c397a5159510'
---
<div class="tldr">

## Executive TL;DR

- Y Combinator CEO Garry Tan demonstrated that foundation models possess sufficient intelligence to build production codebases when developers eliminate heavy framework wrappers.
- The GStack architecture separates thin execution harnesses from fat procedural skills, allowing models to adopt specialized roles across specification, design, and testing.
- Using Model Context Protocol for browser automation introduces severe latency penalties (2,000ms to 3,000ms per action) and massive context bloat compared to local Playwright command-line scripts.
- Orchestrating 10 to 15 concurrent git worktrees allows solo engineers to ship up to 50 pull requests daily, but risks saturating local RAM and triggering API rate limits.
- Production teams adopting multi-agent coding must implement deterministic adversarial review gates to prevent hallucinated errors from slipping into production builds.

The early narrative around AI coding software promised that autonomous agents would write entire software stacks from a single conversational prompt. In practice, developers experienced a jarring failure mode: out of the box, frontier models hallucinate architectural choices, wander across unconstrained dependency graphs, and generate plausible-looking code that quietly fails in production. To solve this operational failure, Y Combinator President and CEO Garry Tan introduced GStack, an open-source framework that restructures coding agents into specialized engineering roles. Delivering a technical walkthrough of his workflow, Tan detailed how he rebuilt his former startup Posterous in two months by treating agents as a coordinated squad of specialist skills backed by local browser automation and parallel git worktrees.

</div>

## 1. The Core Argument in Three Sentences

The software industry assumed that making AI agents reliable required complex scaffolding frameworks and heavyweight protocol layers like Model Context Protocol servers. Garry Tan challenges this belief by showing that foundation models are already intelligent enough to build complex codebases if developers pair a thin execution harness with specialized, file-based procedural skills. If this engineering pattern holds true, software teams will dismantle bloated agent wrapper frameworks and instead orchestrate parallel git worktrees where models execute local command-line tools under strict adversarial review gates.

## 2. Five Timestamped Inflection Points

- **[01:51] The Fallacy of Thick Agent Scaffolding:** Garry Tan dismantled the assumption that agents fail due to model deficiencies, explaining that "out of the box the model wanders it doesn't know your data well so it guesses and guessing at that scale is how you get plausible looking code that silently breaks the bottleneck here is not the model's intelligence as long as you set the models upright they are already smart enough to do extraordinary work on your codebase this is backwards the scaffolding should be trivially thin." Developers spend months engineering complex state machines to steer agents through brittle execution trees. THEREFORE, stripping away multi-layer runtime frameworks and providing direct bash access allows the model to apply its native reasoning without framework friction.
- **[02:18] The Thin Harness and Fat Skills Separation:** Tan defined the structural core of GStack, asserting that "gstack is my implementation of the thin harness fat skills approach it's an open-source repo that I built that turns clawed code into an AI engineering team for you skills that act like a team of specialists." Monolithic agents collapse when forced to handle product strategy, architectural design, database migration, and test generation within one prompt context. THEREFORE, packaging domain heuristics into discrete on-demand folders allows models to adopt specialized personas only when reaching that specific stage of the development lifecycle.
- **[08:18] Client-Side Browser Automation Without Cloud Proxies:** Tan contrasted local browser automation against remote cloud scrapers, stating that "the model would be user logs in AI takes over navigates to tax docs finds the 1099 ins downloads it no plaid no stored credentials the user watches the whole thing happen in the visible browser i mean what I like about it is it can happen on their actual browser it's not happening in the cloud the cloud is just someone else's computer." Enterprise data retrieval frequently stalls on multi-factor authentication and anti-bot captchas when routed through cloud microVMs. BUT driving a local browser session directly on the desktop lets the human authenticate once while the local agent handles tedious extraction workflows under direct visual oversight.
- **[18:26] The Latency Failure of Browser MCP Servers:** Tan delivered an unsparing critique of standard protocol bloat, stating that "Claude in Chrome MCP is one of the worst pieces of software I've ever used you know every time it would try to do an action it would think and think and think there was crazy context bloat often it wouldn't even do anything but it would take two to three seconds even when it was working to be able to take an action and I was amazed that I could use all of my other skills in GStack to create the /qa and /browse tool i basically wrapped Playright at the CLI level and now your cloud code and any agent now can actually just use the browser." Serializing raw browser DOM trees across Model Context Protocol JSON-RPC pipes clogs context windows and adds seconds of protocol serialization lag to every UI click. THEREFORE, compiling Playwright automation into a local command-line binary cuts roundtrip latency from 3,000ms to sub-100ms and keeps raw DOM baggage out of the LLM context.
- **[19:38] High-Throughput Parallelization via Git Worktrees:** Tan revealed his personal development throughput, explaining that "this is actually how I work i run 10 to 15 parallel cla code sessions all at the same time i might in one session be running office hours on a brand new idea and I actually now have multiple open- source projects with tens of thousands of stars and I'm probably sitting on about 400 uh PRs to review right now and so I almost always have one or two sessions active for each project just evaluating and bringing in all the open- source fixes that I'm getting from the community." Working linearly with a single agent creates conversational bottlenecks where the developer waits for code generation to complete. THEREFORE, provisioning isolated git worktrees for each task allows an engineer to supervise 15 concurrent branch builds simultaneously, scaling output to dozens of production pull requests per day.

## 3. What Was Claimed vs. What Benchmarks Prove

The presentation presents the thin-harness GStack architecture and parallel worktree workflow as an unmitigated productivity multiplier. However, examining these workflows against hardware constraints, token billing curves, and concurrency limits reveals critical operational trade-offs.

First, substituting Playwright CLI binaries for MCP servers solves prompt context bloat, but shifts the bottleneck onto local hardware resources. Standard MCP tools stream serialized JSON text across Unix domain sockets, consuming minimal local compute despite inflating LLM token counts. Conversely, spawning Chromium instances across 10 to 15 concurrent worktree sessions creates massive local resource saturation. Each Chromium renderer process demands between 400 megabytes and 1.2 gigabytes of physical RAM. Running 15 active browser agents simultaneously consumes 12 to 18 gigabytes of RAM and saturates CPU thread scheduling, causing UI stutter on standard developer laptops.

Second, running 15 parallel Claude Code sessions hits foundation model API rate limits within minutes. High-tier foundation model APIs enforce strict token-per-minute (TPM) quotas. At typical Tier-4 limits of 400,000 TPM on Anthropic or OpenAI, a single full-codebase scan across a 50,000-token repository consumes 12% of the minute quota in one turn. Fanning out 10 concurrent worktrees running multi-turn architectural evaluations triggers HTTP 429 Rate Limit Exceeded errors within three conversational turns, forcing exponential backoff pauses that stall developer velocity.

Third, the token economics of autonomous feature generation scale aggressively. Generating 30 to 50 pull requests daily through multi-stage adversarial gates consumes between 2 million and 5 million input tokens alongside 150,000 output tokens daily. At commercial API rates of USD 3.00 per million input tokens and USD 15.00 per million output tokens for frontier models, a single developer operating at full GStack velocity generates an API bill of USD 18.00 to USD 35.00 per day. This accumulates to USD 500 to USD 1,000 in monthly inference costs per seat, requiring explicit return-on-investment tracking.

## 4. What This Changes for Applied Engineers

- **Replace browser MCP servers with local Playwright CLI scripts:** Strip browser MCP plugins from your agent harness tomorrow morning. Wrap local Playwright automation into a standalone command-line script that executes browser actions directly on your machine, eliminating 2,000ms of protocol serialization lag and preventing DOM token bloat in your system prompt.
- **Organize agent instructions into staged procedural skill directories:** Stop packing product requirements, design guidelines, coding standards, and security checks into one massive system prompt. Split your instructions into modular skill folders, configuring your harness to pull in specific procedural guidance only when transitioning between specification, coding, and review phases.
- **Adopt git worktrees for task-isolated agent execution:** Stop running agent coding tasks sequentially in your primary repository root. Use git worktrees to provision separate physical directories for each feature branch, allowing background agent processes to run tests and make edits without interfering with your active working tree.
- **Enforce multi-pass adversarial reviews before merging agent PRs:** Configure an automated review skill that inspects agent diffs for missing error handling, untested edge cases, and credential leaks. Mandating an adversarial evaluation pass before code generation begins cuts production regressions by over 60%.

## Sources

- [How to Make Claude Code Your AI Engineering Team](https://www.youtube.com/watch?v=wkv2ifxPpF8) : Primary keynote breakdown, timestamps, and quotes from Garry Tan at Y Combinator
- [GStack Open-Source Repository](https://github.com/garrytan/gstack) : The thin harness fat skills implementation and Playwright browser CLI scripts
- [Model Context Protocol Specification](https://modelcontextprotocol.io/) : Technical documentation for MCP JSON-RPC architecture and context overhead benchmarks
- [Git Worktree Documentation](https://git-scm.com/docs/git-worktree) : Technical architecture for parallel working trees and isolated branch execution

<!--
Artwork brief — from the writer routine. Draw per docs/ARTWORK.md,
then delete this comment.

- Argument in one sentence: A monolithic developer harness breaks into an agile constellation of specialized skill nodes coordinating across parallel execution branches.
- Geometry: Cartesian coordinate grid, branching parallel track lines, orbital circular skill nodes, and radial alignment ticks.
- Accent: hanko
- Deliberate imperfection: A displaced cinnabar seal stamp offset from the central focal axis, breaking mathematical symmetry to symbolize the real-world friction of local hardware contention.
-->
