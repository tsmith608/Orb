"use client";

import { useState, useRef, useEffect, useCallback, FormEvent } from "react";
import Orb from "./Orb";
import IdePanel from "./IdePanel";
import TerminalPanel from "./TerminalPanel";
import { VOICE_CONFIGS, VOICE_NAMES } from "@/lib/voice-configs";
import "regenerator-runtime/runtime";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

type MainTab = "chat" | "editor" | "terminal";

export default function ChatPage() {
  const [mounted, setMounted] = useState(false);
  const [mainTab, setMainTab] = useState<MainTab>("chat");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [voice, setVoice] = useState("cowboy");
  const [analyser, setAnalyser] = useState<AnalyserNode | undefined>(undefined);
  const [devPort, setDevPort] = useState<number | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioQueue = useRef<string[]>([]);
  const audioResultsMap = useRef<Map<number, string>>(new Map());
  const nextExpectedAudioIndex = useRef(0);
  const isAudioPlaying = useRef(false);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  const fetchPort = useCallback(() => {
    setPreviewError(null);
    fetch("/api/ide/start-dev")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (data.port) {
          setDevPort(data.port);
        } else if (data.error) {
          setPreviewError(data.error);
        }
      })
      .catch((err) => {
        console.error("Failed to start dev server:", err);
        setPreviewError(err.message);
      });
  }, []);

  function cancelRequest() {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setLoading(false);
  }

  function toggleListening() {
    if (!browserSupportsSpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Use Edge or Chrome.");
      return;
    }

    if (listening) {
      SpeechRecognition.stopListening();
      return;
    }

    resetTranscript();
    setInput("");

    // Kill any playing TTS audio so it doesn't feed back into the mic
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state === "running") {
      audioContextRef.current.suspend();
    }
    audioQueue.current = [];
    isAudioPlaying.current = false;

    SpeechRecognition.startListening({ continuous: true });
  }

  function reconcileAudioResults() {
    while (audioResultsMap.current.has(nextExpectedAudioIndex.current)) {
      const base64 = audioResultsMap.current.get(nextExpectedAudioIndex.current)!;
      audioQueue.current.push(base64);
      audioResultsMap.current.delete(nextExpectedAudioIndex.current);
      nextExpectedAudioIndex.current++;
    }
    processAudioQueue();
  }

  async function processAudioQueue() {
    if (isAudioPlaying.current || audioQueue.current.length === 0) return;

    isAudioPlaying.current = true;
    const base64 = audioQueue.current.shift()!;

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      setAnalyser(analyserRef.current);
    }

    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    const audio = new Audio(`data:audio/wav;base64,${base64}`);
    currentAudioRef.current = audio;
    const source = audioContextRef.current.createMediaElementSource(audio);
    source.connect(analyserRef.current!);
    analyserRef.current!.connect(audioContextRef.current.destination);

    audio.onended = () => {
      isAudioPlaying.current = false;
      processAudioQueue();
    };

    audio.play().catch((e) => {
      console.error("[Audio playback]", e);
      isAudioPlaying.current = false;
      processAudioQueue();
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    resetTranscript();

    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    audioResultsMap.current.clear();
    audioQueue.current = [];
    nextExpectedAudioIndex.current = 0;
    isAudioPlaying.current = false;

    const userMsg: Message = { role: "user", content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    abortControllerRef.current = new AbortController();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
        signal: abortControllerRef.current.signal,
      });

      if (!res.body) throw new Error("No response body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let accumulatedAssistantText = "";
      let lastTtsIndex = 0;
      let sentenceCounter = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("LOG:")) {
            const toolName = line.replace("LOG:", "");
            setMessages((prev) => [...prev, { role: "system", content: `utilizing ${toolName}` }]);
          } else if (line.startsWith("TEXT:")) {
            const contentChunk = line.replace("TEXT:", "");
            accumulatedAssistantText += contentChunk;

            setMessages((prev) => {
              const lastMsg = prev[prev.length - 1];
              if (lastMsg && lastMsg.role === "assistant") {
                return [...prev.slice(0, -1), { ...lastMsg, content: accumulatedAssistantText }];
              } else {
                return [...prev, { role: "assistant", content: accumulatedAssistantText }];
              }
            });
            setLoading(false);

            const sentenceEndMatch = accumulatedAssistantText.slice(lastTtsIndex).match(/[.!?]\s/);
            if (sentenceEndMatch) {
              const endPos = lastTtsIndex + sentenceEndMatch.index! + 1;
              const sentence = accumulatedAssistantText.slice(lastTtsIndex, endPos).trim();
              lastTtsIndex = endPos;

              if (sentence) {
                const currentIndex = sentenceCounter++;
                fetch("/api/tts", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ text: sentence, voice }),
                })
                .then(r => r.json())
                .then(data => {
                  if (data.audioBase64) {
                    audioResultsMap.current.set(currentIndex, data.audioBase64);
                    reconcileAudioResults();
                  }
                });
              }
            }
          } else if (line.startsWith("ERROR:")) {
            throw new Error(line.replace("ERROR:", ""));
          }
        }
      }

      const residual = accumulatedAssistantText.slice(lastTtsIndex).trim();
      if (residual) {
        const currentIndex = sentenceCounter++;
        fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: residual, voice }),
        })
        .then(r => r.json())
        .then(data => {
          if (data.audioBase64) {
            audioResultsMap.current.set(currentIndex, data.audioBase64);
            reconcileAudioResults();
          }
        });
      }

    } catch (err: any) {
      if (err.name === 'AbortError') {
        setMessages((prev) => [...prev, { role: "system", content: "⚠️ Request cancelled by user." }]);
        setLoading(false);
        return;
      }
      const msg = err instanceof Error ? err.message : "Unknown error";
      setMessages((prev) => [...prev, { role: "assistant", content: `⚠️ Error: ${msg}` }]);
      setLoading(false);
    }
  }

  // --- Effects ---
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetchPort();
  }, [fetchPort]);

  useEffect(() => {
    if (listening && transcript) {
      setInput(transcript);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => {
        SpeechRecognition.stopListening();
        const form = document.getElementById("chat-form") as HTMLFormElement;
        if (form) setTimeout(() => form.requestSubmit(), 100);
      }, 2000);
    }
    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, [transcript, listening]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div className="flex h-screen bg-black text-zinc-400 font-mono overflow-hidden relative">
      <div className="starfield" />

      {/* ── Left panel: Chat or Editor ── */}
      <div className="flex-1 flex flex-col relative border-r border-zinc-900 overflow-hidden">

        {/* Top tab bar */}
        <div className="shrink-0 flex items-center border-b border-zinc-900 bg-black/80 backdrop-blur-sm z-20">
          {(["chat", "editor", "terminal"] as MainTab[]).map((t) => (
            <button
              key={t}
              id={`tab-${t}`}
              onClick={() => setMainTab(t)}
              className={[
                "px-5 py-2.5 uppercase tracking-widest text-[10px] transition-all duration-200 border-r border-zinc-900",
                mainTab === t
                  ? "text-blue-400 bg-zinc-900/60 border-b-2 border-b-blue-500"
                  : "text-zinc-600 hover:text-zinc-300 hover:bg-zinc-900/30",
              ].join(" ")}
            >
              {t === "chat" ? "◎ orb" : t === "editor" ? "⌨ editor" : "⯿ terminal"}
            </button>
          ))}

          {/* Voice selector*/}
          {mainTab === "chat" && (
            <div className="ml-auto flex items-center gap-3 px-5 opacity-40 hover:opacity-100 transition-opacity">
              <label className="text-[10px] uppercase tracking-widest text-zinc-600">Persona</label>
              <select
                value={voice}
                onChange={(e) => setVoice(e.target.value)}
                className="bg-transparent border-none text-[10px] uppercase tracking-widest text-blue-400 outline-none cursor-pointer"
              >
                {VOICE_NAMES.map((v) => (
                  <option key={v} value={v} className="bg-black text-blue-400">{v}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* ── Chat view ── */}
        <div className={`flex-1 flex flex-col overflow-hidden transition-opacity duration-200 ${mainTab === "chat" ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none absolute inset-0 top-[41px]"}`}>
          {/* Orb visualizer */}
          <div className="flex-[0.6] flex items-center justify-center relative">
            <div className="w-full h-full max-w-[500px] max-h-[500px]">
              <Orb analyser={analyser} isThinking={loading} />
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
              <div className={`w-96 h-96 rounded-full bg-blue-600/10 blur-[100px] transition-transform duration-500 ${loading ? 'scale-110' : 'scale-100'}`} />
            </div>
          </div>

          {/* Messages + input */}
          <div className="flex-[0.4] flex flex-col px-12 pb-8 overflow-hidden">
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 mb-4">
              {messages.map((msg, i) => (
                <div key={i} className="text-sm leading-relaxed">
                  <span className={msg.role === "user" ? "text-zinc-500" : "text-blue-400 font-bold"}>
                    {msg.role === "user" ? "me: " : ""}
                  </span>
                  <span className={msg.role === "user" ? "text-zinc-400" : "text-zinc-300"}>
                    {msg.content}
                  </span>
                </div>
              ))}
              {loading && (
                <div className="text-blue-400 animate-pulse text-sm">blue orb is thinking...</div>
              )}
              <div ref={bottomRef} />
            </div>

            <form id="chat-form" onSubmit={handleSubmit} className="flex items-center gap-3 border-t border-zinc-900 pt-4 bg-black relative z-10">
              <span className="text-blue-500 text-lg font-bold">&gt;</span>
              <input
                autoFocus
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={mounted && listening ? "listening..." : ""}
                className="flex-1 bg-transparent border-none outline-none text-zinc-200 text-sm placeholder-zinc-800 disabled:opacity-30"
                disabled={loading}
              />
              {loading ? (
                <button
                  type="button"
                  onClick={cancelRequest}
                  className="w-7 h-7 flex-shrink-0 rounded-full flex items-center justify-center bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                  title="Cancel request"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={toggleListening}
                  title={mounted && listening ? "Stop listening" : "Voice input"}
                  className={`mic-btn ${mounted && listening ? "mic-active" : ""}`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                </button>
              )}
            </form>
          </div>
        </div>

        {/* ── Editor view ── */}
        <div className={`flex-1 overflow-hidden transition-opacity duration-200 ${mainTab === "editor" ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none absolute inset-0 top-[41px]"}`}>
          <IdePanel />
        </div>

        {/* ── Terminal view ── */}
        <div className={`flex-1 overflow-hidden transition-opacity duration-200 ${mainTab === "terminal" ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none absolute inset-0 top-[41px]"}`}>
          <TerminalPanel />
        </div>
      </div>

      {/* ── Phone Preview ── */}
      <div className="w-[450px] bg-zinc-950 flex flex-col items-center justify-center p-6 relative z-10 border-l border-zinc-900 group">
        <div className="absolute top-6 right-6 z-30 opacity-40 hover:opacity-100 transition-opacity">
          <button 
            onClick={() => {
              const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement;
              if (iframe) iframe.src = iframe.src;
              else fetchPort();
            }}
            className="p-3 bg-zinc-800 text-zinc-300 rounded-full hover:bg-zinc-700 hover:text-white transition-all shadow-lg"
            title="Force Refresh Preview"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M2.13 15.57a9 9 0 1 0 3.84-10.36l-4.24 3.79" />
            </svg>
          </button>
        </div>

        <div className="w-full h-full bg-black rounded-[40px] border-[8px] border-zinc-800 shadow-2xl relative overflow-hidden flex flex-col">
            {/* Notch */}
            <div className="absolute top-0 left-0 right-0 h-8 flex items-center justify-center z-20 pointer-events-none">
              <div className="w-16 h-1 rounded-full bg-zinc-800" />
            </div>
            {/* Live preview */}
            <div className="flex-1 overflow-hidden mt-6 mb-2 bg-white">
              {devPort ? (
                <iframe
                  id="preview-iframe"
                  src={`http://localhost:${devPort}`}
                  className="w-full h-full border-0"
                  title="Frontend Live Preview"
                  allow="clipboard-read; clipboard-write"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full bg-[#0d0d0f] p-6 text-center">
                  {previewError ? (
                    <>
                      <div className="text-red-500 text-[10px] font-mono mb-4 break-all">
                        ERROR: {previewError}
                      </div>
                      <button 
                        onClick={fetchPort}
                        className="px-3 py-1 bg-zinc-800 text-zinc-300 text-[10px] uppercase tracking-widest rounded hover:bg-zinc-700 transition-colors"
                      >
                        Retry
                      </button>
                    </>
                  ) : (
                    <div className="text-zinc-600 text-[10px] font-mono animate-pulse">
                      starting preview…
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* Home bar */}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-20 h-1 bg-zinc-800 rounded-full z-20" />
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #18181b; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #27272a; }
        .starfield {
          background-color: transparent;
          background-image: 
            radial-gradient(1px 1px at 20px 30px, #fff, rgba(0,0,0,0)),
            radial-gradient(1.2px 1.2px at 40px 70px, #fff, rgba(0,0,0,0)),
            radial-gradient(1.5px 1.5px at 50px 160px, #ddd, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 90px 40px, #fff, rgba(0,0,0,0)),
            radial-gradient(1.2px 1.2px at 130px 80px, #fff, rgba(0,0,0,0)),
            radial-gradient(1.5px 1.5px at 160px 120px, #ddd, rgba(0,0,0,0));
          background-repeat: repeat; background-size: 300px 300px; opacity: 0.4;
          position: absolute; inset: 0; pointer-events: none; z-index: 0;
        }
        .mic-btn {
          width: 28px; height: 28px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: rgba(39, 39, 42, 0.6); color: #71717a;
          border: 1px solid #27272a; cursor: pointer;
          transition: all 0.2s ease; flex-shrink: 0;
        }
        .mic-btn:hover { color: #3b82f6; border-color: #3b82f6; background: rgba(59, 130, 246, 0.1); }
        .mic-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .mic-active {
          color: #ef4444 !important; border-color: #ef4444 !important;
          background: rgba(239, 68, 68, 0.15) !important;
          animation: mic-pulse 1.5s ease-in-out infinite;
        }
        @keyframes mic-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          50% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
        }
      `}</style>
    </div>
  );
}
