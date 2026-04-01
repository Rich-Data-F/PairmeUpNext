import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsInt, IsEnum, Min } from 'class-validator';

export enum PostStatusDto {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export class CreateBlogPostDto {
  @ApiProperty() @IsString()
  title: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  slug?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  excerpt?: string;

  @ApiProperty() @IsString()
  content: string;

  @ApiPropertyOptional({ enum: PostStatusDto }) @IsOptional() @IsEnum(PostStatusDto)
  status?: PostStatusDto;

  @ApiPropertyOptional() @IsOptional() @IsString()
  featuredImage?: string;

  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional() @IsOptional() @IsString()
  category?: string;

  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1)
  readTime?: number;

  @ApiPropertyOptional() @IsOptional() @IsString()
  metaTitle?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  metaDescription?: string;
}

export class UpdateBlogPostDto extends PartialType(CreateBlogPostDto) {}
