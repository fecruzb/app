import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "./env";
import * as schema from "../db/schema";

export const sql = postgres(env.databaseUrl, { onnotice: () => {} });
export const db = drizzle(sql, { schema });
