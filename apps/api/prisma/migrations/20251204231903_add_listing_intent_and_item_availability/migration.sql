-- CreateEnum
CREATE TYPE "public"."ListingIntent" AS ENUM ('SELLING', 'BUYING', 'TRADING');

-- AlterEnum
ALTER TYPE "public"."ListingType" ADD VALUE 'FULL_SET';

-- AlterTable
ALTER TABLE "public"."listings" ADD COLUMN     "hasChargingCase" BOOLEAN,
ADD COLUMN     "hasLeftEarbud" BOOLEAN,
ADD COLUMN     "hasRightEarbud" BOOLEAN,
ADD COLUMN     "needsChargingCase" BOOLEAN,
ADD COLUMN     "needsLeftEarbud" BOOLEAN,
ADD COLUMN     "needsRightEarbud" BOOLEAN,
ADD COLUMN     "openToAlternate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "primaryIntent" "public"."ListingIntent" NOT NULL DEFAULT 'SELLING';

-- CreateIndex
CREATE INDEX "listings_primaryIntent_openToAlternate_idx" ON "public"."listings"("primaryIntent", "openToAlternate");
