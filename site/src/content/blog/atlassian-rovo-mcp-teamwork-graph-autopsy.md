---
title: 'Atlassian Rovo Autopsy: 85% Gross Margins and Hidden MCP Seams'
description: 'Atlassian runs 15M daily MCP calls at 85% GAAP gross margin, but auth seams, silent scope filters, and Dec 2026 credit billing catch agent teams.'
pubDate: 2026-11-22
publishedAt: '2026-11-22T20:06:32.319Z'
track: case-studies
question: 'Does Atlassian''s Teamwork Graph and MCP Server cut agent costs without hiding auth and rate-limit traps?'
heroImage: '../../assets/art/atlassian-rovo-mcp-teamwork-graph-autopsy-light.webp'
heroImageDark: '../../assets/art/atlassian-rovo-mcp-teamwork-graph-autopsy-dark.webp'
heroAlt: 'A stack of 11 thin horizontal rules of equal length, like lines of text. One rule is interrupted mid-way, and its continuation is shifted slightly downward and drawn in a single accent colour.'
readingTime: '8 min read'
notionId: '420ced67-050a-8126-9728-d5017aa7aee6'
---
<div class="tldr">

## Executive TL;DR

- Atlassian [reported](https://s206.q4cdn.com/270053503/files/doc_financials/2027/q1/TEAM-Q1-2027-Earnings-Release.pdf) $1,772 million in Q1 FY2027 revenue (up 24% year over year) and 85% GAAP gross margin (up from 82% a year earlier) while scaling AI across more than 87% of its enterprise Cloud customers.
- Its hosted Model Context Protocol (MCP) server handles over 15 million daily tool calls for 2 million monthly users, and [rebuilt v2 tooling](https://www.atlassian.com/blog/company-news/team26-europe-atlassian-mcp) cuts Claude token consumption by up to 25% across 220+ tools.
- Pre-assembled context from the 250-billion-object [Teamwork Graph](https://www.atlassian.com/blog/company-news/closing-the-ai-context-gap) delivered 44% better answer quality using 48% fewer tokens in internal benchmarks.
- Production deployments hit hard seams: no single credential reaches all five Atlassian products on Rovo MCP, legacy or broad-scoped API tokens silently hide Jira and Confluence tools, and parallel bursts trigger undocumented HTTP 429 throttles around 20 concurrent calls.
- Starting December 3, 2026, [pay-as-you-go Rovo credit billing](https://support.atlassian.com/rovo/docs/rovo-usage-limits/) turns on by default at $0.01 per credit ($10 per 1,000 credits), charging 1 to 10 credits per enriched Teamwork Graph call.

</div>

## 1. The Deployment

Atlassian built its enterprise AI stack around a context graph rather than a standalone chatbot. In its [Q1 FY2027 earnings call](https://www.fool.com/earnings/call-transcripts/2026/11/06/atlassian-team-q1-2027-earnings-call-transcript/), CEO Mike Cannon-Brookes reported that more than 87% of enterprise Cloud customers now use Rovo, driving 10 million monthly human-agent collaborations (double the level six months earlier) and 9x year-over-year growth in agentic automation.

Four layers make up the production architecture:

1. **Teamwork Graph**: A permission-aware knowledge graph storing more than [250 billion objects and relationships](https://www.fool.com/earnings/call-transcripts/2026/11/06/atlassian-team-q1-2027-earnings-call-transcript/) across Jira, Confluence, Loom, Bitbucket, Jira Service Management, and over 80 third-party connectors (including GitHub, Google Drive, SharePoint, Slack, and Salesforce).
1. **Atlassian AI Gateway and Model Blending**: Rather than training a frontier foundation model, Atlassian routes prompts across blended third-party models through an internal AI Gateway, pairing external models like OpenAI's ChatGPT and Codex or Anthropic's Claude with Teamwork Graph retrieval.
1. **Agentic Multiplayer Protocol (AMP)**: Announced at [Team '26 Europe](https://s206.q4cdn.com/270053503/files/doc_financials/2027/q1/TEAM-Q1-2027-Earnings-Release.pdf), AMP gives agents distinct non-human identities, `@mention` attribution, Jira assignment, and audit trails alongside human teammates.
1. **External Agent Interfaces (Rovo MCP Server and Teamwork Graph CLI)**: External clients connect to the hosted MCP endpoint at `https://mcp.atlassian.com/v2/mcp` (replacing the earlier `/v1/mcp` and the `/v1/sse` endpoint retired after June 30, 2026) or through the [Teamwork Graph CLI](https://www.atlassian.com/blog/company-news/closing-the-ai-context-gap), which exposes 567 commands.

Atlassian redesigned the MCP server for v2 in October 2026 to cover more than [220 tools](https://www.atlassian.com/blog/company-news/team26-europe-atlassian-mcp) across Jira, Confluence, Loom, Bitbucket, and Goals while reducing token overhead by up to 25% on Claude models. Nearly one-third of all MCP calls are write operations, and 44% of MCP users sit outside software engineering teams.

When an external agent handles a multi-product request, the execution path runs in five steps:

1. The client authenticates with Atlassian via OAuth 2.1 (with PKCE and Dynamic Client Registration) or via a scoped API token over HTTP Basic Auth.
1. The client calls `getAccessibleAtlassianResources` to resolve the target site's `cloudId`, because API tokens are not bound to a single site.
1. Atlassian's edge enforces domain allowlists (for OAuth 2.1), IP allowlists, and Atlassian Guard Data Security Policies before exposing the filtered `tools/list` surface.
1. For semantic or cross-product queries (`searchAtlassian`, `getTeamworkGraphContext`), the MCP server queries the Teamwork Graph, returning pre-stitched context across linked tickets, Confluence specs, and pull requests while honoring the caller's exact Jira project roles and Confluence space permissions.
1. For write actions (creating tickets, transitioning issues, diff-editing Confluence pages), the server checks page versions to prevent concurrent overwrites and logs the call with an `Atl-Traceid` to Atlassian's organization audit log (exportable as JSON to SIEMs like Splunk).

## 2. The Balance Sheet

Most SaaS vendors that push AI usage hard watch their gross margins compress under inference bills. Atlassian moved in the opposite direction. In [Q1 FY2027](https://s206.q4cdn.com/270053503/files/doc_financials/2027/q1/TEAM-Q1-2027-Earnings-Release.pdf) (quarter ended September 30, 2026), total revenue rose 24% year over year to $1,772 million, Cloud revenue grew 31% to $1,302 million, and GAAP gross margin expanded 3 percentage points year over year from 82% to 85% (87% non-GAAP). GAAP operating margin swung from negative 7% to positive 11% ($189 million), while free cash flow jumped 304% year over year to $463 million (a 26% margin).

Cannon-Brookes credited the margin expansion to model blending through the AI Gateway and token efficiency from the Teamwork Graph. In [internal benchmarks](https://www.atlassian.com/blog/company-news/closing-the-ai-context-gap), agents grounded in pre-assembled Teamwork Graph context achieved 44% higher answer quality while consuming 48% fewer tokens than agents forced to chain raw API calls. In service desks, Atlassian's [Request Resolver](https://www.atlassian.com/blog/company-news/expanded-usage-based-pricing) resolved issues 13% faster than non-AI workflows, helping Service Collection cross 70,000 customers and $1 billion in ARR.

Atlassian's primary AI monetization lever is tier upgrades, not metered overages. Moving from Standard to Premium or Enterprise doubles or triples per-user Rovo credits, and upgrading to the Teamwork Collection (now past 3,000 customers, up 7x year over year) provides [10x the Rovo credit allowance](https://support.atlassian.com/rovo/docs/rovo-usage-limits/). Those credits pool across the organization, reset monthly, and never roll over.

| Plan / Action Tier | Monthly Included Credits (Per User) | Credit Burn / Cost Rate | Effective Billing Rule |
| --- | --- | --- | --- |
| Standard (Jira, Confluence, Bitbucket, Loom) | 25 credits | Free for Search, single-product lookups, writes | Pooled org-wide; monthly reset, no rollover |
| Premium (Jira, Confluence, Bitbucket, Loom) | 70 credits | 10 credits per Basic Chat, Routing, or Basic Agent | Overage hits PAYG on Dec 3, 2026 |
| Enterprise (Jira, Confluence, Loom, Strategy) | 150 credits | Variable credits for Advanced Agents, Think Deeper | Admin alerts at 80% and 100% of pool |
| Service Collection / Teamwork Collection | 250 (Std) / 700 (Prem) / 1,500 (Ent) | 1 to 10 credits per enriched Teamwork Graph call | Up to 10x allowance vs standalone apps |
| Pay-As-You-Go Overage (starts Dec 3, 2026) | Uncapped unless admin sets limit | $0.01 per Rovo credit ($10 per 1,000 credits) | Enabled by default; requires verified domain |

Management stated on the [Q1 FY2027 call](https://www.fool.com/earnings/call-transcripts/2026/11/06/atlassian-team-q1-2027-earnings-call-transcript/) that usage-based pricing (UBP) enforcement begins December 3, 2026, primarily to meter extreme outliers rather than drive near-term FY2027 revenue. Still, for engineering teams running automated MCP loops, the transition from free beta graph calls (`getTeamworkGraphContext`, `getTeamworkGraphObject`) to 1 to 10 credits per call ($0.01 to $0.10 per invocation) changes the unit math overnight.

## 3. The Edge Cases and Breakages

When teams move from interactive chat in Claude or Cursor to automated production pipelines, Atlassian's MCP and Rovo layers expose five sharp failure modes.

1. **Auth-method to tool-surface coupling**: No single credential reaches all five Atlassian products through Rovo MCP. According to [Scalekit's production analysis](https://www.scalekit.com/blog/atlassian-mcp-vs-api), Jira Service Management and Bitbucket Cloud tools are available only on API token sessions, whereas Compass tools are available only over OAuth 2.1. An agent that needs to inspect a Bitbucket pull request and check Compass service ownership must hold two separate connections with different authentication flows.
1. **Silent scope filtering on headless API tokens**: Atlassian's [support knowledge base](https://support.atlassian.com/rovo/kb/rovo-mcp-server-only-returns-teamwork-graph-tools-when-using-api-token/) documents a subtle failure mode: if an engineer uses a legacy API token, selects broad classic scopes such as `read:confluence-content.all`, or sends `Authorization: Bearer <token>` instead of `Authorization: Basic <base64(email:api_token)>`, the `tools/list` call succeeds with HTTP 200 but silently drops all Jira and Confluence tools, returning only two or three Teamwork Graph tools. Even when configured correctly with granular scopes (`read:jira-work`, `read:page:confluence`, `search:confluence`, `search:rovo:mcp`), API tokens lack `cloudId` binding (so a bad parameter writes to the wrong Atlassian site) and bypass redirect-based domain allowlists.
1. **Rotating refresh-token race conditions**: For user-delegated OAuth 2.1 flows, Atlassian rotates refresh tokens on every refresh and immediately invalidates the prior token. If two concurrent agent threads refresh an expired 1-hour access token at the same moment, the second thread fails with `invalid_grant`. Refresh tokens also expire after 90 days of inactivity, forcing manual user re-consent.
1. **Undocumented MCP concurrency throttles**: Jira Cloud REST APIs enforce three documented limits live since March 2, 2026 (65,000 points per hour in the Tier 1 Global Pool, 100 requests per second burst for GET/POST and 50 for PUT/DELETE, and 20 writes per 2 seconds per issue). By contrast, Atlassian publishes zero rate-limit figures for the Rovo MCP endpoint. In [GitHub Issue #171](https://github.com/atlassian/atlassian-mcp-server/issues/171) on Atlassian's official MCP repository, engineers hitting `https://mcp.atlassian.com/v1/mcp` logged HTTP 429 errors after roughly 20 parallel calls despite staying around 200 to 300 total calls over hours, receiving only a `Retry-After` header with none of the `X-RateLimit-*` headers documented for REST. Separately, [Issue #281](https://github.com/atlassian/atlassian-mcp-server/issues/281) tracked intermittent 429 errors on `auth.atlassian.com/consent/info` and missing-app errors when reconnecting Claude clients.
1. **Prompt bloat, missing admin surface, and default-on PAYG billing**: Exposing all 39 v1 Rovo MCP tools burns roughly 8,000 input tokens per turn before any work runs, and models routinely hallucinate `cloudId` unless explicitly instructed to call `getAccessibleAtlassianResources` first. Above the record layer, Rovo MCP omits webhooks, bulk operations, attachments, sprint ranking, and project or workflow administration, forcing a fallback to REST. Finally, because [pay-as-you-go billing](https://support.atlassian.com/rovo/docs/rovo-usage-limits/) is enabled by default on December 3, 2026, unmonitored background agents calling Teamwork Graph tools can burn through a 25-credit-per-user Standard pool in minutes and silently accrue $0.01-per-credit charges.

## 4. The Reusable Blueprint

1. **Split interactive MCP from deterministic REST pipelines**: Use Atlassian's Rovo MCP Server (`/v2/mcp`) for user-present assistants that need semantic search across Jira and Confluence or pre-stitched Teamwork Graph context. Keep scheduled syncs, webhooks (30-day dynamic registrations), bulk migrations, attachments, and admin automation on the Cloud REST APIs, where rate limits and `X-RateLimit-*` headers are documented.
1. **Scope the MCP tool list before binding to the model**: Never pass all 39 or 220+ MCP tools into an agent's context window. Filtering down to the six exact tools a triage or release-notes role needs cuts schema token overhead by roughly 85% and blocks prompt-injected writes or deletions at the tool boundary.
1. **Centralize token refresh behind a single lock**: Never let worker threads hold raw Atlassian OAuth refresh tokens. Store per-user grants in a central vault that serializes refresh calls with a mutex so concurrent agent runs never race into `invalid_grant`, and mint short-lived session tokens per run.
1. **Audit and cap Rovo credit pools before December 3, 2026**: Treat Teamwork Graph context calls as metered compute (1 to 10 credits each) rather than free lookups. Configure spending caps in Atlassian Administration, route simple single-ticket lookups to free REST or single-product calls, and reserve enriched graph calls for cross-product synthesis.

## Sources

- [Atlassian Announces First Quarter Fiscal Year 2027 Results (Earnings Release)](https://s206.q4cdn.com/270053503/files/doc_financials/2027/q1/TEAM-Q1-2027-Earnings-Release.pdf)
- [Atlassian (TEAM) Q1 2027 Earnings Call Transcript](https://www.fool.com/earnings/call-transcripts/2026/11/06/atlassian-team-q1-2027-earnings-call-transcript/)
- [How Rovo credits work (Atlassian Support)](https://support.atlassian.com/rovo/docs/rovo-usage-limits/)
- [Atlassian MCP brings more of your work within reach of any AI agent (Team '26 Europe)](https://www.atlassian.com/blog/company-news/team26-europe-atlassian-mcp)
- [AI that knows your business: Teamwork Graph and CLI](https://www.atlassian.com/blog/company-news/closing-the-ai-context-gap)
- [Expanded usage-based pricing for Atlassian Cloud](https://www.atlassian.com/blog/company-news/expanded-usage-based-pricing)
- [Rovo MCP Server only returns Teamwork Graph tools when using API Token (Atlassian KB)](https://support.atlassian.com/rovo/kb/rovo-mcp-server-only-returns-teamwork-graph-tools-when-using-api-token/)
- [GitHub Issue #171: Hitting 429 rate limits on Rovo MCP Server](https://github.com/atlassian/atlassian-mcp-server/issues/171)
- [GitHub Issue #281: Can't authenticate to Atlassian MCP server](https://github.com/atlassian/atlassian-mcp-server/issues/281)
- [Atlassian Rovo MCP vs Atlassian API for AI Agents (Scalekit)](https://www.scalekit.com/blog/atlassian-mcp-vs-api)

<!--
Artwork brief — from the writer routine. Draw per docs/ARTWORK.md,
then delete this comment.

A clean architectural diagram on warm paper showing a dense cluster of linked Teamwork Graph nodes on the left converging through an AI Gateway hub into two split authentication channels on the right, one gated for OAuth 2.1 and one for API tokens, with moss-colored active routes and crisp dark-ink seams indicating where tool surfaces diverge.
-->
