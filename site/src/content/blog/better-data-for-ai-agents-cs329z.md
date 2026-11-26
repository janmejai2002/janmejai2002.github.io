---
title: 'Why 5K Filtered Agent Tasks Beat 8K Unfiltered: CS329Z Lecture 11'
description: 'Stanford CS329Z Lecture 11 shows why filtering out 86% of unscreened RL tasks, masking noisy SFT actions, and auditing rollouts beat naive data scaling.'
pubDate: 2026-11-26
publishedAt: '2026-11-26T13:36:43.229Z'
track: talks
question: 'Which agent tasks and trajectories actually produce learning signal instead of burning Docker compute?'
heroImage: '../../assets/art/better-data-for-ai-agents-cs329z-light.webp'
heroImageDark: '../../assets/art/better-data-for-ai-agents-cs329z-dark.webp'
heroAlt: 'Minimal geometric schematic of nine rollout columns from 0/8 to 8/8, with dashed zero-gradient outer bars and solid inner bars framed by a vermilion hanko Goldilocks bracket.'
readingTime: '5 min read'
notionId: '424ced67-050a-8167-9144-ccc5c6fcdcc0'
---
<div class="tldr">

## Executive TL;DR

- Stanford lecturer John Yang explains why generating millions of agent tasks is now cheap while selecting valid, learnable, unhacked training data is the real bottleneck ([Stanford CS329Z Lecture 11](http://www.youtube.com/watch?v=y2cwbmOy12U)).
- Filtering strictly for successful teacher trajectories collapses repository diversity: on SWE-smith's 128 repositories, success-only sampling trains on only 40 repositories.
- Unscreened RL task pools waste most rollout compute because 72.7 percent of tasks are never solved and 13.4 percent are always solved, leaving just 13.9 percent with non-zero GRPO gradients ([CS329Z Slides](https://web.stanford.edu/class/cs329z/slides/lecture12.pdf)).
- Automated trajectory monitoring slashes reward-hacking rates from 28.57 percent to 0.56 percent while lifting clean benchmark resolution from 40.22 percent to 60.53 percent.
- Meta FAIR's 3 million agent trajectories across 10,200 Docker images highlight the infrastructure stakes, burning an estimated 3 to 4.5 million Docker-hours on verification alone ([arXiv 2510.02387](https://arxiv.org/html/2510.02387v1)).

</div>

## 1. The Core Argument in Three Sentences

Generating synthetic agent environments and rollouts is no longer the binding constraint in post-training; deciding which tasks and trajectory segments carry clean gradient signal is. Naive scaling wastes Docker compute on underspecified specs, flaky tests, and zero-gradient RL tasks while allowing reward hacks and success-biased sampling to skew model behavior. Teams get higher downstream performance from smaller, audited pools by filtering tasks for learnability, masking noisy actions during fine-tuning, and keeping strict air gaps between synthetic task generators and held-out test repositories.

## 2. Five Timestamped Inflection Points

### [00:07:15] Why Filtering to Successful Trajectories Biases Training

Meta FAIR's Code World Models pipeline produced 3 million agent trajectories across thousands of Docker images, raising an immediate curation question. Yang explains why keeping only passing rollouts distorts the training distribution toward easy problems:

> "what they find is that if you just select tasks that correspond to success on the task or select trajectories that correspond to success on the task you'll actually end up bi biasing the trajectory distribution to whatever the teacher model can solve right and by virtue of that you might miss actually some interesting failed trajectories"

### [00:12:30] Success-Only Filtering Collapses Repository Coverage

That bias shows up sharply when sampling across diverse codebases. Using the SWE-smith benchmark he co-authored, Yang demonstrates how naive rejection sampling throws away over two-thirds of repository diversity:

> "if you just bias by trajectory success um Swissmith is a data set that um was created across 128 repositories if you just bias by success you'll actually only train on 40 of those repositories"

### [00:31:27] The Goldilocks Window for RL Gradient Signal

In group-relative reinforcement learning such as GRPO, tasks that a model solves zero times or every single time yield zero advantage signal. Yang defines the narrow pass-rate band that justifies running expensive containerized rollouts:

> "what makes this task worthwhile in terms of producing learning signal is this phenomenon where the model solves more than one but less than all uh of the task on every roll out Let me rephrase Basically on eight rollouts here you want tasks where the model succeeds at least once but no more than seven times"

### [00:48:22] Air-Gapping Synthetic Task Generators from Test Repos

Self-evolving curricula let models synthesize harder tasks whenever existing environments saturate. Answering a student question on WebRL contamination, Yang warns that automated generators can leak held-out test patterns unless engineers enforce hard repository boundaries:

> "from a research execution perspective this boundary of making sure your test set doesn't contaminate or distill or make its way into the training in this weird ways ultimately this is like a human effort so it's responsible to the practitioner in terms of the science I think it's really really good to make sure that you have some clean sort of air gaps between like um you know what your test set look like and then like your train set"

### [01:00:30] Action-Level Masking Inside SFT Trajectories

Even passing trajectories contain wasted `ls` loops, syntax mistakes, and formatting recovery steps that teach bad habits under next-action imitation. Citing SWE-Prime, Yang highlights masking loss at the action level so models imitate only high-signal edits:

> "beyond instead of sftting on the whole thing we're going to take a look at the trajectories and we're going to decide to only mask out the actions that we think are high quality and that we care about And so what they show here in practice is that like you can train on way fewer trajectories and even from those trajectories way fewer actions"

## 3. What Was Claimed vs. What Benchmarks Prove

Published papers and the official CS329Z deck back up Yang's central claim that data curation beats raw rollout volume. In SWE-bench Verified, human review flagged 38.3 percent of tasks for underspecified problem statements and 61.1 percent for unfair unit tests, removing 68.3 percent of the original 2,294 tasks ([CS329Z Slides](https://web.stanford.edu/class/cs329z/slides/lecture12.pdf)). Automating those checks in Xiaomi's CodeMidas pipeline allowed 5,000 filtered tasks to outperform 8,000 unfiltered tasks across SWE-bench Pro, DeepSWE, and internal evals by 0.59, 4.59, and 4.49 points respectively, with even a 3,000-task subset beating the 8,000-task baseline.

The compute economics of container verification explain why that filtering matters. Meta FAIR's Code World Models paper confirms gathering 3 million trajectories from 10,200 Docker images across 3,150 repositories ([arXiv 2510.02387](https://arxiv.org/html/2510.02387v1)). Independent analysis estimates that running 2 to 3 verification passes per trajectory consumes 180 to 270 million Docker-minutes, or 3 to 4.5 million Docker-hours, making verification the dominant infrastructure bill ([Devansh on Medium](https://machine-learning-made-simple.medium.com/dissecting-meta-ais-revolutionary-code-world-models-6ad469a7421d)).

Filtering for RL learnability and exploit-free rollouts produces similarly steep gains. On LEGO-RL, 72.7 percent of unscreened tasks were never solved and 13.4 percent were always solved, leaving just 13.9 percent with active gradient signal ([CS329Z Slides](https://web.stanford.edu/class/cs329z/slides/lecture12.pdf)). Meanwhile, WebRL's self-evolving curriculum lifted Llama-3.1-8B from 4.8 percent to 42.4 percent on WebArena-Lite, and Qwen's trajectory-monitoring filter cut reward-hacked resolve rates from 28.57 percent to 0.56 percent while raising clean performance from 40.22 percent to 60.53 percent.

## 4. What This Changes for Applied Engineers

1. **Run a 4x flakiness and starter-state gate before training.** Execute every reference solution four times to drop non-deterministic tests, verify that the unpatched container fails, and audit error-message assertions against the prompt spec.
1. **Recurated RL batches every N steps around the 1-to-7 pass band.** Drop tasks scoring `0/8` or `8/8` on current checkpoints to avoid zero-gradient batches, and re-evaluate held-out harder tasks periodically as policy capability improves.
1. **Mask spurious recovery steps and recast negative trajectories.** Strip syntax-error recovery turns from SFT loss via action masking, and prepend explicit failure warnings to negative rollouts when teacher budgets limit positive samples.
1. **Monitor rollouts with an LLM judge and air-gap test repos.** Flag git-history lookups, XML tampering, and test overfitting during training runs, and block synthetic task generators from accessing evaluation repositories.

## Sources

- [Better Data for AI Agents: Data Selection & Quality | Stanford CS329Z Lecture 11 with John Yang](http://www.youtube.com/watch?v=y2cwbmOy12U)
- [CS 329Z: Engineering AI Agents - Data Selection & Quality Slides](https://web.stanford.edu/class/cs329z/slides/lecture12.pdf)
- [CWM: An Open-Weights LLM for Research on Code Generation with World Models (arXiv 2510.02387)](https://arxiv.org/html/2510.02387v1)
- [Dissecting Meta AI's Code World Models - Docker Verification Economics](https://machine-learning-made-simple.medium.com/dissecting-meta-ais-revolutionary-code-world-models-6ad469a7421d)
- [SWE-smith: Scaling Data for Software Engineering Agents (arXiv 2504.21798)](https://arxiv.org/abs/2504.21798)

<!--
Artwork brief — from the writer routine. Draw per docs/ARTWORK.md,
then delete this comment.

Minimal geometric diagram on warm paper showing nine vertical rollout columns representing pass rates from 0/8 on the left to 8/8 on the right: the outer 0/8 and 8/8 columns are hollow dashed frames representing zero RL gradient signal, while the middle seven columns (1/8 through 7/8) are solid ink bars crowned by a vermilion hanko selection bracket marking the learnable Goldilocks window. No text, no labels, strict paper, ink, border, and hanko palette.
-->
