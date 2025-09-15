import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { AdvancedSearchService } from './advanced-search.service';
import { FacetedSearchService } from './faceted-search.service';
import { CommonModule } from '../common/common.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [CommonModule, PrismaModule],
  controllers: [SearchController],
  providers: [SearchService, AdvancedSearchService, FacetedSearchService],
  exports: [SearchService, AdvancedSearchService, FacetedSearchService],
})
export class SearchModule {}
