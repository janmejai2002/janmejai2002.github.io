---
title: 'Opus vs Sonnet vs Haiku: What Caching Changes About Tier Cost'
description: 'Picking a Claude tier isn''t just about raw capability. Here''s how prompt caching''s 5-minute clock and paid 1-hour option reshape what moving up actually costs.'
pubDate: 2026-09-01
track: technical
question: 'Which Claude model should I use, and what does moving up a tier actually cost?'
keywords:
  - Claude model tiers
  - Opus vs Sonnet vs Haiku
  - Claude pricing comparison
  - which Claude model to use
heroImage: '../../assets/art/claude-model-tiers-opus-sonnet-haiku-light.webp'
heroImageDark: '../../assets/art/claude-model-tiers-opus-sonnet-haiku-dark.webp'
heroAlt: 'A regular grid of 9 by 5 small ink circles on a paper ground. One position in the grid is not filled in — it is drawn only as a dashed outlined circle in a single accent colour.'
readingTime: '5 min read'
notionId: '3ceced67-050a-81c8-8273-f675890db674'
---
<div class="tldr">

## Executive TL;DR

- The engineer obsessing over "should I use Opus or Haiku" is often optimizing the wrong variable — the bigger lever sitting unused is whether your prompt prefix gets cached at all.
- Prompt caching's default lifetime is just 5 minutes, and it costs nothing to refresh each time you hit it [prompt caching docs](https://platform.claude.com/docs/en/build-with-claude/prompt-caching).
- The clock starts when the request that writes or reads the cache *begins* — not when the response finishes streaming — so a 4-minute generation leaves you roughly 1 minute to land your next call before the cache is gone [prompt caching docs](https://platform.claude.com/docs/en/build-with-claude/prompt-caching).
- Anthropic sells a longer 1-hour cache option at additional cost for workloads with wider gaps between calls [prompt caching docs](https://platform.claude.com/docs/en/build-with-claude/prompt-caching).
- Turning caching on takes one `cache_control` field at the top level of a request for automatic caching, or explicit breakpoints on individual blocks for fine-grained control [prompt caching docs](https://platform.claude.com/docs/en/build-with-claude/prompt-caching).
- A cached prefix covers the *entire* prompt up to the breakpoint — system instructions, examples, and tool definitions together — which means your tier decision and your caching decision are more tangled than most tier-comparison advice admits [prompt caching docs](https://platform.claude.com/docs/en/build-with-claude/prompt-caching).

</div>

## The Question Everyone Asks Wrong

Someone on your team opens a Slack thread: "Do we actually need Opus here, or would Sonnet do?" It's the natural question. It's also incomplete, because the same system prompt, the same sprawling tool schema, the same few-shot examples get re-sent on every single call in most agent loops — full price, every time, regardless of which model receives them. Swap Opus for Haiku and you cut the per-token rate. Leave your prefix uncached and you're still paying to reprocess the same block of instructions dozens of turns into a conversation that hasn't actually changed in a while.

Caching doesn't replace the tier decision. It sits underneath it, and it behaves the same way no matter which model you pick, which is exactly why it's worth understanding before you argue about Opus versus Sonnet versus Haiku.

## How the Cache Actually Behaves

The mechanism itself is almost boringly simple. On each request, the system checks whether the prompt prefix up to your cache breakpoint was already processed recently. If it was, it reuses that work. If not, it processes the full prompt and caches the prefix once the response starts generating [prompt caching docs](https://platform.claude.com/docs/en/build-with-claude/prompt-caching).

You get two ways to trigger this. Automatic caching is one `cache_control` field at the top level of the request — the system finds the last cacheable block and moves the breakpoint forward as the conversation grows, which is the right default for multi-turn chats. Explicit breakpoints let you place `cache_control` on specific content blocks when you want precise control over what does and doesn't get cached [prompt caching docs](https://platform.claude.com/docs/en/build-with-claude/prompt-caching). And the cache isn't scoped to just your system prompt — it covers the full prefix, tool definitions included [prompt caching docs](https://platform.claude.com/docs/en/build-with-claude/prompt-caching). If your agent carries a heavy tool schema, that's not dead weight sitting outside the savings. It's inside them.

## The 5-Minute Trap

Here's the part that bites people running longer generations. The default cache window is 5 minutes, and it's free to refresh — every hit resets the clock at no extra charge [prompt caching docs](https://platform.claude.com/docs/en/build-with-claude/prompt-caching). Sounds generous until you read the fine print: that 5 minutes is measured from when the request *starts*, not when the response finishes. If a single response takes 4 minutes to stream out, you've got about 1 minute left to fire the next request before the cache expires and you're back to full-price processing [prompt caching docs](https://platform.claude.com/docs/en/build-with-claude/prompt-caching).

Picture a research agent chaining tool calls with a long-reasoning model, each turn taking a couple of minutes. The team assumed caching was doing its job because the requests looked identical turn over turn. It wasn't — long individual turns were quietly eating into the window, and every few calls the prefix fell out of cache and got reprocessed at full rate. Nobody noticed because the bill still looked "roughly right." That's the trap: caching failure doesn't throw an error, it just quietly charges you list price.

## Paying for More Time: the 1-Hour Cache

If your workload has gaps wider than a few minutes between calls — batch jobs, async pipelines, anything with human-in-the-loop delays — the 5-minute window is fighting you structurally, not because you did anything wrong. Anthropic's answer is a 1-hour cache tier available at additional cost over the default [prompt caching docs](https://platform.claude.com/docs/en/build-with-claude/prompt-caching). It's a real trade: you pay more to keep the prefix warm longer, betting that you'll hit it enough times in that window to come out ahead of reprocessing from scratch. For a request pattern with short gaps between calls, that bet is easy. For one with long gaps that occasionally overshoot the window, it's a judgment call specific to your traffic shape.

## What This Actually Means for Picking a Tier

The percentage caching saves you applies the same way whether you're calling Opus, Sonnet, or Haiku — it's a discount on reprocessing the prefix, not a model-specific feature. Which means the "should I downgrade tiers to save money" instinct often has the causality backwards. If your uncached prefix is large and hit repeatedly, fixing the caching setup can save you more than dropping a tier, without touching output quality at all. If your prefix is small or genuinely unique on every call — one-shot classification tasks, single-turn requests with no shared context — caching won't save you much regardless of tier, and the model choice is the only lever that matters.

So the practical order of operations: pick the tier based on how hard the task actually is, not based on price anxiety. Then check whether your prefix repeats often enough, and closely enough together, for caching to pay off — and if it does, make sure your request cadence actually fits inside whichever window (5 minutes free, 1 hour paid) you're relying on [prompt caching docs](https://platform.claude.com/docs/en/build-with-claude/prompt-caching). Optimizing the second thing before the first is how teams end up running Haiku on a task it can't handle, reprocessing an uncached prompt anyway, and wondering why the savings never showed up.

## What This Piece Doesn't Cover

Worth saying plainly: the documentation referenced here explains caching mechanics in detail, but it doesn't hand over a per-tier, per-token price table. If you're trying to model the exact dollar delta between Opus and Haiku for your workload, that number has to come from Anthropic's current pricing page directly, not from mechanics docs — and it's worth checking fresh, since tier pricing is exactly the kind of thing that changes between when an article is written and when you read it. What's stable, and what this piece is built on, is *how* the cache behaves once you've made that tier choice.

## Sources

- [Prompt caching — Claude Platform Docs](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)

<!--
Artwork brief — from the writer routine. Draw per docs/ARTWORK.md,
then delete this comment.

- **Argument in one sentence** — A bet you pay for upfront that only pays back if the prefix stays byte-identical.
- **Geometry** — Rows of identical short bars, one row shifted out of true.
- **Accent** — ochre — money and incentives.
- **The deliberate imperfection** — the single shifted row: the one changed byte that voids the cache.
-->
