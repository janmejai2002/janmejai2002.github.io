# wAIbi Controller MCP Design

## Overview
The `waibi-controller` MCP provides a unified orchestration layer for wAIbi-sabi writer agents to access project-wide context, research, and status tracking during composition.

## Architecture

The controller acts as a facade, routing requests from writer agents to the appropriate underlying system (Notion, Google Sheets, NotebookLM, Firecrawl).

- **Writer Agents** invoke MCP tools.
- **`waibi-controller`** handles authentication, request routing, and response formatting.
- **Backend Services**:
    - **NotebookLM**: Research queries, citations, and summaries.
    - **Notion**: Project status, Radar topics, and article metadata.
    - **Google Sheets**: Shared inbox and repair queue status.
    - **Firecrawl**: Live web scraping for real-time information.

## API Specification

### Tools

#### 1. `get_insight`
- **Description**: Retrieves curated insights or summaries for a given topic from NotebookLM, supplemented by live Firecrawl data if necessary.
- **Parameters**:
    - `topic` (string): The research topic.
    - `context` (string, optional): Specific focus or context.

#### 2. `get_citations`
- **Description**: Retrieves verified citations and source links from the NotebookLM curated corpus for a topic.
- **Parameters**:
    - `topic` (string): The research topic.

#### 3. `log_event`
- **Description**: Logs a composition event or article status update to Notion or Google Sheets.
- **Parameters**:
    - `event` (string): The event/status message.
    - `article_id` (string): The target article ID.

---

### Architectural Flow (to be rendered via Archify)
- Writer Agents → [waibi-controller MCP]
- [waibi-controller MCP] → [NotebookLM] (Research/Citations)
- [waibi-controller MCP] → [Firecrawl] (Live Web)
- [waibi-controller MCP] → [Notion] (Status)
- [waibi-controller MCP] → [Google Sheets] (Shared Inbox)