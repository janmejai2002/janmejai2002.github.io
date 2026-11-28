---
title: "PE Due Diligence: The AI-First Customer Service Target (Casebook Preview)"
unitNumber: "Case 01"
part: "Part III · Consulting (Excerpt)"
track: "Consulting & Strategy"
accent: "hanko"
deck: "One complete worked consulting case from Ch 12: auditing an 80% automated resolution claim, API wrapper risk, and true gross margin."
hook: "A private equity fund wants to acquire a Bengaluru AI customer service startup for ₹400 crore. The founder claims an 80% automated resolution rate. How do you test moat versus wrapper in due diligence?"
readingTime: "6 min read"
order: 5
nextLocked:
  id: "ai-casebook"
  title: "Ch 12 · The complete INFERENCE AI Casebook (9 more cases + 10 guesstimates)"
  track: "Consulting & Strategy (13 units)"
  words: "9,500 words · 10 full consulting cases + 10 quantitative guesstimates"
  outcomes:
    - "Solve all four AI case archetypes across banking, quick-commerce, IT services, healthcare, and telecom."
    - "Run Fermi guesstimates linking Indian broadband users to token bills, GPU counts, and MW data-centre power."
    - "Defend margins when clients demand hourly rate cuts after coding-assistant rollouts."
---

Case interviews at top management consulting firms are evolving rapidly. Traditional frameworks like profitability trees, market entry matrices, and merger synergy models remain essential, but interviewers increasingly inject artificial intelligence into candidate scenarios.

However, business school casebooks frequently treat AI as generic technology. Candidates are told to recommend "adding a chatbot" or "deploying predictive machine learning" without considering token costs, model latency, error distributions, or workflow bottlenecks. In real client engagements, recommending an unviable technical solution destroys advisory credibility. <mark class="inf-mark">Excelling in modern consulting interviews requires treating artificial intelligence as an operational system with distinct unit economics, error profiles, and change management constraints.</mark>

This chapter provides a comprehensive practice library: ten end-to-end strategic cases and ten quantitative [guesstimates](/inference/glossary/#guesstimate) designed specifically for management consulting, strategy, and corporate development interviews.

## The idea, from zero

<aside class="inf-box inf-box--principle">

<p class="inf-box__label">Principle · Build it from zero</p>

1. A consulting case interview evaluates how a candidate structures an ambiguous business problem, applies quantitative rigor, and delivers actionable executive recommendations.
2. An AI business problem is never purely a software engineering question; it is an operational economics question.
3. Every AI deployment incurs three distinct costs: capital infrastructure (compute, GPUs, data centre power), variable operational expenditure (input and output tokens, API calls), and organizational overhead (human review, error remediation, workflow retraining).
4. Every AI deployment creates value through one of two mechanisms: reducing unit labor cost per transaction, or accelerating revenue growth by unlocking previously unviable services.
5. If the variable cost and human review overhead exceed the labor savings, or if the model's error rate disrupts critical operations, the initiative destroys economic value.
6. Solving an AI case interview requires walking the entire operational chain: from model capabilities and unit token economics to workflow integration, regulatory compliance, and P&L realization.

</aside>

## The four AI case archetypes

In modern campus and lateral consulting interviews, artificial intelligence cases cluster into four distinct structural patterns:

1. **Due Diligence and M&A:** Evaluating an AI acquisition target or private equity investment. The candidate must determine whether the target owns proprietary defensible intellectual property (data assets, fine-tuned domain models, embedded customer workflows) or is an easily replicable wrapper around public foundation models.
2. **Use-Case Prioritization:** Helping an enterprise client evaluate candidate AI projects across its value chain. The candidate must segment tasks between predictive machine learning (structured numerical data) and generative models (unstructured text and documents), scoring initiatives on business impact, feasibility, and regulatory exposure.
3. **Pilot Diagnostics and Change Management:** Rescuing a stalled enterprise initiative where a model demonstrated high technical accuracy in testing but failed to generate financial return. The candidate must audit workflow handoffs, identify time leakage, and restructure approval hierarchies.
4. **Unit Economics and Commercial Pricing:** Structuring pricing models for software products incorporating foundation models. The candidate must calculate inference token costs, design rate limits, and transition client contracts toward outcome-based fees.

<figure class="diagram"><svg viewBox="0 0 720 240" role="img" aria-label="Four AI consulting case archetypes and unit economics checks"><rect x="16" y="16" width="162" height="204" rx="8" fill="var(--card)" stroke="var(--hanko)" stroke-width="1.5"/><text x="28" y="42" fill="var(--hanko)" font-family="var(--font)" font-size="12" font-weight="700">1. Due Diligence</text><text x="28" y="66" fill="var(--ink-soft)" font-family="var(--font)" font-size="11">Proprietary data &amp;</text><text x="28" y="82" fill="var(--ink-soft)" font-family="var(--font)" font-size="11">workflow moat vs.</text><text x="28" y="98" fill="var(--ink-soft)" font-family="var(--font)" font-size="11">thin API wrapper</text><text x="28" y="132" fill="var(--ink)" font-family="var(--font)" font-size="11" font-weight="600">Audit: true margin</text><text x="28" y="148" fill="var(--ink-soft)" font-family="var(--font)" font-size="11">after human QA</text><rect x="192" y="16" width="162" height="204" rx="8" fill="var(--card)" stroke="var(--mizu)" stroke-width="1.5"/><text x="204" y="42" fill="var(--mizu)" font-family="var(--font)" font-size="12" font-weight="700">2. Prioritization</text><text x="204" y="66" fill="var(--ink-soft)" font-family="var(--font)" font-size="11">Predictive ML vs.</text><text x="204" y="82" fill="var(--ink-soft)" font-family="var(--font)" font-size="11">GenAI fit across</text><text x="204" y="98" fill="var(--ink-soft)" font-family="var(--font)" font-size="11">the value chain</text><text x="204" y="132" fill="var(--ink)" font-family="var(--font)" font-size="11" font-weight="600">Audit: regulatory</text><text x="204" y="148" fill="var(--ink-soft)" font-family="var(--font)" font-size="11">and data readiness</text><rect x="368" y="16" width="162" height="204" rx="8" fill="var(--card)" stroke="var(--ochre)" stroke-width="1.5"/><text x="380" y="42" fill="var(--ochre)" font-family="var(--font)" font-size="12" font-weight="700">3. Pilot Rescue</text><text x="380" y="66" fill="var(--ink-soft)" font-family="var(--font)" font-size="11">High demo score</text><text x="380" y="82" fill="var(--ink-soft)" font-family="var(--font)" font-size="11">with zero P&amp;L lift</text><text x="380" y="98" fill="var(--ink-soft)" font-family="var(--font)" font-size="11">after 12 months</text><text x="380" y="132" fill="var(--ink)" font-family="var(--font)" font-size="11" font-weight="600">Audit: handoffs &amp;</text><text x="380" y="148" fill="var(--ink-soft)" font-family="var(--font)" font-size="11">capacity leakage</text><rect x="544" y="16" width="160" height="204" rx="8" fill="var(--card)" stroke="var(--moss)" stroke-width="1.5"/><text x="556" y="42" fill="var(--moss)" font-family="var(--font)" font-size="12" font-weight="700">4. Unit Economics</text><text x="556" y="66" fill="var(--ink-soft)" font-family="var(--font)" font-size="11">Token cost, cloud</text><text x="556" y="82" fill="var(--ink-soft)" font-family="var(--font)" font-size="11">vs. own GPUs, and</text><text x="556" y="98" fill="var(--ink-soft)" font-family="var(--font)" font-size="11">outcome pricing</text><text x="556" y="132" fill="var(--ink)" font-family="var(--font)" font-size="11" font-weight="600">Audit: escalation</text><text x="556" y="148" fill="var(--ink-soft)" font-family="var(--font)" font-size="11">rate x human cost</text></svg><figcaption>The four consulting AI case archetypes; Case 1 below works through archetype 1 (PE due diligence) end to end.</figcaption></figure>

<aside class="inf-box inf-box--stat">

<p class="inf-box__stat">101st out of 116</p>

India's global ranking in per-capita Claude.ai usage, despite ranking second worldwide in absolute usage volume with 1,348.08 million total telephone subscribers and 1,087.50 million broadband connections.
<span class="src">Sources: Anthropic (2026) (Anthropic, Feb 2026); TRAI (2026) (TRAI, Jul 2026)</span>

</aside>

<aside class="inf-box inf-box--concept">

<p class="inf-box__label">Concept · Guesstimate</p>

**Plain words.** A structured interview exercise where a candidate estimates an unknown market volume, capacity requirement, or financial figure using transparent, logical steps and reasonable mathematical assumptions.

**Analogy.** Estimating how much water a city consumes daily by multiplying population by average household size, daily showers, cooking needs, and industrial use. The interviewer does not care if the final number is off by 10%; they care whether the candidate constructed a complete, leak-free mathematical tree.

**Misconception.** "Guesstimates test whether you memorized obscure industry statistics." Interviewers test whether you can break an ambiguous problem into independent drivers, state explicit assumptions, execute mental arithmetic cleanly, and sanity-check your conclusion against real anchors.

</aside>

---

## Ten strategic AI cases

The following cases represent realistic problem-solving scenarios encountered in management consulting rounds. All settings, companies, and operational parameters are illustrative.

### Case 1: PE Due Diligence · The "AI-First" Customer Service Target
- **The Situation:** A private equity fund considers acquiring a 60% stake in a Bengaluru-based customer service software company for ₹400 crore. The target reports ₹60 crore in annual recurring revenue (ARR) with 45% gross margins, claiming that its autonomous conversational agent resolves 80% of customer inquiries without human intervention.
- **Clarifying Questions:**
  1. What is the breakdown of the target's customer base and contract churn?
  2. Does the target train proprietary foundation models, or does it call third-party APIs (OpenAI, Anthropic)?
  3. How does the target define its "80% resolution rate"?
- **The Analytical Core:**
  - *Moat vs. Wrapper:* The candidate discovers that the startup calls frontier model APIs, paying ₹18 crore annually in cloud compute costs. It owns no proprietary model weights; its intellectual property consists of system prompts and API routing scripts.
  - *The Resolution Illusion:* <mark class="inf-mark">The reported 80% containment rate measures sessions where the customer did not press "speak to an agent"; customer CSAT data often reveals high abandonment and expensive escalations.</mark>
  - *True Gross Margin:* When accounting for customer re-contacts and the 150 offshore human reviewers employed to verify chat logs, true gross margin drops from 45% to 22%.
- **Recommendation:** Do not acquire at the proposed ₹400 crore valuation (6.7x ARR). The company lacks defensibility against platform feature expansion by major cloud providers. If the fund proceeds, valuation must be discounted to 2.5x ARR (₹150 crore) to reflect high customer churn and software wrapper vulnerability.


---

> **Preview boundary:** The full **INFERENCE AI Casebook (Ch 12)** continues with Cases 2 through 10 (FMCG supply chain, private-sector banking, gig-worker NBFC underwriting, quick-commerce operations, IT services outcome pricing, clinical pilot turnarounds, IndiaAI private compute vs cloud APIs, EdTech unit economics, and public-sector land records) plus **10 worked quantitative guesstimates**.


## Primary sources cited in this unit

- [India Country Brief: The Anthropic Economic Index](https://www.anthropic.com/research/india-brief-economic-index) — Anthropic, Feb 2026
- [TRAI Press Release 104/2026, June 2026 subscription data](https://www.trai.gov.in/sites/default/files/2026-07/PR_No104of2026_0.pdf) — TRAI, Jul 2026
