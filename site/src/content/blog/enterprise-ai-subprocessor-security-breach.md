---
title: 'Fireworks AI Breach Exposes the Enterprise AI Subprocessor Blind Spot'
description: 'A breach at Notion subprocessor Fireworks AI exposed customer chat transcripts and API keys. Learn why Zero Data Retention fails across fourth-party AI clouds.'
pubDate: 2026-11-12
publishedAt: '2026-11-12T23:21:45.942Z'
track: business
question: 'How does a breach at a SaaS AI inference vendor expose our private corporate chats?'
keywords:
  - Fireworks AI Data Breach
  - Enterprise AI Subprocessor Risk
  - Notion AI Security Incident
  - Zero Data Retention Contracts
heroImage: '../../assets/art/enterprise-ai-subprocessor-security-breach-light.webp'
heroImageDark: '../../assets/art/enterprise-ai-subprocessor-security-breach-dark.webp'
heroAlt: 'Geometric diagram of three nested security perimeters where a solid ink line connects the inner enterprise and SaaS boxes, while an ochre side-channel path leaks out through a fractured corner of the outer subprocessor box.'
readingTime: '8 min read'
notionId: '416ced67-050a-815c-a97e-e78a9700d27a'
---
<div class="tldr">

## Executive TL;DR

- **Fourth-party AI breach hit Notion workspaces:** On November 10, 2026, [Notion disclosed in a security advisory](https://www.notion.com/security/advisories/security-incident-involving-a-third-party-ai-vendor) that a breach at its third-party inference and classification vendor **Fireworks AI** exposed Notion AI chat transcripts for fewer than 1% of Notion workspaces.
- **Exposed transcripts contained live API keys:** On November 11, 2026, Notion confirmed it **revoked exposed Notion API keys** discovered directly inside affected user chat messages during its forensic review ([Notion Security Advisory](https://www.notion.com/security/advisories/security-incident-involving-a-third-party-ai-vendor); [BleepingComputer](https://www.bleepingcomputer.com/news/security/notion-says-fireworks-breach-exposed-customer-ai-chat-transcripts/)).
- **Analytics and evaluation jobs bypassed Zero Data Retention:** While Fireworks AI stated its core inference API and Training SDK remained unaffected under Zero Data Retention (ZDR), attackers accessed **environment variables in evaluation jobs** on October 6 and a fifth-party R&D cloud host on October 23 to 24, reaching Notion's **Insights** classification dataset ([Ennote Security Timeline](https://ennote.io/blog/fireworks-notion-ai-incident-rotate-secrets/); [VentureBeat](https://venturebeat.com/security/attackers-breached-the-fireworks-ai-storage-where-notion-ai-chats-sat-outside-zero-data-retention)).
- **Unlabeled prompts still leak corporate crown jewels:** Even when stored transcripts lack workspace IDs or user labels, raw prompt bodies routinely contain pasted `.env` secrets, database connection strings, M&A terms, and proprietary source code ([Ennote Security](https://ennote.io/blog/fireworks-notion-ai-incident-rotate-secrets/)).
- **Procurement must govern the full inference chain:** CISOs and legal teams must audit fourth- and fifth-party AI subprocessors, ban persistent storage for analytics/classification jobs, and enforce client-side secret redaction before prompts leave the browser.

</div>

## The Subprocessor Trap: How Notion Customer Transcripts Leaked at Fireworks AI

When an enterprise signs a SaaS agreement with a workspace provider like Notion, the security review typically centers on the primary vendor's SOC 2 report and its headline partnerships with frontier model providers like OpenAI and Anthropic ([Notion Trust Center Subprocessors](https://trust.notion.com/subprocessors)). What rarely gets scrutinized is the secondary infrastructure layer: the specialized GPU inference clouds hired behind the scenes to run open-weight models and usage-classification jobs.

Between October 6 and November 11, 2026, that fourth-party blind spot turned into a live credential incident. According to [Notion's official security advisory](https://www.notion.com/security/advisories/security-incident-involving-a-third-party-ai-vendor) and [Fireworks AI's incident bulletins](https://ennote.io/blog/fireworks-notion-ai-incident-rotate-secrets/), Notion used Fireworks AI for two distinct product functions: serving open-weight models inside Notion AI and running asynchronous classification jobs for a feature called **Insights**, which helps enterprise customers analyze their internal AI adoption.

The breach unfolded across a multi-stage supply chain:

| Date (2026) | Supply-Chain Layer | Documented Event & Operational Impact |
| --- | --- | --- |
| **Oct 6 (9:00 AM PDT)** | Fireworks AI Eval Jobs | Attackers used internal Fireworks credentials to access environment variables in customer evaluation jobs, capturing stored API keys and tokens ([Ennote Security](https://ennote.io/blog/fireworks-notion-ai-incident-rotate-secrets/)). |
| **Oct 23–24** | 5th-Party R&D Cloud Host | A breach at a third-party cloud provider hosting Fireworks R&D machines allowed attackers to run an unauthorized workload on Fireworks development servers ([Ennote Security](https://ennote.io/blog/fireworks-notion-ai-incident-rotate-secrets/)). |
| **Nov 2–3** | Notion & Fireworks Link | Fireworks alerted Notion to accessed synthetic test data. By the morning of Nov 3, Notion disconnected all systems from Fireworks and deleted stored data ([Notion Advisory](https://www.notion.com/security/advisories/security-incident-involving-a-third-party-ai-vendor)). |
| **Nov 6–8** | Notion Insights Dataset | Fireworks notified Notion of broader exposure and confirmed on Nov 8 that the breached dataset included **Notion AI chat transcripts** from the Insights feature ([Notion Advisory](https://www.notion.com/security/advisories/security-incident-involving-a-third-party-ai-vendor)). |
| **Nov 9–11** | Notice & Key Revocation | Notion notified affected workspaces (<1% of total) on Nov 9 and **revoked exposed Notion API keys** found inside user chat messages on Nov 11 ([Notion Advisory](https://www.notion.com/security/advisories/security-incident-involving-a-third-party-ai-vendor)). |

Look at the chain of custody in that table. A corporate buyer trusted Notion (3rd party), which routed chat transcripts for analytics classification to Fireworks AI (4th party), whose R&D environment was compromised via a security incident at an underlying cloud host (5th party), by a financially motivated group linked to **LLMjacking** (reselling stolen inference keys and compute quotas, per [ExplainX](https://explainx.ai/blog/notion-ai-fireworks-chat-transcripts-exposed-november-2026) and [The Hacker News](https://thehackernews.com/2026/11/fireworks-ai-breach-widens-to-expose.html)).

## The Myth of Anonymized Prompts: Why Raw Text Transcripts Carry Extreme Risk

In its initial customer notice, Notion emphasized that for the vast majority of affected workspaces, the leaked transcripts were *"unattributable"*, meaning the records stored at Fireworks lacked user names, workspace IDs, or tool-call outputs ([Notion Security Advisory](https://www.notion.com/security/advisories/security-incident-involving-a-third-party-ai-vendor)).

From a narrow privacy-regulation standpoint, stripping tenant metadata reduces the chance that an outsider can automatically sort leaked rows by company name. From an enterprise security and intellectual-property standpoint, **an unlabeled prompt is rarely anonymous**. How employees actually use workspace AI assistants explains why Notion had to revoke live Notion API keys found inside the transcripts less than 48 hours later ([Notion Advisory, Nov 11 update](https://www.notion.com/security/advisories/security-incident-involving-a-third-party-ai-vendor)):

1. **Self-Identifying Credentials and Endpoints:** When an engineer asks a workspace assistant to debug a failing webhook or curl command, they paste the full configuration block, including `ntn_...` or `secret_...` API tokens, internal AWS S3 bucket names, and corporate domain URLs. A bearer token does not need a workspace label next to it; querying the API with the key immediately reveals the organization and grants read/write access.
1. **Board Decks and M&A Terms in Summarization Prompts:** Strategy teams use Notion AI to summarize draft acquisition memos, pricing restructures, and hiring plans. Those prompts contain the company's legal name, counterparty names, and exact dollar figures inside the raw text body.
1. **Impossibility of Targeted Notification on Unattributed Rows:** "Unattributable" storage creates a severe remediation headache for CISOs. As [Ennote Security noted](https://ennote.io/blog/fireworks-notion-ai-incident-rotate-secrets/), if a subprocessor cannot tell which tenant owns an unattributed transcript row, the primary vendor cannot tell you whether your engineer's AWS key sat in that unattributed pool. Every potentially affected organization must rotate credentials blindly.

## Deconstructing the Fine Print: Where Zero-Data-Retention Promises Legally End

The most important lesson for corporate legal counsel and IT buyers lies in why those transcripts were sitting on disk at Fireworks AI in the first place.

Fireworks AI stated in its incident bulletin that its core **Inference API, Training SDK, and Nexus** products operate under **Zero Data Retention (ZDR)** by default and showed no impact ([Ennote Security](https://ennote.io/blog/fireworks-notion-ai-incident-rotate-secrets/); [VentureBeat](https://venturebeat.com/security/attackers-breached-the-fireworks-ai-storage-where-notion-ai-chats-sat-outside-zero-data-retention)). Why did Notion AI chat transcripts end up in Fireworks storage if the inference API is ZDR by default?

Because **ZDR applies only to stateless, real-time token generation**. The moment a SaaS vendor uses an inference subprocessor for **asynchronous batch classification, usage analytics ("Insights"), evaluation jobs, or fine-tuning**, the data leaves the stateless ZDR path and lands in persistent object storage or R&D evaluation buckets ([VentureBeat](https://venturebeat.com/security/attackers-breached-the-fireworks-ai-storage-where-notion-ai-chats-sat-outside-zero-data-retention); [ExplainX](https://explainx.ai/blog/notion-ai-fireworks-chat-transcripts-exposed-november-2026)).

| AI Routing Architecture | Where Prompts Are Processed | Where Zero Data Retention (ZDR) Breaks | Typical Enterprise Blind Spot |
| --- | --- | --- | --- |
| **1. Direct Enterprise API (OpenAI / Anthropic / Bedrock)** | Primary vendor VPC with direct BAA / Enterprise DPA | Abuse-monitoring logs (unless exempted via ZDR addendum) | Assuming standard API keys have ZDR enabled without signing the ZDR form |
| **2. SaaS App + Frontier Subprocessor** | SaaS backend proxies prompt to OpenAI or Anthropic | SaaS vendor's own telemetry, prompt-caching buckets, or eval logs | Checking the model vendor's ZDR while ignoring the SaaS app's analytics storage |
| **3. SaaS App + 4th-Party Open-Weight Host (Fireworks / Together)** | SaaS routes classification, evals, or open models to specialist GPU cloud | Batch classification jobs, eval environment variables, and 5th-party R&D hosts ([Notion Advisory](https://www.notion.com/security/advisories/security-incident-involving-a-third-party-ai-vendor)) | Subprocessor list names "open-weight providers" without banning persistent analytics jobs |

## The Contrarian Reality: Why Banning Open-Weight Subprocessors Is the Wrong Takeaway

Some security teams will react to the Fireworks-Notion incident by demanding that SaaS vendors route 100% of traffic exclusively to a single hyperscaler. That reaction misses both the economics and the engineering reality of modern SaaS products.

Notion did not route classification jobs and open-weight models to Fireworks AI by accident; specialized inference engines run small 8B to 70B classification models at a fraction of the cost and latency of frontier models. In addition, Notion's containment response worked rapidly once alerted: Notion severed connectivity and deleted Fireworks-side data on **November 3**, within hours of the initial November 2 synthetic-data notice and five days before Fireworks confirmed customer transcript exposure on November 8 ([Notion Security Advisory](https://www.notion.com/security/advisories/security-incident-involving-a-third-party-ai-vendor)).

The flaw was allowing **raw, unredacted customer chat transcripts containing live API keys** to be shipped to an external subprocessor for secondary analytics classification (`Insights`) where persistent dataset storage was used instead of ephemeral, in-memory processing.

## The Procurement Playbook: Auditing AI Infrastructure Supply Chains and Enforcing Egress Guards

CISOs, procurement directors, and legal teams should immediately execute a four-step response and update their AI Data Processing Addendum (DPA) standards:

1. **Check Workspace Admin Notices and Export Impacted Data:** Verify whether your workspace received Notion's November 9 notification email (<1% of workspaces affected), and use Notion's in-workspace retrieval tool to inspect any flagged transcripts ([Notion Advisory](https://www.notion.com/security/advisories/security-incident-involving-a-third-party-ai-vendor)).
1. **Rotate Every Credential Ever Pasted into Notion AI or Fireworks Evals:** As [Ennote Security details](https://ennote.io/blog/fireworks-notion-ai-incident-rotate-secrets/), deleting a stored secret or transcript never invalidates the underlying token. Refresh Notion internal integration tokens (`Settings, Connections, Develop or manage connections, Refresh`) and rotate any AWS, GitHub, Stripe, or database keys pasted into chats during October and early November 2026.
1. **Mandate Zero-Persistence Flow-Down Across All Subprocessor Tasks:** Require the primary SaaS vendor to warrant in your DPA that **all** downstream AI subprocessors operate exclusively in stateless, in-memory Zero Data Retention mode, explicitly covering **classification, routing, analytics, and evaluation jobs**, alongside pre-transfer regex secret scrubbing inside the primary vendor's VPC.
1. **Deploy Client-Side Secret Redaction Before Prompts Leave the Browser:** Enforce DLP browser extensions or egress proxies that strip high-entropy strings and known key prefixes (`sk-`, `ntn_`, `ghp_`, `AKIA`) before the payload reaches the SaaS server.

## Sources

- [Fireworks AI incident: Notion Security Advisory](https://www.notion.com/security/advisories/security-incident-involving-a-third-party-ai-vendor): Official timeline (Nov 2 to Nov 11, 2026), confirmation of <1% workspaces impacted, Insights classification and open-weight model usage, and Nov 11 revocation of exposed Notion API keys.
- [Fireworks AI & Notion Incident: What to Rotate: Ennote Security](https://ennote.io/blog/fireworks-notion-ai-incident-rotate-secrets/): Combined chronological timeline of the Oct 6 Fireworks evaluation-job secret breach, Oct 23–24 fifth-party R&D cloud host compromise, ZDR scope on core Inference vs evaluation storage, and credential rotation playbook.
- [Attackers breached the Fireworks AI storage where Notion AI chats sat outside zero-data-retention: VentureBeat](https://venturebeat.com/security/attackers-breached-the-fireworks-ai-storage-where-notion-ai-chats-sat-outside-zero-data-retention): Analysis of how Insights transcripts and evaluation job secrets sat in storage outside stateless ZDR inference paths.
- [Notion AI Chats Leaked via Fireworks: What to Do: ExplainX](https://explainx.ai/blog/notion-ai-fireworks-chat-transcripts-exposed-november-2026): Breakdown of TechCrunch and Bloomberg Law confirmations, LLMjacking attacker motivation, and enterprise procurement questions.
- [Fireworks AI Confirms Wider Breach Affecting Customer Datasets, Model Weights and Notion AI Chats: The Hacker News](https://thehackernews.com/2026/11/fireworks-ai-breach-widens-to-expose.html): Details on the wider Fireworks AI breach impacting datasets, model weights, and downstream Notion AI transcripts.
- [Notion says Fireworks breach exposed customer AI chat transcripts: BleepingComputer](https://www.bleepingcomputer.com/news/security/notion-says-fireworks-breach-exposed-customer-ai-chat-transcripts/): Independent verification of the Notion customer notification and API key revocation.
- [Subprocessors: Notion Trust Center](https://trust.notion.com/subprocessors): Official Notion subprocessor governance page.

<!--
Artwork brief — from the writer routine. Draw per docs/ARTWORK.md,
then delete this comment.

- Argument in one sentence: Enterprise Zero Data Retention contracts guard the front door between buyer and SaaS vendor while leaving a side channel open where fourth-party analytics and evaluation jobs leak raw transcripts.
- Geometry: Three rectangular security perimeters representing the Enterprise Buyer, the Primary SaaS Vendor, and the Fourth-Party Inference Subprocessor; a solid `ink` data line connects the first two perimeters cleanly, while an `ochre` side-channel arc bypasses the inner ZDR shield and spills outward through a fractured corner of the outer fourth-party box.
- Accent: ochre
- Deliberate imperfection: A broken bottom-right corner on the outer subprocessor perimeter where an `ochre` dashed trajectory escapes into open space, representing unredacted chat transcripts and API keys leaking from an analytics evaluation bucket.
-->
