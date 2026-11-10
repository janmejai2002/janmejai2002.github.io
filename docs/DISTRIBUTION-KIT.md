# Distribution kit

Ready-to-post launch copy. Post one a week, from your own accounts, and stay in the comments for the first two hours. On Hacker News and Reddit, put the finding in the post and add the link once the discussion has started, or where the community's rules allow it.

Do not promote the Salesforce or Duolingo autopsies until their unsourced figures are checked (see "Before you post" below).

## 1. AI claims tracker (LinkedIn first, then r/consulting)

Link: https://janmejai2002.github.io/tracker/

> Klarna's AI did the work of 700 agents. Fourteen months later its CEO said cost had been "a too predominant evaluation factor" and Klarna started rehiring people.
>
> Commonwealth Bank says AI helped cut fraud losses by over 20%, in the same period as an A$900m-plus fraud programme and new scam rules.
>
> Uber's QueryGPT write-up gives time saved and no accuracy rate.
>
> I started a public tracker of AI deployment claims: what was said, what the evidence supports, and the source so you can check it. Six entries so far. Which claim should I check next?

## 2. Temperature zero (r/LocalLLaMA, r/MachineLearning)

Link: https://janmejai2002.github.io/blog/why-ai-gives-different-answers-every-time/

Title: `Temperature 0 gave 80 different completions in 1,000 runs. Here's the batching reason, in plain language`

> Thinking Machines ran one prompt through Qwen3-235B 1,000 times at temperature zero. The text matched for 102 tokens, then split: 992 runs said "Queens, New York" and 8 said "New York City". Batch size changes with server load, that changes the order of floating-point additions, and a near-tie between two tokens can flip. I wrote it up for people who ship on top of these APIs, including what does give you repeatable output.

## 3. Uber QueryGPT (r/dataengineering)

Link: https://janmejai2002.github.io/blog/uber-querygpt-text-to-sql-case-study/

Title: `The "140,000 hours saved" QueryGPT number isn't in Uber's own write-up`

> I went back to Uber's post. It gives about 10 minutes down to about 3 per query, around 300 daily users in limited release, and no accuracy rate. The useful design choice is routing each question to a workspace of vetted tables before writing SQL. The first version had 7 tables and 20 sample queries.

## 4. Big Four graduate hiring (LinkedIn)

Link: https://janmejai2002.github.io/blog/the-big-four-blame-ai-for-the-graduate-hiring-cuts-the-wider/

> KPMG cut graduate hiring 29%. Deloitte cut 18%. The headlines blamed AI.
>
> Then look at the job boards. Indeed says UK graduate postings fell 12%. The Institute of Student Employers says 7%. Target Connect says they rose 8%. PwC still hired 3,200 graduates in the US.
>
> Before we tell a graduating class that AI took their jobs, we should explain why three datasets disagree.

## 5. Block's champions program (r/ExperiencedDevs, LinkedIn)

Link: https://janmejai2002.github.io/blog/block-ai-champions-program-goose/

> Block gave 50 engineers 30% of their week to make their repos readable by agents. Three months later AI-authored code was up 69% in those repos. That number has a named cohort and a defined window.
>
> The later claim of 150% more code per engineer "since the start of the year" spans a period when Block cut about 4,000 jobs. Fewer engineers shrinks the denominator.

## 6. Prompt caching calculator (r/LLMDevs, X)

Link: https://janmejai2002.github.io/tools/prompt-caching-calculator/

> A timestamp at the top of your system prompt means every call pays the cache write premium and none collect the read. I built a small calculator: enter your prefix size, calls per run and prices, and it gives monthly cost with and without caching, plus break-even.

## Before you post

Check the figures in each post against its linked source. For outreach, these are worth emailing with a one-line pitch and the tracker link: AI newsletter editors, people who write about AI ROI, and anyone already quoting the Klarna numbers.
