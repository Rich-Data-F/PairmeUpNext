import { ApiProperty } from '@nestjs/swagger';

export class HealthCheckDto {
  @ApiProperty({ example: 'ok', description: 'Overall health status' })
  status: 'ok' | 'error';

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Current timestamp' })
  timestamp: string;

  @ApiProperty({ example: '1.0.0', description: 'API version' })
  version: string;

  @ApiProperty({ example: 'EarbudHub Marketplace API', description: 'Service name' })
  service: string;

  @ApiProperty({ example: 12345, description: 'Uptime in milliseconds' })
  uptime: number;

  @ApiProperty({ 
    example: { database: 'ok', redis: 'ok', minio: 'ok' },
    description: 'Dependencies health status',
    required: false,
  })
  dependencies?: Record<string, 'ok' | 'error'>;
}
