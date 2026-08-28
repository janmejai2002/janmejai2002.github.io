---
title: 'EEG Foundation Models Learned Who You Are, Not What You''re Doing'
description: 'A USC talk re-tests EEG foundation models with the backbone frozen and few labels: small supervised models keep up, and the embeddings encode the subject.'
pubDate: 2026-08-28
track: talks
question: 'Do EEG foundation models really generalize, or do they lean on shortcuts that break under honest evaluation?'
keywords:
  - EEG foundation models
  - foundation model evaluation
  - brain-computer interface machine learning
  - LaBraM CBraMod
  - subject identity shortcut learning
  - aperiodic EEG
heroImage: '../../assets/art/eeg-foundation-models-generalization-subject-identity-light.webp'
heroImageDark: '../../assets/art/eeg-foundation-models-generalization-subject-identity-dark.webp'
heroAlt: 'A stack of 12 thin horizontal rules of equal length, like lines of text. One rule is interrupted mid-way, and its continuation is shifted slightly downward and drawn in a single accent colour.'
readingTime: '7 min read'
notionId: '3caced67-050a-810a-99d7-e28ec5567c9e'
---
<div class="tldr">

## Executive TL;DR

- Aditya Kommineni (USC, Shrikanth Narayanan's SAIL lab) re-evaluated EEG "foundation models" under conditions closer to real use — backbone frozen, few labels, fewer electrodes — and much of their edge over small supervised models vanished.
- On short-window tasks (motor imagery, error-related negativity, epilepsy event detection), supervised baselines from 4,000 up to about a million parameters matched or beat foundation models of five to nine million. The pretraining bought little there.
- Foundation models did clearly help on long-context clinical tasks, sleep staging and depression classification, especially with few labels: one model scored roughly three times a supervised baseline at 240 training examples.
- Remove or restrict EEG channels and the foundation models degrade about as much as a small CNN. Large-scale pretraining did not buy channel robustness.
- Newer analysis in the talk: the frozen embeddings capture the signal's aperiodic 1/f shape well but its oscillatory peaks poorly. A linear probe identifies *which subject* a recording came from more accurately than the task itself, on five of six datasets.
- A different lab's audit the same month reaches the same conclusion, tying the identity leakage to those aperiodic features.

</div>

## Who's talking, and where

The talk is an invited research seminar at Microsoft Research, [posted 27 August 2026](https://www.youtube.com/watch?v=zl_RxpwPsIY), given by Aditya Kommineni, a fourth-year PhD student at the University of Southern California advised by Shrikanth Narayanan in the Signal Analysis and Interpretation Laboratory (SAIL). It runs about 57 minutes, much of it Q&A with a room of biosignal researchers. The framework and headline results were published in May 2026 as ["A Multi-dimensional Framework for Evaluating Generalization in EEG Foundation Models"](https://arxiv.org/abs/2605.28563) (Kommineni, Zhou, Avramidis, Feng, Narayanan). The interpretability analysis near the end is not in that preprint.

## The setup, and why it bites

EEG — electrodes on the scalp reading electrical activity — is a hard modality for machine learning. The signal-to-noise ratio is far worse than audio or images; montages run from 16 to 128 channels between sites; and one person's traces drift from day to day. The pitch for a foundation model: pretrain on a large pile of unlabeled recordings once, and each downstream task then needs little labeled data.

Kommineni's argument is that the field has been grading these models on a soft curve. Three habits do the flattering: reporting results on a single train/test fold; fine-tuning on the *entire* labeled set of the downstream task; and leaving the pretrained backbone unfrozen while you do it. Fine-tune every weight on plenty of labels and you are no longer testing the representation. You are training a fresh model that happened to start from a checkpoint.

The framework, laid out around the 10-minute mark, pins the backbone and varies three things: parameters (freeze the encoder, train only a linear probe or a small LoRA adapter), samples (cut the labeled data to 50–200 examples), and channels (drop electrodes or restrict them to certain lobes). Each is scored as a ratio: near 1 means the representation is pulling its weight, well below 1 means it is not.

## What the numbers say

Against a frozen backbone — results from roughly 15 minutes in — the split is sharp. On the two long-context tasks, Sleep-EDF staging and a depression dataset, linear-probe scores reach 0.84 to 0.98 of full fine-tuning, and with a LoRA adapter sometimes above 1. On the four short-window datasets the same ratio sits at 0.62 to 0.87, and the plain supervised baselines (EEGNet and relatives, 4,000 to about a million parameters) match or beat the 5-to-9-million-parameter foundation models (LaBraM, CBraMod, CSBrain) outright. Kommineni's explanation for the motor-imagery gap: those models are pretrained mostly on clinical hospital EEG, heavy on ICU and epilepsy monitoring, whose statistics sit closer to sleep and clinical tasks than to someone imagining a hand movement.

The low-label regime is where a foundation model should shine, and for the long-context tasks it does. Around the 32-minute mark she shows CSBrain posting sample-efficiency ratios of 2.9 to 3.1 against the supervised baseline at 240 training examples, significant at p < 0.001. For the motor-imagery task the ratio stays under 1 at every budget from 50 to 200: the pretrained model is no better than training from scratch on the same handful of labels.

Strip the channels down, about 40 minutes in, and the foundation models track EEGNet-Large almost exactly, "on par with, or slightly worse" across every configuration tested. Whatever the pretraining learned, it did not include a robust spatial prior.

## What the embeddings actually encode

The most interesting stretch is diagnostic, from about 45 minutes. An EEG power spectrum decomposes into an aperiodic 1/f background — a slope and an offset — plus oscillatory peaks, the alpha and beta bands and so on. Roughly, and Kommineni is careful to say only roughly, the aperiodic part tends to be subject-stable while the oscillatory peaks carry more of the task.

She simulates spectra with known parameters, pushes them through the frozen models, and trains a linear regression to read each parameter back out of the embedding. The aperiodic exponent and offset come back cleanly, with high R-squared. The oscillatory center frequency comes back at essentially R-squared near zero; oscillatory power gets harder to recover as its frequency rises. The embeddings are most faithful to the part of the signal that says *who* and least faithful to the part that says *what*.

The consequence: a linear probe on the frozen embeddings predicts subject identity better than it predicts the downstream label, on five of the six datasets. The exception is Sleep-EDF, which uses only two electrodes, sited away from the regions that carry the strongest individual signature.

## What holds up, and what to watch

The methodology critique is reasonable, and not unique to this group: EEG-foundation-model evaluation became its own subject through 2026, with benchmarks like OmniEEG-Bench and a systematic channel-adaptation study taking up the same question.

The subject-identity finding is the one to take seriously, because a different lab reached it independently the same month. ["The Identity Trap in EEG Foundation Models"](https://arxiv.org/abs/2606.06647) (Lin, Wu and Jung, June 2026) reports that frozen subject-variance runs 13 to 89 times a random null across every dataset pair it tests; that removing the aperiodic 1/f features cuts subject-identity decodability by 9 to 19 points for some models; and — the sharp part — that *erasing* subject identity from the embedding *improves* task decoding. Two groups, two methods, one conclusion: these models partly work by recognizing the person, and subject-disjoint train/test splits do not rule it out.

The aperiodic/periodic decomposition itself is standard and well validated: the FOOOF/specparam method from [Donoghue et al., ](https://www.nature.com/articles/s41593-020-00744-x)[*Nature Neuroscience*](https://www.nature.com/articles/s41593-020-00744-x)[ 2020](https://www.nature.com/articles/s41593-020-00744-x). The aperiodic exponent has good test-retest reliability, which is why it reads as a trait.

What to hold loosely: the talk's tone runs ahead of its own evidence in places. "Not better at all" is true for the short-window tasks, not for the long-context ones, where the low-label win is large and real. Kommineni's own paper credits the foundation models with a clear advantage there, and she hedges more in the room than the blunt framing suggests. Only three foundation models are tested, all masked-reconstruction transformers of similar vintage; she notes in the Q&A that newer in-context-learning architectures and larger models are not covered, and that "things have moved on" since the work was done. The interpretability results are new and from a single lab. And an audience aside about a startup pretraining on 250,000 hours of EEG is exactly that — an aside, not a checked number. Her own summary of why the project exists doubles as the takeaway: on many of these comparisons, "most of the performance lies within the standard deviation."

## What it means for you

The lesson transfers to any modality. Freeze the backbone and test few-shot before you credit the pretraining with anything. Evaluate under the distribution shift you will actually face, not a friendly single split. And probe what the embedding encodes — a model can score well by locking onto a confound, here subject identity, that a subject-disjoint split won't catch and a new user won't reproduce.

If you work on EEG or biosignals specifically: today's foundation models earn their keep on long-context clinical tasks such as sleep and mental-health state, in low-label settings. They do not beat a tiny CNN on motor-imagery BCI, and they lose ground when you reduce channels. That is exactly what a cheap consumer headset does. Build around that.

## Sources

- [Invited Research Talk: Measuring Generalization in EEG Foundation Models](https://www.youtube.com/watch?v=zl_RxpwPsIY) — Microsoft Research, 27 August 2026 (the talk itself)
- [A Multi-dimensional Framework for Evaluating Generalization in EEG Foundation Models](https://arxiv.org/abs/2605.28563) — Kommineni, Zhou, Avramidis, Feng & Narayanan, arXiv, May 2026
- [The Identity Trap in EEG Foundation Models: A Diagnostic Audit](https://arxiv.org/abs/2606.06647) — Lin, Wu & Jung, arXiv, June 2026
- [Parameterizing neural power spectra into periodic and aperiodic components](https://www.nature.com/articles/s41593-020-00744-x) — Donoghue et al., *Nature Neuroscience*, 2020
- [Test-retest reliability of spectral parameterization by 1/f characterization using SpecParam](https://academic.oup.com/cercor/article/34/1/bhad482/7473337) — *Cerebral Cortex*, 2024

<!--
Artwork brief — from the writer routine. Draw per docs/ARTWORK.md,
then delete this comment.

- **Argument in one sentence:** once you freeze the backbone and test honestly, EEG foundation models mostly encode which person is wearing the electrodes, not what their brain is doing.
- **Geometry:** a single ink waveform crossing the frame left to right; its slow, broad envelope — the aperiodic drift — is a firm continuous line, while the fast small wiggles riding on top, the oscillations, fade to faint dashes, so the model holds the envelope and drops the detail.
- **Accent:** hanko — one red seal-stamp mark placed over the firm part of the envelope, as if identifying it.
- **Deliberate imperfection:** the red stamp is pressed slightly too hard and rotated a few degrees off square, ink pooling at one corner.
-->
