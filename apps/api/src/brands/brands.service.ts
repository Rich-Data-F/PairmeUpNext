import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BrandsService {
  constructor(private readonly prisma: PrismaService) { }

  async findAll(query: any) {
    const { page = 1, limit = 10, search } = query;

    const where = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    } : {};

    return this.prisma.paginate(this.prisma.brand, {
      page: parseInt(page),
      limit: parseInt(limit),
      where: { ...where, isActive: true, status: { in: ['APPROVED', 'SYSTEM'] } },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { models: true },
        },
      },
    });
  }

  // New helper to fetch all canonical brands without pagination (used by the create‑listing form)
  // Includes PENDING brands so user-created brands appear immediately in dropdowns
  // Excludes OBSOLETE and REJECTED brands from being available for selection
  async findAllCanonical() {
    return this.prisma.brand.findMany({
      where: { isActive: true, status: { in: ['APPROVED', 'SYSTEM', 'PENDING'] } },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true },
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.brand.findUnique({
      where: { slug },
      include: {
        models: {
          where: { isActive: true, status: { in: ['APPROVED', 'PENDING', 'SYSTEM'] } },
          orderBy: { name: 'asc' },
        },
        _count: {
          select: {
            models: true,
            blogPosts: true,
          },
        },
      },
    });
  }
}
