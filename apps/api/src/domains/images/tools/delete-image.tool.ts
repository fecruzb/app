import { z } from "zod";
import { defineTool } from "@/agent/tool";
import { removeMedia } from "../media";
import { imageRepository } from "../repository";

/**
 * Delete an image
 *
 * `delete_image`
 *
 * Deletes an uploaded image by id and removes its media file.
 *
 * @returns `{ ok: true }`
 */
export const deleteImageTool = defineTool({
  name: "delete_image",
  description: "Deletes an uploaded image by id. Only use when the user explicitly asks.",
  inputSchema: { id: z.string().uuid() },
  summarize: () => "Image deleted",
  execute: async (ctx, { id }) => {
    // -- Input -----------------------------------------------------------------
    const { tenantId } = ctx;

    // -- Processing ------------------------------------------------------------
    const image = await imageRepository.delete(tenantId, id);
    if (!image) throw new Error("Image not found — check the id with list_images");
    await removeMedia(image.path);

    // -- Output ----------------------------------------------------------------
    return { ok: true };
  },
});
