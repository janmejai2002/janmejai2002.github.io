# Insight Engine Scraping Schema

## Overview
The Insight Engine extracts structured data from live web sources to ground AI writing and verify claims. This schema defines the mandatory structure for extracted data blocks before passing them to the writer agents.

## Data Structures

### 1. Source Metadata
- `url`: String
- `title`: String
- `author`: String
- `timestamp`: ISO-8601
- `trust_score`: 1-10 (Grounding metric)

### 2. Extracted Content Block
- `type`: 'passage' | 'data_point' | 'opinion' | 'claim'
- `content`: String (The raw text)
- `entity`: String (Primary subject)
- `key_metrics`: Array<Object> (Used for verifiable data points)
  - `metric`: String
  - `value`: Number/String
  - `unit`: String
- `citation`: String (Sentence-level mapping)

### 3. Verification Payload
- `source_id`: UUID
- `verifiable_data`: Array<Object>
- `corroboration_links`: Array<String> (Reddit/LinkedIn/GitHub)
- `confidence_score`: 0-1

## Processing Pipeline
1. **Extraction**: Firecrawl extracts raw HTML to Markdown.
2. **Schema Mapping**: Content is parsed into this schema.
3. **Verification**: Confidence score calculated against curated corpus.
4. **Injection**: Structured content is passed to the writer agent as context.