import type { AgentTool } from "@/agent/tool";
import { createArticleTool } from "./create-article.tool";
import { deleteArticleTool } from "./delete-article.tool";
import { getArticleTool } from "./get-article.tool";
import { listArticlesTool } from "./list-articles.tool";
import { updateArticleTool } from "./update-article.tool";

export const articleTools: AgentTool[] = [
  listArticlesTool,
  getArticleTool,
  createArticleTool,
  updateArticleTool,
  deleteArticleTool,
];
