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
      metaDescription: 'Find replacement Apple AirPods, charging cases, and accessories on EarbudHub marketplace.',
      status: 'SYSTEM' as const,
      isVerified: true
    },
    {
      name: 'Samsung',
      slug: 'samsung',
      description: 'South Korean electronics giant with Galaxy Buds series.',
      website: 'https://www.samsung.com',
      metaTitle: 'Samsung Galaxy Buds - True Wireless Earbuds',
      metaDescription: 'Shop Samsung Galaxy Buds replacements and accessories on EarbudHub.',
      status: 'SYSTEM' as const,
      isVerified: true
    },
    {
      name: 'Sony',
      slug: 'sony',
      description: 'Japanese electronics company with WF series true wireless earbuds.',
      website: 'https://www.sony.com',
      metaTitle: 'Sony WF Series - Professional Audio Earbuds',
      metaDescription: 'Find Sony WF series earbuds and replacement parts on EarbudHub.',
      status: 'SYSTEM' as const,
      isVerified: true
    },
    {
      name: 'Bose',
      slug: 'bose',
      description: 'Premium audio company known for noise-cancelling technology.',
      website: 'https://www.bose.com',
      metaTitle: 'Bose QuietComfort - Premium Noise Cancelling Earbuds',
      metaDescription: 'Shop Bose QuietComfort earbuds and replacement parts on EarbudHub.',
      status: 'SYSTEM' as const,
      isVerified: true
    },
    {
      name: 'Jabra',
      slug: 'jabra',
      description: 'Danish audio company specializing in professional and consumer audio.',
      website: 'https://www.jabra.com',
      metaTitle: 'Jabra Elite Series - Professional True Wireless Earbuds',
      metaDescription: 'Find Jabra Elite series earbuds and accessories on EarbudHub marketplace.',
      status: 'SYSTEM' as const,
      isVerified: true
    }
  ];

  const createdBrands: any[] = [];
  for (const brand of brands) {
    const createdBrand = await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: {
        name: brand.name,
        description: brand.description,
        website: brand.website,
        metaTitle: brand.metaTitle,
        metaDescription: brand.metaDescription,
        status: brand.status,
        isVerified: brand.isVerified,
      },
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
        update: {
          name: model.name,
          description: model.description,
          hasANC: model.hasANC,
          batteryLife: model.batteryLife,
          caseChargeTime: model.caseChargeTime,
          earbudChargeTime: model.earbudChargeTime,
          waterResistance: model.waterResistance,
          bluetoothVersion: model.bluetoothVersion,
          codecs: model.codecs,
          originalPrice: model.originalPrice,
          currentPrice: model.currentPrice,
          metaTitle: model.metaTitle,
          metaDescription: model.metaDescription,
          currency: 'USD',
          status: 'SYSTEM',
          isVerified: true
        },
        create: {
          ...modelData,
          brandId: brand.id,
          currency: 'USD',
          status: 'SYSTEM',
          isVerified: true
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

  // Seed blog posts
  const blogAuthorEmail = 'admin@earbudhub.com';
  const blogAuthor = await prisma.user.findUnique({ where: { email: blogAuthorEmail } });
  if (blogAuthor) {
    const blogPosts = [
      {
        title: 'AirPods Pro 3 Leaks: Hearing Aid Features and Better ANC Coming in 2025',
        slug: 'airpods-pro-3-leaks-2025',
        excerpt: 'Apple is reportedly preparing a massive update for the AirPods Pro line, focusing on health tracking and revolutionary active noise cancellation.',
        content: `The latest reports from industry insiders suggest that the AirPods Pro 3 will feature a revamped H3 chip, dedicated health sensors for heart rate monitoring, and a new "hearing aid mode" that leverages advanced on-device processing. This move aligns with Apple's broader strategy to position its wearables as essential health devices.

The hearing aid functionality is particularly interesting, as recent FDA deregulations have opened the door for over-the-counter hearing aids. By integrating this into a device millions already own, Apple could disrupt a multibillion-dollar industry.

Additionally, we expect a 20% improvement in active noise cancellation (ANC) and better battery efficiency, potentially pushing playback time past 7 hours on a single charge. The case will likely retain its USB-C port but may see improvements in Find My accuracy with a newer U-series chip.`,
        featuredImage: 'https://images.unsplash.com/photo-1606741965326-cb990ae01bb2?w=800&q=80',
        tags: ['Apple', 'News', 'AirPods'],
        readTime: 6,
        featured: true,
        status: 'PUBLISHED' as const,
        publishedAt: new Date('2026-03-18T10:00:00Z'),
      },
      {
        title: 'The "Single Earbud" Market: Why Replacement Parts are Booming',
        slug: 'single-earbud-market-boom',
        excerpt: 'Losing one earbud used to mean buying a whole new set. Not anymore. Discover why the secondary market for parts is changing the industry.',
        content: `PairAgain data shows a 40% increase in searches for individual left and right buds over the last quarter. Manufacturers like Samsung and Sony are beginning to recognize this "right to repair" movement by making pairing software more accessible, though Apple still maintains a tighter grip on its ecosystem.

For the average consumer, losing a single AirPod Pro used to represent a $100+ loss, often leading to the purchase of a completely new set. However, platforms like PairAgain are enabling a circular economy where users can find an authentic replacement for half the cost.

Industry analysts predict that within the next two years, major brands may even start offering official "single-bud" SKU options at retail, moving away from the all-or-nothing bundles that have dominated the market since 2016.`,
        featuredImage: 'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=800&q=80',
        tags: ['Market Trends', 'Repair', 'Savings'],
        readTime: 5,
        featured: false,
        status: 'PUBLISHED' as const,
        publishedAt: new Date('2026-03-15T14:30:00Z'),
      },
      {
        title: 'Samsung Galaxy Buds 3 Pro Review: The Stem Design Controversy',
        slug: 'samsung-buds-3-pro-review',
        excerpt: 'Samsung abandoned the "bean" for a "stem." Does the new design actually improve microphone quality and fit?',
        content: `Critics were divided when Samsung unveiled the Galaxy Buds 3 Pro with a design strikingly similar to the AirPods Pro. However, real-world testing shows that the dual-driver system and improved blade-lights offer a level of audio fidelity that justifies the hardware shift.

The primary benefit of the stem design is microphone placement. By bringing the beam-forming mics closer to the mouth, Samsung has significantly improved call quality in windy conditions. The new "Blade Lights" aren't just for show either; they provide a visual indicator for pairing status and battery life.

In terms of sound, the Buds 3 Pro feature a sophisticated 2-way speaker system with a high-fidelity tweeter and a planar woofer, delivering crisp highs and deep, controlled bass that rivals the Sony XM5 series.`,
        featuredImage: 'https://images.unsplash.com/photo-1631867934874-4e0719e27668?w=800&q=80',
        tags: ['Samsung', 'Review', 'Hardware'],
        readTime: 8,
        featured: false,
        status: 'PUBLISHED' as const,
        publishedAt: new Date('2026-03-12T09:15:00Z'),
      },
      {
        title: 'Sony WF-1000XM6 Rumors: Smaller Case and Faster Loading',
        slug: 'sony-xm6-rumors',
        excerpt: "Everything we know about Sony's next flagship noise-cancelling earbuds.",
        content: `Sony is expected to announce the WF-1000XM6 later this year. Sources indicate a 15% reduction in case size and a new V2 processor that could potentially double the processing power for ANC filters, aiming to take back the crown from Bose.

Internal test models suggest Sony is moving toward a more ergonomic "hybrid" tip design—combining the comfort of silicone with the isolation of memory foam. This has been a point of contention for XM4 and XM5 users who found the stock foam tips prone to degradation.

Connectivity will also get a boost with Bluetooth 5.4 support and optimized LE Audio, allowing for multi-point connection across three devices simultaneously without the occasional dropout seen in previous generations.`,
        featuredImage: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&q=80',
        tags: ['Sony', 'ANC', 'Leaks'],
        readTime: 4,
        featured: false,
        status: 'PUBLISHED' as const,
        publishedAt: new Date('2026-03-10T16:45:00Z'),
      },
      {
        title: "Bose QuietComfort Ultra: Still the ANC King in 2026?",
        slug: 'bose-qc-ultra-2026-review',
        excerpt: "Bose's \"Immersive Audio\" has been out for a while. We revisit the QC Ultra to see if it holds up against the newer competition.",
        content: `While other brands focus on health and connectivity, Bose remains laser-focused on one thing: silence. In 2026, the QuietComfort Ultra remains the benchmark for low-frequency isolation in urban environments.

The "Immersive Audio" mode, which uses head-tracking to simulate a spatial soundstage, remains a highlight of the experience. Unlike Apple's implementation, Bose's spatial audio works with any source, making it a versatile choice for movie lovers and podcast listeners alike.

Battery life remains its Achilles' heel, however. With Immersive Audio turned on, you can only expect about 4 hours of juice. For long-haul flights, users might find themselves reaching for their XM5s or AirPods Max instead if they don't have time for a quick charge.`,
        featuredImage: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80',
        tags: ['Bose', 'Audio Quality', 'ANC'],
        readTime: 7,
        featured: false,
        status: 'PUBLISHED' as const,
        publishedAt: new Date('2026-03-05T11:20:00Z'),
      },
      {
        title: 'Huawei Loss Care: A Built-In Insurance for Your FreeBuds',
        slug: 'huawei-loss-care-freebuds',
        excerpt: 'Huawei now offers an official loss-protection plan for FreeBuds owners. Is it worth it, and how does it compare to the secondary market?',
        content: `Huawei has quietly rolled out a service called "Loss Care" specifically for its FreeBuds product line. The concept is straightforward: pay a small fee when purchasing your FreeBuds, and if you lose a single earbud or the charging case within the coverage period, Huawei will replace it at a significantly reduced cost.

This is a notable move in the true wireless earbud space, where losing a single bud has traditionally meant either buying a full replacement set or turning to the secondary market. Huawei's approach acknowledges a pain point that platforms like PairAgain were built to solve.

**How it works:** After purchasing the Loss Care add-on, users register their FreeBuds through the Huawei Support app. If a component is lost, they can file a claim and receive a replacement unit for a fraction of the retail price. The service currently covers FreeBuds Pro 3, FreeBuds 6i, and select other models.

**The catch:** Loss Care only covers one replacement per coverage period, and the replacement must be for the same model. It doesn't cover physical damage, water damage, or theft — only accidental loss.

**How it compares to PairAgain:** While Huawei's Loss Care is a manufacturer-backed insurance model, PairAgain's marketplace offers more flexibility. On PairAgain, you can find replacement buds across all brands, negotiate prices, and even trade components you no longer need. For Huawei users specifically, Loss Care is a convenient first line of defense, but PairAgain remains the go-to for cross-brand replacements and cost-conscious buyers.

For full details on Huawei's Loss Care program, visit the [official Huawei Loss Care page](https://consumer.huawei.com/fr/support/huawei-loss-care-for-freebuds/).`,
        featuredImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
        tags: ['Huawei', 'Insurance', 'FreeBuds'],
        readTime: 4,
        featured: false,
        status: 'PUBLISHED' as const,
        publishedAt: new Date('2026-03-22T08:00:00Z'),
      },
    ];

    for (const post of blogPosts) {
      await prisma.blogPost.upsert({
        where: { slug: post.slug },
        update: {
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          featuredImage: post.featuredImage,
          tags: post.tags,
          readTime: post.readTime,
          featured: post.featured,
          status: post.status,
          publishedAt: post.publishedAt,
        },
        create: {
          ...post,
          authorId: blogAuthor.id,
        },
      });
      console.log(`✅ Blog post seeded: ${post.title}`);
    }
  } else {
    console.log('⚠️ Admin user not found — skipping blog post seed');
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
