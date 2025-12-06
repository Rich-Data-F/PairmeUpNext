-- Safely apply changes from 20250916123004_canonical_maintenance
-- This migration has been modified to be idempotent (safe to run multiple times)

DO $$
BEGIN
    -- Add columns to brands
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'brands' AND column_name = 'createdBy') THEN
        ALTER TABLE "public"."brands" ADD COLUMN "createdBy" TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'brands' AND column_name = 'updatedBy') THEN
        ALTER TABLE "public"."brands" ADD COLUMN "updatedBy" TEXT;
    END IF;
    
    -- Add columns to models
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'models' AND column_name = 'createdBy') THEN
        ALTER TABLE "public"."models" ADD COLUMN "createdBy" TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'models' AND column_name = 'updatedBy') THEN
        ALTER TABLE "public"."models" ADD COLUMN "updatedBy" TEXT;
    END IF;

    -- Create brand_audits table
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'brand_audits') THEN
        CREATE TABLE "public"."brand_audits" (
            "id" TEXT NOT NULL,
            "brandId" TEXT NOT NULL,
            "action" TEXT NOT NULL,
            "field" TEXT,
            "oldValue" TEXT,
            "newValue" TEXT,
            "changedBy" TEXT NOT NULL,
            "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "notes" TEXT,
            CONSTRAINT "brand_audits_pkey" PRIMARY KEY ("id")
        );
    END IF;

    -- Create model_audits table
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'model_audits') THEN
        CREATE TABLE "public"."model_audits" (
            "id" TEXT NOT NULL,
            "modelId" TEXT NOT NULL,
            "action" TEXT NOT NULL,
            "field" TEXT,
            "oldValue" TEXT,
            "newValue" TEXT,
            "changedBy" TEXT NOT NULL,
            "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "notes" TEXT,
            CONSTRAINT "model_audits_pkey" PRIMARY KEY ("id")
        );
    END IF;

    -- Add Foreign Keys (check if they exist first to avoid errors)
    -- brands.createdBy
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'brands_createdBy_fkey') THEN
        ALTER TABLE "public"."brands" ADD CONSTRAINT "brands_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    -- brands.updatedBy
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'brands_updatedBy_fkey') THEN
        ALTER TABLE "public"."brands" ADD CONSTRAINT "brands_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    -- models.createdBy
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'models_createdBy_fkey') THEN
        ALTER TABLE "public"."models" ADD CONSTRAINT "models_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    -- models.updatedBy
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'models_updatedBy_fkey') THEN
        ALTER TABLE "public"."models" ADD CONSTRAINT "models_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    -- brand_audits FKs
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'brand_audits_brandId_fkey') THEN
        ALTER TABLE "public"."brand_audits" ADD CONSTRAINT "brand_audits_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "public"."brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'brand_audits_changedBy_fkey') THEN
        ALTER TABLE "public"."brand_audits" ADD CONSTRAINT "brand_audits_changedBy_fkey" FOREIGN KEY ("changedBy") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

    -- model_audits FKs
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'model_audits_modelId_fkey') THEN
        ALTER TABLE "public"."model_audits" ADD CONSTRAINT "model_audits_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "public"."models"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'model_audits_changedBy_fkey') THEN
        ALTER TABLE "public"."model_audits" ADD CONSTRAINT "model_audits_changedBy_fkey" FOREIGN KEY ("changedBy") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

END $$;
