---
name: seo-topic-research
description: Research an SEO topic using live web and SERP data. Use when the user asks for keyword opportunities, search intent, content gaps, trending angles, questions, entities, competitor patterns, or a content brief before writing an article. Do not write the full article.
---

# SEO Topic Research

## Purpose

Turn a topic or seed keyword into an evidence-based SEO research brief that tells the user **what to cover**, **which words and entities matter**, **what is currently trending**, and **how to create content with information gain**.

This is a research-only skill. Never draft a full article unless the user explicitly asks for it in a separate request.

## Required tools

Use live-search tools when they are available:

- **Brave Search MCP**: primary tool for live SERP discovery, query suggestions, news/freshness checks, and country-specific research.
- **Exa MCP**: optional tool for reading and comparing the most relevant competitor pages in depth.
- **Google Search Console MCP**: optional; use only if the user asks to include their own website performance, or gives a domain and has connected access.

If a tool is unavailable, state the limitation briefly and continue with available tools. Do not invent search volumes, keyword difficulty, Google ranking positions, or People Also Ask results.

## Inputs

Accept a minimal request such as:

> Research the SEO opportunity for: [topic]

Ask only the questions that materially improve the research. If the user does not answer, proceed with sensible defaults and disclose them:

1. **Target country/market** — default: India.
2. **Audience** — default: broad, English-speaking audience.
3. **Website/domain** — optional; needed for internal-link or Search Console analysis.
4. **Content goal** — informational, commercial investigation, transactional, local, or thought leadership; infer from the query when possible.
5. **Freshness need** — evergreen, current, or news-led; infer from the topic when possible.

Do not ask for article length, tone, CTA, or brand voice; those belong to article writing, not SEO research.

## Research protocol

### 1. Classify the topic

Determine and state:

- Primary topic / seed keyword
- Probable search intent: informational, commercial investigation, transactional, navigational, local, or mixed
- Likely funnel stage: awareness, consideration, decision, or retention
- Freshness class: evergreen, periodically updated, or fast-moving

If intent is genuinely ambiguous, present the two strongest interpretations rather than pretending there is one answer.

### 2. Build a live SERP snapshot

Use Brave Search to search the exact seed keyword in the target country. Retrieve up to 10 organic results where supported.

Then run 3-6 focused follow-up searches. Choose only searches that resolve meaningful questions, for example:

- `"[seed keyword]"`
- `"[seed keyword]" guide`
- `"[seed keyword]" examples`
- `"[seed keyword]" vs`
- `"[seed keyword]" best`
- `"[seed keyword]" site:reddit.com` when community language or pain points matter
- `"[seed keyword]"` with a past-week or past-month freshness filter when recency matters

Use country and language controls where the search tool supports them. For India, use `country=IN`; use English unless the user requests another language. Brave supports result count, page-content retrieval, country targeting, and freshness periods such as past day, week, month, and year.[web:62][web:71]

Capture only verifiable signals:

- Recurring page formats: guides, lists, comparisons, tools, product pages, videos, forums, news
- Dominant domains and content publishers
- Repeated subtopics from titles/snippets
- Freshness of visible results
- Whether results suggest commercial, informational, local, or mixed intent
- SERP-feature clues, if the tool actually returns them

Never call Brave rankings “Google rankings.” Brave has its own index. Describe them accurately as **Brave live search results** or **live web-result patterns**.

### 3. Extract keyword and language opportunities

Use query suggestions/autocomplete if the connected search tool exposes them. Combine those outputs with wording found repeatedly in live titles, snippets, community discussions, and competitor headings.

Organize terms into the following groups:

- **Primary keyword**: the central query/topic
- **Secondary keywords**: close variants and high-relevance modifiers
- **Long-tail queries**: specific questions, use cases, comparisons, costs, mistakes, and “best for” variants
- **Semantic entities**: people, products, standards, methods, components, metrics, tools, or concepts a credible page should mention
- **Audience language**: phrases users use to describe outcomes, problems, objections, and desired benefits

Do not fabricate monthly volume, keyword difficulty, CPC, exact keyword frequency, or an “LSI score.” Label these as **qualitative opportunities based on current web-result patterns**. If DataForSEO or another approved keyword-data source is connected, use it to add numeric data and cite the source and market.

### 4. Find content gaps and information gain

Read 3-5 representative high-relevance competitor pages with Exa or page-fetch tools, where accessible. Do not reproduce their text.

For each competitor, capture only:

- URL/domain
- Content format and intended audience
- Main sections/topics covered
- Distinctive angle
- Evident omissions, outdated claims, missing examples, weak explanations, absent comparison criteria, or missing local context

Then define **information gain**: specific additions that would make the user’s article more useful than a generic rehash. Favor:

- Current primary-source statistics or official documentation
- India/target-market context where relevant
- Decision frameworks and comparison criteria
- Practical workflows, templates, checklists, calculations, examples, or case evidence
- Clear coverage of risks, trade-offs, implementation constraints, and common mistakes
- Direct answers to unanswered user questions

Do not claim a competitor “does not cover” something unless you reviewed the page or qualifying search result. Use cautious wording such as “not evident in the reviewed material.”

### 5. Research trends and freshness

Only when the topic may change quickly, run a separate fresh-news/web search using past week and past month filters.

Report:

- Emerging terms, launches, regulations, studies, announcements, or debates
- Whether the trend is truly relevant to the main topic
- The exact date/source for time-sensitive claims
- A recommendation: include as a dated update, make it a standalone article, or exclude it as noise

Do not turn one recent article into a trend. Require repeated coverage, a primary source, or a meaningful industry event before calling something a trend.

### 6. Recommend the content angle

Recommend one primary page type and optional supporting pages:

- Definitive guide
- Beginner explainer
- Comparison / alternatives
- Best tools/products list
- Use-case page
- Template/checklist/calculator
- Case study
- Topic cluster pillar and supporting pages
- News/update page

Specify the recommended angle, primary audience, likely intent, and the reason it fits the observed results.

## Required output

Return a concise but high-value Markdown report in exactly this structure. Use tables when useful.

# SEO Research Brief: [Topic]

## Search intent

- **Primary intent:** [type]
- **Funnel stage:** [stage]
- **Target market:** [country/language and any assumptions]
- **Freshness:** [evergreen / update periodically / fast-moving]
- **Best content format:** [format and one-sentence rationale]

## Live SERP signals

| Signal | What current results indicate | Editorial implication |
|---|---|---|
| Dominant formats | [observed patterns] | [what to create] |
| Recurring subtopics | [observed patterns] | [sections to include] |
| Audience level | [beginner/intermediate/expert evidence] | [depth and language] |
| Freshness | [visible date pattern] | [whether to date/update content] |

Include 3-5 representative result URLs as sources. Do not list ten URLs without insight.

## Keyword map

| Group | Terms or queries | How to use them |
|---|---|---|
| Primary | [1-2 terms] | [H1, introduction, relevant H2] |
| Secondary | [5-10 terms] | [natural section-level coverage] |
| Long-tail | [8-15 questions/modifiers] | [H2/H3, FAQ, supporting articles] |
| Entities | [important concepts/tools/standards] | [explain and connect naturally] |
| Audience language | [pain points/outcomes/phrases] | [headlines, intro, examples] |

Qualify this list as qualitative unless a connected SEO-data provider returned numerical data.

## What readers want answered

List 5-10 high-value questions or decision points inferred from live search results, suggestions, and credible community discussions. Group them by intent where useful.

## Competitor coverage

| Competitor / URL | Format and angle | Strong coverage | Opportunity to improve |
|---|---|---|---|
| [up to 5] | [summary] | [summary] | [specific, evidence-based gap] |

Never copy prose from competitor pages.

## Information-gain opportunities

Give 5-8 concrete differentiators. Each must say what to add and why it improves usefulness, not merely “make it more detailed.”

Examples:

- Include a decision matrix for [audience] choosing between [options].
- Add a current India-specific regulatory or cost context, backed by a primary source.
- Explain the implementation workflow with a realistic example and failure modes.

## Trending and timely angles

- **Include now:** [timely, validated updates and why]
- **Monitor:** [emerging items needing confirmation]
- **Avoid:** [stale or noisy angles]

If the topic is evergreen and no meaningful trend was found, say so clearly.

## Recommended content blueprint

Provide an outline only, not article copy:

1. H1: [search-aligned title direction]
2. Introduction: [reader problem and promise]
3. H2: [section]
4. H2: [section]
5. H2: [section]
6. H2: [information-gain section]
7. H2: FAQ: [questions]
8. Conclusion: [decision/action next step]

Then add:

- **Suggested title angles:** 3 options
- **Suggested meta-description direction:** 1 option, under 160 characters
- **Internal-link targets:** only if the user supplies a site map or site URLs
- **Supporting-cluster ideas:** 3-5 adjacent article topics

## Confidence and gaps

State what was based on live search, which assumptions were made, and any data that would require a dedicated paid SEO provider (e.g., Google-specific rank positions, search volume, CPC, difficulty, or historical trend lines).

## Rules

- Research first; do not start writing article body copy.
- Cite/link the sources used for facts, time-sensitive claims, and competitor observations.
- Prefer official, primary, and credible sources for current claims.
- Keep recommendations specific to the topic and market; avoid generic SEO advice.
- Avoid keyword stuffing and avoid presenting raw keyword dumps without an editorial purpose.
- Respect site access restrictions, robots policies, and applicable search/API terms.
- If the user asks for an article after receiving the brief, ask whether they want a separate writing workflow based on this approved blueprint.
