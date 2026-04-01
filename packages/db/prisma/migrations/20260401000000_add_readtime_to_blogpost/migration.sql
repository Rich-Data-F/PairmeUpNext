-- AlterTable: Add readTime column to blog_posts
ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "readTime" INTEGER NOT NULL DEFAULT 5;
