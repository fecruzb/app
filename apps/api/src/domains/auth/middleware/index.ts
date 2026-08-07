/**
 * Auth middleware
 *
 * Session gates used across tenant and platform route groups.
 */
export { requireAuth } from "./require-auth.middleware";
export { requirePlatformAdmin } from "./require-platform-admin.middleware";
