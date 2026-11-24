---
title: 'Canary Tokens Caught 3 AI Inference Hosts Silently Stealing Prompts'
description: 'Dragos seeded 2 million canary prompts across AI routers, exposing 3 compromised hosts and causing OpenRouter to revoke ZDR on 125 endpoints.'
pubDate: 2026-11-24
publishedAt: '2026-11-24T23:06:44.090Z'
track: technical
question: 'How can engineering teams verify that third-party LLM router providers actually honor zero-data-retention promises?'
keywords:
  - LLM Inference Prompt Theft
  - Canary Token Testing AI
  - OpenRouter Provider Breach
  - Zero Data Retention Verification
heroImage: '../../assets/art/canary-tokens-llm-inference-prompt-theft-zdr-light.webp'
heroImageDark: '../../assets/art/canary-tokens-llm-inference-prompt-theft-zdr-dark.webp'
heroAlt: 'A central router splitting into four downstream host channels with three downward mizu tap lines siphoning data into collector circles.'
readingTime: '6 min read'
notionId: '422ced67-050a-81bd-a4c6-c83de25f2cab'
---
<div class="tldr">

## Executive TL;DR

- Between July and November 2026, Dragos Chief Research Officer HD Moore and his team seeded roughly two million AI prompts with unique URLs, DNS hostnames, and AWS canary credentials, catching three compromised inference hosting providers and multiple logging marketplace resellers ([Dragos](https://www.dragos.com/blog/ai-supply-chain-security-canary-tokens)).
- Following Dragos's disclosure, OpenRouter confirmed no breach of its own systems yet removed three providers (Together AI, Phala, and Novita) for data-handling and security incidents, while Atlas Cloud voluntarily paused its endpoints and OpenRouter revoked Zero Data Retention (ZDR) eligibility across 125 endpoints ([SC Media](https://www.scworld.com/brief/openrouter-removes-three-ai-providers-following-data-exposure-incidents)).
- Dragos observed prompts sent with ZDR flags to U.S.-based providers being scraped by a Chinese AI lab (affecting roughly two-thirds of ZDR-marked requests to that lab's models) and even appearing 24 days later in a Feishu chat channel opened in Beijing and Shanghai ([Dragos](https://www.dragos.com/blog/ai-supply-chain-security-canary-tokens)).
- Engineering teams cannot rely on contractual ZDR checkboxes alone: production LLM gateways should seed active Thinkst Canarytokens, scrub secrets before egress, and pin traffic to audited first-tier providers or self-hosted GPUs.

</div>

## Two million canaries: how researchers caught months of silent prompt theft

When an engineering team sends a prompt to an AI model router, the mental model is simple: text goes in, GPUs compute tokens, and text comes back out. Between July and November 2026, [Dragos](https://www.dragos.com/blog/ai-supply-chain-security-canary-tokens) tested that assumption at scale by planting roughly two million unique, trackable canary secrets inside prompts routed across widely used AI services.

Starting in July with free Thinkst Canarytokens and later expanding to a dedicated seeding service, Dragos embedded unique AWS keys (tied to logged empty accounts), DNS names, and secret URLs that existed nowhere else on the internet ([Dragos](https://www.dragos.com/blog/ai-supply-chain-security-canary-tokens)). Tokens began firing within days, and secrets seeded in July were still triggering unauthorized access attempts months later.

The investigation uncovered three distinct failure modes ([Dragos](https://www.dragos.com/blog/ai-supply-chain-security-canary-tokens); [SC Media](https://www.scworld.com/brief/openrouter-removes-three-ai-providers-following-data-exposure-incidents)):

1. **Active provider compromises:** Three hosting providers suffered unauthorized access dating back as early as mid-July. In the largest breach, a few hundred bait AWS keys were copied at the provider's front door even on requests rejected before inference ran, generating tens of thousands of AWS API calls enumerating S3 buckets, Secrets Manager, and Parameter Store, and even using the `ARTEX` AI pentesting framework (`artex-agent`, `artex-judge-r121`) on November 1 ([Dragos](https://www.dragos.com/blog/ai-supply-chain-security-canary-tokens)).
1. **Marketplace resellers logging prompts:** Multiple inference marketplace sellers simply listed popular models at rock-bottom prices, enabled standard request logging, and manually tested leaked SSH passwords and secret URLs from home broadband lines ([Dragos](https://www.dragos.com/blog/ai-supply-chain-security-canary-tokens)).
1. **Ignored ZDR and cross-border scraping:** A Chinese AI lab's systems scraped unique URLs from more than half of Dragos's prompts to its models (including roughly two-thirds marked ZDR), even when routed through U.S.-based resellers, and one ZDR-flagged URL surfaced 24 days later inside a Feishu chat opened from Beijing and Shanghai ([Dragos](https://www.dragos.com/blog/ai-supply-chain-security-canary-tokens)).

What makes the attacker tradecraft especially sobering is how fast leaked keys were operationalized. In the largest provider compromise, Dragos watched a single adversary probe keys from a rented server using a script posing as Chrome on Windows, then switch to Python `boto3` inside OrbStack, then move to the AWS CLI on Kali Linux, and finally test live keys with `ARTEX` ([Dragos](https://www.dragos.com/blog/ai-supply-chain-security-canary-tokens)). Meanwhile, another compromise stayed undisclosed from mid-July through late October because the provider initially mistook the alert for an internal tooling misconfiguration ([Dragos](https://www.dragos.com/blog/ai-supply-chain-security-canary-tokens)).

In response to the findings, OpenRouter removed Together AI (citing a repository credential exposure), Phala (server compromise), and Novita (routing misconfiguration), while Atlas Cloud voluntarily withdrew its models pending testing and OpenRouter revoked ZDR eligibility for 125 endpoints ([SC Media](https://www.scworld.com/brief/openrouter-removes-three-ai-providers-following-data-exposure-incidents)).

## The reseller blind spot: why router privacy toggles break downstream

Why did Zero Data Retention flags fail across so many endpoints? Because an API router's privacy toggle only binds the first hop unless the router enforces and audits every downstream compute host ([Dragos](https://www.dragos.com/blog/ai-supply-chain-security-canary-tokens)).

In open inference marketplaces, the lowest-price seller wins the request. Discount sellers frequently pool capacity using unmetered consumer subscriptions, startup credits, or undisclosed secondary routers ([Dragos](https://www.dragos.com/blog/ai-supply-chain-security-canary-tokens)). When Dragos built an inference traceroute by sending slightly malformed requests and matching nested error envelopes across roughly 2,000 routes, several hundred included unidentified middle hops, one marketplace seller silently injected roughly 1,000 hidden tokens into every prompt, and another router quietly forwarded traffic into a marketplace despite its own policies ([Dragos](https://www.dragos.com/blog/ai-supply-chain-security-canary-tokens)).

| Inference architecture | Visibility & retention control | Operational cost | Primary residual risk |
| --- | --- | --- | --- |
| **Self-Hosted GPUs** | Full control; prompts never leave your VPC | High capex (DGX Spark USD 6,950; 8-GPU B300 USD 570,000+) ([Dragos](https://www.dragos.com/blog/ai-supply-chain-security-canary-tokens)) | Hardware ops burden and lower peak elasticity |
| **Direct First-Tier Lab API** | One contract, one privacy policy, no reseller hops | Standard per-token enterprise pricing | Single-vendor breach or policy change ([Dragos](https://www.dragos.com/blog/ai-supply-chain-security-canary-tokens)) |
| **Verified ZDR Aggregator (Pinned)** | Router enforces ZDR allowlist on named hosts | Low multi-model switching overhead | Relies on router's continuous provider audits ([SC Media](https://www.scworld.com/brief/openrouter-removes-three-ai-providers-following-data-exposure-incidents)) |
| **Unpinned Reseller Marketplace** | Lowest-bid routing; opaque secondary hops | Lowest per-token list price | High risk of prompt logging, resale, and key theft ([Dragos](https://www.dragos.com/blog/ai-supply-chain-security-canary-tokens)) |

## Active verification: running canary-credential probes against your own LLM gateway

If your organization routes code reviews, customer support tickets, or internal documents through third-party LLM aggregators, do not assume a ZDR badge in the dashboard equals technical enforcement. You can replicate Dragos's core verification pattern inside your own staging pipeline in four steps ([Dragos](https://www.dragos.com/blog/ai-supply-chain-security-canary-tokens)):

1. **Generate isolated canary assets:** Create a unique Thinkst Canarytoken DNS hostname, HTTP webhook URL, or empty-account AWS IAM key dedicated solely to your LLM gateway probe.
1. **Inject synthetic secrets into canary prompts:** Periodically send benign coding or log-analysis test prompts carrying that unique token through each active provider and ZDR-enabled route in your gateway config.
1. **Tag every probe with route metadata:** Log the exact timestamp, router name, pinned upstream provider slug, and ZDR header sent on each probe.
1. **Treat any out-of-band callback as a P1 breach:** Any DNS lookup, HTTP GET, or AWS STS `GetCallerIdentity` call against a canary token proves an unauthorized party read and acted on your prompt.

Below is a minimal Python probe harness demonstrating how to tag and dispatch a canary-bearing test prompt across a pinned provider route while recording the exact route metadata locally:

```python
import os
import time
import requests

def send_canary_probe(provider_slug, canary_url, canary_aws_key):
    probe_id = f"probe-{int(time.time())}-{provider_slug}"
    prompt = (
        f"Debug this staging config (trace {probe_id}): "
        f"ENDPOINT={canary_url} AWS_ACCESS_KEY_ID={canary_aws_key}"
    )
    resp = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={"Authorization": f"Bearer {os.environ['ROUTER_API_KEY']}"},
        json={
            "model": "deepseek/deepseek-chat",
            "provider": {"order": [provider_slug], "allow_fallbacks": False, "zdr": True},
            "messages": [{"role": "user", "content": prompt}],
        },
        timeout=30,
    )
    return {"probe_id": probe_id, "provider": provider_slug, "status": resp.status_code}
```

## Pre-egress scrubbing and first-tier pinning for production workloads

Canary probes detect leaks after the fact; preventing secret exposure requires deterministic controls before a prompt ever leaves your VPC ([Dragos](https://www.dragos.com/blog/ai-supply-chain-security-canary-tokens)).

First, **scrub known credential patterns in your egress proxy.** Strip AWS keys (`AKIA...`), GitHub tokens (`ghp_...`), private PEM blocks, and Bearer headers before calling any external LLM endpoint. Remember Dragos's warning that regex scrubbing is not a complete cure, because source code, M&A plans, and customer PII carry high value even without API key formatting ([Dragos](https://www.dragos.com/blog/ai-supply-chain-security-canary-tokens)).

Second, **pin upstream providers and disable automatic fallbacks.** On multi-provider routers, explicitly set `allow_fallbacks: false` and pin traffic to audited first-tier providers rather than letting a default marketplace pool route your prompts to the cheapest bidder ([Dragos](https://www.dragos.com/blog/ai-supply-chain-security-canary-tokens)). For regulated workloads (HIPAA, PCI, or proprietary source code), route directly to a first-tier lab API under a signed Business Associate Agreement or Data Processing Addendum, or host open-weight models inside your own VPC.

Third, **audit historical usage windows and rotate exposed secrets.** If your teams routed unredacted code or `.env` files through any of the endpoints flagged in November 2026 (`Together AI`, `Phala`, `Novita`, or unpinned ZDR routes), treat every credential sent during that window as compromised and rotate those keys immediately ([SC Media](https://www.scworld.com/brief/openrouter-removes-three-ai-providers-following-data-exposure-incidents)).

Finally, **audit your prompt payloads for implicit sensitive context.** Coding agents routinely paste `.env` files, stack traces containing database connection strings, and internal repository URLs into prompts without asking. Pairing pre-egress scrubbing with strict file-ignore rules in your coding agent harness keeps secrets off external routers in the first place.

## Sources

- [AI Supply Chain Security: What Canary Tokens Found](https://www.dragos.com/blog/ai-supply-chain-security-canary-tokens) : Dragos Chief Research Officer HD Moore's November 19, 2026 primary report detailing 2 million canary prompts, Thinkst Canarytokens, 3 compromised providers, ARTEX user agents, marketplace reseller SSH/AWS attempts, Chinese scraper and Feishu chat leaks, 2,000 route traces, and self-hosting hardware costs.
- [OpenRouter removes three AI providers following data exposure incidents](https://www.scworld.com/brief/openrouter-removes-three-ai-providers-following-data-exposure-incidents) : SC Media November 24, 2026 report naming the three removed providers (Together AI, Phala, Novita), Atlas Cloud's voluntary pause, affected models (DeepSeek V4 Flash, MiniMax), and OpenRouter's revocation of ZDR eligibility across 125 endpoints.
- [OpenRouter zero data retention: what the Dragos canary test and three provider notices say](https://dev.to/axrisi/openrouter-zero-data-retention-what-the-dragos-canary-test-and-three-provider-notices-say-5abe) : Technical summary of ZDR routing verification and downstream provider accountability.

<!--
Artwork brief — from the writer routine. Draw per docs/ARTWORK.md,
then delete this comment.

- Argument in one sentence: Prompts tagged with ZDR privacy flags pass through an API router into multiple downstream hosts, where unmonitored branches leak embedded secrets.
- Geometry: A single input rail entering a central router node that splits into four parallel downstream host channels leading to an output rail.
- Accent: {{mizu}}
- Deliberate imperfection: Three of the four downstream host channels sprout downward {{mizu}} tap lines into off-rail collector nodes, showing silent prompt siphoning despite the top-level ZDR border.
-->
