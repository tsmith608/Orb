import { NextRequest, NextResponse } from "next/server";
import { ttsModel } from "@/lib/gemini";
import { VOICE_CONFIGS } from "@/lib/voice-configs";
import { addWavHeader } from "@/lib/audio-utils";

export async function POST(req: NextRequest) {
  try {
    const { text, voice = "cowboy" } = await req.json();
    if (!text) return NextResponse.json({ error: "No text provided" }, { status: 400 });

    const voiceConfig = VOICE_CONFIGS[voice] ?? VOICE_CONFIGS.cowboy;

    const ttsResponse = await ttsModel.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: `[DIRECTOR'S NOTES]: ${voiceConfig.style}` },
            { text: `[TRANSCRIPT]: ${text}` },
          ],
        },
      ],
      generationConfig: {
        // @ts-expect-error
        responseModalities: ["audio"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceConfig.name },
          },
        },
      },
    });

    const audioPart = ttsResponse.response.candidates?.[0]?.content?.parts?.find(
      (p) => p.inlineData && p.inlineData.mimeType.startsWith("audio/")
    );

    if (audioPart?.inlineData) {
      const rawPcm = Buffer.from(audioPart.inlineData.data, "base64");
      const wav = addWavHeader(rawPcm, 24000);
      return NextResponse.json({ audioBase64: wav.toString("base64") });
    }

    return NextResponse.json({ error: "Failed to generate audio" }, { status: 500 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
