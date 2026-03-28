-- Safely apply 20250918091345_add_file_source_column

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'files' AND column_name = 'listingId') THEN
        ALTER TABLE "public"."files" ADD COLUMN "listingId" TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'files' AND column_name = 'source') THEN
        ALTER TABLE "public"."files" ADD COLUMN "source" TEXT NOT NULL DEFAULT 'upload';
    END IF;
    
    -- Index
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'files_listingId_idx') THEN
        CREATE INDEX "files_listingId_idx" ON "public"."files"("listingId");
    END IF;

    -- FK
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'files_listingId_fkey') THEN
        ALTER TABLE "public"."files" ADD CONSTRAINT "files_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "public"."listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
