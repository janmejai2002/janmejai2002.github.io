---
title: 'ChatGPT Wallet Forces Merchants to Redesign CDN and Fraud Rules'
description: 'ChatGPT Wallet launched Nov 13 with Visa, Mastercard, and Amex tokens. Learn the 6-step Playbook, Web Bot Auth CDN rules, and 7 Forwarded fraud parameters.'
pubDate: 2026-11-15
publishedAt: '2026-11-15T23:21:29.130Z'
track: business
question: 'What must retail and SaaS leaders change in their checkout stack now that ChatGPT Wallet is live?'
keywords:
  - ChatGPT Wallet Merchant Readiness
  - Agentic Commerce Checkout
  - Web Bot Auth CDN
  - Per-Transaction Payment Tokens
heroImage: '../../assets/art/chatgpt-wallet-merchant-readiness-light.webp'
heroImageDark: '../../assets/art/chatgpt-wallet-merchant-readiness-dark.webp'
heroAlt: 'Minimalist geometric diagram showing three horizontal paths crossing two vertical security gates toward a checkout block, where one path stops at the first gate, a second dashed path stops at the second fraud gate, and a third ochre path with tick marks passes cleanly through both.'
readingTime: '8 min read'
notionId: '419ced67-050a-81db-b0e5-eb5de5e49993'
---
<div class="tldr">

## Executive TL;DR

- **ChatGPT Wallet routes agents directly onto merchant checkouts:** Launched on November 13, 2026 with **American Express, Mastercard, and Visa**, ChatGPT Wallet lets OpenAI's always-on **dots** agents pay on standard merchant websites using one-time network payment tokens after the shopper approves via Face ID or fingerprint ([Veliu](https://veliu.com/en/blog/accept-chatgpt-wallet-payments); [Relevant Audience](https://www.relevantaudience.com/ai/chatgpt-wallet-commerce-partner-playbook-merchants)).
- **The merchant stays seller of record with 0% initial OpenAI fee:** Unlike in-chat marketplace models, the store retains full control over pricing, fulfillment, returns, and customer service, and OpenAI told CNBC it is taking **no transaction fee cut at launch** ([Stablecoin Insider](https://stablecoininsider.org/chatgpt-wallet/); [Veliu](https://veliu.com/en/blog/accept-chatgpt-wallet-payments)).
- **22% of shopping agents are blocked by store firewalls today:** In a Salesforce survey of 2,500+ shoppers across the US, UK, Canada, and Australia, **22% of personal AI agent users reported their agent was blocked from completing a purchase**, even as fraud vendor Forter tracked a **6.8x surge in agentic orders** since mid-August 2026 ([Veliu](https://veliu.com/en/blog/accept-chatgpt-wallet-payments)).
- **CDN readiness requires `Web Bot Auth` (`RFC 9421`):** OpenAI's **Commerce Partner Playbook** instructs merchants to allow cryptographically signed ChatGPT browser visits (`Signature-Agent: "https://chatgpt.com"`), such as Cloudflare Bot Detection ID **`129220581`** (`chatgpt-agent`) or Akamai/HUMAN `"ChatGPT Agent"` rules ([Veliu](https://veliu.com/en/blog/accept-chatgpt-wallet-payments)).
- **Fraud engines must ingest the 7-parameter `Forwarded` header (`RFC 7239`):** Because requests arrive from OpenAI's cloud browser IP instead of the shopper's home IP, risk engines (Forter, Riskified, Sardine, Signifyd) must read the `Forwarded` header's **7 shopper signals** (`asn`, `for`, `ip-country`, `ip-prefix`, `locale`, `tz`, `user-agent`) to prevent false fraud declines ([Veliu](https://veliu.com/en/blog/accept-chatgpt-wallet-payments); [Relevant Audience](https://www.relevantaudience.com/ai/chatgpt-wallet-commerce-partner-playbook-merchants)).

</div>

## From Instant Checkout to Merchant Sites: Why OpenAI Changed Its Commerce Model

On November 13, 2026, OpenAI made its biggest move into agentic commerce by launching **ChatGPT Wallet** in partnership with **American Express, Mastercard, and Visa**, accompanied by a six-part **Commerce Partner Playbook** for online businesses ([Relevant Audience](https://www.relevantaudience.com/ai/chatgpt-wallet-commerce-partner-playbook-merchants); [Veliu](https://veliu.com/en/blog/accept-chatgpt-wallet-payments)).

At launch, the wallet is scoped to **ChatGPT Pro subscribers aged 18 or older in the United States** holding eligible US-issued credit cards from American Express, Chase, Mastercard, or Visa (with debit and virtual cards excluded initially), operating inside **dots**, OpenAI's always-on agent surface launched in September 2026 ([Veliu](https://veliu.com/en/blog/accept-chatgpt-wallet-payments)). Yet OpenAI's pitch to retailers points to the massive top-of-funnel stakes: **1.2 billion people use ChatGPT every week**, and Morgan Stanley forecasts that agentic shoppers could drive **190 billion to 385 billion USD in US e-commerce spending by 2030** (following Amazon's disclosure that its Rufus assistant drove nearly **12 billion USD** in incremental annualized sales in 2025) ([Veliu](https://veliu.com/en/blog/accept-chatgpt-wallet-payments)).

Why did OpenAI build ChatGPT Wallet to fill out *your existing website's checkout form* via a cloud browser instead of forcing every merchant onto a proprietary in-chat checkout API?

Because merchants fiercely guard customer ownership and checkout conversion logic. Under the ChatGPT Wallet model ([Veliu](https://veliu.com/en/blog/accept-chatgpt-wallet-payments); [TechnoParticles](https://technoparticles.com/chatgpt-wallet-agent-purchases-user-approval-explained)):

- **No Checkout Code Rewrite Required:** OpenAI states that ChatGPT Wallet *"works out of the box with existing checkout pages and payment forms. No Wallet-specific integration is required"* ([Veliu](https://veliu.com/en/blog/accept-chatgpt-wallet-payments)).
- **The Store Remains Merchant of Record:** Your business keeps 100% control over pricing, tax calculation, shipping, returns, and customer support.
- **Zero OpenAI Take-Rate at Launch:** OpenAI confirmed to CNBC that it is not charging merchants a transaction commission at launch ([Stablecoin Insider](https://stablecoininsider.org/chatgpt-wallet/)).

## How Per-Transaction Payment Tokens Work Without Exposing Real Cards

If an AI agent types payment numbers into your existing Stripe, Adyen, or Checkout.com payment form, how does OpenAI prevent prompt-injection attacks or database leaks from exposing the shopper's credit card?

ChatGPT Wallet separates **card storage**, **human biometric approval**, and **single-use network tokenization** across five strict steps ([Veliu](https://veliu.com/en/blog/accept-chatgpt-wallet-payments); [Relevant Audience](https://www.relevantaudience.com/ai/chatgpt-wallet-commerce-partner-playbook-merchants)):

1. **Step 1 (Cart Assembly & Pre-Purchase Review):** The shopper's `dot` agent searches stores, compares options, opens your website in OpenAI's cloud browser, fills the cart, and pauses at checkout. ChatGPT presents the shopper with the merchant name, itemized cart, total price, selected card, and any shipping or subscription terms.
1. **Step 2 (Biometric Human-in-the-Loop Gate):** The agent cannot click "Buy" on its own. The shopper must approve the exact transaction using a hardware biometric check such as **Face ID or Touch ID / fingerprint scan** ([Relevant Audience](https://www.relevantaudience.com/ai/chatgpt-wallet-commerce-partner-playbook-merchants)).
1. **Step 3 (Card-Network Single-Use Token Issuance):** Upon biometric approval, Visa, Mastercard, or American Express issues an EMVCo **per-transaction payment token**: a substitute 16-digit card number, expiration date, and security code bound to that single purchase. Neither the merchant nor the ChatGPT agent ever sees the user's real card number ([Veliu](https://veliu.com/en/blog/accept-chatgpt-wallet-payments)).
1. **Step 4 (Standard Checkout Authorization & PAR Linking):** The agent enters the network token into your standard checkout fields. Your payment processor authorizes the charge with the card issuer as usual. To link repeat customers or loyalty accounts without seeing the raw card number, merchants read the EMVCo **Payment Account Reference (`PAR`)** ([Veliu](https://veliu.com/en/blog/accept-chatgpt-wallet-payments)).
1. **Step 5 (Merchant Order Confirmation):** Because OpenAI warns shoppers that *"Ready to check out"* only confirms biometric approval, not merchant order placement, your store must fire an immediate order confirmation email/webhook so the shopper does not submit a duplicate order ([Veliu](https://veliu.com/en/blog/accept-chatgpt-wallet-payments)).

## The Hidden Conversion Killer: Why Your CDN and Fraud Stack Block Buying Agents

Here is the operational catch that makes ChatGPT Wallet a boardroom priority for e-commerce and SaaS executives: **while your payment form needs zero code changes, your CDN firewall and fraud engine will reject ChatGPT Wallet orders by default**.

In a Salesforce survey of over 2,500 shoppers across the US, UK, Canada, and Australia, **22% of shoppers using personal AI agents reported their agent was blocked from completing a purchase** ([Veliu](https://veliu.com/en/blog/accept-chatgpt-wallet-payments)). Agent orders fail at two choke points:

### Choke Point 1: CDN Bot Mitigation (`Web Bot Auth` / `RFC 9421`)

To anti-bot firewalls (Cloudflare, Akamai, HUMAN, DataDome), OpenAI's cloud browser looks like a headless data-center bot clicking through product and cart pages. To distinguish legitimate buying agents from malicious scrapers, ChatGPT signs every cloud-browser request using **Web Bot Auth**, an IETF draft built on the **HTTP Message Signatures standard (`RFC 9421`)** ([Veliu](https://veliu.com/en/blog/accept-chatgpt-wallet-payments)).

Every signed request carries three headers, `Signature`, `Signature-Input`, and `Signature-Agent: "https://chatgpt.com"`, verifiable against OpenAI's public keys at `chatgpt.com/.well-known/http-message-signatures-directory` (note that this traffic is completely separate from OpenAI's search crawler, `OAI-SearchBot`). Here is the exact CDN configuration matrix from OpenAI's Agent Access guide ([Veliu](https://veliu.com/en/blog/accept-chatgpt-wallet-payments)):

| CDN / WAF Provider | How ChatGPT Wallet Traffic Appears | Exact Rule Configuration Required |
| --- | --- | --- |
| **Cloudflare** | `"dots, OpenAI"` under *Personal Agents* (`chatgpt-agent`) | Set to **Allow**, or add a WAF custom rule where **Bot Detection ID = `129220581`** (`ChatGPT Operator`) with action `Allow` / `Skip` ([Veliu](https://veliu.com/en/blog/accept-chatgpt-wallet-payments)) |
| **Akamai** | Bot `"ChatGPT Agent"` under *AI Fetchers and Agents* | Create a custom bot category with `ChatGPT Agent` as a verified bot and set action to **Allow** ([Veliu](https://veliu.com/en/blog/accept-chatgpt-wallet-payments)) |
| **HUMAN Security** | `"ChatGPT Agent"` in *Known Bots & Crawlers* | Enable the rule and set action to **Allow** ([Veliu](https://veliu.com/en/blog/accept-chatgpt-wallet-payments)) |
| **Vercel** | Identified as `chatgpt-operator` | Allowed by default unless custom WAF rules block cloud-browser IP ranges ([Veliu](https://veliu.com/en/blog/accept-chatgpt-wallet-payments)) |
| **Custom Proxy / Envoy** | `RFC 9421` HTTP Message Signatures | Preserve `Signature`, `Signature-Input`, and `Signature-Agent` headers across internal load balancers and verify against `.well-known` keys ([Veliu](https://veliu.com/en/blog/accept-chatgpt-wallet-payments)) |

### Choke Point 2: Fraud Scoring Mismatch (`Forwarded` Header / `RFC 7239`)

Even if your CDN lets the agent reach checkout, your fraud engine (Forter, Riskified, Sardine, Signifyd, or Stripe Radar) compares the buyer's shipping address against the connecting IP address and browser fingerprint. Because the HTTP connection originates from OpenAI's cloud data center instead of the shopper's home Wi-Fi, naive velocity and geolocation rules flag the transaction as a stolen card!

To solve this, OpenAI passes **7 observed shopper signals** inside the standard **`Forwarded` HTTP header (`RFC 7239`)** ([Veliu](https://veliu.com/en/blog/accept-chatgpt-wallet-payments); [Relevant Audience](https://www.relevantaudience.com/ai/chatgpt-wallet-commerce-partner-playbook-merchants)):

1. **`for`:** The originating IP address observed for the authenticated ChatGPT user.
1. **`asn`:** The Autonomous System Number (ISP route) of the user's IP.
1. **`ip-country`:** The two-letter ISO country code estimated from the user's IP.
1. **`ip-prefix`:** The masked CIDR network prefix of the user's IP.
1. **`locale`:** The user's configured language tag (such as `en-US`).
1. **`tz`:** The user's time zone (such as `America/Los_Angeles`).
1. **`user-agent`:** The shopper's actual client browser or mobile app string.

## The Six-Step Merchant Readiness Checklist for Agentic Checkout

Not every company wants agentic buyers: CNBC reported that **United Airlines** blocks third-party agents from booking tickets and **Amazon** blocks external agents from purchasing on its marketplace to protect its own first-party ad and retail ecosystem ([Veliu](https://veliu.com/en/blog/accept-chatgpt-wallet-payments)). For every other D2C brand, retailer, travel site, and SaaS vendor competing for high-intent ChatGPT Pro buyers, execute OpenAI's six-step **Commerce Partner Playbook** in this priority order ([Relevant Audience](https://www.relevantaudience.com/ai/chatgpt-wallet-commerce-partner-playbook-merchants)):

1. **Whitelist Verified `Web Bot Auth` at the CDN Edge:** Enable Cloudflare Bot Detection ID `129220581` or your WAF's equivalent `RFC 9421` signature check today so shopping agents are not dropped on cart pages.
1. **Pipe the 7-Parameter `Forwarded` Header into Your Fraud Engine:** Confirm with Forter, Riskified, Sardine, Signifyd, or your internal risk team that `Forwarded` (`RFC 7239`) is preserved past your reverse proxy and used to score the end user's IP/ASN instead of OpenAI's cloud proxy IP.
1. **Claim Your Profile in the ChatGPT Business Hub & Sync Product Feeds:** Claim your verified merchant profile and upload a real-time catalog feed (matching Google Merchant Center specs for `id`, `title`, `price`, `availability`). Ensure feed prices match live checkout prices to the cent, any mismatch causes the agent to abort checkout ([Veliu](https://veliu.com/en/blog/accept-chatgpt-wallet-payments)).
1. **Enforce Single-Use Token Hygiene on One-Time Orders:** Never store or attempt to re-bill a single-transaction ChatGPT Wallet network token on a subsequent separate order; use `PAR` for loyalty matching and display explicit recurring-billing terms on screen if selling subscriptions ([Veliu](https://veliu.com/en/blog/accept-chatgpt-wallet-payments)).
1. **Evaluate "Sign in with ChatGPT" for Account Linking:** Prepare your identity flow for OpenAI's account-linking option so repeat agent shoppers can apply loyalty tiers and saved shipping addresses automatically.
1. **Defer Custom MCP Checkout Plugins Until Phase 2:** While the Playbook includes an MCP server + skills plugin specification, OpenAI explicitly notes that third-party plugin interaction patterns with ChatGPT Wallet are still in development, meaning your existing web checkout is the primary revenue path right now ([Veliu](https://veliu.com/en/blog/accept-chatgpt-wallet-payments)).

## Sources

- [ChatGPT Wallet: How It Works and What Merchants Should Do: Veliu Research Lab](https://veliu.com/en/blog/accept-chatgpt-wallet-payments): Complete technical breakdown of the Nov 13, 2026 launch, 5-step token flow, EMVCo `PAR`, `Web Bot Auth` (`RFC 9421`) rules for Cloudflare (`129220581`), Akamai, HUMAN, and Vercel, the 7 `Forwarded` (`RFC 7239`) fraud parameters, Salesforce 22% blocked-agent survey, and Forter 6.8x growth figure.
- [ChatGPT Wallet launch: what merchants need to check: Relevant Audience](https://www.relevantaudience.com/ai/chatgpt-wallet-commerce-partner-playbook-merchants): Summary of the November 13, 2026 announcement, US ChatGPT Pro 18+ eligibility inside `dots`, and the six areas of the OpenAI Commerce Partner Playbook.
- [ChatGPT Wallet: OpenAI Lets AI Agents Pay With Card Tokens: Stablecoin Insider](https://stablecoininsider.org/chatgpt-wallet/): Confirmation of Visa, Mastercard, and American Express partnerships, fraud partners (Forter, Riskified, Sardine, Signifyd), payment partners (Adyen, Checkout.com, Stripe), and CNBC report of 0% initial OpenAI transaction cut.
- [Introducing ChatGPT Wallet: OpenAI Developer Community](https://community.openai.com/t/introducing-chatgpt-wallet/1416044): Developer announcement of the Commerce Partner Playbook, Web Bot Auth, and Business Hub.
- [ChatGPT Wallet Agent Purchases: User Approval Explained: TechnoParticles](https://technoparticles.com/chatgpt-wallet-agent-purchases-user-approval-explained): Breakdown of biometric user approval vs merchant of record responsibilities.

<!--
Artwork brief — from the writer routine. Draw per docs/ARTWORK.md,
then delete this comment.

- Argument in one sentence: Unverified bot traffic is stopped cold at the merchant firewall, whereas a ChatGPT Wallet agent carrying a cryptographic `Web Bot Auth` signature and `Forwarded` shopper header passes cleanly through the CDN and fraud gates into checkout.
- Geometry: Two vertical security gates (`CDN / WAF` on the left, `Fraud Engine` in the center) guarding a rectangular `Merchant Checkout` block on the right; two unsigned `ink` bot trajectories terminate against the first gate, while a bold `ochre` trajectory carrying three signature ticks and seven header ticks passes through both gates to complete settlement.
- Accent: ochre
- Deliberate imperfection: A severed, dashed `ink` trajectory blocked at the second (`Fraud Engine`) gate, representing a legitimate agent purchase that passed the CDN firewall but was falsely declined because the risk engine failed to read the `Forwarded` shopper header.
-->
