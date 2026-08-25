# AI Citability Research — wAIbi-sabi (janmejai2002.github.io)

Research date: 2026-08-26. Scope: what actually makes a small static blog get retrieved and cited by AI assistants (ChatGPT, Claude, Perplexity, Gemini, Copilot) in 2026, and what a GitHub Pages site with no server logs can realistically do about it. Every claim below is sourced; anything without a hard source is explicitly flagged as inference, folklore, or vendor marketing.

**Current site facts used throughout this doc** (verified 2026-08-26):
- `robots.txt` is exactly:
  ```
  User-agent: *
  Allow: /

  Sitemap: https://janmejai2002.github.io/sitemap-index.xml
  ```
  This blanket-allows every crawler, including every AI training bot. No AI-specific rules exist today.
- 7 published articles, each with a "Reader Question" and an "Executive TL;DR" bullet block — a format that structurally resembles the Q&A shape LLMs like to lift from.
- Hosted on `github.io` (no custom domain confirmed), meaning no CDN and no server access logs (see §6).
- JSON-LD is described as "basic" by the owner; no confirmed Person/author entity with `sameAs` links as of this writing.

---

## 1. How AI assistants actually select and cite sources in 2026

### 1.1 The retrieval pipelines, per assistant

**ChatGPT (web/search mode).** ChatGPT's browsing/search feature does not run its own general web index. It fans a prompt out into sub-queries, sends them to **Bing's index** (via a licensed Bing API relationship), retrieves and chunks the top-ranking pages, and then a ranking/selection step picks passages to ground the answer, with only a fraction of retrieved pages surviving into a visible citation. Estimates put the fraction actually cited as low as ~15% of retrieved pages, meaning most of what ChatGPT reads is discarded silently [AirOps](https://www.airops.com/blog/chatgpt-decides-sources-cite). OpenAI runs three distinct crawler identities for this pipeline — see §2. Separately, ChatGPT also draws on parametric (trained-in) knowledge and does not always browse; browsing triggers on recency cues, explicit "search" requests, or the model's own confidence gap [ZipTie](https://ziptie.dev/blog/how-does-chatgpt-choose-its-sources/), [Leapd](https://www.leapd.ai/blog/ai-visibility/how-chatgpt-google-ai-overviews-and-perplexity-source-information-in-2026).

**Perplexity.** Perplexity is the one major assistant that runs its **own crawl and its own index** rather than fully outsourcing to Bing/Google — `PerplexityBot` builds a persistent background index specifically so Perplexity can cite pages, distinct from `Perplexity-User`, which fetches a page live when answering a user's specific question [51Degrees](https://51degrees.com/blog/perplexity-ai-2026), [Perplexity Help Center](https://www.perplexity.ai/help-center/en/articles/10354969-how-does-perplexity-follow-robots-txt). Perplexity states PerplexityBot is not used to train foundation models — only to power citations [Perplexity crawler docs](https://docs.perplexity.ai/docs/resources/perplexity-crawlers). **Important caveat on trustworthiness**: Cloudflare published a technical report in August 2024 accusing Perplexity of "stealth crawling" — ignoring `robots.txt` Disallow rules and rotating through undeclared IPs and a generic Chrome user-agent (not `PerplexityBot`) to continue pulling content from domains that had explicitly blocked it, with an estimated 3–6 million daily requests attributed to the undeclared crawler alongside 20–25 million from the declared one. Cloudflare de-listed Perplexity from its verified-bot program as a result; Perplexity disputed the attribution, blaming a third-party browser-automation service it uses ("Browserbase") for some of the traffic [ppc.land](https://ppc.land/perplexity-denies-training-ai-models-as-cloudflare-documents-stealth-crawlers/), [AlternativeTo](https://alternativeto.net/news/2025/8/cloudflare-accuses-perplexity-of-evading-ai-crawler-blocks-on-sites-using-stealth-tactics). Practical implication: a `Disallow` for `PerplexityBot` is not a hard guarantee of exclusion from Perplexity's index; it is a compliance signal a responsible actor should honor, and evidence suggests Perplexity's honoring of it has been inconsistent.

**Google (AI Overviews / Gemini).** AI Overviews run on top of the **standard Google Search index** — the crawler is ordinary Googlebot, not a separate AI-only crawler. `Google-Extended` is a *separate, downstream-use* opt-out token: it does not gate crawling or indexing at all, only whether the already-crawled content may additionally be used to train Gemini/Bard-family models. Blocking `Google-Extended` has **no effect** on whether a page can appear inside an AI Overview, because AI Overviews draw from the same index Search results draw from [PushLeads](https://pushleads.com/google-extended-crawler/), [ZeroKit](https://zerokit.dev/guides/block-google-extended.html). This is a common source of confusion in SEO blogs and worth stating precisely for this site.

**Microsoft Copilot / Bing Chat.** Documented as a "retrieve → rank → generate → cite" pipeline built on Bing's index plus live web fetches, with Bing Webmaster Tools now exposing a public-preview "AI Performance" report showing citation counts and grounding queries specifically for Copilot [Bing Webmaster blog, Feb 2026](https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview), [Pedowitz Group](https://www.pedowitzgroup.com/how-bing-copilot-sources-answers-aeo-for-microsoft-search). Because Copilot sits on the Bing index, **anything that helps Bing crawl/index a page (including IndexNow — see §5) plausibly helps Copilot citation freshness**, though this is a logical inference from the shared-index architecture, not a separately measured causal study.

**Claude.** Anthropic's web-search-enabled Claude retrieves via its own `Claude-SearchBot` index plus a `Claude-User` live-fetch path when a user's question needs a specific page (see §2). Less third-party literature exists quantifying Claude's citation-selection behavior specifically, versus ChatGPT/Perplexity, which dominate the "GEO" blog literature.

### 1.2 What correlates with being cited — separating evidence from folklore

This is the single most contaminated area of the research landscape: the term "GEO" (Generative Engine Optimization) has been adopted by a large SEO-content industry publishing near-identical, uncited "12 tips to get cited" listicles. Below, evidenced findings (peer-reviewed or large controlled studies) are separated from repeated-but-unverified marketing claims.

**Reasonably evidenced (peer-reviewed / large controlled studies):**
- A 2026 critical survey covering the GEO literature from 2023–2026 concludes: "the evidence is strong for a causal effect conditional on context, moderate for certain informational properties, and weak for transmission through to traffic" — meaning once a page is *already retrieved into the model's context*, specific rewrites can shift whether it gets cited, but there is **no reviewed technique showing a stable, longitudinal, cross-platform effect on organic discoverability** (i.e., getting retrieved in the first place) [arXiv 2607.14035](https://arxiv.org/html/2607.14035v1).
- The foundational GEO paper's widely-repeated "+40% visibility" figure is a *relative maximum on one metric under one fixed 5-document context*, not a general ranking promise — the survey explicitly warns against generalizing it [arXiv 2607.14035](https://arxiv.org/html/2607.14035v1).
- A large factorial experiment (252,000 trials across six LLMs, eighteen factors) found **relevance and context position are the primary determinants** of which retrieved document gets the first citation — "moving a source higher in the context has a greater effect than most rewrites" [arXiv summary via search](https://arxiv.org/pdf/2604.25707).
- Adding machine-extractable, verifiably-true content — direct quotations, statistics, explicit prices/dates — produced measurable lift (roughly +25–41% in various trials) in controlled tests, whereas **formatting changes alone (headers, bullets) had weak, unstable effects** when tested in isolation [arXiv survey](https://arxiv.org/html/2607.14035v1).
- Repeatability is poor: identical queries at temperature zero changed which sources got cited 9–28% of the time across repeated runs, and cross-platform source overlap is low (Jaccard similarity 0.11–0.34 between engines) — meaning "getting cited once" is not a stable, transferable state, and a lot of single-run case-study blog posts are likely reporting noise [arXiv 2607.14035](https://arxiv.org/html/2607.14035v1).
- A large-scale study using real (not fixed-context) retrieval — SAGEO Arena — found that body-copy-only optimization *reduced* top-20 presence by 9% and citations by 6%, the opposite of what fixed-context lab benchmarks predict. This is a strong caution against generalizing lab-style GEO experiments to real retrieval [arXiv 2607.14035](https://arxiv.org/html/2607.14035v1).
- C-SEO Bench testing of generic "GEO methods" across domains found only 3 of 54 method–domain combinations produced a statistically significant positive effect — i.e., most popular "GEO tactics" don't reliably do anything when tested rigorously [arXiv 2607.14035](https://arxiv.org/html/2607.14035v1).

**Repeated in SEO-blog literature, weaker/uncontrolled evidence (treat skeptically):**
- "Sites with 32,000+ referring domains are 3.5x more likely to be cited than sites under 200" — a domain-authority correlation reported by a content-marketing vendor (Ahrefs-style study cited via AirOps), not a controlled experiment; correlation plausibly reflects that authoritative sites are also more topically comprehensive and more frequently linked, not that "referring domains" is itself a causal lever a small blog can pull [AirOps](https://www.airops.com/blog/chatgpt-decides-sources-cite).
- "ChatGPT-cited pages average 458 days newer than Google's organic results" — a real, oft-cited Ahrefs-style freshness finding, directionally consistent with browse-mode favoring recency, but from a single vendor's crawl analysis rather than a peer-reviewed study [AirOps](https://www.airops.com/blog/chatgpt-decides-sources-cite).
- "44.2% of citations come from the first 30% of page content" — plausible (front-loading answers is generally good practice) but again a single vendor content-marketing statistic, not independently replicated [getpassionfruit](https://www.getpassionfruit.com/blog/how-llms-search-for-citations-what-they-look-for-and-what-they-actually-find).
- Numerous "12 GEO tips" articles (schema, FAQ blocks, "authoritative tone," keyword density) largely repeat each other without original data. The critical survey explicitly calls this out: "claims about GEO return on investment clearly outstrip the academic evidence" [arXiv 2607.14035](https://arxiv.org/html/2607.14035v1).

**Bottom line for this site:** the one lever with real evidence behind it is making pages *retrievable in the first place* (crawlable, indexed by Bing/Google, fresh, topically unambiguous) and, once retrieved, making the specific answer to the stated question easy to lift verbatim near the top of the page — which the site's existing "Reader Question → Executive TL;DR" format already does structurally. Chasing "GEO tactics" beyond that (keyword-stuffed schema, forced FAQ blocks, "authority" tricks) has weak-to-no controlled support.

---

## 2. The AI crawler landscape — user-agents, purpose, and tradeoffs

### 2.1 What each bot is actually for

| User-agent | Operator | Function | Respects robots.txt? |
|---|---|---|---|
| `GPTBot` | OpenAI | Crawls to collect training data for future foundation models. Not used for live retrieval. | Yes, documented [OpenAI bots docs](https://developers.openai.com/api/docs/bots) |
| `OAI-SearchBot` | OpenAI | Crawls/indexes specifically to surface pages in ChatGPT's search results (the retrieval-layer index, separate from training). | Yes [OpenAI bots docs](https://developers.openai.com/api/docs/bots) |
| `ChatGPT-User` | OpenAI | Fires when a live user's prompt triggers a real-time fetch (browsing, Custom GPT Actions). | OpenAI's own docs say these user-triggered requests "may not apply" robots.txt rules the way an automated crawler would [OpenAI bots docs](https://developers.openai.com/api/docs/bots) |
| `OAI-AdsBot` | OpenAI | Validates ad landing pages for OpenAI's ad products. Irrelevant to a content blog. | Unspecified |
| `ClaudeBot` | Anthropic | Training-data collection crawler. | Yes, documented [SearchEngineLand](https://searchengineland.com/anthropic-claude-bots-470171) |
| `Claude-SearchBot` | Anthropic | Indexes/evaluates content quality to feed Claude's retrieval/answer layer — not training. | Yes |
| `Claude-User` | Anthropic | Live fetch when a Claude user's question requires a specific page. | **Yes** — Anthropic is notable for stating all three of its bots, including the user-triggered one, honor robots.txt, unlike OpenAI/Perplexity/Google/Meta's user-agent fetchers [SearchEngineLand](https://searchengineland.com/anthropic-claude-bots-470171), [Search Engine Journal](https://www.searchenginejournal.com/anthropics-claude-bots-make-robots-txt-decisions-more-granular/568253/) |
| `PerplexityBot` | Perplexity | Background crawl to build/refresh Perplexity's own citation index. Not used for foundation-model training, per Perplexity [Perplexity crawler docs](https://docs.perplexity.ai/docs/resources/perplexity-crawlers) | Documented as respecting it, but see §1.1 stealth-crawling controversy — enforcement in practice has been disputed [ppc.land](https://ppc.land/perplexity-denies-training-ai-models-as-cloudflare-documents-stealth-crawlers/) |
| `Perplexity-User` | Perplexity | Live fetch for a specific user question. | Same caveat as above |
| `Google-Extended` | Google | Not a crawler at all — a *usage* opt-out token evaluated against content already fetched by regular Googlebot. Governs only whether the content feeds Gemini/Bard-family training, not Search or AI Overviews. | N/A (governs downstream use, not crawling) [ZeroKit](https://zerokit.dev/guides/block-google-extended.html) |
| `Googlebot` | Google | Standard search crawler; also the crawler feeding AI Overviews since AI Overviews sit on the regular index. | Yes (long-standing) |
| `Bingbot` | Microsoft | Standard search crawler; the index Copilot and (via licensing) ChatGPT search draw from. | Yes |
| `CCBot` | Common Crawl (nonprofit) | Builds the open Common Crawl dataset, which many labs' foundation models (including some early GPT and Claude training runs, and countless smaller/open-source models) train on indirectly. Not a "final" consumer — a redistributable corpus. | Yes |
| `Applebot-Extended` | Apple | Analogous opt-out token for Apple Intelligence / Siri training use of already-crawled `Applebot` content. | N/A, governs downstream use |
| `Bytespider` | ByteDance | Training crawler for ByteDance/TikTok AI products. Documented as aggressive and, per several crawler trackers, inconsistent about respecting robots.txt. | Disputed in practice |
| `Amazonbot` | Amazon | Crawls partly for Alexa/product-answer features. | Yes, documented |

Sources for the table as a set: [OpenAI bots docs](https://developers.openai.com/api/docs/bots), [Anthropic crawler coverage](https://searchengineland.com/anthropic-claude-bots-470171), [Perplexity crawler docs](https://docs.perplexity.ai/docs/resources/perplexity-crawlers), [Google-Extended explainer](https://pushleads.com/google-extended-crawler/), [No Hacks 2026 landscape reference](https://nohacks.co/blog/ai-user-agents-landscape-2026), [Momentic crawler list](https://momenticmarketing.com/blog/ai-search-crawlers-bots).

### 2.2 The tradeoff, in one sentence

**Training crawlers (`GPTBot`, `ClaudeBot`, `CCBot`, `Google-Extended`, `Applebot-Extended`, `Bytespider`) give nothing back and cost you nothing to allow on a static site** — they don't drive citations or referral traffic, they only feed a future model's weights, which is a one-way value transfer to the vendor. **Retrieval/index crawlers (`OAI-SearchBot`, `Claude-SearchBot`, `PerplexityBot`, `Bingbot`, `Googlebot`) are the ones that can actually put this site's content in front of a user as a citation** — blocking these directly removes any chance of being cited by that assistant. **User-triggered fetchers (`ChatGPT-User`, `Claude-User`, `Perplexity-User`) matter for a narrower case**: a live user directly pasting/asking about a specific page on this blog.

Quantified evidence on the training-crawler "value transfer" imbalance: Cloudflare Radar data from July 2026 shows a **crawl-to-referral ratio of roughly 2,237:1 for Anthropic's ClaudeBot and 217:1 for OpenAI's GPTBot** (i.e., thousands of training-crawl requests for every one click sent back to the site), while Cloudflare's aggregate July 2026 breakdown put **44.5% of all AI-crawler requests in the pure-training bucket versus just 2.7% in live user-triggered fetches** [SEOmator](https://seomator.com/blog/crawl-to-refer-ratio-ai-crawlers-llm-bots). This is the empirical basis for treating training and retrieval crawlers as different categories with different incentives — training bots consume bandwidth and content with no attribution mechanism at all, while retrieval bots are the only pathway to the stated goal (citations).

### 2.3 Recommended `robots.txt` posture — options

**Option A — Allow everything (status quo).** Keep `Allow: /` for `User-agent: *`. Simplest; maximizes surface area for every assistant's retrieval layer; also donates all content to every training crawler with zero attribution or compensation. Reasonable if the owner is indifferent to training use and prioritizes not accidentally blocking some future/unlisted retrieval bot.

**Option B — Allow retrieval/search bots explicitly, block training bots explicitly.**
```
User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: Claude-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Perplexity-User
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Googlebot
Allow: /

User-agent: GPTBot
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: Applebot-Extended
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: Bytespider
Disallow: /

User-agent: *
Allow: /

Sitemap: https://janmejai2002.github.io/sitemap-index.xml
```
This is the configuration explicitly described in industry guidance as the setup "for those who want AI search visibility without contributing to foundation model training" [Momentic](https://momenticmarketing.com/blog/ai-search-crawlers-bots). Caveats: (1) this list of bot names needs periodic refreshing — new user-agents appear roughly quarterly; (2) blocking `GPTBot` does not remove the site from ChatGPT's *search* citations, since that runs through the separately-allowed `OAI-SearchBot`; (3) `Google-Extended` and `Applebot-Extended` don't affect crawling/indexing at all (see §2.1), so disallowing them is purely a training opt-out with zero downside to visibility; (4) as noted in §1.1, a `Disallow` for Perplexity's bots is a compliance request, not an enforced technical barrier, given Perplexity's documented history.

**Option C — Block everything AI-related, rely purely on human traffic and traditional SEO.** Directly contradicts the stated goal (being the blog AI assistants cite), so not evaluated further.

**Recommendation: Option B.** Given the explicit goal is to become a cited source, blocking any retrieval-layer bot is self-defeating. Given the content is intentionally public writing meant to be read and cited (not proprietary/monetized in a way training-use would cannibalize), blocking the pure-training bots costs nothing toward the citation goal and is a reasonable stance against uncompensated model training on original writing — genuinely a judgment call the owner should make, not a settled technical necessity. The one nuance worth being deliberate about: Common Crawl (`CCBot`) output is reused by many downstream projects, including some the site *might* want to reach (smaller/open research models); blocking it is a stance against the broadest possible redistribution, not against a single vendor.

---

## 3. llms.txt — current state of adoption in 2026

**Short answer: skip it, or ship a minimal one in five minutes and move on — do not invest real effort here.**

- **No major AI assistant provider consumes it for discovery or retrieval.** A 2026 aggregate analysis of 515 million bot events found requests for `/llms.txt` are a negligible share of AI-crawler traffic, and none of OpenAI, Anthropic, Perplexity, or Google has committed to using it as a retrieval input [aeo.press](https://www.aeo.press/ai/the-state-of-llms-txt-in-2026).
- **Adoption is low even among large companies**: only 7.4% of Fortune 500 companies (37 of 500) had shipped one by March 31, 2026 [aeo.press](https://www.aeo.press/ai/the-state-of-llms-txt-in-2026).
- **The one real exception**: developer-documentation sites adopted it faster than any other category, because **coding agents (not chat assistants) are the one class of consumer that demonstrably reads `llms.txt` today** — tools like Cursor, Windsurf, and various agent frameworks use it as a map when an agent is told to work against a specific doc site [aeo.press](https://www.aeo.press/ai/the-state-of-llms-txt-in-2026). This doesn't apply to a blog about applied AI aimed at human readers and chat-assistant citation, not coding-agent consumption.
- **Direct measurement shows zero citation lift.** SE Ranking built an XGBoost model to test whether `llms.txt` presence predicts AI citation frequency; removing the `llms.txt` variable *improved* the model's prediction accuracy, meaning the file was contributing noise, not signal [aeo.press](https://www.aeo.press/ai/the-state-of-llms-txt-in-2026).

**If shipped anyway** (near-zero cost, plausible small upside if adoption shifts later, no downside): keep it genuinely minimal — a short site description, a link to the sitemap, and a bullet list of the 7 article titles + URLs + one-line descriptions, in the format the original llms.txt spec proposes (H1 title, blockquote summary, H2-grouped links). For example:

```markdown
# wAIbi-sabi

> A blog about applied AI, answering real reader questions with sourced, TL;DR-first articles.

## Articles
- [Article title 1](https://janmejai2002.github.io/article-1): one-line description
- [Article title 2](https://janmejai2002.github.io/article-2): one-line description

## Optional
- [Sitemap](https://janmejai2002.github.io/sitemap-index.xml)
- [RSS](https://janmejai2002.github.io/rss.xml)
```

Do not treat it as a place to duplicate the "Executive TL;DR" content or invest structured writing effort, since the evidence says nothing currently reads it that would put that writing to use. Revisit this decision if a future, credible source shows a major assistant provider announcing it actually consumes `llms.txt` for retrieval — as of this research, none has.

---

## 4. Structured data — what plausibly helps

### 4.1 The FAQPage/QAPage situation has changed materially in 2026 — this matters for a Q&A-shaped blog

- **Google deprecated FAQ rich results entirely.** A deprecation notice was added to Google's FAQPage documentation on **May 8, 2025**; FAQ rich results **stopped appearing in Google Search results on May 7, 2026**; Google removed FAQ support from the Rich Results Test and Search Console report in June 2026; the FAQPage documentation itself was removed June 15, 2026 with a note that "the FAQ rich result feature is no longer shown in Google Search results" [Google FAQPage docs, verified via fetch](https://developers.google.com/search/docs/appearance/structured-data/faqpage), [getpassionfruit](https://www.getpassionfruit.com/blog/what-changed-with-google-drops-faq-rich-results-and-what-to-do-now).
- Before this, Google had already narrowed FAQPage eligibility in 2023 to primarily government and health sites — so this content type was already a shrinking target, not a stable one, well before the full removal [thehoth.com](https://www.thehoth.com/blog/google-faq-rich-results-deprecated/).
- **`FAQPage` schema is still valid Schema.org markup and can remain on pages without causing errors** — Google's own guidance is that unused structured data does not harm a site — but it now buys **nothing** from Google Search specifically (no rich result, no SERP feature) [getpassionfruit](https://www.getpassionfruit.com/blog/what-changed-with-google-drops-faq-rich-results-and-what-to-do-now).
- **`QAPage`** was always narrower and remains distinct in intent: it's for forum-style pages where *multiple users* submit candidate answers to one question (e.g., a Q&A forum thread), not for a single-author blog post that states a question and answers it itself. This site's articles — one author, one stated question, one authored answer — are **not** a `QAPage` fit; they were arguably closer to `FAQPage`/`Article` hybrids, and now that FAQPage buys nothing from Google, the honest recommendation is: **mark articles as `Article`/`BlogPosting`, not `FAQPage`.**
- **Implication specific to this site's format**: the "Reader Question above the title, Executive TL;DR below it" structure should be thought of as a *content/UX pattern that helps LLM extraction directly from the prose* (§1.2's evidenced finding that clear, front-loaded, quotable answer text correlates with citation), **not** as something that needs — or benefits from — `FAQPage`/`QAPage` markup to work. The markup layer and the extraction-friendliness layer are separate; this site should keep investing in the latter and stop expecting schema to be the mechanism.

### 4.2 What's still worth doing

- **`Article` or `BlogPosting` (JSON-LD) on every post**, with `headline`, `datePublished`, `dateModified`, `author` (a nested `Person`), and `publisher` (an `Organization`). This is standard, still fully supported, and functions independently of the FAQ deprecation [dev.to Article schema guide](https://dev.to/forze-dev/article-schema-markup-the-complete-guide-to-structured-data-for-blog-posts-and-articles-2e6o). Use `BlogPosting` specifically, since that's the more precise type for this content [mo.agency](https://www.mo.agency/blog/schema-markup-for-aeo).
- **Author `Person` entity with `sameAs`** pointing to the owner's real identity signals (GitHub, LinkedIn, etc. — the footer already links these per the site content, but they aren't in structured data yet). This is the concrete, evidenced E-E-A-T mechanism: `author.name` should be a bare name (no title stuffing), with `jobTitle`/`worksFor` as separate properties, and `sameAs` linking to authoritative profiles [dev.to](https://dev.to/forze-dev/article-schema-markup-the-complete-guide-to-structured-data-for-blog-posts-and-articles-2e6o). This matters less as a "rich result trigger" and more because LLM-based summarization/citation pipelines and Google's own quality systems use authorship/entity clarity as a trust signal when deciding what to surface — this is one of the few structured-data items with a plausible mechanism connecting it to citation-worthiness, not just SERP decoration.
- **`speakable`**: low priority. It is scoped to news publishers, functions only for U.S. English content, and Google itself frames it as "a limited feature," though it has a plausible secondary path into AI-answer-layer snippet selection because it flags which sentences are meant to stand alone as a spoken/quotable answer [levyonline](https://www.levyonline.com/blog/speakable-structured-data/), [aiso-hub](https://aiso-hub.com/insights/speakable-schema-seo/). Given the effort/fit ratio (news-site-scoped feature applied to a non-news applied-AI blog), this is not a priority — mentioned for completeness, not recommended as near-term work.
- **`WebSite` + `Organization`/`Person` on the homepage**, and consistent `sameAs` across all schema instances — the low-cost, still-functioning half of "E-E-A-T structured data," independent of the FAQ situation.
- **Skip `FAQPage` and `QAPage`** going forward for new articles, given §4.1. If existing pages already have `FAQPage` markup from a previous phase, it is safe to leave it (no penalty) but not worth adding to new posts.

---

## 5. IndexNow — protocol, adoption, and plausible effect on AI assistants

### 5.1 Exact protocol

- **Key file**: generate a random key (8–128 hex characters), publish it as `https://yoursite.com/{key}.txt` containing just the key text, UTF-8 encoded. Optionally host it elsewhere and reference it via a `keyLocation` parameter, but a key at path `/catalog/{key}.txt` can only authorize URLs under `/catalog/` [IndexNow.org docs](https://www.indexnow.org/documentation).
- **Single-URL submission**: a simple GET —
  `https://<searchengine>/indexnow?url=<url>&key=<key>&keyLocation=<optional>`
- **Batch submission** (recommended for a site publishing multiple pages or updating many at once): a POST to `/indexnow` with JSON body:
  ```json
  {
    "host": "janmejai2002.github.io",
    "key": "your-hex-key",
    "keyLocation": "https://janmejai2002.github.io/your-hex-key.txt",
    "urlList": ["https://janmejai2002.github.io/post-1", "https://janmejai2002.github.io/post-2"]
  }
  ```
  supporting up to **10,000 URLs per request** [IndexNow.org docs](https://www.indexnow.org/documentation).
- **Response codes**: 200 (accepted), 202 (received, pending validation), 400 (malformed), 403 (bad/missing key), 422 (URL doesn't match host/key path), **429 (rate-limited — check the `Retry-After` header and back off; reduce batch frequency)** [IndexNow.org docs](https://www.indexnow.org/documentation), [gracker.ai](https://gracker.ai/seo-101/indexnow-protocol-seo-guide).
- **A single submission to one participating engine propagates to all of them** — submit once to Bing's endpoint and Yandex, Seznam.cz, and Naver also receive it, since they're consortium members sharing the same key-verification and submission protocol [indexernow.com](https://www.indexernow.com/blog/indexnow-bing-explained).

### 5.2 Who actually consumes it

**Confirmed participants**: Bing, Yandex, Seznam.cz, Naver, Yep [indexernow.com](https://www.indexernow.com/google-indexnow), [pressonify.ai](https://pressonify.ai/blog/indexnow-instant-indexing-press-releases-2026).

**Google does not participate.** Google tested IndexNow around 2021–2022 and explicitly declined to adopt it; submissions to IndexNow have **zero effect** on Google's own crawling or indexing. Google maintains a separate, much narrower "Indexing API" limited to job-posting and livestream content types — not applicable here [pressonify.ai](https://pressonify.ai/blog/indexnow-instant-indexing-press-releases-2026), [definitivecalc.com](https://definitivecalc.com/blog/what-is-indexnow-and-why-is-google-still-not-participating). This means IndexNow is irrelevant to Google Search itself, AI Overviews, and Gemini's retrieval — all of which sit on Google's own index.

### 5.3 Plausible (but not separately measured) effect on AI assistants

Since **Bing's index is the substrate Microsoft Copilot answers from, and the substrate ChatGPT's search/browse mode queries via its Bing relationship**, IndexNow pings to Bing can plausibly shorten the lag between publishing/updating a post and that content becoming visible to Copilot and ChatGPT search — vendor content repeatedly makes this causal chain explicit: "Bing can index a new or changed page within minutes of an IndexNow ping instead of waiting for the next crawl cycle," and "IndexNow is a Bing-and-downstream tool… exactly the thing that matters for AI Search citations" [1digitalagency-style sourcing via search](https://geoscout.pro/en/blog/bing-copilot-and-indexnow-for-faster-content-discovery). **This should be read as a reasoned inference from documented architecture (Bing index → Copilot/ChatGPT search), not as a separately-measured, controlled finding that IndexNow submission causes more AI citations.** No source found in this research ran a controlled A/B test isolating IndexNow's effect on AI-assistant citation rate specifically — every claim traces back to "faster Bing indexing" plus the (true) architectural fact that Bing feeds those two assistants.

### 5.4 Recommendation for this site

Worth doing — low effort, mechanically sound, and the causal chain to Bing/Copilot/ChatGPT-search freshness is architecturally real even if not independently measured for the AI-citation step specifically:
1. Generate a key, publish `{key}.txt` at the site root (trivial on GitHub Pages — it's a static file).
2. On each publish/update (this is a static Astro site with a build step — wire it into the GitHub Actions deploy workflow), POST the changed URL(s) to Bing's IndexNow endpoint in a batch call.
3. Respect 429s with backoff; for a 7-article blog publishing infrequently, rate limits will essentially never be a concern.
4. Do not expect this to move Google, AI Overviews, Gemini, Perplexity, or Claude citation behavior — only Bing-lineage surfaces (Bing search, Copilot, and by architectural inference ChatGPT's Bing-backed search mode).

A minimal implementation sketch for the existing GitHub Actions deploy workflow (illustrative, not a tested drop-in): after the Astro build/deploy step succeeds, diff the new sitemap against the previous deployed one (or just resubmit the full URL list on every deploy, since a 7-article site is well under the 10,000-URL batch cap), then POST the changed URLs to `https://www.bing.com/indexnow` with the JSON body shown in §5.1. Because the whole consortium shares submissions, one POST to Bing is sufficient — there is no need to separately ping Yandex, Seznam, or Naver.

---

### 5.5 Reader-facing sitemap and RSS accuracy still matter more than IndexNow

IndexNow is a push notification, not a substitute for the pull-based signals every crawler still falls back on. Keep `sitemap-index.xml` and the RSS feed accurate and always reachable — a broken or stale sitemap undermines both Bing's own periodic crawl and any AI crawler that discovers pages via the sitemap rather than a specific IndexNow ping (this applies to every training/indexing bot in §2's table, since IndexNow itself is Bing-consortium-only and does nothing for OpenAI's, Anthropic's, or Perplexity's own crawlers).

---

## 6. Detecting AI-driven readership on a GitHub Pages site

### 6.1 The structural blind spot

**GitHub Pages provides no server access logs at all** — there is no way to see raw request logs, IPs, or user-agents server-side, which is the primary way sites normally detect crawler/bot traffic (the standard method: `grep` server logs for `GPTBot`, `ClaudeBot`, `PerplexityBot`, etc.) [multiple sources converge, e.g. digitalapplied.com server-log detection guide](https://www.digitalapplied.com/blog/server-log-ai-agent-detection-beyond-ga4-2026), [openshadow.io](https://www.openshadow.io/guides/monitor-ai-bot-traffic). This is the single biggest measurement constraint for this site.

**Client-side analytics (GA4 or any JS-based tool) structurally cannot see most AI crawler traffic**, because almost none of the AI crawlers (`GPTBot`, `OAI-SearchBot`, `ClaudeBot`, `Claude-SearchBot`, `PerplexityBot`) execute JavaScript — they fetch raw HTML. A JS-based analytics snippet will simply never fire for these requests, meaning **training/indexing crawler visits are invisible to GA4 or any client-side tool by construction**, not due to misconfiguration [xergioalex.com](https://xergioalex.com/blog/tracking-invisible-ai-bot-analytics/), [getcito.com](https://getcito.com/how-to-detect-ai-crawlers-on-your-website).

### 6.2 What IS measurable on this stack — the user-triggered-fetch/referral case only

Client-side analytics **can** see something different and genuinely useful: **human traffic arriving *from* an AI assistant's answer**, because when a human clicks a citation link inside ChatGPT/Perplexity/Copilot's UI, their browser (a real browser, running JS) sends the request with a `Referer` header pointing at the assistant's domain (`chatgpt.com`, `perplexity.ai`, `copilot.microsoft.com`, `gemini.google.com`) — this is a normal analytics event, not a bot-detection problem.

- **As of May 2026, GA4 ships a native "AI Assistant" acquisition channel** that automatically buckets ChatGPT, Gemini, and Claude referrals — but **it does not cover Perplexity**, so Perplexity referrals still need a manual custom-channel rule (Source regex matching `perplexity\.ai|chatgpt\.com|gemini\.google\.com|copilot\.microsoft\.com`, Medium = referral) [darwinapps.com](https://www.darwinapps.com/blog/how-to-track-chatgpt-gemini-and-perplexity-referral-traffic-in-ga4-and-crm/), [rankshift.ai](https://www.rankshift.ai/blog/how-to-track-perplexity-referrals-in-ga4/).
- **A large share of AI-assistant-originated clicks — reportedly over a third — arrive with no referrer at all** (mostly from native mobile apps, which often strip referrer headers), and land in GA4's "Direct" bucket indistinguishable from a bookmark visit or typed URL. **No tool can recover these** from client-side data alone; this is a hard ceiling on what's measurable, not a tooling gap [rankshift.ai](https://www.rankshift.ai/blog/how-to-track-chatgpt-referrals-in-ga4/).
- **What's genuinely actionable for this site**: since the current setup is (per the brief) "client-side analytics only," the realistic, honest measurement plan is: (1) confirm whatever analytics tool is in use has the AI-referral channel/custom-channel-group configured for all five assistant domains, (2) treat the resulting number as a **floor, not a ceiling**, on actual AI-driven readership, given the app-referrer blind spot, (3) do **not** attempt to infer training/indexing-crawler visit volume from this stack at all — that data category is simply unavailable without a server or CDN in front of the site.

### 6.3 If more visibility is wanted later

The only way to see crawler-level traffic (`GPTBot`, `PerplexityBot` hit counts, etc.) on this architecture would be to put a CDN/proxy in front of the `github.io` origin via a custom domain (e.g., Cloudflare on a custom domain pointed at GitHub Pages), which would then have its own edge logs and, on paid tiers, bot-analytics dashboards; Cloudflare's free tier includes basic bot *fight mode* but reserves bot-score analytics for Business/Enterprise plans [Cloudflare bot solutions docs](https://developers.cloudflare.com/bots/). This is a real, concrete option but is an infrastructure change beyond "measure what exists today," so it's flagged here as a future option rather than a near-term recommendation.

---

## 7. The query feedback loop — GSC + Bing Webmaster Tools + client-side analytics for topic selection

### 7.1 What data each source realistically provides

- **Google Search Console**: query-level impressions, clicks, CTR, and average position, but capped at roughly 1,000 rows in the UI — full data requires the Search Console API (or a BigQuery export) to get beyond that cap [multiple GSC/BWT comparison sources](https://embryo.com/blog/analysing-bing-webmaster-tools/). For a 7-article blog, the 1,000-row UI cap is very unlikely to be a real constraint yet, but it's worth knowing the API path exists if the site grows.
- **Bing Webmaster Tools**: the same click/impression/CTR/position metrics for Bing, **plus a keyword-research module built on real user query data segmented by country/device/language** — this is a genuinely distinct capability GSC doesn't offer in the same form, and directly useful for spotting adjacent-topic demand [SEOZoom](https://www.seozoom.com/bing-webmaster-tools/). Bing Webmaster Tools' new **"AI Performance" report (public preview, Feb 2026)** additionally surfaces citation counts and grounding queries specifically for Copilot/Bing AI summaries — this is the closest thing available today to direct "which of my pages got cited by an AI assistant, and for what query" data, and it's Bing-specific [Bing Webmaster blog](https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview).
- **Client-side analytics**: as covered in §6, mainly useful here for confirming which *published* articles actually get read (session counts, engagement, referral source breakdown), not for discovering *unmet* query demand the way GSC/BWT impression data can.

### 7.2 What practitioners actually do with this combination (general practice, not this-site-specific)

- The standard workflow is: pull GSC queries where the page ranks (impressions exist) but CTR or position is weak, treat those as "partially answered" topics worth a dedicated article or an update to an existing one; separately, pull *zero-click, high-impression* queries as candidate net-new topics, since impressions-without-clicks on a query the site doesn't have a dedicated page for is a demand signal with no supply yet.
- Bing's keyword-research module is used the same way but sourced from Bing's query stream, which skews toward a different (often older, more enterprise, more US-Microsoft-ecosystem) demographic than Google's — useful as a second, non-redundant demand signal rather than a duplicate of GSC.
- **For an automated topic-selection routine specifically** (which the brief implies is the eventual goal, given the mention of "an automated topic-selection routine"): the realistic feed is (a) GSC Search Analytics API pull of queries/impressions/CTR/position per page on a schedule, (b) Bing Webmaster Tools API pull of the same plus its keyword-research data, (c) a simple rule layer that flags queries above an impression threshold with no dedicated article, or with an existing article ranking outside position ~10, as candidates for the radar/pitch pipeline already described in the user's Notion "AI Blog OS Command Center." This is a synthesis of general SEO content-ops practice applied to the tools mentioned, not a claim any specific "AI citation feedback loop" product exists that automates this end-to-end — no such packaged tool specific to *AI-assistant* citation feedback (as opposed to classic search-query feedback) was found in this research; the Bing AI Performance report (§7.1) is the closest primitive, and it is new (public preview, Feb 2026) and Bing-only.
- **Important limitation to flag explicitly**: none of GSC, Bing Webmaster Tools (outside the new Bing-only AI Performance preview), or client-side analytics can currently tell this site anything about ChatGPT, Perplexity, Claude, or Gemini citation behavior directly — that data category (which pages get cited, for what underlying prompt, how often) simply isn't exposed by any of these tools today except the narrow Bing/Copilot case. Practitioners currently substitute manual/scripted "ask the assistant your target questions and see if you're cited" spot-checks for this gap — a real but labor-intensive practice, not a data feed.

---

---

## Appendix A: exact user-agent strings (for robots.txt / log matching)

Verified against the operators' own documentation where available; treat third-party trackers as secondary confirmation only.

- `OAI-SearchBot`: `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36; compatible; OAI-SearchBot/1.4; +https://openai.com/searchbot` [OpenAI bots docs](https://developers.openai.com/api/docs/bots)
- `GPTBot`: `Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.4; +https://openai.com/gptbot` [OpenAI bots docs](https://developers.openai.com/api/docs/bots)
- `ChatGPT-User`: `Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot` [OpenAI bots docs](https://developers.openai.com/api/docs/bots)
- `PerplexityBot`: `Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)` [Perplexity crawler docs](https://docs.perplexity.ai/docs/resources/perplexity-crawlers)
- `Perplexity-User`: `Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Perplexity-User/1.0; +https://perplexity.ai/perplexity-user)` [Perplexity crawler docs](https://docs.perplexity.ai/docs/resources/perplexity-crawlers)
- `ClaudeBot`, `Claude-SearchBot`, `Claude-User`: exact strings documented at Anthropic's crawler reference; all three verified independently against reverse-DNS in the same way Perplexity's are [SearchEngineLand](https://searchengineland.com/anthropic-claude-bots-470171).

Perplexity's own documentation recommends verifying requests by checking **both** that the user-agent string names the bot **and** that the source IP falls within Perplexity's published ranges (or resolves via reverse DNS to a `perplexity.ai` host) — the user-agent string alone is not trustworthy given the stealth-crawling findings in §1.1 [Perplexity crawler docs](https://docs.perplexity.ai/docs/resources/perplexity-crawlers). The same IP/reverse-DNS verification principle is the standard practitioner recommendation for all AI crawlers, not just Perplexity's, precisely because a user-agent string is just a self-reported header any client can spoof.

## Appendix B: API access points mentioned in §7

- **Google Search Console**: Search Analytics API (`searchanalytics.query`) — needed once the 1,000-row UI cap becomes limiting; requires a Google Cloud project and OAuth/service-account credentials.
- **Bing Webmaster Tools**: has its own REST API covering the same query/click/impression data plus the keyword-research endpoints; the new AI Performance report (public preview, Feb 2026) is UI-first and its API surface was not confirmed as available in this research — worth re-checking Bing Webmaster's API changelog before building automation against it, since public-preview features often lag their UI by months on the API side.

## Summary of concrete recommendations for wAIbi-sabi

1. **robots.txt**: move from blanket-allow to Option B in §2.3 — explicitly allow the retrieval/search-layer bots (`OAI-SearchBot`, `Claude-SearchBot`, `PerplexityBot`, `Bingbot`, `Googlebot`, plus the user-triggered fetchers), explicitly disallow the pure-training bots (`GPTBot`, `ClaudeBot`, `Google-Extended`, `Applebot-Extended`, `CCBot`, `Bytespider`). Zero cost to the citation goal; refresh the bot list roughly annually as new user-agents appear.
2. **llms.txt**: optional 5-minute addition at most; no evidence anything that matters reads it yet. Don't build tooling around it.
3. **Structured data**: add `BlogPosting` + `Person`(author, with `sameAs`) + `Organization` JSON-LD to every article; **do not** add `FAQPage`/`QAPage` to new articles — Google killed the FAQ rich result in May 2026 and QAPage was never the right fit for single-author Q&A content anyway. Keep the "Reader Question / Executive TL;DR" content pattern as the actual citation lever — it's the one thing in this whole report with real evidence behind it (§1.2).
4. **IndexNow**: worth wiring into the Astro build/deploy pipeline — generate a key, publish it, POST changed URLs to Bing on each deploy. Real mechanical benefit for Bing/Copilot/ChatGPT-search freshness; zero effect on Google-lineage surfaces.
5. **Measurement**: configure/verify the AI-referral custom channel in whatever client-side analytics tool is used, covering all five assistant domains (GA4's native channel misses Perplexity). Accept this as a floor, not a full picture — training/indexing crawler visits and app-referrer-stripped clicks are structurally invisible on GitHub Pages without a CDN in front of it.
6. **Topic feedback loop**: wire GSC + Bing Webmaster Tools query/impression APIs into the existing Notion radar pipeline as the demand-signal input; treat Bing's new AI Performance report as the one direct (if narrow) proxy for AI-citation-driven queries available today, and otherwise plan on manual "ask the assistants your target questions" spot-checks rather than expecting an automated AI-citation data feed to exist.
