---
title: 'How This Blog Builds Itself'
description: 'Five Gemini assistants write it, code checks every rule, and a repair loop fixes only the broken section. How this blog runs itself, in plain English.'
pubDate: 2026-08-24
updatedDate: 2026-11-11
track: technical
question: 'How does a blog write, check and repair its own articles while nobody is watching?'
keywords:
  - AI content pipeline
  - Gemini scheduled tasks
  - Google Sheets as an agent inbox
  - Notion as a status board
  - self-healing publishing pipeline
  - LLM repair loop
  - section patches
  - Astro static site
readingTime: '8 min read'
heroImage: '../../assets/art/how-this-blog-builds-itself-light.webp'
heroImageDark: '../../assets/art/how-this-blog-builds-itself-dark.webp'
heroAlt: 'A ring of sixty evenly spaced tick marks enclosed by a single heavy arc that runs almost the whole way round. The arc breaks at the lower left, and a short, slightly crooked red stroke sits in the gap.'
---

<div class="tldr">

## Executive TL;DR

- Five Gemini assistants research and write overnight. They drop every draft into one Google Sheet, which is the only thing they are allowed to touch.
- Code, not AI, does everything that has a right answer: copying, counting characters, fixing maths formatting, checking rules, confirming the live page loads.
- A draft that breaks a rule is held back alone. A repair assistant fixes it, and code checks the repair before it is used.
- The first real repair rewrote 8 of 11 sections to fix one diagram. The cause: an AI cannot paste, so it retyped the whole article and drifted. Now it only ever sees and returns the broken section.
- On the same test article the new loop changed 1 section of 10, removed 0 words, and filed in about 7 minutes.

</div>

Every article on this site is researched, written, checked and published without me at a keyboard. I read the live pieces afterwards. This post is the plain-English tour of how that works, what broke the first time it had to fix its own mistakes, and the one design rule that fixed it.

It replaces an earlier, much longer version of this post that described the system before it moved to Gemini. Almost all of that machinery is gone.

## The picture

<figure class="diagram">
<svg viewBox="0 0 700 470" role="img" aria-labelledby="hb1t hb1d">
  <title id="hb1t">How an article gets from an idea to the live site</title>
  <desc id="hb1d">Five steps from top to bottom. Gemini writes overnight. Every draft lands as a new row in a Google Sheet. Within about fifteen minutes it becomes a Notion page. Code tidies and checks it. If it passes it goes live, and a robot opens the live page before marking it published. If a rule blocks it, it goes to the repair loop on the right and comes back to the checks when fixed.</desc>
  <g font-family="inherit" fill="currentColor">
    <rect x="20" y="16" width="420" height="62" rx="8" fill="var(--wash-plum)" stroke="var(--border)"/>
    <text x="36" y="40" font-size="13" font-weight="700">1. Gemini writes</text>
    <text x="36" y="60" font-size="11.5" opacity="0.75">Five scheduled assistants research and draft overnight.</text>
    <line x1="230" y1="78" x2="230" y2="102" stroke="currentColor" stroke-opacity="0.5" stroke-width="1.5"/>
    <polygon points="225,100 235,100 230,108" opacity="0.6"/>
    <text x="244" y="96" font-size="10.5" opacity="0.6">adds a row</text>
    <rect x="20" y="108" width="420" height="62" rx="8" fill="var(--wash-mizu)" stroke="var(--border)"/>
    <text x="36" y="132" font-size="13" font-weight="700">2. One Google Sheet</text>
    <text x="36" y="152" font-size="11.5" opacity="0.75">The shared inbox. Rows are only ever added, never edited.</text>
    <line x1="230" y1="170" x2="230" y2="194" stroke="currentColor" stroke-opacity="0.5" stroke-width="1.5"/>
    <polygon points="225,192 235,192 230,200" opacity="0.6"/>
    <text x="244" y="188" font-size="10.5" opacity="0.6">within about 15 minutes</text>
    <rect x="20" y="200" width="420" height="62" rx="8" fill="var(--wash-mizu)" stroke="var(--border)"/>
    <text x="36" y="224" font-size="13" font-weight="700">3. Notion</text>
    <text x="36" y="244" font-size="11.5" opacity="0.75">Each draft becomes a page with its status. My dashboard.</text>
    <line x1="230" y1="262" x2="230" y2="286" stroke="currentColor" stroke-opacity="0.5" stroke-width="1.5"/>
    <polygon points="225,284 235,284 230,292" opacity="0.6"/>
    <rect x="20" y="292" width="420" height="62" rx="8" fill="var(--wash-ochre)" stroke="var(--border)"/>
    <text x="36" y="316" font-size="13" font-weight="700">4. Code tidies, then checks</text>
    <text x="36" y="336" font-size="11.5" opacity="0.75">Fixes what has a right answer, then tests every rule.</text>
    <line x1="230" y1="354" x2="230" y2="378" stroke="currentColor" stroke-opacity="0.5" stroke-width="1.5"/>
    <polygon points="225,376 235,376 230,384" opacity="0.6"/>
    <text x="244" y="372" font-size="10.5" opacity="0.6">passes, or only a warning</text>
    <rect x="20" y="384" width="420" height="62" rx="8" fill="var(--wash-moss)" stroke="var(--moss)"/>
    <text x="36" y="408" font-size="13" font-weight="700">5. Live on the site</text>
    <text x="36" y="428" font-size="11.5" opacity="0.75">A robot opens the live page before calling it published.</text>
    <rect x="490" y="278" width="190" height="90" rx="8" fill="var(--wash-hanko)" stroke="var(--hanko)"/>
    <text x="506" y="304" font-size="13" font-weight="700" fill="var(--hanko)">Repair loop</text>
    <text x="506" y="324" font-size="11" opacity="0.75">Only the broken part</text>
    <text x="506" y="340" font-size="11" opacity="0.75">goes back to Gemini.</text>
    <text x="506" y="356" font-size="11" opacity="0.75">See the next picture.</text>
    <line x1="440" y1="310" x2="482" y2="310" stroke="var(--hanko)" stroke-width="1.5"/>
    <polygon points="480,305 480,315 488,310" fill="var(--hanko)"/>
    <text x="446" y="302" font-size="10.5" fill="var(--hanko)">blocked</text>
    <line x1="490" y1="340" x2="448" y2="340" stroke="currentColor" stroke-opacity="0.5" stroke-width="1.5"/>
    <polygon points="450,335 450,345 442,340" opacity="0.6"/>
    <text x="452" y="358" font-size="10.5" opacity="0.6">fixed</text>
  </g>
</svg>
<figcaption>The whole pipeline, top to bottom. Only step 1 is AI; steps 2 to 5 are ordinary code. A blocked article takes the red detour and comes back.</figcaption>
</figure>

Three things in that picture matter more than the rest.

**The AI only writes into a spreadsheet.** None of the assistants can touch Notion, the website or the code. They append rows to one Google Sheet, and they are told never to edit an existing row. Everything after that is ordinary code.

**Code wakes up the rest.** A small script inside the Sheet runs every 15 minutes. When it sees new rows it starts the publishing robots on GitHub, which then copy the draft into Notion, check it and build the site. Left alone, GitHub's own timer ran two to four times a day instead of the ninety-odd times it was set to, so the Sheet does the waking.

**Notion is where I look, not where work happens.** Every article is a row with a status: Draft Ready, Needs Revision, Published. When something is stuck, the reason is written on the row in plain words.

## Who does what

| Who | What it does | When |
|---|---|---|
| Case Studies writer | Picks a company's real AI rollout and writes an autopsy of it | 1:00 AM |
| Radar | Finds three fresh topics, each with a reader question and a research brief | 3:35 AM |
| Article Writer | Writes the three radar topics into full articles | 4:15 AM |
| News curator | Picks five business stories for MBA interview prep | 6:00 AM |
| Repairer | Fixes the parts of articles the checks rejected | 9:00 AM and 7:00 PM |
| Talks writer | Breaks down one recent tech talk or keynote | 1:00 PM |

All times are India time. Gemini's daily allowance resets at 3:30 AM, which is why most of the writing happens just after.

## What code does, and why AI doesn't

The rule I keep coming back to: if a task has a right answer, code does it. AI is for the parts that need judgement, like choosing a topic, reading sources and writing.

So code does all of this:

- **Tidying.** Gemini likes to write maths in LaTeX and draw tables with keyboard characters. Neither displays on this site. Code converts them itself rather than asking anyone to fix them.
- **Counting.** Titles must be 70 characters or fewer, search descriptions 160, reader questions 120. A model guesses at counts. Code counts.
- **Checking.** Every draft must open with a summary, every diagram must be a real drawing, and the artwork must use the site's colour tokens so it works in dark mode. After the page is built, code checks again that nothing came out broken.
- **Confirming.** An article is only marked Published after a robot has opened the live page over the internet and found the headline on it.

Problems come in two kinds. **Blocking** ones hold the article back: a title that is too long, no summary, a diagram drawn with keyboard characters, leftover maths code. **Warnings** do not: an article over 2,200 words, a banned buzzword, fewer than three sources. Those go live with the warning written on the row, and I deal with them by reading.

Only the broken article is ever held. The rest of the night's batch still goes live.

## The first repair, and what went wrong

When an article is blocked, a sixth assistant, the Repairer, is meant to fix it. The first time it ran for real, on 11 November, the article was "Flaky Agent Evals Force CI Shift from LLM Judges to Trajectory Gates". It had exactly one real problem: one diagram drawn with keyboard characters.

The repair passed every check and went live. Then I compared it with the original. **It had rewritten 8 of the article's 11 sections, deleted a whole section on the method's limitations, and removed 718 words.** All to fix one diagram.

The causes were mostly in my code, not in Gemini:

- **Two of the four problems it was given were almost certainly stale.** They had been recorded before the current rules existed, and today's checks do not find them in that article at all.
- **One was a gap in my own code.** Some maths formatting should have been converted automatically, and was not.
- **One rule told it to cut.** The length guidance said "cut to 1,400 to 1,800 words", stricter than the actual limit, so it cut a thousand words.
- **It was told what was wrong, but not where.** So it searched the whole article, and compared it with sixteen other drafts.

I fixed those first. Problems now say exactly where they are, for example *"a diagram in the section Architecture of a Deterministic Trajectory Gate, starting with [Git PR / Agent Prompt]"*. Old verdicts are re-checked against today's rules. Warnings never trigger a repair. And code now checks each repair before using it: if anything outside the named sections changed, the repair is refused.

Then I ran a controlled test: a copy of that article with one diagram and one em dash planted in one section. The Repairer understood the job perfectly. Its own notes said it had changed exactly those two things. **The article it handed back had still changed 9 of 11 sections.** The new check caught it and refused it, but the question was why.

## Why an AI cannot copy

Gemini's log answered it. Its fix, made in its own workspace, was correct. But to put the article back into the Sheet it had to write the whole thing out again, all 25,000 characters.

A language model cannot paste. It produces text one word at a time, so "copying" an article means retyping it from memory. Over a few hundred words that works. Over 25,000 characters it drifts: sentences get reworded, paragraphs go missing, new em dashes appear. It even noticed, writing in its log that "an outdated text was used".

No instruction fixes that, because the model is not ignoring the instruction. It is simply not a copying machine. So the fix was to stop asking it to copy.

## The fix: send only the broken part

<figure class="diagram">
<svg viewBox="0 0 700 430" role="img" aria-labelledby="hb2t hb2d">
  <title id="hb2t">How a repair works now</title>
  <desc id="hb2d">On the left, the article is cut into ten sections at its headings, and section 5 holds the broken diagram. Only section 5 goes to Gemini, which fixes it and sends just that section back. On the right, code rebuilds the article: section 5 is the fixed one and the other nine are copied exactly. At the bottom, code checks whether anything else changed or a new problem appeared. If not, the article goes live. If so, the repair is thrown away and the next try starts from the last good version, up to four times before a person is asked.</desc>
  <g font-family="inherit" fill="currentColor">
    <text x="20" y="20" font-size="12" font-weight="700">1. Cut into sections</text>
    <text x="490" y="20" font-size="12" font-weight="700">3. Code rebuilds it</text>
    <rect x="20" y="32" width="190" height="22" rx="4" fill="var(--wash-mizu)" stroke="var(--border)"/>
    <text x="30" y="47" font-size="10.5" opacity="0.75">Section 1</text>
    <rect x="20" y="60" width="190" height="22" rx="4" fill="var(--wash-mizu)" stroke="var(--border)"/>
    <text x="30" y="75" font-size="10.5" opacity="0.75">Section 2</text>
    <rect x="20" y="88" width="190" height="22" rx="4" fill="var(--wash-mizu)" stroke="var(--border)"/>
    <text x="30" y="103" font-size="10.5" opacity="0.75">Section 3</text>
    <rect x="20" y="116" width="190" height="22" rx="4" fill="var(--wash-mizu)" stroke="var(--border)"/>
    <text x="30" y="131" font-size="10.5" opacity="0.75">Section 4</text>
    <rect x="20" y="144" width="190" height="22" rx="4" fill="var(--wash-hanko)" stroke="var(--hanko)"/>
    <text x="30" y="159" font-size="10.5" font-weight="700" fill="var(--hanko)">Section 5: the broken diagram</text>
    <rect x="20" y="172" width="190" height="22" rx="4" fill="var(--wash-mizu)" stroke="var(--border)"/>
    <text x="30" y="187" font-size="10.5" opacity="0.75">Section 6</text>
    <rect x="20" y="200" width="190" height="22" rx="4" fill="var(--wash-mizu)" stroke="var(--border)"/>
    <text x="30" y="215" font-size="10.5" opacity="0.75">Section 7</text>
    <rect x="20" y="228" width="190" height="22" rx="4" fill="var(--wash-mizu)" stroke="var(--border)"/>
    <text x="30" y="243" font-size="10.5" opacity="0.75">Sections 8 to 10</text>
    <rect x="250" y="118" width="200" height="74" rx="8" fill="var(--wash-plum)" stroke="var(--border)"/>
    <text x="264" y="140" font-size="12" font-weight="700">2. Gemini fixes section 5</text>
    <text x="264" y="158" font-size="10.5" opacity="0.75">It gets about 6,600 characters</text>
    <text x="264" y="174" font-size="10.5" opacity="0.75">instead of 25,000, and sends</text>
    <text x="264" y="188" font-size="10.5" opacity="0.75">back only that section.</text>
    <line x1="210" y1="155" x2="242" y2="155" stroke="var(--hanko)" stroke-width="1.5"/>
    <polygon points="240,150 240,160 248,155" fill="var(--hanko)"/>
    <line x1="450" y1="155" x2="482" y2="155" stroke="currentColor" stroke-opacity="0.5" stroke-width="1.5"/>
    <polygon points="480,150 480,160 488,155" opacity="0.6"/>
    <rect x="490" y="32" width="190" height="22" rx="4" fill="var(--wash-mizu)" stroke="var(--border)"/>
    <text x="500" y="47" font-size="10.5" opacity="0.75">Section 1, copied exactly</text>
    <rect x="490" y="60" width="190" height="22" rx="4" fill="var(--wash-mizu)" stroke="var(--border)"/>
    <text x="500" y="75" font-size="10.5" opacity="0.75">Section 2, copied exactly</text>
    <rect x="490" y="88" width="190" height="22" rx="4" fill="var(--wash-mizu)" stroke="var(--border)"/>
    <text x="500" y="103" font-size="10.5" opacity="0.75">Section 3, copied exactly</text>
    <rect x="490" y="116" width="190" height="22" rx="4" fill="var(--wash-mizu)" stroke="var(--border)"/>
    <text x="500" y="131" font-size="10.5" opacity="0.75">Section 4, copied exactly</text>
    <rect x="490" y="144" width="190" height="22" rx="4" fill="var(--wash-moss)" stroke="var(--moss)" stroke-width="1.5"/>
    <text x="500" y="159" font-size="10.5" font-weight="700" fill="var(--moss)">Section 5, fixed</text>
    <rect x="490" y="172" width="190" height="22" rx="4" fill="var(--wash-mizu)" stroke="var(--border)"/>
    <text x="500" y="187" font-size="10.5" opacity="0.75">Section 6, copied exactly</text>
    <rect x="490" y="200" width="190" height="22" rx="4" fill="var(--wash-mizu)" stroke="var(--border)"/>
    <text x="500" y="215" font-size="10.5" opacity="0.75">Section 7, copied exactly</text>
    <rect x="490" y="228" width="190" height="22" rx="4" fill="var(--wash-mizu)" stroke="var(--border)"/>
    <text x="500" y="243" font-size="10.5" opacity="0.75">Sections 8 to 10, copied</text>
    <line x1="585" y1="250" x2="585" y2="276" stroke="currentColor" stroke-opacity="0.5" stroke-width="1.5"/>
    <polygon points="580,274 590,274 585,282" opacity="0.6"/>
    <rect x="20" y="282" width="660" height="56" rx="8" fill="var(--wash-ochre)" stroke="var(--border)"/>
    <text x="36" y="305" font-size="12" font-weight="700">4. Code checks the repair</text>
    <text x="36" y="324" font-size="11" opacity="0.75">Did any section outside section 5 change? Did a new problem appear?</text>
    <rect x="20" y="358" width="320" height="56" rx="8" fill="var(--wash-moss)" stroke="var(--moss)"/>
    <text x="36" y="381" font-size="12" font-weight="700" fill="var(--moss)">No: accepted</text>
    <text x="36" y="400" font-size="11" opacity="0.75">Checked once more, then live.</text>
    <rect x="360" y="358" width="320" height="56" rx="8" fill="var(--wash-hanko)" stroke="var(--hanko)"/>
    <text x="376" y="381" font-size="12" font-weight="700" fill="var(--hanko)">Yes: refused</text>
    <text x="376" y="400" font-size="11" opacity="0.75">Thrown away. Retried up to 4 times, then I am asked.</text>
  </g>
</svg>
<figcaption>A repair now. Gemini only sees and returns the broken section; code does all the copying.</figcaption>
</figure>

Every article is cut into sections at its headings. When a check fails, it records which section the problem is in. The script in the Sheet sends Gemini **only that section**, with the problem written next to it. Gemini sends back only the fixed section. Code then puts the article back together: it takes the original, swaps in the fixed section, and copies the other nine sections exactly, character for character.

The check from before still runs on the result. Because the other sections were never in Gemini's hands, there is nothing for it to drift on.

A few problems have no single place, like an article with too few sources, which might need a sentence removed anywhere. For those the whole article still goes to Gemini, and the same check guards the result.

## What changed

The same planted test, run once with the old method and once with the new one:

| | First real repair | Test, whole article | Test, one section |
|---|---|---|---|
| What Gemini had to read | 25,000 characters | 25,000 characters | about 6,600 |
| Sections changed | 8 of 11 | 9 of 11 | 1 of 10 |
| Sections changed that it was not asked to touch | 7 | 7 | 0 |
| Words removed | 718 | 329 | 0 |
| Outcome | went live, damaged | refused | accepted |

Inside the one section it was given, 14 of its 16 paragraphs and blocks came back word for word. The two that changed were the two it was asked to fix: the diagram became a numbered list, and the em dash became a colon. It also filed the repair in about seven minutes, because reading and writing a few thousand characters is far less work than twenty-five thousand.

The section that the first repair deleted has been put back in the live article.

## What I actually do

Very little, on purpose.

- I read what goes live, the same way you do.
- When the repair loop gives up after four attempts, my phone gets a notification and a task is opened on GitHub with everything needed to fix the article. I hand that to a coding assistant.
- When I change the system, I press one button in the Sheet, **Start a repair test**, which files a known-broken article and lets the whole loop run on it. A test article is never published.

Every rule lives in one file in the code: the character limits, the tracks, which problems block and which only warn, and how articles are cut into sections. Both the publishing robots and the script inside the Sheet read from it, so they cannot disagree. Before every build, a set of automatic tests replays that first real repair and checks the whole loop still behaves as described here.

## What I would tell anyone building one

1. **Give the AI the judgement, and give code everything with a right answer.** Copying, counting and checking are not judgement.
2. **Never ask a model to return more than it changed.** It cannot copy. Send it the smallest piece that contains the problem, and put the rest back in code.
3. **Say where, not just what.** "There is a diagram problem" sends a model searching. "The diagram in this section, starting with these words" gets it fixed.
4. **Check the repair, not just the result.** A repair can pass every rule and still have damaged the article. Compare it with what you sent.
5. **Rules go stale.** Stamp every verdict with the version of the rules that made it, and re-check old ones before acting on them.

*Revised 11 November 2026, after the repair loop was rebuilt around section patches. Every number above comes from the runs described, on that date.*
