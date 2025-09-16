import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Hash admin password
  const adminPassword = 'AdminPass123!';
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@earbudhub.com' },
    update: {
      password: hashedPassword,
      name: 'EarbudHub Admin',
      isAdmin: true,
      isVerified: true,
      verificationBadge: 'premium',
      reputation: 1000,
      trustLevel: 'platinum',
      bio: 'EarbudHub platform administrator',
    },
    create: {
      email: 'admin@earbudhub.com',
      password: hashedPassword,
      name: 'EarbudHub Admin',
      isAdmin: true,
      isVerified: true,
      verificationBadge: 'premium',
      reputation: 1000,
      trustLevel: 'platinum',
      bio: 'EarbudHub platform administrator',
    },
  });

  console.log('✅ Admin user created:', adminUser.email);
  console.log('🔐 Admin password: AdminPass123!');

  // Create brands
  const brands = [
    {
      name: 'Apple',
      slug: 'apple',
      description: 'Premium consumer electronics company known for AirPods and other audio products.',
      website: 'https://www.apple.com',
      metaTitle: 'Apple AirPods - Premium True Wireless Earbuds',
      metaDescription: 'Find replacement Apple AirPods, charging cases, and accessories on EarbudHub marketplace.'
    },
    {
      name: 'Samsung',
      slug: 'samsung',
      description: 'South Korean electronics giant with Galaxy Buds series.',
      website: 'https://www.samsung.com',
      metaTitle: 'Samsung Galaxy Buds - True Wireless Earbuds',
      metaDescription: 'Shop Samsung Galaxy Buds replacements and accessories on EarbudHub.'
    },
    {
      name: 'Sony',
      slug: 'sony',
      description: 'Japanese electronics company with WF series true wireless earbuds.',
      website: 'https://www.sony.com',
      metaTitle: 'Sony WF Series - Professional Audio Earbuds',
      metaDescription: 'Find Sony WF series earbuds and replacement parts on EarbudHub.'
    },
    {
      name: 'Bose',
      slug: 'bose',
      description: 'Premium audio company known for noise-cancelling technology.',
      website: 'https://www.bose.com',
      metaTitle: 'Bose QuietComfort - Premium Noise Cancelling Earbuds',
      metaDescription: 'Shop Bose QuietComfort earbuds and replacement parts on EarbudHub.'
    },
    {
      name: 'Jabra',
      slug: 'jabra',
      description: 'Danish audio company specializing in professional and consumer audio.',
      website: 'https://www.jabra.com',
      metaTitle: 'Jabra Elite Series - Professional True Wireless Earbuds',
      metaDescription: 'Find Jabra Elite series earbuds and accessories on EarbudHub marketplace.'
    }
  ];

  const createdBrands: any[] = [];
  for (const brand of brands) {
    const createdBrand = await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: {},
      create: brand,
    });
    createdBrands.push(createdBrand);
    console.log(`✅ Brand created: ${createdBrand.name}`);
  }

  // Create models for each brand
  const models = [
    // Apple models
    {
      name: 'AirPods Pro (2nd generation)',
      slug: 'apple-airpods-pro-2nd-gen',
      brandName: 'Apple',
      description: 'Premium true wireless earbuds with adaptive ANC and spatial audio.',
      hasANC: true,
      batteryLife: 6,
      caseChargeTime: 60,
      earbudChargeTime: 5,
      waterResistance: 'IPX4',
      bluetoothVersion: '5.3',
      codecs: ['SBC', 'AAC'],
      originalPrice: 249.00,
      currentPrice: 229.00,
      metaTitle: 'Apple AirPods Pro 2nd Gen - Premium ANC Earbuds',
      metaDescription: 'Find replacement Apple AirPods Pro 2nd generation earbuds and charging cases.'
    },
    {
      name: 'AirPods (3rd generation)',
      slug: 'apple-airpods-3rd-gen',
      brandName: 'Apple',
      description: 'True wireless earbuds with spatial audio and improved design.',
      hasANC: false,
      batteryLife: 6,
      caseChargeTime: 60,
      earbudChargeTime: 5,
      waterResistance: 'IPX4',
      bluetoothVersion: '5.0',
      codecs: ['SBC', 'AAC'],
      originalPrice: 179.00,
      currentPrice: 169.00
    },
    // Samsung models
    {
      name: 'Galaxy Buds2 Pro',
      slug: 'samsung-galaxy-buds2-pro',
      brandName: 'Samsung',
      description: 'Premium true wireless earbuds with intelligent ANC.',
      hasANC: true,
      batteryLife: 8,
      caseChargeTime: 60,
      earbudChargeTime: 5,
      waterResistance: 'IPX7',
      bluetoothVersion: '5.3',
      codecs: ['SBC', 'AAC', 'Samsung Scalable'],
      originalPrice: 229.99,
      currentPrice: 199.99
    },
    // Sony models
    {
      name: 'WF-1000XM4',
      slug: 'sony-wf-1000xm4',
      brandName: 'Sony',
      description: 'Industry-leading noise canceling true wireless earbuds.',
      hasANC: true,
      batteryLife: 8,
      caseChargeTime: 180,
      earbudChargeTime: 5,
      waterResistance: 'IPX4',
      bluetoothVersion: '5.2',
      codecs: ['SBC', 'AAC', 'LDAC'],
      originalPrice: 279.99,
      currentPrice: 249.99
    }
  ];

  for (const model of models) {
    const brand = createdBrands.find(b => b.name === model.brandName);
    if (brand) {
      const { brandName, ...modelData } = model;
      await prisma.model.upsert({
        where: { slug: model.slug },
        update: {},
        create: {
          ...modelData,
          brandId: brand.id,
          currency: 'USD'
        },
      });
      console.log(`✅ Model created: ${model.name}`);
    }
  }

  // Create sample cities
  const cities = [
    {
      geoDbId: 1850147,
      name: 'Tokyo',
      country: 'Japan',
      countryCode: 'JP',
      region: 'Tokyo',
      regionCode: 'JP-13',
      latitude: 35.6762,
      longitude: 139.6503,
      population: 13960000,
      timezone: 'Asia/Tokyo',
      displayName: 'Tokyo, Japan',
      searchText: 'tokyo japan'
    },
    {
      geoDbId: 2968815,
      name: 'Paris',
      country: 'France',
      countryCode: 'FR',
      region: 'Île-de-France',
      regionCode: 'FR-IDF',
      latitude: 48.8566,
      longitude: 2.3522,
      population: 2161000,
      timezone: 'Europe/Paris',
      displayName: 'Paris, France',
      searchText: 'paris france'
    },
    {
      geoDbId: 5128581,
      name: 'New York',
      country: 'United States',
      countryCode: 'US',
      region: 'New York',
      regionCode: 'US-NY',
      latitude: 40.7128,
      longitude: -74.0060,
      population: 8336817,
      timezone: 'America/New_York',
      displayName: 'New York, NY, USA',
      searchText: 'new york ny usa'
    },
    {
      geoDbId: 2643743,
      name: 'London',
      country: 'United Kingdom',
      countryCode: 'GB',
      region: 'England',
      regionCode: 'GB-ENG',
      latitude: 51.5074,
      longitude: -0.1278,
      population: 8982000,
      timezone: 'Europe/London',
      displayName: 'London, United Kingdom',
      searchText: 'london united kingdom uk'
    }
  ];

  for (const city of cities) {
    await prisma.city.upsert({
      where: { geoDbId: city.geoDbId },
      update: {},
      create: city,
    });
    console.log(`✅ City created: ${city.displayName}`);
  }

  // Create system configuration
  const systemConfigs = [
    {
      key: 'rating_weights',
      value: JSON.stringify({
        comfort: 0.15,
        autonomy: 0.20,
        caseReloadTime: 0.05,
        earbudReloadTime: 0.05,
        musicQuality: 0.20,
        videoQuality: 0.10,
        gameQuality: 0.05,
        avLag: 0.05,
        callOverall: 0.15
      }),
      description: 'Weights for calculating overall rating scores'
    },
    {
      key: 'legal_waiting_periods',
      value: JSON.stringify({
        FRANCE: 1095, // 3 years in days
        US_CALIFORNIA: 90,
        US_NEW_YORK: 90,
        US_TEXAS: 90,
        US_FLORIDA: 90,
        US_OTHER: 90,
        UK: 90,
        GERMANY: 90,
        OTHER: 90
      }),
      description: 'Legal waiting periods for found items by jurisdiction (in days)'
    }
  ];

  for (const config of systemConfigs) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: { value: config.value },
      create: config,
    });
    console.log(`✅ System config created: ${config.key}`);
  }

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
