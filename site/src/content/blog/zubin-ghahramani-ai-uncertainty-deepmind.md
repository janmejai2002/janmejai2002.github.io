---
title: 'Zubin Ghahramani: Why AI Needs to Doubt Itself'
description: 'DeepMind''s Zubin Ghahramani says true AI needs uncertainty, not just confident answers. What his 30-year case holds up and what doesn''t.'
pubDate: 2026-09-02
track: talks
question: 'Can an AI that never says ''I don''t know'' ever be trusted?'
keywords:
  - Zubin Ghahramani
  - Google DeepMind
  - AI uncertainty
  - Bayesian AI
  - aleatoric uncertainty
  - adversarial examples
  - AGI
  - large language models
heroImage: '../../assets/art/zubin-ghahramani-ai-uncertainty-deepmind-light.webp'
heroImageDark: '../../assets/art/zubin-ghahramani-ai-uncertainty-deepmind-dark.webp'
heroAlt: 'A regular grid of 9 by 5 small ink circles on a paper ground. One position in the grid is not filled in — it is drawn only as a dashed outlined circle in a single accent colour.'
readingTime: '5 min read'
notionId: '3cfced67-050a-81f7-bcb6-edf8283cfb74'
---
<div class="tldr">

## Executive TL;DR

- Ghahramani's core claim: no decision-making system — bacterium, animal, robot — can be intelligent without representing and updating uncertainty, because perception is always incomplete.
- He splits "not knowing" into two flavors: coin-flip randomness (which way a pedestrian turns) and situations the system has never seen before (a horse jumping out during a hailstorm) — only the second, he argues, should make a self-driving car slow down.
- The sharpest point isn't about not-knowing, it's about wrongly-knowing: an image of a school bus with a few pixels altered gets classified "99% cheetah" by a neural net, used to argue that correctness and confidence are separate problems.
- He extends the same critique to today's LLMs, saying they'll "confidently give you an answer" and then "flip-flop" when questioned — a real, familiar behavior, offered here as anecdote rather than measured data.
- His origin story checks out against the public record on timing: a 1986 summer job reading the Parallel Distributed Processing volumes the same year the backpropagation paper landed, followed by a 1989 undergraduate thesis parsing language with neural nets.
- What's missing from this excerpt: no concrete numbers on how any of this gets operationalized in a shipped model — the transcript itself cuts off mid-sentence before the conversation gets there.

</div>

## "You can't have an intelligent system that doesn't make decisions" (opening thesis)

Ghahramani states his "central thesis" almost immediately: intelligence requires decision-making, and decision-making under real-world perception — which is always incomplete — requires representing uncertainty. He traces this "from bacteria to animals to humans to robots," treating uncertainty-representation as a near-universal requirement for intelligence, regardless of substrate. What holds up: it's a coherent, decades-old framing that has organized real work in Bayesian machine learning and robotics — this is literally the research program he's spent 30 years on. What's asserted rather than argued: the jump from "decision-making needs uncertainty" to "therefore probability theory is the correct formalism" is delivered as settled ("we can boil it all down to probabilities") rather than defended against alternative approaches to robustness.

## Coin-flip uncertainty vs. never-seen-it-before uncertainty

Using a self-driving car, he separates two problems. One is pure randomness — "which way is the pedestrian going to turn" — where more data won't help because the outcome is genuinely unpredictable (he calls it "aliotauric" uncertainty, almost certainly a transcription mangling of the standard term "aleatoric"). The other is novelty: a hailstorm scenario, or a horse "suddenly jumping in front of the car," that the training data never covered. His prescription: a system with genuine uncertainty-awareness should slow down when it recognizes unfamiliar territory. This is a textbook-accurate description of the aleatoric-versus-epistemic distinction, even though he never names the second term on air. What it doesn't establish: whether any deployed self-driving system actually does this reliably — the example stays hypothetical ("it would basically decide to slow down"), with no company, dataset, or real incident cited.

## A bit is literally defined as cutting your uncertainty in half

The most quietly precise claim in the conversation is an information-theory aside: "a bit of information... is the reduction of your uncertainty by a factor of two. That's what a bit is." That's a correct restatement of Shannon's definition, and unlike the bigger claims elsewhere, it's checkable against the definition itself — it checks out.

## The jaguar in the leaves: bad at probability, good at surviving

Trained in cognitive science alongside computer science, Ghahramani argues human perception is itself probabilistic inference running unconsciously: hiking in Costa Rica, hearing a rustle, combining sensory input with a prior — "there are jaguars in Costa Rica, or there wouldn't be jaguars in the middle of London." He claims people are bad at explicit probability estimation ("they might get it wrong by orders of magnitude") while perceptual systems are comparatively well-calibrated because "our survival depends on them." This tracks with the general shape of heuristics-and-biases research, but no specific study is named in the clip, so "orders of magnitude" reads as illustrative language rather than a sourced figure.

## 99% cheetah: wrong versus confidently wrong

This is the strongest, most concrete passage in the talk. Take a school-bus image, "modify just a few pixels... in an imperceptible way," and a neural network confidently mislabels it: "That's a cheetah. 99% that's a cheetah." His point isn't that the model was wrong — models are wrong constantly — it's that it was wrong with near-total confidence: "We don't want systems that can be overconfidently wrong." He extends this directly to large language models, which he says will confidently answer and then "flip-flop" once challenged. The adversarial-example description matches a well-documented class of findings in machine learning research from the 2010s onward. The specific "99%" figure, though, is delivered as spoken illustration, not attributed to a named paper or dataset — treat it as indicative rather than a benchmark number. The LLM flip-flopping claim is even softer: familiar to anyone who's used a chatbot, but offered without a measurement, transcript excerpt, or named model.

## The teenager who read PDP for a summer job

Ghahramani's biography lands with more verifiable texture than his arguments do. He says he wanted to work in AI at 14 or 15, then in 1986 landed a University of Pennsylvania summer job under computational linguist Aravind Joshi, assigned to read the two-volume Parallel Distributed Processing books — "the same year that the backpropagation paper had come out." That timing matches the well-documented history of connectionism: the Rumelhart-Hinton-Williams backpropagation paper and the PDP volumes both appeared in 1986. He describes the field's dominant paradigm then as brittle, rule-based "expert systems" being displaced by neural networks that could "learn from data." By 1989, he says, he'd written an undergraduate thesis parsing natural language with neural nets — joking it would have counted as an early "small language model" paper had he published it. These are specific, dated claims about a documented period in AI history, which gives them more grounding than most of the episode's abstract arguments receive.

## What this excerpt doesn't tell us

The supplied transcript cuts off mid-sentence, mid-anecdote about early parallel computing hardware, before reaching the part that would matter most for judging the "uncertainty is the missing piece of AGI" thesis: how, concretely, any of this gets built into a shipped system, at what computational cost, and with what measured calibration numbers. Every technical claim here is explanatory or anecdotal rather than benchmarked — there's no accuracy figure, no calibration score, no named model whose uncertainty estimates were actually tested on air. That's not a flaw in Ghahramani's underlying research record, which spans decades of published Bayesian ML work; it's simply outside what this particular clip covers.

## Sources

- Google DeepMind, "The Podcast" — interview with Zubin Ghahramani (professor, University of Cambridge; co-lead of frontier AI, Google DeepMind), transcript as supplied for this piece. Note: the transcript's automatic speaker labeling renders his name as "Zuben Garammani," an evident transcription error for Zubin Ghahramani.
- No independent sources were consulted for this draft; per protocol, only the supplied transcript was available in this pass. Figures such as "99%" and "orders of magnitude" are quoted as spoken and have not been cross-checked against any named paper or dataset.

<!--
Artwork brief — from the writer routine. Draw per docs/ARTWORK.md,
then delete this comment.

Argument in one sentence: an AI that answers with total confidence in every situation is more dangerous than one that knows when to hesitate. Geometry: a single circle rendered slightly off-round, with one segment of its line broken into a dotted, uncertain arc instead of solid — order interrupted by an honest gap. Accent hanko: small red stamped square bearing a stylized question mark in place of a character. Deliberate imperfection: the dotted arc should not close cleanly against the solid line — leave a visible, asymmetric seam where they meet.
-->
