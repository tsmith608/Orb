"use client";

/**
 * Monaco Editor + React Arborist file tree
 *
 *   - monaco-editor: https://github.com/suren-atoyan/monaco-react
 *   - react-arborist: https://github.com/brimdata/react-arborist
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { Tree, NodeRendererProps } from "react-arborist";
import MonacoEditor from "@monaco-editor/react";
import type { TreeNode } from "@/lib/types";

// File Node Renderer
function FileNode({ node, style, dragHandle }: NodeRendererProps<TreeNode>) {
  const isDir = !!node.data.children;

  return (
    <div
      ref={dragHandle}
      style={style}
      onClick={() => node.toggle()}
      title={node.data.id}
      className={[
        "flex items-center gap-1.5 px-2 py-[3px] rounded cursor-pointer text-[11px] leading-tight truncate select-none",
        "transition-colors duration-100",
        node.isSelected
          ? "bg-blue-600/30 text-blue-300"
          : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200",
      ].join(" ")}
    >
      {isDir ? (
        <span className="text-zinc-500 text-[9px] shrink-0">{node.isOpen ? "▾" : "▸"}</span>
      ) : (
        <span className="text-blue-800 text-[8px] shrink-0">◆</span>
      )}
      <span className="truncate">{node.data.name}</span>
    </div>
  );
}

// Main Component

export default function IdePanel() {
  const [fileTree, setFileTree] = useState<TreeNode[]>([]);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [language, setLanguage] = useState<string>("plaintext");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string>("");
  const treeRef = useRef<any>(null);

  // Load tree
  useEffect(() => {
    fetch("/api/ide/files")
      .then((r) => r.json())
      .then((data) => { if (data.tree) setFileTree(data.tree); })
      .catch(console.error);
  }, []);

  // Open file
  const openFile = useCallback(async (path: string) => {
    setSelectedPath(path);
    const res = await fetch(`/api/ide/file?path=${encodeURIComponent(path)}`);
    const data = await res.json();
    if (data.content !== undefined) {
      setFileContent(data.content);
      setLanguage(data.language ?? "plaintext");
    }
  }, []);

  // Save
  const saveFile = useCallback(async () => {
    if (!selectedPath) return;
    setSaving(true);
    setSaveMsg("");
    try {
      await fetch("/api/ide/file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: selectedPath, content: fileContent }),
      });
      setSaveMsg("saved ✓");
    } catch {
      setSaveMsg("error ✗");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(""), 2500);
    }
  }, [selectedPath, fileContent]);

  // ctrl s
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        saveFile();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [saveFile]);

  // Render 
  return (
    <div className="flex h-full w-full bg-[#0d0d0f] text-zinc-300 font-mono overflow-hidden">

      {/* File tree sidebar */}
      <div className="w-[200px] shrink-0 border-r border-zinc-800 flex flex-col bg-[#0d0d0f]">
        {/* Sidebar header */}
        <div className="px-3 py-2 text-[9px] uppercase tracking-widest text-zinc-600 border-b border-zinc-800 shrink-0">
          frontend/
        </div>
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-1">
          {fileTree.length === 0 ? (
            <div className="text-zinc-700 text-[10px] text-center pt-6 animate-pulse">loading tree…</div>
          ) : (
            <Tree
              ref={treeRef}
              data={fileTree}
              openByDefault={false}
              width={200}
              indent={14}
              rowHeight={22}
              onSelect={(nodes) => {
                const node = nodes[0];
                if (node && !node.data.children) {
                  openFile(node.data.id);
                }
              }}
            >
              {FileNode}
            </Tree>
          )}
        </div>
      </div>

      {/* editor pane */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Editor toolbar */}
        <div className="shrink-0 flex items-center justify-between px-3 py-1.5 bg-[#111114] border-b border-zinc-800">
          <span className="text-[10px] text-zinc-500 truncate max-w-[70%]">
            {selectedPath ? selectedPath : "no file selected"}
          </span>
          <div className="flex items-center gap-3">
            {saving && (
              <span className="text-[9px] text-zinc-500 uppercase tracking-widest animate-pulse">saving…</span>
            )}
            {saveMsg && !saving && (
              <span className={`text-[9px] uppercase tracking-widest ${saveMsg.includes("✓") ? "text-green-400" : "text-red-400"}`}>
                {saveMsg}
              </span>
            )}
            {selectedPath && !saving && !saveMsg && (
              <button
                onClick={saveFile}
                className="text-[9px] uppercase tracking-widest text-zinc-600 hover:text-blue-400 transition-colors"
                title="Save (Ctrl+S)"
              >
                save
              </button>
            )}
          </div>
        </div>

        {/* Monaco */}
        <div className="flex-1 overflow-hidden">
          {selectedPath ? (
            <MonacoEditor
              height="100%"
              language={language}
              value={fileContent}
              theme="vs-dark"
              onChange={(val) => setFileContent(val ?? "")}
              onMount={(editor, monaco) => {
                // Disable validation
                monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
                  noSemanticValidation: true,
                  noSyntaxValidation: true,
                });
                monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
                  noSemanticValidation: true,
                  noSyntaxValidation: true,
                });
              }}
              options={{
                fontSize: 12,
                lineHeight: 20,
                minimap: { enabled: true },
                scrollbar: { verticalScrollbarSize: 4, horizontalScrollbarSize: 4 },
                renderLineHighlight: "line",
                lineNumbers: "on",
                glyphMargin: false,
                folding: true,
                wordWrap: "off",
                padding: { top: 12, bottom: 12 },
                scrollBeyondLastLine: false,
                fontFamily: "'Geist Mono', 'Fira Code', monospace",
                fontLigatures: true,
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3">
              <div className="text-4xl opacity-10">⌨</div>
              <p className="text-zinc-600 text-sm">Select a file from the tree</p>
              <p className="text-zinc-800 text-[10px]">Ctrl+S to save · HMR refreshes the preview automatically</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
