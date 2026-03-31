import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IdentifierService } from '../common/services/identifier.service';
import { UploadService } from '../common/services/upload.service';
import { GeoService } from '../common/services/geo.service';
import { CreateListingDto, UpdateListingDto, ListingQueryDto, BulkUpdateListingDto } from './dto/listing.dto';
import { ListingType, Condition, ListingStatus, Prisma } from '@prisma/client';

@Injectable()
export class ListingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly identifierService: IdentifierService,
    private readonly uploadService: UploadService,
    private readonly geoService: GeoService,
  ) { }

  async create(sellerId: string, createListingDto: CreateListingDto) {
    // Validate that sellerId is provided
    if (!sellerId) {
      throw new BadRequestException('User authentication required to create a listing');
    }

    const {
      brandId,
      modelId,
      customBrand,
      customModel,
      cityId,
      serialNumber,
      images = [],
      verificationPhoto,
      ...listingData
    } = createListingDto;

    let finalBrandId = brandId;
    let finalModelId = modelId;

    // Handle custom brand
    if (customBrand && !brandId) {
      // 1. Check if ANY brand (official or temp) already exists with this name
      const existingBrand = await this.prisma.brand.findFirst({
        where: { name: { equals: customBrand, mode: 'insensitive' } }
      });

      if (existingBrand) {
        finalBrandId = existingBrand.id;
      } else {
        // 2. Check if a proposed brand with this name already exists
        const existingProposedBrand = await this.prisma.proposedBrand.findFirst({
          where: { name: { equals: customBrand, mode: 'insensitive' } },
        });

        let proposedBrand = existingProposedBrand;
        if (!proposedBrand) {
          // Create a proposed brand
          proposedBrand = await this.prisma.proposedBrand.create({
            data: {
              name: customBrand,
              submittedBy: sellerId,
              submissionNote: `Proposed brand from listing creation`,
            },
          });
        }

        // 3. Create a temporary brand entry for the listing
        const tempBrand = await this.prisma.brand.create({
          data: {
            name: customBrand,
            slug: `temp-${proposedBrand.id}`,
            status: 'PENDING',
            submittedBy: sellerId,
          },
        });
        finalBrandId = tempBrand.id;
      }
    }

    // Handle custom model
    if (customModel && !modelId) {
      // 1. Check if ANY model (official or temp) already exists with this name for this brand
      const existingModel = await this.prisma.model.findFirst({
        where: { 
          name: { equals: customModel, mode: 'insensitive' },
          brandId: finalBrandId
        }
      });

      if (existingModel) {
        finalModelId = existingModel.id;
      } else {
        // 2. Check if a proposed model with this name and brand already exists
        const existingProposedModel = await this.prisma.proposedModel.findFirst({
          where: {
            name: { equals: customModel, mode: 'insensitive' },
            brandId: finalBrandId
          },
        });

        let proposedModel = existingProposedModel;
        if (!proposedModel) {
          // Create a proposed model
          proposedModel = await this.prisma.proposedModel.create({
            data: {
              name: customModel,
              brandId: finalBrandId,
              submittedBy: sellerId,
              submissionNote: `Proposed model from listing creation`,
            },
          });
        }

        // 3. Create a temporary model entry for the listing
        const tempModel = await this.prisma.model.create({
          data: {
            name: customModel,
            slug: `temp-${proposedModel.id}`,
            brandId: finalBrandId,
            status: 'PENDING',
            submittedBy: sellerId,
          },
        });
        finalModelId = tempModel.id;
      }
    }

    // Verify brand and model exist (for canonical entries)
    if (!customBrand) {
      const brand = await this.prisma.brand.findUnique({ where: { id: finalBrandId } });
      if (!brand) {
        throw new BadRequestException('Brand not found');
      }
    }

    if (!customModel) {
      const model = await this.prisma.model.findUnique({ where: { id: finalModelId } });
      if (!model || model.brandId !== finalBrandId) {
        throw new BadRequestException('Model not found or does not belong to the specified brand');
      }
    }

    // Verify or create city JIT (Just-in-time)
    let finalCityId = cityId;
    
    const inferCountryCodeFromHint = (hint?: string) => {
      if (!hint) return undefined;
      const normalized = hint.trim().toLowerCase();

      if (/^[a-z]{2}$/i.test(normalized)) return normalized.toUpperCase();

      const countryNameToCode: Record<string, string> = {
        france: 'FR',
        'united states': 'US',
        usa: 'US',
        'united kingdom': 'GB',
        uk: 'GB',
        germany: 'DE',
        canada: 'CA',
        spain: 'ES',
        italy: 'IT',
        netherlands: 'NL',
        belgium: 'BE',
        switzerland: 'CH',
      };

      return countryNameToCode[normalized];
    };

    const resolveExternalGeoCity = async (cityName: string, countryHint?: string) => {
      const countryCode = inferCountryCodeFromHint(countryHint);
      const response = await this.geoService.searchCities({
        namePrefix: cityName,
        limit: 5,
        countryIds: countryCode ? [countryCode] : undefined,
        minPopulation: 5000,
        sort: '-population',
      });

      const exact = response.data.find(
        (candidate) => candidate.name.toLowerCase() === cityName.toLowerCase()
      );

      return exact || response.data[0] || null;
    };

    const upsertGeoCity = async (geoCity: any) => {
      return this.prisma.city.upsert({
        where: { geoDbId: geoCity.id },
        update: {
          name: geoCity.name,
          country: geoCity.country,
          countryCode: geoCity.countryCode,
          region: geoCity.region,
          regionCode: geoCity.regionCode,
          latitude: geoCity.latitude,
          longitude: geoCity.longitude,
          population: geoCity.population,
          displayName: `${geoCity.name}, ${geoCity.country}`,
          searchText: geoCity.name.toLowerCase(),
        },
        create: {
          geoDbId: geoCity.id,
          name: geoCity.name,
          country: geoCity.country,
          countryCode: geoCity.countryCode,
          region: geoCity.region,
          regionCode: geoCity.regionCode,
          latitude: geoCity.latitude,
          longitude: geoCity.longitude,
          population: geoCity.population,
          displayName: `${geoCity.name}, ${geoCity.country}`,
          searchText: geoCity.name.toLowerCase(),
        },
      });
    };

    const isNumeric = /^\d+$/.test(cityId || '');

    // Check if the frontend sent a custom city name instead of an ID
    if (cityId && (cityId.startsWith('name:') || cityId.startsWith('temp:'))) {
      const rawCityInput = cityId.substring(cityId.indexOf(':') + 1).trim();
      const cityParts = rawCityInput.split(',').map(part => part.trim()).filter(Boolean);
      const normalizedCityName = cityParts[0] || rawCityInput;
      const countryHint = cityParts.length > 1 ? cityParts[cityParts.length - 1] : undefined;
      
      // Try to find if we already created a manual entry for this name
      const existingManualCity = await this.prisma.city.findFirst({
        where: { name: { equals: normalizedCityName, mode: 'insensitive' }, geoDbId: { lt: 0 } }
      });
      
      let geocodedCity: any = null;

      try {
        geocodedCity = await resolveExternalGeoCity(normalizedCityName, countryHint);
      } catch (err) {
        console.warn('GeoDB external lookup failed for manual city input:', rawCityInput);
      }

      if (geocodedCity) {
        const cachedGeoCity = await upsertGeoCity(geocodedCity);
        finalCityId = cachedGeoCity.id;
      } else if (existingManualCity) {
        finalCityId = existingManualCity.id;
      } else {
        // Create a manual city entry only if geocoding failed
        // We use a negative geoDbId based on a simple hash of the name to satisfy uniqueness
        const nameHash = normalizedCityName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const newCity = await this.prisma.city.create({
          data: {
            name: normalizedCityName,
            displayName: `${normalizedCityName} (Custom)`,
            country: 'Unknown',
            countryCode: 'UN',
            geoDbId: -(1000000 + nameHash + Math.floor(Math.random() * 10000)),
            latitude: 0,
            longitude: 0,
            searchText: normalizedCityName.toLowerCase()
          }
        });
        finalCityId = newCity.id;
      }
    } else {
      const city = await this.prisma.city.findFirst({ 
        where: { 
          OR: [
            { id: cityId },
            { geoDbId: isNumeric ? parseInt(cityId) : undefined }
          ]
        } 
      });

      if (!city) {
        if (isNumeric) {
          const geoDbId = parseInt(cityId);
          let geoCity = null;
          
          // JIT fetch from GeoDB and cache
          try {
            console.log(`[ListingsService] City ${geoDbId} not found locally, attempting JIT fetch...`);
            const geoData = await this.geoService.getCityById(geoDbId);
            if (geoData) {
              geoCity = await this.prisma.city.upsert({
                where: { geoDbId },
                update: {}, // No updates needed
                create: {
                  geoDbId,
                  name: geoData.name,
                  country: geoData.country,
                  countryCode: geoData.countryCode,
                  region: geoData.region,
                  regionCode: geoData.regionCode,
                  latitude: geoData.latitude,
                  longitude: geoData.longitude,
                  population: geoData.population,
                  displayName: this.geoService['formatDisplayName'](geoData),
                  searchText: this.geoService['formatSearchText'](geoData)
                }
              });
            }
          } catch (err) {
            console.error('[ListingsService] JIT City fetch failed:', err.message);
          }
          
          if (geoCity) {
            finalCityId = geoCity.id;
          } else {
            throw new BadRequestException(`City with ID ${cityId} not found and could not be fetched from registry`);
          }
        } else {
          // If the cityId is a string (CUID) but not found in the database
          throw new BadRequestException(`City with ID ${cityId} not found in our database`);
        }
      } else {
        finalCityId = city.id;
      }
    }

    // Encrypt serial number if provided
    let encryptedIdentifier: string | undefined;
    let maskedIdentifier: string | undefined;

    if (serialNumber) {
      encryptedIdentifier = this.identifierService.encrypt(serialNumber);
      maskedIdentifier = this.identifierService.mask(serialNumber);
    }

    // Process images - images are URL strings from the upload service
    const processedImages: string[] = (images && images.length > 0) ? images : [];

    // Process verification photo - already a URL from the upload service
    const processedVerificationPhoto: string | undefined = verificationPhoto;

    // Create listing
    const city = await this.prisma.city.findUnique({ where: { id: finalCityId } });
    if (!city) {
      throw new BadRequestException('Could not resolve city for the listing.');
    }

    const listing = await this.prisma.listing.create({
      data: {
        ...listingData,
        latitude: city.latitude,
        longitude: city.longitude,
        sellerId: sellerId,
        brandId: finalBrandId,
        modelId: finalModelId,
        cityId: finalCityId,
        identifierFull: encryptedIdentifier,
        identifierMasked: maskedIdentifier,
        images: processedImages, // Store URLs as strings
        verificationPhoto: processedVerificationPhoto,
        status: ListingStatus.ACTIVE,
        publishedAt: new Date(),
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
    });

    return this.formatListingResponse(listing);
  }

  async findAll(query: ListingQueryDto) {
    const {
      page = 1,
      limit = 20,
      search,
      brandId,
      modelId,
      type,
      condition,
      minPrice,
      maxPrice,
      cityId,
      radiusKm,
      sortBy = 'publishedAt',
      sortOrder = 'desc',
      currency,
      verifiedOnly = false,
    } = query;

    const skip = (page - 1) * limit;
    const where: any = {
      status: ListingStatus.ACTIVE,
      publishedAt: { lte: new Date() },
    };

    // Search filter
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { brand: { name: { contains: search, mode: 'insensitive' } } },
        { model: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Apply filters
    if (brandId) where.brandId = brandId;
    if (modelId) where.modelId = modelId;
    if (type) where.type = type;
    if (condition) where.condition = condition;
    if (currency) where.currency = currency;
    if (verifiedOnly) where.isVerified = true;

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    // Location filter with radius
    if (cityId) {
      if (radiusKm) {
        // Get nearby cities within radius
        const nearbyCities = await this.geoService.findNearbyLocations(cityId, radiusKm);
        const cityIds = [cityId, ...nearbyCities.map(city => city.id)];
        where.cityId = { in: cityIds };
      } else {
        where.cityId = cityId;
      }
    }

    // Sorting
    const orderBy: any = {};
    if (sortBy === 'price') {
      orderBy.price = sortOrder;
    } else if (sortBy === 'views') {
      orderBy.views = sortOrder;
    } else if (sortBy === 'createdAt') {
      orderBy.createdAt = sortOrder;
    } else {
      orderBy.publishedAt = sortOrder;
    }

    const [listings, total] = await Promise.all([
      this.prisma.listing.findMany({
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
      }),
      this.prisma.listing.count({ where }),
    ]);

    return {
      data: listings.map(listing => this.formatListingResponse(listing)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, sellerId?: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: {
        brand: true,
        model: true,
        city: true,
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            verificationBadge: true,
            trustLevel: true,
            isVerified: true,
          },
        },
      },
    });

    if (!listing || listing.status !== ListingStatus.ACTIVE) {
      throw new NotFoundException('Listing not found');
    }

    // Increment view count (but not for the owner)
    if (sellerId && listing.sellerId !== sellerId) {
      await this.prisma.listing.update({
        where: { id },
        data: { views: { increment: 1 } },
      });
    }

    return this.formatDetailedListingResponse(listing, sellerId);
  }

  async update(id: string, sellerId: string, updateListingDto: UpdateListingDto) {
    console.log(`🔄 [UPDATE] Starting update for listing: ${id}, seller: ${sellerId}`);
    
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      select: { sellerId: true, status: true },
    });

    if (!listing) {
      console.error(`❌ [UPDATE] Listing not found: ${id}`);
      throw new NotFoundException('Listing not found');
    }

    console.log(`📊 [UPDATE] Current listing status: ${listing.status}, seller: ${listing.sellerId}`);

    if (listing.sellerId !== sellerId) {
      console.error(`❌ [UPDATE] Permission denied: user ${sellerId} trying to update listing of user ${listing.sellerId}`);
      throw new ForbiddenException('You can only update your own listings');
    }

    // Allow updates for ACTIVE and DRAFT statuses, but not SUSPENDED
    if (listing.status === ListingStatus.SUSPENDED) {
      console.error(`❌ [UPDATE] Cannot update suspended listing: ${id}`);
      throw new BadRequestException('Cannot update suspended listing. Please contact support.');
    }

    console.log(`✅ [UPDATE] Validation passed, proceeding with update`);

    const { cityId, images, verificationPhoto, brandId, modelId, customBrand, customModel, ...updateData } = updateListingDto;

    // Verify city if provided
    if (cityId) {
      const city = await this.prisma.city.findUnique({ where: { id: cityId } });
      if (!city) {
        console.error(`❌ [UPDATE] City not found: ${cityId}`);
        throw new BadRequestException('City not found');
      }
      console.log(`✅ [UPDATE] City verified: ${cityId}`);
    }

    // Verify brand if provided
    if (brandId) {
      const brand = await this.prisma.brand.findUnique({ where: { id: brandId } });
      if (!brand) {
        console.error(`❌ [UPDATE] Brand not found: ${brandId}`);
        throw new BadRequestException('Brand not found');
      }
      console.log(`✅ [UPDATE] Brand verified: ${brandId}`);
    }

    // Verify model if provided
    if (modelId) {
      const model = await this.prisma.model.findUnique({ where: { id: modelId } });
      if (!model) {
        console.error(`❌ [UPDATE] Model not found: ${modelId}`);
        throw new BadRequestException('Model not found');
      }
      console.log(`✅ [UPDATE] Model verified: ${modelId}`);
    }

    // Process images if provided - keep as URL strings (same format as create)
    let processedImages: string[] | undefined;
    if (images) {
      processedImages = images; // images are already URL strings from the upload service
      console.log(`📸 [UPDATE] Processing ${processedImages.length} images`);
    }

    // Process verification photo if provided - keep as URL string
    const processedVerificationPhoto: string | undefined = verificationPhoto;

    const updatedListing = await this.prisma.listing.update({
      where: { id },
      data: {
        ...updateData,
        cityId,
        brandId,
        modelId,
        customBrand,
        customModel,
        images: processedImages,
        verificationPhoto: processedVerificationPhoto,
        updatedAt: new Date(),
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
    });

    console.log(`✅ [UPDATE] Listing successfully updated: ${id}`);
    return this.formatListingResponse(updatedListing);
  }

  async remove(id: string, sellerId: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      select: { sellerId: true, status: true },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    if (listing.sellerId !== sellerId) {
      throw new ForbiddenException('You can only delete your own listings');
    }

    // Soft delete by updating status
    await this.prisma.listing.update({
      where: { id },
      data: {
        status: ListingStatus.DELETED,
      },
    });

    return { message: 'Listing deleted successfully' };
  }

  async bulkUpdate(sellerId: string, bulkUpdateDto: BulkUpdateListingDto) {
    const { listingIds, status, reason } = bulkUpdateDto;

    // Verify user owns all listings
    const listings = await this.prisma.listing.findMany({
      where: {
        id: { in: listingIds },
        sellerId,
      },
      select: { id: true },
    });

    if (listings.length !== listingIds.length) {
      throw new ForbiddenException('You can only update your own listings');
    }

    // Update listings
    const result = await this.prisma.listing.updateMany({
      where: {
        id: { in: listingIds },
        sellerId,
      },
      data: {
        status: status as ListingStatus,
        updatedAt: new Date(),
      },
    });

    // Note: Activity logging removed since UserActivity model doesn't exist
    // TODO: Implement activity logging when UserActivity model is added

    return {
      message: `${result.count} listings updated successfully`,
      updatedCount: result.count,
    };
  }

  async getUserListings(sellerId: string, query: ListingQueryDto) {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    const where = {
      sellerId,
      status: { not: ListingStatus.DELETED },
    };

    const orderBy: any = {};
    if (sortBy === 'price') {
      orderBy.price = sortOrder;
    } else if (sortBy === 'views') {
      orderBy.views = sortOrder;
    } else if (sortBy === 'publishedAt') {
      orderBy.publishedAt = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    const [listings, total] = await Promise.all([
      this.prisma.listing.findMany({
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
      }),
      this.prisma.listing.count({ where }),
    ]);

    return {
      data: listings.map(listing => this.formatListingResponse(listing)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  private formatListingResponse(listing: any) {
    return {
      id: listing.id,
      title: listing.title,
      description: listing.description,
      type: listing.type,
      condition: listing.condition,
      price: listing.price,
      currency: listing.currency,
      identifierMasked: listing.identifierMasked,
      isVerified: listing.isVerified,
      primaryIntent: listing.primaryIntent,
      openToAlternate: listing.openToAlternate,
      brand: {
        id: listing.brand.id,
        name: listing.brand.name,
        slug: listing.brand.slug,
        logo: listing.brand.logo,
      },
      model: {
        id: listing.model.id,
        name: listing.model.name,
        slug: listing.model.slug,
        image: listing.model.image,
      },
      city: {
        id: listing.city.id,
        name: listing.city.name,
        displayName: listing.city.displayName,
        countryCode: listing.city.countryCode,
        latitude: listing.city.latitude ? parseFloat(listing.city.latitude) : null,
        longitude: listing.city.longitude ? parseFloat(listing.city.longitude) : null,
      },
      seller: {
        id: listing.seller.id,
        name: listing.seller.name,
        verificationBadge: listing.seller.verificationBadge,
        trustLevel: listing.seller.trustLevel,
        isVerified: listing.seller.isVerified,
      },
      images: listing.images || [],
      views: listing.views,
      createdAt: listing.createdAt,
      publishedAt: listing.publishedAt,
      sellerNotes: listing.sellerNotes,
      latitude: listing.latitude ? parseFloat(listing.latitude) : null,
      longitude: listing.longitude ? parseFloat(listing.longitude) : null,
      locationPrecision: listing.locationPrecision,
    };
  }

  private formatDetailedListingResponse(listing: any, requestUserId?: string) {
    const baseResponse = this.formatListingResponse(listing);

    // Additional details for authorized users (owner or authenticated users)
    const isOwner = requestUserId === listing.sellerId;
    const isAuthenticated = !!requestUserId;

    return {
      ...baseResponse,
      images: listing.images || [],
      ...(isAuthenticated && {
        fullDescription: listing.description,
        contactInfo: {
          email: listing.seller.email,
          phone: listing.seller.phoneNumber,
          preferredContact: listing.seller.preferredContact,
        },
      }),
      ...(isOwner && {
        verificationPhoto: listing.verificationPhoto?.fullUrl,
      }),
      location: {
        hideExactLocation: listing.hideExactLocation,
        ...((!listing.hideExactLocation || isOwner) && {
          latitude: listing.latitude,
          longitude: listing.longitude,
          approximate: false,
        }),
        ...(listing.hideExactLocation && !isOwner && {
          latitude: listing.city.latitude,
          longitude: listing.city.longitude,
          approximate: true,
        }),
      },
    };
  }
}
