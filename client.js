import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import { spawn, execSync } from "child_process";
import readline from "readline/promises";
import fs from "fs";
import path from "path";
import os from "os";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const chatModel = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

// --- VOICE CUSTOMIZATION ---
// Available Voice Names: "Puck", "Charon", "Kore", "Fenrir"
const VOICE_CONFIGS = {
  rastaman: {
    name: "Charon",
    style: "You are a rastaman, you speak only in patois. Be laid back and friendly but speak quickly."
  },
  vampire: {
    name: "Charon",
    style: "You are a suave, sophisticated, and slightly evil aristocrat vampire. Speak with devilish charm."
  },
  pirate: {
    name: "Charon",
    style: "You are a pirate, you speak only in pirate tone and inflections."
  },
  robot: {
    name: "Puck",
    style: "You are a robot, you speak only in robot tone and inflections."
  },
  valleygirl: {
    name: "Kore",
    style: "You are a valley girl, you speak only in valley girl tone and inflections. 1000% vocal fry and drag the last syllable of those words out."
  },
  cowboy: {
    name: "Charon",
    style: "You are an old man, you speak only in old man tone and inflections."
  }
};

let currentVoice = "cowboy"; // Default voice

const ttsModel = genAI.getGenerativeModel({ 
  model: "gemini-2.5-pro-preview-tts"
});

/**
 * Initialize the MCP Client and connect to the local server.
 */
async function setupMcpClient() {
  const transport = new StdioClientTransport({
    command: "node",
    args: ["server.js"],
  });

  const client = new Client({
    name: "demo-client",
    version: "1.0.0",
  });

  await client.connect(transport);
  return client;
}

/**
 * Play audio buffer using Windows PowerShell
 */
/**
 * Helper to wrap raw PCM data in a WAV (RIFF) header so Windows can play it.
 */
function addWavHeader(pcmBuffer, sampleRate = 24000) {
  const header = Buffer.alloc(44);
  const dataSize = pcmBuffer.length;
  
  // RIFF identifier
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write("WAVE", 8);
  
  // fmt chunk
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16); // Subchunk1Size
  header.writeUInt16LE(1, 20);   // AudioFormat (PCM)
  header.writeUInt16LE(1, 22);   // NumChannels (Mono)
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28); // ByteRate (SampleRate * 2)
  header.writeUInt16LE(2, 32);   // BlockAlign
  header.writeUInt16LE(16, 34);  // BitsPerSample
  
  // data chunk
  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);
  
  return Buffer.concat([header, pcmBuffer]);
}

/**
 * Play audio buffer using Windows PowerShell
 */
function playAudio(audioBase64) {
  try {
    const rawPcm = Buffer.from(audioBase64, "base64");
    const wavBuffer = addWavHeader(rawPcm, 24000); // 24kHz Mono is Gemini TTS default
    
    const tempFile = path.join(os.tmpdir(), `gemini_speech_${Date.now()}.wav`);
    fs.writeFileSync(tempFile, wavBuffer);
    
    console.log(`\n[Audio]: Playing response with ${VOICE_CONFIGS[currentVoice].name} voice...`);
    
    const psCommand = `(New-Object Media.SoundPlayer "${tempFile}").PlaySync(); Remove-Item "${tempFile}"`;
    execSync(`powershell -Command "${psCommand}"`, { stdio: 'inherit' });
  } catch (error) {
    console.error("\n[Audio Playback Error]:", error.message);
  }
}

/**
 * Interactive CLI Chat Loop
 */
async function startChat() {
  const mcpClient = await setupMcpClient();
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });


  // List tools from the MCP server
  const toolsResponse = await mcpClient.listTools();
  const mcpTools = toolsResponse.tools;

  // Convert MCP tools to Gemini function declarations
  const functionDeclarations = mcpTools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    parameters: tool.inputSchema,
  }));

  // Create a chat session with tool capabilities (text only for brain)
  const chat = chatModel.startChat({
    tools: [{ functionDeclarations }],
  });

  console.log(String.raw`
--- Backwater MCP + Gemini CLI Chat ---
                   ___                          (_)
                _/XXX\
 _             /XXXXXX\_                                    __
 X\__    __   /X XXXX XX\                          _       /XX\__      ___
     \__/  \_/__       \ \                       _/X\__   /XX XXX\____/XXX\
   \  ___   \/  \_      \ \               __   _/      \_/  _/  -   __  -  \__/
  ___/   \__/   \ \__     \\__           /  \_//  _ _ \  \     __  /  \____//
 /  __    \  /     \ \_   _//_\___     _/    //           \___/  \/     __/
 __/_______\________\__\_/________\_ _/_____/_____________/_______\____/_______
                                   /|\
                                  / | \
                                 /  |  \
                                /   |   \
                               /    |    \
                              /     |     \
                             /      |      \
                            /       |       \
                           /        |        \
                          /         |         \
  `);
  console.log("Type 'exit' to quit.");
  console.log("Available tools:", mcpTools.map(t => t.name).join(", "));

  while (true) {
    const userInput = await rl.question("\nYou: ");
    
    if (userInput.toLowerCase() === "exit") {
      break;
    }

    // Handle voice switching command
    if (userInput.startsWith("/voice ")) {
      const newVoice = userInput.split(" ")[1];
      if (VOICE_CONFIGS[newVoice]) {
        currentVoice = newVoice;
        console.log(`\n[System]: Voice switched to ${newVoice.toUpperCase()}!`);
        continue;
      } else {
        console.log(`\n[System]: Unknown voice. Available: ${Object.keys(VOICE_CONFIGS).join(", ")}`);
        continue;
      }
    }

    try {
      let result = await chat.sendMessage(userInput);

      // Handle tool calling loop
      while (result.response.candidates[0].content.parts.some(p => p.functionCall)) {
        const callParts = result.response.candidates[0].content.parts.filter(p => p.functionCall);

        const responses = await Promise.all(
          callParts.map(async (part) => {
            const { name, args } = part.functionCall;

            const toolResult = await mcpClient.callTool({
              name,
              arguments: args,
            });

            return {
              functionResponse: {
                name,
                response: { content: toolResult.content[0].text },
              },
            };
          })
        );

        result = await chat.sendMessage(responses);
      }

      console.log(`\nGemini: ${result.response.text()}`);

      // Generate and play high-fidelity audio using the TTS model
      try {
        const ttsResponse = await ttsModel.generateContent({
          contents: [{ 
            role: 'user', 
            parts: [
              { text: `[DIRECTOR'S NOTES]: ${VOICE_CONFIGS[currentVoice].style}` },
              { text: `[TRANSCRIPT]: ${result.response.text()}` }
            ] 
          }],
          generationConfig: {
            responseModalities: ["audio"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: VOICE_CONFIGS[currentVoice].name
                }
              }
            }
          }
        });

        const audioPart = ttsResponse.response.candidates[0].content.parts.find(p => p.inlineData && p.inlineData.mimeType.startsWith("audio/"));
        if (audioPart) {
          playAudio(audioPart.inlineData.data);
        } else {
          console.log("\n[TTS Debug]: No audio part found in model response.");
          // Log the parts to see what we DID get
          console.log("[TTS Debug]: Parts received:", JSON.stringify(ttsResponse.response.candidates[0].content.parts.map(p => Object.keys(p))));
        }
      } catch (ttsError) {
        console.error("\n[TTS Error]:", ttsError.message);
      }
    } catch (error) {
      console.error("\nError during chat:", error.message);
    }
  }

  // Cleanup
  rl.close();
  await mcpClient.close();
  console.log("\nChat session ended.");
}

startChat().catch(console.error);
