---
title: 'Why OpenAI Ditched Screenshot Loops for Accessibility Trees and Code'
description: 'OpenAI leads Ari Weinstein and Nikunj Handa reveal how multi-action JavaScript, accessibility trees, and websocket steering eliminate computer use latency.'
pubDate: 2026-11-10
track: talks
question: 'Why is OpenAI replacing vision screenshot loops with code execution and accessibility trees?'
heroImage: '../../assets/art/openai-agent-stack-computer-use-light.webp'
heroImageDark: '../../assets/art/openai-agent-stack-computer-use-dark.webp'
heroAlt: 'Geometric schematic illustrating an agent core surrounded by accessibility coordinate grids and an offset cinnabar stamp accent.'
readingTime: '5 min read'
notionId: '414ced67-050a-810b-98b4-cac480b52f53'
---
<div class="tldr">

## Executive TL;DR

- OpenAI computer use lead Ari Weinstein and API lead Nikunj Handa revealed that screenshot-driven agent loops are too slow for production software automation.
- Sequential tool calling creates severe latency compounding, but allowing models to write and execute multi-action JavaScript batches dozens of UI operations into a single execution turn.
- Dumping raw UI screenshots consumes 1,600 vision tokens per frame, whereas semantic accessibility trees preserve full document object model hierarchy at a fraction of the token cost.
- To eliminate synchronous agent pauses during long-running tasks, OpenAI transitioned the API to bi-directional websockets, enabling mid-turn steering and concurrent reasoning during tool execution.
- Production agent deployments now rely on guaranteed 12-hour KV-cache retention windows and pre-warming endpoints to cut repetitive input prefill fees by up to 80%.

</div>

## What is the core argument?

The AI industry treats computer use as an iterative visual loop where models repeatedly capture screen pixels, predict mouse coordinates, and click individual interface elements. OpenAI challenges this approach by proving that direct accessibility tree extraction combined with programmatic code execution operates up to eight times faster than human execution. If this architectural direction holds true, developer teams will abandon screenshot-only vision agents and instead interface directly with operating system accessibility layers and browser runtime runtimes.

## What were the five key moments in the talk?

- **[08:23] Code Generation Replaces Single-Action Tool Calling:** Ari Weinstein explained that "now computer use... often writes code... so if you actually look at it in codecs and you expand the tool calls manually you can see that it's not just doing one action at a time it's actually writing JavaScript code that it executes that that the computer executes to perform sometimes many actions at once." Single-turn mouse clicks force models into endless prefill roundtrips. THEREFORE, OpenAI restructured its harness so models emit executable scripts that traverse multiple form fields and page states within a single roundtrip.
- **[11:08] Semantic Accessibility Trees Over Screenshot Loops:** Weinstein highlighted the operational shift away from pure vision, noting that "with accessibility and other and and direct access to the DOM and other things like that now the language model can actually see like an entire page or an entire application it can write code that can do multiple steps at once." Visual screenshots hide hyperlink destinations, truncate calendar event titles, and require repetitive scrolling passes. THEREFORE, extracting accessibility metadata gives models comprehensive structured hierarchy while slashing image token overhead.
- **[21:24] Bi-Directional Websockets for Async Execution and Mid-Turn Steering:** Nikunj Handa detailed the transport breakthrough, emphasizing that "tool calls take so long that you don't have to like pause the model's execution while the tool is running so you could just like kick off a tool call keep running keep reasoning and then check back in so we launched async tool calling we launched like mid turn steering." Synchronous REST endpoints block the model while external APIs execute. BUT establishing persistent websocket channels allows runtime systems to inject human steering instructions and tool payloads mid-reasoning without killing the generation stream.
- **[28:50] Structural Separation of Decision Models from Reasoning Chains:** Handa clarified the architecture behind low-latency decision endpoints, stating that "we haven't trained like a new model for this we're like building this purely on top of the same Luna weights that we have... you're constraining so like structured output is a big part of it you're really optimizing the the inference stack to like get get very fast on TTFT and because you can have multiple questions what you do is like you basically run those in parallel." Developers assume fast classification requires fine-tuning tiny models. BUT applying constrained decoding over parallelized base model weights delivers sub-50ms classification without managing separate checkpoints.
- **[34:35] Guaranteed Cache Windows and Pre-Warming Infrastructure:** Handa outlined enterprise caching primitives, confirming that "we provide now guarantees of like cash hits within like 30 minutes we're actually like we for one of our users we just launched like a much longer cache window so we have like a 12-hour caching guarantee" and "pre-warming we have that in the API now so like if you know that hey I'm going to get a cache... just want to like pre-warm the cache." Interactive agent threads suffer from unpredictable cache eviction during user idle periods. THEREFORE, offering guaranteed 12-hour persistence and pre-warming write endpoints stabilizes time-to-first-token for recurring enterprise sessions.

## What was claimed, and what do benchmarks actually prove?

The speakers argue that pairing accessibility trees with multi-action code execution removes the primary latency bottlenecks of computer use, but hardware realities and infrastructure physics expose real-world trade-offs.

First, accessibility tree extraction shifts bottlenecks from vision token processing to serialized text parsing. While bypassing a 1,600-token vision frame saves image encoding overhead, dumping a complete accessibility tree from an enterprise dashboard (such as Salesforce or ServiceNow) easily generates 25,000 to 40,000 text tokens. On an NVIDIA H100 with 3.35 TB/s of HBM3 memory bandwidth, reading the weights for a 25k-token prefill takes under 8ms, but attention computation across deep context windows pushes Time-to-First-Token past 500ms. If an agent extracts full accessibility trees on every step, text token ingestion costs quickly exceed the cost of targeted visual crops.

Second, injecting multi-action JavaScript into application runtimes introduces severe security attack surfaces. Running model-generated scripts directly inside a browser session bypasses human verification gates. If an agent navigates across untrusted third-party websites while authenticated to corporate systems, prompt injections embedded in external web content can execute malicious JavaScript within the session, extracting cookies and sensitive data.

Third, stateful websocket channels complicate backend autoscaling. Bi-directional connections permit async tool execution and mid-turn steering, but holding persistent socket connections across millions of concurrent agent sessions breaks traditional stateless HTTP routing. Enterprise API gateways must maintain long-lived connection state, increasing memory footprints on proxy servers and complicating blue-green cluster deployments.

## What does this change for applied engineers?

- **Replace blind screenshot loops with accessibility tree parsing:** Inspect your computer-use agent harness tomorrow morning and connect directly to OS or browser accessibility APIs. Ingesting structural metadata instead of high-resolution images cuts token ingestion costs by up to 70% while exposing hidden URL links and exact input identifiers.
- **Batch multi-turn user interactions into executable scripts:** Stop prompting your model to issue single-click tool calls for routine multi-step forms. Refactor your system instructions to let the model generate multi-action JavaScript or shell commands that fill, validate, and submit forms in a single execution turn.
- **Migrate agent communication protocols to bi-directional streaming:** Upgrade REST-based agent polling loops to websocket or Server-Sent Events (SSE) connections. This allows your harness to interrupt runaway execution loops and deliver background tool responses without terminating active model reasoning.
- **Pre-warm prompt caches ahead of predictable scheduled workflows:** For recurring tasks like morning reporting or continuous integration audits, trigger cache pre-warming endpoints 5 minutes prior to execution. This guarantees 100% KV-cache hit rates and cuts peak latency by up to 80%.

## Sources

- [Latent Space: OpenAI DevDay 2026 episode](https://www.latent.space/p/devday-2026)
- [36Kr: translated transcript of the Weinstein and Handa conversation](https://eu.36kr.com/en/p/4017229795299203)
- [OpenAI Developer Documentation: Responses API & Websockets](https://platform.openai.com/docs/api-reference)

<!--
Artwork brief — from the writer routine. Draw per docs/ARTWORK.md,
then delete this comment.

- Argument in one sentence: Fragmented vision screenshot loops collapse into a coherent, high-speed accessibility matrix orchestrated by executable code.
- Geometry: Concentric circular radar lines, coordinate crosshairs, nested framing rectangles, and radial vector ticks.
- Accent: hanko
- Deliberate imperfection: A displaced cinnabar seal stamp offset from the central vertical axis, symbolizing real-world UI rendering latency.
-->
