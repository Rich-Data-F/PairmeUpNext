import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GeoService } from '../common/services/geo.service';
import { ListingQueryDto } from '../listings/dto/listing.dto';

// Define the types locally until Prisma client is properly generated
type ListingType = 'LISTING' | 'WANTED';
type Condition = 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'POOR';

export interface SearchFilters {
  query?: string;
  brandId?: string;
  modelId?: string;
  type?: ListingType;
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
  ) {}

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
      const searchTerms = filters.query.split(' ').filter(term => term.length > 2);
      where.OR = [
        { title: { contains: filters.query, mode: 'insensitive' } },
        { description: { contains: filters.query, mode: 'insensitive' } },
        { brand: { name: { contains: filters.query, mode: 'insensitive' } } },
        { model: { name: { contains: filters.query, mode: 'insensitive' } } },
        ...searchTerms.map(term => ({
          OR: [
            { title: { contains: term, mode: 'insensitive' } },
            { description: { contains: term, mode: 'insensitive' } },
          ]
        }))
      ];
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
      where.NOT = { images: { equals: [] } };
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

  private async getSearchSuggestions(query: string): Promise<string[]> {
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
}
