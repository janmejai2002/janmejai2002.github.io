---
title: 'Vector Embeddings Turn Text into Spatial Coordinates for Search'
description: 'Vector embeddings explained simple: see how AI converts text into spatial coordinates and uses cosine similarity to search by meaning.'
pubDate: 2026-11-10
track: basics
question: 'How do vector embeddings actually capture meaning instead of just matching keywords?'
keywords:
  - Vector Embeddings
  - Cosine Similarity
  - Semantic Search Primitives
  - High Dimensional Vectors
heroImage: '../../assets/art/vector-embeddings-explained-simple-light.webp'
heroImageDark: '../../assets/art/vector-embeddings-explained-simple-dark.webp'
heroAlt: 'Minimalist geometric vector diagram showing two directional rays from an origin meeting inside a moss-colored cluster of semantic coordinate nodes with an angular cosine arc.'
readingTime: '6 min read'
notionId: '414ced67-050a-810f-9e5b-e3b4c8e02393'
---
<div class="tldr">

## Executive TL;DR

- **The lexical dead end:** Classical search engines rely on [BM25 term-frequency scoring](https://www.staff.city.ac.uk/~sbrp622/papers/foundations_bm25_review.pdf), matching exact character strings and returning zero hits when a user queries `"puppy care"` inside a knowledge base titled `"dog training guide"`.
- **Meaning as geometry:** In a `vector embeddings explained simple` mental model, neural networks convert words and sentences into dense float arrays ([OpenAI Vector Embeddings Guide](https://developers.openai.com/api/docs/guides/embeddings)), spanning `1,536` dimensions in [`text-embedding-3-small`](https://openai.com/index/new-embedding-models-and-api-updates/) or `3,072` dimensions in [`text-embedding-3-large`](https://openai.com/index/new-embedding-models-and-api-updates/).
- **Angles over straight-line distance:** Search engines compare vectors via [cosine similarity](https://www.pinecone.io/learn/vector-similarity/), measuring the cosine of the angle between coordinate rays ($\cos(\theta)=\frac{A\cdot B}{\|A\|\|B\|}$) so a two-word query and a 20-page manual on the same topic align at $\cos(\theta)=1.000$ regardless of document length.
- **Sub-millisecond graph navigation:** Databases like [`pgvector`](https://github.com/pgvector/pgvector) index coordinates using [Hierarchical Navigable Small World (HNSW) graphs (arXiv:1603.09320)](https://arxiv.org/abs/1603.09320) and compress dimensions via [Matryoshka Representation Learning (arXiv:2205.13147)](https://arxiv.org/abs/2205.13147).
- **Production architecture:** Dense embeddings fail on exact SKU codes, error strings, and negations, making [Reciprocal Rank Fusion (RRF, SIGIR 2009)](https://cormack.uwaterloo.ca/cormacksigir09-rrf.pdf) combining BM25 and dense vectors the standard retrieval pattern.

</div>

## The keyword trap: why computers historically failed at understanding meaning

Type `"laptop screen flickering after sleep"` into an older help desk portal, and watch the search bar return nothing because the engineering team titled their troubleshooting article `"display refresh failure on wake"`. To a human reader, those two phrases describe the exact same hardware bug. To a classical database, they share zero words.

For decades, information retrieval relied on lexical matching rooted in the [Probabilistic Relevance Framework and BM25 (Robertson and Zaragoza, 2009)](https://www.staff.city.ac.uk/~sbrp622/papers/foundations_bm25_review.pdf). When a database indexes text using BM25, it treats every unique word as an isolated token in an inverted index. Mathematically, vocabulary lookup starts with one-hot encoding: in a `50,000`-word dictionary, `"puppy"` becomes a vector of `49,999` zeros and a `1` at index `34,102`, while `"dog"` has a `1` at index `12,809`. Their dot product is strictly zero. In a keyword index, `"puppy"` and `"dog"` are as unrelated as `"puppy"` and `"hydraulic"`.

Engineers spent years patching this mismatch in `semantic search vs keyword search` pipelines using synonym rings, Porter stemming, and Inverse Document Frequency (IDF) inside [BM25 scoring functions](https://www.staff.city.ac.uk/~sbrp622/papers/foundations_bm25_review.pdf). Yet synonym tables break whenever language gets contextual: a `"Java heap exception"` concerns JVM memory, whereas a `"compost heap"` belongs in gardening. Answering `how does ai know what words mean` requires mapping concepts by how they behave across millions of sentences.

## Words as GPS coordinates: the intuitive map of multi-dimensional space

Every building on Earth can be pinpointed with two numbers: latitude and longitude. Two cafes in Tokyo share nearly identical coordinates, while a warehouse in Buenos Aires sits thousands of miles away. If you want a `vector space analogy` or `what is a vector embedding in plain english`, an embedding model is a cartographer that assigns numerical GPS coordinates to ideas ([Pinecone Vector Embeddings Guide](https://www.pinecone.io/learn/vector-embeddings/)).

In 2013, Tomas Mikolov et al. published their foundational [Word2Vec paper (arXiv:1301.3781)](https://arxiv.org/abs/1301.3781), showing that a two-layer neural network trained to predict surrounding words on a `1.6 billion`-word corpus organizes vocabulary into geometric clusters. [Mikolov et al. (arXiv:1301.3781)](https://arxiv.org/abs/1301.3781) demonstrated that semantic relationships become linear directions, enabling vector arithmetic across coordinates:

```
  Y-Axis: Gender / Femininity (0.0 to 1.0)
  1.0 +
      |          * woman [0.15, 0.85]              * queen [0.85, 0.85]
  0.8 +             ^ (+0.70 Gender shift)            ^ (+0.70 Gender shift)
  0.5 +                                   * kitten [0.52, 0.58]
  0.4 +                                   * puppy [0.48, 0.50] / dog [0.50, 0.44]
  0.2 +          * man   [0.15, 0.15] -------------> * king  [0.85, 0.15]
      |                               (+0.70 Royalty shift)
  0.0 +----------+--------------------+--------------+--------------------+-->
     0.0        0.2                  0.5            0.8                  1.0
                        X-Axis: Royalty / Authority (0.0 to 1.0)
  Arithmetic: king [0.85,0.15] - man [0.15,0.15] + woman [0.15,0.85] = [0.85,0.85] (queen)
```

Subtracting `man` from `king` leaves a royalty offset (`[+0.70, 0.00]`). Adding `woman` (`[0.15, 0.85]`) lands at `[0.85, 0.85]`, the exact coordinate of `queen` ([Word2Vec, arXiv:1301.3781](https://arxiv.org/abs/1301.3781)), while pets (`puppy`, `dog`, `kitten`) cluster near the center.

Because human language carries thousands of traits (tense, tone, biology, syntax), modern transformers project text into `high dimensional word coordinates`. Static word vectors gave `"bank"` a single fixed coordinate whether discussing a `"river bank"` or an `"investment bank"`. In 2019, Nils Reimers and Iryna Gurevych solved sentence representation with [Sentence-BERT (arXiv:1908.10084)](https://arxiv.org/abs/1908.10084), using Siamese BERT networks to encode full sentences into vectors. While finding the closest pair among `10,000` sentences took standard BERT `65 hours` on a V100 GPU, [Sentence-BERT (arXiv:1908.10084)](https://arxiv.org/abs/1908.10084) finished in `5 seconds`.

Per the [OpenAI Vector Embeddings Guide](https://developers.openai.com/api/docs/guides/embeddings) and [OpenAI v3 embedding announcement](https://openai.com/index/new-embedding-models-and-api-updates/), [`text-embedding-3-small`](https://openai.com/index/new-embedding-models-and-api-updates/) outputs `1,536` floats (`$0.02`/MTok, `44.0%` on MIRACL, `62.3%` on MTEB), while [`text-embedding-3-large`](https://openai.com/index/new-embedding-models-and-api-updates/) outputs `3,072` dimensions (`$0.13`/MTok, `54.9%` on MIRACL, `64.6%` on MTEB). Trained with [Matryoshka Representation Learning (Kusupati et al., arXiv:2205.13147)](https://arxiv.org/abs/2205.13147), which front-loads coarse semantics into early coordinates like nested Russian dolls, a `3,072`-dimensional [`text-embedding-3-large`](https://openai.com/index/new-embedding-models-and-api-updates/) vector truncated to `256` dimensions cuts RAM by `12x` while still beating `1,536`-dimensional `ada-002` ([Pinecone OpenAI v3 Analysis](https://www.pinecone.io/learn/openai-embeddings-v3/)).

## Measuring angles not miles: why cosine similarity captures semantic closeness

Once text becomes coordinate arrays, a database ranks which documents sit closest to the query ([Cloudflare Vectorize Guide](https://developers.cloudflare.com/vectorize/get-started/embeddings/)). Readers building a `how do embeddings work mental model` often ask `why do we use cosine similarity instead of distance` (Euclidean distance $L_2$).

In unnormalized vector spaces, vector length grows as a document repeats words. If a user types a two-word query (`"puppy care"`) and a 20-page manual covers the exact same topic ten times over, the manual's raw coordinates grow much larger, pushing its tip far away in Euclidean space even though both rays point in the exact same direction ([Pinecone Vector Similarity Guide](https://www.pinecone.io/learn/vector-similarity/)).

Trace a 3D example across axes `[Canine Biology, Juvenile Care, Domestic Training]`:

- **Query $A$** (`"puppy care"`): $A=[1,2,2]$, magnitude $\|A\|=\sqrt{1^2+2^2+2^2}=3.0$
- **Manual $B$** (same topic at 3x length): $B=[3,6,6]$, magnitude $\|B\|=\sqrt{3^2+6^2+6^2}=9.0$
- **Note $C$** (`"adult hound obedience"`): $C=[2,1,2]$, magnitude $\|C\|=\sqrt{2^2+1^2+2^2}=3.0$

Comparing the three similarity formulas between $(A,B)$ and $(A,C)$:

1. **Euclidean Distance ($d(X,Y)=\sqrt{\sum(X_i-Y_i)^2}$):** $d(A,B)=\sqrt{4+16+16}=6.000$, while $d(A,C)=\sqrt{1+1+0}\approx 1.414$. Euclidean distance wrongly ranks note $C$ 4x closer than matching manual $B$ due to length.
1. **Dot Product ($X\cdot Y=\sum X_iY_i$):** $A\cdot B=3+12+12=27.0$, and $A\cdot C=2+2+4=8.0$.
1. **Cosine Similarity ($\cos(\theta)=\frac{X\cdot Y}{\|X\|\|Y\|}$):** $\cos(\theta_{A,B})=\frac{27.0}{3.0\times 9.0}=1.000$ ($0^\circ$ angle, identical topic mix), whereas $\cos(\theta_{A,C})=\frac{8.0}{3.0\times 3.0}\approx 0.889$ ($27.27^\circ$ angle).

Dividing by magnitudes normalizes out document length, bounding `cosine similarity for beginners` between `-1.0` and `1.0` ([Pinecone Vector Similarity Guide](https://www.pinecone.io/learn/vector-similarity/)). Because [OpenAI's `text-embedding-3` models](https://developers.openai.com/api/docs/guides/embeddings) pre-normalize vectors to unit length ($\|X\|=1.0$), cosine similarity and dot product produce identical rankings:

```
import numpy as np

def compare_vectors(a: list[float], b: list[float]) -> dict[str, float]:
    va, vb = np.array(a, dtype=float), np.array(b, dtype=float)
    dot = float(np.dot(va, vb))
    euclid = float(np.linalg.norm(va - vb))
    cos = dot / float(np.linalg.norm(va) * np.linalg.norm(vb))
    return {"dot": dot, "euclidean": round(euclid, 3), "cosine": round(cos, 3)}

print(compare_vectors([1, 2, 2], [3, 6, 6]))  # {'dot': 27.0, 'euclidean': 6.0, 'cosine': 1.0}
print(compare_vectors([1, 2, 2], [2, 1, 2]))  # {'dot': 8.0, 'euclidean': 1.414, 'cosine': 0.889}
```

## From theory to daily life: how embeddings power modern search, recommendations, and AI

Comparing a query against `10,000,000` `1,536`-dimensional vectors requires `15.36 billion` multiplications per search. Production databases avoid linear scans using [Hierarchical Navigable Small World (HNSW) graphs (Malkov and Yashunin, arXiv:1603.09320)](https://arxiv.org/abs/1603.09320), which layer express long-range edges over dense local neighborhood links. Extensions like [`pgvector` for PostgreSQL](https://github.com/pgvector/pgvector) execute logarithmic HNSW graph traversals in under `2 ms`.

Yet dense vector embeddings fail badly in three scenarios where classical [BM25 lexical search](https://www.staff.city.ac.uk/~sbrp622/papers/foundations_bm25_review.pdf) wins:

- **Exact SKUs and error codes:** Embedding `"XJ-904-B"` or `"ERR_SSL_PROTOCOL_ERROR"` smears the token into a general neighborhood, often ranking `"XJ-904-A"` above the exact string.
- **Negation blindness:** `"Patient is allergic to penicillin"` and `"patient is not allergic to penicillin"` share `85%` of their words and score `>0.94` cosine similarity despite opposite clinical meanings.
- **Rare proper nouns:** New drug names or internal codenames absent from training corpora split into noisy subword vectors.

To capture both exact tokens and semantic meaning, production RAG pipelines fuse BM25 and dense vectors via [Reciprocal Rank Fusion (RRF, Cormack et al., SIGIR 2009)](https://cormack.uwaterloo.ca/cormacksigir09-rrf.pdf) using rank positions $r(d)$ and smoothing constant $k=60$:

$$\text{RRF\_Score}(d)=\frac{1}{60+r_{\text{BM25}}(d)}+\frac{1}{60+r_{\text{Vector}}(d)}$$

| Retrieval Method | Core Mechanism | Primary Strength | Failure Mode | Index & Latency (1M Docs) |
| :--- | :--- | :--- | :--- | :--- |
| **BM25 Lexical** ([Robertson, 2009](https://www.staff.city.ac.uk/~sbrp622/papers/foundations_bm25_review.pdf)) | Sparse TF-IDF saturation | Exact SKUs, error codes, zero GPU cost | Zero hits on synonyms (`"puppy"` vs `"dog"`) | Inverted index (`1-3ms` CPU) |
| **Dense Vectors** ([OpenAI](https://developers.openai.com/api/docs/guides/embeddings) / [SBERT](https://arxiv.org/abs/1908.10084)) | Cosine similarity over `256`-`3,072` floats | Paraphrases, cross-lingual ([MIRACL `54.9%`](https://openai.com/index/new-embedding-models-and-api-updates/)) | Smears SKUs, fails on `"not"` negations | [HNSW (arXiv:1603.09320)](https://arxiv.org/abs/1603.09320) in [`pgvector`](https://github.com/pgvector/pgvector) (`2-8ms`) |
| **Hybrid + RRF** ([Cormack, 2009](https://cormack.uwaterloo.ca/cormacksigir09-rrf.pdf)) | Reciprocal Rank Fusion (RRF) rank sum | Captures exact SKUs and paraphrases | Doubles index footprint | Inverted + [HNSW](https://github.com/pgvector/pgvector) (`5-12ms`) |

## Sources

- [Word2Vec (arXiv:1301.3781)](https://arxiv.org/abs/1301.3781), [Sentence-BERT (arXiv:1908.10084)](https://arxiv.org/abs/1908.10084), [OpenAI Embeddings Guide](https://developers.openai.com/api/docs/guides/embeddings), [OpenAI v3 Models](https://openai.com/index/new-embedding-models-and-api-updates/), [Matryoshka Learning (arXiv:2205.13147)](https://arxiv.org/abs/2205.13147), [HNSW Graphs (arXiv:1603.09320)](https://arxiv.org/abs/1603.09320), [pgvector Repo](https://github.com/pgvector/pgvector), [BM25 Review (Robertson & Zaragoza)](https://www.staff.city.ac.uk/~sbrp622/papers/foundations_bm25_review.pdf), [Reciprocal Rank Fusion (SIGIR 2009)](https://cormack.uwaterloo.ca/cormacksigir09-rrf.pdf), [Pinecone Vector Similarity](https://www.pinecone.io/learn/vector-similarity/), [Pinecone Vector Embeddings](https://www.pinecone.io/learn/vector-embeddings/), [Pinecone OpenAI v3](https://www.pinecone.io/learn/openai-embeddings-v3/), [Cloudflare Vectorize](https://developers.cloudflare.com/vectorize/get-started/embeddings/).

<!--
Artwork brief — from the writer routine. Draw per docs/ARTWORK.md,
then delete this comment.

- Argument in one sentence: Vector embeddings transform isolated words into directional rays on a spatial coordinate grid where semantic closeness is measured by the angle between vectors.
- Geometry: Hairline Cartesian coordinate grid with two vector rays radiating from a bottom-left origin into a moss-accented semantic cluster of nodes, linked by a cosine angle arc and balanced by an isolated keyword node.
- Accent: moss
- Deliberate imperfection: A severed dashed arc measuring the angle between the two primary coordinate rays, paired with an asymmetrically offset outlier node that breaks the grid alignment.
-->
