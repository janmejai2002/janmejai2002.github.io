---
title: 'Why Does AI Forget Mid-Chat? Context Windows, Explained'
description: 'Your chatbot isn''t being moody when it forgets what you said an hour ago. Here''s what a context window actually is, and why it always runs out.'
pubDate: 2026-09-01
track: basics
question: 'What is a context window, and why does an AI forget earlier parts of a chat?'
keywords:
  - what is a context window
  - LLM context window explained
  - why AI forgets
  - tokens and context
heroImage: '../../assets/art/what-a-context-window-is-and-why-it-fills-up-light.webp'
heroImageDark: '../../assets/art/what-a-context-window-is-and-why-it-fills-up-dark.webp'
heroAlt: 'A row of 8 identical upright rectangles standing like columns. One rectangle leans out of alignment and is drawn in a single accent colour; the rest are upright ink outlines.'
readingTime: '4 min read'
notionId: '3ceced67-050a-811c-8aac-e27c89d85d94'
---
<div class="tldr">

## Executive TL;DR

You spend forty minutes telling a chatbot about your job, your dog's name, the plot of the novel you're outlining, and then it asks who you are. That's not the AI being moody. It's just how the model works.

- A context window is the stretch of text a model can actually "look back on" while writing its next reply. It's a working memory, not a filing cabinet of everything it has ever learned ([Anthropic glossary](https://platform.claude.com/docs/en/about-claude/glossary)).
- That working memory is a completely different thing from the giant pile of text a model absorbed during pretraining, long before you ever opened the chat window ([Anthropic glossary](https://platform.claude.com/docs/en/about-claude/glossary)).
- Fine-tuning, the process of further training a model on extra data, also happens ahead of time. It shapes how the model behaves; it doesn't hand it a running memory of your conversation ([Anthropic glossary](https://platform.claude.com/docs/en/about-claude/glossary)).
- A bigger context window lets a model handle longer, messier prompts and stay coherent deep into a conversation. A smaller one caps out and starts losing the thread ([Anthropic glossary](https://platform.claude.com/docs/en/about-claude/glossary)).
- Latency — the wait between your message and the reply — is shaped in part by how much the model has to process, which includes how complex and long that prompt is ([Anthropic glossary](https://platform.claude.com/docs/en/about-claude/glossary)).
- The forgetting problem is real enough that engineers built standards like MCP just to manage what context gets handed to a model and when ([Anthropic glossary](https://platform.claude.com/docs/en/about-claude/glossary)).

</div>

## The Chat That Forgot You Existed

Here's the scene. You open a chatbot to help plan a trip. You mention you're vegetarian, allergic to shellfish, traveling with a toddler, and trying to avoid flights with layovers. Forty messages later, deep into hotel options, it suggests a seafood restaurant. You didn't misremember telling it. It just doesn't have that sentence anymore.

This isn't a bug report waiting to be filed. It's how the technology is built to work, and understanding why turns a frustrating glitch into something you can actually plan around.

## Working Memory, Not a Filing Cabinet

The term for what the model can "see" at any given moment is the context window: the amount of text it can look back on and reference while generating new text ([Anthropic glossary](https://platform.claude.com/docs/en/about-claude/glossary)). Anthropic's own docs are explicit that this is different from the vast corpus of data the model was trained on — the context window is described as a working memory for the model, not the trained-on archive itself ([Anthropic glossary](https://platform.claude.com/docs/en/about-claude/glossary)).

Think of the difference like this. The training data is everything the model absorbed in school, years before it met you. The context window is the notepad on the desk in front of it right now, during this one conversation. The notepad only holds so much. Once it's full, something has to give.

## Two Different Kinds of "Knowing"

People often assume a chatbot "learns" from talking to them the way a person does, quietly filing new facts away for later. It doesn't, not by default. What the model draws on comes from two earlier processes: pretraining, where it trains on a large unlabeled corpus of text, and fine-tuning, where it trains further on additional data to pick up specific patterns and behaviors ([Anthropic glossary](https://platform.claude.com/docs/en/about-claude/glossary)).

Both of those happen before your chat starts, not during it. Nothing you type gets folded permanently into the model's knowledge mid-conversation. Whatever it "knows" about you right now lives only in the context window — the notepad, not the training. Close the notepad, and it's gone.

## Where the Words Go When They Fall Off the Edge

So why does the AI forget the earlier parts of a long chat specifically? Because the context window has a limit, and once a conversation grows past it, the earliest material stops being visible to the model when it generates a new reply. The glossary puts it plainly: a smaller context window may limit the model's ability to handle longer prompts or maintain coherence over extended conversations ([Anthropic glossary](https://platform.claude.com/docs/en/about-claude/glossary)). Flip that around, and you get the mechanism behind the vegetarian-shellfish mixup — your early messages simply aged out of the window that the model is looking at when it writes the next line.

It's less like the model deciding your dietary restrictions weren't important, and more like a whiteboard that only holds so many lines before the top ones get erased to make room for the bottom.

## The Price of a Bigger Memory

The obvious fix sounds simple: just make the notepad bigger. And larger context windows genuinely do let a model process and respond to more complex, lengthier prompts ([Anthropic glossary](https://platform.claude.com/docs/en/about-claude/glossary)). But nothing is free here. Latency — the delay between sending a prompt and getting a reply — is affected by factors including model size, hardware, network conditions, and the complexity of the prompt and the response being generated ([Anthropic glossary](https://platform.claude.com/docs/en/about-claude/glossary)). A model holding more text in view has more to weigh on every single reply. Stretch the memory, and you can end up paying for it in speed.

## Patching the Leak

This is exactly why context isn't just an academic curiosity to the people building these systems — it's a design problem, actively being worked on. One example is the Model Context Protocol, an open standard for how applications feed context into a model, described as functioning like a USB-C port for AI applications: one consistent way to plug in outside data and tools instead of a different adapter for every connection ([Anthropic glossary](https://platform.claude.com/docs/en/about-claude/glossary)). It doesn't magically expand the window itself, but it's part of a broader effort to manage what gets fed into that limited space more intelligently, so the model isn't left guessing at what mattered three screens ago.

So when a chatbot forgets something you told it earlier, that's not indifference. The message simply aged out of the window it can still see.

## Sources

- [Claude Platform Docs — Glossary (context window, LLM, pretraining, fine-tuning, latency, MCP)](https://platform.claude.com/docs/en/about-claude/glossary)

<!--
Artwork brief — from the writer routine. Draw per docs/ARTWORK.md,
then delete this comment.

- **Argument in one sentence** — A bet you pay for upfront that only pays back if the prefix stays byte-identical.
- **Geometry** — Rows of identical short bars, one row shifted out of true.
- **Accent** — ochre — money and incentives.
- **The deliberate imperfection** — the single shifted row: the one changed byte that voids the cache.
-->
