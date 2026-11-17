---
title: 'GitLab Duo Autopsy: $1 Credits, a 9.9 RCE, and Margin Erosion'
description: 'GitLab Duo shifted to $1 usage credits as hosting costs jumped 50% and compressed gross margins to 86%, while CVE-2026-90970 exposed a 9.9 RCE in AI Gateway.'
pubDate: 2026-11-13
publishedAt: '2026-11-13T20:22:20.626Z'
track: case-studies
question: 'Does GitLab Duo''s $1 credit model cover agentic inference costs without eroding margins or opening gateway RCE risks?'
heroImage: '../../assets/art/gitlab-duo-ai-gateway-autopsy-light.webp'
heroImageDark: '../../assets/art/gitlab-duo-ai-gateway-autopsy-dark.webp'
heroAlt: 'Geometric schematic showing a central AI gateway frame split by an offset moss green block escaping its boundary toward a two-branch provider pool.'
readingTime: '9 min read'
notionId: '417ced67-050a-8104-9065-d8e412bb4ab6'
---
<div class="tldr">

## Executive TL;DR

- **Gross margin compression**: In Q1 FY2027 (quarter ended April 30, 2026), GitLab's total cost of revenue jumped 50% year-over-year to $37.49 million (up from $25.04 million), driven by a [$7.5 million surge in third-party hosting costs](https://www.saasvaluation.io/company/gitlab/earnings/q1-fy2027) that pulled gross margin down from 88% to 86%.
- **The $1.00 credit math**: GitLab prices on-demand [GitLab Credits at $1.00 per credit](https://docs.gitlab.com/subscriptions/gitlab_credits/), charging 0.02 credits ($0.02) per Code Suggestion, 0.25 credits ($0.25) per Code Review Flow, and 4.00 credits ($4.00) per SAST Vulnerability Resolution Flow on GitLab-managed models.
- **The CRR methodology reset**: After citing nearly $20 million in paid Consumption Run Rate (CRR) on its Q1 earnings call, GitLab filed a [July 8, 2026 Form 8-K](https://www.stocktitan.net/sec-filings/GTLB/8-k-gitlab-inc-reports-material-event-e7c846f2be54.html) revising Q1 FY27 CRR down to roughly $15 million before crossing $20 million by June 30, 2026.
- **Critical AI Gateway RCE**: On October 2, 2026, GitLab disclosed [CVE-2026-90970 (CVSS 9.9)](https://docs.gitlab.com/releases/patches/other-patches/patch-release-gitlab-ai-gateway-19-4-1-released/), a prompt template sandbox escape in Self-Hosted AI Gateway versions 18.1.6 through 19.4.0 that allowed authenticated Duo Agent Platform users to execute arbitrary commands.
- **Failed-flow billing asymmetry**: On GitLab Self-Managed with self-hosted models, variable-priced calls bill at invocation start even when a flow fails mid-run, whereas flat-priced features charge the full credit rate regardless of flow failure.

</div>

## 1. The Deployment

GitLab separated its AI inference plane from its core Ruby on Rails application by routing all generative requests through the GitLab AI Gateway, a stateless proxy service that sits between GitLab instances and third-party model providers. This separation allows GitLab.com, GitLab Dedicated, and GitLab Self-Managed deployments to share a common orchestration layer while swapping underlying models across Anthropic, OpenAI, Google Vertex AI, Fireworks AI, and customer-hosted endpoints.

The Duo Agent Platform, which reached general availability in January 2026 (GitLab 18.8), pairs two primitives: specialized Agents with scoped tool permissions and Flows that chain multiple agents into asynchronous CI/CD workflows. For low-latency IDE autocomplete, GitLab's [Code Suggestions runbook](https://runbooks.gitlab.com/ai-gateway/code-suggestions/) routes `Codestral 25.08` across a weighted multi-provider pool (75% Fireworks AI, 25% Google Vertex AI), enforcing a satisfied response target under 2.5 seconds and a tolerated ceiling under 10 seconds. For agentic merge request reviews, security triage, and multi-file refactoring, the AI Gateway routes to frontier reasoning models including `claude-sonnet-4.5`, `gpt-5.4`, and `kimi-k2.6` (with a 256K context window).

Context engineering relies on scoped repository retrieval and GitLab Orbit, the platform's lifecycle context graph. Rather than dumping entire monorepos into the prompt, the gateway injects project-level `AGENTS.md` instructions, merge request diffs, CI job logs, and SAST vulnerability traces while honoring namespace-level Model Context Protocol (MCP) boundaries. For regulated self-hosted buyers barred from sending source code to public SaaS APIs, [GitLab Duo Self-Hosted integrates Privatemode AI](https://about.gitlab.com/blog/confidential-ai-for-gitlab-self-hosted/), forwarding OpenAI-compatible `/v1` requests through a local proxy into hardware Trusted Execution Environments (AMD SEV, Intel TDX, and NVIDIA Confidential Computing GPUs) encrypted with AES-256.

Every Duo Agent Platform request traverses six sequential stages:

1. Client trigger: A developer initiates an IDE completion, mentions Duo in a merge request, or triggers an automated flow via a CI/CD event.
1. Composite identity check: The GitLab instance verifies user and service-account permissions, attaching a composite identity token so the agent cannot access repositories outside the caller's scope.
1. Context assembly: The instance gathers the active file window, diff hunks, `AGENTS.md` rules, or failed pipeline logs, stripping excluded files configured in project settings.
1. AI Gateway routing: The payload travels to the GitLab AI Gateway (hosted by GitLab or self-managed), which renders the flow's YAML prompt template and selects the configured model pool.
1. Enclave or provider inference: For managed clouds, the gateway calls Fireworks AI, Vertex AI, Anthropic, or OpenAI; for confidential self-hosted setups, the local Privatemode proxy verifies remote TEE attestation before sending encrypted prompts.
1. Metering and action commit: The gateway returns the completion or tool call, commits the suggested diff or comment to the merge request, and bills GitLab Credits to the user or root namespace.

## 2. The Balance Sheet

GitLab built its early AI business on flat per-seat add-ons (Duo Pro and Duo Enterprise), where predictable subscription pricing hid variable token expenses from customers. That model collided with multi-step agentic workflows in 2026: a single autonomous vulnerability remediation flow can chain dozens of file reads, test runs, and reasoning calls, easily burning more in third-party API tokens than a flat monthly seat fee.

To stop subsidizing unbounded agent loops, GitLab introduced [GitLab Credits](https://docs.gitlab.com/subscriptions/gitlab_credits/) in GitLab 18.7 and tied the Duo Agent Platform to consumption metering at a list price of $1.00 per on-demand credit. Billing consolidates at the root namespace level across three tiers: individual included credits (which expire monthly with no rollover), shared monthly commitment pools, and $1.00 on-demand overages (capped at $25,000 per month on Free namespaces).

| Feature or Model Tier | Billing Method | Calls or Runs per $1 Credit | Implied Cost per Action |
| --- | --- | --- | --- |
| GitLab Duo Code Suggestions | Flat per execution | 50 (managed) / 62.5 (self-hosted) | $0.020 / $0.016 |
| Code Review Flow | Flat per execution | 4 (managed) / 5 (self-hosted) | $0.250 / $0.200 |
| SAST False Positive Detection Flow | Flat per execution | 1 (managed) / 1.25 (self-hosted) | $1.000 / $0.800 |
| SAST Vulnerability Resolution Flow | Flat per execution | 0.25 (managed) / 0.3125 (self-hosted) | $4.000 / $3.200 |
| `codestral-2501` / `claude-haiku-5.5` | Variable per LLM call | 8.0 calls | $0.125 per call |
| `claude-sonnet-4.5` / `gpt-5.4` (<=272K) | Variable per LLM call | 2.0 calls | $0.500 per call |
| `gpt-5.4` (>272K context) | Variable per LLM call | 1.11 calls | $0.901 per call |
| `gpt-6-astra` (>272K context) | Variable per LLM call | 0.31 calls | $3.226 per call |

The SEC filings show why GitLab pivoted so aggressively toward metered credits. In Q1 FY2027 (ended April 30, 2026), GitLab generated $264.16 million in revenue (up 14% year-over-year) and $226.67 million in gross profit, while [total cost of revenue surged 50%](https://www.saasvaluation.io/company/gitlab/earnings/q1-fy2027) from $25.04 million to $37.49 million. A $7.5 million jump in third-party SaaS and cloud hosting costs pulled overall gross margin down 200 basis points, from 88% to 86%. Over the same twelve-month window, Dollar-Based Net Retention Rate slipped from 122% to 117%.

Executive commentary on consumption adoption also required a formal accounting correction. After leadership cited "nearly $20 million" in paid Consumption Run Rate (CRR) on the Q1 earnings call, GitLab filed a [July 8, 2026 Form 8-K](https://www.stocktitan.net/sec-filings/GTLB/8-k-gitlab-inc-reports-material-event-e7c846f2be54.html) clarifying that excluding one-time credit incentives put Q1 FY27 CRR closer to $15 million, roughly 1.4% of annualized revenue, before organic usage pushed CRR past $20 million on June 30, 2026. By contrast, a human security engineer reviewing four SAST alerts at a $90 hourly loaded cost spends roughly 15 minutes ($22.50) per verified patch, making a $4.00 successful AI remediation attractive only if the flow actually compiles and passes CI on the first run.

## 3. The Edge Cases and Breakages

Moving from single-turn autocomplete to multi-step agentic flows exposed structural failure modes across gateway security, billing fairness, and confidential-compute latency:

- Prompt template sandbox escape (CVE-2026-90970): On October 2, 2026, GitLab issued an emergency patch for [CVE-2026-90970](https://docs.gitlab.com/releases/patches/other-patches/patch-release-gitlab-ai-gateway-19-4-1-released/), rated CVSS 9.9 Critical (`AV:N/AC:L/PR:L/UI:N/S:C/C:H/I:H/A:H`). Affecting Self-Hosted AI Gateway versions 18.1.6 before 19.2.4, 19.3 before 19.3.2, and 19.4 before 19.4.1, the flaw stemmed from improper neutralization in custom flow prompt templates. Any authenticated user with Duo Agent Platform access could submit a crafted flow configuration, break out of the template sandbox, and run arbitrary commands directly on the AI Gateway host. Because the gateway holds provider API keys and repository context, a sandbox escape turns an ordinary developer account into an infrastructure compromise.
- Failed-flow billing penalties on self-hosted stacks: GitLab's [credits documentation](https://docs.gitlab.com/subscriptions/gitlab_credits/) reveals a sharp billing split when flows crash. On GitLab.com with managed models, a failed flow deducts zero credits even if intermediate LLM calls already ran. On GitLab Self-Managed with self-hosted models, variable-priced features meter each LLM call when it starts, meaning calls made before a flow fails (and error responses from the model) still burn credits; flat-priced features charge the full flat rate even when the flow fails completely. GitLab only removed billing for retried self-hosted LLM calls in release 19.6.
- Confidential computing timeout friction: Routing prompts through an attested Privatemode proxy into hardware TEEs keeps source code encrypted in memory, but GitLab's engineering team noted that remote attestation and AES-256 encryption add per-request roundtrip latency. Operators adopting confidential AI must manually raise AI Gateway timeout thresholds so slower self-hosted TEE backends do not trigger premature HTTP 504 drops during large-diff reviews.

When an automated flow fails or produces unsafe code, GitLab enforces a human-in-the-loop escalation path built into standard DevSecOps gates:

1. Flow termination or low-confidence diff: If a SAST Vulnerability Resolution Flow fails CI checks or exceeds its execution budget, the service account halts without merging.
1. Merge request staging: Every agent-generated patch lands as an unmerged draft or suggestion inside a GitLab merge request, never directly on a protected branch.
1. Composite identity audit: Maintainers inspect the diff alongside standard SAST scanners and CI test results, attributing all automated commits to the initiating user plus the agent's composite identity.
1. Human approval gate: A code owner reviews, edits, or rejects the patch before the merge button unlocks.

## 4. The Reusable Blueprint

Engineering leaders building internal developer platforms or agentic gateways can apply four concrete lessons from GitLab's 2026 rollout:

1. Treat prompt template rendering as untrusted code execution: Custom agent flows let users supply YAML configs and Jinja-style prompt templates. Run template rendering inside strictly isolated, capability-dropped sandboxes with zero shell or network access, because a single parser bypass (like CVE-2026-90970) compromises the entire AI Gateway and its upstream API credentials.
1. Meter agentic workflows by context tier and completed outcomes: Flat per-seat pricing collapses once agents run asynchronous multi-step loops over 272K+ token windows. Separate cheap autocomplete onto weighted open-weight pools (`Codestral` on Fireworks/Vertex) and meter heavy agentic flows via credit multipliers, while waiving charges on failed runs so users do not pay for broken loops.
1. Pair hardware attestation with explicit gateway timeout budgets: Regulated teams that cannot send proprietary code to public LLM APIs do not need to buy and staff a bare-metal GPU cluster. An OpenAI-compatible proxy backed by AMD SEV, Intel TDX, and NVIDIA Confidential Computing GPUs provides cryptographic proof of isolation, provided you adjust gateway timeouts for the attestation handshake.
1. Never grant autonomous agents direct merge rights to protected branches: Keep every agentic patch in a staged merge request gated by existing CI test suites, SAST scanners, and human code owners. Human review turns a 20% hallucination rate into a minor review annoyance rather than a production outage.

## Sources

- [GitLab AI Gateway Critical Patch Release: 19.2.4, 19.3.2, and 19.4.1](https://docs.gitlab.com/releases/patches/other-patches/patch-release-gitlab-ai-gateway-19-4-1-released/): Official security advisory detailing CVE-2026-90970 (CVSS 9.9) prompt template sandbox escape and arbitrary command execution.
- [GitLab Credits and usage billing](https://docs.gitlab.com/subscriptions/gitlab_credits/): Official metering specification listing $1 on-demand credits, model call multipliers, and failed-execution billing rules.
- [GitLab updates CRR and Q1 FY27 metrics (Form 8-K)](https://www.stocktitan.net/sec-filings/GTLB/8-k-gitlab-inc-reports-material-event-e7c846f2be54.html): July 8, 2026 SEC filing summary revising Q1 FY27 Consumption Run Rate from ~$20M to ~$15M and reporting $264M quarterly revenue.
- [GitLab Q1 FY2027 Form 10-Q Earnings Summary](https://www.saasvaluation.io/company/gitlab/earnings/q1-fy2027): Financial breakdown showing cost of revenue up 50% YoY on a $7.5M hosting surge, gross margin compression from 88% to 86%, and 117% net retention.
- [Confidential AI for GitLab Self-Hosted](https://about.gitlab.com/blog/confidential-ai-for-gitlab-self-hosted/): GitLab engineering post on Privatemode AI TEE integration, remote attestation, and AI Gateway timeout tradeoffs.
- [Code Suggestions Runbook](https://runbooks.gitlab.com/ai-gateway/code-suggestions/): GitLab SRE runbook documenting Codestral 25.08 weighted pooling (75% Fireworks AI, 25% Vertex AI) and <2.5s latency SLAs.

<!--
Artwork brief — from the writer routine. Draw per docs/ARTWORK.md,
then delete this comment.

- Argument in one sentence: A shared AI gateway isolates model routing and credit metering, but an unneutralized prompt template cracks the boundary open.
- Geometry: A horizontal pipeline passing through a central rectangular gateway frame on a Cartesian grid, with a split weighted pool (75/25) on the right and metered tick marks below.
- Accent: moss
- Deliberate imperfection: A fractured, offset template block breaking out of the central gateway wall in moss green, representing the CVE-2026-90970 sandbox escape.
-->
