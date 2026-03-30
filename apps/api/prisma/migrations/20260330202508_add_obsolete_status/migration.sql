-- AlterEnum
ALTER TYPE "BrandStatus" ADD VALUE 'OBSOLETE';

-- AlterEnum
ALTER TYPE "ModelStatus" ADD VALUE 'OBSOLETE';

-- AlterTable
ALTER TABLE "found_items" ADD COLUMN     "address" TEXT,
ADD COLUMN     "locationPrecision" INTEGER DEFAULT 500;

-- AlterTable
ALTER TABLE "listings" ADD COLUMN     "address" TEXT,
ADD COLUMN     "locationPrecision" INTEGER DEFAULT 500;

-- AlterTable
ALTER TABLE "lost_reports" ADD COLUMN     "address" TEXT,
ADD COLUMN     "locationPrecision" INTEGER DEFAULT 500;
