import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { PrismaModule } from './prisma/prisma.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { UploadModule } from './upload/upload.module';
import { BrandsModule } from './brands/brands.module';
import { ModelsModule } from './models/models.module';
import { CitiesModule } from './cities/cities.module';
import { ListingsModule } from './listings/listings.module';
import { SearchModule } from './search/search.module';
import { LostReportsModule } from './lost-reports/lost-reports.module';
import { FoundItemsModule } from './found-items/found-items.module';
import { RatingsModule } from './ratings/ratings.module';
import { BlogModule } from './blog/blog.module';
import { OrdersModule } from './orders/orders.module';
import { SponsoredModule } from './sponsored/sponsored.module';
import { HealthModule } from './health/health.module';
import { GeoModule } from './geo/geo.module';
import { NegotiationModule } from './negotiation/negotiation.module';
import { SupportModule } from './support/support.module';
import { SurveyModule } from './survey/survey.module';
// import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.development', '.env.local', '.env'],
    }),
    
    // In-memory caching (optimized for Neon DB & Free Render instance)
    CacheModule.register({
      isGlobal: true,
      ttl: 300000, // 5 minutes default
      max: 100, // Maximum number of items in cache (to keep RAM low)
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),
    
    // Database (must be first)
    PrismaModule,
    
    // Common services
    CommonModule,
    
    // Core modules
    AuthModule,
    UploadModule,
    BrandsModule,
    ModelsModule,
    CitiesModule,
    ListingsModule,
    SearchModule,
    LostReportsModule,
    FoundItemsModule,
    RatingsModule,
    BlogModule,
    OrdersModule,
    SponsoredModule,
    HealthModule,
    GeoModule,
    NegotiationModule,
    SupportModule,
    SurveyModule,
    // AdminModule,
  ],
})
export class AppModule {}
