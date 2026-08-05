import { uuidParam } from "../../../lib/errors";
import type { AppContext } from "../../../lib/http";
import { tenantRepository } from "../repository";

export async function revokeInvite(c: AppContext) {
  await tenantRepository.deleteInvite(c.get("tenant").id, uuidParam(c, "inviteId"));
  return c.json({ ok: true });
}
