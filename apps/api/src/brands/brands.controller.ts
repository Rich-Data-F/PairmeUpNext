import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { BrandsService } from './brands.service';

@ApiTags('brands')
@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all brands' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  findAll(@Query() query: any) {
    return this.brandsService.findAll(query);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get brand by slug' })
  findOne(@Param('slug') slug: string) {
    return this.brandsService.findBySlug(slug);
  }
}
