import type { AppContext } from "@/lib/http";
import { tenantRepository } from "../repository";

export async function listMembers(c: AppContext) {
  return c.json(await tenantRepository.listMembers(c.get("tenant").id));
}
