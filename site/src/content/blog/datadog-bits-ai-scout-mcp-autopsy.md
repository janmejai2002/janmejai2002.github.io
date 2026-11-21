---
title: 'Datadog Bits AI Autopsy: Cutting $25 Alert Loops to $4 and $0.003'
description: 'Datadog cut Bits Investigation cost 84% from $25 to $4 via MCP code execution and Scout 1.0, while fine-tuned Qwen3.5-9B dropped triage to $0.003.'
pubDate: 2026-11-21
publishedAt: '2026-11-21T19:50:45.112Z'
track: case-studies
question: 'How did Datadog cut AI incident investigation costs 84% from $25 to $4 without losing accuracy?'
heroImage: '../../assets/art/datadog-bits-ai-scout-mcp-autopsy-light.webp'
heroImageDark: '../../assets/art/datadog-bits-ai-scout-mcp-autopsy-dark.webp'
heroAlt: 'A 1600 by 900 geometric diagram on paper showing three narrowing telemetry funnels feeding a central sandbox box and a clean diagnostic output line, with one upper trace detouring into a broken dashed loop in moss green.'
readingTime: '7 min read'
notionId: '41fced67-050a-8149-8faa-e869e7747907'
---
<div class="tldr">

## Executive TL;DR

- **84% cost and 82% latency drop:** Between December 2025 and October 2026, [Bits Investigation](https://www.datadoghq.com/blog/bits-investigations-cost-speed-accuracy/) fell from $25 and 11 minutes per alert investigation to roughly $4 and 2 minutes while raising internal benchmark scores by 44%.
- **MCP code execution:** Replacing sequential tool round-trips with sandboxed JavaScript in the [Datadog MCP Server](https://www.datadoghq.com/blog/datadog-code-execution/) cut average input tokens by 73% (159,000 to 43,000) and raised task accuracy from 74% to 90%.
- **Specialized SRE models:** Datadog's reinforcement-learned [Scout 1.0](https://www.datadoghq.com/blog/ai/introducing-scout-sre-specialized-model-bits-ai/) (built on GLM-5.3 Flash) matched frontier models at 3x to 19x lower inference cost, while a [fine-tuned Qwen3.5-9B](https://www.datadoghq.com/blog/ai/investigate-production-alerts/) hit 87% of teacher Recall@5 at $0.003 per run.
- **Financial cushion:** Datadog posted [$1.20 billion in Q3 2026 revenue](https://investors.datadoghq.com/news-releases/news-release-details/datadog-announces-third-quarter-2026-financial-results/) (up 35% year-over-year) with an 80% GAAP gross margin and $251 million in free cash flow, shifting AI consumption onto metered [AI Credits](https://docs.datadoghq.com/account_management/billing/ai_credits/).
- **Documented failure modes:** Base 9B models exhausted turn or context limits in 25% of runs, self-training on proxy labels risks amplifying wrong diagnoses, and stale runbooks or missing `service` tags misdirect automated investigations.

</div>

## 1. The Deployment

Datadog's Bits AI stack sits directly inside its observability platform, where [Bits Investigation](https://docs.datadoghq.com/bits_ai/bits_investigation/investigate_issues/) acts as an automated first responder for monitor alerts, Synthetic test failures, Real User Monitoring regressions, and Error Tracking issues. At launch in December 2025, the system used a multi-phase orchestration pipeline with separate stages for context retrieval, hypothesis generation, and validation. That rigid pipeline cost $25 and took 11 minutes per investigation.

Datadog rebuilt the stack in three stages documented across its 2026 engineering posts:

- **Simpler ReAct loop:** Replacing the multi-phase orchestrator with a standard ReAct agent cut average investigation cost from $25 to roughly [$6.50](https://www.datadoghq.com/blog/bits-investigations-cost-speed-accuracy/) by letting the model choose tools dynamically.
- **Sandboxed MCP code execution:** Shipped to general availability in September 2026, [Code Execution in the Datadog MCP Server](https://www.datadoghq.com/blog/datadog-code-execution/) lets agents write JavaScript that queries Datadog APIs in parallel inside a managed sandbox and returns only joined summaries. Across 25 observability tasks on four frontier models (GPT-5.6 Terra, GPT-5.6 Sol, Claude Sonnet 5, and Claude Opus 4.8), code execution cut input tokens from 159,000 to 43,000 (-73%), reduced tool calls from 4.1 to 2.5 (-40%), and lifted correctness from 74% to 90%.
- **Domain-tuned models (`Scout 1.0` and `Qwen3.5-9B`):** On October 15, 2026, Datadog introduced [Scout 1.0](https://www.datadoghq.com/blog/ai/introducing-scout-sre-specialized-model-bits-ai/), a specialized SRE model built on GLM-5.3 Flash and post-trained with distributed reinforcement learning over historical incident simulations. For high-volume change attribution, Datadog also fine-tuned [Qwen3.5-9B](https://www.datadoghq.com/blog/ai/investigate-production-alerts/) using 16-bit LoRA on rejection-sampled traces from GLM-5.3.

Context engineering relies on a Markdown file (`bits.md`), monitor messages, linked Confluence or GitHub sources, and stored feedback memories documented in [Improve Bits Investigation Accuracy](https://docs.datadoghq.com/bits_ai/bits_investigation/improve_accuracy/).

When an alert fires, an automated investigation follows six steps:

1. A monitor transitions to the alert state (warn, no-data, and test notifications do not trigger auto-investigations) or an engineer invokes `@Datadog` in Slack or the Bits API (`POST /api/v2/bits-ai/investigations`).
1. Bits loads `bits.md`, the monitor message, and relevant past memories to resolve service naming mismatches and known noise patterns.
1. The agent inspects recent deployments, feature flags, and config changes via the Change Tracking MCP tool, which contributes to [20% of Bits Investigation conclusions](https://www.datadoghq.com/blog/ai/investigate-production-alerts/).
1. Using ReAct reasoning and MCP Code Execution, the model queries metrics, APM traces, logs, and Continuous Profiler data in parallel inside the sandbox without pulling raw payloads into its context window.
1. Bits iteratively updates its Hypothesis Tree until it converges on a root cause or marks the investigation inconclusive when telemetry is insufficient.
1. The system posts the summary, Hypothesis Tree, and suggested code or infrastructure remediations to the UI, Slack, or ITSM tools for human review.

## 2. The Balance Sheet

Datadog's Q3 2026 financials show how a high-margin SaaS vendor absorbs and meters agentic inference at scale. For the quarter ended September 30, 2026, [Datadog reported](https://investors.datadoghq.com/news-releases/news-release-details/datadog-announces-third-quarter-2026-financial-results/) $1.20 billion in revenue (up 35% year-over-year), $334 million in non-GAAP operating income (28% margin), and $251 million in free cash flow. Cost of revenue was $237.2 million against $176.5 million a year earlier, yielding an 80% GAAP gross margin and an [81.2% non-GAAP gross margin](https://finance.biggo.com/quote/DDOG/earnings-call/US_DDOG_2026-11-04) (up from 79.6% in Q2 2026).

At $25 per investigation, running Bits automatically on millions of weekly monitors was commercially unviable. Datadog's engineering disclosures show the unit-cost curve across four architectures:

| Architecture / Model | Avg Cost / Run | Latency or Tokens | Quality / Recall |
| --- | --- | --- | --- |
| Multi-phase Bits v1 (Dec 2025) | $25.00 | 11 min | Baseline |
| ReAct Bits v2 (2026) | ~$6.50 | Multi-turn MCP | Improved tool routing |
| ReAct + MCP Code Exec + Scout 1.0 (Oct 2026) | ~$4.00 | ~2 min; 43k tokens | +44% vs March 2026 |
| Fine-tuned Qwen3.5-9B (Change Attribution) | $0.003 | 52,900 tokens | 0.55 internal / 0.62 customer Recall@5 |

The change-attribution benchmark in [Datadog's Qwen3.5-9B study](https://www.datadoghq.com/blog/ai/investigate-production-alerts/) exposes the gap between frontier APIs and self-hosted student models across 187 internal incidents:

- **Opus 5.0:** 0.68 internal Recall@5 (0.71 customer) at $0.32 per investigation (80,500 tokens).
- **GLM-5.3 (teacher):** 0.63 internal Recall@5 at $0.06 per investigation (109,000 tokens).
- **Fine-tuned Qwen3.5-9B:** 0.55 internal Recall@5 (0.62 customer), capturing 87% of teacher recall at $0.003 per investigation (52,900 tokens) on a single 40 GB NVIDIA A100 ($1.74/GPU-hour, ~100,000 runs/week per GPU).
- **Heuristics ranker:** 0.46 internal Recall@5 (0.51 customer) at $0.002 per run (2,140 tokens).

On [AlertEval](https://www.datadoghq.com/blog/ai/introducing-scout-sre-specialized-model-bits-ai/), `Scout 1.0 medium` matched GPT-6.1 Sol high and Claude Opus 5.5 high at 3x to 8x lower estimated inference cost, and matched Fable medium and Astra medium at 12x and 19x lower cost.

Customers pay for this compute via metered [AI Credits](https://docs.datadoghq.com/account_management/billing/ai_credits/) across Bits Chat, Bits Investigation, Bits Code, Bits Agent Builder, and Bits Database Optimization. Organizations choose Annual Commit (500-credit monthly bundles), Monthly Commit, or On-Demand overages. Credits reset on the first of each month without rollover. Under [AI Credit Limits](https://docs.datadoghq.com/account_management/billing/ai_credit_limits/), admins can cap monthly spend at the organization, role, user, or service-account level, and track consumption per product via `datadog.estimated_usage.*.ai_credits` metrics.

## 3. The Edge Cases and Breakages

Datadog's engineering posts and documentation expose five operational failure modes:

- **Broad-search context exhaustion in small models:** Prompt engineering alone failed to constrain smaller models. In Datadog's [Qwen3.5-9B evaluation](https://www.datadoghq.com/blog/ai/investigate-production-alerts/), the base 9B model exhausted its turn limit or context window in 25% of investigations because it queried too broadly (averaging 6.8 search calls and only 4.7 log/span evidence calls). LoRA fine-tuning shifted the ratio to 5.8 search calls and 8.3 evidence calls.
- **Imperfect proxy labels in self-training:** Datadog's flywheel parses free-form Bits Investigation conclusions into proxy labels without human verification. Engineering explicitly warns that Bits sometimes attributes the wrong change, so using those matches directly as reinforcement-learning rewards risks reinforcing flawed root-cause heuristics.
- **Silent misrouting from missing tags and stale runbooks:** According to [Improve Bits Investigation Accuracy](https://docs.datadoghq.com/bits_ai/bits_investigation/improve_accuracy/), monitors without a `service` tag force Bits to fall back on weak signals like monitor titles. Cross-system naming mismatches (such as `billing-svc` in alerts vs. `billing_service` in APM) break correlation unless codified in `bits.md`, and stale runbook links actively steer the agent toward decommissioned services. Moreover, changes tested in Bits Chat do not always behave identically inside full investigations.
- **Alert-noise dilution and API gaps:** Enabling Auto-Investigate across all monitors floods low-priority alerts and burns credits. Datadog advises filtering strictly to `priority:p1` or `priority:p2` monitors, and [Investigate Issues](https://docs.datadoghq.com/bits_ai/bits_investigation/investigate_issues/) notes that Auto-Investigate cannot be toggled via the Datadog API or Terraform.
- **Hard HTTP 429 quota cutoffs:** Under [AI Credit Limits](https://docs.datadoghq.com/account_management/billing/ai_credit_limits/), once an organization or user cap is hit, new API investigations fail immediately with HTTP 429 (`AI_CREDITS_EXHAUSTED` or `INVESTIGATION_RATE_LIMIT_EXCEEDED`), while inconclusive telemetry stalls autonomous remediation and falls back to on-call engineers.

## 4. The Reusable Blueprint

Tech leads building production AI agents can apply four verified lessons from Datadog:

1. **Move data joins into a code-execution sandbox:** Letting an agent query APIs via sequential MCP calls fills the context window with raw JSON. Running agent-written JavaScript inside a credential-isolated sandbox cut Datadog's input tokens by 73% and lifted accuracy from 74% to 90%.
1. **Distill narrow sub-tasks onto 9B-class student models:** Do not run $0.32 frontier models on every alert. Rejection-sampling teacher traces into a fine-tuned 9B LoRA model preserved 87% of teacher Recall@5 at 5% of the cost ($0.003 per run).
1. **Train domain models on real tool trajectories, not static prompts:** Reinforcement learning over historical incident simulations (`Scout 1.0`) cut end-to-end investigation cost 3x to 19x versus general-purpose frontier models.
1. **Gate autonomous triggers and curate environment rules:** Restrict auto-triggered agents to P1/P2 alerts, require `service` tagging, and maintain a concise `bits.md`-style mapping file so agents do not burn metered credits chasing naming mismatches or noisy monitors.

## Sources

- [Bits investigations are faster, more accurate, and cost less](https://www.datadoghq.com/blog/bits-investigations-cost-speed-accuracy/): $25 to $6.50 to $4 cost progression, 11 min to 2 min latency drop, and +44% benchmark quality
- [Cut AI agent cost and improve accuracy with Code Execution in the Datadog MCP Server](https://www.datadoghq.com/blog/datadog-code-execution/): 73% input token reduction (159k to 43k), 40% fewer tool calls, and 74% to 90% accuracy gain
- [Introducing Scout 1.0: A new SRE model powering Bits AI with frontier performance at a fraction of the cost](https://www.datadoghq.com/blog/ai/introducing-scout-sre-specialized-model-bits-ai/): GLM-5.3 Flash RL training, AlertEval and SREGym 3x to 19x cost reductions
- [How we fine-tuned Qwen3.5-9B for change attribution in production alerts](https://www.datadoghq.com/blog/ai/investigate-production-alerts/): $0.003 vs $0.06 vs $0.32 per investigation, 25% base-model context exhaustion, and proxy-label caveats
- [Datadog Announces Third Quarter 2026 Financial Results](https://investors.datadoghq.com/news-releases/news-release-details/datadog-announces-third-quarter-2026-financial-results/) and [Q3 FY2026 Earnings Call Summary](https://finance.biggo.com/quote/DDOG/earnings-call/US_DDOG_2026-11-04): $1.20B revenue, 80% GAAP / 81.2% non-GAAP gross margin, $251M FCF
- [AI Credits](https://docs.datadoghq.com/account_management/billing/ai_credits/) and [AI Credit Limits](https://docs.datadoghq.com/account_management/billing/ai_credit_limits/): Commit/on-demand billing, attribution rules, and HTTP 429 exhaustion codes
- [Investigate Issues](https://docs.datadoghq.com/bits_ai/bits_investigation/investigate_issues/) and [Improve Bits Investigation Accuracy](https://docs.datadoghq.com/bits_ai/bits_investigation/improve_accuracy/): `bits.md` rules, P1/P2 filtering, Terraform/API limits, and inconclusive fallbacks

<!--
Artwork brief — from the writer routine. Draw per docs/ARTWORK.md,
then delete this comment.

- Argument in one sentence: Routing telemetry queries through a code-execution sandbox and a distilled 9B/Scout model collapses a sprawling $25 multi-agent loop into a tight $4 path, unless an unmapped service tag breaks the loop.
- Geometry: Three concentric reduction funnels on the left feeding a central sandbox execution rectangle, which outputs a clean two-step diagnostic line to the right.
- Accent: moss
- Deliberate imperfection: One upper telemetry trace line detours out of the sandbox into an unclosed dashed loop in `{{moss}}`, representing a 25% broad-search context exhaustion and an HTTP 429 credit cutoff.
-->
