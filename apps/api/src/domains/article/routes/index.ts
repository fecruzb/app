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
import { createArticle } from "./create-article.route";
import { deleteArticle } from "./delete-article.route";
import { deleteArticleCover } from "./delete-article-cover.route";
import { getArticle } from "./get-article.route";
import { getPublicArticle } from "./get-public-article.route";
import { listArticles } from "./list-articles.route";
import { listPublicArticles } from "./list-public-articles.route";
import { publishArticle } from "./publish-article.route";
import { updateArticle } from "./update-article.route";
import { uploadArticleCover } from "./upload-article-cover.route";

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
