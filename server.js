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

// --- DevDocs Integration ---
const DEVDOCS_CACHE = new Map();

async function getDevDocsIndex(slug) {
  if (DEVDOCS_CACHE.has(slug)) {
    return DEVDOCS_CACHE.get(slug);
  }
  try {
    const response = await fetch(`https://devdocs.io/docs/${slug}/index.json`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (!response.ok) throw new Error(`Docs for ${slug} not found (Status: ${response.status})`);
    const data = await response.json();
    DEVDOCS_CACHE.set(slug, data);
    return data;
  } catch (error) {
    console.error(`Error fetching DevDocs index for ${slug}:`, error.message);
    return null;
  }
}

/**
 * Handle listing available tools. Right now we're allowing Gemini to
 * use the regular Node.js fs module.
 * https://nodejs.org/api/fs.html
 * Exposes read_file, write_file, list_directory, delete_file, and devdocs integration.
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
      {
        name: "delete_file",
        description: "Delete a file from the local filesystem. Use this to remove duplicate components or clean up the file tree.",
        inputSchema: {
          type: "object",
          properties: {
            path: {
              type: "string",
              description: "The path to the file to delete.",
            },
          },
          required: ["path"],
        },
      },
      {
        name: "devdocs_list_slugs",
        description: "List available documentation slugs for DevDocs.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "devdocs_search",
        description: "Search for a term within a specific documentation set.",
        inputSchema: {
          type: "object",
          properties: {
            slug: {
              type: "string",
              description: "The documentation slug (e.g., 'next', 'tailwind', 'typescript', 'react', 'css').",
            },
            query: {
              type: "string",
              description: "The term to search for.",
            },
          },
          required: ["slug", "query"],
        },
      },
      {
        name: "devdocs_get",
        description: "Retrieve the content of a specific documentation entry. Use the EXACT path returned from devdocs_search.",
        inputSchema: {
          type: "object",
          properties: {
            slug: {
              type: "string",
              description: "The documentation slug (e.g., 'nextjs', 'css', 'tailwind').",
            },
            path: {
              type: "string",
              description: "The exact path string (e.g. 'animation' or 'app/api-reference/components/image'). Do NOT include the 'path:' prefix.",
            },
          },
          required: ["slug", "path"],
        },
      },
      {
        name: "check_build_status",
        description: "Ping the local Next.js dev server to check if there are any build or compilation errors currently on the page. Use this after making changes to verify they didn't break the app.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
    ],
  };
});

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND_ROOT = path.resolve(__dirname, "frontend");

function safePath(requestedPath) {
  // Resolve path relative to the frontend root to ensure we don't escape it
  const resolvedPath = path.resolve(FRONTEND_ROOT, requestedPath);
  
  // Security Check: Make sure the final path still starts with FRONTEND_ROOT
  if (!resolvedPath.startsWith(FRONTEND_ROOT)) {
    throw new Error("Access denied: You are only allowed to modify files inside the 'frontend/' directory.");
  }
  return resolvedPath;
}

/**
 * Handle tool execution.
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "read_file") {
      const filePath = safePath(args.path);
      const content = await fs.readFile(filePath, "utf-8");
      return {
        content: [{ type: "text", text: content }],
      };
    } else if (name === "write_file") {
      const filePath = safePath(args.path);
      await fs.writeFile(filePath, args.content, "utf-8");
      return {
        content: [{ type: "text", text: `Successfully wrote to ${args.path}` }],
      };
    } else if (name === "delete_file") {
      const filePath = safePath(args.path);
      await fs.unlink(filePath);
      return {
        content: [{ type: "text", text: `Successfully deleted ${args.path}` }],
      };
    } else if (name === "list_directory") {
      const dirPath = safePath(args.path);
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
    } else if (name === "devdocs_list_slugs") {
      // Common slugs to avoid a massive 400+ list
      const commonSlugs = [
        "nextjs", "tailwind", "typescript", "react", "framer", 
        "javascript", "css", "html", "node", "express", 
        "postgresql", "mongodb", "sqlite", "redis"
      ];
      return {
        content: [{ type: "text", text: `Common Slugs: ${commonSlugs.join(", ")}\n\nYou can also try other standard library/framework names.` }],
      };
    } else if (name === "devdocs_search") {
      const { slug, query } = args;
      const index = await getDevDocsIndex(slug);
      if (!index) throw new Error(`Could not find documentation for '${slug}'`);

      const results = index.entries
        .filter(e => e.name.toLowerCase().includes(query.toLowerCase()) || (e.path && e.path.toLowerCase().includes(query.toLowerCase())))
        .slice(0, 15)
        .map(e => `- ${e.name} (path: "${e.path}")`)
        .join("\n");

      return {
        content: [{ type: "text", text: results || "No matches found." }],
      };
    } else if (name === "devdocs_get") {
      const { slug, path: entryPath } = args;
      const response = await fetch(`https://documents.devdocs.io/${slug}/${entryPath}.html`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      if (!response.ok) throw new Error(`Could not fetch content for ${entryPath} (Status: ${response.status})`);
      const html = await response.text();
      
      // Basic HTML to Markdown-ish cleaning
      const text = html
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      return {
        content: [{ type: "text", text: text.slice(0, 5000) }], // Limit size
      };
    } else if (name === "check_build_status") {
      try {
        // Attempt to hit the dev server
        const response = await fetch("http://localhost:3001");
        if (response.ok) {
          return { content: [{ type: "text", text: "SUCCESS: Page loaded without Next.js errors." }] };
        } else {
          const html = await response.text();
          const stripped = html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').substring(0, 2000);
          return { content: [{ type: "text", text: `ERROR: Server returned status ${response.status}. There is likely a build or compilation error.\n\nPreview of error page:\n${stripped}` }] };
        }
      } catch (e) {
        return { content: [{ type: "text", text: `ERROR: Could not connect to dev server at localhost:3001. Is it running? Details: ${e.message}` }] };
      }
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

