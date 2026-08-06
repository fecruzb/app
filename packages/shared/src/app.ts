// Public app config returned by GET /api/config (no auth).
export type AppConfig = {
  selfSignupEnabled: boolean;
  aiEnabled: boolean;
};

/** Standard API error body shape returned as JSON. */
export type ApiErrorBody = {
  error: string;
};
