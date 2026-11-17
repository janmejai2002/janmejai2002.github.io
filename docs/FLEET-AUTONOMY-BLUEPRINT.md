# wAIbi-sabi Fleet OS — Multi-Account Autonomous Gemini Architecture

**Status**: Proposal & Technical Specification  
**Author**: Antigravity Orchestrator & Janmejai Singh Minhas  
**Date**: November 2026  
**Architecture Diagram**: [fleet-architecture.html](file:///C:/Users/Janmejai/janmejai2002.github.io/docs/fleet-architecture.html)  
**Specification JSON**: [fleet-architecture.json](file:///C:/Users/Janmejai/janmejai2002.github.io/docs/fleet-architecture.json)

---

## 1. Executive Summary & Paradigm Shift

The wAIbi-sabi publishing system currently operates as a **single-account scheduled cron pipeline**: five scheduled prompts run inside Google's cloud via `gemini.google.com/scheduled`, writing to a single Google Sheet, monitored every 15 minutes by an Apps Script Conductor, and deployed via GitHub Actions to GitHub Pages.

While functional, this model has three fundamental architectural constraints:
1. **Zero Programmatic Control**: The local agent (Antigravity) and GitHub Actions are passive observers. If an article fails a deterministic gate at 05:00 AM, it sits idle in `Repair Queue` until the Gemini Repairer wakes up at 19:00 IST (a 14+ hour latency).
2. **Manual Setup & Fragility**: Prompts, skills, and model choices must be manually copy-pasted or configured in Google's web UI, with silent failure risks when quotas hit or sessions lapse.
3. **Single-Account Quota Bottleneck**: All heavy workloads (Radar research, long-form 2M context drafting in Gemini 4 Argon, SVG artwork generation, and repair loops) compete for the same daily quota resetting at 03:30 AM IST.

### The Next Evolution: wAIbi-sabi Fleet OS

By pooling your **4 Google Pro accounts** (1 primary + 3 new accounts) into a unified **Autonomous Gemini Fleet**, we transition from a passive scheduled cron system to an **Event-Driven, Self-Healing Multi-Agent Swarm** with direct programmatic control from Antigravity:

```
[ Antigravity Sovereign Brain (Local Windows 11) ]
                  │
                  ▼ (IPC / Loopback Proxy :8045)
    [ Gemini Fleet Gateway (ag-gateway) ]
    ┌─────────────┬─────────────┬─────────────┬─────────────┐
    ▼             ▼             ▼             ▼             ▼
[Account 1]   [Account 2]   [Account 3]   [Account 4]   [Failover]
  The Scout    The Craftsman  Gatekeeper    The Healer    Round-Robin
  (Radar/SERP)  (Argon Draft) (Fact/SVG)    (<60s Repair)  Resilience
    └─────────────┴─────────────┴─────────────┴─────────────┘
                  │ (Append / Stream)
                  ▼
   [ Shared Google Drive & Sheet Data Mesh ]
                  │
                  ▼ (Webhook / 15m Conductor v2)
   [ GitHub Actions Deterministic Preflight ] ──(Fail)──► Instant Patch via Acct 4 (<60s)
                  │ (Pass)
                  ▼
     [ Live CDN (janmejai2002.github.io) ] ──► [ Notion Reconciled (200 OK) ]
```

---

## 2. The 4-Account Fleet Specialization (Division of Labor)

Instead of overloading a single account with conflicting tasks, each Google Pro account is assigned a dedicated functional persona, optimized for its specific quota profile, context window, and toolchain:

| Account | Dedicated Role | Primary Responsibilities | Model & Engine | Tooling & Grounding |
|---|---|---|---|---|
| **Account 1** | **The Scout** (Intelligence & Radar) | • 24/7 Radar across 3 tracks (Tech, Biz, Basics)<br>• arXiv, CVE, GitHub Trending, & Hacker News scanning<br>• MBA Interview News curation (5 daily cards) | Gemini 2.5 / Flash | Google Search grounding, YouTube transcript extraction, SERP gap scoring |
| **Account 2** | **The Master Craftsman** (Long-Form Writer) | • Deep technical drafting (1,500–2,200 words)<br>• Enterprise autopsies (Case Studies track)<br>• Keynote dissections (Talks track) | **Gemini 4 Argon** (High Thinking) | 2M context window, Python execution sandbox for math/unit economics |
| **Account 3** | **The Adversarial Gatekeeper** (Auditor & Artist) | • Independent primary source claim verification<br>• Preflight compliance check against `rules.mjs`<br>• Geometric SVG generation with tokenized palettes | Gemini 2.5 / Argon | Code verification, Imagen 3 concept synthesis, SVG token validation |
| **Account 4** | **The Instant Healer** (Patcher & Multi-Channel) | • Real-time section repair (<60s turnaround)<br>• LinkedIn technical carousels & Substack digests<br>• NotebookLM Studio audio briefing generation | Gemini 4 Argon | Surgical section diffing, multi-platform markdown formatting, NotebookLM CLI |

---

## 3. Connecting Antigravity to Gemini Web (Zero Manual Involvement)

Connecting your local orchestrator directly to **Gemini Web** unlocks all the advantages of Google One AI Premium / Google Pro subscriptions (unlimited bundled Pro inference, 2M context, deep research, and Workspace integration) **without incurring per-token API charges**.

We implement a **Dual-Mode Programmatic Bridge**:

### Mode A: Lightweight RPC Gateway (`ag-gateway` on `127.0.0.1:8045`)
- **Mechanism**: Utilizes authenticated session tokens (`__Secure-1PSID` and `__Secure-1PSIDTS`) stored securely in `.env.global` for the 4 accounts.
- **Dispatch**: Directly calls Google's internal `batchexecute` / `BardFrontendService` RPC endpoints via HTTP requests.
- **Performance**: Sub-second execution latency, zero browser RAM overhead (<10MB), and instant account rotation.
- **Use Case**: On-demand section repairs, rapid preflights, and instant radar queries.

### Mode B: Persistent Headless Session Pool (Camoufox / Puppeteer)
- **Mechanism**: Maintains 4 isolated, persistent browser profiles in `~/.gemini/fleet-profiles/`.
- **Capabilities**: Full access to Gemini Web UI features that lack pure RPC equivalents:
  - **Deep Research Mode**: Triggers Gemini's multi-step recursive search.
  - **Gems & Custom Skills**: Direct integration with Gemini's specialized skills.
  - **Workspace Extensions**: Direct reading/writing to Drive files and Sheets.
- **Use Case**: Deep overnight research papers and comprehensive enterprise autopsies.

### Mode C: Sovereign Cloud Heartbeat (Apps Script Conductor v2)
- **Zero-Laptop Guarantee**: When your laptop is closed, the system does not die.
- The 4 accounts share a single **Master Fleet Drive Folder** and the central **wAIbi-sabi News Feed Sheet**.
- Apps Script Webhooks allow cross-account event triggers: Account 1's Radar completion automatically signals Account 2's drafting queue.

---

## 4. The Zero-Wait Self-Healing Loop

The current repair loop takes between 7 minutes and 14 hours because it relies on a scheduled cron. The new Fleet OS reduces repair turnaround to **under 60 seconds**:

```
[ Draft Filed in Sheet ]
          │
          ▼
[ GitHub Actions / Local Preflight Gate (rules.mjs) ]
          │
    ┌─────┴────────────────────────┐
    ▼                              ▼
(Passed)                    (Gate Violated, e.g. G-ASCII in Sec 3)
    │                              │
    │                      [ Conductor v2 Event Webhook ]
    │                              │
    │                      [ Antigravity Fleet Gateway ]
    │                              │
    │                              ▼ (Instant On-Demand Call)
    │                      [ Account 4: The Healer (Gemini Web) ]
    │                              │ (Patches Sec 3 in ~35s)
    │                              ▼
    │                      [ Local Deterministic Diff Validator ]
    │                         • Asserts ONLY Sec 3 changed
    │                         • Asserts 0 unflagged sections touched
    │                              │
    │                              ▼ (Accepted)
    └──────────────────────► [ Astro Build & CDN Deploy ]
```

### SLA Comparison

| Metric | Current System | wAIbi-sabi Fleet OS |
|---|---|---|
| **Radar to Draft Latency** | 40 minutes (fixed cron) | 2–4 minutes (event trigger) |
| **Gate Failure to Repair** | 4 to 14.5 hours (waits for 19:00 IST) | **< 60 seconds** (instant out-of-band call) |
| **Manual Prompt Management** | Manual copy-pasting to web UI | **Zero** (programmatic dispatch) |
| **Daily Draft Capacity** | 3–4 articles/day | **12–16 articles/day** (load-balanced) |
| **Failover Resilience** | Single point of failure | **Automatic 4-way account rotation** |

---

## 5. Implementation Roadmap

### Phase 1: Fleet Session Capture & Gateway Wiring (Week 1)
1. Initialize the 4 Google Pro account sessions in `~/.gemini/fleet-profiles/` using `ag-gateway`.
2. Configure `.env.global` with account aliases (`waibi-scout`, `waibi-craftsman`, `waibi-gatekeeper`, `waibi-healer`).
3. Verify multi-account rotation with `ag switch` and `ag quota`.

### Phase 2: Role Partitioning & Event-Driven Conductor v2 (Week 2)
1. Upgrade `gas/Conductor.js` to support cross-account event webhooks via Google Drive file watchers.
2. Grant read/write access to the central Google Sheet across all 4 Google Pro email addresses.
3. Migrate task prompts from static cron descriptions to programmatic dispatch templates in `gemini/fleet/`.

### Phase 3: Instant Section Healer Integration (Week 3)
1. Wire GitHub Actions failure callback (`sync-drafts.mjs --on-fail`) to ping the local `ag-gateway` or Apps Script webhook.
2. Route repair jobs directly to **Account 4** on Gemini Web with the exact section and failure code.
3. Verify with the existing repair regression suite (`npm --prefix site test`).

### Phase 4: Multi-Channel Syndication & Studio Audio (Week 4)
1. Enable Account 4 to automatically repurpose published articles into:
   - Technical LinkedIn carousel slides (JSON/SVG).
   - Substack newsletter digests.
   - NotebookLM podcast scripts / Audio Overviews.
2. Reconcile all live links into Notion via `close-loop.mjs`.

---

## 6. Guardrail Invariants (Never Compromised)

1. **`Draft Status = Approved` Remains Human-Only**: Automated tracks continue to publish based on deterministic gates; human approval paths are never spoofed.
2. **`registry.mjs` Remains the Single Source of Truth**: Caps (70/160/120), failure codes, and repair limits live in code, not scattered in prompts.
3. **Surgical Section Patching**: Gemini only ever returns the repaired section. Deterministic code handles 100% of the draft reassembly to eliminate prose drift.
4. **Live HTTP 200 Reconciler**: Notion is marked `Published` only after the live URL confirms successful edge rendering.
