import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GeoService } from '../common/services/geo.service';
import { ListingQueryDto } from '../listings/dto/listing.dto';
import { Condition } from '@prisma/client';

// ListingType is not exported from Prisma client — define it locally matching the schema enum
type ListingType = 'EARBUD_LEFT' | 'EARBUD_RIGHT' | 'EARBUD_PAIR' | 'CHARGING_CASE' | 'FULL_SET' | 'ACCESSORIES';


export interface SearchFilters {
  query?: string;
  brandId?: string;
  modelId?: string;
  type?: ListingType;
  primaryIntent?: 'SELLING' | 'BUYING' | 'TRADING';
  condition?: Condition[];
  minPrice?: number;
  maxPrice?: number;
  cityId?: string;
  radiusKm?: number;
  currency?: string;
  verifiedOnly?: boolean;
  hasImages?: boolean;
  category?: string;
}

export interface SearchFacets {
  brands: { id: string; name: string; count: number; logo?: string }[];
  models: { id: string; name: string; brandId: string; count: number }[];
  conditions: { condition: Condition; count: number }[];
  priceRanges: { min: number; max: number; count: number }[];
  cities: { id: string; name: string; countryCode: string; count: number }[];
  currencies: { currency: string; count: number }[];
}

export interface SearchResults {
  listings: any[];
  facets: SearchFacets;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  suggestions?: string[];
}

@Injectable()
export class SearchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly geoService: GeoService,
  ) { }

  async searchListings(filters: SearchFilters, page: number = 1, limit: number = 20): Promise<SearchResults> {
    const skip = (page - 1) * limit;

    // Build base where clause
    const where = await this.buildWhereClause(filters);

    // Execute search query with facets
    const [listings, total, facets] = await Promise.all([
      this.getListings(where, skip, limit, filters),
      this.getListingsCount(where),
      this.getFacets(filters),
    ]);

    // Get search suggestions if query provided
    const suggestions = filters.query ? await this.getSearchSuggestions(filters.query) : undefined;

    return {
      listings,
      facets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      suggestions,
    };
  }

  private async buildWhereClause(filters: SearchFilters): Promise<any> {
    const where: any = {
      status: 'ACTIVE',
      publishedAt: { lte: new Date() },
    };

    // Text search
    if (filters.query) {
      const searchTerms = filters.query.trim().split(/\s+/).filter(term => term.length > 2);
      
      const exactMatchOr = [
        { title: { contains: filters.query, mode: 'insensitive' } },
        { description: { contains: filters.query, mode: 'insensitive' } },
        { brand: { name: { contains: filters.query, mode: 'insensitive' } } },
        { model: { name: { contains: filters.query, mode: 'insensitive' } } },
      ];

      // If there are multiple words, require ALL words to be found somewhere (AND)
      if (searchTerms.length > 1) {
        const allTermsMatchAnd = {
          AND: searchTerms.map(term => ({
            OR: [
              { title: { contains: term, mode: 'insensitive' } },
              { description: { contains: term, mode: 'insensitive' } },
              { brand: { name: { contains: term, mode: 'insensitive' } } },
              { model: { name: { contains: term, mode: 'insensitive' } } },
            ]
          }))
        };
        where.OR = [...exactMatchOr, allTermsMatchAnd];
      } else {
        where.OR = exactMatchOr;
      }
    }

    // Brand filter
    if (filters.brandId) {
      where.brandId = filters.brandId;
    }

    // Model filter
    if (filters.modelId) {
      where.modelId = filters.modelId;
    }

    // Type filter
    if (filters.type) {
      where.type = filters.type;
    }

    // Intent (BUYING vs SELLING) naturally integrating Lost objects
    if (filters.primaryIntent) {
      where.primaryIntent = filters.primaryIntent;
    }

    // Condition filter
    if (filters.condition && filters.condition.length > 0) {
      where.condition = { in: filters.condition };
    }

    // Price range filter
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) where.price.gte = filters.minPrice;
      if (filters.maxPrice !== undefined) where.price.lte = filters.maxPrice;
    }

    // Currency filter
    if (filters.currency) {
      where.currency = filters.currency;
    }

    // Verification filter
    if (filters.verifiedOnly) {
      where.isVerified = true;
    }

    // Images filter
    if (filters.hasImages) {
      where.OR = [
        { images: { isEmpty: false } }, // Error: Prisma does not support isEmpty for arrays in postgres always 
        // Actually, for PostgreSQL String[]:
        { NOT: { images: { equals: [] } } },
        { files: { some: {} } }
      ];
    }

    // Location filter with radius
    if (filters.cityId) {
      if (filters.radiusKm) {
        const nearbyCities = await this.geoService.findNearbyLocations(filters.cityId, filters.radiusKm);
        const cityIds = [filters.cityId, ...nearbyCities.map(city => city.id)];
        where.cityId = { in: cityIds };
      } else {
        where.cityId = filters.cityId;
      }
    }

    return where;
  }

  private async getListings(where: any, skip: number, limit: number, filters: SearchFilters) {
    const orderBy = this.buildOrderBy(filters);

    return this.prisma.listing.findMany({
      where,
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
      orderBy,
      skip,
      take: limit,
    });
  }

  private async getListingsCount(where: any): Promise<number> {
    return this.prisma.listing.count({ where });
  }

  private buildOrderBy(filters: SearchFilters) {
    // Default to relevance for text search, otherwise by date
    if (filters.query) {
      return [
        { isVerified: 'desc' as const }, // Verified listings first
        { publishedAt: 'desc' as const }, // Then by recency
      ];
    }

    return { publishedAt: 'desc' as const };
  }

  private async getFacets(filters: SearchFilters): Promise<SearchFacets> {
    // Create a simplified where clause without joins for facet counting
    const baseWhere: any = {
      status: 'ACTIVE',
      publishedAt: { lte: new Date() },
    };

    // Add non-join filters
    if (filters.query) {
      baseWhere.OR = [
        { title: { contains: filters.query, mode: 'insensitive' } },
        { description: { contains: filters.query, mode: 'insensitive' } },
      ];
    }

    if (filters.type) baseWhere.type = filters.type;
    if (filters.verifiedOnly) baseWhere.isVerified = true;
    if (filters.hasImages) baseWhere.NOT = { images: { equals: [] } };
    if (filters.currency) baseWhere.currency = filters.currency;

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      baseWhere.price = {};
      if (filters.minPrice !== undefined) baseWhere.price.gte = filters.minPrice;
      if (filters.maxPrice !== undefined) baseWhere.price.lte = filters.maxPrice;
    }

    if (filters.cityId) baseWhere.cityId = filters.cityId;

    const [brands, models, conditions, priceRanges, cities, currencies] = await Promise.all([
      this.getBrandFacets(baseWhere),
      this.getModelFacets(baseWhere, filters.brandId),
      this.getConditionFacets(baseWhere),
      this.getPriceRangeFacets(baseWhere),
      this.getCityFacets(baseWhere),
      this.getCurrencyFacets(baseWhere),
    ]);

    return {
      brands,
      models,
      conditions,
      priceRanges,
      cities,
      currencies,
    };
  }

  private async getBrandFacets(baseWhere: any) {
    const brandCounts = await this.prisma.listing.groupBy({
      by: ['brandId'],
      where: baseWhere,
      _count: { brandId: true },
      orderBy: { _count: { brandId: 'desc' } },
      take: 20,
    });

    const brandIds = brandCounts.map(b => b.brandId);
    const brands = await this.prisma.brand.findMany({
      where: { id: { in: brandIds } },
      select: { id: true, name: true, logo: true },
    });

    return brandCounts.map(count => {
      const brand = brands.find(b => b.id === count.brandId);
      return {
        id: count.brandId,
        name: brand?.name || 'Unknown',
        count: count._count.brandId,
        logo: brand?.logo,
      };
    });
  }

  private async getModelFacets(baseWhere: any, brandId?: string) {
    const modelWhere = brandId ? { ...baseWhere, brandId } : baseWhere;

    const modelCounts = await this.prisma.listing.groupBy({
      by: ['modelId'],
      where: modelWhere,
      _count: { modelId: true },
      orderBy: { _count: { modelId: 'desc' } },
      take: 20,
    });

    const modelIds = modelCounts.map(m => m.modelId);
    const models = await this.prisma.model.findMany({
      where: { id: { in: modelIds } },
      select: { id: true, name: true, brandId: true },
    });

    return modelCounts.map(count => {
      const model = models.find(m => m.id === count.modelId);
      return {
        id: count.modelId,
        name: model?.name || 'Unknown',
        brandId: model?.brandId || '',
        count: count._count.modelId,
      };
    });
  }

  private async getConditionFacets(baseWhere: any) {
    const conditionCounts = await this.prisma.listing.groupBy({
      by: ['condition'],
      where: baseWhere,
      _count: { condition: true },
      orderBy: { condition: 'asc' },
    });

    return conditionCounts.map(count => ({
      condition: count.condition as Condition,
      count: count._count.condition,
    }));
  }

  private async getPriceRangeFacets(baseWhere: any) {
    const priceStats = await this.prisma.listing.aggregate({
      where: baseWhere,
      _min: { price: true },
      _max: { price: true },
    });

    const min = Number(priceStats._min.price) || 0;
    const max = Number(priceStats._max.price) || 1000;
    const range = max - min;
    const bucketSize = range / 5; // 5 price ranges

    const ranges = [];
    for (let i = 0; i < 5; i++) {
      const rangeMin = min + (i * bucketSize);
      const rangeMax = i === 4 ? max : min + ((i + 1) * bucketSize);

      const count = await this.prisma.listing.count({
        where: {
          ...baseWhere,
          price: { gte: rangeMin, lte: rangeMax },
        },
      });

      if (count > 0) {
        ranges.push({
          min: Math.round(rangeMin),
          max: Math.round(rangeMax),
          count,
        });
      }
    }

    return ranges;
  }

  private async getCityFacets(baseWhere: any) {
    const cityCounts = await this.prisma.listing.groupBy({
      by: ['cityId'],
      where: baseWhere,
      _count: { cityId: true },
      orderBy: { _count: { cityId: 'desc' } },
      take: 20,
    });

    const cityIds = cityCounts.map(c => c.cityId);
    const cities = await this.prisma.city.findMany({
      where: { id: { in: cityIds } },
      select: { id: true, name: true, countryCode: true },
    });

    return cityCounts.map(count => {
      const city = cities.find(c => c.id === count.cityId);
      return {
        id: count.cityId,
        name: city?.name || 'Unknown',
        countryCode: city?.countryCode || '',
        count: count._count.cityId,
      };
    });
  }

  private async getCurrencyFacets(baseWhere: any) {
    const currencyCounts = await this.prisma.listing.groupBy({
      by: ['currency'],
      where: baseWhere,
      _count: { currency: true },
      orderBy: { _count: { currency: 'desc' } },
    });

    return currencyCounts.map(count => ({
      currency: count.currency,
      count: count._count.currency,
    }));
  }

  async getSearchSuggestions(query: string): Promise<string[]> {
    const suggestions = new Set<string>();

    // Brand name suggestions
    const brands = await this.prisma.brand.findMany({
      where: { name: { contains: query, mode: 'insensitive' } },
      select: { name: true },
      take: 5,
    });
    brands.forEach(brand => suggestions.add(brand.name));

    // Model name suggestions
    const models = await this.prisma.model.findMany({
      where: { name: { contains: query, mode: 'insensitive' } },
      select: { name: true },
      take: 5,
    });
    models.forEach(model => suggestions.add(model.name));

    // Popular search terms from listing titles
    const listings = await this.prisma.listing.findMany({
      where: { title: { contains: query, mode: 'insensitive' } },
      select: { title: true },
      take: 10,
    });

    // Extract relevant keywords from titles
    listings.forEach(listing => {
      const words = listing.title.toLowerCase().split(' ');
      words.forEach(word => {
        if (word.includes(query.toLowerCase()) && word.length > 3) {
          suggestions.add(word);
        }
      });
    });

    return Array.from(suggestions).slice(0, 8);
  }

  async getPopularSearches(): Promise<string[]> {
    // Get popular brands
    const popularBrands = await this.prisma.brand.findMany({
      orderBy: { Listing: { _count: 'desc' } },
      select: { name: true },
      take: 5,
    });

    // Common search terms
    const commonTerms = ['AirPods', 'Galaxy Buds', 'Charging Case', 'Left Earbud', 'Right Earbud'];

    return [
      ...popularBrands.map(b => b.name),
      ...commonTerms,
    ];
  }

  async getFeaturedListings(limit: number = 12) {
    return this.prisma.listing.findMany({
      where: {
        status: 'ACTIVE',
        publishedAt: { lte: new Date() },
        isVerified: true,
      },
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
      orderBy: [
        { views: 'desc' },
        { publishedAt: 'desc' },
      ],
      take: limit,
    });
  }


  /**
   * City autocomplete — checks local DB first, then falls back to GeoDB API.
   * Centralised here so the controller doesn't need to access private properties.
   */
  async autocompleteCities(query: string, limit: number = 10, countryCode?: string) {
    const where: any = { searchText: { contains: query.toLowerCase() } };
    if (countryCode) {
      where.countryCode = countryCode.toUpperCase();
    }

    // 1. Get local cities
    const localCities = await this.prisma.city.findMany({
      where,
      orderBy: [{ population: 'desc' }, { name: 'asc' }],
      take: limit,
    });

    const results = localCities.map(city => ({
      id: city.id,
      name: city.name,
      displayName: city.displayName,
      country: city.country,
      countryCode: city.countryCode,
      geoDbId: city.geoDbId,
    }));

    // 2. If we have few results or the query is specific, check GeoDB
    if (results.length < limit) {
      try {
        const geoCities = await this.geoService.autocomplete(query, limit, countryCode);
        
        // Merge and de-duplicate by GeoDB ID
        for (const geoCity of geoCities) {
          if (!results.find(r => r.geoDbId === geoCity.id)) {
            results.push({
              id: geoCity.id.toString(),
              name: geoCity.name,
              displayName: `${geoCity.name}, ${geoCity.country}`,
              country: geoCity.country,
              countryCode: geoCity.countryCode,
              geoDbId: geoCity.id,
            });
          }
          if (results.length >= limit) break;
        }
      } catch (err) {
        console.error('External city autocomplete failed:', err);
      }
    }

    return results;
  }

  async getTrendingSearches(): Promise<string[]> {
    // This would typically come from analytics data
    // For now, return mock trending searches
    return [
      'AirPods Pro',
      'Galaxy Buds2',
      'Sony WF-1000XM4',
      'Charging case',
      'Left earbud replacement',
    ];
  }

  /**
   * Returns all filter options (brands, conditions, types, currencies, popular cities)
   * used to populate the search filter panel.
   * Moved here from the controller to avoid private-property access anti-pattern.
   */
  async getFilterOptions() {
    const [brands, popularCities] = await Promise.all([
      this.prisma.brand.findMany({
        where: { isActive: true, status: { in: ['APPROVED', 'SYSTEM'] } },
        orderBy: { name: 'asc' },
        select: { id: true, name: true, logo: true },
      }),
      this.geoService.getPopularCities(20),
    ]);

    return {
      brands,
      conditions: [
        { value: 'NEW', label: 'New' },
        { value: 'LIKE_NEW', label: 'Like New' },
        { value: 'GOOD', label: 'Good' },
        { value: 'FAIR', label: 'Fair' },
        { value: 'PARTS_ONLY', label: 'Parts Only' },
      ],
      types: [
        { value: 'EARBUD_LEFT', label: 'Left Earbud' },
        { value: 'EARBUD_RIGHT', label: 'Right Earbud' },
        { value: 'EARBUD_PAIR', label: 'Earbud Pair' },
        { value: 'CHARGING_CASE', label: 'Charging Case' },
        { value: 'FULL_SET', label: 'Full Set' },
        { value: 'ACCESSORIES', label: 'Accessories' },
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

  /**
   * Returns aggregate marketplace statistics.
   * Moved here from the controller to avoid private-property access anti-pattern.
   */
  async getMarketplaceStats() {
    const [
      totalListings,
      activeListings,
      totalUsers,
      totalViews,
      topBrands,
      recentActivity,
    ] = await Promise.all([
      this.prisma.listing.count(),
      this.prisma.listing.count({ where: { status: 'ACTIVE' } }),
      this.prisma.user.count(),
      this.prisma.listing.aggregate({ _sum: { views: true } }),
      this.prisma.brand.findMany({
        where: { isActive: true },
        orderBy: { Listing: { _count: 'desc' } },
        select: { id: true, name: true, logo: true, _count: { select: { Listing: true } } },
        take: 5,
      }),
      this.prisma.listing.findMany({
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
}
