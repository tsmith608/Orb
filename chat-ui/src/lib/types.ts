/**
 * Shared type definitions for the chat-ui
 */

/** React Arborist-compatible file tree node. */
export interface TreeNode {
  id: string;
  name: string;
  children?: TreeNode[];
}
