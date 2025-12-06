-- AlterTable
ALTER TABLE "public"."listings" ADD COLUMN     "customBrand" TEXT,
ADD COLUMN     "customModel" TEXT;

-- CreateTable
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

-- CreateIndex
CREATE UNIQUE INDEX "proposed_brands_name_key" ON "public"."proposed_brands"("name");

-- AddForeignKey
ALTER TABLE "public"."proposed_brands" ADD CONSTRAINT "proposed_brands_submittedBy_fkey" FOREIGN KEY ("submittedBy") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."proposed_brands" ADD CONSTRAINT "proposed_brands_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
