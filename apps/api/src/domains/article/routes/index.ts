/**
 * Article routes
 *
 * Wires handlers into the Hono route groups. Tenant-scoped CRUD requires auth.
 * The public catalog is a second export mounted at `/api/articles`.
 */
import { Hono } from "hono";
import type { AppEnv } from "@/context";
import { requireAuth } from "@/domains/auth/middleware";
import { requireTenant } from "@/domains/tenant/middleware";
import { deleteArticleCover } from "./article.cover.delete.route";
import { uploadArticleCover } from "./article.cover.post.route";
import { deleteArticle } from "./article.delete.route";
import { getArticle } from "./article.get.route";
import { updateArticle } from "./article.patch.route";
import { createArticle } from "./article.post.route";
import { publishArticle } from "./article.publish.post.route";
import { listArticles } from "./articles.get.route";
import { getPublicArticle } from "./article.get.public.route";
import { listPublicArticles } from "./articles.get.public.route";

/**
 * Article route group
 *
 * Mounted at `/api/tenants/:tenantId/articles`.
 */
export const articleRoutes = new Hono<AppEnv>()
  .use("*", requireAuth, requireTenant)
  .get("/", listArticles)
  .post("/", createArticle)
  .get("/:articleId", getArticle)
  .patch("/:articleId", updateArticle)
  .delete("/:articleId", deleteArticle)
  .post("/:articleId/cover", uploadArticleCover)
  .delete("/:articleId/cover", deleteArticleCover)
  .post("/:articleId/publish", publishArticle);

/**
 * Public article catalog
 *
 * Mounted at `/api/articles`. No auth — only rows with `publishedAt` set.
 */
export const publicArticleRoutes = new Hono<AppEnv>()
  .get("/", listPublicArticles)
  .get("/:articleId", getPublicArticle);
