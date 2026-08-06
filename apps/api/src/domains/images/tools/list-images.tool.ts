import { defineTool } from "@/agent/tool";
import { imageRepository } from "../repository";

/**
 * List images
 *
 * `list_images`
 *
 * Lists the tenant's uploaded images.
 *
 * @returns Array of `{ id, url, contentType, sizeBytes, updatedAt }`
 */
export const listImagesTool = defineTool({
  name: "list_images",
  description: "Lists the tenant's uploaded images (id, url, content type, size, updated at).",
  inputSchema: {},
  execute: async (ctx) => {
    // -- Input -----------------------------------------------------------------
    const { tenantId } = ctx;

    // -- Processing ------------------------------------------------------------
    const rows = await imageRepository.list(tenantId);

    // -- Output ----------------------------------------------------------------
    return rows.map((r) => ({
      id: r.image.id,
      url: `/media${r.image.path}`,
      contentType: r.image.contentType,
      sizeBytes: r.image.sizeBytes,
      updatedAt: r.image.updatedAt.toISOString(),
    }));
  },
});
