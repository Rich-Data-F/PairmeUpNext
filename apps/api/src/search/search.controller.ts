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
  ) {}

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
      // Return suggestions based on query
      const brands = await this.searchService['prisma'].brand.findMany({
        where: { name: { contains: query, mode: 'insensitive' } },
        select: { name: true },
        take: 5,
      });

      const models = await this.searchService['prisma'].model.findMany({
        where: { name: { contains: query, mode: 'insensitive' } },
        select: { name: true },
        take: 5,
      });

      return {
        suggestions: [
          ...brands.map(b => b.name),
          ...models.map(m => m.name),
        ].slice(0, 8),
      };
    }

    // Return popular and trending searches
    const [popular, trending] = await Promise.all([
      this.searchService.getPopularSearches(),
      this.searchService.getTrendingSearches(),
    ]);

    return {
      popular,
      trending,
    };
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
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Maximum results' })
  @ApiResponse({ status: 200, description: 'City suggestions' })
  async autocompleteCities(@Query('q') query: string, @Query('limit') limit?: string) {
    if (!query || query.length < 2) {
      return { cities: [] };
    }

    const cityLimit = limit ? parseInt(limit) : 10;
    
    // Use the geo service for city autocomplete
    const geoService = this.searchService['geoService'];
    const cities = await geoService.autocomplete(query, cityLimit);

    return {
      cities: cities.map(city => ({
        id: city.id,
        name: city.name,
        displayName: `${city.name}, ${city.country}`,
        country: city.country,
        countryCode: city.countryCode,
      })),
    };
  }

  @Get('filters')
  @ApiOperation({ summary: 'Get available filter options' })
  @ApiResponse({ status: 200, description: 'Filter options for search' })
  async getFilterOptions() {
    const [brands, popularCities] = await Promise.all([
      this.searchService['prisma'].brand.findMany({
        orderBy: { name: 'asc' },
        select: { id: true, name: true, logo: true },
      }),
      this.searchService['geoService'].getPopularCities(20),
    ]);

    return {
      brands,
      conditions: [
        { value: 'NEW', label: 'New' },
        { value: 'LIKE_NEW', label: 'Like New' },
        { value: 'GOOD', label: 'Good' },
        { value: 'FAIR', label: 'Fair' },
        { value: 'POOR', label: 'Poor' },
      ],
      types: [
        { value: 'LISTING', label: 'For Sale' },
        { value: 'WANTED', label: 'Looking For' },
      ],
      currencies: [
        { value: 'USD', label: 'US Dollar' },
        { value: 'EUR', label: 'Euro' },
        { value: 'GBP', label: 'British Pound' },
        { value: 'CAD', label: 'Canadian Dollar' },
        { value: 'AUD', label: 'Australian Dollar' },
      ],
      popularCities: popularCities.map(city => ({
        id: city.id,
        name: city.name,
        displayName: city.displayName,
        countryCode: city.countryCode,
      })),
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get marketplace statistics' })
  @ApiResponse({ status: 200, description: 'Marketplace statistics' })
  async getMarketplaceStats() {
    const [
      totalListings,
      activeListings,
      totalUsers,
      totalViews,
      topBrands,
      recentActivity,
    ] = await Promise.all([
      this.searchService['prisma'].listing.count(),
      this.searchService['prisma'].listing.count({ where: { status: 'ACTIVE' } }),
      this.searchService['prisma'].user.count(),
      this.searchService['prisma'].listing.aggregate({ _sum: { views: true } }),
      this.searchService['prisma'].brand.findMany({
        orderBy: { Listing: { _count: 'desc' } },
        select: { id: true, name: true, logo: true, _count: { select: { Listing: true } } },
        take: 5,
      }),
      this.searchService['prisma'].listing.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { publishedAt: 'desc' },
        select: {
          id: true,
          title: true,
          price: true,
          currency: true,
          publishedAt: true,
          brand: { select: { name: true } },
          city: { select: { name: true, countryCode: true } },
        },
        take: 10,
      }),
    ]);

    return {
      totalListings,
      activeListings,
      totalUsers,
      totalViews: totalViews._sum.views || 0,
      topBrands,
      recentActivity,
    };
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
