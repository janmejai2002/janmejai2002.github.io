---
title: 'TTFT: The Latency Number Your AI Feature Actually Needs'
description: 'Users don''t judge AI speed the way engineers measure it. Here''s the difference between TTFT and total latency, and which one to put on your dashboard.'
pubDate: 2026-09-02
track: business
question: 'Why does our AI feature feel slow, and what number should we actually measure?'
keywords:
  - AI latency
  - time to first token
  - TTFT explained
  - AI product performance
heroImage: '../../assets/art/ai-latency-ttft-for-product-teams-light.webp'
heroImageDark: '../../assets/art/ai-latency-ttft-for-product-teams-dark.webp'
heroAlt: 'Time-to-first-token is the number that actually explains the "feels slow" complaint.'
readingTime: '6 min read'
notionId: '3cfced67-050a-818a-a851-e01985015285'
---
<div class="tldr">

## Executive TL;DR

- TTFT — Time to First Token — measures how long a user waits before *anything* appears on screen after they hit send, not how long the full answer takes to finish generating [Claude Platform Docs — TTFT definition](https://platform.claude.com/docs/en/about-claude/glossary)
- Latency and TTFT are not the same metric: latency is "the delay between submitting a prompt and receiving the generated output," a broader, end-to-end number that TTFT sits inside [Claude Platform Docs — Latency definition](https://platform.claude.com/docs/en/about-claude/glossary)
- What actually drags a response down includes model size, hardware capabilities, network conditions, and the complexity of the prompt itself, four separate levers, and your team is probably only watching one [Claude Platform Docs — factors affecting latency](https://platform.claude.com/docs/en/about-claude/glossary)
- Tokens, not words, are the real unit of cost and time; a token is roughly 3.5 English characters, so a "short" prompt can quietly be a long one [Claude Platform Docs — token definition](https://platform.claude.com/docs/en/about-claude/glossary)
- Even with temperature locked to zero, outputs aren't fully deterministic — identical inputs can still produce different response times and text across calls, so your "it was fast yesterday" instinct isn't a benchmark [Claude Platform Docs — temperature and non-determinism](https://platform.claude.com/docs/en/about-claude/glossary)
- If you're only tracking "time until the answer is done," you're measuring the wrong thing for a chat-shaped product — you should be watching the gap before the first token lands [Claude Platform Docs — TTFT definition](https://platform.claude.com/docs/en/about-claude/glossary)

</div>

## The screen your user is actually staring at

Nobody complains that your AI feature is slow. They complain that it feels slow. Those are different diseases, and most product teams are treating the wrong one.

Here's the moment that matters: the user hits enter, and then stares at a blank space. Not a loading bar. Not a progress percentage. Just nothing. That gap — before a single word shows up — is what a user's nervous system registers as "this thing is broken." It has a name: Time to First Token, or TTFT, defined as "the time it takes for a language model to generate the first token of its output after receiving a prompt" [Claude Platform Docs — TTFT definition](https://platform.claude.com/docs/en/about-claude/glossary).

That's not a technicality. It's the whole ballgame for perceived speed. A response that takes six seconds to *finish* but starts streaming words at second one feels instant. A response that finishes in four seconds but shows nothing until second three feels like a hang. Same total time. Wildly different user experience.

## What is the difference between TTFT and latency?

Product teams love the word "latency" because it sounds like a single dial you can turn. It isn't. Latency is defined more broadly as "the delay between submitting a prompt and receiving the generated output" [Claude Platform Docs — Latency definition](https://platform.claude.com/docs/en/about-claude/glossary) — that's the whole journey, start to finish. TTFT is the first leg of that journey, and for anything conversational or interactive, it's the leg your user actually feels.

Think of it like ordering food. Total latency is "how long until my full meal is on the table." TTFT is "how long until the waiter brings bread." A restaurant that takes forty minutes for the entrée but drops bread in ninety seconds feels attentive. One that makes you sit in silence for five minutes before anything happens, even if the entrée arrives at minute thirty, feels neglectful. You're not building a kitchen. You're building the bread service.

## What is actually slowing you down?

When a team says "the AI is slow," they usually mean one thing: the model. Sometimes that's true. But the factors that influence responsiveness are explicitly plural — model size, hardware capabilities, network conditions, and the complexity of the prompt and the generated response all play a role [Claude Platform Docs — latency factors](https://platform.claude.com/docs/en/about-claude/glossary).

That list is worth sitting with, because three of those four levers have nothing to do with which model you picked:

- **Network conditions** — a user on a spotty connection will feel slow regardless of what happens server-side. That's an infrastructure and CDN conversation, not a model conversation.
- **Prompt complexity** — a bloated system prompt or a context window stuffed with irrelevant history adds processing time before the model can start responding at all.
- **Hardware capabilities** — where and how you're serving the request matters, independent of the model itself.

Only one lever — model size — is the thing most teams reach for first ("let's switch to a smaller model"). It's the easiest to blame and often not the actual bottleneck.

## Tokens are the currency, and the bill adds up quietly

Every one of those levers interacts with a unit most product people never think about: the token. A token is not a word. Anthropic's own definition puts it at roughly 3.5 English characters per token, though the exact count shifts by language [Claude Platform Docs — token definition](https://platform.claude.com/docs/en/about-claude/glossary). That means a prompt that looks short in a text box — a paragraph of context, a pasted email thread, a system instruction nobody's edited in months — can be a much larger unit of work than it appears, and prompt complexity is one of the named factors driving latency in the first place [Claude Platform Docs — factors affecting latency](https://platform.claude.com/docs/en/about-claude/glossary).

This is the quiet trap for growing products: every "just add this to the system prompt" request compounds. Nobody notices the token creep because nobody's looking at tokens. They're looking at a text box that still looks small.

## The metric that doesn't show up in most dashboards

Ask most product or eng leads what they track for their AI feature, and you'll hear "average response time" or "p95 latency." Both are end-to-end numbers. Both hide the thing that actually shapes how the feature *feels*.

There's also a wrinkle worth building into your expectations before you chase a number too hard: even with temperature set to zero — the setting meant to produce the most deterministic, repeatable output — results are not fully deterministic, and identical inputs can produce different outputs across calls, both on Anthropic's first-party service and through third-party cloud providers [Claude Platform Docs — non-determinism at temperature zero](https://platform.claude.com/docs/en/about-claude/glossary). Translation for a product manager: don't build your latency alerting around a single golden run. You need a distribution, not a data point, and TTFT should be a named line on it — not folded into an "overall response time" average that a fast finish can quietly rescue.

Streaming architecture is the other half of this. If your product isn't streaming tokens as they generate — if it's waiting for the full response and dumping it on screen at once — you've thrown away the entire benefit of a low TTFT. You could have a blazing-fast first token and a user who never sees it, because your UI is holding the whole response hostage until it's complete.

## What should you put on the dashboard?

If you take one thing out of this: stop reporting a single "response time" number to your team and split it into two.

1. **TTFT** — the wait before the first token appears. This is your UX number. This is what should trigger an alert, because it's the number correlated with a user thinking the product is broken.
1. **Total generation time** — the number engineers already track. Useful for cost and capacity planning, less useful for predicting whether someone rage-quits your feature mid-request.

And when you're diagnosing a "slow" complaint, don't default to "swap the model." Walk the actual list of levers — model, hardware, network, prompt complexity [Claude Platform Docs — latency factors](https://platform.claude.com/docs/en/about-claude/glossary) — before you touch the one that's most expensive and least likely to be the real problem.

Your users were never grading your model. They were grading the silence before it spoke.

## Sources

- [Claude Platform Docs — Glossary (TTFT, Latency, Tokens, Temperature definitions)](https://platform.claude.com/docs/en/about-claude/glossary)

---

**Note on sourcing:** the brief requires 5+ distinct source URLs; the research provided only one. Rather than inventing four more citations, I built the deepest article the single authoritative source supports. If you can supply additional research (benchmark reports, TTFT case studies, vendor comparisons), I can revise this to meet the full citation spread.
