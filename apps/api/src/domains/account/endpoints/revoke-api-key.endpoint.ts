import { uuidParam } from "@/lib/errors";
import type { AppContext } from "@/context";
import { revokeApiKey } from "@/domains/auth/service";

export async function revokeApiKeyEndpoint(c: AppContext) {
  await revokeApiKey(c.get("user").id, uuidParam(c, "keyId"));
  return c.json({ ok: true });
}
