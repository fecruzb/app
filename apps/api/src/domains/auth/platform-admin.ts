/**
 * Platform admin helpers
 *
 * Effective admin = DB flag OR (verified email listed in PLATFORM_ADMIN_EMAILS).
 * Env wins for access even before the DB flag is synced; verification is required
 * so an unverified signup cannot claim an env admin email.
 */
import { env } from "@/lib/env";
import { authRepository } from "./repository";
import type { User } from "./schema";

/** Whether this email is listed in PLATFORM_ADMIN_EMAILS. */
export function isEnvPlatformAdminEmail(email: string): boolean {
  return env.platformAdminEmails.has(email.trim().toLowerCase());
}

/**
 * Whether the user may use the platform admin area.
 *
 * @param user - Auth user row
 * @returns True when DB flag is set, or verified email is in the env list
 */
export function isEffectivePlatformAdmin(user: User): boolean {
  if (user.isPlatformAdmin) return true;
  if (!user.emailVerifiedAt) return false;
  return isEnvPlatformAdminEmail(user.email);
}

/**
 * Persist the DB flag when a verified env-listed email still has it false.
 *
 * @param user - Current user row
 * @returns Possibly updated user row
 */
export async function syncPlatformAdminFromEnv(user: User): Promise<User> {
  if (user.isPlatformAdmin) return user;
  if (!user.emailVerifiedAt) return user;
  if (!isEnvPlatformAdminEmail(user.email)) return user;
  return authRepository.updateUser(user.id, { isPlatformAdmin: true });
}
