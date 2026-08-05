import type { AgentTool } from "../../agent/tool";
import { createNoteTool } from "./create-note.tool";
import { deleteNoteTool } from "./delete-note.tool";
import { getNoteTool } from "./get-note.tool";
import { listNotesTool } from "./list-notes.tool";
import { updateNoteTool } from "./update-note.tool";

export const noteTools: AgentTool[] = [
  listNotesTool,
  getNoteTool,
  createNoteTool,
  updateNoteTool,
  deleteNoteTool,
];
