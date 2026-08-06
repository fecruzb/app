/**
 * Agent-owned tools
 *
 * Unlike domain tools, these call OpenAI directly and so live here instead of
 * a domains/<domain>/tools folder (see generate-image.tool.ts).
 */
import type { AgentTool } from "../tool";
import { generateImageTool } from "./generate-image.tool";

export const agentTools: AgentTool[] = [generateImageTool];
