/**
 * /api/ide/files
 *
 * Recursively walks the sibling `frontend/` directory and returns
 * a React Arborist-compatible tree of nodes.
 *
 * Docs:
 *   - React Arborist tree data format: https://github.com/brimdata/react-arborist#data
 *   - Node fs.readdir: https://nodejs.org/api/fs.html#fsreaddirpath-options-callback
 */
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { FRONTEND_DIR } from "@/lib/config";
import type { TreeNode } from "@/lib/types";

// Directories to skip — they're massive and irrelevant to editing.
const SKIP_DIRS = new Set(["node_modules", ".next", ".git", "dist", ".turbo"]);

async function buildTree(dir: string, rootDir: string): Promise<TreeNode[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const nodes: TreeNode[] = [];

  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);
    // Use path relative to frontend root as the unique ID.
    const relativePath = path.relative(rootDir, fullPath).replace(/\\/g, "/");

    if (entry.isDirectory()) {
      const children = await buildTree(fullPath, rootDir);
      nodes.push({ id: relativePath, name: entry.name, children });
    } else {
      nodes.push({ id: relativePath, name: entry.name });
    }
  }

  // Directories first, then files, both alphabetical.
  return nodes.sort((a, b) => {
    const aIsDir = !!a.children;
    const bIsDir = !!b.children;
    if (aIsDir !== bIsDir) return aIsDir ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

export async function GET() {
  try {
    const tree = await buildTree(FRONTEND_DIR, FRONTEND_DIR);
    return NextResponse.json({ tree, root: FRONTEND_DIR });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
