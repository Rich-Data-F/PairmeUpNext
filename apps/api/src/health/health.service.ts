import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HealthCheckDto } from './dto/health-check.dto';

@Injectable()
export class HealthService {
  private readonly startTime: number;

  constructor(private readonly prisma: PrismaService) {
    this.startTime = Date.now();
  }

  async check(): Promise<HealthCheckDto> {
    try {
      // Basic database connectivity check
      await this.prisma.$queryRaw`SELECT 1`;
      
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        service: 'EarbudHub Marketplace API',
        uptime: Date.now() - this.startTime,
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        service: 'EarbudHub Marketplace API',
        uptime: Date.now() - this.startTime,
      };
    }
  }

  async detailedCheck() {
    const dependencies: Record<string, 'ok' | 'error'> = {};

    // Database check
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dependencies.database = 'ok';
    } catch (error) {
      dependencies.database = 'error';
    }

    // Add other dependency checks here (Redis, MinIO, etc.)
    
    const basicHealth = await this.check();
    
    return {
      ...basicHealth,
      dependencies,
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version,
      memoryUsage: process.memoryUsage(),
    };
  }
}
