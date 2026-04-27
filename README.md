# 🪐 Orb - MCP + Gemini Workspace

A powerful integration of the Model Context Protocol (MCP) and Google's Gemini models, featuring a cinematic web interface and a voice-enabled CLI.

## 📁 Structure

- `server.js`: The MCP Server. Exposes filesystem tools and DevDocs search to Gemini.
- `chat-ui/`: High-fidelity Next.js web interface with streaming text and integrated IDE panels.
- `client.js`: Interactive CLI client with Gemini TTS (voice personas).
- `frontend/`: Mobile-first UI sandbox and design playground.

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- Google AI Studio API Key

### 2. Setup
Clone and install dependencies in the root and chat-ui:
```bash
npm install
cd chat-ui && npm install
```

### 3. Configuration
Create a `.env` file in the root:
```env
GEMINI_API_KEY=your_key_here
```

### 4. Usage

**Web Interface (Recommended):**
```bash
cd chat-ui
npm run dev
```
Open `http://localhost:3000`

**CLI Interface:**
```bash
node client.js
```

## 🛠️ Tools Available
Gemini can automatically use these tools via the MCP server:
- `read_file`, `write_file`, `list_directory`, `delete_file`
- `devdocs_search`, `devdocs_get`
- `check_build_status`
