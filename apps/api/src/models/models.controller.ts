import { Controller, Get, Query } from '@nestjs/common';
import { ModelsService } from './models.service';

@Controller('models')
export class ModelsController {
  constructor(private readonly modelsService: ModelsService) {}

  @Get()
  async findAll(@Query() query: any) {
    return this.modelsService.findAll(query);
  }
}
