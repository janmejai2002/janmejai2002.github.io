---
title: 'Tool Calling Lets Text-Only AI Models Trigger Real Software Actions'
description: 'Language models only read and write text. Tool calling uses a two-turn JSON request slip so your app runs APIs, checks permissions, and returns live data.'
pubDate: 2026-11-18
publishedAt: '2026-11-18T22:51:26.616Z'
track: basics
question: 'How can a text-predicting AI model actually check live weather, query a database, or send an email?'
keywords:
  - AI Tool Calling Explained
  - Function Calling Mental Model
  - How AI Uses Tools
  - LLM JSON Request
heroImage: '../../assets/art/ai-tool-calling-explained-plain-english-light.webp'
heroImageDark: '../../assets/art/ai-tool-calling-explained-plain-english-dark.webp'
heroAlt: 'A geometric diagram on paper showing two separated chambers linked by a small plum-colored request slip passing through a central gate.'
readingTime: '7 min read'
notionId: '41cced67-050a-818b-8dc4-d12f233bedc7'
---
<div class="tldr">

## Executive TL;DR

- **Strict text boundary:** Large language models are frozen at training time and can only read and emit text, so they never browse the web, query a database, or send an email directly, per [Google Cloud](https://cloud.google.com/discover/what-is-model-context-protocol).
- **The two-turn handoff:** During tool calling, the model pauses and emits a structured JSON request naming a function and its arguments (`stop_reason: "tool_use"` in Claude or `tool_calls` in the [OpenAI API](https://developers.openai.com/api/docs/guides/function-calling)), while your surrounding application runs the real code and sends the output back.
- **Latency and context cost:** Every tool call adds at least one extra round-trip to the model plus external API wait time, and loading 50+ tool schemas upfront can consume roughly 72,000 tokens before any conversation begins, according to [Anthropic](https://www.anthropic.com/research/advanced-tool-use).
- **Standardized connectors:** The [Model Context Protocol (MCP)](https://modelcontextprotocol.io/docs/2026-07-28/getting-started/intro), introduced in November 2024, replaces custom `N × M` model-to-tool integrations with a single `N + M` JSON-RPC 2.0 interface built around user consent and permission gates.

</div>

## The text-only brain: why language models cannot touch the internet directly

Ask an AI assistant for today's weather in Delhi or the latest sales total in your company database, and it answers in seconds. That speed creates a misleading mental picture: many newcomers assume the neural network itself opens a browser tab, clicks a button, or logs into your inbox.

In reality, a language model has two hard limits documented by [Google Cloud](https://cloud.google.com/discover/what-is-model-context-protocol): its knowledge is frozen when training ends, and it has no direct way to interact with the outside world. Inside the model, there is no web browser, no SQL engine, and no email client. The model is a stateless text predictor. You hand it a block of text (your prompt plus conversation history), and it predicts the next tokens of text in reply.

Think of the model as a chef locked inside a quiet prep room, and the surrounding chat application as the waiter in the dining room. The chef knows thousands of recipes by heart, yet cannot walk out to the market or check today's fish delivery. When a customer asks for today's catch, the chef writes a short order slip and slides it through the kitchen window. The waiter walks to the storeroom, checks the crate, writes the answer on the slip, and slides it back inside so the chef can plate the final dish. In AI systems, that written order slip is called **tool calling** (also known as function calling).

## The request slip handoff: how tool calling turns words into actions

When an application sends your question to an AI model, it attaches a menu of available tools described in JSON Schema, as shown in the [OpenAI function calling guide](https://developers.openai.com/api/docs/guides/function-calling). Each menu entry gives the tool's name, a plain-English description of what it does, and the exact parameters it expects (such as `location` for a weather lookup).

If you ask a history question, the model answers in one pass and finishes. If you ask for live weather, the model recognizes that its training weights cannot answer, so it stops writing prose and outputs a structured JSON slip instead. In Anthropic's API, the model sets `stop_reason` to `"tool_use"` rather than `"end_turn"` and attaches a block with `name`, `input`, and a unique `id`, as explained in [CodeSignal's Claude tool-use guide](https://codesignal.com/learn/courses/developing-claude-agents-with-tool-integration-in-typescript/lessons/interpreting-claude-tool-responses).

| Aspect | Plain chat (no tools) | Tool calling (single tool lookup) |
| --- | --- | --- |
| Model passes required | 1 pass | At least 2 passes (request slip, then final summary) |
| Who runs external code | Nobody | The host application, never the model |
| Data freshness | Frozen at model training cutoff | Live, pulled from external APIs or databases |
| Primary failure mode | Model guesses or hallucinates | Wrong parameters chosen by model, or broken API |
| Safety boundary | Text moderation only | App-level permission prompt and schema validation |

Here is what happens behind the scenes versus what appears on your screen when you ask for the weather in Paris, adapted directly from the [OpenAI API documentation](https://developers.openai.com/api/docs/guides/function-calling):

- **Hidden JSON request slip emitted by the model:** `{"name": "get_weather", "arguments": {"location": "Paris"}, "call_id": "call_123"}`
- **Raw data returned by the host application:** `{"call_id": "call_123", "output": {"temperature": "25", "unit": "C"}}`
- **Friendly final sentence shown to you:** `The weather in Paris today is 25C.`

You never see the JSON slip or the raw temperature object unless you open a developer log. To you, it feels like one continuous thought, even though two separate systems just handed work back and forth across a strict boundary.

## Following one question step by step: from weather lookup to final summary

The [OpenAI function calling specification](https://developers.openai.com/api/docs/guides/function-calling) breaks every tool-augmented turn into five discrete steps. Tracing a single question from start to finish makes it clear where the model stops and where regular software takes over:

1. **The app sends your prompt plus the tool menu:** Your chat app packages `"What is the weather in Paris?"` alongside the JSON definitions of tools you have enabled, such as `get_weather(location)`.
1. **The model returns a tool call instead of an answer:** Seeing that it lacks live weather data, the model emits a `tool_calls` object naming `get_weather` with `{"location": "Paris"}` and pauses generation.
1. **The application executes the real software action:** Your app reads the JSON slip, validates the arguments, calls the external weather API over HTTPS, and receives `{"temperature": "25", "unit": "C"}`.
1. **The app makes a second request with the result:** Because the model API is stateless, the app sends the original prompt, the model's tool call, and the raw weather output tagged with the matching `call_id` back to the model.
1. **The model writes the human-readable summary:** Now holding the live `25C` reading in its input context, the model generates `"The weather in Paris today is 25C."` and marks the turn complete.

For multi-step tasks, such as querying a database and emailing the report to your manager, the app simply repeats steps 2 through 4 in a loop until the model emits a final text response instead of another tool call, a pattern [Google Cloud](https://cloud.google.com/discover/what-is-model-context-protocol) calls an agentic loop.

Historically, every AI app had to wire custom glue code for every external service, creating an `N × M` integration tangle across `N` tools and `M` AI clients. In November 2024, Anthropic introduced the open-source [Model Context Protocol (MCP)](https://modelcontextprotocol.io/docs/2026-07-28/getting-started/intro), which acts like a USB-C port for AI applications. Using JSON-RPC 2.0, an MCP host (such as an IDE or chat app) talks to standardized MCP servers for calendars, databases, or files, shrinking custom wiring from `N × M` integrations down to `N + M`, as [Databricks](https://www.databricks.com/blog/what-is-model-context-protocol) and [Google Cloud](https://cloud.google.com/discover/what-is-model-context-protocol) detail.

## Permissions and patience: why tool calling explains agent safety and latency

Once you see the request-slip boundary, two everyday quirks of modern AI assistants suddenly make complete sense: why they pause to ask permission, and why tool-using answers feel noticeably slower than plain chat.

First, **permission popups exist at the exact moment the app intercepts the slip.** Because the language model only writes text, it cannot bypass your operating system or send an email behind your back on its own. Every action passes through the host application before execution. Under [Google Cloud's MCP security principles](https://cloud.google.com/discover/what-is-model-context-protocol), hosts should require explicit user consent before exposing sensitive data or running state-changing tools, and inspect outputs before displaying them. When an assistant asks, "Allow me to send this email?", that is the host app pausing at Step 3 before honoring the model's JSON slip.

Second, **latency multiplies with every turn.** Plain chat needs one trip to the model. A single tool call requires two full trips to the model plus the network wait for the external API. A five-step research task that searches three pages and writes a file can require six or more model round-trips in sequence. Context size adds hidden drag too: [Anthropic's engineering research](https://www.anthropic.com/research/advanced-tool-use) found that loading 50+ MCP tool definitions upfront consumes roughly 72,000 tokens (~77,000 tokens including the system prompt) before the user types a single word. Switching to on-demand tool search preserved 191,300 tokens of working context compared with 122,800 tokens under upfront loading.

When a tool-using assistant gives a wrong answer or stalls, use this three-question checklist to pinpoint which side of the boundary failed:

- **Did the model pick the wrong tool or bad arguments?** That is an AI or schema-description failure: the model wrote a flawed JSON slip (for example, passing `"Delhi, US"` instead of `"Delhi, IN"`). Clearer parameter descriptions and `enum` constraints in the JSON schema can improve parameter accuracy by over 30%, per [Meta Intelligence](https://www.meta-intelligence.tech/en/insight-function-calling).
- **Did the external API time out, return an error, or send stale data?** That is an application or connector failure at Step 3: the model asked properly, and the waiter came back empty-handed.
- **Did a permission gate block execution?** That is a deliberate safety boundary working as designed, holding the JSON slip until a human approves the action.

Tool calling does not give a neural network hands. It gives a text predictor a structured way to ask real software for help, keeping the thinking inside the model and the execution inside your application's control.

## Sources

- [Function calling | OpenAI API - OpenAI Developers](https://developers.openai.com/api/docs/guides/function-calling): Five-step tool calling flow, JSON schema function definitions, `get_weather` Paris example, and `call_id` matching.
- [Understanding How Claude Uses Tools - CodeSignal Learn](https://codesignal.com/learn/courses/developing-claude-agents-with-tool-integration-in-typescript/lessons/interpreting-claude-tool-responses): `stop_reason` values (`"tool_use"` vs `"end_turn"`) and `name`, `input`, `id` fields in tool use blocks.
- [What is the Model Context Protocol (MCP)? - Model Context Protocol](https://modelcontextprotocol.io/docs/2026-07-28/getting-started/intro): Open-source standard overview, USB-C analogy, and supported AI clients and servers.
- [What is Model Context Protocol (MCP)? A guide - Google Cloud](https://cloud.google.com/discover/what-is-model-context-protocol): Frozen training weights, two-way JSON-RPC 2.0 bridge, `N x M` integration problem, and MCP security and user-consent principles.
- [Introducing advanced tool use for Claude - Anthropic](https://www.anthropic.com/research/advanced-tool-use): ~72,000-token upfront overhead for 50+ MCP tool definitions and 191,300 vs 122,800 preserved context tokens with on-demand tool search.
- [What is the Model Context Protocol (MCP)? - Databricks](https://www.databricks.com/blog/what-is-model-context-protocol): Reducing custom integrations from `N × M` to `N + M` via MCP client-server standardization.
- [LLM Function Calling: OpenAI Tools API, Multi-Step Tool Chains - Meta Intelligence](https://www.meta-intelligence.tech/en/insight-function-calling): JSON schema description and enum quality improving parameter generation accuracy by over 30%.

<!--
Artwork brief — from the writer routine. Draw per docs/ARTWORK.md,
then delete this comment.

- **Argument in one sentence:** A text-only language model on the left never crosses the boundary to external software on the right, passing only a compact structured request slip through a gated checkpoint.
- **Geometry:** Two tall rectangular chambers separated by a vertical border wall; the left chamber holds horizontal text lines, the right chamber holds modular software blocks, and a single plum-accented slip bridges a narrow central gate and loops back.
- **Accent:** `{{plum}}`
- **Deliberate imperfection:** The return arrow from the right chamber sits slightly lower than the outgoing request slip, marking the two-turn round-trip delay.
-->
