// Endpoint público: dados do convite para a tela de aceite.
import type { PublicInviteDto } from "@app/shared";
import { hashToken } from "../../../lib/crypto";
import { HttpError } from "../../../lib/errors";
import type { AppContext } from "../../../lib/http";
import { authRepository } from "../../auth/repository";
import { tenantRepository } from "../repository";

export async function getInvite(c: AppContext) {
  const token = c.req.param("token") ?? "";
  const row = await tenantRepository.findValidInviteByTokenHash(hashToken(token));
  if (!row) throw new HttpError(404, "Convite inválido ou expirado");

  const existingUser = await authRepository.findUserByEmail(row.invite.email);
  const dto: PublicInviteDto = {
    tenantName: row.tenant.name,
    email: row.invite.email,
    role: row.invite.role,
    userExists: existingUser !== null,
  };
  return c.json(dto);
}
