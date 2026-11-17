# Backlink-Strategist: Strategic Plan

## 1. Tracker Widget Embed Architecture (Astro/Web)
*Goal: Create a lightweight, high-authority embed that others can easily drop into their sites to track or display AI data, providing a high-intent backlink to wAIbi-sabi.*

- **Design**: Minimalist iframe or JS-snippet embed. 
- **Tech**: Astro component (`<TrackerWidget />`) which generates a static HTML/CSS/JS snippet.
- **Backlink Mechanics**:
  - The widget displays real-time AI benchmarks or "autopsy" data.
  - A subtle "Powered by wAIbi-sabi" or "Source: [Article Title]" footer.
  - The script fetches the latest data via a small JSON endpoint or static asset hosted on wAIbi.
- **Implementation**: Create `site/src/components/TrackerWidget.astro`.

## 2. Insights Engine Protocol (Missing Data/Benchmarks)
*Goal: Identify high-authority technical repos/docs missing benchmarks/data and draft PRs.*

- **Protocol**:
  1. **Source Discovery**: Monitor trending AI/ML repositories and docs (GitHub API / Search).
  2. **Data-Gap Analysis**: Check if the repo has explicit benchmarking sections or "How it compares" data.
  3. **Gap Verification**: If missing or outdated, check wAIbi autopsies for relevant benchmarks.
  4. **Draft PR**: Construct a PR providing the missing data, including:
     - The benchmark/data block.
     - A clear citation: "Data verified via [wAIbi-sabi Autopsy Name](URL)".
  5. **Review**: Ensure PR quality is high (non-spammy, helpful contribution).

## 3. Data-Linkability Monitoring
*Goal: Every time we publish an autopsy, identify the 50 most likely journalists/authors who need that data and prepare a 'citation-ready' snippet for them.*

- **Protocol**:
  1. **Topic Categorization**: After every article, tag the core entity/benchmark.
  2. **Influencer Discovery**: Use search (Agent Reach) to identify authors covering this entity in the last 30 days.
  3. **Snippet Formulation**: Create a "Citation Kit" for each article:
     - 1-sentence summary of the new data.
     - 1 clear backlink citation snippet.
     - Direct contact path or social handle for outreach.
