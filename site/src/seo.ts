/**
 * Search-engine ownership verification tokens.
 *
 * These are public by design — they appear in the page source of every site
 * that uses them, and they prove ownership only to whoever already controls
 * this repository. They are not secrets and do not belong in GitHub Secrets.
 *
 * ── How to fill these in ────────────────────────────────────────────────────
 *
 * Google (https://search.google.com/search-console):
 *   1. Add property → **URL prefix** → https://janmejai2002.github.io
 *      Do NOT pick "Domain" — that needs DNS records for github.io, which
 *      belong to GitHub, not to you.
 *   2. Choose the "HTML tag" verification method.
 *   3. Copy only the `content="..."` value into GOOGLE_SITE_VERIFICATION below.
 *   4. Commit and let it deploy, then press Verify.
 *   5. Once verified: Sitemaps → submit `sitemap-index.xml`.
 *
 * Bing (https://www.bing.com/webmasters) is optional but nearly free: it also
 * feeds DuckDuckGo, and Bing's index is what several answer engines read.
 * Same flow, meta-tag method, value goes in BING_SITE_VERIFICATION.
 *
 * An empty string renders no tag at all, which is the correct default.
 */

export const GOOGLE_SITE_VERIFICATION = 'p0b2exN0HT0XuhCK0iFkliuB2OZiIy2VhNDTYWKQS1M';
export const BING_SITE_VERIFICATION = '8AE472167560C6B10D02A15F64EA2389';

/**
 * Umami Cloud analytics (cookieless, ~1.5 KB script, has a read API a routine
 * can query later for the topic feedback loop). Like the tokens above, the
 * website ID is public by design — it appears in the page source of every
 * Umami-instrumented site.
 *
 * ── How to fill this in (cloud.umami.is, account already created) ──────────
 *   1. Log in → Settings (gear icon) → Websites → **Add website**.
 *   2. Name: wAIbi-sabi. Domain: janmejai2002.github.io. Save.
 *   3. The website row now shows **Edit → Tracking code**; copy the
 *      `data-website-id` value (a UUID) into UMAMI_WEBSITE_ID below.
 *   4. Commit, deploy, open the live site once, and the dashboard starts
 *      counting.
 *
 * An empty string renders no script at all, which is the correct default.
 */
export const UMAMI_WEBSITE_ID = '';

// Google is verified twice over, deliberately: the meta tag above and the file
// at public/googlea1340fe9bfe1e41a.html, which deploys to the site root. Either
// alone is sufficient. Google's instruction is not to remove the file even
// after verification succeeds, so it stays — and having both means a future
// refactor of the <head> cannot silently un-verify the property.
