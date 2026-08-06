/**
 * Generate image tool
 *
 * Lives in `agent/`, not `domains/images/tools/`: it is the one tool that
 * calls OpenAI directly. Domains stay transport-neutral — OpenAI belongs only
 * in `integrations/`, orchestrated from here (see agent-tools.mdc).
 */
import { z } from "zod";
import { generateImage } from "@/integrations/openai";
import { env } from "@/lib/env";
import { newUploadKey, writeMedia } from "@/domains/images/media";
import { imageRepository } from "@/domains/images/repository";
import { usageRepository } from "@/domains/usage/repository";
import { assertAiBudget } from "@/domains/usage/service";
import { defineTool } from "../tool";

const SIZE_BY_ORIENTATION = {
  square: "1024x1024",
  portrait: "1024x1536",
  landscape: "1536x1024",
} as const;

/**
 * Generate an image
 *
 * `generate_image`
 *
 * Generates an image from a text description and saves it to the tenant's images.
 *
 * @returns `{ id, url }` of the saved image
 */
export const generateImageTool = defineTool({
  name: "generate_image",
  description:
    "Generates an image from a text description and saves it to the tenant's images. Returns its id and url.",
  inputSchema: {
    prompt: z.string().trim().min(1).max(2000),
    orientation: z.enum(["square", "portrait", "landscape"]).default("square"),
  },
  summarize: (args) => `Image generated: ${args.prompt.slice(0, 60)}`,
  execute: async (ctx, { prompt, orientation }) => {
    // -- Input -----------------------------------------------------------------
    const { tenantId, userId } = ctx;

    // -- Processing ------------------------------------------------------------
    if (userId) await assertAiBudget(userId);

    const { data, usage } = await generateImage({
      model: env.imageModel,
      prompt,
      size: SIZE_BY_ORIENTATION[orientation],
    });

    const { path, sizeBytes } = await writeMedia(newUploadKey(tenantId, "png"), data);
    const image = await imageRepository.insert({
      tenantId,
      authorId: userId,
      path,
      contentType: "image/webp",
      sizeBytes,
    });

    if (userId) {
      await usageRepository.insert({
        userId,
        tenantId,
        model: usage.model,
        inputTokens: usage.inputTokens,
        cachedInputTokens: usage.cachedInputTokens,
        outputTokens: usage.outputTokens,
        rounds: usage.rounds,
        costMicros: usage.costMicros,
      });
    }

    // -- Output ----------------------------------------------------------------
    return { id: image.id, url: `/media${image.path}` };
  },
});
