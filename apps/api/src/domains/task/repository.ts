/**
 * Task repository
 *
 * Owns every SQL touch of the `tasks` table. Reads join the author name from
 * `users`; writes use `.returning()`. Every method takes `tenantId` and
 * filters by it. Queries are written inline. Returns rows / join shapes —
 * map to DTOs in `dto.ts`.
 */
import { and, desc, eq, ilike } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/domains/auth/schema";
import { tasks, type Task } from "./schema";

/** Task row plus the author's display name from the join. */
export type TaskWithAuthor = { task: Task; authorName: string | null };

export const taskRepository = {
  /**
   * List tasks
   *
   * Newest first; optional case-insensitive title search.
   *
   * @param tenantId - Tenant that owns the tasks
   * @param search - Optional case-insensitive title filter
   * @returns Tasks with author names, newest first
   */
  async list(tenantId: string, search?: string): Promise<TaskWithAuthor[]> {
    const where = search
      ? and(eq(tasks.tenantId, tenantId), ilike(tasks.title, `%${search}%`))
      : eq(tasks.tenantId, tenantId);
    return db
      .select({ task: tasks, authorName: users.name })
      .from(tasks)
      .leftJoin(users, eq(users.id, tasks.authorId))
      .where(where)
      .orderBy(desc(tasks.createdAt));
  },

  /**
   * Find a task
   *
   * By id within the tenant, or null if missing / wrong tenant.
   *
   * @param tenantId - Tenant that owns the task
   * @param taskId - Task id
   * @returns Task with author name, or null
   */
  async find(tenantId: string, taskId: string): Promise<TaskWithAuthor | null> {
    const [row] = await db
      .select({ task: tasks, authorName: users.name })
      .from(tasks)
      .leftJoin(users, eq(users.id, tasks.authorId))
      .where(and(eq(tasks.id, taskId), eq(tasks.tenantId, tenantId)));
    return row ?? null;
  },

  /**
   * Insert a task
   *
   * Returns the new row.
   *
   * @param values - New task fields
   * @param values.tenantId - Tenant that owns the task
   * @param values.authorId - Author user id, or null
   * @param values.title - Task title
   * @param values.completed - Whether the task starts completed
   * @returns The inserted task row
   */
  async insert(values: {
    tenantId: string;
    authorId: string | null;
    title: string;
    completed: boolean;
  }): Promise<Task> {
    const [task] = await db.insert(tasks).values(values).returning();
    return task;
  },

  /**
   * Update a task
   *
   * Patches fields; null if missing / wrong tenant.
   *
   * @param tenantId - Tenant that owns the task
   * @param taskId - Task id
   * @param values - Fields to patch
   * @param values.title - New title
   * @param values.completed - New completed flag
   * @returns The updated task row, or null
   */
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

  /**
   * Delete a task
   *
   * Returns the removed row, or null if it wasn't there.
   *
   * @param tenantId - Tenant that owns the task
   * @param taskId - Task id
   * @returns The deleted task row, or null
   */
  async delete(tenantId: string, taskId: string): Promise<Task | null> {
    const [task] = await db
      .delete(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.tenantId, tenantId)))
      .returning();
    return task ?? null;
  },
};
