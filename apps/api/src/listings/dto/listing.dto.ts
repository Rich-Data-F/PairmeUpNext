import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsNumber, IsBoolean, IsOptional, IsArray, Min, Max, Length, IsUUID, IsDecimal, ValidateIf, ValidationArguments } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ListingType, Condition } from '@prisma/client';

export class CreateListingDto {
  @ApiProperty({ description: 'Listing title', example: 'Apple AirPods Pro Left Earbud - Like New' })
  @IsString()
  @Length(10, 100)
  title: string;

  @ApiProperty({ description: 'Detailed description of the item' })
  @IsString()
  @Length(20, 2000)
  description: string;

  @ApiProperty({ enum: ListingType, description: 'Type of listing' })
  @IsEnum(ListingType)
  type: ListingType;

  @ApiProperty({ enum: Condition, description: 'Condition of the item' })
  @IsEnum(Condition)
  condition: Condition;

  @ApiProperty({ description: 'Price in specified currency', example: 99.99 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(9999.99)
  price: number;

  @ApiPropertyOptional({ description: 'Currency code', example: 'USD', default: 'USD' })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string = 'USD';

  @ApiPropertyOptional({ description: 'Brand ID (required if not using customBrand)' })
  @IsOptional()
  @IsString()
  @ValidateIf((o) => !o.customBrand)
  brandId?: string;

  @ApiPropertyOptional({ description: 'Model ID (required if not using customModel)' })
  @IsOptional()
  @IsString()
  @ValidateIf((o) => !o.customModel)
  modelId?: string;

  @ApiPropertyOptional({ description: 'Custom brand name (required if not using brandId)' })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  @ValidateIf((o) => !o.brandId)
  customBrand?: string;

  @ApiPropertyOptional({ description: 'Custom model name (required if not using modelId)' })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  @ValidateIf((o) => !o.modelId)
  customModel?: string;

  @ApiPropertyOptional({ description: 'Serial number or device identifier' })
  @IsOptional()
  @IsString()
  @Length(4, 50)
  serialNumber?: string;

  @ApiProperty({ description: 'City ID for location' })
  @IsString()
  cityId: string;

  @ApiPropertyOptional({ description: 'Hide exact location coordinates', default: true })
  @IsOptional()
  @IsBoolean()
  hideExactLocation?: boolean = true;

  @ApiPropertyOptional({ description: 'Precise latitude (requires user consent)' })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional({ description: 'Precise longitude (requires user consent)' })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @ApiPropertyOptional({ description: 'Additional seller notes' })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  sellerNotes?: string;

  @ApiPropertyOptional({ description: 'Array of image URLs/keys' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ description: 'Verification photo URL/key' })
  @IsOptional()
  @IsString()
  verificationPhoto?: string;
}

export class UpdateListingDto {
  @ApiPropertyOptional({ description: 'Listing title' })
  @IsOptional()
  @IsString()
  @Length(10, 100)
  title?: string;

  @ApiPropertyOptional({ description: 'Detailed description of the item' })
  @IsOptional()
  @IsString()
  @Length(20, 2000)
  description?: string;

  @ApiPropertyOptional({ enum: Condition, description: 'Condition of the item' })
  @IsOptional()
  @IsEnum(Condition)
  condition?: Condition;

  @ApiPropertyOptional({ description: 'Price in specified currency' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(9999.99)
  price?: number;

  @ApiPropertyOptional({ description: 'Currency code' })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @ApiPropertyOptional({ description: 'City ID for location' })
  @IsOptional()
  @IsUUID()
  cityId?: string;

  @ApiPropertyOptional({ description: 'Hide exact location coordinates' })
  @IsOptional()
  @IsBoolean()
  hideExactLocation?: boolean;

  @ApiPropertyOptional({ description: 'Precise latitude' })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional({ description: 'Precise longitude' })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @ApiPropertyOptional({ description: 'Additional seller notes' })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  sellerNotes?: string;

  @ApiPropertyOptional({ description: 'Array of image URLs/keys' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ description: 'Verification photo URL/key' })
  @IsOptional()
  @IsString()
  verificationPhoto?: string;
}

export class ListingQueryDto {
  @ApiPropertyOptional({ description: 'Page number', example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', example: 20, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Search query for title and description' })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by brand ID' })
  @IsOptional()
  @IsUUID()
  brandId?: string;

  @ApiPropertyOptional({ description: 'Filter by model ID' })
  @IsOptional()
  @IsUUID()
  modelId?: string;

  @ApiPropertyOptional({ enum: ListingType, description: 'Filter by listing type' })
  @IsOptional()
  @IsEnum(ListingType)
  type?: ListingType;

  @ApiPropertyOptional({ enum: Condition, description: 'Filter by condition' })
  @IsOptional()
  @IsEnum(Condition)
  condition?: Condition;

  @ApiPropertyOptional({ description: 'Minimum price filter' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Maximum price filter' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ description: 'Filter by city ID' })
  @IsOptional()
  @IsUUID()
  cityId?: string;

  @ApiPropertyOptional({ description: 'Search radius in kilometers (requires cityId)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(500)
  radiusKm?: number;

  @ApiPropertyOptional({ description: 'Sort by field', enum: ['createdAt', 'price', 'views', 'publishedAt'] })
  @IsOptional()
  @IsString()
  sortBy?: string = 'publishedAt';

  @ApiPropertyOptional({ description: 'Sort order', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional({ description: 'Filter by currency' })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @ApiPropertyOptional({ description: 'Only show verified listings', default: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  verifiedOnly?: boolean = false;
}

export class ListingResponseDto {
  @ApiProperty({ description: 'Listing ID' })
  id: string;

  @ApiProperty({ description: 'Listing title' })
  title: string;

  @ApiProperty({ description: 'Listing description' })
  description: string;

  @ApiProperty({ enum: ListingType, description: 'Type of listing' })
  type: ListingType;

  @ApiProperty({ enum: Condition, description: 'Condition of the item' })
  condition: Condition;

  @ApiProperty({ description: 'Price' })
  price: number;

  @ApiProperty({ description: 'Currency code' })
  currency: string;

  @ApiProperty({ description: 'Masked identifier' })
  identifierMasked: string;

  @ApiProperty({ description: 'Verification status' })
  isVerified: boolean;

  @ApiProperty({ description: 'Brand information' })
  brand: {
    id: string;
    name: string;
    slug: string;
    logo?: string;
  };

  @ApiProperty({ description: 'Model information' })
  model: {
    id: string;
    name: string;
    slug: string;
    image?: string;
  };

  @ApiProperty({ description: 'City information' })
  city: {
    id: string;
    name: string;
    displayName: string;
    countryCode: string;
  };

  @ApiProperty({ description: 'Seller information' })
  seller: {
    id: string;
    name: string;
    verificationBadge?: string;
    trustLevel: string;
    isVerified: boolean;
  };

  @ApiProperty({ description: 'Array of image URLs' })
  images: string[];

  @ApiProperty({ description: 'View count' })
  views: number;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Publication timestamp' })
  publishedAt: Date;

  @ApiPropertyOptional({ description: 'Seller notes' })
  sellerNotes?: string;
}

export class ListingDetailResponseDto extends ListingResponseDto {
  @ApiProperty({ description: 'Full description with contact info (for authorized users)' })
  fullDescription?: string;

  @ApiProperty({ description: 'Verification photo URL (for authorized users)' })
  verificationPhoto?: string;

  @ApiProperty({ description: 'Contact information (for authorized users)' })
  contactInfo?: {
    email?: string;
    phone?: string;
    preferredContact?: string;
  };

  @ApiProperty({ description: 'Location information' })
  location?: {
    hideExactLocation: boolean;
    latitude?: number;
    longitude?: number;
    approximate?: boolean;
  };
}

export class BulkUpdateListingDto {
  @ApiProperty({ description: 'Array of listing IDs to update' })
  @IsArray()
  @IsUUID('4', { each: true })
  listingIds: string[];

  @ApiPropertyOptional({ description: 'New status for all listings' })
  @IsOptional()
  @IsEnum(['ACTIVE', 'SUSPENDED', 'EXPIRED'])
  status?: string;

  @ApiPropertyOptional({ description: 'Reason for bulk update' })
  @IsOptional()
  @IsString()
  @Length(1, 500)
  reason?: string;
}
