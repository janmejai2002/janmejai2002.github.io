---
title: 'Why AI Pricing Is Per-Token — and How to Sanity-Check Any Vendor Quote'
description: 'A plain-English guide to token-based AI pricing: why output costs dominate, how caching cuts bills, and three questions to catch inflated vendor cost claims.'
pubDate: 2026-09-01
track: business
question: 'Why does AI pricing run per-token instead of per-response, and how do I check if a vendor''s cost estimate is honest?'
keywords:
  - AI cost budgeting
  - per-token pricing explained
  - how to evaluate AI vendor pricing
  - AI unit economics
heroImage: '../../assets/art/budget-ai-costs-per-token-pricing-light.webp'
heroImageDark: '../../assets/art/budget-ai-costs-per-token-pricing-dark.webp'
heroAlt: 'A row of 8 identical upright rectangles standing like columns. One rectangle leans out of alignment and is drawn in a single accent colour; the rest are upright ink outlines.'
readingTime: '5 min read'
notionId: '3ceced67-050a-812b-8e95-c1b6caf09387'
---
<div class="tldr">

## Executive TL;DR

Nobody tells you the meter is running on every word the model writes back to you — and that word costs five times more than the word you typed in.

- Sonnet 5 charges 5x more for output than input — $10 per million tokens out versus $2 per million in — so a chatty answer is quietly the expensive part of the bill, not your prompt [Sonnet 5 output pricing](https://platform.claude.com/docs/en/build-with-claude/prompt-caching).
- Model tier alone swings your cost up to 5x: Haiku 4.5 outputs run $5/MTok, Sonnet 5 runs $10/MTok, Opus 5 runs $25/MTok [tier pricing spread](https://platform.claude.com/docs/en/build-with-claude/prompt-caching).
- Prompt caching reads cost 90% less than a fresh read — $0.20 versus $2 per million tokens on Sonnet 5 — which is the single biggest lever most teams never pull [cached read discount](https://platform.claude.com/docs/en/build-with-claude/prompt-caching).
- A batch of 1,000 typical interactions (1,000 input + 500 output tokens each) costs roughly $7 on Sonnet 5 with no caching at all [uncached Sonnet 5 rates](https://platform.claude.com/docs/en/build-with-claude/prompt-caching).
- Cache just 800 of those 1,000 input tokens per interaction and the same batch drops to about $5.56 — around 21% cheaper — for doing nothing except reusing context [caching math](https://platform.claude.com/docs/en/build-with-claude/prompt-caching).
- A token is roughly 3.5 English characters, not a word and not a sentence, which is why "per response" pricing quotes from vendors are almost never apples-to-apples [token definition](https://platform.claude.com/docs/en/about-claude/glossary).

</div>

## The meter you didn't know was running

You ask a model a question. It writes back a paragraph. Somewhere in that exchange, two separate meters started ticking — one for what you sent in, one for what came back out — and they don't tick at the same rate. On Sonnet 5, every million tokens of output costs $10, while every million tokens of input costs $2 [input vs output rates](https://platform.claude.com/docs/en/build-with-claude/prompt-caching). Five times the price, same model, same conversation.

This is the part budgeting spreadsheets miss most often. Teams price out their prompts — the instructions, the customer message, the pasted document — and forget that the response is the line item doing the real damage. A verbose model that writes three paragraphs when one would do isn't just annoying. It's a 3x line item.

## What a token actually is, and why it matters for your invoice

A token isn't a word. It's a chunk of text the model processes, and the rough conversion is about 3.5 English characters per token [character-to-token ratio](https://platform.claude.com/docs/en/about-claude/glossary). That means a tight 100-word answer is somewhere around 140-180 tokens, and a rambling 400-word answer can blow past 550. Nobody sees this happening in real time, which is exactly why "cost per response" claims from vendors deserve a second look — a "response" is not a fixed unit, and a vendor benchmarking their tool on terse answers will quote you a number that evaporates the moment your actual use case produces longer output.

## The worked example: 1,000 interactions, two ways

Say you're running a support bot. Each interaction averages 1,000 input tokens (a system prompt, some context, the user's message) and 500 output tokens (the reply). Run 1,000 of these through Sonnet 5.

**No caching.** Input: 1,000 interactions × 1,000 tokens = 1 million tokens × $2/MTok = $2. Output: 1,000 interactions × 500 tokens = 0.5 million tokens × $10/MTok = $5. Total: **$7** [uncached total calculation](https://platform.claude.com/docs/en/build-with-claude/prompt-caching).

**With caching.** Suppose 800 of those 1,000 input tokens per interaction are repeated context — the system prompt, a knowledge base excerpt, anything that doesn't change turn to turn. Cache them. Cached reads: 0.8 million tokens × $0.20/MTok = $0.16. Fresh input: 0.2 million tokens × $2/MTok = $0.40. Output stays at $5, because caching doesn't touch what the model writes back. Total: **$5.56** — about 21% cheaper than the uncached run, for changing nothing about what the bot says [caching savings example](https://platform.claude.com/docs/en/build-with-claude/prompt-caching).

That 21% didn't come from a smarter prompt or a cheaper model. It came from not paying full price to re-read the same context 1,000 times.

## Three questions that catch an inflated vendor quote

You don't need to understand transformer architecture to sanity-check a cost claim. You need three questions.

**Which model tier are they actually running?** "Powered by Claude" tells you nothing about the bill. Haiku 4.5 output runs $5/MTok, Sonnet 5 runs $10/MTok, Opus 5 runs $25/MTok — a 5x spread on the exact same task [model tier price spread](https://platform.claude.com/docs/en/build-with-claude/prompt-caching). If a vendor's demo ran on Haiku and their production pilot quietly moved to Opus for quality, your invoice didn't move by a little. It moved by two and a half times, before you changed a single word of your prompt.

**How long is the output, really?** Ask for the average output token count, not the average response. A vendor optimizing for a snappy one-line demo answer is not going to produce the same bill as the same tool generating a 600-word report. Since output costs 5x input on Sonnet 5, this is the single number that moves your bill the most — more than input length, more than which model you started with [output cost multiplier](https://platform.claude.com/docs/en/build-with-claude/prompt-caching).

**Is the context actually cached?** If a vendor's cost estimate assumes caching and your use case doesn't repeat context turn to turn — every conversation is genuinely unique — you'll never see that 90% discount on reads, and the real bill lands closer to the uncached number [cache eligibility discount](https://platform.claude.com/docs/en/build-with-claude/prompt-caching). Ask directly: what fraction of the input tokens repeat across calls? If the answer is "we're not sure," the vendor's savings number is a projection, not a measurement.

## What happens when the model swaps under you

Here's the part nobody flags until the invoice does. Take that same 1,000-interaction batch, uncached, $7 on Sonnet 5. Swap the model to Opus 5 and nothing else changes — same prompts, same 500-token replies. Output cost jumps from $5 to $12.50 (2.5x, matching the $25 vs $10 spread), pushing the total to roughly $14.50. Swap down to Haiku 4.5 instead, and output drops to $2.50 (half of $5), bringing the total to about $4.50 [tier-swap output impact](https://platform.claude.com/docs/en/build-with-claude/prompt-caching).

Same task. Same interactions. More than 3x difference in total cost depending on which tier answered the phone. That's not a rounding error in a forecast — that's the whole forecast being wrong.

## The actual takeaway

Budgeting for AI isn't about finding the cheapest sticker price per million tokens. It's about knowing which tier is running, how long the output actually is, and whether your context repeats enough to earn the caching discount. Get those three answers and you can build a real number. Skip them, and you're budgeting off a demo that was never going to resemble your production bill.

## Sources

- [Anthropic pricing table — input, output, and cached rates by model](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)
- [Anthropic glossary — token definition and character conversion](https://platform.claude.com/docs/en/about-claude/glossary)

<!--
Artwork brief — from the writer routine. Draw per docs/ARTWORK.md,
then delete this comment.

- **Argument in one sentence** — A bet you pay for upfront that only pays back if the prefix stays byte-identical.
- **Geometry** — Rows of identical short bars, one row shifted out of true.
- **Accent** — ochre — money and incentives.
- **The deliberate imperfection** — the single shifted row: the one changed byte that voids the cache.
-->
