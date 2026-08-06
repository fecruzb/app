// All task data access goes through here. Every query filters by tenantId —
// that's how multi-tenant isolation holds.
import { and, desc, eq, ilike } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/domains/auth/schema";
import { tasks, type Task } from "./schema";

export type TaskWithAuthor = { task: Task; authorName: string | null };

const baseQuery = () =>
  db
    .select({ task: tasks, authorName: users.name })
    .from(tasks)
    .leftJoin(users, eq(users.id, tasks.authorId));

export const taskRepository = {
  async list(tenantId: string, search?: string): Promise<TaskWithAuthor[]> {
    const where = search
      ? and(eq(tasks.tenantId, tenantId), ilike(tasks.title, `%${search}%`))
      : eq(tasks.tenantId, tenantId);
    return baseQuery().where(where).orderBy(desc(tasks.createdAt));
  },

  async find(tenantId: string, taskId: string): Promise<TaskWithAuthor | null> {
    const [row] = await baseQuery().where(and(eq(tasks.id, taskId), eq(tasks.tenantId, tenantId)));
    return row ?? null;
  },

  async insert(values: {
    tenantId: string;
    authorId: string | null;
    title: string;
    completed: boolean;
  }): Promise<Task> {
    const [task] = await db.insert(tasks).values(values).returning();
    return task;
  },

  async update(
    tenantId: string,
    taskId: string,
    values: { title: string; completed: boolean },
  ): Promise<Task | null> {
    const [task] = await db
      .update(tasks)
      .set({ ...values, updatedAt: new Date() })
      .where(and(eq(tasks.id, taskId), eq(tasks.tenantId, tenantId)))
      .returning();
    return task ?? null;
  },

  async delete(tenantId: string, taskId: string): Promise<Task | null> {
    const [task] = await db
      .delete(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.tenantId, tenantId)))
      .returning();
    return task ?? null;
  },
};
