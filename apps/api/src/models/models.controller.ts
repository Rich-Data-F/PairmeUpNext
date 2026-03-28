import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ModelsService } from './models.service';

@ApiTags('models')
@Controller('models')
@UseInterceptors(CacheInterceptor)
export class ModelsController {
  constructor(private readonly modelsService: ModelsService) { }

  @Get()
  @ApiOperation({ summary: 'Get all models (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'brandId', required: false, type: String })
  async findAll(@Query() query: any) {
    return this.modelsService.findAll(query);
  }

  // New endpoint to fetch canonical models, optionally filtered by brand
  @Get('canonical')
  @ApiOperation({ summary: 'Get all canonical models' })
  @ApiQuery({ name: 'brandId', required: false, type: String })
  async getCanonical(@Query('brandId') brandId?: string) {
    return this.modelsService.findAllCanonical(brandId);
  }
}
