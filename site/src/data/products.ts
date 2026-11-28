/**
 * Typed multi-product catalog, buyer segmentation, ecosystem mapping,
 * and B2B advisory offers derived from the wAIbi-sabi & INFERENCE knowledge base.
 *
 * Keep this module free of heavy JSON imports (such as news.json) so client
 * scripts importing currency/CTA helpers add near-zero bytes to the bundle.
 */

export type AccentKey = 'mizu' | 'ochre' | 'plum' | 'moss' | 'hanko' | 'indigo';
export type Currency = 'INR' | 'USD';

export type BuyerSegmentId =
  | 'all'
  | 'mba-candidate'
  | 'ai-engineer-pm'
  | 'campus-placecom'
  | 'enterprise-vp';

export interface BuyerSegment {
  id: BuyerSegmentId;
  label: string;
  roleSummary: string;
  accent: AccentKey;
}

export interface ProductCheckoutLinks {
  /** Domestic INR checkout link (replace mailto placeholder with live Razorpay Payment Page URL). */
  razorpayUrl: string;
  /** Global USD Merchant-of-Record link (replace mailto placeholder with live Dodo / Lemon Squeezy / Stripe URL). */
  globalMorUrl: string;
  /** Direct scoping, bulk invoice, or custom licensing inquiry link. */
  inquiryHref: string;
  /** Canonical on-site product or landing route. */
  primaryHref: string;
  /** Optional secondary on-site preview or proof route. */
  secondaryHref?: string;
}

export interface ProductSkuTier {
  id: string;
  label: string;
  priceInrLabel: string;
  priceUsdLabel: string;
  note: string;
}

export interface ProductItem {
  id: string;
  slug: string;
  streamLabel: string;
  name: string;
  badge: string;
  tagline: string;
  description: string;
  accent: AccentKey;
  schemaType: 'Product' | 'Service';
  buyerSegments: Exclude<BuyerSegmentId, 'all'>[];
  priceInr: number;
  priceUsd: number;
  priceInrLabel: string;
  priceUsdLabel: string;
  cadenceLabel: string;
  sourceBasis: string;
  deliverables: string[];
  subTiers?: ProductSkuTier[];
  trustFirewall: string;
  ctaLabelInr: string;
  ctaLabelUsd: string;
  primaryRouteLabel: string;
  secondaryCtaLabel?: string;
  highlighted?: boolean;
  checkout: ProductCheckoutLinks;
}

export interface EcosystemNode {
  id: string;
  sourceLabel: string;
  sourceMetric: string;
  sourceHref: string;
  productName: string;
  productHref: string;
  bridgeSummary: string;
  accent: AccentKey;
}

export interface AdvisoryProofMetric {
  id: string;
  value: string;
  label: string;
  detail: string;
  accent: AccentKey;
}

export interface AdvisoryPackage {
  id: 'red-team-audit' | 'eval-harness-sprint' | 'executive-workshop';
  badge: string;
  name: string;
  duration: string;
  accent: AccentKey;
  priceInr: number;
  priceUsd: number;
  priceInrLabel: string;
  priceUsdLabel: string;
  rangeInrLabel: string;
  rangeUsdLabel: string;
  cadenceLabel: string;
  audience: string;
  summary: string;
  deliverables: string[];
  highlighted?: boolean;
  ctaLabel: string;
  inquirySubjectInr: string;
  inquirySubjectUsd: string;
}

export interface AdvisoryHarnessPillar {
  id: string;
  modulePath: string;
  title: string;
  accent: AccentKey;
  summary: string;
  clientTranslation: string;
}

export interface FaqEntry {
  question: string;
  answer: string;
}

export const PRODUCT_CONTACT_EMAIL = 'janmejai2002@gmail.com';

const mailto = (subject: string, body: string) =>
  `mailto:${PRODUCT_CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

/**
 * Centralized payment & inquiry URLs.
 * Swap `razorpay` and `globalMor` entries for live payment links without touching page templates.
 */
export const CHECKOUT_URLS = {
  razorpay: {
    'inference-compendium': mailto(
      'INFERENCE 2027 — Full Edition or Domain Module (INR)',
      'Hi Janmejai and Chaitanya,\n\nI would like to purchase INFERENCE 2027 (Full 36-Unit Edition INR 1,999 / Domain Track INR 499 / Accelerator INR 3,499).\nPreferred tier: '
    ),
    'bschool-interview-dossier': mailto(
      'B-School AI & Business Interview Dossier — Individual Pack (INR 799)',
      'Hi Janmejai,\n\nI would like to purchase the B-School AI & Business Interview Dossier (708-Story Vault + NotebookLM Audio/Slide Pack, INR 799).\nTarget campus / interview domain: '
    ),
    'enterprise-claims-pack': mailto(
      'Enterprise AI Claims & Autopsy Intelligence Pack — Annual Pass (INR 9,999/yr)',
      'Hi Janmejai,\n\nI would like to order the Enterprise AI Claims & Autopsy Intelligence Pack (Individual Analyst Pass INR 9,999/yr or Team 5-Seat INR 34,999/yr).\nOrganization & role: '
    ),
    'red-team-eval-sprints': mailto(
      'Advisory Sprint Inquiry — AI Red-Teaming & Deterministic Eval Harness (INR)',
      'Hi Janmejai,\n\nWe would like to scope an AI Red-Team Audit or Deterministic Eval Harness Sprint.\nOrganization:\nSystem / model surface:\nTarget timeline: '
    ),
    'campus-corporate-workshops': mailto(
      'Campus Cohort License / Corporate AI Workshop Inquiry (INR)',
      'Hi Janmejai,\n\nWe would like to request an invoice or date options for Campus Bulk Licensing / Corporate AI Literacy Workshop.\nInstitution or Company:\nEstimated seats / participants:\nPreferred dates: '
    ),
  },
  globalMor: {
    'inference-compendium': mailto(
      'INFERENCE 2027 — Full Edition or Domain Module (USD)',
      'Hi Janmejai and Chaitanya,\n\nI would like to purchase INFERENCE 2027 (Full 36-Unit Edition $49 / Domain Track $19 / Accelerator $79).\nPreferred tier: '
    ),
    'bschool-interview-dossier': mailto(
      'B-School AI & Business Interview Dossier — Individual Pack ($19 USD)',
      'Hi Janmejai,\n\nI would like to purchase the B-School AI & Business Interview Dossier (708-Story Vault + NotebookLM Audio/Slide Pack, $19 USD).\nTarget role / domain: '
    ),
    'enterprise-claims-pack': mailto(
      'Enterprise AI Claims & Autopsy Intelligence Pack — Annual Pass ($129/yr USD)',
      'Hi Janmejai,\n\nI would like to order the Enterprise AI Claims & Autopsy Intelligence Pack (Individual Analyst Pass $129/yr or Team 5-Seat $399/yr).\nOrganization & role: '
    ),
    'red-team-eval-sprints': mailto(
      'Advisory Sprint Inquiry — AI Red-Teaming & Deterministic Eval Harness (USD)',
      'Hi Janmejai,\n\nWe would like to scope an AI Red-Team Audit or Deterministic Eval Harness Sprint.\nOrganization:\nSystem / model surface:\nTarget timeline: '
    ),
    'campus-corporate-workshops': mailto(
      'Campus Cohort License / Corporate AI Workshop Inquiry (USD)',
      'Hi Janmejai,\n\nWe would like to request a quote or date options for Campus Bulk Licensing / Corporate AI Literacy Workshop.\nInstitution or Company:\nEstimated seats / participants:\nPreferred dates: '
    ),
  },
} as const;

export const BUYER_SEGMENTS: BuyerSegment[] = [
  {
    id: 'all',
    label: 'All buyers',
    roleSummary: 'Complete catalog across individual study, campus cohorts, and enterprise teams.',
    accent: 'ochre',
  },
  {
    id: 'mba-candidate',
    label: 'MBA Candidate',
    roleSummary: 'SIP, Finals, and lateral case prep grounded in domain unit economics and 708 news angles.',
    accent: 'ochre',
  },
  {
    id: 'ai-engineer-pm',
    label: 'AI Engineer & PM',
    roleSummary: 'Inference cost math, deterministic eval harnesses, and primary-source deployment evidence.',
    accent: 'mizu',
  },
  {
    id: 'campus-placecom',
    label: 'Campus PlaceCom',
    roleSummary: 'Cohort seat packs (50–600 seats) with custom stamps, single invoices, and live Q&A.',
    accent: 'moss',
  },
  {
    id: 'enterprise-vp',
    label: 'Enterprise VP Engineering',
    roleSummary: 'Adversarial red-teaming, CI eval gates, claims intelligence, and executive workshops.',
    accent: 'hanko',
  },
];

export const PRODUCTS: ProductItem[] = [
  {
    id: 'inference-compendium',
    slug: 'inference',
    streamLabel: 'Flagship Compendium · Stream 2',
    name: 'INFERENCE 2027 Full Edition & 7 Domain Modules',
    badge: '150,033 words · 36 units',
    tagline:
      'Applied AI architecture, P&L unit economics, and statutory compliance across 7 business domains.',
    description:
      'Co-authored by Janmejai Singh Minhas and Chaitanya Sharma. Moves cleanly from token and KV-cache mechanics to worked casebooks in Consulting, Finance, Product, Marketing, Operations, and HR, backed by 178 primary sources and 34 vector diagrams.',
    accent: 'ochre',
    schemaType: 'Product',
    buyerSegments: ['mba-candidate', 'ai-engineer-pm', 'campus-placecom'],
    priceInr: 1999,
    priceUsd: 49,
    priceInrLabel: '₹1,999',
    priceUsdLabel: '$49',
    cadenceLabel: 'Full Edition · Domain Modules from ₹499 / $19',
    sourceBasis: '36 units · 7 domains · 116-term glossary · 178 primary sources',
    deliverables: [
      'Full 36-unit edition (A4 watermarked PDF + Private Web Reader) or single domain module',
      '6 worked domain casebooks + quarterly State of Play & India DPDP / RBI FREE-AI inserts',
      'Placement Accelerator option adds 116-term Anki deck, 25 scoring rubrics, and audio briefings',
      '14-day 100% upgrade credit from any Individual Domain Track to the Full Edition',
    ],
    subTiers: [
      {
        id: 'domain-track',
        label: 'Individual Domain Module',
        priceInrLabel: '₹499',
        priceUsdLabel: '$19',
        note: '1 domain track + Foundations primer',
      },
      {
        id: 'full-edition',
        label: 'Full 36-Unit Edition',
        priceInrLabel: '₹1,999',
        priceUsdLabel: '$49',
        note: 'All 7 domains + 1-yr Insert updates',
      },
      {
        id: 'placement-accelerator',
        label: 'Placement Accelerator',
        priceInrLabel: '₹3,499',
        priceUsdLabel: '$79',
        note: 'Full Edition + Anki + 25 drills + audio',
      },
    ],
    trustFirewall:
      'Zero vendor placements. Five full units and the 116-term glossary stay permanently open to read.',
    ctaLabelInr: 'Buy INFERENCE (₹ INR)',
    ctaLabelUsd: 'Buy INFERENCE ($ USD)',
    primaryRouteLabel: 'Explore /inference/ syllabus',
    secondaryCtaLabel: 'Read 5 free units',
    highlighted: true,
    checkout: {
      razorpayUrl: CHECKOUT_URLS.razorpay['inference-compendium'],
      globalMorUrl: CHECKOUT_URLS.globalMor['inference-compendium'],
      inquiryHref: '/inference/#pricing',
      primaryHref: '/inference/',
      secondaryHref: '/inference/read/',
    },
  },
  {
    id: 'bschool-interview-dossier',
    slug: 'bschool-interview-dossier',
    streamLabel: 'Knowledge Vault · Stream 3',
    name: 'B-School AI & Business Interview Dossier',
    badge: '708-Story Vault + Audio/Slides',
    tagline:
      'Domain-indexed interview briefing pack compiled from 708 verified stories and NotebookLM audio/slide decks.',
    description:
      'Transforms the live B-school daily news corpus into an offline-ready prep vault. Every entry pairs verified commercial numbers across Consulting, Finance, Marketing, Operations, and Product Management with the counter-question interview panels push on.',
    accent: 'mizu',
    schemaType: 'Product',
    buyerSegments: ['mba-candidate', 'campus-placecom'],
    priceInr: 799,
    priceUsd: 19,
    priceInrLabel: '₹799',
    priceUsdLabel: '$19',
    cadenceLabel: 'One-time individual pack · Cohort packs via /inference/campus/',
    sourceBasis: '708 news entries in news.json · 5 domains · NotebookLM slide & audio briefings',
    deliverables: [
      'Complete 708-story vault indexed by domain, macro theme, and panel Interview Angle',
      'NotebookLM slide decks & commute-ready audio briefings summarizing sector shifts',
      'Printable WAT / GD / PI rapid-revision sheets with primary-source citations',
      'Instant pairing option with INFERENCE Campus 50-seat and 200-seat cohort packs',
    ],
    trustFirewall:
      'The daily /news/ archive on the web stays 100% free; buyers pay for structured offline indexing, slide decks, and audio synthesis.',
    ctaLabelInr: 'Get Dossier (₹799)',
    ctaLabelUsd: 'Get Dossier ($19)',
    primaryRouteLabel: 'Browse free /news/ vault',
    secondaryCtaLabel: 'Campus cohort packs',
    checkout: {
      razorpayUrl: CHECKOUT_URLS.razorpay['bschool-interview-dossier'],
      globalMorUrl: CHECKOUT_URLS.globalMor['bschool-interview-dossier'],
      inquiryHref: mailto(
        'B-School AI & Business Interview Dossier — Cohort Inquiry',
        'Hi Janmejai,\n\nWe are interested in the B-School Interview Dossier for our club or placement cohort.\nInstitution:\nCohort size: '
      ),
      primaryHref: '/news/',
      secondaryHref: '/inference/campus/',
    },
  },
  {
    id: 'enterprise-claims-pack',
    slug: 'enterprise-claims-intelligence',
    streamLabel: 'Research Intelligence · Stream 6',
    name: 'Enterprise AI Deployment Claims & Autopsy Pack',
    badge: 'Tracker Pro + 132 Articles',
    tagline:
      'Evidence-graded vendor deployment claims, failure autopsies, and quarterly ROI benchmark dossiers.',
    description:
      'Built for enterprise AI buyers, procurement leads, management consultants, and investors who need to separate SEC filings and engineering baselines from marketing announcements.',
    accent: 'indigo',
    schemaType: 'Product',
    buyerSegments: ['ai-engineer-pm', 'enterprise-vp'],
    priceInr: 9999,
    priceUsd: 129,
    priceInrLabel: '₹9,999',
    priceUsdLabel: '$129',
    cadenceLabel: 'Per year (Individual) · Team 5-seat pack ₹34,999 / $399 per year',
    sourceBasis: 'AI Claims Tracker + 132 applied-AI articles & production autopsies',
    deliverables: [
      'Structured dossier mapping claimed ROI vs primary-source evidence and retraction history',
      'Quarterly benchmark synthesis covering deflection, rollback, and unit-cost realities',
      'Filterable CSV & Notion ledger template for vendor due diligence and build-vs-buy reviews',
      'Compendium cross-links to prompt-caching economics and deterministic CI gate patterns',
    ],
    subTiers: [
      {
        id: 'analyst-pass',
        label: 'Individual Analyst Pass',
        priceInrLabel: '₹9,999/yr',
        priceUsdLabel: '$129/yr',
        note: 'Single-seat quarterly dossier + CSV/Notion export',
      },
      {
        id: 'team-pack',
        label: 'Team / Procurement Pack',
        priceInrLabel: '₹34,999/yr',
        priceUsdLabel: '$399/yr',
        note: '5 seats + executive diligence briefing memo',
      },
    ],
    trustFirewall:
      'Verdict grades are locked to primary evidence criteria; no vendor can pay to amend, suppress, or preview a tracker entry.',
    ctaLabelInr: 'Order Analyst Pass (₹9,999/yr)',
    ctaLabelUsd: 'Order Analyst Pass ($129/yr)',
    primaryRouteLabel: 'Inspect public /tracker/',
    secondaryCtaLabel: 'Read /blog/ autopsies',
    checkout: {
      razorpayUrl: CHECKOUT_URLS.razorpay['enterprise-claims-pack'],
      globalMorUrl: CHECKOUT_URLS.globalMor['enterprise-claims-pack'],
      inquiryHref: mailto(
        'Enterprise AI Claims Pack — 5-Seat Team License Inquiry',
        'Hi Janmejai,\n\nWe would like to license the 5-Seat Team Enterprise AI Claims & Autopsy Intelligence Pack.\nCompany:\nTeam function: '
      ),
      primaryHref: '/tracker/',
      secondaryHref: '/blog/',
    },
  },
  {
    id: 'red-team-eval-sprints',
    slug: 'advisory-sprints',
    streamLabel: 'B2B Advisory · Stream 1',
    name: 'AI Red-Teaming & Deterministic Eval Harness Sprints',
    badge: 'Fixed-Scope B2B Sprints',
    tagline:
      'Adversarial frontier model breaks and CI trajectory gates for BFSI, fintech, and enterprise AI teams.',
    description:
      'Direct technical advisory led by Janmejai Singh Minhas, grounded in Gray Swan #352 global red-teaming rank (36 unique breaks), American Express credit-risk model validation, and the deterministic wAIbi-sabi verification harness.',
    accent: 'hanko',
    schemaType: 'Service',
    buyerSegments: ['enterprise-vp', 'ai-engineer-pm'],
    priceInr: 250000,
    priceUsd: 4000,
    priceInrLabel: '₹2,50,000',
    priceUsdLabel: '$4,000',
    cadenceLabel: '2–4 week sprints (₹2.5L–₹6L / $4k–$10k) · Retainers from ₹2L/mo',
    sourceBasis: 'Gray Swan #352 (36 breaks) · AmEx Credit Risk · registry/gate/repair harness',
    deliverables: [
      '2-Week Adversarial Red-Team & Guardrail Audit with reproducible exploit transcript ledger',
      'Deterministic Eval & Trajectory Gate Sprint replacing flaky LLM-as-judge checks in CI',
      'Token, prompt-caching, and retry-loop unit-cost audit for agentic workflows',
      'Strict NDA firewall keeping all client architectures and findings offline and confidential',
    ],
    trustFirewall:
      'Strict NDA firewall: client systems never appear in wAIbi-sabi articles, and consulting clients are excluded from unlabelled /tracker/ mentions.',
    ctaLabelInr: 'Book Advisory Scope (₹ INR)',
    ctaLabelUsd: 'Book Advisory Scope ($ USD)',
    primaryRouteLabel: 'Open /advisory/ briefing',
    secondaryCtaLabel: 'Review /about/ credentials',
    highlighted: true,
    checkout: {
      razorpayUrl: CHECKOUT_URLS.razorpay['red-team-eval-sprints'],
      globalMorUrl: CHECKOUT_URLS.globalMor['red-team-eval-sprints'],
      inquiryHref: '/advisory/#scoping',
      primaryHref: '/advisory/',
      secondaryHref: '/about/',
    },
  },
  {
    id: 'campus-corporate-workshops',
    slug: 'campus-and-corporate-workshops',
    streamLabel: 'Institutional & L&D · Streams 3 & 4',
    name: 'Campus & Corporate AI Literacy Workshops',
    badge: 'PlaceComs & Enterprise L&D',
    tagline:
      'Cohort seat licensing for B-school placement cells alongside executive half-day and full-day AI workshops.',
    description:
      'Equips 50–600 student placement cohorts with INFERENCE and the 708-story interview dossier, or trains enterprise L&D, product, and risk teams on agent unit economics, RAG hallucination audits, and human-in-the-loop governance.',
    accent: 'moss',
    schemaType: 'Service',
    buyerSegments: ['campus-placecom', 'enterprise-vp'],
    priceInr: 45000,
    priceUsd: 1250,
    priceInrLabel: '₹45,000',
    priceUsdLabel: '$1,250',
    cadenceLabel: 'Campus 50–200 seats (₹45k–₹1.4L) · Corporate Workshops ₹1.25L–₹4L',
    sourceBasis: 'INFERENCE 36 units · 708 news entries · 15+ prior technical workshops',
    deliverables: [
      'Campus 50-seat (₹45,000 / $1,250) and 200-seat (₹1,40,000 / $3,900) PlaceCom packs',
      'Half-day executive briefing (₹1.25L–₹2L / $1.5k–$2.5k) for up to 30 leaders',
      'Full-day custom enterprise workshop + INFERENCE cohort seats (₹2.5L–₹4L / $3k–$5k)',
      'Single GST-compliant invoice, coordinator seat ledger, and live case Q&A session',
    ],
    trustFirewall:
      'Corporate workshops teach exclusively from public primary-sourced autopsies; internal company workflows discussed in Q&A remain confidential.',
    ctaLabelInr: 'Request Cohort / Workshop (₹ INR)',
    ctaLabelUsd: 'Request Cohort / Workshop ($ USD)',
    primaryRouteLabel: 'Campus licensing (/inference/campus/)',
    secondaryCtaLabel: 'Corporate workshops (/advisory/)',
    checkout: {
      razorpayUrl: CHECKOUT_URLS.razorpay['campus-corporate-workshops'],
      globalMorUrl: CHECKOUT_URLS.globalMor['campus-corporate-workshops'],
      inquiryHref: '/inference/campus/',
      primaryHref: '/inference/campus/',
      secondaryHref: '/advisory/#packages',
    },
  },
];

export const ECOSYSTEM_NODES: EcosystemNode[] = [
  {
    id: 'eco-inference',
    sourceLabel: 'Free Reading Hub & 116-Term Glossary',
    sourceMetric: '5 open units + 116 definitions',
    sourceHref: '/inference/read/',
    productName: 'INFERENCE 2027 Full Edition & Modules',
    productHref: '/inference/',
    bridgeSummary:
      'Readers verify depth in Ch 00, Ch 01, Inserts A & B, and Case 01, then upgrade to a single domain track or all 36 units.',
    accent: 'ochre',
  },
  {
    id: 'eco-news',
    sourceLabel: 'Daily B-School Interview Archive',
    sourceMetric: '708 structured entries',
    sourceHref: '/news/',
    productName: 'B-School Interview Dossier + Campus Bulk',
    productHref: '/inference/campus/',
    bridgeSummary:
      'Daily stories stay free on /news/. Offline domain-indexed dossiers, NotebookLM audio/slide decks, and PlaceCom packs serve cohort prep.',
    accent: 'mizu',
  },
  {
    id: 'eco-tracker',
    sourceLabel: 'AI Deployment Claims Tracker & Articles',
    sourceMetric: '132 articles + graded claims',
    sourceHref: '/tracker/',
    productName: 'Enterprise AI Claims & Autopsy Pack',
    productHref: '#enterprise-claims-pack',
    bridgeSummary:
      'Public claim audits establish primary-source rigor; procurement and investor teams license the quarterly benchmark dossier and export.',
    accent: 'indigo',
  },
  {
    id: 'eco-harness',
    sourceLabel: 'Deterministic Publishing Harness & Red-Team Ledger',
    sourceMetric: 'Gray Swan #352 + CI gates',
    sourceHref: '/about/',
    productName: 'AI Red-Teaming & Eval Harness Advisory',
    productHref: '/advisory/',
    bridgeSummary:
      'Public engineering autopsies and the open-source verification harness act as live proof-of-work for fixed-scope B2B audit sprints.',
    accent: 'hanko',
  },
];

export const ADVISORY_PROOF_METRICS: AdvisoryProofMetric[] = [
  {
    id: 'grayswan-rank',
    value: '#352',
    label: 'Gray Swan global rank',
    detail: '36 unique frontier model breaks across 414 verified adversarial submissions.',
    accent: 'hanko',
  },
  {
    id: 'amex-risk',
    value: 'AmEx',
    label: 'Credit risk modelling',
    detail: 'Core Business Card portfolio rating models, variable pipeline audits, and zero-hallucination validation RAG.',
    accent: 'plum',
  },
  {
    id: 'waibi-harness',
    value: '3-Stage',
    label: 'Deterministic CI harness',
    detail: 'Production registry.mjs, gate.mjs, and surgical repair.mjs verification rejecting unflagged churn.',
    accent: 'mizu',
  },
  {
    id: 'research-rigor',
    value: 'IF 8.6',
    label: 'Peer-reviewed empirical rigor',
    detail: 'Published in Elsevier Expert Systems with Applications (96% diagnostic accuracy) and Springer.',
    accent: 'moss',
  },
];

export const ADVISORY_PACKAGES: AdvisoryPackage[] = [
  {
    id: 'red-team-audit',
    badge: 'Package 01 · Offensive Testing',
    name: '2-Week Red-Team Audit',
    duration: '2 weeks · Fixed scope',
    accent: 'hanko',
    priceInr: 250000,
    priceUsd: 4000,
    priceInrLabel: '₹2,50,000',
    priceUsdLabel: '$4,000',
    rangeInrLabel: '₹2.5L – ₹4.5L scoped by tool surface',
    rangeUsdLabel: '$4,000 – $7,500 scoped by tool surface',
    cadenceLabel: 'Fixed-fee 2-week sprint',
    audience: 'BFSI, fintech, and SaaS teams shipping customer-facing LLMs or tool-calling agents.',
    summary:
      'Systematic adversarial probing drawn from Gray Swan frontier red-teaming discipline: prompt injection, indirect RAG poisoning, tool-call privilege escalation, and policy bypasses.',
    deliverables: [
      'Threat model mapping system prompts, tool schemas, RAG boundaries, and PII sinks',
      'Minimum 150 targeted adversarial probes across single-turn and multi-turn trajectories',
      'Reproducible exploit transcript ledger graded by severity and blast radius',
      'Concrete guardrail patch specifications + one post-remediation verification sweep',
    ],
    ctaLabel: 'Scope 2-Week Red-Team Audit',
    inquirySubjectInr: 'Advisory Inquiry — 2-Week Red-Team Audit (INR 2.5L+)',
    inquirySubjectUsd: 'Advisory Inquiry — 2-Week Red-Team Audit ($4,000+)',
  },
  {
    id: 'eval-harness-sprint',
    badge: 'Package 02 · CI & Guardrails',
    name: 'Deterministic Eval Sprint',
    duration: '3–4 weeks · Fixed scope',
    accent: 'mizu',
    priceInr: 400000,
    priceUsd: 6500,
    priceInrLabel: '₹4,00,000',
    priceUsdLabel: '$6,500',
    rangeInrLabel: '₹3.5L – ₹6.0L scoped by pipeline count',
    rangeUsdLabel: '$6,000 – $10,000 scoped by pipeline count',
    cadenceLabel: 'Fixed-fee 3–4 week sprint · Optional ₹2L–₹4.5L/mo retainer',
    audience: 'VP Engineering and AI Platform leads tired of flaky LLM-as-judge evals and silent regressions.',
    summary:
      'Adapts the wAIbi-sabi registry -> gate -> surgical repair architecture to your production agent or RAG pipeline, locking rules into versioned code and CI merge gates.',
    deliverables: [
      'Single-source rule registry covering schema, citation grounding, latency, and token budgets',
      'Deterministic trajectory and output gates running in GitHub Actions before deployment',
      'Bounded self-repair verification preventing unflagged regressions across prompt edits',
      'Prompt-caching and model-cascade cost audit eliminating wasteful retry loops',
    ],
    highlighted: true,
    ctaLabel: 'Scope Deterministic Eval Sprint',
    inquirySubjectInr: 'Advisory Inquiry — Deterministic Eval Sprint (INR 3.5L–6L)',
    inquirySubjectUsd: 'Advisory Inquiry — Deterministic Eval Sprint ($6,000–$10,000)',
  },
  {
    id: 'executive-workshop',
    badge: 'Package 03 · Leadership & L&D',
    name: 'Executive Half-Day AI Workshop',
    duration: '3.5 hours · Up to 30 leaders',
    accent: 'ochre',
    priceInr: 150000,
    priceUsd: 2000,
    priceInrLabel: '₹1,50,000',
    priceUsdLabel: '$2,000',
    rangeInrLabel: '₹1.25L – ₹2.0L half-day · ₹2.5L – ₹4.0L full-day + INFERENCE pack',
    rangeUsdLabel: '$1,500 – $2,500 half-day · $3,000 – $5,000 full-day + INFERENCE pack',
    cadenceLabel: 'Half-day virtual or on-site briefing',
    audience: 'L&D heads, product leadership, and risk/compliance committees at enterprises and GCCs.',
    summary:
      'Live technical and P&L teardown grounded in verified public deployments: why 40% of agentic projects stall, RAG hallucination economics, and RBI/DPDP governance design.',
    deliverables: [
      'Pre-session audit of 2 public/sector case benchmarks relevant to your industry',
      '3.5-hour interactive briefing with live prompt-caching & eval gate demonstrations',
      'Executive decision rubric for build-vs-buy, vendor claim verification, and HITL gates',
      'Digital INFERENCE executive extracts for all attendees (full cohort bundle on full-day tier)',
    ],
    ctaLabel: 'Book Executive Workshop',
    inquirySubjectInr: 'Workshop Inquiry — Executive Half-Day AI Briefing (INR 1.5L)',
    inquirySubjectUsd: 'Workshop Inquiry — Executive Half-Day AI Briefing ($2,000)',
  },
];

export const ADVISORY_HARNESS_PILLARS: AdvisoryHarnessPillar[] = [
  {
    id: 'pillar-registry',
    modulePath: 'site/harness/registry.mjs',
    title: 'One versioned rule registry',
    accent: 'ochre',
    summary:
      'Every cap, failure code, routing rule, and retry limit lives in a single plain-data module that regenerates downstream runtime contracts and checks for drift in CI.',
    clientTranslation:
      'In client engagements, your policy limits, tool permissions, and PII constraints move out of scattered system prompts into one auditable contract.',
  },
  {
    id: 'pillar-gate',
    modulePath: 'site/scripts/lib/gate.mjs',
    title: 'Deterministic pre-release gates',
    accent: 'mizu',
    summary:
      'Every output runs through pure-function structural, citation, and formatting gates (gateBody and gateSheetDraft) producing exact section-level failure codes.',
    clientTranslation:
      'Replaces probabilistic vibe-checks with fast, repeatable assertions on JSON schemas, primary-source grounding, and forbidden tool arguments.',
  },
  {
    id: 'pillar-repair',
    modulePath: 'site/scripts/lib/repair.mjs',
    title: 'Bounded surgical repair & escalation',
    accent: 'hanko',
    summary:
      'verifyRepair() checks both before and after states, blocks repairs that touch unflagged sections or introduce new defects, and escalates to humans after 4 attempts.',
    clientTranslation:
      'Prevents agent retry loops from silently corrupting valid state or burning runaway API spend before human sign-off.',
  },
];

export const PRODUCTS_FAQS: FaqEntry[] = [
  {
    question: 'Why are some wAIbi-sabi resources free while others are paid?',
    answer:
      'All 132+ applied-AI articles, the daily 708-story /news/ archive, the /tracker/ claims ledger, the Prompt Caching Calculator, 5 INFERENCE units, and the 116-term glossary remain free on the web. Paid products package structured offline editions, domain casebooks, audio/slide vaults, institutional seat licenses, and direct engineering advisory.',
  },
  {
    question: 'How do India (INR) and Global (USD) checkouts work?',
    answer:
      'Domestic Indian buyers check out in INR (supporting UPI, cards, and GST-compliant institutional invoices via Razorpay or direct invoice). International buyers pay in USD through Merchant-of-Record rails that handle VAT and sales-tax compliance automatically.',
  },
  {
    question: 'Can a B-school PlaceCom or corporate team bundle multiple products?',
    answer:
      'Yes. Campus 50-seat and 200-seat packs combine INFERENCE with the B-School AI & Business Interview Dossier under one consolidated invoice, and full-day corporate workshops include INFERENCE cohort licenses for participating leaders.',
  },
];

export const ADVISORY_FAQS: FaqEntry[] = [
  {
    question: 'How does the editorial NDA firewall protect advisory clients?',
    answer:
      'Client engagements are governed by strict mutual NDA. Vulnerabilities, prompts, model telemetry, and internal architectures reviewed during an audit never appear in wAIbi-sabi articles or Case Studies. Conversely, any vendor engaging paid advisory is barred from unlabelled mentions in the /tracker/ ledger.',
  },
  {
    question: 'What happens at the end of a 2-week Red-Team Audit or Eval Sprint?',
    answer:
      'You receive reproducible exploit transcripts or a CI-integrated deterministic eval suite, prioritized remediation guidance, and a post-fix verification sweep. Teams that want ongoing regression coverage as models or prompts evolve can convert to a monthly fractional retainer.',
  },
  {
    question: 'Do you require production customer data to run an audit?',
    answer:
      'No. Audits run against staging endpoints, synthetic or redacted representative records, and explicit tool-call mocks so regulated BFSI and healthcare PII never leaves your perimeter.',
  },
];

export function getProductCheckoutUrl(productId: string, currency: Currency): string {
  const item = PRODUCTS.find((p) => p.id === productId);
  if (!item) return '/products/';
  return currency === 'INR' ? item.checkout.razorpayUrl : item.checkout.globalMorUrl;
}

export function getAdvisoryPackageHref(
  packageId: AdvisoryPackage['id'],
  currency: Currency,
  customNotes?: { org?: string; surface?: string }
): string {
  const pkg = ADVISORY_PACKAGES.find((p) => p.id === packageId);
  if (!pkg) return `mailto:${PRODUCT_CONTACT_EMAIL}`;
  const subject = currency === 'INR' ? pkg.inquirySubjectInr : pkg.inquirySubjectUsd;
  const orgLine = customNotes?.org?.trim() || '[Company / Team]';
  const surfaceLine = customNotes?.surface?.trim() || '[LLM / Agent / RAG system & timeline]';
  const body = [
    'Hi Janmejai,',
    '',
    `We would like to scope: ${pkg.name} (${currency === 'INR' ? pkg.priceInrLabel : pkg.priceUsdLabel}).`,
    `Organization: ${orgLine}`,
    `System & Timeline: ${surfaceLine}`,
    '',
    'Please share available kickoff dates and NDA details.',
  ].join('\n');
  return mailto(subject, body);
}
