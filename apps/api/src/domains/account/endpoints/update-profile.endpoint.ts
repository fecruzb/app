import { updateAccountSchema } from "@app/shared";
import { parseBody } from "../../../lib/errors";
import type { AppContext } from "../../../lib/http";
import { toUserDto } from "../../auth/dto";
import { authRepository } from "../../auth/repository";

export async function updateProfile(c: AppContext) {
  const data = await parseBody(c, updateAccountSchema);
  const user = await authRepository.updateUser(c.get("user").id, { name: data.name });
  return c.json(toUserDto(user));
}
