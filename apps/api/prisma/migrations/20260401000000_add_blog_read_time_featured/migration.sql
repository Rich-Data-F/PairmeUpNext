-- Migration: add readTime and featured fields to blog_posts
ALTER TABLE "blog_posts"
  ADD COLUMN IF NOT EXISTS "readTime" INTEGER NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS "featured" BOOLEAN NOT NULL DEFAULT false;
