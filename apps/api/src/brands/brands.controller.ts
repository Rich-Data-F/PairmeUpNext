import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { BrandsService } from './brands.service';

@ApiTags('brands')
@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) { }

  @Get()
  @ApiOperation({ summary: 'Get all brands (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  findAll(@Query() query: any) {
    return this.brandsService.findAll(query);
  }

  // IMPORTANT: This must be declared BEFORE the ':slug' route to prevent
  // NestJS from treating 'canonical' as a slug parameter.
  @Get('canonical')
  @ApiOperation({ summary: 'Get all canonical (approved/system) brands without pagination' })
  @ApiResponse({ status: 200, description: 'List of canonical brands for dropdowns/forms' })
  async getCanonical() {
    return this.brandsService.findAllCanonical();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get brand by slug' })
  findOne(@Param('slug') slug: string) {
    return this.brandsService.findBySlug(slug);
  }
}
