import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { ZodError, type ZodType } from "zod";

export class HttpError extends Error {
  constructor(
    public status: ContentfulStatusCode,
    message: string,
  ) {
    super(message);
  }
}

/** Valida o body JSON com Zod e devolve os dados tipados (400 se inválido). */
export async function parseBody<T extends ZodType>(c: Context, schema: T): Promise<T["_output"]> {
  const body = await c.req.json().catch(() => {
    throw new HttpError(400, "Body JSON inválido");
  });
  return schema.parse(body);
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Lê um param de rota que deve ser UUID (404 se malformado, evitando erro do Postgres). */
export function uuidParam(c: Context, name: string): string {
  const value = c.req.param(name);
  if (!value || !UUID_RE.test(value)) throw new HttpError(404, "Não encontrado");
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
      { error: field ? `${field}: ${issue.message}` : (issue?.message ?? "Dados inválidos") },
      400,
    );
  }
  console.error("[api] erro não tratado:", err);
  return c.json({ error: "Erro interno do servidor" }, 500);
}
