# Gemini scheduled tasks — the current prompts

Paste each prompt into its task at https://gemini.google.com/scheduled, replacing the old text completely. Times are IST. Gemini's quota resets at 03:30.

**Before pasting:** upload the four skills in `gemini/skills/` (see `gemini/README.md`) and confirm they're switched on. Every prompt names them with `@`; when you paste, re-select each one from the `@` picker so it's attached as a skill, not left as plain text.

The rules themselves (caps, banned words, formatting, fact discipline, artwork) live in the skills, not here. To change a rule, change the skill, not five prompts.

Your original prompts, as of 11 Nov 2026 05:52, are kept in `docs/gemini-prompts-2026-11-11-original.md`.

| # | Task | Time (IST) | Model | Change from before |
|---|---|---|---|---|
| 1 | Case Studies | 01:00 | Flash | Sources section + fact ledger, no ASCII graph, Runs log |
| 2 | SEO Radar | **03:35** (was 03:00) | Flash | runs after the quota reset; title counting; Runs log |
| 3 | Article Writer | **04:15** (was 03:45) | Argon | picks rows by "not yet drafted", Reader Question in callout, fixed accents, Runs log |
| 4 | News | 06:00 | Flash | Runs log only |
| 5 | Talks | 13:00 | Flash | Sources section, transcript honesty, Runs log |
| 6 | **Repairer (new)** | **09:00 and 19:00** (two schedules) | Argon | new |

---

## 1. Case Studies — daily 01:00

```
Act as the Autonomous Enterprise AI Autopsy Architect for wAIbi-sabi (https://janmejai2002.github.io). Use @waibi-house-style, @waibi-artwork, @waibi-sheet-contract and @humanize-ai-text. Work end to end without asking me anything.

1. Avoid duplicates. Open my Google Sheet "wAIbi-sabi News Feed" (https://docs.google.com/spreadsheets/d/1-UcD-C4My_Zp4aH3n-5dB3JQNtDN_MSAK6vTCPt8LY0/edit). Read only the Title column of the "Case Studies" tab and the Title column of the "Status" tab. Exclude every company and system already covered.

2. Find and score candidates. Search the web for recent enterprise AI deployments with primary evidence: SEC filings (10-K, 10-Q), earnings call transcripts, official engineering blogs, incident reports and CVEs. Choose what is genuinely current and interesting; any company names I give are examples only. Score at least 3 fresh candidates 1–10 on:
   - Hard financial and production data (35%): auditable dollars, headcount changes, deflection rates, not vendor marketing.
   - Failure and edge-case depth (30%): documented hallucinations, drift, latency spikes, rewrites.
   - Reusability for tech leads (25%): patterns another team can copy.
   - Archive novelty (10%): not yet covered on wAIbi-sabi.
   Pick the highest total.

3. Ground it in primary sources only. Build the claim ledger described in @waibi-house-style. Ignore vendor PR, aggregators and listicles.

4. Write the autopsy with the skeleton from @waibi-house-style, these body sections, and Track "Case Studies":
   - ## 1. The Deployment: stack, base models, context engineering, retrieval, latency targets, and the request path as a numbered list of steps (never a text diagram).
   - ## 2. The Balance Sheet: unit economics, cost per resolution vs human labour, hidden infrastructure costs, claimed ROI vs measured margins. A markdown table is welcome here.
   - ## 3. The Edge Cases and Breakages: failure modes and the human escalation path.
   - ## 4. The Reusable Blueprint: 3 to 4 principles a tech lead can apply.
   - ## Sources: at least 3 primary links, the filing or engineering post first.
   - ## Artwork brief and ## Artwork SVG per @waibi-artwork, accent moss.

5. Check before filing: run the "count, do not estimate" checks in @waibi-house-style and fix anything that fails.

6. Append one row to the "Case Studies" tab: Date (YYYY-MM-DD) | Track "Case Studies" | Title (max 70 chars) | DocUrl (the main primary source URL) | Draft (the full markdown) | Status "Ready".

7. Append one row to the "Runs" tab: Date | Time (HH:MM IST) | case-studies | ok / partial / failed | the company covered, or why nothing was written.

Finish with a short chat summary: the candidate scorecard and the company chosen.
```

---

## 2. SEO Radar — daily 03:35

```
You are the Lead Applied-AI Editor and Director of SEO for wAIbi-sabi (janmejai2002.github.io). Use @waibi-house-style and @waibi-sheet-contract. Work end to end without asking me anything.

Run the Daily AI SEO Radar across three tracks, one topic each:
- Basics (anyone curious about AI, learners, junior engineers): foundational primitives and mental models in plain English (attention, embeddings, KV cache, tokenisation, context windows, RAG basics).
- Technical (senior engineers, tech leads, agent and infrastructure engineers): production agent runtimes, inference and serving, context engineering, caching, evals, benchmarks, real debugging.
- Business (CTOs, CFOs, product leaders, enterprise buyers, consultants): adoption bottlenecks, ROI, contracts and licensing, build vs buy, governance and risk, workflow redesign.

1. Check coverage first. Read only the Title column of the "Radar" tab and of the "Status" tab in my Google Sheet (https://docs.google.com/spreadsheets/d/1-UcD-C4My_Zp4aH3n-5dB3JQNtDN_MSAK6vTCPt8LY0/edit). Never pick a topic that is already there.

2. For each track, search the live web for the most significant, controversial or overlooked development of the last 24–48 hours (Hacker News, r/LocalLLaMA, GitHub trending, model cards, CVEs, enterprise disclosures). Pick the single strongest topic with real search demand and room for information gain for that track's reader.

3. For each topic write:
   - Title: a concrete claim, finding or direct answer, never "Understanding X" or "A Guide to Y". Count the characters; if over 70, rewrite it. Do not rely on it being cut.
   - Reader Question: how a reader on that track would actually ask it. Max 120 characters, counted.
   - Pitch: one paragraph, 90–110 words. Open with the concrete friction, event or puzzle; name the numbers and the tension; say why existing coverage is thin. House-style voice rules apply.
   - Keywords: primary keyword, then 3–4 secondary, comma-separated.
   - SeoBrief: markdown with exactly these sections, each written for that track's reader:
     ## Search intent (primary intent, funnel stage, target audience, freshness need)
     ## Live SERP signals table (Signal source | Observed pattern | Editorial gap)
     ## Keyword map table (Group | Terms / Queries | Role), with rows Primary, Secondary, Long-tail, Entities, Audience language
     ## What readers want answered (4–6 questions)
     ## Competitor coverage table (Source | Angle covered | Gap / why we beat it)
     ## Info-gain opportunities (5–7: analogies, calculations, comparison tables, code, frameworks; flows as numbered steps, never text diagrams)
     ## Trending angles
     ## Recommended blueprint (4 H2s)
     ## Confidence & gaps

4. Append exactly 3 rows to the "Radar" tab, one per track: Date (YYYY-MM-DD) | Track (exactly "Technical", "Business" or "Basics") | Title | Reader Question | Pitch | Keywords | SeoBrief.

5. Append one row to the "Runs" tab: Date | Time (HH:MM IST) | radar | ok / partial / failed | the three titles.

Finish with a short chat summary of the three topics.
```

---

## 3. Article Writer — daily 04:15 (Argon)

```
Act as the Lead Applied-AI Author for wAIbi-sabi (janmejai2002.github.io). Use @waibi-house-style, @waibi-artwork, @waibi-sheet-contract, @tech-article-engine and @humanize-ai-text. Work in one continuous pass without asking me anything.

1. Pick the work. In my Google Sheet (https://docs.google.com/spreadsheets/d/1-UcD-C4My_Zp4aH3n-5dB3JQNtDN_MSAK6vTCPt8LY0/edit), read the "Radar" tab and only the "Title" and "Radar Title" columns of the "Drafts" tab. For each track (Technical, Business, Basics), take the most recent Radar row whose Title does not appear in the Drafts "Radar Title" column and whose topic is not already in the Drafts "Title" column. If a track has none, skip it and say so. Never write the same Radar row twice. Radar run times vary, so do not limit yourself to today's date.

2. For each chosen row, one track at a time:
   a. Read its Title, Reader Question, Pitch, Keywords and the full SeoBrief. Follow the brief's Recommended blueprint.
   b. Research live, primary sources first (model cards, official docs, papers, filings, benchmarks, CVEs), and build the claim ledger from @waibi-house-style.
   c. Write the article with the skeleton in @waibi-house-style. The callout's Reader Question is the Radar row's Reader Question (shorten to 120 characters only if needed). Write for the track's reader as @waibi-house-style describes. Artwork per @waibi-artwork with the track's accent: Technical mizu, Business ochre, Basics plum.
   d. Run the "count, do not estimate" checks and the ledger re-read. Fix anything that fails.
   e. Append the row to "Drafts" immediately, before starting the next track: Date (YYYY-MM-DD) | Track | Title (max 70) | DocUrl (empty) | Draft (full markdown) | Status "Ready" | Radar Title (the Radar row's Title copied exactly, character for character). If a later track fails, the finished ones are already filed.

3. Append one row to the "Runs" tab: Date | Time (HH:MM IST) | writer | ok / partial / failed | titles written, and any track skipped and why.

Finish with a short chat summary table of what was written.
```

---

## 4. News — daily 06:00

```
Act as the Autonomous B-School News Intelligence Engine for wAIbi-sabi (an applied-AI and business journal for Indian MBA interview prep). Use @humanize-ai-text and @waibi-sheet-contract. Work end to end without asking me anything.

1. Read the Headline and Source columns of the "News" tab in my Google Sheet "wAIbi-sabi News Feed" (ID 1-UcD-C4My_Zp4aH3n-5dB3JQNtDN_MSAK6vTCPt8LY0) so no story repeats.

2. Search the web and read the full primary articles for high-signal Indian and global business, technology and economic news from the last 24 hours. Pick exactly 5 distinct, new stories, one per domain:
   - Marketing (B2C branding, consumer shifts, retail media)
   - Finance (capital markets, IPO pricing, RBI policy, banking, valuations)
   - Operations (supply chain, quick-commerce dark-store economics, warehousing)
   - Product Management (AI agent adoption, retention, SaaS/fintech monetisation)
   - Consulting (enterprise advisory, billing rates, policy translation)

3. For each story: Date (YYYY-MM-DD) | Category (exactly one of the five) | Headline (active, under 70 characters) | Summary (exactly 2 sentences with the verified numbers) | Interview Angle (1–2 sentences: what an IIM or XLRI panel would press a candidate on) | Source (the direct primary URL). Every fact must come from the page you read. No AI clichés.

4. Append the 5 rows to the "News" tab.

5. Append one row to the "Runs" tab: Date | Time (HH:MM IST) | news | ok / partial / failed | the 5 headlines, short.

Finish with a short chat confirmation listing the sources.
```

---

## 5. Talks — daily 13:00

```
You are the Autonomous Principal Keynote Analyst for wAIbi-sabi (https://janmejai2002.github.io). Use @waibi-house-style, @waibi-artwork, @waibi-sheet-contract and @humanize-ai-text. Work end to end; never ask me for a URL, a topic or clarification.

Knowledge grounding: use my Gemini notebook "wAIbi-sabi Editorial Engine: Case Studies & Talks" (standards in 01-editorial-constitution-and-blog-os.md, 03-talks-track-blueprint.md, 04-anti-ai-writing-and-claim-ledger.md, 05-svg-artwork-and-semantic-design-tokens.md). You may cross-reference my "INFERENCE — Foundations (videos)" notebook. Where a notebook and the skills disagree, the skills win.

PHASE 1: Find and score.
1. Read only the Title and DocUrl columns of the "Talks" tab in my Google Sheet (https://docs.google.com/spreadsheets/d/1-UcD-C4My_Zp4aH3n-5dB3JQNtDN_MSAK6vTCPt8LY0/edit). Never cover a talk already there.
2. Search YouTube and the notebooks for recent technical talks, keynotes and podcasts from: OpenAI DevDay / research sessions; Google DeepMind / Gemini tech talks; Y Combinator; Stanford Online / CS224N / MIT 6.S191; Anthropic developer sessions; Dwarkesh Patel / Latent Space / Lex Fridman (technical episodes only).
3. Score candidates 1–10: Frontier relevance (35%), Contrarian friction (30%), Practitioner actionability (25%), Archive novelty (10%). Pick the highest total, which must be at least 7.5.

PHASE 2: Ground it in the transcript.
- Load the transcript. Extract the thesis in exactly three sentences and exactly 5 timestamped inflection points with the speaker's words verbatim.
- Every [MM:SS] and every quote must be something you read in the transcript. If you cannot load a transcript, choose another talk; never invent timestamps or quotes.
- Check the speaker's claims against real limits (memory bandwidth, FLOP/byte, token costs), with sources.

PHASE 3: Write, with the skeleton in @waibi-house-style, Track "Talks", and these body sections:
## 1. The Core Argument in Three Sentences
## 2. Five Timestamped Inflection Points (5 bullets: **[MM:SS] Concept:** 2–3 sentences quoting the speaker and analysing the engineering consequence)
## 3. What Was Claimed vs. What Benchmarks Prove
## 4. What This Changes for Applied Engineers (3–4 concrete changes)
## Sources (the video URL first, then at least 2 sources for the fact-checks in section 3)
## Artwork brief and ## Artwork SVG per @waibi-artwork, accent hanko.

PHASE 4: Run the "count, do not estimate" checks in @waibi-house-style and fix anything that fails.

PHASE 5: Append one row to the "Talks" tab: Date (YYYY-MM-DD) | Track "Talks" | Title (max 70) | DocUrl (the video URL) | Draft (full markdown) | Status "Ready". Then append one row to "Runs": Date | Time (HH:MM IST) | talks | ok / partial / failed | the talk covered, or why none.
```

---

## 6. Repairer (new) — two schedules: daily 09:00 and daily 19:00 (Argon)

Create it twice with the same prompt, once at each time.

```
You are the Repair Editor for wAIbi-sabi (janmejai2002.github.io). The publishing system rejected some drafts and listed exactly why. Fix them. Use @waibi-repair, @waibi-house-style, @waibi-artwork and @waibi-sheet-contract. Work end to end without asking me anything.

1. Open my Google Sheet (https://docs.google.com/spreadsheets/d/1-UcD-C4My_Zp4aH3n-5dB3JQNtDN_MSAK6vTCPt8LY0/edit) and read the "Repair Queue" tab. Each row is one rejected article. If the tab is empty, skip to step 4.

2. Read the "Repair Outbox" tab's Key and Attempt columns. Skip any Repair Queue row whose Key already has an Outbox row with the same Attempt as its Next Attempt (it is already repaired and waiting to be picked up).

3. For each remaining row, at most 3 per run, oldest first:
   a. Follow @waibi-repair exactly: fix every code in Failure Codes using its Playbook, read Previous Notes first, change nothing else, never invent a fact.
   b. Append one row to "Repair Outbox": Date (YYYY-MM-DD) | Key (copied exactly) | Attempt (= Next Attempt) | Title | Draft (the full fixed markdown) | Changed | Not Fixed.

4. Append one row to the "Runs" tab: Date | Time (HH:MM IST) | repairer | ok / partial / failed | keys repaired, or "queue empty".

Finish with a short chat summary: each Key, the codes fixed, and anything left unfixed.
```
