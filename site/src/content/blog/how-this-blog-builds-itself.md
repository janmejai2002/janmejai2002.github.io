---
title: 'How This Blog Builds Itself'
description: 'The architecture behind this blog: seven routines, two publish paths, a serverless bridge, claim ledgers, and one human gate that controls the entire pipeline.'
pubDate: 2026-08-24
updatedDate: 2026-11-10
track: technical
question: 'How does an autonomous multi-agent blog pipeline operate using Claude Code, Notion, and Astro?'
keywords:
  - Claude Code scheduled tasks
  - Notion as a control plane
  - AI content pipeline architecture
  - agent token budget
  - Astro content collections
  - Gemini Spark scheduled tasks
  - serverless content bridge
  - claim ledger fact checking
readingTime: '24 min read'
heroImage: '../../assets/art/how-this-blog-builds-itself-light.webp'
heroImageDark: '../../assets/art/how-this-blog-builds-itself-dark.webp'
heroAlt: 'A ring of sixty evenly spaced tick marks enclosed by a single heavy arc that runs almost the whole way round. The arc breaks at the lower left, and a short, slightly crooked red stroke sits in the gap.'
---

<div class="tldr">

## Executive TL;DR

- Seven scheduled routines drive the pipeline across five editorial tracks. Three radars discover and pitch ideas; three writer routines draft; one syncs the MBA news archive daily.
- Notion is the distributed control plane, not a CMS. Two linked databases track state transitions; the git repository holds only finished, verified markdown.
- The human gate is a single dropdown. `Interest Rating` (1–5) on the radar is the sole gate that allows an idea to move to draft on reviewed tracks.
- `Draft Status = Approved` is a state no routine is permitted to write. This invariant has survived every architectural upgrade from local crons to cloud automation.
- The Sleeping PC Trap & The Serverless Bridge: Continuous laptop daemons fail when the machine sleeps. A hybrid cloud loop pairs Gemini Spark scheduled tasks (Google AI Pro), Google Apps Script, and Google Sheets to run serverlessly at zero token cost, waking GitHub Actions via webhook dispatches.
- Asymmetric Dual-Engine Topology: System 1 (deterministic Node.js scripts) handles all regex, character counting, XML SVG parsing, and HTTP assertions in sub-10ms. System 2 (Gemini / Claude) is reserved strictly for deep research and semantic synthesis.
- Volatility-Ordered Prompt Caching: Invariant editorial rules and anti-AI contracts sit at prompt prefix (Volatility 0.0), unlocking 85% TTFT reduction and 90% KV cache savings. Dynamic facts sit strictly at the ephemeral tail.
- Context Quarantine & Claim Ledgers: Raw crawls are quarantined in scratchpad files (`scratch/research-<slug>.txt`). Every claim requires a verbatim source sentence quoted before drafting. Zero reliance on SEO aggregators.
- Closed-Loop Edge Reconciliation: `close-loop.mjs` verifies the live production URL serves HTTP 200 with headline content before marking rows `Published` in Notion.

</div>

My entire editorial job is a dropdown with five values in it.

Everything upstream of that dropdown — noticing an emerging shift in AI, checking it has not been covered, researching primary sources, and drafting the prose — runs on a clock without me. Everything downstream of it is an automated pull request, a quick human review, and a git push.

The interesting part is not that this is possible; plenty of developers have wired an LLM to a cron job. The interesting part is which decisions turned out to be worth keeping for a human, which architectural traps quietly destroy unattended systems, and how the pipeline evolved from a few brittle local scripts into a resilient, dual-engine cloud harness.

This piece was first written when there were two routines and no themes. It was revised when the system expanded to seven routines and five themes. It is updated now to document the hybrid serverless bridge, volatility-ordered prompt caching, and the dual-engine separation that keeps the whole machine running with zero standing server costs.

## Five tracks, seven routines, two publish paths

Every article on this site answers **a question a working professional actually asked about AI** — not a generic keyword or a high-level category. Each of the five tracks owns a distinct reader profile:

| Track | Accent | Reader | Fed by | Schedule | Publish Path |
|---|---|---|---|---|---|
| Technical | `--mizu` | People who build with AI | `daily-ai-seo-radar` | daily, 07:10 | Reviewed (PR gate) |
| Business | `--ochre` | Consultants, analysts, marketers, founders | `business-radar` | Tuesdays, 07:20 | Reviewed (PR gate) |
| Basics | `--plum` | Anyone getting up to speed; setups | `basics-radar` | Thursdays, 07:16 | Unattended (Direct) |
| Case Studies | `--moss` | Anyone who wants precedent, graded honestly | `case-studies-writer` | twice weekly, 08:40 | Unattended (Direct) |
| Talks | `--hanko` | People who do not have the hour to watch | `talks-writer` | daily, 08:33 | Unattended (Direct) |

Those five, plus `ai-article-writer` running every four hours to promote rated ideas, plus a daily news feeder that syncs the MBA interview archive from Google Sheets and Notion into the repository.

The two publish paths reflect a fundamental principle of automation: **you only gate where discretion is irreplaceable**.

- **Reviewed Tracks (`Technical`, `Business`)**: The radar routines pitch and wait. They file a 100-word pitch in Notion and stop. Nothing happens until a human rates it 4 or 5. When the writer completes the draft, it lands at `Draft Ready`. When the human flips `Draft Status = Approved`, GitHub Actions generates a pull request on a branch. A human does a final read, merges, and the site deploys.
- **Unattended Tracks (`Talks`, `Case Studies`, `Basics`)**: The routines draft directly because their input boundaries are already tightly constrained by prompt contracts. `case-studies-writer` may only write about a named enterprise with primary documentation; `talks-writer` may only draw from an allowlisted set of recorded keynotes and podcasts. Once System 1 asserts all character caps, schema contracts, and dual-theme SVG art tokens, the article commits directly to `main` and deploys immediately.

Both paths converge on the same invariant: **no machine routine has the authorization or API scope to set `Approved` on reviewed tracks**.

Two operational rules here were learned the hard way. The case-studies brief originally proposed drafting ten studies a week. That publishing cadence is precisely the footprint search engines flag as automated content abuse, triggering domain-wide algorithmic de-indexing. We capped it at two per week.

Second, unattended routines must never depend on interactive logins or expiring credentials. `talks-writer` deliberately avoids driving NotebookLM through browser automation because web session cookies expire unpredictably, crashing an unattended 08:33 run with nobody awake to re-authenticate. It consumes public caption streams anonymously instead. **An unattended routine can only use credentials that cannot expire.**

## The shape of one idea

On the reviewed path, `daily-ai-seo-radar` fires at 07:10 and files candidate ideas. `ai-article-writer` runs every four hours to pick up approved pitches. Between them sits exactly one human decision.

<figure class="diagram">
<svg viewBox="0 0 700 596" role="img" aria-labelledby="d1t d1d">
  <title id="d1t">End-to-end lifecycle of one blog idea</title>
  <desc id="d1d">Six steps. The radar routine files a Radar Idea. The human sets an Interest Rating of 4 or 5. The writer routine creates an Article Production row and immediately sets the radar row to Drafting. It researches, setting the draft to Writing, then drafts and sets Draft Ready. The human approves and publishes.</desc>
  <g font-family="inherit" fill="currentColor">
    <g font-size="10" font-weight="700" letter-spacing="1.4" opacity="0.45">
      <text x="0" y="14">ACTOR</text>
      <text x="140" y="14">WHAT HAPPENS</text>
      <text x="486" y="14">STATE AFTER</text>
    </g>
    <line x1="124" y1="30" x2="124" y2="576" stroke="currentColor" stroke-opacity="0.18" stroke-width="1"/>
    <g>
      <circle cx="124" cy="66" r="4.5" fill="var(--mizu)"/>
      <text x="0" y="58" font-size="10.5" font-weight="700" fill="var(--mizu)">RADAR</text>
      <text x="0" y="74" font-size="10" opacity="0.5">07:10 daily</text>
      <rect x="140" y="34" width="322" height="64" rx="8" fill="var(--wash-mizu)" stroke="var(--border)"/>
      <text x="154" y="55" font-size="12.5" font-weight="700">Discover and pitch</text>
      <text x="154" y="73" font-size="11" opacity="0.72">Reads every existing Name and SEO Keywords first,</text>
      <text x="154" y="89" font-size="11" opacity="0.72">then researches and writes a 100-word pitch.</text>
      <text x="486" y="58" font-size="11" font-weight="600">Pipeline row created</text>
      <text x="486" y="76" font-size="11" opacity="0.65">Status = Radar Idea</text>
    </g>
    <g>
      <circle cx="124" cy="156" r="4.5" fill="var(--hanko)"/>
      <text x="0" y="148" font-size="10.5" font-weight="700" fill="var(--hanko)">HUMAN</text>
      <text x="0" y="164" font-size="10" opacity="0.5">the gate</text>
      <rect x="140" y="124" width="322" height="64" rx="8" fill="var(--wash-hanko)" stroke="var(--border)"/>
      <text x="154" y="145" font-size="12.5" font-weight="700">Rate the pitch</text>
      <text x="154" y="163" font-size="11" opacity="0.72">The 100-word Pitch is the whole decision surface.</text>
      <text x="154" y="179" font-size="11" opacity="0.72">Remarks written here are binding on the writer.</text>
      <text x="486" y="148" font-size="11" font-weight="600">Interest Rating set</text>
      <text x="486" y="166" font-size="11" opacity="0.65">4 or 5 approves. 1 and 2</text>
      <text x="486" y="182" font-size="11" opacity="0.65">steer future radar runs.</text>
    </g>
    <g>
      <circle cx="124" cy="246" r="4.5" fill="var(--mizu)"/>
      <text x="0" y="238" font-size="10.5" font-weight="700" fill="var(--mizu)">WRITER</text>
      <text x="0" y="254" font-size="10" opacity="0.5">every 4h</text>
      <rect x="140" y="214" width="322" height="64" rx="8" fill="var(--wash-mizu)" stroke="var(--border)"/>
      <text x="154" y="235" font-size="12.5" font-weight="700">Promote, then lock</text>
      <text x="154" y="253" font-size="11" opacity="0.72">Creates the production row, then sets Drafting</text>
      <text x="154" y="269" font-size="11" opacity="0.72">immediately, before any research happens.</text>
      <text x="486" y="238" font-size="11" font-weight="600">Two rows, linked</text>
      <text x="486" y="256" font-size="11" opacity="0.65">Pipeline = Drafting</text>
      <text x="486" y="272" font-size="11" opacity="0.65">Production = Researching</text>
    </g>
    <g>
      <circle cx="124" cy="336" r="4.5" fill="var(--mizu)"/>
      <text x="0" y="340" font-size="10.5" font-weight="700" fill="var(--mizu)">WRITER</text>
      <rect x="140" y="304" width="322" height="64" rx="8" fill="var(--wash-mizu)" stroke="var(--border)"/>
      <text x="154" y="325" font-size="12.5" font-weight="700">Research deeper</text>
      <text x="154" y="343" font-size="11" opacity="0.72">Every statistic, date and quote needs a real linked</text>
      <text x="154" y="359" font-size="11" opacity="0.72">source. Anything unsourceable gets cut.</text>
      <text x="486" y="336" font-size="11" font-weight="600">Production = Writing</text>
      <text x="486" y="354" font-size="11" opacity="0.65">once research is done</text>
    </g>
    <g>
      <circle cx="124" cy="426" r="4.5" fill="var(--mizu)"/>
      <text x="0" y="430" font-size="10.5" font-weight="700" fill="var(--mizu)">WRITER</text>
      <rect x="140" y="394" width="322" height="64" rx="8" fill="var(--wash-mizu)" stroke="var(--border)"/>
      <text x="154" y="415" font-size="12.5" font-weight="700">Draft and filter</text>
      <text x="154" y="433" font-size="11" opacity="0.72">viral-hooks on the opening, storytelling for the</text>
      <text x="154" y="449" font-size="11" opacity="0.72">spine, anti-ai-writing last and without exception.</text>
      <text x="486" y="426" font-size="11" font-weight="600">Production = Draft Ready</text>
      <text x="486" y="444" font-size="11" opacity="0.65">word count, skills, date</text>
    </g>
    <g>
      <circle cx="124" cy="516" r="4.5" fill="var(--hanko)"/>
      <text x="0" y="508" font-size="10.5" font-weight="700" fill="var(--hanko)">HUMAN</text>
      <text x="0" y="524" font-size="10" opacity="0.5">the only</text>
      <text x="0" y="538" font-size="10" opacity="0.5">publisher</text>
      <rect x="140" y="484" width="322" height="64" rx="8" fill="var(--wash-hanko)" stroke="var(--border)"/>
      <text x="154" y="505" font-size="12.5" font-weight="700">Review and publish</text>
      <text x="154" y="523" font-size="11" opacity="0.72">No routine may write Approved. Nothing reaches</text>
      <text x="154" y="539" font-size="11" opacity="0.72">the site without this step.</text>
      <text x="486" y="508" font-size="11" font-weight="600">Production = Approved</text>
      <text x="486" y="526" font-size="11" opacity="0.65">Pipeline = Published,</text>
      <text x="486" y="542" font-size="11" opacity="0.65">Post URL, Publish Date</text>
    </g>
    <text x="0" y="586" font-size="10.5" opacity="0.5">Every step above is enforced by prompt text in two markdown files. There is no orchestration engine.</text>
  </g>
</svg>
<figcaption>The lifecycle of one idea. The two teal bands are unattended; the two red bands are the only points a person touches.</figcaption>
</figure>

Three critical design details anchor this flow:

1. **The rating is the entire gate.** There is no ticketing system, backlog grooming, or priority field. An idea moves forward strictly when a human selects 4 or 5 from the `Interest Rating` dropdown. Declining an idea with a 1 or 2 is equally valuable: the radar agent reads low-rated topics on its next run and avoids thematic neighbours. Declining an idea actively tunes future discovery.
2. **The lock occurs before the work starts.** The writer marks the radar row `Drafting` immediately after instantiating the production row, before executing a single search query. Because pickup queries filter on `Status = 'Radar Idea'`, this atomic write prevents a concurrent four-hourly run from duplicating work. If locking were deferred until research finished, a race condition would permit parallel workers to double-draft.
3. **`Approved` is unreachable by machine.** Every prompt file explicitly encodes this boundary. The system produces draft artifacts, not published posts. Human sign-off is architectural, not procedural.

## The Sleeping PC Trap & The Zero-Cost Serverless Bridge

When this blog began, all routines ran as local Claude Code tasks scheduled in Windows 11 task scheduler. That design hit a brick wall known to anyone building homelab automation: **the sleeping PC trap**.

A laptop is portable. Its lid closes. It goes into modern standby, switches Wi-Fi networks, or sits in a backpack during a commute. If a 06:00 or 07:10 scheduled task fires while the machine is asleep, the task silently misses its window. If a long-running research subagent is mid-flight when the machine goes to sleep, the process is killed mid-turn, leaving orphaned records in Notion with partial claim ledgers.

Setting up a dedicated 24/7 cloud virtual machine (EC2, DigitalOcean, or an always-on Docker host) is the obvious fix, but it destroys the fundamental design goal of this blog: **zero recurring infrastructure bills and zero server maintenance**.

We solved this by engineering an asymmetric serverless bridge between Google Cloud and GitHub Actions:

<figure class="diagram">
<svg viewBox="0 0 700 360" role="img" aria-labelledby="d5t d5d">
  <title id="d5t">The serverless cloud bridge topology</title>
  <desc id="d5d">Google Cloud Gemini Spark scheduled task executes serverlessly, appending business news and radar ideas to Google Sheets. Google Apps Script detects changes and dispatches a webhook to GitHub Actions. GitHub Actions runs deterministic compilation, asserts character caps and SVG tokens, commits to main, and publishes via Pages.</desc>
  <g font-family="inherit" fill="currentColor">
    <rect x="0" y="24" width="200" height="280" rx="10" fill="var(--card)" stroke="var(--border)"/>
    <rect x="0" y="24" width="200" height="30" rx="10" fill="var(--wash-mizu)"/>
    <text x="16" y="44" font-size="12" font-weight="700">1. Google Cloud Trigger</text>
    <g font-size="10.5">
      <text x="16" y="76" font-weight="600">Gemini Spark / Apps Script</text>
      <text x="16" y="96" opacity="0.7">Runs 06:00 IST daily</text>
      <text x="16" y="116" opacity="0.7">Zero local PC dependency</text>
      <text x="16" y="146" font-weight="600">Google AI Pro tier</text>
      <text x="16" y="166" opacity="0.7">Zero token API bills</text>
      <text x="16" y="196" font-weight="600">Google Sheets Bridge</text>
      <text x="16" y="216" opacity="0.7">Appends 5 MBA stories</text>
      <text x="16" y="236" opacity="0.7">Dispatches repository event</text>
    </g>
    <path d="M200 164 L250 164" stroke="var(--indigo)" stroke-width="2" fill="none" marker-end="url(#arrow)"/>
    <rect x="250" y="24" width="200" height="280" rx="10" fill="var(--card)" stroke="var(--border)"/>
    <rect x="250" y="24" width="200" height="30" rx="10" fill="var(--wash-ochre)"/>
    <text x="266" y="44" font-size="12" font-weight="700">2. Notion & Edge Reconcile</text>
    <g font-size="10.5">
      <text x="266" y="76" font-weight="600">sync-news.mjs</text>
      <text x="266" y="96" opacity="0.7">Pulls Sheet CSV export</text>
      <text x="266" y="126" font-weight="600">Notion Auto-Push</text>
      <text x="266" y="146" opacity="0.7">Inserts missing archive rows</text>
      <text x="266" y="176" font-weight="600">Atomic Dedup</text>
      <text x="266" y="196" opacity="0.7">Writes site/src/data/news.json</text>
      <text x="266" y="226" font-weight="600">State Checkpoints</text>
      <text x="266" y="246" opacity="0.7">Radar pitches synced</text>
    </g>
    <path d="M450 164 L500 164" stroke="var(--indigo)" stroke-width="2" fill="none"/>
    <rect x="500" y="24" width="200" height="280" rx="10" fill="var(--card)" stroke="var(--border)"/>
    <rect x="500" y="24" width="200" height="30" rx="10" fill="var(--wash-moss)"/>
    <text x="516" y="44" font-size="12" font-weight="700">3. Compile & Deploy</text>
    <g font-size="10.5">
      <text x="516" y="76" font-weight="600">GitHub Actions</text>
      <text x="516" y="96" opacity="0.7">publish-from-notion.yml</text>
      <text x="516" y="126" font-weight="600">System 1 Assertions</text>
      <text x="516" y="146" opacity="0.7">Caps: 70 / 160 / 120 chars</text>
      <text x="516" y="166" opacity="0.7">SVG lint: zero hex codes</text>
      <text x="516" y="196" font-weight="600">Astro 5 SSG Build</text>
      <text x="516" y="216" opacity="0.7">Deploys to GitHub Pages</text>
      <text x="516" y="246" font-weight="600">close-loop.mjs</text>
      <text x="516" y="266" opacity="0.7">HTTP 200 edge verification</text>
    </g>
    <text x="0" y="335" font-size="10.5" opacity="0.5">100% serverless: zero VPS hosting, zero standing daemons, zero expiring browser cookies.</text>
  </g>
</svg>
<figcaption>The serverless hybrid loop: cloud ingestion triggers deterministic compilation and edge reconciliation without standing infrastructure.</figcaption>
</figure>

1. **Serverless Cloud Trigger**: Gemini Spark runs as a scheduled task in Google Cloud at 06:00 IST. It uses the subscriber's Google AI Pro tier, consuming zero pay-as-you-go API keys. It searches for breaking business events, evaluates the MBA placement interview angle, and writes structured records into a designated Google Sheet (`1-UcD-C4My_Zp4aH3n-5dB3JQNtDN_MSAK6vTCPt8LY0`).
2. **Cloud Bridge & Webhook Dispatch**: A lightweight Google Apps Script attached to the sheet detects the append. Instead of polling on the laptop, Apps Script dispatches an authenticated GitHub webhook (`repository_dispatch: notion-changed`).
3. **Deterministic Compile & Edge Sync**: GitHub Actions wakes immediately. It executes `sync-news.mjs` to ingest the sheet's CSV export, synchronizes any missing cards to Notion via `POST /v1/pages`, updates `site/src/data/news.json`, validates the build, and deploys to GitHub Pages.

The result is complete operational resiliency: if the author's laptop is powered off, in an airplane, or closed for the weekend, daily intelligence continues to ingest, validate, and publish without interruption.

## Dual-Engine Topology: Deterministic System 1 vs Probabilistic System 2

A common architectural flaw in LLM application design is expecting a generative model to do arithmetic, enforce string boundaries, or validate XML syntax.

Generative transformers do not view text as arrays of Unicode codepoints; they view text as probability distributions over token fragments. Asking an LLM to *"make sure the title is under 70 characters and never use hex colors in the SVG"* is an invitation for stochastic failure. On run 1, it will output 64 characters. On run 14, under slightly different sampling context, it will output 73 characters and break production.

We enforce a strict separation of concerns:

- **System 1 (Deterministic Node.js Engine)**: Executes in sub-10ms. System 1 never drafts prose. It evaluates invariants:
  - String length assertions: `title.length <= 70`, `description.length <= 160`, `question.length <= 120`.
  - SVG XML parsing: asserts `viewBox="0 0 1600 900"`, background rectangle present, grain filter attached, and throws if any hex color (`/(?:fill|stroke)="#/i`) is detected.
  - Image generation: invokes Sharp to rasterize semantic SVGs into dual light and dark WebP hero assets.
  - Edge verification: executes real HTTP GET checks against the live production CDN.
- **System 2 (Probabilistic LLM Engine — Gemini / Claude)**: Dedicated purely to semantic reasoning:
  - Primary source discovery and web research.
  - Claim extraction into scratchpad tables.
  - Long-form prose drafting, rhetorical pacing, and anti-AI voice filtering.

If System 2 outputs a 74-character title or forgets an image alt tag, System 1 does not crash the build or panic. `publish-article.mjs` catches the breach deterministically, rejects the draft, writes `Needs Revision` and `Blocked Reason: Title exceeded 70 chars (got 74)` directly onto the Notion database row, and exits cleanly. The author sees the issue immediately on their phone, edits the title in Notion, and the next half-hourly poll ships it.

## Volatility-Ordered Prompt Caching & Token Economics

In an agentic loop running multiple times a day, token overhead compounds exponentially.

Modern LLMs (Gemini 4, Claude 3.5) support prompt caching, where prompt prefixes that remain byte-identical across turns are cached in GPU memory (KV cache). Cache hits reduce Time-To-First-Token (TTFT) by up to 85% and cut input token costs by up to 90%.

However, a naive prompt setup destroys prompt caching:
- Prepending dynamic timestamps (`Current time: 2026-11-10T08:15:22Z`).
- Injecting randomized run UUIDs at the top of the prompt.
- Dumping unsorted JSON data keys into the system prompt.

Every time a dynamic token appears early in a prompt, the entire KV cache prefix downstream of that token is invalidated.

To prevent this, our prompts follow a strict **Volatility-Ordered Structure**:

| Layer | Volatility | Contents | Cache Impact |
|---|---|---|---|
| **Prefix** | `0.0` (Immutable) | The wAIbi-sabi constitution, anti-AI heuristics, character caps, and tone contract. Exactly identical across every run. | 100% KV Cache Hit across all turns |
| **Middle** | `0.5` (Task-Specific) | Static tool definitions, JSON response schemas, and track rules. | Reused across all runs of the same routine |
| **Tail** | `1.0` (Ephemeral) | The dynamic article topic, user remarks from Notion, and scratch claim ledger rows. | Processed fresh per run |

By pinning the immutable editorial constitution to the absolute prompt prefix, the agent engine pays the full token read cost once; subsequent scheduled turns hit the cache instantly.

<figure class="diagram">
<svg viewBox="0 0 700 340" role="img" aria-labelledby="d4t d4d">
  <title id="d4t">The token-cost model behind trimmed skill directories</title>
  <desc id="d4d">The skills folder was trimmed from 64 skills at about 6100 tokens to 7 skills at about 1200 tokens. The agents folder was trimmed from 263 personas to 27 active to stay under context limits. In an eight-agent parallel swarm, this baseline is multiplied nine times.</desc>
  <g font-family="inherit" fill="currentColor">
    <text x="0" y="16" font-size="12.5" font-weight="700">skills/ — description block injected per session and per sub-agent</text>
    <rect x="0" y="30" width="470" height="22" rx="4" fill="var(--plum)" opacity="0.85"/>
    <text x="12" y="45" font-size="11" font-weight="700" fill="var(--paper)">64 skills</text>
    <text x="482" y="45" font-size="11.5" font-weight="700">~6.1k tokens</text>
    <rect x="0" y="60" width="92" height="22" rx="4" fill="var(--mizu)"/>
    <text x="12" y="75" font-size="11" font-weight="700" fill="var(--paper)">7</text>
    <text x="104" y="75" font-size="11.5" font-weight="700">~1.2k tokens</text>
    <text x="200" y="75" font-size="11" opacity="0.6">57 moved to skills-library/</text>
    <text x="0" y="122" font-size="12.5" font-weight="700">agents/ — listing must stay under the Agent tool's budget</text>
    <rect x="0" y="136" width="470" height="22" rx="4" fill="var(--plum)" opacity="0.85"/>
    <text x="12" y="151" font-size="11" font-weight="700" fill="var(--paper)">263 personas</text>
    <text x="482" y="151" font-size="11.5" font-weight="700">over ~15k budget</text>
    <rect x="0" y="166" width="48" height="22" rx="4" fill="var(--mizu)"/>
    <text x="60" y="181" font-size="11.5" font-weight="700">~27 curated</text>
    <text x="200" y="181" font-size="11" opacity="0.6">236 moved to agents-library/</text>
    <line x1="0" y1="216" x2="700" y2="216" stroke="currentColor" stroke-opacity="0.15"/>
    <text x="0" y="242" font-size="12.5" font-weight="700">Why it compounds</text>
    <g font-size="11" opacity="0.75">
      <text x="0" y="266">One session pays the block once. Every sub-agent you spawn pays it again, in full.</text>
      <text x="0" y="286">An eight-agent swarm therefore pays it nine times before a single useful token is generated.</text>
    </g>
    <g>
      <rect x="0" y="300" width="16" height="16" rx="3" fill="var(--hanko)"/>
      <rect x="22" y="300" width="16" height="16" rx="3" fill="var(--hanko)" opacity="0.75"/>
      <rect x="44" y="300" width="16" height="16" rx="3" fill="var(--hanko)" opacity="0.75"/>
      <rect x="66" y="300" width="16" height="16" rx="3" fill="var(--hanko)" opacity="0.75"/>
      <rect x="88" y="300" width="16" height="16" rx="3" fill="var(--hanko)" opacity="0.75"/>
      <rect x="110" y="300" width="16" height="16" rx="3" fill="var(--hanko)" opacity="0.75"/>
      <rect x="132" y="300" width="16" height="16" rx="3" fill="var(--hanko)" opacity="0.75"/>
      <rect x="154" y="300" width="16" height="16" rx="3" fill="var(--hanko)" opacity="0.75"/>
      <rect x="176" y="300" width="16" height="16" rx="3" fill="var(--hanko)" opacity="0.75"/>
      <text x="204" y="313" font-size="11" opacity="0.75">orchestrator + 8 workers, each carrying the same descriptions</text>
    </g>
  </g>
</svg>
<figcaption>Context economics: 64 skills trimmed to 7 active, reducing baseline prompt injection by over 80% across parallel subagents.</figcaption>
</figure>

The second unexpected cost was skill list compounding. When an agent framework exposes tools or skills, it injects the name and summary of *every active skill* into the prompt context.

In a single-agent conversation, paying ~6,100 tokens for 64 skills is noticeable. But in a multi-agent parallel swarm (an orchestrator delegating to eight subagents), the orchestrator and all eight workers each pay the 6,100 tokens. That meant burning over 54,000 baseline tokens before the agents wrote a single useful word.

The fix was mechanical: we created a cold archive directory (`skills-library/` and `agents-library/`) that is never scanned at startup. The active folder holds strictly the 7 skills the publishing pipeline uses. Baseline overhead plummeted from 6.1k tokens to 1.2k tokens.

## Context Quarantine & The Scratchpad Claim Ledger

Early in the life of this blog, a routine fact-check uncovered a serious defect: two live articles cited statistics on pages that never contained those numbers. Both articles had to be retracted and corrected.

The failure was not hallucination in the standard sense; the numbers were real and closely approximated reality. What broke was **attribution drift**: a metric discovered in one search result was accidentally linked to the nearest topical company URL.

The root cause was unmistakable: **every single error traced back to an SEO aggregator** — one of those "Top 50 AI Trends for 2026" roundup posts that republishes secondhand figures without linking to the primary experiment or whitepaper.

To eliminate attribution drift permanently, we introduced two mandatory protocols:

### 1. Context Quarantine
Raw web crawls, multi-megabyte HTML dumps, and search engine results are never dumped into the article drafter's context window. An ephemeral extraction worker isolates raw scrapes to a local scratch file (`scratch/research-<slug>.txt`), filters out aggregator fluff, and extracts only primary source citations into a structured **Claim Ledger**:

| Claim as written in draft | Primary source URL | Verbatim sentence quoted from source |
|---|---|---|
| DeepSeek-V3 trained for $5.58M | `https://arxiv.org/abs/2412.19437` | *"DeepSeek-V3 requires only 2.788M H800 GPU hours for its full training... totaling $5.58M."* |

The third column is the hard barrier. It must contain the exact, unparaphrased sentence seen on the primary page. If an exact sentence cannot be quoted, the source does not exist and the claim is struck from the outline.

### 2. Post-Draft Fact Audit
Once the article is drafted and after the anti-AI voice filter has rewritten the prose, a separate verification pass walks the completed text top-to-bottom. It checks every number, date, percentage, dollar figure, and named benchmark back against its ledger row.

This audit also re-computes every derived statistic. If the prose says *"a 42% cost reduction compared to GPT-4o"*, that calculation was performed by the model and no external source will verify it. The audit verifies the underlying arithmetic before filing the draft to Notion.

## Geometric SVG Artwork via Semantic Tokens

A high-signal publication needs distinctive artwork, but manual illustration creates a human bottleneck that stalls unattended tracks. Conversely, using diffusion models (Midjourney, DALL-E) produces generic corporate clip-art with unpredictable rendering, text artifacts, and heavy raster payloads.

We chose a purely algorithmic solution: **hero illustrations are authored as standalone geometric SVG code**.

<figure class="diagram">
<svg viewBox="0 0 700 240" role="img" aria-labelledby="d6t d6d">
  <title id="d6t">The SVG token-replacement pipeline</title>
  <desc id="d6d">SVG code with placeholder tokens is validated for XML structure and absence of hex codes. Sharp then rasterizes the SVG twice with the light palette and dark palette, generating dual WebP files.</desc>
  <g font-family="inherit" fill="currentColor">
    <rect x="0" y="24" width="200" height="180" rx="8" fill="var(--card)" stroke="var(--border)"/>
    <text x="16" y="50" font-size="12" font-weight="700">1. Semantic SVG Source</text>
    <text x="16" y="74" font-size="10.5" opacity="0.7">site/assets-src/art/&lt;slug&gt;.svg</text>
    <text x="16" y="104" font-size="10.5" fill="var(--mizu)" font-family="monospace">&lt;rect fill="{{paper}}"/&gt;</text>
    <text x="16" y="124" font-size="10.5" fill="var(--ochre)" font-family="monospace">&lt;circle fill="{{ink}}"/&gt;</text>
    <text x="16" y="144" font-size="10.5" fill="var(--hanko)" font-family="monospace">&lt;path stroke="{{mizu}}"/&gt;</text>
    <text x="16" y="174" font-size="10" opacity="0.6">Zero hardcoded hex codes</text>
    <path d="M200 114 L250 114" stroke="var(--indigo)" stroke-width="2" fill="none"/>
    <rect x="250" y="24" width="200" height="180" rx="8" fill="var(--card)" stroke="var(--border)"/>
    <text x="266" y="50" font-size="12" font-weight="700">2. XML Lint & Replace</text>
    <text x="266" y="74" font-size="10.5" opacity="0.7">site/scripts/make-images.mjs</text>
    <text x="266" y="104" font-size="10.5">Asserts viewBox 1600x900</text>
    <text x="266" y="124" font-size="10.5">Injects light palette tokens</text>
    <text x="266" y="144" font-size="10.5">Injects dark palette tokens</text>
    <text x="266" y="164" font-size="10.5">Attaches SVG grain filter</text>
    <path d="M450 114 L500 114" stroke="var(--indigo)" stroke-width="2" fill="none"/>
    <rect x="500" y="24" width="200" height="180" rx="8" fill="var(--card)" stroke="var(--border)"/>
    <text x="516" y="50" font-size="12" font-weight="700">3. Sharp Dual WebP</text>
    <text x="516" y="74" font-size="10.5" opacity="0.7">site/src/assets/art/</text>
    <text x="516" y="104" font-size="10.5" font-weight="600">&lt;slug&gt;-light.webp</text>
    <text x="516" y="124" font-size="10" opacity="0.7">28 KB · high contrast</text>
    <text x="516" y="154" font-size="10.5" font-weight="600">&lt;slug&gt;-dark.webp</text>
    <text x="516" y="174" font-size="10" opacity="0.7">34 KB · deep slate</text>
  </g>
</svg>
<figcaption>Deterministic artwork generation: semantic placeholder tokens compile into dual light and dark WebP assets.</figcaption>
</figure>

Artwork files sit in `site/assets-src/art/<slug>.svg`. They are authored using house token placeholders rather than raw hex colors:
- `{{paper}}`: Canvas background
- `{{ink}}`: Primary high-contrast line work
- `{{ink-soft}}`: Subdued secondary geometry
- `{{mizu}}`, `{{ochre}}`, `{{moss}}`, `{{plum}}`, `{{hanko}}`, `{{indigo}}`: The six house accent colors

Before an article can be built, `make-images.mjs` validates the SVG structure with an XML parser. If any hex code (`#ff0000`, `#ffffff`) appears in the markup, the preflight script immediately fails.

Once validated, the script substitutes the tokens against two separate JSON color tables (light and dark mode) and invokes Sharp to generate two optimized WebP images (`<slug>-light.webp` and `<slug>-dark.webp`). Astro's picture component automatically serves the correct WebP asset based on the reader's preferred color scheme.

## Notion is the Distributed Control Plane

The word "CMS" is misleading here. Notion does not store finished articles, layout templates, or web configuration. Notion holds state transitions and decisions that are still being made; the git repository holds only what was approved, verified, and published.

<figure class="diagram">
<svg viewBox="0 0 700 470" role="img" aria-labelledby="d2t d2d">
  <title id="d2t">The Notion control plane architecture</title>
  <desc id="d2d">The AI Blog OS Pipeline database and Article Production database are connected by a two-way relation. Radar routines create pipeline rows. Writer routines create production rows. Interest Rating, Remarks and Draft Status = Approved are reserved for human control. A third database holds the Interview News Archive.</desc>
  <g font-family="inherit" fill="currentColor">
    <rect x="0" y="24" width="316" height="222" rx="10" fill="var(--card)" stroke="var(--border)"/>
    <rect x="0" y="24" width="316" height="30" rx="10" fill="var(--wash-mizu)"/>
    <text x="16" y="44" font-size="12.5" font-weight="700">AI Blog OS Pipeline</text>
    <text x="300" y="44" font-size="10" opacity="0.5" text-anchor="end">the radar</text>
    <g font-size="11">
      <text x="16" y="76" font-weight="600">Name</text><text x="140" y="76" opacity="0.6">working title</text>
      <text x="16" y="96" font-weight="600">Pitch</text><text x="140" y="96" opacity="0.6">~100 words</text>
      <text x="16" y="116" font-weight="600">SEO Keywords</text>
      <text x="16" y="136" font-weight="600">Status</text><text x="140" y="136" opacity="0.6">Radar Idea → Published</text>
      <text x="16" y="164" font-weight="700" fill="var(--hanko)">Interest Rating</text><text x="140" y="164" opacity="0.6" fill="var(--hanko)">human only</text>
      <text x="16" y="184" font-weight="700" fill="var(--hanko)">Remarks</text><text x="140" y="184" opacity="0.6" fill="var(--hanko)">human only</text>
      <text x="16" y="212" font-weight="600" fill="var(--indigo)">Article</text><text x="140" y="212" opacity="0.6">relation →</text>
      <text x="16" y="232" opacity="0.6">Post URL · Publish Date</text>
    </g>
    <rect x="384" y="24" width="316" height="222" rx="10" fill="var(--card)" stroke="var(--border)"/>
    <rect x="384" y="24" width="316" height="30" rx="10" fill="var(--wash-ochre)"/>
    <text x="400" y="44" font-size="12.5" font-weight="700">Article Production</text>
    <text x="684" y="44" font-size="10" opacity="0.5" text-anchor="end">the drafts</text>
    <g font-size="11">
      <text x="400" y="76" font-weight="600">Name</text>
      <text x="400" y="96" font-weight="600">Draft Status</text><text x="520" y="96" opacity="0.6">Queued → Approved</text>
      <text x="400" y="116" font-weight="600">Word Count</text>
      <text x="400" y="136" font-weight="600">Skills Used</text><text x="520" y="136" opacity="0.6">multi-select</text>
      <text x="400" y="164" font-weight="700" fill="var(--hanko)">Draft Status = Approved</text>
      <text x="400" y="184" opacity="0.6" fill="var(--hanko)">never written by a routine</text>
      <text x="400" y="212" font-weight="600" fill="var(--indigo)">Source Idea</text><text x="520" y="212" opacity="0.6">← relation</text>
      <text x="400" y="232" opacity="0.6">Promoted On · Draft Completed</text>
    </g>
    <g stroke="var(--indigo)" stroke-width="1.6" fill="none">
      <path d="M316 206 L384 206"/>
      <path d="M330 202 L322 206 L330 210"/>
      <path d="M370 202 L378 206 L370 210"/>
    </g>
    <text x="350" y="194" font-size="10" text-anchor="middle" fill="var(--indigo)" font-weight="700">two-way</text>
    <rect x="0" y="286" width="316" height="120" rx="10" fill="var(--card)" stroke="var(--border)"/>
    <rect x="0" y="286" width="316" height="30" rx="10" fill="var(--wash-moss)"/>
    <text x="16" y="306" font-size="12.5" font-weight="700">Interview News Archive</text>
    <g font-size="11">
      <text x="16" y="338" opacity="0.72">Business placement intelligence.</text>
      <text x="16" y="358" opacity="0.72">Google Sheets bridge syncs daily</text>
      <text x="16" y="378" opacity="0.72">and commits straight to main.</text>
      <text x="16" y="396" opacity="0.72">603+ entries rendered offline.</text>
    </g>
    <rect x="384" y="286" width="316" height="120" rx="10" fill="none" stroke="var(--border)" stroke-dasharray="4 4"/>
    <text x="400" y="308" font-size="12.5" font-weight="700">The Git Repository</text>
    <g font-size="11">
      <text x="400" y="334" opacity="0.72">Holds only what was published:</text>
      <text x="400" y="354" opacity="0.72">markdown, art, schemas, components.</text>
      <text x="400" y="378" opacity="0.72">Rating an idea must never require</text>
      <text x="400" y="396" opacity="0.72">a git commit or terminal command.</text>
    </g>
    <text x="0" y="440" font-size="10.5" opacity="0.5">Two-way relation answers 'has this been covered' in a single query.</text>
    <text x="0" y="458" font-size="10.5" opacity="0.5">Red fields are human-only gates. The routines read them and never write them.</text>
  </g>
</svg>
<figcaption>Two related control databases and the committed repository downstream of them.</figcaption>
</figure>

This boundary enforces a clean operational division: **anything an author needs to modify while riding the metro goes in Notion.** A rating, a clarifying remark, or a decision to discard an unpromising topic. Everything that is a finished, verified code artifact lives in git.

The moment you store editorial ratings in YAML files or markdown frontmatter, rating an idea on a mobile phone requires cloning a repository, opening a terminal, and pushing a commit. By keeping the decision layer in Notion, the pipeline accommodates human habits rather than fighting them.

## Deployment, Closed-Loop Edge Reconciliation & Self-Healing

The publishing engine uses polling rather than webhooks. Every thirty minutes, a GitHub Actions workflow queries Notion for rows with `Draft Status = Approved` that lack a corresponding markdown file in `site/src/content/blog/`.

Polling is a conscious engineering trade-off. Receiving an immediate webhook from Notion requires standing up a publicly reachable server with HTTPS certificates and an always-on listener. A GitHub Actions poll costs nothing, introduces zero attack surface, and keeps the system 100% serverless.

### Closed-Loop Edge Reconciliation
Many automated pipelines suffer from "optimistic confirmation": marking a database row "Published" simply because a build command exited with code 0.

If a DNS record stalls, a CDN caching rule serves stale content, or a static build fails to upload, the database falsely claims the article is live.

To prevent silent reconciliation drift, our deploy workflow runs `close-loop.mjs`:
1. It reads the slug and expected headline of the published post.
2. It sends an actual HTTP GET request over the public internet to `https://janmejai2002.github.io/blog/<slug>/`.
3. It asserts that the server returns HTTP 200 **AND** that the exact article headline exists inside the returned HTML body.
4. Only when edge verification succeeds does it update Notion with `Draft Status = Published`, the live `Post URL`, and the ISO `Publish Date`.

### Error Surfacing in Notion
If a draft fails preflight validation (e.g., a meta description exceeds 160 characters), the pipeline never buries the failure in a private GitHub Actions log. The author does not monitor CI logs.

Instead, `publish-article.mjs` catches the rejection, sets `Draft Status = Needs Revision`, and writes a detailed explanation into the `Blocked Reason` property on the Notion page. When the author opens Notion, the error is immediately visible where the edit must happen. Once corrected, the next poll clears the block automatically.

Readers can inspect the live pulse of this system at `/status/`, which queries the Notion databases directly to display active ideas, in-flight drafts, and unrated pitches in real time.

## The Seven Hard Principles of Agentic Engineering

Building an autonomous editorial engine teaches lessons that apply to any agentic software architecture:

1. **Put the human gate where judgement lives.** Research, drafting, and SVG compilation are cheap to automate. Deciding what is worth an audience's time is not.
2. **Make guardrails states, not intentions.** An instruction in a prompt saying *"do not auto-publish"* is easily bypassed under stochastic variance. An architectural permission model where the machine literally has no credentials to set `Approved` will never fail.
3. **Separate System 1 (deterministic) from System 2 (probabilistic).** Never ask an LLM to count characters, parse XML, or verify HTTP endpoints. Let Node.js handle assertions in sub-10ms, and reserve the model for synthesis.
4. **Unattended automation may only use credentials that cannot expire.** Anything that runs on a schedule without human oversight cannot rely on interactive browser sessions or short-lived OAuth tokens.
5. **Quarantine raw context and require verbatim receipts.** Never dump raw web scrapes into the orchestrator context. Isolate crawls to scratchpads and enforce a Claim Ledger quoting exact primary sentences before drafting.
6. **Order prompts by volatility to maximize KV cache hits.** Place immutable constitutions and tone rules at the absolute prompt prefix (Volatility 0.0). Keep dynamic facts at the tail to unlock 85% TTFT reduction and 90% token savings.
7. **Verify at the live edge before reconciling state.** Never mark a database record published because an automated process *attempted* to deploy it. Assert live HTTP 200 delivery with content confirmation.

---

*Every state transition, token metric, and schema specification in this article was verified against the active codebase and running configuration: the seven scheduled prompts, the Notion databases, the serverless cloud bridge, and the Astro 5 build harness.*

*Revised 10 November 2026. Updated to document the serverless Google Sheets cloud bridge, volatility-ordered KV prompt caching, dual-engine System 1/System 2 separation, and closed-loop edge verification.*
