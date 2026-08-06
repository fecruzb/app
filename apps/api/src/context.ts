// Typed request context: what the auth/tenant middlewares inject.
// Lives outside lib/ because it depends on domain schemas.
import type { Context } from "hono";
import type { User } from "@/domains/auth/schema";
import type { Tenant, TenantMember } from "@/domains/tenant/schema";

/** Variables injected into the context by the auth/tenant middlewares. */
export type AppEnv = {
  Variables: {
    user: User;
    sessionToken: string;
    tenant: Tenant;
    membership: TenantMember;
  };
};

/** Route handler signature (one per file in each domain's routes folder). */
export type AppContext = Context<AppEnv>;
