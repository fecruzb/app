import type { AppContext } from "@/context";
import { toTenantSummary } from "../service";

export async function getTenant(c: AppContext) {
  return c.json(toTenantSummary(c.get("tenant"), c.get("membership").role));
}
