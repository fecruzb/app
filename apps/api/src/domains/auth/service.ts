/**
 * Auth service
 *
 * Business rules for opaque sessions in an httpOnly cookie, email action
 * tokens, and programmatic API keys. Crypto primitives live in `lib/crypto`.
 */
import type { Context } from "hono";
import { deleteCookie, setCookie } from "hono/cookie";
import type { AuthSessionDto, MeDto } from "@app/shared";
import { generateApiKey, generateToken, hashToken } from "@/lib/crypto";
import { sendEmail } from "@/integrations/resend";
import { env } from "@/lib/env";
import { toTenantSummary } from "@/domains/tenant/dto";
import { tenantRepository } from "@/domains/tenant/repository";
import { toUserDto } from "./dto";
import { resetPasswordTemplate, verifyEmailTemplate } from "./emails";
import { syncPlatformAdminFromEnv } from "./platform-admin";
import { authRepository, type ApiKeyPrincipal } from "./repository";
import type { ActionTokenPurpose, User } from "./schema";

export { dummyVerifyPassword, hashPassword, verifyPassword } from "@/lib/crypto";

/** Cookie name for the opaque session token. */
export const SESSION_COOKIE = "app_session";

/** Session lifetime in milliseconds (30 days). */
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

/** True when Origin is CORS-allow-listed and not the browser APP_URL (Tauri shells). */
export function isCrossOriginShell(c: Context): boolean {
  const origin = c.req.header("origin");
  return (
    !!origin && env.corsOrigins.has(origin) && !origin.startsWith(env.appUrl.replace(/\/+$/, ""))
  );
}

/**
 * Cookie attributes for the session. Cross-origin Tauri (and other CORS
 * allow-list) clients need SameSite=None + Secure; the browser same-origin
 * deploy keeps Lax. (WKWebView often ignores Secure cookies on HTTP — shells
 * also get `sessionToken` in the JSON body; see `meWithShellToken`.)
 */
function sessionCookieOptions(c: Context): {
  path: string;
  httpOnly: boolean;
  sameSite: "Lax" | "None";
  secure: boolean;
  maxAge: number;
} {
  const crossOrigin = isCrossOriginShell(c);
  return {
    path: "/",
    httpOnly: true,
    sameSite: crossOrigin ? "None" : "Lax",
    secure: crossOrigin || env.isProduction,
    maxAge: SESSION_TTL_MS / 1000,
  };
}

/** Attach raw session token for Tauri/shell clients only (never for same-origin browser). */
export function meWithShellToken(c: Context, me: MeDto, sessionToken: string): AuthSessionDto {
  return isCrossOriginShell(c) ? { ...me, sessionToken } : me;
}

const TOKEN_TTL: Record<ActionTokenPurpose, number> = {
  verify_email: 24 * 60 * 60 * 1000,
  reset_password: 60 * 60 * 1000,
};

/**
 * Build me payload
 *
 * Standard session response: user + tenants they belong to. Syncs the env-based
 * platform-admin flag before mapping.
 *
 * @param user - Authenticated user row
 * @returns Shared me DTO
 */
export async function buildMe(user: User): Promise<MeDto> {
  const synced = await syncPlatformAdminFromEnv(user);
  const rows = await tenantRepository.getUserTenants(synced.id);
  return {
    user: toUserDto(synced),
    tenants: rows.map((r) => toTenantSummary(r.tenant, r.role)),
  };
}

/**
 * Create a session
 *
 * Persists a hashed token and returns the raw token for the cookie.
 *
 * @param userId - User who owns the session
 * @returns Raw session token (store only in the cookie)
 */
export async function createSession(userId: string): Promise<string> {
  const token = generateToken();
  await authRepository.insertSession({
    tokenHash: hashToken(token),
    userId,
    expiresAt: new Date(Date.now() + SESSION_TTL_MS),
  });
  return token;
}

/**
 * Get the user for a session
 *
 * Hashes the raw token and looks up a live session.
 *
 * @param token - Raw session token from the cookie
 * @returns The session user, or null if missing / expired
 */
export async function getSessionUser(token: string): Promise<User | null> {
  return authRepository.findSessionUser(hashToken(token));
}

/**
 * Delete a session
 *
 * Hashes the raw token and removes the matching row.
 *
 * @param token - Raw session token
 */
export async function deleteSession(token: string): Promise<void> {
  await authRepository.deleteSessionByTokenHash(hashToken(token));
}

/**
 * Delete a user's sessions
 *
 * Optionally keeps one session (the current cookie).
 *
 * @param userId - User whose sessions to clear
 * @param exceptToken - Optional raw token to keep
 */
export async function deleteUserSessions(userId: string, exceptToken?: string): Promise<void> {
  await authRepository.deleteUserSessions(userId, exceptToken ? hashToken(exceptToken) : undefined);
}

/**
 * Set the session cookie
 *
 * Writes the httpOnly session cookie on the response.
 *
 * @param c - Hono context
 * @param token - Raw session token
 */
export function setSessionCookie(c: Context, token: string): void {
  setCookie(c, SESSION_COOKIE, token, sessionCookieOptions(c));
}

/**
 * Clear the session cookie
 *
 * Uses the same SameSite/Secure attributes as set, so browsers actually drop it.
 *
 * @param c - Hono context
 */
export function clearSessionCookie(c: Context): void {
  const { path, sameSite, secure } = sessionCookieOptions(c);
  deleteCookie(c, SESSION_COOKIE, { path, sameSite, secure });
}

/**
 * Create an action token
 *
 * Replaces any existing token for the user/purpose and returns the raw value
 * for the email link.
 *
 * @param userId - Token owner
 * @param purpose - Verification or password-reset purpose
 * @returns Raw action token
 */
export async function createActionToken(
  userId: string,
  purpose: ActionTokenPurpose,
): Promise<string> {
  const token = generateToken();
  await authRepository.replaceActionToken({
    userId,
    purpose,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + TOKEN_TTL[purpose]),
  });
  return token;
}

/**
 * Consume an action token
 *
 * Hashes and validates the raw token; deletes it on success.
 *
 * @param token - Raw action token from the email link
 * @param purpose - Expected purpose
 * @returns The owning user id, or null if invalid / expired
 */
export async function consumeActionToken(
  token: string,
  purpose: ActionTokenPurpose,
): Promise<string | null> {
  return authRepository.consumeActionToken(hashToken(token), purpose);
}

/**
 * Send a verification email
 *
 * Creates a verify_email token and queues the message (fire-and-forget send).
 *
 * @param user - User to verify
 */
export async function sendVerificationEmail(user: User): Promise<void> {
  const token = await createActionToken(user.id, "verify_email");
  const { subject, html } = verifyEmailTemplate(user.name, `${env.appUrl}/verify-email/${token}`);
  void sendEmail({ to: user.email, subject, html });
}

/**
 * Send a password-reset email
 *
 * Creates a reset_password token and queues the message (fire-and-forget send).
 * No-op when the email does not match an account — callers still return a
 * generic success so responses do not reveal whether the email exists.
 *
 * @param email - Address that may belong to a user
 */
export async function sendPasswordResetEmail(email: string): Promise<void> {
  const user = await authRepository.findUserByEmail(email);
  if (!user) return;

  const token = await createActionToken(user.id, "reset_password");
  const { subject, html } = resetPasswordTemplate(
    user.name,
    `${env.appUrl}/reset-password/${token}`,
  );
  void sendEmail({ to: user.email, subject, html });
}

/** API key metadata returned from creation — never includes `tokenHash`. */
export type CreatedApiKeyRow = {
  id: string;
  name: string;
  prefix: string;
  tenantId: string;
  lastUsedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
};

/**
 * Create an API key
 *
 * Inserts a tenant-scoped key and returns safe metadata plus the raw secret
 * (shown once). The stored `tokenHash` never leaves this function.
 *
 * @param userId - Key owner
 * @param tenantId - Tenant the key is scoped to
 * @param name - Display name
 * @param expiresInDays - Optional lifetime in days; omit/null for no expiry
 * @returns Safe key metadata and raw key
 */
export async function createApiKey(
  userId: string,
  tenantId: string,
  name: string,
  expiresInDays?: number | null,
): Promise<{ apiKey: CreatedApiKeyRow; key: string }> {
  const { key, prefix } = generateApiKey();
  const expiresAt = expiresInDays
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
    : null;
  const row = await authRepository.insertApiKey({
    userId,
    tenantId,
    name,
    tokenHash: hashToken(key),
    prefix,
    expiresAt,
  });
  return {
    apiKey: {
      id: row.id,
      name: row.name,
      prefix: row.prefix,
      tenantId: row.tenantId,
      lastUsedAt: row.lastUsedAt,
      expiresAt: row.expiresAt,
      createdAt: row.createdAt,
    },
    key,
  };
}

/**
 * Resolve an API key
 *
 * Looks up the principal from a raw key and records usage on hit.
 *
 * @param key - Raw API key (`abk_…`)
 * @returns Principal fields, or null if invalid
 */
export async function resolveApiKey(key: string): Promise<ApiKeyPrincipal | null> {
  if (!key.startsWith("abk_")) return null;
  const principal = await authRepository.findApiKeyPrincipal(hashToken(key));
  if (!principal) return null;
  if (principal.expiresAt && principal.expiresAt.getTime() <= Date.now()) return null;
  void authRepository.touchApiKey(principal.keyId);
  return principal;
}
