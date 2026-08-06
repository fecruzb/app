/**
 * Tenant service
 *
 * Business rules for tenants. There is no manual creation UI: every user gets
 * a personal tenant on signup and joins others by invite.
 */
import type { TenantRole } from "@app/shared";
import { generateToken, hashPassword, hashToken } from "@/lib/crypto";
import { sendEmail } from "@/integrations/resend";
import { env } from "@/lib/env";
import { HttpError } from "@/lib/errors";
import { isEnvPlatformAdminEmail } from "@/domains/auth/platform-admin";
import { authRepository } from "@/domains/auth/repository";
import { createSession } from "@/domains/auth/service";
import { assertSeatAvailableForAccept, assertSeatAvailableForInvite } from "@/domains/billing/service";
import { inviteTemplate } from "./emails";
import { tenantRepository } from "./repository";
import type { Tenant, TenantInvite, TenantMember } from "./schema";

/** Invite link lifetime (7 days). */
const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Slugify a tenant name
 *
 * Normalizes accents, lowercases, and collapses non-alphanumerics to dashes.
 *
 * @param name - Display name to turn into a slug
 * @returns URL-safe slug (max 40 chars), or `"tenant"` if empty
 */
export function slugify(name: string): string {
  return (
    name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 40) || "tenant"
  );
}

/**
 * Build a unique slug from a name
 *
 * Retries with a short random suffix when the base slug is taken.
 *
 * @param name - Display name to slugify
 * @returns A slug that does not yet exist
 */
async function uniqueSlug(name: string): Promise<string> {
  const base = slugify(name);
  let candidate = base;
  for (;;) {
    if (!(await tenantRepository.findTenantBySlug(candidate))) return candidate;
    candidate = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  }
}

/**
 * Create a tenant with an owner
 *
 * Inserts the tenant and adds the user as owner in one flow.
 *
 * @param name - Tenant display name
 * @param userId - User who becomes the owner
 * @returns The created tenant row
 */
export async function createTenantWithOwner(name: string, userId: string): Promise<Tenant> {
  const slug = await uniqueSlug(name);
  const tenant = await tenantRepository.insertTenant({ name, slug });
  await tenantRepository.insertMember({ tenantId: tenant.id, userId, role: "owner" });
  return tenant;
}

/**
 * Remove a member (or self-leave)
 *
 * Enforces owner/admin rules, then deletes the membership and revokes that
 * user's API keys for the tenant.
 */
export async function removeTenantMember(args: {
  tenantId: string;
  actor: TenantMember;
  actorUserId: string;
  targetUserId: string;
}): Promise<void> {
  const { tenantId, actor, actorUserId, targetUserId } = args;
  const isSelf = targetUserId === actorUserId;

  if (!isSelf && actor.role !== "owner" && actor.role !== "admin") {
    throw new HttpError(403, "Only administrators can remove members");
  }

  const target = await tenantRepository.findMember(tenantId, targetUserId);
  if (!target) throw new HttpError(404, "Member not found");

  if (isSelf && target.role === "owner") {
    throw new HttpError(400, "The owner can't leave their own tenant");
  }
  if (!isSelf && target.role === "owner" && actor.role !== "owner") {
    throw new HttpError(403, "Only owners can remove an owner");
  }
  if (target.role === "owner" && (await tenantRepository.countOwners(tenantId)) <= 1) {
    throw new HttpError(400, "The tenant needs at least one owner");
  }

  await tenantRepository.deleteMember(tenantId, targetUserId);
  await authRepository.deleteApiKeysForTenantUser(targetUserId, tenantId);
}

/**
 * Update a member's role
 */
export async function updateTenantMemberRole(args: {
  tenantId: string;
  actorRole: TenantRole;
  targetUserId: string;
  role: TenantRole;
}): Promise<void> {
  const { tenantId, actorRole, targetUserId, role } = args;
  const target = await tenantRepository.findMember(tenantId, targetUserId);
  if (!target) throw new HttpError(404, "Member not found");

  if ((target.role === "owner" || role === "owner") && actorRole !== "owner") {
    throw new HttpError(403, "Only owners can change owner roles");
  }
  if (
    target.role === "owner" &&
    role !== "owner" &&
    (await tenantRepository.countOwners(tenantId)) <= 1
  ) {
    throw new HttpError(400, "The tenant needs at least one owner");
  }

  await tenantRepository.updateMemberRole(tenantId, targetUserId, role);
}

/**
 * Create a tenant invite and email the link
 *
 * @returns The invite row and the inviter's display name for DTO mapping
 */
export async function createTenantInvite(args: {
  tenantId: string;
  tenantName: string;
  inviterId: string;
  inviterName: string;
  email: string;
  role: "admin" | "member";
}): Promise<{ invite: TenantInvite; inviterName: string }> {
  const { tenantId, tenantName, inviterId, inviterName, email, role } = args;

  if (await tenantRepository.findMemberByEmail(tenantId, email)) {
    throw new HttpError(409, "This person is already a member of the tenant");
  }

  await tenantRepository.deleteInvitesByEmail(tenantId, email);
  await assertSeatAvailableForInvite(tenantId);

  const token = generateToken();
  const invite = await tenantRepository.insertInvite({
    tenantId,
    email,
    role,
    tokenHash: hashToken(token),
    invitedBy: inviterId,
    expiresAt: new Date(Date.now() + INVITE_TTL_MS),
  });

  const { subject, html } = inviteTemplate(tenantName, inviterName, `${env.appUrl}/invite/${token}`);
  void sendEmail({ to: email, subject, html });

  return { invite, inviterName };
}

export type AcceptInviteResult = {
  tenantSlug: string;
  status: 200 | 201;
  sessionToken: string | null;
};

/**
 * Accept a tenant invite
 *
 * Session path: join if not already a member. Register path: create verified
 * user + membership + session. `loadNewAccount` is only called when a new
 * account is required (so existing-account sign-in errors fire before body parse).
 */
export async function acceptTenantInvite(args: {
  rawToken: string;
  sessionUserId: string | null;
  sessionUserEmail: string | null;
  loadNewAccount?: () => Promise<{ name: string; password: string }>;
}): Promise<AcceptInviteResult> {
  const { rawToken, sessionUserId, sessionUserEmail, loadNewAccount } = args;

  const row = await tenantRepository.findValidInviteByTokenHash(hashToken(rawToken));
  if (!row) throw new HttpError(404, "Invalid or expired invite");
  const { invite, tenant } = row;

  if (sessionUserId && sessionUserEmail) {
    if (sessionUserEmail !== invite.email) {
      throw new HttpError(
        403,
        `This invite is for ${invite.email} — sign out and sign in with that account`,
      );
    }
    const existing = await tenantRepository.findMember(tenant.id, sessionUserId);
    if (!existing) {
      await assertSeatAvailableForAccept(tenant.id);
      await tenantRepository.insertMember({
        tenantId: tenant.id,
        userId: sessionUserId,
        role: invite.role,
      });
    }
    await tenantRepository.deleteInviteById(invite.id);
    return { tenantSlug: tenant.slug, status: 200, sessionToken: null };
  }

  if (await authRepository.findUserByEmail(invite.email)) {
    throw new HttpError(401, "Sign in to accept the invite");
  }
  if (!loadNewAccount) {
    throw new HttpError(400, "Name and password are required to create an account");
  }

  const newAccount = await loadNewAccount();
  await assertSeatAvailableForAccept(tenant.id);
  const user = await authRepository.insertUser({
    name: newAccount.name,
    email: invite.email,
    passwordHash: hashPassword(newAccount.password),
    emailVerifiedAt: new Date(),
    isPlatformAdmin: isEnvPlatformAdminEmail(invite.email),
  });
  await tenantRepository.insertMember({
    tenantId: tenant.id,
    userId: user.id,
    role: invite.role,
  });
  await tenantRepository.deleteInviteById(invite.id);

  return {
    tenantSlug: tenant.slug,
    status: 201,
    sessionToken: await createSession(user.id),
  };
}
