/**
 * Product identity — change these when deriving a new product.
 *
 * Day-1 rename: edit this file, swap `apps/web/src/brand/logo.tsx` +
 * `apps/web/public/brand/`, and set `MAIL_FROM` in `.env`. UI copy that
 * interpolates `{{brand}}` (and the `brand` i18n key) picks up `displayName`
 * via i18n defaultVariables.
 */
export const brand = {
  /** User-facing product name (shell, emails, SEO, agent). */
  displayName: "App Base",
  /** Short line after the em dash in the default home title. */
  tagline: "The starting point for your next SaaS",
  /** MCP server key in client configs (`mcp.json`). */
  mcpServerName: "app-base",
  /** Public GitHub repository (landing clone CTA, day-1 rename). */
  repoUrl: "https://github.com/fecruzb/app",
  /** Default `MAIL_FROM` when the env var is unset. */
  defaultMailFrom: "App Base <onboarding@resend.dev>",
} as const;
