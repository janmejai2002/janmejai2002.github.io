---
title: 'Byte Pair Encoding Explains Why AI Models Cannot Count Letters or Math'
description: 'AI models never see letters or digits. Learn how Byte Pair Encoding (BPE) glues text into integer tokens, hiding the r in strawberry and breaking basic math.'
pubDate: 2026-11-11
publishedAt: '2026-11-11T01:19:58.000Z'
track: basics
question: 'Why do smart AI models fail at simple tasks like counting letters or basic math?'
keywords:
  - Byte Pair Encoding Explained
  - LLM Tokenization Blindspots
  - Why AI Fails Spelling
  - Tokenizer Mental Model
heroImage: '../../assets/art/byte-pair-encoding-explained-simple-light.webp'
heroImageDark: '../../assets/art/byte-pair-encoding-explained-simple-dark.webp'
heroAlt: 'Minimalist geometric diagram showing ten uniform character cells at the top merging downward into three unequal rectangular token blocks, with the central moss-green block offset across a dashed alignment axis.'
readingTime: '9 min read'
notionId: '415ced67-050a-81ae-aaa8-d13addfe3048'
---
<div class="tldr">

## Executive TL;DR

- **Language models cannot see letters:** Before an AI reads your prompt, a deterministic preprocessor called a **Byte Pair Encoding (BPE) tokenizer** chops your words into subword chunks and replaces every chunk with a single lookup integer ([Philip Gage, 1994](https://www.derczynski.com/papers/archive/BPE_Gage.pdf); [Sennrich et al., ACL 2016](https://arxiv.org/abs/1508.07909)).
- **Why `"strawberry"` hides its letters:** In OpenAI's `o200k_base` vocabulary (200,000 tokens used by GPT-4o), `"strawberry"` splits into three integers: `[302, 1618, 19772]` (`"st"`, `"raw"`, `"berry"`). When preceded by a space (`" strawberry"`), it collapses into **one single integer (`[101830]`)**, erasing all 10 individual characters before the neural network ever runs ([Shubham Patel, GoPenAI](https://blog.gopenai.com/llm-tokens-are-the-unit-of-everything-5deb028b2e2a); [Dhirendra Choudhary](https://medium.com/@dhirendrac/why-chatgpt-cant-count-the-r-s-in-strawberry-and-what-tokens-really-are-5881260b1aa6)).
- **Why left-to-right number chunking breaks addition:** Standard BPE slices long numbers into 1-to-3 digit chunks from left to right. The 7-digit number `1234567` becomes `["123", "456", "7"]`, whereas adding a comma (`1,234,567`) aligns chunks from right to left (`["1", ",", "234", ",", "567"]`).
- **Right-to-left tokenization fixes arithmetic:** In controlled benchmarks by [Singh & Strouse (2024, arXiv:2402.14903)](https://arxiv.org/abs/2402.14903), standard left-to-right 3-digit tokenization drops multi-digit addition accuracy to **8.25%** on mismatched number lengths, whereas forcing right-to-left or comma-separated chunking restores accuracy above **90%** without changing model weights.
- **Practical fix for everyday prompts:** Whenever you need an AI to count characters, check spelling, or add numbers without a Python tool, force one-token-per-character splitting by separating letters with spaces (`s t r a w b e r r y`) or formatting numbers with standard thousands commas.

</div>

## The Barcode Scanner Blindfold: How AI Actually Reads Your Screen

Ask a frontier language model to write a graduate-level legal brief or debug a concurrency bug in Rust, and it succeeds in three seconds. Ask that exact same model how many times the letter `"r"` appears in `"strawberry"`, or ask it to multiply two 5-digit numbers in a single pass, and it frequently confidently blurs out the wrong answer (`"There are two r's in strawberry"`).

To understand how a system that passes the Uniform Bar Exam can fail a second-grade spelling question, imagine working at a warehouse inventory desk with a **barcode scanner**. Every morning, trucks deliver sealed cardboard boxes. Some boxes contain a single spare bolt (`"a"`), some contain a half-assembled motor (`"raw"`), and common bestsellers arrive in a single factory-sealed crate (`" strawberry"`). Your scanner reads the outer barcode pasted on each sealed box and prints a 6-digit inventory number on your screen: `#101830`. You never open the cardboard box. You can learn from millions of past shipping manifests that box `#101830` belongs in the fruit aisle next to box `#044219` (`" cream"`), and you can write poetry about how box `#101830` tastes in summer. If your manager walks over and asks, *"Without opening box `#101830`, how many cardboard flaps are folded inside it?"*, you can only guess from memory.

Large language models operate behind that exact barcode scanner. A neural network never receives raw characters, letters, or base-10 numbers. Between your keyboard and the AI sits a rigid dictionary compression program called **Byte Pair Encoding (BPE)**.

## First Principles: How Byte Pair Encoding Builds Its Dictionary

Computer scientist [Philip Gage invented Byte Pair Encoding in February 1994](https://www.derczynski.com/papers/archive/BPE_Gage.pdf) as a general-purpose file compression algorithm, and [Rico Sennrich, Barry Haddow, and Alexandra Birch adapted it for neural machine translation in 2016 (arXiv:1508.07909)](https://arxiv.org/abs/1508.07909). Every major language model family (OpenAI GPT, Anthropic Claude, Meta Llama, Google Gemini) uses BPE or a close variant for one engineering reason: **attention scales quadratically with sequence length (`O(N^2)`)**.

If a model read text one character at a time, a 2,000-word essay (10,000 characters) would require $10,000^2 = 100,000,000$ attention comparisons per layer. By gluing common letter pairs into single subword tokens so that 1 token equals roughly 4 English characters, the sequence shrinks by 4x (to 2,500 tokens), cutting attention compute by **16x** (`4^2`).

Here is a worked example of how the BPE training loop builds its dictionary from scratch on a tiny 11-character phrase: **`"low lower"`** (represented initially as individual UTF-8 bytes):

1. **Pass 0 (Raw Characters):** Start with the base byte vocabulary: `['l', 'o', 'w', ' ', 'l', 'o', 'w', 'e', 'r']` (9 tokens).
1. **Pass 1 (Count Adjacent Pairs):** Count every adjacent pair of symbols in the text. The pair `('l', 'o')` appears **2 times**, and `('o', 'w')` appears **2 times**. Every other pair (`('w', ' ')`, `(' ', 'l')`, `('w', 'e')`, `('e', 'r')`) appears only once.
1. **Pass 2 (Merge the Most Frequent Pair):** Merge `('l', 'o')` into a brand-new token `'lo'` and assign it a new integer ID. Our sequence shrinks to 7 tokens: `['lo', 'w', ' ', 'lo', 'w', 'e', 'r']`.
1. **Pass 3 (Repeat Next Merge):** Recount pairs. Now `('lo', 'w')` appears **2 times**. Merge it into a single token `'low'`. Our sequence shrinks to 5 tokens: `['low', ' ', 'low', 'e', 'r']`.

When OpenAI trained the `cl100k_base` tokenizer (100,256 tokens for GPT-4) and `o200k_base` (200,000 tokens for GPT-4o), it ran this exact merge loop hundreds of thousands of times across terabytes of web text, code, and multilingual pages ([Shubham Patel, GoPenAI](https://blog.gopenai.com/llm-tokens-are-the-unit-of-everything-5deb028b2e2a)).

## Tracing `"strawberry"` Through the Tokenizer

Once the BPE merge table is frozen, the tokenizer never changes its rules. When you type `"How many r's are in strawberry?"`, the tokenizer slices your sentence before the model sees a single word.

As documented in [Dhirendra Choudhary's tokenization trace](https://medium.com/@dhirendrac/why-chatgpt-cant-count-the-r-s-in-strawberry-and-what-tokens-really-are-5881260b1aa6) and [Shubham Patel's `o200k_base` breakdown](https://blog.gopenai.com/llm-tokens-are-the-unit-of-everything-5deb028b2e2a), look at what happens to the word `"strawberry"` depending on capitalization and leading spaces:

```
Input String           -> BPE Subword Chunks          -> Token IDs Sent to Model
--------------------------------------------------------------------------------
"strawberry" (no space)-> ["st", "raw", "berry"]      -> [302, 1618, 19772] (3 tokens)
" strawberry" (w/space)-> [" strawberry"]             -> [101830]           (1 token)
"STRAWBERRY" (ALL CAPS)-> ["ST", "RAW", "B", "ERRY"]  -> [2296, 59790, 33, 89919] (4 tokens)
"s t r a w b e r r y"  -> ["s"," t"," r"," a"," w"...]-> [82, 260, 424...]  (10 tokens)
```

Notice what happens in the most common case (`" strawberry"` with a leading space in the middle of a sentence):

1. The tokenizer includes the leading space as part of the word (`" strawberry"` is frequent enough on the internet to earn its own dedicated entry in the 200,000-word dictionary).
1. The entire 11-character string `" strawberry"` vanishes and is replaced by a single integer: **`101830`**.
1. The token for the letter `"r"` (`[81]` or `[424]`) **does not appear anywhere in the input vector**.

When the neural network receives `[101830]`, it converts that integer into a 4,096-dimensional floating-point vector representing the *meaning* of a red summer fruit. Asking the model how many `"r"` letters sit inside token `101830` is only possible if the model happened to memorize a spelling table during training where someone explicitly wrote *"strawberry has three r's"*. Even when `"strawberry"` without a leading space splits into `[302, 1618, 19772]` (`"st"`, `"raw"`, `"berry"`), the model has to remember that token `1618` contains one `"r"` at the front and token `19772` contains two `"r"`s in the middle, then sum `0 + 1 + 2 = 3` inside its attention layers.

## Why Left-to-Right Tokenization Breaks Elementary Arithmetic

The exact same blindfold explains why language models stumble on basic arithmetic when they do not call an external Python calculator.

In human grade-school addition, place value is aligned from **right to left** (ones column, tens column, hundreds column, thousands column). When you add `1234567 + 89`, you line up the `7` above the `9` in the ones place and carry leftward.

Standard BPE tokenizers (`cl100k_base` and `o200k_base`) apply regex rules that slice continuous digits into chunks of up to 3 digits starting from **left to right**:

- Type **`1234567`** (7 digits): the tokenizer slices from the left into **`["123", "456", "7"]`**. Here, `"7"` is in the ones place, `"456"` spans the tens, hundreds, and thousands places, and `"123"` spans the ten-thousands to millions places.
- Type **`12345678`** (8 digits): the tokenizer slices from the left into **`["123", "456", "78"]`**. Suddenly, the exact same token `"123"` has shifted its mathematical meaning by a factor of 10!

In a landmark 2024 study, [Aaditya K. Singh and DJ Strouse ("Tokenization counts: the impact of tokenization on arithmetic in frontier LLMs", arXiv:2402.14903)](https://arxiv.org/abs/2402.14903) tested how this left-to-right (L2R) chunking degrades multi-digit addition across frontier models. Because L2R chunking shifts place boundaries depending on total digit count, adding a 7-digit number (`["123", "456", "7"]`) to an 8-digit number (`["234", "567", "89"]`) forces the model to add misaligned token blocks across carry boundaries.

| Tokenization / Formatting Method | Example Representation of `1234567` | Place-Value Alignment | Multi-Digit Addition Accuracy (Length-Mismatch Carries, [arXiv:2402.14903](https://arxiv.org/abs/2402.14903)) | Relative Token Count (Compute Cost) |
| :--- | :--- | :--- | :--- | :--- |
| **Standard Left-to-Right (L2R 3-Digit)** | `["123", "456", "7"]` | Misaligned (shifts with total digit length) | **8.25% to 24.0%** | **1.0x** (3 tokens) |
| **Right-to-Left (R2L 3-Digit)** | `["1", "234", "567"]` | Aligned to thousands/ones boundaries | **> 91.0%** | **1.0x** (3 tokens) |
| **Comma-Separated Prompt Formatting** | `["1", ",", "234", ",", "567"]` | Forced R2L alignment via punctuation | **89.5% to 94.2%** | **1.67x** (5 tokens) |
| **Single-Digit Tokenization (Llama 3 / Gemma)** | `["1", "2", "3", "4", "5", "6", "7"]` | Exact 1-to-1 digit alignment | **93.8% to 98.1%** | **2.33x** (7 tokens) |

The numbers from [Singh & Strouse (arXiv:2402.14903)](https://arxiv.org/abs/2402.14903) are striking: simply overriding the default left-to-right chunking by inserting commas (`1,234,567`) or forcing right-to-left 3-digit grouping jumps addition accuracy from **8.25% to over 90%** on the exact same frozen model weights.

## The Trade-Off: Why Don't AI Labs Just Use Character-Level Models?

If subword tokenization causes spelling blind spots, breaks arithmetic alignment, and penalizes non-English languages (where a single Hindi or Tamil word can split into 6 to 10 byte tokens, costing 3x more API fees and running 3x slower than English), why hasn't the industry deleted BPE and switched to pure character-level or byte-level models?

The contrarian reality is a hard hardware wall: **KV-cache memory and quadratic attention latency**.

- A standard 32,000-token context window in `o200k_base` holds roughly **128,000 characters** (about 24,000 English words, or a short book).
- If you remove BPE and feed raw UTF-8 bytes directly into a standard Transformer, that same 24,000-word document expands from 32,000 tokens to **128,000 byte tokens**.
- Increasing sequence length by **4x** increases the KV-cache VRAM footprint by **4x** (forcing a single user session on a 70B model from 10 GB of VRAM to 40 GB of VRAM) and increases prefill attention FLOPs by **`4^2 = 16x`**.

While architectures like Meta's Byte Latent Transformer (BLT) experiment with dynamic byte patches, standard subword BPE remains the only way to serve 100+ tokens per second at fractions of a cent per million words.

## Three Rules for Practitioners Working Around the Tokenizer

You do not need to wait for byte-level architectures to get 100% reliability on character and number tasks today:

1. **Force character splitting with spaces or delimiters:** If you need a model to count letters, check anagrams, or manipulate strings without code execution, instruct your prompt pipeline to space-separate the target string (`"s t r a w b e r r y"`) so every character becomes its own distinct token ID.
1. **Always format numbers with thousands commas:** When feeding financial tables or numeric logs into a prompt, format integers as `1,234,567` instead of `1234567`. The commas act as physical barriers that force BPE to split numbers from right to left along true base-1000 place boundaries ([arXiv:2402.14903](https://arxiv.org/abs/2402.14903)).
1. **Offload exact counting and math to deterministic code:** Modern reasoning models (`o3`, `Claude 3.7 Sonnet`, `Gemini 2.5 Pro`) solve the `"strawberry"` test only by generating dozens of chain-of-thought tokens (`"S-T-R-A-W-B-E-R-R-Y..."`) to manually spell the word out into individual letter tokens inside their scratchpad. In production pipelines, bind a 5-line Python tool call for string lengths and arithmetic instead of paying for 200 reasoning tokens to undo BPE compression.

## Sources

- [Philip Gage (Feb 1994) - A New Algorithm for Data Compression (The C Users Journal)](https://www.derczynski.com/papers/archive/BPE_Gage.pdf)
- [Rico Sennrich, Barry Haddow, and Alexandra Birch (ACL 2016) - Neural Machine Translation of Rare Words with Subword Units (arXiv:1508.07909)](https://arxiv.org/abs/1508.07909)
- [Aaditya K. Singh and DJ Strouse (2024) - Tokenization counts: the impact of tokenization on arithmetic in frontier LLMs (arXiv:2402.14903)](https://arxiv.org/abs/2402.14903)
- [Shubham Patel - LLM Tokens Are the Unit of Everything: Inside OpenAI cl100k_base and o200k_base (GoPenAI)](https://blog.gopenai.com/llm-tokens-are-the-unit-of-everything-5deb028b2e2a)
- [Dhirendra Choudhary - Why ChatGPT Can't Count the R's in Strawberry and What Tokens Really Are (Medium)](https://medium.com/@dhirendrac/why-chatgpt-cant-count-the-r-s-in-strawberry-and-what-tokens-really-are-5881260b1aa6)

<!--
Artwork brief — from the writer routine. Draw per docs/ARTWORK.md,
then delete this comment.

- Argument in one sentence: Byte Pair Encoding fuses continuous sequences of individual character cells into rigid, unequal subword blocks, obscuring internal letter boundaries and misaligning numerical place values.
- Geometry: Ten evenly spaced vertical character tick marks at the top converging downward through merge vectors into three unequal rectangular subword blocks, where the middle block in moss green straddles a severed vertical alignment axis.
- Accent: moss
- Deliberate imperfection: An offset, asymmetric partition bar in moss green that cuts across a natural three-digit place-value boundary, visually depicting how left-to-right BPE chunking misaligns arithmetic columns.
-->
