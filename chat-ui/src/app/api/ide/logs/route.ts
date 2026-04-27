import { NextResponse } from "next/server";

const g = global as any;

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  // If the server hasn't been started yet, these won't exist.
  const emitter = g.ideLogEmitter;
  const buffer = g.ideLogBuffer || [];

  const stream = new ReadableStream({
    start(controller) {
      // 1. Send the history buffer first
      if (buffer.length > 0) {
        for (const line of buffer) {
          controller.enqueue(`data: ${JSON.stringify(line)}\n\n`);
        }
      }

      // 2. If the emitter doesn't exist yet, we can't listen to new logs.
      // This happens if the user opens the Terminal before the preview starts.
      if (!emitter) {
        controller.enqueue(`data: ${JSON.stringify("[IDE] Waiting for dev server to start...")}\n\n`);
        // We could poll to wait for the emitter, but the client can just reconnect.
        return;
      }

      // 3. Listen to new logs
      const onLog = (line: string) => {
        try {
          controller.enqueue(`data: ${JSON.stringify(line)}\n\n`);
        } catch (e) {
          // Stream might be closed
          emitter.removeListener("log", onLog);
        }
      };

      emitter.on("log", onLog);

      // Handle client disconnect
      req.signal.addEventListener("abort", () => {
        emitter.removeListener("log", onLog);
      });
    }
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
