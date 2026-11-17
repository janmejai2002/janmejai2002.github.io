---
title: 'OAuth Outages Show Why Coding Agents Need Direct API Routing'
description: 'On Nov 13, claude.ai and Claude Code OAuth failed for 67 minutes while api.anthropic.com stayed up. Decouple IDE agents with stateless API keys and Bedrock.'
pubDate: 2026-11-13
publishedAt: '2026-11-13T23:36:47.867Z'
track: technical
question: 'Why did Claude Code stop working during the Nov 13 outage while api.anthropic.com stayed up?'
keywords:
  - Coding Agent API Routing
  - Claude Code Outage Fallback
  - OAuth vs API Key Auth
  - Multi-Provider LLM Gateway
heroImage: '../../assets/art/coding-agent-direct-api-routing-fallback-light.webp'
heroImageDark: '../../assets/art/coding-agent-direct-api-routing-fallback-dark.webp'
heroAlt: 'Minimalist geometric diagram showing three horizontal request paths where the top path is blocked by a broken circular OAuth gate, while two lower mizu paths route cleanly around it into the right-hand inference block.'
readingTime: '7 min read'
notionId: '417ced67-050a-818b-ac66-f8a1bbc76ab0'
---
<div class="tldr">

## Executive TL;DR

- **Web and IDE auth failed while the API stayed green:** At `09:58 UTC` on November 13, 2026, [Anthropic's status page](https://status.claude.com/) logged an authentication outage that put `claude.ai` into a major outage and `Claude Code` and `platform.claude.com` into partial outages until `11:05 UTC` (67 minutes), while `api.anthropic.com` remained operational ([AI Weekly](https://aiweekly.co/alerts/anthropic-logs-login-outage-on-claudeai-and-claude-code); [ExplainX](https://explainx.ai/blog/claude-authentication-outage-claude-ai-code-november-13-2026)).
- **Second agent workflow disruption in 48 hours:** The login failure arrived one day after the November 12 Microsoft 365 connector incident (`17:52 UTC`, peaking near 130,000 Downdetector reports across 74 countries) broke mail, calendar, and search tools ([Proton](https://proton.me/nb/business/blog/claude-microsoft-365-connector-outage)), and days after the November 8 (`Fable 5.1`, 14 minutes) and November 10 (`Fable 5.2` / `Mythos 5.2`) model errors ([ExplainX](https://explainx.ai/blog/claude-authentication-outage-claude-ai-code-november-13-2026)).
- **OAuth session refreshes create a single point of failure:** Interactive IDE agents bound to consumer or browser OAuth tokens must periodically hit identity endpoints to refresh short-lived session leases before invoking tools or subagents, halting local development even when GPU inference clusters are idle.
- **Third-party cloud routing bypasses browser login:** Setting `CLAUDE_CODE_USE_BEDROCK=1` or configuring Google Vertex AI in [Claude Code's IAM settings](https://docs.anthropic.com/en/docs/claude-code/iam) authenticates via local AWS/GCP credentials with zero browser OAuth dependency ([Claude Code Bedrock Docs](https://docs.anthropic.com/en/docs/claude-code/amazon-bedrock)).
- **Know the Bedrock fallback trade-off:** Routing Claude Code through Amazon Bedrock eliminates Anthropic OAuth lockouts, but disables the built-in `WebSearch` tool and `/logout` command ([Claude Code Bedrock Guide](https://code.claude.com/docs/ko/amazon-bedrock)).

</div>

## The Auth Bottleneck: Why Healthy Model Weights Cannot Save an OAuth Lockout

At `09:58 UTC` on Friday, November 13, 2026, engineering teams running autonomous coding loops inside `Claude Code` watched their terminal sessions freeze with authentication errors. Within minutes, Downdetector reports in India spiked to **2,906 against a baseline of two** ([AI Weekly](https://aiweekly.co/alerts/anthropic-logs-login-outage-on-claudeai-and-claude-code)). On [Anthropic's status page](https://status.claude.com/), `claude.ai` flipped to a major outage, `Claude Console` (`platform.claude.com`) and `Claude Code` registered partial outages, and `Claude Cowork` showed degraded performance until a fix landed at `11:05 UTC` ([AI Weekly](https://aiweekly.co/alerts/anthropic-logs-login-outage-on-claudeai-and-claude-code)).

One line on that same status board stood out to infrastructure engineers: **`Claude API (api.anthropic.com): Operational`** ([ExplainX](https://explainx.ai/blog/claude-authentication-outage-claude-ai-code-november-13-2026)).

While developers who signed into `Claude Code` through their browser or Pro/Max/Team OAuth accounts were locked out of their IDEs for 67 minutes, background CI harnesses, evaluation pipelines, and developers routing requests through stateless API keys or AWS Bedrock continued generating code without a single dropped token.

Coming less than 24 hours after the November 12 Microsoft 365 outage broke Claude's mail, calendar, and search connectors (`17:52 UTC` on Nov 12, following Microsoft Exchange issues at `17:30 UTC` per [Proton](https://proton.me/nb/business/blog/claude-microsoft-365-connector-outage)), the November 13 incident exposed an architectural anti-pattern across modern engineering teams: **binding mission-critical developer CLI tools to stateful web OAuth sessions**.

| Date (Nov 2026) | Affected Surface | Root Layer | Status of `api.anthropic.com` | Impact on OAuth-Bound IDE Agents |
| --- | --- | --- | --- | --- |
| **Nov 8** | Web, API, Code, Cowork | Model serving (`Fable 5.1`) | Degraded (~14 min) | Brief model errors across all paths ([ExplainX](https://explainx.ai/blog/claude-authentication-outage-claude-ai-code-november-13-2026)) |
| **Nov 10** | Newest model SKUs | Capacity (`Fable 5.2` / `Mythos 5.2`) | Partial overload | Rate-limit retries on newest checkpoints ([ExplainX](https://explainx.ai/blog/claude-authentication-outage-claude-ai-code-november-13-2026)) |
| **Nov 12–13** | M365 Connector & Outlook | Upstream Microsoft 365 (`EX1550543`) | **Operational** | Mail, calendar, and search tool calls failed ([Proton](https://proton.me/nb/business/blog/claude-microsoft-365-connector-outage)) |
| **Nov 13 (`09:58–11:05 UTC`)** | `claude.ai`, `Claude Code`, Console | Identity & OAuth session layer | **Operational** | **Complete IDE lockout on login/token refresh** ([AI Weekly](https://aiweekly.co/alerts/anthropic-logs-login-outage-on-claudeai-and-claude-code)) |

## Session Tokens vs. Stateless Keys: Mapping the Single Points of Failure

Why does an authentication blip kill an already-installed CLI coding tool when the inference cluster is healthy? Trace the four-step request lifecycle of an OAuth-authenticated IDE agent versus a stateless API or cloud-IAM path:

1. **Interactive Browser Handshake and Short-Lived Leases:** When a developer runs `claude` and logs in via `claude.ai`, the CLI stores an OAuth access token paired with a refresh token. Because interactive seat plans enforce per-user concurrency and subscription tier checks, access tokens expire frequently.
1. **Pre-Flight Identity Refresh on Tool and Subagent Spawns:** Whenever `Claude Code` starts a new workspace session, spawns a background subagent, or reconnects after laptop sleep, the harness must validate or refresh its session lease against Anthropic's identity authority before forwarding the prompt to the inference router ([ExplainX](https://explainx.ai/blog/claude-authentication-outage-claude-ai-code-november-13-2026)).
1. **Edge and Identity Contention:** If the OAuth token service, SSO broker, or front-door edge rules degrade (as occurred at `09:58 UTC` on November 13), the token refresh returns `401`/`5xx` before the request ever reaches `api.anthropic.com/v1/messages`.
1. **Stateless API and Cloud IAM Bypass:** By contrast, a request sent to `api.anthropic.com` with an `x-api-key` header, or sent to Amazon Bedrock using local AWS SigV4 credentials (`~/.aws/credentials`), validates cryptographically at the API gateway edge without querying the interactive web login database ([Claude Code IAM Docs](https://docs.anthropic.com/en/docs/claude-code/iam)).

## Building a Multi-Provider Fallback Gateway Across Anthropic, Bedrock, and Vertex

To make developer workstations and CI coding agents immune to single-vendor login outages, decouple the local CLI from browser OAuth using two layers: **native cloud-provider flags** and a **multi-provider LiteLLM proxy**.

### Path 1: Native Bedrock and Vertex AI Binding in Claude Code

Anthropic's [official Claude Code Amazon Bedrock documentation](https://docs.anthropic.com/en/docs/claude-code/amazon-bedrock) and [IAM authentication guide](https://docs.anthropic.com/en/docs/claude-code/iam) support running `Claude Code` with zero browser login. Setting `CLAUDE_CODE_USE_BEDROCK=1` (or running `/setup-bedrock` at the prompt) switches authentication to your local AWS IAM profile, AWS access keys, or Bedrock API key, resolving the region automatically in the order `AWS_REGION`, `AWS_DEFAULT_REGION`, `~/.aws/config`, or `us-east-1` ([Claude Code Bedrock Guide](https://code.claude.com/docs/ko/amazon-bedrock)).

### Path 2: Automated Multi-Cloud Failover via LiteLLM Proxy

For teams that want `api.anthropic.com` as their primary low-latency endpoint with automatic sub-second failover to Amazon Bedrock and Google Vertex AI whenever Anthropic returns `5xx` or connection timeouts, point `ANTHROPIC_BASE_URL` at a local or VPC-hosted `LiteLLM` gateway configured with circuit breakers:

```yaml
model_list:
  - model_name: claude-code-primary
    litellm_params:
      model: anthropic/claude-sonnet-4-5-20250929
      api_key: os.environ/ANTHROPIC_API_KEY
      timeout: 15
    model_info:
      id: "anthropic-direct"

  - model_name: claude-code-fallback-bedrock
    litellm_params:
      model: bedrock/anthropic.claude-sonnet-4-5-20250929-v1:0
      aws_region_name: us-east-1
      timeout: 20
    model_info:
      id: "aws-bedrock"

router_settings:
  routing_strategy: simple-shuffle
  num_retries: 2
  allowed_fails: 2
  cooldown_time: 60
  fallbacks:
    - {"claude-code-primary": ["claude-code-fallback-bedrock"]}
```

Pair that gateway with a lightweight Python pre-flight probe that checks both `claude.ai/login` and `api.anthropic.com` and writes the active route into your Claude Code user settings file (`~/.claude/settings.json`):

```python
import json
import urllib.request
from pathlib import Path

def configure_claude_code_route(settings_path: Path, aws_region: str = "us-east-1"):
    cfg = json.loads(settings_path.read_text()) if settings_path.exists() else {}
    env_block = cfg.setdefault("env", {})
    try:
        req = urllib.request.Request("https://claude.ai/login", method="HEAD")
        urllib.request.urlopen(req, timeout=3)
        env_block.pop("CLAUDE_CODE_USE_BEDROCK", None)
    except Exception:
        # OAuth surface unreachable: fail over to stateless AWS Bedrock IAM
        env_block["CLAUDE_CODE_USE_BEDROCK"] = "1"
        env_block["AWS_REGION"] = aws_region
    settings_path.write_text(json.dumps(cfg, indent=2))
```

## Unit Economics of Resilience: Balancing Flat Subscriptions Against API Failover Pools

Why do teams default to OAuth logins in the first place? Because flat-rate seat subscriptions (`$20/month` Pro or `$100` to `$200/month` Max/Team plans) cap monthly spend for heavy interactive coders, whereas raw API tokens bill by volume. However, treating a flat-rate OAuth subscription and a pay-per-token API pool as mutually exclusive is a false dichotomy.

| Authentication & Routing Mode | Monthly Fixed Cost (per Dev) | Variable Outage / Usage Cost | Browser OAuth Dependency | Tool & Feature Parity Caveats |
| --- | --- | --- | --- | --- |
| **1. Pure OAuth Seat (`claude.ai` login)** | $20–$200 / mo flat | $0 token overage, but **100% IDE halt** during auth outages ([Nov 13 incident](https://aiweekly.co/alerts/anthropic-logs-login-outage-on-claudeai-and-claude-code)) | **High** (blocks session start & token refresh) | Full access to `WebSearch`, Cowork, and connectors |
| **2. Pure Direct API / Bedrock (`IAM`)** | $0 seat fee | Pay-per-token ($3/M input, $15/M output; $150–$450/mo for heavy coder) | **Zero** ([Claude Code IAM Docs](https://docs.anthropic.com/en/docs/claude-code/iam)) | **Bedrock disables built-in `WebSearch` tool and `/logout`** ([Bedrock Docs](https://code.claude.com/docs/ko/amazon-bedrock)) |
| **3. Hybrid Seat + Standby API/Bedrock Pool** | $20–$200 / mo flat | **~$4 to $9 per dev** during a 1-hour failover window | **Zero during failover** (`CLAUDE_CODE_USE_BEDROCK=1`) | Full daily tools; minor `WebSearch` loss only during Bedrock failover hours |

Look at the contrarian trade-off in Row 2: switching 100% of your engineering org permanently to Amazon Bedrock costs more in monthly token bills for heavy users *and* sacrifices Claude Code's built-in `WebSearch` tool ([Claude Code Bedrock Docs](https://code.claude.com/docs/ko/amazon-bedrock)). Conversely, Row 3 (**Hybrid Seat + Standby API/Bedrock Pool**) gives you the best of both worlds. Keep developers on flat-rate seats or direct API keys with prompt caching during normal hours, pre-provision an AWS Bedrock IAM role via `/setup-bedrock` on every developer laptop during onboarding, and monitor `https://claude.ai/login` alongside `https://api.anthropic.com/v1/messages` ([ExplainX](https://explainx.ai/blog/claude-authentication-outage-claude-ai-code-november-13-2026)). When the OAuth layer blinks, one setting flips the team to stateless routing at a marginal cost of a few dollars per engineer-hour.

## Sources

- [Claude Status: Anthropic Official Status Page](https://status.claude.com/): Official November 12 and November 13, 2026 incident logs for `claude.ai`, `Claude Code`, `platform.claude.com`, `api.anthropic.com`, and the Microsoft 365 connector.
- [Anthropic Logs Login Outage on Claude.ai and Claude Code: AI Weekly](https://aiweekly.co/alerts/anthropic-logs-login-outage-on-claudeai-and-claude-code): Verification of the `09:58 UTC` to `11:05 UTC` November 13 timeline, operational status of `api.anthropic.com`, and Downdetector India peak of 2,906 reports vs baseline of 2.
- [Claude Down Nov 13: Auth Outage Hits Code + Web: ExplainX](https://explainx.ai/blog/claude-authentication-outage-claude-ai-code-november-13-2026): Breakdown of surface-by-surface outage status, comparison with Nov 8 (`Fable 5.1`), Nov 10 (`Fable 5.2`/`Mythos 5.2`), and Nov 12–13 M365 incidents, and synthetic health-check recommendations.
- [Claude Microsoft 365 connector down? What's happening: Proton](https://proton.me/nb/business/blog/claude-microsoft-365-connector-outage): Timeline of the November 12 Microsoft 365 outage (`17:30 UTC` start, `17:52 UTC` Anthropic incident, 130,000 Downdetector peak across 74 countries).
- [Claude Code on Amazon Bedrock: Anthropic Documentation](https://docs.anthropic.com/en/docs/claude-code/amazon-bedrock): Setup instructions for `CLAUDE_CODE_USE_BEDROCK=1` and `/setup-bedrock` wizard.
- [Authentication: Claude Code Docs](https://docs.anthropic.com/en/docs/claude-code/iam): Official documentation confirming no browser login is required for Bedrock and Vertex AI.
- [Claude Code on Amazon Bedrock (Configuration & Limitations): Claude Code Docs](https://code.claude.com/docs/ko/amazon-bedrock): Region resolution priority (`AWS_REGION`, `AWS_DEFAULT_REGION`, `~/.aws/config`, `us-east-1`) and confirmation that `WebSearch` and `/logout` are unavailable on Bedrock.

<!--
Artwork brief — from the writer routine. Draw per docs/ARTWORK.md,
then delete this comment.

- Argument in one sentence: When a stateful OAuth login gate seizes up, interactive IDE traffic stalls at the identity barrier while stateless API and multi-cloud failover routes flow unimpeded to the underlying model weights.
- Geometry: Three horizontal request conduits crossing from left to right toward a large rectangular model-serving block on the right; the top conduit is blocked mid-flight by a broken, offset `ink` OAuth ring at `x=680`, while two lower `mizu` conduits bypass the ring through clean diagonal failover switches into the model core.
- Accent: mizu
- Deliberate imperfection: A fractured, misaligned circular OAuth gate on the top horizontal track that severs the line before it reaches the right-hand inference block, representing a stalled browser-session refresh.
-->
