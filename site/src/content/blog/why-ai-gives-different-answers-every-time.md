---
title: 'Why the Same Question Gets You a Different Answer Every Time'
description: 'Same prompt, same settings, still a different answer. What temperature zero actually fixes, what it doesn''t, and the batching quirk underneath it all.'
pubDate: 2026-08-28
track: basics
question: 'Why does AI answer the same question differently each time, even with the randomness turned off?'
keywords:
  - why does AI give different answers
  - temperature 0 not deterministic
  - LLM non-determinism explained
  - what does temperature do in AI
  - is ChatGPT deterministic
  - batch invariance inference
  - reproducible AI output
heroImage: '../../assets/art/why-ai-gives-different-answers-every-time-light.webp'
heroImageDark: '../../assets/art/why-ai-gives-different-answers-every-time-dark.webp'
heroAlt: 'A regular grid of 10 by 5 small ink circles on a paper ground. One position in the grid is not filled in — it is drawn only as a dashed outlined circle in a single accent colour.'
readingTime: '8 min read'
notionId: '3caced67-050a-8135-9641-f248f1169fc2'
---
<div class="tldr">

## Executive TL;DR

- Two separate things make AI output vary: the random draw at the very end, which the "temperature" setting controls, and the arithmetic that runs before it. Setting temperature to zero removes only the first.
- Thinking Machines Lab sent one prompt through the Qwen3-235B model 1,000 times at temperature zero in September 2025 and got 80 different completions. The wording was identical for the first 102 tokens, then split: 992 answers continued with "Queens, New York", 8 with "New York City".
- The cause is not loose talk about "GPU randomness". Your request is processed in a batch with other users' requests; the batch size changes with how busy the server is; that changes the order in which numbers get added up; and floating-point addition is order-sensitive enough that a near-tie between two next words can flip.
- Bitwise-identical output is achievable but slower. In the same tests, a deterministic setup took 42 to 55 seconds against 26 for the standard one.
- A second, unrelated cause: providers revise a model's weights and serving stack without changing its name, so "the same model" this week may not match last month.
- If you genuinely need the same input to produce the same output — tests, evals, graded workflows, audits — the levers that work are caching answers, pinning a dated model version, and self-hosting on fixed hardware. The temperature slider is not one of them.

</div>

## The model is choosing the next word from a ranked list

A language model reads what you have written and produces a ranked list of candidates for the next chunk of text — a "token", usually a word or a piece of one. Each candidate gets a score. The model picks one, appends it, and repeats, one token at a time, until the answer is done.

The scores are where the behaviour lives. Often the top candidate sits far ahead of everything else and the choice is obvious. Sometimes two or three candidates are close together and the pick is nearly a coin toss.

A quick worked version. You type "The capital of France is". The model's ranked list puts "Paris" far above everything else, so any sensible setting returns "Paris" every time. Now you type "My favourite thing about Paris is". The top of the list might be "the", "its", "how", "walking", all bunched together. Which one surfaces depends on small differences in their scores, and those scores are the output of a very long chain of arithmetic.

## Temperature, in one paragraph

Temperature is the dial that sets how strictly the model sticks to its top-ranked candidate. Turn it up and the model is more willing to pick a lower-ranked option, which reads as more varied. Turn it down and it leans harder on the favourite. Set it to zero and, in most setups, the model is told to always take the single highest-scoring candidate — no sampling, no draw. This is often called "greedy" decoding.

If the ranked list were the same every time, greedy decoding would give you the same answer every time. That is the assumption that breaks.

## You set temperature to zero. The answer still moves.

Here is the experiment that makes it concrete. In September 2025, the research group Thinking Machines Lab ran one fixed prompt, "Tell me about Richard Feynman", through the Qwen3-235B model 1,000 times, all at temperature zero. Greedy decoding throughout. Same prompt, same settings, same model.

They got 80 distinct completions out of 1,000. Every run produced the same first 102 tokens. At token 103 they split: 992 runs went with "Queens, New York" and 8 went with "New York City", and from there the answers drift apart.

Temperature was zero the whole time. Nothing was being sampled. So what moved?

## The part most explanations skip: your request shares a batch with strangers

The usual answer is that floating-point maths on a GPU is non-deterministic because of concurrency. Thinking Machines argues that this is not quite right. Run the same matrix multiplication on the same numbers on the same GPU and you get, in their words, "bitwise equal results" every time. The hardware is not throwing dice.

The real mechanism is subtler. When you send a request to a hosted model, the server does not process it alone. It bundles your request with other users' requests into a batch and runs them together, because that is far more efficient. A busy inference server might hold tens or hundreds of requests in flight at once, and yours is somewhere in the pile. The number of requests in that batch — the "batch size" — depends on how many other people hit the same server in that moment.

And the maths the model does is not "batch-invariant". The exact sequence of additions inside operations like the attention step changes with the batch size. Floating-point addition is not perfectly associative: (a + b) + c can land on a slightly different value than a + (b + c), because each step rounds to a fixed number of digits. Usually that difference is far too small to matter. But when two next-word candidates are almost tied, a difference in the last decimal place is enough to swap which one wins. That swap cascades into a different sentence.

So the chain is: other people's traffic changes your batch size, batch size changes the order of the arithmetic, the arithmetic changes a near-tie, and a near-tie changes the answer. As the group puts it, "the primary reason nearly all LLM inference endpoints are nondeterministic is that the load (and thus batch-size) nondeterministically varies."

The same team published open-source "batch-invariant" versions of the key operations. With those in place, all 1,000 completions came out identical. It costs speed: their deterministic runs took 42 to 55 seconds, against 26 seconds for the standard configuration. Slower, but repeatable to the bit.

## The other reason: the model changed and nobody sent a memo

There is a second cause that feels the same from the outside and is completely separate. Providers update models in place. The name you call in the API — the same string you used last month — can point at revised weights, a new serving setup, or different default parameters.

OpenAI more or less says this in its own documentation. Its APIs are "non-deterministic by default". It offers a `seed` parameter that makes "a best effort to sample deterministically", with the stated caveat that "determinism is not guaranteed". And it ships a `system_fingerprint` value so you can tell when the backend has shifted under you, which it notes happens when "OpenAI updates numerical configuration of the infrastructure serving our models (which may happen a few times a year)."

If a model's answers seem to get better or worse overnight with no announcement, this is usually why. It is not the sampling. The thing you are calling is not quite the thing you were calling.

## When this matters, and when to stop worrying about it

For most everyday use, it does not matter. Drafting an email, brainstorming names, summarising a document, asking a factual question — "stable in meaning, not in wording" is fine. Two phrasings of the same correct answer cost you nothing.

It bites in a specific set of cases:

- **Automated tests and evaluations.** If a test asserts an exact output, drift makes it flap between pass and fail for no real reason.
- **Graded or answer-key workflows.** Anything comparing the model's output against a fixed expected string.
- **Audits and reproducible research.** When someone needs to run your prompt later and get what you got.
- **Regression checks.** Telling a genuine quality change apart from noise requires the noise to be controlled.

The levers that actually help, roughly in order of effort:

1. **Cache outputs.** Store the answer for a given input and reuse it. Removes the problem entirely for repeated inputs.
1. **Pin a dated model version.** The major APIs let you call a specific snapshot instead of the moving alias. Protects you from silent updates, not from batch variance.
1. **Design downstream logic to tolerate drift.** Compare meaning, not exact strings. Check that a number falls in a range rather than equals a value.
1. **Self-host a smaller model on fixed hardware**, with batch-invariant kernels if you need bitwise repeatability. Most control, most work, and the option least available to someone on a hosted API — which is the default for most developers and students in India and elsewhere.

## FAQ

**Is the model literally rolling dice?**

Only at the last step, and only if temperature is above zero. At temperature zero there is no dice roll at all, and the output can still vary for the batching reason above.

**Can I set a seed and get identical output?**

On some APIs you can set a seed, and it helps. The providers themselves describe it as best-effort, not a guarantee. On a shared hosted endpoint you cannot currently switch on true bitwise reproducibility as an end user.

**Why does the same prompt sometimes cost a different amount?**

Cost tracks the number of tokens in and out. If the answer comes out longer or shorter, the price moves with it. Same root cause: the output is not fixed.

**Is this a bug the vendors should fix?**

It is a deliberate trade. Batching is what makes hosted inference cheap and fast. Guaranteeing determinism means giving some of that back, and most users would rather keep the speed.

## The rule of thumb

Treat a hosted model's output as stable in substance and loose in wording, and build around that. If a workflow genuinely needs the same input to produce the same output every time, do not reach for the temperature slider. Reach for caching, a pinned model version, or your own hardware. The variation you were trying to switch off was mostly happening somewhere the switch does not reach.

## Sources

- [Thinking Machines Lab — "Defeating Nondeterminism in LLM Inference" (10 September 2025)](https://thinkingmachines.ai/blog/defeating-nondeterminism-in-llm-inference/)
- [thinking-machines-lab/batch_invariant_ops (GitHub)](https://github.com/thinking-machines-lab/batch_invariant_ops)
- [Simon Willison — "Defeating Nondeterminism in LLM Inference" (11 September 2025)](https://simonwillison.net/2025/Sep/11/defeating-nondeterminism/)
- [OpenAI — "Reproducible outputs with the seed parameter" (cookbook)](https://developers.openai.com/cookbook/examples/reproducible_outputs_with_the_seed_parameter)

<!--
Artwork brief — from the writer routine. Draw per docs/ARTWORK.md,
then delete this comment.

- **Argument in one sentence:** Identical inputs fan out into many slightly different outputs because the arithmetic underneath shifts with who else is on the server.
- **Geometry:** A single point on the left from which a tight bundle of horizontal hairlines runs rightward; the lines stay fused for most of their length, then splay into a small fan near the right edge. A faint vertical rule marks where the split begins.
- **Accent:** mizu — this is a systems-and-process story about how inference behaves, not a human or contested one.
- **The deliberate imperfection:** one hairline breaks from the bundle early, well before the vertical rule, drifting off alone — the rare run that diverged while the rest held.
-->
