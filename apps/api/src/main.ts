/*
EarbudHub Marketplace - Professional Earbud Parts Marketplace with Lost/Stolen Registry

PROJECT OVERVIEW:
- Full-stack marketplace for buying/selling individual earbuds, charging cases, and accessories
- Integrated lost/stolen registry with smart matching algorithm
- Advanced ratings system with 12+ criteria and weighted scoring
- Blog system with brand/model taxonomy
- City-level geolocation using GeoDB Cities API
- Trust features: identifier masking, verification badges, escrow payments
- Found items registry with legal compliance workflow

TECHNICAL STACK:
- Frontend: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- Backend: NestJS, TypeScript, Swagger documentation
- Database: PostgreSQL with Prisma ORM
- Authentication: NextAuth.js (planned)
- Payment: PayPal Orders v2 API with escrow simulation
- Geolocation: GeoDB Cities API for global city picker
- File Upload: MinIO (S3-compatible)
- Development: Docker Compose (PostgreSQL, Redis, MinIO)
- Deployment: Railway (Backend + Database) + Vercel (Frontend)
*/

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security middleware
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false, // Allow for development
  }));
  
  // Compression middleware
  app.use(compression());

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  // CORS configuration
  const corsOrigins = configService.get<string>('CORS_ORIGINS')?.split(',') || ['http://localhost:3000'];
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Swagger API documentation
  const config = new DocumentBuilder()
    .setTitle('EarbudHub Marketplace API')
    .setDescription('Professional earbud parts marketplace with lost/stolen registry')
    .setVersion('1.0')
    .setContact(
      'EarbudHub Team',
      'https://earbudhub.com',
      'api@earbudhub.com'
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addTag('auth', 'Authentication and user management')
    .addTag('brands', 'Brand management')
    .addTag('models', 'Product model management')
    .addTag('cities', 'GeoDB Cities integration')
    .addTag('listings', 'Marketplace listings')
    .addTag('lost-reports', 'Lost/stolen item registry')
    .addTag('found-items', 'Found items with legal compliance')
    .addTag('ratings', 'Advanced ratings system')
    .addTag('blog', 'Blog posts and content')
    .addTag('orders', 'PayPal order management')
    .addTag('sponsored', 'Sponsored content and revenue')
    .addTag('health', 'Health check endpoints')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'EarbudHub API Documentation',
    customfavIcon: '/favicon.ico',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  // Start server
  const port = configService.get<number>('PORT') || 4000;
  await app.listen(port);

  console.log(`🚀 EarbudHub API is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  console.log(`🏥 Health Check: http://localhost:${port}/health`);
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});
