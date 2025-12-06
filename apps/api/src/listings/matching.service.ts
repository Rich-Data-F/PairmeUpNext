import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';


interface MatchScore {
    listingId: string;
    score: number;
    reasons: string[];
}

interface MatchResult {
    listing: any;
    matchScore: number;
    matchReasons: string[];
}

@Injectable()
export class MatchingService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Find potential matches for a listing based on trading preferences and item availability
     * This helps users find complementary listings (e.g., someone selling what they need)
     */
    async findMatches(listingId: string, limit: number = 10): Promise<MatchResult[]> {
        // Get the source listing
        const sourceListing = await this.prisma.listing.findUnique({
            where: { id: listingId },
            include: {
                brand: true,
                model: true,
                city: true,
            },
        });

        if (!sourceListing) {
            throw new Error('Listing not found');
        }

        // Build match criteria
        const matchCriteria: any = {
            status: 'ACTIVE',
            id: { not: listingId }, // Exclude the source listing
            brandId: sourceListing.brandId,
            modelId: sourceListing.modelId,
        };

        // Find potential matches
        const potentialMatches = await this.prisma.listing.findMany({
            where: matchCriteria,
            include: {
                brand: true,
                model: true,
                city: true,
                seller: {
                    select: {
                        id: true,
                        name: true,
                        verificationBadge: true,
                        trustLevel: true,
                        isVerified: true,
                    },
                },
            },
            take: 50, // Get more than needed, we'll score and filter
        });

        // Score each potential match
        const scoredMatches = potentialMatches.map((match) => {
            const { score, reasons } = this.calculateMatchScore(sourceListing, match);
            return {
                listing: match,
                matchScore: score,
                matchReasons: reasons,
            };
        });

        // Sort by score and return top matches
        return scoredMatches
            .filter((m) => m.matchScore > 0)
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, limit);
    }

    /**
     * Calculate match score between two listings
     * Higher score = better match
     */
    private calculateMatchScore(
        source: any,
        target: any,
    ): { score: number; reasons: string[] } {
        let score = 0;
        const reasons: string[] = [];

        // 1. Trading Intent Compatibility (40 points max)
        const intentScore = this.scoreIntentCompatibility(source, target);
        score += intentScore.score;
        reasons.push(...intentScore.reasons);

        // 2. Item Availability Match (40 points max)
        const availabilityScore = this.scoreItemAvailability(source, target);
        score += availabilityScore.score;
        reasons.push(...availabilityScore.reasons);

        // 3. Location Proximity (10 points max)
        const locationScore = this.scoreLocationProximity(source, target);
        score += locationScore.score;
        if (locationScore.score > 0) {
            reasons.push(locationScore.reason);
        }

        // 4. Price Compatibility (10 points max)
        const priceScore = this.scorePriceCompatibility(source, target);
        score += priceScore.score;
        if (priceScore.score > 0) {
            reasons.push(priceScore.reason);
        }

        return { score, reasons };
    }

    /**
     * Score trading intent compatibility
     * Perfect match: buyer <-> seller, or both open to trading
     */
    private scoreIntentCompatibility(
        source: any,
        target: any,
    ): { score: number; reasons: string[] } {
        let score = 0;
        const reasons: string[] = [];

        const sourceIntent = source.primaryIntent || 'SELLING';
        const targetIntent = target.primaryIntent || 'SELLING';
        const sourceOpenToAlternate = source.openToAlternate || false;
        const targetOpenToAlternate = target.openToAlternate || false;

        // Perfect complementary match: buyer <-> seller
        if (
            (sourceIntent === 'BUYING' && targetIntent === 'SELLING') ||
            (sourceIntent === 'SELLING' && targetIntent === 'BUYING')
        ) {
            score += 40;
            reasons.push('Perfect intent match: buyer meets seller');
        }
        // Both want to trade
        else if (sourceIntent === 'TRADING' && targetIntent === 'TRADING') {
            score += 35;
            reasons.push('Both open to trading');
        }
        // One wants to trade, other wants to buy/sell
        else if (
            sourceIntent === 'TRADING' &&
            (targetIntent === 'BUYING' || targetIntent === 'SELLING')
        ) {
            score += 30;
            reasons.push('Trading opportunity available');
        } else if (
            targetIntent === 'TRADING' &&
            (sourceIntent === 'BUYING' || sourceIntent === 'SELLING')
        ) {
            score += 30;
            reasons.push('Trading opportunity available');
        }
        // Both open to alternate options
        else if (sourceOpenToAlternate && targetOpenToAlternate) {
            score += 20;
            reasons.push('Both flexible on transaction type');
        }
        // One is open to alternate
        else if (sourceOpenToAlternate || targetOpenToAlternate) {
            score += 10;
            reasons.push('Flexible transaction options');
        }

        return { score, reasons };
    }

    /**
     * Score item availability match
     * Perfect match: what one has is what the other needs
     */
    private scoreItemAvailability(
        source: any,
        target: any,
    ): { score: number; reasons: string[] } {
        let score = 0;
        const reasons: string[] = [];

        // Check if what source HAS matches what target NEEDS
        let sourceHasTargetNeeds = 0;
        if (source.hasLeftEarbud && target.needsLeftEarbud) {
            sourceHasTargetNeeds++;
            reasons.push('You have the left earbud they need');
        }
        if (source.hasRightEarbud && target.needsRightEarbud) {
            sourceHasTargetNeeds++;
            reasons.push('You have the right earbud they need');
        }
        if (source.hasChargingCase && target.needsChargingCase) {
            sourceHasTargetNeeds++;
            reasons.push('You have the charging case they need');
        }

        // Check if what target HAS matches what source NEEDS
        let targetHasSourceNeeds = 0;
        if (target.hasLeftEarbud && source.needsLeftEarbud) {
            targetHasSourceNeeds++;
            reasons.push('They have the left earbud you need');
        }
        if (target.hasRightEarbud && source.needsRightEarbud) {
            targetHasSourceNeeds++;
            reasons.push('They have the right earbud you need');
        }
        if (target.hasChargingCase && source.needsChargingCase) {
            targetHasSourceNeeds++;
            reasons.push('They have the charging case you need');
        }

        // Perfect complementary match (both have what the other needs)
        if (sourceHasTargetNeeds > 0 && targetHasSourceNeeds > 0) {
            score += 40;
            reasons.push('Perfect complementary match - ideal for trading!');
        }
        // One-way match (you have what they need OR they have what you need)
        else if (sourceHasTargetNeeds > 0) {
            score += 25;
        } else if (targetHasSourceNeeds > 0) {
            score += 25;
        }

        // Bonus for multiple item matches
        const totalMatches = sourceHasTargetNeeds + targetHasSourceNeeds;
        if (totalMatches >= 2) {
            score += 10;
            reasons.push(`${totalMatches} items match your needs`);
        }

        return { score, reasons };
    }

    /**
     * Score location proximity
     * Same city = higher score
     */
    private scoreLocationProximity(
        source: any,
        target: any,
    ): { score: number; reason: string } {
        if (source.cityId === target.cityId) {
            return {
                score: 10,
                reason: 'Same city - easy to meet up',
            };
        }

        // Could add country-level matching here
        if (source.city?.countryCode === target.city?.countryCode) {
            return {
                score: 5,
                reason: 'Same country',
            };
        }

        return { score: 0, reason: '' };
    }

    /**
     * Score price compatibility
     * Similar prices = better match
     */
    private scorePriceCompatibility(
        source: any,
        target: any,
    ): { score: number; reason: string } {
        if (!source.price || !target.price) {
            return { score: 0, reason: '' };
        }

        const priceDiff = Math.abs(
            Number(source.price) - Number(target.price),
        );
        const avgPrice = (Number(source.price) + Number(target.price)) / 2;
        const percentDiff = (priceDiff / avgPrice) * 100;

        // Very similar prices (within 20%)
        if (percentDiff <= 20) {
            return {
                score: 10,
                reason: 'Similar price range',
            };
        }
        // Somewhat similar (within 50%)
        else if (percentDiff <= 50) {
            return {
                score: 5,
                reason: 'Comparable price',
            };
        }

        return { score: 0, reason: '' };
    }

    /**
     * Get recommendations for a user based on their listings
     * This finds listings that complement what the user has/needs
     */
    async getRecommendationsForUser(
        userId: string,
        limit: number = 10,
    ): Promise<MatchResult[]> {
        // Get user's active listings
        const userListings = await this.prisma.listing.findMany({
            where: {
                sellerId: userId,
                status: 'ACTIVE',
            },
            include: {
                brand: true,
                model: true,
            },
        });

        if (userListings.length === 0) {
            return [];
        }

        // Get matches for all user listings
        const allMatches: MatchResult[] = [];
        for (const listing of userListings) {
            const matches = await this.findMatches(listing.id, limit);
            allMatches.push(...matches);
        }

        // Deduplicate and sort by score
        const uniqueMatches = new Map<string, MatchResult>();
        for (const match of allMatches) {
            const existingMatch = uniqueMatches.get(match.listing.id);
            if (!existingMatch || match.matchScore > existingMatch.matchScore) {
                uniqueMatches.set(match.listing.id, match);
            }
        }

        return Array.from(uniqueMatches.values())
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, limit);
    }
}
