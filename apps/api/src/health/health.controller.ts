import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';
import { HealthCheckDto } from './dto/health-check.dto';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ 
    status: 200, 
    description: 'Service is healthy',
    type: HealthCheckDto,
  })
  @ApiResponse({ 
    status: 503, 
    description: 'Service is unhealthy' 
  })
  async healthCheck(): Promise<HealthCheckDto> {
    return this.healthService.check();
  }

  @Get('detailed')
  @ApiOperation({ summary: 'Detailed health check with dependencies' })
  @ApiResponse({ 
    status: 200, 
    description: 'Detailed health status',
  })
  async detailedHealthCheck() {
    return this.healthService.detailedCheck();
  }
}
