---
title: 'What AI Temperature Really Does (And Why Zero Isn''t Safe)'
description: 'Temperature controls how predictable an AI''s output is — but setting it to zero doesn''t guarantee the same answer twice. Here''s the mechanism, explained.'
pubDate: 2026-09-01
track: basics
question: 'What is the temperature setting, and does turning it to zero make AI predictable?'
keywords:
  - what is temperature in AI
  - LLM temperature explained
  - temperature zero determinism
  - AI randomness
heroImage: '../../assets/art/what-is-temperature-in-ai-light.webp'
heroImageDark: '../../assets/art/what-is-temperature-in-ai-dark.webp'
heroAlt: '4 concentric circles drawn in thin ink lines on a paper ground. The outermost circle is drawn in a single accent colour and does not close — it stops short, leaving a gap.'
readingTime: '4 min read'
notionId: '3ceced67-050a-81bd-a31a-f83afc2265b4'
---
<div class="tldr">

## Executive TL;DR

- Temperature is a dial that controls how much randomness a language model injects into its word-by-word predictions — [higher values produce more creative, varied phrasing; lower values stick to the most probable words](https://platform.claude.com/docs/en/about-claude/glossary).
- Setting temperature to 0 is supposed to be the "deterministic" option, but [Anthropic's own documentation admits identical inputs may still produce different outputs across API calls, even at temperature 0](https://platform.claude.com/docs/en/about-claude/glossary).
- That non-determinism isn't limited to Anthropic's servers — [the same caveat applies whether you're running the model through Anthropic's first-party service or a third-party cloud provider](https://platform.claude.com/docs/en/about-claude/glossary).
- Underneath temperature sits a smaller, less glamorous unit: the token. [For Claude, one token works out to roughly 3.5 English characters](https://platform.claude.com/docs/en/about-claude/glossary), and every prediction the temperature dial is nudging happens at that token level.
- The point of cranking temperature up isn't randomness for its own sake — it's [pushing the model to consider rare or unusual word choices instead of defaulting to the single most likely one](https://platform.claude.com/docs/en/about-claude/glossary).
- Dial it down and you don't get a robot reciting facts from a locked vault — you get [a model biased toward its most probable phrasing, not a guaranteed rerun of the exact same answer](https://platform.claude.com/docs/en/about-claude/glossary).

</div>

## The Dial Nobody Explains Properly

Ask two people what "temperature" means in AI and you'll get two shrugs and a "something to do with randomness." Fair enough — that's basically right, but the mechanism underneath is worth actually looking at, because it explains a lot of weird behavior people blame on the AI being "buggy" when it's really just doing what it was told.

Every time a language model generates text, it isn't picking words. It's picking tokens — the model's actual unit of thought, which for Claude comes out to about 3.5 characters each, somewhere between a syllable and a short word ([Claude glossary](https://platform.claude.com/docs/en/about-claude/glossary)). At each step, the model calculates a probability for every possible next token, with a handful of candidates clearly favored and a long tail trailing off into unlikely options. Temperature decides how the model chooses among those odds.

Turn it low, and the model plays it safe, almost always grabbing whatever token has the highest probability. Turn it high, and it starts genuinely rolling dice — willing to pick something less probable, more surprising, occasionally more interesting. Per the documentation, [higher temperatures "encourage a language model to explore rare, uncommon, or surprising word choices and sequences, rather than only selecting the most likely predictions"](https://platform.claude.com/docs/en/about-claude/glossary). That's the whole mechanism. No mysticism, no hidden "creativity module" — just a knob on how much the model is allowed to gamble.

## Zero Isn't What You Think It Is

Here's where most people's mental model breaks. The intuitive assumption is: temperature 0 means "always pick the top choice, every single time, forever" — so the same prompt should produce the same output, word for word, until the heat death of the universe.

It doesn't.

Anthropic states it flatly: [even with temperature set to 0, results will not be fully deterministic, and identical inputs may produce different outputs across API calls](https://platform.claude.com/docs/en/about-claude/glossary). Ask the same question twice at the "no randomness" setting and you can still get two different answers. Not wildly different, usually — but different enough that anyone treating temperature 0 as a guarantee of reproducibility is building on sand.

## Why Even Zero Can't Pin Down the Model

This isn't a bug someone forgot to patch. It's baked into how these systems run at scale. The documentation is explicit that [this caveat applies both to Anthropic's own first-party inference service and to inference run through third-party cloud providers](https://platform.claude.com/docs/en/about-claude/glossary) — meaning it's not one company's infrastructure quirk, it's a property of how large models get served across distributed hardware, where tiny differences in how calculations get batched or ordered can nudge a probability by a hair, and a hair is sometimes enough to flip which token wins.

So if you're building something that depends on a model returning the exact same string every time — a legal template, a compliance check, a test suite — temperature 0 gets you close, not identical. That distinction matters more than the marketing copy around "deterministic mode" usually lets on.

## Tokens: The Hidden Unit Behind the Dial

It's worth sitting with the token point for a second, because it reframes what temperature is actually doing. People imagine the model choosing between words like "happy," "joyful," "elated." In reality it's often choosing between token fragments — pieces of words, punctuation, even single characters when it hits something unfamiliar. [Tokens can correspond to words, subwords, characters, or bytes, depending on what's being processed](https://platform.claude.com/docs/en/about-claude/glossary), which is why unusual names or non-English text sometimes make output feel jerkier — the model is working with smaller, choppier units and temperature has more chances to introduce a wobble.

## So What Should You Actually Do With It

If you want the model to write a poem, brainstorm names, or draft five variations of ad copy, push temperature up — you're explicitly asking it to gamble on the less-obvious choice. If you want a summary, a code snippet, or an answer to a factual question, keep it low. But drop the idea that low temperature buys you a photocopier. What you actually get is a model that leans hard toward its best guess, run after run, without any guarantee of an identical transcript.

Think of temperature as a bias toward or away from the obvious answer rather than a determinism switch. If your workflow genuinely needs identical output every time, you need something outside the model itself — caching the first response, or a deterministic post-processing layer — because the model, even at its coldest setting, will still occasionally surprise you.

## Sources

- [Claude Platform Docs — Glossary: Temperature and Tokens](https://platform.claude.com/docs/en/about-claude/glossary)

<!--
Artwork brief — from the writer routine. Draw per docs/ARTWORK.md,
then delete this comment.

- **Argument in one sentence** — A bet you pay for upfront that only pays back if the prefix stays byte-identical.
- **Geometry** — Rows of identical short bars, one row shifted out of true.
- **Accent** — ochre — money and incentives.
- **The deliberate imperfection** — the single shifted row: the one changed byte that voids the cache.
-->
