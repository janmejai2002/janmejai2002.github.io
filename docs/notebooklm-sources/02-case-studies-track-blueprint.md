# Case Studies Track Master Specification

## 1. Track Identity
- Track Name: `Case Studies` (Slug: `case-studies`)
- Theme Accent Token: `{{moss}}` (#52694a / forest green)
- Target Audience: Engineering directors, product managers, and founders looking for rigorous, unvarnished precedents of real enterprise AI deployments.
- Publishing Path: Unattended (`AUTO_TRACKS`). Commits directly to `main` upon ingestion.

## 2. Research & Deep Search Ingress Standard
- Permitted Primary Sources:
  1. SEC 10-K, 10-Q, and 8-K filings for public companies.
  2. Official engineering postmortems and whitepapers published by the engineering teams (e.g. Uber Engineering, Netflix TechBlog, Klarna engineering releases, CBA technology updates).
  3. Verified CEO shareholder letters and investor presentations with concrete auditable numbers.
  4. CVE advisories, incident postmortems, and regulatory filings.
- Strictly Forbidden:
  1. Vendor PR press releases and sponsored marketing puff pieces.
  2. Aggregator listicles ("Top 10 Companies Using AI in 2026").
  3. Unverified LinkedIn thought-leadership posts without citations.

## 3. Mandatory 4-Part Autopsy Structure

Every Case Study must follow this 4-part architectural breakdown:

### Part 1: The Deployment
- The technical stack, model choices, parameter counts, context window configurations, and vector/search indexes.
- SLA constraints: Time-to-First-Token (TTFT), p95/p99 latency targets, concurrency requirements, and regional deployment boundaries.
- The workflow diagram or ASCII execution graph explaining how data flows through the system.

### Part 2: The Balance Sheet
- Hard unit economics: Cost per deflection or resolution compared to legacy human labor or traditional software.
- The hidden infrastructure costs: Compute clusters, GPU hours, cache write surcharges, embedding updates, and human-in-the-loop audit overhead.
- True ROI: Payback period, gross margin impact, and contractual pricing model (metered tokens vs. seat licensing).

### Part 3: The Edge Cases & Breakages
- Where the system failed: Hallucinations, jailbreaks, prompt injections, data leakage, and drift.
- Escalation path: What happens when confidence falls below the acceptance threshold.
- Customer sentiment and churn metrics: Measured dissatisfaction vs. executive optimism.

### Part 4: The Reusable Blueprint
- 3 to 4 actionable engineering principles any technical team can implement immediately.
- Reusable configuration patterns (e.g. prompt caching strategies, guardrail layers, retrieval filters).

## 4. Artwork Requirements
- Accent: `{{moss}}`
- Alt text and 1600x900 SVG using exclusively `{{paper}}`, `{{ink}}`, `{{border}}`, and `{{moss}}`.
- Deliberate wAIbi-sabi imperfection: A fractured flow, an offset block, or a displaced data point symbolizing real-world system friction.
