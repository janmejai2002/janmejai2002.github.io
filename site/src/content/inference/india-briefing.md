---
title: "India briefing: DPDP, RBI FREE-AI & IndiaAI"
unitNumber: "Insert B"
part: "Part IX · Inserts"
track: "India & Finance"
accent: "ochre"
deck: "DPDP Act 2023 & 2025 Rules, RBI FREE-AI 7 Sutras, the IndiaAI Mission compute pool, and empirical enterprise adoption patterns."
hook: "A Mumbai fintech startup deploys an AI agent over customer bank statements assuming India has no AI Act. Within sixty days it faces RBI and Data Protection Board inquiries. What statutory duties did it miss?"
readingTime: "7 min read"
order: 4
nextLocked:
  id: "financial-crime-fraud-and-rbi-free-ai"
  title: "Ch 24 · Financial crime, fraud & RBI FREE-AI"
  track: "Finance & Banking (4 units)"
  words: "4,800 words · UPI mule networks, AML false-positive math, SEBI & DPDP compliance"
  outcomes:
    - "Calculate the base-rate false-positive trap in bank transaction monitoring."
    - "Map the 7 RBI FREE-AI Sutras directly onto credit underwriting and fraud workflows."
    - "Design DPDP-compliant retention and 90-day erasure architectures for financial records."
---
Executives often assume that because India lacks an omnibus statute like the European Union's AI Act, artificial intelligence deployments operate in an unregulated space. This is an expensive legal misunderstanding. <mark class="inf-mark">India regulates AI through existing statutory anchors—data protection, financial stability guidelines, and consumer law—rather than a single omnibus AI statute.</mark>

For consultants, corporate strategists, and fintech founders, navigating the Indian AI landscape requires mastering four pillars: personal data protection mandates, banking governance guidelines, national compute infrastructure, and empirical enterprise adoption patterns.

## Personal data governance: the DPDP Act and 2025 Rules

The primary statutory constraint on any AI model processing personal text, voice, or transactional data is the Digital Personal Data Protection (DPDP) Act, enacted by Parliament on 11 August 2023 (MeitY / PIB, Nov 2025). On 14 November 2025, the Ministry of Electronics and Information Technology notified the DPDP Rules, 2025, initiating an 18-month phased compliance timeline for enterprises (MeitY / PIB, Nov 2025).

<aside class="inf-box inf-box--principle">

<p class="inf-box__label">Principle · Data fiduciary liability</p>

1. Any organization that determines the purpose and means of processing personal data is a Data Fiduciary under Indian law.
2. Training or prompting an AI model with customer data constitutes automated data processing.
3. Engaging a third-party cloud vendor or API provider does not transfer statutory liability: the primary enterprise remains legally responsible for breaches and unlawful processing.
4. The DPDP framework requires explicit, purpose-specific consent notices and grants individuals statutory rights of access, correction, and erasure.
5. An enterprise cannot shield itself behind a vendor's algorithms; if an AI system ingests customer data without standalone consent or fails to erase customer records upon request, the deploying enterprise faces statutory penalties.

</aside>

The DPDP Rules establish concrete operational mandates that directly impact AI architecture:
- *Standalone consent notices:* Data Fiduciaries must present clear, plain-language notices specifying the exact purpose of data collection. Bundling AI training consent into general website terms of service is prohibited (MeitY / PIB, Nov 2025).
- *Rights fulfillment within 90 days:* Fiduciaries must resolve citizen requests for data access, correction, updating, or erasure within a maximum of 90 days (MeitY / PIB, Nov 2025). If an enterprise trains an internal model directly on raw personal data without anonymization, fulfilling an erasure mandate requires expensive model retraining or machine unlearning.
- *Significant Data Fiduciaries:* Entities categorized as Significant Data Fiduciaries must appoint an India-based Data Protection Officer, commission independent external audits, conduct Data Protection Impact Assessments, and adhere to potential data localization mandates (MeitY / PIB, Nov 2025).

## Financial sector regulation: the RBI FREE-AI framework

In the financial sector, where AI models increasingly automate credit underwriting, fraud detection, and customer support, the Reserve Bank of India enforces explicit governance principles. On 13 August 2025, the RBI published the report of the Committee to develop a Framework for Responsible and Ethical Enablement of AI (FREE-AI) in the Financial Sector, delivering 26 recommendations anchored on "7 Sutras" (RBI, Aug 2025).

In November 2025, the Ministry of Electronics and Information Technology adopted these seven principles directly into the national India AI Governance Guidelines (MeitY, Nov 2025):
1. *Trust is the Foundation:* Systems must earn user confidence through predictable operation.
2. *People First:* AI must augment human capability, prioritizing user welfare over pure automation.
3. *Innovation over Restraint:* Regulation should facilitate safe experimentation rather than preemptively stifling technological development.
4. *Fairness and Equity:* Models must not replicate historical prejudice or discriminate against marginalized applicant pools.
5. *Accountability:* An identifiable human executive must always remain responsible for automated decisions.
6. *Understandable by Design:* Automated recommendations must provide interpretable decision logic rather than operating as unexplainable black boxes.
7. *Safety, Resilience, and Sustainability:* Infrastructure must resist adversarial manipulation and maintain operational business continuity.

Crucially, the national guidelines confirm India's official stance on legislation: "at this stage, a separate law to regulate AI is not needed given the current assessment of risks" (MeitY, Nov 2025). Instead, existing IT statutes, consumer protection laws, and sector regulations provide sufficient legal authority to penalize automated misconduct.

<aside class="inf-box inf-box--myth">

<p class="inf-box__label">Myth vs reality</p>

**Myth.** India has no enforceable regulations governing corporate artificial intelligence systems.

**Reality.** While Parliament has not passed an AI-specific law, existing statutory frameworks impose binding liability. Automated systems processing personal data must comply with the DPDP Act 2023 and its 2025 Rules, while financial institutions must adhere to RBI governance circulars and the FREE-AI directives (MeitY, Nov 2025) (MeitY / PIB, Nov 2025).

</aside>

<aside class="inf-box inf-box--myth">

<p class="inf-box__label">Myth vs reality</p>

**Myth.** A bank can deploy a black-box neural network to reject loan applications without providing an explanation to the applicant.

**Reality.** The RBI FREE-AI framework explicitly mandates the sutra of "Understandable by Design" and requires clear accountability (RBI, Aug 2025) (MeitY, Nov 2025). Adverse credit determinations must be grounded in explainable factors rather than uninterpretable probability vectors.

</aside>

## National infrastructure: the IndiaAI Mission

Recognizing that advanced AI adoption requires domestic computational capacity, the Union Cabinet approved the IndiaAI Mission on 7 March 2024 with a financial outlay of ₹10,371.92 crore (PIB, Mar 2024).

The mission addresses key computational bottlenecks through seven pillars, led by the IndiaAI Compute Capacity initiative. Under this public-private partnership, the government subsidizes high-end compute clusters for startups, researchers, and public institutions (PIB, Mar 2024). By 31 August 2025, the mission made over 38,231 graphics processing units available at subsidized tariffs, while the national AIKosh repository assembled over 1,500 datasets and 217 AI models to support sovereign model development (MeitY, Nov 2025).

At the India AI Impact Summit held in New Delhi from 16 to 21 February 2026, 92 nations and international bodies endorsed the summit declaration, while 13 frontier model developers signed the New Delhi Frontier AI Impact Commitments (PIB, Feb 2026). The government announced plans to provision an additional 20,000 GPUs to support enterprise and sovereign development pipelines (PIB, Feb 2026).

## How India uses AI: the Anthropic Economic Index

Understanding India's enterprise market requires examining empirical consumption patterns. In February 2026, Anthropic published the India Country Brief as part of the Anthropic Economic Index, analyzing Claude.ai usage data (Anthropic, Feb 2026).

The findings reveal a striking operational dichotomy:
- *High aggregate volume:* India accounts for 5.8% of global Claude.ai conversations, ranking second in absolute volume worldwide behind the United States (Anthropic, Feb 2026).
- *Software-centric specialization:* 45.2% of all Claude.ai tasks in India are software-related, ranking first globally, ahead of Vietnam (42.1%) and Egypt (39.2%) (Anthropic, Feb 2026).
- *Low per-capita intensity:* Despite massive national totals, India ranks 101st out of 116 countries on working-age per-capita AI usage (Anthropic, Feb 2026).
- *Geographic concentration:* Usage clusters heavily in four technology and commercial hubs: Maharashtra (15.5%), Tamil Nadu (13.2%), Karnataka (12.7%), and Delhi (10.5%) (Anthropic, Feb 2026).

<aside class="inf-box inf-box--stat">

<p class="inf-box__stat">45.2%</p>

The proportion of Claude.ai tasks in India dedicated to software development, ranking first globally, while India ranks 101st of 116 nations in per-capita working-age use.
<span class="src">Source: (Anthropic, Feb 2026)</span>

</aside>

This empirical data shows that generative AI in India remains heavily concentrated among software engineers and technology services teams. For management consultants, this concentration represents the primary business opportunity: non-IT corporate functions (supply chain logistics, retail merchandising, manufacturing quality control, and branch banking) remain largely unpenetrated by production AI workflows.

<aside class="inf-box inf-box--case">

<p class="inf-box__label">Worked case · Illustrative · Deploying loan document extraction at a Delhi NBFC</p>

#### The situation
A non-banking financial company headquartered in Delhi seeks to accelerate personal loan disbursements by deploying an automated document-processing pipeline. The system ingests customer bank statements, income tax returns, and identity cards to compute loan eligibility.

#### The decision
The advisory team structures the deployment to meet statutory mandates:
1. *Consent architecture:* The digital onboarding flow introduces a standalone consent screen under the DPDP Rules, explicitly stating that customer financial records will be processed by automated models solely for credit evaluation (MeitY / PIB, Nov 2025).
2. *Retention and erasure:* The system stores extracted vectors in an isolated tenant with a 90-day automated purging rule for rejected applicants, fulfilling statutory erasure rights (MeitY / PIB, Nov 2025).
3. *FREE-AI accountability:* Adhering to the RBI Sutras, the credit committee appoints a designated Chief Risk Officer as the named owner of automated underwriting decisions; adverse credit notices must specify the concrete financial factors behind any rejection (RBI, Aug 2025).

#### Your move
When framing an enterprise AI deployment for an Indian client, never treat compliance as an afterthought. Build statutory consent gates, data erasure pipelines, and explainable decision logs directly into the core solution architecture.

</aside>

- **Primary reading:** [Government notifies DPDP Rules to empower citizens and protect privacy](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2190014&reg=3&lang=2) (MeitY / PIB, Nov 2025)
- **Primary reading:** [India Country Brief: The Anthropic Economic Index](https://www.anthropic.com/research/india-brief-economic-index) (Anthropic, Feb 2026)

<aside class="inf-box inf-box--check">

<p class="inf-box__label">Check yourself · Check yourself</p>

1. What is the compliance timeline established by the DPDP Rules notified in November 2025? <span class="lvl">recall</span>
2. Name three of the 7 Sutras introduced in the RBI FREE-AI framework. <span class="lvl">recall</span>
3. Why does deploying an AI model via a third-party American cloud provider fail to exempt an Indian company from DPDP liability? <span class="lvl">explain</span>
4. India ranks second globally in total Claude.ai volume but 101st in per-capita usage. What strategic conclusion does this imply for an enterprise software vendor? <span class="lvl">judge</span>

</aside>

<details class="inf-answers">
<summary>Show answer key</summary>

1. An 18-month phased compliance timeline, with a requirement to fulfill citizen access and erasure requests within a maximum of 90 days (MeitY / PIB, Nov 2025).
2. Any three of: Trust is the Foundation; People First; Innovation over Restraint; Fairness and Equity; Accountability; Understandable by Design; Safety, Resilience, and Sustainability (RBI, Aug 2025) (MeitY, Nov 2025).
3. Under the DPDP Act 2023, the deploying enterprise is the Data Fiduciary that determines the purpose of processing. Statutory liability remains with the Fiduciary; outsourcing compute to a vendor (Data Processor) does not transfer legal accountability for unlawful processing or data leaks (MeitY / PIB, Nov 2025).
4. The high national volume is driven by sheer population size and a dense cluster of software developers (45.2% software tasks), while the vast majority of the formal working-age population has not adopted AI tools. Enterprise vendors should expand beyond software engineering tools into frontline operational and back-office workflows across non-IT sectors (Anthropic, Feb 2026).

</details>

<aside class="inf-box inf-box--recap">

<p class="inf-box__label">Night-before recap · The night-before page</p>

1. No separate AI statute exists: India regulates AI through the DPDP Act 2023, sector guidelines from the RBI, and existing consumer protection laws.
2. DPDP mandates are strict: Enterprises must provide standalone consent notices, fulfill erasure requests within 90 days, and bear primary fiduciary liability.
3. Financial AI requires the 7 Sutras: The RBI FREE-AI framework mandates accountability, fairness, and explainable decision-making in credit and risk workflows.
4. Sovereign compute is scaling: The IndiaAI Mission (₹10,371.92 crore outlay) provisioned over 38,000 GPUs by late 2025 to democratize affordable compute.
5. Adoption is skewed: India leads the world in AI coding share (45.2%) and ranks second in total Claude.ai traffic, but sits 101st in per-capita intensity.

</aside>


## Primary sources cited in this unit

- [Government notifies DPDP Rules to empower citizens and protect privacy](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2190014&reg=3&lang=2) — MeitY / PIB, Nov 2025
- [RBI FREE-AI Committee report (Framework for Responsible and Ethical Enablement of AI)](https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=61018) — RBI, Aug 2025
- [India AI Governance Guidelines](https://static.pib.gov.in/WriteReadData/specificdocs/documents/2025/nov/doc2025115685601.pdf) — MeitY, Nov 2025
- [Cabinet Approves IndiaAI Mission](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2012355) — PIB, Mar 2024
- [India Country Brief: The Anthropic Economic Index](https://www.anthropic.com/research/india-brief-economic-index) — Anthropic, Feb 2026
