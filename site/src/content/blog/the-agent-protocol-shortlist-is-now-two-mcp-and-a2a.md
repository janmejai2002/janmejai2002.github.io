---
title: 'MCP and A2A Aren''t Rivals: How to Actually Use Both'
description: 'Google''s A2A protocol was built to complement Anthropic''s MCP, not replace it. Here''s how the two differ under the hood and when to use each.'
pubDate: 2026-09-03
track: technical
question: 'Should I build my agent stack on MCP, A2A, or both, and how do the two protocols actually differ under the hood?'
heroImage: '../../assets/art/the-agent-protocol-shortlist-is-now-two-mcp-and-a2a-light.webp'
heroImageDark: '../../assets/art/the-agent-protocol-shortlist-is-now-two-mcp-and-a2a-dark.webp'
heroAlt: '4 concentric circles drawn in thin ink lines on a paper ground. The outermost circle is drawn in a single accent colour and does not close — it stops short, leaving a gap.'
readingTime: '5 min read'
notionId: '3d0ced67-050a-81d4-8784-d6b03e8783eb'
---
<div class="tldr">

## Executive TL;DR

- Google launched the open [Agent2Agent (A2A)](https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/) protocol, with contributions from more than 50 technology partners including Atlassian, Box, Cohere, PayPal, Salesforce, and SAP, plus service providers such as Accenture, Deloitte, and McKinsey.
- Google frames A2A as complementary to Anthropic's Model Context Protocol rather than a replacement: MCP wires an agent to tools and data, A2A wires an agent to other agents ([Google Developers Blog](https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/)).
- MCP is a JSON-RPC client-server interface built for "secure context ingestion and structured tool invocation"; A2A is a peer-to-peer protocol built around capability-based Agent Cards for enterprise-scale task orchestration ([A Survey of Agent Interoperability Protocols](https://arxiv.org/abs/2505.02279)).
- A four-protocol academic survey proposes a phased stack, MCP for tool invocation, then ACP, then A2A for enterprise collaboration, then ANP for open agent markets, rather than picking one and discarding the rest ([A Survey of Agent Interoperability Protocols](https://arxiv.org/abs/2505.02279)).
- Elastic's engineering team already runs both inside one pipeline: MCP-connected tools feeding A2A-coordinated agents that research, write, edit, and publish news articles ([Elastic Search Labs](https://www.elastic.co/search-labs/blog/a2a-protocol-mcp-llm-agent-newsroom-elasticsearch)).

Ask an engineer in April 2025 whether they were on MCP or A2A and you'd get a blank stare, because most teams had only just finished wiring up MCP servers. Then Google shipped a second protocol with a name that sounded like a direct competitor. That's the wrong read. A2A doesn't touch the job MCP does. MCP gets an agent a tool. A2A gets an agent a coworker.

</div>

## MCP is a client asking a tool for data

MCP, built by Anthropic, runs a client-server model: an LLM-driven client connects to an MCP server over HTTP, SSE, or local stdio, and that server exposes tools, files, or APIs behind a fixed JSON schema ([Auth0](https://auth0.com/blog/mcp-vs-a2a/); [A Survey of Agent Interoperability Protocols](https://arxiv.org/abs/2505.02279)). The shape of a call is rigid on purpose. Auth0's walkthrough traces the sequence: the agent hits a question it can't answer from its own context, sends a structured request to the MCP server, the server checks permission and returns a result, and that result gets folded into the agent's working memory before it replies ([Auth0](https://auth0.com/blog/mcp-vs-a2a/)). One request, one typed response, done. Rakesh Gohel's breakdown of the same flow adds the piece Auth0 leaves implicit: an optional human-in-the-loop approval step sits between the LLM choosing a server and that server actually running ([Rakesh Gohel, LinkedIn](https://www.linkedin.com/posts/rakeshgohel01_both-mcp-and-a2a-have-changed-how-we-use-activity-7320066606284304386-IO-s)).

MCP was never built to let two agents negotiate. That gap is what A2A fills.

## A2A is one agent asking another agent to work

A2A connects a "client agent," which formulates a task, to a "remote agent," which acts on it. Discovery happens through an Agent Card: a public JSON file listing an agent's skills, endpoint, and authentication requirements, so a client can pick the right remote agent before sending anything ([Google Developers Blog](https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/)). Once matched, the two agents exchange a Task object with a unique ID that moves through a defined lifecycle, streamed over Server-Sent Events for long-running work or returned synchronously for quick ones; the output is called an artifact ([Google Developers Blog](https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/); [Rakesh Gohel, LinkedIn](https://www.linkedin.com/posts/rakeshgohel01_a2a-vs-mcp-which-one-to-choose-for-ai-agents-activity-7317888587155263488-40Xc)). If the task needs more input mid-flight, the client sends follow-up messages against the same Task ID through `tasks/send` or `tasks/sendSubscribe` rather than starting over ([Rakesh Gohel, LinkedIn](https://www.linkedin.com/posts/rakeshgohel01_a2a-vs-mcp-which-one-to-choose-for-ai-agents-activity-7317888587155263488-40Xc)). Messages also carry "parts," typed content blocks that let the two agents negotiate format on the fly, including iframes, video, and web forms ([Google Developers Blog](https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/)).

Google built A2A on standards already sitting in most stacks: HTTP, SSE, JSON-RPC.

## The academic case for stacking all four

The survey's authors examined MCP alongside A2A, plus two protocols with far less name recognition: the Agent Communication Protocol (ACP), a REST-native layer for multipart, session-aware messaging, and the Agent Network Protocol (ANP), which uses W3C decentralized identifiers for open-network agent discovery ([A Survey of Agent Interoperability Protocols](https://arxiv.org/abs/2505.02279)). Their recommendation isn't to pick a winner. It's a stack: start with MCP for tool invocation, add ACP for structured multimodal messaging, layer A2A on top for enterprise collaboration, and reach for ANP only when the use case is an open, decentralized agent marketplace ([A Survey of Agent Interoperability Protocols](https://arxiv.org/abs/2505.02279)). Each protocol solves a narrower problem than the last one up the stack solves, and none of the four subsumes the others.

## What the stack looks like in production

Elastic's search engineering team put this into an actual pipeline. Their November 13, 2025 writeup describes an "LLM Agent newsroom" where specialized agents research, write, edit, and publish news articles inside Elasticsearch, using MCP to give each agent its tools and A2A to hand tasks between them ([Elastic Search Labs](https://www.elastic.co/search-labs/blog/a2a-protocol-mcp-llm-agent-newsroom-elasticsearch)). That's the pattern the arXiv survey argues for in the abstract, run by an engineering team with production infrastructure at stake rather than a research group modeling it on paper.

## The gap neither protocol closes

None of this settles the question that actually worries people running these systems at scale. The unanswered questions are simple to state and hard to solve: how do you verify what an agent actually did, who approved it and under what policy, and can you trust the chain of interactions across multiple agents? MCP and A2A are complementary layers, not competing standards, and the architecture backs that up. Complementary building blocks still need a foundation under them, and audit trails aren't in either spec.

## Sources

- [Google Developers Blog: Announcing the Agent2Agent Protocol (A2A)](https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/)
- [arXiv: A Survey of Agent Interoperability Protocols: MCP, ACP, A2A, and ANP](https://arxiv.org/abs/2505.02279)
- [Auth0: MCP vs A2A: A Guide to AI Agent Communication Protocols](https://auth0.com/blog/mcp-vs-a2a/)
- [Rakesh Gohel, LinkedIn: Both MCP and A2A have changed how we use tools and AI agents](https://www.linkedin.com/posts/rakeshgohel01_both-mcp-and-a2a-have-changed-how-we-use-activity-7320066606284304386-IO-s)
- [Rakesh Gohel, LinkedIn: A2A vs MCP: which one to choose for AI Agents?](https://www.linkedin.com/posts/rakeshgohel01_a2a-vs-mcp-which-one-to-choose-for-ai-agents-activity-7317888587155263488-40Xc)
- [Elastic Search Labs: A2A Protocol and MCP: When to use which in Elasticsearch](https://www.elastic.co/search-labs/blog/a2a-protocol-mcp-llm-agent-newsroom-elasticsearch)

## Social Copy

### Twitter Thread

1/ Google's A2A protocol dropped and everyone assumed it was an MCP killer. It's not even in the same lane. MCP connects an agent to tools. A2A connects an agent to *other agents*. Different problem, different layer.

2/ MCP = one agent, one server, one typed request/response (JSON-RPC). A2A = Agent Cards for discovery, Task objects with lifecycles, streamed updates over SSE. One gets you a tool call. The other gets you a coworker.

3/ Elastic already runs both in production: MCP hands agents their tools, A2A hands tasks between agents in a full research→write→edit→publish pipeline. The real open question isn't which protocol to pick — it's who audits what an agent actually did once it's talking to another agent.

### LinkedIn Post

MCP and A2A keep getting framed as competing standards, but they solve different problems: MCP wires an agent to its tools and data, A2A wires agents to each other for task handoff and coordination. We break down how each protocol actually works under the hood — Agent Cards, Task lifecycles, JSON-RPC schemas — and why teams like Elastic are already running both together in production pipelines. The harder question the specs don't answer yet: once agents are delegating work to other agents, who's auditing the chain?

<!--
Artwork brief — from the writer routine. Draw per docs/ARTWORK.md,
then delete this comment.

- **Argument in one sentence** — *Argument in one sentence:** MCP and A2A sit at different layers of the same stack, one wiring agents to tools, the other wiring agents to each other, and neither closes the accountability gap between them.
- **Geometry** — *Geometry:** Two grids of dots stacked vertically, a dense small-radius grid on top (tools) and a sparser large-radius grid below (agents), joined by a field of straight hairlines running between corresponding points.
- **Accent** — *Accent:** mizu, because the piece is about process and how systems hand work between layers, not about any single measurement or dataset.
- **The deliberate imperfection** — *The deliberate imperfection:** one dot in the lower agent grid has no hairline connecting it upward to any tool dot, left isolated, carrying the unanswered question of who verifies what an unconnected agent actually did.
-->
