import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

// -- passwords: native scrypt, "salt$hash" (hex) format -----------------------

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}$${hash}`;
}

export function verifyPassword(stored: string, password: string): boolean {
  const [salt, hash] = stored.split("$");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  return timingSafeEqual(Buffer.from(hash, "hex"), candidate);
}

// Precomputed real hash so a login for a nonexistent email spends the same
// scrypt time as a wrong password — closes the timing-based account enumeration.
const DUMMY_PASSWORD_HASH = hashPassword(randomBytes(16).toString("hex"));

/** Runs scrypt against a throwaway hash and always fails; use to equalize login timing. */
export function dummyVerifyPassword(password: string): false {
  verifyPassword(DUMMY_PASSWORD_HASH, password);
  return false;
}

// -- opaque tokens: raw value goes in the cookie/email; only the hash is stored --

export function generateToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

// -- API keys: prefixed opaque tokens for programmatic access -----------------

export const API_KEY_PREFIX = "abk_";

/** Returns the full key (shown once) and the visible prefix stored for display. */
export function generateApiKey(): { key: string; prefix: string } {
  const key = API_KEY_PREFIX + randomBytes(24).toString("base64url");
  return { key, prefix: key.slice(0, 12) };
}
