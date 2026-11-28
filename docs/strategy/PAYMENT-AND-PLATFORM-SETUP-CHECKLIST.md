# Payment, Infrastructure & Legal Setup Checklist (Owner Playbook)

**Project:** `wAIbi-sabi` (`https://janmejai2002.github.io`) + `INFERENCE` (2027 Edition v1.0) + B-School 708-Story Dossier  
**Scope:** Exact owner action checklist for India payments (Razorpay), Global MoR payments (Dodo Payments / Lemon Squeezy), Cloudflare (Registrar, DNS Proxy, AI Crawl Control, R2 Vault), Email/CRM (Buttondown / Kit), code wiring touchpoints, and the Co-Author MOU with **Chaitanya Sharma**.

---

## 0. Pre-Flight Prerequisites (Required Before Gateway Underwriting)

Both **Razorpay** and **Dodo Payments / Lemon Squeezy** reject applications during compliance review if live policy pages or verifiable product pages are missing. Complete these first:

- [ ] **Publish 3 mandatory legal routes** on the live site (accessible from footer without login):
  - `/terms/` — Digital product non-transferable license terms, prohibited Telegram/Drive redistribution, governing law (India).
  - `/privacy/` — Minimal data collection disclosure (payment gateway handles card/UPI PII; editorial pages remain zero-cookie per `site/src/layouts/Base.astro` line 138; Umami Cloud cookieless telemetry).
  - `/refund-policy/` — Clear 7-day evidence-first refund rule for INFERENCE (`email janmejai2002@gmail.com with Order ID`), or explicit digital download terms for the standalone B-School Dossier.
- [ ] **Verify contact details match KYC:** Support email (`janmejai2002@gmail.com` in `site/src/data/inference.ts` line 79) and legal name on `/about/` match the PAN/bank account submitted to gateways.
- [ ] **Prepare master PDFs & companion ZIPs** locally before uploading to R2 / MoR:
  - `inference-2027-full-v1.0.pdf` (36 units, 150,033 words)
  - 6 individual domain module PDFs (`consulting`, `finance`, `product`, `marketing`, `operations`, `hr`)
  - `inference-2027-accelerator-pack.zip` (116-term Anki `.apkg`, 25 drill rubrics PDF, audio briefing MP3s)
  - `bschool-708-gdpi-dossier-2027.pdf` (compiled from `site/scripts/generate-news-dossier.mjs` + NotebookLM Pack D companion deck)

---

## 1. Razorpay Setup Guide (India INR / UPI Rail)

**Role:** Collects domestic INR via UPI Intent/QR, RuPay, domestic Visa/Mastercard, NetBanking, and institutional NEFT/RTGS at `~2.0% + 18% GST on fee` (`~2.36%` effective).

### 1.1 KYC & Account Onboarding Details

Register at `dashboard.razorpay.com` as **Individual / Unregistered Proprietorship** (if below ₹20L GST threshold) or **Registered Proprietorship / Partnership / LLP** (if GST-registered):

| Field | Exact Value / Document to Prepare | Notes / Gotchas |
|---|---|---|
| **Business Type** | Individual / Sole Proprietorship | Fastest approval (2–4 business days) if operating pre-GST registration. |
| **Business Category / MCC** | `Education` → `Books, Periodicals & Digital Publishing` | Avoid `Coaching/Guaranteed Placements` wording; Razorpay flags job-guarantee claims as high-risk. |
| **PAN & Identity** | Owner PAN Card + Aadhaar (DigiLocker e-KYC) | Name on PAN must match the bank account holder name 100%. |
| **Bank Settlement Account** | Indian Savings/Current Account + IFSC + Cancelled Cheque / 3-mo Bank Statement | Prefer a dedicated current/savings account separate from personal salary payouts for clean co-author reconciliation. |
| **Website / App URL** | `https://janmejai2002.github.io/inference/` (or custom `.com` once live) | Reviewer checks live pricing, product description, `/terms/`, `/privacy/`, and `/refund-policy/`. |
| **Descriptor (Customer Statement)** | `WAIBISABI INFERENCE` | Max 20 chars; reduces UPI chargebacks from unrecognised names. |

### 1.2 Payment Pages vs. Payment Links — SKU Architecture

Use **Razorpay Payment Pages** for self-serve B2C SKUs (hosted URL + custom dropdown/input fields + automatic email receipt + rich `notes` metadata passed to webhooks) and **Razorpay Payment Links / GST Invoices** for B2B Campus cohorts.

Create these exact 5 SKUs in **Razorpay Dashboard → Payment Pages / Payment Links**:

| SKU ID | Product Name | Price (INR) | Razorpay Type | Required Custom Fields / Variants | Webhook `notes` Metadata |
|---|---|---:|---|---|---|---|
| `domain-track` | INFERENCE 2027 — Individual Domain Track | `₹499` | **Payment Page** *(or 6 Track-Specific Payment Links)* | **Required Dropdown (`preferred_track`):** `consulting`, `finance`, `product`, `marketing`, `operations`, `hr` | `sku_id: "domain-track"`<br>`track_id: "<selected>"` |
| `full-edition` | INFERENCE 2027 — Full 36-Unit Edition | `₹1,999` | **Payment Page** | `Full Name` (for PDF watermark), `Email`, `Phone` | `sku_id: "full-edition"` |
| `placement-accelerator` | INFERENCE 2027 — Placement Accelerator Bundle | `₹3,499` | **Payment Page** | `Full Name`, `Email`, `Phone` | `sku_id: "placement-accelerator"` |
| `bschool-dossier-708` | wAIbi-sabi B-School 708-Story GDPI Dossier (2027) | `₹999` | **Payment Page** | `Full Name`, `Email`, `Target School / Domain` (optional) | `sku_id: "bschool-dossier-708"` |
| `campus-bulk` (`campus-50`) | INFERENCE Campus Cohort — 50 Seats | `₹45,000` | **Payment Link** *(with partial/NEFT/UPI/card enabled)* | `Institution / Club Name`, `Coordinator Name`, `Coordinator Email`, `GSTIN (optional)` | `sku_id: "campus-bulk"`<br>`seats: "50"` |
| `campus-200` *(Invoice Tier)* | INFERENCE Campus Batch — 200 Seats | `₹1,40,000` | **Razorpay Invoice / Payment Link** | Same institutional fields + `Club Stamp Text` | `sku_id: "campus-200"`<br>`seats: "200"` |

> **Important Tip on `domain-track` (`₹499`):** If you use **one** Razorpay Payment Page with a required dropdown for the 6 tracks, map the dropdown value cleanly or create **6 separate Payment Links** (one per domain in `INFERENCE_DOMAIN_OPTIONS`) so the webhook never receives an ambiguous free-text track name. Also set **Redirect URL** on every Payment Page to `https://<your-domain>/inference/thanks/?sku=<sku_id>`.

### 1.3 Webhook Configuration (`payment.captured`)

1. In **Razorpay Dashboard → Settings → Webhooks → + Add New Webhook**:
   - **Webhook URL:** `https://api.<your-domain>/webhooks/razorpay` (your Cloudflare Fulfillment Worker).
   - **Secret:** Generate a 32-char random hex secret (`openssl rand -hex 32`) and store it in Cloudflare Worker secrets as `RAZORPAY_WEBHOOK_SECRET`.
   - **Active Events:** Check **`payment.captured`** *(primary fulfillment trigger)*. Optionally also check `payment.failed` (triggers 1h/24h cart recovery email) and `refund.processed` (revokes license key in D1).
2. **Signature Verification (Cloudflare Worker):**
   - Compute `HMAC-SHA256(rawRequestBody, RAZORPAY_WEBHOOK_SECRET)` and constant-time compare against the `X-Razorpay-Signature` HTTP header. Reject non-matching requests with `401`.
3. **Payload Extraction & Idempotency:**
   - Extract `event.payload.payment.entity`: `id` (`pay_...`), `order_id`, `amount` (in paise: `49900`, `199900`, `349900`, `99900`, `4500000`), `currency` (`INR`), `email`, `contact`, and `notes` (`sku_id`, `track_id`, `full_name`).
   - Check Cloudflare D1 (`SELECT 1 FROM orders WHERE order_id = ?`) before stamping/emailing so Razorpay retries never issue duplicate license keys.
4. **Test Mode Verification:**
   - Switch Razorpay Dashboard to **Test Mode**, run a test UPI payment (`success@razorpay`), verify `200 OK` in **Webhooks → Logs**, confirm watermarked PDF + `INF-2027-XXXX-XXXX` license key email arrives within 15 seconds, then complete a real `₹1`–`₹10` live test before turning on ads.

### 1.4 Exact Code Wiring Locations (`inference.ts` & `products.ts`)

#### A. Existing INFERENCE SKUs — `site/src/data/inference.ts`

1. **`INFERENCE_CHECKOUT.razorpayUrls` (lines 81–86):** Replace the `mailto:` strings with your live Razorpay Payment Page URLs:
   ```ts
   razorpayUrls: {
     'domain-track': 'https://pages.razorpay.com/inference-domain-track',
     'full-edition': 'https://pages.razorpay.com/inference-2027-full',
     'placement-accelerator': 'https://pages.razorpay.com/inference-2027-accelerator',
     'campus-bulk': '/inference/campus/',
   },
   ```
2. **`INFERENCE_CHECKOUT.campusInquiry` (lines 93–97):** Optionally replace `fiftySeats` / `twoHundredSeats` `mailto:` links with institutional inquiry form URLs or Razorpay Payment Links once a PlaceCom coordinator requests direct payment.
3. **`getCheckoutHref(skuId, currency, trackId)` (lines 2574–2581) — Critical Behavioral Note:**
   - Today, line 2577 reads:
     ```ts
     if (skuId === 'domain-track' && trackId && base.startsWith('mailto:')) {
       return base + encodeURIComponent(trackId);
     }
     ```
   - **Gotcha at launch:** As soon as `base` changes from `mailto:` to `https://pages.razorpay.com/...`, `base.startsWith('mailto:')` becomes `false`, so `trackId` (`consulting`, `finance`, `product`, `marketing`, `operations`, `hr`) will no longer be appended!
   - **Fix when wiring live URLs:** Either store a 6-key track map for `'domain-track'` (one link per domain in `INFERENCE_DOMAIN_OPTIONS`) OR pass `?track=${encodeURIComponent(trackId)}` to a Cloudflare Worker checkout redirector (`/api/checkout?sku=domain-track&track=finance`) that passes `notes.track_id` into a Razorpay Order cleanly.
   - Note that `site/src/pages/inference/index.astro` (lines 384–388 and line 523) and `site/src/pages/inference/campus/index.astro` (lines 51, 58, 92) already read directly from `INFERENCE_CHECKOUT` and `getCheckoutHref()` — no template edits are needed once `inference.ts` is updated.

#### B. Non-INFERENCE Standalone SKUs — `site/src/data/products.ts` *(Planned File)*

- **Current repo status:** `site/src/data/products.ts` **does not exist yet** in `site/src/data/`. Today only `inference.ts` holds checkout URLs.
- **When adding the B-School 708-Story Dossier (`₹999` / `$25`) and future standalone assets** (e.g., on `/news/` banners or `/products/`), create `site/src/data/products.ts` using the exact same dual-rail structure so both `inference.ts` and `products.ts` share one webhook fulfillment pipeline:

```ts
// Planned: site/src/data/products.ts
export interface StandaloneProduct {
  id: 'bschool-dossier-708';
  name: string;
  priceInr: number;
  priceUsd: number;
  razorpayUrl: string; // Plug live https://pages.razorpay.com/bschool-gdpi-dossier here
  usdUrl: string;      // Plug live Dodo / Lemon Squeezy checkout URL here
}

export const STANDALONE_PRODUCTS: StandaloneProduct[] = [
  {
    id: 'bschool-dossier-708',
    name: 'B-School 708-Story GDPI Dossier (2027 Edition)',
    priceInr: 999,
    priceUsd: 25,
    razorpayUrl: 'https://pages.razorpay.com/REPLACE-ME',
    usdUrl: 'https://checkout.dodopayments.com/buy/REPLACE-ME',
  },
];
```

---

## 2. Dodo Payments / Lemon Squeezy Setup Guide (Global USD MoR Rail)

**Role:** Acts as **Merchant of Record (MoR)** for all non-India buyers (`USD`, cards, Apple Pay, Google Pay). The MoR legally resells the digital product, calculates/collects/remits US State Sales Tax, EU VAT, UK VAT, and Australia GST automatically, and settles net export proceeds to your Indian bank account (`~4–5% + $0.40–$0.50` per transaction).

> **Recommendation:** Prefer **Dodo Payments** (built specifically for Indian digital/SaaS exporters with streamlined Indian KYC and e-FIRA export payouts). Keep **Lemon Squeezy** (Stripe-owned) as the exact backup if Dodo underwriting takes longer.

### 2.1 MoR Account Onboarding & Verification

- [ ] Register business/creator profile with Owner PAN, Aadhaar/Passport, Indian Bank Account + IFSC, and live URL (`https://janmejai2002.github.io/inference/`).
- [ ] Declare product category as **Digital Educational Publication / PDF Compendium & Study Materials** (not SaaS subscription, not financial advice).
- [ ] Add tax classification: **Digital Books / Electronic Publications / Digital Download** (where applicable for reduced EU/UK e-book VAT rates where eligible; verify inside Dodo/Lemon Squeezy tax code selector).
- [ ] Configure **Store Brand & Support Email:** `wAIbi-sabi · INFERENCE` / `janmejai2002@gmail.com`.

### 2.2 Product & Variant Setup (USD Pricing)

Create the following products in Dodo Payments / Lemon Squeezy (matching `INFERENCE_SKUS` and the B-School Dossier):

| SKU ID | Product Title | USD Price | Variants / Custom Metadata | Success Redirect URL |
|---|---|---:|---|---|
| `domain-track` | INFERENCE 2027 — Individual Domain Track | `$19` | **6 Variants** (or required dropdown `track_id`):<br>1. Consulting & Strategy (`consulting`)<br>2. Finance & Banking (`finance`)<br>3. Product Management (`product`)<br>4. Marketing & Brand (`marketing`)<br>5. Operations & Supply Chain (`operations`)<br>6. HR & People (`hr`) | `https://<domain>/inference/thanks/?sku=domain-track` |
| `full-edition` | INFERENCE 2027 — Full 36-Unit Edition | `$49` | Single variant; custom metadata `sku_id=full-edition` | `https://<domain>/inference/thanks/?sku=full-edition` |
| `placement-accelerator` | INFERENCE 2027 — Placement Accelerator Bundle | `$79` | Single variant; custom metadata `sku_id=placement-accelerator` | `https://<domain>/inference/thanks/?sku=placement-accelerator` |
| `bschool-dossier-708` | wAIbi-sabi B-School 708-Story GDPI Dossier | `$25` | Single variant; custom metadata `sku_id=bschool-dossier-708` | `https://<domain>/inference/thanks/?sku=bschool-dossier-708` |
| `campus-bulk` *(Optional USD)* | INFERENCE Campus Pack (50 Seats) | `$1,250` | Invoice / Pay-Link on request for non-India MBA clubs | Manual coordinator sheet |

### 2.3 Global VAT / Sales Tax Compliance

- **Do NOT enable manual tax rules** outside India if using Dodo Payments / Lemon Squeezy in MoR mode—their checkout automatically inspects buyer IP + billing country/ZIP, applies the local VAT/GST/sales tax on top of (or inclusive of) the USD price, issues a compliant tax invoice with the MoR's VAT ID, and files returns in all 100+ jurisdictions.
- **Price display choice:** Set checkout tax mode to **"Tax Exclusive" (added at checkout)** or **"Tax Inclusive"** consistently, and state `"Local VAT/sales tax calculated at checkout where applicable"` in the `/inference/` footer.

### 2.4 Webhook Fulfillment (`order_created` / `payment.succeeded`)

1. **Endpoint:** `https://api.<your-domain>/webhooks/mor`
2. **Events to Subscribe:**
   - **Lemon Squeezy:** `order_created` (status `paid`), `order_refunded`
   - **Dodo Payments:** `payment.succeeded`, `refund.succeeded`
3. **Signature Verification:**
   - **Lemon Squeezy:** Verify `X-Signature` header (HMAC-SHA256 of raw body using `LEMONSQUEEZY_WEBHOOK_SECRET`).
   - **Dodo Payments:** Verify Svix/Standard Webhooks headers (`webhook-id`, `webhook-timestamp`, `webhook-signature`) using `DODO_WEBHOOK_SECRET`.
4. **Unified Fulfillment Flow (Shared with Razorpay):**
   - Map variant/product ID → internal `sku_id` + `track_id`.
   - Generate deterministic unique license key `INF-2027-XXXX-XXXX`, write row to Cloudflare D1 `orders` table (`provider = 'dodo' | 'lemonsqueezy'`).
   - Fetch master PDF from private R2 bucket → stamp per-buyer watermark (`Licensed to <Name> (<Email>) · Order <id> · SHA-256 hash`) via `pdf-lib` → store or sign 24-hour expiring download URL (capped at 5 downloads).
   - Send branded delivery email containing: (1) License Key, (2) Private Web Reader login link, (3) Watermarked PDF download button, and (4) 14-day 100% Upgrade Credit code (for `domain-track` buyers).
5. **Code Wiring:**
   - Paste live USD checkout URLs into `INFERENCE_CHECKOUT.usdUrls` in `site/src/data/inference.ts` (lines 87–92) and `STANDALONE_PRODUCTS[0].usdUrl` in planned `site/src/data/products.ts`.

### 2.5 India Bank Payout, FIRC/e-FIRA & Export Tax (LUT) Checklist

- [ ] **e-FIRA / FIRC:** Confirm your MoR (Dodo Payments) or AD Category-I Indian bank issues an **e-FIRA (Electronic Foreign Inward Remittance Advice)** / FIRC for every USD settlement batch. Retain these PDFs monthly for income tax & GST export proof.
- [ ] **RBI Purpose Code:** Confirm with your bank/CA that inward remittances are tagged under the correct software/information/digital-content export purpose code (commonly `P0802` / `P0807` / `P1007` depending on classification—verify with your AD bank before first payout).
- [ ] **GST & LUT (Letter of Undertaking):**
  - Below `₹20 lakh` aggregate annual turnover (`₹10 lakh` in special-category states), mandatory GST registration generally does not apply unless triggered by specific inter-state/marketplace rules—confirm your exact status with an Indian CA (and confirm HSN/SAC for digital e-books vs online courses, typically `18%` vs exempt/reduced printed books).
  - **Once GST-registered:** Immediately file **Form GST RFD-11 (LUT)** on `gst.gov.in` at the start of each financial year so all MoR USD exports qualify as **Zero-Rated Supplies (`0%` IGST)** without paying tax upfront.
- [ ] **Income Tax:** Track gross USD receipts vs net INR bank credits; record MoR fees cleanly and evaluate Section **44ADA / 44AD** presumptive taxation with your CA.

---

## 3. Cloudflare Setup Guide (Registrar, Free Proxy, AI Crawl Control & R2)

### 3.1 Domain Registration & DNS Proxy (GitHub Pages Cutover)

1. **Register Primary `.com` Domain** via **Cloudflare Registrar** (`dash.cloudflare.com` → *Domain Registration → Register Domain*, at-cost wholesale pricing `~₹1,020/yr`, WHOIS privacy included free).
2. **Configure DNS Records (Proxied / Orange Cloud ON):**
   - Four `A` records for apex (`@`) pointing to GitHub Pages IPs: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` (**Proxy status: Proxied**).
   - `CNAME` record for `www` → `janmejai2002.github.io` (**Proxied**).
   - **SSL/TLS Mode:** Set **SSL/TLS → Overview** to **`Full (strict)`** once GitHub Pages issues its certificate (wait briefly in DNS-only if GitHub cert provisioning needs initial challenge, then toggle Orange Cloud back ON).
   - **301 Redirect Rule:** Add a Cloudflare Redirect Rule redirecting `www.<domain>/*` → `https://<domain>/${1}` (HTTP `301`) to avoid duplicate canonicals.
3. **Update Repository Files for Custom Domain Cutover:**
   - Create `site/public/CNAME` (does not exist yet) containing only `<your-domain.com>`.
   - Update `site` in `site/astro.config.mjs` (line 49: `'https://janmejai2002.github.io'` → `'https://<your-domain.com>'`).
   - Update `SITE_URL` in `site/harness/registry.mjs` (line 18) and run `node site/harness/generate.mjs` (required by `AGENTS.md` and `npm --prefix site run build`).
   - Update hardcoded URLs in `site/src/pages/inference/index.astro` (lines 38–78 `productSchema`) and `site/src/pages/about.astro` (line 102).
   - Add the new domain as a **DNS Domain Property** in Google Search Console (via Cloudflare TXT verification), update Bing Webmaster + IndexNow, and update the website domain in Umami Cloud (`UMAMI_WEBSITE_ID = 'df2f7d8f-549a-412b-a2d5-be4d82ab4426'` in `site/src/seo.ts` line 45).

### 3.2 Cloudflare AI Crawl Control

1. In Cloudflare Dashboard → **AI Crawl Control** (under *Security / Bots* on the zone):
   - Enable telemetry tracking for AI crawlers: `GPTBot`, `OAI-SearchBot`, `ChatGPT-User`, `ClaudeBot`, `PerplexityBot`, `Perplexity-User`, `Google-Extended`.
   - **Policy Split:**
     - **Allow** search/citation crawlers (`OAI-SearchBot`, `ChatGPT-User`, `Perplexity-User`) on public blog posts, `/news/`, and `/inference/` to maximize GEO citations.
     - **Block or Rate-Limit** bulk scrapers on `/api/*` and private paid reader domains (`read.<your-domain>`).
   - Export monthly crawl logs to identify top-cited wAIbi-sabi URLs and check alignment with `site/public/robots.txt`.

### 3.3 Cloudflare R2 Bucket (Private Master PDF & Companion Vault)

1. **Create Bucket:** Dashboard → **R2 Object Storage → Create bucket** → Name: `inference-vault` (Location: `APAC` for low-latency India fulfillment). **Keep Public Access DISABLED** (never attach a custom public domain to this bucket).
2. **Canonical Object Key Layout:**
   ```text
   inference-vault/
   ├── masters/
   │   ├── inference-2027-full-v1.0.pdf
   │   ├── track-consulting-v1.0.pdf
   │   ├── track-finance-v1.0.pdf
   │   ├── track-product-v1.0.pdf
   │   ├── track-marketing-v1.0.pdf
   │   ├── track-operations-v1.0.pdf
   │   ├── track-hr-v1.0.pdf
   │   └── bschool-708-gdpi-dossier-2027.pdf
   ├── companions/
   │   ├── inference-anki-116-terms.apkg
   │   ├── inference-25-case-rubrics.pdf
   │   ├── audio-overview/            (7 domain MP3s from Pack B)
   │   ├── slide-decks/               (7 domain PDFs from Pack A)
   │   └── gdpi-dossier-companion.pdf (Pack D deck)
   └── lead-magnets/
       └── inference-2027-cheat-sheet.pdf
   ```
3. **Worker Binding & Signed Expiring Downloads:**
   - Bind `R2_BUCKET = inference-vault` and `D1_DB = inference-licenses` in `wrangler.toml` for the fulfillment Worker.
   - Generate HMAC-signed download tokens (`/download?token=<jwt-or-hmac>`) valid for **24 hours** and enforce `download_count < 5` in D1 before streaming the `pdf-lib`-watermarked bytes back to the buyer (`Content-Disposition: attachment`).

---

## 4. Email Capture & CRM Setup (Buttondown / Kit)

**Primary Choice:** **Buttondown** (`$0` up to 100 subscribers; `$9/mo` for 101–1,000 + custom domain; `$29/mo` for built-in multi-step automations; non-expiring API key that pairs cleanly with GitHub Actions & Cloudflare Workers).  
**Zero-Cost Fallback:** **Kit (ConvertKit)** free tier up to 10,000 subscribers (supports 1 visual automation/sequence with Kit branding) or **Buttondown + Resend** (Resend free tier `3,000 emails/mo` handles transactional receipts + the 5-email nurture via Cloudflare Worker cron/Queue).

### 4.1 DNS & Deliverability Setup (Cloudflare DNS)

- [ ] Add sender domain (`mail.<your-domain>` or apex `<your-domain>`) inside Buttondown / Kit / Resend.
- [ ] Copy the provider's **SPF (`TXT`)**, **DKIM (`CNAME`/`TXT`)**, and **DMARC (`TXT` at `_dmarc`)** records into Cloudflare DNS (**Proxy status: DNS Only / Grey Cloud** for mail verification records).
- [ ] Verify green authentication status before sending any lead magnet or buyer receipt.

### 4.2 Static Site Integration & Tagging Taxonomy

- Keep `site/src/layouts/Base.astro` 100% cookie-free: embed a pure HTML `<form action="https://buttondown.com/api/emails/embed-subscribe/<username>" method="post">` (or POST to your Worker `/api/subscribe`) on `/inference/`, `/news/` banners, and article footers.
- **Canonical Subscriber Tags:**
  - `lead-cheat-sheet` (Tier 0 free PDF opt-in)
  - `buyer-domain-track` (`domain-track` buyer — eligible for 14-day 100% upgrade credit)
  - `buyer-full-edition` (`full-edition` buyer — receives quarterly Insert A/B notifications)
  - `buyer-accelerator` (`placement-accelerator` buyer)
  - `buyer-dossier-708` (`bschool-dossier-708` buyer)
  - `abandoned-checkout` (webhook from Razorpay `payment.failed` / MoR abandoned cart)

### 4.3 5-Email Nurture Sequence (Tier 0 → Paid Conversion)

| Email | Send Delay | Subject Line | Core Content & Link | Goal |
|---|---|---|---|---|
| **Email 1** | **Day 0 (Immediate)** | `Your 2027 AI Executive & Interview Cheat Sheet` | Deliver signed Cheat Sheet PDF + link to Ch 00 (`/inference/read/ai-in-one-sitting/`). Zero hard pitch. | Build trust; verify inbox placement. |
| **Email 2** | **Day 2** | `The single question that exposes 90% of AI pitches` | 300-word breakdown from `pilots-stall` (Ch 09) + link to free worked PE Due Diligence case (`/inference/read/ai-casebook-preview/`). | Demonstrate rigor vs. newsletter fluff. |
| **Email 3** | **Day 4** | `What RBI FREE-AI and India's DPDP Act actually forbid` | Excerpt from Insert B (`/inference/read/india-briefing/`) + soft CTA to `Individual Domain Track` (`₹499 / $19`). | Activate India MBA / compliance urgency. |
| **Email 4** | **Day 7** | `Inside the 34 diagrams + 14-day 100% upgrade credit` | Embed 1 SVG figure preview + explain risk-free `₹499` → `₹1,999` Full Edition credit window. | Bust commitment objection. |
| **Email 5** | **Day 10** | `Full 36-Unit Edition vs. 1 Domain Track (side-by-side)` | Clean comparison table + 7-day refund guarantee + direct `#pricing` checkout link. | Convert warm leads. |

---

## 5. Co-Author MOU Checklist (Janmejai Singh Minhas & Chaitanya Sharma)

Execute and sign a written **Co-Author & Commercial Revenue Agreement** before enabling live checkout links on `site/src/data/inference.ts`:

- [ ] **1. Scope & IP Carve-Out (Critical Firewall):**
  - Jointly owned IP: `INFERENCE` 36-unit manuscript, 34 vector figures, 116-term glossary, domain casebooks, and derivative companion packs (Packs A–C).
  - Sole Janmejai IP (explicitly excluded from split): `wAIbi-sabi` blog infrastructure (`janmejai2002.github.io`), the 132+ editorial blog articles, the 708-entry B-School News Archive (`site/src/data/news.json`) & standalone `bschool-dossier-708` SKU, `/tracker/`, and Janmejai's solo consulting engagements.
- [ ] **2. Net Distributable Profit Waterfall:**
  - Define exact formula:  
    `Net Distributable Profit = Gross INFERENCE Sales − (Razorpay / MoR Fees + GST / Income Tax Reserve + Refunds/Chargebacks + Approved Paid Ad Spend + Direct INFERENCE SaaS Infra [R2, Resend, Worker])`
  - Specify exact percentage split (e.g., `50% / 50%` on `INFERENCE` Net Distributable Profit; `100%` Janmejai on `wAIbi-sabi` blog/dossier/consulting).
- [ ] **3. Merchant Account, Tax Reserve & Payout Cadence:**
  - Designate Janmejai as primary merchant-account holder (Razorpay & Dodo Payments) with monthly settlement by the **5th business day** of each month alongside a shared read-only revenue/ad-spend ledger.
  - Specify tax withholding / contractor payout structure (consult CA on TDS applicability and income-tax reserve before net distribution).
- [ ] **4. Decision Rights & Pricing Authority:**
  - Set pre-approved floor prices (`₹499` / `₹1,999` / `₹3,499` B2C; `₹45,000` / `₹1,40,000` Campus B2B) and require mutual written approval (email/WhatsApp confirmation) for custom discounts `>20%`, paid ad budget tranches `>₹10,000`, or corporate sponsorships.
- [ ] **5. Maintenance & Quarterly Update SLA:**
  - Assign primary & review ownership for quarterly **Insert A (State of Play)** and **Insert B (India Briefing)** updates promised for 1 year to `full-edition` and `placement-accelerator` buyers.
- [ ] **6. Withdrawal, Buyout & `v2.0` Sunset Clause:**
  - Define revenue-share continuity on `2027 Edition v1.0` if one co-author steps back from active maintenance, and terms for creating a future `v2.0` edition (e.g., reduced royalty for non-contributing co-author or buyout option).
- [ ] **7. Execution:** Both co-authors sign dated PDF copies (Aadhaar eSign / wet signature) and archive in private storage before Phase 3 beta/live payments.
