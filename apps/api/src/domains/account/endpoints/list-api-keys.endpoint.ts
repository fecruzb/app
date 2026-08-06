import type { AppContext } from "@/context";
import { toApiKeyDto } from "@/domains/auth/dto";
import { listApiKeys } from "@/domains/auth/service";

export async function listApiKeysEndpoint(c: AppContext) {
  const keys = await listApiKeys(c.get("user").id);
  return c.json(keys.map(toApiKeyDto));
}
