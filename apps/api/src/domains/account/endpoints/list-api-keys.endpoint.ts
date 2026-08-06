import type { AppContext } from "@/context";
import { toApiKeyDto } from "@/domains/auth/dto";
import { listApiKeys as listApiKeysForUser } from "@/domains/auth/service";

export async function listApiKeys(c: AppContext) {
  const keys = await listApiKeysForUser(c.get("user").id);
  return c.json(keys.map(toApiKeyDto));
}
