import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ModelsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: any) {
    const { page = 1, limit = 10, search, brandId } = query;

    const where: any = {
      isActive: true,
      status: { in: ['APPROVED', 'PENDING'] },
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (brandId) {
      where.brandId = brandId;
    }

    return this.prisma.paginate(this.prisma.model, {
      page: parseInt(page),
      limit: parseInt(limit),
      where,
      orderBy: { name: 'asc' },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: { listings: true },
        },
      },
    });
  }
}
