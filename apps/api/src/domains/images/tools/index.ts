import type { AgentTool } from "@/agent/tool";
import { deleteImageTool } from "./delete-image.tool";
import { listImagesTool } from "./list-images.tool";

export const imageTools: AgentTool[] = [listImagesTool, deleteImageTool];
