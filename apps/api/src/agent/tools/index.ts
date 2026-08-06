// Agent-owned tools: unlike domain tools, these call OpenAI directly and so
// live here instead of a domains/*/tools folder (see generate-image.tool.ts).
import type { AgentTool } from "../tool";
import { generateImageTool } from "./generate-image.tool";

export const agentTools: AgentTool[] = [generateImageTool];
