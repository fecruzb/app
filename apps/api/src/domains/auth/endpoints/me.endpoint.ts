import type { AppContext } from "@/lib/http";
import { buildMe } from "../dto";

export async function me(c: AppContext) {
  return c.json(await buildMe(c.get("user")));
}
