import { createInviteSchema, type InviteDto } from "@app/shared";
import { generateToken, hashToken } from "@/lib/crypto";
import { sendEmail } from "@/integrations/resend";
import { env } from "@/lib/env";
import { HttpError, parseBody } from "@/lib/errors";
import type { AppContext } from "@/context";
import { inviteTemplate } from "../emails";
import { tenantRepository } from "../repository";

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias

export async function createInvite(c: AppContext) {
  const data = await parseBody(c, createInviteSchema);
  const tenant = c.get("tenant");
  const user = c.get("user");

  if (await tenantRepository.findMemberByEmail(tenant.id, data.email)) {
    throw new HttpError(409, "This person is already a member of the tenant");
  }

  // Replaces any pending invite for the same email
  await tenantRepository.deleteInvitesByEmail(tenant.id, data.email);

  const token = generateToken();
  const invite = await tenantRepository.insertInvite({
    tenantId: tenant.id,
    email: data.email,
    role: data.role,
    tokenHash: hashToken(token),
    invitedBy: user.id,
    expiresAt: new Date(Date.now() + INVITE_TTL_MS),
  });

  const { subject, html } = inviteTemplate(tenant.name, user.name, `${env.appUrl}/invite/${token}`);
  void sendEmail({ to: data.email, subject, html });

  const dto: InviteDto = {
    id: invite.id,
    email: invite.email,
    role: invite.role,
    invitedByName: user.name,
    createdAt: invite.createdAt.toISOString(),
    expiresAt: invite.expiresAt.toISOString(),
  };
  return c.json(dto, 201);
}
