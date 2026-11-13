---
title: 'Self-Hosted Managed Agents Flip the Enterprise Zero-Retention Math'
description: 'Self-hosted Claude Managed Agents is the sole tier eligible for Zero Data Retention, but drops 7 hosted features and adds 8-hour rollback SLAs and VPC ops.'
pubDate: 2026-11-13
publishedAt: '2026-11-13T23:36:47.375Z'
track: business
question: 'Does self-hosting Claude Managed Agents eliminate vendor data retention and lock-in risks?'
keywords:
  - Self-Hosted Managed Agents
  - Enterprise Zero Data Retention
  - Agent Infrastructure Build vs Buy
  - VPC Agent Governance
heroImage: '../../assets/art/self-hosted-claude-managed-agents-enterprise-light.webp'
heroImageDark: '../../assets/art/self-hosted-claude-managed-agents-enterprise-dark.webp'
heroAlt: 'Geometric diagram showing three internal server blocks inside a solid rectangular firewall, with an ochre outbound vector and three tick marks piercing the right wall toward an external model node.'
readingTime: '7 min read'
notionId: '417ced67-050a-81f6-85f5-debbcb5fb88b'
---
<div class="tldr">

## Executive TL;DR

- **Standard Hosted Managed Agents has no Zero Data Retention:** According to [Anthropic's official Claude Managed Agents documentation](https://platform.claude.com/docs/en/managed-agents/overview), the hosted `/v1/agents`, `/v1/sessions`, and `/v1/environments` endpoints are stateful by design and **not eligible for Zero Data Retention (ZDR) or HIPAA BAA coverage**.
- **Self-hosting is the sole ZDR path for Managed Agents:** On November 12, 2026 (`17:57 UTC`), Anthropic launched **self-hosted Claude Managed Agents** in private beta, making it the only Managed Agents edition eligible for ZDR because session history stays inside the customer's own PostgreSQL 16+ database ([Claude Platform Docs](https://platform.claude.com/docs/en/managed-agents/overview); [CellCog](https://cellcog.ai/blog/claude-managed-agents-self-hosted/)).
- **Seven hosted features disappear when you self-host:** Anthropic's documentation confirms that self-hosted deployments lack **7 hosted features**: cloud environments, the Messages/Models API, the Files API, OAuth credentials for MCP servers, prebuilt `docx`/`pdf`/`pptx`/`xlsx` skills, scheduled deployments and dreams, and webhooks ([CellCog Analysis of Anthropic Docs](https://cellcog.ai/blog/claude-managed-agents-self-hosted/)).
- **Strict license deadlines and mandatory ID headers remain:** The November 12, 2026 Software License Agreement caps Anthropic's liability at **US$100,000**, mandates an **8-hour rollback** after a written safety notice, and sends 3 non-disableable usage ID headers (`session`, `agent`, `environment`) whenever calls route to the Claude API ([CellCog](https://cellcog.ai/blog/claude-managed-agents-self-hosted/)).
- **Google Cloud offers a vendor-neutral Kubernetes alternative:** On November 11–12, 2026, Google Cloud opened Preview access for **Agent Gateway for GKE** (on GKE `1.37.2-gke.1042000+`) and **Agent Gateway for cross-cloud** (`EKS`, `AKS`, `OpenShift`), governing multi-model agents without tying orchestration to a single model vendor's compiled server ([Google Cloud Release Notes](https://docs.cloud.google.com/gemini-enterprise-agent-platform/release-notes); [AI Weekly](https://aiweekly.co/alerts/google-opens-agent-gateway-preview-for-eks-aks-openshift)).

</div>

## The ZDR Catch: Why Regulated Enterprises Are Forced Toward Self-Hosted Agents

Enterprise security officers spent the past year assuming that signing an enterprise Zero Data Retention (ZDR) addendum with a frontier AI lab automatically covers every API endpoint on that vendor's platform. For Anthropic's **Claude Managed Agents** (`managed-agents-2026-04-01`), [Anthropic's official platform documentation](https://platform.claude.com/docs/en/managed-agents/overview) states the exact opposite:

> *"Claude Managed Agents is stateful by design: sessions are long-running, resume cleanly after pauses, and store conversation history, sandbox state, and outputs server-side. Because of this, Managed Agents is not currently eligible for Zero Data Retention or HIPAA Business Associate Agreement (BAA) coverage. The exception for Zero Data Retention is self-hosted Claude Managed Agents, where you store that data yourself."*

That single paragraph reshapes enterprise procurement. If a bank, healthcare system, or defense contractor wants to use Anthropic's pre-built agent harness without leaving full session transcripts and tool outputs persisted on vendor storage until manual deletion, standard hosted Managed Agents fails compliance review at the gate. And note that **HIPAA remains ineligible across all Managed Agents sub-features** ([Claude Platform Docs](https://platform.claude.com/docs/en/managed-agents/overview)).

To close that compliance gap, Anthropic opened private beta access for **self-hosted Claude Managed Agents** on November 12, 2026 ([AI Weekly](https://aiweekly.co/alerts/anthropic-opens-self-hosted-claude-managed-agents-in-private-beta); [Help Net Security](https://www.helpnetsecurity.com/2026/11/12/anthropic-self-hosted-claude-managed-agents/)). Previously, enterprises could self-host only the execution sandboxes while Anthropic operated the control plane and stored the session ledger. Now, eligible organizations can move the orchestration server (`cma-server`), the session database, and the worker sandboxes inside their own cloud VPC or on-premises perimeter ([General Analysis](https://generalanalysis.com/guides/claude-managed-agents-self-hosted-isolation)).

## Inside the Perimeter: What You Actually Run When You Self-Host Managed Agents

Moving the control plane behind your firewall solves session-history residency, but it transfers four nontrivial infrastructure and security burdens directly onto your internal platform engineering team ([CellCog](https://cellcog.ai/blog/claude-managed-agents-self-hosted/); [General Analysis](https://generalanalysis.com/guides/claude-managed-agents-self-hosted-isolation)):

1. **You Operate `cma-server`, `PostgreSQL 16+`, and Container Isolation:** Your team runs the compiled `cma-server` binary, provisions high-availability **PostgreSQL 16 or later** (without Postgres, `cma-server` holds state in volatile RAM and wipes everything on restart), and manages the worker fleet. Crucially, Anthropic's documentation warns that the agent's bash tool *"is a real shell with the worker process's permissions and network access"*, and the worker binary itself does not sandbox the shell, so your team must build container or micro-VM isolation around every worker ([CellCog](https://cellcog.ai/blog/claude-managed-agents-self-hosted/)).
1. **One Deployment per Trust Level:** Environments inside a single `cma-server` deployment do not isolate tenants or privilege tiers from one another. Anthropic's data-and-access guide specifies that **each deployment serves one tenant at one trust level** ([General Analysis](https://generalanalysis.com/guides/claude-managed-agents-self-hosted-isolation)), meaning an enterprise separating HR, finance, and production engineering agents must stand up separate `cma-server` + Postgres stacks for each security zone.
1. **Prompts Still Leave Your Network on Every Turn:** Self-hosting the harness does not mean self-hosting the LLM weights. On every step, `cma-server` transmits the conversation history, tool inputs, and tool results to one of five inference destinations: the Claude API, Amazon Bedrock, Claude Models on Google Cloud, Microsoft Foundry, or your own model gateway. When calling the Claude API directly, `cma-server` attaches three attribution headers (`session`, `agent`, and `environment` IDs) that **no configuration setting can disable** ([CellCog](https://cellcog.ai/blog/claude-managed-agents-self-hosted/)).
1. **Seven Hosted Features Are Missing (`29` Documented Differences):** As counted from Anthropic's November 12 documentation tables ([CellCog](https://cellcog.ai/blog/claude-managed-agents-self-hosted/)), self-hosted deployments lose **7 hosted capabilities** (cloud environments, Messages/Models API endpoints, the Files API, OAuth token refresh for MCP servers, prebuilt `docx`/`pdf`/`pptx`/`xlsx` skills, scheduled cron deployments/dreams, and webhooks) while 14 other behaviors change (for example, `cma-server` does not block `git push --force` on allowed repositories).

## Anthropic Managed Agents vs. Google Agent Gateway: Two Paths to Multi-Cloud Control

Anthropic's November 12 beta landed within 24 hours of a competing enterprise control-plane push from Google Cloud. On November 11–12, 2026, Google launched **Agent Gateway for GKE** in Preview (requiring GKE `1.37.2-gke.1042000` or higher in `us-central1` and `europe-west1`) alongside a Limited Preview of **Agent Gateway for cross-cloud** covering AWS `EKS`, Azure `AKS`, and Red Hat `OpenShift`, plus general availability of gVisor-based **Agent Sandbox on GKE** ([Gemini Enterprise Agent Platform Release Notes](https://docs.cloud.google.com/gemini-enterprise-agent-platform/release-notes); [Gravitee](https://www.gravitee.io/blog/kubernetes-news-updates); [AI Weekly](https://aiweekly.co/alerts/google-opens-agent-gateway-preview-for-eks-aks-openshift)).

Compare the three enterprise deployment models across compliance, feature parity, and vendor lock-in:

| Governance Dimension | Hosted Claude Managed Agents | Self-Hosted Claude Managed Agents (`cma-server`) | Google Cloud Agent Gateway + GKE Agent Sandbox |
| --- | --- | --- | --- |
| **Zero Data Retention (ZDR)** | **Not eligible** ([Claude Docs](https://platform.claude.com/docs/en/managed-agents/overview)) | **Eligible** (state stays in customer Postgres 16+) | Customer-controlled via GKE / EKS / AKS policies |
| **HIPAA BAA Eligibility** | **Not eligible** ([Claude Docs](https://platform.claude.com/docs/en/managed-agents/overview)) | **Not eligible** across Managed Agents sub-features | Covered under Google Cloud BAA for eligible GKE components |
| **Sandbox Isolation** | Anthropic-managed cloud sandboxes | Customer must isolate worker processes via VMs/containers ([CellCog](https://cellcog.ai/blog/claude-managed-agents-self-hosted/)) | Native **gVisor** sub-second isolation via GA `GKE Agent Sandbox` ([Gravitee](https://www.gravitee.io/blog/kubernetes-news-updates)) |
| **Model Vendor Lock-In** | Locked to Claude models | License restricts use to Anthropic models except as expressly permitted ([CellCog](https://cellcog.ai/blog/claude-managed-agents-self-hosted/)) | Model-agnostic network/traffic governance across GKE, EKS, AKS, OpenShift |
| **Missing Capabilities** | Full feature set (Files API, webhooks, cron, MCP OAuth) | **Missing 7 features** (no Files API, webhooks, cron, or MCP OAuth refresh) | Requires bringing your own agent loop (ADK, LangGraph, or custom) |

## The Build-vs-Buy Calculus: Pricing the Hidden Operational Tax of Private Sandboxes

While Anthropic's November 12 Software License Agreement calls the `cma-server` binary grant *"royalty-free"* on top of existing model token contracts ([CellCog](https://cellcog.ai/blog/claude-managed-agents-self-hosted/)), treating the software as "free" ignores both the infrastructure footprint and the unusually strict operational SLAs inside the license agreement.

First, look at the **contractual compliance clock** in Anthropic's November 12 license agreement ([CellCog Table 2](https://cellcog.ai/blog/claude-managed-agents-self-hosted/)):

- **8 hours (calendar time, not business hours):** Maximum window to disable a feature or roll back a `cma-server` version after receiving a written safety notice from Anthropic (Section 5.3).
- **1 business day:** Deadline to deploy a mandatory safety update (Section 5.2).
- **30 days:** Deadline to deploy standard updates or stop running a withdrawn version (Sections 5.4 and 5.5).
- **48 hours / 72 hours:** Mandatory reporting window to notify Anthropic of an agent incident (48 hours, Section 5.7) or unauthorized access to the server code (72 hours, Section 7.5), while Anthropic caps its own liability at **US$100,000** and disclaims support obligations.

Second, model the **annual Total Cost of Ownership (TCO)** for a regulated enterprise running **3 trust-isolated deployments** (for example: Internal DevOps, Financial Operations, and Customer Support, since each trust level requires its own deployment per [Anthropic's isolation rules](https://generalanalysis.com/guides/claude-managed-agents-self-hosted-isolation)):

- **Database & Control Plane (3x HA `PostgreSQL 16` + `cma-server` nodes):** `$1,800 to $3,200/month` (`$21,600 to $38,400/year`) across multi-AZ cloud instances.
- **Isolated Worker Sandboxes (gVisor/Firecracker worker pool + egress):** `$2,500 to $5,000/month` (`$30,000 to $60,000/year`).
- **24/7 On-Call SRE & Security Patching (to meet the 8-hour rollback SLA and maintain custom cron/webhook/OAuth replacements for the 7 missing features):** `0.5 FTE` senior platform engineer = `$95,000 to $120,000/year`.
- **Total Hidden Infrastructure & Ops Floor:** **`$146,600 to $218,400 per year`** before paying for a single million tokens of Claude inference on Bedrock, Vertex, or the Claude API.

### Executive Procurement Recommendation

Only request access to self-hosted Claude Managed Agents if your team **already standardizes on Anthropic's Managed Agents API** and requires strict **Zero Data Retention on multi-hour stateful coding or ops sessions** worth over `$150,000/year` in DevOps overhead. If your organization needs HIPAA eligibility, multi-model routing (mixing Claude, Gemini, and open-weight models), or lower operational lock-in, build on stateless ZDR `Messages API` / `Bedrock` endpoints paired with your own PostgreSQL state store and Kubernetes governance via `GKE Agent Sandbox`.

## Sources

- [Claude Managed Agents overview: Claude Platform Docs](https://platform.claude.com/docs/en/managed-agents/overview): Official Anthropic documentation confirming `managed-agents-2026-04-01` beta header, HIPAA ineligibility across all Managed Agents sub-features, and that Hosted Managed Agents is not eligible for Zero Data Retention except when self-hosted.
- [Self-Hosted Claude Managed Agents: Beta, Limits, License: CellCog](https://cellcog.ai/blog/claude-managed-agents-self-hosted/): Detailed audit of the November 12, 2026 announcement, `cma-server` and PostgreSQL 16+ requirements, the 7 missing hosted features, 3 non-disableable Claude API attribution headers, and the November 12 Software License Agreement deadlines (8-hour rollback, 1-day safety patch, $100k liability cap).
- [Self-Hosted Claude Managed Agents: Isolation and Access Review: General Analysis](https://generalanalysis.com/guides/claude-managed-agents-self-hosted-isolation): Analysis of tenant and trust-level boundaries requiring separate deployments, databases, and workers per trust tier.
- [Anthropic Opens Self-Hosted Claude Managed Agents in Private Beta: AI Weekly](https://aiweekly.co/alerts/anthropic-opens-self-hosted-claude-managed-agents-in-private-beta): Confirmation of the November 12, 2026 private beta rollout and multi-cloud inference routing options.
- [Gemini Enterprise Agent Platform release notes: Google Cloud Documentation](https://docs.cloud.google.com/gemini-enterprise-agent-platform/release-notes): Official November 12, 2026 release notes for Agent Gateway for GKE Preview (`1.37.2-gke.1042000+` in `us-central1` and `europe-west1`).
- [Google Opens Agent Gateway Preview for EKS, AKS, OpenShift: AI Weekly](https://aiweekly.co/alerts/google-opens-agent-gateway-preview-for-eks-aks-openshift): Confirmation of Google Cloud's November 11, 2026 cross-cloud Agent Gateway Limited Preview.
- [Kubernetes News & Updates: Gravitee](https://www.gravitee.io/blog/kubernetes-news-updates): Overview of generally available gVisor-isolated GKE Agent Sandbox.

<!--
Artwork brief — from the writer routine. Draw per docs/ARTWORK.md,
then delete this comment.

- Argument in one sentence: Self-hosting the agent control plane pulls session storage inside the corporate firewall for Zero Data Retention, but leaves model inference prompts and mandatory telemetry headers crossing the perimeter on every turn.
- Geometry: A thick rectangular `ink` VPC firewall enclosing three internal blocks (`cma-server`, `PostgreSQL 16`, and a worker sandbox grid); while the session loop stays locked inside the box, an `ochre` outbound inference vector pierces the right-hand perimeter wall to reach an external cloud node, carrying three small `ochre` telemetry ticks along its shaft.
- Accent: ochre
- Deliberate imperfection: A breached gap in the right-hand VPC perimeter wall where the `ochre` inference conduit and its three mandatory ID ticks exit the self-hosted boundary, showing that self-hosting the harness does not keep prompt payloads on-premises.
-->
