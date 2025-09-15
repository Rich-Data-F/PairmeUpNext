import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface FacetCounts {
  brands: Array<{ id: string; name: string; count: number }>;
  models: Array<{ id: string; name: string; brandId: string; count: number }>;
  priceRanges: Array<{ range: string; min: number; max: number; count: number }>;
  conditions: Array<{ value: string; count: number }>;
  cities: Array<{ id: string; name: string; count: number }>;
}

export interface SearchFacets {
  brandIds?: string[];
  modelIds?: string[];
  priceMin?: number;
  priceMax?: number;
  conditions?: string[];
  cityIds?: string[];
}

@Injectable()
export class FacetedSearchService {
  constructor(private prisma: PrismaService) {}

  async getFacetCounts(
    query?: string,
    currentFacets: SearchFacets = {},
  ): Promise<FacetCounts> {
    const baseWhere = this.buildBaseWhere(query, currentFacets);

    const [brands, models, conditions, cities] = await Promise.all([
      this.getBrandFacets(baseWhere, currentFacets),
      this.getModelFacets(baseWhere, currentFacets),
      this.getConditionFacets(baseWhere, currentFacets),
      this.getCityFacets(baseWhere, currentFacets),
    ]);

    const priceRanges = await this.getPriceRangeFacets(baseWhere, currentFacets);

    return {
      brands,
      models,
      priceRanges,
      conditions,
      cities,
    };
  }

  private buildBaseWhere(query?: string, facets: SearchFacets = {}) {
    const where: any = {
      status: 'ACTIVE',
      publishedAt: { lte: new Date() },
    };

    // Text search
    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { brand: { name: { contains: query, mode: 'insensitive' } } },
        { model: { name: { contains: query, mode: 'insensitive' } } },
      ];
    }

    // Brand filter
    if (facets.brandIds?.length) {
      where.brandId = { in: facets.brandIds };
    }

    // Model filter
    if (facets.modelIds?.length) {
      where.modelId = { in: facets.modelIds };
    }

    // Price range filter
    if (facets.priceMin !== undefined || facets.priceMax !== undefined) {
      where.price = {};
      if (facets.priceMin !== undefined) {
        where.price.gte = facets.priceMin;
      }
      if (facets.priceMax !== undefined) {
        where.price.lte = facets.priceMax;
      }
    }

    // Condition filter
    if (facets.conditions?.length) {
      where.condition = { in: facets.conditions };
    }

    // City filter
    if (facets.cityIds?.length) {
      where.cityId = { in: facets.cityIds };
    }

    return where;
  }

  private async getBrandFacets(baseWhere: any, currentFacets: SearchFacets) {
    const where = { ...baseWhere };
    // Remove brand filter to get all available brands
    delete where.brandId;

    const brandCounts = await this.prisma.listing.groupBy({
      by: ['brandId'],
      where,
      _count: { brandId: true },
      orderBy: { _count: { brandId: 'desc' } },
      take: 20,
    });

    const brandIds = brandCounts.map(b => b.brandId);
    const brands = await this.prisma.brand.findMany({
      where: { id: { in: brandIds } },
      select: { id: true, name: true },
    });

    return brandCounts.map(count => {
      const brand = brands.find(b => b.id === count.brandId);
      return {
        id: count.brandId,
        name: brand?.name || 'Unknown',
        count: count._count.brandId,
      };
    });
  }

  private async getModelFacets(baseWhere: any, currentFacets: SearchFacets) {
    const where = { ...baseWhere };
    // Remove model filter to get all available models
    delete where.modelId;

    const modelCounts = await this.prisma.listing.groupBy({
      by: ['modelId'],
      where,
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

  private async getPriceRangeFacets(baseWhere: any, currentFacets: SearchFacets) {
    const where = { ...baseWhere };
    delete where.price; // Remove price filter

    const priceRanges = [
      { range: '$0-$50', min: 0, max: 50 },
      { range: '$50-$100', min: 50, max: 100 },
      { range: '$100-$200', min: 100, max: 200 },
      { range: '$200-$500', min: 200, max: 500 },
      { range: '$500+', min: 500, max: 999999 },
    ];

    const results = [];
    for (const range of priceRanges) {
      const rangeWhere = {
        ...where,
        price: {
          gte: range.min,
          lte: range.max,
        },
      };

      const count = await this.prisma.listing.count({ where: rangeWhere });
      if (count > 0) {
        results.push({ 
          range: range.range, 
          min: range.min,
          max: range.max,
          count 
        });
      }
    }

    return results;
  }

  private async getConditionFacets(baseWhere: any, currentFacets: SearchFacets) {
    const where = { ...baseWhere };
    delete where.condition;

    const conditions = await this.prisma.listing.groupBy({
      by: ['condition'],
      where,
      _count: { condition: true },
      orderBy: { condition: 'asc' },
    });

    return conditions.map(item => ({
      value: item.condition,
      count: item._count.condition,
    }));
  }

  private async getCityFacets(baseWhere: any, currentFacets: SearchFacets) {
    const where = { ...baseWhere };
    delete where.cityId;

    const cityCounts = await this.prisma.listing.groupBy({
      by: ['cityId'],
      where,
      _count: { cityId: true },
      orderBy: { _count: { cityId: 'desc' } },
      take: 20,
    });

    const cityIds = cityCounts.map(c => c.cityId);
    const cities = await this.prisma.city.findMany({
      where: { id: { in: cityIds } },
      select: { id: true, name: true },
    });

    return cityCounts.map(count => {
      const city = cities.find(c => c.id === count.cityId);
      return {
        id: count.cityId,
        name: city?.name || 'Unknown',
        count: count._count.cityId,
      };
    });
  }
}
