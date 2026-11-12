---
title: 'Query Key Value Matrices Form a Library Card Catalog for Attention'
description: 'Transformers split every word into Query, Key, and Value vectors. Learn how this 64-dimensional library catalog links pronouns and why unscaled scores fail.'
pubDate: 2026-11-12
publishedAt: '2026-11-12T23:21:45.383Z'
track: basics
question: 'What do Query, Key, and Value actually do inside a transformer attention layer?'
keywords:
  - Query Key Value Attention
  - Self Attention Mental Model
  - Transformer QKV Explained
  - How Transformers Work
heroImage: '../../assets/art/query-key-value-attention-explained-simply-light.webp'
heroImageDark: '../../assets/art/query-key-value-attention-explained-simply-dark.webp'
heroAlt: 'Minimalist three-tier geometric diagram showing a bottom plum Query circle projecting five lines to a middle row of Key index bars, where one matching plum Key connects upward to a top Value rectangle and one offset Key is disconnected.'
readingTime: '8 min read'
notionId: '416ced67-050a-8140-92fd-fc5caef72b08'
---
<div class="tldr">

## Executive TL;DR

- **One static vector per word cannot handle changing context:** A dictionary embedding gives a word like `"bank"` or `"it"` the exact same list of numbers in every sentence, so the model needs a dynamic lookup system to blend surrounding words ([The Illustrated Transformer, Jay Alammar](https://jalammar.github.io/illustrated-transformer/)).
- **The Library Card Catalog mental model:** For every token, the Transformer multiplies the input vector by three learned weight matrices to create a **Query** (the search slip asking for context), a **Key** (the index label on each book's spine), and a **Value** (the actual contents inside the book) ([Attention Is All You Need, arXiv:1706.03762](https://www.alphaxiv.org/abs/1706.03762)).
- **Dot products measure Query-Key alignment:** Multiplying a word's Query vector by every other word's Key vector produces a raw compatibility score, which is divided by the square root of the key dimension (`sqrt(64) = 8` in the base Transformer) and converted via **softmax** into percentages that sum to `1.0` (100%) ([IntuitivePapers Vaswani Breakdown](https://intuitivepapers.ai/attention-is-all-you-need/)).
- **Skipping the `sqrt(d_k)` scaling breaks learning by 70x:** At key dimension `d_k = 64`, unscaled dot products push the peak softmax weight to **0.997** and shrink the largest training gradient to **0.0035**, roughly **70 times smaller** than the scaled gradient of **0.245** ([IntuitivePapers](https://intuitivepapers.ai/attention-is-all-you-need/)).
- **Eight small heads beat one giant head, up to a limit:** Splitting a 512-dimensional model into **8 parallel heads of 64 dimensions** lifts English-to-German translation quality by **0.9 BLEU** (`25.8` vs `24.9` for 1 head), whereas splintering into 32 tiny heads of 16 dimensions drops accuracy back to `25.4` ([Vaswani et al., Table 3](https://intuitivepapers.ai/attention-is-all-you-need/)).

</div>

## The Three-Vector Puzzle: Why One Representation Per Word Is Not Enough

Read this twelve-word sentence from [Jay Alammar's *The Illustrated Transformer*](https://jalammar.github.io/illustrated-transformer/):

> *"The animal didn't cross the street because it was too tired."*

Ask a human child what the word **`"it"`** refers to, and they answer *"the animal"* without hesitating, because animals get tired and streets do not. Now change just the final word of the sentence:

> *"The animal didn't cross the street because it was too wide."*

Instantly, the exact same two-letter pronoun **`"it"`** switches its target from *"the animal"* to *"the street"*.

Before the Transformer architecture was introduced by [Ashish Vaswani and colleagues at Google in 2017 ("Attention Is All You Need", arXiv:1706.03762)](https://www.alphaxiv.org/abs/1706.03762), early word-embedding systems assigned each vocabulary word a single fixed coordinate vector (such as a list of 512 numbers). Having one fixed vector per word creates two immediate roadblocks when a model tries to link `"it"` to `"animal"`:

1. **Context Blindness:** Before looking at the rest of the sentence, the static vector for `"it"` is just a generic placeholder. It has no idea whether `"tired"` or `"wide"` sits two words to its right.
1. **The Symmetry Trap (Searching vs. Being Searched):** Suppose you tried to find related words by multiplying each word's single vector against every other word's vector. With only *one* vector per word, a word must use the exact same numbers to describe **what it is looking for** and **what it has to offer**. Because `A * B` equals `B * A`, the word `"it"` would score highest against itself, or treat `"tired"` and `"animal"` symmetrically despite their distinct grammatical roles.

To break that symmetry, the Transformer splits every incoming word vector into **three separate role-specific vectors**: a **Query (`Q`)**, a **Key (`K`)**, and a **Value (`V`)**.

| Representation Type | Vectors Created Per Word | How Context Changes It | What Happens to `"it"` in *"because it was too tired"* |
| --- | --- | --- | --- |
| **Static Word Embedding** | 1 fixed vector (`x`) | Never changes; identical in every sentence | Remains a generic pronoun vector with zero link to `"animal"` |
| **Self-Attention (`Q`, `K`, `V`)** | 3 role vectors (`Q`, `K`, `V`) per head | Recomputed dynamically from every word in the prompt | `"it"` sends a **Query** for a living noun, matches `"animal"`'s **Key**, and absorbs `"animal"`'s **Value** |

## The Card Catalog Metaphor: Queries, Keys, and Values in Plain English

If you have ever searched for a book in a university library or looked up a file in an office cabinet, you already understand how Query, Key, and Value work ([Vaswani et al., arXiv:1706.03762](https://attentionisallyouneed.uk/)).

Imagine walking up to a library reference desk with the word **`"it"`**:

1. **The Query (`Q`) is your search slip:** Because `"it"` is a singular pronoun sitting next to `"was too tired"`, `"it"` writes a search request on a slip of paper: *"I am a pronoun looking for a singular, animate subject noun earlier in this sentence that can feel tired."* Mathematically, the model creates this Query vector by multiplying `"it"`'s 512-number embedding by a learned weight grid called `W_Q`, compressing it into a focused **64-number search vector** ([alphaXiv 1706.03762 guide](https://www.alphaxiv.org/abs/1706.03762)).
1. **The Key (`K`) is the index label pasted on each book's spine:** Every word in the sentence (`"The"`, `"animal"`, `"street"`, `"tired"`) also generates a 64-number label advertising what grammatical role and attributes it offers (created by multiplying its embedding by a second weight grid, `W_K`). The Key on the spine of **`"animal"`** says: *"Singular noun, subject of clause, living creature."* The Key on **`"street"`** says: *"Singular noun, object, physical location."*
1. **The Value (`V`) is the actual text inside the book:** Once you compare your search slip (`Query`) against every spine label (`Key`) and find that `"animal"` is an 80% match while `"street"` is only a 6% match, you do not take the spine label home. You open the book and copy the **Value (`V`)**, the rich semantic meaning of `"animal"` (created via a third weight grid, `W_V`), into the updated representation of `"it"`.

Separating **Key** (the index label used for matching) from **Value** (the payload passed forward to the next layer) is the core insight of the architecture. A word only needs a compact index label to be *found*, while keeping its full payload ready to be *read* once selected.

## Calculating the Match: How Dot Products Turn Similarities into Attention Weights

Let us trace the arithmetic the Transformer performs for the word **`"it"`** using simplified 3-number vectors so you can verify every step by hand (in the real base Transformer from [Vaswani et al.](https://intuitivepapers.ai/attention-is-all-you-need/), each head uses **64 numbers** instead of 3):

- **`"it"` Query (`Q_it`):** `[2, 3, 0]` *(searching for an animate subject noun)*
- **`"animal"` Key (`K_animal`):** `[3, 2, 0]` and **Value (`V_animal`):** `[10, 0, 5]`
- **`"street"` Key (`K_street`):** `[1, 0, 2]` and **Value (`V_street`):** `[0, 8, 2]`
- **`"tired"` Key (`K_tired`):** `[1, 1, 0]` and **Value (`V_tired`):** `[2, 2, 9]`

Now follow the four-step attention pipeline:

1. **Step 1 (Dot-Product Similarity):** Multiply matching positions between `Q_it` and each word's `Key`, then add them up (`q_1*k_1 + q_2*k_2 + q_3*k_3`):

- Score for **`"animal"`:** `(2 * 3) + (3 * 2) + (0 * 0) = 12.0`
- Score for **`"tired"`:** `(2 * 1) + (3 * 1) + (0 * 0) = 5.0`
- Score for **`"street"`:** `(2 * 1) + (3 * 0) + (0 * 2) = 2.0`

1. **Step 2 (Scale by Square Root of Key Dimension):** In the real 64-dimensional Transformer (`d_k = 64`), adding 64 products together makes raw totals grow large, so the model divides every raw score by `sqrt(d_k)` (`sqrt(64) = 8`). Scaling our sample scores by `4` yields `3.0` (`"animal"`), `1.25` (`"tired"`), and `0.5` (`"street"`).
1. **Step 3 (Softmax Percentage Conversion):** Apply **softmax** (raise `e = 2.718` to each scaled score and divide by the total `20.09 + 3.49 + 1.65 = 25.23`) so all weights sum to `1.00` (100%): **`"animal"` gets `0.80` (80%)**, **`"tired"` gets `0.14` (14%)**, and **`"street"` gets `0.06` (6%)**.
1. **Step 4 (Weighted Sum of Values):** Multiply each word's **Value (`V`)** vector by its percentage weight and add them up: `(0.80 * [10, 0, 5]) + (0.14 * [2, 2, 9]) + (0.06 * [0, 8, 2]) = [8.28, 0.76, 5.38]`. The output vector for `"it"` is now 80% identical to `"animal"`, tinged with 14% of `"tired"`.

### Why Dividing by `sqrt(d_k)` Is Mandatory (The 70x Gradient Cliff)

As demonstrated in [IntuitivePapers' mathematical breakdown of *Attention Is All You Need*](https://intuitivepapers.ai/attention-is-all-you-need/), skipping `sqrt(d_k)` scaling or over-scaling breaks the network in opposite ways:

- **Without scaling (`d_k = 64`):** Because the variance of a 64-element dot product grows to `64` (standard deviation `8`), softmax turns into a rigid winner-take-all switch where the top key gets a weight of **0.997** and the largest training gradient collapses to **0.0035**, roughly **70 times smaller** than the scaled version's gradient of **0.245** (at `d_k = 256`, the unscaled gradient vanishes to `0.00001`).
- **Dividing by `d_k = 64` instead of `sqrt(64) = 8`:** Crushes the standard deviation of scores down to `8 / 64 = 0.125`, flattening all softmax weights into an indistinct blur where every word gets nearly equal attention ([IntuitivePapers](https://intuitivepapers.ai/attention-is-all-you-need/)).

## Bringing It Together: Multi-Head Attention and Where the Trade-Off Lies

What if `"it"` needs one search to find its noun (`"animal"`) and a second search to check the verb tense (`"didn't cross"`)? A single attention head (`h = 1` of 512 dimensions) must average those two searches together ([Naomi Nour's Attention Explainer](https://naominour.com/blog/attention-is-all-you-need-explained)). Instead, the base Transformer splits its 512 dimensions into **8 parallel heads of 64 dimensions each** (`8 * 64 = 512`), keeping total compute (`1,048,576` projection weights per sublayer) identical to one full-width head ([HuggingFace 1706.03762 Knowledge Base](https://huggingface.co/datasets/attention-wiki/knowledge-base/commit/597b4e5675fb2ddd291e75a886eedc568c6fedc2); [IntuitivePapers](https://intuitivepapers.ai/attention-is-all-you-need/)).

However, **more heads are not always better**, as shown in Table 3 of [Vaswani et al. (2017)](https://intuitivepapers.ai/attention-is-all-you-need/) on English-to-German `newstest2013`:

| Attention Heads (`h`) | Key & Value Width (`d_k = d_v`) | Total Width (`d_model`) | Translation `BLEU` Score | Why It Happens |
| --- | --- | --- | --- | --- |
| **1 Head** | `512` | `512` | **24.9** (-0.9 vs peak) | Single distribution averages competing grammatical relations |
| **4 Heads** | `128` | `512` | **25.5** (-0.3 vs peak) | Better specialization across clauses and modifiers |
| **8 Heads (Base)** | `64` | `512` | **25.8 (Peak)** | Sweet spot between head diversity and 64-number key capacity |
| **16 Heads** | `32` | `512` | **25.8 (Tied Peak)** | Matches 8 heads while halving per-head vector width |
| **32 Heads** | `16` | `512` | **25.4** (-0.4 vs peak) | 16 numbers per Key is too narrow to score complex matches accurately |

When you slice a 512-number vector into 32 tiny heads, each `Query` and `Key` shrinks to **16 numbers** (`d_k = 16`), which is too narrow to score complex matches accurately. And in long chats, because the model must keep every past word's **Key** (index spine) and **Value** (book contents) in GPU memory so each new word's **Query** can search the conversation, those stored `K` and `V` tensors form what engineers call the **KV cache**.

## Sources

- [Attention Is All You Need (arXiv:1706.03762): alphaXiv](https://www.alphaxiv.org/abs/1706.03762): Foundational 2017 paper by Vaswani et al. defining Query, Key, and Value projections, scaled dot-product attention, and `h = 8` multi-head attention with `d_k = d_v = 64`.
- [Transformers: Attention Is All You Need: IntuitivePapers](https://intuitivepapers.ai/attention-is-all-you-need/): Exact mathematical verification of `sqrt(d_k)` scaling (`0.997` unscaled peak weight and `0.0035` vs `0.245` gradient), `1,048,576` sublayer weights, and Table 3 head-count BLEU ablations (`24.9` for 1 head, `25.8` for 8 heads, `25.4` for 32 heads).
- [The Illustrated Transformer: Jay Alammar](https://jalammar.github.io/illustrated-transformer/): Canonical visual walkthrough of self-attention resolving *"The animal didn't cross the street because it was too tired"*.
- [Attention Is All You Need, Explained Simply: Naomi Nour](https://naominour.com/blog/attention-is-all-you-need-explained): Multi-head subspace specialization and single-head averaging trade-offs.
- [Process arXiv:1706.03762: HuggingFace Attention Knowledge Base](https://huggingface.co/datasets/attention-wiki/knowledge-base/commit/597b4e5675fb2ddd291e75a886eedc568c6fedc2): Verbatim section 3.2.2 and Table 3 quotes confirming `h=8`, `d_k=d_v=64`, and the 0.9 BLEU single-head drop.

<!--
Artwork brief — from the writer routine. Draw per docs/ARTWORK.md,
then delete this comment.

- Argument in one sentence: A single Query vector fans out across a row of Key index spines, locking onto the one matching coordinate to pull its corresponding Value block forward while an unaligned key slot stays unlit.
- Geometry: Three horizontal tiers across a precision grid: a single `plum` Query node at the bottom emitting five radiating search vectors upward to a middle row of five vertical Key index ticks, where the second Key tick in `plum` opens a vertical conduit up to a large rectangular Value block at the top.
- Accent: plum
- Deliberate imperfection: A displaced, rotated fourth Key tick in the middle catalog row whose broken alignment severs its upward connection to the Value tier, showing how a mismatched Key blocks irrelevant context from entering the output sum.
-->
