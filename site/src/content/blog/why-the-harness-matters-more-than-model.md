---
title: 'Why Agent Harnesses Beat Raw Model Weights on ARC-AGI-3'
description: 'YC Paper Club benchmarks show an RLM harness jumps Claude Opus from 30% to 95.5% on ARC-AGI-3, but 23M-token loops hit steep API bills.'
pubDate: 2026-11-14
publishedAt: '2026-11-14T08:06:25.541Z'
track: talks
question: 'Can changing the agent harness really boost the same model from 30% to 95.5% without touching weights?'
heroImage: '../../assets/art/why-the-harness-matters-more-than-model-light.webp'
heroImageDark: '../../assets/art/why-the-harness-matters-more-than-model-dark.webp'
heroAlt: 'Geometric diagram of a three-tier agent memory hierarchy connected to a central orchestrator ring with a severed budget gate marked by an offset cinnabar seal.'
readingTime: '7 min read'
notionId: '418ced67-050a-8113-b0b4-d28588e795e5'
---
<div class="tldr">

## Executive TL;DR

- At Y Combinator's Paper Club, researchers demonstrated that wrapping the exact same Claude Opus weight file in a recursive IPython harness pushed private ARC-AGI-3 scores from 30% to 95.5%.
- Prime Agent models agent memory as an L1/L2/L3 cache hierarchy, keeping large state objects inside a persistent IPython kernel (L2) so models manipulate variables in RAM instead of flooding token context (L1).
- Independent reproduction of Prime Agent's persistent kernel cut session history token consumption from 321,458 tokens down to 149 tokens on structured queries, though raw text reads shrink those savings by 20x.
- Ultra-horizon harnesses burn massive compute: Prime Intellect's 7-day Factorio run spawned 633 agents across 23 million output tokens, while another popular harness burned USD 5,000 without making meaningful progress.
- Production teams at YC (QM) and Stanford (OpenJarvis) are decoupling the agent brain (centralized Postgres state or on-device specs) from ephemeral compute sandboxes to prevent state lock-in and runaway API costs.

For years, machine learning forums dismissed agent scaffolding as trivial prompt engineering unworthy of serious systems research. At Y Combinator's September 2026 Paper Club, engineers from YC, Prime Intellect, and Stanford's Hazy Research lab presented hard empirical evidence against that dismissal.

Across live demonstrations of Prime Agent, OpenJarvis, and YC's internal QM system, the speakers showed that identical model weights behave like completely different intelligences depending on how the surrounding harness manages memory, code execution, and subagent lifecycles.

</div>

## 1. The Core Argument in Three Sentences

The AI industry treated model weights and pre-training perplexity as the primary drivers of benchmark performance, dismissing agent scaffolding as thin prompt engineering. Speakers at Y Combinator's Paper Club challenge this view by showing that giving a fixed model weight file a persistent IPython kernel, subagent messaging, and self-modifying state pushes ARC-AGI-3 accuracy from 30% to 95.5%. If this architectural pattern holds, applied AI teams will stop waiting for the next base model release and instead engineer Von Neumann agent harnesses with explicit memory tiers, hard token budgets, and centralized state stores.

## 2. Five Timestamped Inflection Points

- **[03:45] Same Weights Jump from 30% to 95.5% on ARC-AGI:** Opening the session, the YC host cited private holdout evaluations, noting that "Claude Opus was one of the first that was actually verified on the hold out on the private that no one else has access to other than Greg and Chalet and the best that they got was 30% and just with um some harness this thing that doesn't deserve any research just some wrapper and some scaffolding we can get to 95." Raw single-pass inference fails on novel rule-induction tasks because the model cannot test hypotheses iteratively. Giving the same weights a structured loop to probe the environment, record state, and revise guesses unlocks a 65.5-point accuracy jump without retraining a single parameter.
- **[22:49] The L1/L2/L3 Cache Hierarchy via Persistent IPython REPLs:** Seth from Prime Intellect mapped agent memory onto computer architecture, explaining that "if we're at the L2 which is I could think at a means in between what the active context is and working with your file system you might have a live ripple which could just be running things directly in Python an IPython shell like you're in a Jupyter notebook and all of those variables are saved directly in your RAM your agent can then programmatically manipulate them and run all sorts of programs directly on the information there saving tons of tokens." Stuffing raw logs or datasets into the active prompt window (L1) triggers quadratic attention overhead and early compaction. Storing objects inside a live IPython kernel (L2) lets the model slice and filter data in RAM using short Python expressions.
- **[33:13] The USD 5,000 Cost-to-Performance Trap in Popular Harnesses:** Seth warned against adopting complex agent frameworks blindly, admitting that "a lot of the really popular harnesses don't necessarily do well when prime agent does well so like for air agent we spent a lot of money very quickly and we had to cut it off because I spent like $5,000 without making much performance." Unbounded multi-agent loops and naive retry prompts burn millions of tokens when an agent gets stuck in a local failure state. Evaluating harnesses on cost-to-performance ratios matters just as much as peak pass rates.
- **[36:08] Ultra-Horizon Execution at 633 Agents and 23M Output Tokens:** Demonstrating multi-day autonomy, Seth reported that "we also streamed a 7-day factorial run which used a total of 633 agents across 23 million tok output tokens in order to make like steady tech technological advancement across the tech tree." Long-horizon tasks break standard single-session chat interfaces because context windows saturate within hours. Offloading subtasks to persistent daemon subagents that communicate via structured messages prevents the root orchestrator from stalling.
- **[52:09] Pulling the Agent Brain Out of the Sandbox into Postgres:** Explaining why YC retired its 50-VM fleet of Hermes agents for QM, Josh and Rean described "pulling the brain of the system up out of the sandbox so with you know with Hermes and with OpenClaw you effectively have the agent has its own computer which is super powerful but it's also trapped inside that computer... what we did instead is we just offload everything into Postgress so everything is centralized from all the agent conversations that people are having." Trapping agent state inside individual virtual machines turns fleet maintenance into manual SSH firefighting. Centralizing conversation state and permissions in Postgres turns sandboxes into disposable compute workers.

## 3. What Was Claimed vs. What Benchmarks Prove

The Paper Club speakers make a compelling case for stateful IPython harnesses, multi-day agent swarms, and local spec optimization. Cross-checking those claims against independent reproductions and production API economics reveals four hard constraints.

First, keeping session state in a persistent IPython kernel delivers dramatic token savings only on structured queries. In an [independent reproduction of Prime Agent](https://thakicloud.com/tech-blog/en/agentops/prime-agent-rlm-harness/), Thaki Cloud measured session history token consumption dropping from 321,458 tokens to 149 tokens when the model queried variables programmatically. However, the same reproduction found that savings shrink by a factor of twenty as soon as the model must inspect raw unstructured text directly, and debugging becomes harder because wrong regex or slice bounds hide silently behind kernel variables.

Second, peak ARC-AGI-3 scores mask extreme token burn and cost variance. In the [Kepler auditable world-models study on arXiv](https://arxiv.org/html/2610.00834v1), reaching 100.00 on the 25 public ARC-AGI-3 games with Claude Opus 5 consumed 858.0 million tokens across 8,256 environment actions, relying on a 97.37% prompt cache read rate and costing USD 777.72 at September 2026 API rates. Across public leaderboard entries within one point of each other, researchers documented a roughly 7x spread in dollar cost. Even Prime Intellect ships [Prime Agent's autonomous mode disabled by default](https://bmdpat.com/blog/prime-agent-arc-agi-didnt-install-2026), enforcing hard caps of 12 turns, 80,000 tokens, and 30 minutes behind mandatory exit gates.

Third, ultra-horizon output volume collides directly with frontier token pricing. Under [Anthropic's Claude Platform pricing](https://platform.claude.com/docs/en/about-claude/pricing), Claude Opus 5.5 costs USD 4 per million input tokens and USD 20 per million output tokens (while Sonnet 5.5 costs USD 2 input and USD 10 output). Generating 23 million output tokens in a 7-day swarm run costs USD 460 in output tokens alone on Opus 5.5 before counting input prefills or cache writes, proving why unguarded agent loops can burn thousands of dollars overnight.

Fourth, automated self-improvement loops still break without human review. Both the YC QM team and Stanford's [OpenJarvis project](https://www.alphaxiv.org/@herumb-shandilya) noted failure modes when agents judge or rewrite their own trajectories. YC observed LLM-as-judge loops suffering from narrow local fixes that miss global system context, while OpenJarvis found that prompt-only tuning closes just 5 percentage points of the local-cloud gap unless paired with structured search across engine, model, and memory primitives.

## 4. What This Changes for Applied Engineers

- **Promote large tool outputs into an L2 Python kernel:** Stop pasting megabytes of CSV rows, JSON payloads, or log files into your prompt history. Store intermediate artifacts as variables inside an isolated IPython sandbox so the model inspects shapes, slices, and summaries via short code snippets.
- **Enforce hard runtime caps outside the system prompt:** Never rely on polite prompt instructions to stop runaway agent loops. Configure hard turn limits, token ceilings, and wall-clock timeouts in your execution harness code (mirroring Prime Agent's 12-turn and 80,000-token autonomous defaults).
- **Separate persistent state from ephemeral execution containers:** Store conversation logs, skill definitions, and permission rules in a central database like Postgres or version-controlled storage, treating Docker containers and microVMs strictly as stateless compute workers.
- **Measure cost-conditioned accuracy alongside pass rates:** Report cached input tokens, uncached input tokens, output tokens, and total API dollars next to every eval score so a 2% benchmark gain does not hide a 7x cost regression.

## Sources

- [Why The Harness Matters More Than The Model | YC Paper Club](https://www.youtube.com/watch?v=n9xKblqyQ28) : Primary session with YC, Prime Intellect, and Stanford Hazy Research, including timestamps and verbatim quotes
- [Reproducing Prime Agent's RLM Harness](https://thakicloud.com/tech-blog/en/agentops/prime-agent-rlm-harness/) : Independent token reduction measurement (321,458 to 149 tokens) and raw-text failure analysis
- [Kepler: Auditable World Models for ARC-AGI-3](https://arxiv.org/html/2610.00834v1) : Token ledger (858.0M tokens, 97.37% cache reads, USD 777.72) and 7x cost spread across top ARC-AGI-3 harnesses
- [Prime Agent Review: 95.5% on ARC-AGI-3](https://bmdpat.com/blog/prime-agent-arc-agi-didnt-install-2026) : Autonomous mode default runtime caps (12 turns, 80,000 tokens, 30 minutes)
- [Pricing - Claude Platform Docs](https://platform.claude.com/docs/en/about-claude/pricing) : Official Claude Opus 5.5 and Sonnet 5.5 input/output token rates

<!--
Artwork brief — from the writer routine. Draw per docs/ARTWORK.md,
then delete this comment.

- Argument in one sentence: A central Postgres state store feeds three isolated memory tiers (L1 context, L2 IPython RAM, L3 disk) while an unguarded loop breaks its budget gate.
- Geometry: Three horizontal memory strata bars stacked inside a clean outer frame, linked by vertical data buses to a central orchestrator ring and a detached sandbox block.
- Accent: hanko
- Deliberate imperfection: A severed budget gate line and an offset cinnabar seal beside the L2 RAM tier, marking where runaway token loops get cut off.
-->
