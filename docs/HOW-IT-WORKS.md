# How wAIbi-sabi Works — the plain-English version

Last checked against the real system: 11 November 2026.
If you only read one document about this blog, read this one.

---

## The one-paragraph version

Five AI assistants, all run by Gemini on Google's computers, wake up at set times each day. They research, write, and drop their work into **one Google Sheet**. A set of robots on GitHub regularly copies anything new from that sheet into **Notion**, turns it into a web page, runs a long list of quality checks, and if everything passes, puts it live on **janmejai2002.github.io**. Notion is where you see what's happening. Nothing needs your laptop to be on.

## The cast

| Who | Where it lives | What it does | When (IST) |
|---|---|---|---|
| **Case Studies writer** | Gemini (Scheduled) | Picks a company's real AI rollout and writes a 4-part autopsy | 1:00 AM |
| **Radar** | Gemini (Scheduled) | Finds 3 fresh topics (Technical, Business, Basics) with a research brief each | 3:35 AM |
| **Article Writer** | Gemini (Scheduled) | Writes full articles for the 3 radar topics | 4:15 AM |
| **Repairer** | Gemini (Scheduled) | Fixes articles the checks rejected | 9:00 AM and 7:00 PM |
| **Conductor** | Apps Script in your Google account | Keeps the Sheet's status tabs current, wakes GitHub when new rows appear, alerts you if a task didn't run | every 15 minutes |
| **News curator** | Gemini (Scheduled) | Picks 5 business stories for MBA interview prep | 6:00 AM |
| **Talks writer** | Gemini (Scheduled) | Breaks down one recent tech talk or keynote | 1:00 PM |
| **The Sheet** | Google Sheets | The shared inbox. Every assistant writes its work here as a new row. | — |
| **The copier** | GitHub ("Sync news archive") | Copies new rows from the Sheet into Notion | Whenever GitHub gets round to it (2–4 times a day) |
| **The publisher** | GitHub ("Publish from Notion") | Turns Notion drafts into web pages, checks them, puts them live | Runs right after the copier |
| **Notion** | Notion | The status board: idea → draft → live, and why anything got stuck | — |

Gemini's daily allowance resets at **3:30 AM**, which is why the writing happens just after.

## A day in the life of one article

1. **3:00 AM — an idea.** Radar searches the web, picks a topic, and writes a row in the Sheet's *Radar* tab. The row holds a title, the question a real reader would ask, a 100-word pitch, and an SEO brief.
2. **3:45 AM — a draft.** The Article Writer reads that row, researches, and writes about 1,500 words. The draft includes a short summary at the top, sources, and a piece of geometric artwork described in code. It adds the whole thing as a row in the *Drafts* tab.
3. **Some hours later — into Notion.** The copier notices the new row and creates a page for it in Notion's *Article Production*, marked **Draft Ready**.
4. **Straight after — the checks.** The publisher reads every Draft Ready page and checks it:
   - Is the title 70 characters or fewer? Is the search description 160 or fewer?
   - Does it open with an "Executive TL;DR" summary?
   - Does the artwork use the house colours, so it works in dark mode too?
   - After building the actual web page: did any diagram, table or formula come out broken?
5. **If it passes:** it goes live within minutes. A final robot opens the live page to confirm it really loads, then marks the Notion row **Published** with the link.
6. **If it fails:** Notion marks it **Needs Revision** and writes the reason on the row. You (or Claude/agy) fix it, then set it back to Draft Ready.

All five tracks currently publish with no human approval. That's your decision, and you read the live articles afterwards.

## When an article fails: the self-healing loop

1. **The checks give a precise reason.** Every problem gets a code, such as `G-LATEX` (maths written in a format the site can't show) or `G-ASCII` (a diagram drawn with keyboard characters), plus the exact text that failed. Codes and reasons go onto the Notion row.
2. **Only the broken article is held back.** The rest of the batch still goes live.
3. **The Conductor notices.** This small script runs inside your Google account every 15 minutes. It copies each article's status into the Sheet's grey **Status** tab, and lists the broken ones in the grey **Repair Queue** tab, along with the fix instructions and the draft text.
4. **The Repairer fixes it.** A Gemini task runs at 9 AM and 7 PM. It reads the Repair Queue, fixes only what's listed, and adds the corrected draft to the **Repair Outbox** tab.
5. **It goes round again.** The Conductor sees the new row and wakes GitHub, which loads the fix into Notion and re-runs every check. If it passes, it goes live.
6. **After 4 failed repairs, a person steps in.** The article stops retrying, your phone gets a notification, and a GitHub issue labelled `needs-human` is opened with everything needed to fix it. Hand that issue to Claude or agy.

## Where the rules live

Every rule lives in one file, `site/harness/registry.mjs`: the character limits, the tracks and their colours, the Sheet's tabs, the failure codes and the repair limit. The publishing checks, the Conductor and the Gemini skills all read from it, so they can't drift apart. The Gemini tasks get the rules through four **skills** (house style, artwork, sheet contract, repair), which keeps each task prompt short.

## The two side streams

- **News cards** go Sheet → Notion → the /news page. No article checks, just a rebuild.
- **Case Studies and Talks** follow the article path above, each from its own tab in the Sheet.

## Where things go wrong today (honest list)

- **One bad article used to block the whole day's batch.** On 11 November, one draft's maths formatting held back two clean articles. **Fixed:** only the broken article is held now.
- **GitHub is lazy about schedules.** It's set to check about 96 times a day and actually does 2–4. **Fixed once the Conductor is installed:** it wakes GitHub within 15 minutes of a new row.
- **Formatting Gemini likes but the site doesn't:** text-drawn box diagrams (about half the drafts), maths in LaTeX, missing sources. **Addressed** three ways: the new prompts and skills forbid them, the checks catch them before the build, and the Repairer fixes what slips through.
- **Fact-checking was lost in the move to Gemini.** **Restored** in the house-style skill, where every number must trace to a sentence on its source page. A check warns when an article has fewer than 3 sources.
- **If a Gemini task doesn't run,** nothing used to notice. **Fixed once installed:** every task logs a line in the Sheet's **Runs** tab, and the Conductor alerts you each afternoon about any task that didn't log.

## Things that look important but aren't running

You may see these in the project. None of them are part of today's system:
- **Claude routines** (`~/.claude/scheduled-tasks/`, `routines/`): the old writers from before the Gemini switch. They're stopped, but their prompts are a good source of rules.
- **Local watchdog** (`routines/manager.ps1`): stopped since 9 October.
- **Apps Script engine** (`gas/`) and `gemini-tasks.mjs`: an API-key version of the Gemini tasks that was never switched on.
- **Interest Rating in Notion:** retired. The radar scores and picks its own topics.

## Where to look when you want to know…

| Question | Look here |
|---|---|
| Did today's articles get written? | The Sheet: *Drafts*, *Case Studies*, *Talks* tabs |
| Is an article live, or stuck and why? | Notion → Article Production → *Draft Status* and *Blocked Reason* |
| Did a robot fail? | GitHub → Actions tab (red runs), or the push notification on your phone |
| Is everything healthy? | Run `node site/scripts/doctor.mjs` from the project folder |
