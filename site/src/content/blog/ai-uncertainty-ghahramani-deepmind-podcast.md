---
title: 'AI''s Missing Ingredient: Knowing When It Doesn''t Know'
description: 'Google DeepMind''s Zoubin Ghahramani says reliable AI must represent its own uncertainty. What his podcast talk gets right, and where it leans on theory.'
pubDate: 2026-08-27
track: talks
question: 'What does DeepMind''s Zoubin Ghahramani think today''s AI still gets wrong about uncertainty, and why it matters?'
keywords:
  - AI uncertainty
  - Bayesian machine learning
  - Zoubin Ghahramani
  - LLM hallucinations
  - AI calibration
  - probabilistic AI
heroImage: '../../assets/art/ai-uncertainty-ghahramani-deepmind-podcast-light.webp'
heroImageDark: '../../assets/art/ai-uncertainty-ghahramani-deepmind-podcast-dark.webp'
heroAlt: 'A row of 9 identical upright rectangles standing like columns. One rectangle leans out of alignment and is drawn in a single accent colour; the rest are upright ink outlines.'
readingTime: '6 min read'
notionId: '3c9ced67-050a-8120-903a-d3cc4b2ecfd9'
---
<div class="tldr">

## Executive TL;DR

- **Zoubin Ghahramani** — a Cambridge professor who co-leads frontier AI research at Google DeepMind — argues that the core of intelligence is making decisions under uncertainty, and that today's models are still bad at representing their own.
- He separates two kinds of uncertainty: the world's inherent randomness (which way a pedestrian will step) and holes in the model's own knowledge (a scenario it never trained on). Only the second kind should make a system slow down and gather more information.
- Large language models are statistical at the token level, but carry no explicit, stable estimate of how much they believe any given statement. That, he says, is why they cave and reverse an answer the moment a user pushes back.
- Where DeepMind has engineered uncertainty in on purpose — its GenCast weather models, AlphaFold's colour-coded confidence — the systems became more useful, not more hesitant.
- A properly Bayesian learner would also, in principle, learn continuously without catastrophic forgetting and need far less data. The catch is that doing it exactly is computationally intractable, which is why the field walked away from it when brute-force training started paying off.
- Underneath it is a bet against pure scale: Ghahramani thinks trustworthy AI for medicine, driving and science needs new architecture for uncertainty, not just a bigger training run.

</div>

## Who's talking, and where

The talk is an episode of *Google DeepMind: The Podcast*, hosted by Hannah Fry, titled ["The mathematics of AI uncertainty"](https://www.youtube.com/watch?v=tBjgCj_dGZM) and published on 26 August 2026. It runs about 45 minutes. The guest, Zoubin Ghahramani, has worked in machine learning since the late 1980s, spent years collaborating with Geoffrey Hinton, and wrote a 2015 *Nature* review making the case for probabilistic methods. He is introduced here as a Cambridge professor and co-lead of frontier AI at Google DeepMind. The conversation is a two-hander: Fry is herself a mathematician sympathetic to the Bayesian view, so this is an argument being reinforced, not tested.

## The argument

**Two uncertainties, two responses (roughly the 3–6 minute mark).** Ghahramani's practical distinction is between randomness you cannot reduce (the pedestrian) and ignorance you can (the unseen scenario). A self-driving car that senses it is in an unfamiliar situation — his example is a hailstorm with a horse in the road — should slow down; one that treats its own ignorance as confident knowledge will not. He notes that all these forms of uncertainty collapse, mathematically, onto probabilities, and that acquiring "a bit" of information is by definition halving your uncertainty.

**Correctness is only half the target; confidence is the other half (around 9–11 minutes).** He revives the decade-old adversarial-example result: change a handful of pixels in a way no human would notice, and an image classifier will confidently relabel a bus as a completely different thing. The lesson he draws is that a system that is confidently wrong is worse than one that is uncertainly wrong, and that current systems can still be fooled this way.

**LLMs fake it (roughly 25–33 minutes).** Modern models do carry a probability distribution over the next token, and the entropy of that distribution says something about local uncertainty — the idea behind "semantic entropy," a hallucination-detection line of work from the group of his former student Yarin Gal. But Ghahramani argues this is still borrowing confidence from the training data rather than reasoning about the world. His analogy: you cannot build a real calculator by showing it examples of sums. "You don't want to fake a calculator. You want a calculator that actually calculates."

**It works when you build it in (roughly 34–39 minutes).** GenCast, DeepMind's diffusion-based weather model, produces an ensemble of forecasts rather than a single one, and updates that spread as new observations arrive — Bayesian updating in all but name. He cites its use in tracking Hurricane Melissa. AlphaFold similarly reports how sure it is about each part of a predicted structure. Adding honest uncertainty, in both cases, improved the result rather than weakening it.

**The catch (around 34–36 minutes, and again near the end).** The Bayesian ideal — hold a probability distribution over every possibility and update it with each data point — is where, in his words, "the magic trick comes with a big curse." Done exactly, it is NP-hard and impossibly slow, which is why the field set it aside once training from data started working. His bet is that today's compute plus decades of approximation techniques make it worth another look, and that the same machinery would deliver continual learning without catastrophic forgetting and better data efficiency as a bonus.

## What holds up, and what to watch

**The verifiable history checks out.** The 1986 *Parallel Distributed Processing* volumes and the Rumelhart–Hinton–Williams backpropagation paper did both appear in 1986. Hinton did win a Nobel Prize (Physics, 2024). Ghahramani's 2015 *Nature* paper is real, and its abstract does put representing and manipulating uncertainty about models and predictions at the centre of machine learning.

**GenCast's numbers are roughly as described.** DeepMind's December 2024 *Nature* paper reports a 15-day ensemble forecast of more than 50 members produced in about 8 minutes on a single TPU, against hours on a supercomputer, beating the European ECMWF ensemble on the large majority of targets. The Hurricane Melissa reference also holds: Melissa was a Category 5 landfall in Jamaica in October 2025, and DeepMind's weather models were used with the US National Hurricane Center to flag its rapid intensification days ahead. One caveat: DeepMind's current models are branded WeatherNext and WeatherNext 2, built on the GenCast architecture — Ghahramani uses the older name.

**The framing is one-sided by design.** This is a podcast built around a thesis, with a host who shares it. The "just add more data" camp is described but never given the floor, and Ghahramani concedes twice that scaling has worked and that its proponents "are not completely wrong." A talk is evidence of what a respected researcher believes; it is not evidence that the Bayesian route will pay off. His claim that these methods can deliver continual learning and data efficiency holds "in theory" — his words — plus his own in-progress work, which he admits is "not sort of super well-formed yet."

**"One of your students came up with semantic entropy" is loose.** Semantic entropy for hallucination detection was published in *Nature* in 2024 by a group at Oxford led by Yarin Gal, who did his PhD under Ghahramani at Cambridge. Ghahramani himself does not overclaim it; the host's phrasing compresses a chain of people into one.

**One detail not to repeat as fact:** the episode's captions render the guest's name and several technical terms imperfectly, and the casual "99% confident it's a cheetah" version of the adversarial-example story is a blend of results from that literature, not one canonical figure. The phenomenon is well established; the exact numbers in the retelling are not load-bearing.

## What it means for you

If you build with LLMs, the practical takeaway is to stop treating a model's stated confidence as a real signal. It will say "I'm certain" and then reverse under mild pressure, because there is no stable belief underneath the sentence. Where calibration matters — anything medical, financial or safety-related — you need external checks: consistency sampling, retrieval with grounding, semantic-entropy-style measures, or a human in the loop. Ghahramani's calibration test is a fair yardstick to hold vendors to: if a system says "70%" a hundred times, it should be right about seventy of them.

The larger point is a hedge for planners. If Ghahramani is right that reliability needs architectural work, then capability benchmarks are a poor guide to whether a model is safe to hand a consequential decision, and the gap between an impressive demo and something trustworthy in the long tail will not close on scale alone. If he is wrong, you have lost nothing by demanding calibration anyway.

> "I would rather have an AI system that knows when it doesn't know than an AI system that is arrogant and overconfident." — Zoubin Ghahramani

## Sources

- [The mathematics of AI uncertainty](https://www.youtube.com/watch?v=tBjgCj_dGZM) — *Google DeepMind: The Podcast*, 26 August 2026 (the talk itself)
- [Probabilistic machine learning and artificial intelligence](https://www.nature.com/articles/nature14541) — Zoubin Ghahramani, *Nature* 521, 2015
- [GenCast predicts weather and the risks of extreme conditions with state-of-the-art accuracy](https://deepmind.google/blog/gencast-predicts-weather-and-the-risks-of-extreme-conditions-with-sota-accuracy/) — Google DeepMind, December 2024
- [How WeatherNext helped the National Hurricane Center better predict Hurricane Melissa's landfall in Jamaica](https://deepmind.google/blog/how-weathernext-helped-the-national-hurricane-center-better-predict-hurricane-melissas-historic-landfall-in-jamaica/) — Google DeepMind, 2026
- [Detecting hallucinations in large language models using semantic entropy](https://ora.ox.ac.uk/objects/uuid:0653d09e-9368-4eb1-98bb-50d9dda7d3e5) — Farquhar, Kossen, Kuhn & Gal, *Nature* 2024
- [Learning representations by back-propagating errors](https://www.nature.com/articles/323533a0) — Rumelhart, Hinton & Williams, *Nature* 323, 1986
- [The Nobel Prize in Physics 2024](https://www.nobelprize.org/prizes/physics/2024/summary/) — Hopfield and Hinton, for foundational work on neural networks

<!--
Artwork brief — from the writer routine. Draw per docs/ARTWORK.md,
then delete this comment.

- **Argument in one sentence:** reliable AI needs to represent how much it does not know, not just produce confident answers.
- **Geometry:** one bold ink brushstroke that begins as a single crisp line on the left and frays into a fan of faint parallel paths toward the right — a single prediction opening into a spread of possibilities.
- **Accent:** hanko — a single red seal-stamp mark, placed off-centre near the frayed end of the stroke.
- **Deliberate imperfection:** the red stamp is slightly over-inked and rotated a few degrees off square, as if pressed by hand in a hurry.
-->
