# Investment Memorandum, ROI Financial Model & Commercialization Roadmap
**Assets Covered:** wAIbi-sabi Applied-AI Journal (`janmejai2002.github.io` → Custom Domain) & **INFERENCE AI Compendium**  
**Prepared for:** Janmejai Singh Minhas (Owner & Principal Author)  
**Date:** 2026-11-28  
**Currency & FX Convention:** Base model in **INR (`₹`)** and **USD (`$`)** at a fixed planning benchmark of **`1 USD = ₹85.00 INR`**.  
**Status:** Board-Ready Commercialization Blueprint (Replaces pre-launch assumptions in [`docs/MONETISATION-PLAN.md`](../MONETISATION-PLAN.md) for product monetization while preserving its editorial firewall).

---

## Executive Summary & Board Recommendation

### 1. The Commercial Inflection Point
When [`docs/MONETISATION-PLAN.md`](../MONETISATION-PLAN.md) was written on 2026-08-26, wAIbi-sabi had **7 articles, zero analytics, and no digital product**—making sponsorship and paid acquisition non-viable for 12–24 months. As of **2026-11-28**, the asset base has fundamentally changed:

| Asset / Metric | Verified Baseline (2026-11-28) | Source / Verification |
|---|---|---|
| **wAIbi-sabi Blog Corpus** | **133 published AI articles** (131 `.md` files verified across 5 tracks in `site/src/content/blog/`: 35 Technical, 27 Business, 24 Case Studies, 23 Talks, 22 Basics) | Owner baseline & `site/harness/registry.mjs` |
| **B-School Interview Archive** | **708 structured news & interview-angle entries** (`/news/`) | `site/src/data/news.json` |
| **Interactive Utility Assets** | AI Claims Tracker (`/tracker/`), Prompt Caching Calculator (`/tools/prompt-caching-calculator/`), Embeddable `<TrackerWidget />` | `site/src/pages/` & `site/src/components/` |
| **Flagship IP Product** | **INFERENCE AI Compendium** — **150,033 words, 36 units across 7 B-school/business domains** (co-authored with Chaitanya Sharma) | Owner baseline |
| **Traffic (Umami Cloud, 30d)** | **532 visitors, 2,910 views** (**5.47 views/visitor** engagement depth), **97% Direct**, Google Organic ~0, Bing #1 search referrer (11 all-time) | Owner Umami Cloud audit (2026-11-28) |
| **Conversion Plumbing** | **0 custom Umami events**, **0 email subscribers captured on-site**, still on `.github.io` subdomain | `site/src/seo.ts` & `site/astro.config.mjs` |
| **Current Monthly Burn** | **₹0 / $0 per month** (GitHub Pages + Actions + Notion + Sheets + Umami Free + Clarity Free) | Infrastructure audit |

### 2. Core CFO Thesis
1. **Do NOT monetize wAIbi-sabi like an ad-supported newsletter.** Ad-supported AI newsletters require 35K–100K+ subscribers to generate meaningful cashflow (`$140–$220` CPM at 30K+ scale; `$50–$250` flat slots below 5K).
2. **Treat INFERENCE as a high-margin digital IP business (~95–98% gross margin before ad spend) and wAIbi-sabi as its zero-CAC acquisition & authority engine.** Selling a `₹1,999` (`$49`) product requires **only 19 India sales or 10 Global sales**—or **1 Campus B2B 50-seat deal (`₹45,000`)**—to repay the entire 90-day Lean Launch budget (`₹35,315`).
3. **Stage-Gate Capital Allocation (Recommended Decision):**
   - **Approve Scenario A (Lean Bootstrapped Launch): `₹35,315` (`$415.47`) 90-day commitment** (`₹38,847` / `$457.02` with 10% buffer) immediately.
   - **Hold Scenario B (`₹3,20,765` / `$3,773.71`) behind strict Week-8 ROAS & Legal Gates.** Specifically, do **not** run direct-to-checkout LinkedIn Ads for a `$47.50` Global B2C SKU (`$80–$175` cold CAC yields `0.27x–0.59x` ROAS—value-destructive). Deploy LinkedIn/Global paid spend *only* via lead-magnet-to-email nurture or B2B/Consulting pipelines, while focusing paid B2C validation on **India Meta/IG + High-Intent Search** (`₹1,000` Base CAC vs `₹1,999` Full Edition = **`2.00x` gross ROAS**).
4. **12-Month Expected Outcomes (Entity Level vs. Owner Net Post-Split):**
   - **Conservative (Lean Downside):** `₹7,21,790` (`$8,492`) Gross Revenue → `₹6,11,559` (`$7,195`) Entity Net Profit (`693%` ROI on `₹88,200` OpEx) → **`₹3,82,354` (`$4,498`) Janmejai Net Share** (assuming 50/50 split on INFERENCE net proceeds, 100% on Blog/Consulting).
   - **Base Case (Disciplined Reinvestment):** `₹24,19,142` (`$28,460`) Gross Revenue → `₹21,01,930` (`$24,729`) Entity Net Profit (`858%` ROI on `₹2,44,900` OpEx) → **`₹13,41,841` (`$15,786`) Janmejai Net Share**.
   - **Upside (Scenario B Acceleration):** `₹59,45,313` (`$69,945`) Gross Revenue → `₹46,72,496` (`$54,971`) Entity Net Profit (`425%` ROI on `₹11,00,765` OpEx) → **`₹30,80,558` (`$36,242`) Janmejai Net Share**.

---

## 1. Capital Allocation & Investment Ask (Two Scenarios)

### 1.1 Scenario A: Lean Bootstrapped Launch (Recommended Initial Tranche)
Designed to stand up a custom domain, domestic & international payment rails, on-site email capture, conversion telemetry, and a gated `₹30,000` (`₹10,000/mo × 3`) paid validation test in India B2C.

| Category | Line Item | Cadence | Cost (INR) | Cost (USD) | Notes & Vendor Selection |
|---|---|---|---:|---:|---|
| **One-Time Setup** | Primary Custom Domain (`.com`) | Annual (Day 1) | `₹1,020` | `$12.00` | Cloudflare Registrar at-cost (avoid `.ai` at ~$75/yr in Lean) |
| **One-Time Setup** | Co-Author MOU & Legal T&Cs / Refund Policy | One-Time | `₹2,000` | `$23.53` | E-stamp + signed revenue-share & IP agreement with Chaitanya Sharma |
| **One-Time Setup** | Razorpay + Dodo Payments / Lemon Squeezy Onboarding | One-Time | `₹0` | `$0.00` | Zero setup fee; transaction-fee only upon revenue |
| **One-Time Setup** | PDF Stamping & Delivery Automation | One-Time | `₹0` | `$0.00` | Built into MoR (Dodo/Lemon Squeezy) + Cloudflare Worker / Webhook |
| *Subtotal* | **Total One-Time / Day-1 Setup CapEx** | — | **`₹3,020`** | **`$35.53`** | |
| **Monthly OpEx** | Hosting, CI/CD, CMS, Analytics (GitHub/Notion/Umami/Clarity) | Monthly | `₹0` | `$0.00` | Existing free stack; Umami Free covers up to 100k events/mo |
| **Monthly OpEx** | Cloudflare DNS, SSL, Redirects & AI Crawl Control | Monthly | `₹0` | `$0.00` | Cloudflare Free tier |
| **Monthly OpEx** | Email Capture & API Digest (Buttondown Paid / Kit Free fallback) | Monthly | `₹765` | `$9.00` | Buttondown Paid (`$9/mo`) budgeted from M1 for custom domain + API; `$0` if using Kit Free (<10k subs) |
| **Monthly OpEx** | Gated Paid Ad Validation (75% Meta/IG, 25% Google Search — India) | Monthly (M1–M3) | `₹10,000` | `$117.65` | Strictly tranche-gated at `₹10k` checkpoints (see §2.4 kill switches) |
| *Subtotal* | **Total Monthly Operating & Test Spend** | **Monthly** | **`₹10,765`** | **`$126.65`** | Fixed SaaS only = `₹765/mo` (`$9.00/mo`) |
| **90-Day Ask** | **Unbuffered 90-Day Runway (CapEx + 3× Monthly)** | **Q1 Total** | **`₹35,315`** | **`$415.47`** | `₹3,020 + (3 × ₹10,765)` |
| **90-Day Ask** | **With 10% Contingency Buffer** | **Q1 Total** | **`₹38,847`** | **`$457.02`** | Maximum cash-at-risk during 90-day validation |

### 1.2 Scenario B: Growth Acceleration (Gated Expansion Tranche)
Designed for simultaneous multi-channel paid testing (Meta, LinkedIn, Google), B-school campus/creator seeding, automated email drip sequences, and conversion-rate optimization (CRO) tooling. **Should only be unlocked after Scenario A validates landing page CVR >= 1.5% and co-author IP agreement is executed.**

| Category | Line Item | Cadence | Cost (INR) | Cost (USD) | Notes & Vendor Selection |
|---|---|---|---:|---:|---|
| **One-Time Setup** | Domains (`.com` + defensive `.in` redirect) | Annual (Day 1) | `₹1,620` | `$19.06` | Cloudflare Registrar |
| **One-Time Setup** | Formal Co-Author Partnership/IP Counsel & GST/FEMA CA Review | One-Time | `₹15,000` | `$176.47` | CA + legal review of MoR LUT export & split terms |
| **One-Time Setup** | Ad Creative Kit (Carousels, Reels, LinkedIn Doc Ads, Preview PDF) | One-Time | `₹12,000` | `$141.18` | High-converting visual assets for Meta/LinkedIn tests |
| **One-Time Setup** | Campus Placement Rep & Club Seeding Kit | One-Time | `₹5,000` | `$58.82` | Review decks, QR collateral, sample chapters for IIM/XLRI/ISB clubs |
| *Subtotal* | **Total One-Time Setup CapEx** | — | **`₹33,620`** | **`$395.53`** | |
| **Monthly OpEx** | Pro Email / CRM & Automated Drip Sequences (Buttondown Pro / Kit) | Monthly | `₹2,465` | `$29.00` | Unlocks multi-step preview-to-paid sequences & segmentation |
| **Monthly OpEx** | Analytics & CRO Stack (Umami Pro / Tally Pro / A/B Testing) | Monthly | `₹1,700` | `$20.00` | Deeper retention, checkout funnel attribution & form logic |
| **Monthly OpEx** | SEO & Outbound Enrichment Tooling (Keyword + B2B Club Contacts) | Monthly | `₹2,550` | `$30.00` | Keyword gap discovery + placement cell / sponsor contact lookup |
| **Monthly OpEx** | Paid Media — Meta & Instagram (India B-School & Tech B2C) | Monthly | `₹25,000` | `$294.12` | Core B2C volume test (Lead Magnet + Direct Full Edition) |
| **Monthly OpEx** | Paid Media — LinkedIn Ads (Global Lead Magnet & B2B Decision-Makers) | Monthly | `₹34,000` | `$400.00` | ~$13/day min to clear LinkedIn learning phase; **Lead-Gen Form only** |
| **Monthly OpEx** | Paid Media — Google Search Ads (High-Intent Interview & AI Strategy) | Monthly | `₹15,000` | `$176.47` | Exact/phrase match on high-intent keywords |
| **Monthly OpEx** | Creator & Campus Micro-Sponsorships / Seeding | Monthly | `₹15,000` | `$176.47` | MBA prep YouTubers, LinkedIn voices, campus case competitions |
| *Subtotal* | **Total Monthly Recurring Spend** | **Monthly** | **`₹95,715`** | **`$1,126.06`** | Fixed SaaS = `₹6,715`; Paid + Seeding = `₹89,000` |
| **90-Day Ask** | **Unbuffered 90-Day Runway (CapEx + 3× Monthly)** | **Q1 Total** | **`₹3,20,765`** | **`$3,773.71`** | `₹33,620 + (3 × ₹95,715)` |
| **90-Day Ask** | **With 10% Working Capital Buffer** | **Q1 Total** | **`₹3,52,842`** | **`$4,151.08`** | Peak cash exposure before B2B deals settle |

---

## 2. Pricing Architecture, Unit Economics & Ad Funnel Sensitivity Model

### 2.1 Commercial SKU & Purchasing-Power-Parity (PPP) Pricing Architecture
INFERENCE (150,033 words, 36 units across 7 domains) is positioned as an executive-grade applied AI & business strategy compendium—priced above commodity e-books (`₹199`) and far below live cohorts (`₹25,000+`):

| SKU Tier | Scope | India Price (INR) | Global Price (USD / INR) | Payment / MoR Fee | Net Revenue / Sale (Pre-CAC) | Strategic Role |
|---|---|---|---|---|---|---|
| **Free Preview** | 2 sample units + Domain map | `₹0` | `$0` | `₹0` | `₹0` | Email capture & retargeting pool builder |
| **Individual Module** | 1 of 7 domains (~5 units, ~21k words) | **`₹499`** (`$5.87`) | **`$19`** (`₹1,615`) | 2.36% IN / 5%+$0.50 GL | `₹487` IN / `$17.55` (`₹1,492`) GL | Low-friction tripwire / downsell SKU |
| **Full Edition** | All 7 domains (36 units, 150k words) | **`₹1,999`** (`$23.52`) | **`$49`** (`₹4,165`) | 2.36% IN / 5%+$0.50 GL | `₹1,952` IN / `$46.05` (`₹3,914`) GL | **Core Paid Ad Hero SKU** (43% bundle savings vs 7 modules) |
| **Pro / Bundle** | Full Edition + Companion Prompts/Eval Repo + 12m Updates | **`₹3,499`** (`$41.16`) | **`$79`** (`₹6,715`) | 2.36% IN / 5%+$0.50 GL | `₹3,416` IN / `$74.55` (`₹6,337`) GL | AOV expander via 1-click checkout order bump |
| **Campus Cohort (50 seats)** | 50 Full Edition seats + watermarked distribution | **`₹45,000`** (`₹900/seat`) | `$529.41` | ~1.0% (NEFT/UPI/Card blend) | **`₹44,550`** (`$524.12`) | Club / placement-cell entry package |
| **Campus Batch (200 seats)** | 200 Full Edition seats + 1 Live 90-min Case/AI Session | **`₹1,40,000`** (`₹700/seat`) | `$1,647.06` | ~1.0% (NEFT/UPI/Card blend) | **`₹1,38,600`** (`$1,630.59`) | High-margin institutional anchor deal |

> **Blended B2C AOV Benchmarks:**
> - **India B2C Blended AOV = `₹1,474` (`$17.34`)** assuming 45% Module (`₹499`), 45% Full (`₹1,999`), 10% Pro (`₹3,499`). Net revenue after 2.36% Razorpay fee = **`₹1,439`**.
> - **Global B2C Blended AOV = `$47.50` (`₹4,038`)** assuming 25% Module (`$19`), 55% Full (`$49`), 20% Pro (`$79`). Net revenue after MoR fee (`5% + $0.50` = `$2.88`) = **`$44.63` (`₹3,793`)**.

### 2.2 Segment Unit Economics & Funnel Sensitivity Matrix

#### (a) India B-School & Tech Professional B2C (Meta/IG + Google Search)
*Channel mix benchmark: 75% Meta/IG (`₹12` Base CPC) + 25% Google Search (`₹25` Base CPC) → Blended CPC `₹15`.*

| Funnel Scenario | Target Landing SKU | Blended CPC | Landing CVR | Paid CAC | Net Rev / Sale | Contribution Margin / Sale | Gross ROAS | Payback | Verdict |
|---|---|---:|---:|---:|---:|---:|---:|---|---|
| **Conservative (Direct)** | Blended (`₹1,474`) | `₹18` | `1.0%` | `₹1,800` | `₹1,439` | **`-₹361`** | `0.82x` | Never | **KILL** — Underwater at 1.0% CVR |
| **Base (Direct Blended)** | Blended (`₹1,474`) | `₹15` | `1.5%` | `₹1,000` | `₹1,439` | **`+₹439`** | `1.47x` | Instant | Marginal; requires order-bump upsells |
| **Base (Direct Full-Only)** | Full Edition (`₹1,999`) | `₹15` | `1.5%` | `₹1,000` | `₹1,952` | **`+₹952`** | **`2.00x`** | Instant | **VIABLE** — Paid ads MUST route to Full Edition |
| **Upside (Direct / Nurture)** | Blended (`₹1,474`) | `₹12` | `2.2%` | `₹545` | `₹1,439` | **`+₹894`** | **`2.70x`** | Instant | **SCALE** — Positive unit cash generation |
| **2-Step Lead Funnel (Meta)** | Free Preview → Full (`₹1,999`) | `₹10` | `25% lead × 5% buy` | **`₹800`** | `₹1,952` | **`+₹1,152`** | **`2.50x`** | 7–14 days | **BEST STRUCTURE** — Builds email asset from 95% non-buyers |

> **Critical CFO Rule #1:** **Never send paid traffic to the `₹499` Individual Module page.** At `₹1,000` CAC, a `₹499` sale loses **`-₹513`** per customer. Always pitch **`₹1,999` Full Edition** (with `₹3,499` Pro bump) on paid traffic and offer `₹499` strictly as an exit-intent downsell or email tripwire.

#### (b) Global Professional B2C (LinkedIn vs. Search vs. Niche Newsletter Sponsorships)
*Note: LinkedIn Ads cold CPCs (`$2.80–$3.50+`) make direct-to-checkout economics structurally unprofitable for sub-$100 products.*

| Channel & Motion | Blended CPC | Funnel CVR | Paid CAC | AOV | Net Rev (Post-MoR) | Contribution Margin | Gross ROAS | Verdict |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| **LinkedIn Direct (Conservative)** | `$3.50` | `2.0%` | `$175.00` | `$47.50` | `$44.63` | **`-$130.38`** | `0.27x` | **DO NOT RUN** |
| **LinkedIn Direct (Base)** | `$2.80` | `3.5%` | `$80.00` | `$47.50` | `$44.63` | **`-$35.37`** | `0.59x` | **DO NOT RUN** |
| **LinkedIn Direct (Upside)** | `$2.20` | `5.0%` | `$44.00` | `$47.50` | `$44.63` | **`+$0.63`** | `1.08x` | Breakeven at best; zero margin of safety |
| **AI Newsletter Sponsorships / Search** | `$1.10` | `4.5%` | **`$24.44`** | `$47.50` | `$44.63` | **`+$20.19`** | **`1.94x`** | **VIABLE** via mid-sized AI newsletters (`$150–$250` flat slot) |
| **wAIbi-sabi Organic SEO/AEO + Email** | `$0.00` | `3.5% sub × 4% buy` | **`~$2.00`** (SaaS alloc.) | `$47.50` | `$44.63` | **`+$42.63`** | **N/A (~22x)** | **PRIMARY GLOBAL ENGINE** |

> **Critical CFO Rule #2:** LinkedIn Ads in Scenario B (`₹34,000/mo`) must **NOT** optimize for `$49` B2C checkouts. Use LinkedIn solely if targeting **(a) B2B Campus/Corporate training leads (`$1,500+` ACV)** or **(b) High-ticket AI Risk/Eval Consulting leads (`$2,500–$5,000` ACV)**. For Global B2C, rely on **wAIbi-sabi Organic SEO/AEO** + selective **$150–$250 AI newsletter placements**.

#### (c) Campus / Club B2B Bulk Deals (IIM / XLRI / ISB / FMS / SPJIMR / MDI)
*Low-CAC direct outbound leveraging Janmejai's XLRI affiliation, national case competition finalist track record (`about.astro`), and existing `/news/` (708 entries) B-school brand equity.*

| Deal Tier | Deal Value | Direct Sales & Sample Cost | Payment Fee (~1% NEFT/UPI/Card) | Net Contribution | Gross Margin % | Payback |
|---|---:|---:|---:|---:|---:|---|
| **50-Seat Cohort Pack** (`₹900/seat`) | `₹45,000` (`$529`) | `₹2,500` (outreach/samples) | `₹450` | **`₹42,050`** (`$495`) | **93.4%** | Immediate (pre-paid invoice) |
| **200-Seat Batch License** (`₹700/seat`) | `₹1,40,000` (`$1,647`) | `₹5,000` + 2 hrs live AMA | `₹1,400` | **`₹1,33,600`** (`$1,572`) | **95.4%** | Immediate (pre-paid invoice) |
| **Blended B2B Deal (70% 50-seat / 30% 200-seat)** | **`₹73,500`** (`$865`) | `₹3,250` | `₹735` | **`₹69,515`** (`$818`) | **94.6%** | **1 B2B deal = ~49 B2C sales** |

### 2.3 Explicit Break-Even Sales Counts (Q1 90-Day Investment Recovery)

| Investment Scope | Capital to Recover (INR / USD) | India Full (`₹1,999`, Net `₹1,952`) | India Blended (`₹1,474`, Net `₹1,439`) | India Module (`₹499`, Net `₹487`) | Global Blended (`$47.50`, Net `₹3,793`) | Campus 50-Seat (`₹45k`, Net `₹44,550`) |
|---|---:|---:|---:|---:|---:|---:|
| **Scenario A Fixed Setup + SaaS Only** | `₹5,315` (`$62.53`) | **3 units** | **4 units** | **11 units** | **2 units** | **0.12 deals** |
| **Scenario A Full Q1 (incl. `₹30k` Ads)** | `₹35,315` (`$415.47`) | **19 units** | **25 units** | **73 units** | **10 units** | **1 deal** (`0.79`) |
| **Scenario B Fixed Setup + SaaS Only** | `₹53,765` (`$632.53`) | **28 units** | **38 units** | **111 units** | **15 units** | **2 deals** (`1.21`) |
| **Scenario B Full Q1 (incl. `₹2.67L` Ads/Seeding)** | `₹3,20,765` (`$3,773.71`) | **165 units** | **223 units** | **659 units** | **85 units** | **8 deals** (`7.20`) |

### 2.4 Paid Media Kill / Hold / Scale Governance Gates (First `₹10k–₹25k` Test Spend)
Never scale ad spend on intuition. Enforce automated checkpoint reviews at **`₹10,000`** (Day 14–21) and **`₹25,000`** (Day 35–45):

| Checkpoint | Spend Tranche | Metric Measured | **KILL Gate** (Pause & Fix Funnel) | **HOLD / ITERATE Gate** (Swap Creative/Offer) | **SCALE Gate** (Increase Budget +50%) |
|---|---|---|---|---|---|
| **Gate 1 (Early Signal)** | After **`₹10,000`** (`$118`) | CTR, CPC & Preview Opt-in Rate | Meta CTR `< 0.8%` OR CPC `> ₹22` OR Preview Opt-in `< 12%` | CTR `0.8%–1.3%` OR CPC `₹16–₹22` OR Opt-in `12%–20%` | CTR `>= 1.5%`, CPC `<= ₹15`, Preview Opt-in `>= 22%` |
| **Gate 2 (Unit Economics)** | After **`₹25,000`** (`$294`) | Checkout CVR, Paid CPA & ROAS | Blended CPA `> ₹1,350` OR Gross ROAS `< 1.1x` | CPA `₹950–₹1,350` AND ROAS `1.1x–1.7x` | **CPA `<= ₹850` AND Gross ROAS `>= 2.0x`** |
| **Gate 3 (Global Paid)** | After **`$150`** (`₹12,750`) | Email CPL & 14-day Paid Conv. | CPL `> $5.00` OR 14d Paid ROAS `< 0.8x` | CPL `$3.00–$5.00` AND ROAS `0.8x–1.4x` | **CPL `<= $2.50` AND 14d Paid ROAS `>= 1.6x`** |

---

## 3. 12-Month Revenue & Net Profit Projections (Dec 2026 – Nov 2027)

### 3.1 Explicit Model Assumptions Register
Every row in the 12-month projections below is governed by these explicit parameters (zero black-box formulas):

| Parameter | Conservative | Base | Upside | Justification |
|---|---|---|---|---|
| **Starting Traffic & Organic Ramp** | 532/mo → 2,200/mo by M12 | 532/mo → 5,500/mo by M12 | 532/mo → 12,000/mo by M12 | Custom domain GSC indexing + 133 existing articles + daily pipeline |
| **On-Site Email Capture Rate** | 2.0% of visitors | 3.5% of visitors | 5.0% of visitors | Driven by `/news/` & track-specific INFERENCE Preview CTAs |
| **India B2C Paid Ad Budget** | `₹10k/mo` M1–3, cut to `₹3k–₹8k` | `₹10k` M1–2 → scales to `₹30k` M9 | `₹74k/mo` M1–3 → `₹75k–₹105k` | Scaled strictly from cashflow in Base; front-loaded Scenario B in Upside |
| **Global B2C Paid Strategy** | `₹0` (Organic SEO/AEO only) | Light newsletter slots M6+ | Newsletter + Search + Lead-Gen | Avoids unprofitable cold LinkedIn B2C direct checkout |
| **Campus B2B Closed Deals (12m)** | 2 × 50-seat cohorts (`₹90k`) | 6 × 50-seat + 1 × 200-seat (`₹4.10L`) | 12 × 50-seat + 4 × 200-seat (`₹11.0L`) | Timed to Feb Finals & Jul–Sep SIP onboarding |
| **Consulting Engagements (12m)** | 2 small audits (`₹35k` avg) | 4 engagements (`₹50k–₹75k` avg) | 7 engagements (`₹60k–₹125k` avg) | Credibility-led (Amex/Gray Swan/wAIbi-sabi `/about/` CTA) |
| **Blog Sponsors & Affiliates** | Starts M5 (`$25–$150/mo`) | Starts M4 (`$50–$800/mo`) | Starts M2 (`$50–$2,050/mo`) | Gated on email list crossing 500–1,000+ engaged subscribers |
| **Payment / MoR Fee Rate** | 2.36% IN / 5%+$0.50 GL / 1% B2B | Same | Same | Razorpay (2% + 18% GST) & Dodo/Lemon Squeezy MoR |
| **Co-Author Split Sensitivity** | Shown at **50/50 INFERENCE Net** | Shown at **50/50 INFERENCE Net** | Shown at **50/50 INFERENCE Net** | Blog/Consulting = 100% Janmejai; INFERENCE net = 50% Janmejai |

### 3.2 Annual Summary Comparison (4 Revenue Streams + Net Profit + Owner Share)

| Line Item | Conservative (INR / USD) | Base (INR / USD) | Upside (INR / USD) | % Share (Base) |
|---|---:|---:|---:|---:|
| **Stream 1: INFERENCE Individual Modules** | `₹88,043` (`$1,036`) | `₹2,24,027` (`$2,636`) | `₹5,04,188` (`$5,932`) | 9.3% |
| **Stream 2: INFERENCE Full Edition + Pro** | `₹3,87,472` (`$4,558`) | `₹11,91,490` (`$14,018`) | `₹28,22,125` (`$33,201`) | 49.3% |
| **Stream 3: Campus / Club B2B Licenses** | `₹90,000` (`$1,059`) | `₹4,10,000` (`$4,824`) | `₹11,00,000` (`$12,941`) | 16.9% |
| **Stream 4: wAIbi-sabi Blog & Consulting** | `₹1,56,275` (`$1,839`) | `₹5,93,625` (`$6,984`) | `₹15,19,000` (`$17,871`) | 24.5% |
| **Total Gross Revenue (100% Entity)** | **`₹7,21,790`** (`$8,492`) | **`₹24,19,142`** (`$28,460`) | **`₹59,45,313`** (`$69,945`) | **100.0%** |
| *Less:* Payment Gateway & MoR Fees | `-₹22,031` (`-$259`) | `-₹72,312` (`-$851`) | `-₹1,72,052` (`-$2,024`) | -3.0% |
| *Less:* Total CapEx, SaaS & Paid Ad OpEx | `-₹88,200` (`-$1,038`) | `-₹2,44,900` (`-$2,881`) | `-₹11,00,765` (`-$12,950`) | -10.1% |
| **Entity Net Profit (Pre-Tax, Pre-Split)** | **`₹6,11,559`** (`$7,195`) | **`₹21,01,930`** (`$24,729`) | **`₹46,72,496`** (`$54,971`) | **86.9%** |
| **Cash-on-Cash ROI (`Net Profit / Total Spend`)** | **693.4%** (`6.9x`) | **858.3%** (`8.6x`) | **424.5%** (`4.2x`) | — |
| **Peak Working Capital Deficit / Payback** | `₹0` / **M1 (Dec)** | `₹0` / **M1 (Dec)** | `-₹62,384` / **M2 (Jan)** | — |
| **12m B2C Units Sold (IN + GL)** | 267 units | 723 units | 1,671 units | — |
| **12m B2B Seats Licensed** | 100 seats | 500 seats | 1,400 seats | — |
| **Janmejai Attributable Profit (50% INFERENCE + 100% Blog)** | **`₹3,82,354`** (`$4,498`) | **`₹13,41,841`** (`$15,786`) | **`₹30,80,558`** (`$36,242`) | — |

### 3.3 Month-by-Month P&L Breakdown — Base Case (Recommended Path, All Figures in INR)
*Accounts for Indian B-school seasonality: Dec–Feb Final Placements, Mar–Jun Pre-MBA / Off-Peak, Jul–Oct Summer Internship Placements (SIP Peak).*

| Month | Stream 1: Modules | Stream 2: Full + Pro | Stream 3: Campus B2B | Stream 4: Blog + Consult | Gross Revenue | Fees (PG/MoR) | OpEx & Ad Spend | Entity Net Profit | Cumulative Cash |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| **M1 (Dec)** | `₹5,607` | `₹27,821` | `₹0` | `₹0` | `₹33,428` | `₹1,179` | `₹13,785` | `₹18,464` | `₹18,464` |
| **M2 (Jan)** | `₹10,216` | `₹57,693` | `₹45,000` | `₹0` | `₹1,12,909` | `₹2,900` | `₹10,765` | `₹99,244` | `₹1,17,708` |
| **M3 (Feb)** | `₹12,829` | `₹65,856` | `₹0` | `₹50,000` | `₹1,28,685` | `₹3,942` | `₹15,765` | `₹1,08,978` | `₹2,26,686` |
| **Q1 Subtotal** | **`₹28,652`** | **`₹1,51,370`** | **`₹45,000`** | **`₹50,000`** | **`₹2,75,022`** | **`₹8,021`** | **`₹40,315`** | **`₹2,26,686`** | **`₹2,26,686`** |
| **M4 (Mar)** | `₹10,833` | `₹57,860` | `₹0` | `₹4,250` | `₹72,943` | `₹2,791` | `₹15,765` | `₹54,387` | `₹2,81,073` |
| **M5 (Apr)** | `₹13,446` | `₹66,023` | `₹45,000` | `₹8,500` | `₹1,32,969` | `₹3,818` | `₹15,765` | `₹1,13,386` | `₹3,94,459` |
| **M6 (May)** | `₹15,442` | `₹84,400` | `₹0` | `₹83,375` | `₹1,83,217` | `₹5,719` | `₹18,265` | `₹1,59,233` | `₹5,53,692` |
| **Q2 Subtotal** | **`₹39,721`** | **`₹2,08,283`** | **`₹45,000`** | **`₹96,125`** | **`₹3,89,129`** | **`₹12,328`** | **`₹49,795`** | **`₹3,27,006`** | **`₹5,53,692`** |
| **M7 (Jun)** | `₹19,053` | `₹1,00,060` | `₹45,000` | `₹29,750` | `₹1,93,863` | `₹5,788` | `₹22,465` | `₹1,65,610` | `₹7,19,302` |
| **M8 (Jul)** | `₹23,662` | `₹1,26,433` | `₹1,85,000` | `₹38,250` | `₹3,73,345` | `₹8,547` | `₹27,465` | `₹3,37,333` | `₹10,56,635` |
| **M9 (Aug)** | `₹29,269` | `₹1,57,753` | `₹45,000` | `₹1,21,750` | `₹3,53,772` | `₹10,079` | `₹32,465` | `₹3,11,228` | `₹13,67,863` |
| **Q3 Subtotal** | **`₹71,984`** | **`₹3,84,246`** | **`₹2,75,000`** | **`₹1,89,750`** | **`₹9,20,980`** | **`₹24,414`** | **`₹82,395`** | **`₹8,14,171`** | **`₹13,67,863`** |
| **M10 (Sep)** | `₹27,273` | `₹1,52,973` | `₹0` | `₹55,250` | `₹2,35,496` | `₹8,358` | `₹27,465` | `₹1,99,673` | `₹15,67,536` |
| **M11 (Oct)** | `₹26,892` | `₹1,41,478` | `₹0` | `₹59,500` | `₹2,27,870` | `₹8,248` | `₹22,465` | `₹1,97,157` | `₹17,64,693` |
| **M12 (Nov)** | `₹29,505` | `₹1,53,140` | `₹45,000` | `₹1,43,000` | `₹3,70,645` | `₹10,943` | `₹22,465` | `₹3,37,237` | `₹21,01,930` |
| **Q4 Subtotal** | **`₹83,670`** | **`₹4,47,591`** | **`₹45,000`** | **`₹2,57,750`** | **`₹8,34,011`** | **`₹27,549`** | **`₹72,395`** | **`₹7,34,067`** | **`₹21,01,930`** |
| **FY Total (Base)** | **`₹2,24,027`** | **`₹11,91,490`** | **`₹4,10,000`** | **`₹5,93,625`** | **`₹24,19,142`** | **`₹72,312`** | **`₹2,44,900`** | **`₹21,01,930`** | **`₹21,01,930`** |

### 3.4 Quarterly Trajectory — Conservative vs. Upside (INR)

| Quarter | Conservative Gross | Conservative Net | Conservative Cum. Cash | Upside Gross | Upside OpEx | Upside Net | Upside Cum. Cash |
|---|---:|---:|---:|---:|---:|---:|---:|
| **Q1 (M1–M3)** | `₹1,14,801` | `₹76,676` | `₹76,676` | `₹7,23,312` | `₹3,20,765` | `₹3,82,658` | `₹3,82,658` |
| **Q2 (M4–M6)** | `₹77,111` | `₹63,066` | `₹1,39,742` | `₹10,98,966` | `₹2,30,000` | `₹8,35,296` | `₹12,17,955` |
| **Q3 (M7–M9)** | `₹2,59,160` | `₹2,30,234` | `₹3,69,975` | `₹20,22,063` | `₹2,85,000` | `₹16,81,295` | `₹28,99,249` |
| **Q4 (M10–M12)** | `₹2,70,718` | `₹2,41,585` | `₹6,11,559` | `₹21,00,972` | `₹2,65,000` | `₹17,73,246` | `₹46,72,496` |
| **12-Month Total** | **`₹7,21,790`** | **`₹6,11,559`** | **`₹6,11,559`** | **`₹59,45,313`** | **`₹11,00,765`** | **`₹46,72,496`** | **`₹46,72,496`** |

---

## 4. wAIbi-sabi Blog Monetization Architecture

### 4.1 Funnel Mapping Across the Existing Site Surfaces
The blog's **5.47 views/visitor** depth proves readers consume multiple pages once they arrive; the missing layer is **contextual routing and email capture**. Rather than plastering generic display ads, wire each existing track and utility page to its highest-intent commercial next step:

| Site Surface / Track | Current Volume | Primary Reader Intent | Contextual Conversion Offer (Zero-Clutter Callout) |
|---|---|---|---|
| **`/news/` (B-School Archive)** | **708 entries** | MBA students prepping for Product, Strategy & AI interviews | **Top Banner + Inline Card CTA:** *"Prepping for IIM/XLRI/ISB AI & PM interviews? Get the 2-unit INFERENCE Free Preview → Full 36-unit Compendium."* |
| **`Business` (27) & `Case Studies` (24)** | **51 articles** | Managers & B-schoolers evaluating AI ROI & unit economics | **Mid-Article & End-of-Post Box:** *"Inside INFERENCE: Complete 7-Domain AI Strategy & ROI Frameworks (150k words). Download Sample Chapters."* |
| **`Basics` (22 articles)** | **22 articles** | Learners building foundational mental models | **End-of-Post Tripwire:** *"Start with Domain 1–2 (`₹499` / `$19`) or get the Free Preview PDF."* |
| **`Technical` (35) & `Talks` (23)** | **58 articles** | Applied AI engineers, ML leads, CTOs | **1. Weekly Digest Capture** + **2. High-Intent B2B Tool Affiliates** (eval/GPU/API tools) + **3. Consulting CTA** |
| **`/tracker/` & `/tools/prompt-caching-calculator/`** | High-utility tools | Practitioners budgeting inference & auditing vendor claims | **Result Footer CTA:** *"Want our team to audit your AI stack / eval pipeline? Book an Applied-AI Audit (`/about/`)."* |
| **`/about/`** | Credibility anchor | Recruiters, founders, advisory buyers | **Explicit Advisory Menu:** AI Evals & Red-Teaming Audits, Credit/Risk Modelling, Enterprise RAG Architecture (`₹50k–₹1.5L` / `$1.5k–$5k` sprints). |

### 4.2 Newsletter Capture & Automation Stack Comparison
A reader who visits and leaves without subscribing is permanently lost. Per [`docs/MONETISATION-PLAN.md`](../MONETISATION-PLAN.md) §4–5 and [`docs/research/monetisation.md`](../research/monetisation.md), the stack must support **static Astro forms**, **non-expiring API keys** (for automated weekly digest assembly), and **low fixed cost**:

| Platform | Pricing | API & Automation Fit | Verdict for wAIbi-sabi |
|---|---|---|---|
| **Buttondown** *(Recommended)* | `$0` (0–100 subs), **`$9/mo`** (101–1,000 subs + custom domain), `$29/mo` (automations) | **Best-in-class static API key + Markdown-first**; aligns natively with the GitHub Actions / Astro repo | **Primary Choice.** Start free/paid (`$9/mo`), automate weekly *"1 Practitioner Question, Graded"* digest |
| **Kit (ConvertKit)** | `$0` up to 10,000 subs (1 automation, Kit branding); `$29/mo` Creator | Good forms/deliverability; free tier restricts multi-step sequences & branding | **Fallback** if Scenario A needs `$0` SaaS past 100 subs without paying `$9/mo` |
| **Beehiiv** | `$0` Launch up to 2,500 subs; `$39–$49/mo` Scale (Ad Network) | Built for ad-network sponsorships, heavier UI, less repo-native | **Revisit at 2,500+ subs** if sponsorship ad-network monetization becomes primary |

### 4.3 Protecting Radical-Honesty Editorial Trust
To monetize without eroding wAIbi-sabi's core moat (graded claims, public corrections):
1. **Publish `/sponsorship/` Policy Before Taking Revenue:** Adopt the firewall drafted in [`docs/MONETISATION-PLAN.md`](../MONETISATION-PLAN.md) §5 (sponsors buy clearly labeled placement only; zero pre-publication review; **companies actively graded in Case Studies cannot sponsor**).
2. **High-Intent Affiliate Rule:** Only link B2B AI infrastructure/eval tools in dedicated *"Stack & Tools"* or footer disclosures—never alter an evidence grade for an affiliate commission, and disclose affiliate relationships inline (`rel="sponsored noopener"`).
3. **Zero-Cookie Integrity on Editorial Pages:** Keep the blog's existing cookieless pledge intact on article pages; isolate ad-retargeting pixels strictly to `/inference/` commercial landing/checkout routes (see §5).

---

## 5. Platform, Technical & Legal/Compliance Checklist (India + Global)

### 5.1 Platform & Integration Connection Checklist

| Layer | Platform / Account | Exact Repo / Config Touchpoint | Action & Purpose |
|---|---|---|---|
| **1. Domain & DNS** | **Cloudflare Registrar + Free DNS** | `site/public/CNAME`, `site/astro.config.mjs` (`site`), `site/harness/registry.mjs` (`SITE_URL`), `site/src/pages/about.astro` | Buy `.com` (`₹1,020/yr`). Proxy DNS through Cloudflare Free for SSL, 301 edge redirects, and **AI Crawl Control** (tracks GPTBot, ClaudeBot, ChatGPT-User, Perplexity-User fetches). |
| **2. India Payments** | **Razorpay** (Business/Individual) | `/inference/` checkout links / Payment Pages + Webhook | Collect UPI, RuPay, domestic cards & Netbanking at `~2.36%` total fee. Configure instant webhook to trigger PDF watermark/access email. |
| **3. Global Payments (MoR)** | **Dodo Payments** *(or Lemon Squeezy / Paddle)* | `/inference/` international checkout toggle (Geo-IP / currency selector) | Acts as **Merchant of Record (MoR)** (`~5% + $0.50`). Collects & remits EU VAT, UK VAT, US State Sales Tax globally and settles net INR to Indian bank account (with export compliance docs). |
| **4. Email & Delivery** | **Buttondown** (or Kit) + **Cloudflare Worker / MoR Delivery** | Article footer, `/news/` banner, `/inference/` preview opt-in form | Capture leads via HTML POST/API; fire automated 4-email welcome/preview-to-paid sequence; deliver watermarked PDF + Notion/GitHub companion invite. |
| **5. Product Telemetry** | **Umami Cloud** (`df2f7d8f-549a-412b-a2d5-be4d82ab4426`) | `site/src/seo.ts` + custom `umami.track(...)` hooks | Update domain in Umami dashboard. Instrument 6 events: `preview_optin`, `cta_click_inference`, `checkout_start`, `purchase_complete`, `b2b_inquiry`, `consulting_click`. |
| **6. Search & Indexing** | **Google Search Console + Bing Webmaster** | `site/src/seo.ts`, `sitemap-index.xml`, IndexNow | Add custom domain as **DNS Domain Property** in GSC via Cloudflare TXT record; verify Bing + IndexNow; submit `sitemap-index.xml` on Day 1 of domain switch. |
| **7. Paid Ad Attribution** | **Meta Pixel + Conversions API (CAPI)**, **Google Ads Tag**, **LinkedIn Insight Tag** | **Scoped strictly to `/inference/` & `/thank-you/` routes** (not editorial blog posts) | Preserves `Base.astro` line 145 (*"no cookies"*) promise on editorial pages while giving Meta/Google purchase CAPI signals for ROAS optimization. |

### 5.2 Legal, Tax & Compliance Checklist (India + International)
- **GST (India):** Domestic digital IP / e-learning turnover below **`₹20 lakh/year`** (`₹10L` in special-category states) is generally exempt from mandatory GST registration unless making inter-state taxable B2B supplies requiring ITC or crossing threshold. **Action:** Consult an Indian CA on **HSN/SAC classification** (whether INFERENCE qualifies as an electronic book / study material vs online database/course at **18% GST**) and file an **LUT (Letter of Undertaking)** once GST-registered so international MoR exports remain zero-rated (`0% GST`).
- **FEMA & Export Remittance:** Ensure MoR payouts (Dodo/Paddle/Lemon Squeezy) settle with valid **e-FIRA / FIRC** and appropriate RBI Purpose Code (e.g., `P0802` / `P1007` — verify exact code with bank/CA).
- **Income Tax:** Evaluate **Section 44ADA / 44AD** presumptive taxation vs audited books depending on whether co-author payouts are structured as royalty/revenue-share expenses or a joint partnership/LLP.
- **Consumer Compliance:** Publish clear `/terms/`, `/privacy/`, and `/refund-policy/` pages (Razorpay & MoR underwriting require these before live activation; recommend a 7-day conditional refund policy or clear digital-goods non-refundable clause after download, paired with a generous free 2-unit preview).

### 5.3 Commercial Risks & Mitigations

| Risk | Severity | Impact | Concrete Mitigation |
|---|---|---|---|
| **1. Unclear Co-Author Split (Chaitanya Sharma)** | **CRITICAL (P0)** | Disputes over ad-spend deductions, gross vs net split, update obligations, or IP ownership stall scaling. | Execute a signed written agreement **before Day 1 launch** defining: (a) Net Distributable Proceeds (`Gross - PG/MoR Fees - Direct INFERENCE Ad Spend - Taxes`), (b) split % (e.g., 50/50 on INFERENCE; 100% Janmejai on wAIbi-sabi blog/consulting), (c) audit access & update cadence. |
| **2. PDF Piracy / Telegram Sharing in Indian B-Schools** | **HIGH** | Pirated PDFs circulate in MBA WhatsApp/Telegram groups during SIP/Finals, depressing B2C conversion. | (1) Dynamic per-buyer PDF watermarking (Buyer Name + Email + TxID stamped on every page); (2) Bundle **live Notion/web updates & prompt repo access** (static pirated PDFs go stale within 60 days); (3) Sell **Campus Club B2B Batch Licenses** (`₹700–₹900/seat`) so clubs champion legitimate access. |
| **3. Indian B-School Seasonality Cliffs** | **MEDIUM** | Demand spikes Aug–Oct (SIP) & Dec–Feb (Finals), then drops sharply Mar–Jun. | Counter-program Mar–Jun with **New CAT/XAT Admit Pre-MBA Packs** + **Global B2C organic/newsletter sales** + **Outbound Campus Club budgeting** for the incoming July batch. |
| **4. Custom Domain SEO Cold-Start** | **MEDIUM** | Moving off `janmejai2002.github.io` resets Google authority temporarily (30–90 days). | Configure GitHub Pages `CNAME` automatic 301 redirects, verify DNS Domain Property in GSC Day 1, re-ping Bing/IndexNow across all 133 posts, and run `<TrackerWidget />` / GitHub backlink outreach. |
| **5. Paid Ad Policy Rejections** | **LOW–MED** | Meta/Google flag "land a ₹30L job" style claims as misleading financial/employment promises. | Anchor all creatives on **verifiable product specs**: *"150,033 words · 36 B-school AI units · Grounded in 708 interview trends"*. |

---

## 6. 90-Day Execution Roadmap (Week-by-Week)

### Phase 1: Legal, Domain & Plumbing (Weeks 1–2 — Fixed Spend: `₹3,020`)
| Week | Owner Actions & Deliverables | Gate / Exit Criterion | Target KPI |
|---|---|---|---|
| **Wk 1** | Execute Co-Author IP & Revenue-Share MOU with Chaitanya Sharma. Register `.com` on Cloudflare Registrar (`₹1,020`). Verify GSC Domain Property + Bing Webmaster + Cloudflare AI Crawl Control. | Signed MOU in hand; custom domain live over HTTPS with 301 redirects from `.github.io`. | 0 broken canonicals; `npm run build` passes. |
| **Wk 2** | Onboard Razorpay (India) + Dodo Payments / Lemon Squeezy (Global). Create `/inference/` landing page, `/terms/`, `/privacy/`, `/refund-policy/`, `/sponsorship/`. Connect Buttondown (`$9/mo`) + Umami custom events. | Live test transactions (`₹10` / `$1`) succeed end-to-end with watermarked PDF delivery. | 6 Umami events firing cleanly; 0 console errors. |

### Phase 2: Organic Funnel Wiring & B2B Seeding (Weeks 3–4 — Spend: `₹765` SaaS)
| Week | Owner Actions & Deliverables | Gate / Exit Criterion | Target KPI |
|---|---|---|---|
| **Wk 3** | Wire contextual INFERENCE Preview CTAs across `/news/` (708 entries), `Business` (27), `Case Studies` (24), and `Basics` (22). Add Advisory/Consulting section on `/about/`. Publish Distribution Kit posts (`docs/DISTRIBUTION-KIT.md`) on LinkedIn/Reddit. | All 5 tracks + `/news/` display non-intrusive capture/preview CTAs; 4-email preview drip live. | First 50–100 email subscribers; 5+ organic INFERENCE sales (`₹10k+`). |
| **Wk 4** | Build list of 30 Tier-1 B-school Consulting/Product/Analytics clubs (XLRI, IIM A/B/C/L/K/I, ISB, FMS, SPJIMR, MDI). Send tailored 50-seat Cohort & 200-seat Batch proposals with 2-unit sample deck. | 30 personalized outbound pitches + warm alumni intros sent before December lateral/final waves. | 5+ club replies; **1st 50-seat B2B Cohort (`₹45,000`) in pipeline**. |

### Phase 3: Gated Paid Validation Test — Scenario A (Weeks 5–8 — Ad Spend: `₹20,000`)
| Week | Owner Actions & Deliverables | Gate / Exit Criterion | Target KPI |
|---|---|---|---|
| **Wk 5–6** | Launch **`₹10,000` Meta/IG + Search Validation Test** (A/B test: Direct-to-`₹1,999` Full Edition vs 2-Step Free Preview Lead Magnet; India MBA + young tech audience). Install Meta CAPI + Google conversion tags on `/inference/` only. | **Checkpoint Gate 1 at `₹10,000` spend:** Audit CTR, CPC, and Preview Opt-in Rate. | CTR `>= 1.5%`, CPC `<= ₹15`, Opt-in `>= 22%`. |
| **Wk 7–8** | Kill losing ad sets; deploy `₹10,000` tranche #2 into winning creative + retargeting preview downloaders. Close 1st Campus B2B Cohort deal. | **Checkpoint Gate 2 at `₹20k–₹25k` total ad spend:** Audit Paid CPA & Gross ROAS. | **CPA `<= ₹1,000`, Gross ROAS `>= 1.8x–2.0x`**, `>= 15` paid B2C sales + 1 B2B deal. |

### Phase 4: Optimize, Scale or Pivot & Q2 Capital Decision (Weeks 9–12 — Ad Spend: `₹10,000+`)
| Week | Owner Actions & Deliverables | Gate / Exit Criterion | Target KPI |
|---|---|---|---|
| **Wk 9–10** | Deploy `₹10,000` tranche #3 (or scale to `₹15k–₹20k` from positive profits if Gate 2 passed). Launch 1-click Pro Bundle (`₹3,499` / `$79`) order bump at checkout. Test 1 small AI newsletter sponsorship (`$150–$200`) for Global B2C validation. | Blended India AOV lifted above `₹1,650`; Global newsletter test ROAS measured. | Global newsletter CPA `< $30` (`>= 1.6x` ROAS). |
| **Wk 11–12** | **90-Day Board & Co-Author Financial Review:** Reconcile actual Q1 P&L, distribute first co-author net settlement, audit GSC organic impressions on custom domain, and decide whether to unlock **Scenario B** growth capital for Q2–Q3 SIP ramp. | Scenario A capital (`₹35,315`) fully recovered (`>= 1.0x` cash payback achieved). | **Q1 Target (Base): `₹2.75L` Gross Rev, `₹2.27L` Net Profit, 250+ email subs, 1 B2B deal, 1 consulting inquiry.** |
