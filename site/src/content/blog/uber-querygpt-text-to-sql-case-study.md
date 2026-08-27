---
title: 'Uber''s QueryGPT: text-to-SQL that scopes the schema before asking'
description: 'Uber''s QueryGPT turns plain-English questions into SQL by narrowing the schema first. What Uber actually published, and what transfers to your data team.'
pubDate: 2026-08-27
track: case-studies
question: 'Can natural-language-to-SQL work for my data team, and what makes it reliable enough to ship?'
keywords:
  - natural language to SQL
  - text-to-SQL enterprise
  - Uber QueryGPT
  - text-to-SQL accuracy
  - self-service analytics AI
  - LLM SQL generation
heroImage: '../../assets/art/uber-querygpt-text-to-sql-case-study-light.webp'
heroImageDark: '../../assets/art/uber-querygpt-text-to-sql-case-study-dark.webp'
heroAlt: 'A large grid of faint empty cells on the left narrows through two converging hairlines to a small outlined box on the right holding six solid squares in two rows, with a seventh square tilted and hanging past the lower border and a square-bracket mark beside it.'
readingTime: '8 min read'
notionId: '3c9ced67-050a-8131-a173-f662a3a1394d'
---
<div class="tldr">

## Executive TL;DR

- Uber built **QueryGPT**, an internal tool that converts plain-English questions into runnable SQL. It sits in front of a data platform that handles roughly **1.2 million interactive queries a month** (Uber Engineering, September 2024).
- The design decision worth copying: the system **narrows the problem before it writes anything**. An LLM "intent agent" routes each question to a curated *workspace* of vetted tables and example queries — the first version used just **7 core tables and 20 sample queries** — rather than exposing the model to Uber's full warehouse.
- Uber's published outcome figures: authoring a query drops from **"around 10 minutes" to "about 3 minutes"**; **~300 daily active users** in a limited release; **~78%** of those users said the generated queries reduced the time they would have spent writing SQL from scratch.
- What Uber did **not** publish: any accuracy rate. It describes an evaluation framework — intent match, table overlap, execution success — but reports no scores, and it openly admits the model still "generate[s] a query with tables that don't exist."
- **Evidence grade: C.** First-party claims with a named baseline but no measurement method. The widely-repeated "70% faster / 140,000 hours saved" numbers are *not* Uber's; they are downstream arithmetic.
- The transferable lesson: production text-to-SQL earns its reliability from **schema scoping and curated examples**, not from a bigger model.

</div>

## The situation

At Uber, an analyst asking "how many completed trips in São Paulo last week" does not struggle with SQL syntax. The struggle is knowing which of hundreds of thousands of tables holds that answer, and how Uber's internal data models encode a concept like "completed trip." That knowledge lives in a few people's heads and in tribal Slack threads.

The scale of the problem is specific. Uber's data platform serves "approximately 1.2 million interactive queries each month," written by engineers, operations managers, and data scientists. The Operations organization alone accounts for about 36% of them. Each query "can take around 10 minutes to author" — most of that spent finding the right tables and remembering the right joins, not typing.

QueryGPT began as a 2023 internal hackathon project and now sits inside Uber's existing query interface as an assistive layer. The function it targets is the one every data team recognizes: the standing queue of "can you pull me the numbers on…" requests that turns analysts into a translation service.

## What they built

QueryGPT is not a prompt wrapped around GPT-4. It is a multi-agent pipeline whose whole purpose is to hand the language model a small, relevant problem instead of a huge, ambiguous one. It runs on OpenAI's GPT-4 Turbo (model 1106, 128K context) with few-shot examples.

**Intent agent.** The first step is an LLM classifier that maps the user's question to one or more business domains, which Uber calls *workspaces*. There are 11-plus system workspaces — Mobility, Core Services, Ads, and so on — plus workspaces individual teams can build. Each workspace is a hand-curated bundle: a set of relevant tables and a set of example SQL queries known to be correct for that domain.

**This is the core move.** Rather than feeding the model Uber's entire schema and hoping it picks the right tables, the pipeline first decides *which small slice of the warehouse the question lives in*. The initial release used "7 tier 1 tables and 20 SQL queries" as its whole reference set. Narrow beats comprehensive.

**Retrieval.** Within the chosen workspace, a similarity search over a vector database pulls the most relevant sample queries and table schemas to use as few-shot context.

**Table agent.** The system proposes the specific tables it intends to use and shows them to the user, who can confirm or edit the list before any SQL is generated. This is the human checkpoint — it puts a person in the loop at the moment a wrong table would otherwise poison everything downstream.

**Column prune agent.** Uber's tables are wide. An LLM step strips columns judged irrelevant to the question, which keeps the prompt inside the context window and cuts latency.

**Output.** The user gets a SQL query plus a plain-English explanation of how it was constructed, so they can sanity-check the logic rather than just running it blind.

Uber also describes an evaluation harness: a manually curated set of golden question-to-SQL pairs drawn from real logs, scored on intent match, table overlap (0-1), whether the query runs, whether it returns rows, and an LLM-assigned similarity score against the golden SQL. Two test modes exist — *vanilla* (the full pipeline end to end) and *decoupled* (correct intent and tables injected, to isolate one component's performance).

## What they claim

The numbers Uber published, in its own words:

- **Time to author.** "Each query can take around 10 minutes to author." QueryGPT can "generate reliable queries in just about 3 minutes."
- **Adoption.** "With our limited release to some teams in Operations and Support, we are averaging about 300 daily active users, with about 78% saying that the generated queries have reduced the amount of time they would've spent writing it from scratch."

That is the complete set of outcome metrics in the post. There is no published accuracy rate, no execution-success percentage, no latency figure, and no stated time window for the daily-active-user average. The evaluation framework is described in detail; not one score from it is reported.

## How much to believe it

**Grade: C — first-party claim.** Uber is describing its own tool, names a baseline, and is unusually candid about the mechanism and the failure modes. But every headline number is an internal claim with no method attached, and the accuracy question — does the query return the *right* answer — is left blank.

What is missing, claim by claim:

- **"10 minutes" to "3 minutes."** A named before-and-after, which is more than most vendor posts offer. But we are not told how either figure was measured, across which queries, or by whom. There is no matched before/after study.
- **The 78%.** This is a satisfaction survey of a self-selected group inside a limited release. It measures whether people felt faster, not whether they were, and there is no control group.
- **The 300 daily active users.** The most solid figure here, because it is a straightforward usage count. It tells you adoption started in a pilot; with no denominator and no retention curve, it does not tell you the tool stuck.
- **Accuracy.** Uber states plainly that the model still produces "a query with tables that don't exist or with columns that don't exist on those tables," and that non-determinism means the same question can yield different SQL on different runs. No validation agent was shipped to catch this at the time of writing.

One number to actively distrust: the "70% faster" and "140,000 hours saved per month" figures that appear in many secondary write-ups are **not in Uber's post**. 140,000 hours is simply 1.2 million queries multiplied by the 7-minute saving, divided by 60 — arithmetic that assumes every query in the company runs through QueryGPT and each saves the maximum. The reported reality is roughly 300 users in a pilot.

What would raise this to a B: a before/after time study on matched queries, an execution-accuracy rate on a held-out set, and a usage-retention curve past the first weeks.

## What you could apply

**Who this is for:** data platform teams, analytics engineering leads, and anyone whose week is shaped by a backlog of ad-hoc data pulls.

**The transferable mechanism is scope reduction, and it is cheap.** Independent 2026 testing shows frontier models scoring above 85% on academic text-to-SQL benchmarks and collapsing toward 20% on real enterprise schemas with thousands of columns (Spider 2.0). Teams that claw their way back to roughly 75% do it the way Uber did: narrow the schema before the model sees it, supply vetted example queries as few-shot context, and force a human confirmation step before execution. None of that requires a frontier model or a large budget.

**A realistic pilot shape:**

1. Pick one team with heavy, repetitive query load. Uber started with Operations for a reason — high volume, recognizable patterns.
1. Curate one workspace: 10-30 core tables, 20-50 real sample queries with comments, and a short glossary mapping business terms to columns.
1. Put a table-confirmation step between selection and execution. Non-negotiable.
1. Log every generation next to the query the user actually ran after editing. Within a few weeks that log is both your few-shot library and your evaluation set.

**Cost and effort:** two to three engineers can stand up a retrieval-plus-few-shot prototype in a few weeks. The durable work is curation — someone has to own each workspace and keep it current as schemas drift. Fund that role explicitly or the tool decays.

**Where it stops transferring:** Uber has a large, fairly consistent internal data model and expert users who can spot a wrong query on sight. If your users cannot read the SQL, "3 minutes to a query" becomes "3 minutes to a confident wrong answer." The documented failure mode is the silent one — plausible output from a subtly wrong join — and it does not throw an error.

**First step:** instrument your current query tool to capture the natural-language intent people paste into ticket descriptions and the final SQL they ship. That paired corpus is the asset everything else is built on. Without it, you are guessing.

## Sources

- **[PRIMARY] Uber Engineering — "QueryGPT – Natural Language to SQL Using Generative AI,"** September 19, 2024. [https://www.uber.com/en-CA/blog/query-gpt/](https://www.uber.com/en-CA/blog/query-gpt/) — all figures on mechanism, the 1.2M monthly queries, 36% Operations share, 10-minute and 3-minute authoring times, ~300 daily active users, 78% user response, the multi-agent architecture, the evaluation framework, and the hallucination admission.
- AWS Machine Learning Blog — "Enterprise-grade natural language to SQL generation using LLMs: balancing accuracy, latency, and scale." [https://aws.amazon.com/blogs/machine-learning/enterprise-grade-natural-language-to-sql-generation-using-llms-balancing-accuracy-latency-and-scale/](https://aws.amazon.com/blogs/machine-learning/enterprise-grade-natural-language-to-sql-generation-using-llms-balancing-accuracy-latency-and-scale/) — context on why enterprise schemas break naive text-to-SQL.
- The Register — "LLMs fuel new generation of natural language query systems," April 22, 2026. [https://www.theregister.com/2026/04/22/llms_natural_langauge_systems_new/](https://www.theregister.com/2026/04/22/llms_natural_langauge_systems_new/) — benchmark-versus-production accuracy gap.
- Secondary extrapolations of the "70% / 140,000 hours" figure (cited to show it is not first-party): Wren AI newsletter, "How Uber is Saving 140,000 Hours Each Month Using Text-to-SQL"; multiple Medium write-ups. [https://medium.com/wrenai/how-uber-is-saving-140-000-hours-each-month-using-text-to-sql-and-how-you-can-harness-the-same-fb4818ae4ea3](https://medium.com/wrenai/how-uber-is-saving-140-000-hours-each-month-using-text-to-sql-and-how-you-can-harness-the-same-fb4818ae4ea3)

<!--
Artwork brief — from the writer routine. Draw per docs/ARTWORK.md,
then delete this comment.

**Argument in one sentence:** A language model only writes reliable SQL when you first hand it a small, curated slice of the database instead of the whole thing.

**Geometry:** A wide, dense grid of faint rectangles (the full warehouse) on the left, funnelling through a narrow aperture into a single small cluster of 5-7 solid, clearly bordered rectangles on the right (the workspace). A thin routing line enters the aperture carrying a plain-text label; a clean SQL bracket shape exits the cluster.

**Accent:** moss — used only on the small right-hand cluster and the exit bracket, everything else in neutral greys.

**Deliberate imperfection:** one rectangle in the curated cluster sits slightly misaligned and half-outside its border, hand-nudged, as a quiet nod to the tables-that-don't-exist failure mode.
-->
