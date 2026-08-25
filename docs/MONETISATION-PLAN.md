# Monetisation plan — wAIbi-sabi

Written 2026-08-26, grounded in `docs/research/monetisation.md` (every number
below is sourced there; nothing here is asserted from memory). This is the
plan the brief asked for: what the money side of this blog realistically looks
like, in what order, with what numbers, and what to do this month versus next
year.

---

## 1. The honest verdict first

**This blog is pre-monetisation, and will be for at least a year.** Every
sourced case of an AI/dev publication earning real sponsorship money needed
five to six figures of subscribers first — Ben's Bites ~115K, The Neuron
~500K, TLDR over a million. The soft floor for a *first sponsor conversation*
is about 1,000 genuinely engaged subscribers, and small lists under 5K get
flat fees of $50–$250 a placement, not a living. Organic growth to 10K
subscribers typically takes 2–3 years from zero.

The instinct to resist: treating "AI companies sponsor the blog" as a
near-term goal and warping the next six months around it. The case studies
say the opposite — sponsorship is a **late-stage reward** for an audience
built on something else. Chasing it early produces exactly the content that
destroys the asset this blog actually has.

**What this blog has that most zero-audience blogs do not:** a differentiator
(radical honesty — graded evidence, public corrections, self-documenting
automation) that maps onto the one monetisation model with **no audience
threshold**: credibility. Simon Willison monetises a 35K list — an order of
magnitude below the sponsorship cases — through a diversified stack where
consulting, enabled by the blog's credibility rather than its traffic, is the
load-bearing piece. That model is available from day one.

So the plan is: **monetise credibility now, build the audience machinery in
parallel, and let sponsorship arrive in its own time on top of both.**

---

## 2. The three phases

### Phase 0 — instrumentation (now; mostly done as of 2026-08-26)

You cannot sell what you cannot measure, and you cannot re-reach a reader you
never captured.

- ✅ **Analytics** — Umami Cloud is live (cookieless, free to 100K
  events/month, and its REST API is what lets a routine read the numbers
  later).
- ✅ **Search consoles** — Google and Bing verified, sitemap submitted.
- ✅ **Citability plumbing** — IndexNow on every deploy, retrieval-crawler
  robots posture, enforced TL;DR (the most liftable block on each page).
- ☐ **Newsletter capture** — Buttondown (deferred by you; see §4 — the case
  for doing it sooner rather than later is that every visitor who leaves
  without a way to return is permanently lost, and capture costs nothing).
- ☐ **Sponsorship policy published before any sponsor exists** — draft in §5,
  needs your sign-off. Publishing it *now* is itself on-brand content: a blog
  that documents how it will handle money before it has any.
- ☐ **(Optional, later)** Cloudflare in front of the site for AI-bot-traffic
  visibility — the one free signal that shows assistants *reading* the blog
  even when no human clicks. Requires a custom domain, so it rides on that
  decision, not before it.

### Phase 1 — credibility and capture (the next 6–12 months)

The goal is not revenue. It is two numbers moving: **engaged subscribers**
(the asset sponsors eventually price) and **citations** (links from other
blogs, HN/Reddit mentions, appearances in AI-assistant answers — the evidence
credibility is compounding).

What actually moves those numbers, per the case studies:

1. **Cadence and archive depth.** Every monetised case published consistently
   for months-to-years before money. The pipeline already produces this;
   the constraint is your rating queue, not the machinery.
2. **A reason to subscribe.** "Get new posts by email" converts poorly.
   The natural offer here is the blog's own shape: *"One question a working
   professional actually asked, answered with graded evidence — weekly."*
   The pipeline can assemble that digest automatically once Buttondown
   exists.
3. **The consulting surface.** One page (or a section on /about/) that says
   plainly what you do and that you are available for it — applied-AI
   consulting, model evaluation, red-teaming (36 Gray Swan breaks is a real
   credential in 2026). No audience threshold gates this; Willison's
   consulting line exists because the blog proves competence, not because
   35K people read it. **This is the only line item that can plausibly pay
   anything in the next twelve months.**
4. **Being citable on purpose.** Already in motion (workstream B). The
   corrections log, when it ships, is a distribution feature: "the AI blog
   that shows its errors" is a story other writers link to.

What NOT to do in phase 1: paid growth (The Neuron's Meta-ads play needed
sponsor revenue to recycle), affiliate content (it manufactures the exact
conflict the blog's positioning forbids), and cold sponsor outreach (a
sub-1K list gets $50–$250 flat placements at best — reputational cost,
pocket-change return).

### Phase 2 — sponsorship, when the numbers exist (2027+, gated not dated)

Gate, not date: **~1,000+ engaged subscribers with legible open/click rates,
or demonstrable AI-citation evidence** (see below). Then:

- **The conventional sell:** AI-focused newsletter CPMs run $140–$220 at
  30K+ lists; small-list flat fees $500–$3K in the 5–50K range. One clearly
  labelled placement per issue/page, per the policy in §5.
- **The differentiated sell this blog is uniquely positioned for:** the
  research found that 60–68% of searches now end clickless, and *no named
  advertiser yet pays for "being the source AI assistants cite"* — it is
  commentary, not a market, as of Aug 2026. If that market materialises,
  this blog's pitch is ready-made: *"verifiably accurate enough that
  assistants cite it, with the bot-traffic logs to prove they read it."*
  That is a credibility sell, not a reach sell — which is why phase 1
  optimises credibility. Track this; do not bet on it.
- **EthicalAds as a floor**, if wanted: developer-focused, no-tracking,
  ~$2.50 CPM, no minimum audience. At realistic traffic this is coffee
  money; its value is proving the placement machinery and policy work
  before a real sponsor tests them.

---

## 3. Milestones that matter (in order), and what each unlocks

| Milestone | Evidence source | Unlocks |
|---|---|---|
| First 100 measured weekly readers | Umami | Nothing to sell yet; proves distribution works |
| First external citation (another blog, HN, a newsletter) | Manual / referrers | The credibility flywheel is turning |
| First AI-assistant referral (`chatgpt.com`, `perplexity.ai` referrers) | Umami referrers | Workstream B is working; screenshot it, it becomes pitch material |
| 100 newsletter subscribers | Buttondown | Buttondown stays free to here; habit-building begins |
| First consulting inquiry traceable to the blog | You | The Willison model is live — this is phase 1 success |
| ~1,000 engaged subscribers | Buttondown | First sponsor conversation is credible |

---

## 4. Newsletter — parked by you, with one caveat on the record

You deferred Buttondown ("newsletter later can be done"). Fine — nothing else
depends on it. The one thing worth having on the record: **capture compounds
and cannot be backfilled.** A reader who visits in September and leaves has
no way back; the list only ever grows from the day it exists. The setup is
one account (yours to create, ~5 minutes) and one form on the site (mine,
same day). Whenever you say go.

---

## 5. The sponsorship & editorial policy — draft for your sign-off

Modeled on Stratechery's conflict rule and Willison's placement rule, per the
research's recommendation. To be published as a page (e.g. `/sponsorship/`)
**before** any sponsor exists. Not published until you approve the text.

> ## Sponsorship policy
> *Adopted before this blog had a single sponsor — [dated] — so that no rule
> here was written with a specific cheque in mind.*
>
> 1. **Sponsors buy placement, never influence.** A sponsorship is a clearly
>    labelled slot — never a topic, an angle, a kinder grade, or an earlier
>    embargo. No sponsor sees any article before publication.
> 2. **No sponsorship from companies under review.** A company whose product
>    is the subject of a Case Study or evaluation on this blog cannot
>    sponsor it, and a sponsor's products will not become the subject of
>    one while the relationship stands. If that costs the obvious sponsors —
>    AI companies are what this blog writes about — the rule stands anyway;
>    it is the entire point.
> 3. **Every relationship is disclosed inline.** If an article touches a
>    past or present sponsor even peripherally, the relationship is named in
>    that article, not on a policy page nobody reads.
> 4. **The evidence grades are not for sale at any price.** The claim
>    ledger, the graded evidence in Case Studies, and the public corrections
>    practice apply identically to sponsors and non-sponsors.
> 5. **This policy only tightens.** Changes that loosen it require a dated,
>    public explanation of what changed and why.

Rule 2's second clause has a real cost worth your eyes: it means a sponsor
relationship *removes* a company from Case Study eligibility. That is the
strongest version of the firewall and the most defensible; the weaker
alternative (disclose and grade anyway) is what most publications do and is
exactly what readers discount.

---

## 6. Owner actions vs. system actions

**Yours (in order):**
1. Approve, edit, or reject the §5 policy text → I publish it as a page.
2. Say go on Buttondown when ready → account is yours to create; I wire the
   form and the digest automation.
3. Decide whether a consulting/available-for line belongs on /about/ — and
   what services you'd actually want inquiries for.
4. Keep rating radar ideas. Cadence is the phase-1 engine and only you gate it.

**Mine (no input needed):**
- The Umami-read routine feeding real numbers into a monthly "state of the
  blog" note once data accumulates.
- Referrer watch for the first AI-assistant and external citations.
- The corrections log as a public page (queued idea, doubles as distribution).
- Revisit this plan when either gate in §2/phase 2 is crossed, or in six
  months, whichever first.
