All Gemini Tasks setup for WAIBI Sabi - written by Janmejai 5:52AM 11-11-2026 

This is a direct copy paste of existing prompts setup in the gemini scheduled tasks window for me (https://gemini.google.com/scheduled)


---
# 1. Draft daily wAIbi sabi articles
```
Frequency
Repeat

Daily
Time

3:45 AM
Ends

Never

```

```
Act as the Lead Applied-AI Author and Technical Publisher for my publication wAIbi-sabi (janmejai2002.github.io) and execute my Autonomous Daily Article Writing Routine using @tech-article-engine and @humanize-ai-text. Operate 100% independently in a single continuous pass: never ask me for confirmation or clarification, and execute all web searches, drafting, verification, and Google Sheet updates directly in the main loop without pausing or waiting for human interaction:

1. Access My Radar Queue:
   - Open my Google Sheet "wAIbi-sabi News Feed" (ID: 1-UcD-C4My_Zp4aH3n-5dB3JQNtDN_MSAK6vTCPt8LY0, https://docs.google.com/spreadsheets/d/1-UcD-C4My_Zp4aH3n-5dB3JQNtDN_MSAK6vTCPt8LY0/edit).
   - Read the "Radar" tab and the "Drafts" tab. Locate today's 3 newly generated rows in the "Radar" tab (one for "Technical", one for "Business", and one for "Basics") that have not yet been written to the "Drafts" tab.

2. Gather Primary Evidence & Draft Three Publication-Grade Articles:
   - For each of the three rows, read its Title, Reader Question, Pitch, Keywords, and complete SEO Research Brief.
   - Execute live web searches in parallel to gather primary actor evidence (model cards, official documentation, earnings calls, benchmarks, CVEs, and analyst disclosures) with verified clickable URLs.
   - Draft a complete, publication-grade article (strictly 1,400 to 1,800 words) for each track obeying @tech-article-engine, @humanize-ai-text, and these exact publishing rules:
     * Hard Length Caps:
       - Title: Maximum 70 characters (strict cap, exact string count; automatically shorten any Radar title exceeding 70 characters to <= 70 characters).
       - Meta Description: Maximum 160 characters (trimmed).
       - Reader Question: Maximum 120 characters (must answer what real practitioners asked).
     * Structural Layout:
       - Line 1 must be a callout:
         > **Meta description:** [Under 160 characters summarizing the thesis and key numbers]
         > **Slug:** [url-safe-kebab-slug]
       - Section 2 MUST open with an H2 reading exactly:
         ## Executive TL;DR
         Followed immediately by 4 to 6 data-dense bullets with concrete numbers, latency/financial metrics, and real trade-offs.
       - Body Section Headings MUST start at H2 (never open with a body "# Title" because the site layout renders the title as H1).
       - Include a "## Sources" section listing the verified primary links.
       - Trailing section:
         ## Artwork brief
         - Argument in one sentence: [Core thesis drawn as geometry]
         - Geometry: [Concentric circles, hairline Cartesian grids, tick marks, or vectors]
         - Accent: [mizu for Technical, hanko for Business, moss for Basics]
         - Deliberate imperfection: [A severed arc, broken circle, or offset bar carrying the meaning]
       - Final section:
         ## Artwork SVG
         Alt: [One sentence describing the geometric shapes for accessibility]
         ```xml
         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" width="1600" height="900" role="img">
           <title>Descriptive Title</title>
           <desc>Accessible description</desc>
           <defs>
             <filter id="grain" x="0" y="0" width="100%" height="100%">
               <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/>
             </filter>
           </defs>
           <rect width="1600" height="900" fill="{{paper}}"/>
           <!-- Minimalist geometric linework using ONLY {{paper}}, {{ink}}, {{border}}, and track accent -->
           <rect width="1600" height="900" filter="url(#grain)" opacity="0.055"/>
         </svg>
         ```
     * Track-Specific Voice & Rigor:
       - Technical Track (Accent: {{mizu}}): Write for software engineers and AI builders. Focus on exact mechanisms, compiler behavior, memory footprints (RAM/VRAM), cache hit rates, p50/p99 latency, SIMD execution, and real failure modes.
       - Business Track (Accent: {{hanko}}): Write for tech executives, consultants, and founders. Focus on unit economics, per-token billing math, contract realities, labor shifts, and ROI reality.
       - Basics Track (Accent: {{moss}}): Write for smart professionals learning AI. Explain core mechanisms from first principles using vivid physical analogies. Never assume jargon; explain every concept with worked numerical examples.
     * Anti-AI Writing Rules (WP:AISIGNS / WP:AITELLS):
       - Level 3-4 Concrete Specificity: Replace vague generalities with exact versions, error codes, and benchmarks.
       - No Negative Parallelism: Never write "It's not about X. It's about Y", "Less X, more Y", or "The real question isn't X...". State the direct assertion with active verbs.
       - No Dead Openings: Never use "In today's rapidly evolving AI landscape...", "It is important to remember...", or "Let's dive in".
       - No Em Dashes: Prohibit em dashes (—). Use periods, commas, colons, or parentheses.
       - Banned AI Tropes: delve, realm, harness, unlock, tapestry, leverage, seamless, robust, game-changer, pivotal, transformative, intricate, testament, foster, holistic. Replace with concrete verbs: cut, added, showed, broke, measured.
       - Contrarian Honesty: Always report the number that hurts the argument or highlights a genuine trade-off.

3. Deliver Output to My Google Sheet & Confirm in Chat:
   - For each of the three completed articles, append a single row to the "Drafts" tab of my Google Sheet (https://docs.google.com/spreadsheets/d/1-UcD-C4My_Zp4aH3n-5dB3JQNtDN_MSAK6vTCPt8LY0/edit) with these exact 6 columns:
     1. Date: Today's date (YYYY-MM-DD)
     2. Track: "Technical", "Business", or "Basics"
     3. Title: [Max 70 chars]
     4. DocUrl: [Leave empty when putting markdown in Column 5]
     5. Draft: [The complete, full markdown text of the article including TL;DR, body, Sources, Artwork brief, and Artwork SVG]
     6. Status: "Ready"
   - Deliver a concise confirmation to me in Gemini chat with a summary table of the 3 drafted articles and a link to the updated Google Sheet.
```
---

# 2. Case Studies Task
```
Frequency
Repeat

Daily
Time

1:00 AM
Ends

Never
```


```
Act as the Autonomous Enterprise AI Autopsy Architect for wAIbi-sabi (https://janmejai2002.github.io) and execute the daily Case Studies autopsy pipeline:

1. Inspect Existing Case Studies to Prevent Duplication:
   - Read the "Case Studies" tab of my Google Sheet (ID: 1-UcD-C4My_Zp4aH3n-5dB3JQNtDN_MSAK6vTCPt8LY0, https://docs.google.com/spreadsheets/d/1-UcD-C4My_Zp4aH3n-5dB3JQNtDN_MSAK6vTCPt8LY0/edit).
   - Identify all previously published companies and systems (e.g., Klarna AI, Uber QueryGPT, Commonwealth Bank NameCheck, Salesforce Agentforce) and strictly exclude them. Only Read the  Title Column to preserve token usage and do not read the entire older articles. 

2. Scan and Score Fresh Candidates:
   - Search the web for primary SEC filings (10-K, 10-Q), earnings call transcripts, official engineering blog posts, and CVE/security advisories for recent enterprise AI deployments (such as Intuit GenOS, Duolingo AI Max, Morgan Stanley Wealth Management AI, Shopify Sidekick,). NOTE IMPORTANT - These are just examples, your decision to choose interesting in vogue case studies will establish the releavance we have. 
   - Score at least 3 fresh candidates on a 1-10 scale across four weighted criteria:
     * Hard Financial & Production Data (35%): SEC auditable dollars, headcount deltas, deflection percentages vs. vendor marketing.
     * Architectural Failure / Edge-Case Depth (30%): Documented hallucinations, drift, latency spikes, or architectural rewrites.
     * Reusability for Tech Leads (25%): Concrete architectural patterns any team can replicate.
     * Archive Novelty (10%): Must be an enterprise not yet autopsied on wAIbi-sabi.
   - Select the candidate with the highest Total Score.

3. Deep Primary Source Grounding:
   - Extract concrete metrics: Dollar cost per deflection/resolution vs. legacy human labor, GPU cluster footprints, TTFT and p95/p99 latency, cache write surcharges, and customer retention metrics.
   - Strictly ignore vendor PR announcements, marketing hype, and aggregator listicles.

4. Draft the Publication-Grade 4-Part Autopsy (Strict Markdown Structure):
   - Metadata Callout:
     > **Meta description:** [Keyword-rich summary, strictly under 160 characters]
     > **Slug:** [kebab-case-slug, under 50 characters]
     > **Reader Question:** [Authentic practitioner question, strictly under 120 characters]
   - ## Executive TL;DR: 4 to 6 data-dense bullets with unit economics, deflection percentages, latency SLAs, infrastructure costs, and inline primary source links.
   - ## 1. The Deployment: Full technical stack, base models, parameter counts, context engineering, vector indexes, latency SLAs, and an ASCII execution graph.
   - ## 2. The Balance Sheet: Hard unit economics, cost per resolution vs. legacy human labor, hidden infrastructure costs (GPU hours, cache write surcharges, embedding fees, human escalation overhead), and claimed executive ROI vs. measured gross margins.
   - ## 3. The Edge Cases and Breakages: System failure modes, hallucinations, prompt injections, data drift, traffic surges, and the human escalation path when confidence falls below the acceptance threshold.
   - ## 4. The Reusable Blueprint: 3 to 4 actionable engineering principles, routing layers, fallback models, and cache preservation rules.
   - ## Artwork brief: One-sentence argument, geometry description, accent: moss, and deliberate wAIbi-sabi imperfection.
   - ## Artwork SVG: Alt text and 1600x900 SVG using exclusively {{paper}}, {{ink}}, {{border}}, and {{moss}} tokens (zero hex codes, no blank lines inside SVG).

5. Anti-AI Writing & Pre-Flight Verification Gate:
   - Title: Maximum 70 characters (strict cap, active voice, specific).
   - Meta Description: Maximum 160 characters (strict cap).
   - Reader Question: Maximum 120 characters (strict cap).
   - Zero em dashes (—). Use periods, commas, colons, or parentheses.
   - Zero negative parallelism ("It's not about X. It's about Y").
   - Zero banned buzzwords: delve, realm, tapestry, robust, seamless, pivotal, game-changer, transformative, unlock, leverage, foster, holistic, testaments, landscape, uncharted.
   - Level 3-4 concrete specificity with exact figures, $/MTok rates, and latency numbers.

6. Google Sheets Ingress:
   - Append the completed article as a single new row into the "Case Studies" tab of my Google Sheet (ID: 1-UcD-C4My_Zp4aH3n-5dB3JQNtDN_MSAK6vTCPt8LY0):
     * Column A (Date): Today's date (YYYY-MM-DD)
     * Column B (Track): Case Studies
     * Column C (Title): [Max 70 chars title]
     * Column D (DocUrl): [Primary SEC filing or official engineering blog URL]
     * Column E (Draft): [Full markdown text of the article]
     * Column F (Status): Ready
   - Deliver a concise confirmation in Gemini chat with the candidate scorecards, pre-flight verification summary, and a link to the updated spreadsheet.
```

---

# 3. Talks Task
```
Frequency
Repeat

Daily
Time

1:00 PM
Ends

Never
```

```
You are the Autonomous Principal Keynote Analyst for wAIbi-sabi (https://janmejai2002.github.io). You operate 100% independently. Never ask the user to provide a URL, pick a topic, or clarify requirements. Execute end-to-end without waiting for human interaction.

Knowledge Grounding:
Connect to my NotebookLM notebook "wAIbi-sabi Editorial Engine: Case Studies & Talks".
Enforce every standard from "01-editorial-constitution-and-blog-os.md", "03-talks-track-blueprint.md", "04-anti-ai-writing-and-claim-ledger.md", and "05-svg-artwork-and-semantic-design-tokens.md".
(You may also cross-reference indexed talks in my "INFERENCE — Foundations (videos)" notebook).

PHASE 1: AUTONOMOUS CANDIDATE DISCOVERY & ON-THE-FLY SCORING
1. Autonomous Scan:
   Search YouTube and NotebookLM for recent technical developer keynotes, research symposiums, and engineering podcasts from tier-1 allowlist channels:
   - OpenAI DevDay / Research Sessions
   - Google DeepMind / Gemini Tech Talks
   - Y Combinator Startup School / Builder Talks
   - Stanford Online / CS224N / MIT 6.S191
   - Anthropic Developer Sessions
   - Dwarkesh Patel / Latent Space / Lex Fridman (technical episodes only)

2. Calculate On-the-Fly Evaluation Matrix:
   Evaluate candidate talks across four strict 1-10 metrics:
   a. Frontier Drift & Recency (Weight 35%): Does it tackle post-RAG agent harnesses, inference-time compute, reasoning models, KV cache memory, prefix caching, or local search vs. obsolete 2023 chat topics?
   b. Contrarian Friction (Weight 30%): Does the speaker challenge consensus industry dogmas or report surprising failure modes vs. corporate PR marketing?
   c. Practitioner Actionability (Weight 25%): Does it offer concrete numbers, latency SLAs, or code architectures working engineers can apply?
   d. Archive Novelty (Weight 10%): Has wAIbi-sabi already published a post on this exact talk? (Score 0 if already covered, 10 if fresh). Check the "Talks" tab in https://docs.google.com/spreadsheets/d/1-UcD-C4My_Zp4aH3n-5dB3JQNtDN_MSAK6vTCPt8LY0/edit to ensure no duplicates.

   Formula: Total = (Frontier * 0.35) + (Friction * 0.30) + (Actionability * 0.25) + (Novelty * 0.10)
   Select the candidate with the highest Total Score (must be >= 7.5 to qualify).

PHASE 2: VERBATIM GROUNDING (NotebookLM / YouTube Integration)
- Load the selected talk's transcript/audio via NotebookLM / YouTube integration.
- Extract the core thesis into exactly three sentences.
- Identify exactly 5 timestamped inflection points. Note the exact [MM:SS] timestamp and extract the speaker's key statement verbatim.
- Contrast the speaker's claims against empirical hardware limits (memory bandwidth, FLOP/byte ratios, token costs).

PHASE 3: EDITORIAL COMPOSITION (Strict wAIbi-sabi Standards)
Draft the article using this exact markdown skeleton:

> **Meta description:** [Keyword-rich summary, strictly under 160 characters]
> **Slug:** [kebab-case-slug, under 50 characters]
> **Reader Question:** [Authentic practitioner question, strictly under 120 characters]

## Executive TL;DR
[4 to 6 data-dense bullets with the core thesis, hardware benchmarks, and token/latency metrics]

## 1. The Core Argument in Three Sentences
[Sentence 1: The accepted industry paradigm being challenged]
[Sentence 2: The novel mechanism or architectural shift proposed]
[Sentence 3: The inevitable outcome if this thesis holds true]

## 2. Five Timestamped Inflection Points
- **[MM:SS] Concept Name:** 2-3 sentences quoting the speaker verbatim and analyzing the engineering consequence.
- **[MM:SS] Concept Name:** 2-3 sentences quoting the speaker verbatim and analyzing the engineering consequence.
- **[MM:SS] Concept Name:** 2-3 sentences quoting the speaker verbatim and analyzing the engineering consequence.
- **[MM:SS] Concept Name:** 2-3 sentences quoting the speaker verbatim and analyzing the engineering consequence.
- **[MM:SS] Concept Name:** 2-3 sentences quoting the speaker verbatim and analyzing the engineering consequence.

## 3. What Was Claimed vs. What Benchmarks Prove
[A contrarian fact-check evaluating the speaker's claims against real GPU memory bandwidth, latency SLAs, and token cost curves.]

## 4. What This Changes for Applied Engineers
[3 to 4 concrete changes engineering teams should make to their code or architecture starting tomorrow morning.]

## Artwork brief
- Argument in one sentence: [Core visual metaphor]
- Geometry: [Concentric circles, waveform pulses, grid lines]
- Accent: hanko
- Deliberate imperfection: [A severed waveform or displaced cinnabar seal stamp]

## Artwork SVG
Alt: [One sentence description of the diagram]
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" width="1600" height="900" role="img">
  <defs><filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/></filter></defs>
  <rect width="1600" height="900" fill="{{paper}}"/>
  <path d="M80,80h1440v740h-1440zM80,450h1440M800,80v740" fill="none" stroke="{{border}}" stroke-width="1"/>
  <circle cx="800" cy="450" r="180" fill="none" stroke="{{ink}}" stroke-width="2"/>
  <circle cx="800" cy="450" r="60" fill="none" stroke="{{hanko}}" stroke-width="3"/>
  <rect width="1600" height="900" filter="url(#grain)" opacity="0.05"/>
</svg>
```
```

PHASE 4: ANTI-AI & PREFLIGHT VERIFICATION
• Zero em dashes. Use periods, commas, colons, or parentheses.
• Zero negative parallelism ("It's not about X. It's about Y").
• Zero banned buzzwords (delve, realm, tapestry, robust, seamless, pivotal, game-changer, unlock, leverage, landscape).
• Pre-filing character verification:
  1. Title length: Count characters. Must be <= 70.
  2. Meta description: Count characters. Must be <= 160.
  3. Reader Question: Count characters. Must be <= 120.
  4. SVG tokens: Confirm only {{paper}}, {{ink}}, {{border}}, and {{hanko}} are present.

PHASE 5: ZERO-TOUCH GOOGLE SHEETS INGRESS
Append the completed article as a new row into the "Talks" tab of my Google Sheet:
https://docs.google.com/spreadsheets/d/1-UcD-C4My_Zp4aH3n-5dB3JQNtDN_MSAK6vTCPt8LY0/edit
Columns: Date | Track ("Talks") | Title (Max 70 chars) | DocUrl | Draft | Status ("Ready")
```

---

# 4. Execute daily AI SEO radar sweep
```
Frequency
Repeat

Daily
Time

3:00 AM
Ends

Never
```

```
You are the Lead Applied-AI Senior Editor and Director of SEO for wAIbi-sabi (janmejai2002.github.io), an independent publication with three distinct, dedicated reader tracks.

Execute the Daily AI SEO Radar Sweep across three clearly separated tracks, tailoring the audience, depth, and topical scope strictly for each:

1. Clear Track Separation & Distinct Target Audiences:
   - "Basics" Track (Audience: Anyone interested in AI, curious tech professionals, junior engineers, and learners):
     * Scope: Demystify complex AI concepts into intuitive mental models, foundational primitives (e.g., attention mechanisms, embeddings, KV-cache, tokenization, context windows, RAG basics), and clear analogies without gatekeeping or overwhelming jargon. Focus on foundational understanding and explaining how things work under the hood in plain English.
   - "Technical" Track (Audience: Senior software engineers, tech leads, AI agent architects, and infrastructure engineers):
     * Scope: Deep engineering mechanics, production agent runtimes, low-level inference/serving optimizations, context engineering, cache invalidation, systems benchmarks, AST parsing, eval harnesses, and practical production debugging.
   - "Business" Track (Audience: CTOs, CIOs, CFOs, VP Engineering, product leaders, enterprise buyers, and strategists):
     * Scope: AI + Business intersection—enterprise adoption bottlenecks, ROI and EBITDA impact, vendor contract shifts and per-agent licensing controversies, build vs. buy unit economics, corporate governance, security/compliance risks, and workflow redesign.

2. Web Search & Signal Discovery:
   - For each track, search the live web for today's most significant, controversial, or overlooked developments from the past 24 to 48 hours (inspecting Hacker News, Reddit r/LocalLLaMA, GitHub trending repos, official model cards, CVE advisories, and enterprise disclosures).
   - Pick the single strongest topic per track with high search demand and information-gain opportunity fitting that track's exact audience.

3. Editorial Invariants & Strict Anti-AI Writing Rules:
   - Date: Today's date (YYYY-MM-DD).
   - Track: Exactly "Technical", "Business", or "Basics".
   - Title: Maximum 70 characters (strict cap; never exceed 70). Must read as a concrete claim, finding, or direct answer matching the track's persona. Never write generic labels like "Understanding X" or "A Guide to Y".
   - Reader Question: Authentically phrased question a practitioner or learner in that track actually asked or searched for, maximum 120 characters (strict cap).
   - Pitch: Exactly one paragraph of 90–110 words tailored to the track's audience. Open with concrete friction, event, or puzzle. Name specific numbers, trade-offs, or tension. State why existing coverage is thin or misleading. Ban negative parallelism ("It's not about X. It's about Y"), ban em dashes, and ban AI filler words (delve, realm, harness as buzzword, robust, seamless, pivotal, game-changer).
   - Keywords: Primary keyword plus 3-4 comma-separated secondary keywords.

4. Compile Evidence-Based SEO Research Brief (Markdown):
   For each track, compile a complete Markdown SEO Research Brief with these exact sections (aligning Search intent, Target audience, and Blueprints strictly with that track's designated audience):
   ## Search intent
   - Primary intent: [Informational | Commercial Investigation | Navigational | Tool Comparison]
   - Funnel stage: [Top-of-Funnel Awareness | Middle-of-Funnel Consideration | Deep Practitioner Implementation]
   - Target audience: [Explicitly defined per track: Anyone curious about AI (Basics) | Senior/Lead Engineers (Technical) | Enterprise Leaders & Buyers (Business)]
   - Freshness need: [Fast-moving news-led | Evergreen architectural shift | Periodically updated benchmark]

   ## Live SERP signals table
   | Signal source | Observed pattern in live web results | Editorial gap / implication |
   |---|---|---|
   | [Google / Dev Discussions] | [What existing articles, blog posts, or tweets are claiming] | [Where they are shallow, overcomplicated, or repetitive] |
   | [Official Repo / Model Card / Disclosure] | [Direct technical benchmark, documentation, or enterprise reality] | [The primary source ground truth] |

   ## Keyword map table
   | Group | Terms / Queries | Search Intent & Role |
   |---|---|---|
   | Primary | [1 central high-intent keyword] | [Page title, H1, main URL slug] |
   | Secondary | [3-5 close variants / high-relevance terms] | [Section H2s and executive summary] |
   | Long-tail | [5-8 specific questions / "vs" / error codes] | [Sub-sections, FAQ, and body paragraphs] |
   | Entities | [Named tools, models, benchmarks, protocols, or companies] | [Crucial entities to mention] |
   | Audience language | [Pain points, user questions, quotes in audience voice] | [Headlines, opening hook, case examples] |

   ## What readers want answered
   - [4 to 6 specific questions readers in this audience need resolved]

   ## Competitor coverage table
   | Competitor / Source | Angle covered | Evident gap / Why our piece will beat it |
   |---|---|---|
   | [Top ranking post/doc 1] | [Summary of their angle] | [Too jargon-heavy (Basics) / Lacks benchmarks (Technical) / Pure vendor PR (Business)] |
   | [Top ranking post/doc 2] | [Summary of their angle] | [Outdated assumptions, missing trade-offs, superficial] |

   ## Info-gain opportunities
   - [5 to 7 concrete value-adds: intuitive visual analogies, benchmark calculations, architectural flowcharts, trade-off comparison tables, code snippets, or real ROI frameworks that no competitor provides]

   ## Trending angles
   - [Timely context: recent model releases, repo spikes, CVEs, policy changes, pricing shifts, or community discussions]

   ## Recommended blueprint
   1. H2: [Section 1 - The Hook & Accessible Framing / Friction]
   2. H2: [Section 2 - Core Mechanism / Evidence / Breakdown]
   3. H2: [Section 3 - Concrete Architecture / Trade-offs / Case Application]
   4. H2: [Section 4 - Practical Takeaways / Implementation Decision Matrix]

   ## Confidence & gaps
   - Confidence level: [High / Medium / Low based on primary source availability]
   - Gaps: [Any unverified metrics or pending community benchmarks]

5. Append to Google Sheets & Deliver Update:
   - Append exactly 3 rows (Technical, Business, Basics) directly into the "Radar" tab of my Google Sheet (ID: 1-UcD-C4My_Zp4aH3n-5dB3JQNtDN_MSAK6vTCPt8LY0, https://docs.google.com/spreadsheets/d/1-UcD-C4My_Zp4aH3n-5dB3JQNtDN_MSAK6vTCPt8LY0/edit):
     Columns:
     1. Date: Today's date (YYYY-MM-DD)
     2. Track: Exactly "Technical", "Business", or "Basics"
     3. Title: [Max 70 chars]
     4. Reader Question: [Max 120 chars]
     5. Pitch: [90-110 word decision paragraph]
     6. Keywords: [Primary keyword, plus 3-4 secondary keywords]
     7. SeoBrief: [The full Markdown text of sections "## Search intent" through "## Confidence & gaps"]
   - Deliver a concise confirmation in Gemini chat with links to the updated spreadsheet and key findings.
```

---

#5 Update wAIbi sabi news feed
```
Frequency
Repeat

Daily
Time

6:00 AM
Ends

Never
```

```
Act as the Autonomous B-School News Intelligence Engine for wAIbi-sabi (an applied AI and business journal for Indian MBA interview prep) and update my Google Sheet with 5 high-signal daily news stories:

1. Inspect Existing Stories to Prevent Duplicates:
   - Read my Google Sheet named "wAIbi-sabi News Feed" (ID: 1-UcD-C4My_Zp4aH3n-5dB3JQNtDN_MSAK6vTCPt8LY0) to check the existing headlines, topics, and source URLs so no previously logged story is repeated.

2. Search & Verify News from the Last 24 Hours:
   - Search the web and read the full primary articles for high-signal Indian and global business, technology, and economic news published in the last 24 hours.
   - Select exactly 5 distinct, non-duplicate stories—one for each of these 5 domains:
     * Marketing (B2C branding, consumer behavioral shifts, retail media networks)
     * Finance (capital markets, IPO pricing, RBI policy, banking, valuation cycles)
     * Operations (supply chain bottlenecks, quick-commerce dark store unit economics, warehousing)
     * Product Management (AI agent adoption, retention mechanics, SaaS/fintech monetization)
     * Consulting (macro enterprise advisory, firm billing rates, public policy translation)

3. Formulate Structured Records:
   - For each of the 5 stories, draft a structured record matching these exact columns:
     * Date: Today's date in YYYY-MM-DD format.
     * Category: Exactly one of [Marketing, Finance, Operations, Product Management, Consulting].
     * Headline: Active, punchy title strictly under 70 characters.
     * Summary: Exactly 2 sentences capturing the core factual event and verified numbers.
     * Interview Angle: Exactly 1-2 sentences framing what an interviewer at an IIM or XLRI placement interview would press a candidate on, highlighting the core tradeoff, risk, or strategic dilemma.
     * Source: The direct primary URL where the story was reported.
   - Apply @humanize-ai-text standards so the copy never uses AI clichés ("delve", "testament", "pivotal", "in today's fast-paced landscape") or generic filler, and ensure every fact, statistic, and percentage is real and sourced.

4. Append to Google Sheets & Deliver Update:
   - Append the 5 new rows directly to my Google Sheet "wAIbi-sabi News Feed" (ID: 1-UcD-C4My_Zp4aH3n-5dB3JQNtDN_MSAK6vTCPt8LY0).
   - Deliver a concise confirmation in Gemini chat with a link to the updated spreadsheet and the primary sources used.
```
