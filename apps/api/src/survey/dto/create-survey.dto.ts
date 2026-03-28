import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, IsBoolean, Min, Max, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSurveyDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  brandId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  modelId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  customBrand?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  customModel?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  referenceString?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  batteryAutonomyRate?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  delaySyncRate?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  robustnessRate?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  soundQualityVideo?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  soundQualityMusic?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  soundQualityPodcasts?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  noiseReductionRate?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  musicStyleMostListened?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  musicStyleMostSuitable?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  hasEarbudLocalization?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  earbudLocRate?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  hasCaseLocalization?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  caseLocRate?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  localizationType?: string; // SOUND, MAP, BOTH

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  localizationSavedLife?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Date)
  dateOfPurchase?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  usageDurationMonths?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  pricePaid?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  locationPurchase?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  countryOfPurchase?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  countryOfUsage?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  lossExperienceDetails?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  purchasedNewKit?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  boughtSpareItem?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  spareCondition?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  sparePurchaseLocation?: string;
}
