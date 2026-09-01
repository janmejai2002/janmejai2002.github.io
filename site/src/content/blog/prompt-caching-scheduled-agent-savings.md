---
title: 'Prompt Caching Math: When It Actually Saves Your Agent Money'
description: 'The exact break-even math for Claude and OpenAI prompt caching, the invalidation trap that silently kills savings, and which vendor''s bet suits a.'
pubDate: 2026-09-01
track: technical
question: 'Does prompt caching actually save money for a scheduled agent, or is it a trap?'
keywords:
  - prompt caching cost
  - Claude vs OpenAI prompt caching
  - LLM cost optimization
  - cache_control break-even
  - scheduled agent token cost
heroImage: '../../assets/art/prompt-caching-scheduled-agent-savings-light.webp'
heroImageDark: '../../assets/art/prompt-caching-scheduled-agent-savings-dark.webp'
heroAlt: '4 concentric circles drawn in thin ink lines on a paper ground. The outermost circle is drawn in a single accent colour and does not close — it stops short, leaving a gap.'
readingTime: '7 min read'
notionId: '3ceced67-050a-817d-9551-e17ed02255c2'
---
<div class="tldr">

## Executive TL;DR

- On Sonnet 5, a 5-minute cache write costs [1.25x the base input price](https://platform.claude.com/docs/en/build-with-claude/prompt-caching), but a cache hit is [0.1x the base price](https://platform.claude.com/docs/en/build-with-claude/prompt-caching) — a 90% discount, so two calls total 1.35x versus 2.0x uncached. You're ahead after exactly one reuse.
- One byte changed before your cache boundary and the whole prefix rewrites at the write price again, because [caching references the entire prompt up to and including the cache_control block](https://platform.claude.com/docs/en/build-with-claude/prompt-caching).
- My own test call against a ~4,300-token system prompt logged `cache_creation_input_tokens: 4317` and `cache_read_input_tokens: 0` — a cold write, meaning that call was billed above the normal input rate, not below it.
- OpenAI takes a different bet: caching is [automatic on GPT-4o, GPT-4o mini, o1-preview and o1-mini](https://openai.com/index/api-prompt-caching/), with no manual breakpoints and no write surcharge, kicking in once a prompt clears [1,024 tokens](https://openai.com/index/api-prompt-caching/).
- OpenAI's discount is a flat [50% off cached tokens](https://openai.com/index/api-prompt-caching/) — less than half of Anthropic's 90%, but you never pay a premium to get there.
- Both caches are short-lived: Anthropic's default is [5 minutes, refreshed free on each hit](https://platform.claude.com/docs/en/build-with-claude/prompt-caching), OpenAI's is typically [cleared after 5-10 minutes idle and always gone within an hour](https://openai.com/index/api-prompt-caching/) — a scheduled agent's cron interval decides which vendor's cache survives.

</div>

## The bill nobody checks

Somebody sets up a cron job. Every fifteen minutes it wakes an agent, hands it a system prompt built from a fat block of tool schemas, house rules, a knowledge base excerpt, and maybe a style guide — call it a few thousand tokens of scaffolding that never changes call to call. The agent does its thing, appends a small user turn on the end, and goes back to sleep. Three months later someone opens the billing dashboard and the input-token line item is bigger than the output line item, even though outputs are what the agent is actually being paid to produce.

This is the default state of every scheduled agent that doesn't think about caching. The fix isn't complicated. But the math around it has a trap door in it, and if you don't understand the trap door you can ship "caching" and get a bill that's worse than doing nothing.

## What the cache actually is

Prompt caching stores the KV-cache state for a prefix of your prompt so a later call with the identical prefix doesn't have to recompute attention over it from scratch. On the Anthropic side you mark the end of the stable prefix with a `cache_control` block; everything up to and including that marker becomes the cached unit. The first call that includes that marker is a **cache write** — you pay extra for it. Every subsequent call whose prefix matches exactly is a **cache read** — you pay much less for it.

Anthropic's pricing table for Sonnet 5 makes the shape of the bet explicit: input tokens run [$2 per million](https://platform.claude.com/docs/en/build-with-claude/prompt-caching), a 5-minute cache write is $2.50, a 1-hour cache write is $4, a cache hit is $0.20, and output is $10 per million. Notice that the write price is *higher* than just paying the normal input rate — you are, by design, paying a premium up front to unlock a steep discount later.

I ran this in practice against a real scheduled-agent system prompt. The cold call logged `cache_creation_input_tokens: 4317` and `cache_read_input_tokens: 0` — nothing was cached yet, so it wrote. At Sonnet 5's 5-minute write rate that's roughly $0.0108 for those 4,317 tokens. Had that same prefix instead hit a warm cache, the read price would have billed it at $0.20/MTok — about $0.00086. That's a 92% drop, and it's the whole reason caching exists. But the first call, the one that creates the cache, actually cost *more* than a plain uncached call would have (4,317 tokens at the flat $2/MTok rate is about $0.0086). You take a small loss to set the trap, then profit off everything that walks into it.

For sizing your own prompts: Anthropic's glossary states that [a token is roughly 3.5 English characters](https://platform.claude.com/docs/en/about-claude/glossary), so a 4,317-token system prompt is somewhere around 15,000 characters of tool schemas and instructions — not an unusual size for an agent with a handful of tools and a house style guide.

## The exact break-even

Here's the math that matters, expressed in multiples of the base input price, using Anthropic's 5-minute cache:

- Call 1 (write): 1.25x
- Call 2 (read): 0.1x
- Total for 2 calls: 1.35x

Compare that to doing both calls uncached: 1x + 1x = 2.0x.

1.35x is already less than 2.0x. You break even *before* the second call even finishes — the moment a warm read happens, you're cheaper than you would have been without caching at all, and every read after that is nearly free relative to the write.

The 1-hour cache changes this slightly. A 1-hour write costs 2x the base rate on Sonnet 5, so two calls total 2x + 0.1x = 2.1x, which is *worse* than two uncached calls (2.0x) — you need a third call to pull ahead: 2x + 0.1x + 0.1x = 2.2x against 3.0x uncached. The 1-hour cache is the right tool when your agent's cadence is slower than five minutes but you're confident it'll fire at least three times before the hour is up; otherwise the cheaper 5-minute write is the better default, and it happens to refresh for free on every hit, so a busy agent effectively never lets the cache go cold. Anthropic states the cache [refreshes at no additional cost each time the cached content is used](https://platform.claude.com/docs/en/build-with-claude/prompt-caching) — meaning a scheduled agent running more often than every five minutes can ride a single write almost indefinitely, paying the read rate forever.

## The invalidation trap

Here's where it goes wrong for people who set this up once and stop paying attention.

Anthropic's docs are specific: [prompt caching references the entire prompt — tools, system, and messages, in that order — up to and including the block designated with `cache_control`](https://platform.claude.com/docs/en/build-with-claude/prompt-caching). That means the cache key isn't "the system prompt" in some fuzzy sense. It's the literal byte sequence of everything before your marker. Change the order of your tool definitions, add a debug flag to your system prompt, inject today's date into the middle of the instructions instead of at the very end, and the cache misses. Silently. You don't get an error — you get a full write again, at the premium rate, and if your marker sits deep in the prompt, the entire thing behind it re-writes even if only one field near the front changed.

This is the failure mode that turns caching into a net loss: a team ships a cache boundary, then six weeks later someone adds a "last updated" timestamp to the top of the system prompt for debugging, and every single call becomes a 1.25x write instead of a 0.1x read, forever, with nobody noticing because the bill just looks like "caching isn't helping much" rather than "caching is now actively hurting."

The fix is layout discipline: put everything that truly never changes — tool schemas, house rules, static knowledge — first, place the `cache_control` marker immediately after that block, and push anything dynamic (current date, user ID, the actual task) *after* the boundary, never before it and never inside the cached region.

## Anthropic vs OpenAI: two different bets

Anthropic and OpenAI didn't converge on the same design, and the difference tells you something about who each vendor expects to be doing the caching.

Anthropic makes you opt in explicitly with a `cache_control` block — you decide the boundary, you decide 5-minute or 1-hour TTL, and in exchange you get a real discount: reads at [0.1x base price, a 90% cut](https://platform.claude.com/docs/en/build-with-claude/prompt-caching). The cost of that control is the write premium (1.25x or 2x) and the invalidation risk described above — get the boundary wrong and you pay for it, literally.

OpenAI went the other direction. Caching is [automatically applied on GPT-4o, GPT-4o mini, o1-preview and o1-mini](https://openai.com/index/api-prompt-caching/) with no `cache_control` equivalent to configure. The system [caches the longest matching prefix, starting at a 1,024-token minimum and growing in 128-token increments](https://openai.com/index/api-prompt-caching/), so short prompts don't qualify at all — your agent's system prompt needs real heft before this does anything. There's no write surcharge; you simply get [a 50% discount and faster processing](https://openai.com/index/api-prompt-caching/) whenever the prefix matches, illustrated concretely in OpenAI's own pricing table: `gpt-4o-2024-08-06` runs $2.50 per million uncached and exactly $1.25 per million cached — half price, no asterisk.

So the trade is: Anthropic gives you a steeper discount (90% vs 50%) but charges rent up front and punishes prefix drift; OpenAI gives you a shallower discount but it's free to enter and there's nothing to misconfigure. TTLs land in similar territory on both sides — Anthropic's default is [5 minutes](https://platform.claude.com/docs/en/build-with-claude/prompt-caching), OpenAI's caches are [typically cleared after 5-10 minutes of inactivity and always gone within an hour](https://openai.com/index/api-prompt-caching/) — so neither vendor is betting on long-lived caches sitting idle between sparse calls.

For a scheduled agent specifically, the deciding factor is less "which discount is bigger" and more "how disciplined is your prompt pipeline." If your system prompt is templated and byte-stable — genuinely unchanging bytes before the boundary, every run — Anthropic's 90%-off reads compound fast on a high-frequency cron job, and the 1.35x-versus-2.0x math pays for itself after a single reuse. If your prompt construction is looser, gets touched by different code paths, or you don't trust yourself to keep the prefix stable, OpenAI's automatic caching with no write penalty is the safer default: worst case, a missed cache costs you nothing extra, it just costs you the discount you'd have gotten anyway.

Either way, the actual lesson is the same on both platforms: caching isn't a checkbox, it's a prompt-layout decision. Stable content first, variable content last, and check your bill after you ship it — not before.

## Sources

- [Anthropic — Prompt Caching Documentation](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)
- [Anthropic — Glossary (token-to-character ratio)](https://platform.claude.com/docs/en/about-claude/glossary)
- [OpenAI — Prompt Caching in the API (Oct 1, 2024)](https://openai.com/index/api-prompt-caching/)

<!--
Artwork brief — from the writer routine. Draw per docs/ARTWORK.md,
then delete this comment.

- **Argument in one sentence** — A bet you pay for upfront that only pays back if the prefix stays byte-identical.
- **Geometry** — Rows of identical short bars, one row shifted out of true.
- **Accent** — ochre — money and incentives.
- **The deliberate imperfection** — the single shifted row: the one changed byte that voids the cache.
-->
