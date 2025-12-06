-- Safely apply 20250916021412_add_negotiations

DO $$
BEGIN
    -- Create Enums
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ConversationStatus') THEN
        CREATE TYPE "public"."ConversationStatus" AS ENUM ('ACTIVE', 'CLOSED', 'BLOCKED');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'MessageType') THEN
        CREATE TYPE "public"."MessageType" AS ENUM ('TEXT', 'OFFER', 'SYSTEM', 'IMAGE');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'OfferStatus') THEN
        CREATE TYPE "public"."OfferStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'WITHDRAWN');
    END IF;

    -- Create conversations table
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversations') THEN
        CREATE TABLE "public"."conversations" (
            "id" TEXT NOT NULL,
            "listingId" TEXT NOT NULL,
            "buyerId" TEXT NOT NULL,
            "sellerId" TEXT NOT NULL,
            "status" "public"."ConversationStatus" NOT NULL DEFAULT 'ACTIVE',
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
        );
        
        -- Create Index
        CREATE UNIQUE INDEX "conversations_listingId_buyerId_key" ON "public"."conversations"("listingId", "buyerId");
        
        -- Add FKs
        ALTER TABLE "public"."conversations" ADD CONSTRAINT "conversations_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "public"."listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        ALTER TABLE "public"."conversations" ADD CONSTRAINT "conversations_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
        ALTER TABLE "public"."conversations" ADD CONSTRAINT "conversations_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

    -- Create messages table
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') THEN
        CREATE TABLE "public"."messages" (
            "id" TEXT NOT NULL,
            "conversationId" TEXT NOT NULL,
            "senderId" TEXT NOT NULL,
            "content" TEXT NOT NULL,
            "messageType" "public"."MessageType" NOT NULL DEFAULT 'TEXT',
            "attachments" JSONB,
            "isRead" BOOLEAN NOT NULL DEFAULT false,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
        );
        
        -- Add FKs
        ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "public"."conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

    -- Create offers table
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'offers') THEN
        CREATE TABLE "public"."offers" (
            "id" TEXT NOT NULL,
            "conversationId" TEXT NOT NULL,
            "senderId" TEXT NOT NULL,
            "amount" DECIMAL(10,2) NOT NULL,
            "currency" TEXT NOT NULL DEFAULT 'USD',
            "message" TEXT,
            "status" "public"."OfferStatus" NOT NULL DEFAULT 'PENDING',
            "expiresAt" TIMESTAMP(3),
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "offers_pkey" PRIMARY KEY ("id")
        );
        
        -- Add FKs
        ALTER TABLE "public"."offers" ADD CONSTRAINT "offers_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "public"."conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        ALTER TABLE "public"."offers" ADD CONSTRAINT "offers_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

END $$;
