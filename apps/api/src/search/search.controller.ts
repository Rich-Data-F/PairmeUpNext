import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SearchService, SearchFilters } from './search.service';
import { AdvancedSearchService } from './advanced-search.service';
import { FacetedSearchService } from './faceted-search.service';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(
    private readonly searchService: SearchService,
    private readonly advancedSearchService: AdvancedSearchService,
    private readonly facetedSearchService: FacetedSearchService,
  ) { }

  @Get('listings')
  @ApiOperation({ summary: 'Search listings with advanced filters and facets' })
  @ApiQuery({ name: 'q', required: false, description: 'Search query' })
  @ApiQuery({ name: 'brand', required: false, description: 'Brand ID filter' })
  @ApiQuery({ name: 'model', required: false, description: 'Model ID filter' })
  @ApiQuery({ name: 'type', required: false, enum: ['LISTING', 'WANTED'], description: 'Listing type' })
  @ApiQuery({ name: 'condition', required: false, description: 'Condition filters (comma-separated)' })
  @ApiQuery({ name: 'minPrice', required: false, type: Number, description: 'Minimum price' })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number, description: 'Maximum price' })
  @ApiQuery({ name: 'city', required: false, description: 'City ID filter' })
  @ApiQuery({ name: 'radius', required: false, type: Number, description: 'Search radius in km' })
  @ApiQuery({ name: 'currency', required: false, description: 'Currency filter' })
  @ApiQuery({ name: 'verified', required: false, type: Boolean, description: 'Verified listings only' })
  @ApiQuery({ name: 'hasImages', required: false, type: Boolean, description: 'Listings with images only' })
  @ApiQuery({ name: 'intent', required: false, enum: ['SELLING', 'BUYING', 'TRADING'], description: 'Primary Intent' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiResponse({ status: 200, description: 'Search results with facets and pagination' })
  async searchListings(@Query() query: any) {
    const filters: SearchFilters = {
      query: query.q,
      brandId: query.brand,
      modelId: query.model,
      type: query.type,
      condition: query.condition ? query.condition.split(',') : undefined,
      minPrice: query.minPrice ? parseFloat(query.minPrice) : undefined,
      maxPrice: query.maxPrice ? parseFloat(query.maxPrice) : undefined,
      cityId: query.city,
      radiusKm: query.radius ? parseInt(query.radius) : undefined,
      currency: query.currency,
      verifiedOnly: query.verified === 'true',
      hasImages: query.hasImages === 'true',
      primaryIntent: query.intent,
    };

    const page = query.page ? parseInt(query.page) : 1;
    const limit = query.limit ? parseInt(query.limit) : 20;

    return this.searchService.searchListings(filters, page, limit);
  }

  @Get('suggestions')
  @ApiOperation({ summary: 'Get search suggestions and popular searches' })
  @ApiQuery({ name: 'q', required: false, description: 'Partial query for suggestions' })
  @ApiResponse({ status: 200, description: 'Search suggestions' })
  async getSearchSuggestions(@Query('q') query?: string) {
    if (query && query.length >= 2) {
      const suggestions = await this.searchService.getSearchSuggestions(query);
      return { suggestions };
    }

    // Return popular and trending searches
    const [popular, trending] = await Promise.all([
      this.searchService.getPopularSearches(),
      this.searchService.getTrendingSearches(),
    ]);

    return { popular, trending };
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured listings for homepage' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of featured listings' })
  @ApiResponse({ status: 200, description: 'Featured listings' })
  async getFeaturedListings(@Query('limit') limit?: string) {
    const listingLimit = limit ? parseInt(limit) : 12;
    return this.searchService.getFeaturedListings(listingLimit);
  }

  @Get('autocomplete/cities')
  @ApiOperation({ summary: 'City autocomplete for location search' })
  @ApiQuery({ name: 'q', required: true, description: 'City name query' })
  @ApiQuery({ name: 'country', required: false, description: 'ISO country code filter' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Maximum results' })
  @ApiResponse({ status: 200, description: 'City suggestions' })
  async autocompleteCities(@Query('q') query: string, @Query('country') country?: string, @Query('limit') limit?: string) {
    if (!query || query.length < 2) {
      return { cities: [] };
    }

    const cityLimit = limit ? parseInt(limit) : 10;
    const cities = await this.searchService.autocompleteCities(query, cityLimit, country);
    return { cities };
  }

  @Get('filters')
  @ApiOperation({ summary: 'Get available filter options' })
  @ApiResponse({ status: 200, description: 'Filter options for search' })
  async getFilterOptions() {
    return this.searchService.getFilterOptions();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get marketplace statistics' })
  @ApiResponse({ status: 200, description: 'Marketplace statistics' })
  async getMarketplaceStats() {
    return this.searchService.getMarketplaceStats();
  }

  @Get('facets')
  @ApiOperation({ summary: 'Get faceted search counts for dynamic filtering' })
  @ApiQuery({ name: 'q', required: false, description: 'Search query' })
  @ApiQuery({ name: 'brandIds', required: false, description: 'Comma-separated brand IDs' })
  @ApiQuery({ name: 'modelIds', required: false, description: 'Comma-separated model IDs' })
  @ApiQuery({ name: 'priceMin', required: false, type: Number, description: 'Minimum price' })
  @ApiQuery({ name: 'priceMax', required: false, type: Number, description: 'Maximum price' })
  @ApiQuery({ name: 'conditions', required: false, description: 'Comma-separated conditions' })
  @ApiQuery({ name: 'cityIds', required: false, description: 'Comma-separated city IDs' })
  @ApiResponse({ status: 200, description: 'Faceted search counts' })
  async getFacets(
    @Query('q') query?: string,
    @Query('brandIds') brandIds?: string,
    @Query('modelIds') modelIds?: string,
    @Query('priceMin') priceMin?: string,
    @Query('priceMax') priceMax?: string,
    @Query('conditions') conditions?: string,
    @Query('cityIds') cityIds?: string,
  ) {
    const facets = {
      brandIds: brandIds?.split(','),
      modelIds: modelIds?.split(','),
      priceMin: priceMin ? parseFloat(priceMin) : undefined,
      priceMax: priceMax ? parseFloat(priceMax) : undefined,
      conditions: conditions?.split(','),
      cityIds: cityIds?.split(','),
    };

    return this.facetedSearchService.getFacetCounts(query, facets);
  }

  @Get('advanced')
  @ApiOperation({ summary: 'Advanced search with enhanced filtering' })
  @ApiQuery({ name: 'q', required: false, description: 'Search query' })
  @ApiQuery({ name: 'brandIds', required: false, description: 'Comma-separated brand IDs' })
  @ApiQuery({ name: 'modelIds', required: false, description: 'Comma-separated model IDs' })
  @ApiQuery({ name: 'priceMin', required: false, type: Number })
  @ApiQuery({ name: 'priceMax', required: false, type: Number })
  @ApiQuery({ name: 'conditions', required: false, description: 'Comma-separated conditions' })
  @ApiQuery({ name: 'cityIds', required: false, description: 'Comma-separated city IDs' })
  @ApiQuery({ name: 'verifiedOnly', required: false, type: Boolean })
  @ApiQuery({ name: 'hasImages', required: false, type: Boolean })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['relevance', 'price_asc', 'price_desc', 'date_desc', 'date_asc'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Advanced search results with analytics' })
  async advancedSearch(
    @Query('q') query?: string,
    @Query('brandIds') brandIds?: string,
    @Query('modelIds') modelIds?: string,
    @Query('priceMin') priceMin?: string,
    @Query('priceMax') priceMax?: string,
    @Query('conditions') conditions?: string,
    @Query('cityIds') cityIds?: string,
    @Query('verifiedOnly') verifiedOnly?: string,
    @Query('hasImages') hasImages?: string,
    @Query('sortBy') sortBy?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const filters = {
      query,
      brandIds: brandIds?.split(','),
      modelIds: modelIds?.split(','),
      priceRange: priceMin || priceMax ? {
        min: priceMin ? parseFloat(priceMin) : undefined,
        max: priceMax ? parseFloat(priceMax) : undefined,
      } : undefined,
      conditions: conditions?.split(','),
      cityIds: cityIds?.split(','),
      verifiedOnly: verifiedOnly === 'true',
      hasImages: hasImages === 'true',
      sortBy: sortBy as any,
    };

    return this.advancedSearchService.advancedSearch(
      filters,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20
    );
  }
}
