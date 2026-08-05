import type { MeDto, UserDto } from "@app/shared";
import { tenantRepository } from "@/domains/tenant/repository";
import type { User } from "./schema";

export function toUserDto(user: User): UserDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerifiedAt !== null,
    createdAt: user.createdAt.toISOString(),
  };
}

/** Resposta padrão de sessão: usuário + tenants dos quais participa. */
export async function buildMe(user: User): Promise<MeDto> {
  return { user: toUserDto(user), tenants: await tenantRepository.getUserTenants(user.id) };
}
