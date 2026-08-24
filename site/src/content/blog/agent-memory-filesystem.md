---
title: "Your Agent's Memory Might Just Want to Be a Filesystem"
description: 'A UCLA benchmark put agent-memory designs head to head. The best pure-retrieval baseline scored 48.5%. A coding agent reading the raw files got 69.3%.'
pubDate: 2026-08-24
keywords:
  - AI agent memory
  - LongMemEval-V2
  - agent memory benchmark
  - vector store vs filesystem memory
  - agent memory architecture
readingTime: '9 min read'
heroImage: '../../assets/agent-memory-hero.png'
heroAlt: 'Two columns. On the left, a scattered cloud of dots labelled RETRIEVAL, marked 48.5% and 0.2 seconds a query. On the right, a tidy grid of nine file cards labelled THE FILES, marked 69.3% and about three minutes a query.'
heroCaption: 'Averages across the two tiers of LongMemEval-V2. The gap is real, and so is the three minutes.'
---

<div class="tldr">

## Executive TL;DR

- LongMemEval-V2 (UCLA, May 2026) asks a memory system 451 questions about web environments an agent has already worked in: layouts, workflows, recurring breakages.
- The best **pure-retrieval** configuration averaged **48.5%**. An off-the-shelf coding agent, handed the same trajectories as plain files and told to go look, averaged **69.3%**.
- The winner was neither: a coding agent given workflow docs, a manifest of what is stored where, and helper scripts, at **72.5%**.
- The catch is cost. Retrieval answers in a fifth of a second. The coding agent takes about three minutes.
- What separated them was consolidation, meaning reading the mess and writing down what is true about it, rather than looking the answer up.

</div>

Most agent builds hit the same wall. The agent is eight tool calls deep, it contradicts a constraint the user gave it at the start, and re-fetches something it already has. The reflex is to go shopping. You add a memory layer, you get embeddings and a vector store and a hot/warm/cold tier diagram, and it helps, somewhat, and you never really find out how much.

There is now a benchmark that tried to find out. Its answer is not the one the category is selling.

## What the benchmark actually asks

[LongMemEval-V2](https://arxiv.org/abs/2605.12493) came out of UCLA on 12 May 2026, from Di Wu, Zixiang Ji, Asmi Kawatkar, Bryan Kwan, Jia-Chen Gu, Nanyun Peng and Kai-Wei Chang. It is deliberately not a conversation benchmark. Where most memory evaluations ask whether a system remembers what a user said forty sessions ago, this one asks whether an agent has learned its way around a workplace.

The 451 questions split across five abilities, and the taxonomy is the most useful part of the paper even if you never run the eval:

- **Static state recall** — where things are in the interface.
- **Dynamic state tracking** — what changed because of something the agent did.
- **Workflow knowledge** — the steps for a task that gets done often.
- **Environment gotchas** — the thing that breaks every time, in the same way.
- **Premise awareness** — noticing that the request assumes something untrue.

Anyone who has onboarded a new engineer will recognise that list. It is roughly what someone knows after two months that they did not know on day one, and almost none of it is in the documentation.

The haystacks are large. Questions are paired with real trajectories harvested from WebArena (599 of them) and WorkArena/WorkArena++ (941), averaging 28.1 states each. The Small tier gives a system 100 shared trajectories, about 25 million tokens. The Medium tier gives 500 question-specific trajectories, about 115 million.

One number establishes that the questions are fair. A reader model with no memory access at all scores **1.3%**. Whatever is being tested here, it is not something the model already knew.

## The results, latency included

<figure class="diagram">
<svg viewBox="0 0 700 316" role="img" aria-labelledby="lme-title lme-desc">
  <title id="lme-title">Accuracy and latency by memory approach on LongMemEval-V2, Small tier</title>
  <desc id="lme-desc">Reader only, no retrieval: 1.3 percent, 0 seconds. RAG query to slice: 42.8 percent, 0.1 seconds. RAG query to slice plus notes: 51.0 percent, 0.2 seconds. AgentRunbook-R: 58.6 percent, 26.9 seconds. Codex coding agent: 69.9 percent, 177.2 seconds. AgentRunbook-C: 74.9 percent, 108.3 seconds.</desc>
  <g font-family="inherit" font-size="12.5" fill="currentColor">
    <g opacity="0.62">
      <text x="0" y="26">Reader only (no memory)</text>
      <text x="0" y="72">RAG: query to slice</text>
      <text x="0" y="118">RAG: query to slice + notes</text>
      <text x="0" y="164">AgentRunbook-R</text>
      <text x="0" y="210">Codex, off the shelf</text>
      <text x="0" y="256">AgentRunbook-C</text>
    </g>
    <g>
      <rect x="210" y="14" width="4" height="16" rx="2" fill="var(--ink-faint)"/>
      <rect x="210" y="60" width="128" height="16" rx="2" fill="var(--plum)"/>
      <rect x="210" y="106" width="153" height="16" rx="2" fill="var(--plum)"/>
      <rect x="210" y="152" width="176" height="16" rx="2" fill="var(--plum)"/>
      <rect x="210" y="198" width="210" height="16" rx="2" fill="var(--mizu)"/>
      <rect x="210" y="244" width="225" height="16" rx="2" fill="var(--mizu)"/>
    </g>
    <g font-weight="700">
      <text x="224" y="26">1.3%</text>
      <text x="348" y="72">42.8%</text>
      <text x="373" y="118">51.0%</text>
      <text x="396" y="164">58.6%</text>
      <text x="430" y="210">69.9%</text>
      <text x="445" y="256">74.9%</text>
    </g>
    <g opacity="0.5" text-anchor="end">
      <text x="700" y="26">0s</text>
      <text x="700" y="72">0.1s</text>
      <text x="700" y="118">0.2s</text>
      <text x="700" y="164">26.9s</text>
      <text x="700" y="210">177.2s</text>
      <text x="700" y="256">108.3s</text>
    </g>
    <g opacity="0.45" font-size="11">
      <text x="210" y="298">accuracy</text>
      <text x="700" y="298" text-anchor="end">seconds per query</text>
    </g>
  </g>
</svg>
<figcaption>LongMemEval-V2, Small tier. Purple is retrieval, teal is a coding agent over files. The paper's headline averages fold in the Medium tier, where every method loses a little ground.</figcaption>
</figure>

The Medium tier moves the numbers but not the ordering: retrieval-to-slice falls to 38.1%, AgentRunbook-R holds at 57.0%, and AgentRunbook-C lands at 70.1%. Average the tiers and you get the figures in the abstract: 48.5% for the strongest pure-retrieval baseline, 69.3% for the stock coding agent, 72.5% for the paper's own system.

Twenty points does not come back from prompt tuning. Both systems are reading the same 25 million tokens and doing something structurally different with them.

## Why the coding agent won

The obvious reading is *grep beats embeddings*. That reading gets the mechanism backwards.

AgentRunbook-C is not a coding agent pointed at a folder. It is a coding agent plus three pieces of scaffolding: workflow documents that tell it how to behave as a memory module, a query-time manifest describing what is stored where, and helper scripts exposing the trajectory-inspection operations it would otherwise have to reinvent per query. Strip those away and you get the Codex baseline — still 69.9%, still better than every retrieval configuration, but 5 points worse and 69 seconds slower per query. The scaffolding is not decoration. It bought both accuracy and time.

Look at what those three components are, though. Written procedures. An index of where things live. Shared utilities so nobody rediscovers the same technique. That is not a database. That is a team wiki and a `scripts/` directory.

The retrieval systems were not naive either. AgentRunbook-R builds three separate knowledge pools at insertion time — raw state slices, state-transition events, and procedure notes — and uses an LLM controller to write queries against them at read time. It scores 58.6%, comfortably ahead of plain dense retrieval. Structure helped. It just did not help as much as being able to open the file and follow a thread.

The distinction I keep coming back to is between **lookup** and **consolidation**. Retrieval finds the chunk most similar to your question. Consolidation reads a mess of trajectories and writes down what is true about the environment. When the question is "what is the workflow for this task", similarity to the question text is a weak proxy for the answer, because the answer was never stated anywhere — it has to be assembled from twelve separate runs that each did part of it.

## What this does not say

The paper does not say retrieval is obsolete, and neither do I.

Read the latency column again. AgentRunbook-C costs about 108 seconds and a sandbox per query. Plain retrieval costs 0.2 seconds. For an assistant in a chat box, 0.2 seconds at 51% may be strictly the better product than 108 seconds at 74.9%, because a user will not wait two minutes for a fact and no accuracy number rescues an experience nobody uses.

Three further limits are worth stating plainly:

- **The domain is narrow.** These are specialised web environments — WebArena and WorkArena. Environment expertise is exactly the shape of knowledge that consolidates well into documentation. Personal preferences scattered across a year of chat are a different shape, and this benchmark does not test them.
- **The ceiling is low, everywhere.** Hand the reader the answer-bearing trajectory directly and it still only manages 59.6%. Even with the right evidence in hand, reading long multimodal trajectories is hard. The authors say the obvious thing: substantial room for improvement remains.
- **Backbones matter.** The reader is Qwen3.5-9B; the coding agent runs on Codex with GPT-5.4-mini. A different pairing could move the gap. The paper reports one configuration honestly rather than a sweep.

## The leaderboards you have been reading are vendor leaderboards

Search for how to pick an agent memory layer and you get comparison guides, most of them published by one of the products being compared. The scores are usually real and the methodology is often documented. They are also self-reported by the party with an interest in the result.

[Mem0's own 2026 write-up](https://mem0.ai/blog/state-of-ai-agent-memory-2026) is a fair example, and a good one of its kind: 92.5 on LoCoMo, 94.4 on LongMemEval, with per-query token costs printed. Nothing there is hidden. But numbers in the low nineties on a vendor's page and 48.5% for retrieval on a university benchmark are not in contradiction. They answer different questions, and only one of those questions was asked by someone with nothing riding on the answer.

That is the practical takeaway from this whole exercise. A memory score is only meaningful next to the shape of the question. Conversational recall and environment expertise both get called "memory", and a system can be excellent at one while losing by twenty points at the other.

## What to do on Monday

Three things, in order of how cheap they are.

**Classify your workload before you shop.** Is the thing your agent forgets a *fact about a person*, or *how this system behaves*? Facts about people are recall, and retrieval is genuinely good at recall. How-this-system-behaves is experience, and the evidence says experience wants to be written down.

**Write the runbook by hand once.** Before buying a memory layer, take the ten transcripts where your agent failed and write the manifest and the workflow doc yourself. It is an afternoon. If a hand-written page of gotchas fixes most of the failures, you have learned that your problem was documentation, and you have already built the artefact the winning system generates automatically.

**Then measure on your own traffic.** Both LongMemEval-V2 and its predecessor are public, and neither is your product. Fifty real failures from your logs, graded by hand, will tell you more about which approach fits than any leaderboard, including this one.

The reason the coding agent won is not that files are magic. It is that somebody had to sit down and turn a pile of runs into knowledge, and consolidation happened to be a thing the coding agent could do and the retriever could not. If you do that work yourself, you get most of the benefit and none of the 108 seconds.

## Sources

- [LongMemEval-V2: Evaluating Long-Term Agent Memory Toward Experienced Colleagues](https://arxiv.org/abs/2605.12493) — Wu, Ji, Kawatkar, Kwan, Gu, Peng and Chang, arXiv:2605.12493, 12 May 2026. Abstract and headline averages.
- [LongMemEval-V2 project page](https://xiaowu0162.github.io/longmemeval-v2/) — the full per-tier results table, including latency.
- [LongMemEval-V2 paper, full text](https://arxiv.org/html/2605.12493v1) — benchmark construction, AgentRunbook-R and AgentRunbook-C components, backbone models, oracle setting.
- [The State of AI Agent Memory 2026](https://mem0.ai/blog/state-of-ai-agent-memory-2026) — Mem0. Cited as an example of vendor self-reported benchmarking.
- [LongMemEval-V2 repository](https://github.com/xiaowu0162/LongMemEval-V2) — official code and data.
