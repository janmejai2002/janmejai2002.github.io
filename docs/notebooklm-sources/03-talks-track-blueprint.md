# Talks Track Master Specification

## 1. Track Identity
- Track Name: `Talks` (Slug: `talks`)
- Theme Accent Token: `{{hanko}}` (#b83b26 / Japanese stamp red)
- Target Audience: Engineers, researchers, and founders who cannot spend 3 hours listening to every developer keynote, university lecture, or podcast episode.
- Publishing Path: Unattended (`AUTO_TRACKS`). Commits directly to `main` upon ingestion.

## 2. YouTube & Audio Ingress Standard
- Permitted Primary Sources:
  1. Deep technical keynotes and conference presentations (NeurIPS, ICML, Google I/O, Apple WWDC, OpenAI DevDay, Anthropic sessions).
  2. Long-form practitioner podcasts (Dwarkesh Patel, Latent Space, Lex Fridman technical deep dives, No Priors).
  3. University lectures and research symposiums (Stanford CS224N, MIT 6.S191, Berkeley AI Research).
- Ingress Method:
  Ingest the YouTube video URL or full transcript into NotebookLM. NotebookLM indexes the audio and speech verbatim, allowing grounded retrieval of specific timestamps, exact quotes, and core architectural theses.

## 3. Mandatory 4-Part Keynote Breakdown Structure

Every Talks article must follow this exact structure:

### Part 1: The Core Argument in Three Sentences
- The non-obvious thesis: What is the speaker truly arguing underneath the conversational surface?
- Sentence 1: The accepted industry paradigm being challenged.
- Sentence 2: The novel mechanism or architectural shift proposed.
- Sentence 3: The inevitable outcome if the thesis holds true.

### Part 2: Five Timestamped Inflection Points
- Exactly five moments in the talk where the discussion turned from conventional wisdom to frontier insight.
- Format for each point:
  `[MM:SS] The Concept Name:` Followed by a 2-3 sentence explanation quoting the speaker's key phrase verbatim and explaining the technical consequence.

### Part 3: What Was Claimed vs. What Benchmarks Prove (The Contrarian Filter)
- An honest engineering evaluation of the speaker's claims.
- Cross-reference with empirical benchmarks: Does the hardware exist today? What does memory bandwidth or token economics say about their timeline?
- Highlight assumptions that may fail under production conditions.

### Part 4: What This Changes for Applied Engineers
- 3 to 4 concrete implications for teams building with LLMs today.
- What code or architecture to write differently starting tomorrow morning.

## 4. Artwork Requirements
- Accent: `{{hanko}}`
- Alt text and 1600x900 SVG using exclusively `{{paper}}`, `{{ink}}`, `{{border}}`, and `{{hanko}}`.
- Deliberate wAIbi-sabi imperfection: A central stamp or seal motif displaced off-axis, or a signal wave interrupted by an authentic harmonic distortion.
