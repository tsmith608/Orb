import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "fs/promises";
import path from "path";

const server = new Server(
  {
    name: "file-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Handle listing available tools. Right now we're allowing Gemini to
 * use the regular Node.js fs module.
 * https://nodejs.org/api/fs.html
 * Exposes read_file, write_file, and list_directory.
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "read_file",
        description: "Read the contents of a file from the local filesystem.",
        inputSchema: {
          type: "object",
          properties: {
            path: {
              type: "string",
              description: "The path to the file to read.",
            },
          },
          required: ["path"],
        },
      },
      {
        name: "write_file",
        description: "Write content to a file on the local filesystem.",
        inputSchema: {
          type: "object",
          properties: {
            path: {
              type: "string",
              description: "The path where the file should be written.",
            },
            content: {
              type: "string",
              description: "The content to write to the file.",
            },
          },
          required: ["path", "content"],
        },
      },
      {
        name: "list_directory",
        description: "List the contents of a directory on the local filesystem.",
        inputSchema: {
          type: "object",
          properties: {
            path: {
              type: "string",
              description: "The path to the directory to list.",
            },
          },
          required: ["path"],
        },
      },
    ],
  };
});

/**
 * Handle tool execution.
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "read_file") {
      const filePath = path.resolve(args.path);
      const content = await fs.readFile(filePath, "utf-8");
      return {
        content: [{ type: "text", text: content }],
      };
    } else if (name === "write_file") {
      const filePath = path.resolve(args.path);
      await fs.writeFile(filePath, args.content, "utf-8");
      return {
        content: [{ type: "text", text: `Successfully wrote to ${args.path}` }],
      };
    } else if (name === "list_directory") {
      const dirPath = path.resolve(args.path);
      const items = await fs.readdir(dirPath, { withFileTypes: true });
      const list = items
        .map((item) => `${item.isDirectory() ? "[DIR]" : "[FILE]"} ${item.name}`)
        .join("\n");
      return {
        content: [
          {
            type: "text",
            text: list || "(Directory is empty)",
          },
        ],
      };
    } else {
      throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error: ${error.message}` }],
      isError: true,
    };
  }
});

/**
 * Start the server using stdio transport.
 * https://mcp-framework.com/docs/Transports/stdio-transport/
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("File server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});


/*
The official MCP filesystem server we will integrate in the final sprint.
This handles security and offers a much deeper feature set than what I implemented here.
https://github.com/modelcontextprotocol/servers/blob/main/src/filesystem/index.ts

*/