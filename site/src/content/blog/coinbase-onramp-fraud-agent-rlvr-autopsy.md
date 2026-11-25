---
title: 'Coinbase AI Autopsy: $100 RL Training Beat Opus by 9.6 F1 Points'
description: 'Coinbase post-trained Qwen3.5-9B for under $100, beating Claude Opus 4.5 by 9.6 F1 points on Onramp fraud while cutting P50 latency 55% to 683ms.'
pubDate: 2026-11-25
publishedAt: '2026-11-25T20:06:29.493Z'
track: case-studies
question: 'Why did frontier LLM upgrades break Coinbase''s fraud recall, and how did a $100 9B model beat Opus 4.5?'
heroImage: '../../assets/art/coinbase-onramp-fraud-agent-rlvr-autopsy-light.webp'
heroImageDark: '../../assets/art/coinbase-onramp-fraud-agent-rlvr-autopsy-dark.webp'
heroAlt: 'Geometric comparison showing three tall frontier model columns falling short of a horizontal recall threshold on the left, while a compact moss-filled square clears the line on a short latency track on the right.'
readingTime: '7 min read'
notionId: '423ced67-050a-8138-ae8a-d014f99a481d'
---
<div class="tldr">

## Executive TL;DR

- Adding a selective LLM risk agent to Coinbase Onramp cut fraudulent transactions by 30% and fraud value by 22% in an [online A/B test](https://www.coinbase.com/blog/part-one-how-coinbase-built-evaluated-and-post-trained-a-fraud-agent), generating projected fraud savings roughly 3x its inference cost.
- On a fixed [16,140-transaction benchmark](https://www.coinbase.com/blog/part-two-owning-intelligence-series) with 813 confirmed fraud cases, upgrading to newer frontier models hurt detection: Sonnet 5 lost 22.2 percentage points of recall, GPT-5.6 lost 20.7 points, and Opus 5 regressed across all four metrics.
- Coinbase post-trained open-weight `Qwen3.5-9B` with Reinforcement Learning with Verifiable Rewards (RLVR) using LoRA and GRPO on [one NVIDIA RTX PRO 6000 96GB GPU for under $100](https://www.coinbase.com/blog/part-three-owning-intelligence-series).
- Served on autoscaled L40S GPUs via Ray Serve LLM and vLLM, the specialized 9B model beat Claude Opus 4.5 by 9.6 percentage points on F1 and 35.4 points on dollar-weighted recall while cutting P50 latency by 55% (683ms vs 1,515ms) and P99 latency from 3,312ms to 1,036ms.
- Across internal operations, Coinbase reported [25x agent call growth](https://www.coinbase.com/blog/part-one-how-coinbase-built-evaluated-and-post-trained-a-fraud-agent) in four months on its governed Control Center layer while posting [$1.22 billion in Q3 2026 revenue](https://investor.coinbase.com/news/news-details/2026/Coinbase-Q3-2026-Earnings-Show-All-time-high-Coinbase-One-Subscribers-and-Prediction-Markets-Surpassing-200-Million-in-Annualized-Revenue/default.aspx).

</div>

## 1. The Deployment

Coinbase Onramp lets users buy crypto inside third-party partner apps, often through guest checkout with little or no Coinbase account history. Traditional tabular ML models and static rules screen individual transactions cheaply, yet they miss multi-transaction attack sequences unless engineers hand-code new aggregate features for every emerging pattern.

Rather than replacing its existing risk stack, Coinbase layered a bounded LLM risk agent downstream of the primary checks inside a unified Ray Serve deployment:

1. **First-Line ML and Rules Engine**: Every Onramp checkout hits the traditional ML model and rules engine first. If upstream checks block the payment, the flow stops immediately; the LLM agent can block a transaction that would otherwise pass, but it can never override an upstream block.
1. **Selective Context Assembly**: For selected transactions, the serving layer strips the current transaction out of the streaming history (to prevent self-comparison), formats recent event sequences alongside pre-computed burst summaries, and appends calibration examples into a ~7,000-token prompt.
1. **Bounded Verdict Contract**: The agent does not call external tools or write prose explanations. It returns a single structured classification such as `RISK_LEVEL: 5`, keeping output tokens minimal so application code can enforce the decision policy deterministically.
1. **RLVR Post-Trained Model and Serving Plane**: Initially deployed on Claude Opus (1.5s median latency), the stack later migrated to `Qwen3.5-9B` post-trained with SkyRL on Anyscale using Megatron, LoRA, and GRPO against verified historical fraud outcomes, served via Ray Serve LLM and vLLM across 2 to 8 autoscaling NVIDIA L40S GPU replicas.

When a guest checkout triggers contextual risk review, the request executes in five steps:

1. Onramp Service sends the transaction payload to Risk Service, where the fast ML model and deterministic rules score it first.
1. Eligible transactions that clear upstream blocks enter an asynchronous Ray Serve batch, where each review runs concurrently with limited retries and a configurable fallback model.
1. The serving layer injects static review guidance and builds the ~7,000-token context from streaming transaction history without maintaining multi-turn conversation state.
1. The vLLM-backed `Qwen3.5-9B` endpoint returns a compact risk level in 683ms at P50 (1,036ms at P99).
1. Deterministic application code parses the risk level, applies the block or allow policy, and logs model version, retry count, elapsed time, and token usage for outcome attribution.

## 2. The Balance Sheet

Coinbase's [Q3 2026 earnings release](https://investor.coinbase.com/news/news-details/2026/Coinbase-Q3-2026-Earnings-Show-All-time-high-Coinbase-One-Subscribers-and-Prediction-Markets-Surpassing-200-Million-in-Annualized-Revenue/default.aspx) (quarter ended September 30, 2026) shows why fraud unit economics and infrastructure discipline matter: total revenue stood at $1.22 billion (down 35% year over year as spot transaction revenue held at $590 million and subscription and services revenue reached $570 million, or 49% of net revenue), with Adjusted EBITDA of $332.9 million, Adjusted net income of $77.7 million, and $8.6 billion in cash and equivalents.

In the [Part 1 online A/B experiment](https://www.coinbase.com/blog/part-one-how-coinbase-built-evaluated-and-post-trained-a-fraud-agent) (50% traffic split), adding the selective LLM risk layer reduced fraudulent transaction count by 30% and total fraud value by 22% while lifting total transactions, users, and revenue. Because Coinbase reserved the ~7,000-token LLM call for selected riskier checkouts rather than 100% of volume, projected fraud-prevention savings ran roughly 3x the estimated frontier inference bill.

| Model / Deployment Stage | Precision / Recall / F1 | Dollar-Weighted Recall | Online Latency (P50 / P99) | Training or Serving Economics |
| --- | --- | --- | --- | --- |
| Opus 5 vs Opus 4.5 | All 4 metrics declined (-0.8 pts recall) | Lower vs Opus 4.5 | Baseline ~1,515ms / 3,312ms | Closed API, ~7,000 input tokens |
| Sonnet 5 vs Sonnet 4.6 | Recall -22.2 pts; F1 declined | -22.9 pts vs Sonnet 4.6 | Closed API | Newer snapshot broke risk boundary |
| GPT-5.6 (sol) vs GPT-5.4 | Precision +11.5 pts; Recall -20.7 pts | -21.8 pts vs GPT-5.4 | Closed API | Conservative shift missed high-value fraud |
| Post-Trained `Qwen3.5-9B` (vs Opus 4.5) | +7.5 pts Prec / +12.0 pts Rec / +9.6 pts F1 | +35.4 pts vs Opus 4.5 | 683ms (-55%) / 1,036ms (-68.7%) | <$100 training (1x RTX PRO 6000); 2-8x L40S |

Switching from Claude Opus 4.5 to self-hosted `Qwen3.5-9B` inverted the cost-quality curve. Instead of paying frontier per-token API rates for a ~7,000-token prompt on every flagged checkout, Coinbase spent under $100 on a single 96GB RTX PRO 6000 GPU to run GRPO LoRA post-training and deployed the merged weights onto 2 to 8 L40S GPUs. That move cut median latency by 55% (from 1,515ms to 683ms), cut tail latency by 68.7% (from 3,312ms to 1,036ms), kept sensitive transaction histories off external model APIs, and boosted dollar-weighted fraud recall by 35.4 percentage points over Opus 4.5.

## 3. The Edge Cases and Breakages

Coinbase's engineering series documents four concrete ways production fraud and operational agents break when left to naive model defaults:

1. **Silent policy drift on frontier model upgrades**: On Coinbase's fixed [16,140-transaction benchmark](https://www.coinbase.com/blog/part-two-owning-intelligence-series) (7,293 users, 813 confirmed fraud cases across nine pre-rollout weeks), upgrading to newer model snapshots degraded fraud coverage across all three frontier families. Opus 5 dropped on every metric, Sonnet 5 lost 22.2 points of recall and 22.9 points of dollar-weighted recall, and GPT-5.6 (sol) raised precision by 11.5 points while losing 20.7 points of recall and 21.8 points of dollar-weighted recall. A routine model config change quietly rewrote the company's risk boundary toward higher false negatives on large-dollar attacks.
1. **Unadapted small models fail out of the box**: Base `Qwen3.5-9B` performed poorly on the Onramp fraud benchmark before RLVR post-training. Only domain-specific reinforcement learning against verified fraud outcomes (rather than generic instruction tuning) lifted the 9B backbone past Opus 4.5.
1. **Class imbalance and delayed-label reward traps**: Because legitimate transactions vastly outnumber confirmed fraud cases, a naive accuracy reward teaches an RL policy to predict "legitimate" everywhere. Coinbase had to balance fraudulent and legitimate reward weights explicitly, and it had to evaluate on nine-week-old pre-rollout cohorts where chargeback and fraud labels had already matured without intervention bias from the agent itself.
1. **Control-plane fan-out and support procedure drift**: Outside Onramp, Coinbase's internal operations platform (Control Center) saw [agent calls jump 25x](https://www.coinbase.com/blog/part-one-how-coinbase-built-evaluated-and-post-trained-a-fraud-agent) in four months, forcing strict per-call MCP authorization, audit, approval, and rate-limit gates for 100x bursts. In customer support, Coinbase built [Autopilot](https://www.coinbase.com/blog/autopilot-engineering-an-agentic-quality-loop-for-support-automation) after manual happy-path testing broke across dozens of support decision trees whenever model updates or third-party bot runtimes diverged from the same procedure.

Human escalation and fallback are built into the serving contract: the LLM agent can never unblock an upstream ML/rule rejection, batched calls isolate individual failures with configurable fallback models, and sensitive Control Center mutations require explicit human-in-the-loop approvals.

## 4. The Reusable Blueprint

1. **Gate LLM agents behind deterministic rules and asymmetric authority**: Put fast tabular ML and static rules first, invoke the LLM selectively on borderline traffic, and allow the agent only to add caution (block or escalate) rather than override upstream blocks.
1. **Benchmark upgrades on dollar-weighted domain outcomes**: Never ship a new frontier model snapshot on general leaderboard scores. Maintain a fixed, pre-intervention historical dataset with matured labels and track precision, recall, F1, and dollar-weighted recall together.
1. **Separate training reasoning from serving contracts**: Strip prose explanations out of production inference. Force the runtime to return a compact token (`RISK_LEVEL: 5`) so P50 and P99 latencies stay inside synchronous checkout budgets.
1. **Use RLVR on a 9B open-weight model when frontier APIs drift**: When a narrow classification or risk task has deterministic historical labels, LoRA + GRPO on a single 96GB GPU costs under $100 and gives you frozen, auditable weights on your own GPUs.

## Sources

- [Part 3/3 Owning Intelligence Series: How Coinbase Built, Evaluated, and Post-Trained a Fraud Agent](https://www.coinbase.com/blog/part-three-owning-intelligence-series)
- [Part 2/3 Owning Intelligence Series: How Coinbase Built, Evaluated, and Post-Trained a Fraud Agent](https://www.coinbase.com/blog/part-two-owning-intelligence-series)
- [Part 1/3 Owning Intelligence Series: How Coinbase Built, Evaluated, and Post-Trained a Fraud Agent](https://www.coinbase.com/blog/part-one-how-coinbase-built-evaluated-and-post-trained-a-fraud-agent)
- [Coinbase Q3 2026 Earnings Release](https://investor.coinbase.com/news/news-details/2026/Coinbase-Q3-2026-Earnings-Show-All-time-high-Coinbase-One-Subscribers-and-Prediction-Markets-Surpassing-200-Million-in-Annualized-Revenue/default.aspx)
- [Autopilot: engineering an agentic quality loop for support automation](https://www.coinbase.com/blog/autopilot-engineering-an-agentic-quality-loop-for-support-automation)

<!--
Artwork brief — from the writer routine. Draw per docs/ARTWORK.md,
then delete this comment.

- Argument in one sentence: Three tall frontier model bars sag below a horizontal risk threshold while one compact, post-trained 9B block locks cleanly onto the target line at half the latency.
- Geometry: On the left, three tall open-outlined columns representing Opus 5, Sonnet 5, and GPT-5.6 drop short of a dashed horizontal recall threshold; on the right, a compact moss-filled square representing post-trained Qwen3.5-9B sits squarely above the threshold on a short latency bar, connected to a small feedback loop below.
- Accent: {{moss}}
- Deliberate imperfection: The third frontier column on the left spikes high above the precision frame at the top while its lower edge fractures and falls short of the recall baseline, capturing GPT-5.6's 11.5-point precision gain paired with a 20.7-point recall drop.
-->
