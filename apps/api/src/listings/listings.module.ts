import { Module } from '@nestjs/common';
import { ListingsService } from './listings.service';
import { ListingsController } from './listings.controller';
import { MatchingService } from './matching.service';
import { MatchingController } from './matching.controller';
import { CommonModule } from '../common/common.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [CommonModule, PrismaModule],
  controllers: [ListingsController, MatchingController],
  providers: [ListingsService, MatchingService],
  exports: [ListingsService, MatchingService],
})
export class ListingsModule { }
