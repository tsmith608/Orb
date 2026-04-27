import { NextRequest } from "next/server";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { chatModel } from "@/lib/gemini";
import path from "path";

const SERVER_PATH = path.resolve(process.cwd(), "..", "server.js");

let globalMcpClient: Client | null = null;

async function getMcpClient() {
  if (globalMcpClient) return globalMcpClient;
  const transport = new StdioClientTransport({ command: "node", args: [SERVER_PATH] });
  const client = new Client({ name: "chat-ui-client", version: "1.0.0" });
  await client.connect(transport);
  globalMcpClient = client;
  return client;
}

// Helper to simulate a small delay for cooler streaming
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function POST(req: NextRequest) {
  const { messages } = await req.json();
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  (async () => {
    try {
      const mcpClient = await getMcpClient();
      const toolsResponse = await mcpClient.listTools();
      const functionDeclarations = toolsResponse.tools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        parameters: tool.inputSchema as any,
      }));

      const history = messages.slice(0, -1)
        .filter((m: any) => m.role !== "system")
        .map((m: { role: string; content: string }) => ({
          role: m.role === "user" ? "user" : "model",
          parts: [{ text: m.content }],
        }));

      const chat = chatModel.startChat({
        history,
        tools: [{ functionDeclarations }],
      });

      const lastUserMessage = messages[messages.length - 1].content;
      let result = await chat.sendMessageStream(lastUserMessage);

      let currentResponse = await result.response;
      
      while (currentResponse.candidates?.[0]?.content?.parts?.some((p) => p.functionCall)) {
        const callParts = currentResponse.candidates[0].content.parts.filter((p) => p.functionCall);
        
        for (const part of callParts) {
          await writer.write(encoder.encode(`LOG:${part.functionCall!.name}\n`));
        }

        const toolResponses = await Promise.all(
          callParts.map(async (part) => {
            const { name, args } = part.functionCall!;
            const toolResult = await mcpClient.callTool({ name, arguments: args as Record<string, unknown> });
            return {
              functionResponse: { name, response: { content: (toolResult.content as any)[0]?.text ?? "" } },
            };
          })
        );

        result = await chat.sendMessageStream(toolResponses);
        currentResponse = await result.response;
      }

      // Stream the text with artificial pacing for "coolness"
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        if (chunkText) {
          // Break the chunk into smaller pieces to ensure it flows word-by-word
          const words = chunkText.split(' ');
          for (const word of words) {
            await writer.write(encoder.encode(`TEXT:${word} `));
            await delay(30); // 30ms delay between words for typewriter feel
          }
          await writer.write(encoder.encode(`\n`));
        }
      }
    } catch (err: any) {
      await writer.write(encoder.encode(`ERROR:${err.message}`));
    } finally {
      await writer.close();
    }
  })();

  return new Response(stream.readable, { headers: { "Content-Type": "text/event-stream" } });
}
