/**
 * Product identity — change these when deriving a new product.
 *
 * Day-1 rename: edit this file, swap `apps/web/src/brand/logo.tsx` +
 * `apps/web/public/brand/`, run `npm run sync:brand` (Tauri shells +
 * installer artifact names), and set `MAIL_FROM` in `.env`. UI copy that
 * interpolates `{{brand}}` (and the `brand` i18n key) picks up `displayName`
 * via i18n defaultVariables.
 */

/** R2 / installer filename stem: start alnum; then alnum, `.`, `_`, or `-` only. */
const DESKTOP_ARTIFACT_BASENAME_RE = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

function assertDesktopArtifactBasename(value: string): void {
  if (!DESKTOP_ARTIFACT_BASENAME_RE.test(value)) {
    throw new Error(
      `brand.desktopArtifactBasename must be filesystem-safe ` +
        `(^[A-Za-z0-9][A-Za-z0-9._-]*$): ${JSON.stringify(value)}`,
    );
  }
}

export const brand = {
  /** User-facing product name (shell, emails, SEO, agent). */
  displayName: "App Base",
  /** Short line after the em dash in the default home title. */
  tagline: "The starting point for your next SaaS",
  /** Static HTML / OG description (index.html; English bootstrap). */
  description:
    "Open-source multi-tenant SaaS template with auth, tenants, email, an AI agent, and a typed monorepo ready to become your product.",
  /** MCP server key in client configs (`mcp.json`). */
  mcpServerName: "app-base",
  /** Public GitHub repository (landing clone CTA, day-1 rename). */
  repoUrl: "https://github.com/fecruzb/app",
  /**
   * Filename stem for desktop installers / R2 keys (`AppBase.dmg`,
   * `AppBase-Windows-Setup.exe`, …). Must match `DESKTOP_ARTIFACT_BASENAME_RE`.
   */
  desktopArtifactBasename: "AppBase",
  /** Default `MAIL_FROM` when the env var is unset. */
  defaultMailFrom: "App Base <onboarding@resend.dev>",
} as const;

assertDesktopArtifactBasename(brand.desktopArtifactBasename);
