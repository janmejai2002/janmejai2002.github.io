---
title: 'Context Windows Are Fixed Desks Where Prompts and Memory Compete'
description: 'A context window is a fixed desk, not permanent memory. Learn how 128K to 1M tokens fill up with hidden prompts and chat history, and when to start fresh.'
pubDate: 2026-11-19
publishedAt: '2026-11-19T23:21:35.591Z'
track: basics
question: 'Why does an AI chatbot suddenly forget my earlier instructions in a long conversation?'
keywords:
  - Context Window Explained
  - AI Short Term Memory
  - Token Budget Mental Model
  - Why Chatbots Forget
heroImage: '../../assets/art/context-window-fixed-desk-ai-memory-light.webp'
heroImageDark: '../../assets/art/context-window-fixed-desk-ai-memory-dark.webp'
heroAlt: 'A geometric diagram on paper showing a fixed rectangular desk packed with blocks, with the leftmost block slipping past the edge and a plum block filling the right.'
readingTime: '7 min read'
notionId: '41dced67-050a-81f1-b83e-c391a3f39545'
---
<div class="tldr">

## Executive TL;DR

- **Zero permanent recall:** Language models are stateless between turns, so every new reply must re-read the entire conversation inside a fixed **context window** shared across input, reasoning, and output tokens, per the [OpenAI API documentation](https://developers.openai.com/api/docs/guides/conversation-state).
- **One shared budget:** System prompts, tool schemas, uploaded files, prior replies, and the model's next answer all compete for the exact same space; loading 50+ tool definitions upfront can consume roughly 77,000 tokens before you type a word, according to [Anthropic](https://www.anthropic.com/research/advanced-tool-use).
- **What tokens mean in pages:** At roughly 60 to 80 English words per 100 tokens ([Google Colab](https://colab.research.google.com/github/GoogleCloudPlatform/generative-ai/blob/main/gemini/long-context/intro_long_context.ipynb)), a 128,000-token window holds around 96,000 words, while a 1-million-token window holds roughly 750,000 words or 8 average English novels ([AWS Bedrock](https://aws.amazon.com/bedrock/anthropic/), [Google AI Studio](https://aistudio.google.com/docs/long-context)).
- **Why fresh chats fix accuracy:** Once a thread fills or overflows the desk, early instructions get pushed out or buried, and response latency rises; opening a new chat clears the desk and restores precision.

</div>

## The amnesia mystery: why chatbots forget rules you gave twenty minutes ago

You start a chat with clear rules: "Keep every answer under 150 words, use plain English, and never use bullet points." For the first five messages, the assistant follows every rule. Twenty minutes and twenty messages later, it suddenly writes a 500-word bulleted essay as if you never set any rules at all.

Nothing broke inside the AI. Unlike a human colleague who builds long-term memories as you talk, or a hard drive that saves files permanently, a language model has zero persistent memory of its own between messages. Each time you press Enter, the model wakes up fresh, reads whatever text fits into its short-term workspace, predicts the next reply, and immediately forgets everything again. That short-term workspace is called a **context window**, and as [Google AI Studio](https://aistudio.google.com/docs/long-context) explains, it works just like human short-term memory with a strict size limit.

## The working desk analogy: how everything competes for one fixed space

Picture the context window as a physical wooden desk of a fixed width. The model can only use what is sitting on top of that desk right now. If a document is in a filing cabinet across the room, or fell off the edge of the desk ten minutes ago, the model cannot see it.

Every item in a chat session takes up physical inches on that same tabletop:

- **Hidden system instructions:** Behind-the-scenes rules written by the app maker telling the assistant how to behave.
- **Tool menus and schemas:** Descriptions of external tools the assistant can use (web search, calendar, code runner). [Anthropic's engineering team](https://www.anthropic.com/research/advanced-tool-use) measured that loading 50+ Model Context Protocol (MCP) tool definitions upfront uses about 72,000 tokens, or roughly 77,000 tokens including the system prompt, before a user types anything.
- **Uploaded files and images:** Every PDF, spreadsheet, or screenshot you attach sits directly on the desk.
- **The entire conversation so far:** Every question you asked and every answer the AI wrote.
- **Internal thinking and the new reply:** In modern reasoning models, the [OpenAI API](https://developers.openai.com/api/docs/guides/conversation-state) and [Google AI Studio](https://aistudio.google.com/docs/long-context) both note that hidden thinking tokens and visible output tokens share the same context budget as your input.

To make token numbers concrete, here is how common context window sizes translate into everyday English text, using the standard benchmark of roughly 750 words per 1,000 tokens (60 to 80 words per 100 tokens from [Google's long-context guide](https://colab.research.google.com/github/GoogleCloudPlatform/generative-ai/blob/main/gemini/long-context/intro_long_context.ipynb), and ~750,000 words per 1M tokens from [AWS Bedrock](https://aws.amazon.com/bedrock/anthropic/)).

| Context window size | Approximate English words | Approximate single-spaced pages (500 words/page) | Everyday equivalent |
| --- | --- | --- | --- |
| 8,000 tokens | ~6,000 words | ~12 pages | One long magazine article |
| 32,000 tokens | ~24,000 words | ~48 pages | A short novella or business report |
| 128,000 tokens | ~96,000 words | ~192 pages | One full-length paperback novel |
| 1,000,000 tokens | ~750,000 words | ~1,500 to 2,500+ pages | 8 average English novels or 50,000 lines of code |

Product marketing often advertises "128K" or "1M tokens" as if that entire desk belongs to your prompt. In practice, hidden system prompts, tool definitions, uploaded files, and long AI replies claim a large share before you ever reach message ten.

## The hidden re-send loop: why every reply reads the whole thread again

Most users assume that when they type a short follow-up like "Make it shorter," the app sends only those three words to the AI. In reality, [OpenAI's conversation state guide](https://developers.openai.com/api/docs/guides/conversation-state) explains that standard model requests are completely stateless: the app must package and re-send the entire conversation history on every single turn.

Tracing Message 1 versus Message 20 shows why long threads slow down and lose earlier rules:

1. **Message 1 (empty desk):** You upload a 10-page PDF (~5,000 words, or ~6,700 tokens) and type a 50-token prompt. Even if the app's hidden system prompt and tool schemas take 15,000 tokens, the model sees ~21,750 tokens total. On a 128,000-token desk, over 80% of the surface is still open, and your opening rule sits right next to the question.
1. **Message 10 (crowded desk):** After ten rounds of detailed 600-token answers and follow-ups, plus a couple of web-search results pasted behind the scenes, the thread now holds 60,000+ tokens. Every time you ask a simple question, the model re-reads all 60,000 tokens from top to bottom. As [Google AI Studio](https://aistudio.google.com/docs/long-context) notes, longer inputs also increase time-to-first-token latency.
1. **Message 20 (overflowing desk):** Suppose the thread crosses the app's active window or hits a compaction threshold. To make room for your newest question and the model's reply, the app must either truncate the oldest messages at the front of the thread or replace them with a compressed summary.
1. **The rule disappears:** Because your formatting instruction was Message 1, it sits at the very front of the desk. When the app trims or summarizes old turns, that exact instruction is the first detail dropped or softened, so the model reverts to its default style.

Even before a thread hits the hard ceiling, attention degrades in huge, noisy contexts. [Google AI Studio's FAQ](https://aistudio.google.com/docs/long-context) specifically advises putting your key query or instruction at the end of a long prompt, after background documents, because models track recent instructions more reliably than rules buried thousands of tokens earlier.

## Context hygiene: three signs it is time to start a fresh chat

You do not need to count tokens with a calculator to get better answers. Treating chat threads like clean workbenches (one task per thread, cleared once finished) keeps both accuracy and speed high. Watch for these three signals that it is time to open a new chat:

- **Signal 1: The assistant ignores a rule you set at the top.** If you have to repeat a formatting rule, tone constraint, or negative rule ("do not include X"), the original instruction is either buried under tens of thousands of noisy tokens or already trimmed from the active window. Copy your core rule into a fresh chat instead of arguing inside the old thread.
- **Signal 2: You are switching to a new topic or document.** Mixing Monday's marketing brainstorm, Tuesday's Python error log, and Wednesday's contract PDF on the same desk forces the model to re-read unrelated clutter on every turn. That clutter wastes token budget, slows responses, and invites the model to blend details from the wrong task.
- **Signal 3: Replies become noticeably slower or vaguer.** Because the app re-sends the full thread on every turn, sluggish replies and generic phrasing are direct symptoms of an overloaded desk. Before opening a fresh thread, ask the current chat for a 10-bullet handoff summary of key decisions, then paste that clean summary as Message 1 in a new chat.

A context window is not a vault that remembers everything you ever told an AI. It is a fixed working desk: keep only the pages you need for the current job on top, and clear the surface whenever you start something new.

## Sources

- [Conversation state | OpenAI API - OpenAI Developers](https://developers.openai.com/api/docs/guides/conversation-state): Stateless multi-turn re-send mechanics, context window shared across input, output, and reasoning tokens, and truncation/compaction behavior.
- [Understanding and counting tokens | OpenAI Help Center](https://help.openai.com/en/articles/4936856-understanding-and-counting-tokens): Token definition and how tools, schemas, images, and files count toward context limits.
- [Long context - Gemini API | Google AI Studio](https://aistudio.google.com/docs/long-context): Short-term memory analogy, 1,048,576-token shared window, 50,000 lines of code / 8 novels benchmark, latency impact, and placing queries at the end of long context.
- [Introduction to Long Context Window with Gemini - Google Colab](https://colab.research.google.com/github/GoogleCloudPlatform/generative-ai/blob/main/gemini/long-context/intro_long_context.ipynb): 100 tokens equal to 60 to 80 English words conversion benchmark.
- [Claude by Anthropic - Models in Amazon Bedrock - AWS](https://aws.amazon.com/bedrock/anthropic/): 1M token context window equivalent to roughly 750,000 words or over 2,500 pages.
- [Introducing advanced tool use for Claude - Anthropic](https://www.anthropic.com/research/advanced-tool-use): ~72,000 tokens for 50+ MCP tool definitions (~77,000 tokens with system prompt) consumed before work begins.

<!--
Artwork brief — from the writer routine. Draw per docs/ARTWORK.md,
then delete this comment.

- **Argument in one sentence:** A fixed rectangular desk frame holds competing blocks of system rules, tool schemas, uploaded files, and chat turns, pushing the earliest instruction block off the left edge as a plum reply claims the right side.
- **Geometry:** One large horizontal desk rectangle divided into tightly packed vertical and horizontal blocks of varying widths; a dashed boundary on the left marks a displaced instruction block slipping past the frame edge, while a solid plum output block fills the rightmost slot.
- **Accent:** `{{plum}}`
- **Deliberate imperfection:** The leftmost rule block tilts slightly outside the desk's left border line, representing an early prompt falling out of the active window.
-->
