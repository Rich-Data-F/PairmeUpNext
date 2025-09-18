import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFiles,
  HttpStatus,
  HttpCode,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { ListingsService } from './listings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadService } from '../common/services/upload.service';
import {
  CreateListingDto,
  UpdateListingDto,
  ListingQueryDto,
  ListingResponseDto,
  ListingDetailResponseDto,
  BulkUpdateListingDto,
} from './dto/listing.dto';

@ApiTags('listings')
@Controller('listings')
export class ListingsController {
  constructor(
    private readonly listingsService: ListingsService,
    private readonly uploadService: UploadService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new listing' })
  @ApiResponse({ status: 201, description: 'Listing created successfully', type: ListingResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  async create(@Body() createListingDto: CreateListingDto, @Request() req: any) {
    return this.listingsService.create(req.user.id, createListingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all active listings with filters' })
  @ApiResponse({ status: 200, description: 'Listings retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search query' })
  @ApiQuery({ name: 'brandId', required: false, type: String, description: 'Filter by brand' })
  @ApiQuery({ name: 'modelId', required: false, type: String, description: 'Filter by model' })
  @ApiQuery({ name: 'type', required: false, enum: ['LISTING', 'WANTED'], description: 'Listing type' })
  @ApiQuery({ name: 'condition', required: false, enum: ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR'], description: 'Item condition' })
  @ApiQuery({ name: 'minPrice', required: false, type: Number, description: 'Minimum price' })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number, description: 'Maximum price' })
  @ApiQuery({ name: 'cityId', required: false, type: String, description: 'Filter by city' })
  @ApiQuery({ name: 'radiusKm', required: false, type: Number, description: 'Search radius in km' })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['createdAt', 'price', 'views', 'publishedAt'], description: 'Sort by field' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: 'Sort order' })
  @ApiQuery({ name: 'currency', required: false, type: String, description: 'Filter by currency' })
  @ApiQuery({ name: 'verifiedOnly', required: false, type: Boolean, description: 'Show only verified listings' })
  async findAll(@Query() query: ListingQueryDto) {
    return this.listingsService.findAll(query);
  }

  @Get('my-listings')
  @ApiOperation({ summary: 'Get current user listings' })
  @ApiResponse({ status: 200, description: 'User listings retrieved successfully' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getUserListings(@Query() query: ListingQueryDto, @Request() req: any) {
    return this.listingsService.getUserListings(req.user.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get listing by ID with detailed information' })
  @ApiParam({ name: 'id', description: 'Listing ID' })
  @ApiResponse({ status: 200, description: 'Listing retrieved successfully', type: ListingDetailResponseDto })
  @ApiResponse({ status: 404, description: 'Listing not found' })
  async findOne(@Param('id') id: string, @Request() req: any) {
    const userId = req.user?.sub;
    return this.listingsService.findOne(id, userId);
  }

    @Patch(':id')
  @ApiOperation({ summary: 'Update listing by ID' })
  @ApiParam({ name: 'id', description: 'Listing ID' })
  @ApiResponse({ status: 200, description: 'Listing updated successfully', type: ListingResponseDto })
  @ApiResponse({ status: 404, description: 'Listing not found' })
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() updateListingDto: UpdateListingDto, @Request() req: any) {
    return this.listingsService.update(id, req.user.id, updateListingDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete listing by ID' })
  @ApiParam({ name: 'id', description: 'Listing ID' })
  @ApiResponse({ status: 200, description: 'Listing deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not listing owner' })
  @ApiResponse({ status: 404, description: 'Listing not found' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.listingsService.remove(id, req.user.id);
  }

  @Patch('bulk-update')
  @ApiOperation({ summary: 'Bulk update multiple listings' })
  @ApiResponse({ status: 200, description: 'Listings updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not listing owner' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async bulkUpdate(@Body() bulkUpdateDto: BulkUpdateListingDto, @Request() req: any) {
    return this.listingsService.bulkUpdate(req.user.id, bulkUpdateDto);
  }

  @Post('upload-images')
  @ApiOperation({ summary: 'Upload images for listing' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Images to upload (max 10 files, 5MB each)',
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          maxItems: 10,
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Images uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file format or size' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FilesInterceptor('images', 10))
  async uploadImages(@UploadedFiles() files: Express.Multer.File[], @Request() req: any) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const uploadPromises = files.map(async (file) => {
      const processedImages = await this.uploadService.uploadImage(
        {
          fieldname: file.fieldname,
          originalname: file.originalname,
          encoding: file.encoding,
          mimetype: file.mimetype,
          size: file.size,
          buffer: file.buffer,
        },
        'listings',
        req.user.id,
      );

      return {
        originalName: file.originalname,
        variants: processedImages,
      };
    });

    const results = await Promise.all(uploadPromises);

    return {
      message: `${results.length} images uploaded successfully`,
      images: results,
    };
  }

  @Post('upload-verification')
  @ApiOperation({ summary: 'Upload verification photo for listing' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Verification photo to upload',
    schema: {
      type: 'object',
      properties: {
        verification: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Verification photo uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file format or size' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FilesInterceptor('verification', 1))
  async uploadVerification(@UploadedFiles() files: Express.Multer.File[], @Request() req: any) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No verification photo uploaded');
    }

    const file = files[0];
    const processedImages = await this.uploadService.uploadImage(
      {
        fieldname: file.fieldname,
        originalname: file.originalname,
        encoding: file.encoding,
        mimetype: file.mimetype,
        size: file.size,
        buffer: file.buffer,
      },
      'verification',
      req.user.id,
    );

    return {
      message: 'Verification photo uploaded successfully',
      verification: {
        originalName: file.originalname,
        variants: processedImages,
      },
    };
  }

  @Get(':id/similar')
  @ApiOperation({ summary: 'Get similar listings based on brand, model, and location' })
  @ApiParam({ name: 'id', description: 'Listing ID to find similar listings for' })
  @ApiResponse({ status: 200, description: 'Similar listings retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Listing not found' })
  async findSimilar(@Param('id') id: string, @Query('limit') limit: number = 10) {
    // Get the listing details
    const listing = await this.listingsService.findOne(id);
    
    // Find similar listings with same brand and model
    const similarQuery: ListingQueryDto = {
      brandId: listing.brand.id,
      modelId: listing.model.id,
      cityId: listing.city.id,
      radiusKm: 50, // 50km radius
      limit,
      page: 1,
    };

    const similar = await this.listingsService.findAll(similarQuery);
    
    // Filter out the current listing
    similar.data = similar.data.filter(item => item.id !== id);
    
    return {
      data: similar.data.slice(0, limit),
      total: similar.data.length,
    };
  }

  @Get('stats/summary')
  @ApiOperation({ summary: 'Get marketplace statistics summary' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStats() {
    // This would be implemented with aggregation queries
    // For now, return placeholder data
    return {
      totalListings: 0,
      activeListings: 0,
      totalViews: 0,
      averagePrice: 0,
      topBrands: [],
      topModels: [],
      recentActivity: [],
    };
  }
}
