/**
 * Links the first mention of a known concept to the article that explains it.
 *
 * Done at build time rather than in the markdown so that every post the Notion
 * pipeline publishes gets the same treatment with nobody remembering to do it.
 * The rules keep it readable: at most MAX_LINKS per article, one link per
 * target, never a link to the article itself or to a draft, and nothing inside
 * headings, code, existing links, the TL;DR plate or the Sources section.
 */
import { existsSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const BLOG = fileURLToPath(new URL('../src/content/blog/', import.meta.url));
const MAX_LINKS = 5;

// [pattern, target slug]. Order is priority: specific phrases come first.
const TERMS = [
  [/\bKV cache\b/, 'kv-cache-explained'],
  [/\bprefix cach(?:e|ing)\b/i, 'prefix-caching-agent-harness'],
  [/\bprompt caching\b/i, 'prompt-caching-scheduled-agent-savings'],
  [/\bcontext windows?\b/i, 'what-a-context-window-is-and-why-it-fills-up'],
  [/\b(?:time to first token|TTFT)\b/i, 'ai-latency-ttft-for-product-teams'],
  [/\bModel Context Protocol\b|\bMCP\b/, 'what-is-mcp-model-context-protocol'],
  [/\bA2A\b/, 'the-agent-protocol-shortlist-is-now-two-mcp-and-a2a'],
  [/\bretrieval[- ]augmented generation\b|\bRAG\b/i, 'what-is-rag-retrieval-augmented-generation'],
  [/\bnon-?determinis(?:m|tic)\b/i, 'why-ai-gives-different-answers-every-time'],
  [/\btemperature (?:zero|0|setting)\b/i, 'what-is-temperature-in-ai'],
  [/\bfine-tuning\b/i, 'fine-tuning-vs-prompting-when'],
  [/\bper-token pricing\b|\btoken-based pricing\b/i, 'budget-ai-costs-per-token-pricing'],
  [/\b(?:input|output) tokens\b/i, 'what-is-a-token-ai-billing'],
  [/\bprompt injection\b/i, 'agent-framework-20-year-old-bugs'],
  [/\bagent washing\b/i, 'enterprise-ai-agent-roi'],
  [/\bagent memory\b/i, 'agent-memory-filesystem'],
  [/\bagentic AI\b/i, 'agentic-shift-llms-chat-to-autonomous-actions'],
  [/\bcoding agents?\b/i, 'why-coding-agents-replace-rag-local-search'],
  [/\bvector databases?\b/i, 'why-coding-agents-replace-rag-local-search'],
  [/\baccessibility trees?\b/i, 'openai-agent-stack-computer-use'],
  [/\bmodel deprecations?\b/i, 'openai-keeps-deleting-models-you-depend-on-here-s-the-archit'],
  [/\bAI Overviews\b/, 'ai-overviews-traffic-loss-measure-your-own'],
  [/\bgenerative engine optimi[sz]ation\b|\bGEO\b/, 'optimising-for-ai-what-works-repackaged-seo'],
  [/\boutcome-based (?:pricing|fees)\b/i, 'mckinsey-outcome-based-pricing-billable-hour'],
  [/\bCERT-In\b/, 'cert-in-ai-agent-incident-reporting-vs-safe'],
  [/\bEU AI Act\b/, 'eu-ai-act-timeline-chatgpt-kratsios'],
  [/\bKlarna\b/, 'klarna-ai-customer-service-graded-honestly'],
  [/\bAgentforce\b/, 'salesforce-agentforce-autopsy'],
  [/\bDuolingo Max\b/, 'duolingo-max-gpt4-autopsy'],
  [/\bCommonwealth Bank\b/, 'commonwealth-bank-ai-fraud-detection'],
  [/\bQueryGPT\b/, 'uber-querygpt-text-to-sql-case-study'],
  [/\bAgent Skills\b/, 'dont-build-agents-build-skills'],
  [/\bFeynman technique\b/i, 'feynman-technique-prompt-engineering-mental-models'],
  [/\bprompt engineering\b/i, 'feynman-technique-prompt-engineering-mental-models'],
  [/\btool (?:definitions|schemas)\b/i, 'prefix-caching-agent-harness'],
  [/\btext-to-SQL\b/i, 'uber-querygpt-text-to-sql-case-study'],
  [/\bcustomer (?:service|support) (?:agents?|automation|chatbots?)\b/i, 'klarna-ai-customer-service-graded-honestly'],
  [/\bdeflection\b/i, 'salesforce-agentforce-autopsy'],
  [/\bfraud (?:detection|losses)\b/i, 'commonwealth-bank-ai-fraud-detection'],
  [/\b(?:AI pilots?|stalled pilots?)\b/i, 'the-95-percent-number'],
  [/\bgraduate (?:hiring|recruitment|jobs)\b/i, 'the-big-four-blame-ai-for-the-graduate-hiring-cuts-the-wider'],
  [/\bbillable hours?\b/i, 'mckinsey-outcome-based-pricing-billable-hour'],
  [/\bAI agents?\b/, 'agentic-shift-llms-chat-to-autonomous-actions'],
  [/\bAI agent ROI\b|\bagent projects?\b/i, 'enterprise-ai-agent-roi'],
  [/\bAI Act\b/, 'eu-ai-act-timeline-chatgpt-kratsios'],
  [/\bincident reporting\b/i, 'cert-in-ai-agent-incident-reporting-vs-safe'],
  [/\bsafe harbou?r\b/i, 'it-rules-2026-ai-takedown-compliance'],
  [/\bsuperintelligence\b/i, 'musk-yc-ai-startup-school-talk'],
  [/\b(?:epistemic |model )?uncertainty\b/i, 'ai-uncertainty-ghahramani-deepmind-podcast'],
  [/\bfoundation models?\b/i, 'eeg-foundation-models-generalization-subject-identity'],
  [/\bvision models?\b/i, 'gemini-3-7-flash-deepseek-v4-cheap-vision-models'],
  [/\bdeprecat(?:ed|ion|ions)\b/i, 'openai-keeps-deleting-models-you-depend-on-here-s-the-archit'],
  [/\bAI search\b|\bsearch rankings?\b|\bSEO\b/, 'optimising-for-ai-what-works-repackaged-seo'],
  [/\bprompts? cach(?:e|ed)\b|\bcached (?:input|tokens|prefix)\b/i, 'prompt-caching-scheduled-agent-savings'],
  [/\blatency\b/i, 'ai-latency-ttft-for-product-teams'],
  [/\binference\b/i, 'kv-cache-explained'],
  [/\btokens\b/i, 'what-is-a-token-ai-billing'],
  [/\b(?:LLMs?|large language models?)\b/, 'what-a-context-window-is-and-why-it-fills-up'],
  [/\bself-reported\b/i, 'klarna-ai-customer-service-graded-honestly'],
  [/\bproductivity (?:claims?|gains?|numbers?)\b/i, 'block-ai-champions-program-goose'],
];

const SKIP_TAGS = new Set(['a', 'code', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'svg', 'figcaption', 'script', 'style']);

const isPublished = (slug) => {
  const file = join(BLOG, `${slug}.md`);
  if (!existsSync(file)) return false;
  const raw = readFileSync(file, 'utf8');
  const frontmatter = raw.slice(0, raw.indexOf('\n---', 3));
  return !/^draft:\s*true/m.test(frontmatter);
};

export function rehypeInternalLinks() {
  const live = new Map();
  const published = (slug) => {
    if (!live.has(slug)) live.set(slug, isPublished(slug));
    return live.get(slug);
  };

  return (tree, file) => {
    const self = file.path ? basename(String(file.path), '.md') : '';
    const used = new Set();
    let count = 0;
    let stopped = false;
    let inTldr = false;

    const link = (value) => {
      if (count >= MAX_LINKS) return null;
      let best = null;
      for (const [pattern, slug] of TERMS) {
        if (slug === self || used.has(slug) || !published(slug)) continue;
        const match = pattern.exec(value);
        if (match && (!best || match.index < best.match.index)) best = { match, slug };
      }
      return best;
    };

    const expand = (value) => {
      const hit = link(value);
      if (!hit) return [{ type: 'text', value }];
      const { match, slug } = hit;
      used.add(slug);
      count++;
      const out = [];
      if (match.index > 0) out.push({ type: 'text', value: value.slice(0, match.index) });
      out.push({
        type: 'element',
        tagName: 'a',
        properties: { href: `/blog/${slug}/` },
        children: [{ type: 'text', value: match[0] }],
      });
      const rest = value.slice(match.index + match[0].length);
      if (rest) out.push(...expand(rest));
      return out;
    };

    const visit = (node) => {
      if (!node.children) return;
      const next = [];
      for (const child of node.children) {
        if (stopped) {
          next.push(child);
          continue;
        }
        if (child.type === 'element' && child.tagName === 'h2' && /^sources\b/i.test(textOf(child))) {
          stopped = true;
          next.push(child);
          continue;
        }
        // The plate is often two raw HTML nodes with markdown between them, so
        // the class check alone cannot see it.
        if (child.type === 'raw') {
          if (/class="tldr"/.test(child.value)) inTldr = true;
          else if (inTldr && /<\/div>/.test(child.value)) inTldr = false;
          next.push(child);
          continue;
        }
        const classes = child.properties?.className;
        const isTldr = inTldr || (Array.isArray(classes) && classes.includes('tldr'));
        if (child.type === 'text') next.push(...(isTldr ? [child] : expand(child.value)));
        else if (child.type === 'element' && !SKIP_TAGS.has(child.tagName) && !isTldr) {
          visit(child);
          next.push(child);
        } else next.push(child);
      }
      node.children = next;
    };

    visit(tree);
  };
}

function textOf(node) {
  if (node.type === 'text') return node.value;
  return (node.children ?? []).map(textOf).join('');
}
