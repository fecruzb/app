ALTER TABLE "articles" ADD COLUMN "published_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "articles_published_idx" ON "articles" USING btree ("published_at");