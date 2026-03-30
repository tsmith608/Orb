# MCP + Gemini Demonstration

This project demonstrates how to use the **Model Context Protocol (MCP)** to give **Google's Gemini AI** the ability to interact with your local filesystem (Read/Write).

## How it Works
1.  **`server.js`**: A Node.js MCP server that exposes two tools: `read_file` and `write_file`. It uses the `@modelcontextprotocol/sdk` over `stdio`.
2.  **`client.js`**: A Node.js client that:
    - Spawns the MCP server as a subprocess.
    - Connects to it to discover available tools.
    - Uses the `@google/generative-ai` SDK to call Gemini.
    - Forwards Gemini's tool calls to the local MCP server.

## Getting Started

### 1. Prerequisites
- Node.js installed.
- A [Google AI API Key](https://aistudio.google.com/app/apikey).

### 2. Setup
Clone this folder and install dependencies:
```bash
npm install
```

### 3. Configuration
Create a `.env` file in the root directory (or rename `.env.example`):
```bash
GEMINI_API_KEY=your_actual_api_key_here
```

### 4. Run the Demo
The demo script in `client.js` will ask Gemini to write a file, read it back, and summarize it.
```bash
node client.js
```

## Implementation Details
- **Protocol**: JSON-RPC over Standard Input/Output (stdio).
- **AI Model**: `gemini-1.5-flash` (configurable in `client.js`).
- **Safety**: The server uses `path.resolve` for basic path safety, but in a production environment, you should restrict access to specific directories.
