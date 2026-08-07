/**
 * Bearer session token
 *
 * Reads a session token from `Authorization: Bearer` (Tauri shells). Personal
 * API keys (`abk_…`) are ignored — those authenticate MCP, not cookie routes.
 *
 * @param c - Request-like object with header access
 * @returns Raw session token, or null when absent / not a session token
 */
export function bearerSessionToken(c: {
  req: { header: (name: string) => string | undefined };
}): string | null {
  const header = c.req.header("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice("Bearer ".length).trim();
  if (!token || token.startsWith("abk_")) return null;
  return token;
}
