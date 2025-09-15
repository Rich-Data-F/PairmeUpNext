import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
    console.log('✅ Database connected successfully');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('📦 Database connection closed');
  }

  async enableShutdownHooks(app: any) {
    // Note: Prisma 6 changed event types - using process events instead
    process.on('beforeExit', async () => {
      await app.close();
    });
  }

  // Helper method for safe transactions
  async safeTransaction<T>(fn: (prisma: PrismaClient) => Promise<T>): Promise<T> {
    try {
      return await this.$transaction(fn);
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  }

  // Helper method for paginated queries
  async paginate<T>(
    model: any,
    options: {
      page?: number;
      limit?: number;
      where?: any;
      orderBy?: any;
      include?: any;
      select?: any;
    }
  ) {
    const page = options.page || 1;
    const limit = Math.min(options.limit || 10, 100); // Max 100 items per page
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      model.findMany({
        skip,
        take: limit,
        where: options.where,
        orderBy: options.orderBy,
        include: options.include,
        select: options.select,
      }),
      model.count({ where: options.where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
      },
    };
  }
}
