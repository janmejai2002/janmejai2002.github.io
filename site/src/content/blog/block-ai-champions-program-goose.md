---
title: 'Block''s AI Champions Program: How 50 Engineers scaled AI internally'
description: 'Block turned 50 engineers into AI champions and saw AI-authored code jump 69% — but its layoff-linked productivity claims don''t hold up as well.'
pubDate: 2026-08-26
track: case-studies
question: 'Would an AI champions program actually get my engineering team to adopt coding agents?'
keywords:
  - AI champions program engineering
  - Block Goose AI agent
  - AI coding agent adoption program
  - AI coding agent productivity metrics
  - internal AI adoption software engineering
heroImage: '../../assets/art/block-ai-champions-program-goose-light.webp'
heroImageDark: '../../assets/art/block-ai-champions-program-goose-dark.webp'
heroAlt: 'A wide grid of faint outlined squares fills the frame, with about ten squares along a diagonal cluster filled in green and growing brighter toward the upper right, one of them rotated and shifted off the grid.'
readingTime: '9 min read'
notionId: '3c8ced67-050a-81dc-a451-d9810ff0adab'
---
<div class="tldr">

## Executive TL;DR

- In August 2025, Block picked 50 engineers whose repos covered roughly 60% of its codebase, gave each one 30% of their week, and told them to make their code legible to AI agents — not to write more code with AI themselves.
- Three months later, Block's engineering blog reported AI-authored code up 69%, self-reported time savings up 37%, and automated pull requests up 21x across those repos.
- By February 2026, CFO Amrita Ahuja told investors production code shipped per engineer was up "greater than 40%" since September — the same day Block cut about 4,000 jobs, roughly 40% of its workforce.
- The champions-program numbers are B-grade: a named cohort, a three-month window, defined metrics. The later per-engineer figures are C-and-D-grade: no published method, and one of them — 150% "since the start of the year" — spans a window that includes the layoffs themselves, so part of that number is arithmetic, not agentic.
- The transferable part isn't the layoffs. It's the mechanism: pay senior engineers in time, not bonuses, to make their own repos agent-ready, and measure repo readiness before you measure output.
- What it takes to try: a few dozen engineers who already own high-traffic repos, roughly a quarter of dedicated time, and a way to track PR provenance before you trust anyone's self-reported time savings.

</div>

## The situation

Block — the company behind Square, Cash App, Afterpay and Tidal — had been sitting on an internal AI agent called Goose since 2024. ML engineer Brad Axen built it as a side bet that agents, not chat windows, would end up doing the real work; by the time Dhanji Prasanna took over as Block's head of technology, Goose was one of seven or eight experimental projects competing for attention. It worked. The problem was everything around it.

Block's codebase wasn't built for an agent to walk into cold. Some monorepos run past 40,000 source files across 650-plus services, with build steps and tribal knowledge that live in senior engineers' heads rather than in any file an agent could read. Handing 3,000-plus engineers a licence to Goose, Cursor or Copilot doesn't fix that — an agent dropped into an undocumented repo either does nothing useful or does something confidently wrong. The bottleneck wasn't access to a coding agent. It was whether the repos themselves could be trusted with one.

## What they built

Block's answer was the Engineering AI Champions program, launched in August 2025 under Angie Jones, the company's VP of Engineering for AI Tools & Enablement. Fifty developers were pulled from across Square, Cash App, Afterpay, Tidal, Proto and the Platform org — frontend, backend, mobile, hardware, data engineering, infra — and given 30% of their time for one explicit job: make their repos safe for agents to operate in. Collectively, their repos covered about 60% of Block's code.

The program ran as a four-tier game, "Repo Quest," and each tier had a concrete engineering deliverable rather than a training checkbox. Locked-to-Novice meant writing an [AGENTS.md](http://agents.md/) with real build and test commands, plus a human-facing [HOWTOAI.md](http://howtoai.md/) explaining how the team actually wanted agents used. Novice-to-Adept meant building reusable "agent skills," wiring up automated PR review, and enabling headless agent runs that didn't need a human babysitting every step. Adept-to-Artisan meant PR-tracking labels, CI/CD integration, and contributing patterns back for other teams to reuse. Champions who hit the top tier weren't the ones who'd used an agent the most — they were the ones who'd made a repo other people's agents could succeed in.

On top of repo readiness, champions standardized on a context-engineering discipline called RPI — Research, then Plan, then Implement, in separate passes — borrowed from a technique popularized by HumanLayer, specifically to stop agents from drifting off a task the longer a session ran. In practice this produces a workflow that looks less like autocomplete and more like delegation: an agent picks up a well-scoped ticket from Linear or Jira, researches the relevant part of the codebase, writes a plan, opens a branch, writes the code, opens the PR, watches CI fail, and fixes its own mistakes before a human ever looks at it. One team reported pulling extra tickets into a sprint mid-cycle because agents had already burned through roughly 15 days' worth of engineering work in the time allotted.

Deliberately, Block didn't standardize on one tool early. Champions used Claude Code, Goose, Cursor, Copilot, Cline, AMP and Firebender side by side, because a mobile engineer's problems with an agent weren't a JVM backend engineer's, and forcing one tool would have hidden that. What actually spread adoption wasn't a mandate — it was peer example: watching a teammate "knock out a tedious migration in an afternoon" lands differently than a tutorial, as Jones put it. Partway through, Block open-sourced Goose itself, turning roughly 3,000 internal testers into a community north of 30,000, feeding hardening back into the tool the champions were standardizing repos around.

## What they claim

Three months after the champions program launched, Block's engineering blog reported AI-authored code up 69%, self-reported time savings up 37%, and automated PRs up 21x, measured across the champions' repos against their pre-program baseline.

Separately, on Goose more broadly, Prasanna told Sequoia's Training Data podcast that engaged engineers were saving 8 to 10 hours a week, that Block tracks "manual hours saved by AI" company-wide with a 25% target by year-end, and that in legacy codebases, engineers who'd adopted the tool were generating 30 to 40% of their code through it.

Then the numbers moved from an engineering blog to an earnings call. On February 26, 2026, alongside Q4 2025 results, CFO Amrita Ahuja told investors production code shipped per engineer was up "greater than 40%" since September. CEO Jack Dorsey argued "a significantly smaller team using the tools we are building can do more and do it better," pointing to a specific inflection: "something happened in December... the models just got an order of magnitude more capable." That same day, Block cut headcount from over 10,000 to just under 6,000 — roughly 4,000 roles, about 40% of the company. By the Q2 2026 call in August, Dorsey said code changes per engineer were up 150% since January, that a Block AI now touches "basically every single production code change or production code review," and that Square shipped 130 features in the first half of 2026, more than 3x the same period a year earlier. Separately, Ahuja told Fortune that gross profit per employee had climbed from $500,000 in 2019 to $750,000 in 2024 to $1 million in 2025, projected to reach $2 million in 2026, and framed the cuts as "not about bloat... about empowering our teams."

## How much to believe it

Grade these claims separately, because they don't deserve the same grade.

The champions-program numbers are the strongest evidence here: **B**. Block named the cohort (50 engineers, ~60% of the codebase), the window (three months from an August 2025 launch), and the metrics. What's missing is the measurement method — "AI-authored code" isn't defined (does a human-edited AI-drafted line still count?), and "reported time savings" is, by its own label, self-reported rather than instrumented. That's a real gap, but it's a gap in an otherwise concrete, falsifiable claim from the team that ran the program.

The "40% more production code per engineer" figure, and everything built on top of it, is **C and D**. No methodology has been published for what "production code" means or how it's counted per engineer. The September-to-February figure at least predates the layoffs, so it isn't explained away by headcount alone — but the number that came next isn't so clean. By the Q2 2026 call, Dorsey cited code changes per engineer up 150% "since the start of the year," a window that includes the February 26 headcount cut itself. Whether that denominator is a fixed January headcount, a rolling average, or the smaller post-cut roster was never said — and depending on which, some real fraction of that 150% is arithmetic, not agentic. A company looks far more productive per head simply by having fewer heads, with nothing about how the remaining work gets done actually changing. Fortune's own reporting on the story flagged the adjacent point directly — "research finds that AI adoption alone doesn't automatically translate to higher profits per employee — it demands a reimagining of how work gets done" — and noted that market conditions, product expansion and cost management were all in the mix too. No outside auditor has verified Block's internal code-volume metrics, and "lines shipped" or "PRs opened" are exactly the kind of productivity proxy that inflates once people know they're being measured on it. None of that makes the claim false. It makes it a claim a company facing hard questions about a mass layoff has every incentive to make, which is precisely when it deserves the most scrutiny, not the least.

## What you could apply

The part of this worth stealing has nothing to do with headcount. It's the shape of the pilot.

Pick a small group of senior engineers — Block used 50 out of thousands, but the ratio that matters is that they already owned your highest-traffic repos, not that they were the most enthusiastic volunteers. Give them real dedicated time, on the order of a quarter of their week, for a full quarter, and make the deliverable "can an agent safely operate in this repo" rather than "ship more with AI." That reframing is the whole trick: it turns a vague adoption push into a concrete engineering backlog — write the [AGENTS.md](http://agents.md/), wire up CI feedback an agent can read, document the test commands — that a skeptical senior engineer can actually respect.

This doesn't require a big team to start. Goose began as one engineer's side project plus a six-to-seven person team; the champions layer that scaled it was roughly 50 people at 30% time, on the order of 15 FTE-equivalents inside a company with thousands of engineers. What it does require, from day one, is instrumentation Block's public account doesn't clearly have: track whether a PR was agent-opened, agent-assisted or human-written, and its CI outcome, before trusting anyone's self-reported hours saved.

Where this stops transferring is the leap from "our engineers ship more" to "therefore we need fewer of them." That's a separate argument with its own evidence bar — cut headcount and then measure per-person output, and the two numbers are entangled by definition. Keep the adoption pilot and any headcount conversation as two separate arguments with separate evidence, or you'll end up making Block's least-defensible claim without Block's balance sheet to absorb it if you're wrong.

The realistic first step: run a Repo Quest-style tiering on three to five of your own highest-traffic repos for one quarter, track agent-PR merge rate and CI pass rate before and after, and only decide whether to scale once you have your own numbers — not Block's.

## Sources

**Primary:**

- [AI-Assisted Development at Block](https://engineering.block.xyz/blog/ai-assisted-development-at-block) — Block Engineering Blog, Angie Jones, VP Engineering, AI Tools & Enablement
- [Tools Aren't Enough: Scaling AI Adoption for Engineering Teams](https://angiejones.tech/tools-arent-enough-scaling-ai-adoption-for-engineering-teams/) — Angie Jones
- [Block (XYZ) Q4 2025 Earnings Call Transcript](https://www.fool.com/earnings/call-transcripts/2026/02/27/block-xyz-q4-2025-earnings-call-transcript/) — The Motley Fool, Feb 27, 2026
- [Block (XYZ) Q2 2026 Earnings Call Transcript](https://www.fool.com/earnings/call-transcripts/2026/08/12/block-xyz-q2-2026-earnings-call-transcript/) — The Motley Fool, Aug 12, 2026
- [Dhanji Prasanna: Transforming Block with Open Source Goose](https://sequoiacap.com/podcast/training-data-dhanji-prasanna) — Sequoia Capital, Training Data podcast

**Secondary:**

- [Block COO Amrita Ahuja on AI, layoffs, and gross profit per employee](https://fortune.com/2026/03/21/block-coo-amrita-ahuja-ai-layoffs-gross-profit-per-employee/) — Fortune, Mar 21, 2026
- [How Block Deployed AI Agents Company-Wide in 2 Months](https://www.aviator.co/podcast/block--ai-agents-goose) — Aviator

<!--
Artwork brief — from the writer routine. Draw per docs/ARTWORK.md,
then delete this comment.

**Argument in one sentence:** A champions program is infrastructure work disguised as adoption work — the payoff is making repos legible to agents, not the agents themselves.

**Geometry:** A wide, dim grid of small square repo-tiles, mostly uniform and untouched, with a scattered cluster of tiles rendered brighter and arranged in a rough diagonal climb (bottom-left to upper-right) suggesting the four-tier Locked→Novice→Adept→Artisan progression — a quest map drawn in code, not fantasy iconography.

**Accent:** moss, used sparingly, only on the brightest, most-advanced tiles — restraint is the point; most of the grid stays dim.

**Deliberate imperfection:** one bright tile near the top of the diagonal sits slightly off the grid alignment, tilted a few degrees from its neighbors — the one repo that got there by a different path than the pattern predicts.
-->
