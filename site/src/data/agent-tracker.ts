/**
 * Public AI deployment claims, each compared with what the evidence supports.
 * Add a row only when the claim has a primary or named source, and update
 * LAST_REVIEWED when rows are rechecked.
 */
export const LAST_REVIEWED = '2026-11-10';

export const CLAIMS = [
  {
    who: 'Klarna',
    claim: 'An AI assistant handled 2.3 million chats in its first month, did the work of 700 agents, and would add an estimated $40M to 2024 profit.',
    evidence: 'Every figure is first-party. Satisfaction was reported as on par with humans. In May 2025 the CEO said cost had been too predominant and quality suffered, and Klarna began rehiring through a gig model.',
    verdict: 'Partly walked back',
    article: 'klarna-ai-customer-service-graded-honestly',
    sources: [
      ['Klarna press release', 'https://www.klarna.com/international/press/klarna-ai-assistant-handles-two-thirds-of-customer-service-chats-in-its-first-month/'],
      ['Customer Experience Dive', 'https://www.customerexperiencedive.com/news/klarna-reinvests-human-talent-customer-service-AI-chatbot/747586/'],
    ],
  },
  {
    who: 'Commonwealth Bank',
    claim: 'Machine learning played a crucial role in customer fraud losses falling over 20% in July to December 2025.',
    evidence: 'The system description is specific and consistent across three years of disclosures. The 20% cannot be separated from an A$900m-plus programme, new scam rules and an industry-wide fall in losses.',
    verdict: 'Mechanism solid, attribution open',
    article: 'commonwealth-bank-ai-fraud-detection',
    sources: [['CommBank newsroom', 'https://www.commbank.com.au/articles/newsroom/2026/02/cba-approach-to-adopting-ai-report-announcement.html']],
  },
  {
    who: 'Block',
    claim: 'A 50-engineer champions program raised AI-authored code 69% and automated pull requests 21x in three months.',
    evidence: 'The program numbers have a named cohort, window and metrics. Later per-engineer productivity claims have no published method, and one spans a window containing about 4,000 job cuts.',
    verdict: 'Early numbers credible, later ones weak',
    article: 'block-ai-champions-program-goose',
    sources: [['Block Engineering', 'https://engineering.block.xyz/blog/ai-assisted-development-at-block']],
  },
  {
    who: 'Uber',
    claim: 'QueryGPT cuts query authoring from about 10 minutes to about 3.',
    evidence: 'Uber published the design and a baseline, with about 300 daily users in limited release. It published no accuracy rate. The widely repeated 140,000-hours figure is not Uber’s.',
    verdict: 'Accuracy unpublished',
    article: 'uber-querygpt-text-to-sql-case-study',
    sources: [['Uber Engineering', 'https://www.uber.com/en-CA/blog/query-gpt/']],
  },
  {
    who: 'Check Point Research',
    claim: 'Eleven vulnerabilities across six AI agent frameworks, mostly old server bug classes.',
    evidence: 'Disclosed with CVE identifiers and fixed releases, and reported independently.',
    verdict: 'Confirmed',
    article: 'agent-framework-20-year-old-bugs',
    sources: [
      ['Check Point', 'https://blog.checkpoint.com/research/when-your-ai-agents-memory-becomes-a-security-liability/'],
      ['The Register', 'https://www.theregister.com/security/2026/08/05/prompt-injection-isnt-the-bug-ai-agent-frameworks-are/5283585'],
    ],
  },
  {
    who: 'Gartner',
    claim: 'Over 40% of agentic AI projects will be canceled by the end of 2027, and only about 130 agentic vendors are genuine.',
    evidence: 'An analyst forecast. The outcome cannot be tested until 2027.',
    verdict: 'Forecast, untested',
    article: 'enterprise-ai-agent-roi',
    sources: [['Gartner', 'https://www.gartner.com/en/newsroom/press-releases/2025-06-25-gartner-predicts-over-40-percent-of-agentic-ai-projects-will-be-canceled-by-end-of-2027']],
  },
] as const;
