# 🪐 Orb - MCP + Gemini Ecosystem

Welcome to **Orb (Working Title)**, a rudamentary integration of the Model Context Protocol (MCP) and Google's Gemini models, featuring a voice-enabled CLI.

## 🚀 Overview

Orb is a "smart" workspace that gives a Gemini-powered agent direct access to your local filesystem through a custom MCP server. It's not just a chat; it's a co-pilot that can read, write, and rebuild your application in real-time.

### ✨ Key Features

- **🎙️ High-Fidelity Voice**: Integrated Gemini TTS with multiple personas ("Puck", "Charon", etc.) for a more natural interaction.
- **🛠️ MCP File Tools**: A custom-built Model Context Protocol server exposing `read_file`, `write_file`, and `list_directory`.
- **🧠 Gemini 2.0/2.5 Brain**: Leverages Gemini models for complex reasoning and tool usage.
- **💻 Interactive CLI**: A stylish terminal interface with ASCII art and non-blocking background audio.

---

## 🛠️ Setup & Usage

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Google AI Studio API Key](https://aistudio.google.com/)
- PowerShell (for audio playback on Windows)

### 2. Installation

Clone the repository and install dependencies in the root:

```bash
npm install
cd frontend
npm install
```

### 3. Environment Variables

Create a `.env` file in the root:

```env
GEMINI_API_KEY=your_key_here
```

### 4. Running the Project

**Start the CLI Client:**

```bash
node client.js
```

**Start the Frontend Dev Server:**

```bash
cd frontend
npm run dev
```

---

## 🗣️ CLI Commands

While in the CLI chat, you can use these special commands:

| Command         | Action                                                                              |
| :-------------- | :---------------------------------------------------------------------------------- |
| `/voice [name]` | Switch between `rastaman`, `vampire`, `pirate`, `robot`, `valleygirl`, or `cowboy`. |
| `exit`          | End the session.                                                                    |

---

## 🛡️ Tools Available to Gemini

Gemini has access to the following tools via the MCP server:

- `read_file(path)`: Reads raw text from a file.
- `write_file(path, content)`: Writes or overwrites a file.
- `list_directory(path)`: Lists all files and folders at a location.

---

_Built with ❤️ using Google Gemini and MCP._
