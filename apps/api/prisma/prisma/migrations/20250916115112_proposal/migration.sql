-- Safely apply 20250916115112_proposal

DO $$
BEGIN
    -- Add columns to listings
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'customBrand') THEN
        ALTER TABLE "public"."listings" ADD COLUMN "customBrand" TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'customModel') THEN
        ALTER TABLE "public"."listings" ADD COLUMN "customModel" TEXT;
    END IF;

    -- Create proposed_brands table
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'proposed_brands') THEN
        CREATE TABLE "public"."proposed_brands" (
            "id" TEXT NOT NULL,
            "name" TEXT NOT NULL,
            "description" TEXT,
            "website" TEXT,
            "submittedBy" TEXT NOT NULL,
            "submissionNote" TEXT,
            "adminNote" TEXT,
            "status" "public"."BrandStatus" NOT NULL DEFAULT 'PENDING',
            "reviewedBy" TEXT,
            "reviewedAt" TIMESTAMP(3),
            "rejectionReason" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "proposed_brands_pkey" PRIMARY KEY ("id")
        );
        
        -- Create Index
        CREATE UNIQUE INDEX "proposed_brands_name_key" ON "public"."proposed_brands"("name");
        
        -- Add FKs
        ALTER TABLE "public"."proposed_brands" ADD CONSTRAINT "proposed_brands_submittedBy_fkey" FOREIGN KEY ("submittedBy") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
        ALTER TABLE "public"."proposed_brands" ADD CONSTRAINT "proposed_brands_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

END $$;
