---
title: 'What India''s 3-Hour Takedown Rule Actually Requires From AI Builders'
description: 'India''s IT Rules 2026 cut AI takedown windows to 3 hours and mandate content labels. Here''s what compliance actually means for your team.'
pubDate: 2026-08-26
track: business
question: 'What does India''s 3-hour takedown rule actually require me to build?'
keywords:
  - IT Rules 2026 India AI
  - synthetically generated information SGI
  - AI content labelling India
  - deepfake takedown rules India
  - AI watermarking compliance
  - MeitY AI regulation
heroImage: '../../assets/art/it-rules-2026-ai-takedown-compliance-light.webp'
heroImageDark: '../../assets/art/it-rules-2026-ai-takedown-compliance-dark.webp'
heroAlt: 'A grid of thin closed squares sits inside an ochre-bordered rectangle; one square near the centre is missing its right side, drawn in a heavier ochre stroke.'
readingTime: '9 min read'
notionId: '3c8ced67-050a-8127-9f5c-db10763e18cb'
---
<div class="tldr">

## Executive TL;DR

- India's IT Rules 2026 amendment took effect on **20 February 2026**, cutting the takedown window for a lawful order on unlawful content from 36 hours to **3 hours**, and to **2 hours** for non-consensual intimate imagery (down from 24 hours). General user grievances went from 15 days to 7.
- "Synthetically generated information" (SGI) covers AI-altered audio, images, video, and audio-visual content made to look real, but **plain AI-generated text is explicitly excluded**. A blog post or a chatbot reply written by an LLM isn't SGI under this rule.
- Platforms must label SGI "clearly and prominently" and embed permanent provenance metadata "to the extent technically feasible," but MeitY has published **no required watermark format, no approved detection-model list, and no mandated technical standard**. Compliance here is a judgment call, not a spec you can implement against.
- The rule bars removing or altering that metadata once applied. Legal commentary and digital-rights researchers both note metadata survives a screenshot about as well as anything else does (not at all), and there's no cryptographic-verification requirement to catch it.
- Miss the window on a valid order and a platform doesn't just get fined. It loses safe-harbour protection under the IT Act entirely and becomes liable as if it had posted the content itself. Platforms with 5 million-plus registered India users carry extra declaration duties on top.
- The rules are still moving. A follow-up draft floated by MeitY in April 2026 would replace "prominent visibility" with a requirement that labels stay visible for the entire length of the clip, not just the opening seconds.

Six months ago, an Indian platform had 36 hours to act on a takedown order. Today it has three.

That compression is the headline most coverage led with, and it's real. But the takedown clock is the easy part to understand and the easy part to build for: it's a webhook and an on-call rotation. The harder part, and the part almost nobody outside the law firms has explained plainly, is that MeitY told platforms to label and permanently tag AI content without telling them how. The Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Amendment Rules, 2026 came into force on 20 February 2026, and they mark the first time an Indian statute has tried to regulate synthetic media directly rather than through general intermediary-liability language. If your product generates content and distributes it to other users, this rule decides whether you keep your safe harbour, regardless of how large your platform is.

</div>

## What actually counts as SGI

The rules define "synthetically generated information" as audio, visual, or audio-visual content that's artificially or algorithmically created, generated, modified, or altered to look indistinguishable from a real person or a real event. Two things about that definition matter more than the headline number.

First, **text is out**. AI-written blog posts, newsletters, marketing copy, and chatbot replies are none of them SGI under the current rule. If your product is a writing tool, this specific amendment mostly doesn't touch you, regardless of how much of your output an LLM authored. That's a narrower scope than most coverage implies, and it's worth knowing before you spend a compliance budget on the wrong surface.

Second, the rule carves out routine work explicitly: formatting, colour correction, transcription, compression, and standard document creation (slides, PDFs, training materials) don't count, even when a model touched them. Accessibility tooling like translation and clarity improvements is carved out too. The line the rule is actually drawing is between *editing* and *fabricating a realistic likeness of something that didn't happen*. A photo with the exposure fixed isn't SGI. A photo of a person saying something they never said is.

## The label has to be prominent. Nobody defines prominent.

Non-prohibited SGI has to be "clearly and prominently labelled": a visual label for visual content, a spoken disclosure at the start of the clip for audio. That's close to the entire technical specification. The rule sets no minimum size, no required duration, no exact wording, and no placement zone, leaving platforms to decide for themselves what "prominent" means in practice.

That's exactly the kind of ambiguity regulators usually try to close, not open, and it isn't settled yet either. MeitY circulated a further draft amendment on 21 April 2026 proposing to replace "prominent visibility" with a requirement that the label stay "continuous and clearly visible" for the entire duration of the content, not just at the start. If that lands, a label that satisfies the rule today, a static watermark in the corner for the first three seconds, could fail it later. Anyone building a labelling pipeline right now should build for continuous display rather than the minimum the current text technically allows, because the direction of travel is already visible even if the exact date isn't.

## Permanent metadata, no format, no way to check it

The provenance requirement is the part with real infrastructure cost attached, and it's also the part with the least government guidance. Platforms must embed permanent metadata or a technical provenance mechanism, including a unique identifier tied to the generating system, "to the extent technically feasible." No accepted watermarking standard has been specified. No approved detection-model list has been published. Legal commentary on the rule has flagged this gap directly: there's a statutory duty to embed unstrippable provenance data, with no government-endorsed method for doing it.

Two consequences follow. One, whatever you build is a bet on what regulators will later accept as compliant, not an implementation of a published spec, which is a different and riskier kind of decision than "hit this schema." Two, the rule bars removing or altering the label or metadata once applied, but that prohibition is legal, not technical. A screenshot or a recompression strips most watermarking approaches regardless of what the statute says about it, and the rules impose no requirement that the metadata be cryptographically signed or independently verifiable. WITNESS, the human-rights and synthetic-media research group, has been blunt about this in its own critique of the rules: its TRIED benchmark found that current AI detection tooling produces inconsistent results across file types and contexts, with meaningful false-positive and false-negative rates. A provenance mandate built on top of detection tools that don't agree with each other is a mandate you can satisfy on paper without solving the problem it's aimed at.

MeitY hasn't endorsed any specific technical mechanism for the metadata requirement, C2PA-style content credentials included. Commentary on the rules keeps pointing to C2PA, an existing open standard for cryptographically signed provenance data, as the closest available fit. Nothing in the rule requires it. If you're choosing an approach now, betting on the standard already being discussed as a likely reference point is more defensible than building something proprietary that satisfies the letter of "technically feasible" and nothing else.

## The takedown clock, and what actually loses you safe harbour

The timeline changes are the part everyone got right in the first wave of coverage, so the summary can stay short. On a lawful order or reasoned government intimation, the removal window for unlawful content dropped from 36 hours to 3. For non-consensual intimate imagery and deepfake nudity specifically, it dropped from 24 hours to 2. Ordinary user grievances, previously given 15 days, now get 7.

The number matters less than two things: what triggers the clock, and what you lose by missing it. The obligation attaches to intermediaries broadly: the rules define that term to include telecom and network operators, hosting providers, search engines, payment sites, and marketplaces, not just social platforms. Being a smaller or more niche product than the household names in this space isn't a reliable reason to assume the clock doesn't apply to you, if your product stores or transmits content on behalf of users. Platforms with more than five million registered users in India pick up additional declaration duties as "significant social media intermediaries," on top of the base obligations everyone carries. And the penalty for missing a valid order isn't a fine schedule. It's the loss of Section 79 safe-harbour protection entirely, which means the platform becomes exposed to liability as though it had generated and posted the unlawful content itself, plus whatever monetary and criminal exposure follows from that under the IT Act.

That's the number that should drive the budget conversation. A missed 3-hour window doesn't cost you a fine you can model. It converts every piece of unlawful content on your platform, retroactively, into your own liability.

## What critics say the rules get wrong, and why it matters for how you build

It's worth reporting the strongest counterargument honestly, because it changes what "safe" compliance looks like. WITNESS's sharpest objection is about incentives, not strength: a 3-hour window with no correction or appeal mechanism pushes platforms toward removing first and reviewing later. Because SGI is folded into every unlawful-act category under the rules rather than a narrow list, that same aggressive window applies whether the underlying complaint is genuinely urgent, such as child exploitation material, or contestable, such as defamation. WITNESS also points out that the provenance requirement ties metadata to the platform that applied it, not to the actual editing process, so a journalist using AI-assisted translation, or a rights group using generative tools to subtitle documentation footage, ends up with content permanently tagged in a way that says nothing about what was actually done to it.

For a compliance team, the practical implication is this: build your escalation and review process assuming you'll get borderline takedown requests you have three hours to act on with imperfect detection tooling, and design for the ability to reverse a wrongful removal quickly, because the rule itself doesn't require the platform to offer one.

## What this looks like in the first 90 days

Independent of the technical ambiguity, the near-term operational list is concrete. Rewrite terms of service, privacy policy, and user agreements to reflect the new definitions and obligations. Stand up a user-declaration flow for SGI at upload. Reconfigure complaint-handling and government-order response systems to the new clocks: 3 hours, 2 hours, 7 days. Build documentation trails for every user declaration, verification decision, and takedown action, because in a safe-harbour dispute the paper trail is what a platform gets judged on. None of this is glamorous, and none of it requires a solved technical standard to start. The metadata format is unsettled. The requirement to have a working intake, review, and takedown process by the time an order arrives is not.

No confirmed enforcement action or safe-harbour-loss case under these rules had surfaced in coverage as of this writing, six months after they took effect. That's not the same as low risk. The review clock exists because someone in government expects to use it, and a rule with an undefined standard gives an enforcer more discretion, not less.

## Sources

- [Khaitan & Co — MeitY notifies the IT Amendment Rules 2026](https://www.khaitanco.com/thought-leadership/MeitY-notifies-the-IT-Amendment-Rules-2026)
- [Freshfields — India targets deepfakes and AI-generated content: key changes under MeitY's 2026 amendments](https://www.freshfields.com/en/our-thinking/blogs/technology-quotient/india-targets-deepfakes-and-ai-generated-content-key-changes-under-meitys-2026-102mjwn)
- [Mondaq — IT Rules 2026 Deepfake Regulation: Three Hour Takedowns And AI Labelling Obligations](https://www.mondaq.com/india/new-technology/1760554/it-rules-2026-deepfake-regulation-three-hour-takedowns-and-ai-labelling-obligations)
- [Mondaq — IT Rules 2026 Corporate Playbook: Practical Roadmap For Synthetic Information Regulation](https://www.mondaq.com/india/it-and-internet/1747470/it-rules-2026-corporate-playbook-practical-roadmap-for-synthetic-information-regulation)
- [Finnovate — India's SGI Labelling Rules Explained: What the IT Rules 2026 Actually Say](https://www.finnovate.in/learn/blog/sgi-labelling-india-it-rules-2026-explained)
- [Bhatt & Joshi Associates — India's 2026 IT Rules Amendment: The World's First Binding Synthetic Content Provenance Mandate](https://bhattandjoshiassociates.com/indias-2026-it-rules-amendment-the-worlds-first-binding-synthetic-content-provenance-mandate/)
- [WITNESS — India's Synthetic Media Rules Build Enforcement on the Wrong Foundation](https://www.witness.org/indias-synthetic-media-rules-build-enforcement-on-the-wrong-foundation/)

<!--
Artwork brief — from the writer routine. Draw per docs/ARTWORK.md,
then delete this comment.

- **Argument in one sentence:** The law demands permanence and precision (a clean, locked grid) while the actual compliance surface, undefined labels and unverifiable metadata, stays genuinely open.
- **Geometry:** A regular grid of small square "tiles" (rows and columns of thin-stroke squares, evenly spaced), each representing one compliance clause. Most tiles are fully enclosed (closed strokes). No icons, no illustration.
- **Accent:** Ochre. This is fundamentally about liability and cost exposure (safe-harbour loss), the incentive layer, not the technical or human layer.
- **The deliberate imperfection:** One tile in the grid has an open side, an unclosed square where the line simply doesn't meet: the metadata/standard requirement that the rule states but never actually closes. Everything else in the grid is locked; that one gap is where the real compliance risk lives.
-->
