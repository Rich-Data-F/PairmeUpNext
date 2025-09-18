-- AlterTable
ALTER TABLE "public"."files" ADD COLUMN     "listingId" TEXT,
ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'upload';

-- CreateIndex
CREATE INDEX "files_listingId_idx" ON "public"."files"("listingId");

-- AddForeignKey
ALTER TABLE "public"."files" ADD CONSTRAINT "files_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "public"."listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
