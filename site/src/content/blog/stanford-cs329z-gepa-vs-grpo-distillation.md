---
title: 'Why GEPA Prompt Evolution Beats GRPO With 35x Fewer Rollouts'
description: 'Stanford CS329Z Lecture 9 compares GEPA, GRPO, and on-policy distillation: 35x fewer rollouts, 1,800 vs. 17,920 GPU hours, and when to tune weights.'
pubDate: 2026-11-18
publishedAt: '2026-11-18T07:51:41.084Z'
track: talks
question: 'When should AI teams optimize prompts with GEPA instead of running GRPO or on-policy distillation?'
heroImage: '../../assets/art/stanford-cs329z-gepa-vs-grpo-distillation-light.webp'
heroImageDark: '../../assets/art/stanford-cs329z-gepa-vs-grpo-distillation-dark.webp'
heroAlt: 'Geometric Pareto staircase diagram showing three winning prompt nodes above a dominated node marked by a broken vertical budget line and an offset cinnabar seal.'
readingTime: '6 min read'
notionId: '41cced67-050a-8121-bad7-cd0aa669b475'
---
<div class="tldr">

## Executive TL;DR

- In Stanford CS329Z Lecture 9, DSPy researcher Michael Ryan framed context optimization as last-mile adaptation, showing why Pareto-based prompt evolution (GEPA) outperforms GRPO reinforcement learning by 6% on average with up to 35x fewer rollouts.
- PPO reinforcement learning requires keeping four models in GPU memory (policy, reference, value, and reward) and training two simultaneously, whereas GRPO drops the value model by scoring group rollouts via z-scores.
- On-policy distillation beats both off-policy SFT (55.0% on AIME'24) and RL (67.6% after 17,920 GPU hours), hitting 74.4% in 1,800 GPU hours by scoring student trajectories against teacher log-probabilities.
- Over-capable teachers can hurt small students: OpenThoughts-Agent researchers found that distilling from a frontier model directly into a 3B student degrades learning compared to matching teacher capacity closer to the student.
- Teams should run context optimization on closed API models and expensive environments, switching to weight optimization only when small models ignore prompts or context lengths exceed token budgets.

Most engineering teams treat prompt tuning and reinforcement learning as separate worlds: product engineers tweak system prompts by hand, while research teams fine-tune open weights with PPO or GRPO. In Stanford CS329Z Lecture 9, Michael Ryan (co-author of MIPROv2 and DSPy optimization lead) unified both under a single question: given fixed data, an agent system, and an evaluation metric, which optimization loop delivers the highest score per rollout?

Walking through OPRO, MIPROv2, TextGrad, GEPA, GRPO, and on-policy distillation, Ryan showed where natural-language reflection beats scalar policy gradients and where weight updates remain unavoidable.

</div>

## 1. The Core Argument in Three Sentences

The AI industry often assumes that prompt optimization is obsolete phrasing guesswork while reinforcement learning on weights is the only path to high-reliability agents. Stanford CS329Z Lecture 9 challenges that assumption by showing that reflective Pareto prompt evolution (GEPA) extracts richer learning signals from natural-language trajectories than scalar GRPO rewards, outperforming RL with up to 35x fewer environment rollouts. If this optimization hierarchy holds, applied AI teams will reserve GPU-heavy GRPO and on-policy distillation for small open-weight deployments and run reflective context optimization first on every API-backed agent.

## 2. Five Timestamped Inflection Points

- **[06:02] Context Optimization Is Last-Mile Adaptation:** Dismissing claims that smarter base models eliminate prompt optimization, Michael Ryan stated that "really the reason you want to use context optimization is that it's useful for last mile adaptation... at the end of the day when you're building a system that has to fit a specific purpose and solve a specific problem there's this last little bit of adaptation that needs to happen." General pre-training cannot anticipate proprietary ISO date formats or internal ticket schemas. Optimizing against a domain eval encodes hidden product intent directly into the system.
- **[54:54] Stronger Teachers Can Hurt Small Students in SFT:** Discussing the OpenThoughts-Agent distillation pipeline, Ryan warned against blindly picking the largest teacher model: "you shouldn't always use the best model as a teacher... if you're going to use GPD 5.6 to train like a 3B model that's not always the best because GPD 5.6 is so much more capable than that 3B model then you're going to have problems where the model is like not able to learn from it." Huge capability gaps produce reasoning jumps that small students cannot imitate. Matching teacher complexity closer to the student improves downstream convergence.
- **[01:02:02] PPO's Four-Model Memory Tax vs. GRPO:** Breaking down reinforcement learning memory footprints, Ryan noted that "there's some challenges with PO first of all there's four models to keep in memory... the reference model value model and policy model all have to be in memory and that gets kind of expensive also there's two models that you have to train at every step." At `[01:03:25]`, he contrasted GRPO: "first of all we have three models to keep in memory... we no longer need a value estimate and then only one model to train at every step and only the KL is per token everything else is at the whole output level." Eliminating the learned critic network cuts VRAM requirements and optimizer state in half during RL runs.
- **[01:14:37] On-Policy Distillation Beats Both SFT and RL:** Presenting Qwen3 and Thinking Machines Lab results, Ryan reported that "they find that you got like 55% accuracy on AM with reinforcement learning we can get up to 67% accuracy but with on policy distillation we get highest of 74% accuracy and it actually was way less expensive to do this we did it in fewer GPU hours." Off-policy SFT forces a student to memorize moves it would never reach on its own. Scoring the student's own rollouts per token against teacher log-probabilities delivers dense feedback without RL's sparse-reward variance.
- **[01:19:12] GEPA Outpaces GRPO When Rollouts Are Expensive:** Comparing context and weight loops at the end of the lecture, Ryan observed that "the Jeepa paper shows that prompt optimization can be more sample efficient than reinforcement learning... and the open thoughts agent paper shows you that over time weight optimization is data hungry but it can make use of a lot of examples." At `[01:19:37]`, he summarized the decision rule: use context optimization when "environment interactions are expensive if every roll out is super expensive you want something that's sample efficient."

## 3. What Was Claimed vs. What Benchmarks Prove

Ryan's lecture lays out a clean hierarchy between reflective prompt evolution, GRPO, and on-policy distillation. Cross-checking those claims against the published papers and GPU training ledgers exposes three critical boundaries.

First, GEPA's rollout efficiency holds, yet its evolutionary merge step is brittle on smaller open models. According to the [GEPA paper on arXiv](https://arxiv.org/abs/2507.19457), reflective Pareto evolution outperformed GRPO by 6% on average (and up to 20%) across six tasks while using up to 35x fewer rollouts (`24,000` GRPO rollouts in the baseline comparison), and beat MIPROv2 by over 10% (including +12% on AIME-2025). However, Section 5 of the [revised GEPA study](https://arxiv.org/html/2507.19457v2) explicitly documents that enabling `GEPA+Merge` caused performance degradation on Qwen3-8B when fixed hyperparameters triggered premature crossover before independent prompt lineages matured.

Second, on-policy distillation's 10x GPU-hour advantage requires white-box teacher weights. In [Thinking Machines Lab's on-policy distillation study](https://thinkingmachines.ai/blog/on-policy-distillation/) citing Table 21 of the [Qwen3 Technical Report](https://arxiv.org/html/2505.09388v1), off-policy SFT reached 55.0% on AIME'24, RL reached 67.6% after `17,920` GPU hours, and on-policy distillation reached 74.4% in `1,800` GPU hours (roughly 10x fewer GPU hours, and 9x to 18x cheaper than extrapolating off-policy SFT to 2 million prompts). Because reverse KL divergence requires per-token log-probabilities from the teacher over the student's rollout, teams cannot apply on-policy distillation using closed frontier APIs that hide full vocabulary logits.

Third, context optimization hits a serving-cost wall as prompts grow. Every reflective mutation in GEPA appends edge-case rules and formatting constraints to the system prompt. When those expanded prompts run across 40-turn agent loops, every turn resends the longer prefix, driving up input token bills and KV-cache occupancy unless teams periodically distill those prompt rules back into weights (the "BetterTogether" alternating loop Ryan highlighted).

## 4. What This Changes for Applied Engineers

- **Run GEPA before touching GPU training clusters:** If your agent relies on a frontier API model or an expensive sandbox environment, optimize your system prompt and tool instructions with reflective Pareto evolution first to capture fast gains within a few hundred rollouts.
- **Drop PPO for GRPO when training verifiable open-weight agents:** When you have unit tests or deterministic verifiers for a self-hosted model, use GRPO over PPO to eliminate the value network's VRAM and optimizer overhead.
- **Use on-policy distillation when distilling open weights:** If you have an open-weight teacher (like Qwen3-32B) and want to deploy a fast 8B student, score student rollouts with teacher log-probabilities instead of running blind off-policy SFT.
- **Pair BetterTogether loops to prevent prompt bloat:** Once GEPA-evolved instructions grow past your latency or token-cost budget, distill successful trajectories into student weights and re-run a light prompt pass on top.

## Sources

- [Optimizing AI Agents: Prompts vs. Weights (GEPA, GRPO) | Stanford CS329Z Lecture 9](https://www.youtube.com/watch?v=e_m99aR7_3Q) : Primary Stanford lecture by Michael Ryan with timestamps and verbatim quotes
- [GEPA: Reflective Prompt Evolution Can Outperform Reinforcement Learning](https://arxiv.org/html/2507.19457v2) : 35x fewer rollouts vs. GRPO, +12% on AIME-2025 vs. MIPROv2, and Qwen3-8B merge degradation caveat
- [On-Policy Distillation - Thinking Machines Lab](https://thinkingmachines.ai/blog/on-policy-distillation/) : AIME'24 benchmarks (55.0% SFT, 67.6% RL at 17,920 GPU hours, 74.4% OPD at 1,800 GPU hours)
- [Qwen3 Technical Report](https://arxiv.org/html/2505.09388v1) : Primary Table 21 GPU-hour and AIME'24/AIME'25 distillation benchmarks

<!--
Artwork brief — from the writer routine. Draw per docs/ARTWORK.md,
then delete this comment.

- Argument in one sentence: A Pareto staircase of evolved prompts climbs cleanly with minimal rollouts while a dense scalar gradient path stalls beneath a broken rollout budget line.
- Geometry: A clean two-axis chart frame with a stepped Pareto frontier staircase rising from bottom-left to top-right, three candidate nodes on the steps, and a lower horizontal RL baseline.
- Accent: hanko
- Deliberate imperfection: A severed vertical rollout budget line and an offset cinnabar seal beside the dominated candidate node below the Pareto frontier.
-->
