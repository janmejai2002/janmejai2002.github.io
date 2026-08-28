---
title: 'AI Overviews Roughly Halved Clicks. The Rest Are Guesses.'
description: 'The two AI Overviews traffic studies that survive scrutiny, why the viral percentages don''t, and how to measure your own click loss in Search Console.'
pubDate: 2026-08-28
track: business
question: 'How much traffic did Google''s AI Overviews actually take from sites like mine, and how do I measure my own loss?'
keywords:
  - AI Overviews traffic loss
  - measure AI Overviews impact search console
  - Pew AI Overviews study
  - Ahrefs AI Overview CTR
  - zero-click search 2026
  - organic traffic decline AI search
heroImage: '../../assets/art/ai-overviews-traffic-loss-measure-your-own-light.webp'
heroImageDark: '../../assets/art/ai-overviews-traffic-loss-measure-your-own-dark.webp'
heroAlt: 'Rows of thin arrows travel from the left toward a column of six stacked cards; a thick vertical bar stops most of them, a few faint lines continue past it, and one bold arrow passes through a gap in the bar to reach the cards.'
readingTime: '10 min read'
notionId: '3c9ced67-050a-81b2-8486-e5139d367bdc'
---
<div class="tldr">

## Executive TL;DR

- **Two studies survive scrutiny.** Pew Research tracked the real browsing of 900 US adults and found people clicked a search result in 8% of visits to a results page that showed an AI summary, versus 15% of visits to one without. Ahrefs compared hundreds of thousands of keywords and found a lower click-through rate at the top position when an AI Overview appeared.
- **The click roughly halved, on the searches where a summary shows.** That is the defensible headline. It is not the same as "your traffic fell by half."
- **The viral single numbers don't trace back.** The "35% drop" has no primary source in the roundups that quote it. Ahrefs' own figure moved from 34.5% (April 2025) to 58% (May 2026) because the measurement window and method changed, not because reality doubled in a year.
- **Google gives you no AI Overview breakdown in Search Console.** You can still estimate your loss: compare date ranges, segment by query type, and look for impressions holding steady while clicks fall.
- **Exposure is uneven.** Pew found 8% of one-to-two-word searches triggered a summary, against 53% of searches with ten or more words, and about 60% of question-shaped queries. Your query mix decides how much of this applies to you.
- **India sits on its own timeline.** Google brought AI Mode to India as a Labs experiment in June 2025. Most of the studies you are reading describe US behaviour.

</div>

## Where the number comes from

You have seen the number. AI Overviews cut clicks by 35%. Or 34.5%. Or 58%. Or pick a figure between a fifth and two-thirds; some agency newsletter has published it, and almost none of them tell you where it came from.

Two studies hold up. The rest is a handful of figures passed between vendor blogs until nobody can trace them to a measurement. Before you rewrite a content plan around a borrowed percentage, it's worth knowing what was actually measured, what it means for one site, and how to check your own numbers.

## First, the plumbing: SEO, AEO, and how ranking works

Skip this if it's old news. If it isn't, the rest of the piece needs it.

**Ranking** is Google deciding, for a given query, which pages to show and in what order. It weighs relevance, the site's perceived authority, freshness, location, and how people have interacted with similar results before. The output is the familiar list of blue links, plus features like the "People also ask" box and, since 2024, the AI Overview.

**SEO**, search engine optimisation, is shaping your pages so Google ranks them higher for queries you care about: matching what searchers type, structuring content so it's easy to parse, earning links, keeping the site fast. The payoff has always been the click.

**A featured snippet** is the older version of the thing people now panic about: Google lifting a sentence or list straight from a page and showing it at the top. It still sends a click, because it names and links the source.

**An AI Overview** is Google generating a several-sentence answer from multiple pages, shown above the blue links. It cites sources, but the links sit below the fold of the answer, and the answer is often complete enough that there's no reason to click.

**AEO**, answer engine optimisation, also called GEO, generative engine optimisation, is the newer practice of trying to be the page an AI answer draws from and credits. Whether it's a real craft or SEO with new vocabulary is still argued. What isn't argued: the goal has shifted from "get the click" to "be the cited source", and those are not worth the same to a business.

That shift is what the traffic studies are trying to measure.

## The two studies worth citing

### Pew Research: what people actually did

In March 2025, Pew recorded the real browsing of 900 US adults across 68,879 Google searches. Roughly 12,600 of those searches produced an AI summary.

The core finding: on search pages with an AI summary, users clicked a traditional result in 8% of visits. On pages without one, they clicked in 15%. People also almost never clicked the links inside the summary itself, doing so in just 1% of visits. And they were more likely to stop browsing entirely after a page with a summary: 26% of those visits ended the session, against 16% without.

The study is strong because it watched real behaviour on real search pages instead of asking people to recall it. Its limits: US-only, one month, a 900-person panel, and no translation of the numbers into what a site owner should actually do.

### Ahrefs: what happened to click-through rate

Ahrefs took 300,000 keywords, split evenly between keywords that triggered an AI Overview and informational keywords that didn't, and compared click-through rates before and after the feature rolled out. Its April 2025 write-up reported that the presence of an AI Overview "correlated with a 34.5% lower average clickthrough rate for the top-ranking page."

Two things to hold onto. First, that 34.5% is not the raw drop. The top-position click-through rate on AI Overview keywords fell from 0.073 to 0.026; the 34.5% figure compares the actual 0.026 to a forecast of what it would have been (0.040) without the feature. Second, it covers informational queries almost exclusively. Ahrefs notes that 99.2% of keywords triggering an Overview are informational in intent, so this tells you little about transactional or branded searches.

Ahrefs re-ran the study in May 2026, this time comparing December 2023 to December 2025 using Search Console data. The new headline: a 58% lower click-through rate for top-ranking pages, "up from 34.5% just eight months ago", with position-two pages losing about half their clicks and even position ten down nearly 20%. As their content lead put it, "out of every 100 clicks that once went to top-ranking websites, Google now keeps 58."

The jump from 34.5% to 58% is the lesson. AI Overviews did not get twice as damaging in a year. The window moved, the data source changed from a click-model to Search Console, and the effect is genuinely growing. When two runs of one study by one team disagree, a roundup that flattens them into a single number has dropped the part you needed.

## How a scoped finding becomes a headline

The path from study to viral stat usually runs like this. A researcher publishes "34.5% lower CTR at position one, on informational keywords, correlational." A blog rounds it to "AI Overviews cut clicks 34.5%." The next blog drops the decimal: "35% drop in traffic." A third cites the second, not the first. By the time it reaches your feed, "35%" has lost the position, the intent filter, the correlation caveat, and the distinction between click-through rate and traffic.

Five questions catch most of it:

1. **Who measured it?** A primary researcher with a named method, or a vendor quoting another vendor?
1. **What was the sample?** How many searches or keywords, over what period, in which country?
1. **What was the comparison?** With-summary versus without? Before versus after? Against a forecast?
1. **What exactly moved?** Click-through rate is not sessions. Position-one CTR is not sitewide traffic. Zero-click share is not your loss.
1. **Is the number a rate or a total?** "58% lower CTR" and "58% of your traffic gone" are different claims, and roundups routinely swap them.

Zero-click share is the figure most often stretched past what it can bear. Similarweb, whose clickstream data also feeds the widely cited SparkToro analysis, reported in June 2026 that "zero-click searches ... now represent 68% of all Google searches" — and flags that its own earlier comparison numbers came from a weaker panel. That describes the whole search landscape, not your site. It's context for the trend, not a measure of what any one publisher lost.

## What this means for one specific site

Population numbers don't transfer directly to your pages.

"8% versus 15%" is a click rate across a whole panel of searches, not your page's click-through rate. It says the average search with a summary sends roughly half the clicks of one without. If you rank for queries that rarely trigger a summary, your exposure is below that average; if you live on long, question-shaped informational queries, it's above.

"34.5% lower at position one" is a relative change in click-through rate on informational keywords, not a 34.5% cut to your traffic. Suppose a page gets 10,000 monthly impressions at position one and a 30% click-through rate, so 3,000 clicks. If an Overview starts showing on those queries and drops the click-through rate by a third, you land near 20%, or about 2,000 clicks. That's the shape of the loss: a click-through-rate haircut on the affected slice of your queries, not a uniform percentage off the whole site.

## Measure your own loss

Google does not separate AI Overview impressions from blue-link impressions in Search Console; every appearance lands in the same bucket. So this is an estimate, not a clean read. A workable approach:

1. In Search Console, compare a recent period against the same length of time before AI Overviews became common for your queries. Use the same season where you can.
1. Segment queries. Pull out the ones that are ten or more words, phrased as questions, or clearly informational. Those are your exposed set. Branded and transactional queries are your control.
1. Look for the tell: impressions flat or rising while clicks fall, and average position steady. If you're still ranking where you were but getting fewer clicks, something is intercepting them on the results page.
1. Estimate lost clicks as (current impressions × your prior click-through rate) − current clicks, on the exposed segment only.
1. Sanity-check against your analytics. If organic sessions to those landing pages dropped in step, the estimate holds.

The limits are real: you can't isolate Overviews from a normal ranking shift, seasonality, or a Google core update in the same window. Treat the output as a range, not a figure.

## Are you exposed?

Pew's own breakdown is the fastest way to score yourself. Summaries appeared on 8% of one-to-two-word searches but 53% of searches with ten or more words, and about 60% of queries starting with "who", "what", "when" or "why".

Export your top queries from Search Console and tag them: word count, question or not, informational or transactional. The share that is long, question-shaped and informational is roughly the share of your search demand that's in the line of fire. A recipe site or a "how to" publisher will find most of its traffic there. A pricing-page or comparison-driven business, much less.

## The India timeline

Most of the numbers in this debate describe the US. Pew's panel is 900 US adults. The clickstream studies behind the zero-click figures skew US. So if your audience is India-heavy, weight those studies accordingly rather than reading them as your own curve.

Google brought AI Mode to India in June 2025 "as an experiment in Labs in English", and says AI Overviews are already "driving a more than 10% increase in usage for the types of queries where they appear" in its biggest markets, which it names as the US and India. The direction is the same; the timing and the language coverage are not, and an English-only rollout lands differently on an audience that searches across several languages.

## "But AI traffic converts better"

This turns up whenever the traffic-loss numbers land, usually sourced to vendor "state of" surveys of companies that have already invested in AEO. A self-selected survey of people who bought a thing can tell you they like it; it can't tell you the average site converts better on AI referrals.

Test it directly. In analytics, isolate sessions referred from AI assistants and compare their conversion rate and revenue per session against your organic search baseline. If AI referrals convert better for you, the segment will show it. If not, you've skipped a strategy built on someone else's survey.

## What to change, and what to leave alone

**Change:** assume long, informational, question-shaped content will earn fewer clicks per ranking than it did, and price that into what you commission. Put more weight on queries a summary can't satisfy: anything needing your proprietary data, a login, a tool, a transaction, or a genuinely current answer. Start measuring citation and brand mentions in AI answers, while remembering that being cited is not the same as being paid.

**Leave alone:** the fundamentals. Ranking still decides whether you're in the running to be cited at all. A fast, well-structured, genuinely useful page is still the requirement, not a legacy tactic. And don't refactor around a borrowed percentage. Measure your own exposed segment, watch it for a quarter, and act on what your Search Console actually shows.

## Sources

- [Google users are less likely to click on links when an AI summary appears in the results — Pew Research Center, 22 July 2025](https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results/)
- [AI Overviews Reduce Clicks by 34.5% — Ahrefs, 17 April 2025](https://ahrefs.com/blog/ai-overviews-reduce-clicks/)
- [Google AI Overviews decrease CTRs by 34.5%, per new study — eMarketer](https://www.emarketer.com/content/google-ai-overviews-decrease-ctrs-by-34-5-per-new-study)
- [New Research: Google's AI Overviews Now Cost Websites 58% of Their Clicks — Ahrefs press release (via Yahoo Finance), 19 May 2026](https://finance.yahoo.com/sectors/technology/articles/research-googles-ai-overviews-now-081300259.html)
- [Zero-click marketing: what the 2026 data means — Similarweb, 10 June 2026](https://aisearch.similarweb.com/blog/zero-click-marketing/)
- [Google Search: Introducing AI Mode in India — Google, June 2025](https://blog.google/intl/en-in/products/google-search-introducing-ai-mode-in-india/)

<!--
Artwork brief — from the writer routine. Draw per docs/ARTWORK.md,
then delete this comment.

- **Argument in one sentence:** The click that used to reach the site now stops at the answer on the results page, and the exact size of that loss depends on which queries you rank for.
- **Geometry:** A horizontal flow of thin arrows moving left to right toward a column of stacked rectangles (the site). Most arrows are intercepted partway by a single heavy horizontal rule (the AI Overview) and stop there; a thinner set continues through to the rectangles.
- **Accent:** ochre, for money and incentives. This is a piece about lost traffic as lost revenue, and about vendor numbers sold as fact.
- **The deliberate imperfection:** one arrow passes cleanly through a small gap in the heavy rule and reaches the site, slightly brighter than the rest, marking the queries a summary can't answer.
-->
