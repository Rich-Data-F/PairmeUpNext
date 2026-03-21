import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import axios, { AxiosInstance } from 'axios';

export interface GeoDBCity {
  id: number;
  name: string;
  country: string;
  countryCode: string;
  region: string;
  regionCode: string;
  latitude: number;
  longitude: number;
  population: number;
  timezone: string;
}

export interface GeoDBResponse {
  data: GeoDBCity[];
  metadata: {
    currentOffset: number;
    totalCount: number;
  };
}

export interface CitySearchParams {
  namePrefix?: string;
  countryIds?: string[];
  minPopulation?: number;
  maxPopulation?: number;
  limit?: number;
  offset?: number;
  sort?: string;
}

@Injectable()
export class GeoService {
  private readonly axiosInstance: AxiosInstance;
  private readonly baseUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.baseUrl = this.configService.get<string>('GEODB_BASE_URL')?.replace('http://', 'https://');
    
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for rate limiting
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Add small delay to respect rate limits
        return new Promise((resolve) => {
          setTimeout(() => resolve(config), 100);
        });
      },
      (error) => Promise.reject(error),
    );

    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        const errorDetails = {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
          configUrl: error.config?.url,
          configBaseUrl: error.config?.baseURL,
        };
        console.error('[GeoService] Detailed API Error:', JSON.stringify(errorDetails, null, 2));

        if (error.response?.status === 429) {
          throw new HttpException('Rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS);
        }
        throw new HttpException(`GeoDB API error: ${error.message}`, HttpStatus.BAD_GATEWAY);
      },
    );
  }

  /**
   * Search cities using GeoDB Cities API
   * @param params Search parameters
   * @returns Promise<GeoDBResponse>
   */
  async searchCities(params: CitySearchParams): Promise<GeoDBResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.namePrefix) {
        queryParams.append('namePrefix', params.namePrefix);
      }
      
      if (params.countryIds && params.countryIds.length > 0) {
        queryParams.append('countryIds', params.countryIds.join(','));
      }
      
      if (params.minPopulation) {
        queryParams.append('minPopulation', params.minPopulation.toString());
      }
      
      if (params.maxPopulation) {
        queryParams.append('maxPopulation', params.maxPopulation.toString());
      }
      
      queryParams.append('limit', (params.limit || 10).toString());
      queryParams.append('offset', (params.offset || 0).toString());
      queryParams.append('sort', params.sort || '-population');

      const response = await this.axiosInstance.get(
        `/v1/geo/cities?${queryParams.toString()}`
      );

      // GeoDB returns data in the response.data object. Double-check shape.
      const rawData = response.data;
      if (rawData && rawData.data) {
        return rawData;
      }
      
      // If the response itself is the array (some versions/endpoints)
      if (Array.isArray(rawData)) {
        return { data: rawData, metadata: { currentOffset: 0, totalCount: rawData.length } };
      }

      return { data: [], metadata: { currentOffset: 0, totalCount: 0 } };
    } catch (error) {
      console.error('[GeoService] searchCities error:', error.message);
      throw new HttpException(
        'Failed to search cities',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get city details by GeoDB ID
   * @param geoDbId GeoDB city ID
   * @returns Promise<GeoDBCity>
   */
  async getCityById(geoDbId: number): Promise<GeoDBCity | null> {
    try {
      const response = await this.axiosInstance.get(`/v1/geo/cities/${geoDbId}`);
      return response.data.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      throw new HttpException(
        'Failed to get city details',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Search cities with autocomplete functionality
   * @param query Search query
   * @param limit Maximum results
   * @returns Promise<GeoDBCity[]>
   */
  async autocomplete(query: string, limit: number = 10, countryCode?: string): Promise<GeoDBCity[]> {
    console.log(`[GeoService] Autocomplete for "${query}" (limit: ${limit}, country: ${countryCode})`);
    if (!query || query.length < 2) {
      return [];
    }

    // First check local database for cached cities
    const localCities = await this.findLocalCities(query, limit);
    console.log(`[GeoService] Found ${localCities.length} local hits for "${query}"`);
    
    // If we have enough local results and no country filter is specified, or they match the country filter
    const filteredLocal = countryCode 
      ? localCities.filter(c => c.countryCode.toUpperCase() === countryCode.toUpperCase())
      : localCities;

    if (filteredLocal.length >= limit) {
      return filteredLocal.map(city => this.transformPrismaCityToGeoDBCity(city));
    }

    // If not enough local results, search GeoDB API
    try {
      console.log(`[GeoService] Fetching from external API (minPopulation: 40000)...`);
      const response = await this.searchCities({
        namePrefix: query,
        limit,
        countryIds: countryCode ? [countryCode.toUpperCase()] : undefined,
        minPopulation: 40000, 
      });

      console.log(`[GeoService] External API returned ${response.data.length} results`);
      // Cache the results in local database
      await this.cacheCities(response.data);

      return response.data;
    } catch (error) {
      console.error(`[GeoService] External autocomplete failed:`, error.message);
      // Fallback to local results if API fails
      return filteredLocal.map(city => this.transformPrismaCityToGeoDBCity(city));
    }
  }

  /**
   * Find cities in local database
   * @param query Search query
   * @param limit Maximum results
   * @returns Promise<City[]>
   */
  private async findLocalCities(query: string, limit: number) {
    return this.prisma.city.findMany({
      where: {
        searchText: {
          contains: query.toLowerCase(),
        },
      },
      orderBy: [
        { population: 'desc' },
        { name: 'asc' },
      ],
      take: limit,
    });
  }

  /**
   * Cache cities in local database
   * @param cities Cities to cache
   */
  private async cacheCities(cities: GeoDBCity[]): Promise<void> {
    for (const city of cities) {
      try {
        await this.prisma.city.upsert({
          where: { geoDbId: city.id },
          update: {
            name: city.name,
            country: city.country,
            countryCode: city.countryCode,
            region: city.region,
            regionCode: city.regionCode,
            latitude: city.latitude,
            longitude: city.longitude,
            population: city.population,
            timezone: city.timezone,
            displayName: this.formatDisplayName(city),
            searchText: this.formatSearchText(city),
            updatedAt: new Date(),
          },
          create: {
            geoDbId: city.id,
            name: city.name,
            country: city.country,
            countryCode: city.countryCode,
            region: city.region,
            regionCode: city.regionCode,
            latitude: city.latitude,
            longitude: city.longitude,
            population: city.population,
            timezone: city.timezone,
            displayName: this.formatDisplayName(city),
            searchText: this.formatSearchText(city),
          },
        });
      } catch (error) {
        // Continue with other cities if one fails
        console.error(`Failed to cache city ${city.name}:`, error);
      }
    }
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   * @param lat1 Latitude of first point
   * @param lon1 Longitude of first point
   * @param lat2 Latitude of second point
   * @param lon2 Longitude of second point
   * @returns Distance in kilometers
   */
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Find cities within a certain radius of a point
   * @param latitude Center latitude
   * @param longitude Center longitude
   * @param radiusKm Radius in kilometers
   * @param limit Maximum results
   * @returns Promise<City[]>
   */
  async findCitiesNearby(
    latitude: number,
    longitude: number,
    radiusKm: number,
    limit: number = 20,
  ) {
    // Simple bounding box calculation for initial filtering
    const latRange = radiusKm / 111; // Rough conversion: 1 degree ≈ 111km
    const lonRange = radiusKm / (111 * Math.cos(this.toRadians(latitude)));

    const cities = await this.prisma.city.findMany({
      where: {
        latitude: {
          gte: latitude - latRange,
          lte: latitude + latRange,
        },
        longitude: {
          gte: longitude - lonRange,
          lte: longitude + lonRange,
        },
      },
      orderBy: { population: 'desc' },
      take: limit * 2, // Get more to filter by exact distance
    });

    // Filter by exact distance and sort
    return cities
      .map(city => ({
        ...city,
        distance: this.calculateDistance(
          latitude,
          longitude,
          Number(city.latitude),
          Number(city.longitude),
        ),
      }))
      .filter(city => city.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);
  }

  /**
   * Get popular cities (by population)
   * @param limit Maximum results
   * @param countryCode Optional country filter
   * @returns Promise<City[]>
   */
  async getPopularCities(limit: number = 50, countryCode?: string) {
    const where = countryCode ? { countryCode } : {};
    
    return this.prisma.city.findMany({
      where,
      orderBy: [
        { population: 'desc' },
        { name: 'asc' },
      ],
      take: limit,
    });
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Format display name for city
   */
  private formatDisplayName(city: GeoDBCity): string {
    if (city.countryCode === 'US') {
      return `${city.name}, ${city.regionCode}, USA`;
    }
    return `${city.name}, ${city.country}`;
  }

  /**
   * Format search text for city
   */
  private formatSearchText(city: GeoDBCity): string {
    const parts = [
      city.name,
      city.region,
      city.country,
      city.countryCode,
    ].filter(Boolean);
    
    return parts.join(' ').toLowerCase();
  }

  /**
   * Transform Prisma city to GeoDBCity format
   */
  private transformPrismaCityToGeoDBCity(city: any): GeoDBCity {
    return {
      id: city.geoDbId || 0,
      name: city.name || 'Unknown',
      country: city.country || 'Unknown',
      countryCode: city.countryCode || 'UN',
      region: city.region || '',
      regionCode: city.regionCode || '',
      latitude: Number(city.latitude) || 0,
      longitude: Number(city.longitude) || 0,
      population: city.population || 0,
      timezone: city.timezone || '',
    };
  }

  /**
   * Find nearby locations by city ID and radius
   * @param cityId City ID to search around
   * @param radiusKm Radius in kilometers
   * @returns Promise<City[]>
   */
  async findNearbyLocations(cityId: string, radiusKm: number) {
    const centerCity = await this.prisma.city.findUnique({
      where: { id: cityId },
    });

    if (!centerCity) {
      return [];
    }

    return this.findCitiesNearby(
      Number(centerCity.latitude),
      Number(centerCity.longitude),
      radiusKm,
    );
  }
}
