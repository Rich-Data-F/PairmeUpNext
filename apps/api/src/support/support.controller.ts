import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SupportService } from './support.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('support')
@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post('request')
  @ApiOperation({ summary: 'Submit a support request' })
  @ApiResponse({ status: 201, description: 'Support request submitted successfully' })
  async submitRequest(@Body() body: { category: string; message: string }) {
    return this.supportService.submitRequest(body.category, body.message);
  }

  @Post('seed')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Seed database with test data (admin only)' })
  @ApiResponse({ status: 200, description: 'Database seeded successfully' })
  async seedDatabase(@Body() body: any) {
    // TODO: Check if user is admin
    return this.supportService.seedDatabase();
  }
}
