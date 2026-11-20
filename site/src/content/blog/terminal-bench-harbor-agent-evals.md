---
title: 'Why Agent Evals Break Without Separate Verifiers: Terminal-Bench'
description: 'Terminal-Bench logged 7 million trials across 89 tasks, showing why separate verifier containers and task versioning stop reward hacking.'
pubDate: 2026-11-20
publishedAt: '2026-11-20T14:21:44.515Z'
track: talks
question: 'Why do single-container agent benchmarks fail, and how does Harbor isolate verification?'
heroImage: '../../assets/art/terminal-bench-harbor-agent-evals-light.webp'
heroImageDark: '../../assets/art/terminal-bench-harbor-agent-evals-dark.webp'
heroAlt: 'Architectural schematic showing a dashed agent container torn down on the left, an immutable artifact block transferred across a thin bridge, and a solid verifier container sealed with a vermilion hanko square on the right.'
readingTime: '6 min read'
notionId: '41eced67-050a-818c-a5cd-eba521f92c8c'
---
<div class="tldr">

## Executive TL;DR

- Terminal-Bench has been run over 7 million times by 171+ open-source contributors and appears on roughly 60 frontier model cards, making it one of the most widely used agentic coding benchmarks ([Stanford CS329Z Lecture](https://www.youtube.com/watch?v=7GW-9ug2nvw)).
- Creators Alex Shaw and Ryan Marten argue that software engineering is shifting from deductive rules to inductive evaluation, where outputs replace source code as the primary source of truth.
- Harbor runs agent trajectories inside one container, tears that container down completely, and ships only the resulting artifact to a separate verifier container so lingering background processes cannot manipulate grading.
- Semantic versioning for benchmark tasks lets teams patch a broken verifier or reward hack and regrade saved agent trials without re-running expensive inference rollouts.
- Independent research confirms that release-time auditing is insufficient on its own: Terminal-Bench 2.0 accumulated over 50 task defect reports within months of launch ([arXiv 2611.08417](https://arxiv.org/html/2611.08417v1)).

</div>

## 1. The Core Argument in Three Sentences

Software engineering is transitioning from deductive rule-writing to inductive evaluation, where an agent's terminal outputs serve as the empirical source of truth. Because language models interact with computers most efficiently through plain text in bash, rigorous agent evaluation requires realistic containerized tasks that align instructions with tamper-proof verifiers. The Harbor framework solves the hardest infrastructure bottlenecks in this workflow by isolating agent execution from grading containers and applying semantic versioning to benchmark tasks so old trajectories can be regraded cheaply.

## 2. Five Timestamped Inflection Points

### [00:11:20] Software Development Shifts from Deductive to Inductive

Shaw opens by framing agentic coding as an empirical machine learning discipline where generated artifacts are evaluated by behavior instead of line-by-line human inspection. He quotes François Chollet's view on treating generated code as a blackbox artifact and notes how this flips traditional engineering workflows:

> "fundamentally built on this belief that all digital technology development is slowly going to become inductive"

At [00:12:44] and [00:13:52], Shaw extends this thesis directly to verification:

> "agentic coding is a form of machine learning generated code is best treated as a blackbox artifact whose behavior and generalization should be managed via empirical evaluation like with any ML model"

> "outputs become the source of truth"

### [00:17:52] Bash Is the One Tool to Rule Them All

Early agent benchmarks fragmented around custom IDE plugins, specialized file-editing APIs, and brittle function schemas. Terminal-Bench strips the harness down to a single shared interface because text-in, text-out models map natively to a Unix shell:

> "the insight for terminal bench really boils down to a very very simple thing which is bash is the one tool to rule them all so bash is a very efficient way with interacting with a computer language models take text as input and output and the terminal is just text based"

### [00:30:28] Why Single Agent Tasks Cost Thousands of Dollars

Writing a valid agentic benchmark task is far harder than writing a unit test for a single function. Marten explains why frontier labs pay steep rates per task to get instruction alignment, realism, and anti-cheat guarantees right:

> "companies get paid thousands of dollars or tens of thousands of dollars to do this correctly for a single task so the three main hard things to do in writing agent tasks are aligning the instruction in the verifier and preventing reward hacking... and then making the task realistic fair and interesting"

### [00:40:43] Separate-Verifier Containers Stop Process-Level Reward Hacking

When an agent and a grader share the same container, a clever model can leave behind a background daemon, modify a test binary, or intercept a port before grading begins. Harbor eliminates this attack surface by physically tearing down the execution environment before running tests:

> "when we run tasks through harbor you can specify your tasks to be run in this separate verifier mode where the agent operates in one container and then it does its work and the work is collected in an artifact... and then the agent container is torn down so every everything in the agent container is killed and then a separate verifier container is spun up and the artifact is uploaded there where tests run so the agent cannot leave any processes running in the container that would mess with the verifier"

### [00:52:44] Semantic Versioning Avoids Re-Running Expensive Agent Trials

Fixing a subtle bug in a benchmark test suite normally forces teams to discard prior leaderboard runs and pay for fresh inference across every model. Harbor introduces semantic versioning at the task level, distinguishing verifier patches from environment or instruction changes:

> "we've also devised this versioning system which is semantic versioning for tasks based off of changes you made in it so let's say you figure out there's an issue in the verifier from some run that you've done on the benchmark then you could go in and you could just update the verifier and patch a reward hack and then you could take existing agent trials and then just regrade those without having to run the expensive part which is actually running the agents in the environment"

## 3. What Was Claimed vs. What Benchmarks Prove

Shaw and Marten position Terminal-Bench and Harbor as practical infrastructure built from lessons across 7 million runs, and independent literature supports their core diagnosis while highlighting ongoing maintenance costs. In the official Terminal-Bench 2.0 paper, the authors curate 89 hard computer-use tasks backed by human review, LM-assisted auditing, and exploit checks ([Terminal-Bench 2.0, arXiv 2601.11868](https://arxiv.org/abs/2601.11868)). Yet a November 2026 follow-up study found that within months of release, Terminal-Bench 2.0's issue trackers still accumulated over 50 open reports tagged as task defects, and several proposed community fixes merely relaxed regexes or broadened acceptance criteria instead of repairing the underlying oracle ([arXiv 2611.08417](https://arxiv.org/html/2611.08417v1)). This confirms Marten's point at [00:52:44] that benchmark tasks must be versioned and continuously patched like production software.

External engineering reports also validate the talk's warning about brittle graders skewing model leaderboards. In Anthropic's agent evaluation guide, which Marten references during the lecture, Opus 4.5 initially scored 42 percent on CORE-Bench due to rigid string matching that penalized `96.12` against an expected `96.124991...`, ambiguous specs, and non-deterministic tasks; once those grading bugs and harness constraints were fixed, the score jumped to 95 percent ([Anthropic Engineering](https://www.anthropic.com/research/demystifying-evals-for-ai-agents)). The same Anthropic guide notes that METR uncovered misconfigured time-horizon tasks that penalized models for following stated score thresholds while rewarding models that ignored instructions.

On the infrastructure side, Harbor's separate-verifier architecture is viable at scale because modern isolation primitives have shrunk startup overhead. While OS-level Docker containers start in single-digit milliseconds, they share a host kernel; hardware-virtualized Firecracker microVMs boot in roughly 125 milliseconds with under 5 MiB of memory overhead per instance and can launch at up to 150 microVMs per second on a single host ([Krova Cloud](https://krova.cloud/blog/firecracker-vs-docker-performance-benchmark-tradeoffs)). At 7 million trials, tearing down an agent sandbox and booting a clean verifier container adds negligible wall-clock latency compared to multi-turn LLM inference, while closing process-level exploits and serving directly as the rollout server format for reinforcement learning ([Stanford CS329Z Lecture](https://www.youtube.com/watch?v=7GW-9ug2nvw)).

## 4. What This Changes for Applied Engineers

1. **Standardize agent harnesses on a bash interface.** Skip building bespoke tool wrappers for every file edit or repository search. Give your agent a scoped bash shell inside an ephemeral container so model improvements transfer cleanly without rewriting custom tool schemas.
1. **Isolate grading from execution in CI.** Never run unit tests or rubric checks inside the same container where an autonomous coding agent operated. Export the diff or build artifact, destroy the agent container, and execute verification in a fresh, read-only environment.
1. **Version your evaluation tasks semantically.** Separate changes to task prompts and container images (major/minor bumps) from patches to verifier scripts (patch bumps). Store full agent trajectories and artifacts so you can regrade historical runs whenever you tighten a test against reward hacking.
1. **Budget for continuous eval maintenance.** Treat an evaluation suite as a living codebase that requires ongoing defect triage. Audit failing and passing transcripts regularly, as Anthropic recommends, to catch ambiguous instructions and overly strict graders before they distort model selection.

## Sources

- [Terminal-Bench: Evaluating AI Agents | Stanford CS329Z Guest Lecture with Alex Shaw & Ryan Marten](https://www.youtube.com/watch?v=7GW-9ug2nvw)
- [Terminal-Bench: Benchmarking Agents on Hard, Realistic Tasks in Computer Environments (arXiv 2601.11868)](https://arxiv.org/abs/2601.11868)
- [Terminal-Bench and the Case for Continuous Benchmarks (arXiv 2611.08417)](https://arxiv.org/html/2611.08417v1)
- [Demystifying evals for AI agents - Anthropic](https://www.anthropic.com/research/demystifying-evals-for-ai-agents)
- [Firecracker vs Docker Performance: Benchmark & Tradeoffs - Krova Cloud](https://krova.cloud/blog/firecracker-vs-docker-performance-benchmark-tradeoffs)

<!--
Artwork brief — from the writer routine. Draw per docs/ARTWORK.md,
then delete this comment.

Two architectural containment frames sit side by side on warm paper: on the left, a dashed agent sandbox frame is crossed out by a sharp diagonal teardown line; on the right, a solid verifier container receives a clean geometric artifact block across a thin horizontal transfer bridge, sealed by an offset vermilion hanko square. No text, no labels, strict minimal ink and hanko palette.
-->
