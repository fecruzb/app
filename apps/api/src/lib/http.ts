import type { Context } from "hono";
import type { User } from "../domains/auth/schema";
import type { Tenant, TenantMember } from "../domains/tenant/schema";

/** Variáveis injetadas no context pelas middlewares de auth/tenant. */
export type AppEnv = {
  Variables: {
    user: User;
    sessionToken: string;
    tenant: Tenant;
    membership: TenantMember;
  };
};

/** Assinatura dos handlers de endpoint (um por arquivo na pasta endpoints de cada domínio). */
export type AppContext = Context<AppEnv>;
