import type { AppContext } from "@/context";
import { getAiUsage as getAiUsageForUser } from "../service";

export async function getAiUsage(c: AppContext) {
  return c.json(await getAiUsageForUser(c.get("user").id));
}
