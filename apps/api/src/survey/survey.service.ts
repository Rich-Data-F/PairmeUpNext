import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSurveyDto } from './dto/create-survey.dto';

@Injectable()
export class SurveyService {
  private readonly logger = new Logger(SurveyService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createSurveyDto: CreateSurveyDto, userId?: string) {
    this.logger.log(`Creating new survey response`);
    
    // We pass the decimal fields directly as numbers, Prisma handles it if mapped correctly or we let Prisma do the cohersion.
    // In our schema, pricePaid is Decimal. We might need to ensure it's coerced if needed, but Prisma Client handles number -> Decimal automatically usually.
    return this.prisma.surveyResponse.create({
      data: {
        ...createSurveyDto,
        userId: userId || null,
      },
    });
  }

  async findAll() {
    return this.prisma.surveyResponse.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        brand: { select: { name: true } },
        model: { select: { name: true } },
      }
    });
  }
}
