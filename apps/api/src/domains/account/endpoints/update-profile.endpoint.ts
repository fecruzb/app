import { updateAccountSchema } from "@app/shared";
import { parseBody } from "@/lib/errors";
import type { AppContext } from "@/context";
import { toUserDto } from "@/domains/auth/dto";
import { authRepository } from "@/domains/auth/repository";

export async function updateProfile(c: AppContext) {
  const data = await parseBody(c, updateAccountSchema);
  const user = await authRepository.updateUser(c.get("user").id, { name: data.name });
  return c.json(toUserDto(user));
}
