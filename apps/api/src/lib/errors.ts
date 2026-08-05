import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { ZodError, type ZodType } from "zod";
import { logger } from "./logger";

export class HttpError extends Error {
  constructor(
    public status: ContentfulStatusCode,
    message: string,
  ) {
    super(message);
  }
}

const MAX_BODY_BYTES = 1_000_000; // 1 MB

/** Parses the JSON body with Zod (400 when invalid). */
export async function parseBody<T extends ZodType>(c: Context, schema: T): Promise<T["_output"]> {
  const length = Number(c.req.header("content-length") ?? 0);
  if (length > MAX_BODY_BYTES) throw new HttpError(413, "Payload too large");

  const body = await c.req.json().catch(() => {
    throw new HttpError(400, "Invalid JSON body");
  });
  return schema.parse(body);
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Reads a route param that must be a UUID (404 when malformed). */
export function uuidParam(c: Context, name: string): string {
  const value = c.req.param(name);
  if (!value || !UUID_RE.test(value)) throw new HttpError(404, "Not found");
  return value;
}

export function errorHandler(err: Error, c: Context) {
  if (err instanceof HttpError) {
    return c.json({ error: err.message }, err.status);
  }
  if (err instanceof ZodError) {
    const issue = err.issues[0];
    const field = issue?.path.join(".");
    return c.json(
      { error: field ? `${field}: ${issue.message}` : (issue?.message ?? "Invalid data") },
      400,
    );
  }
  logger.error("[api] unhandled error:", err);
  return c.json({ error: "Internal server error" }, 500);
}
