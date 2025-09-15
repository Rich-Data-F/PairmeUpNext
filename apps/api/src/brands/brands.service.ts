import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BrandsService {
  constructor(private readonly prisma: PrismaService) {}

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
      where: { ...where, isActive: true },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { models: true },
        },
      },
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.brand.findUnique({
      where: { slug },
      include: {
        models: {
          where: { isActive: true },
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
