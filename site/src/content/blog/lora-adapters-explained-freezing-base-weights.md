---
title: 'LoRA Adapters Customize Giant AI Models by Freezing 99% of Weights'
description: 'LoRA freezes base AI weights and trains two thin adapter matrices, cutting GPT-3 175B trainable parameters 10,000x and GPU memory 3x without inference latency.'
pubDate: 2026-11-24
publishedAt: '2026-11-24T23:06:43.344Z'
track: basics
question: 'How does LoRA fine-tune a giant AI model on a single GPU without rewriting billions of parameters?'
keywords:
  - LoRA Explained Simply
  - Low-Rank Adaptation Mental Model
  - Parameter Efficient Fine-Tuning
  - Swap AI Adapters
heroImage: '../../assets/art/lora-adapters-explained-freezing-base-weights-light.webp'
heroImageDark: '../../assets/art/lora-adapters-explained-freezing-base-weights-dark.webp'
heroAlt: 'A large frozen square weight grid beside two thin plum rectangular strips feeding into a merged output rail.'
readingTime: '6 min read'
notionId: '422ced67-050a-81fe-8f4e-ff1ab688aa75'
---
<div class="tldr">

## Executive TL;DR

- **Low-Rank Adaptation (LoRA)** customizes large language models by freezing the pre-trained base weights untouched and training only small, detachable side matrices, typically cutting trainable parameters by roughly 90 percent or more ([Hugging Face LLM Course](https://huggingface.co/learn/llm-course/en/chapter11/4)).
- Applied to GPT-3 175B, LoRA reduced trainable parameters by **10,000x** and GPU memory requirements by **3x** compared with full fine-tuning, while matching full fine-tuning quality ([Hugging Face LLM Course](https://huggingface.co/learn/llm-course/en/chapter11/4); [Hugging Face PEFT](https://huggingface.co/docs/peft/main/en/conceptual_guides/lora)).
- Instead of editing a giant `1,000 x 1,000` grid (`1,000,000` numbers), LoRA multiplies two thin strips of rank `4` (`1,000 x 4` and `4 x 1,000`, totaling `8,000` numbers), a **99.2 percent** parameter reduction.
- After training, LoRA weights can either be merged into the base model with `merge_and_unload()` for zero extra inference latency, or swapped dynamically like modular skill cartridges on a single shared GPU ([Hugging Face PEFT](https://huggingface.co/docs/peft/main/en/conceptual_guides/lora)).

</div>

## The memory wall: why rewriting a whole AI brain breaks normal GPUs

Imagine buying a 7-billion-parameter open-weight language model and wanting to teach it your company's legal contract style or medical terminology. In traditional **full fine-tuning**, the training software unlocks every single number inside the model and adjusts all 7 billion parameters at once.

That approach hits an immediate hardware wall. Storing a 7B model's weights takes roughly 14 GB in 16-bit precision, yet training it requires holding gradients and optimizer states in memory too, quickly multiplying GPU RAM needs past what a single consumer graphics card or laptop can hold. Worse still, every customized version you save produces another full 14 GB checkpoint file. If your team builds five specialized assistants (one for SQL, one for customer support, one for compliance, one for HR, and one for Python), you end up storing 70 GB of nearly identical model copies.

Another major pain point of full fine-tuning is **catastrophic forgetting**. When you rewrite all 7 billion weights to teach a model medical coding, you risk erasing its general reasoning or polite conversation habits. By keeping the base encyclopedia frozen and isolating new behavior inside a separate overlay, LoRA preserves the base model's general intelligence while adding targeted domain skills.

## Sticky notes on an encyclopedia: how LoRA freezes 99 percent of weights

**Low-Rank Adaptation (LoRA)**, introduced by Edward J. Hu and colleagues in 2021 ([arXiv:2106.09685](https://arxiv.org/abs/2106.09685)), solves this bottleneck by refusing to edit the base model at all.

Think of the pre-trained base model as a heavy, leather-bound encyclopedia sitting on a desk. Instead of reprinting the entire 20-volume set whenever you want to teach it hospital billing codes, you lock the printed pages behind glass (**freeze the base weights**) and place a few transparent **sticky-note overlays** over key pages ([Hugging Face PEFT](https://huggingface.co/docs/peft/main/en/conceptual_guides/lora)).

During training, the encyclopedia never changes. Only the lightweight sticky-note overlays receive updates. When the model answers a question, it reads the original encyclopedia entry and adds the sticky-note adjustment on top. Because those overlays are tiny, an entire specialized LoRA adapter file often weighs tens of megabytes instead of tens of gigabytes.

| Fine-tuning method | Base weights status | Memory needed | Saved file size | Swapping multiple skills |
| --- | --- | --- | --- | --- |
| **Full Fine-Tuning** | All parameters unlocked and updated | Very high (3x more GPU RAM than LoRA on GPT-3 175B) ([Hugging Face](https://huggingface.co/learn/llm-course/en/chapter11/4)) | Full model size (e.g., 14 GB+ per task) | Slow; requires loading separate full models |
| **LoRA** | Frozen (16-bit base + tiny trainable adapters) | Low (~90% to 99.99% fewer trainable parameters) ([Hugging Face](https://huggingface.co/learn/llm-course/en/chapter11/4)) | Small adapter file (tens of MB) | Fast; swap adapters via `load_adapter()` / `set_adapter()` ([Hugging Face](https://huggingface.co/learn/llm-course/en/chapter11/4)) |
| **QLoRA** | Frozen and compressed to 4-bit precision | Lowest (fits large models onto single consumer GPUs) | Small adapter file (tens of MB) | Fast; combines 4-bit base with lightweight LoRA overlays |

## Shrinking millions into thousands: the simple trick behind rank and two thin strips

How can a tiny overlay mimic editing a massive neural network table? The secret is **low-rank decomposition**, which sounds intimidating until you count the numbers on a simple grid ([Hugging Face PEFT](https://huggingface.co/docs/peft/main/en/conceptual_guides/lora)).

Suppose one layer inside a transformer is a square table with `1,000` rows and `1,000` columns. That table holds `1,000 x 1,000 = 1,000,000` numbers. Researchers discovered that when adapting a pre-trained model to a new task, the adjustments you need are highly structured rather than random noise, meaning you do not need a million independent knobs.

Trace how LoRA shrinks that `1,000,000`-number update in four steps:

1. **Freeze the `1,000 x 1,000` table:** Keep all `1,000,000` original numbers locked in read-only memory ([Hugging Face PEFT](https://huggingface.co/docs/peft/main/en/conceptual_guides/lora)).
1. **Attach two thin side strips (`A` and `B`):** Instead of a square update table, create one tall thin strip (`1,000 x 4`) and one wide thin strip (`4 x 1,000`). The width `4` is called the **rank (`r`)** ([Hugging Face LLM Course](https://huggingface.co/learn/llm-course/en/chapter11/4)).
1. **Count the trainable numbers:** Strip `A` holds `4,000` numbers and Strip `B` holds `4,000` numbers, totaling just `8,000` trainable numbers instead of `1,000,000`: a **99.2 percent** reduction.
1. **Multiply at runtime or merge afterward:** Multiplying the `1,000 x 4` strip by the `4 x 1,000` strip produces a full `1,000 x 1,000` adjustment grid that adds cleanly to the frozen base table. Once training finishes, calling `merge_and_unload()` bakes that adjustment straight into the base weights so inference runs with **zero extra latency** ([Hugging Face PEFT](https://huggingface.co/docs/peft/main/en/conceptual_guides/lora)).

When configuring LoRA in tools like Hugging Face's `PEFT` library, you will see two main dials: **rank (`r`)** and **alpha (`lora_alpha`)** ([Hugging Face LLM Course](https://huggingface.co/learn/llm-course/en/chapter11/4)). Think of `r` as the width of your sticky note: a small rank (`r = 4` to `8`) works well for learning a formatting style or tone, while a wider rank (`r = 16` to `32`) gives the adapter more capacity to learn a complex new domain ([Hugging Face LLM Course](https://huggingface.co/learn/llm-course/en/chapter11/4)). Meanwhile, `lora_alpha` acts like a volume knob (often set to `2x` the rank) controlling how strongly the adapter's edits blend with the original encyclopedia ([Hugging Face LLM Course](https://huggingface.co/learn/llm-course/en/chapter11/4)).

Engineers also control *where* those sticky notes get attached using `target_modules` ([Hugging Face LLM Course](https://huggingface.co/learn/llm-course/en/chapter11/4)). In transformer models, LoRA is typically applied to attention blocks (`q_proj, v_proj`), though targeting `all-linear` layers increases adaptability at slightly higher memory cost ([Hugging Face LLM Course](https://huggingface.co/learn/llm-course/en/chapter11/4); [Hugging Face PEFT](https://huggingface.co/docs/peft/main/en/conceptual_guides/lora)). At the start of training, Strip `B` is initialized with all zeros so that `A x B` equals zero on step one, ensuring the model starts from the exact behavior of the frozen base model rather than random noise ([Hugging Face PEFT](https://huggingface.co/docs/peft/main/en/conceptual_guides/lora)).

## Swappable skills: when to pick LoRA over prompting or full retraining

Because the base model stays frozen, LoRA turns a single shared model into a multi-purpose engine. Using functions like `load_adapter()` and `set_adapter()`, one running GPU can hold a single frozen 7B base model in memory and hot-swap dozens of lightweight task adapters on the fly, much like plugging different game cartridges into one console ([Hugging Face LLM Course](https://huggingface.co/learn/llm-course/en/chapter11/4)).

And if a user wants to switch back to the uncustomized base model temporarily without reloading gigabytes from disk, calling `unload()` detaches the active LoRA overlays immediately ([Hugging Face PEFT](https://huggingface.co/docs/peft/main/en/conceptual_guides/lora)).

Before spending time training a LoRA adapter, run through three quick questions to pick the right tool:

1. **Can a clear system prompt and two examples solve the task?** If yes, stick with prompting: it requires zero training data and can be updated in seconds.
1. **Does the model simply lack up-to-date facts, product prices, or company PDFs?** If yes, use **Retrieval-Augmented Generation (RAG)** rather than LoRA, because adapters teach *habits and styles* far better than memorizing rapidly changing facts.
1. **Do you need consistent formatting, domain jargon, or behavior that prompting cannot hold reliably across thousands of requests?** If yes, train a **LoRA** (or 4-bit **QLoRA**) adapter, keeping the base weights frozen and saving a portable checkpoint you can merge or swap anytime ([Hugging Face PEFT](https://huggingface.co/docs/peft/main/en/conceptual_guides/lora)).

## Sources

- [LoRA (Low-Rank Adaptation) - Hugging Face LLM Course](https://huggingface.co/learn/llm-course/en/chapter11/4) : Official guide detailing the ~90% typical trainable-parameter reduction, GPT-3 175B metrics (10,000x fewer trainable parameters, 3x less GPU memory), `r` (`4-32`), `lora_alpha` (`2x` rank), `load_adapter()`, `set_adapter()`, and `merge_and_unload()`.
- [LoRA Conceptual Guide - Hugging Face PEFT](https://huggingface.co/docs/peft/main/en/conceptual_guides/lora) : Documentation explaining frozen base weights, low-rank `A` and `B` update matrices, zero inference latency after merging, and multi-adapter management.
- [LoRA: Low-Rank Adaptation of Large Language Models](https://arxiv.org/abs/2106.09685) : Original 2021 paper by Edward J. Hu et al. establishing low-rank adaptation for large language models.

<!--
Artwork brief — from the writer routine. Draw per docs/ARTWORK.md,
then delete this comment.

- Argument in one sentence: LoRA keeps a massive square weight matrix completely frozen while training two thin side strips whose product supplies targeted, swappable adjustments.
- Geometry: A large square dense weight grid on the left (frozen) paired with two thin rectangular strips (`A` vertical, `B` horizontal) feeding a lightweight sum node on the right.
- Accent: {{plum}}
- Deliberate imperfection: While 99 percent of the square base grid stays quiet in neutral border lines, only the two thin {{plum}} strips glow and merge into the output rail.
-->
