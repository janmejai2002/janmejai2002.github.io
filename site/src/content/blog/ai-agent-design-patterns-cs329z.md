---
title: 'AI Agent Design Patterns: Why 4 Tools and Block Masking Beat Bloat'
description: 'Stanford CS329Z Lecture 6 shows why CodeAct beats JSON tool loops, why observation masking must happen in blocks to save KV caches, and why Pi uses 4 tools.'
pubDate: 2026-11-28
publishedAt: '2026-11-28T14:36:57.364Z'
track: talks
question: 'Which agent design patterns actually improve reliability, and when does context trimming backfire on KV caches?'
heroImage: '../../assets/art/ai-agent-design-patterns-cs329z-light.webp'
heroImageDark: '../../assets/art/ai-agent-design-patterns-cs329z-dark.webp'
heroAlt: 'Minimal geometric schematic showing four solid tool blocks inside a tight central harness frame with a vermilion hanko core, surrounded by four dashed outer frames of omitted scaffolding.'
readingTime: '5 min read'
notionId: '426ced67-050a-818e-925b-de8629ae2e42'
---
<div class="tldr">

## Executive TL;DR

- Stanford lecturer Michael Ryan separates deterministic workflows from LLM-directed agents by where control flow lives, then maps five reusable workflow patterns from Anthropic's taxonomy ([Stanford CS329Z Lecture 6](http://www.youtube.com/watch?v=JC_pLC5EX_w)).
- Unverified self-reflection prompting degrades accuracy on GSM8K and CommonsenseQA; self-correction only helps when paired with external tool feedback or native reasoning traces ([arXiv 2310.01798](https://arxiv.org/html/2310.01798v2)).
- Replacing turn-by-turn JSON tool calls with executable Python (`CodeAct`) improves success rates by up to 20 percent while cutting turn counts ([arXiv 2402.01030](https://arxiv.org/abs/2402.01030)).
- Simple observation masking matches LLM summarization at half the raw token cost ([arXiv 2508.21433](https://arxiv.org/abs/2508.21433)), yet must run in 5-to-10-turn blocks to avoid breaking prompt caches ([Nadir](https://getnadir.com/blog/mask-dont-summarize-agent-context-cache-cost/)).
- Minimalist harness `Pi` ships with only four default tools (`read`, `write`, `edit`, `bash`) and ranked second on Terminal-Bench with Claude Opus, showing strong models need less scaffolding ([Superteams.ai](https://www.superteams.ai/glossary/pi-harness/)).

</div>

## 1. The Core Argument in Three Sentences

Production agent engineering is a sequence of control-flow, action-format, and context-management trade-offs where added complexity often hurts both latency and accuracy. Workflows keep orchestration in deterministic code for predictable tasks, while true agents hand control to the model using ReAct reasoning, executable `CodeAct` programs, and external verifiers. Once histories grow long, simple block-wise observation masking, immutable event logs, and minimalist four-tool harnesses like `Pi` outperform heavy summarization and bloated scaffolding on capable models.

## 2. Five Timestamped Inflection Points

### [00:05:25] Workflows vs. Agents Is a Control-Flow Decision

Teams routinely label every multi-step LLM pipeline an agent, obscuring the real architectural boundary. Ryan draws a crisp line between deterministic code orchestration and model-directed loops:

> "the control flow for a workflow lies in the code whereas for the uh agent it lies within the LLM to decide what tools to call what to do next"

### [00:41:24] Why Unverified Self-Reflection Degrades Capable Models

Prompting an LLM to critique its own output looks cheap, yet it fails without an external ground-truth signal. Citing the classic ICLR self-correction study, Ryan warns against adding reflection loops without unit tests or search tools:

> "on both GSM8K which is a math test uh and common sense QA which is a sort of common sense reasoning question answering benchmark they find that with capable models and when you set your baselines correctly u both cases it made the models actually worse when you did this self-reflection"

### [00:46:46] CodeAct Beats JSON Tool-Call Ping-Pong

Standard JSON function calling forces a full LLM round-trip for every loop iteration or array comparison. Ryan contrasts that overhead with `CodeAct`, which lets the model compose multiple tools inside a single script:

> "the our argument in this codeact paper is a better way is to just generate code as your actions and set your tools as functions that you can call in the environment"

### [01:06:15] Observation Masking vs. KV Cache Invalidation

Because tool outputs dominate coding-agent token budgets, truncating old observations cuts raw prompt length dramatically. However, Ryan flags a critical systems trade-off when modifying earlier turns mid-session:

> "this is like a challenge with the KV cache because now every time you're changing the input to the model you're invalidating the KV cache so there's system trade-offs to be made and maybe you decide I'm only going to cut the observations every 10 conversation turns or every five conversation turns"

### [01:16:14] Best Models Need Simple Harnesses

Closing with a case study of `Pi`, a minimalist coding harness lacking subagents, plan mode, and permission popups, Ryan explains why stripped-down tooling wins on frontier checkpoints while weaker models still need guardrails:

> "that's true i think that harness like the best models need a very simple harness but bad models need better harnesses so this is like a trade-off you could you could uh test for"

## 3. What Was Claimed vs. What Benchmarks Prove

Peer-reviewed benchmarks confirm Ryan's core claims while exposing subtle caching traps. On action representation, the `CodeAct` study (`arXiv 2402.01030`) evaluated 17 LLMs on API-Bank and M3ToolEval, proving executable Python code actions outperform JSON and text alternatives by up to 20 percent higher success rates in fewer turns ([arXiv 2402.01030](https://arxiv.org/abs/2402.01030)). Similarly, the self-correction paper (`arXiv 2310.01798`) confirms that intrinsic self-critique without oracle labels or external verifiers consistently underperforms single-pass baselines on GSM8K and CommonsenseQA ([arXiv 2310.01798](https://arxiv.org/html/2310.01798v2)).

Workflow composition studies show a similar trade-off between added structure and token spend. In the lecture, Ryan walks through Stanford's STORM article-writing pipeline (composing orchestrator-workers, parallelization, and evaluator-optimizer loops) and the Archon architecture-search framework, noting that automated workflow search only beats single-pass reasoning baselines once the system scales past a minimum inference token budget.

On context management, JetBrains Research's *The Complexity Trap* (`arXiv 2508.21433`) evaluated SWE-agent on SWE-bench Verified across five model configurations and found that simple observation masking halves raw token cost while matching or slightly exceeding LLM summarization, with a hybrid approach trimming another 7 to 11 percent ([arXiv 2508.21433](https://arxiv.org/abs/2508.21433)). Separating the underlying append-only event stream (as OpenHands does) from the rendered prompt view lets engineers truncate old tool outputs cleanly without losing auditability. Yet a November 2026 cost simulation factoring in 90 percent prompt-cache read discounts proved Ryan's KV-cache caveat at [01:06:15]: masking observations on every turn destroys prefix cache hits and costs 2.6x more than keeping raw history over 40 turns, whereas applying masks in periodic blocks ties or beats raw context ([Nadir](https://getnadir.com/blog/mask-dont-summarize-agent-context-cache-cost/)).

Finally, Ryan's `Pi` case study is corroborated by public documentation and Terminal-Bench results: created by Mario Zechner, `@mariozechner/pi-coding-agent` exposes only four built-in tools (`read`, `write`, `edit`, `bash`) with tree-structured event logs and still ranked second on Terminal-Bench using Claude Opus ([NPM](https://www.npmjs.com/package/@mariozechner/pi-coding-agent); [Superteams.ai](https://www.superteams.ai/glossary/pi-harness/)).

## 4. What This Changes for Applied Engineers

1. **Default to deterministic workflows before shipping an autonomous loop.** If a task's branching structure is known ahead of time, wire prompt chaining, parallelization, or routing in plain code for reproducibility and cheaper debugging.
1. **Use `CodeAct` or `bash` instead of multi-turn JSON schemas.** Let models emit executable Python or shell scripts that loop over tool functions locally, cutting inference round-trips and token latency.
1. **Mask observations in 5-to-10-turn blocks, never every turn.** Store the full history in an append-only event log, keep prompt prefixes byte-identical between compaction boundaries to preserve 90 percent KV-cache discounts, and truncate stale tool outputs only at block intervals.
1. **Strip default tools down and load skills on demand.** Start frontier models on four core file and shell primitives with progressive `SKILL.md` disclosure, adding heavier scaffolding only when ablations show a weaker model needs it.

## Sources

- [AI Agent Design Patterns: ReAct, CodeAct & More | Stanford CS329Z Lecture 6 with Michael Ryan](http://www.youtube.com/watch?v=JC_pLC5EX_w)
- [The Complexity Trap: Simple Observation Masking Is as Efficient as LLM Summarization (arXiv 2508.21433)](https://arxiv.org/abs/2508.21433)
- [Mask Late, Not Often: Observation Masking and Prompt Cache Costs - Nadir](https://getnadir.com/blog/mask-dont-summarize-agent-context-cache-cost/)
- [Executable Code Actions Elicit Better LLM Agents (CodeAct, arXiv 2402.01030)](https://arxiv.org/abs/2402.01030)
- [Large Language Models Cannot Self-Correct Reasoning Yet (arXiv 2310.01798)](https://arxiv.org/html/2310.01798v2)
- [Pi Coding Agent Harness - NPM & Superteams.ai](https://www.superteams.ai/glossary/pi-harness/)

<!--
Artwork brief — from the writer routine. Draw per docs/ARTWORK.md,
then delete this comment.

Minimal geometric diagram on warm paper showing a tight solid-bordered central square containing four equal ink tool blocks (representing read, write, edit, and bash) anchored by a vermilion hanko core dot; surrounding the central square are four outer dashed hollow frames (representing omitted subagents, plan mode, background daemons, and permission popups) illustrating minimalist harness design. No text, no labels, strict paper, ink, border, and hanko palette.
-->
