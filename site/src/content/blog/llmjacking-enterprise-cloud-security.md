---
title: 'LLMjacking Attacks Drain One Million Dollars from Enterprise Cloud AI'
description: 'Threat group UNC6993 drains $100K/day and up to $1M per victim in stolen AI API key fraud. Learn how llmjacking enterprise cloud security controls stop it.'
pubDate: 2026-11-10
track: business
question: 'How are cybercriminals draining enterprise cloud budgets via stolen AI API keys?'
keywords:
  - LLMjacking
  - Enterprise AI Cloud Security
  - Stolen API Key Fraud
  - AI Budget Governance
heroImage: '../../assets/art/llmjacking-enterprise-cloud-security-light.webp'
heroImageDark: '../../assets/art/llmjacking-enterprise-cloud-security-dark.webp'
heroAlt: 'Minimalist architectural diagram showing a compromised enterprise cloud vault leaking high-velocity AI token streams through a reverse proxy manifold into a $1M burn spike, marked by a red hanko seal at the breach point.'
readingTime: '6 min read'
notionId: '414ced67-050a-8167-aca9-c3d953235ee7'
---
<div class="tldr">

## Executive TL;DR

- **Six-figure daily burn rates:** Threat intelligence published in the [Mandiant LLMjacking report 2026](https://cloud.google.com/blog/topics/threat-intelligence/llmjacking-monetizing-compromised-cloud-models) and [The Hacker News](https://thehackernews.com/2026/11/google-warns-llmjacking-attacks-are.html) confirms stolen cloud identity tokens generate over $100,000/day in unauthorized foundation model consumption, reaching $1,000,000 per victim before revocation.
- **Industrialized credential harvesting:** Tracked cluster [UNC6993](https://aviatrix.ai/threat-research-center/llmjacking-attacks-enterprise-cloud-charges-unc6993-2026/) breaches environments via misconfigured GCP and AWS Service Account keys, leaked GitHub PATs, session-hijacking portals capturing raw JSON tokens to bypass MFA, and middleware flaws like [LiteLLM CVE-2026-40217](https://securityonline.info/llmjacking-cloud-attacks-mandiant/).
- **The LLM Mixer underground economy:** Attackers pool hijacked quotas behind reverse proxies including [`oai-reverse-proxy`](https://www.sysdig.com/blog/llmjacking-stolen-cloud-credentials-used-in-new-ai-attack), [`one-api`](https://permiso.io/blog/exploiting-hosted-models), and [`new-api`](https://securityonline.info/llmjacking-cloud-attacks-mandiant/) to supply storefronts like [Jet Night](https://thehackernews.com/2026/11/google-warns-llmjacking-attacks-are.html), selling unlimited frontier model access for $60/month while victims pay the cloud invoice.
- **Why billing alarms fail at runtime:** Native [AWS Budgets](https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html) and [CloudWatch `EstimatedCharges` alarms](https://oneuptime.com/blog/post/2026-02-12-cloudwatch-alarms-billing-thresholds/view) lag by 6 to 24 hours, and [DoiT incident analyses](https://www.doit.com/blog/llmjacking-when-attackers-run-claude-on-your-aws-bill) document 24-to-72-hour downstream delays and AWS Marketplace SKU blind spots that hide third-party model charges.
- **Mandatory runtime circuit breakers:** Effective `llmjacking enterprise cloud security` requires Organization Service Control Policies (SCPs) blocking `aws-marketplace:Subscribe` and `bedrock:DeleteModelInvocationLoggingConfiguration`, 5-minute CloudWatch token-velocity alarms, and TPM caps on [Azure API Management](https://learn.microsoft.com/en-us/azure/api-management/llm-token-limit-policy).

</div>

## The rise of LLMjacking: how stolen AI keys cause million-dollar disasters

When the [Sysdig Threat Research Team](https://www.sysdig.com/blog/llmjacking-stolen-cloud-credentials-used-in-new-ai-attack) coined "LLMjacking" in May 2024 after catching attackers exploiting Laravel (`CVE-2021-3129`) to steal AWS keys, maxing out Anthropic Claude 2 quotas across four regions exposed victims to $46,080/day in inference charges.

In November 2026, [GTIG and Mandiant](https://cloud.google.com/blog/topics/threat-intelligence/llmjacking-monetizing-compromised-cloud-models) disclosed a global wave of `stolen ai api key fraud` across financial, retail, and tech firms. Per the [Mandiant LLMjacking report 2026](https://thehackernews.com/2026/11/google-warns-llmjacking-attacks-are.html), victims incurred over $100,000/day and up to $1,000,000 total before revocation, with [SecurityOnline](https://securityonline.info/llmjacking-cloud-attacks-mandiant/) documenting bursts of 1,100 requests/second (>500,000 calls in eight hours).

Incident telemetry from [DoiT International](https://www.doit.com/blog/llmjacking-when-attackers-run-claude-on-your-aws-bill) across $1.4M in investigated 2026 AWS Bedrock compromises confirms the speed of `cloud ai billing hijacking`: median losses hit $72,000, daily spikes reached $80,000-$113,000, one European retailer lost $522,000 in under 48 hours, and a $120/day developer sandbox billed $85,000 in 14 hours.

Frontier model pricing explains why attackers target `llmjacking enterprise cloud security` gaps. Per [2026 Amazon Bedrock pricing benchmarks](https://go-cloud.io/amazon-bedrock-pricing/), output tokens cost 3x-5x more than input tokens, and multi-region quotas permit six-figure daily burn rates:

| Cloud Platform & Model | In / Out ($/1K Tok) | Blended ($/1K) | Multi-Region Quota | Max Hourly | Max 24-Hour | Source |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Bedrock: Claude 3 Opus** | $0.015 / $0.075 | $0.04500 | 400K TPM x 4 (1.6M) | $4,320 | $103,680 | [GoCloud](https://go-cloud.io/amazon-bedrock-pricing/) / [Sysdig](https://www.sysdig.com/blog/growing-dangers-of-llmjacking) |
| **Bedrock: Claude Opus 5.5** | $0.004 / $0.020 | $0.01200 | 1.0M TPM x 6 (6.0M) | $4,320 | $103,680 | [CloudZero](https://www.cloudzero.com/blog/claude-on-aws-bedrock/) |
| **Bedrock: Claude 3.5/3.7 Sonnet** | $0.003 / $0.015 | $0.00900 | 1.0M TPM x 6 (6.0M) | $3,240 | $77,760 | [GoCloud](https://go-cloud.io/amazon-bedrock-pricing/) |
| **Azure OpenAI: GPT-4o** | $0.0025 / $0.010 | $0.00625 | 2.0M TPM x 4 (8.0M) | $3,000 | $72,000 | [Azure Quotas](https://learn.microsoft.com/en-us/azure/foundry/openai/quotas-limits) |
| **Vertex AI: Gemini 1.5 Pro** | $0.00125 / $0.005 | $0.003125 | 4.0M TPM x 4 (16M) | $3,000 | $72,000 | [GoCloud](https://go-cloud.io/amazon-bedrock-pricing/) |
| **Bedrock: Claude 2.x** | $0.008 / $0.024 | $0.01600 | 500K TPM x 4 (2.0M) | $1,920 | $46,080 | [Sysdig Report](https://www.sysdig.com/blog/llmjacking-stolen-cloud-credentials-used-in-new-ai-attack) |

## The underground marketplace: monetizing enterprise compute via illicit proxies

Understanding `how attackers steal and resell enterprise llm access` requires examining the supply chain documented by [GTIG and Mandiant](https://thehackernews.com/2026/11/google-warns-llmjacking-attacks-are.html) between intrusion groups like `unc6993 cloud attack` operators and downstream "LLM Mixers."

Initial access targets long-lived AWS `AKIA` keys, GCP Service Account JSONs, and GitHub PATs. Per [Aviatrix Threat Research](https://aviatrix.ai/threat-research-center/llmjacking-attacks-enterprise-cloud-charges-unc6993-2026/), UNC6993 breached cloud hosts via over-permissioned Service Account keys, planted backdoor billing accounts, and used phishing portals capturing raw JSON session tokens to bypass MFA. Other groups exploit AI gateways via LiteLLM user ID rebinding ([`CVE-2026-40217`](https://securityonline.info/llmjacking-cloud-attacks-mandiant/)) and the LiteLLM PyPI supply-chain attack ([`CVE-2026-33634`](https://labs.cloudsecurityalliance.org/research/csa-research-note-llmjacking-evolved-offensive-agentic-20260/)).

```
1. HARVESTING: Leaked AWS AKIA keys, GCP Service Accounts, GitHub PATs, LiteLLM CVE-2026-40217
       |
       v
2. STEALTH ENUMERATION:
   -> Call InvokeModel with max_tokens_to_sample: -1 (ValidationException proves access at $0)
   -> Call GetFoundationModelAvailability & PutFoundationModelEntitlement to activate models
   -> Call DeleteModelInvocationLoggingConfiguration to blind CloudWatch/S3 prompt logs
       |
       v
3. LLM MIXER POOLING: Load keys into oai-reverse-proxy, one-api, new-api, or gcli2api across regions
       |
       v
4. RESALE & BURN ($100K+/day -> $1M invoice):
   -> Storefronts (Jet Night at $60/mo; silver.inc) | Roleplay bots (Chub.ai / SillyTavern)
   -> Hijacked coding CLIs (vibe.aiok.me) & offensive agent swarms (1,100 req/sec)
```

Per [Sysdig](https://www.sysdig.com/blog/llmjacking-stolen-cloud-credentials-used-in-new-ai-attack), attackers test AWS Bedrock access by calling `InvokeModel` with `max_tokens_to_sample: -1` (returning `ValidationException` without billing tokens). [Permiso Security](https://permiso.io/blog/exploiting-hosted-models) observed scripts calling `GetFoundationModelAvailability` and `PutFoundationModelEntitlement` to activate models, while [Sysdig's follow-up report](https://www.sysdig.com/blog/growing-dangers-of-llmjacking) caught attackers calling `DeleteModelInvocationLoggingConfiguration` to wipe prompt logs before flooding `InvokeModelWithResponseStream`.

Validated keys feed LLM Mixers running [`oai-reverse-proxy`](https://permiso.io/blog/exploiting-hosted-models) or [`new-api`](https://securityonline.info/llmjacking-cloud-attacks-mandiant/) across three channels:

1. **Underground storefronts:** [Mandiant](https://thehackernews.com/2026/11/google-warns-llmjacking-attacks-are.html) exposed `Jet Night` (`jet-night[.]com`) selling unlimited frontier access for $60/month alongside `silver[.]inc`, tracked by the [Cloud Security Alliance (CSA)](https://labs.cloudsecurityalliance.org/research/csa-research-note-llmjacking-evolved-offensive-agentic-20260/).
1. **Roleplay and sanction-evasion proxies:** [Permiso Security](https://permiso.io/blog/exploiting-hosted-models) logged 75,000 Bedrock calls in 48 hours from Moldova powering `Chub.ai` bots, while [Sysdig](https://www.sysdig.com/blog/growing-dangers-of-llmjacking) tracked `SillyTavern` proxies and sanction-evasion traffic.
1. **Trojanized CLIs and offensive agents:** [Symantec and Carbon Black](https://thehackernews.com/2026/11/google-warns-llmjacking-attacks-are.html) found scripts from `vibe.aiok[.]me` rewriting `~/.codex/config.toml` and `~/.claude/settings.json` to route CLI queries through grey-market relays, while [CSA](https://labs.cloudsecurityalliance.org/research/csa-research-note-llmjacking-evolved-offensive-agentic-20260/) documented hijacked LLMs powering offensive recon agents.

## Why traditional IAM fails to catch runaway model abuse

Three structural blind spots explain why legacy CSPM and budget alerts fail at `preventing enterprise llm bill shock`:

First, billing pipelines run on batch accounting. Per [AWS Cost Management docs](https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html) and [OneUptime](https://oneuptime.com/blog/post/2026-02-12-cloudwatch-alarms-billing-thresholds/view), CloudWatch `EstimatedCharges` updates only every 6 to 24 hours, and [AWS Cost Anomaly Detection](https://www.doit.com/blog/llmjacking-when-attackers-run-claude-on-your-aws-bill) lags by 24 to 72 hours. At $4,320/hour on Claude Opus, a 24-hour billing delay lets an attacker burn $103,680 before an email fires.

Second, procurement friction vanished. Per [DoiT's 2026 Bedrock report](https://www.doit.com/blog/llmjacking-when-attackers-run-claude-on-your-aws-bill), AWS retired manual model-access approvals in October 2025, and third-party models like Anthropic Claude bill through AWS Marketplace SKUs. Thus, an AWS Budget filtered to `Amazon Bedrock` reads $0 while an attacker accepts eight Marketplace agreements in 12 seconds. Attackers also abuse `sts:GetFederationToken` to bypass MFA or run [Wiz's JINX-2401 pattern](https://www.wiz.io/blog/jinx-2401-llm-hijacking-aws), creating IAM users matching `^[A-Z][a-z]{5}[0-9]{3}$` with `bedrock:InvokeModel` policies.

Third, under the [AWS Shared Responsibility Model](https://aws.amazon.com/compliance/shared-responsibility-model/), credential hygiene belongs to the customer. When [Permiso Security](https://permiso.io/blog/exploiting-hosted-models) reported Bedrock hijacking, AWS stated Bedrock was "working as designed." [Victim reports](https://www.reddit.com/r/aws/comments/18of577/70000k_charges_after_security_breaches/) and [DoiT cases](https://www.doit.com/blog/llmjacking-when-attackers-run-claude-on-your-aws-bill) confirm providers rarely forgive stolen-key charges unless root MFA, GuardDuty, Security Hub, and cost controls were active before the breach.

## The executive action plan: hard rate limits, short-lived keys, and anomaly monitoring

Stopping `unc6993 cloud attack` campaigns requires synchronous IAM and gateway enforcement for `setting budget caps on aws bedrock azure openai` and `detecting unauthorized ai inference spikes`:

| Layer | AWS Bedrock Control | Azure OpenAI Control | GCP Vertex AI Control | Source |
| :--- | :--- | :--- | :--- | :--- |
| **1. Identity** | Delete `AKIA` keys; enforce OIDC / Pod Identity (<=12h). | Set `disableLocalAuth=true`; require Entra ID. | Enforce `iam.disableServiceAccountKeyCreation`. | [DoiT](https://www.doit.com/blog/llmjacking-when-attackers-run-claude-on-your-aws-bill) / [Mandiant](https://thehackernews.com/2026/11/google-warns-llmjacking-attacks-are.html) |
| **2. Quotas** | Lower Service Quotas; block unused regions via SCP. | Set [deployment TPM caps](https://learn.microsoft.com/en-us/azure/foundry/openai/how-to/quota) & [APIM `llm-token-limit`](https://learn.microsoft.com/en-us/azure/api-management/llm-token-limit-policy). | Cap regional TPM quotas in Vertex AI. | [Azure Docs](https://learn.microsoft.com/en-us/azure/foundry/openai/quotas-limits) |
| **3. Logging** | Enable [CloudTrail Data Events](https://docs.aws.amazon.com/bedrock/latest/userguide/logging-using-cloudtrail.html); deny log deletion via SCP. | Stream Diagnostic Logs to immutable Log Analytics. | Enable Org Cloud Audit Data Access logs. | [Sysdig](https://www.sysdig.com/blog/growing-dangers-of-llmjacking) |
| **4. Tripwires** | 5-min CloudWatch `OutputTokenCount` alarm -> IAM Deny. | Alert on `429` bursts & `ProcessedInferenceTokens`. | Alert on `aiplatform.googleapis.com` spikes. | [AWS Cost Docs](https://docs.aws.amazon.com/bedrock/latest/userguide/cost-management.html) |

Deploy this AWS Organization SCP and 5-minute CloudWatch circuit breaker in Terraform to block Marketplace subscriptions, log tampering, unapproved regions, and token spikes:

```
data "aws_iam_policy_document" "bedrock_scp" {
  statement {
    sid       = "DenyMarketplaceAndLogTampering"
    effect    = "Deny"
    actions   = [
      "aws-marketplace:Subscribe", "aws-marketplace:AcceptAgreementApprovalRequest",
      "bedrock:DeleteModelInvocationLoggingConfiguration", "bedrock:PutFoundationModelEntitlement",
      "bedrock:CreateFoundationModelAgreement", "sts:GetFederationToken"
    ]
    resources = ["*"]
    condition {
      test     = "ArnNotLike"
      variable = "aws:PrincipalArn"
      values   = ["arn:aws:iam::*:role/EnterpriseAIPlatformAdmin"]
    }
  }
  statement {
    sid       = "DenyUnapprovedRegions"
    effect    = "Deny"
    actions   = ["bedrock:*"]
    resources = ["*"]
    condition {
      test     = "StringNotEquals"
      variable = "aws:RequestedRegion"
      values   = ["us-east-1", "us-west-2"]
    }
  }
}

resource "aws_cloudwatch_metric_alarm" "bedrock_token_spike" {
  alarm_name          = "bedrock-5m-output-token-circuit-breaker"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "OutputTokenCount"
  namespace           = "AWS/Bedrock"
  period              = 300
  statistic           = "Sum"
  threshold           = 250000
  alarm_actions       = [aws_sns_topic.ai_circuit_breaker.arn]
}
```

Pair this alarm with an EventBridge rule catching `-1` `ValidationException` probes ([Sysdig](https://www.sysdig.com/blog/llmjacking-stolen-cloud-credentials-used-in-new-ai-attack)) and `GetFoundationModelAvailability` calls ([Permiso](https://permiso.io/blog/exploiting-hosted-models)) to auto-attach an IAM `Deny` policy within seconds.

## Sources

- [GTIG & Mandiant LLMjacking Report (Nov 2026)](https://cloud.google.com/blog/topics/threat-intelligence/llmjacking-monetizing-compromised-cloud-models), [The Hacker News (Nov 2026)](https://thehackernews.com/2026/11/google-warns-llmjacking-attacks-are.html), [SecurityOnline (Nov 2026)](https://securityonline.info/llmjacking-cloud-attacks-mandiant/), [Aviatrix UNC6993 Report](https://aviatrix.ai/threat-research-center/llmjacking-attacks-enterprise-cloud-charges-unc6993-2026/), [DoiT Bedrock Report](https://www.doit.com/blog/llmjacking-when-attackers-run-claude-on-your-aws-bill), [Sysdig LLMjacking (2024)](https://www.sysdig.com/blog/llmjacking-stolen-cloud-credentials-used-in-new-ai-attack), [Sysdig Growing Dangers](https://www.sysdig.com/blog/growing-dangers-of-llmjacking), [Permiso Security Report](https://permiso.io/blog/exploiting-hosted-models), [Wiz JINX-2401](https://www.wiz.io/blog/jinx-2401-llm-hijacking-aws), [CSA LLMjacking Evolved (2026)](https://labs.cloudsecurityalliance.org/research/csa-research-note-llmjacking-evolved-offensive-agentic-20260/), [GoCloud Bedrock Pricing](https://go-cloud.io/amazon-bedrock-pricing/), [CloudZero Claude Bedrock](https://www.cloudzero.com/blog/claude-on-aws-bedrock/), [OneUptime CloudWatch Billing](https://oneuptime.com/blog/post/2026-02-12-cloudwatch-alarms-billing-thresholds/view), [AWS Bedrock CloudTrail](https://docs.aws.amazon.com/bedrock/latest/userguide/logging-using-cloudtrail.html), [AWS Bedrock Cost Docs](https://docs.aws.amazon.com/bedrock/latest/userguide/cost-management.html), [AWS Budgets Docs](https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html), [AWS Shared Responsibility](https://aws.amazon.com/compliance/shared-responsibility-model/), [Azure OpenAI Quotas](https://learn.microsoft.com/en-us/azure/foundry/openai/quotas-limits), [Azure APIM Token Limit](https://learn.microsoft.com/en-us/azure/api-management/llm-token-limit-policy).

<!--
Artwork brief — from the writer routine. Draw per docs/ARTWORK.md,
then delete this comment.

- Argument in one sentence: A single compromised cloud identity token acts as a high-pressure siphon that drains enterprise AI budgets through an underground proxy funnel before lagging billing alarms register the breach.
- Geometry: Architectural cross-section contrasting a rigid enterprise vault on the left with a multi-stream reverse-proxy manifold on the right that channels token flow downward into a steep financial burn curve.
- Accent: hanko
- Deliberate imperfection: The top perimeter line of the enterprise vault fractures with an asymmetric gap where the siphoned token stream escapes, marked by a crimson hanko seal with an uneven inner ring.
-->
