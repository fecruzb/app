/**
 * Action token lifetimes
 */
import type { ActionTokenPurpose } from "../schema";

/** Lifetime per action-token purpose. */
export const ACTION_TOKEN_TTL_MS: Record<ActionTokenPurpose, number> = {
  verify_email: 24 * 60 * 60 * 1000,
  reset_password: 60 * 60 * 1000,
};
