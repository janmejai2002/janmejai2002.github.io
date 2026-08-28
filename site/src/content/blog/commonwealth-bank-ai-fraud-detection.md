---
title: 'Commonwealth Bank scores 20M payments a day for fraud with AI'
description: 'Commonwealth Bank screens 20 million payments a day with machine learning and says fraud losses fell 20%. How solid is that claim, and what transfers?'
pubDate: 2026-08-28
track: case-studies
question: 'Does AI on real-time transaction scoring actually cut fraud losses, and what does it take to build one?'
keywords:
  - AI fraud detection banking case study
  - machine learning scam prevention
  - real-time transaction scoring
  - Commonwealth Bank AI
  - NameCheck Confirmation of Payee
  - bank fraud operations AI
  - AI fraud model false positives
heroImage: '../../assets/art/commonwealth-bank-ai-fraud-detection-light.webp'
heroImageDark: '../../assets/art/commonwealth-bank-ai-fraud-detection-dark.webp'
heroAlt: 'A stack of 13 thin horizontal rules of equal length, like lines of text. One rule is interrupted mid-way, and its continuation is shifted slightly downward and drawn in a single accent colour.'
readingTime: '9 min read'
notionId: '3caced67-050a-8167-b11d-d451f12c7c47'
---
<div class="tldr">

## Executive TL;DR

- Commonwealth Bank of Australia (CBA) runs machine-learning models over about 80 million account events a day (payments, password resets, address changes) and more than 20 million payments a day specifically for scam and fraud risk, scoring them in near real time and pushing roughly 40,355 warning alerts a day to customers in its app.
- CBA says this "played a crucial role" in customer fraud losses falling "over 20%" in July to December 2025 versus the same half a year earlier. It separately reports a 70% drop in customer scam losses over the two years to mid-2025.
- The one model described in detail is for Card Not Present fraud: it scores each online or phone card payment on transactional, customer and confirmed-fraud variables. CBA says feeding that score into its detection platform raised alert accuracy "by over 14%" and avoided about A$29 million in losses across 2025.
- Evidence grade: **B** for how the system is built and what it screens (first-party but specific, with baselines, consistent across three years of disclosures). **C** for the headline that AI cut fraud losses 20%, because nothing published separates the model's effect from a A$900m-plus fraud and cyber programme, new scam regulation, and an industry-wide fall in Australian scam losses of about 26% in 2024.
- Transfers well: a risk score layered on top of the rules engine rather than replacing it; a name-check step before first-time payments; an intelligence loop that feeds confirmed cases back into training. Transfers poorly: the screening volume, the honeypot phone numbers and industry data-sharing all assume scale a smaller firm does not have.
- First step for a fraud team: take one transaction type with clean confirmed-fraud labels, score it in shadow mode next to the current rules for a quarter, and measure precision, recall and false-positive friction before the score touches a customer.

</div>

## The situation

A real-time payment either clears in a few seconds or it does not. That single constraint is most of the reason Commonwealth Bank of Australia now runs machine-learning models in front of more than 20 million payments a day. A review that takes a human analyst two minutes is not a control on a faster-payments rail; whatever catches a scam has to do it before the money moves.

CBA is Australia's largest bank, with about 16 million customers and more than 37,000 staff. Scams are the sore point for the whole sector. Australians reported A$2 billion of scam losses in 2024, and banks now carry both the reputational cost and, increasingly, a regulatory one. The industry's Scam-Safe Accord, agreed in late 2023, commits banks to name-matching, warnings, payment delays and shared intelligence.

The standard tool for this is a rules engine: block a card-not-present payment over a set amount from a new device in a risky merchant category, and so on. Rules are fast and easy to explain to an auditor. They also throw false positives, and they lag every new scam pattern by however long it takes someone to notice it and write the next rule. CBA has been putting machine learning against that gap since 2015, when it built its Customer Engagement Engine. What is new is the scoring volume, the near-real-time latency, and a report published in February 2026, *Our Approach to Adopting AI*, that describes some of it first-hand.

## What they built

Three layers, roughly.

**Real-time event screening.** CBA says it screens about 80 million events a day on average with AI models, covering payments, password resets and address changes, and runs more than 20 million payments a day through scam and fraud detection specifically. Its own description: the detection platforms "use a combination of machine learning and AI technologies to help identify unusual behaviour" in "highly complex patterns of activity," and the models strengthen "traditionally manual steps in defensive processes." The machine-learning score is an input into an existing prevention and response platform, not a replacement for it. When a score crosses a threshold, the customer gets a warning. That comes to about 40,355 push alerts a day on average in the CommBank app.

**A worked example: Card Not Present.** The one model the report describes in real detail covers card-not-present fraud, where the card is not physically present and the buyer is often not asked to verify in real time. CBA says it "built an AI model using a range of transactional, customer and confirmed fraud indicators. The model selects highly indicative variables and matches these to situational data points to assign a risk score to each CNP transaction." The score feeds the detection platform. CBA's claim: "alert accuracy has increased, on average, by over 14%," and potential losses fell "by approximately $29 million" over calendar 2025.

**Pre-payment name checking.** NameCheck is separate from the scoring models. When a customer sends a first-time payment, it checks whether the account name they typed looks consistent with the BSB and account number, "taking into account additional factors such as preferred names, nicknames, business trading names and risk activity indicators," and shows a confidence indication before the customer commits. It launched in March 2023 and was used around 4 million times a month by mid-2024. CallerCheck, which verifies someone claiming to call from CBA, and CustomerCheck, for identity checks, were each used around 3.7 to 3.8 million times in the 2024 financial year. Since July 2025 NameCheck has run alongside the industry's Confirmation of Payee service, which does bank-to-bank name matching.

**An intelligence loop.** Confirmed scam numbers and URLs go into an Anti-Scam Intelligence Loop; CBA says it has shared more than 30,000 pieces of intelligence with industry partners since April 2024. Through a partnership with [Apate.ai](http://apate.ai/) it also runs conversational "scambots" on honeypot phone numbers built to be found by scammers. The bots keep scammers talking, capture the numbers and scripts they use, and feed those into detection. CBA also uses generative AI to produce plausible CBA-lookalike domain names, check which are live, and refer them for takedown.

One governance detail is worth flagging. CBA classifies AI as a "material risk" under its board-level framework and requires a reviewer independent of the model's developer before anything deploys. It also writes an explicit exception into its rule that customers be told when they are dealing with AI: an exception may be made "in relation to fraud."

## What they claim

As reported, with the wording intact:

- **"Reduce customer fraud losses by over 20% in the first half of 2026 financial year compared to the first half of 2025 financial year"**, meaning July to December 2025 against the same months a year earlier. CBA says the payment screening and daily alerts "played a crucial role."
- CNP model: **"alert accuracy has increased, on average, by over 14%"** and **"reduce potential financial losses by approximately $29 million"** across calendar 2025.
- NameCheck: **"preventing scam payments worth more than an estimated $40 million"** and **"stopped over $370 million in mistaken payments in the year to June 2024."** By July 2025, a cumulative **"$650 million in prevented scams and mistaken payments."**
- **"Over two years, CommBank has seen customer losses from scams drop by 70 per cent"**, stated July 2025.
- Operational scale: 80 million events a day screened (1 July to 31 December 2025), more than 20 million payments a day, 40,355 alerts a day.

Most of these come with a baseline: a prior-year period, or a pre-model alert-accuracy figure. None come with a method. There is no published decomposition of the fraud-loss fall, no false-positive or customer-friction rate, and the loss-prevention figures are CBA's own estimates of losses that did not happen.

## How much to believe it

**Grade B** for the mechanism. The description of what the models screen, how the CNP score is built, where it plugs in, and the independent review step is first-party but specific, internally consistent, and stable across three years of separate CBA announcements plus an investor-reported half-year result. There is little reason to doubt that the system exists and works roughly as described.

**Grade C** for the headline that AI cut fraud losses by 20%. The 20% sits inside CBA's half-year financial reporting, so the aggregate number itself is reliable. Attribution is the problem. In the same period CBA spent more than A$900 million on fraud, scams, cyber and financial crime; the Scam-Safe Accord's name-matching and warning duties became mandatory; Confirmation of Payee went live across the industry; and telcos and the National Anti-Scam Centre were blocking scam calls and texts and pulling down sites. Reported scam losses across Australia fell about 26% in calendar 2024. A drop of a little over 20% at one bank is roughly the tide, not clearly above it, and nothing public isolates the models' share of it.

A Grade A version would need a controlled comparison: scored transactions against a held-out unscored control, or a difference-in-differences against banks without similar models, with precision, recall and false-positive rates attached. Banks rarely publish that, partly for competitive reasons and partly because it maps their defences for attackers. The CNP figure is the closest thing to a clean before-and-after in the whole account, and it is the one to cite if you are making an internal case.

## What you could apply

If you run fraud, risk or payments operations, the usable lesson is narrower than "CBA cut fraud 20% with AI."

**What transfers:**

- A risk score on top of the rules engine, not instead of it. The rules stay as the fast, explainable floor. The score is an extra signal for patterns nobody has written a rule for yet. CBA's CNP model is exactly this shape, and it is the part with the cleanest evidence.
- A name-check step before first-time payments. Much of NameCheck's claimed value is stopping mistaken payments, not just scams. If you hold payee data, showing a match indicator before the transfer is one of the cheaper interventions available.
- An intelligence loop. Confirmed-fraud cases, reviewed and labelled, fed back into retraining on a set cadence. This is what stops a model decaying as scam tactics shift.

**Roughly what it takes:** a data platform that can assemble transaction, customer and device features at scoring latency; a clean set of reviewed confirmed-fraud labels, which is the binding constraint for most teams; a model-risk review function independent of the people who build the model; and the channel access to act on a score in real time. On people, this is a small data-science group plus fraud analysts to review and label, not a large build. Time to a first shadow-mode model on one transaction type is months.

**Where it stops transferring:** the screening volume, the honeypot telco numbers and the industry data-sharing all assume infrastructure a mid-sized firm does not have. The headline result also leaned on regulation and ecosystem changes landing at the same time. A team acting alone should expect a smaller effect.

**First realistic step:** pick one transaction type where your confirmed-fraud labels are reliable. Build a model that scores it, and run it in shadow mode, scoring in production but actioning nothing, next to the existing rules for a quarter. Measure precision, recall, and the extra false-positive friction it would have put on legitimate customers. Then decide whether the score has earned a place in the decision.

## Sources

- **Primary:** Commonwealth Bank, *Our Approach to Adopting AI* (report dated December 2025, published February 2026) — screening volumes, the Card Not Present model description, the ">20%" fraud-loss claim, governance and independent-review detail, the fraud exception to AI disclosure. [https://www.commbank.com.au/content/dam/commbank-assets/about-us/docs/our-approach-to-adopting-ai-december-2025.pdf](https://www.commbank.com.au/content/dam/commbank-assets/about-us/docs/our-approach-to-adopting-ai-december-2025.pdf)
- Commonwealth Bank newsroom, "CommBank releases Australian-first report outlining how it is adopting AI" (5 February 2026). [https://www.commbank.com.au/articles/newsroom/2026/02/cba-approach-to-adopting-ai-report-announcement.html](https://www.commbank.com.au/articles/newsroom/2026/02/cba-approach-to-adopting-ai-report-announcement.html)
- Commonwealth Bank newsroom, "Anti-scam measures cut scam losses for CommBank customers in half" (1 August 2024) — NameCheck $40m / $370m figures, usage counts, CallerCheck and CustomerCheck. [https://www.commbank.com.au/articles/newsroom/2024/08/cba-cuts-scam-losses-for-customers.html](https://www.commbank.com.au/articles/newsroom/2024/08/cba-cuts-scam-losses-for-customers.html)
- Commonwealth Bank newsroom, "CBA steps up national battle against scams" (May 2023) — NameCheck launch and mechanism. [https://www.commbank.com.au/articles/newsroom/2023/05/namecheck.html](https://www.commbank.com.au/articles/newsroom/2023/05/namecheck.html)
- Commonwealth Bank newsroom, "Strengthening scam protection: Introducing Confirmation of Payee" (July 2025) — $650m cumulative, 70% over two years, NameCheck detail. [https://www.commbank.com.au/articles/newsroom/2025/07/scam-protection-confirmation-of-payee.html](https://www.commbank.com.au/articles/newsroom/2025/07/scam-protection-confirmation-of-payee.html)
- Commonwealth Bank newsroom, "CommBank harnesses near real-time, AI-powered intelligence to outsmart the scammers" (June 2025) — [Apate.ai](http://apate.ai/) scambots. [https://www.commbank.com.au/articles/newsroom/2025/06/apate-ai.html](https://www.commbank.com.au/articles/newsroom/2025/06/apate-ai.html)
- National Anti-Scam Centre / ACCC, "Australians better protected as reported scam losses fell by almost 26 per cent", and Targeting Scams Report 2024 — industry-wide context. [https://www.nasc.gov.au/news/australians-better-protected-as-reported-scam-losses-fell-by-almost-26-per-cent](https://www.nasc.gov.au/news/australians-better-protected-as-reported-scam-losses-fell-by-almost-26-per-cent)
- Commonwealth Bank, 2026 Half Year Results, half year ended 31 December 2025 — context for the fraud-loss figure sitting within financial reporting. [https://www.commbank.com.au/content/dam/commbank-assets/investors/2026/CBA%202026%20Half%20Year%20Results%20Presentation.pdf](https://www.commbank.com.au/content/dam/commbank-assets/investors/2026/CBA%202026%20Half%20Year%20Results%20Presentation.pdf)

<!--
Artwork brief — from the writer routine. Draw per docs/ARTWORK.md,
then delete this comment.

**Argument in one sentence:** A machine-learning score rides on top of a bank's existing fraud rules and lifts out the suspicious payments no rule was written for, but how much of the resulting drop in losses is the model's own doing stays unproven.

**Geometry:** a dense left-to-right stream of small identical payment glyphs (uniform squares). A thin diagonal scoring line crosses the stream. A handful of glyphs sitting above the line are pulled clear of the flow and circled. One circled glyph is visibly identical to the ones still passing through, a false positive.

**Accent:** moss, used only for the scoring line and the circles; everything else in greyscale.

**Deliberate imperfection:** the scoring line is very slightly hand-wobbled rather than ruler-straight, and one of the circles is left unclosed.
-->
