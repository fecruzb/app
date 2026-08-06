import type { AppContext } from "@/context";
import { toMemberDto } from "../dto";
import { tenantRepository } from "../repository";

export async function listMembers(c: AppContext) {
  const rows = await tenantRepository.listMembers(c.get("tenant").id);
  return c.json(rows.map(toMemberDto));
}
