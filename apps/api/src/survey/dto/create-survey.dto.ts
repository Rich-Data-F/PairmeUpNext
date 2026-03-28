import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, IsBoolean, Min, Max, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSurveyDto {
  // ── Item Identity ───────────────────────────────────────────────────────────
  @ApiProperty({ required: false }) @IsOptional() @IsString() brandId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() modelId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() customBrand?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() customModel?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() referenceString?: string;

  // ── Core performance ratings (1-5) ─────────────────────────────────────────
  @ApiProperty({ required: false }) @IsOptional() @IsInt() @Min(1) @Max(5) batteryAutonomyRate?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsInt() @Min(1) @Max(5) delaySyncRate?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsInt() @Min(1) @Max(5) robustnessRate?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsInt() @Min(1) @Max(5) soundQualityVideo?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsInt() @Min(1) @Max(5) soundQualityMusic?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsInt() @Min(1) @Max(5) soundQualityPodcasts?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsInt() @Min(1) @Max(5) noiseReductionRate?: number;

  // ── Battery autonomy in minutes (single earbud, no case recharge) ──────────
  @ApiProperty({ required: false }) @IsOptional() @IsInt() @Min(0) @Max(600) batteryAutonomyMinutes?: number;

  // ── NEW: Style & comfort ratings (1-5) ─────────────────────────────────────
  @ApiProperty({ required: false }) @IsOptional() @IsInt() @Min(1) @Max(5) styleRate?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsInt() @Min(1) @Max(5) comfortRate?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsInt() @Min(1) @Max(5) phoneQualityMyselfRate?: number;   // call quality heard by me
  @ApiProperty({ required: false }) @IsOptional() @IsInt() @Min(1) @Max(5) phoneQualityOtherRate?: number;    // call quality heard by interlocutor
  @ApiProperty({ required: false }) @IsOptional() @IsInt() @Min(1) @Max(5) sportStayRate?: number;            // faculty to stay in ears during sport
  @ApiProperty({ required: false }) @IsOptional() @IsInt() @Min(1) @Max(5) overallResistanceRate?: number;    // overall physical resistance

  // ── Music styles ────────────────────────────────────────────────────────────
  @ApiProperty({ required: false }) @IsOptional() @IsString() musicStyleMostListened?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() musicStyleMostSuitable?: string;

  // ── Localization – earbud ───────────────────────────────────────────────────
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() hasEarbudLocalization?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsInt() @Min(1) @Max(5) earbudLocRate?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() earbudLocType?: string;  // SOUND, MAP, BOTH

  // ── Localization – case ─────────────────────────────────────────────────────
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() hasCaseLocalization?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsInt() @Min(1) @Max(5) caseLocRate?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() caseLocType?: string;    // SOUND, MAP, BOTH

  // ── Localization – shared questions ─────────────────────────────────────────
  /** @deprecated kept for backwards compat; use earbudLocType/caseLocType */
  @ApiProperty({ required: false }) @IsOptional() @IsString() localizationType?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() localizationSavedLife?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() localizationUseful?: boolean;

  // ── Ownership details ───────────────────────────────────────────────────────
  @ApiProperty({ required: false }) @IsOptional() @Type(() => Date) dateOfPurchase?: Date;
  @ApiProperty({ required: false }) @IsOptional() @IsInt() usageDurationMonths?: number;

  // ── Original purchase price (split currency + amount) ──────────────────────
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() pricePaid?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() currency?: string;           // ISO 4217: USD, EUR, GBP …

  // ── Original purchase location ──────────────────────────────────────────────
  @ApiProperty({ required: false }) @IsOptional() @IsString() locationPurchase?: string;   // store or website name
  @ApiProperty({ required: false }) @IsOptional() @IsString() countryOfPurchase?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() countryOfUsage?: string;

  // ── Loss & Replacement ──────────────────────────────────────────────────────
  @ApiProperty({ required: false }) @IsOptional() @IsString() lossExperienceDetails?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() purchasedNewKit?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() boughtSpareItem?: boolean;

  // Spare part details
  @ApiProperty({ required: false }) @IsOptional() @IsString() spareCondition?: string;         // NEW, USED
  @ApiProperty({ required: false }) @IsOptional() @IsString() sparePurchaseLocation?: string;  // store or website
  @ApiProperty({ required: false }) @IsOptional() @IsString() spareCountry?: string;           // country where spare was bought
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() sparePrice?: number;             // price of spare
  @ApiProperty({ required: false }) @IsOptional() @IsString() spareCurrency?: string;          // currency for spare
}
