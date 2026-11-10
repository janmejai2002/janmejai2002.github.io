---
title: 'What MCP Is, and Why Every AI Tool Is Adopting It'
description: 'How Anthropic''s Model Context Protocol standardizes AI integrations across tools, resources, and prompts using JSON-RPC, replacing one-off glue code.'
pubDate: 2026-09-01
track: technical
question: 'What is MCP, and why should I care that a tool ''supports MCP''?'
keywords:
  - what is MCP
  - Model Context Protocol explained
  - MCP connector
  - AI tool integration
  - JSON-RPC AI tools
heroImage: '../../assets/art/what-is-mcp-model-context-protocol-light.webp'
heroImageDark: '../../assets/art/what-is-mcp-model-context-protocol-dark.webp'
heroAlt: 'A row of 9 identical upright rectangles standing like columns. One rectangle leans out of alignment and is drawn in a single accent colour; the rest are upright ink outlines.'
readingTime: '5 min read'
notionId: '3ceced67-050a-81dd-9b51-c0775482d320'
---
<div class="tldr">

## Executive TL;DR

- [Anthropic open-sourced Model Context Protocol to standardize AI data connections](https://www.anthropic.com/news/model-context-protocol): "Introducing the Model Context Protocol: an open standard for connecting AI assistants to data systems."
- [MCP uses a client-server architecture based on JSON-RPC 2.0 transport](https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture): "Model Context Protocol relies on a client-server architecture using JSON-RPC 2.0 transport."
- [MCP defines three core primitives: Resources, Prompts, and Tools](https://modelcontextprotocol.io/specification/2026-07-28): "The specification exposes three fundamental primitives: Resources for read-only data, Prompts for templated workflows, and Tools for executable side-effects."
- [The spec was covered in InfoQ highlighting standardized ecosystem integrations](https://www.infoq.com/news/2024/12/anthropic-model-context-protocol/): "Anthropic Publishes Model Context Protocol Specification for LLM integration."
- [Open-source MCP servers exist across major platforms including GitHub, Notion, and Google Drive](https://github.com/modelcontextprotocol/modelcontextprotocol): "Specification and documentation for the Model Context Protocol with community connectors."

</div>

## What problem does MCP solve?

Before the [Model Context Protocol (MCP)](https://www.anthropic.com/news/model-context-protocol), connecting an AI agent to an external system required custom, bespoke glue code for every combination of client and tool. If you had 5 AI interfaces (Claude Desktop, Cursor, Zed, LangChain, custom CLI) and 10 enterprise data sources (GitHub, Postgres, Slack, Jira, Google Drive), engineering teams had to build and maintain 50 separate integration pipelines (an N × M integration bottleneck).

Whenever an API schema changed, every client wrapper broke independently.

```
Without MCP (N × M fragmentation):
[Claude Desktop] ──┬──> [Custom GitHub API Client]
[Cursor Editor]   ──┼──> [Custom Postgres Driver]
[Zed / CLI]       ──┴──> [Custom Slack Bot]

With MCP (Open USB-C standard for AI):
[Any AI Host / Client] ── JSON-RPC 2.0 ──> [Standard MCP Server] ──> [Data Source]
```

MCP standardizes this relationship by turning every external system into a lightweight server that speaks a unified protocol, reducing the ecosystem complexity from N × M custom integrations to N + M standardized connectors.

## The Architecture: Hosts, Clients, and Servers

The [MCP specification](https://modelcontextprotocol.io/specification/2026-07-28) divides responsibilities into three distinct architectural layers:

1. **The Host**: The user-facing application (e.g., Claude Desktop, Zed, Antigravity IDE) that coordinates the LLM, initiates conversations, and enforces user security boundaries.
2. **The Client**: An internal connector within the host application that maintains a 1:1 communication protocol with an MCP server.
3. **The Server**: A standalone process (running locally via `stdio` or remotely via `Streamable HTTP / SSE`) that exposes structured capabilities to the client.

Crucially, **the server never calls the LLM directly**. The server simply declares what it can do; the client negotiates capabilities and passes schemas to the LLM; the LLM chooses which tool to invoke; and the host prompts the human operator before executing sensitive side-effects.

## What are MCP's three core primitives?

MCP models all external interactions around three standardized primitives:

| Primitive | Nature | Typical Use Case | Example |
| :--- | :--- | :--- | :--- |
| **Resources** | Read-only | Files, database records, API logs, system metrics | `file:///var/log/syslog`, `postgres://users/schema` |
| **Prompts** | Interactive | Slash-command templates, persona definitions, workflows | `/review-pr`, `/debug-incident` |
| **Tools** | Executable | Functions that perform actions or mutate state | `execute_sql_query`, `send_slack_message`, `git_commit` |

Because resources are read-only, hosts can safely stream them into model context without human friction. Tools, by contrast, carry stateful side-effects and are explicitly gated by permission checks.

## Transport Layers: Local vs Remote

MCP supports two standard transport protocols under JSON-RPC 2.0:

- **Standard I/O (`stdio`)**: The client spawns the server as a local child process and communicates over `stdin` and `stdout`. This provides zero-network-latency local execution and avoids open network ports.
- **Streamable HTTP / Server-Sent Events (SSE)**: For remote servers, microservices, or shared enterprise infrastructure. The client sends JSON-RPC commands via HTTP POST, and the server streams progress updates and responses over SSE connections.

## Decision Matrix: Direct Tool Calling vs MCP

| Dimension | Direct API Tool Calling | Model Context Protocol (MCP) |
| :--- | :--- | :--- |
| **Portability** | Locked to a single agent framework / script | Runs in any MCP-compliant host (Claude, Cursor, Zed) |
| **Maintenance** | Client breaks on upstream API changes | Server updates independently; client interface stays static |
| **Security** | Hardcoded API keys in client environment | Server isolates secrets; client only receives JSON-RPC schema |
| **Discovery** | Hardcoded tool lists | Dynamic runtime discovery (`tools/list`, `resources/list`) |

## Frequently Asked Questions

### What does "supports MCP" actually mean for a tool?
It means the software runs an MCP server exporting its commands and data as standard JSON-RPC tools and resources. Any MCP-compatible AI application can instantly query it without custom plugins.

### Does MCP send my private codebase to Anthropic?
No. MCP is an open-source protocol, not a cloud service. When using local `stdio` transports, data flows directly between your local editor and the local server process running on your machine.

### Can MCP tools execute destructive commands without confirmation?
No. The host application enforces an explicit human-in-the-loop permission boundary. Before any MCP tool call with side effects is executed, the host requires user approval.

## Sources

- [Anthropic — Introducing the Model Context Protocol](https://www.anthropic.com/news/model-context-protocol)
- [Model Context Protocol Specification (2026-07-28)](https://modelcontextprotocol.io/specification/2026-07-28)
- [Model Context Protocol Architecture Guide](https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture)
- [InfoQ — Anthropic Publishes Model Context Protocol Specification](https://www.infoq.com/news/2024/12/anthropic-model-context-protocol/)
- [Model Context Protocol GitHub Reference Implementations](https://github.com/modelcontextprotocol/modelcontextprotocol)
