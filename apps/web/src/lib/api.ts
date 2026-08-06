import { toast } from "sonner";
import { clearSessionToken, getSessionToken } from "./session-token";

// App API client — the frontend's only network boundary.
//
// When `VITE_API_URL` is set (Tauri desktop/mobile), requests go to that origin
// with credentials included and (after login) `Authorization: Bearer` — WKWebView
// does not keep Secure cookies against an HTTP API. When unset (browser SPA
// served by the API), relative `/api` + same-origin keeps the httpOnly cookie.

/** API origin without trailing slash; empty means same-origin relative `/api`. */
const API_ORIGIN = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, "") ?? "";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

/** Toast the server's message when available, else a fallback. Use in every mutation onError. */
export function showApiError(err: unknown, fallback: string): void {
  toast.error(err instanceof ApiError ? err.message : fallback);
}

function apiUrl(path: string): string {
  return API_ORIGIN ? `${API_ORIGIN}/api${path}` : `/api${path}`;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getSessionToken();
  const jsonBody = typeof options.body === "string";
  const headers = new Headers(options.headers);
  if (jsonBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(apiUrl(path), {
    ...options,
    credentials: API_ORIGIN ? "include" : "same-origin",
    headers,
  });

  if (!res.ok) {
    if (res.status === 401) clearSessionToken();
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new ApiError(res.status, body?.error ?? `Error ${res.status}`);
  }
  return (await res.json()) as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  upload: <T>(path: string, form: FormData) => request<T>(path, { method: "POST", body: form }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
