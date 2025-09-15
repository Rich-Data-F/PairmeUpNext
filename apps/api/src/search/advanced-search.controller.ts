import { Controller, Get, Post, Query, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { AdvancedSearchService, AdvancedSearchFilters } from './advanced-search.service';

export class AdvancedSearchDto {
  // Text search
  query?: string;
  exactMatch?: boolean;
  searchFields?: string[];

  // Filtering
  brandIds?: string[];
  modelIds?: string[];
  categories?: string[];
  conditions?: string[];
  
  // Price and currency
  minPrice?: number;
  maxPrice?: number;
  currencies?: string[];
  
  // Location
  cityIds?: string[];
  countryIds?: string[];
  lat?: number;
  lng?: number;
  radiusKm?: number;
  
  // Quality filters
  verifiedOnly?: boolean;
  hasImages?: boolean;
  hasVideo?: boolean;
  minRating?: number;
  
  // Sorting
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'date_desc' | 'date_asc' | 'distance' | 'popularity';
  
  // Pagination
  page?: number;
  limit?: number;
}

export class GeoSearchDto {
  lat: number;
  lng: number;
  radiusKm: number;
  
  // Include other filters
  query?: string;
  brandIds?: string[];
  minPrice?: number;
  maxPrice?: number;
  verifiedOnly?: boolean;
  page?: number;
  limit?: number;
}

export class SaveSearchDto {
  name: string;
  filters: AdvancedSearchFilters;
  alertsEnabled?: boolean;
}

@ApiTags('advanced-search')
@Controller('search/advanced')
export class AdvancedSearchController {
  constructor(private readonly advancedSearchService: AdvancedSearchService) {}

  @Post()
  @ApiOperation({ summary: 'Advanced search with sophisticated filtering and analytics' })
  @ApiResponse({ status: 200, description: 'Advanced search results with analytics' })
  async advancedSearch(
    @Body() searchDto: AdvancedSearchDto,
    @Req() req: any
  ) {
    const userId = req.user?.id;
    
    const filters: AdvancedSearchFilters = {
      query: searchDto.query,
      exactMatch: searchDto.exactMatch,
      searchFields: searchDto.searchFields as any,
      brandIds: searchDto.brandIds,
      modelIds: searchDto.modelIds,
      categories: searchDto.categories,
      conditions: searchDto.conditions,
      priceRange: searchDto.minPrice || searchDto.maxPrice ? {
        min: searchDto.minPrice,
        max: searchDto.maxPrice,
      } : undefined,
      currencies: searchDto.currencies,
      cityIds: searchDto.cityIds,
      countryIds: searchDto.countryIds,
      coordinates: searchDto.lat && searchDto.lng ? {
        lat: searchDto.lat,
        lng: searchDto.lng,
        radiusKm: searchDto.radiusKm || 10,
      } : undefined,
      verifiedOnly: searchDto.verifiedOnly,
      hasImages: searchDto.hasImages,
      hasVideo: searchDto.hasVideo,
      minRating: searchDto.minRating,
      sortBy: searchDto.sortBy,
      excludeOwnListings: userId,
    };

    return this.advancedSearchService.advancedSearch(
      filters,
      searchDto.page || 1,
      searchDto.limit || 20,
      userId
    );
  }

  @Post('geo')
  @ApiOperation({ summary: 'Geographic search with radius-based filtering' })
  @ApiResponse({ status: 200, description: 'Location-based search results' })
  async geoSearch(@Body() geoDto: GeoSearchDto, @Req() req: any) {
    const userId = req.user?.id;
    
    const filters: Omit<AdvancedSearchFilters, 'coordinates'> = {
      query: geoDto.query,
      brandIds: geoDto.brandIds,
      priceRange: geoDto.minPrice || geoDto.maxPrice ? {
        min: geoDto.minPrice,
        max: geoDto.maxPrice,
      } : undefined,
      verifiedOnly: geoDto.verifiedOnly,
      excludeOwnListings: userId,
    };

    return this.advancedSearchService.geoSearch(
      { lat: geoDto.lat, lng: geoDto.lng },
      geoDto.radiusKm,
      filters,
      geoDto.page || 1,
      geoDto.limit || 20
    );
  }

  @Get('autocomplete')
  @ApiOperation({ summary: 'Smart autocomplete with context-aware suggestions' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query for autocomplete' })
  @ApiQuery({ name: 'context', required: false, description: 'JSON context filters' })
  @ApiResponse({ status: 200, description: 'Autocomplete suggestions with categories' })
  async autocomplete(
    @Query('q') query: string,
    @Query('context') contextStr?: string
  ) {
    let context: AdvancedSearchFilters | undefined;
    
    if (contextStr) {
      try {
        context = JSON.parse(contextStr);
      } catch (error) {
        // Invalid JSON, ignore context
      }
    }

    return this.advancedSearchService.getSmartAutocomplete(query, context);
  }

  @Post('save')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Save search with optional alerts' })
  @ApiResponse({ status: 201, description: 'Search saved successfully' })
  async saveSearch(
    @Body() saveDto: SaveSearchDto,
    @GetUser() user: any
  ) {
    return this.advancedSearchService.saveSearch(
      user.id,
      saveDto.name,
      saveDto.filters,
      saveDto.alertsEnabled
    );
  }

  @Get('saved')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user saved searches' })
  @ApiResponse({ status: 200, description: 'List of saved searches' })
  async getSavedSearches(@GetUser() user: any) {
    return this.advancedSearchService.getSavedSearches(user.id);
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Search performance analytics' })
  @ApiQuery({ name: 'timeframe', required: false, enum: ['day', 'week', 'month'] })
  @ApiResponse({ status: 200, description: 'Search analytics data' })
  async getAnalytics(@Query('timeframe') timeframe: 'day' | 'week' | 'month' = 'week') {
    return this.advancedSearchService.getSearchAnalytics(timeframe);
  }

  @Get('filters')
  @ApiOperation({ summary: 'Get available filter options and aggregations' })
  @ApiResponse({ status: 200, description: 'Available filter options with counts' })
  async getFilterOptions(@Query() query: any) {
    // Convert query params to basic filters for aggregations
    const baseFilters: AdvancedSearchFilters = {
      query: query.q,
      brandIds: query.brandIds ? query.brandIds.split(',') : undefined,
      modelIds: query.modelIds ? query.modelIds.split(',') : undefined,
    };

    // Get aggregations using a basic search (we'll enhance this)
    const result = await this.advancedSearchService.advancedSearch(baseFilters, 1, 1);
    return result.aggregations;
  }

  @Get('suggestions/:type')
  @ApiOperation({ summary: 'Get suggestions by type (brands, models, locations, etc.)' })
  @ApiResponse({ status: 200, description: 'Type-specific suggestions' })
  async getSuggestionsByType(
    @Param('type') type: 'brands' | 'models' | 'locations' | 'terms',
    @Query('q') query?: string,
    @Query('limit') limit: number = 10
  ) {
    // This would be implemented with specific methods for each type
    switch (type) {
      case 'brands':
        return this.getBrandSuggestions(query, limit);
      case 'models':
        return this.getModelSuggestions(query, limit);
      case 'locations':
        return this.getLocationSuggestions(query, limit);
      case 'terms':
        return this.getTermSuggestions(query, limit);
      default:
        return { suggestions: [] };
    }
  }

  // Helper methods for specific suggestion types
  private async getBrandSuggestions(query?: string, limit: number = 10) {
    // Implementation would query brands
    return { suggestions: [], type: 'brands' };
  }

  private async getModelSuggestions(query?: string, limit: number = 10) {
    // Implementation would query models
    return { suggestions: [], type: 'models' };
  }

  private async getLocationSuggestions(query?: string, limit: number = 10) {
    // Implementation would query cities
    return { suggestions: [], type: 'locations' };
  }

  private async getTermSuggestions(query?: string, limit: number = 10) {
    // Implementation would return popular search terms
    return { suggestions: [], type: 'terms' };
  }
}
