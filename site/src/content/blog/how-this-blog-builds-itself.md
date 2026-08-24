---
title: 'How This Blog Builds Itself'
description: 'The pipeline behind this site: two scheduled Claude Code routines, three Notion databases, one human rating, and a deliberately small skills folder.'
pubDate: 2026-08-24
keywords:
  - Claude Code scheduled tasks
  - Notion as a control plane
  - AI content pipeline architecture
  - agent token budget
  - Astro content collections
readingTime: '12 min read'
---

<div class="tldr">

## Executive TL;DR

- Two scheduled Claude Code routines do the work. One discovers topics and pitches them. The other picks up whatever the human rated 4 or 5 and writes the draft.
- Notion is the control plane, not a CMS. Two related databases hold every decision; the repository holds only what was published.
- The whole thing hinges on one field. `Interest Rating` is the approval gate and the only human input the pipeline requires.
- Nothing auto-publishes. `Approved` is a state no routine is allowed to write.
- The least obvious constraint is token budget. Skill and agent descriptions are injected into every session *and every sub-agent*, so the active folders are kept deliberately small: 64 skills at ~6.1k tokens became 7 at ~1.2k.

</div>

The `/projects/` page has been promising this walkthrough for a while. Here it is, generated the way it should have been: from a NotebookLM notebook built on the actual configuration files rather than from memory. The four diagrams below were derived from that notebook's grounded answers and then hand-drawn as SVG, because this site has a real dark mode and a baked-in white PNG would have looked broken in half of it.

Everything here is replicable. There is no bespoke infrastructure, no server, and no queue. It is two markdown prompt files, three Notion databases, and a static site.

## The shape of the thing

Two scheduled tasks run on a clock. `daily-ai-seo-radar` fires at 07:10 and files ideas. `ai-article-writer` fires every four hours and writes whatever has been approved. Between them sits exactly one human decision.

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

Three details in that diagram carry more weight than they look like they do.

**The rating is the whole gate.** There is no queue, no priority field, no assignment. An idea moves because a human picked 4 or 5 from a dropdown. Ratings of 1 and 2 are not just rejections either — the radar routine reads them on its next run and avoids close neighbours of those topics, so declining an idea teaches the system something.

**The lock happens before the work.** The writer sets the radar row to `Drafting` immediately after creating the production row and before it researches anything. Its own pickup query filters on `Status = 'Radar Idea'`, so that single write is what prevents a four-hourly job from starting the same article twice. Doing it after the research would leave a multi-minute window where a second run could double-pick.

**`Approved` is unreachable by machine.** Both prompt files state it, and both state it as a guardrail rather than a default. The system is built to produce drafts, not posts.

## Notion is the control plane

The word "CMS" would be wrong here. Notion holds the things that are still being decided; the git repository holds only what was published. Nothing that belongs in one lives in the other.

<figure class="diagram">
<svg viewBox="0 0 700 470" role="img" aria-labelledby="d2t d2d">
  <title id="d2t">The Notion control plane</title>
  <desc id="d2d">The AI Blog OS Pipeline database and the Article Production database are joined by a two-way relation between the Article and Source Idea fields. The radar routine creates pipeline rows; the writer routine creates production rows and advances both. Interest Rating, Remarks and the Approved status are human-only. A third database, the Interview News Archive, is separate and syncs into the repository as committed JSON.</desc>
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
      <text x="16" y="338" opacity="0.72">Not part of the editorial pipeline.</text>
      <text x="16" y="358" opacity="0.72">sync-news.mjs writes it into the repo</text>
      <text x="16" y="378" opacity="0.72">as committed JSON, then Astro builds</text>
      <text x="16" y="396" opacity="0.72">221 filterable cards at /news/.</text>
    </g>

    <rect x="384" y="286" width="316" height="120" rx="10" fill="none" stroke="var(--border)" stroke-dasharray="4 4"/>
    <text x="400" y="308" font-size="12.5" font-weight="700">The repository</text>
    <g font-size="11">
      <text x="400" y="334" opacity="0.72">Holds only what was published:</text>
      <text x="400" y="354" opacity="0.72">markdown, images, the design system.</text>
      <text x="400" y="378" opacity="0.72">Rating an idea must never require</text>
      <text x="400" y="396" opacity="0.72">a git commit. That is the whole rule.</text>
    </g>

    <text x="0" y="440" font-size="10.5" opacity="0.5">The relation is what answers "has this already been written" in a single query — setting either side populates the other.</text>
    <text x="0" y="458" font-size="10.5" opacity="0.5">Red fields are the human's. The routines read them and never write them.</text>
  </g>
</svg>
<figcaption>Two related databases and one unrelated one. The dashed box is the repository, which is downstream of all of it.</figcaption>
</figure>

The division of labour is worth stating as a rule, because it is the thing that makes the system pleasant to live with rather than another repo to maintain: **anything a person needs to change without deploying goes in Notion.** A rating, a remark, a decision to kill a topic. Anything that is a finished artefact goes in git. The moment you put the rating in a YAML file, rating an idea from your phone stops working.

## What the machine side actually is

There is less here than people expect. No agent framework, no vector database, no orchestrator.

<figure class="diagram">
<svg viewBox="0 0 700 400" role="img" aria-labelledby="d3t d3d">
  <title id="d3t">Claude Code layout for this system</title>
  <desc id="d3d">Two scheduled task prompt files drive the pipeline. Seven skills sit in the active skills folder and are injected into every session and sub-agent. About twenty-seven agents sit in the active agents folder. Fifty-seven skills and about two hundred thirty-six agents sit in archived library folders that are never scanned at startup and cost nothing. MCP connections provide Notion, web search and NotebookLM.</desc>
  <g font-family="inherit" fill="currentColor">

    <text x="0" y="14" font-size="10" font-weight="700" letter-spacing="1.4" opacity="0.45">LOADED INTO EVERY SESSION</text>
    <rect x="0" y="24" width="700" height="150" rx="10" fill="var(--wash-mizu)" stroke="var(--border)"/>

    <rect x="16" y="42" width="200" height="114" rx="8" fill="var(--card)" stroke="var(--border)"/>
    <text x="30" y="64" font-size="12" font-weight="700">scheduled-tasks/</text>
    <g font-size="11" opacity="0.75">
      <text x="30" y="88">daily-ai-seo-radar</text>
      <text x="30" y="106" font-size="10" opacity="0.7">07:10 · SKILL.md</text>
      <text x="30" y="128">ai-article-writer</text>
      <text x="30" y="146" font-size="10" opacity="0.7">every 4h · SKILL.md</text>
    </g>

    <rect x="234" y="42" width="200" height="114" rx="8" fill="var(--card)" stroke="var(--border)"/>
    <text x="248" y="64" font-size="12" font-weight="700">skills/ — 7 active</text>
    <g font-size="10.5" opacity="0.75">
      <text x="248" y="86">seo-topic-research is invoked</text>
      <text x="248" y="102">by the radar; anti-ai-writing</text>
      <text x="248" y="118">is the mandatory last filter.</text>
      <text x="248" y="142" font-size="10" fill="var(--hanko)" font-weight="700">~1.2k tokens, every time</text>
    </g>

    <rect x="452" y="42" width="232" height="114" rx="8" fill="var(--card)" stroke="var(--border)"/>
    <text x="466" y="64" font-size="12" font-weight="700">MCP connections</text>
    <g font-size="10.5" opacity="0.75">
      <text x="466" y="86">Notion — the control plane</text>
      <text x="466" y="104">Web search — every claim</text>
      <text x="466" y="122">NotebookLM — this article</text>
      <text x="466" y="146">agents/ — ~27 curated</text>
    </g>

    <text x="0" y="218" font-size="10" font-weight="700" letter-spacing="1.4" opacity="0.45">ON DISK, NEVER SCANNED AT STARTUP</text>
    <rect x="0" y="228" width="700" height="104" rx="10" fill="none" stroke="var(--border)" stroke-dasharray="5 5"/>

    <rect x="16" y="246" width="322" height="68" rx="8" fill="none" stroke="var(--border)"/>
    <text x="30" y="268" font-size="12" font-weight="700" opacity="0.7">skills-library/ — 57 archived</text>
    <text x="30" y="290" font-size="10.5" opacity="0.6">Not invocable. Restored by moving the folder</text>
    <text x="30" y="306" font-size="10.5" opacity="0.6">back and restarting.</text>

    <rect x="362" y="246" width="322" height="68" rx="8" fill="none" stroke="var(--border)"/>
    <text x="376" y="268" font-size="12" font-weight="700" opacity="0.7">agents-library/ — ~236 archived</text>
    <text x="376" y="290" font-size="10.5" opacity="0.6">Found by grepping an INDEX.md, then pasted</text>
    <text x="376" y="306" font-size="10.5" opacity="0.6">into a prompt as a general-purpose agent.</text>

    <text x="0" y="362" font-size="11" opacity="0.6">Both archives cost zero tokens at baseline. That is the entire reason they exist.</text>
    <text x="0" y="384" font-size="11" opacity="0.6">The teal block above is paid for on every single session — and again inside every sub-agent.</text>
  </g>
</svg>
<figcaption>Two prompt files, seven skills, a handful of MCP connections. Everything else is deliberately cold.</figcaption>
</figure>

The prompts are the system. Each scheduled run starts cold, with no memory of any previous run, which means the prompt file has to be completely self-contained: the data source IDs, the exact query, the state transitions, the guardrails. That constraint is annoying for about a day and then becomes the best feature, because the prompt file *is* the documentation. Reading `ai-article-writer/SKILL.md` tells you exactly what the system does, with no gap between the description and the behaviour.

## The constraint nobody expects: token budget

This is the part I would not have predicted, and it is the part most likely to be useful to someone building their own.

Skill descriptions and agent descriptions are injected into context automatically at session start. Not the skills themselves — just their names and descriptions, so the model knows what it can reach for. That sounds cheap. It is cheap once. It is not cheap when a skill folder has grown to 64 entries, and it is genuinely expensive when the same block is also injected into every sub-agent you spawn, because a parallel swarm multiplies the baseline by the number of agents running.

<figure class="diagram">
<svg viewBox="0 0 700 340" role="img" aria-labelledby="d4t d4d">
  <title id="d4t">The token-cost model behind the trimmed folders</title>
  <desc id="d4d">The skills folder went from 64 skills at about 6100 tokens to 7 skills at about 1200 tokens, with 57 archived. The agents folder went from 263 personas to about 27 active and 236 archived, to stay under the agent listing's roughly 15000 token budget. Because the same block is injected into every sub-agent, an eight-agent swarm multiplies the baseline eight times.</desc>
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
<figcaption>The numbers come from the global config: 64 skills at ~6.1k tokens trimmed to 7 at ~1.2k, and 263 agent personas trimmed to ~27 to stay inside the listing budget.</figcaption>
</figure>

The fix is not clever, it is just filing. Keep the small set you actually reach for in the scanned directory, move the rest into a sibling directory that is never scanned, and leave an `INDEX.md` behind so a specific archived persona can still be found by grep and pasted into a prompt when it is genuinely needed. The archived directories cost nothing, because the startup scan does not look at them.

The same discipline shows up in how sub-agents get spawned at all: a smaller model for research and extraction, one pre-digested brief instead of every agent re-reading the same large document, findings written to disk with short receipts returned instead of pasting full output back, and deliverables assembled by a script rather than retyped by a model.

## The site itself

Astro, no framework, no Tailwind. The template this design came from used the Tailwind CDN script, which is render-blocking and bad for a site whose entire point is being read, so the design system was ported to plain CSS with tokens.

The content schema does more work than a schema usually does. `title` is capped at 70 characters and `description` at 160, which are the lengths search results actually show. Those caps are not advice, they are build errors, and they have already caught a 193-character description that would have been truncated in the wild. Image support has the same shape: a hero image is optional, but alt text is a build error the moment a hero exists, so an inaccessible post cannot reach the site at all.

Deployment is a push to `main`, a GitHub Actions run, and Pages. There is no preview environment, which is a real limitation and an honest one.

## What I would tell someone copying this

**Put the decision surface where the decision gets made.** The 100-word pitch exists because a person will actually read 100 words on their phone at a bus stop and will not read an SEO brief. The brief is still there, in the page body, for when the pitch is not enough.

**Make the guardrails states, not intentions.** "Do not publish automatically" is a sentence. `Approved` being a value no routine writes is a mechanism. Only one of those survives a bad run.

**Trim the thing that gets injected.** Whatever your agent framework injects into every context by default, look at it and measure it. It is the one cost that scales with how many agents you run rather than how much work you do.

**Expect the prompt to be the spec.** Cold starts force the prompt file to hold everything, which means it drifts from reality far less than a README does. That was an accident here, and it is the design decision I would keep on purpose next time.

---

*This walkthrough was assembled from a NotebookLM notebook built on nine real configuration files: both scheduled-task prompts, the `seo-topic-research` skill, the global Claude Code config, the site's content and build configs, and a transcription of all three live Notion schemas. The diagrams were drawn by hand from that notebook's grounded answers so they read the site's own colour tokens in both light and dark mode.*
