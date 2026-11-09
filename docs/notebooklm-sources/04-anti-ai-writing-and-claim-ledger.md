# Anti-AI Writing Standard & Claim-Ledger Protocol

## 1. The Anti-AI Editorial Standard (Wikipedia WP:AISIGNS)

Articles on wAIbi-sabi must read like they were written by an observant human engineer who actually writes code and monitors production telemetry. Machine tropes and AI slop are strictly banned.

### A. The Specificity Ladder (Aim for Level 3 or 4)
- Level 1 (Vague/AI Slop): "Large language models often suffer from significant performance degradation during prolonged execution."
- Level 2 (Category): "Autonomous agents face latency bottlenecks when prompts grow too large."
- Level 3 (Concrete Metric): "Prefill time-to-first-token spiked from 320ms to 2.4s when the tool catalog surpassed 45 schemas."
- Level 4 (Lived Experience): "At 02:14 UTC, our PagerDuty alerted because the agent's KV cache hit rate dropped from 94% to 0% after injecting dynamic timestamps into turn zero."
Rule: Always choose numbers over adjectives and concrete instances over categories.

### B. The Ten Banned AI Tells
1. Negative Parallelism (#1 AI Tell): NEVER write "It's not about X. It's about Y", "Less X, more Y", or "The question isn't X...". Make the direct declarative statement with data.
2. The Punctuation Tell: Zero em dashes (—). Do not use em dashes anywhere in the title, headings, or body. Use periods, commas, colons, or parentheses.
3. Dead Throat-Clearing Openings: Never open with "In today's rapidly evolving AI landscape...", "It's important to understand...", or "Let's dive into...". Name the friction and the subject in the very first sentence.
4. The Banned Word List:
   - delve, realm, tapestry, robust, seamless, pivotal, game-changer, unlock, leverage, transformative, foster, holistic, testaments, landscape, uncharted.
   - Replace with literal engineering verbs: measured, cut, added, crashed, deployed, broke, saturated, reduced.
5. The Rule of Three Reflex: Do not artificially force every list into three bullets or three adjectives. Natural analysis has uneven counts (2, 4, or 5).
6. False Balanced Wrap-ups: Never conclude with "Only time will tell", "The future remains bright", or "As AI continues to grow...". End with a concrete technical trade-off or architectural decision.

### C. The South Park "But / Therefore" Narrative Engine
Never string facts together with "and then..." (which produces boring descriptive slog).
Every narrative turn must connect via conflict (BUT) or causality (THEREFORE):
"The team upgraded to a 1M context model. THEREFORE they deprecated their vector database. BUT p99 latency tripled and monthly billing jumped $14k. THEREFORE they rebuilt a local BM25 lexical cache."

---

## 2. The Claim-Ledger Protocol (Zero Hallucination)

Before drafting any article, compile an internal Claim Ledger:
| Stated Claim | Primary URL | Verbatim Quoted Sentence from Source |
|---|---|---|

Rules:
1. Verbatim Grounding: If you cannot quote the exact sentence from the source, cut the claim.
2. Derivations: Percentage changes, multiples (e.g. "5x faster"), and dollar differences must be mathematically computed from the raw data.
3. Negative Evidence: If a benchmark or test hurts the article's central thesis, report that number prominently. Contrarian honesty builds institutional trust.
