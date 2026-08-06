/**
 * In-memory/sessionStorage bearer for Tauri shells (`VITE_API_URL` set).
 * Browser same-origin deploys leave this unused and keep the httpOnly cookie.
 */
const STORAGE_KEY = "app_shell_session";

const shellAuth = Boolean(
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, ""),
);

export function isShellAuth(): boolean {
  return shellAuth;
}

export function getSessionToken(): string | null {
  if (!shellAuth) return null;
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setSessionToken(token: string | null): void {
  if (!shellAuth) return;
  try {
    if (token) sessionStorage.setItem(STORAGE_KEY, token);
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // private mode / blocked storage — requests will 401 until next login
  }
}

export function clearSessionToken(): void {
  setSessionToken(null);
}
