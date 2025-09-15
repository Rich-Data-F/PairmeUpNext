import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AdvancedSearchFilters {
  // Text search enhancements
  query?: string;
  exactMatch?: boolean;
  searchFields?: ('title' | 'description' | 'brand' | 'model')[];
  
  // Enhanced filtering
  brandIds?: string[];
  modelIds?: string[];
  categories?: string[];
  conditions?: string[];
  ageRange?: { min?: number; max?: number }; // in months
  
  // Price and currency
  priceRange?: { min?: number; max?: number };
  currencies?: string[];
  
  // Location and geographic
  cityIds?: string[];
  countryIds?: string[];
  coordinates?: { lat: number; lng: number; radiusKm: number };
  
  // Quality and verification
  verifiedOnly?: boolean;
  hasImages?: boolean;
  hasVideo?: boolean;
  minRating?: number;
  
  // Temporal filters
  dateRange?: { start?: Date; end?: Date };
  availabilityType?: 'immediate' | 'negotiable' | 'pickup_only';
  
  // Sorting options
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'date_desc' | 'date_asc' | 'distance' | 'popularity';
  
  // Search behavior
  includeInactive?: boolean;
  excludeOwnListings?: string; // userId to exclude
}

export interface SearchAnalytics {
  searchId: string;
  query?: string;
  filters: AdvancedSearchFilters;
  userId?: string;
  timestamp: Date;
  resultsCount: number;
  clickedListingIds?: string[];
  searchDuration: number;
}

export interface SavedSearch {
  id: string;
  userId: string;
  name: string;
  filters: AdvancedSearchFilters;
  alertsEnabled: boolean;
  lastNotificationSent?: Date;
  createdAt: Date;
}

@Injectable()
export class AdvancedSearchService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Enhanced search with advanced filtering and analytics
   */
  async advancedSearch(
    filters: AdvancedSearchFilters,
    page: number = 1,
    limit: number = 20,
    userId?: string
  ) {
    const startTime = Date.now();

    try {
      // Build comprehensive where clause with all filters
      const where: any = {
        status: 'ACTIVE',
        publishedAt: { lte: new Date() },
      };

      // Brand filtering
      if (filters.brandIds && filters.brandIds.length > 0) {
        where.brandId = { in: filters.brandIds };
      }

      // Model filtering
      if (filters.modelIds && filters.modelIds.length > 0) {
        where.modelId = { in: filters.modelIds };
      }

      // Condition filtering
      if (filters.conditions && filters.conditions.length > 0) {
        where.condition = { in: filters.conditions };
      }

      // City filtering
      if (filters.cityIds && filters.cityIds.length > 0) {
        where.cityId = { in: filters.cityIds };
      }

      // Price range filtering
      if (filters.priceRange) {
        where.price = {};
        if (filters.priceRange.min !== undefined) {
          where.price.gte = filters.priceRange.min.toString();
        }
        if (filters.priceRange.max !== undefined) {
          where.price.lte = filters.priceRange.max.toString();
        }
      }

      // Verified only filtering
      if (filters.verifiedOnly) {
        where.isVerified = true;
      }

      // Has images filtering
      if (filters.hasImages) {
        where.images = { not: { equals: [] } };
      }

      // Exclude own listings
      if (filters.excludeOwnListings) {
        where.sellerId = { not: filters.excludeOwnListings };
      }

      // Add text search if query provided
      if (filters.query) {
        where.OR = [
          { title: { contains: filters.query, mode: 'insensitive' } },
          { description: { contains: filters.query, mode: 'insensitive' } },
          { brand: { name: { contains: filters.query, mode: 'insensitive' } } },
          { model: { name: { contains: filters.query, mode: 'insensitive' } } },
        ];
      }

      // Dynamic sorting based on filters.sortBy
      let orderBy: any = { publishedAt: 'desc' }; // default
      
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case 'price_asc':
            orderBy = { price: 'asc' };
            break;
          case 'price_desc':
            orderBy = { price: 'desc' };
            break;
          case 'date_asc':
            orderBy = { publishedAt: 'asc' };
            break;
          case 'date_desc':
            orderBy = { publishedAt: 'desc' };
            break;
          case 'relevance':
          default:
            orderBy = { publishedAt: 'desc' };
            break;
        }
      }
      
      // Execute simple queries
      const skip = (page - 1) * limit;
      const [listings, total] = await Promise.all([
        this.prisma.listing.findMany({
          where,
          include: {
            brand: { select: { id: true, name: true, logo: true } },
            model: { select: { id: true, name: true } },
            city: { select: { id: true, name: true, countryCode: true } },
            seller: {
              select: {
                id: true,
                name: true,
                isVerified: true,
              },
            },
          },
          orderBy,
          skip,
          take: limit,
        }),
        this.prisma.listing.count({ where }),
      ]);

      const searchDuration = Date.now() - startTime;

      // Calculate applied filters count
      let appliedFilters = 0;
      if (filters.query) appliedFilters++;
      if (filters.brandIds?.length) appliedFilters++;
      if (filters.modelIds?.length) appliedFilters++;
      if (filters.conditions?.length) appliedFilters++;
      if (filters.cityIds?.length) appliedFilters++;
      if (filters.priceRange) appliedFilters++;
      if (filters.verifiedOnly) appliedFilters++;
      if (filters.hasImages) appliedFilters++;

      return {
        searchId: this.generateSearchId(),
        listings,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
        aggregations: {
          brands: [],
          models: [],
          conditions: [],
          priceRange: { min: 0, max: 1000 },
          locations: [],
          totalListings: total,
        },
        searchDuration,
        appliedFilters,
      };
    } catch (error) {
      console.error('Advanced search error:', error);
      throw error;
    }
  }

  /**
   * Geographic search with enhanced location features
   */
  async geoSearch(
    coordinates: { lat: number; lng: number },
    radiusKm: number,
    filters: Omit<AdvancedSearchFilters, 'coordinates'> = {},
    page: number = 1,
    limit: number = 20
  ) {
    // Find listings within radius using geographic calculation
    const geoFilters: AdvancedSearchFilters = {
      ...filters,
      coordinates: { ...coordinates, radiusKm },
      sortBy: 'distance', // Default sort by distance for geo search
    };

    return this.advancedSearch(geoFilters, page, limit);
  }

  /**
   * Smart autocomplete with context-aware suggestions
   */
  async getSmartAutocomplete(query: string, context?: AdvancedSearchFilters) {
    if (!query || query.length < 2) return { suggestions: [] };

    const suggestions = await Promise.all([
      this.getBrandSuggestions(query, context),
      this.getModelSuggestions(query, context),
      this.getProductSuggestions(query, context),
      this.getLocationSuggestions(query, context),
      this.getPopularTermSuggestions(query, context),
    ]);

    const combinedSuggestions = suggestions
      .flat()
      .filter((item, index, arr) => 
        arr.findIndex(i => i.text === item.text) === index
      )
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    return {
      suggestions: combinedSuggestions,
      categories: this.categorizeSuggestions(combinedSuggestions),
    };
  }

  /**
   * Save search with alert capabilities
   */
  async saveSearch(
    userId: string,
    name: string,
    filters: AdvancedSearchFilters,
    alertsEnabled: boolean = false
  ): Promise<SavedSearch> {
    // TODO: Implement when SavedSearch model is available
    return {
      id: `saved_${Date.now()}`,
      userId,
      name,
      filters,
      alertsEnabled,
      createdAt: new Date(),
    } as SavedSearch;
  }

  /**
   * Get user's saved searches
   */
  async getSavedSearches(userId: string): Promise<SavedSearch[]> {
    // TODO: Implement when SavedSearch model is available
    return [];
  }

  /**
   * Search performance analytics
   */
  async getSearchAnalytics(timeframe: 'day' | 'week' | 'month' = 'week') {
    // TODO: Implement when SearchAnalytics model is available
    return {
      totalSearches: 0,
      avgResultsCount: 0,
      avgSearchDuration: 0,
      popularQueries: [],
      searchesByDay: [],
      zeroResultSearches: 0,
    };
  }

  // Private helper methods

  private async buildAdvancedWhereClause(filters: AdvancedSearchFilters, userId?: string) {
    const where: any = {
      status: filters.includeInactive ? undefined : 'ACTIVE',
      publishedAt: { lte: new Date() },
    };

    // Exclude user's own listings if specified
    if (filters.excludeOwnListings && userId) {
      where.sellerId = { not: filters.excludeOwnListings };
    }

    // Advanced text search
    if (filters.query) {
      where.AND = where.AND || [];
      where.AND.push(await this.buildTextSearchClause(filters.query, filters));
    }

    // Multi-select filters
    if (filters.brandIds?.length) {
      where.brandId = { in: filters.brandIds };
    }
    if (filters.modelIds?.length) {
      where.modelId = { in: filters.modelIds };
    }
    if (filters.conditions?.length) {
      where.condition = { in: filters.conditions };
    }
    if (filters.currencies?.length) {
      where.currency = { in: filters.currencies };
    }

    // Price range
    if (filters.priceRange) {
      where.price = {};
      if (filters.priceRange.min !== undefined) {
        where.price.gte = filters.priceRange.min;
      }
      if (filters.priceRange.max !== undefined) {
        where.price.lte = filters.priceRange.max;
      }
    }

    // Geographic filtering
    if (filters.coordinates) {
      where.AND = where.AND || [];
      where.AND.push(await this.buildGeoClause(filters.coordinates));
    } else if (filters.cityIds?.length) {
      where.cityId = { in: filters.cityIds };
    }

    // Quality filters
    if (filters.verifiedOnly) {
      where.isVerified = true;
    }
    if (filters.hasImages) {
      where.images = { some: {} };
    }
    if (filters.minRating) {
      where.seller = {
        averageRating: { gte: filters.minRating },
      };
    }

    // Date range
    if (filters.dateRange) {
      where.publishedAt = {};
      if (filters.dateRange.start) {
        where.publishedAt.gte = filters.dateRange.start;
      }
      if (filters.dateRange.end) {
        where.publishedAt.lte = filters.dateRange.end;
      }
    }

    return where;
  }

  private async buildTextSearchClause(query: string, filters: AdvancedSearchFilters) {
    const searchFields = filters.searchFields || ['title', 'description', 'brand', 'model'];
    const searchMode = filters.exactMatch ? 'equals' : 'contains';

    const orClauses = [];

    if (searchFields.includes('title')) {
      orClauses.push({ title: { [searchMode]: query, mode: 'insensitive' } });
    }
    if (searchFields.includes('description')) {
      orClauses.push({ description: { [searchMode]: query, mode: 'insensitive' } });
    }
    if (searchFields.includes('brand')) {
      orClauses.push({ brand: { name: { [searchMode]: query, mode: 'insensitive' } } });
    }
    if (searchFields.includes('model')) {
      orClauses.push({ model: { name: { [searchMode]: query, mode: 'insensitive' } } });
    }

    // Add partial word matching for non-exact searches
    if (!filters.exactMatch) {
      const words = query.split(' ').filter(word => word.length > 2);
      words.forEach(word => {
        orClauses.push({ title: { contains: word, mode: 'insensitive' } });
        orClauses.push({ description: { contains: word, mode: 'insensitive' } });
      });
    }

    return { OR: orClauses };
  }

  private async buildGeoClause(coordinates: { lat: number; lng: number; radiusKm: number }) {
    // Use Prisma raw query for geographic distance calculation
    // This is a simplified version - in production you'd use PostGIS or similar
    const { lat, lng, radiusKm } = coordinates;
    
    return this.prisma.$queryRaw`
      EXISTS (
        SELECT 1 FROM "City" c 
        WHERE c.id = "Listing"."cityId" 
        AND (
          6371 * acos(
            cos(radians(${lat})) * cos(radians(c.latitude)) 
            * cos(radians(c.longitude) - radians(${lng})) 
            + sin(radians(${lat})) * sin(radians(c.latitude))
          )
        ) <= ${radiusKm}
      )
    `;
  }

  private buildAdvancedOrderBy(filters: AdvancedSearchFilters) {
    const sortBy = filters.sortBy || 'relevance';

    switch (sortBy) {
      case 'price_asc':
        return { price: 'asc' as const };
      case 'price_desc':
        return { price: 'desc' as const };
      case 'date_asc':
        return { publishedAt: 'asc' as const };
      case 'date_desc':
        return { publishedAt: 'desc' as const };
      case 'popularity':
        return [
          { views: 'desc' as const },
          { publishedAt: 'desc' as const },
        ];
      case 'distance':
        // For distance sorting, we'd need to calculate distance in the query
        return { publishedAt: 'desc' as const }; // Fallback
      case 'relevance':
      default:
        return [
          { isVerified: 'desc' as const },
          { publishedAt: 'desc' as const },
        ];
    }
  }

  private async getAdvancedListings(where: any, orderBy: any, page: number, limit: number) {
    const skip = (page - 1) * limit;

    return this.prisma.listing.findMany({
      where,
      include: {
        brand: { select: { id: true, name: true, logo: true } },
        model: { select: { id: true, name: true } },
        city: { select: { id: true, name: true, countryCode: true, latitude: true, longitude: true } },
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
      orderBy,
      skip,
      take: limit,
    });
  }

  private async getListingsCount(where: any): Promise<number> {
    return this.prisma.listing.count({ where });
  }

  private async getSearchAggregations(where: any, filters: AdvancedSearchFilters) {
    // Remove applied filters to show all available options
    const baseWhere = { ...where };
    delete baseWhere.brandId;
    delete baseWhere.modelId;
    delete baseWhere.condition;
    delete baseWhere.price;

    const [brands, models, conditions, priceStats, locations] = await Promise.all([
      this.getAvailableBrands(baseWhere),
      this.getAvailableModels(baseWhere, filters.brandIds),
      this.getAvailableConditions(baseWhere),
      this.getPriceStatistics(baseWhere),
      this.getAvailableLocations(baseWhere),
    ]);

    return {
      brands,
      models,
      conditions,
      priceRange: priceStats,
      locations,
      totalListings: await this.getListingsCount(baseWhere),
    };
  }

  private async getAvailableBrands(where: any) {
    const brandCounts = await this.prisma.listing.groupBy({
      by: ['brandId'],
      where,
      _count: { brandId: true },
      orderBy: { _count: { brandId: 'desc' } },
      take: 50,
    });

    const brandIds = brandCounts.map(b => b.brandId);
    const brands = await this.prisma.brand.findMany({
      where: { id: { in: brandIds } },
      select: { id: true, name: true, logo: true },
    });

    return brandCounts.map(count => ({
      id: count.brandId,
      name: brands.find(b => b.id === count.brandId)?.name || 'Unknown',
      logo: brands.find(b => b.id === count.brandId)?.logo,
      count: count._count.brandId,
    }));
  }

  private async getAvailableModels(where: any, brandIds?: string[]) {
    const modelWhere = brandIds?.length ? { ...where, brandId: { in: brandIds } } : where;
    
    const modelCounts = await this.prisma.listing.groupBy({
      by: ['modelId'],
      where: modelWhere,
      _count: { modelId: true },
      orderBy: { _count: { modelId: 'desc' } },
      take: 50,
    });

    const modelIds = modelCounts.map(m => m.modelId);
    const models = await this.prisma.model.findMany({
      where: { id: { in: modelIds } },
      select: { id: true, name: true, brandId: true },
    });

    return modelCounts.map(count => ({
      id: count.modelId,
      name: models.find(m => m.id === count.modelId)?.name || 'Unknown',
      brandId: models.find(m => m.id === count.modelId)?.brandId,
      count: count._count.modelId,
    }));
  }

  private async getAvailableConditions(where: any) {
    return this.prisma.listing.groupBy({
      by: ['condition'],
      where,
      _count: { condition: true },
      orderBy: { condition: 'asc' },
    });
  }

  private async getPriceStatistics(where: any) {
    return this.prisma.listing.aggregate({
      where,
      _min: { price: true },
      _max: { price: true },
      _avg: { price: true },
      _count: { price: true },
    });
  }

  private async getAvailableLocations(where: any) {
    const cityCounts = await this.prisma.listing.groupBy({
      by: ['cityId'],
      where,
      _count: { cityId: true },
      orderBy: { _count: { cityId: 'desc' } },
      take: 30,
    });

    const cityIds = cityCounts.map(c => c.cityId);
    const cities = await this.prisma.city.findMany({
      where: { id: { in: cityIds } },
      select: { id: true, name: true, countryCode: true },
    });

    return cityCounts.map(count => ({
      id: count.cityId,
      name: cities.find(c => c.id === count.cityId)?.name || 'Unknown',
      countryCode: cities.find(c => c.id === count.cityId)?.countryCode,
      count: count._count.cityId,
    }));
  }

  // Autocomplete helper methods
  private async getBrandSuggestions(query: string, context?: AdvancedSearchFilters) {
    const brands = await this.prisma.brand.findMany({
      where: { name: { contains: query, mode: 'insensitive' } },
      select: { id: true, name: true, logo: true },
      take: 5,
    });

    return brands.map(brand => ({
      text: brand.name,
      type: 'brand',
      id: brand.id,
      icon: brand.logo,
      score: 0.8,
    }));
  }

  private async getModelSuggestions(query: string, context?: AdvancedSearchFilters) {
    const where: any = { name: { contains: query, mode: 'insensitive' } };
    if (context?.brandIds?.length) {
      where.brandId = { in: context.brandIds };
    }

    const models = await this.prisma.model.findMany({
      where,
      include: { brand: { select: { name: true } } },
      take: 5,
    });

    return models.map(model => ({
      text: `${model.brand.name} ${model.name}`,
      type: 'model',
      id: model.id,
      score: 0.9,
    }));
  }

  private async getProductSuggestions(query: string, context?: AdvancedSearchFilters) {
    // Get suggestions from listing titles
    const listings = await this.prisma.listing.findMany({
      where: { title: { contains: query, mode: 'insensitive' } },
      select: { title: true },
      take: 5,
    });

    return listings.map(listing => ({
      text: listing.title,
      type: 'product',
      score: 0.7,
    }));
  }

  private async getLocationSuggestions(query: string, context?: AdvancedSearchFilters) {
    const cities = await this.prisma.city.findMany({
      where: { name: { contains: query, mode: 'insensitive' } },
      select: { id: true, name: true, countryCode: true },
      take: 5,
    });

    return cities.map(city => ({
      text: `${city.name}, ${city.countryCode}`,
      type: 'location',
      id: city.id,
      score: 0.6,
    }));
  }

  private async getPopularTermSuggestions(query: string, context?: AdvancedSearchFilters) {
    // This would typically come from search analytics
    const popularTerms = [
      'charging case', 'left earbud', 'right earbud', 'replacement',
      'new', 'sealed', 'like new', 'wireless', 'bluetooth'
    ];

    return popularTerms
      .filter(term => term.toLowerCase().includes(query.toLowerCase()))
      .map(term => ({
        text: term,
        type: 'term',
        score: 0.5,
      }));
  }

  private categorizeSuggestions(suggestions: any[]) {
    const categories: any = {};
    suggestions.forEach(suggestion => {
      if (!categories[suggestion.type]) {
        categories[suggestion.type] = [];
      }
      categories[suggestion.type].push(suggestion);
    });
    return categories;
  }

  // Analytics helper methods
  private generateSearchId(): string {
    return `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async trackSearchAnalytics(analytics: SearchAnalytics) {
    try {
      // TODO: Implement when SearchAnalytics model is available
      console.log('Search analytics:', analytics.searchId, analytics.resultsCount);
    } catch (error) {
      console.error('Failed to track search analytics:', error);
    }
  }

  private getAppliedFiltersCount(filters: AdvancedSearchFilters): number {
    let count = 0;
    if (filters.query) count++;
    if (filters.brandIds?.length) count++;
    if (filters.modelIds?.length) count++;
    if (filters.conditions?.length) count++;
    if (filters.priceRange) count++;
    if (filters.cityIds?.length) count++;
    if (filters.verifiedOnly) count++;
    if (filters.hasImages) count++;
    return count;
  }

  private getAnalyticsStartDate(timeframe: 'day' | 'week' | 'month'): Date {
    const now = new Date();
    switch (timeframe) {
      case 'day':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'month':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  }

  private getPopularQueries(analytics: any[]): { query: string; count: number }[] {
    const queryCounts = analytics.reduce((acc, a) => {
      if (a.query) {
        acc[a.query] = (acc[a.query] || 0) + 1;
      }
      return acc;
    }, {});

    return Object.entries(queryCounts)
      .map(([query, count]) => ({ query, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private groupSearchesByDay(analytics: any[]) {
    // Group analytics by day for trending analysis
    const dayGroups = analytics.reduce((acc, a) => {
      const day = a.timestamp.toISOString().split('T')[0];
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(dayGroups).map(([date, count]) => ({ date, count }));
  }
}
