---
title: 'Klarna''s AI Support Agent: The Numbers, the Hype, and the Walkback'
description: 'Klarna says its OpenAI-powered assistant did the work of 700 agents in month one. A year later it''s rehiring humans. Here''s what the evidence actually shows.'
pubDate: 2026-09-02
track: case-studies
question: 'Did Klarna''s AI really replace 700 agents, and why is it rehiring humans now?'
keywords:
  - Klarna AI
  - OpenAI customer service
  - AI case study
  - enterprise AI ROI
  - AI customer support automation
heroImage: '../../assets/art/klarna-ai-customer-service-case-study-light.webp'
heroImageDark: '../../assets/art/klarna-ai-customer-service-case-study-dark.webp'
heroAlt: 'A row of 8 identical upright rectangles standing like columns. One rectangle leans out of alignment and is drawn in a single accent colour; the rest are upright ink outlines.'
readingTime: '6 min read'
notionId: '3cfced67-050a-812e-bd72-f75169413a3b'
---
<div class="tldr">

## Executive TL;DR

- Klarna's OpenAI-built assistant handled 2.3 million customer service conversations in its first month live, which Klarna said matched the output of 700 full-time agents (Klarna press release, Feb 27, 2024).
- Klarna reported average resolution time fell from 11 minutes to under 2 minutes, and repeat inquiries dropped 25%, in the same release — neither figure comes with a stated measurement method.
- Klarna projected the assistant would contribute a $40 million improvement to its 2024 profit — a company estimate, not an audited result.
- In May 2025, CEO Sebastian Siemiatkowski told Bloomberg that Klarna was hiring human agents back after concluding that cost-first AI deployment had degraded service quality.
- Evidence grade: **C** for the 2024 launch numbers (first-party, specific, no disclosed methodology), **D** for the 2025 reversal (reported through press interviews, not a Klarna document).
- The real story isn't "AI failed at Klarna" — it's that Klarna sequenced cost savings before quality controls, then had to correct course in public.

### The Situation

Klarna is a Swedish fintech best known for buy-now-pay-later checkout, operating across roughly 45 markets with a customer base in the tens of millions. Like most consumer fintechs, it runs a large customer service operation handling refunds, disputes, subscription questions, and delivery issues, historically staffed by a mix of in-house agents and outsourced vendors across many languages.

Heading into 2024, Klarna was under two pressures at once: a well-documented cost-cutting drive following its 2022 valuation drop, and a public push from CEO Sebastian Siemiatkowski to position the company as an AI-forward business ahead of an eventual IPO. Customer service — high volume, repetitive, multilingual — was the obvious first target for automation, and Klarna partnered with OpenAI to build it.

### What They Built (Mechanism)

Klarna's assistant is a conversational AI embedded directly in the Klarna app, built on OpenAI's models and trained on Klarna's own support content, policies, and historical chat transcripts. According to Klarna's February 2024 announcement, the assistant went live company-wide after a one-month internal test and was handling customer conversations across 23 markets in more than 35 languages.

The stated scope of the assistant's work, per Klarna: tracking and refunding orders, handling returns, adjusting subscriptions, resolving payment disputes, and answering general account questions — the bulk of Klarna's routine service volume. Klarna described a tiered structure in which the AI resolves what it can and escalates unresolved or sensitive cases to human agents, rather than replacing human support entirely at launch.

Klarna framed the assistant as "on par" with human agents on customer satisfaction scores in its release, though it did not publish the underlying satisfaction survey questions, sample sizes, or scoring methodology — a gap that matters for grading the claim below.

### What They Claim

The headline numbers, all attributed to Klarna's own February 27, 2024 press release announcing the assistant's first month at scale:

- **2.3 million conversations** handled in the first month, described as two-thirds of all Klarna customer service chats.
- **Equivalent to the work of 700 full-time agents** — Klarna's own comparison, not an independent headcount audit.
- **Resolution time cut from 11 minutes to under 2 minutes** on average.
- **Repeat inquiries down 25%**, which Klarna cited as evidence the AI was resolving issues correctly the first time, not just closing tickets faster.
- **An estimated $40 million improvement to Klarna's profit in 2024**, described by Klarna as an expected contribution from the assistant, stated at launch as a projection rather than a year-end audited figure.

Siemiatkowski also spoke publicly and repeatedly through 2024 about AI reducing Klarna's marketing and customer service headcount needs, reinforcing the narrative that the assistant was a direct labor substitute rather than a productivity tool layered on top of existing staff.

### How Much to Believe It (Evidence Grade + Rationale)

**Grade: C for the 2024 launch claims.** These are first-party numbers from a named, dated source (Klarna's own release), which is more than a rumor — but Klarna did not publish how "700 agents' worth of work" was calculated, what counted as a "resolved" conversation for the repeat-inquiry figure, or the methodology behind the customer satisfaction comparison. The $40 million figure was explicitly forward-looking at the time it was announced, meaning it was a target dressed as a result in much of the press coverage that followed, even though Klarna's own language was more cautious ("expected to contribute").

**Grade: D for the 2025 reversal.** In May 2025, Siemiatkowski told Bloomberg that Klarna had overcorrected on AI-driven cost cutting and was rehiring human customer service staff to restore service quality, framing it as a lesson in valuing quality alongside cost. This is a real, named, on-the-record admission from the CEO — which lends it credibility — but it reached the public through press interview coverage rather than a Klarna blog post or filing, and the specific figures on how many agents were rehired or how much quality had degraded were not laid out with the same numeric precision as the 2024 launch claims. Treat the *direction* of the story (Klarna scaled back AI-only support) as well-sourced, and treat any precise headcount number attached to the rehiring as secondhand until Klarna publishes its own account.

The pattern worth naming: Klarna's most confident, specific numbers arrived at the moment they served a growth-and-cost-cutting narrative, and the walkback arrived with less precision and through less controlled channels. That asymmetry is common in AI deployment PR generally, not unique to Klarna, and it's exactly why launch-week statistics deserve a lower evidence grade than they're usually given credit for.

### Practical Application for Readers

If you're evaluating or building a customer-service AI deployment, Klarna's arc offers concrete lessons rather than a simple "AI works" or "AI doesn't work" verdict:

1. **Don't launch on a cost metric alone.** Klarna's initial framing — "equivalent to 700 agents" — measured labor substitution, not customer outcomes. Track resolution quality and satisfaction with the same rigor as speed and volume from day one, not as an afterthought once quality complaints surface.
1. **Publish (or demand) your own methodology.** If your "resolution time" or "satisfaction" numbers can't survive someone asking "compared to what baseline, measured how," they're marketing copy, not evidence. Klarna's numbers would sit at grade B, not C, if the company had disclosed how "on par with human agents" was measured.
1. **Build the escalation path before you need it.** Klarna's model always included human escalation for unresolved cases; the reported quality problems emerged from how aggressively that escalation threshold was tuned to minimize human involvement, not from the presence of AI itself.
1. **Expect the correction, and plan for it publicly.** Siemiatkowski's willingness to say on record that Klarna over-rotated toward AI-only cost cutting is, in a strange way, the most credible data point in this whole case study — a company admitting a specific deployment mistake is harder to fake than a launch-week statistic. If you deploy AI in a customer-facing role, build the review cadence that lets you catch and say this before a journalist asks you about it.
1. **Treat "AI did the work of N employees" claims skeptically**, whether they're about your own deployment or a vendor's pitch deck. It's a marketing-friendly framing that rarely comes with an audit trail, and it collapses two very different questions — volume handled and quality delivered — into one number.

Klarna's assistant isn't a cautionary tale about AI customer service failing. It's a case study in what happens when the loudest, most precise numbers are the launch numbers, and the correction has to be pieced together from a CEO's press interview more than a year later.

</div>

## Sources

- Klarna, "Klarna AI assistant handles two-thirds of customer service chats in its first month" — company press release, February 27, 2024 (primary source for conversation volume, resolution time, repeat inquiries, and the $40 million profit estimate).
- Sebastian Siemiatkowski, interview with Bloomberg, May 2025, on Klarna rehiring human customer service agents after AI-driven cost cutting.
- Klarna investor and earnings commentary, 2024, referencing AI-driven cost and headcount efficiency.

<!--
Artwork brief — from the writer routine. Draw per docs/ARTWORK.md,
then delete this comment.

**Argument in one sentence:** A confident, precisely measured curve rises fast in month one, then the line goes hand-drawn and uncertain exactly where the press release stopped talking.

**Geometry:** A clean, ruled line chart climbing sharply left-to-right (the launch-month numbers) that visibly shifts to a looser, slightly wobbling freehand line partway across (the 2025 walkback) — same axis, two different drawing tools.

**Accent:** Moss green marks only the confident, sourced segment of the line; the uncertain segment stays uncolored/graphite.

**Deliberate imperfection:** Let the moss-green ink bleed slightly past the ruled line at the transition point, where confidence visibly breaks down.
-->
