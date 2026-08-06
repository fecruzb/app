import type { AppContext } from "@/context";
import { toImageDto } from "../dto";
import { imageRepository } from "../repository";

/**
 * List images
 *
 * `GET /api/tenants/:tenantId/images`
 *
 * Returns all images for the current tenant.
 *
 * @param c - Authenticated tenant request context
 * @returns 200 with an array of image DTOs
 */
export async function listImages(c: AppContext) {
  // -- Input -----------------------------------------------------------------
  const tenantId = c.get("tenant").id;

  // -- Processing ------------------------------------------------------------
  const rows = await imageRepository.list(tenantId);

  // -- Output ----------------------------------------------------------------
  return c.json(rows.map(toImageDto));
}
