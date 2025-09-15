#!/usr/bin/env node

/**
 * Simple test data seeder for search functionality
 * Creates minimal data to test the search interface
 */

import { PrismaClient, Condition } from '@prisma/client';

const prisma = new PrismaClient();

async function createBasicTestData() {
  try {
    console.log('🌱 Creating basic test data for search...');

    // Create test cities with required fields
    const cities = [
      {
        geoDbId: 1000001,
        name: 'New York',
        country: 'United States',
        countryCode: 'US',
        latitude: 40.7128,
        longitude: -74.0060,
        displayName: 'New York, NY, USA',
        searchText: 'new york ny usa',
      },
      {
        geoDbId: 1000002,
        name: 'Los Angeles',
        country: 'United States',
        countryCode: 'US',
        latitude: 34.0522,
        longitude: -118.2437,
        displayName: 'Los Angeles, CA, USA',
        searchText: 'los angeles ca usa',
      },
      {
        geoDbId: 1000003,
        name: 'Chicago',
        country: 'United States',
        countryCode: 'US',
        latitude: 41.8781,
        longitude: -87.6298,
        displayName: 'Chicago, IL, USA',
        searchText: 'chicago il usa',
      }
    ];

    const createdCities = [];
    for (const city of cities) {
      const created = await prisma.city.upsert({
        where: { geoDbId: city.geoDbId },
        update: {},
        create: city,
      });
      createdCities.push(created);
      console.log(`✓ Created city: ${created.name}`);
    }

    // Create test brands with required fields
    const brands = [
      {
        name: 'Apple',
        slug: 'apple',
      },
      {
        name: 'Samsung',
        slug: 'samsung',
      },
      {
        name: 'Sony',
        slug: 'sony',
      }
    ];

    const createdBrands = [];
    for (const brand of brands) {
      const created = await prisma.brand.upsert({
        where: { slug: brand.slug },
        update: {},
        create: brand,
      });
      createdBrands.push(created);
      console.log(`✓ Created brand: ${created.name}`);
    }

    // Create test models with required fields
    const models = [
      {
        name: 'AirPods Pro (2nd generation)',
        slug: 'airpods-pro-2nd-gen',
        brandSlug: 'apple',
      },
      {
        name: 'Galaxy Buds2 Pro',
        slug: 'galaxy-buds2-pro',
        brandSlug: 'samsung',
      },
      {
        name: 'WF-1000XM4',
        slug: 'wf-1000xm4',
        brandSlug: 'sony',
      }
    ];

    const createdModels = [];
    for (const model of models) {
      const brand = createdBrands.find(b => b.slug === model.brandSlug);
      if (brand) {
        const created = await prisma.model.upsert({
          where: { slug: model.slug },
          update: {},
          create: {
            name: model.name,
            slug: model.slug,
            brandId: brand.id,
          },
        });
        createdModels.push(created);
        console.log(`✓ Created model: ${created.name}`);
      }
    }

    // Create test user
    const testUser = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        email: 'test@example.com',
        name: 'Test User',
        isVerified: true,
      },
    });
    console.log(`✓ Created user: ${testUser.name}`);

    // Create test listings
    const listings = [
      {
        title: 'Apple AirPods Pro (2nd generation) - Like New',
        description: 'Excellent condition AirPods Pro with all accessories',
        price: 199.99,
        condition: 'LIKE_NEW' as Condition,
        brandSlug: 'apple',
        modelSlug: 'airpods-pro-2nd-gen',
        cityGeoDbId: 1000001,
      },
      {
        title: 'Samsung Galaxy Buds2 Pro - New',
        description: 'Brand new Samsung earbuds, unopened',
        price: 149.99,
        condition: 'NEW' as Condition,
        brandSlug: 'samsung',
        modelSlug: 'galaxy-buds2-pro',
        cityGeoDbId: 1000002,
      },
      {
        title: 'Sony WF-1000XM4 True Wireless Earbuds',
        description: 'Great noise canceling earbuds in good condition',
        price: 179.99,
        condition: 'GOOD' as Condition,
        brandSlug: 'sony',
        modelSlug: 'wf-1000xm4',
        cityGeoDbId: 1000003,
      }
    ];

    for (const listing of listings) {
      const brand = createdBrands.find(b => b.slug === listing.brandSlug);
      const model = createdModels.find(m => m.slug === listing.modelSlug);
      const city = createdCities.find(c => c.geoDbId === listing.cityGeoDbId);
      
      if (brand && model && city) {
        const created = await prisma.listing.create({
          data: {
            title: listing.title,
            description: listing.description,
            price: listing.price,
            currency: 'USD',
            condition: listing.condition,
            listingType: 'EARBUD_PAIR',
            brandId: brand.id,
            modelId: model.id,
            cityId: city.id,
            sellerId: testUser.id,
            status: 'ACTIVE',
            images: [],
            tags: [],
            isVerified: true,
          },
        });
        console.log(`✓ Created listing: ${created.title}`);
      }
    }

    console.log('✅ Basic test data created successfully!');

  } catch (error) {
    console.error('❌ Error creating test data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if executed directly
if (require.main === module) {
  createBasicTestData()
    .then(() => {
      console.log('🎉 Test data seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

export { createBasicTestData };
