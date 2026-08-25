---
title: 'The 95% Number Everyone Quotes Is Measuring Something Else'
description: "MIT didn't find that 95% of GenAI pilots failed technically. It found they showed no measurable P&L impact — mostly because nobody recorded a baseline."
pubDate: 2026-08-24
keywords:
  - AI pilot failure rate
  - MIT NANDA GenAI divide
  - context rot
  - AI project ROI measurement
  - production AI reliability
readingTime: '8 min read'
heroImage: '../../assets/art/the-95-percent-number-light.webp'
heroImageDark: '../../assets/art/the-95-percent-number-dark.webp'
heroAlt: 'A heavy circular arc covers almost all of a circle but stops just short of closing. At the centre, where an origin point would be, there is only a faint dashed cross and an empty dashed square. A measuring scale down the left side has its lowest mark faded almost to nothing.'
heroCaption: 'The arc is measured precisely. The centre it was measured from was never marked.'
---

<div class="tldr">

## Executive TL;DR

- MIT's Project NANDA studied ~300 deployments, 52 executive interviews and 153 survey responses. It reported that 95% of enterprise GenAI pilots showed **no measurable P&L return** — not that 95% of them technically failed.
- "No measurable impact" is largely an artefact of measurement: most pilots never recorded a pre-deployment baseline, so there was nothing to measure against six months later.
- Meanwhile the failure mode that *is* technical and *is* reproducible — degradation as context grows — has a controlled study behind it and almost none of the airtime.
- If you are diagnosing your own stalled pilot, the two questions are: did we write down a baseline, and did we test at the context length we actually run at?

</div>

There is a number you have seen roughly forty times this year. Ninety-five percent of enterprise GenAI pilots fail. It gets deployed as a punchline in vendor decks, as evidence of a bubble in newspaper columns, and as cover in engineering retros where a project quietly did not work out.

It is a real finding from a real study. It also does not say what almost everyone using it thinks it says, and the gap between the two is the most useful thing in the whole report.

## What the study actually measured

The source is [*The GenAI Divide: State of AI in Business 2025*](https://www.aigl.blog/state-of-ai-in-business-2025/), from MIT's Project NANDA. The methodology is not exotic: analysis of more than 300 public AI deployments, 52 structured executive interviews, and a survey of 153 leaders.

The headline finding is that 95% of those pilots produced **no measurable profit-and-loss return** within roughly six months of deployment.

Read that clause slowly, because three separate things are load-bearing.

*No measurable* — not "no return." Measurability is a property of your instrumentation, not of the system you instrumented.

*Profit-and-loss* — not user satisfaction, not cycle time, not defect rate. A specific financial surface that most internal tooling has never been asked to show up on.

*Within roughly six months* — a window shorter than the procurement cycle at many of the companies surveyed.

The report did not conclude that the models were bad. Its own diagnosis is a **learning and workflow gap**: tools that never actually entered the workflow they were bought to change, and that could not retain feedback or adapt to context once deployed. That is an organisational failure and an integration failure. It is not a statement about whether the model could do the task.

## Why "no measurable impact" is mostly a measurement problem

Here is the part that should be uncomfortable if you have shipped internal AI tooling.

Analyses of the methodology converge on the same observation: the "no measurable impact" result is [largely a function of pilots not having documented pre-deployment baselines](https://agentmodeai.com/the-mit-genai-pilot-failure-claim/), rather than pilots failing technically.

You cannot demonstrate that support resolution time dropped 20% if nobody wrote down what it was before. You cannot show a P&L delta from a tool that made forty analysts modestly faster, because that time was never a line item. The pilot may well have worked. It arrived at the review with no evidence, which under a P&L test is indistinguishable from not having worked.

This is not a subtle statistical caveat. It is the difference between two entirely different remediation plans:

<blockquote>
If your pilot failed technically, you change the model, the retrieval, or the scope. If your pilot failed to <em>register</em>, you change what you instrument — and no amount of model work will help.
</blockquote>

Most teams I have watched quote the 95% number then go do model work.

## The failure that is actually technical

The irony is that there *is* a rigorous, controlled, reproducible failure mode in production LLM systems. It gets a fraction of the attention, presumably because it does not fit in a headline.

In July 2025, Kelly Hong, Anton Troynikov and Jeff Huber at Chroma published [*Context Rot: How Increasing Input Tokens Impacts LLM Performance*](https://research.trychroma.com/context-rot). They evaluated 18 state-of-the-art models — GPT-4.1, Claude 4, Gemini 2.5, Qwen3 among them — and found that reliability degrades as input length grows, **even on trivial tasks** like retrieval and verbatim text replication.

The practical numbers matter more than the headline:

- A model advertising a 200K-token window can show serious accuracy loss by around 50K tokens of actual input.
- For 1M-token models, a clearly observable effect typically appears somewhere around 300,000–400,000 tokens.
- Degradation is not uniform. Needle–question similarity, the presence of distractors, and the structure of the surrounding haystack all change the curve.

That last point is the one that breaks evaluations. Performance does not decay smoothly with length; it decays as a function of length *interacting with* how confusable your distractors are. Which means a long-context benchmark can look fine while your actual workload — same token count, harder distractors — is quietly falling apart.

The stated context window is a memory-allocation ceiling. It is not a competence guarantee, and the industry has spent two years reading it as one.

## What this means if you are the one holding the stalled pilot

Two diagnostic questions, in this order.

**First: did we record a baseline?** Not "can we reconstruct one" — did somebody write down the metric before the tool shipped. If the answer is no, your pilot is currently unevaluable, and the honest move is to say so rather than to relitigate the model choice. Instrument first, then run a proper before-and-after. This is unglamorous and it is the single highest-leverage thing on the list.

**Second: did we test at the context length we actually run at?** Not the length in the demo. The length after six turns of conversation, three retrieved documents, a system prompt that has accreted eleven edge-case instructions, and whatever the previous tool call returned. If your evaluation runs at 8K and production runs at 60K, your evaluation is measuring a different system.

There is a third question that follows from the first two, and it is the one worth sitting with: **is the tool inside the workflow, or beside it?** The NANDA report's own framing is that pilots stalled because the tools never entered the workflow they were bought to change. A tool that requires someone to switch tabs, paste context, and copy the result back has not entered a workflow. It has been added to one.

## The useful reading

The 95% figure is not wrong. It is being used to argue something it does not support — that the technology underdelivers — when what it actually documents is that most organisations deployed without a control group and evaluated on a surface their tool was never positioned to move.

That is a considerably more actionable finding. It means the fix for most stalled pilots is not a better model. It is a baseline, a shorter context, and an honest look at whether anyone's actual working day changed.

The models are not the bottleneck as often as the discourse suggests. Measurement discipline usually is.

## Sources

- [*The GenAI Divide: State of AI in Business 2025*](https://www.aigl.blog/state-of-ai-in-business-2025/) — MIT Project NANDA
- [What the MIT GenAI pilot-failure claim actually measured](https://agentmodeai.com/the-mit-genai-pilot-failure-claim/)
- [MIT report: 95% of generative AI pilots at companies are failing](https://finance.yahoo.com/news/mit-report-95-generative-ai-105412686.html) — Fortune via Yahoo Finance
- Hong, K., Troynikov, A., Huber, J. — [*Context Rot: How Increasing Input Tokens Impacts LLM Performance*](https://research.trychroma.com/context-rot), Chroma Research, July 2025
- [Context Rot summary and LLMOps notes](https://www.zenml.io/llmops-database/context-rot-evaluating-llm-performance-degradation-with-increasing-input-tokens) — ZenML LLMOps Database
