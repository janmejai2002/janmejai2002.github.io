---
title: 'Why OpenAI Turned the Codex Harness Into a Managed Agents API'
description: 'OpenAI DevDay 2026 explains how the Agents API separates the Codex harness from sandboxes, manages compaction, and hits three-nines durability.'
pubDate: 2026-11-22
publishedAt: '2026-11-22T13:36:36.026Z'
track: talks
question: 'What breaks when you move a local coding harness into a multi-hour cloud Agents API?'
heroImage: '../../assets/art/openai-agents-api-codex-harness-service-light.webp'
heroImageDark: '../../assets/art/openai-agents-api-codex-harness-service-dark.webp'
heroAlt: 'Minimal geometric schematic showing a cloud harness frame with turn-state bars on the left, a central vermilion sync checkpoint on a network bridge, and two decoupled remote sandbox containers on the right.'
readingTime: '5 min read'
notionId: '420ced67-050a-81dd-ac8b-c10c78ea5b91'
---
<div class="tldr">

## Executive TL;DR

- OpenAI engineers Steve Coffey and Charlie Guo trace the evolution from the retired Assistants API to the Responses API and the managed Agents API built on the Codex harness ([OpenAI DevDay 2026](http://www.youtube.com/watch?v=b7l_Dhe1h8M)).
- Decoupling the cloud harness from the execution sandbox lets teams bring their own containers or AWS Bedrock runtimes, at the cost of routing every shell command across a network boundary.
- Raw tool-call streams proved insufficient for production UIs, forcing OpenAI to expose explicit turn-level state so frontends could render multi-hour progress without rebuilding harness logic.
- Achieving 99.9 percent durability across multi-hour runs requires crash-safe checkpointing and idempotency checks when a connection drops mid-file-edit.
- Enabling parallel subagents multiplies token bills rapidly: production data shows multi-agent runs consume roughly 15x more tokens than chat interactions ([Augment Code](https://www.augmentcode.com/guides/multi-agent-cost-compounding)).

</div>

## 1. The Core Argument in Three Sentences

As frontier models shift from second-long tool calls to autonomous workflows spanning hours or days, most product teams want to define tools and data without operating distributed agent infrastructure themselves. OpenAI built the Agents API to expose the Codex harness as a managed service, decoupling cloud orchestration, turn-level observability, and context compaction from arbitrary local or hosted sandboxes. However, moving a local terminal loop into the cloud exposes hard distributed-systems constraints around 99.9 percent dependency reliability, mid-command network drops, and multi-agent token compounding.

## 2. Five Timestamped Inflection Points

### [00:04:31] Moving from DIY Harnesses to Harness-as-a-Service

In 2025, OpenAI shipped the local Agents SDK assuming developers wanted full control over their own orchestration loops. Coffey explains that enterprise teams kept asking OpenAI to operate the runtime itself while leaving tools and environments customizable:

> "this is the core idea behind the agents API a managed service built on the Codex harness you define the tools the data and the instructions you choose the environment that the agent works in and we run the harness and the services around it"

### [00:06:13] Decoupling the Cloud Harness from Remote Sandboxes

Codex originally ran locally on a developer laptop where reading or editing a file happened in-process. Moving that harness to the cloud while supporting customer-operated sandboxes meant every shell command had to traverse a session-isolated network link:

> "we needed to separate the harness from the environment where the commands actually run as developers you might want the harness to run in sandboxes you already operate or you might want us to operate the sandbox for you either way we needed a way for the harness working in the cloud to communicate with any arbitrary environment"

### [00:08:30] Why Raw Tool Logs Break Long-Running UIs

Initially, OpenAI streamed raw model responses and tool calls, expecting developers to assemble progress views themselves. Internal teams immediately hit a wall trying to group multi-hour activity into coherent user turns:

> "the team wanted to visualize the agents tool calls and responses by turns but our original API design didn't easily give them that information they could have tracked those relationships themselves but that meant rebuilding part of the harness that they'd come to us to manage"

### [00:10:25] Three Nines of Reliability Across Distributed Dependencies

Short request-response web services complete in under a second and tolerate occasional container restarts. Multi-hour agent sessions break that assumption because a server deploy or inference blip mid-run cannot discard an hour of stateful investigation:

> "all of this depends on other systems including model inference storage and the services that the tools call in order to have three nines of reliability all of these systems need to have the same reliability or better and if codeex crashes or we replace a server during deployment we need to be able to pick up exactly where we left off"

### [00:11:03] Idempotency When Sandbox Connections Drop Mid-Edit

Separating the harness from the execution container creates classic distributed-systems ambiguity whenever a network packet disappears. Coffey illustrates why blind retries corrupt state when a file edit is in flight:

> "suppose your agent wants to edit a file we send the command to the environment but then the connection drops what do we do did the file get edited or not receiving no result doesn't tell us whether the action happened but replaying the command might result in a bad outcome too"

## 3. What Was Claimed vs. What Benchmarks Prove

Coffey and Guo frame the Agents API as the top layer of OpenAI's stack, and official platform documentation confirms the architectural transition. OpenAI deprecated and retired the legacy Assistants API on August 26, 2026, directing teams to the Responses API and server-side `/responses/compact` workflows ([Assistants Migration Guide](https://developers.openai.com/api/docs/assistants/migration); [Compaction Docs](https://developers.openai.com/api/docs/guides/compaction)). The managed Agents API builds on that foundation, exposing Codex orchestration and server-side compaction as a single hosted session ([Introducing the Agents API](https://openai.com/index/introducing-the-agents-api/)).

Where the talk glosses over quantitative cost, external benchmarks reveal sharp economic and reliability trade-offs. In the airline rebooking demo at [00:14:24], Guo enables multi-agent mode with concurrent subagents and briefly notes that higher concurrency incurs higher token usage. Industry measurements show how steep that multiplier is: Anthropic's engineering team found that single agents consume roughly 4x more tokens than chat interactions, while multi-agent systems consume roughly 15x more tokens, with token volume explaining 80 percent of performance variance on BrowseComp ([Augment Code](https://www.augmentcode.com/guides/multi-agent-cost-compounding)). McKinsey's 2026 agentic economics analysis similarly reports that multi-step coding agents can consume up to 1,000x more tokens than single-turn code reasoning, with roughly 60 percent of total cost spent on checking and repairing outputs ([McKinsey](https://www.mckinsey.com/capabilities/quantumblack/our-insights/is-that-ai-agent-worth-it-agentic-economics-and-the-modern-operating-model)).

Coffey's warning at [00:10:25] about achieving three nines of reliability also holds under compounding math. If a five-step agent pipeline depends on components running at 99, 98, 97, 99, and 96 percent reliability, end-to-end success drops to 89.5 percent without durable state recovery ([MindStudio](https://www.mindstudio.ai/blog/reliability-compounding-problem-ai-agent-stacks)). Offloading session checkpointing and compaction to a managed harness solves crash recovery, yet teams still pay the latency and token tax of remote sandbox round-trips and parallel subagent fan-out.

## 4. What This Changes for Applied Engineers

1. **Pair probabilistic agent proposals with deterministic verification.** In the DevDay demo, the agent outputs structured JSON options alongside a Python script that deterministically checks seating and arrival constraints. Always require a final programmatic validator before surfacing high-stakes actions for human approval.
1. **Design sandbox tool calls to be idempotent.** Because network drops between a cloud harness and a remote container leave command outcomes ambiguous, pass deterministic request IDs or use atomic compare-and-swap file patches so retries never apply an edit twice.
1. **Cap subagent concurrency to control 15x token blowups.** Treat `max_concurrent` subagents as a strict cost dial. Fan out parallel subagents only on genuinely independent lookups where latency matters more than paying multi-agent coordination overhead.
1. **Consume turn-level events instead of raw token streams.** Build product UIs around structured turn boundaries and explicit human-in-the-loop hold states so users can audit or steer multi-hour runs without parsing raw JSON tool payloads.

## Sources

- [Harness-as-a-Service: Building with the Agents API | DevDay 2026](http://www.youtube.com/watch?v=b7l_Dhe1h8M)
- [Introducing the Agents API - OpenAI](https://openai.com/index/introducing-the-agents-api/)
- [Assistants Migration Guide & Compaction - OpenAI API](https://developers.openai.com/api/docs/assistants/migration)
- [Multi-Agent Cost Compounding: Why 3 Agents Cost 10x - Augment Code](https://www.augmentcode.com/guides/multi-agent-cost-compounding)
- [Is That AI Agent Worth It? Agentic Economics - McKinsey](https://www.mckinsey.com/capabilities/quantumblack/our-insights/is-that-ai-agent-worth-it-agentic-economics-and-the-modern-operating-model)
- [What Is the Reliability Compounding Problem in AI Agent Stacks? - MindStudio](https://www.mindstudio.ai/blog/reliability-compounding-problem-ai-agent-stacks)

<!--
Artwork brief — from the writer routine. Draw per docs/ARTWORK.md,
then delete this comment.

Minimal geometric diagram on warm paper: on the left, a solid-bordered cloud harness frame holds stacked turn-state bars and a vermilion hanko checkpoint square; a thin horizontal bridge with a central vermilion sync node crosses to two stacked remote sandbox containers on the right, illustrating decoupled execution and idempotent state recovery. No text, no labels, strict paper, ink, border, and hanko palette.
-->
