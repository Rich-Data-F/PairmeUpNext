import { Module } from '@nestjs/common';
import { ListingsService } from './listings.service';
import { ListingsController } from './listings.controller';
import { CommonModule } from '../common/common.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [CommonModule, PrismaModule],
  controllers: [ListingsController],
  providers: [ListingsService],
  exports: [ListingsService],
})
export class ListingsModule {}
