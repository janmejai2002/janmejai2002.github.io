# Brief — the next phase

The owner dictated this as unstructured thoughts on 2026-08-26. What follows is
those thoughts organised, with the intent behind them preserved rather than
flattened into a task list. **The paste-in prompt is at the bottom.**

This brief is written for a session running **Claude Fable 5**. See §7 for why
that changes how it should be worked.

---

## 1. What the owner is actually asking for

Two ambitions, stated in nine fragments.

**Ambition one: make it a place people want to be.** The site is currently
austere, well-engineered, and a little cold. The owner's words: it lacks "a
human sort of ease and welcome effect", it should be "instantly dopamine
releasing, eye catching, exciting", and the landing page needs "more flair" and
"the thoughtfulness behind each of the small interaction one has while reading a
blog". This is one complaint expressed five different ways (their items 1, 5, 8,
9), and it is a craft problem, not a feature request.

**Ambition two: become the AI blog that AI systems cite.** Not "rank well" —
the owner said "so viral that all AI agents and chats use it when they look for
something" and "the best world's ranked AI blog that exists". Then: a feedback
loop that analyses queries and feeds the automated themes, reader and reach
metrics shown on the site, and eventually AI companies sponsoring it. That is a
distribution and business problem (their items 2, 3, 4), and it has a
foundation missing underneath it — see §3.

Plus two support threads: review the machine that runs it (item 6), and tell
them what they don't know to ask for (item 7).

---

## 2. The conflict to resolve before any design work

**`docs/ARTWORK.md` and the owner's request are in direct tension, and this
needs settling with them before pixels move.**

The design language is explicit: flat fills, no gradients, no drop shadows, no
neon, "dusty, never neon", generous negative space, "a printed plate, not a
marketing page". The owner is now asking for eye-catching, exciting, immediately
dopamine-releasing. Read literally, those cannot both win.

**The recommended synthesis, to put to the owner rather than assume:** the
restraint stays in the *palette and surface*, and the warmth comes from
**language, motion, typography and micro-interaction** instead. Wabi-sabi has
never actually meant cold — it means unfinished, human, hand-made. A site can be
quiet in colour and still feel alive in how it responds, how it welcomes, and
how it talks. Delight through timing and voice rather than through saturation is
also simply better craft, and it is the version that will still look good in
three years.

If the owner wants something louder than that, the honest move is to **revise
`docs/ARTWORK.md` deliberately** rather than quietly ship work that contradicts
it. A spec that gets ignored is worse than a spec that gets changed.

### The logo, specifically

The owner does not like what shipped on 2026-08-26 — an `AI` seated inside the
open ensō — describing it as "an AI inside a cut circle" and asking for "more
element or design play and modernity". Take that as a clear rejection of the
enclosed-glyph approach.

What must survive any redesign: the name's whole point is the typographic move
of `AI` surfacing inside `wabi`, so the mark probably wants to be
**wordmark-led** rather than a symbol with letters parked in it. It has to hold
up at favicon size, and per the artwork spec it needs exactly one deliberate
imperfection. Beyond that the field is open — show the owner three or four
genuinely different directions rather than one refinement of the rejected idea.

---

## 3. The thing blocking the entire business ambition

**There is no analytics on this site. None.** No page views, no referrers, no
sessions, nothing. Verified: no analytics script anywhere in `site/src`, and no
provider in `package.json`.

That single gap blocks most of ambition two:

- The "feedback loop that keeps analysing queries" has no queries to analyse.
- "Indicators on the blog about its reader and reach" have no numbers to show.
- **Sponsorship is unsellable without an audience number.** No AI company buys a
  placement on an asserted audience.

So measurement is the first move of that whole thread, and it should be chosen
for a static privacy-respecting site (a cookieless, script-light analytics
provider, plus Search Console and Bing Webmaster data, which are already
half-configured). Get real numbers running early, because everything downstream
compounds on top of them.

---

## 4. The workstreams

Four threads. They are not equally ready, and they are ordered by what unblocks
what — not by the owner's numbering.

### A. Make it feel alive (their items 1, 5, 8, 9)

**Outcome:** a first-time visitor lands, immediately understands what this is,
feels welcomed by a human rather than briefed by a system, and wants to open
something. Then the article they open is a genuinely good read on both themes,
on a phone and on a laptop.

The pieces the owner named: the landing page, the article reading experience as
the core, how each theme's own page is arranged (**note: theme pages do not
exist yet** — the index has theme panels but there is no `/technical/` or
`/talks/` route; that is a real gap), the Executive TL;DR block, motion and
micro-interaction, and the copy voice on the home page.

Resolve §2 with the owner first. Then this thread should be *studied* before it
is built — look at what the best-read publications actually do about reading
rhythm, entry points, and the moment of arrival, rather than reaching for the
usual effects.

**Constraint that is not negotiable:** article prose stays at `--measure: 44rem`.
That cap is readability, and it has already been defended once.

### B. Get cited by machines (their items 2 and 4)

**Outcome:** when a person asks an AI assistant a question this blog has
answered, the assistant's answer draws on this blog and says so.

Known, concrete, ready to build:

- **IndexNow.** The owner found it and it fits their standing rule that
  unattended automation may only use credentials that cannot expire — the key is
  a static UTF-8 text file at the site root, no login and no token. Submit
  changed URLs by POST to `api.indexnow.org`; Bing, Yandex, Seznam and Naver
  consume it. Two rules from the docs worth honouring: submit only URLs that
  actually changed (not a historical backfill), and expect `429` if you spam it.
  Wire it into `deploy.yml` after a successful deploy.
- **`robots.txt` is `Allow: /` with a sitemap and nothing else.** No `llms.txt`,
  no explicit posture toward AI crawlers. Decide that posture deliberately —
  being cited requires being readable by the things that cite you.
- **The content model is already unusually well-suited to this and is not being
  exploited.** Every article carries a `Reader Question` — a real question in a
  human's words — and opens with an `Executive TL;DR` that states the findings.
  That is precisely the shape retrieval systems lift. Structured data marking up
  the question and the answer block is a strong, cheap, high-fit move that
  nothing else on this site is currently doing.
- **The honesty machinery is a citation asset, not just an ethic.** The claim
  ledger, the graded evidence in Case Studies, and the corrections that were
  published rather than hidden are exactly the signals that separate a source
  worth citing from a content farm. A public corrections log — already queued as
  an idea — is worth reconsidering as a *distribution* feature.

The strategy half of this (the query feedback loop, what "world's best AI blog"
concretely requires) needs real research, not assertion. See §7 on delegating
it.

**One reality to put to the owner rather than discover late:** if the ambition
succeeds, most readers get their answer from the assistant and never arrive.
Being cited and being visited are different currencies now, and that changes
what a sponsor is actually buying. Better to design for it than to be surprised.

### C. The monetisation question (their item 4, second half)

**Outcome:** a written plan the owner can act on, not a deck.

The owner wants to invite AI companies to sponsor and to showcase their
products. Sequence matters: measurement (§3), then audience, then an offer.
Research what actually works for independent technical publications in 2026 —
sponsorship, newsletter, or something else — and be specific about numbers.

**Raise this risk explicitly, because it is the one that can destroy the asset.**
This blog's entire competitive position is that it grades its own evidence
honestly and corrects itself in public. Paid placement from AI companies, on a
blog that reviews AI companies, is exactly the arrangement that credibility dies
to. It is workable — with a disclosure policy, a firewall between sponsorship
and the editorial routines, and a standing rule that no sponsor is ever the
subject of a Case Study — but the policy has to be designed *before* the first
sponsor, not after. The owner should decide this consciously.

There is also no way to reach a returning reader today: no newsletter, no
subscription, nothing owned. For sponsorship, an owned list is usually worth
more than traffic.

### D. Review the machine (their items 3, 6, 7)

**Outcome:** the stack and the seven routines are examined by someone looking for
problems, and the owner gets a list of what is worth changing.

- **The stack** is deliberately minimal: Astro 5, no framework, no Tailwind, four
  dependencies. Treat that as a strength to preserve, not a gap to fill. The
  useful question is what is *missing* or *slow*, not what could be added.
- **The seven routine prompts** (`~/.claude/scheduled-tasks/`) have never had a
  review pass. Read them looking for contradictions, drift from the code, gaps,
  and rules that no longer earn their place. **Anthropic's own Fable 5 guidance
  is directly relevant here:** prompts and skills written for earlier models are
  often *too prescriptive* for Fable 5 and can degrade its output. These prompts
  are long and very prescriptive. Some of that is load-bearing — the claim
  ledger exists because two articles had to be corrected — and some is probably
  ceremony. Tell them apart rather than trimming indiscriminately.
- One known trap to check while in there: theme names are hardcoded in five
  places including every routine prompt, and a rename has already missed one.
- **Item 7 is an explicit invitation** to propose what the owner doesn't know to
  ask for. Take it seriously, and prefer ideas that exploit what already exists
  here over ideas that add new machinery.

---

## 5. Boundaries

- **Nothing publishes itself.** `Draft Status = Approved` is the owner's, always.
  No routine and no session may set it.
- **Published article text is not to be edited casually.** Any factual change
  goes through the claim ledger discipline in `docs/HANDOFF.md`, and corrections
  are made in public.
- **Do not relax the build assertions** — the 70/160 character caps and
  `check-build.mjs` have each caught real defects, including during the session
  that wrote this brief.
- **`docs/ARTWORK.md` may be revised deliberately, but not quietly contradicted.**
- Design direction, the logo, the AI-crawler posture, and the sponsorship policy
  are the owner's calls. Bring recommendations, not finished decisions.

---

## 6. State as of this brief

At `870ed15` on `main`. Working tree clean, build green, `check-build` passing,
11 pages, 5 published articles.

Just shipped: the rename to `wAIbi-sabi` with a `Wordmark` component, the logo
the owner has since rejected, the BSchool and Setups heading fixes, a rewrite of
`/blog/how-this-blog-builds-itself/`, and `/status/` corrected to show all five
themes instead of three.

**Still blocked on the owner** (re-checked 2026-08-26 via the API,
`can_approve_pull_request_reviews: false`): Actions cannot open pull requests, so
`publish-from-notion` still fails at its last step and **two finished articles
are stranded on the `notion/approved-articles` branch**. Settings → Actions →
General → Workflow permissions. Also still waiting: clicking Verify in Google
Search Console and Bing Webmaster Tools, and rating the 5 unrated radar ideas.

Read `docs/HANDOFF.md` for the system, the Notion control plane, the publish
pipeline and the hard-won gotchas; `docs/HANDOFF-NEXT-SESSION.md` for recent
state; `docs/PUBLISHING.md` and `docs/ARTWORK.md` before touching publishing or
images. `docs/LESSONS.md` is the running notes file — read it at the start of a
session and add to it as you learn.

---

## 7. Working agreement for Fable 5

Drawn from Anthropic's published guidance for this model. It differs from how
the earlier sessions on this repo were run, and the differences matter.

- **Take the whole brief, not one task at a time.** This model is at its best on
  long, multi-stranded, partly-ambiguous work. Scope it, say what you'd do in
  what order, then execute — don't wait to be handed each piece.
- **Act when you have enough to act.** Don't re-derive what the docs already
  establish, don't re-litigate settled decisions, and when weighing options give
  a recommendation rather than a survey.
- **Delegate aggressively and don't block.** Four of these threads are
  research-heavy and independent. Dispatch parallel subagents and keep working
  while they run. Per the repo's own token discipline: research subagents on
  Sonnet, one digested brief instead of every agent re-reading the same source,
  findings written to disk with short receipts returned. The owner authorises
  this in the prompt below, which satisfies the standing "don't spawn without
  asking" rule.
- **Verify with fresh eyes, on an interval.** Self-critique is weaker than a
  verifier subagent with clean context. Check your own work against the brief
  periodically, not just at the end.
- **Ground every progress claim in a tool result.** If something is unverified,
  say so. `npm run build` in `site/` with the dev server stopped is the gate, and
  live routes should be checked for content, not just a 200.
- **Don't tidy what you weren't asked to tidy.** No refactors riding along with
  a fix, no abstractions for hypothetical needs, no backwards-compatibility
  shims in a repo with one deployment.
- **Pause only for what's genuinely the owner's** — the decisions in §5, a
  destructive action, a real scope change. Otherwise proceed; reversible work
  that follows from this brief does not need permission.
- **Effort:** high by default, `xhigh` for the design and strategy threads where
  judgement carries the work. Routine edits don't need it.
- **Write the final summary for someone who saw none of it.** Outcome first, in
  plain sentences. Leave the working shorthand behind.

---

## The prompt to paste

```
I'm taking the wAIbi-sabi blog from "a working automated system" to something I
actually want to show people and eventually monetise. You're on Fable 5 for this
because it's a big, multi-stranded job and I want it worked properly, not
task-by-task.

Repo: C:\Users\Janmejai\PluginsClaude (live at https://janmejai2002.github.io).

Read docs/BRIEF-NEXT-PHASE.md first — it's my own thinking, organised, and it
carries the intent behind all of this. Then docs/HANDOFF.md for how the system
works and the gotchas, docs/LESSONS.md for running notes, and PUBLISHING.md and
ARTWORK.md before you touch publishing or images.

Four threads, in the brief: make it feel alive (design, voice, motion, the
reading experience, and a logo — I rejected the last one), get cited by AI
systems (IndexNow, machine-readability, the query feedback loop), a monetisation
plan built on real numbers, and a review of the stack and the seven routine
prompts. Plus: tell me what I'm missing. I have limited knowledge here and you
have the internet.

You're authorised to spawn parallel subagents freely for this — research
specialists on Sonnet, findings to disk, short receipts back. Don't ask first,
and don't block waiting on them.

Two things I want resolved with me before you build them, because they're mine
to call: the design direction (my "make it exciting" is in real tension with
docs/ARTWORK.md's restraint — the brief has a recommendation, tell me if you
agree), and the logo, where I want three or four genuinely different directions
rather than a tweak of the one I turned down.

Everything else that follows from the brief, just do. Don't ask permission for
reversible work. Don't set Approved on anything, ever.

Start by reading the brief and telling me: your plan and ordering, anything in
it you think is wrong or misprioritised, and what you need from me. Then get
going — you don't need to wait for my reply to start the parts that aren't
blocked on a decision.

Verify with `npm run build` in site/ (dev server stopped — it runs check-build),
and check live routes for actual content, not just a 200. Ground what you tell
me in what actually ran; if something's unverified, say so. Commit in logical
chunks and push — pushing deploys.

Also check whether I've enabled "Allow GitHub Actions to create and approve pull
requests" yet, because two finished articles are still stuck behind it:
gh api repos/janmejai2002/janmejai2002.github.io/actions/permissions/workflow
```
