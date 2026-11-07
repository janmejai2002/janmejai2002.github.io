# wAIbi-sabi — Harness Engineering Architecture Blueprint & 10-Point Technical Enquiry

**Grounded Source**: NotebookLM `Harness Engineering: Autonomous Agent Runtimes & Test Harnesses` (`abb8429a-d6ff-4745-a982-384dc0272676`, 56 sources)  
**Date**: 2026-11-07  
**Workspace**: `C:\Users\Janmejai\janmejai2002.github.io`  

---

## 1. Architectural Diagnosis from the Harness Engineering Notebook

The NotebookLM grounding audit evaluated wAIbi-sabi's transition from local Claude Code scheduled tasks to a serverless, zero-cost architecture on Gemini Spark (Google AI Pro), Google Apps Script, and GitHub Actions.

### Key Architectural Findings:
1. **The Sleeping PC Trap**: Continuous daemons or local cron jobs on a Windows 11 laptop introduce process interruption and state corruption. The harness microkernel must reside in serverless cloud ingress (Google Apps Script time-driven triggers or GitHub Actions cron).
2. **Bulk Synchronous Parallelism (BSP)**: Multi-turn tasks (Research → Outline → Draft → Build) must be structured into discrete super-steps with global barriers. Intermediate state must be committed atomically to Notion rows as checkpoints so interruptions rehydrate with zero token re-computation.
3. **Volatility-Ordered Gemini Prompt Caching**: Prompts must place static editorial constitutions, anti-ai rules, and schema definitions at the absolute prefix (Volatility 0.0) with zero dynamic timestamps. Dynamic article facts belong at the ephemeral tail, cutting TTFT latency by 85% and token costs by up to 90%.
4. **Context Quarantine**: Raw web crawls and SERP dumps must never be injected directly into the orchestrator prompt. Ephemeral subagents must isolate raw scrapes to workspace scratch files, returning only compact 2-line summaries and claim references.
5. **Asymmetric Dual-Engine Topology**: System 1 (deterministic Node.js scripts) must handle all syntactic validation (character counting, regex, SVG XML parsing, build checks) in sub-10ms, reserving System 2 (Gemini LLM) strictly for deep research and synthesis.

---

## 2. The 10-Question Technical Enquiry Series

### Question 1: Serverless Cloud Ingress & Trigger Resiliency
*Enquiry*: How should the trigger boundary be split between Google Apps Script (GAS) and GitHub Actions?  
*Architecture*: GAS runs daily at 06:00 IST to ingest stories and radar ideas, calling Gemini and appending directly to Google Sheets and Notion. GitHub Actions serves as the deterministic compile-and-deploy engine (`publish-from-notion.yml`). This ensures that even if GitHub deprioritizes scheduled cron runs on quiet repositories, the GAS webhook dispatches `repository_dispatch: notion-changed` to wake GitHub Actions instantly.

### Question 2: Bulk Synchronous Parallelism (BSP) in Notion
*Enquiry*: How do we prevent multi-turn drafting failures from restarting from scratch when APIs timeout?  
*Architecture*: Notion acts as the Pregel-style state ledger. The article lifecycle is segmented into atomic super-steps:
`Queued` → `Researching` (Claim Ledger saved to page) → `Drafting` (Body text committed) → `Draft Ready` (Artwork & TL;DR validated) → `Approved` → `Published`. If a run fails during drafting, it resumes from the existing Claim Ledger block rather than re-researching.

### Question 3: Volatility-Ordered Gemini Prompt Caching
*Enquiry*: How do we maximize Gemini's implicit KV cache hit rate across recurring editorial runs?  
*Architecture*: Ban all dynamic timestamps, randomized UUIDs, or un-sorted JSON keys from the system prompt. The first 4,096+ tokens must be 100% byte-identical across runs (the wAIbi-sabi editorial spine, anti-ai rules, and character cap specifications). The topic title and research queries are appended strictly at the ephemeral tail.

### Question 4: Context Quarantine for Primary Source Research
*Enquiry*: How do we prevent massive web page crawls from bloating context and causing attention degradation ("Lost in the Middle")?  
*Architecture*: Raw scrapes are quarantined into ephemeral scratch files (`scratch/research-<slug>.txt`). A targeted summarizer extracts only sentences matching the Claim Ledger structure: `[Claim | URL | Verbatim Sentence]`. Only the ledger rows enter the article drafter's context window.

### Question 5: Asymmetric Dual-Engine Separation (System 1 vs. System 2)
*Enquiry*: Which verification tasks must be permanently forbidden from LLM execution?  
*Architecture*: The LLM is mathematically uncalibrated for character counting and deterministic syntax verification. System 1 (Node.js scripts: `publish-article.mjs` and `check-build.mjs`) deterministically counts strings (`title.length <= 70`, `desc.length <= 160`, `question.length <= 120`) and parses AST blocks. The LLM is never trusted to self-certify length.

### Question 6: The Claim Ledger Verification Protocol
*Enquiry*: How does the harness verify source attribution without hallucinated citations?  
*Architecture*: Before any claim enters a draft, the harness requires a scratch Claim Ledger. In Step 4.5, every numerical claim, percentage, date, and benchmark is verified by substring search against the verbatim quoted sentence from the primary source. If the exact sentence is absent from the fetched source, the claim is excised.

### Question 7: Deterministic SVG Linting & House Token Validation
*Enquiry*: How do we prevent malformed or off-brand SVG artwork from breaking production builds?  
*Architecture*: `site/scripts/make-images.mjs` and `publish-article.mjs` parse the SVG code block using an XML parser before build time. It asserts:
1. `viewBox="0 0 1600 900"`
2. Ground `<rect fill="{{paper}}"/>` present
3. Zero hex codes (`regex: /(?:fill|stroke)="#/i` throws)
4. Presence of grain turbulence filter. If validation fails, deterministic fallback art is rendered, and `Blocked Reason` is logged.

### Question 8: Human-in-the-Loop (HITL) State Machine Governance
*Enquiry*: How does the harness enforce human control without stalling unattended tracks?  
*Architecture*: Dual-track publication:
- **Unattended Tracks** (`Basics`, `Case Studies`, `Talks`): Validated by automated preflight and committed directly to `main`.
- **Reviewed Tracks** (`Technical`, `Business`): Must pass preflight, then require human `Draft Status = Approved`. The harness opens a PR on `notion/approved-articles` and never commits to `main` until the human merges.

### Question 9: Bounded Ring Buffering for CI/CD Diagnostics
*Enquiry*: How do we prevent Astro 5 build logs from overflowing error notifications and context buffers?  
*Architecture*: When `npm run build` or `check-build.mjs` runs, stdout is captured via a Head/Tail Ring Buffer: the first 50 lines (flags, environment) and last 150 lines (stack traces, specific assertion failures) are preserved, while intermediate static file generation noise is collapsed.

### Question 10: Closed-Loop Edge Reconciliation
*Enquiry*: How does the harness ensure that an article is never falsely recorded as live?  
*Architecture*: `site/scripts/close-loop.mjs` runs post-deploy. It issues a real HTTP GET request to `https://janmejai2002.github.io/blog/<slug>/`. It verifies HTTP 200 AND asserts that the article headline exists in the response body. Only upon successful content verification does it write `Draft Status = Published`, `Post URL`, and `Publish Date` back to the Notion row.
