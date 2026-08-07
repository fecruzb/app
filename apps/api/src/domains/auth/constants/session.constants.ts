/**
 * Session constants
 *
 * Cookie name and lifetime for opaque DB sessions.
 */

/** Cookie name for the opaque session token. */
export const SESSION_COOKIE = "app_session";

/** Session lifetime in milliseconds (30 days). */
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
