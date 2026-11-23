---
title: 'Cloudflare AI Autopsy: 241B Tokens, 72.4% Margin, and Code Mode'
description: 'Cloudflare routes 241.37B tokens a month internally and cut security agent costs 77%, but AI developer mix pulled gross margin down 290 bps to 72.4%.'
pubDate: 2026-11-23
publishedAt: '2026-11-23T20:36:30.191Z'
track: case-studies
question: 'Can an edge-isolate AI gateway cut agent token bills by 77% without compressing gross margins or breaking at scale?'
heroImage: '../../assets/art/cloudflare-workers-ai-gateway-code-mode-autopsy-light.webp'
heroImageDark: '../../assets/art/cloudflare-workers-ai-gateway-code-mode-autopsy-dark.webp'
heroAlt: 'Geometric diagram showing 34 small schema blocks compressing through a vertical proxy gate into two clean moss-highlighted routing channels, with one misaligned square offset below the lower grid.'
readingTime: '7 min read'
notionId: '421ced67-050a-8150-9a7a-e0155568d3fd'
---
<div class="tldr">

## Executive TL;DR

- Cloudflare [reported](https://www.cloudflare.com/en-au/press/press-releases/2026/cloudflare-announces-third-quarter-2026-financial-results/) $782.5 million in Q3 2026 revenue (up 39% year over year) and 10 million active developers, while non-GAAP gross margin fell 290 basis points year over year from 75.3% to 72.4% as developer and AI workloads scaled.
- Internally, [3,683 Cloudflare employees](https://blog.cloudflare.com/internal-ai-engineering-stack/) (93% of R&D) route 20.18 million requests and 241.37 billion tokens per month through AI Gateway, with 91.16% still hitting frontier labs and 8.84% running on Workers AI.
- Offloading a 7-billion-token-per-day security agent to open-weight `Kimi K2.5` on Workers AI cut inference spend by 77% against an estimated $2.4 million annual proprietary model bill.
- Exposing 34 GitLab MCP tools burned roughly 15,000 schema tokens per prompt (7.5% of a 200K window) until portal-level Code Mode collapsed 182+ tools into two discovery and execution tools.
- Production breakages cluster around multi-hop latency cascades, stale `AGENTS.md` context across 3,900 repos, and control-plane automation bugs such as the [February 20, 2026 outage](https://blog.cloudflare.com/cloudflare-outage-february-20-2026/) that withdrew 1,100 BYOIP prefixes for 6 hours and 7 minutes.

</div>

## 1. The Deployment

Cloudflare runs its internal AI engineering stack on the exact platform it sells to external developers. Built over 11 months by an internal tiger team called iMARS (Internal MCP Agent/Server Rollout Squad), the [internal deployment](https://blog.cloudflare.com/internal-ai-engineering-stack/) reached 3,683 active users (60% of the company and 93% of R&D) across 295 teams by April 2026, processing 47.95 million AI messages between February 5 and April 15, 2026.

Five architectural layers make up the production stack:

1. **Identity and Proxy Choke Point**: Engineers run a single bootstrap command (`opencode auth login`) against a Hono proxy Worker. The Worker validates Cloudflare Access JWTs, maps user emails to anonymous UUIDs in D1 and Workers KV, and strips client credentials before forwarding requests.
1. **Unified AI Control Plane**: Every prompt passes through [AI Gateway](https://blog.cloudflare.com/workers-ai-gateway-unification/) (`env.AI.run()` or the `/ai/` REST endpoint), which unifies routing across 70+ models and 12+ providers, injects Zero Data Retention (`store: false`) flags via an hourly `models.dev` cron job, and meters both external APIs and Workers AI GPUs.
1. **V8 Isolate and Sandbox Compute**: Lightweight agent code runs in Dynamic Workers using V8 isolates with millisecond cold starts rather than containers, while long-running coding sessions use Durable Objects in the Agents SDK and isolated Sandbox containers for cloning and testing.
1. **MCP Server Portal with Code Mode**: Thirteen internal MCP servers exposing 182+ tools (GitLab, Jira, Sentry, Backstage, Prometheus, Elasticsearch, Google Workspace) sit behind one OAuth portal that collapses upstream schemas into `portal_codemode_search` and `portal_codemode_execute`.
1. **Knowledge and Enforcement Layer**: A self-hosted Backstage catalog (tracking 2,055 services, 1,302 databases, and 375 teams) feeds automated `AGENTS.md` files across 3,900 GitLab repositories, paired with a CI AI Code Reviewer that checks 100% of merge requests against Cloudflare's Engineering Codex.

Latency sensitivity drove the placement of inference next to compute. On [Cloudflare's AI Platform](https://blog.cloudflare.com/ai-platform/), a 10-step agent loop turns a single 50ms cross-cloud network hop into 500ms of pure overhead. Running open-weight models like `Kimi K2.5` (256K context window) across 330 data center cities keeps code and inference on the same network.

When a developer triggers an internal coding or review task, the request moves through five steps:

1. The client fetches shared providers, MCP endpoints, and permissions from `/.well-known/opencode` and authenticates via `cloudflared` SSO.
1. The proxy Worker verifies the Access JWT, swaps the user email for an anonymous UUID in `cf-aig-metadata`, and injects the server-side provider API key so no keys reside on laptops.
1. AI Gateway routes the call to either a frontier model (Anthropic Opus 4.6, OpenAI GPT 5.4) or a Workers AI model (`Kimi K2.5`), buffering streamed tokens independently of the caller's lifetime.
1. If the agent needs internal context, it invokes `portal_codemode_search` to discover relevant Backstage or GitLab actions and executes them inside a Dynamic Worker isolate.
1. On merge request creation, a stateless GitLab CI runner classifies risk (trivial, lite, or full), runs specialized review agents against `AGENTS.md` and Codex RFCs, and posts severity-ranked comments.

## 2. The Balance Sheet

Cloudflare's [Q3 2026 financial results](https://www.cloudflare.com/en-au/press/press-releases/2026/cloudflare-announces-third-quarter-2026-financial-results/) show the tension between top-line AI velocity and gross margin mix. Total revenue grew 39% year over year to $782.5 million, crossing $3 billion annualized, while Cloudflare added a record 158,000 net new paying customers (up 110% year over year) and passed 5,000 large customers spending over $100,000 annually. Active developers doubled from the start of 2026 to 10 million, including an $11 million one-year Dynamic Workers contract with an AI app builder avoiding idle container fees.

That developer surge pulled gross margins down. GAAP gross margin slipped from 74.0% in Q3 2025 to 71.2% in Q3 2026, and non-GAAP gross margin fell 290 basis points year over year from 75.3% to 72.4% (still inside Cloudflare's 70% to 77% long-term target). On the [Q3 2026 earnings call](https://www.fool.com/earnings/call-transcripts/2026/11/06/cloudflare-net-q3-2026-earnings-call-transcript/), CFO Thomas Seifert acknowledged that the Workers developer platform carries lower gross margins than Zero Trust security products, though its lower cost-to-book helped lift non-GAAP operating margin to a record 17.5% ($137.1 million) as GAAP operating loss sat at $67.9 million (8.7% of revenue) and free cash flow margin dipped to 10% ($82.1 million, with 15% of revenue spent on network CapEx).

| Workload / Financial Metric | Observed Scale or Cost | Margin or Savings Impact | Source Basis |
| --- | --- | --- | --- |
| Q3 2026 Revenue & Gross Margin | $782.5M revenue (+39% YoY) | 72.4% non-GAAP GM (-290 bps YoY) | Q3 2026 release |
| Internal AI Gateway Volume | 20.18M req/mo, 241.37B tokens/mo | 91.16% frontier vs 8.84% Workers AI | Internal stack post |
| Security Agent (`Kimi K2.5`) | 7B+ tokens/day on Workers AI | 77% cheaper vs $2.4M/yr proprietary | Internal stack post |
| GitLab CI AI Code Reviewer | 5.47M req/mo, 24.77B tokens/mo | ~15% offloaded to Workers AI | Internal stack post |
| Internal IR Earnings Agent | Quarterly prep automation | Under $200 in token costs/quarter | Q3 2026 earnings call |

Internally, Cloudflare's cost math proves why hybrid routing matters. Frontier labs still take 91.16% of internal requests (13.38 million calls per month) because complex coding and security reviews require peak reasoning. Offloading high-volume, narrower jobs delivers the sharpest savings: the security agent processing 7 billion tokens per day on `Kimi K2.5` costs 77% less than an estimated $2.4 million annual proprietary bill, and an internal investor-relations agent prepares quarterly statistical packets for under $200 in tokens. Externally, Workers AI pairs per-model [Neuron billing](https://developers.cloudflare.com/workers-ai/platform/pricing/) (for example, `Clairic` extraction rises from $0.100 to $0.240 per million input tokens on December 1, 2026) with prepaid AI Gateway credits that grant higher rate limits.

## 3. The Edge Cases and Breakages

Shipping agents across 295 teams and 3,900 repositories exposed four recurring failure modes, alongside a severe control-plane outage that underscored the risk of automated infrastructure changes.

1. **MCP schema bloat eating context budgets**: Before Code Mode, connecting Cloudflare's GitLab MCP server alone loaded 34 tool definitions consuming roughly 15,000 tokens per request, wiping out 7.5% of a 200K context window before a single prompt ran. Adding 12 more MCP servers made direct tool binding unsustainable until portal-level Code Mode hid the upstream catalog behind two meta-tools.
1. **Plausible-but-wrong edits and stale repo maps**: Early coding agents repeatedly generated code that compiled cleanly yet failed repository test commands or violated internal RFCs. Generating `AGENTS.md` files across 3,900 repos fixed the bootstrap gap, though polyglot repositories and unusual build setups required manual cleanup and stale `AGENTS.md` files actively misled agents until the CI Code Reviewer began flagging out-of-date docs.
1. **Multi-step disconnect cascades**: Unlike single-turn chat, a 10-call agent workflow amplifies transient upstream errors and stream drops. If an agent worker disconnects mid-stream without AI Gateway response buffering and Agents SDK checkpointing, the caller must rerun the entire inference step and pay twice for output tokens.
1. **Automated control-plane blast radius**: On [February 20, 2026](https://blog.cloudflare.com/cloudflare-outage-february-20-2026/), a scheduled cleanup sub-task queried Cloudflare's Addressing API with `/v1/prefixes?pending_delete` and an empty string value. Because the server checked `Query().Get("pending_delete") != ""`, it returned all Bring Your Own IP (BYOIP) prefixes instead of those queued for removal, prompting the task runner to withdraw roughly 1,100 prefixes (25% of 4,306 global BYOIP prefixes) and strip edge service bindings. Core CDN, Magic Transit, Spectrum, and `one.one.one.one` suffered 403 errors and BGP path-hunting timeouts for 6 hours and 7 minutes because staging mock data failed to cover autonomous background task execution.

## 4. The Reusable Blueprint

1. **Terminate all agent traffic at one proxy choke point**: Put a thin gateway Worker between developer clients and model providers to handle SSO, anonymous UUID attribution, Zero Data Retention flags, and key injection server-side. Client laptops should hold zero long-lived LLM API keys.
1. **Collapse large MCP catalogs with portal-level Code Mode**: Once an MCP gateway exceeds 20 to 30 tools, replace static tool schemas in the model prompt with search-and-execute discovery tools so context overhead stays flat as integrations grow.
1. **Pair frontier reasoning with cheap same-network offload**: Keep complex architectural and security reviews on frontier models (Cloudflare's 91% slice), while routing high-volume classification, doc checks, and 7B-token/day batch agents to open-weight models co-located on your inference network.
1. **Close the context loop in CI and gate autonomous mutations**: Auto-generated `AGENTS.md` files rot quickly unless your CI reviewer flags stale context on every merge request, and any autonomous cleanup or agent write path needs strict schema validation and circuit breakers before touching production state.

## Sources

- [The AI engineering stack we built internally - on the platform we ship](https://blog.cloudflare.com/internal-ai-engineering-stack/)
- [Cloudflare Announces Third Quarter 2026 Financial Results](https://www.cloudflare.com/en-au/press/press-releases/2026/cloudflare-announces-third-quarter-2026-financial-results/)
- [Cloudflare (NET) Q3 2026 Earnings Call Transcript](https://www.fool.com/earnings/call-transcripts/2026/11/06/cloudflare-net-q3-2026-earnings-call-transcript/)
- [Cloudflare's AI Platform: an inference layer designed for agents](https://blog.cloudflare.com/ai-platform/)
- [Unifying Workers AI and AI Gateway into a single AI control plane](https://blog.cloudflare.com/workers-ai-gateway-unification/)
- [Cloudflare outage on February 20, 2026](https://blog.cloudflare.com/cloudflare-outage-february-20-2026/)
- [Pricing · Cloudflare Workers AI docs](https://developers.cloudflare.com/workers-ai/platform/pricing/)

<!--
Artwork brief — from the writer routine. Draw per docs/ARTWORK.md,
then delete this comment.

- Argument in one sentence: Collapsing 182+ sprawling MCP tool schemas behind a single proxy gate keeps the context window clean while separating cheap local offload from heavy frontier traffic.
- Geometry: On the left, a tall grid of 34 small rectangles representing bloated MCP schemas presses against a narrow vertical proxy gate; on the right, two clean moss-accented channels exit the gate, one carrying a wide 91% frontier arc and one feeding an array of tight local isolate squares, with one misaligned square in the bottom corner representing a stale context file.
- Accent: {{moss}}
- Deliberate imperfection: One slightly tilted, offset isolate square outside the lower grid margin represents a stale `AGENTS.md` file or rogue cleanup query slipping past static staging checks.
-->
