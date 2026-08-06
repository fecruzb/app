import type { AppContext } from "@/context";
import { toImageDto } from "../dto";
import { imageRepository } from "../repository";

export async function listImages(c: AppContext) {
  const rows = await imageRepository.list(c.get("tenant").id);
  return c.json(rows.map(toImageDto));
}
