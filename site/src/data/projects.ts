export interface ProjectPiece {
  k: string;
  v: string;
}

export interface ProjectTakeaway {
  title: string;
  text: string;
}

export interface ProjectLink {
  href: string;
  label: string;
  external?: boolean;
}

export interface ProjectStat {
  value: string;
  label: string;
}

export interface Project {
  id: string;
  slug: string;
  tag: string;
  title: string;
  category: 'autonomous' | 'red-teaming' | 'intelligence' | 'finance' | 'cv-research' | 'edge';
  categoryLabel: string;
  accent: string;
  wash: string;
  lede: string;
  featured?: boolean;
  status: 'Live' | 'Active Research' | 'Production' | 'Published' | 'Open Source';
  whatItDoes?: string;
  pieces?: ProjectPiece[];
  takeaways?: ProjectTakeaway[];
  deepDiveLink?: {
    href: string;
    label: string;
    note?: string;
  };
  stack?: string[];
  highlights?: string[];
  stats?: ProjectStat[];
  links?: ProjectLink[];
}

export const PROJECT_CATEGORIES = [
  { id: 'all', label: 'All Projects' },
  { id: 'autonomous', label: 'Autonomous Systems' },
  { id: 'red-teaming', label: 'Frontier AI Safety' },
  { id: 'intelligence', label: 'Data & Archives' },
  { id: 'finance', label: 'Financial Engineering' },
  { id: 'cv-research', label: 'Bio-Imaging & CV' },
  { id: 'edge', label: 'Edge & Sovereign' },
] as const;

export const projects: Project[] = [
  {
    id: 'waibi-sabi-os',
    slug: 'waibi-sabi-os',
    tag: '01 · Live · Flagship',
    title: 'This site — a self-writing blog OS',
    category: 'autonomous',
    categoryLabel: 'Autonomous Systems',
    accent: 'var(--mizu)',
    wash: 'var(--wash-mizu)',
    status: 'Live',
    featured: true,
    lede: 'A Notion-controlled content pipeline feeding a static Astro site. Seven scheduled Claude Code & Gemini Spark routines do the research, claim-checking, drafting, and SVG artwork; a single human rating dropdown gates publication.',
    whatItDoes:
      'Every morning an agent searches for what is moving in AI, checks it against everything already covered, researches the strongest angles, and writes each one up as a 100-word pitch in Notion. Anything rated 4 or 5 gets picked up within four hours by a writer agent, which builds a scratch claim ledger with verbatim source quotes, applies an anti-AI filter, and drafts the full article. For reviewed tracks, a GitHub Actions poll opens a PR when approved. For unattended tracks, preflight assertions validate character caps and geometric SVG tokens before committing directly to main. A closed-loop reconciliation script verifies the live HTTP 200 edge before marking the row published in Notion.',
    pieces: [
      {
        k: 'Control plane',
        v: 'Three Notion databases. AI Blog OS Pipeline holds radar ideas (title, pitch, SEO keywords, plus human-only Interest Rating and Remarks). Article Production holds promoted drafts related back to source ideas. Interview News Archive stores daily business intelligence cards.',
      },
      {
        k: 'Hybrid Engine & Cloud Bridge',
        v: 'Local Claude Code scheduled tasks paired with a zero-cost serverless Gemini Spark bridge on Google Cloud. Eliminates the sleeping-PC trap: Gemini Spark and Google Apps Script run serverlessly at 06:00 IST, appending to Google Sheets and waking GitHub Actions without running standing servers.',
      },
      {
        k: 'Prompt Caching & Discipline',
        v: 'Volatility-ordered prompts placing immutable editorial spines and anti-AI rules at the prefix (Volatility 0.0) for 85% TTFT reduction and 90% KV cache savings. Quarantined scratchpads for raw web crawls, returning only compact claim ledgers with verbatim quotes.',
      },
      {
        k: 'Front end & Build Rigor',
        v: 'Astro 5, static output, zero client JS framework. Content collection schemas enforce hard character caps (Title <= 70, Description <= 160, Question <= 120) and mandatory hero alt text. check-build.mjs catches any defect before deployment.',
      },
      {
        k: 'Artwork Engine',
        v: 'Dual-theme SVG generator using semantic CSS placeholder tokens ({{paper}}, {{ink}}, {{mizu}}...) and zero hardcoded hex codes. Validated by XML linting and rasterized into light and dark WebP assets via Sharp.',
      },
      {
        k: 'Closed-Loop Edge Verification',
        v: 'Post-deploy edge verification script fetches the live production URL and asserts the headline exists in the rendered HTML before writing Published, Post URL, and Publish Date back to Notion.',
      },
    ],
    takeaways: [
      {
        title: 'Put the human gate where judgement lives.',
        text: 'The 1-5 rating dropdown on a 100-word pitch is the whole design. Research, drafting, and formatting are cheap to automate; deciding what is worth saying is not.',
      },
      {
        title: 'Make guardrails states, not intentions.',
        text: 'Draft Status = Approved is an enum value no machine routine has credentials or permission to write. A rule in prompt prose drifts; a state barrier does not.',
      },
      {
        title: 'Separate System 1 from System 2.',
        text: 'LLMs are mathematically uncalibrated for character counting or XML validation. Deterministic Node.js scripts handle all syntax and length assertions in sub-10ms; the LLM is reserved strictly for synthesis.',
      },
      {
        title: 'Only use credentials that cannot expire.',
        text: 'Unattended routines firing at 07:10 cannot depend on expired browser sessions or OAuth tokens requiring human re-login. That constraint dictated the entire serverless bridge.',
      },
      {
        title: 'Quarantine raw context and require verbatim receipts.',
        text: 'Raw web crawls belong in ephemeral scratch files, never the prompt context. Every claim must quote the exact source sentence verbatim before inclusion.',
      },
    ],
    deepDiveLink: {
      href: '/blog/how-this-blog-builds-itself/',
      label: 'Read the deep architectural walkthrough →',
      note: 'Includes four architecture diagrams, the serverless cloud bridge, token budget models, and full state machine specifications.',
    },
    stack: ['Claude Code', 'Gemini Spark', 'Notion API', 'Astro 5', 'GitHub Actions', 'Sharp WebP'],
    stats: [
      { value: '31+', label: 'Live Articles' },
      { value: '5', label: 'Editorial Tracks' },
      { value: '0', label: 'Standing Server Cost' },
      { value: '100%', label: 'Human-Gated' },
    ],
    links: [
      { href: '/blog/how-this-blog-builds-itself/', label: 'Architecture Walkthrough' },
      { href: '/status/', label: 'Live Pipeline Status' },
    ],
  },
  {
    id: 'frontier-red-teaming',
    slug: 'frontier-red-teaming',
    tag: '02 · Active Research',
    title: 'Frontier AI Red Teaming & Jailbreak Defense',
    category: 'red-teaming',
    categoryLabel: 'Frontier AI Safety',
    accent: 'var(--hanko)',
    wash: 'var(--wash-hanko)',
    status: 'Active Research',
    lede: '36 unique breaks on the Gray Swan Arena, covering prompt injection, persona hijacking, and multi-turn safeguard evasion across frontier LLMs. Ranked top 15% globally across safeguard evasion leaderboards.',
    stack: ['Gray Swan Arena', 'HarmBench', 'Indirect Prompt Injection', 'Context Quarantine', 'Safety Sandboxing'],
    metrics: [
      { value: '36', label: 'Verified Model Breaks' },
      { value: '#59', label: 'Global Rank (Indirect Injection)' },
      { value: '#85', label: 'Global Rank (Q1 2026)' },
    ],
    highlights: [
      'Discovered indirect prompt injection vulnerabilities via poisoned RAG chunks, multi-modal payload steganography, and markdown image rendering exploits.',
      'Identified recursive meta-framing drift: where reasoning models bypass safety boundaries when instructions are layered as hypothetical research roleplays.',
      'Formulated transferable defensive system patterns: context quarantine, asymmetric verification, and dual-kernel execution barriers.',
    ],
    links: [
      { href: '/about/', label: 'View Colophon & Benchmarks' },
    ],
  },
  {
    id: 'interview-news-archive',
    slug: 'interview-news-archive',
    tag: '03 · Live Archive',
    title: 'Interview News Archive — MBA Business Intelligence',
    category: 'intelligence',
    categoryLabel: 'Data & Archives',
    accent: 'var(--ochre)',
    wash: 'var(--wash-ochre)',
    status: 'Live',
    lede: 'A daily business-news intelligence archive for Indian B-school placement preparation (IIM / XLRI) — 600+ vetted case digests across Consulting, Finance, Product, Operations, and Marketing, each paired with the exact pressure question an interviewer would push on.',
    stack: ['Gemini Spark', 'Google Sheets Bridge', 'Notion DB', 'Astro SSR-Free Search', 'GitHub Actions'],
    metrics: [
      { value: '603+', label: 'Vetted Case Studies' },
      { value: '5', label: 'Core MBA Tracks' },
      { value: 'Daily', label: 'Cloud Feeder Sync' },
    ],
    highlights: [
      'Serverless ingestion loop: Gemini Spark runs in the cloud, appends high-signal MBA stories to Google Sheets, auto-reconciles with Notion, and commits directly to git.',
      'Zero-JS-framework client-side filtering and instant search across 600+ entries without performance degradation.',
      'Each entry pairs macroeconomic facts with an aggressive interviewer cross-examination angle to prepare candidates for high-stress placement rounds.',
    ],
    links: [
      { href: '/news/', label: 'Explore the Archive' },
    ],
  },
  {
    id: 'amex-credit-risk-rag',
    slug: 'amex-credit-risk-rag',
    tag: '04 · Production Systems',
    title: 'Credit Risk Variable Engineering & Model RAG',
    category: 'finance',
    categoryLabel: 'Financial Engineering',
    accent: 'var(--plum)',
    wash: 'var(--wash-plum)',
    status: 'Production',
    lede: 'Improved credit risk rating models covering short- and long-term default horizons for the Business Card Member portfolio at American Express. Architected custom hallucination-suppressed RAG systems against dense internal risk model manuals.',
    stack: ['Python', 'Credit Risk Modelling', 'Liquidity Models', 'RAG Architecture', 'Model Governance'],
    metrics: [
      { value: 'Amex', label: 'Credit Risk Function' },
      { value: 'Dual', label: 'Short & Long Horizon Models' },
      { value: '0-Hallucination', label: 'Internal Model GPT' },
    ],
    highlights: [
      'Re-engineered variable design practices for structural and liquidity risk models, achieving predictive performance gains through variable formulation rather than model complexity.',
      'Built custom internal retrieval systems that answer questions against hundreds of pages of mathematical model specifications with 100% source attribution.',
      'Gained deep institutional grounding in the closed-loop card network, interchange dynamics, and risk appetite mechanics.',
    ],
    links: [
      { href: '/about/', label: 'Read Background in About' },
    ],
  },
  {
    id: 'clinical-deep-learning',
    slug: 'clinical-deep-learning',
    tag: '05 · Peer-Reviewed Research',
    title: 'Deep Learning for Clinical Computer Vision & Bio-Imaging',
    category: 'cv-research',
    categoryLabel: 'Bio-Imaging & CV',
    accent: 'var(--moss)',
    wash: 'var(--wash-moss)',
    status: 'Published',
    lede: 'Peer-reviewed deep learning frameworks for automated ocular and radiological diagnosis published in Elsevier and Springer. Led teams of ~20 interns across computer-aided diagnosis research pipelines.',
    stack: ['PyTorch', 'Computer Vision', 'OCT Imaging', 'Cephalometric X-Ray', 'Clinical AI'],
    metrics: [
      { value: '8.6', label: 'Elsevier ESWA Impact Factor' },
      { value: '3.6', label: 'Springer MTA Impact Factor' },
      { value: '~20', label: 'Interns Mentored' },
    ],
    highlights: [
      'Fused feature representation framework for automated glaucoma diagnosis from Optical Coherence Tomography (OCT) images (published in Expert Systems with Applications).',
      'Novel noise-reduction and feature enhancement architectures for cephalometric radiography (Multimedia Tools and Applications).',
      'Developed segmentation models for pancreatic tumor identification from abdominal CT scans and COVID-19 pulmonary lesion detection.',
    ],
    links: [
      { href: '/about/', label: 'View Academic Publications' },
    ],
  },
  {
    id: 'pocketcloud-edge',
    slug: 'pocketcloud-edge',
    tag: '06 · Edge Architecture',
    title: 'PocketCloud Sovereign Edge Engine',
    category: 'edge',
    categoryLabel: 'Edge & Sovereign',
    accent: 'var(--indigo)',
    wash: 'var(--wash-indigo)',
    status: 'Active Research',
    lede: 'Sovereign serverless edge execution engine running WebAssembly guest modules across local hardware (Android Snapdragon 8 Gen and Windows Lunar Lake laptop) with zero cloud dependency.',
    stack: ['WebAssembly (Wasm)', 'Lunar Lake NPU', 'Edge Serverless', 'Rust / TypeScript', 'Zero-Cloud'],
    metrics: [
      { value: '0ms', label: 'Cloud Latency' },
      { value: 'Wasm', label: 'Sandboxed Guest Modules' },
      { value: '100%', label: 'Local Sovereignty' },
    ],
    highlights: [
      'Sandboxed, memory-bounded serverless runtime operating directly on edge nodes without public cloud ingress or recurring egress bills.',
      'Hardware-accelerated local vector embedding and cosine similarity ranking utilizing Intel Lunar Lake NPU 4000 via Level Zero / ONNX Runtime.',
      'Resilient webhook receivers (PockHook) and event queues for autonomous offline-first workflows.',
    ],
    links: [
      { href: '/about/', label: 'Learn More in About' },
    ],
  },
];
