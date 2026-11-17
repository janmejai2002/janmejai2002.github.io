---
title: 'Next-Token Prediction Forces AI to Guess Rather Than Say No'
description: 'OpenAI''s hallucination study proves LLMs invent citations because next-token training and binary tests reward guessing (75% errors) over saying I don''t know.'
pubDate: 2026-11-17
publishedAt: '2026-11-17T22:53:08.184Z'
track: basics
question: 'Why do AI chatbots invent fake citations with total confidence instead of admitting they do not know?'
keywords:
  - Why AI Hallucinates Explained
  - Next-Token Prediction
  - LLM Confidence Trap
  - AI Fake Citations
heroImage: '../../assets/art/why-ai-hallucinates-next-token-exam-light.webp'
heroImageDark: '../../assets/art/why-ai-hallucinates-next-token-exam-dark.webp'
heroAlt: 'Minimalist geometric diagram showing three solid left blocks reaching a central decision node where an upper ink path stops at a barrier while a lower plum path arcs into three hollow right-hand blocks with the final block tilted off-grid.'
readingTime: '8 min read'
notionId: '41bced67-050a-8185-a37c-f3dd3fe61f99'
---
<div class="tldr">

## Executive TL;DR

- **Hallucinations are not mysterious bugs; they are test-taking guesses:** In [*Why Language Models Hallucinate* (arXiv:2509.04664)](https://arxiv.org/abs/2509.04664), OpenAI and Georgia Tech researchers **Adam Tauman Kalai, Ofir Nachum, Santosh S. Vempala, and Edwin Zhang** prove that AI models fabricate facts because standard training and evaluation benchmarks reward blind guessing over admitting uncertainty ([OpenAI Research](https://openai.com/index/why-language-models-hallucinate/)).
- **Even AI researchers' own biographies get fabricated:** When the study's authors asked a widely used chatbot for co-author Adam Tauman Kalai's PhD dissertation title and birthday, it confidently invented **three different dissertation titles and three different birthdates, all 100% false** ([OpenAI Research](https://openai.com/index/why-language-models-hallucinate/)).
- **Next-word pretraining masters grammar but cannot memorize every rare fact:** Because pretraining predicts the next word across unlabeled text without `"true"` or `"false"` tags, consistent rules like spelling and parentheses converge near 100%, while rare arbitrary facts (like a birthdate or court case number) behave like guessing a pet's birthday from a photograph ([OpenAI Research](https://openai.com/index/why-language-models-hallucinate/)).
- **Binary grading (`1` for right, `0` for blank) penalizes honesty:** On a birthday question, saying *"I don't know"* guarantees **0 points**, whereas guessing a random date gives a **1-in-365 chance** of scoring points; across thousands of benchmark questions, bluffing models beat honest models on accuracy-only leaderboards ([OpenAI Research](https://openai.com/index/why-language-models-hallucinate/)).
- **Teaching models to abstain slashes hallucinations from 75% to 26%:** On OpenAI's `SimpleQA` benchmark, `OpenAI o4-mini` abstained only **1%** of the time and suffered a **75% hallucination error rate** (`24%` accuracy), whereas `gpt-5-thinking-mini` abstained **52%** of the time when unsure and cut its **error rate to 26%** (`22%` accuracy) ([OpenAI Research](https://openai.com/index/why-language-models-hallucinate/)).

</div>

## The Fluent Liar Paradox: Why Grammar Looks Like Expertise

Almost everyone who uses an AI assistant has lived through this exact moment: you ask a chatbot for three court cases, academic papers, or Python library functions to support a project. Within two seconds, the chatbot replies in crisp, authoritative prose, complete with author names, publication years, journal volume numbers, and page ranges.

Then you try to look up the first paper. The journal exists, the author is a real professor, and the title sounds exactly like something that professor would write. **But the paper itself does not exist.** The chatbot stitched together a real author, a plausible title, and a fake year with the calm poise of a senior librarian.

In the [OpenAI and Georgia Tech research paper *Why Language Models Hallucinate* (`arXiv:2509.04664`)](https://arxiv.org/abs/2509.04664), computer scientists **Adam Tauman Kalai, Ofir Nachum, Santosh S. Vempala, and Edwin Zhang** tested this phenomenon on themselves. When they asked a popular commercial chatbot for the title of Adam Tauman Kalai's own PhD dissertation, the chatbot confidently generated **three completely different dissertation titles, none of them right**. When they asked for his birthday, it gave **three different dates, all wrong** ([OpenAI Research](https://openai.com/index/why-language-models-hallucinate/)).

Why does a machine that writes flawless English grammar and solves complex calculus problems invent fake facts instead of simply saying, *"I don't know"*?

Because **fluency is a rule-based pattern, while isolated facts are arbitrary**, and we grade AI models using the exact same broken incentive system as a multiple-choice exam with no penalty for guessing ([OpenAI Research](https://openai.com/index/why-language-models-hallucinate/); [arXiv:2509.04664](https://arxiv.org/abs/2509.04664)).

## One Word at a Time: How Next-Token Prediction Works Without a Fact Database

To understand why an AI model can sound 100% sure while making up a book title, separate a **search engine** from a **language model**.

When you type a query into Google Search or a company database, the software looks up real documents stored on a hard drive. If no document matches, the database returns `0 results`.

A **Large Language Model (LLM)** does not have a filing cabinet of verified articles inside its weights. During its first stage of creation, called **pretraining**, the model reads trillions of words of human text and plays one game billions of times: **Next-Token Prediction** (where a **token** is a word or word piece, roughly `0.75` English words) ([OpenAI Research](https://openai.com/index/why-language-models-hallucinate/)).

As Kalai and his co-authors point out, **pretraining text has no `"True"` or `"False"` labels attached to its sentences** ([OpenAI Research](https://openai.com/index/why-language-models-hallucinate/); [arXiv:2509.04664](https://arxiv.org/abs/2509.04664)). The model only sees positive examples of what fluent human writing looks like, and tries to estimate the probability of which word comes next.

Look at how that statistical game treats **grammar rules** differently from **rare facts** ([OpenAI Research](https://openai.com/index/why-language-models-hallucinate/)):

1. **Why Spelling and Citation Formats Never Fail (High-Frequency Patterns):** Every time an academic citation appears on the internet, it follows the exact same structural pattern: `[Last Name], [Initial]. ([Year]). "[Title of Paper]," Journal of [Topic], [Volume]([Issue]), [Start Page]-[End Page].` Because the model has seen that structural template millions of times, it learns the formatting rules with near-100% precision, just like it learns to close every open parenthesis `(` with a matching `)`.
1. **Why Rare Facts Turn Into Coin Flips (The Pet Birthday Analogy):** Now ask the model to fill in the exact `[Start Page]` or a specific researcher's birthday inside that template. OpenAI's researchers offer a vivid analogy: imagine training an image classifier on millions of photos labeled `"cat"` or `"dog"` ([OpenAI Research](https://openai.com/index/why-language-models-hallucinate/)). Because cats and dogs have consistent visual features, the classifier quickly reaches 99% accuracy. Now imagine labeling each pet photo with **the pet's birthday** (`"March 14"`, `"July 22"`) and asking the algorithm to predict a new dog's birthday from its photo! Because a pet's birthday is an arbitrary fact that cannot be deduced from its fur or ears, the model is forced to guess a plausible-looking date.
1. **Trace How a Fake Citation Is Born Token by Token:**

- **Step 1:** You ask: *"Give me a 2023 paper by Dr. Rao on battery cooling."*
- **Step 2:** The model starts the citation format: `Rao, S. (2023).`
- **Step 3:** Now it must pick the next word. It has no `"I don't know"` button inside the middle of a citation template. It calculates which words most frequently follow `"Rao, S. (2023)."` and `"battery cooling"` in physics journals, picking `"Thermal"`, then `"Management"`, then `"in"`, then `"Lithium-Ion"`, then `"Packs."`
- **Step 4:** Each individual word choice is the highest-probability continuation of the sentence, producing a citation that reads like a masterpiece and is completely fictional.

## The Multiple-Choice Trap: Why Training Penalizes Saying "I Don't Know"

If pretraining creates the statistical urge to complete the pattern, why doesn't **post-training** (where engineers fine-tune the model using human feedback and reinforcement learning) teach the AI to stop and say *"I don't know"* whenever its confidence is low?

In [*Why Language Models Hallucinate* (`arXiv:2509.04664`)](https://arxiv.org/abs/2509.04664), Kalai, Nachum, Vempala, and Zhang proved a sobering truth: **AI models refuse to say "I don't know" because the AI industry's own scoreboards punish honesty and reward bluffing** ([OpenAI Research](https://openai.com/index/why-language-models-hallucinate/)).

Think back to taking a standardized multiple-choice test in school where there is **no penalty for wrong answers**:

- If you do not know the answer to Question 42 and **leave it blank** (or write *"I am not sure"*), you are guaranteed **0 points**.
- If you close your eyes and **guess Option B**, you have a **25% chance** of getting **1 full point** for free.
- Or, as OpenAI's paper notes, if someone asks for an unknown birthday: saying *"I don't know"* scores **0%**, while guessing *"September 10"* gives you a **1-in-365 chance** of being right ([OpenAI Research](https://openai.com/index/why-language-models-hallucinate/)).

Nearly every famous AI benchmark leaderboard grades models using **binary accuracy** (`Right = 1 point`, `Wrong = 0 points`, `Abstention / "I don't know" = 0 points`) ([OpenAI PDF](https://cdn.openai.com/pdf/d04913be-3f6f-4d2b-b283-ff432ef4aaa5/why-language-models-hallucinate.pdf)). When you train a model to maximize its score on binary leaderboards, **the mathematically optimal strategy for the AI is to guess with 100% confidence on every single question where it is uncertain**!

OpenAI demonstrated this exact trade-off using real benchmark numbers from the `SimpleQA` factual evaluation in the GPT-5 System Card ([OpenAI Research](https://openai.com/index/why-language-models-hallucinate/)):

| Response Category on `SimpleQA` | What the Model Actually Did | `OpenAI o4-mini` (Trained to Guess) | `gpt-5-thinking-mini` (Trained to Abstain) | What This Means for Everyday Users |
| --- | --- | --- | --- | --- |
| **Abstention Rate (`"I don't know"`)** | Model admits it lacks the exact fact and declines to guess | **1%** ([OpenAI](https://openai.com/index/why-language-models-hallucinate/)) | **52%** ([OpenAI](https://openai.com/index/why-language-models-hallucinate/)) | `gpt-5-thinking-mini` openly flags when a question needs web search or a document |
| **Accuracy Rate (Correct Answer)** | Model states the exact verified truth | **24%** | **22%** | Guessing (`o4-mini`) edges out honesty by 2 points on naive accuracy leaderboards |
| **Error / Hallucination Rate (Wrong Answer)** | Model confidently states a false fact as truth | **75%** ([OpenAI](https://openai.com/index/why-language-models-hallucinate/)) | **26%** ([OpenAI](https://openai.com/index/why-language-models-hallucinate/)) | Rewarding abstention cuts confident hallucinations by **nearly two-thirds (from 75% to 26%)** |

On a traditional leaderboard that only looks at the **Accuracy Rate** row, the bluffing model (`o4-mini` at `24%`) ranks higher than the honest model (`gpt-5-thinking-mini` at `22%`), even though `o4-mini` fabricates false answers **75% of the time**!

The paper also debunks a popular myth: **you do not need a giant supercomputer model to know what you do not know**. A tiny model that speaks zero Maori can easily know with 100% certainty that it should say *"I don't know"* when handed a question in Maori; **calibration** (knowing your limits) requires far less compute than universal knowledge ([OpenAI Research](https://openai.com/index/why-language-models-hallucinate/)).

## Four Habits That Catch Hallucinations Before You Hit Send

Until every benchmark in the AI industry switches from binary grading to **confidence-target grading** (penalizing confident wrong answers more than abstentions, like standardized tests with negative marking per [arXiv:2509.04664](https://arxiv.org/abs/2509.04664)), you can change the rules of the exam yourself in every prompt you write:

1. **Give the Model Explicit Permission (and Points) to Say "I Don't Know":** Add an explicit abstention rule to factual prompts: *"If you are not 100% certain of a real case name, date, or URL, write `[UNVERIFIED - DO NOT GUESS]` instead of guessing. An honest `[UNVERIFIED]` is a passing score; a guessed citation is a failure."*
1. **Turn Memory Questions into Open-Book Reading Tasks:** Never use a naked language model as a closed-book encyclopedia for exact numbers, quotes, URLs, or dates. Turn on **live web search** or paste the actual source PDF/article into the prompt and write: *"Answer using only the pasted text below, and quote the exact sentence that supports each claim."*
1. **Never Trust a Citation, URL, or Package Name Without Clicking It:** Because citations, URLs (`https://...`), and software package imports follow predictable grammar templates, they are the #1 place where next-token prediction invents plausible-looking fakes. Always verify the link or package name in the official registry before citing or installing it.
1. **Separate Brainstorming Prompts from Fact-Checking Prompts:** Use high-creativity chat prompts when you want ideas or outlines; when verifying facts, ask the model: *"List every specific number, date, and named source in the draft above that you cannot verify from the text I provided."*

## Sources

- [Why language models hallucinate: OpenAI Research](https://openai.com/index/why-language-models-hallucinate/): Official September 2025 research overview by Adam Kalai, Santosh Vempala, Ofir Nachum, and colleagues documenting the PhD dissertation/birthday hallucination test, the pet-birthday pretraining analogy, the 1-in-365 multiple-choice guessing incentive, and the `SimpleQA` comparison between `OpenAI o4-mini` (1% abstention, 24% accuracy, 75% error rate) and `gpt-5-thinking-mini` (52% abstention, 22% accuracy, 26% error rate).
- [Why Language Models Hallucinate (arXiv:2509.04664): Kalai, Nachum, Vempala, and Zhang](https://arxiv.org/abs/2509.04664): Primary theoretical paper proving that pretraining hallucinations reduce to binary classification error rates and persist because leaderboard evaluations penalize abstention.
- [Why Language Models Hallucinate (Full Technical Paper PDF): OpenAI / Georgia Tech](https://cdn.openai.com/pdf/d04913be-3f6f-4d2b-b283-ff432ef4aaa5/why-language-models-hallucinate.pdf): Complete mathematical proofs of Theorem 3 (multiple-choice calibration bounds) and socio-technical recommendations for confidence-target benchmark scoring.

<!--
Artwork brief — from the writer routine. Draw per docs/ARTWORK.md,
then delete this comment.

- Argument in one sentence: When an evaluation scoreboard awards zero points for saying "I don't know," an uncertain language model is forced to extend its token chain onto a fabricated branch rather than stopping cleanly at the boundary of what it knows.
- Geometry: On the left, three solid horizontal token blocks (`Verified Context`) feed into a central decision node (`Uncertainty Threshold`) at x=760; an upper honest abstention path (`"I don't know"`) terminates cleanly against a zero-score barrier, while a bold `plum` guessing trajectory leaps across the gap to construct three hollow, ungrounded citation blocks on the right (`75% Error Rate`).
- Accent: plum
- Deliberate imperfection: The rightmost fabricated `plum` citation block sits tilted and detached from the underlying coordinate grid with no vertical anchor line to the floor, visually showing how a fluent next-token guess looks structurally complete while floating without factual grounding.
-->
