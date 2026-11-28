# wAIbi-sabi: SEO, AEO, GEO & Custom Domain Migration Strategy

**Prepared for:** Janmejai Singh Minhas (Owner, wAIbi-sabi & INFERENCE AI Compendium)  
**Date:** 2026-11-28  
**Current Origin:** `https://janmejai2002.github.io` (Astro 5 SSG on GitHub Pages, 131 published articles + `/news/` B-school archive + `/tracker/` + `/tools/`)  
**Scope:** Executive technical diagnosis, custom domain purchase & zero-loss migration brief, research-backed GEO/AEO/SEO playbook, prioritized engineering backlog, and analytics/platform instrumentation checklist.  

> **Epistemic Hygiene Rule:** Throughout this report, claims are explicitly tagged as **`[Observed]`** (verified directly in repo code, Umami Cloud, or Bing Webmaster telemetry), **`[Empirical Paper]`** (peer-reviewed or arXiv controlled study), **`[Industry Observation]`** (vendor/large-crawl observational data, non-causal), or **`[Hypothesis]`** (informed architectural inference requiring measurement).

---

## Executive Summary & Immediate "Do Today" Decisions

wAIbi-sabi has already demonstrated rare **AI-retrieval product-market fit** on Bing/Copilot (62 AI citations vs. 4 traditional Bing clicks across 73 days — a **15.5× AI amplification ratio** `[Observed]`, `docs/research/search-and-ai-performance-audit-2026.md`) and strong human engagement depth on technical autopsies (3–6 views/visitor on top posts `[Observed]`). Yet **Google Organic Search is effectively zero**, **97% of Umami traffic is bot-inflated Direct traffic** (40% Singapore, 90% 7-day bounce, 15s duration), and **zero custom conversion/engagement events exist** to separate real readers from datacenter scrapers.

The root causes are architectural, not editorial:
1. **`github.io` Public Suffix List isolation** caps brand trust, blocks Google Search Console Domain Properties (`sc-domain:`), prevents Cloudflare edge proxy & AI crawler visibility, and leaves Google discovery entirely dependent on passive crawling (Google does not participate in IndexNow).
2. **Active codebase bugs discovered in this audit** are degrading structured data, analytics cleanliness, and indexation velocity: a broken `FAQPage` JSON-LD regex in `site/src/layouts/Post.astro:86-92` that truncates answers mid-word, a duplicate Microsoft Clarity tag firing twice in production (`Base.astro:53-60` + `SEO.astro:254-262`), and an IndexNow workflow in `.github/workflows/deploy.yml:81-90` that misses key routes while submitting `noindex` `/status/`.
3. **Zero off-site earned-media footprint & shallow entity graph**: 2025–2026 GEO literature proves that once content is structurally clean, **retrieval eligibility and off-site earned media**—not superficial text rewrites or `llms.txt`—govern durable AI citations.

### Three Decisions to Execute Today
| Decision | Recommendation | Why |
|---|---|---|
| **1. Primary Domain & TLD** | Buy a clean **`.com`** (e.g., `waibisabi.com`, or clean fallback like `waibisabiai.com` / `readwaibisabi.com` if unavailable) | Global authority for applied AI & INFERENCE, ~$11/yr renewal forever, zero geographic lock-in (unlike `.in`), 7× cheaper than `.ai` (~$165 minimum 2-yr lock). |
| **2. Registrar & Edge** | **Cloudflare Registrar** (for `.com`/`.ai`) + Cloudflare Free Proxy | Wholesale at-cost pricing (~$11.17/yr `.com`), zero markup, native DNS + **Free AI Crawl Control** (immediately solves GitHub Pages' server-log blind spot). Use **Porkbun** only if buying `.in` (not supported by Cloudflare). |
| **3. INFERENCE Architecture** | **Subfolder: `https://<domain>/inference/`** | Consolidates all editorial backlink equity, topical authority, crawl budget, and GSC tracking with the 131-article AI journal instead of starting cold on a fragmented subdomain. |

---

## Section 1: Diagnosis of Current Indexing & Traffic Bottlenecks

### 1.1 Baseline Telemetry Synthesis (`[Observed]`, verified 2026-11-28)

| Signal | Live Measurement | Diagnostic Interpretation |
|---|---|---|
| **Umami 30-Day Totals** | 532 visitors · 617 visits · 2.91k views · 87% bounce · 1m 5s avg | High total views driven by a tiny human core (3–6 views/visitor on top posts) masked by massive single-hit bounce noise. |
| **Umami 7-Day Trend** | 318 visitors · 90% bounce · **15s avg duration** | Sharp recent spike in automated/headless Direct traffic dragging duration from 65s down to 15s. |
| **Channel Mix (30d)** | Direct **97% (514)** · Organic Social 2% (10) · Organic Search 2% (8) | Search acquisition is virtually non-existent relative to a 131-article technical archive. |
| **Search Engine Split** | `bing.com`: 11 all-time, 8 in last 30d; **Google Organic: ~0** | IndexNow pushes (`site/scripts/indexnow.mjs`) work for Bing; Google has not rewarded the domain with non-branded discovery. |
| **Geographic Split** | **Singapore 40%**, US 26%, India 12% | Classic cloud-datacenter signature (`ap-southeast-1` AWS/Alibaba/ByteDance/headless preview scrapers), not organic Indian/US reader distribution. |
| **Bing AI Performance** (Aug 27–Nov 7) | 93 impressions · 4 clicks · **62 Copilot AI citations** (14/15 days = 1 cited page) | Proven structural citability, but trapped in a **single-page monopoly**; >85% of URLs were never pushed via IndexNow. |
| **Umami Custom Events** | **0 configured** | Blind to scroll completion, outbound citation clicks, share actions, calculator usage, and true human vs. bot ratio. |
| **Top Human-Engaged Posts** (3–6 views/visitor) | `salesforce-agentforce-autopsy`, `dont-build-agents-build-skills`, `uber-querygpt-text-to-sql-case-study`, `mcp-stateless-spec-2026-migration-guide`, `enterprise-ai-agent-roi`, `klarna-ai-customer-service-graded-honestly` | **Clear product-market fit:** deep architectural autopsies, enterprise ROI debunking, and breaking developer specs attract high-intent repeat readers. |

---

### 1.2 Root Cause 1: Why Google Organic Search Is ~0

1. **`github.io` Public Suffix List (PSL) Ceiling `[Observed / Industry Consensus]`**
   - `github.io` sits on Mozilla's Public Suffix List (`publicsuffix.org`). Browsers and search engines treat `janmejai2002.github.io` as a completely isolated standalone host—it inherits **zero PageRank, domain trust, or crawl authority** from `github.com` or other `github.io` repositories.
   - **GSC Structural Handicap:** As noted in `site/src/components/SEO.astro:189-192` and `site/src/seo.ts:11-13`, you cannot verify a `sc-domain:` Domain Property on `github.io` because you do not control DNS.
   - **Perceptual & Brand Tax `[Hypothesis]`:** In competitive enterprise AI SERPs (`Salesforce Agentforce`, `Uber QueryGPT`, `MCP stateless spec`), a `username.github.io` URL carries lower institutional credibility for human click-throughs and journalist backlinks than a dedicated publication domain.

2. **The IndexNow / Google Discovery Asymmetry `[Observed]`**
   - `.github/workflows/deploy.yml:61-95` pushes changed URLs to `api.indexnow.org` via `site/scripts/indexnow.mjs`. That explains why `bing.com` is the #1 search referrer and Bing Copilot generated 62 citations.
   - **Google explicitly does not participate in IndexNow** (Google declined adoption after 2021–2022 testing; Google's Indexing API is strictly restricted to `JobPosting` and `BroadcastEvent` livestreams). Without IndexNow, Google relies solely on `sitemap-index.xml` polling, internal link crawl paths, and external backlinks—of which `janmejai2002.github.io` currently has near zero.

3. **High Automated Publishing Velocity on a Zero-Backlink New Host `[Hypothesis]`**
   - The repo currently houses **131 markdown articles** (`site/src/content/blog/*.md`), heavily accelerated in November 2026 via the automated Gemini→Notion→GitHub pipeline.
   - Google's post-2024 Core & Spam systems (including Scaled Content Abuse and site-wide quality classifiers) routinely delay indexing or hold back rankings ("Discovered – currently not indexed" / sandbox dampening) when a brand-new host with negligible off-site referring domains publishes >100 long-form articles rapidly. Moving to an owned domain paired with genuine earned-media citations and tight internal pillar architecture directly addresses this bottleneck.

4. **Crawl & Indexation Gaps Inside the Current Codebase `[Observed]`**
   - **IndexNow CI blind spots (`.github/workflows/deploy.yml:81-90`):**
     - Only maps `blog/*.md`, `/`, `/about/`, `/projects/` (which is actually disabled as `_projects.astro`!), `/news/`, and `/status/`.
     - **Misses high-value linkable assets:** `/tracker/`, `/tools/prompt-caching-calculator/`, `/topics/*`, and `/[track]/` (`technical`, `business`, `basics`, `case-studies`, `talks`).
     - **Submits `/status/` to IndexNow** (`deploy.yml:88`) even though `/status/` carries `noindex={true}` (`site/src/pages/status.astro:42`) and is filtered out of the sitemap (`site/astro.config.mjs:58`)—wasting crawl signals on a noindexed page.
     - Silently exits when `github.event.before` is invalid (squash/rebase/manual dispatch), causing the 85%+ IndexNow backlog observed in `docs/research/search-and-ai-performance-audit-2026.md`.
   - **Locale mismatch (`site/src/layouts/Base.astro:51` vs `site/src/components/SEO.astro:136,157,203`):** HTML declares `<html lang="en">` while `SEO.astro` hardcodes `inLanguage: 'en-IN'` and `og:locale="en_IN"` on *every* page, including globally targeted US/EU enterprise AI engineering posts (`salesforce-agentforce-autopsy`, `mcp-stateless-spec-2026-migration-guide`). Keep `en-IN` for `/news/` (Indian B-school briefs), but use neutral `en` / `en_US` for global applied-AI articles.

---

### 1.3 Root Cause 2: Active Technical Bugs Found in Code Audit (`[Observed]`)

1. **Critical Bug — Truncated, Malformed `FAQPage` JSON-LD (`site/src/layouts/Post.astro:86-92`)**
   ```ts
   // site/src/layouts/Post.astro:86-92
   const faq = question && tldr
     ? [{
         question: question,
         answer: tldr.replace(/<[^>]*>/g, '').split('-').filter(Boolean)[0].trim()
       }]
     : [];
   ```
   **What actually happens at build time:** `tldr` is already rendered HTML (`<div class="tldr"><h2>The short version</h2><ul><li>...</li></ul></div>`), **not** raw Markdown with `- ` bullets. Stripping HTML tags produces a single concatenated string beginning with `"The short version ..."`, and `.split('-')[0]` **slices the answer at the very first hyphen in any compound word**!  
   For example, on `salesforce-agentforce-autopsy.md` (which contains `"multi-action"` in bullet 1), the emitted `FAQPage.acceptedAnswer.text` is literally truncated to:
   > `"The short version Salesforce rolled out Agentforce across 29,000 enterprise contracts, generating an estimated $800M in annualized contract value, yet 77% of enterprise customer pilots stall during multi"`
   Every article containing a hyphenated technical term (`text-to-SQL`, `per-conversation`, `non-deterministic`, `real-time`) is currently shipping **corrupted, mid-word-truncated JSON-LD** to Googlebot, Bingbot, and AI parsers.

2. **Critical Bug — Duplicate Microsoft Clarity Script Firing Twice (`Base.astro:53-60` + `SEO.astro:254-262`)**
   - `site/src/layouts/Base.astro:53-60` injects Clarity unconditionally (including during local `npm run dev`) with hardcoded ID `"zep5vkb77s"`.
   - `site/src/components/SEO.astro:254-262` injects the exact same Clarity project (`CLARITY_PROJECT_ID = 'zep5vkb77s'`) a **second time** in production via `https://www.clarity.ms/tag/zep5vkb77s?ref=bwt`.
   - Result: double network requests, distorted Clarity session telemetry, and dev traffic polluting production heatmaps.

3. **Shallow Structured Data Entity Graph (`site/src/components/SEO.astro:73-177`)**
   - `publisher` on `BlogPosting` and `WebSite` is set to `{ '@id': personId }` (`@type: 'Person'`) rather than an `@type: 'Organization'` (`wAIbi-sabi`) with a valid `logo` (`ImageObject`) and `founder` link.
   - `WebSite` node is emitted **only** on `isHome` (`/`), leaving `isPartOf: { '@id': websiteId }` unresolved on standalone article crawls unless crawlers cross-reference the homepage graph.
   - Zero `about`, `mentions` (Wikidata `sameAs` entity linking), or `citation` arrays on `BlogPosting`—despite every article rigorously citing ≥3 primary sources (`CAPS.minSources = 3` in `site/harness/registry.mjs:36`).
   - `og:image:type` is hardcoded to `"image/png"` (`SEO.astro:212`) even if a custom WebP/JPEG image prop is supplied.

---

### 1.4 Root Cause 3: Bot-Inflated Direct Traffic & Zero Event Tracking (`[Observed]`)

- **Why Direct is 97% and Singapore is 40%:**
  1. **Headless / JS-executing scrapers & cloud crawlers `[Hypothesis supported by telemetry]`:** Singapore (`ap-southeast-1`) is Asia's largest cloud-bot egress hub (AWS, Alibaba Cloud, ByteDance/TikTok link previewers, uptime monitors, and headless Playwright/Puppeteer AI scrapers). Unlike basic HTTP crawlers (`GPTBot`, `PerplexityBot`) that ignore JS, headless scrapers execute Umami's `script.js`, fire one pageview, wait 0–15 seconds, and disconnect—producing the exact **90% bounce / 15s duration** signature seen in the last 7 days.
  2. **Dark social & native AI app referrer stripping `[Industry Observation]`:** Over one-third of clicks from native ChatGPT, Claude, and Perplexity mobile/desktop apps, plus WhatsApp/Slack/Discord shares, strip `Referer` headers and land in Umami's `Direct` bucket (`docs/research/ai-citability.md §6.2`).
  3. **Zero custom events (`0 configured`) `[Observed]`:** Without behavioral events (`scroll_50`, `scroll_90`, `tldr_expand`, `outbound_source_click`, `share_click`, `calculator_use`), Umami cannot separate a 15-second Singapore scraper from a human VP of Engineering who clicked a link in Slack and read `salesforce-agentforce-autopsy` for 8 minutes.
  4. **GitHub Pages server-log blind spot `[Observed]`:** GitHub Pages exposes zero raw HTTP access logs. Moving behind **Cloudflare Free** immediately unlocks **AI Crawl Control**, giving real server-edge visibility into `OAI-SearchBot`, `Claude-SearchBot`, `PerplexityBot`, `Googlebot`, and `Bingbot` hits.

---

## Section 2: Domain Buying Brief (For Today)

### 2.1 Domain Naming & TLD Strategy (`.com` vs `.ai` vs `.in`)

Your domain must serve **three simultaneous jobs** over the next 3–5 years:
1. Flagship applied-AI journal (**wAIbi-sabi**) competing globally for US/EU/India engineering & executive readers.
2. Commercial product home for **INFERENCE AI Compendium** (`/inference/`).
3. Authoritative personal-brand moat for Janmejai Singh Minhas (consulting, red-teaming, B-school archive `/news/`).

#### TLD Verdict Matrix
| TLD | Annual Cost (2026) | SEO / GEO Authority & Positioning | Verdict |
|---|---|---|---|
| **`.com`** | **~$11.08–$11.17/yr** (flat renewal) | Gold standard globally. Zero geo-restriction, highest human trust & SERP CTR in enterprise B2B/AI, universally remembered, zero renewal shock. | **PRIMARY BUY (Recommended)** |
| **`.ai`** | **~$80–$84/yr** *(mandatory 2-yr min = ~$165 upfront)* | High instant signal in AI circles; Google treats `.ai` as a generic TLD (gTLD), **not** geo-targeted to Anguilla. However, ~7.5× the lifetime cost of `.com` and prone to registry price hikes. | **Optional defensive/brand play** only if `.com` is taken or if budget easily absorbs ~$165/2yr. |
| **`.in`** | **~$7.83–$9.99/yr** *(Porkbun only; not on Cloudflare)* | Country-code TLD (ccTLD) explicitly geo-targeted to India by Google. Strong for Indian B-school news, but **actively handicaps global US/EU applied-AI & INFERENCE search ranking**. | **Do NOT use as primary.** Optional cheap defensive buy later via Porkbun if desired. |
| **`.dev` / `.io`** | `.dev` ~$13/yr · `.io` ~$35–$45/yr | `.dev` is HSTS-preloaded (good for engineering); `.io` is expensive and carries geopolitical phase-out chatter. Both trail `.com` in executive/business credibility. | **Fallback only** (prefer `.dev` over `.io` if all clean `.com` variants are taken). |

#### Concrete Naming Recommendations (Check Live Availability Today)
Choose a **brandable publication domain** (not your personal name) so wAIbi-sabi and INFERENCE can scale into a standalone media/product asset (and remain sellable or sponsor-ready without being locked to a personal portfolio URL):

1. **Tier 1 (Ideal):** `waibisabi.com` (exact match to brand, clean phonetics, no hyphens, works for both blog + `/inference/`).
2. **Tier 2 (If `waibisabi.com` is taken/parked):**
   - `waibisabi.ai` (if willing to pay ~$165/2yr and own the exact brand string)
   - `waibisabiai.com` or `readwaibisabi.com` or `waibisabijournal.com` (clean `.com`, ~$11/yr, immediately communicates applied AI / publication)
3. **Avoid:** Hyphens (`waibi-sabi.com` fails the radio test and leaks type-in traffic to the non-hyphenated owner), numbers (`2002`), or `github` references.

> **Decision Rule for Today:** Buy the cleanest available **`.com`** from Tier 1/2 (or `waibisabi.ai` *only* if `waibisabi.com` is taken at a premium aftermarket price >$500 and you want the exact single-word brand). Do **not** pay aftermarket broker markups—spend that capital on distribution/product, not a squatted domain.

---

### 2.2 Registrar Choice: Cloudflare Registrar vs. Porkbun

| Criterion | Cloudflare Registrar | Porkbun |
|---|---|---|
| **`.com` Price (Reg & Renewal)** | **~$11.17/yr** (wholesale ICANN at-cost, $0 markup) | **~$11.08/yr** (near-wholesale, transparent renewal) |
| **`.ai` Price (2-yr min)** | **~$80–$84/yr** (at-cost) | **~$82.70–$84/yr** (near-wholesale) |
| **`.in` Support** | **Not supported** | **Supported (~$7.83–$9.99/yr)** |
| **WHOIS Privacy** | Free (redacted) | Free (full privacy) |
| **DNS & Edge Integration** | Native Cloudflare DNS + Free **AI Crawl Control** + Edge SSL + WAF (requires Cloudflare nameservers) | Flexible nameservers (can point to Cloudflare Free in 2 minutes) |
| **Customer Support** | Community/docs on Free tier | Human chat/email/phone support 365 days/yr |

**Verdict:**
- **Buy on Cloudflare Registrar** if buying **`.com`** (or **`.ai`**). Because putting wAIbi-sabi behind Cloudflare Free is *mandatory* anyway to unlock **AI Crawl Control** (free edge bot visibility for `OAI-SearchBot`, `Claude-SearchBot`, `PerplexityBot`, `Googlebot`), registering directly on Cloudflare eliminates registrar-to-DNS handoff friction and guarantees wholesale renewals forever.
- **Buy on Porkbun** *only* if you want live human support or a `.in` extension—and immediately point its nameservers to a Free Cloudflare zone.

---

### 2.3 Subfolder (`/inference/`) vs. Subdomain (`inference.<domain>`) — SEO Authority Verdict

**Unambiguous Architectural Verdict: Host INFERENCE AI Compendium in a SUBFOLDER (`https://<domain>/inference/`), NEVER on a subdomain (`inference.<domain>`).**

| Factor | Subfolder (`<domain>/inference/`) | Subdomain (`inference.<domain>`) |
|---|---|---|
| **Backlink & Authority Consolidation** | **100% pooled.** Every link earned by `salesforce-agentforce-autopsy`, `/tracker/`, or GitHub benchmark PRs directly lifts `/inference/` rankings—and every link earned by INFERENCE lifts the blog. | **Fragmented.** Google evaluates hostnames semi-independently for initial trust, crawl scheduling, and internal PageRank distribution (`[Industry Observation]`: enterprise subdomain→subfolder migrations routinely observe 10–30% organic lift). |
| **Google's Official Stance** | John Mueller explicitly recommends keeping content that is part of the same site/user journey in a **subfolder**; reserve subdomains for genuinely separate apps or platforms. | Acceptable only for completely separate technical stacks (e.g., an authenticated SaaS app on `app.<domain>`). |
| **Topical Authority & GEO Entity Graph** | Signals to Google and LLM retrieval systems that the 131 applied-AI articles and INFERENCE are one unified, deeply authoritative knowledge hub. | Splits entity association across two hosts; requires duplicate schema, separate sitemaps, and separate robots/IndexNow pipelines. |
| **Tech Stack Fit** | Native Astro 5 route (`site/src/pages/inference/index.astro`, `site/src/pages/inference/[chapter].astro`), zero extra hosting cost, shares `Base.astro`, `SEO.astro`, Umami, and Clarity automatically. | Requires separate deployment target, separate DNS CNAME, cross-subdomain Umami session stitching. |

**Exception Boundary:** If INFERENCE later includes a logged-in web app or third-party payment portal (e.g., Stripe/Lemon Squeezy/Gumroad hosted checkout or a separate interactive runtime), place *only* the authenticated application on `app.<domain>` (noindexed) while keeping **100% of marketing pages, syllabus, sample chapters, interactive previews, glossary, and docs** under `https://<domain>/inference/`.

---

### 2.4 Step-by-Step Zero-Loss Migration Plan (`janmejai2002.github.io` → Custom Domain)

Because wAIbi-sabi deploys via **GitHub Actions (`actions/deploy-pages@v4`)** and already has active Bing AI citations + GSC/BWT verification, execute these steps **in exact order** to avoid TLS certificate lockouts (`ERR_TOO_MANY_REDIRECTS`), custom-domain resets on deploy, or search index drops.

#### Phase A — DNS & Repository Preparation (Zero Downtime)
1. **Register domain** on Cloudflare Registrar (example below assumes apex `waibisabi.com`; substitute your chosen domain).
2. **Configure Cloudflare DNS records — START IN `DNS ONLY` (GRAY CLOUD) MODE:**
   *Crucial gotcha:* GitHub Pages must validate DNS directly to issue its Let's Encrypt TLS certificate. Turning on Cloudflare's Orange Cloud *before* GitHub provisions HTTPS will block the ACME HTTP-01 challenge.
   - Add 4 IPv4 `A` records for `@`:
     - `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` (**DNS only / Gray cloud**)
   - Add 4 IPv6 `AAAA` records for `@`:
     - `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153` (**DNS only / Gray cloud**)
   - Add `CNAME` record for `www` → `janmejai2002.github.io` (**DNS only / Gray cloud**).
3. **Create `site/public/CNAME`** containing **only** the bare domain on a single line (no `https://`, no trailing slash):
   ```text
   waibisabi.com
   ```
   *(Because `deploy.yml` uploads `site/dist` via `actions/upload-pages-artifact@v3`, putting `CNAME` in `site/public/` guarantees `site/dist/CNAME` is present on every build and prevents GitHub Pages from resetting your custom domain.)*
4. **Update every hardcoded `janmejai2002.github.io` reference in one atomic PR** (complete repo audit inventory):
   - `site/harness/registry.mjs:18` → update `SITE_URL` and run `node site/harness/generate.mjs` (updates `gas/Registry.js` and Gemini skills).
   - `site/astro.config.mjs:49` → update `site: 'https://<domain>'` (updates all `<link rel="canonical">`, `og:url`, `og:image`, `sitemap-index.xml`, `rss.xml`, and JSON-LD `@id`s automatically).
   - `site/public/robots.txt:60` → update `Sitemap: https://<domain>/sitemap-index.xml`.
   - `site/src/pages/llms.txt.ts:14` → replace hardcoded `SITE` with `context.site` (fallback to `SITE_URL`).
   - `site/scripts/indexnow.mjs:21` → update `HOST` (or import from `../harness/registry.mjs`).
   - `.github/workflows/deploy.yml:83-88` → replace hardcoded `https://janmejai2002.github.io` URLs with new domain (and fix missing routes / remove `/status/`).
   - `site/scripts/close-loop.mjs:29`, `site/scripts/doctor.mjs:40`, `site/scripts/manager.mjs:227` → read `SITE_URL` from `registry.mjs`.
   - `site/src/lib/share-card.ts:360` → update OG card footer strip `'Janmejai Singh Minhas  ·  <domain>'` (regenerates all social cards cleanly).
   - `site/src/pages/about.astro:102` → replace hardcoded URL with `new URL('/about/', Astro.site).href`.
   - `site/src/components/TrackerWidget.astro:25` → replace hardcoded href with new domain.
   - **KEEP** `site/src/seo.ts:26` (`GOOGLE_SITE_VERIFICATION`) and `site/public/googlea1340fe9bfe1e41a.html` untouched so the old GSC property stays verified during the 180-day migration!
   - **KEEP** `site/public/d44b7b2a4eecd2737769cd4645dae830.txt` (IndexNow key file works identically on the new host once served at `https://<domain>/d44b7b2a4eecd2737769cd4645dae830.txt`).
5. **Run `npm --prefix site run build`** locally and verify `check-build.mjs` passes with zero failures, then merge/push to `main`.

#### Phase B — Cutover, HTTPS Provisioning & Cloudflare Proxy Activation
6. **Bind custom domain in GitHub Pages:** Repo **Settings → Pages → Custom domain** → enter `<domain>` → Save. Wait 5–15 minutes for GitHub's DNS check and Let's Encrypt certificate issuance, then check **Enforce HTTPS**.
7. **Verify true server-side `301 Moved Permanently` redirects** (both apex and deep article paths) before touching Search Console:
   ```powershell
   curl.exe -I https://janmejai2002.github.io/
   curl.exe -I https://janmejai2002.github.io/blog/salesforce-agentforce-autopsy/
   curl.exe -I https://www.<domain>/
   ```
   Confirm **every** response returns `HTTP/2 301` (or `HTTP/1.1 301 Moved Permanently`) with `Location: https://<domain>/...` (1:1 path preservation, single hop, no redirect chains).
8. **Enable Cloudflare Proxy + Full (Strict) SSL:**
   - In Cloudflare **SSL/TLS → Overview**, set mode to **Full (Strict)** (never *Flexible*, which causes infinite redirect loops with GitHub's Enforce HTTPS).
   - In **SSL/TLS → Edge Certificates**, enable **Always Use HTTPS** and **Automatic HTTPS Rewrites**.
   - In Cloudflare **DNS**, toggle the `@` (`A`/`AAAA`) and `www` (`CNAME`) records from Gray Cloud → **Proxied (Orange Cloud)**.
   - Re-run `curl.exe -I https://<domain>/` to confirm `HTTP/2 200` and `server: cloudflare`.
   - *Operational Gotcha:* Every ~90 days, if GitHub Pages ever warns that Let's Encrypt auto-renewal failed behind Cloudflare proxy, temporarily flip `@` to Gray Cloud for 5 minutes, let GitHub renew, and flip back to Orange Cloud (or configure a Cloudflare Page/Cache Rule bypassing proxy/HTTPS redirect on `/.well-known/acme-challenge/*`).

#### Phase C — Search Engine Handoff & Zero-Loss Signal Transfer
9. **Google Search Console (GSC):**
   - Add a **Domain Property** (`sc-domain:<domain>`) and verify via **Cloudflare DNS TXT record** (1-click in Cloudflare).
   - Verify you are an **Owner** of both `https://janmejai2002.github.io` (old URL-prefix property) and the new domain property under the same Google account.
   - Open the **old** property (`https://janmejai2002.github.io`) → **Settings → Change of Address** → select the new property → **Validate & Update**.
   - In the **new** property, submit `https://<domain>/sitemap-index.xml`.
   - Use **URL Inspection** to request immediate indexing of `/`, `/blog/`, `/tracker/`, `/tools/prompt-caching-calculator/`, and your top 6 human-engaged articles.
   - **180-Day Rule:** Keep GitHub Pages' automatic 301 redirect and both verified GSC properties intact for at least **180 days** (indefinitely is best; never delete the `janmejai2002.github.io` repo).
10. **Bing Webmaster Tools & IndexNow:**
    - Add `https://<domain>` in Bing Webmaster Tools (verify via DNS TXT or existing `msvalidate.01` meta tag).
    - Submit `https://<domain>/sitemap-index.xml`.
    - Run a one-off full backfill to fast-lane all 131+ URLs on the new host into Bing/Copilot/ChatGPT Search:
      ```powershell
      node site/scripts/indexnow.mjs --sitemap
      ```
11. **Analytics & Off-Site Canonical Updates:**
    - Update website domain in **Umami Cloud** (keep the same `UMAMI_WEBSITE_ID` so historical data stays unified, or create a clean post-migration view) and **Microsoft Clarity**.
    - Update canonical links on GitHub profile bio, LinkedIn profile, Notion `SITE_URL` reconciliation, and any shared social posts.

---

## Section 3: Research-Paper-Backed GEO / AEO / SEO Playbook

### 3.1 Evidence Hierarchy: What Peer-Reviewed & arXiv Research Actually Proves (2024–2026)

Much of the SEO blogosphere repackages unproven folklore as "GEO." Below is the rigorous synthesis of verifiable academic literature separating **robust empirical findings** from **debunked or conditional tactics**:

| Paper & Venue | Methodology | Empirical Finding `[Empirical Paper]` | Strategic Implication for wAIbi-sabi |
|---|---|---|---|
| **Aggarwal et al. (ACM KDD 2024)**, *"GEO: Generative Engine Optimization"* (`arXiv:2311.09735`) | GEO-bench (10,000 queries) testing 9 optimization methods in a fixed 5-document RAG context | **Cite Sources**, **Quotation Addition**, and **Statistics Addition** delivered **30–40% relative visibility lift** (Position-Adjusted Word Count & Subjective Impression). Lower-ranked sources (pos. 4–5) gained the most. **Keyword stuffing *reduced* visibility by ~8–10%.** | Keep doubling down on primary statistics, named verbatim quotes, and inline primary citations—wAIbi-sabi's core editorial strength. Never stuff keywords. |
| **Martinez (2026)**, *"A Critical Survey of Generative Engine Optimization (2023–2026)"* (`arXiv:2607.14035`) | Systematic meta-review of 45 GEO studies (Nov 2023–Jul 2026) | Reframed GEO as a **multi-stage stochastic pipeline** (crawl → index → retrieve → rerank → cite). Aggarwal's +40% lift is **conditional on already being retrieved into context**. Citation repeatability is noisy (9–28% churn at temp=0) and cross-engine overlap is low (Jaccard 0.11–0.34). | **Retrieval beats rewriting.** Fixing Google/Bing indexing and domain authority is prerequisite #1; on-page GEO only fires after a document enters the RAG top-K context. |
| **Vishwakarma, Kumar & Jamidar (SIGIR 2026)**, *"What Gets Cited: Competitive GEO in AI Answer Engines"* (`arXiv:2605.25517`) | 252,000 controlled 2-doc RAG trials across 6 LLMs, 18 content factors, controlling for position bias | **Fine-grained topical relevance** and **context position** dominate first-citation selection. Among content traits, **explicit pricing data** and **recent timestamps** reliably lift citation priority; superficial formatting-only edits had negligible isolated impact. | Always surface concrete pricing/unit-economics numbers (e.g., `$2.00/conversation`, `$500/100k Flex Credits`) and maintain real `updatedDate` freshness timestamps. |
| **Puerto, Gubri, Green, Oh & Yun (NeurIPS D&B 2025)**, *"C-SEO Bench: Does Conversational SEO Work?"* (`arXiv:2506.11097`) | Multi-domain benchmark evaluating C-SEO across QA & product recommendations under multi-actor competition | Most automated C-SEO text-rewriting heuristics are **ineffective or negatively impact ranking** (only 3 of 54 method–domain pairs positive). **Foundational traditional SEO relevance/authority** outperforms rewriting tricks; competitive adoption is zero-sum. | Do **not** build an automated "GEO rewriter" pass over drafts. Invest engineering time in technical SEO, pillar internal linking, and domain authority instead. |
| **Chen, Wang, Chen & Koudas (2025)**, *"Generative Engine Optimization: How to Dominate AI Search"* (`arXiv:2509.08919`) | Comparative empirical audit across ChatGPT, Perplexity, Gemini, Claude vs. Google | AI search engines exhibit an **overwhelming bias toward Earned Media** (third-party authoritative coverage) over brand-owned content. Engines diverge sharply: ChatGPT/Claude are conservative & earned-media heavy; Perplexity rewards freshness; Gemini is hybrid. | On-page perfection hits a hard ceiling without **off-site earned media** (GitHub repos, HN, Reddit technical threads, external newsletters citing wAIbi-sabi data). |
| **Chen & Koudas (2026)**, *"What Drives AI Citations? Content, Retrieval and Model Knowledge in GEO"* (`arXiv:2610.15033`) *(see also Moore & Dunne, `arXiv:2609.35077`)* | Large-scale empirical audit of commercial queries across ChatGPT, Gemini, Perplexity | **Sub-query fan-out matching** (retrieval mechanics) and **parametric brand memory** explain far more variance than surface AEO checklists. Semantic alignment between title/paragraphs and user questions wins; generic FAQ/summary boxes often reflect Simpson's Paradox across domains. | Match titles, H2s, and opening sentences directly to the sub-queries LLMs generate during search fan-out (which wAIbi-sabi's Reader Question + question-led H2s already approximate). |
| **Yu, Yang, Ding & Sato (2026)**, *"Structural Feature Engineering for GEO (GEO-SFE)"* (`arXiv:2603.29979`) | 3-tier structural framework (Macro architecture, Meso chunking, Micro visual cues) across 6 generative engines | Clean modular section chunking and structured visual formatting (tables, clear section boundaries) yielded **+17.3% citation rate** and **+18.5% perceived quality** independent of semantic content changes. | Engineer **chunk-atomic H2 sections** (150–300 words per self-contained sub-answer, Markdown comparison tables, clean `<figure>` captions) so RAG chunkers lift complete facts without losing context. |
| **LLM-SE Source Coverage Study (2025)**, *"Source Coverage and Citation Bias in LLM-based vs. Traditional Search Engines"* (`arXiv:2512.09483`) | 55,000+ queries comparing 6 LLM search engines vs. traditional search engines | **~37% of domains cited by LLM search engines were unique** compared to traditional SERP top results. | **Major opportunity for wAIbi-sabi:** A niche specialist domain *can* break into AI citations long before outranking Forbes/Gartner on Google—provided it is indexed and hyper-specific. |

---

### 3.2 Actionable Playbook Mapped Directly to wAIbi-sabi & INFERENCE

#### Pattern 1: Retrieval-First Structural Packaging (Macro + Meso Chunking)
- **Keep & sharpen the "Question → Direct Verdict → Executive TL;DR" plate** (`[Empirical Paper]`: aligns with `arXiv:2610.15033` prompt-content alignment and `arXiv:2603.29979` meso-chunking).
- **Add a 40–55 word "Atomic Verdict" lead sentence** right inside the top of every article/guide before the bullet list—a single self-contained, entity-explicit answer (naming the exact system, metric, price, and date) that can be lifted verbatim into Google AI Overviews, Featured Snippets, and Perplexity first sentences (`[Hypothesis]` consistent with AEO snippet extraction mechanics).
- **Question-led H2s matching sub-query fan-out:** Notice how `salesforce-agentforce-autopsy.md` already uses `## How was Agentforce deployed?`, `## What did Agentforce do to the economics?`, `## Where does Agentforce break?`. Standardize every section to open with a **2-sentence direct answer** before deep elaboration, ensuring 256–512 token RAG chunks remain self-sufficient.
- **Explicit Pricing, Benchmarks & Comparison Tables:** Per `arXiv:2605.25517` (SIGIR '26), explicit pricing tables, latency numbers (p50/p95), and fresh `updatedDate` timestamps are among the few content-level factors proven to win head-to-head citation ties. Every Case Study and Technical post should include at least one clean GFM `<table>` with named entities, numbers, and source dates.

#### Pattern 2: Structured Data & Entity Graph Architecture (JSON-LD)
- **What actually moves the needle (`[Observed]` + `[Industry Observation]`):**
  1. **Unify the `@graph` across every page** in `site/src/components/SEO.astro`:
     - **`Organization` (`/#organization`)**: `name: "wAIbi-sabi"`, `url`, `logo` (`ImageObject`), `founder: { '@id': '/#person' }`, `sameAs` (GitHub org/repo, LinkedIn, X/Substack once live). Use `#organization` as `publisher` on `WebSite` and `BlogPosting`—not bare `Person`.
     - **`Person` (`/#person`)**: Enhance Janmejai Singh Minhas with `jobTitle`, `alumniOf` (with Wikidata `sameAs`), `affiliation` (XLRI with Wikidata `sameAs`), `knowsAbout` (linked to `Thing` + Wikidata URIs), and `sameAs` (LinkedIn, GitHub, Google Scholar / Elsevier / Springer author links, Gray Swan profile). *Note: Janmejai has peer-reviewed Elsevier & Springer publications (`site/src/pages/about.astro:71-88`)—linking those DOIs/Google Scholar/ORCID profiles in `sameAs` is a massive real-world E-E-A-T signal!*
     - **`BlogPosting` vs `TechArticle`**: Emit `TechArticle` (with `proficiencyLevel`) for the `technical` track and `BlogPosting` for other tracks; include `about` and `mentions` (`Thing` nodes with Wikidata `sameAs` URIs for core entities like Salesforce, Model Context Protocol, KV Cache, Klarna, Uber) and **`citation`** (array of primary source URLs parsed automatically from the article's `## Sources` section at build time).
  2. **Fix or drop `FAQPage` (`[Observed]`):** Google fully retired FAQ rich results in May–June 2026 (`docs/research/ai-citability.md §4.1`). Leaving valid `FAQPage` causes no penalty, **but the current `Post.astro:86-92` emits corrupted mid-word truncated strings**. Either parse clean `<li>` bullets properly for explicit multi-Q&A hubs (like `/inference/` FAQs) or remove broken `FAQPage` generation on standard blog posts immediately.
  3. **INFERENCE AI Compendium Schema (`/inference/`):** Ship nested `Book` + `Course` (or `Product` with `Offer`, `price`, `priceCurrency`, `availability`, `author: { '@id': '/#person' }`, `publisher: { '@id': '/#organization' }`) + `BreadcrumbList` so Google Shopping/Knowledge Graph and AI pricing extractors (`arXiv:2605.25517`) parse exact pricing and syllabus structure cleanly.

#### Pattern 3: `llms.txt` & `llms-full.txt` — Evidence-Based Verdict
- **Empirical reality `[Industry Observation]`:** Large-scale 2026 server-log audits and SE Ranking's XGBoost feature-importance study found **zero measurable citation lift** from `llms.txt` in ChatGPT, Perplexity, or Google AI Overviews (>96% of `/llms.txt` requests come from SEO crawlers/scrapers, not AI search bots). Do **not** treat `llms.txt` as an SEO/GEO ranking lever.
- **Where it *does* have real utility `[Observed]`:** Developer coding agents (Cursor, Windsurf, Claude Code, MCP docs fetchers) genuinely read `/llms.txt` and `/llms-full.txt` when pointed at a technical reference site.
- **Pragmatic execution:**
  1. Fix `site/src/pages/llms.txt.ts:14` to read `context.site` (no hardcoded `github.io`), group articles by the 5 tracks, and add `/tracker/`, `/tools/prompt-caching-calculator/`, `/topics/`, and `/inference/`.
  2. Add a zero-maintenance build-time `/llms-full.txt` (and `/inference/llms-full.txt` once launched) concatenating Executive TL;DRs + key technical tables so coding agents and developers referencing INFERENCE get clean Markdown in one fetch. Cap effort at <1 hour.

#### Pattern 4: Overcoming "Big Brand Bias" via Earned Media & Crawler Strategy
- **Off-site Earned Media Flywheel (`[Empirical Paper]`: `arXiv:2509.08919`, `arXiv:2610.15033`):** Because AI engines heavily weight third-party corroboration and parametric memory, **20% of effort should shift from generating post #132 to earning external citations for the top 15 cornerstone posts**:
  - Execute `site/scripts/backlink-intelligence.mjs` PRs adding verified benchmark tables to active GitHub AI/agent repositories with clean source citations.
  - Ship the interactive JS embed for `TrackerWidget.astro` so AI newsletters and engineering blogs can embed the live AI Deployment Claims Tracker with a `dofollow` attribution link.
  - Cross-publish executive summaries (with `rel="canonical"` pointing to your custom domain) on Dev.to/Hashnode, and distribute original autopsy charts on Hacker News, LinkedIn, and niche Reddit communities (`r/LocalLLaMA`, `r/MachineLearning`, `r/MLOps`)—Reddit is explicitly identified as a top grounding source for Perplexity and Gemini (`arXiv:2610.15033`).
- **Strategic Re-Evaluation of `robots.txt` Training Bot Blocks (`[Hypothesis]`):**
  - Currently `site/public/robots.txt:41-55` allows retrieval bots (`OAI-SearchBot`, `Claude-SearchBot`, `PerplexityBot`, `Google-Extended`, `Googlebot`, `Bingbot`) while disallowing `GPTBot`, `ClaudeBot`, `Applebot-Extended`, `CCBot`, and `Bytespider`.
  - **Tradeoff flagged by `arXiv:2610.15033`:** While blocking training bots prevents uncompensated scraping (217:1 to 2,237:1 crawl-to-referral ratios), LLMs heavily favor brands present in **parametric model memory**—even inserting known brand names into internal retrieval sub-queries!
  - **Recommendation:** Keep `Bytespider` blocked (aggressive scraper, zero English AI referral value). Keep all retrieval bots explicitly allowed. After 90 days of Cloudflare **AI Crawl Control** data, consciously revisit whether allowing `CCBot` (open research corpus) or `GPTBot`/`ClaudeBot` on *public free articles* (while keeping paid INFERENCE chapters behind auth/disallow) accelerates parametric brand recognition for `"wAIbi-sabi"` and `"INFERENCE AI Compendium"`.

---

## Section 4: Concrete Engineering Backlog for wAIbi-sabi

*(Ordered strictly by leverage; zero code changes made in this research pass.)*

### P0 — Critical Fixes & Domain Cutover (Execute This Week)

| ID | Target File(s) & Exact Lines | Concrete Engineering Change | Expected Impact |
|---|---|---|---|
| **P0-1** | `site/harness/registry.mjs:18`, `site/astro.config.mjs:49`, `site/public/CNAME` *(new)*, `site/public/robots.txt:60`, `site/src/pages/llms.txt.ts:14`, `site/scripts/indexnow.mjs:21`, `.github/workflows/deploy.yml:83-88`, `site/scripts/close-loop.mjs:29`, `site/scripts/doctor.mjs:40`, `site/scripts/manager.mjs:227`, `site/src/lib/share-card.ts:360`, `site/src/pages/about.astro:102`, `site/src/components/TrackerWidget.astro:25` | Centralize canonical `SITE_URL` in `site/harness/registry.mjs` (and run `node site/harness/generate.mjs`), create `site/public/CNAME`, update `astro.config.mjs`, `robots.txt`, `deploy.yml`, `share-card.ts`, `about.astro`, `TrackerWidget.astro`, and switch `llms.txt.ts` to `context.site`. Keep `googlea1340fe9bfe1e41a.html` and `GOOGLE_SITE_VERIFICATION`. | **Unlocks Google Organic growth**, GSC Domain Property, Cloudflare AI Crawl Control, and unified brand authority. |
| **P0-2** | `site/src/layouts/Post.astro:86-92` | **Fix corrupted `FAQPage` extractor:** Either parse actual `<li>` inner text via `/<li>([\s\S]*?)<\/li>/g` (stripping tags cleanly without `.split('-')`) or omit `FAQPage` on regular articles (since Google retired FAQ rich results in May 2026) and reserve `FAQPage` for explicit frontmatter `faq` arrays. | Eliminates malformed, mid-word-truncated JSON-LD across all 131 published articles. |
| **P0-3** | `site/src/layouts/Base.astro:53-60` | **Delete duplicate hardcoded Clarity `<script>` block.** Retain only the PROD-guarded, config-driven Clarity loader in `site/src/components/SEO.astro:254-262`. | Stops double-firing Clarity in production and stops localhost dev sessions from polluting Clarity recordings. |
| **P0-4** | `.github/workflows/deploy.yml:61-95` & `site/scripts/indexnow.mjs` | **Harden IndexNow pipeline:** (1) Remove `/status/` from submission (`deploy.yml:88`); (2) add route mappings for `/tracker/`, `/tools/*`, `/topics/*`, `/[track]/`, and future `/inference/*`; (3) add a fallback submitting recently modified posts if `github.event.before` is unavailable; (4) run `node site/scripts/indexnow.mjs --sitemap` once post-migration. | Eliminates the 85%+ IndexNow coverage gap; scales Bing/Copilot/ChatGPT Search discovery from a 1-page monopoly to all 131+ URLs. |
| **P0-5** | `site/src/layouts/Post.astro` (`<script>` around lines 534, 790), `site/src/pages/tools/prompt-caching-calculator.astro`, `site/src/pages/tracker.astro`, `site/src/layouts/Base.astro` | **Instrument Umami custom events** (`window.umami?.track(...)` and `data-umami-event`): fire `read_50`, `read_90` (inside existing `markFinished()` at `Post.astro:791`!), `tldr_expand`, `share_click`, `outbound_source_click` (with target host), `related_click`, `calculator_compute`, and `tracker_source_click`. | Immediately separates real human readers from Singapore/datacenter bots; establishes measurable engagement & conversion funnels. |

### P1 — High-Leverage Schema, Entity Graph & Architecture (Weeks 2–3)

| ID | Target File(s) | Concrete Engineering Change | Expected Impact |
|---|---|---|---|
| **P1-1** | `site/src/components/SEO.astro` & `site/src/layouts/Post.astro` | **Upgrade JSON-LD `@graph`:** Add `Organization` (`/#organization`, logo `ImageObject`, `founder`, `sameAs`) as `publisher`; emit `WebSite` reference cleanly; upgrade `Person` (`/#person`) with `jobTitle`, Elsevier/Springer/ORCID/Google Scholar `sameAs`; emit `TechArticle` for `technical` track; auto-extract outbound primary URLs from article `## Sources` into `BlogPosting.citation[]`; dynamically derive `og:image:type` from file extension; use `inLanguage: 'en'` / `og:locale="en_US"` on global AI tracks and `en-IN` only on `/news/`. | Strengthens Google Knowledge Graph entity resolution, E-E-A-T attribution, and structured source verification for RAG parsers. |
| **P1-2** | `site/scripts/check-build.mjs` | **Add automated SEO & Schema build gates:** Assert (a) every HTML page's `<script type="application/ld+json">` parses as valid JSON with no truncated FAQ strings; (b) Clarity & Umami scripts each appear at most once per page; (c) `<link rel="canonical">` matches `SITE_URL` from `registry.mjs`; (d) every `/blog/*/` page has ≥3 external citations or emits a warning. | Prevents silent SEO/analytics regressions across automated Gemini publishing runs. |
| **P1-3** | `site/src/pages/llms.txt.ts` & `site/src/pages/llms-full.txt.ts` *(new)* | Refactor `llms.txt.ts` to group by the 5 tracks + `/tracker/`, `/tools/`, `/topics/`, and `/inference/`. Add `/llms-full.txt` compiling TL;DR plates + structured metadata for coding-agent consumption. | Zero-maintenance developer/coding-agent discovery surface for wAIbi-sabi & INFERENCE. |
| **P1-4** | `site/plugins/rehype-internal-links.mjs` & `site/src/data/topics.ts` | Audit internal link graph across all 131 articles: expand `TERMS` dictionary beyond the current ~60 terms so new November 2026 posts link bidirectionally into cornerstone hubs, and ensure all 131 posts map to topic hubs in `topics.ts` (zero orphan pages). | Flattens crawl depth to ≤3 clicks for every article; concentrates internal PageRank onto top-converting hubs and `/inference/`. |
| **P1-5** | `site/src/pages/inference/index.astro` *(new)* & `site/src/components/SEO.astro` | Build subfolder route scaffold for **INFERENCE AI Compendium** (`/inference/`) with first-class `Book` + `Product`/`Offer` + `Course` JSON-LD prop support, explicit pricing/chapter table, and Umami CTA funnel events (`inference_cta_click`, `inference_sample_read`). | Launches INFERENCE inheriting 100% of wAIbi-sabi's domain authority and topical entity relevance from Day 1. |

### P2 — Compounding Authority & Closed-Loop Growth (Weeks 4–8)

| ID | Target File(s) | Concrete Engineering Change | Expected Impact |
|---|---|---|---|
| **P2-1** | `site/scripts/sync-search-metrics.mjs` *(new)* | Weekly GitHub Action querying **GSC Search Analytics API**, **Bing Webmaster API**, and **Umami REST API** to flag high-impression / low-CTR queries and decaying top posts directly into Notion Pipeline Radar. | Closes the SEO/GEO discovery feedback loop automatically; targets proven search demand instead of guessing topics. |
| **P2-2** | `site/src/content/blog/*.md` (top 10 cornerstone posts) | **Freshness & GEO-SFE pass on top human-engaged winners** (`salesforce-agentforce-autopsy`, `dont-build-agents-build-skills`, `uber-querygpt-text-to-sql-case-study`, `mcp-stateless-spec-2026-migration-guide`, `enterprise-ai-agent-roi`, `klarna-ai-customer-service-graded-honestly`): add 40-word atomic verdict lead, verify pricing/benchmark tables, set accurate `updatedDate`, add contextual CTA to `/inference/`. | Capitalizes on `arXiv:2605.25517` recency/pricing signals and converts proven 3–6 views/visitor traffic into INFERENCE leads. |
| **P2-3** | `site/src/components/TrackerWidget.astro` + `site/public/embed/tracker.json` *(new)* | Turn `TrackerWidget` into a real copy-pasteable embed snippet backed by a static JSON build artifact (updated domain), paired with `site/scripts/backlink-intelligence.mjs` PR outreach. | Generates natural high-DR earned-media backlinks addressing `arXiv:2509.08919` earned-media bias. |
| **P2-4** | `site/public/robots.txt` | Quarterly crawler audit driven by Cloudflare **AI Crawl Control** logs; review `CCBot` / training-bot policy after 90 days of empirical bot + AI-citation data. | Data-driven crawler governance rather than blind guesswork. |

---

## Section 5: Analytics & Platform Connection Checklist

### 5.1 Platform Integration Matrix

| Platform | Cost | Setup Action | What It Unlocks |
|---|---|---|---|
| **1. Cloudflare (DNS + Proxy + AI Crawl Control)** | **Free** (Registrar ~$11.17/yr `.com`) | Register `.com` (or point nameservers) → DNS Gray Cloud → GitHub Enforce HTTPS → switch Orange Cloud + SSL **Full (Strict)** → open **AI Crawl Control**. *Warning:* verify Bot Fight Mode does **not** challenge `OAI-SearchBot`, `Claude-SearchBot`, `PerplexityBot`, `Googlebot`, or `Bingbot`. | **Solves GitHub Pages' #1 blind spot:** free edge visibility into every AI retrieval & training crawler hit, top crawled URLs, and `robots.txt` violations + GraphQL API access + global CDN speed. |
| **2. Google Search Console (GSC)** | **Free** | Add **Domain Property** (`sc-domain:<domain>`) verified via Cloudflare DNS TXT → execute **Change of Address** from `https://janmejai2002.github.io` → submit `sitemap-index.xml` → inspect top 10 URLs → enable Search Analytics API credentials for P2-1. | Ground truth for Google index coverage ("Crawled – not indexed" diagnostics), Core Web Vitals, query impressions/CTR/position, and 180-day migration health tracking. |
| **3. Bing Webmaster Tools (BWT)** | **Free** | Verify `<domain>` via DNS TXT (or existing `msvalidate.01`) → submit `sitemap-index.xml` → run `indexnow.mjs --sitemap` → pin **AI Performance** tab + **Keyword Research** tab. | Only major search console exposing direct **AI citation counts & grounding queries** (Microsoft Copilot / Bing AI) + IndexNow ingestion diagnostics + enterprise-skewed keyword demand. |
| **4. Umami Cloud** | **Free** (up to 100k events/mo) | Update website domain to `<domain>` → deploy P0-5 custom events → configure **Goals** (`read_90`, `outbound_source_click`, `calculator_compute`, `inference_cta_click`) and **Funnels** (`Article View → read_50 → read_90 → INFERENCE CTA`) → build saved segment filtering out 0-event Singapore/datacenter bounces. | Clean **human-verified readership** metric immune to datacenter bot noise; explicit AI referral tracking (`chatgpt.com`, `perplexity.ai`, `claude.ai`, `gemini.google.com`, `copilot.microsoft.com`); product conversion attribution for INFERENCE. |
| **5. Microsoft Clarity** | **Free** | Remove duplicate tag in `Base.astro:53-60` → update Clarity project domain to `<domain>` → link Clarity ↔ Bing Webmaster Tools → configure smart event filters for `/blog/*` and `/inference/`. | Visual heatmaps, scroll-depth drop-offs, dead clicks, and rage clicks on top-engaged autopsies and the upcoming INFERENCE landing page. |
| **6. Ahrefs Webmaster Tools (AWT)** | **Free** (verified site owners) | Sign up free → import/verify `<domain>` via GSC/DNS → schedule weekly **Site Audit** + enable **New/Lost Backlinks** email alerts. | Free technical crawl auditing (catches post-migration redirect chains, orphan pages, broken canonicals, 4xx links across all 131 posts) + real referring-domain & anchor-text monitoring. |

---

### 5.2 Recommended Umami Custom Event Schema (Ready for P0-5)

| Event Name | Trigger Location | Properties Payload | Decision Purpose |
|---|---|---|---|
| `read_50` | `Post.astro` (`readShare >= 0.50`, once/page) | `{ slug, track }` | Proves human scroll engagement (filters out 15s bots). |
| `read_90` | `Post.astro` (`markFinished()`, `readShare >= 0.90`) | `{ slug, track, minutes }` | True "article completion" North Star metric. |
| `tldr_expand` | `Post.astro` (`[data-brief-more]` click) | `{ slug }` | Measures mobile TL;DR utility. |
| `share_click` | `Post.astro` (`[data-share]` click) | `{ slug, method: 'native' \| 'copy' }` | Dark-social virality indicator. |
| `outbound_source_click` | `Post.astro` (external `<a>` click in `.body` / `.margins`) | `{ slug, host }` | Validates trust & primary-source verification behavior. |
| `calculator_compute` | `prompt-caching-calculator.astro` (debounced input change) | `{ breakEven }` | Measures interactive tool engagement. |
| `inference_cta_click` | Article/header/footer CTAs → `/inference/` | `{ source_slug, placement }` | Direct attribution from organic articles to INFERENCE funnel. |

---

### 5.3 30 / 60 / 90-Day North Star KPI Scorecard

Stop optimizing for raw Umami pageviews (currently polluted by bot Direct traffic). Track these **six verified KPIs** on the 1st of each month alongside `docs/AI-CITATION-LOG.md`:

| KPI | Baseline (2026-11-28) | 30-Day Target | 60-Day Target | 90-Day Target | Source |
|---|---|---|---|---|---|
| **Google Indexed Pages** | Low / ~0 organic clicks | ≥80% of sitemap indexed on `<domain>` | ≥90% indexed | ≥95% indexed + `/inference/` live | GSC |
| **Google Organic Clicks (30d)** | ~0 | 25–50 | 150–300 | 500+ | GSC |
| **Bing Copilot Cited Pages / Day** | 1 page/day (single-page monopoly) | ≥3 unique pages/day | ≥6 unique pages/day | ≥10 unique pages/day | BWT AI Performance |
| **AI Retrieval Crawler Hits (30d)** | Invisible (no logs) | Baseline captured (`OAI-SearchBot`, `Claude-SearchBot`, `PerplexityBot`) | +50% unique URLs crawled | Full-archive weekly recrawl | Cloudflare AI Crawl Control |
| **Human-Verified Article Completions (`read_90`, 30d)** | 0 (unmeasured) | Baseline established | +40% MoM | +100% vs. Day-30 baseline | Umami Cloud |
| **Referring Domains (Dofollow, Non-Spam)** | Near 0 | ≥5 (GitHub, Dev.to, directories/PRs) | ≥15 | ≥30 (incl. editorial / newsletter citations) | Ahrefs Webmaster Tools |

---

## References (Verified Primary & Academic Sources)

1. Aggarwal, P., Murahari, V., Rajpurohit, T., Kalyan, A., Narasimhan, K., & Deshpande, A. (2024). *GEO: Generative Engine Optimization*. Proceedings of the 30th ACM SIGKDD Conference on Knowledge Discovery and Data Mining (KDD '24). `arXiv:2311.09735`.
2. Puerto, H., Gubri, M., Green, T., Oh, S. J., & Yun, S. (2025). *C-SEO Bench: Does Conversational SEO Work?* NeurIPS Datasets & Benchmarks Track. `arXiv:2506.11097`.
3. Chen, M., Wang, X., Chen, K., & Koudas, N. (2025). *Generative Engine Optimization: How to Dominate AI Search*. `arXiv:2509.08919`.
4. *Source Coverage and Citation Bias in LLM-based vs. Traditional Search Engines* (2025). `arXiv:2512.09483`.
5. Yu, J., Yang, M., Ding, Y., & Sato, H. (2026). *Structural Feature Engineering for Generative Engine Optimization: How Content Structure Shapes Citation Behavior (GEO-SFE)*. `arXiv:2603.29979`.
6. Vishwakarma, R., Kumar, S., & Jamidar, R. (2026). *What Gets Cited: Competitive GEO in AI Answer Engines*. ACM SIGIR '26. `arXiv:2605.25517`.
7. Martinez, O. (2026). *A Critical Survey of Generative Engine Optimization (2023–2026)*. Sciences Po Paris. `arXiv:2607.14035`.
8. Moore & Dunne (2026). Multi-method observational study on prompt-content alignment and Simpson's Paradox in AEO. `arXiv:2609.35077`.
9. Chen, M., & Koudas, N. (2026). *What Drives AI Citations? Content, Retrieval and Model Knowledge in Generative Engine Optimization (GEO)*. `arXiv:2610.15033`.
10. Internal repo baselines: `docs/research/ai-citability.md`, `docs/research/search-and-ai-performance-audit-2026.md`, `docs/backlink-strategy.md`, `docs/AI-CITATION-LOG.md`, `site/src/components/SEO.astro`, `site/src/layouts/Post.astro`, `site/src/layouts/Base.astro`, `site/astro.config.mjs`, `site/harness/registry.mjs`, `.github/workflows/deploy.yml`.
