import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SupportService {
  constructor(private readonly prisma: PrismaService) {}

  async submitRequest(category: string, message: string) {
    // For now, just log it. In future, store in DB or send email.
    console.log(`Support request: Category: ${category}, Message: ${message}`);
    return { success: true, message: 'Support request submitted' };
  }

  async seedDatabase() {
    // Import and run the seed script
    try {
      const { seedTestListings } = await import('../../../../scripts/seed-test-listings');
      await seedTestListings();
      return { success: true, message: 'Database seeded successfully' };
    } catch (error) {
      console.error('Seeding failed:', error);
      return { success: false, message: 'Seeding failed' };
    }
  }
}
