import { timestamp } from "drizzle-orm/pg-core";

/** Standard audit columns used by domain schemas. */
export const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
};
