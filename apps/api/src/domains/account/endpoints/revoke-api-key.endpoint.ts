import { uuidParam } from "@/lib/errors";
import type { AppContext } from "@/context";
import { revokeApiKey as revokeApiKeyForUser } from "@/domains/auth/service";

export async function revokeApiKey(c: AppContext) {
  await revokeApiKeyForUser(c.get("user").id, uuidParam(c, "keyId"));
  return c.json({ ok: true });
}
