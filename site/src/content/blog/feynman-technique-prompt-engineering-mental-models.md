---
title: 'Applying the Feynman Technique to Prompt Engineering'
description: 'Prompt engineering has a mental-model problem, not a syntax problem. The Feynman Technique fixes it — with consulting, HR, and marketing examples.'
pubDate: 2026-08-25
track: technical
keywords:
  - Prompt Engineering
  - Mental Models
  - AI Education
readingTime: '7 min read'
heroImage: '../../assets/art/feynman-technique-prompt-engineering-mental-models-light.webp'
heroImageDark: '../../assets/art/feynman-technique-prompt-engineering-mental-models-dark.webp'
heroAlt: 'Twelve horizontal rules stacked like lines of text in a column. One rule in the middle is interrupted by a gap, and a thin red circle is drawn around that gap.'
notionId: '3c7ced67-050a-81f5-9284-c435c7a9b6f8'
---
You already know the failure mode. You type a request into a chatbot, get back three paragraphs of confident, plausible, slightly-wrong output, and you can't tell if the model misunderstood you or if you never actually told it what you meant. That's not a syntax problem. It's a mental-model problem, and there's a fix for it that has nothing to do with AI at all.

## Why prompt engineering exists at all

Every explanation — yours to a colleague, a model's to you — has to cross a gap between what the explainer knows and what the listener needs. Prompting is how you manage that gap from the other side: not "what words unlock the model," but what you had to think through clearly enough to hand over in the first place.

That gap has actually moved. In 2023, prompt engineering was mostly about coaxing reasoning out of models that didn't do it on their own — chain-of-thought tricks, "think step by step," few-shot examples to nudge a pattern into place. By 2026, models with extended thinking reason internally before they answer, so scripting the reasoning for them is often wasted effort. What replaced it is closer to information architecture than incantation: the skill isn't finding magic words, it's deciding what the model actually needs to know, in what order, before it can do the part only it can do.

That's a shift most explanations of prompt engineering skip past, and it's exactly the gap the Feynman Technique was built to close — just not for AI.

## The technique, and the myth about where it came from

Richard Feynman, the physicist, was famous for explaining quantum electrodynamics without hiding behind jargon. But here's the detail almost every "Feynman Technique" article leaves out: Feynman never wrote down a study method, never named four steps, and never called it a technique. The version everyone uses — the one you're about to read — was assembled decades later, largely by writer Scott Young, who noticed a repeatable pattern in how Feynman approached learning and packaged it as a method.

That matters here for a specific reason: the technique isn't a transcription of genius, it's a reverse-engineered process. Which means it's exactly the kind of thing you can hand to a model as a process, step by step, instead of hoping the model already "gets it."

The four steps, adapted for working with an AI model instead of a notebook:

1. **Name the concept.** State precisely what you want explained or produced — not the vague area, the specific thing.
1. **Force the simple explanation.** Have the model explain it as if to someone with no background — or write your own version first, then ask the model to check it.
1. **Find the gap.** Wherever the explanation gets vague, hand-wavy, or jumps a step, that's where you or the model don't actually have a handle on it yet.
1. **Rebuild with a better analogy, then simplify again.** Fill the gap, then cut anything that isn't carrying weight.

Used as a prompting pattern, this stops being a study trick and becomes a diagnostic: it's a way to find out, in real time, whether the model (or you) actually understands the thing being asked for, before you commit an afternoon to output built on a shaky foundation.

## Using it to test whether the model actually gets it

The most useful version of this isn't "explain X simply" as a one-off request. It's a loop: ask for the simple explanation, read it for where it goes soft, and push the model back into the gap you found.

Say you're asking a model to explain a compliance requirement, a market dynamic, or a piece of your own product to a client who's never seen it. Step 2 — force the simple explanation — surfaces the model's actual model of the concept, not just its ability to sound fluent about it. If the "simple" version leans on a term it never defines, or skips from problem straight to solution with nothing connecting them, you've found step 3's gap: that's the part you need to prompt again, specifically, rather than regenerating the whole thing and hoping it lands differently.

This is also where prompting stops being about clever phrasing and starts being about what you, the person prompting, actually understood well enough to ask for. You can't identify the gap in an explanation of something you don't understand yourself — which means using this loop honestly forces you to think through the problem, not just the request.

## A reusable pattern, not a one-off prompt

In practice this becomes a short back-and-forth you can reuse on almost anything:

1. "Explain [the specific thing] as if to someone with no background in [the field]."
1. Read it and mark the sentence where it gets vague, or leans on a term it never defines.
1. "You used [that term/step] without explaining it — walk through just that part, plainly, with a concrete example."
1. Ask for the whole explanation again, incorporating the fix, and check whether a new soft spot appeared.

Two or three passes through that loop usually surface more than a single well-crafted prompt would, because each pass is aimed at a specific, named gap instead of "make this better." The model isn't being asked to be smarter. It's being asked to show its work in a place it previously skipped — and showing the work is what exposes whether there was any work there to begin with.

## Consulting: pressure-testing a recommendation before the client does

A consultant drafting a recommendation can ask a model to explain the recommendation's core logic as if to a client with zero background in the framework being used — no "synergies," no unexplained jargon from the deck. Step 3 does the real work here: wherever the plain-language version has to lean on an unexplained term or skip a logical step to sound clean, that's the same weak point a skeptical client will find in the actual meeting. Finding it during drafting, in a low-stakes back-and-forth with a model, is cheaper than finding it live.

## HR: rewriting a job description without losing what it actually requires

HR teams increasingly use models to convert job descriptions into more inclusive language and strip out inflated requirements. The Feynman loop adds a check most of that rewriting skips: after the model simplifies the listing, ask it to explain back, in plain terms, what a candidate would actually need to be able to do in the role. If that explanation is vague — "strong communication skills," "detail-oriented" — that's the gap. The original listing was probably vague in the same place, and simplifying the language didn't fix it; it just made the vagueness easier to read. Rebuilding that section with a concrete answer ("writes the weekly stakeholder update independently by week three") is step 4, and it's the difference between an inclusive listing and an inclusive listing that still tells nobody what the job is.

## Marketing: turning a feature into a pitch a customer's aunt would understand

Marketers already use models to turn one asset — a webinar, a product update — into a dozen others: a LinkedIn post, ad hooks, an email. The Feynman loop is useful earlier than that, at the point of explaining the feature itself. Ask the model to explain what the feature does to someone with no context on the product category at all. Wherever that explanation reaches for "seamless," "powered by AI," or "the platform that helps you," you've found the gap: those are the words that stand in for an explanation you don't have yet. The fix isn't better copywriting, it's going back to step 1 and naming, specifically, what the feature actually does — then letting the campaign assets get generated from that, not from the vague version.

## The pattern underneath all three

In each case, the technique isn't being used to make the model sound simpler. It's being used to locate the exact place where an explanation — the model's or your own — is covering for something neither of you actually understands yet. That's a more durable skill than any specific prompt template, because it doesn't expire when the next model generation changes what tricks currently work. The four steps don't care whether the "student" being taught is a five-year-old, a client, a job candidate, or a language model predicting the next token. They just find the gap and make you fill it.

## Sources

- [Applied AI Hub — The Feynman Technique Prompt: How to Make AI Explain Anything in 4 Layers of Depth](https://appliedaihub.org/blog/the-feynman-technique-prompt-how-to-make-ai-explain-anything-in-4-layers-of-depth/)
- [Ali Abdaal — The Feynman Technique](https://aliabdaal.com/studying/the-feynman-technique/)
- [Todoist — The Feynman Technique: How to Learn Anything Quickly](https://www.todoist.com/inspiration/feynman-technique)
- [Karo Zieminski — Every AI Prompting Technique That Works on Reasoning Models (2026)](https://karozieminski.substack.com/p/ai-prompting-techniques-reasoning-models-2026)
- [SurePrompts — Prompting Reasoning Models in 2026](https://sureprompts.com/blog/ai-reasoning-models-prompting-complete-guide-2026)
