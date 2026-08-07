/**
 * Agent-owned tools
 *
 * Unlike domain tools, these call OpenAI directly and so live here instead of
 * a domains/<domain>/tools folder (see generate-article-cover.tool.ts).
 */
import type { AgentTool } from "../tool";
import { generateArticleCoverTool } from "./generate-article-cover.tool";

export const agentTools: AgentTool[] = [generateArticleCoverTool];
