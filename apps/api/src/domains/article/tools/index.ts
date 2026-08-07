/**
 * Article tools
 *
 * Agent tools for the article domain. Registered in `agent/registry.ts`.
 */
import type { AgentTool } from "@/agent/tool";
import { createArticleTool } from "./create-article.tool";
import { deleteArticleTool } from "./delete-article.tool";
import { getArticleTool } from "./get-article.tool";
import { listArticlesTool } from "./list-articles.tool";
import { publishArticleTool } from "./publish-article.tool";
import { updateArticleTool } from "./update-article.tool";

export const articleTools: AgentTool[] = [
  listArticlesTool,
  getArticleTool,
  createArticleTool,
  updateArticleTool,
  publishArticleTool,
  deleteArticleTool,
];
