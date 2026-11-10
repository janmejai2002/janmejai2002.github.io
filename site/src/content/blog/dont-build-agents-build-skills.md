---
title: 'Why Anthropic Abandoned Custom Agents to Build Executable Skills'
description: 'Anthropic creators Barry Zhang and Mahesh Murag argue code is all agents need. Discover how progressive skill folders replace bloated tool schemas.'
pubDate: 2026-11-09
track: talks
question: 'Why is Anthropic replacing custom agent scaffolding with file-based skills?'
keywords:
  - Anthropic agent skills
  - progressive disclosure AI
  - Claude Code skill architecture
  - Model Context Protocol vs skills
  - agent context window optimization
heroImage: '../../assets/art/dont-build-agents-build-skills-light.webp'
heroImageDark: '../../assets/art/dont-build-agents-build-skills-dark.webp'
heroAlt: 'Geometric schematic showing a central circular model core surrounded by orbital skill nodes and Cartesian coordinate ticks with an offset cinnabar stamp accent.'
readingTime: '5 min read'
notionId: '413ced67-050a-8115-ae51-ca1cc1669719'
---
<div class="tldr">

## Executive TL;DR

- Anthropic engineers Barry Zhang and Mahesh Murag revealed that domain-specific agent architectures are obsolete because code execution across bash and a file system provides a universal interface.
- Traditional JSON tool definitions congest the context window permanently on every turn, whereas progressive disclosure loads metadata first (<50 tokens) and defers procedural instructions until execution time.
- Field measurements show static tool definitions consume 15% to 30% of an agent's context budget before execution starts, creating prompt prefill penalties on every API roundtrip.
- Re-generating code on the fly causes non-deterministic drift, but packaging executable Python scripts inside skill directories cuts repetitive token generation and standardizes output formatting.
- While file-based skills protect attention budgets, un-cached runtime file reads trigger prompt cache misses, requiring engineers to place skill content behind static prefix breakpoints to retain 90% caching discounts.

</div>

## What is the core argument?

The AI industry assumes that deploying agents across distinct enterprise domains requires bespoke runtime scaffolding, custom prompt graphs, and domain-specific tool definitions. Anthropic challenges this paradigm by showing that a general-purpose model coupled with a bash shell and a file system replaces specialized agent frameworks entirely. If this thesis holds true, engineering teams will stop building standalone agent wrappers and instead package domain expertise into version-controlled directory trees containing procedural markdown and reusable scripts.

## What were the five key moments in the talk?

- **[01:13] The Collapse of Domain-Specific Scaffolding:** Barry Zhang asserted that "that paradigm is a tighter coupling between the model and a runtime environment put simply we think code is all we need." Early agent systems fragmented into bespoke orchestrators for coding, research, and data processing. THEREFORE, Anthropic discovered that running a general model over bash and a file system eliminates the need for distinct agent architectures across different business verticals.
- **[03:36] The Context Poisoning of Traditional Tool Schemas:** Zhang highlighted the structural flaw in current tool patterns, noting that "traditional tools have pretty obvious problems... they always live in the context window." Injecting dozens of OpenAPI definitions floods the model's working memory with static schemas that sit idle during 95% of operational steps. THEREFORE, Anthropic abandoned in-context schema declarations in favor of file-system skills that load procedural knowledge only on demand.
- **[04:21] Progressive Disclosure as Context Protection:** Zhang explained the runtime loading mechanism, stating that "we want to protect the context window so that we can fit in hundreds of skills and make them truly composable that's why skills are progressively disclosed at runtime." Loading only high-level YAML frontmatter into system prompts preserves context budgets for active reasoning. BUT when an agent identifies a relevant workflow, it pulls the full directory instructions into memory to complete the task.
- **[08:14] The Functional Split Between Transport and Procedural Expertise:** Mahesh Murag delineated the boundaries between protocols and knowledge, emphasizing that "MCP is providing the connection to the outside world while skills are providing the expertise." Model Context Protocol establishes standardized client-server transport to databases and third-party APIs. BUT transport layers lack operational taste, so skills package the organizational heuristics and validation scripts required to orchestrate those raw connections correctly.
- **[13:25] File-System Artifacts as Transferable Machine Memory:** Zhang defined continuous agent learning through file persistence, observing that "anything that cloud writes down can be used efficiently by a future version of itself this makes the learning actually transferable." Multi-turn chat memory vanishes once a session closes, creating cold-start overhead for recurring corporate workflows. THEREFORE, allowing an agent to write tested utility scripts and procedural guidelines into version-controlled folders creates persistent, shareable institutional knowledge across engineering teams.

## What was claimed, and what do benchmarks actually prove?

The speakers argue that pairing a general model with bash and file-system skills renders complex agent scaffolding unnecessary, but production hardware constraints reveal critical operational trade-offs.

First, autoregressive decoding remains strictly memory-bandwidth bound. On an NVIDIA H100 GPU with 3.35 TB/s of HBM3 memory bandwidth, single-batch inference processes tokens at an arithmetic intensity of roughly 1 FLOP per byte, sitting far below the 989 TFLOP tensor core saturation threshold. Replacing structured tool calls with multi-turn bash execution cycles introduces sequential prefill-decode loops. If an agent executes 12 shell operations to inspect files and run diagnostic commands, the system repeatedly restarts the prefill phase, multiplying latency across roundtrips.

Second, dynamic procedural file retrieval risks destroying prompt cache efficiency. Modern inference providers like Anthropic and vLLM offer up to 90% cost discounts and 80% latency reductions when prompt prefixes match cached KV states at 1,024-token boundaries. Ingesting arbitrary file contents and unpredictable terminal stdout streams into turn history alters the prompt prefix. When an agent reads unpinned skill files mid-dialogue, the KV cache breaks, causing Time-to-First-Token (TTFT) to spike from 350ms back up to 2,400ms on a 50k-token prompt.

Third, container execution environments impose non-trivial latency floors. Running untrusted model code requires sandboxed isolation via microVMs such as Firecracker or lightweight containers like gVisor. Each bash execution cycle incurs 40ms to 200ms of process fork and IPC overhead. For workflows requiring rapid sub-second interaction, shell execution introduces latency penalties that dedicated native function calls avoid.

## What does this change for applied engineers?

- **Purge static tool declarations from system prompts:** Audit your agent's initial prompt payload tomorrow morning and remove large OpenAPI JSON schemas. Replace them with a single shell execution tool and a concise text registry listing skill names and one-line descriptions, reducing baseline prompt token consumption by up to 80%.
- **Implement a two-phase progressive activation gate:** Modify your agent harness to expose only top-level skill metadata during initial task routing. Program the runner to fetch the full procedural markdown file into active context only after the model explicitly emits an activation command.
- **Convert repetitive model generation loops into static scripts:** Identify workflows where your agent repeatedly generates identical data transformation or formatting code. Direct the model or your developers to write that logic into a deterministic Python script inside the skill directory, eliminating generative drift and saving thousands of output tokens per run.
- **Pin prompt caching breakpoints ahead of file ingestion:** Position dynamic skill file reads and tool outputs strictly after your static system instructions and pinned conversation history. This guarantees that your core instruction prefix remains untouched in the KV cache across multi-turn sessions.

## Sources

- [Anthropic — Building Effective Agents and Progressive Disclosure Architecture](https://www.anthropic.com/research/building-effective-agents)
- [Model Context Protocol Specification](https://modelcontextprotocol.io)
- [Claude Code — Agent Architecture and Skills System](https://docs.anthropic.com/en/docs/agents-and-tools/claude-code)

