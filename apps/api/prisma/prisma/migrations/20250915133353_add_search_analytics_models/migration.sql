-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "totalRatings" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "public"."saved_searches" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "filters" TEXT NOT NULL,
    "alertsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "lastNotificationSent" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saved_searches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."search_analytics" (
    "id" TEXT NOT NULL,
    "searchId" TEXT NOT NULL,
    "query" TEXT,
    "filters" TEXT NOT NULL,
    "userId" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resultsCount" INTEGER NOT NULL,
    "searchDuration" INTEGER NOT NULL,
    "clickedListingIds" TEXT[],

    CONSTRAINT "search_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "saved_searches_userId_idx" ON "public"."saved_searches"("userId");

-- CreateIndex
CREATE INDEX "saved_searches_alertsEnabled_idx" ON "public"."saved_searches"("alertsEnabled");

-- CreateIndex
CREATE UNIQUE INDEX "search_analytics_searchId_key" ON "public"."search_analytics"("searchId");

-- CreateIndex
CREATE INDEX "search_analytics_userId_idx" ON "public"."search_analytics"("userId");

-- CreateIndex
CREATE INDEX "search_analytics_timestamp_idx" ON "public"."search_analytics"("timestamp");

-- CreateIndex
CREATE INDEX "search_analytics_query_idx" ON "public"."search_analytics"("query");

-- AddForeignKey
ALTER TABLE "public"."saved_searches" ADD CONSTRAINT "saved_searches_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."search_analytics" ADD CONSTRAINT "search_analytics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
