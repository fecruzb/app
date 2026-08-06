import { defineTool } from "@/agent/tool";
import { imageRepository } from "../repository";

export const listImagesTool = defineTool({
  name: "list_images",
  description: "Lists the tenant's uploaded images (id, url, content type, size, updated at).",
  inputSchema: {},
  execute: async (ctx) => {
    const rows = await imageRepository.list(ctx.tenantId);
    return rows.map((r) => ({
      id: r.image.id,
      url: `/media${r.image.path}`,
      contentType: r.image.contentType,
      sizeBytes: r.image.sizeBytes,
      updatedAt: r.image.updatedAt.toISOString(),
    }));
  },
});
