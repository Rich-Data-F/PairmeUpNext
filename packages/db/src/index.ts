import { PrismaClient } from '@prisma/client';

export * from '@prisma/client';

// Export Prisma enums that are commonly used
export enum ListingType {
  LISTING = 'LISTING',
  WANTED = 'WANTED',
}

export enum Condition {
  NEW = 'NEW',
  LIKE_NEW = 'LIKE_NEW',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR',
}

export enum ListingStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  SOLD = 'SOLD',
  EXPIRED = 'EXPIRED',
  DELETED = 'DELETED',
}

export enum TrustLevel {
  NEW = 'NEW',
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  BANNED = 'BANNED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
}

export enum ReportStatus {
  ACTIVE = 'ACTIVE',
  RESOLVED = 'RESOLVED',
  EXPIRED = 'EXPIRED',
  FALSE_REPORT = 'FALSE_REPORT',
}

export enum FoundItemStatus {
  REPORTED = 'REPORTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  VERIFIED = 'VERIFIED',
  CLAIMED = 'CLAIMED',
  RETURNED = 'RETURNED',
  UNCLAIMED = 'UNCLAIMED',
}

export enum MatchStatus {
  POTENTIAL = 'POTENTIAL',
  CONFIRMED = 'CONFIRMED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
  DISPUTED = 'DISPUTED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  AUTHORIZED = 'AUTHORIZED',
  CAPTURED = 'CAPTURED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum BlogPostStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum CategoryType {
  EARBUDS = 'EARBUDS',
  CHARGING_CASES = 'CHARGING_CASES',
  ACCESSORIES = 'ACCESSORIES',
}

// Placeholder Prisma namespace with common types for development
export namespace Prisma {
  export type ListingWhereInput = any;
  export type ListingOrderByWithRelationInput = any;
  export type UserWhereInput = any;
  export type UserOrderByWithRelationInput = any;
}

declare global {
  var __prisma: PrismaClient | undefined;
}

export const prisma = globalThis.__prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

export default prisma;
