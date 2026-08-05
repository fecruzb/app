// Regras de negócio de tenants. Não existe criação manual: cada usuário
// nasce com um tenant pessoal no cadastro e entra em outros por convite.
import type { TenantRole, TenantSummaryDto } from "@app/shared";
import { tenantRepository } from "./repository";
import type { Tenant } from "./schema";

export function slugify(name: string): string {
  return (
    name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 40) || "tenant"
  );
}

async function uniqueSlug(name: string): Promise<string> {
  const base = slugify(name);
  let candidate = base;
  for (;;) {
    if (!(await tenantRepository.findBySlug(candidate))) return candidate;
    candidate = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  }
}

export async function createTenantWithOwner(name: string, userId: string): Promise<Tenant> {
  const slug = await uniqueSlug(name);
  const tenant = await tenantRepository.insertTenant({ name, slug });
  await tenantRepository.insertMember({ tenantId: tenant.id, userId, role: "owner" });
  return tenant;
}

export function toTenantSummary(tenant: Tenant, role: TenantRole): TenantSummaryDto {
  return { id: tenant.id, name: tenant.name, slug: tenant.slug, role };
}
