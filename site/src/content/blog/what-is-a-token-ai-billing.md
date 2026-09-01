---
title: 'You''re Not Paying by the Word. You''re Paying by the Token.'
description: 'What a token actually is, why AI replies cost more than your prompts, and a worked example turning 3,500 characters into real dollars on Claude Sonnet 5.'
pubDate: 2026-09-01
track: basics
question: 'How much does an AI reply actually cost, and why is generating text pricier than reading it?'
keywords:
  - what is a token in AI
  - AI token pricing explained
  - how AI billing works
  - input vs output tokens
heroImage: '../../assets/art/what-is-a-token-ai-billing-light.webp'
heroImageDark: '../../assets/art/what-is-a-token-ai-billing-dark.webp'
heroAlt: '5 concentric circles drawn in thin ink lines on a paper ground. The outermost circle is drawn in a single accent colour and does not close — it stops short, leaving a gap.'
readingTime: '5 min read'
notionId: '3ceced67-050a-8189-995e-da905c2e3873'
---
<div class="tldr">

## Executive TL;DR

- A token is the chunk of text a language model actually reads and writes — smaller than a word, bigger than a single letter, sometimes just a piece of one. [Anthropic glossary](https://platform.claude.com/docs/en/about-claude/glossary)
- For Claude, one token works out to roughly 3.5 English characters, so a 3,500-character email is about 1,000 tokens — approximately, because the exact split depends on the language. [Anthropic glossary](https://platform.claude.com/docs/en/about-claude/glossary)
- You get billed twice per exchange: once for what you send in, once for what the model sends back. [Anthropic pricing](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)
- On Claude Sonnet 5, output runs $10 per million tokens against $2 per million for input — five times the price for the same amount of text. [Anthropic pricing](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)
- That 1,000-token example costs about $0.002 going in and about $0.01 coming back out, roughly $0.012 total for one exchange (derived from the pricing above, approximate). [Anthropic pricing](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)
- Reusing the same input through prompt caching drops the reread price by 90%, to $0.20 per million tokens. [Anthropic pricing](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)

</div>

## Nobody Told You It Was Metered

Paste a résumé into an AI chatbot and ask for edits, and something happens before a single word of advice comes back. The résumé gets chopped up. Not into sentences, not into words exactly, into something smaller and stranger called tokens. Then the model reads those pieces, thinks in them, and hands you back more of the same kind of pieces. Every one of those pieces has a price tag, and almost nobody explains that up front.

This matters because AI tools feel free, or flat-rate, or bundled into some app you already pay for. Underneath, on the raw API that powers most of those apps, you're paying by the piece. And the pieces you get back cost more than the pieces you send in. That asymmetry is the whole story.

## What a Token Actually Is

A token is "the smallest individual unit of a language model," and it "can correspond to words, subwords, characters, or even bytes," according to Anthropic's own glossary [Anthropic glossary](https://platform.claude.com/docs/en/about-claude/glossary). So "cat" might be one token. "Unbelievable" might get split into three. A single emoji might eat a token by itself. There's no clean rule you can eyeball from the page.

What Anthropic does give you is a rough conversion: for Claude, one token lands around 3.5 English characters, though the number moves depending on the language you're writing in [Anthropic glossary](https://platform.claude.com/docs/en/about-claude/glossary). Dense technical text tokenizes differently than casual chat. Non-English languages often tokenize worse, meaning more tokens for the same idea. So 3.5 characters per token is a starting point, not a receipt.

**MTok**, if you see it on a pricing page, just means a million tokens. It's the unit companies use because a single token is worth a fraction of a cent — too small to price sanely on its own.

## You Pay Twice, and the Second Payment Costs More

Here's the part that trips people up: an AI conversation isn't one transaction, it's two. Your prompt goes in as input tokens. The reply comes out as output tokens. Both get counted, both get billed, and they are not billed the same.

On Claude Sonnet 5, input tokens run $2 per million. Output tokens run $10 per million [Anthropic pricing](https://platform.claude.com/docs/en/build-with-claude/prompt-caching). Line them up and the output price is exactly five times the input price. Read that sentence twice, because it's the number that actually hurts: generating text costs five times more than reading it, token for token, on the same model.

Why would a company price it that way? Generating output takes more computation per token than processing input — the model has to produce something new at each step, not just absorb what's already there. Whatever the engineering reason, the billing consequence is simple: short questions are cheap. Long, chatty, essay-length answers are where the meter really runs.

## The Worked Example: One Email, Real Money

Take that résumé edit. Say the résumé plus your instructions comes to 3,500 characters. Using the roughly-3.5-characters-per-token conversion, that's about 1,000 input tokens — approximate, since actual tokenization varies by wording and language [Anthropic glossary](https://platform.claude.com/docs/en/about-claude/glossary).

At $2 per million input tokens, 1,000 tokens costs:

1,000 ÷ 1,000,000 × $2 = **$0.002**

Now say the model writes back a reply of similar length, another roughly 1,000 tokens. At $10 per million output tokens:

1,000 ÷ 1,000,000 × $10 = **$0.01**

Add them up and one back-and-forth exchange costs roughly **$0.012** — a little over a cent, derived from the pricing figures above and approximate because of how tokenization actually splits your text [Anthropic pricing](https://platform.claude.com/docs/en/build-with-claude/prompt-caching). Fine for one message. Less fine once you're running this thousands of times a day inside a product, or asking for a 4,000-word draft where the output tokens alone could run several cents on their own.

Notice where the money actually went: 83% of that $0.012 came from the output half, even though input and output were the same length. That's the five-times multiplier doing its work quietly in the background.

## The Discount That Rewards Repetition

There's a way to blunt some of this, if your input doesn't change much between requests — think a long system prompt, a document you keep referencing, a big chunk of code you're iterating on. Anthropic's prompt caching lets you store that chunk once and reread it at a steep discount: cached reads cost $0.20 per million tokens, which Anthropic frames as 90% off the standard input price [Anthropic pricing](https://platform.claude.com/docs/en/build-with-claude/prompt-caching).

Run the same 1,000-token document through a cached read instead of a fresh one:

1,000 ÷ 1,000,000 × $0.20 = **$0.0002**

Compare that to the $0.002 it cost fresh, and the cache turns a ten-cent-per-hundred-uses habit into a one-cent one. It only helps with the input side of the bill, though. Output still costs what output costs. There's no cached discount for the words the model hasn't written yet.

## What Actually Changes Once You Know This

None of this requires you to do math before every message. But it reframes what's expensive and what isn't. Short prompts, short replies: cheap, almost free at the scale one person uses them. Asking for long-form output, or running the same big context over and over without caching, is where real cost accumulates — and it accumulates on the output side five times faster than on the input side. If you're building something on top of these models rather than just chatting, that five-times gap is the first number worth knowing, before any of the fancier optimization tricks.

## Sources

- [Anthropic glossary — token definition and character-to-token ratio](https://platform.claude.com/docs/en/about-claude/glossary)
- [Anthropic pricing — Claude Sonnet 5 input/output/cached rates](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)

<!--
Artwork brief — from the writer routine. Draw per docs/ARTWORK.md,
then delete this comment.

- **Argument in one sentence** — A bet you pay for upfront that only pays back if the prefix stays byte-identical.
- **Geometry** — Rows of identical short bars, one row shifted out of true.
- **Accent** — ochre — money and incentives.
- **The deliberate imperfection** — the single shifted row: the one changed byte that voids the cache.
-->
