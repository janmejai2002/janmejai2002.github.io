import { execSync } from 'child_process';

/**
 * NotebookLM Client Wrapper
 * Uses the `nlm` CLI (assuming it's on PATH) or an MCP client.
 */
export async function queryNotebookLM(topic: string, context?: string): Promise<{ summary: string; confidence: number }> {
  try {
    // Assuming 'nlm chat <topic>' is the command
    const output = execSync(`nlm chat "${topic}" ${context ? `"${context}"` : ''}`).toString();
    // Dummy parser for demonstration; reality requires actual JSON parsing
    return { summary: output, confidence: 0.9 };
  } catch (error) {
    console.error("Failed to query NotebookLM", error);
    return { summary: "Error retrieving insight.", confidence: 0.0 };
  }
}

export async function getCitations(topic: string): Promise<any> {
    try {
        const output = execSync(`nlm citations "${topic}"`).toString();
        return JSON.parse(output);
    } catch (error) {
        console.error("Failed to retrieve citations", error);
        return [];
    }
}
