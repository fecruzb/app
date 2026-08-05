import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../lib/env";
import * as schema from "./schema";

export const sql = postgres(env.databaseUrl, { onnotice: () => {} });
export const db = drizzle(sql, { schema });
