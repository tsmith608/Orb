/**
 * /api/ide/file
 *
 * GET  ?path=relative/path  → reads the file from `frontend/`
 * POST { path, content }    → writes content to the file in `frontend/`
 *
 * Language detection drives Monaco syntax highlighting.
 *
 * Docs:
 *   - Monaco Editor language IDs: https://github.com/microsoft/monaco-editor/tree/main/src/basic-languages
 *   - Node fs.readFile / writeFile: https://nodejs.org/api/fs.html
 */
import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { FRONTEND_DIR } from "@/lib/config";

const EXT_TO_LANGUAGE: Record<string, string> = {
  ts: "typescript",
  tsx: "typescript",
  js: "javascript",
  jsx: "javascript",
  css: "css",
  scss: "scss",
  html: "html",
  json: "json",
  md: "markdown",
  mdx: "markdown",
  yaml: "yaml",
  yml: "yaml",
  toml: "ini",
  env: "ini",
  sh: "shell",
  txt: "plaintext",
};

function getLanguage(filePath: string): string {
  const ext = filePath.split(".").pop()?.toLowerCase() ?? "";
  return EXT_TO_LANGUAGE[ext] ?? "plaintext";
}

function safePath(relativePath: string): string {
  // Prevent directory traversal attacks.
  const resolved = path.resolve(FRONTEND_DIR, relativePath);
  if (!resolved.startsWith(FRONTEND_DIR)) {
    throw new Error("Path traversal detected.");
  }
  return resolved;
}

export async function GET(req: NextRequest) {
  const filePath = req.nextUrl.searchParams.get("path");
  if (!filePath) {
    return NextResponse.json({ error: "Missing path param" }, { status: 400 });
  }
  try {
    const absolute = safePath(filePath);
    const content = await fs.readFile(absolute, "utf-8");
    return NextResponse.json({ content, language: getLanguage(filePath) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { path: filePath, content } = await req.json();
  if (!filePath || content === undefined) {
    return NextResponse.json({ error: "Missing path or content" }, { status: 400 });
  }
  try {
    const absolute = safePath(filePath);
    await fs.writeFile(absolute, content, "utf-8");
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
