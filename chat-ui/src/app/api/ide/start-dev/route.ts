import { NextResponse } from "next/server";
import { spawn, ChildProcess } from "child_process";
import { FRONTEND_DIR } from "@/lib/config";
import { EventEmitter } from "events";
const g = global as any;
const DEFAULT_PORT = 3001;

if (!g.ideLogEmitter) {
  g.ideLogEmitter = new EventEmitter();
  g.ideLogEmitter.setMaxListeners(50);
}
if (!g.ideLogBuffer) {
  g.ideLogBuffer = [] as string[];
}

async function startDevServer(): Promise<number> {
  if (g.ideStartingPromise) return g.ideStartingPromise;

  g.ideStartingPromise = (async () => {
    // If a process is already running and we have its port, return immediately.
    if (g.ideDevProcess && g.ideDevProcess.exitCode === null && g.ideActualPort) {
      return g.ideActualPort;
    }

    // Kill stale handle if it exited unexpectedly.
    if (g.ideDevProcess && g.ideDevProcess.exitCode !== null) {
      g.ideDevProcess = null;
      g.ideActualPort = null;
    }

    // Check if something is already listening on the default port before spawning.
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 200); // Quick ping
      const ping = await fetch(`http://localhost:${DEFAULT_PORT}`, { signal: controller.signal });
      clearTimeout(id);
      if (ping.ok || ping.status === 404) {
        console.log(`Port ${DEFAULT_PORT} is already responsive, using it.`);
        g.ideActualPort = DEFAULT_PORT;
        return g.ideActualPort;
      }
    } catch (e) {
      // Port is prolly free, proceed to spawn.
    }

    // Spawn the dev server and wait for port.
    return new Promise<number>((resolve, reject) => {
      console.log(`Starting dev server in ${FRONTEND_DIR}...`);

      g.ideDevProcess = spawn("npx", ["next", "dev", "-p", String(DEFAULT_PORT)], {
        cwd: FRONTEND_DIR,
        env: { ...process.env },
        stdio: ["ignore", "pipe", "pipe"],
        shell: true,
      });

      let detected = false;

      const timeout = setTimeout(() => {
        if (!detected) {
          console.log("Port detection timed out, falling back to 3001");
          detected = true;
          g.ideActualPort = DEFAULT_PORT;
          resolve(g.ideActualPort);
        }
      }, 15_000);

      function parsePort(data: Buffer) {
        const text = data.toString();
        
        // Split by lines to handle buffer chunks
        const lines = text.split('\n');
        for (const line of lines) {
          if (!line.trim()) continue;
          
          console.log(`[IDE] ${line.trim()}`);
          
          g.ideLogBuffer.push(line.trim());
          if (g.ideLogBuffer.length > 500) g.ideLogBuffer.shift();
          
          g.ideLogEmitter.emit("log", line.trim());
        }
        
        const match = text.match(/localhost:(\d+)/);
        if (match && !detected) {
          detected = true;
          g.ideActualPort = parseInt(match[1], 10);
          console.log(`[IDE] Detected dev server on port ${g.ideActualPort}`);
          clearTimeout(timeout);
          resolve(g.ideActualPort);
        }
      }

      g.ideDevProcess.stdout?.on("data", parsePort);
      g.ideDevProcess.stderr?.on("data", parsePort);

      g.ideDevProcess.on("exit", (code: number) => {
        console.log(`Dev server exited with code ${code}`);
        g.ideDevProcess = null;
        g.ideActualPort = null;
        g.ideStartingPromise = null;
      });

      g.ideDevProcess.on("error", (err: any) => {
        console.error("Dev server spawn error:", err);
        g.ideStartingPromise = null;
        clearTimeout(timeout);
        reject(err);
      });
    });
  })();

  return g.ideStartingPromise;
}

export async function GET() {
  try {
    const port = await startDevServer();
    return NextResponse.json({
      port,
      status: "started",
      url: `http://localhost:${port}`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
