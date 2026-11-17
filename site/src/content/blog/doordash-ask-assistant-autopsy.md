---
title: 'DoorDash AI Autopsy: Cutting 16s Agent Loops to 2s with Precompute'
description: 'Ask DoorDash handled 2M+ chats, but 6-8 LLM calls pushed grocery turns to 30s until skill scoping and offline precompute cut latency to 2s.'
pubDate: 2026-11-15
publishedAt: '2026-11-15T20:36:26.291Z'
track: case-studies
question: 'How do you stop multi-turn commerce agents from hitting 30-second turn latencies and hallucinating live store inventory?'
heroImage: '../../assets/art/doordash-ask-assistant-autopsy-light.webp'
heroImageDark: '../../assets/art/doordash-ask-assistant-autopsy-dark.webp'
heroAlt: 'Geometric diagram contrasting a stalled six-node live agent loop in moss green against a direct precomputed batch vector.'
readingTime: '8 min read'
notionId: '419ced67-050a-81b5-a03f-c09addf9e1f6'
---
<div class="tldr">

## Executive TL;DR

- **Two million sessions on ADK and MCP**: Launched in mid-2026 across Restaurant and Grocery, [Ask DoorDash handled over two million conversations](https://careersatdoordash.com/blog/building-ask-doordash-part-four-a-platform-for-building_and_evolving_agents/), and adding a third domain agent (Reservations) took one week, roughly 10x faster than the initial two-month build.
- **The 20 to 30 second grocery turn**: In [DoorDash's engineering overview](https://careersatdoordash.com/blog/building-doordash-assistant-an-engineering-overview/), a single un-optimized grocery turn triggered 6 to 8 LLM calls and stuffed low hundreds of thousands of input tokens into context, stretching end-to-end turn latency to 20 to 30 seconds.
- **50% to 60% instruction token cut**: Modularizing agent capabilities into dynamically loaded skills reduced median instruction payloads from ~42,000 tokens to ~20,000 tokens in Restaurant (50%+ cut) and from ~25,000 tokens to ~10,000 tokens in Grocery (60% cut).
- **16s to 2s offline-to-online split**: Moving stable 90-day purchase history reasoning into a daily Spark and Metaflow batch LLM job cut [grocery reorder latency from roughly 16 seconds to 2 seconds](https://careersatdoordash.com/blog/building-ask-doordash-part-6-grocery-reorder-case-study/), doubled list view rates, and lifted reorder flow order conversion by ~34%.
- **R&D investment against gross margin**: In [DoorDash's Q3 2026 financial results](https://ir.doordash.com/news/news-details/2026/DoorDash-Releases-Third-Quarter-2026-Financial-Results/default.aspx) (993 million orders, $4.62 billion revenue), GAAP R&D rose 41% year-over-year to $499 million while GAAP gross margin expanded from 49.0% to 50.1%.

</div>

## 1. The Deployment

DoorDash built Ask DoorDash as an orchestration layer over its existing local-commerce services rather than a standalone chatbot. Client apps on iOS send text, image, or voice inputs to a Gateway built with the Vercel AI SDK, which translates HTTP streams into Agent2Agent (A2A) streaming gRPC calls and pushes partial text and interactive widget payloads back to the client over Server-Sent Events (SSE).

Behind the Gateway, an Orchestrator routes each turn to specialized domain agents (`Restaurant`, `Grocery`, and `Reservations`) built on Google's Agent Development Kit (ADK). A unified model factory selects weights per role (routing, discovery, summarization) with cross-provider fallback, allowing DoorDash to swap models within a week of release without code deployments. Two consecutive model swaps cut p50 turn latency by 35% and then by another 40% while holding evaluation rubric scores flat.

State and tooling are separated from prompt text. Managed Agent Services stores three distinct state objects: `Session` (turn history and tool results), `Memory` (long-term batch preferences, realtime session intent, and reconcilable agentic facts), and `Artifacts` (versioned shopping lists and store cards). Every external action runs through a shared Model Context Protocol (MCP) server exposing more than 60 typed tools, where deterministic service code enforces permissions and business rules on every call.

Each conversational turn follows six sequential steps:

1. Gateway translation: The Gateway authenticates the consumer, attaches entry-point scope (such as store ID or reorder intent), and converts the request into an A2A stream.
1. Orchestrator routing or pinning: On turn one, the Orchestrator selects the domain agent; on follow-up turns, agent pinning bypasses the Orchestrator completely unless the agent detects an out-of-scope topic shift.
1. Skill selection: The domain agent loads only the task-relevant skill (such as `search-discovery`, `cart-ordering`, or `reorder`), keeping unused instructions out of the context window.
1. Memory and live grounding: The agent queries `memory_search` and calls MCP catalog tools (`find_nearby_stores`, pricing, deals, inventory) to reconcile stored preferences against current store availability.
1. Deterministic artifact assembly: The agent writes or updates a versioned shopping-list or store-card `Artifact` backed by live catalog IDs and real subtotals.
1. SSE streaming and direct edits: The Gateway streams text deltas and interactive widgets to the client, where consumers swap items or edit quantities directly against the `Artifact` without triggering an LLM round trip.

## 2. The Balance Sheet

In local commerce, generative AI competes directly against fast, deterministic tap-and-scroll search. Waiting 20 to 30 seconds for a shopping list kills conversion, while paying frontier API rates on low hundreds of thousands of input tokens per turn threatens order-level contribution margins across 993 million quarterly orders.

DoorDash attacked both cost and latency by trimming context at runtime and shifting slow historical reasoning into offline batch pipelines. Skill-scoped loading immediately halved prompt instruction overhead, while model swaps cut p50 latency twice (35%, then 40%). For grocery reorders (which represent roughly one in three DoorDash orders), DoorDash moved 90-day purchase history analysis out of the live request path entirely, running daily sharded Metaflow batch LLM jobs over selected active cohorts and caching validated "usuals" bundles in a low-latency key-value store.

| Architecture or Financial Metric | Un-Optimized Agent Path | Optimized Platform (Skills + Batch Split) | Measured Impact |
| --- | --- | --- | --- |
| Restaurant Instruction Tokens (Median) | ~42,000 tokens (all skills) | ~20,000 tokens (skill-scoped) | 50%+ token cut per turn |
| Grocery Instruction Tokens (Median) | ~25,000 tokens (all skills) | ~10,000 tokens (skill-scoped) | 60% token cut per turn |
| Grocery Turn / Reorder Latency | 20–30s (6–8 LLM calls) / ~16s | ~2s (precomputed bundle + live lookup) | ~8x faster reorder path |
| Reorder Flow Conversion & Views | Baseline live agentic path | Offline-to-online cached bundle | 2x list views; +34% order rate |
| Q3 2026 Revenue & Gross Margin | $3.45B / 49.0% (Q3 2025) | $4.62B / 50.1% (Q3 2026) | +34% rev; +110 bps margin |
| Q3 2026 GAAP R&D Expense | $355 million (Q3 2025) | $499 million (Q3 2026) | +41% YoY (1.5% of GOV) |

In its [Q3 2026 financial release](https://ir.doordash.com/news/news-details/2026/DoorDash-Releases-Third-Quarter-2026-Financial-Results/default.aspx), DoorDash reported $4.616 billion in revenue (+34% YoY), $33.941 billion in Marketplace GOV (+36% YoY), and $1.780 billion in Contribution Profit (5.2% of GOV). GAAP R&D rose 41% year-over-year to $499 million (and capitalized software development reached $375 million over the first nine months of 2026, up from $235 million in 2025) as the company funded AI infrastructure, autonomy, and personnel. Because DoorDash also incurred $51 million in 9M 2026 restructuring charges and announced a $17 billion agreement to acquire Instacart, management explicitly framed digital AI agents as a conversion and basket-building layer rather than a direct substitute for its physical logistics network.

## 3. The Edge Cases and Breakages

Running stateful shopping agents against volatile local-commerce data exposed four concrete production failure modes:

- Live catalog grounding drift: Early production traffic revealed that grounding errors were the largest failure category. Agents recommended restaurants that had just closed, quoted stale menu prices, or told consumers an item was added to the cart when the backend write failed. DoorDash fixed this by requiring every consumer-visible claim to originate from an MCP tool call against the live system of record on the active turn.
- Memory versus live inventory collisions: Long-term memory records facts like "prefers Oatly" or "$60 weekly budget." When the nearest store ran out of Oatly or the cheapest qualifying cart totaled $72, early agents blindly forced memory constraints over reality. DoorDash redesigned writes as reconcilable (never append-only, and strictly blocking health or medical data) and forced turn-level reconciliation against live store availability and pricing.
- Brittle merchant SKU identifiers: In offline-generated reorder bundles, persisting only historical store item IDs broke whenever a grocer relisted or discontinued a product. DoorDash had to encode every recurring need at three fallback tiers: store item ID first, catalog product ID second, and generic search term third, backed by deterministic validation code that checks output schemas and drops malformed bundles before serving.
- 2025 state amnesia and prompt bloat: Earlier 2025 DoorDash agent prototypes failed because agents forgot or misused facts from prior turns, while adding new domain features stuffed 42,000 tokens of conflicting instructions into every prompt. Moving state into Managed Agent Services and gating instructions behind dynamic skill selectors resolved the amnesia and instruction collisions.

Because an erroneous checkout charges a real credit card and dispatches a physical courier, DoorDash enforces a strict consumer-in-the-loop boundary:

1. No silent checkout commits: The Assistant builds and updates shopping-list `Artifacts`, but never places an order or mutates a final checkout cart without explicit consumer confirmation.
1. Direct widget bypass: When a consumer wants to swap a yogurt flavor or delete an item, they tap the UI widget directly, mutating the `Artifact` through the Gateway with zero LLM involvement.
1. Explicit abstention and clarification: If order history lacks sufficient signal for a reorder bundle, the offline validator abstains cleanly; if a recipe request is ambiguous, the agent asks which pantry staples the consumer already owns.
1. Simulator and shadow gating: Before any prompt or model change ships, failure clusters detected by calibrated LLM-as-judge online evals are replayed in a fixture-based Conversation Simulator and blocked if rubric pass rates drop.

## 4. The Reusable Blueprint

Engineering teams building transactional or tool-heavy agents can copy four concrete patterns from DoorDash's architecture:

1. Separate offline historical reasoning from live catalog resolution: Never burn 6 to 8 live LLM calls re-analyzing 90 days of user history while a customer waits on a loading spinner. Precompute stable user intent in batch jobs, cache validated bundles, and spend live turn latency only on volatile inventory and pricing lookups (cutting 16s turns to 2s).
1. Gate instructions and tools behind dynamic skills: Once a domain agent crosses a few dozen capabilities, monolithic system prompts bloat to 25,000 to 42,000 tokens and cause instruction interference. Load only the active skill's prompt and tools per turn to cut instruction token burn by 50% to 60%.
1. Make UI edits mutate versioned artifacts directly: Do not force users to type natural language ("remove the yogurt") and pay for another LLM round trip for simple state edits. Store outputs as versioned `Artifacts` with stable IDs so UI taps update state deterministically while the LLM stays idle, then pass the updated artifact on the next conversational turn.
1. Enforce business rules in MCP tool code, not prompts: Prompt instructions are advisory and drift across model upgrades. Expose narrow, typed MCP tools where deterministic backend code validates permissions, budgets, and catalog IDs on every invocation.

## Sources

- [Building DoorDash Assistant: An engineering overview](https://careersatdoordash.com/blog/building-doordash-assistant-an-engineering-overview/): June 11, 2026 architecture post detailing 6-8 LLM calls per grocery turn, 20-30s latency, ADK, A2A, MCP, and Managed Agent Services.
- [Building Ask DoorDash (Part 4): A Platform for Building and Evolving Agents](https://careersatdoordash.com/blog/building-ask-doordash-part-four-a-platform-for-building_and_evolving_agents/): July 24, 2026 post reporting 2M+ conversations, 1-week Reservations launch, 50-60% skill token cuts, and 35%/40% p50 latency drops.
- [Building Ask DoorDash (Part 6): A Grocery Reorder Case Study](https://careersatdoordash.com/blog/building-ask-doordash-part-6-grocery-reorder-case-study/): September 25, 2026 post documenting the 16s-to-2s offline-to-online pipeline, 2x list views, and ~34% order rate lift.
- [DoorDash Releases Third Quarter 2026 Financial Results](https://ir.doordash.com/news/news-details/2026/DoorDash-Releases-Third-Quarter-2026-Financial-Results/default.aspx): October 29, 2026 financial release reporting $4.62B revenue, 993M orders, 50.1% GAAP gross margin, and $499M R&D expense.

<!--
Artwork brief — from the writer routine. Draw per docs/ARTWORK.md,
then delete this comment.

- Argument in one sentence: Moving stable historical reasoning into offline batch jobs collapses 16-second multi-call agent loops into a 2-second live catalog lookup.
- Geometry: A Cartesian grid showing two parallel tracks: an upper multi-step loop of six connected nodes stalling before a vertical 2s boundary, and a lower precomputed straight path crossing it cleanly.
- Accent: moss
- Deliberate imperfection: A broken, offset loop node in moss green where the live 16-second agent chain stalls while the precomputed batch line bypasses it.
-->
