---
title: 'Unredacted Agent Traces Turned a Bucket Leak into Cursor RCE'
description: 'Unredacted 2025 agent traces in a Fireworks bucket let attackers plant malware in Cursor''s Claude Code cache for 11 hours. Scrub secrets before logging traces.'
pubDate: 2026-11-14
publishedAt: '2026-11-14T23:21:39.428Z'
track: technical
question: 'How do coding-agent telemetry traces leak secrets and enable marketplace supply-chain attacks?'
keywords:
  - Coding Agent Telemetry Security
  - Unredacted Trace Leaks
  - Cursor Fireworks Breach
  - Agent Secret Scrubbing
heroImage: '../../assets/art/coding-agent-telemetry-secret-scrubbing-light.webp'
heroImageDark: '../../assets/art/coding-agent-telemetry-secret-scrubbing-dark.webp'
heroAlt: 'Minimalist geometric diagram showing an unredacted mizu path escaping a left trace-storage block, pivoting through a central node, and injecting an offset mizu rectangle into a right marketplace cache block while severing the upstream registry line.'
readingTime: '8 min read'
notionId: '418ced67-050a-81e1-b7d5-de58c4f0a46a'
---
<div class="tldr">

## Executive TL;DR

- **Read-only training bucket escalated to marketplace malware:** On November 13, 2026, [Cursor's two-week post-mortem](https://cursor.com/blog/security-incident-update) revealed that an access key exposed at **Fireworks AI** allowed attackers to copy a read-only storage bucket containing 2025 coding-agent traces from non-Privacy Mode sessions.
- **Unredacted credentials enabled lateral SaaS movement:** Although fewer than `0.05%` of users had traces in the bucket, unredacted credentials inside `< 0.01%` of customer traces let attackers pivot into Cursor's internal SaaS tools, archived non-production repos, and support logs ([Cursor Security Update](https://cursor.com/blog/security-incident-update); [ExplainX](https://explainx.ai/blog/cursor-fireworks-security-incident-agent-traces-november-2026)).
- **11-hour marketplace cache poisoning hit up to 5,000 users:** On October 29, 2026, attackers used a stolen internal credential to place backdoored copies of `anthropic.claude-code` (`2.1.312` and `2.1.313`) directly onto Cursor's VS Code extension marketplace cache for **11 hours**, exposing at most **5,000 developers** to an SSH-persistence payload while upstream Open VSX remained clean ([BleepingComputer](https://www.bleepingcomputer.com/news/security/cursor-confirms-security-breach-led-to-malicious-claude-code-extension/); [MLQ.ai](https://mlq.ai/news/cursor-says-hackers-used-a-key-exposed-at-fireworks-ai-to-plant-a-malicious-claude-code-extension-in-its-marketplace/)).
- **Regex alone drowns in false positives or misses tokens:** On the [DeepSource 518-secret benchmark](https://deepsource.com/benchmarks), `Detect-Secrets` hit `87.45%` recall but generated `696` false positives (`39.43%` precision), whereas `DeepSource` reached `98.69%` precision (`92.78%` F1) and `TruffleHog` cut false-positive triage by up to `90%` via live API verification ([AppSec Santa](https://appsecsanta.com/secret-scanning-tools/gitleaks-vs-trufflehog)).
- **Scrub before serialization and verify VSIX digests:** Agent builders must run deterministic Aho-Corasick + BPE token-efficiency scrubbing *in memory* before writing any trace to S3, and lock marketplace caches to cryptographic publisher signatures.

</div>

## From Read-Only Bucket to Marketplace RCE: Anatomy of the November 14 Cursor Disclosure

Security teams routinely treat "read-only" training buckets as low-impact data stores. If an external model-training vendor gets breached, the worst-case scenario on the risk register is usually leaked prompt text.

Cursor's [November 13, 2026 security incident update](https://cursor.com/blog/security-incident-update) (widely reported on November 14 by [BleepingComputer](https://www.bleepingcomputer.com/news/security/cursor-confirms-security-breach-led-to-malicious-claude-code-extension/) and [MLQ.ai](https://mlq.ai/news/cursor-says-hackers-used-a-key-exposed-at-fireworks-ai-to-plant-a-malicious-claude-code-extension-in-its-marketplace/)) proved why that assumption fails for autonomous coding agents. A read-only storage key shared with third-party inference and training vendor **Fireworks AI** became the initial foothold for a supply-chain attack that served trojanized `Claude Code` extensions to thousands of developer machines.

Trace the exact five-stage escalation chain documented in [Cursor's investigation](https://cursor.com/blog/security-incident-update):

1. **Stage 1 (Third-Party Key Exposure at Fireworks AI):** Cursor had issued an access key to Fireworks AI allowing access to a shared, read-only cloud storage bucket used for offline model-training analysis. During the October 2026 Fireworks AI compromise, attackers captured that access key ([Cursor Security Update](https://cursor.com/blog/security-incident-update)).
1. **Stage 2 (Mining 2025 Non-Privacy-Mode Agent Traces):** Using the key, attackers copied the bucket's contents: historical coding-agent session traces (mostly from 2025) recorded from users who had not enabled Privacy Mode (`< 0.05%` of total users). Crucially, a fraction of those traces (`< 0.01%` of customers) contained **unredacted credentials** ([Cursor Security Update](https://cursor.com/blog/security-incident-update); [ExplainX](https://explainx.ai/blog/cursor-fireworks-security-incident-agent-traces-november-2026)).
1. **Stage 3 (Lateral Pivot into Internal SaaS Plane):** Attackers extracted live credentials from those historical traces and used them to authenticate into select SaaS tools used by Cursor. From those SaaS tools, they accessed archived non-production Cursor repositories, customer support threads, usage metrics, and additional credentials users had emailed to Cursor support ([Cursor Security Update](https://cursor.com/blog/security-incident-update)).
1. **Stage 4 (Marketplace Cache Poisoning on October 29):** Using an internal credential harvested during the SaaS pivot, attackers bypassed the clean upstream Open VSX registry and injected tampered builds of Anthropic's `Claude Code` extension (`anthropic.claude-code` versions **`2.1.312` and `2.1.313`**) directly into the caching layer serving Cursor's VS Code extension marketplace ([MLQ.ai](https://mlq.ai/news/cursor-says-hackers-used-a-key-exposed-at-fireworks-ai-to-plant-a-malicious-claude-code-extension-in-its-marketplace/)).
1. **Stage 5 (11-Hour Exposure Window and SSH Backdoor):** For approximately **11 hours** on October 29, up to **5,000 users** who requested those specific cached versions received the malicious extension, which executed JavaScript to install an attacker-controlled SSH key and enable remote SSH access before Cursor took the marketplace offline and blocked the final attacker activity on November 1 ([BleepingComputer](https://www.bleepingcomputer.com/news/security/cursor-confirms-security-breach-led-to-malicious-claude-code-extension/); [Cursor Security Update](https://cursor.com/blog/security-incident-update)).

## Why Coding Agent Traces Are Toxic Asset Stores for Secrets

Why did a historical bucket of 2025 coding-agent traces contain working credentials that unlocked internal SaaS tools in October 2026? Because **coding-agent traces are structurally different from chatbot logs**.

When a user chats with a web assistant, the transcript contains prose. When an autonomous coding agent (`Cursor Composer`, `Claude Code`, `Cline`, or `Aider`) executes a task loop, the recorded trace captures the entire execution environment:

- **File Read Payloads:** The agent runs `read_file` across `.env.production`, `docker-compose.yml`, `~/.npmrc`, or Terraform state files to debug a build error, serializing raw tokens into the tool-observation array.
- **Terminal `stdout` and `stderr` Dumps:** The agent executes `env`, `aws configure list`, `git remote -v` (with embedded Personal Access Tokens), or failing `curl` commands with `Authorization: Bearer` headers, and the harness logs the full terminal buffer into the conversation history.
- **Long-Lived Non-Human Identities (NHIs):** Unlike interactive OAuth cookies that expire in an hour, API keys and service-account tokens pasted into support tickets or read from config files rarely expire. According to secrets-sprawl data cited by [AppSec Santa](https://appsecsanta.com/secret-scanning-tools/gitleaks-vs-trufflehog), **more than 64% of credentials confirmed valid in 2022 remained valid four years later**. A 2025 agent trace bucket is a live credential vault unless scrubbed before storage.

## Deterministic Pre-Ingestion Scrubbing: Filtering Secrets Before Logs Hit Storage

To prevent telemetry and evaluation buckets from becoming toxic credential archives, secret redaction must execute **synchronously in memory before any trace is serialized to disk or S3**, never as an asynchronous batch job after upload.

However, choosing the right scrubbing engine for high-throughput agent traces requires balancing CPU latency against false positives. Code traces are packed with high-entropy strings that are *not* secrets: Git commit SHAs, UUIDs, base64-encoded sourcemaps, and content hashes.

| Secret Detection Engine | Primary Detection Mechanism | Benchmark Precision / Recall ([DeepSource](https://deepsource.com/benchmarks) & [Rafter](https://rafter.so/blog/secrets/gitleaks-vs-trufflehog)) | Hot-Path Latency Profile | Best Role in Agent Telemetry Pipeline |
| --- | --- | --- | --- | --- |
| **`Gitleaks` (MIT)** | Compiled Go regex rules + allowlists | Fast pre-commit catch; higher false-positive noise on hashes ([AppSec Santa](https://appsecsanta.com/secret-scanning-tools/gitleaks-vs-trufflehog)) | **< 10 ms per trace** (no network calls) | Synchronous Stage-1 inline memory scrubber |
| **`Betterleaks`** | Regex + **BPE token-efficiency** signal | Outperforms raw Shannon entropy at separating UUIDs/hashes from real keys ([Rafter](https://rafter.so/blog/secrets/gitleaks-vs-trufflehog)) | **< 15 ms per trace** (local tokenizer check) | Stage-1 inline filter for code/UUID-heavy agent logs |
| **`DeepSource Secrets`** | Static analysis + context rules | **98.69% precision, 87.45% recall, 92.78% F1** (453/518 caught, 6 FPs) ([DeepSource](https://deepsource.com/benchmarks)) | Low latency (static analysis) | Repository and CI/CD pre-merge gate |
| **`Detect-Secrets`** | Shannon entropy + regex plugins | **39.43% precision, 87.45% recall** (696 false positives on 518 secrets) ([DeepSource](https://deepsource.com/benchmarks)) | Low latency, high alert fatigue | Legacy baseline (avoid uncalibrated entropy rules) |
| **`TruffleHog` (AGPL-3.0)** | Aho-Corasick keyword prefilter + **live API verification** across 800+ types ([NHIMG](https://nhimg.org/articles/aho-corasick-precomputation-cuts-trufflehog-secret-scanning-cpu-cost/)) | Cuts false-positive triage by **up to 90%** on noisy repos ([AppSec Santa](https://appsecsanta.com/secret-scanning-tools/gitleaks-vs-trufflehog)) | **100–800 ms** (requires external API round-trips) | Stage-2 async quarantine & automated revocation worker |

Notice the architectural split in that table:

1. **Stage 1 (Inline Pre-Serialization Scrubber):** Before a trace leaves the IDE or API gateway for an S3 training bucket, run a zero-network scrubber combining **Aho-Corasick prefix matching** ([NHIMG](https://nhimg.org/articles/aho-corasick-precomputation-cuts-trufflehog-secret-scanning-cpu-cost/)) with **BPE token-efficiency filtering** ([Rafter](https://rafter.so/blog/secrets/gitleaks-vs-trufflehog)). Why BPE token count? Standard English identifiers (`customer_account_balance`) compress into 3 BPE tokens, whereas a random 32-character API key fragments into 18 to 26 individual byte/character tokens.
1. **Stage 2 (Async TruffleHog Verification on Quarantine):** If a trace triggers a high-confidence prefix match (`sk-`, `ntn_`, `ghp_`, `AKIA`, `xoxb-`), replace the substring with `<REDACTED_CREDENTIAL>` in the training bucket *and* emit the hash/fingerprint to a security queue where `TruffleHog` verifies whether the key is live and triggers automated rotation.

Here is a self-contained Python pre-ingestion scrubber implementing prefix + entropy redaction across nested agent tool traces before S3 serialization:

```python
import math
import re
from collections import Counter

SECRET_PATTERNS = [
    re.compile(r"\b(sk-[a-zA-Z0-9_-]{20,}|gh[pousr]_[a-zA-Z0-9]{36,}|AKIA[0-9A-Z]{16}|ntn_[a-zA-Z0-9]{30,})\b"),
    re.compile(r"(?i)(api[_-]?key|secret|password|authorization|token)\s*[:=]\s*['\"]?([a-zA-Z0-9/+_.-]{16,})['\"]?"),
]
HEX_CHARS = set("0123456789abcdefABCDEF-")

def shannon_entropy(s: str):
    counts = Counter(s)
    n = len(s)
    return -sum((c / n) * math.log2(c / n) for c in counts.values())

def scrub_trace_text(raw: str):
    scrubbed = SECRET_PATTERNS[0].sub("<REDACTED_VENDOR_KEY>", raw)

    def _replace_kv(match: re.Match):
        key_name, val = match.group(1), match.group(2)
        if 32 <= len(val) <= 64 and all(ch in HEX_CHARS for ch in val):
            return match.group(0)
        if shannon_entropy(val) >= 3.8:
            return f"{key_name}=<REDACTED_SECRET>"
        return match.group(0)

    return SECRET_PATTERNS[1].sub(_replace_kv, scrubbed)
```

## Hardening IDE Extension Caches and Developer Endpoint Controls

The second half of the Cursor incident carries an equally sharp lesson for IDE platform architects and enterprise DevSecOps teams: **upstream registry cleanliness (`Open VSX`) does not protect users if the downstream marketplace CDN cache is mutable** ([Cursor Security Update](https://cursor.com/blog/security-incident-update); [ExplainX](https://explainx.ai/blog/cursor-fireworks-security-incident-agent-traces-november-2026)).

Because attackers used a stolen internal credential to write tampered `.vsix` archives (`anthropic.claude-code` `2.1.312` and `2.1.313`) directly into Cursor's marketplace cache, developers pulling from the cache received unsigned or re-packaged code that Anthropic never published.

Enforce four controls across your engineering fleet today:

1. **Audit Workstations for `2.1.312` and `2.1.313` Persistence:** Check `~/.cursor/extensions/` across all macOS and Windows developer machines for `anthropic.claude-code-2.1.312` or `2.1.313`, and inspect `~/.ssh/authorized_keys` and system launch agents/scheduled tasks for unauthorized entries added on October 29, 2026. As Cursor warned, **uninstalling the extension alone does not remove host-level SSH persistence** ([Cursor Security Update](https://cursor.com/blog/security-incident-update); [MLQ.ai](https://mlq.ai/news/cursor-says-hackers-used-a-key-exposed-at-fireworks-ai-to-plant-a-malicious-claude-code-extension-in-its-marketplace/)).
1. **Enforce Organization-Wide Privacy Mode by Default:** In Cursor confirmed facts, users with **Privacy Mode enabled** had zero prompts or traces stored in the offline Fireworks training bucket ([Cursor Security Update](https://cursor.com/blog/security-incident-update)). Lock Privacy Mode on at the enterprise admin level so developer sessions never enter third-party training buckets.
1. **Verify Upstream Cryptographic Signatures on Cache Read:** If you operate an internal extension mirror or IDE marketplace cache, treat the cache as untrusted storage: verify the publisher's cryptographic `.vsix` signature and SHA-256 digest against the upstream registry manifest before serving any binary to a client.
1. **Enforce Extension Update Cooldowns:** Configure IDE management policies to delay automatic minor/patch extension auto-updates by 24 to 48 hours (`extensions.autoUpdate: false` with pinned version allowlists), ensuring short-lived 11-hour cache poisonings are taken down before hitting developer laptops ([ExplainX](https://explainx.ai/blog/cursor-fireworks-security-incident-agent-traces-november-2026)).

## Sources

- [An update on our recent security incident: Cursor Official Blog](https://cursor.com/blog/security-incident-update): Official November 13, 2026 post-mortem detailing the exposed Fireworks key, read-only 2025 trace bucket (`< 0.05%` users, `< 0.01%` API credentials), SaaS pivot, October 29 `anthropic.claude-code` `2.1.312`/`2.1.313` cache poisoning (~11 hours, up to 5,000 users), and November 1 containment.
- [Cursor: Fireworks Key Led to Claude Code Malware: ExplainX](https://explainx.ai/blog/cursor-fireworks-security-incident-agent-traces-november-2026): Step-by-step architectural breakdown of the trace-to-marketplace attack chain and remediation playbook.
- [Cursor confirms security breach led to malicious Claude Code extension: BleepingComputer](https://www.bleepingcomputer.com/news/security/cursor-confirms-security-breach-led-to-malicious-claude-code-extension/): Details on the JavaScript payload attempting to install an attacker SSH key and persistence on macOS and Windows.
- [Cursor says hackers used a key exposed at Fireworks AI to plant a malicious Claude Code extension: MLQ.ai](https://mlq.ai/news/cursor-says-hackers-used-a-key-exposed-at-fireworks-ai-to-plant-a-malicious-claude-code-extension-in-its-marketplace/): Verification that Open VSX and Anthropic were unaffected and that tampering occurred directly on Cursor's marketplace cache.
- [Gitleaks vs TruffleHog 2026: Secret Scanner Benchmarks: AppSec Santa](https://appsecsanta.com/secret-scanning-tools/gitleaks-vs-trufflehog): Comparison of Gitleaks sub-second regex scanning, TruffleHog live verification cutting false-positive triage by 90%, and 64% 4-year credential validity statistics.
- [Benchmarks: DeepSource](https://deepsource.com/benchmarks): Empirical secret-scanning evaluation across 518 secrets comparing DeepSource (`98.69%` precision, `87.45%` recall, `92.78%` F1) and Detect-Secrets (`39.43%` precision, `696` false positives).
- [Gitleaks vs TruffleHog (2026): Rafter](https://rafter.so/blog/secrets/gitleaks-vs-trufflehog) and [Aho-corasick precomputation cuts TruffleHog CPU cost: NHIMG](https://nhimg.org/articles/aho-corasick-precomputation-cuts-trufflehog-secret-scanning-cpu-cost/): BPE token-efficiency filtering in Betterleaks and Aho-Corasick detector precomputation.

<!--
Artwork brief — from the writer routine. Draw per docs/ARTWORK.md,
then delete this comment.

- Argument in one sentence: A single unredacted credential left inside a historical agent-trace bucket creates a lateral bridge that bypasses upstream registry verification and poisons the downstream marketplace cache.
- Geometry: Four sequential architectural stages from left to right: a stacked cylinder/grid representing the 2025 trace bucket, an internal SaaS control node, a clean upper registry path (`Open VSX`), and a lower marketplace cache block; an unredacted `mizu` vector escapes the trace bucket, pivots through the SaaS node, and injects a displaced `mizu` block directly into the marketplace cache while severing the clean upstream path.
- Accent: mizu
- Deliberate imperfection: A misaligned, protruding `mizu` rectangle wedged into the marketplace cache block where the clean vertical verification line from the upstream registry is broken, depicting cache-layer injection.
-->
