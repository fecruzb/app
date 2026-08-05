import { timestamp } from "drizzle-orm/pg-core";

/** Colunas padrão de auditoria, usadas pelos schemas de domínio. */
export const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
};
