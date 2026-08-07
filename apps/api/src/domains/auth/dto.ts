/**
 * Auth DTOs
 *
 * Maps auth repository shapes to shared user DTOs. Session assembly (`buildMe`)
 * lives in `service.ts`. API key mappers live in `domains/account/dto.ts`.
 */
import type { UserDto } from "@app/shared";
import { isEffectivePlatformAdmin } from "./utils";
import type { User } from "./schema";

/**
 * To user DTO
 *
 * @param user - User row
 * @returns Shared user DTO
 */
export function toUserDto(user: User): UserDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerifiedAt !== null,
    isPlatformAdmin: isEffectivePlatformAdmin(user),
    createdAt: user.createdAt.toISOString(),
  };
}
