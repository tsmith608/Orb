"use client";

import { useEffect, useRef, useState } from "react";

export default function TerminalPanel() {
  const [logs, setLogs] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const eventSource = new EventSource("/api/ide/logs");

    eventSource.onmessage = (event) => {
      try {
        const line = JSON.parse(event.data);
        setLogs((prev) => {
          const next = [...prev, line];
          // Keep only the last 1000 lines in the UI to prevent memory bloat
          if (next.length > 1000) return next.slice(next.length - 1000);
          return next;
        });
      } catch (e) {
        console.error("Failed to parse log line", e);
      }
    };

    eventSource.onerror = () => {
      // It might disconnect if the server restarts. 
      // EventSource automatically attempts to reconnect.
    };

    return () => {
      eventSource.close();
    };
  }, []);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="w-full h-full bg-[#0d0d0f] text-[#00ff00] p-4 font-mono text-xs overflow-y-auto" ref={containerRef}>
      {logs.length === 0 ? (
        <div className="text-zinc-500 italic">Waiting for logs...</div>
      ) : (
        logs.map((log, i) => (
          <div key={i} className="whitespace-pre-wrap break-words">
            {log}
          </div>
        ))
      )}
    </div>
  );
}
