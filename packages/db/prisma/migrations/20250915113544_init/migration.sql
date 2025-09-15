-- CreateEnum
CREATE TYPE "public"."ListingType" AS ENUM ('EARBUD_LEFT', 'EARBUD_RIGHT', 'EARBUD_PAIR', 'CHARGING_CASE', 'ACCESSORIES');

-- CreateEnum
CREATE TYPE "public"."Condition" AS ENUM ('NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'PARTS_ONLY');

-- CreateEnum
CREATE TYPE "public"."ListingStatus" AS ENUM ('DRAFT', 'ACTIVE', 'SOLD', 'EXPIRED', 'SUSPENDED', 'DELETED');

-- CreateEnum
CREATE TYPE "public"."LostReportStatus" AS ENUM ('ACTIVE', 'RESOLVED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "public"."FoundItemStatus" AS ENUM ('REPORTED', 'AUTHORITY_NOTIFIED', 'WAITING_PERIOD', 'AVAILABLE_FOR_SALE', 'CLAIMED_BY_OWNER', 'SOLD');

-- CreateEnum
CREATE TYPE "public"."Jurisdiction" AS ENUM ('FRANCE', 'US_CALIFORNIA', 'US_NEW_YORK', 'US_TEXAS', 'US_FLORIDA', 'US_OTHER', 'UK', 'GERMANY', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."MatchType" AS ENUM ('LOST_TO_LISTING', 'LOST_TO_FOUND');

-- CreateEnum
CREATE TYPE "public"."MatchStatus" AS ENUM ('PENDING', 'REVIEWED', 'CONFIRMED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "public"."RatingCategory" AS ENUM ('OVERALL', 'COMFORT', 'AUTONOMY', 'CASE_RELOAD_TIME', 'EARBUD_RELOAD_TIME', 'MUSIC_QUALITY', 'VIDEO_QUALITY', 'GAME_QUALITY', 'AV_LAG', 'CALL_OVERALL', 'CALL_COWORKING', 'CALL_STREET', 'CALL_BIKE');

-- CreateEnum
CREATE TYPE "public"."PostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."OrderStatus" AS ENUM ('CREATED', 'PENDING', 'APPROVED', 'CAPTURED', 'CANCELLED', 'REFUNDED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "public"."PaymentMethod" AS ENUM ('PAYPAL', 'STRIPE', 'BANK_TRANSFER');

-- CreateEnum
CREATE TYPE "public"."SponsoredType" AS ENUM ('AFFILIATE_LINK', 'BANNER_AD', 'FEATURED_LISTING', 'BRAND_PARTNERSHIP');

-- CreateEnum
CREATE TYPE "public"."PlacementType" AS ENUM ('SIDEBAR', 'IN_CONTENT', 'HEADER', 'FOOTER', 'SEARCH_RESULTS');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "name" TEXT,
    "image" TEXT,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationBadge" TEXT,
    "reputation" INTEGER NOT NULL DEFAULT 0,
    "trustLevel" TEXT NOT NULL DEFAULT 'new',
    "bio" TEXT,
    "phoneNumber" TEXT,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "website" TEXT,
    "location" TEXT,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "showEmail" BOOLEAN NOT NULL DEFAULT false,
    "showPhone" BOOLEAN NOT NULL DEFAULT false,
    "showLocation" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "public"."brands" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "logo" TEXT,
    "website" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "metaTitle" TEXT,
    "metaDescription" TEXT,

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."models" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "releaseDate" TIMESTAMP(3),
    "discontinuedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "hasANC" BOOLEAN NOT NULL DEFAULT false,
    "batteryLife" INTEGER,
    "caseChargeTime" INTEGER,
    "earbudChargeTime" INTEGER,
    "waterResistance" TEXT,
    "bluetoothVersion" TEXT,
    "codecs" TEXT[],
    "driverSize" INTEGER,
    "frequency" TEXT,
    "impedance" INTEGER,
    "sensitivity" INTEGER,
    "earbudWeight" DOUBLE PRECISION,
    "caseWeight" DOUBLE PRECISION,
    "earbudDimensions" TEXT,
    "caseDimensions" TEXT,
    "originalPrice" DECIMAL(10,2),
    "currentPrice" DECIMAL(10,2),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cities" (
    "id" TEXT NOT NULL,
    "geoDbId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "region" TEXT,
    "regionCode" TEXT,
    "latitude" DECIMAL(10,8) NOT NULL,
    "longitude" DECIMAL(11,8) NOT NULL,
    "population" INTEGER,
    "timezone" TEXT,
    "displayName" TEXT NOT NULL,
    "searchText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."listings" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "public"."ListingType" NOT NULL,
    "condition" "public"."Condition" NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "public"."ListingStatus" NOT NULL DEFAULT 'DRAFT',
    "brandId" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "serialNumber" TEXT,
    "identifierMasked" TEXT,
    "identifierFull" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "cityId" TEXT NOT NULL,
    "hideExactLocation" BOOLEAN NOT NULL DEFAULT true,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "images" TEXT[],
    "verificationPhoto" TEXT,
    "sellerId" TEXT NOT NULL,
    "sellerNotes" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "favorites" INTEGER NOT NULL DEFAULT 0,
    "reportCount" INTEGER NOT NULL DEFAULT 0,
    "boost" BOOLEAN NOT NULL DEFAULT false,
    "boostExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "soldAt" TIMESTAMP(3),

    CONSTRAINT "listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."lost_reports" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "public"."ListingType" NOT NULL,
    "status" "public"."LostReportStatus" NOT NULL DEFAULT 'ACTIVE',
    "brandId" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "serialNumber" TEXT,
    "identifierMasked" TEXT,
    "identifierFull" TEXT,
    "lostDate" TIMESTAMP(3) NOT NULL,
    "lostLocation" TEXT NOT NULL,
    "circumstances" TEXT,
    "cityId" TEXT NOT NULL,
    "shareExactLocation" BOOLEAN NOT NULL DEFAULT false,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "searchRadius" INTEGER NOT NULL DEFAULT 50,
    "rewardAmount" DECIMAL(10,2),
    "rewardCurrency" TEXT NOT NULL DEFAULT 'USD',
    "rewardDescription" TEXT,
    "images" TEXT[],
    "proofOfPurchase" TEXT,
    "additionalEvidence" TEXT,
    "reporterId" TEXT NOT NULL,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "preferredContact" TEXT NOT NULL DEFAULT 'email',
    "shareContact" BOOLEAN NOT NULL DEFAULT false,
    "allowPublicView" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "lost_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."found_items" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "public"."ListingType" NOT NULL,
    "status" "public"."FoundItemStatus" NOT NULL DEFAULT 'REPORTED',
    "brandId" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "serialNumber" TEXT,
    "identifierMasked" TEXT,
    "identifierFull" TEXT,
    "condition" "public"."Condition" NOT NULL,
    "foundDate" TIMESTAMP(3) NOT NULL,
    "foundLocation" TEXT NOT NULL,
    "circumstances" TEXT,
    "cityId" TEXT NOT NULL,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "jurisdiction" "public"."Jurisdiction" NOT NULL,
    "authorityReported" BOOLEAN NOT NULL DEFAULT false,
    "authorityName" TEXT,
    "authorityContact" TEXT,
    "reportedAt" TIMESTAMP(3),
    "waitingPeriodDays" INTEGER NOT NULL,
    "availableForSaleAt" TIMESTAMP(3),
    "authorityEvidence" TEXT,
    "legalDisclaimer" TEXT,
    "complianceNotes" TEXT,
    "finderId" TEXT NOT NULL,
    "finderContactEmail" TEXT,
    "finderContactPhone" TEXT,
    "claimDeadline" TIMESTAMP(3),
    "claimRequirements" TEXT,
    "images" TEXT[],
    "foundEvidence" TEXT[],
    "listingPrice" DECIMAL(10,2),
    "listingCurrency" TEXT NOT NULL DEFAULT 'USD',
    "convertedToListingAt" TIMESTAMP(3),
    "listingId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "claimedAt" TIMESTAMP(3),
    "soldAt" TIMESTAMP(3),

    CONSTRAINT "found_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."matches" (
    "id" TEXT NOT NULL,
    "type" "public"."MatchType" NOT NULL,
    "status" "public"."MatchStatus" NOT NULL DEFAULT 'PENDING',
    "confidenceScore" DOUBLE PRECISION NOT NULL,
    "identifierMatch" BOOLEAN NOT NULL DEFAULT false,
    "locationMatch" BOOLEAN NOT NULL DEFAULT false,
    "timelineMatch" BOOLEAN NOT NULL DEFAULT false,
    "descriptionMatch" BOOLEAN NOT NULL DEFAULT false,
    "matchReason" TEXT,
    "algorithmVersion" TEXT NOT NULL DEFAULT '1.0',
    "lostReportId" TEXT,
    "listingId" TEXT,
    "foundItemId" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ratings" (
    "id" TEXT NOT NULL,
    "overallScore" DOUBLE PRECISION NOT NULL,
    "comfort" INTEGER,
    "autonomy" INTEGER,
    "caseReloadTime" INTEGER,
    "earbudReloadTime" INTEGER,
    "musicQuality" INTEGER,
    "videoQuality" INTEGER,
    "gameQuality" INTEGER,
    "avLag" INTEGER,
    "callOverall" INTEGER,
    "callCoworking" INTEGER,
    "callStreet" INTEGER,
    "callBike" INTEGER,
    "title" TEXT,
    "comment" TEXT,
    "pros" TEXT,
    "cons" TEXT,
    "usageDuration" TEXT,
    "primaryUse" TEXT[],
    "isModerated" BOOLEAN NOT NULL DEFAULT false,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "moderationNotes" TEXT,
    "isSpam" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT,
    "guestEmail" TEXT,
    "guestName" TEXT,
    "isVerifiedPurchase" BOOLEAN NOT NULL DEFAULT false,
    "brandId" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "helpfulCount" INTEGER NOT NULL DEFAULT 0,
    "notHelpfulCount" INTEGER NOT NULL DEFAULT 0,
    "reportCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "moderatedAt" TIMESTAMP(3),

    CONSTRAINT "ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."blog_posts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "status" "public"."PostStatus" NOT NULL DEFAULT 'DRAFT',
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "featuredImage" TEXT,
    "tags" TEXT[],
    "category" TEXT,
    "brandId" TEXT,
    "modelId" TEXT,
    "authorId" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "commentCount" INTEGER NOT NULL DEFAULT 0,
    "shareCount" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."comments" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "userId" TEXT,
    "guestEmail" TEXT,
    "guestName" TEXT,
    "isModerated" BOOLEAN NOT NULL DEFAULT false,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "isSpam" BOOLEAN NOT NULL DEFAULT false,
    "parentId" TEXT,
    "postId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."orders" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "paymentMethod" "public"."PaymentMethod" NOT NULL DEFAULT 'PAYPAL',
    "status" "public"."OrderStatus" NOT NULL DEFAULT 'CREATED',
    "paypalOrderId" TEXT,
    "paypalPayerId" TEXT,
    "paypalPaymentId" TEXT,
    "escrowHeld" BOOLEAN NOT NULL DEFAULT false,
    "escrowReleasedAt" TIMESTAMP(3),
    "notes" TEXT,
    "cancelReason" TEXT,
    "refundReason" TEXT,
    "disputeReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "approvedAt" TIMESTAMP(3),
    "capturedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sponsored_links" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "imageUrl" TEXT,
    "type" "public"."SponsoredType" NOT NULL,
    "placement" "public"."PlacementType" NOT NULL,
    "brandId" TEXT,
    "modelId" TEXT,
    "keywords" TEXT[],
    "countries" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "budget" DECIMAL(10,2),
    "costPerClick" DECIMAL(10,4),
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "revenue" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sponsored_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."system_config" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "oldData" JSONB,
    "newData" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "public"."accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "public"."sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "public"."verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "public"."verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "brands_name_key" ON "public"."brands"("name");

-- CreateIndex
CREATE UNIQUE INDEX "brands_slug_key" ON "public"."brands"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "models_slug_key" ON "public"."models"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "models_brandId_name_key" ON "public"."models"("brandId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "cities_geoDbId_key" ON "public"."cities"("geoDbId");

-- CreateIndex
CREATE INDEX "cities_searchText_idx" ON "public"."cities"("searchText");

-- CreateIndex
CREATE INDEX "cities_countryCode_idx" ON "public"."cities"("countryCode");

-- CreateIndex
CREATE INDEX "listings_status_publishedAt_idx" ON "public"."listings"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "listings_brandId_modelId_idx" ON "public"."listings"("brandId", "modelId");

-- CreateIndex
CREATE INDEX "listings_cityId_idx" ON "public"."listings"("cityId");

-- CreateIndex
CREATE INDEX "listings_type_condition_idx" ON "public"."listings"("type", "condition");

-- CreateIndex
CREATE INDEX "lost_reports_status_lostDate_idx" ON "public"."lost_reports"("status", "lostDate");

-- CreateIndex
CREATE INDEX "lost_reports_brandId_modelId_idx" ON "public"."lost_reports"("brandId", "modelId");

-- CreateIndex
CREATE INDEX "lost_reports_cityId_idx" ON "public"."lost_reports"("cityId");

-- CreateIndex
CREATE UNIQUE INDEX "found_items_listingId_key" ON "public"."found_items"("listingId");

-- CreateIndex
CREATE INDEX "found_items_status_foundDate_idx" ON "public"."found_items"("status", "foundDate");

-- CreateIndex
CREATE INDEX "found_items_jurisdiction_status_idx" ON "public"."found_items"("jurisdiction", "status");

-- CreateIndex
CREATE INDEX "found_items_brandId_modelId_idx" ON "public"."found_items"("brandId", "modelId");

-- CreateIndex
CREATE INDEX "matches_type_status_idx" ON "public"."matches"("type", "status");

-- CreateIndex
CREATE INDEX "matches_confidenceScore_idx" ON "public"."matches"("confidenceScore");

-- CreateIndex
CREATE INDEX "ratings_brandId_modelId_isApproved_idx" ON "public"."ratings"("brandId", "modelId", "isApproved");

-- CreateIndex
CREATE INDEX "ratings_overallScore_idx" ON "public"."ratings"("overallScore");

-- CreateIndex
CREATE INDEX "ratings_createdAt_idx" ON "public"."ratings"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "blog_posts_slug_key" ON "public"."blog_posts"("slug");

-- CreateIndex
CREATE INDEX "blog_posts_status_publishedAt_idx" ON "public"."blog_posts"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "blog_posts_brandId_modelId_idx" ON "public"."blog_posts"("brandId", "modelId");

-- CreateIndex
CREATE INDEX "blog_posts_tags_idx" ON "public"."blog_posts"("tags");

-- CreateIndex
CREATE INDEX "comments_postId_isApproved_idx" ON "public"."comments"("postId", "isApproved");

-- CreateIndex
CREATE INDEX "comments_parentId_idx" ON "public"."comments"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "orders_orderNumber_key" ON "public"."orders"("orderNumber");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "public"."orders"("status");

-- CreateIndex
CREATE INDEX "orders_buyerId_idx" ON "public"."orders"("buyerId");

-- CreateIndex
CREATE INDEX "orders_sellerId_idx" ON "public"."orders"("sellerId");

-- CreateIndex
CREATE INDEX "sponsored_links_type_placement_isActive_idx" ON "public"."sponsored_links"("type", "placement", "isActive");

-- CreateIndex
CREATE INDEX "sponsored_links_brandId_modelId_idx" ON "public"."sponsored_links"("brandId", "modelId");

-- CreateIndex
CREATE UNIQUE INDEX "system_config_key_key" ON "public"."system_config"("key");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "public"."audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_entity_entityId_idx" ON "public"."audit_logs"("entity", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "public"."audit_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."models" ADD CONSTRAINT "models_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "public"."brands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."listings" ADD CONSTRAINT "listings_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "public"."brands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."listings" ADD CONSTRAINT "listings_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "public"."models"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."listings" ADD CONSTRAINT "listings_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "public"."cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."listings" ADD CONSTRAINT "listings_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lost_reports" ADD CONSTRAINT "lost_reports_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "public"."brands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lost_reports" ADD CONSTRAINT "lost_reports_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "public"."models"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lost_reports" ADD CONSTRAINT "lost_reports_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "public"."cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lost_reports" ADD CONSTRAINT "lost_reports_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."found_items" ADD CONSTRAINT "found_items_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "public"."brands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."found_items" ADD CONSTRAINT "found_items_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "public"."models"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."found_items" ADD CONSTRAINT "found_items_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "public"."cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."found_items" ADD CONSTRAINT "found_items_finderId_fkey" FOREIGN KEY ("finderId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."found_items" ADD CONSTRAINT "found_items_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "public"."listings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."matches" ADD CONSTRAINT "matches_lostReportId_fkey" FOREIGN KEY ("lostReportId") REFERENCES "public"."lost_reports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."matches" ADD CONSTRAINT "matches_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "public"."listings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."matches" ADD CONSTRAINT "matches_foundItemId_fkey" FOREIGN KEY ("foundItemId") REFERENCES "public"."found_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."matches" ADD CONSTRAINT "matches_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ratings" ADD CONSTRAINT "ratings_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "public"."brands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ratings" ADD CONSTRAINT "ratings_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "public"."models"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ratings" ADD CONSTRAINT "ratings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."blog_posts" ADD CONSTRAINT "blog_posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."blog_posts" ADD CONSTRAINT "blog_posts_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "public"."brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."blog_posts" ADD CONSTRAINT "blog_posts_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "public"."models"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."comments" ADD CONSTRAINT "comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."comments" ADD CONSTRAINT "comments_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."blog_posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."comments" ADD CONSTRAINT "comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "public"."listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sponsored_links" ADD CONSTRAINT "sponsored_links_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "public"."brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sponsored_links" ADD CONSTRAINT "sponsored_links_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "public"."models"("id") ON DELETE SET NULL ON UPDATE CASCADE;
