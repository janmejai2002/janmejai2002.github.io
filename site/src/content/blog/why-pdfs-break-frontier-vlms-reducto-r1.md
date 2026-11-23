---
title: 'Why PDFs Still Break Frontier VLMs: Inside Reducto''s R1 Stack'
description: 'Reducto CEO Adit Abraham explains why frontier VLMs silently drop PDF rows, how R1 halves extraction costs from 4.5 cents, and why traceability wins.'
pubDate: 2026-11-23
publishedAt: '2026-11-23T13:51:40.986Z'
track: talks
question: 'Why do frontier VLMs fail silently on complex PDFs, and when does a specialized parser beat them?'
heroImage: '../../assets/art/why-pdfs-break-frontier-vlms-reducto-r1-light.webp'
heroImageDark: '../../assets/art/why-pdfs-break-frontier-vlms-reducto-r1-dark.webp'
heroAlt: 'Minimal geometric schematic comparing a document page with a silently dropped dashed row on the left against a fully bounded and vermilion-sealed traceable extraction grid on the right.'
readingTime: '5 min read'
notionId: '421ced67-050a-8189-8743-f5249f9e5ebd'
---
<div class="tldr">

## Executive TL;DR

- Reducto CEO Adit Abraham notes that PDFs were engineered for printer fidelity, leaving vision-language models to reconstruct semantic layout from pixels ([Latent Space](http://www.youtube.com/watch?v=KgqWyVVH4Oc)).
- At over 1 billion pages processed per month, Reducto shifted from renting 12+ external models to its in-house R1 model to hit a better accuracy, cost, and latency frontier.
- Even with uncapped reasoning time, frontier VLMs fail silently on recall by dropping table rows and context that production pipelines cannot detect without an auditing harness.
- High-stakes workflows in healthcare and finance require bounding-box traceability and reliable human-escalation scores alongside raw extraction accuracy.
- Independent benchmarks confirm the gap: on 225 long documents, GPT-5.5 and Gemini 3.1 Pro returned roughly half the ground-truth fields while specialized extraction exceeded 99 percent recall ([Reducto](https://reducto.ai/blog/reducto-leads-benchmark-complex-document-extraction)).

</div>

## 1. The Core Argument in Three Sentences

Because the PDF format was designed to preserve exact visual layout for printers, frontier vision-language models struggle to extract dense enterprise tables without silently omitting rows or context. Reducto found that post-training an end-to-end in-house model (R1) on document primitives outperforms general foundation models across accuracy, cost, and latency simultaneously while cutting structured extraction prices in half. For applied teams in regulated industries, solving document intelligence depends on bounding-box traceability, confidence calibration for human escalation, and continuous evaluation of long-tail failure modes.

## 2. Five Timestamped Inflection Points

### [00:02:52] PDFs Were Built for Printers, Not AI Agents

Abraham traces modern document extraction failures back to the original purpose of the PDF specification. Because PDFs encode drawing instructions for physical ink placement, there is no guaranteed semantic tree underneath for an agent to query:

> "the original context for PDF as a file format was for printers to be faithful to the original right and so it wasn't really designed around this sort of problem of agents are going to read it"

### [00:06:12] Why Post-Trained Specialists Beat Renting Frontier Models

Reducto originally orchestrated over a dozen smaller vision models and frontier APIs, routing hard pages to larger models. Over time, Abraham says specialized post-training on document tasks beat general models on every production axis:

> "we care a lot about that sort of perto frontier of accuracy cost and latency yeah and we keep finding that if you are looking at a specific type of task a post-trained model on that task outperforms on all three dimensions and so our stack has shifted more and more towards in-house over time"

### [00:07:31] Frontier Models Fail Silently on Recall

When teams ask why they cannot just pass PDFs straight into a frontier reasoning model, Abraham points to an asymmetric failure mode. Uncapped reasoning improves precision on visible fields while quietly skipping entire sections:

> "a lot of these specialized document processing platforms were worse than frontier models uh when you set uncap reasoning time but the failure mode for the frontier models was on recall so they were silently dropping rows um missing bits of context like those sorts of things"

### [00:11:47] Traceability and Escalation Matter More Than 99% Averages

In healthcare claims or legal contracts, a 1 percent error rate is still unacceptable if the system cannot flag which field is uncertain. Abraham explains why Reducto evaluates escalation reliability alongside raw extraction:

> "traceability becomes really important like being able to know where something was extracted from being able to say uh exactly what a human should look at if they're reviewing it um and also having things like accurate confidence scoring so they know when to look at a certain thing"

### [00:46:41] Halving Structured Extraction Cost at 1 Billion Pages a Month

Moving to in-house R1 and updated extraction models changed Reducto's unit economics at over a billion pages per month. Abraham notes that structured extraction dropped from more than 4.5 cents per page to half that rate:

> "historically a page of structured extraction would have cost you all in like over 4.5 cents and now we're able to do that at half the rate while also improving performance"

## 3. What Was Claimed vs. What Benchmarks Prove

Abraham's critique of frontier VLMs on long-document recall holds up against both commissioned and independent academic benchmarks. On LongExtractionBench, a 225-document benchmark executed by micro1 with an average of 88,700+ fields per document, Gemini 3.1 Pro and Claude Opus 4.8 completed only 112 and 116 documents respectively, while GPT-5.5 returned 52.7 percent of ground-truth fields and Gemini returned 48.6 percent recall compared to 99.6 percent recall for Reducto Deep Extract ([Reducto](https://reducto.ai/blog/reducto-leads-benchmark-complex-document-extraction)). An independent July 2026 academic benchmark on schema-guided enterprise extraction similarly found that commercial VLMs drop below 40 percent on long documents, while Reducto Deep Extract reaches 92.0 percent overall and drops to 87.5 percent on dense multi-level tables ([arXiv 2607.29677](https://arxiv.org/html/2607.29677v1)).

Token and pixel math also explains why renting general VLMs breaks unit economics at enterprise volume. Converting a single high-resolution PDF page into image patches consumes roughly 1,500 to 2,000 visual tokens, meaning a 200-page technical manual burns more than 300,000 input tokens before a single question is asked, pushing bulk processing of 10,000 documents to roughly USD 30,000 per month ([Medium AI by Design](https://medium.com/ai-by-design/processing-long-documents-with-vlms-cost-sav-140da9e78b8c)). As independent practitioners note, vision-only parsing also lacks deterministic bounding boxes and suffers from omission hallucinations on dense tables, where models drop rows silently while deterministic text spans preserve exact coordinates ([Towards Data Science](https://towardsdatascience.com/vision-llms-are-pdf-parsers-too-reading-charts-and-diagrams-for-rag/)).

Finally, Reducto's published pricing confirms Abraham's cost numbers at [00:46:41]: prior all-in structured extraction billed USD 0.03 per page for extraction plus USD 0.015 per page for parsing (USD 0.045 total), before moving to an all-in USD 0.02 per page rate and USD 0.01 per page for `r-1` parsing ([Reducto Pricing](https://reducto.ai/blog/reducto-simple-transparent-document-processing-pricing)).

## 4. What This Changes for Applied Engineers

1. **Audit extraction pipelines for recall alongside spot-checked precision.** Measure missing rows, dropped table cells, and skipped pages explicitly against ground-truth field counts, because frontier VLMs routinely omit dense table blocks silently without throwing an API error or schema exception.
1. **Require spatial bounding boxes on every extracted field.** Reject black-box markdown or JSON outputs in regulated workflows unless the parser returns page coordinates so reviewers can verify citations in one click.
1. **Route by page complexity to avoid 2,000-token vision bloat.** Use cheap deterministic text spans on clean digital PDFs and reserve vision-language or specialized layout models for scanned, tilted, or merged-cell pages.
1. **Build continuous regression sets from low-confidence escalations.** Log production pages where confidence scores drop or reviewers override a field, and fold those edge cases into an ongoing evaluation suite.

## Sources

- [Cooking with Reducto's CEO: Why PDFs Still Break AI - Adit Abraham](http://www.youtube.com/watch?v=KgqWyVVH4Oc)
- [Reducto Deep Extract Leads Benchmark on Complex Document Extraction](https://reducto.ai/blog/reducto-leads-benchmark-complex-document-extraction)
- [A Benchmark for Schema-Guided Enterprise Document Extraction (arXiv 2607.29677)](https://arxiv.org/html/2607.29677v1)
- [Introducing Simpler, More Transparent Pricing at Reducto](https://reducto.ai/blog/reducto-simple-transparent-document-processing-pricing)
- [Vision LLMs are PDF Parsers Too: Reading Charts and Diagrams for RAG - Towards Data Science](https://towardsdatascience.com/vision-llms-are-pdf-parsers-too-reading-charts-and-diagrams-for-rag/)
- [Processing Long Documents with VLMs: Cost Saving Strategies](https://medium.com/ai-by-design/processing-long-documents-with-vlms-cost-sav-140da9e78b8c)

<!--
Artwork brief — from the writer routine. Draw per docs/ARTWORK.md,
then delete this comment.

Minimal geometric diagram on warm paper comparing two document pages side by side: on the left, a page grid with solid extracted rows and one dashed gap showing a silently dropped table row; on the right, a verified page grid where every cell is anchored inside a solid bounding box with a vermilion hanko traceability seal on the critical cell. No text, no labels, strict paper, ink, border, and hanko palette.
-->
