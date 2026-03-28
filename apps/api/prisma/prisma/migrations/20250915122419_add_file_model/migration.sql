-- CreateTable
CREATE TABLE "public"."files" (
    "id" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "thumbnailPath" TEXT,
    "size" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "type" TEXT NOT NULL DEFAULT 'listing',
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "files_filename_key" ON "public"."files"("filename");

-- CreateIndex
CREATE INDEX "files_uploadedById_type_idx" ON "public"."files"("uploadedById", "type");

-- CreateIndex
CREATE INDEX "files_filename_idx" ON "public"."files"("filename");

-- AddForeignKey
ALTER TABLE "public"."files" ADD CONSTRAINT "files_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
