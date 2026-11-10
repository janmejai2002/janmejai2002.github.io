/**
 * Topic hubs: hand-curated reading paths that cut across the five tracks.
 * A track says who a piece is for; a topic says what it is about. A slug that
 * is missing or still a draft is skipped when the page builds.
 */
export const TOPICS = [
  {
    id: 'ai-agents',
    label: 'AI agents',
    question: 'What actually works when AI agents do real work?',
    intro:
      'How agents are built, which protocols connect them, how they get attacked, and what happened when named companies put them in production. Start with the protocol explainers if you are building, or the deployment reviews if you are buying.',
    slugs: [
      'agentic-shift-llms-chat-to-autonomous-actions',
      'what-is-mcp-model-context-protocol',
      'the-agent-protocol-shortlist-is-now-two-mcp-and-a2a',
      'mcp-stateless-spec-2026-migration-guide',
      'dont-build-agents-build-skills',
      'openai-agent-stack-computer-use',
      'why-coding-agents-replace-rag-local-search',
      'agent-memory-filesystem',
      'agent-framework-20-year-old-bugs',
      'cert-in-ai-agent-incident-reporting-vs-safe',
      'enterprise-ai-agent-roi',
      'salesforce-agentforce-autopsy',
      'klarna-ai-customer-service-graded-honestly',
      'block-ai-champions-program-goose',
    ],
  },
  {
    id: 'llm-costs',
    label: 'LLM costs and latency',
    question: 'What does running an LLM actually cost, and where does the time go?',
    intro:
      'Tokens, cache break-even math, model tiers, memory bandwidth and first-token latency, with worked numbers. Pair these with the prompt caching calculator to test your own workload.',
    slugs: [
      'what-is-a-token-ai-billing',
      'budget-ai-costs-per-token-pricing',
      'prompt-caching-scheduled-agent-savings',
      'prefix-caching-agent-harness',
      'claude-model-tiers-opus-sonnet-haiku',
      'fine-tuning-vs-prompting-when',
      'kv-cache-explained',
      'ai-latency-ttft-for-product-teams',
      'gemini-3-7-flash-deepseek-v4-cheap-vision-models',
      'openai-keeps-deleting-models-you-depend-on-here-s-the-archit',
      'duolingo-max-gpt4-autopsy',
    ],
  },
  {
    id: 'ai-basics',
    label: 'How AI models work',
    question: 'How do large language models work, in plain language?',
    intro:
      'The vocabulary you need before the vendor call: tokens, context windows, temperature, retrieval and protocols, each explained from the mechanism up. No machine learning background assumed.',
    slugs: [
      'what-is-a-token-ai-billing',
      'what-a-context-window-is-and-why-it-fills-up',
      'what-is-temperature-in-ai',
      'why-ai-gives-different-answers-every-time',
      'what-is-rag-retrieval-augmented-generation',
      'what-is-mcp-model-context-protocol',
      'fine-tuning-vs-prompting-when',
      'feynman-technique-prompt-engineering-mental-models',
    ],
  },
] as const;

export type Topic = (typeof TOPICS)[number];

export const topicsFor = (slug: string): Topic[] =>
  TOPICS.filter((t) => (t.slugs as readonly string[]).includes(slug));
