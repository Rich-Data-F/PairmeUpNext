-- Safely apply 20251204231903_add_listing_intent_and_item_availability

DO $$
BEGIN
    -- Create Enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ListingIntent') THEN
        CREATE TYPE "public"."ListingIntent" AS ENUM ('SELLING', 'BUYING', 'TRADING');
    END IF;
END $$;

-- Alter Enum (outside DO block if possible, or handle gracefully)
-- Postgres 12+ supports IF NOT EXISTS for ADD VALUE
ALTER TYPE "public"."ListingType" ADD VALUE IF NOT EXISTS 'FULL_SET';

DO $$
BEGIN
    -- Add Columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'hasChargingCase') THEN
        ALTER TABLE "public"."listings" ADD COLUMN "hasChargingCase" BOOLEAN;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'hasLeftEarbud') THEN
        ALTER TABLE "public"."listings" ADD COLUMN "hasLeftEarbud" BOOLEAN;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'hasRightEarbud') THEN
        ALTER TABLE "public"."listings" ADD COLUMN "hasRightEarbud" BOOLEAN;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'needsChargingCase') THEN
        ALTER TABLE "public"."listings" ADD COLUMN "needsChargingCase" BOOLEAN;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'needsLeftEarbud') THEN
        ALTER TABLE "public"."listings" ADD COLUMN "needsLeftEarbud" BOOLEAN;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'needsRightEarbud') THEN
        ALTER TABLE "public"."listings" ADD COLUMN "needsRightEarbud" BOOLEAN;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'openToAlternate') THEN
        ALTER TABLE "public"."listings" ADD COLUMN "openToAlternate" BOOLEAN NOT NULL DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'primaryIntent') THEN
        ALTER TABLE "public"."listings" ADD COLUMN "primaryIntent" "public"."ListingIntent" NOT NULL DEFAULT 'SELLING';
    END IF;

    -- Index
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'listings_primaryIntent_openToAlternate_idx') THEN
        CREATE INDEX "listings_primaryIntent_openToAlternate_idx" ON "public"."listings"("primaryIntent", "openToAlternate");
    END IF;
END $$;
