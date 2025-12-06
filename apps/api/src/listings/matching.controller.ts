import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { MatchingService } from './matching.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('Matching & Recommendations')
@Controller('listings/matches')
export class MatchingController {
    constructor(private readonly matchingService: MatchingService) { }

    @Get(':id')
    @ApiOperation({
        summary: 'Find matches for a listing',
        description: 'Find potential trading partners, buyers, or sellers based on item availability and trading preferences',
    })
    @ApiParam({ name: 'id', description: 'Listing ID' })
    @ApiQuery({ name: 'limit', required: false, description: 'Number of matches to return', example: 10 })
    @ApiResponse({
        status: 200,
        description: 'Returns matched listings with scores and reasons',
    })
    async findMatches(
        @Param('id') id: string,
        @Query('limit') limit?: number,
    ) {
        const matches = await this.matchingService.findMatches(
            id,
            limit ? parseInt(limit.toString()) : 10,
        );

        return {
            listingId: id,
            matches: matches.map((m) => ({
                listing: {
                    id: m.listing.id,
                    title: m.listing.title,
                    type: m.listing.type,
                    condition: m.listing.condition,
                    price: m.listing.price,
                    currency: m.listing.currency,
                    primaryIntent: m.listing.primaryIntent,
                    openToAlternate: m.listing.openToAlternate,
                    brand: {
                        id: m.listing.brand.id,
                        name: m.listing.brand.name,
                        slug: m.listing.brand.slug,
                    },
                    model: {
                        id: m.listing.model.id,
                        name: m.listing.model.name,
                        slug: m.listing.model.slug,
                    },
                    city: {
                        id: m.listing.city.id,
                        name: m.listing.city.name,
                        displayName: m.listing.city.displayName,
                    },
                    seller: m.listing.seller,
                    images: m.listing.images,
                },
                matchScore: m.matchScore,
                matchReasons: m.matchReasons,
            })),
        };
    }

    @Get('user/recommendations')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Get personalized recommendations',
        description: 'Get listing recommendations based on your active listings and preferences',
    })
    @ApiQuery({ name: 'limit', required: false, description: 'Number of recommendations', example: 10 })
    @ApiResponse({
        status: 200,
        description: 'Returns personalized listing recommendations',
    })
    async getRecommendations(
        @GetUser() user: any,
        @Query('limit') limit?: number,
    ) {
        const recommendations = await this.matchingService.getRecommendationsForUser(
            user.id,
            limit ? parseInt(limit.toString()) : 10,
        );

        return {
            userId: user.id,
            recommendations: recommendations.map((m) => ({
                listing: {
                    id: m.listing.id,
                    title: m.listing.title,
                    type: m.listing.type,
                    condition: m.listing.condition,
                    price: m.listing.price,
                    currency: m.listing.currency,
                    primaryIntent: m.listing.primaryIntent,
                    openToAlternate: m.listing.openToAlternate,
                    brand: {
                        id: m.listing.brand.id,
                        name: m.listing.brand.name,
                        slug: m.listing.brand.slug,
                    },
                    model: {
                        id: m.listing.model.id,
                        name: m.listing.model.name,
                        slug: m.listing.model.slug,
                    },
                    city: {
                        id: m.listing.city.id,
                        name: m.listing.city.name,
                        displayName: m.listing.city.displayName,
                    },
                    seller: m.listing.seller,
                    images: m.listing.images,
                },
                matchScore: m.matchScore,
                matchReasons: m.matchReasons,
            })),
        };
    }
}
