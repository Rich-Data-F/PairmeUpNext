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
  ) {}

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
      // Check if a proposed brand with this name already exists
      const existingProposedBrand = await this.prisma.proposedBrand.findUnique({
        where: { name: customBrand },
      });

      let proposedBrand;
      if (existingProposedBrand) {
        proposedBrand = existingProposedBrand;
      } else {
        // Create a proposed brand
        proposedBrand = await this.prisma.proposedBrand.create({
          data: {
            name: customBrand,
            submittedBy: sellerId,
            submissionNote: `Proposed brand from listing creation`,
          },
        });
      }
      
      // Check if a temporary brand with this name already exists
      const existingTempBrand = await this.prisma.brand.findFirst({
        where: { 
          name: customBrand,
          slug: { startsWith: 'temp-' }
        },
      });

      if (existingTempBrand) {
        finalBrandId = existingTempBrand.id;
      } else {
        // Create a temporary brand entry for the listing
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
      // Check if a proposed model with this name and brand already exists
      const existingProposedModel = await this.prisma.proposedModel.findFirst({
        where: { 
          name: customModel,
          brandId: finalBrandId 
        },
      });

      let proposedModel;
      if (existingProposedModel) {
        proposedModel = existingProposedModel;
      } else {
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
      
      // Check if a temporary model with this name and brand already exists
      const existingTempModel = await this.prisma.model.findFirst({
        where: { 
          name: customModel,
          brandId: finalBrandId,
          slug: { startsWith: 'temp-' }
        },
      });

      if (existingTempModel) {
        finalModelId = existingTempModel.id;
      } else {
        // Create a temporary model entry for the listing
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
      const model = await this.prisma.model.findUnique({ where: { id: finalModelId, brandId: finalBrandId } });
      if (!model) {
        throw new BadRequestException('Model not found or does not belong to the specified brand');
      }
    }

    // Verify city exists
    const city = await this.prisma.city.findUnique({ where: { id: cityId } });
    if (!city) {
      throw new BadRequestException('City not found');
    }

    // Encrypt serial number if provided
    let encryptedIdentifier: string | undefined;
    let maskedIdentifier: string | undefined;
    
    if (serialNumber) {
      encryptedIdentifier = this.identifierService.encrypt(serialNumber);
      maskedIdentifier = this.identifierService.mask(serialNumber);
    }

    // Process images - now we receive image URLs directly from the upload
    let processedImages: string[] = [];
    let associatedFiles: any[] = [];

    if (images && images.length > 0) {
      processedImages = images; // Images are now URLs from the upload service

      // Associate uploaded files with the listing (we'll do this after listing creation)
      // For now, store the URLs as before
    }

    // Process verification photo
    let processedVerificationPhoto: string | undefined;
    if (verificationPhoto) {
      processedVerificationPhoto = verificationPhoto; // Now it's already a URL
    }

    // Create listing
    const listing = await this.prisma.listing.create({
      data: {
        ...listingData,
        sellerId: sellerId,
        brandId: finalBrandId,
        modelId: finalModelId,
        cityId,
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
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      select: { sellerId: true, status: true },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    if (listing.sellerId !== sellerId) {
      throw new ForbiddenException('You can only update your own listings');
    }

    if (listing.status !== ListingStatus.ACTIVE) {
      throw new BadRequestException('Cannot update inactive listing');
    }

    const { cityId, images, verificationPhoto, ...updateData } = updateListingDto;

    // Verify city if provided
    if (cityId) {
      const city = await this.prisma.city.findUnique({ where: { id: cityId } });
      if (!city) {
        throw new BadRequestException('City not found');
      }
    }

    // Process images if provided
    let processedImages;
    if (images) {
      processedImages = await Promise.all(
        images.map(async (imageKey) => {
          const { thumbnailUrl, fullUrl } = await this.uploadService.getImageUrls(imageKey);
          return {
            originalKey: imageKey,
            thumbnailUrl,
            fullUrl,
          };
        })
      );
    }

    // Process verification photo if provided
    let processedVerificationPhoto;
    if (verificationPhoto) {
      const { thumbnailUrl, fullUrl } = await this.uploadService.getImageUrls(verificationPhoto);
      processedVerificationPhoto = {
        originalKey: verificationPhoto,
        thumbnailUrl,
        fullUrl,
      };
    }

    const updatedListing = await this.prisma.listing.update({
      where: { id },
      data: {
        ...updateData,
        cityId,
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
      },
      seller: {
        id: listing.seller.id,
        name: listing.seller.name,
        verificationBadge: listing.seller.verificationBadge,
        trustLevel: listing.seller.trustLevel,
        isVerified: listing.seller.isVerified,
      },
      images: listing.images?.map((img: any) => img.thumbnailUrl) || [],
      views: listing.views,
      createdAt: listing.createdAt,
      publishedAt: listing.publishedAt,
      sellerNotes: listing.sellerNotes,
    };
  }

  private formatDetailedListingResponse(listing: any, requestUserId?: string) {
    const baseResponse = this.formatListingResponse(listing);
    
    // Additional details for authorized users (owner or authenticated users)
    const isOwner = requestUserId === listing.sellerId;
    const isAuthenticated = !!requestUserId;

    return {
      ...baseResponse,
      images: listing.images?.map((img: any) => img.fullUrl) || [],
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
