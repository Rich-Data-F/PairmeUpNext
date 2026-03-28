-- CreateEnum
CREATE TYPE "public"."BrandStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SYSTEM');

-- CreateEnum
CREATE TYPE "public"."ModelStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SYSTEM');

-- AlterTable
ALTER TABLE "public"."brands" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedBy" TEXT,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "status" "public"."BrandStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "submittedBy" TEXT;

-- AlterTable
ALTER TABLE "public"."models" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedBy" TEXT,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "status" "public"."ModelStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "submittedBy" TEXT;

-- CreateTable
CREATE TABLE "public"."proposed_models" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "description" TEXT,
    "submittedBy" TEXT NOT NULL,
    "submissionNote" TEXT,
    "adminNote" TEXT,
    "hasANC" BOOLEAN,
    "batteryLife" INTEGER,
    "waterResistance" TEXT,
    "bluetoothVersion" TEXT,
    "originalPrice" DECIMAL(10,2),
    "status" "public"."ModelStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proposed_models_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "proposed_models_brandId_name_key" ON "public"."proposed_models"("brandId", "name");

-- AddForeignKey
ALTER TABLE "public"."brands" ADD CONSTRAINT "brands_submittedBy_fkey" FOREIGN KEY ("submittedBy") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."brands" ADD CONSTRAINT "brands_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."models" ADD CONSTRAINT "models_submittedBy_fkey" FOREIGN KEY ("submittedBy") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."models" ADD CONSTRAINT "models_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."proposed_models" ADD CONSTRAINT "proposed_models_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "public"."brands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."proposed_models" ADD CONSTRAINT "proposed_models_submittedBy_fkey" FOREIGN KEY ("submittedBy") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."proposed_models" ADD CONSTRAINT "proposed_models_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
