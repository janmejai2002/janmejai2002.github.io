# Reading Experience Research — wAIbi-sabi

Research pass for the "make it feel alive without abandoning restraint" brief. Everything below is grounded in either (a) the live site's actual markup/CSS, fetched and read directly, or (b) named sites fetched or searched for this task. Colours, durations, and copy are quoted verbatim from source where possible.

---

## 0. What wAIbi-sabi does today, concretely

Fetched `https://janmejai2002.github.io/` and `https://janmejai2002.github.io/blog/the-95-percent-number/` directly (raw HTML + the two compiled CSS bundles, `_slug_.CjFvwsLE.css` and `index.BYuyTxFr.css`) rather than relying on a rendered screenshot, so the numbers below are exact.

**Palette (from `:root` custom properties):**
- Paper: `#F6F4EF` light / `#15181D` dark. Paper-2: `#EFEBE3` / `#1B1F26`.
- Ink: `#1A2639` light / `#E9E5DC` dark, with `--ink-soft` at 72%/70% opacity and `--ink-faint` at 42%/40%.
- Six accents, each with a light and dark value and a ~10%-opacity "wash" tint: `--mizu` (teal, `#00A9B8` / `#4ECDD8`), `--hanko` (terracotta, `#D2543F` / `#E87A64`), `--moss` (`#6E8C63` / `#9BBA8E`), `--ochre` (`#C2913A` / `#DDB667`), `--plum` (`#8A6690` / `#B694BC`), `--indigo` (`#4E6E9C` / `#85A5D0`).
- `--measure: 44rem`, `--gutter: 1.25rem` (4rem ≥768px).

**Motion tokens already defined:** `--ease: cubic-bezier(.22,.75,.24,1)`, `--dur: .9s`, `--dur-fast: .35s`. A `fadeUp` keyframe (opacity 0→1, translateY 14px→0) drives entrance staggers (`.d1`–`.d5`, 0.08s–0.44s delay). A `.scroll-reveal` class adds a `filter: blur(2px)→none` on top of the same fade, triggered by an `IntersectionObserver` at `threshold: .15`. `prefers-reduced-motion: reduce` is respected globally (durations clamped to 0.01ms).

**What's already there and working, that a redesign shouldn't rediscover from scratch:**
- A full-viewport WebGL grain field (`<canvas id="grain">`, custom fbm-noise shader) sits behind everything at `mix-blend-mode: multiply` (light) / `screen` (dark), opacity .32/.22, plus a static SVG `feTurbulence` noise texture on `<body>` at 4% opacity. This is doing real work already — the "paper, not screen" feeling is mechanically present. It pauses on `prefers-reduced-motion`, on tab-hidden, and reads its two blend colours (`--mizu`, `--plum`) live off computed CSS custom properties.
- A reading-progress bar (`#reading-progress`, 3px, gradient `--mizu`→`--indigo`) already exists on both index and article templates.
- A theme toggle already animates: hover rotates the button -20deg, sun/moon icons cross-fade via display toggling keyed to `data-theme` and the media query, with no-FOUC theme detection inlined in `<head>` before first paint.
- Body links already have a considered hover: a 1.5px underline (`background-image: linear-gradient`) that grows from `100% 1.5px` to `100% 100%` over 0.3s, flipping the link to a solid `--mizu` block with paper-coloured text — a "highlight pen" fill rather than a colour swap. This is a genuinely nice, on-brand micro-interaction already.
- Postlist cards lift on hover (`translateY(-3px)`, shadow, 0.3s `cubic-bezier(.2,.8,.2,1)`), and the "What's here" track cards each carry a small hand-drawn SVG icon (a ring-and-crosshair for Technical, a dot-grid for Business, nested arcs for Talks) with `pathLength="100"` set on strokes — scaffolding for a stroke-draw-on animation that doesn't appear to be wired up to anything (no `stroke-dasharray`/`stroke-dashoffset` rule found alongside it — worth checking whether that's dead code or an animation that got dropped).
- The masthead copy is already voice-forward, not corporate: **"The models are never finished."** as the H1, with lede **"Writing about AI that shows its working — what the benchmarks leave out, what breaks in production, and which parts do not hold up."** This is a real strength — quote-worthy, specific, not a value-prop template.
- `--serif: "Newsreader", ui-serif, Georgia, "Times New Roman", serif` is declared as a custom property but **no selector in either stylesheet references `var(--serif)`** — it's dead CSS, presumably a leftover hook for a typographic contrast move (pull quotes, drop caps, a TL;DR treatment) that never got wired up. That's a ready-made opportunity, not a bug to fix quietly.

**Where it feels cold, concretely:**
1. **The category grid is mostly empty and says so bluntly.** Of five "What's here" tracks, four show `0 posts` / button text "Nothing here yet" (Business, Basics, Case Studies) or aren't even filled in above. A visitor's first horizontal scan of the homepage hits three dead ends before the one live thing (Technical, 7 posts). Emptiness read as absence, not as "still forming," undercuts the wabi-sabi thesis instead of embodying it.
2. **Every published post uses the same accent.** All seven posts are tagged Technical, so `--accent:var(--mizu)` is the only accent that ever actually renders on a card, a hairline, a hero wash, or a `.hanko` pill. The six-colour palette exists in the CSS but a visitor never sees more than one of them in practice — the "six dusty accents" design language is currently a monochrome experience wearing six colours in its variables file.
3. **The archive is a literal spreadsheet.** `.ptable` — a `<table>` with `<thead>`, sortable columns, a `.dot` swatch, right-aligned numeric columns for read-time and date — is the coldest object on the page by a wide margin. It's legible and functional, but next to the warmly-illustrated "What's here" cards above it, dropping into a dense enterprise-dashboard table reads as a tone whiplash, not a deliberate register shift.
4. **The byline is reduced to initials.** `.byline__avatar` renders "JM" in a circle; there's no photo, no one-line human aside, no sense of a person having sat down to write this. Combined with the article opening straight into an "Executive TL;DR" bullet list, the piece front-loads utility before personality.
5. **Nothing marks the end of reading.** The article ends at a "Sources" `<ul>` and drops straight into the sitewide footer (copyright + GitHub/LinkedIn/RSS). There's no acknowledgment that a reader just spent 8 minutes here — no next-article nudge, no sign-off, no "if you made it this far." The reading experience has a considered beginning (hero image, TL;DR, byline) and an abrupt, characterless end.
6. **No margin devices despite having the margin.** The desktop layout already reserves a 4rem sticky `.rail` (wordmark + home icon + vertical category label) and generous gutters around a 44rem measure — real margin real estate exists on any viewport ≥768px — but nothing uses it for asides, footnotes, or a sense of "you are here" within a long piece. For an 8–15 minute read (the longest post is 15 min), there's no in-article navigation at all beyond the linear scroll and the generic top nav.
7. **Empty-state and UI microcopy is purely functional.** "Sort by," "Show everything," "Nothing published in this theme yet" — accurate, terse, and voiceless. None of it embarrasses the site, but none of it delights either; it reads like a component library's default strings.

---

## 1. Reading experiences worth studying, with the specific device that makes each one work

Each entry below follows the same shape: what it looks like, the exact device driving it, and what it means for wAIbi-sabi specifically. All were fetched directly (raw HTML/text pulled and read) rather than described from memory.

### Gwern.net — https://gwern.net/
*Austere, closer in spirit to Stripe Press than to anything playful — but mechanically one of the richest reading experiences on the open web.*
- **Hover-preview popups on every link.** Internal links, citations, and even footnote markers pop a small card on hover (tap-and-hold on mobile) showing the target's title and, for many, a rendered excerpt, abstract, or thumbnail — without a page load. The reader never leaves the sentence they're in to check what a reference means.
- **An opt-out toolbar, not a forced experience.** A floating corner control lets a reader toggle dark mode, "reader mode" (strips the popups and sidebars for a plainer pass), and popups themselves. Delight that can be switched off is delight that never curdles into noise — the single most important discipline for this brief's "warmth without noise" mandate.
- **Explicit anti-drop-cap stance.** Gwern's own linked design notes reject decorative drop caps in favour of "uniform solid blocks of text" for scanability at speed-reading pace. Useful evidence that restraint and hover-delight are orthogonal axes, not opposing ends of one dial — a site can be typographically austere and interactionally rich at the same time.
- **Applicability:** the popup mechanic is the direct precedent for intervention #11 below (hover-preview cards for internal links); the opt-out toolbar is the precedent for keeping any new hover/motion feature dismissible or reduced-motion-safe by default.

### Tufte CSS / Edward Tufte's handout style — https://edwardtufte.github.io/tufte-css/, documented further at https://gwern.net/sidenote
- **Sidenotes replace footnotes.** On wide viewports, a note renders in the right margin at the exact vertical position it's cited, in a smaller size, so the reader's eye tracks sideways instead of jumping to the bottom of the page and back.
- **Graceful narrow-viewport collapse.** Below a width threshold, sidenotes fold into a numbered inline toggle (a small superscript the reader taps to reveal the note inline) — the device degrades rather than disappears.
- **Applicability:** this is the single most copy-able device here because the geometry is already sitting idle on wAIbi-sabi. The `.shell` caps at 96rem, `.body` at 44rem `--measure`; on any viewport wider than roughly 1100–1200px there is 20+rem of unused margin on the right of every article that a sidenote column would fill exactly. See intervention #10.

### Distill.pub — https://distill.pub/ (dormant since ~2021, but the pattern persists in its intellectual descendants)
- **Interactive, reader-manipulable diagrams embedded directly in the article body**, not screenshots — a reader drags a parameter and watches the explanation change under their hand.
- **A visible "Peer-reviewed" badge linking to the actual public GitHub review thread** for that piece — the editorial process is not hidden, it's a clickable artifact.
- **Applicability:** the diagrams themselves are a bigger lift than this brief calls for, but the **transparency-as-warmth move** — showing the reader a seam instead of polishing it away — is directly on-thesis for a site whose stated aesthetic is "imperfection, incompleteness." A visible link to a source draft, a correction log, or "last revised because X" note would borrow the same warmth without needing Distill's interactive-diagram infrastructure.

### Maggie Appleton — https://maggieappleton.com/
- **A named taxonomy with a promise attached to each type**, not just section labels: *"Essays — Opinionated, longform narrative writing with an agenda,"* *"Notes — Loose notes on things I don't entirely understand yet,"* *"Patterns — A catalogue of design patterns gathered from observation and research."* Each label tells the reader what kind of attention to bring before they click.
- **The site names its own incompleteness as the format**, not an apology: *"A digital garden is a collection of imperfect notes, essays, and ideas growing slowly over time."*
- **Applicability:** this is the single most relevant precedent in this whole research pass for wAIbi-sabi's four empty "What's here" tracks (Business, Basics, Case Studies, Talks all show `0 posts`). The fix isn't hiding the emptiness — it's naming it as growth-in-progress, the same move Appleton makes. See intervention #1.

### Craig Mod — https://craigmod.com/essays/
- **Every index entry pairs an odd, specific title with one flat, plain-spoken descriptive line** — no SEO-keyword stuffing, no "The Ultimate Guide To." Examples pulled directly from the fetch: *"A Swarm of Blood Robots / Recent adventures in using LLMs,"* and an essay literally titled *"Let's Talk About Margins."*
- **The voice is conversational and slightly odd on purpose** — it reads like someone thinking out loud to a friend, not a publication briefing a readership.
- **Applicability:** wAIbi-sabi's `.postlist__desc` copy is already doing a version of this well (*"Prompt engineering has a mental-model problem, not a syntax problem..."*) — the finding here is "protect this instinct as the archive scales," not "add it from scratch."

### Stripe Press — https://press.stripe.com/
- **A single vertical column, catalog-style, not a grid** — each book gets identical treatment (title, author, one paragraph, named endorser pull-quotes, a purchase link) in strict sequence, so scrolling feels like flipping a print catalog rather than scanning a storefront.
- **Colour used almost nowhere** except CTAs and links; everything else is near-monochrome black-on-white.
- **Applicability:** proof that warmth and editorial feel can come from sequencing and voice alone, with almost no colour or motion investment — useful ballast against over-building motion/colour interventions disproportionate to what the content currently needs.

### Paul Graham — https://www.paulgraham.com/articles.html
*Included deliberately as the counter-example / calibration floor.*
- A single unstyled column of roughly 200 links with decorative GIF bullets. No cards, no imagery, no motion, no CSS to speak of.
- Remains one of the most-read essay archives on the web regardless.
- **Applicability:** the lesson isn't "add nothing" — it's that voice and selection carry a reading experience further than visual craft does, and craft should never be reached for to paper over a copy or curation problem.

### Quanta Magazine — https://www.quantamagazine.org/
- **Primary navigation organized by discipline** (Physics, Mathematics, Biology, Computer Science), not by format or chronology.
- **Bespoke, commissioned conceptual illustration per story** — vector-style pieces built to visualize the specific idea in that piece, not stock photography or generic hero art. The self-description: *"Illuminating basic science and math research through public service journalism."*
- **Applicability:** direct validation of wAIbi-sabi's existing hand-drawn SVG icon per track (the ring-and-crosshair for Technical, the dot-grid for Business) — bespoke abstract art per topic is exactly what separates a considered technical-content hub from a templated one. The site already has this instinct; it just needs more topics actually populated behind it.

### Linear's blog ("Now") — https://linear.app/blog
- **Large hero image per post card**, minimal chrome, one-sentence description, confident and specific headline voice (*"Rebuilding Linear's delta sync read path," "Teaching an agent to auto-fix bugs"*).
- **Navigation tabs segment by type of update** (`All`, `Changelog`, `Product launches`, `From the team`, `From the community`, `Press`) rather than by topic.
- **Applicability:** a useful contrast case — wAIbi-sabi segments by topic (Technical/Business/Basics), not by format. A hybrid filter (topic *and* format) is worth considering once there's enough content in more than one track to need it, but is not a near-term priority given the current content volume.

### Anthropic Research — https://www.anthropic.com/research
- **A tiered hierarchy**: four large featured cards up top (current/flagship work), then a searchable archival list below, organized by team (Alignment, Economics, Interpretability, Societal Impacts, Frontier Red Team).
- **Featured is explicitly not the same set as "most recent."** The lead cards are curated, signalling editorial judgment rather than a database dump ordered by timestamp.
- **Applicability:** wAIbi-sabi's own Featured section already does this (three hand-picked posts ahead of the full archive table) but doesn't yet say *why* those three, specifically — see intervention #7.

### The Pudding — https://pudding.cool/
- **Numbered stories** (#224, #223…) framed as open questions rather than headlines: *"Why some people mow a lawn better than others,"* *"Mapping 100,000 moments of human happiness."*
- **A filter bar where curation is a first-class category** — "Our Faves" sits alongside "Popular," "Video," and "Audio," not hidden behind an editorial-only distinction.
- **Applicability:** numbering entries as a sequence (The Pudding numbers every story; wAIbi-sabi already numbers its three Featured cards `01/02/03`) is a cheap device that makes a list read as an edited sequence rather than an infinite, undifferentiated scroll. Worth extending further down the page as content volume grows.

### Josh W. Comeau — https://www.joshwcomeau.com/
*The clearest "delight without noise" reference for a technical-writing site — and also the calibration ceiling.*
- **Card descriptions written as hooks, not summaries**: *"The little secret that makes animations feel alive ✨,"* *"It feels like it defies the rules of CSS!"* — the warmth is carried entirely by voice, not by motion.
- **A small illustrated mascot** (light/dark theme variants) used sparingly rather than everywhere.
- **Applicability:** genuinely useful for calibrating "how far is too far" — Comeau's emoji, exclamation points, and mascot are more maximalist than anything appropriate for wAIbi-sabi's register. Study the hook-writing technique; do not import the visual enthusiasm.

### Frank Chimero — https://frankchimero.com/
*The other calibration extreme — quiet confidence with zero onboarding language.*
- **The entire self-introduction is one flat sentence**: *"Frank Chimero — New York-based designer."* No "Welcome," no value proposition.
- **Work entries are terse noun-plus-year pairs** (*"The Shape of Design · Book · 2012"*), written for a visitor who already knows why they're there.
- **Applicability:** proof that "alive" doesn't require enthusiasm — spareness itself can read as a form of respect for the reader's time rather than as coldness. A useful check against over-warming wAIbi-sabi's already-good masthead copy.

---

## 2. Motion and micro-interaction craft, 2025–2026

**The two platform primitives that shipped cross-browser in this window** (per multiple 2026 developer write-ups, e.g. [Frontend Horizon's "The Browser Wins of 2026"](https://www.frontendhorizon.com/blog/view-transitions-api-and-css-scroll-driven-animations-the-browser-wins-of-2026) and [MDN's View Transition API docs](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API)):

- **View Transitions API.** `document.startViewTransition()` for same-document changes, and the `@view-transition` CSS at-rule for cross-document (classic MPA) navigations — which is the relevant one for an Astro static site like wAIbi-sabi, since every page load is a real navigation, not a client-side route change. The browser automatically crossfades (or, with named `view-transition-name` on matched elements, morphs) between the old and new page's captured state. Zero JavaScript required for the cross-document case; it degrades gracefully to an instant swap in browsers that don't support it. This is the mechanism that would let, e.g., an article's accent-coloured hairline or hero image visually "become" the same element on the destination page, rather than the current flat swap.
- **CSS Scroll-Driven Animations** (`animation-timeline: scroll()` / `view()`). These bind an animation's progress directly to scroll position or to an element's visibility within the scrollport — running entirely on the compositor thread, no `IntersectionObserver`, no JS at all. Two distinct patterns: *scroll-linked* (progress continuously tracks scroll position — a progress bar, a parallax reveal) versus *scroll-triggered* (fires once when a threshold is crossed — closer to what `.scroll-reveal`'s `IntersectionObserver` already does today, just movable to pure CSS).
- **Accessibility discipline, non-negotiable per every 2026 source consulted:** never animate `transform: rotate` or large translations tied to scroll without a `prefers-reduced-motion` gate — vestibular and photosensitive reactions are a real, not theoretical, risk with scroll-linked motion specifically (continuous, unpredictable-feeling motion is worse than a one-shot fade). wAIbi-sabi's existing reduced-motion handling (global animation-duration clamp to 0.01ms) is already correctly structured to extend to any new scroll-driven work.

**Duration/easing norms observed across the fetched sites and wAIbi-sabi's own CSS:** entrance fades in the 250–400ms range for discrete UI (hover states, toggles), 600ms–1s for page/section entrances, nearly always with an ease-out curve (deceleration, no bounce) — wAIbi-sabi's own `cubic-bezier(.22,.75,.24,1)` at `.9s` for `fadeUp` and `.35s` for interactive states sits exactly inside this norm already; the tokens don't need re-tuning, they need **wider and more varied use** (currently only entrance staggers and a couple of hovers consume them).

**What reads as warmth vs. noise, synthesized:**
- Warmth: motion that confirms something the reader already did (a hover fill, a progress bar that moves as you scroll, a theme toggle that visibly rotates) — feedback, not decoration.
- Noise: motion that runs regardless of reader action (autoplaying parallax, looping background animation with no off switch, scroll-jacking). wAIbi-sabi's WebGL grain is the one animation on the page that runs continuously and unprompted — it's already correctly gated by `prefers-reduced-motion` and tab-visibility, which is the right discipline; anything new added should hold itself to the same bar.
- The View Transitions morph (accent-colour hairline persisting across a card→article navigation) is warmth because it's *keyed to the reader's own click* — it dramatizes a navigation the reader just initiated, rather than performing at them unprompted.

---

## 3. The moment of arrival: orienting a first-time visitor

Patterns observed across the fetched sites, ranked by how directly transferable they are to wAIbi-sabi:

1. **Name the content types and what attention each deserves** (Maggie Appleton: "Essays — Opinionated, longform... with an agenda" / "Notes — Loose notes on things I don't entirely understand yet"). wAIbi-sabi's `.track__ask` lines already half-do this — **"For people who build with AI,"** **"For people who decide about AI,"** **"For people getting up to speed"** — audience-framed rather than content-framed. That's a genuinely good, underused pattern; it should be leaned into harder rather than replaced.
2. **Curated ≠ recent, and say so** (Anthropic Research's featured-then-archive split; The Pudding's "Our Faves" filter as a first-class category alongside chronological ones). wAIbi-sabi's "Featured" section is doing this already but doesn't yet say *why* those three are featured — a one-line editorial note ("what I'd point a new reader to first") would make the curation legible rather than implicit.
3. **Own the incompleteness explicitly rather than let empty states speak for themselves** (Appleton's "growing slowly over time" framing). This directly targets wAIbi-sabi's four `0 posts` cards — the fix is copy, not data: a single sentence per empty track that frames it as "not yet planted" rather than silence.
4. **Voice-forward masthead lines over value-prop templates** (Craig Mod's odd/specific titles; Frank Chimero's zero-onboarding confidence; Comeau's hook-style descriptions). wAIbi-sabi's H1 **"The models are never finished"** already clears this bar — it's a thesis statement, not a tagline. The lede beneath it is also strong and specific. This part of arrival doesn't need rework; it needs the same voice extended into microcopy that currently doesn't have it (button labels, empty states, footer).
5. **A literal "start here" pointer** is common practice (per general search on the pattern) but *absent* from every site fetched for this research except in spirit — none of Gwern, Appleton, Mod, or Chimero has a literal "Start Here" page; instead each uses **one editorially-chosen top-of-page entry point** (a pinned essay, a featured card) to do that job implicitly. wAIbi-sabi's Featured section already serves this function; it doesn't need a dedicated page, just the one-line "why these three" note from point 2.

---

## 4. Typography for long-form web reading, 2026

**Measure.** Cross-referenced against current guidance (e.g. Smashing Magazine's line-length/font-size piece and multiple 2026 typography guides): the classical target is **50–75 characters per line, ~66 as the commonly cited ideal**. wAIbi-sabi's `--measure: 44rem` at `.body` font-size `1.0625rem`–`1.125rem` (17–18px) in Inter works out to roughly **78–88 characters per line** at typical Inter x-height/width — comfortably wider than the 66-character target, though Inter's relatively narrow, humanist proportions make it read better at width than a wider serif would. **Verdict: 44rem is defensible but sits at the loose edge of best practice, not the center of it.** Two options rather than a flat verdict: (a) leave it, since Inter's condensed-ish width and the generous 1.78 line-height partially compensate, or (b) tighten to ~40rem (closer to 70–75 characters) if the "aliveness" pass also increases body size or adds sidenotes that need the freed-up horizontal space. Given the sidenote recommendation below, (b) is the more coherent combined move — sidenotes need the margin, and a slightly narrower measure gives them room without widening `.shell` beyond its current 96rem cap.

**Line-height.** Current `.body` line-height is **1.78** — already above the "1.4–1.6" range commonly cited for body copy, which is appropriate given the loose measure; tightening the measure without loosening leading further would need care, but 1.78 is already generous, not a gap to close.

**Drop caps.** Current guidance is split: decorative value only, no readability benefit, "should be used sparingly, typically to introduce major sections." wAIbi-sabi already gives `.body>p:first-of-type` special treatment (1.2em, weight 450, colour bumped to full `--ink`) — a drop cap on that same paragraph would be a small, cheap, print-coded flourish that's consistent with the site's stated "printed plate" aesthetic, and would finally give the dead `--serif: "Newsreader"` variable a job (a serif drop cap against the Inter body is a classic, restrained contrast move — see Stripe Press's own serif/sans pairing).

**Numerals and OpenType.** Inter ships as a variable font with real, unused-here OpenType capability: tabular figures (useful for the `.ptable` archive table's read-time/date columns, which currently use whatever default figure style Inter falls back to), slashed zero, and several stylistic sets. None of `font-variant-numeric`, `font-feature-settings`, or `font-variation-settings` appear in either fetched stylesheet — the site is using Inter at fixed static weights (400/500/600/700/800 loaded via Google Fonts `wght@400;500;600;700;800`) rather than as a variable font at all. Switching to Inter Variable and using `font-variation-settings` would enable fluid weight (e.g., a headline that responds to viewport with `clamp()`-driven weight, not just size) and unlock those OpenType features without adding a second font file.

**Dark-mode typographic adjustment.** The CSS already swaps ink/paper tokens correctly for contrast, but there's no compensating weight or tracking change for dark mode specifically — a known typographic subtlety (light text on dark ground optically "thins" at the same weight, due to irradiation/halation) that most of the fetched sites don't visibly address either, so this is a genuine opportunity rather than a gap relative to peers. A `:root[data-theme=dark] .body { font-weight: 435 }` (via variable font) or a hair more letter-spacing in dark mode is a one-line, low-risk fix.

**Small caps / punctuation detail.** Not present anywhere in the current CSS (no `font-variant-caps`, no custom quote/dash handling beyond what's typed in Markdown). Low priority relative to the above, but the em-dash usage already visible in the article prose ("It is a real finding from a real study. It also does not say...") is doing real voice work already — the writing has the punctuation personality; the typesetting hasn't been asked to match it yet (e.g., no `hanging-punctuation`, no distinct treatment for em-dashes vs. hyphens).

---

## 5. Topic/section hub pages done well

The general web-design-blog commentary on this topic (searched broadly) was mostly generic SEO advice and not worth citing directly, but the fetched examples above triangulate a clearer pattern than the search results did:

- **Anthropic Research** — hub organized by *team/discipline*, tiered into featured (curated, not necessarily newest) vs. archive (searchable, chronological), each entry tagged with its owning team as metadata.
- **Quanta Magazine** — hub organized by *discipline* as primary navigation (not as a filter bolted onto a chronological feed), each discipline getting its own bespoke illustration style and lead story treatment, not a shared template.
- **The Pudding** — hub filters include an explicitly curatorial one ("Our Faves") alongside objective ones ("Video," "Audio," "Popular") — curation is a filter, not just an editorial afterthought layered on top of chronology.
- **wAIbi-sabi's own "What's here" section** is already structurally ahead of a plain reverse-chronological list — it's audience-framed (`.track__ask`), has bespoke SVG icon art per topic, and links out to a filtered view of the archive table. The gap isn't the pattern, it's the content behind it: four of five tracks are empty, and the fifth ("Talks") isn't even wired to a described use yet visible on the homepage snapshot fetched. The mechanism for a good hub already exists here; it needs feeding, plus the copy fix from Section 3 (own the emptiness) in the meantime.

---

## 6. Prioritized interventions

Ordered roughly by warmth-delivered-per-hour. Each entry names the specific precedent it borrows from, a rough single-person effort estimate against the current Astro codebase, and — for anything non-trivial — the concrete implementation sketch (selectors, files, or mechanism) so this doubles as a work ticket, not just a suggestion.

**1. Rewrite empty-track copy to own the incompleteness.** Replace "Nothing here yet" / "0 posts" on the Business, Basics, and Case Studies track cards with a line that frames the gap as growth-in-progress rather than absence — e.g. swap the CTA span text for something like "Still taking root" and drop the bare `0 posts` counter in favour of a plain sentence. Pure copy change plus one conditional already present in the `.track__cta` template (it already branches on post count for the "Nothing here yet" string). *Effort: 1–2h. Borrowed from: Maggie Appleton's digital-garden framing ("imperfect notes... growing slowly over time").*

**2. Rotate accent colours across posts, not just tracks.** Every published post today inherits `--accent:var(--mizu)` because every post is tagged Technical, so five of the six defined accents (`--hanko`, `--moss`, `--ochre`, `--plum`, `--indigo`) never render anywhere a reader can see them. Add a per-post frontmatter field (`accent: ochre`) or derive one deterministically from the post's slug hash, and thread it into the same `style="--accent:var(--x);--tint:var(--wash-x)"` pattern the templates already use on `.article`, `.postlist a`, and `.featured__grid li`. No new CSS needed — the six accent/wash pairs and every consumer of `--accent` already exist; this is purely a data-plumbing change. *Effort: 2–3h. Borrowed from: The Pudding's per-story visual identity.*

**3. One human sentence in the byline.** `.byline__avatar` currently renders bare initials ("JM") with no accompanying aside. Add a short dateline-style line under `.byline__name` — a plain, specific sentence about the piece (not a bio), in the same voice as the masthead lede. Requires per-post copywriting plus a small markup addition inside the existing `.byline` flex container. *Effort: 2h writing + 1h markup. Borrowed from: Craig Mod's conversational subtitle voice.*

**4. Give the dead `--serif: "Newsreader"` token a job.** It's declared in `:root` in both fetched stylesheets and referenced by zero selectors. The cheapest use: a serif drop cap on `.body>p:first-of-type::first-letter` (which already gets special treatment — 1.2em, weight 450, full `--ink` colour) — a classic, restrained print flourish that costs one CSS rule and finally exercises the loaded Newsreader font stack (confirm it's actually being fetched via Google Fonts alongside Inter, or fall back gracefully to Georgia if it isn't loaded — worth checking the `<link>` tags before shipping this). *Effort: 1–2h. Borrowed from: print editorial convention; Stripe Press's serif/sans contrast.*

**5. End-of-article sign-off block.** Right now the article template ends at the `Sources` `<ul>` and falls straight into the sitewide `<footer>`. Insert a short block between them — one human closing line plus a same-`--accent`-coloured "next article" or "back to Technical" link, reusing the `.hanko--link` pill styling already defined for the header. *Effort: 3h. Borrowed from: Craig Mod's and newsletter-style (Every.to) outros.*

**6. Soften the archive table.** `.ptable` is the coldest object on the page — a bordered `<thead>`, right-aligned numeric columns, and a `.dot` swatch make it read like a spreadsheet export next to the illustrated `.tracks__grid` above it. Keep the sort/filter JS as-is (it's functional and already accessible via `aria-pressed`), but: lighten or drop the `<thead>` border, and extend the body-link hover pattern already defined (`background-image: linear-gradient` growing from `100% 1.5px` to `100% 100%`) onto `.ptable__track a` / row titles on hover, so the archive shares its one best micro-interaction instead of looking like a different product. *Effort: 3–4h. Borrowed from: the site's own existing body-link hover, applied consistently.*

**7. Featured-section rationale line.** Add one sentence near the `Featured` heading (`#featured-h`) explaining the curation logic — why these three, not just "the three newest" — so the curated/chronological distinction stays legible as the archive grows past a handful of posts. *Effort: 1h. Borrowed from: Anthropic Research's explicit featured/archive split.*

**8. Extend `--dur`/`--ease` tokens everywhere new motion gets added.** `--ease: cubic-bezier(.22,.75,.24,1)` and `--dur`/`--dur-fast` already exist and are well-chosen (they sit inside the 250–400ms discrete-UI / 600ms–1s entrance norms observed across every fetched 2026 source), but several existing hovers use ad hoc values instead (`.postlist a` hover uses its own `cubic-bezier(.2,.8,.2,1)` at `.3s` rather than the shared tokens). Any new interaction built from this list should consume the shared custom properties, and it's worth a quick pass reconciling the couple of places that already drifted, so all motion on the page reads as the same material. *Effort: 1h audit + rolling cost on future work. No external precedent needed — this is internal consistency.*

**9. Verify or finish the SVG icon draw-on animation.** Every `.track__art` icon (the ring-and-crosshair, the dot-grid, the nested arcs) has `pathLength="100"` set on its strokes — the standard setup for a `stroke-dashoffset`-based "draw itself in" reveal — but no matching `stroke-dasharray`/`stroke-dashoffset` transition was found in either fetched stylesheet. Either wire up a one-shot draw animation keyed to the existing `.scroll-reveal` class (the `IntersectionObserver` and `.revealed` class toggle already exist; this just adds one more property to transition), or confirm the `pathLength` attributes are inert leftovers and remove them to avoid confusing future maintainers. *Effort: 3h. Borrowed from: 2026 scroll-driven-animation norms, layered onto infrastructure the site already has.*

**10. Sidenotes for asides on wide viewports.** The layout already reserves the margin: `.shell` caps at 96rem, `.body`/`.article` cap at the 44rem `--measure`, leaving 20+ rem of unused right-hand space on any viewport past ~1100–1200px (above and beyond the existing 4rem `.rail`). Implement a `<aside class="sidenote">` component that CSS-positions itself in that margin at a wide breakpoint (absolute/sticky positioning keyed to its anchor point in the text) and collapses to an inline toggle below it — the exact Tufte CSS mechanism. This is the single highest-leverage "feels alive" move on this list specifically because the geometry doesn't need to change; only content and one new component do. Consider pairing with the measure-narrowing discussed in Section 4 (drop to ~40rem) to give sidenotes a bit more breathing room without widening `.shell`. *Effort: 5–7h. Borrowed from: Tufte CSS / gwern.net's sidenote pattern.*

**11. Hover-preview cards for internal links.** A small popover on hover/focus of an internal link (a related-post reference, a "Sources" entry pointing to another own-site page) showing the target's `--accent` colour, title, and one-line description — dismissible, and built on `:focus-visible` as well as `:hover` so it's keyboard-reachable. Start scoped to internal links only; external-link preview cards (fetching og:image/description from third-party URLs) are a materially bigger and lower-value lift for this site's current link profile. *Effort: 6–8h. Borrowed from: gwern.net's hover-popup citations.*

**12. View Transitions for card→article navigation.** Add the `@view-transition { navigation: auto }` CSS at-rule at the Astro layout level (this is a cross-document/MPA transition, the correct primitive for a statically-rendered Astro site where every navigation is a real page load) so clicking a `.featured__grid` or `.postlist` card crossfades into the article rather than hard-cutting. Tag the accent hairline and hero image with matching `view-transition-name` values on both the card and the article template so the browser morphs them across the navigation instead of just crossfading the whole viewport. Pure progressive enhancement — unsupported browsers fall back to an instant navigation with zero regression. *Effort: 4–6h. Borrowed from: the View Transitions API, the specific 2026 "browser win" most directly applicable to a static Astro MPA.*

**13. In-article progress ticks in the existing `.rail`.** The sticky sidebar currently holds only the wordmark, the home icon, and a vertical category label — real UI real estate sitting mostly idle during an 8–15 minute read. Add small dot markers keyed to each `<h2>` in the article body, filled in as the reader scrolls past that section, reusing the scroll-listener logic that already drives `#reading-progress`. *Effort: 4h. Borrowed from: Distill's and Quanta's structural reading aids, adapted to a rail component that already exists on the page.*

**14. Colophon line in the footer.** The footer today is purely functional: copyright plus GitHub/LinkedIn/RSS links. Add one plain sentence beneath it about the site itself — built with Astro, updated by hand, imperfections left in on purpose — in the print tradition of a colophon. *Effort: 1h. Borrowed from: print colophon convention; Frank Chimero's understated self-framing.*

**15. (Lower priority, experimental) Tie grain-field amplitude to scroll depth, not just theme.** The WebGL shader already reads `u_amp` live and ties it to the light/dark toggle (0.5 in dark mode, 1.0 in light). Extending that same uniform to also settle slightly as a reader scrolls deeper into an article — the page "holding still" as attention deepens — is a genuinely novel idea for this brief rather than a borrowed pattern, and carries real risk of reading as gimmicky if the effect is too legible. Prototype behind a flag and validate with the site owner before committing engineering time. *Effort: 4–6h. Not borrowed — flagged explicitly as the one speculative item on this list.*

**Sequencing suggestion:** items 1, 3, 4, 7, and 14 are copy-and-small-markup only and shippable in a single afternoon with no visual-design risk — do these first, since they directly address the coldest, cheapest-to-fix spots (empty states, byline, footer, a dead CSS variable). Items 2, 6, and 9 are the next tier: moderate effort, no new interaction patterns, mostly finishing or extending things the codebase already started (accent theming, the existing hover pattern, the half-wired icon animation). Items 10–13 are the real "aliveness" investment — sidenotes, hover previews, view transitions, rail progress — and read best sequenced after the cheap wins land, partly because they're bigger and partly because they benefit from the per-post accent variety (item 2) and possible measure adjustment (Section 4) already being in place first. Item 15 is genuinely optional and should be treated as an experiment to validate, not a commitment to build.

---

## Sources consulted

- Live site: `https://janmejai2002.github.io/` and `https://janmejai2002.github.io/blog/the-95-percent-number/` (raw HTML + `_astro/_slug_.CjFvwsLE.css` + `_astro/index.BYuyTxFr.css`, fetched directly)
- [Gwern.net](https://gwern.net/) and [Sidenotes In Web Design · Gwern.net](https://gwern.net/sidenote)
- [Tufte CSS](https://edwardtufte.github.io/tufte-css/)
- [Maggie Appleton](https://maggieappleton.com/)
- [Craig Mod — Essays](https://craigmod.com/essays/)
- [Stripe Press](https://press.stripe.com/)
- [Paul Graham — Articles](https://www.paulgraham.com/articles.html)
- [Quanta Magazine](https://www.quantamagazine.org/)
- [Linear — Blog](https://linear.app/blog)
- [Anthropic Research](https://www.anthropic.com/research)
- [The Pudding](https://pudding.cool/)
- [Distill.pub](https://distill.pub/)
- [Josh W. Comeau](https://www.joshwcomeau.com/)
- [Frank Chimero](https://frankchimero.com/)
- [View Transitions API — MDN](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API)
- [View Transitions API and CSS Scroll-Driven Animations: The Browser Wins of 2026 — Frontend Horizon](https://www.frontendhorizon.com/blog/view-transitions-api-and-css-scroll-driven-animations-the-browser-wins-of-2026)
- [Creating Complex Scroll-driven Animations with Pure CSS in 2026 — DEV Community](https://dev.to/nickbenksim/creating-complex-scroll-driven-animations-with-pure-css-in-2026-17l)
- [Size Matters: Balancing Line Length And Font Size In Responsive Web Design — Smashing Magazine](https://www.smashingmagazine.com/2014/09/balancing-line-length-font-size-responsive-web-design/)
- [Drop Caps: Historical Use And Current Best Practices With CSS — Smashing Magazine](https://www.smashingmagazine.com/2012/04/drop-caps-historical-use-and-current-best-practices/)
