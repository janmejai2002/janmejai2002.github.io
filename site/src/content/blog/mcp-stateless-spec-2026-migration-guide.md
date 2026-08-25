---
title: 'MCP Just Deleted Its Own Session Model. Here''s What Changes.'
description: 'MCP''s July 2026 spec deleted sessions entirely. What breaks, what "stateless" actually means, and how to migrate a production server.'
pubDate: 2026-08-25
track: technical
keywords:
  - MCP stateless spec
  - Model Context Protocol 2026-07-28
  - MCP session removed
  - MCP server architecture
  - stateless MCP migration
  - MCP production deployment
readingTime: '8 min read'
heroImage: '../../assets/art/mcp-stateless-spec-2026-migration-guide-light.webp'
heroImageDark: '../../assets/art/mcp-stateless-spec-2026-migration-guide-dark.webp'
heroAlt: 'A thick horizontal bar runs in from the left and stops at a short red vertical mark. Beyond it the line continues only as a faint dashed rule, along which four evenly spaced teal rings sit, each holding a single dot at its centre.'
notionId: '3c7ced67-050a-81d6-bf44-efd702510d15'
---
<div class="tldr">

## Executive TL;DR

- The `2026-07-28` MCP spec removes protocol-level sessions and the `initialize` handshake: no `Mcp-Session-Id` header, and every request carries its own protocol version and capabilities in `_meta` (SEP-2567, SEP-2575).
- "Stateless" is a claim about the protocol core, not your server — cross-call state moves to handles you mint yourself (a `basket_id` the model passes back), the way REST has always done it.
- Two new required headers, `Mcp-Method` and `Mcp-Name`, expose method and tool name at the HTTP layer, so gateways can route and rate-limit without parsing JSON-RPC bodies.
- The same release makes RFC 9207 issuer verification and RFC 8707 resource indicators mandatory, closing the confused-deputy attack where a token minted for Server A also works against Server B.
- All Tier 1 SDKs (TypeScript, Python, Go, C#) supported the new spec at release, so for most teams this is an upgrade, not a rewrite — but sticky routing, session stores, and `initialize` gates are now dead weight to remove.
- Roots, Sampling, and Logging are deprecated with a minimum 12-month removal window, and the old HTTP+SSE transport is formally Deprecated — the runway is months, not years.

</div>

On July 28, 2026, the Model Context Protocol deleted the one thing every production MCP server was built around: the session.

No `initialize` handshake. No `notifications/initialized`. No `Mcp-Session-Id` header. If you run an MCP server behind sticky routing, or you built a session store because a tutorial told you to, the ground moved under you and most of the coverage since has been too busy explaining the changelog to tell you what to do about it.

## What actually got removed

Two changes do almost all the damage, and the official changelog is specific about both ([SEP-2567](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2567), [SEP-2575](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2575)):

- **Protocol-level sessions are gone.** The `Mcp-Session-Id` header is removed from Streamable HTTP. `tools/list`, `resources/list`, and `prompts/list` no longer vary per connection — every client gets the same list for the same request, because there's no connection state left to vary it by.
- **The handshake is gone.** No more `initialize` / `notifications/initialized` exchange at connection start. Every request now carries its own protocol version and client capabilities inline, in a `_meta` block (`io.modelcontextprotocol/protocolVersion`, `io.modelcontextprotocol/clientCapabilities`). A new `server/discover` RPC lets a client ask a server what it supports before committing to anything, and clients get an explicit `UnsupportedProtocolVersionError` on mismatch instead of a handshake failure.

The practical effect: an MCP request is now self-describing. Any request can land on any server instance, because nothing about processing it depends on what happened on a prior request. That's what "stateless" means here — it's a statement about the protocol's core, not a claim that your server can't hold state at all. If your tool needs to remember something between calls (a shopping basket, a browser session, a half-finished multi-step task), you mint your own handle — a `basket_id`, a `session_token` as an ordinary string — and have the model pass it back as a tool argument on the next call. That's exactly how REST APIs have always handled state, and it's now MCP's official answer too.

Two more changes in the same release matter if you're running anything non-trivial in production. `resources/subscribe` and the streaming GET endpoint are replaced by a single `subscriptions/listen` stream that a client opts into per notification type. And SSE stream resumability — the `Last-Event-ID` header, event redelivery — is gone; if a response stream breaks mid-request, the client re-issues the whole request with a new ID rather than resuming where it left off.

## Is MCP just an API again?

This is the question InfoQ's Steef-Jan Wiggers put directly to the developer community in an August 12 piece — MCP goes stateless, so did it just become a slightly awkward REST API with extra ceremony ([InfoQ](https://www.infoq.com/news/2026/08/mcp-stateless-gateway/))?

The honest answer is: closer than it used to be, and that's the point. Before this release, information about what a request was doing lived only inside the JSON-RPC body — a gateway or load balancer couldn't route or rate-limit intelligently without parsing every payload. The new spec requires two headers on Streamable HTTP POST requests, `Mcp-Method` and `Mcp-Name`, that expose the method and tool name at the HTTP layer. Cloudflare's Matt Carey, quoted in the same piece, points out that this cuts the other way from "MCP got demoted to an API" — it means infrastructure can now do custom routing, and tool arguments can be selectively surfaced as headers for gateway-level policy, without touching the body at all.

What MCP still does that a REST API doesn't: `tools/list` gives an LLM a machine-readable, self-describing catalog of what a server can do, with JSON Schema in and out. A REST API needs an OpenAPI spec bolted on separately, usually out of date. MCP's schema and its transport travel together, by design, for exactly one consumer: a model deciding what to call next. That's a narrower, more specific job than "generic API," and it's the reason the protocol didn't just fold into REST when the sessions came out.

## The security changes: RFC 9207 and RFC 8707

Two authorization changes shipped in the same release and get far less attention than the statelessness headline, which is a mistake, because they close a real attack class.

**Issuer verification (RFC 9207).** Authorization servers should now include an `iss` parameter in the authorization response, and MCP clients must validate it against the recorded issuer before redeeming an authorization code. Without this, a malicious authorization endpoint can hand back a code that looks legitimate but was minted by the wrong issuer.

**Resource indicators (RFC 8707).** MCP clients must specify, in both the authorization request and the token request, the exact resource (the specific MCP server) a token is being requested for. Here's the attack this closes: without a resource indicator, an authorization server issuing tokens for multiple services can hand out a token whose `aud` claim is generic enough to work against more than one of them. A client authenticates against Server A, gets a token, and that same token turns out to be valid against Server B too — because nothing at issuance time bound it to A specifically. A malicious or compromised Server B can then present that token to some other privileged service and get treated as if it were the legitimate client of Server A. That's the textbook confused-deputy pattern: server B is confused into acting with authority it was never actually granted. Resource indicators fix it by forcing the authorization server to commit to a specific `aud` at issuance, so a token minted for Server A is cryptographically useless against Server B.

Neither RFC is new — both predate this MCP release by years — but making them mandatory, in the same spec revision that opens servers up to simpler, more anonymous-looking stateless requests, is a deliberate pairing. Removing sessions makes it easier to stand up MCP servers casually; RFC 9207 and RFC 8707 are the spec authors' answer to what that casualness would otherwise cost you on the auth side.

## Migration checklist for an existing production server

If you're running an MCP server built against `2025-11-25` or earlier, here's what actually changes in your code:

1. **Delete your session store and sticky-session routing.** If you built Redis-backed session state, a consistent-hashing load balancer config, or anything to keep a client pinned to one server instance, it's dead weight now — the protocol no longer needs it, though your application might still want its own state (see below).
1. **Stop reading **`Mcp-Session-Id`**.** It won't be sent. If your server rejects requests without it, that's now a bug.
1. **Remove the **`initialize`** handler as a gate.** Requests won't arrive with a handshake first. Read protocol version and capabilities from `_meta` on every request instead.
1. **Implement **`server/discover`**.** This is now required, not optional — it's how clients probe your server's supported versions and capabilities before or instead of relying on a handshake.
1. **If your tools need cross-call state, mint your own handle.** Return an explicit ID as part of a tool's structured output, and expect the model to pass it back as a plain argument on the next call. Don't try to rebuild sessions at the application layer just because you had them at the protocol layer before.
1. **Update your OAuth flow for RFC 9207 and RFC 8707** if you're using MCP's authorization spec at all — validate `iss`, and start sending a `resource` parameter scoped to your server's own URI.
1. **Check your SDK version.** The official announcement states that all Tier 1 SDKs — TypeScript, Python, Go, and C# — plus the beta Rust SDK support the new specification immediately, so for most teams this is an upgrade, not a rewrite.

The Model Context Protocol blog's own announcement is candid that there's real "migration cost, especially for developers that did depend on session identifiers," but notes that feedback from early testing simplified the upgrade path before the spec finalized ([Model Context Protocol Blog](https://blog.modelcontextprotocol.io/posts/2026-07-28/)).

## What stateless deployment actually looks like

The concrete payoff of all this: an MCP server can now sit behind a plain round-robin load balancer, with no shared session store, no sticky routing, and no coordination between instances about who's currently "connected" to whom — because nothing is connected in the protocol sense anymore. That makes MCP servers deployable on serverless platforms and behind standard horizontal-scaling infrastructure in a way they genuinely weren't before, when a session tied to one process meant a client had to keep hitting that same process for the life of the interaction.

Google's developer blog, writing about scaling AI agent infrastructure under the new spec, frames this as the core operational win: request-level statelessness is what lets MCP deployments use the same infrastructure patterns teams already run for ordinary HTTP APIs, instead of needing MCP-specific session affinity built into the load balancer ([Google Developers Blog](https://developers.googleblog.com/scaling-ai-agent-infrastructure-with-the-mcp-stateless-updates/)).

## FAQ

**Does this break backward compatibility with older clients?** Partially, by design. Clients from earlier protocol versions that don't send a `resultType` field are treated as `"complete"` by spec fiat, which keeps simple cases working. But anything relying on `Mcp-Session-Id` or the old handshake will fail outright against a server that's fully moved to `2026-07-28`.

**Do I need to migrate right now?** Not urgently if you're on a stable, working `2025-11-25` deployment and your SDK hasn't forced the upgrade. But the HTTP+SSE transport (deprecated since `2025-03-26`) is now formally in the Deprecated lifecycle state, and Roots, Sampling, and Logging are deprecated with a minimum 12-month removal window — so the runway is finite, not indefinite.

**Can I still run something that behaves like a stateful session if I want to?** Yes, at the application layer. The protocol won't do it for you anymore, but nothing stops you from returning a handle from a tool call and having your own code track what that handle means server-side.

## Migrate now, or wait?

If you're standing up a new MCP server today, build it against `2026-07-28` — there's no reason to inherit a session model the spec authors just spent an entire release removing. If you're maintaining one already in production, the SDK-level upgrade is likely low-risk for most teams per the official migration notes, but budget real time for the parts that touch your infrastructure: pulling out sticky routing, retiring a session store, and updating your OAuth flow for RFC 9207 and RFC 8707 if you use MCP-native authorization. The deprecation windows give you months, not years, before the older transport and handshake patterns stop being supported at all.

## Sources

- [Model Context Protocol Blog — The 2026-07-28 Specification](https://blog.modelcontextprotocol.io/posts/2026-07-28/)
- [Model Context Protocol — Key Changes / Changelog, 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28/changelog)
- [InfoQ — "MCP Goes Stateless, and Developers Ask Whether That Just Makes It an API Again"](https://www.infoq.com/news/2026/08/mcp-stateless-gateway/)
- [Google Developers Blog — Scaling AI Agent Infrastructure with the MCP Stateless Updates](https://developers.googleblog.com/scaling-ai-agent-infrastructure-with-the-mcp-stateless-updates/)
- [SEP-2567 — Remove protocol-level sessions](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2567)
- [SEP-2575 — Make MCP stateless](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2575)
- [RFC 9207 — OAuth 2.0 Authorization Server Issuer Identification](https://datatracker.ietf.org/doc/html/rfc9207)
- [RFC 8707 — Resource Indicators for OAuth 2.0](https://datatracker.ietf.org/doc/html/rfc8707)
