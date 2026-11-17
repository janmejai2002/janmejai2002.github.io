import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema 
} from "@modelcontextprotocol/sdk/types.js";

// Import existing project modules for orchestration
// Assuming these exist based on the project structure in docs/
import { queryNotebookLM } from "../../site/scripts/lib/nlm-client.mjs"; 
import { scrapeUrl } from "../../site/scripts/lib/firecrawl-client.mjs";
// Assuming Notion/Sheets utils exist in the expected path
import { updateNotionPage, appendSheetRow } from "../../site/scripts/lib/notion-sheets-client.mjs";

const server = new Server(
  {
    name: "waibi-controller",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_insight",
        description: "Retrieves curated insights or summaries for a given topic from NotebookLM, supplemented by live Firecrawl data.",
        inputSchema: {
          type: "object",
          properties: {
            topic: { type: "string" },
            context: { type: "string" }
          },
          required: ["topic"]
        },
      },
      {
        name: "get_citations",
        description: "Retrieves verified citations and source links from the NotebookLM curated corpus.",
        inputSchema: {
          type: "object",
          properties: {
            topic: { type: "string" }
          },
          required: ["topic"]
        },
      },
      {
        name: "log_event",
        description: "Logs a composition event or article status update to Notion/Sheets.",
        inputSchema: {
          type: "object",
          properties: {
            event: { type: "string" },
            article_id: { type: "string" }
          },
          required: ["event", "article_id"]
        },
      }
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  switch (name) {
    case "get_insight": {
      const { topic, context } = args as { topic: string; context?: string };
      // 1. Retrieve curated insights
      const insight = await queryNotebookLM(topic, context);
      
      // 2. Supplement with live data if necessary (e.g., if insight is low confidence)
      let supplementaryData = "";
      if (insight.confidence < 0.7) {
        supplementaryData = await scrapeUrl(`https://www.google.com/search?q=${encodeURIComponent(topic)}`);
      }
      
      return { 
        content: [{ type: "text", text: `Insight: ${insight.summary}\nSupplementary Data: ${supplementaryData}` }] 
      };
    }
    
    case "get_citations": {
      const { topic } = args as { topic: string };
      const citations = await queryNotebookLM(topic, "citations");
      return { 
        content: [{ type: "text", text: JSON.stringify(citations) }] 
      };
    }
    
    case "log_event": {
      const { event, article_id } = args as { event: string; article_id: string };
      // Update status board
      await updateNotionPage(article_id, { status: event });
      // Log to shared inbox
      await appendSheetRow("EventLog", { article_id, event, timestamp: new Date().toISOString() });
      
      return { 
        content: [{ type: "text", text: `Logged event for ${article_id}: ${event}` }] 
      };
    }
    
    default:
      throw new Error(`Tool ${name} not found`);
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
