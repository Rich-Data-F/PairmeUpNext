#!/usr/bin/env node
"use strict";
/**
 * Seed test listings for our brands and models
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedTestListings = seedTestListings;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const testListingsData = [
    // Huawei listings for testing
    {
        title: "Huawei FreeBuds Pro 3 - Excellent Condition",
        description: "Barely used Huawei FreeBuds Pro 3 with excellent sound quality and ANC. Comes with original case and charging cable.",
        brandSlug: "huawei",
        modelSlug: "freebuds-pro-3",
        type: "EARBUD_PAIR",
        condition: "LIKE_NEW",
        price: 129.99,
        currency: "USD",
        isVerified: true,
        cityName: "New York",
    },
    {
        title: "Huawei FreeBuds Pro 4 - Latest Model",
        description: "Brand new Huawei FreeBuds Pro 4 with 7h battery life and advanced noise cancellation. Still in original packaging.",
        brandSlug: "huawei",
        modelSlug: "freebuds-pro-4",
        type: "EARBUD_PAIR",
        condition: "NEW",
        price: 169.99,
        currency: "USD",
        isVerified: true,
        cityName: "San Francisco",
    },
    // Apple listings
    {
        title: "AirPods Pro 2nd Gen - Perfect Working Order",
        description: "Apple AirPods Pro 2nd generation with spatial audio and MagSafe charging case. Great condition.",
        brandSlug: "apple",
        modelSlug: "airpods-pro-2nd-gen",
        type: "EARBUD_PAIR",
        condition: "GOOD",
        price: 179.99,
        currency: "USD",
        isVerified: true,
        cityName: "Los Angeles",
    },
    {
        title: "AirPods Max Over-Ear Headphones - Space Gray",
        description: "Apple AirPods Max headphones in Space Gray color. Excellent condition with all original accessories.",
        brandSlug: "apple",
        modelSlug: "airpods-max",
        type: "EARBUD_PAIR", // Note: treating as pair for consistency
        condition: "GOOD",
        price: 400.00,
        currency: "USD",
        isVerified: false,
        cityName: "Chicago",
    },
    // Samsung listings
    {
        title: "Samsung Galaxy Buds2 Pro - Graphite",
        description: "Samsung Galaxy Buds2 Pro in Graphite color. Excellent ANC and great for Samsung phone users.",
        brandSlug: "samsung",
        modelSlug: "galaxy-buds2-pro",
        type: "EARBUD_PAIR",
        condition: "LIKE_NEW",
        price: 149.99,
        currency: "USD",
        isVerified: true,
        cityName: "Austin",
    },
    // Sony listings
    {
        title: "Sony WF-1000XM4 - Industry Leading ANC",
        description: "Sony WF-1000XM4 earbuds with industry-leading noise cancellation. Perfect for audiophiles.",
        brandSlug: "sony",
        modelSlug: "wf-1000xm4",
        type: "EARBUD_PAIR",
        condition: "GOOD",
        price: 189.99,
        currency: "USD",
        isVerified: true,
        cityName: "Seattle",
    },
    // Nothing listings
    {
        title: "Nothing Ear (2) - Transparent Design",
        description: "Nothing Ear (2) with unique transparent design and Hi-Res Audio certification.",
        brandSlug: "nothing",
        modelSlug: "ear-2",
        type: "EARBUD_PAIR",
        condition: "NEW",
        price: 99.99,
        currency: "USD",
        isVerified: false,
        cityName: "Portland",
    },
    // Single earbud listings
    {
        title: "Left AirPod Pro 2nd Gen - Replacement",
        description: "Single left AirPod Pro 2nd generation for replacement. Perfect working condition.",
        brandSlug: "apple",
        modelSlug: "airpods-pro-2nd-gen",
        type: "EARBUD_LEFT",
        condition: "GOOD",
        price: 89.99,
        currency: "USD",
        isVerified: true,
        cityName: "Miami",
    },
];
async function seedTestListings() {
    try {
        console.log('📦 Seeding test listings for search functionality...');
        // Get default user and city data
        const defaultUser = await prisma.user.findFirst();
        if (!defaultUser) {
            throw new Error('No users found. Please seed users first.');
        }
        const defaultCity = await prisma.city.findFirst();
        if (!defaultCity) {
            throw new Error('No cities found. Please seed cities first.');
        }
        let createdCount = 0;
        for (const listingData of testListingsData) {
            // Find brand and model
            const brand = await prisma.brand.findUnique({
                where: { slug: listingData.brandSlug }
            });
            const model = await prisma.model.findUnique({
                where: { slug: listingData.modelSlug }
            });
            if (!brand || !model) {
                console.log(`⚠ Skipping ${listingData.title} - brand or model not found`);
                continue;
            }
            // Create listing
            const listing = await prisma.listing.create({
                data: {
                    title: listingData.title,
                    description: listingData.description,
                    brandId: brand.id,
                    modelId: model.id,
                    type: listingData.type,
                    condition: listingData.condition,
                    price: listingData.price,
                    currency: listingData.currency,
                    isVerified: listingData.isVerified,
                    sellerId: defaultUser.id,
                    cityId: defaultCity.id,
                    status: 'ACTIVE',
                    publishedAt: new Date(),
                    images: [],
                },
            });
            createdCount++;
            console.log(`✓ Created listing: ${listing.title}`);
        }
        console.log(`\n🎉 Successfully created ${createdCount} test listings!`);
        console.log('\n📊 Listing breakdown:');
        const listingStats = await Promise.all([
            prisma.listing.count({ where: { type: client_1.ListingType.EARBUD_PAIR } }),
            prisma.listing.count({ where: { type: client_1.ListingType.EARBUD_LEFT } }),
            prisma.listing.count({ where: { brand: { name: 'Huawei' } } }),
            prisma.listing.count(),
        ]);
        console.log(`  • Earbud Pairs: ${listingStats[0]} listings`);
        console.log(`  • Single Earbuds: ${listingStats[1]} listings`);
        console.log(`  • Huawei: ${listingStats[2]} listings`);
        console.log(`  • Total: ${listingStats[3]} listings`);
    }
    catch (error) {
        console.error('❌ Error seeding test listings:', error);
        throw error;
    }
    finally {
        await prisma.$disconnect();
    }
}
// Run seeding if this file is executed directly
if (require.main === module) {
    seedTestListings()
        .then(() => {
        console.log('\n✅ Test listings seeding completed!');
        process.exit(0);
    })
        .catch((error) => {
        console.error('\n💥 Seeding failed:', error);
        process.exit(1);
    });
}
