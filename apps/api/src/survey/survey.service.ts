import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSurveyDto } from './dto/create-survey.dto';

@Injectable()
export class SurveyService {
  private readonly logger = new Logger(SurveyService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createSurveyDto: CreateSurveyDto, userId?: string) {
    this.logger.log(`Creating new survey response`);

    // Use type-safe dynamic property access to be compatible across Prisma client versions
    const db = this.prisma as any;
    return db.surveyResponse.create({
      data: {
        ...createSurveyDto,
        userId: userId || null,
      },
    });
  }

  async findAll() {
    const db = this.prisma as any;
    return db.surveyResponse.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        brand: { select: { name: true } },
        model: { select: { name: true } },
      }
    });
  }

  async getSummary() {
    const db = this.prisma as any;
    const responses = await db.surveyResponse.findMany({
      select: {
        batteryAutonomyRate: true,
        delaySyncRate: true,
        robustnessRate: true,
        soundQualityMusic: true,
        noiseReductionRate: true,
        hasEarbudLocalization: true,
        localizationSavedLife: true,
      }
    });

    const total = responses.length;
    if (total === 0) return { total: 0, averages: {}, localization: {} };

    const avg = (key: string) => {
      const valid = responses.filter((r: any) => r[key] !== null && r[key] !== undefined);
      if (valid.length === 0) return "0.0";
      const sum = valid.reduce((acc: number, curr: any) => acc + (curr[key] as number), 0);
      return (sum / valid.length).toFixed(1);
    };

    return {
      total,
      averages: {
        battery: avg('batteryAutonomyRate'),
        delay: avg('delaySyncRate'),
        robustness: avg('robustnessRate'),
        music: avg('soundQualityMusic'),
        noiseReduction: avg('noiseReductionRate'),
      },
      localization: {
        supportCount: responses.filter((r: any) => r.hasEarbudLocalization).length,
        savedLifeCount: responses.filter((r: any) => r.localizationSavedLife).length,
      }
    };
  }
}
