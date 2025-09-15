#!/usr/bin/env node
"use strict";
/**
 * Seed popular earbud brands and models
 * Includes most sold/popular items + Huawei FreeBuds as requested
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedPopularEarbuds = seedPopularEarbuds;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const popularEarbudsData = {
    brands: [
        { name: 'Apple', slug: 'apple', status: client_1.BrandStatus.SYSTEM },
        { name: 'Samsung', slug: 'samsung', status: client_1.BrandStatus.SYSTEM },
        { name: 'Sony', slug: 'sony', status: client_1.BrandStatus.SYSTEM },
        { name: 'Bose', slug: 'bose', status: client_1.BrandStatus.SYSTEM },
        { name: 'Sennheiser', slug: 'sennheiser', status: client_1.BrandStatus.SYSTEM },
        { name: 'JBL', slug: 'jbl', status: client_1.BrandStatus.SYSTEM },
        { name: 'Beats', slug: 'beats', status: client_1.BrandStatus.SYSTEM },
        { name: 'Audio-Technica', slug: 'audio-technica', status: client_1.BrandStatus.SYSTEM },
        { name: 'Jabra', slug: 'jabra', status: client_1.BrandStatus.SYSTEM },
        { name: 'Anker', slug: 'anker', status: client_1.BrandStatus.SYSTEM },
        { name: 'Huawei', slug: 'huawei', status: client_1.BrandStatus.SYSTEM }, // Added as requested
        { name: 'Nothing', slug: 'nothing', status: client_1.BrandStatus.SYSTEM },
        { name: 'OnePlus', slug: 'oneplus', status: client_1.BrandStatus.SYSTEM },
    ],
    models: [
        // Apple - Most Popular
        {
            name: 'AirPods Pro (2nd generation)',
            slug: 'airpods-pro-2nd-gen',
            brandSlug: 'apple',
            hasANC: true,
            batteryLife: 6,
            originalPrice: 249.00,
            currentPrice: 199.00
        },
        {
            name: 'AirPods (3rd generation)',
            slug: 'airpods-3rd-gen',
            brandSlug: 'apple',
            hasANC: false,
            batteryLife: 6,
            originalPrice: 179.00,
            currentPrice: 149.00
        },
        {
            name: 'AirPods Max',
            slug: 'airpods-max',
            brandSlug: 'apple',
            hasANC: true,
            batteryLife: 20,
            originalPrice: 549.00,
            currentPrice: 449.00
        },
        {
            name: 'AirPods (2nd generation)',
            slug: 'airpods-2nd-gen',
            brandSlug: 'apple',
            hasANC: false,
            batteryLife: 5,
            originalPrice: 129.00,
            currentPrice: 89.00
        },
        // Samsung - Top Models
        {
            name: 'Galaxy Buds2 Pro',
            slug: 'galaxy-buds2-pro',
            brandSlug: 'samsung',
            hasANC: true,
            batteryLife: 8,
            originalPrice: 229.99,
            currentPrice: 169.99
        },
        {
            name: 'Galaxy Buds2',
            slug: 'galaxy-buds2',
            brandSlug: 'samsung',
            hasANC: true,
            batteryLife: 7.5,
            originalPrice: 149.99,
            currentPrice: 99.99
        },
        {
            name: 'Galaxy Buds Live',
            slug: 'galaxy-buds-live',
            brandSlug: 'samsung',
            hasANC: true,
            batteryLife: 8,
            originalPrice: 169.99,
            currentPrice: 89.99
        },
        {
            name: 'Galaxy Buds+',
            slug: 'galaxy-buds-plus',
            brandSlug: 'samsung',
            hasANC: false,
            batteryLife: 11,
            originalPrice: 149.99,
            currentPrice: 79.99
        },
        // Sony - Premium Models
        {
            name: 'WF-1000XM4',
            slug: 'wf-1000xm4',
            brandSlug: 'sony',
            hasANC: true,
            batteryLife: 8,
            originalPrice: 279.99,
            currentPrice: 199.99
        },
        {
            name: 'WF-1000XM3',
            slug: 'wf-1000xm3',
            brandSlug: 'sony',
            hasANC: true,
            batteryLife: 6,
            originalPrice: 229.99,
            currentPrice: 129.99
        },
        {
            name: 'WH-1000XM5',
            slug: 'wh-1000xm5',
            brandSlug: 'sony',
            hasANC: true,
            batteryLife: 30,
            originalPrice: 399.99,
            currentPrice: 329.99
        },
        // Bose - Premium Audio
        {
            name: 'QuietComfort Earbuds',
            slug: 'quietcomfort-earbuds',
            brandSlug: 'bose',
            hasANC: true,
            batteryLife: 6,
            originalPrice: 279.00,
            currentPrice: 199.00
        },
        {
            name: 'Sport Earbuds',
            slug: 'sport-earbuds',
            brandSlug: 'bose',
            hasANC: false,
            batteryLife: 5,
            originalPrice: 179.00,
            currentPrice: 129.00
        },
        {
            name: 'QuietComfort 45',
            slug: 'quietcomfort-45',
            brandSlug: 'bose',
            hasANC: true,
            batteryLife: 24,
            originalPrice: 329.00,
            currentPrice: 249.00
        },
        // Huawei - As requested
        {
            name: 'FreeBuds Pro 3',
            slug: 'freebuds-pro-3',
            brandSlug: 'huawei',
            hasANC: true,
            batteryLife: 6.5,
            originalPrice: 199.99,
            currentPrice: 149.99
        },
        {
            name: 'FreeBuds Pro 4',
            slug: 'freebuds-pro-4',
            brandSlug: 'huawei',
            hasANC: true,
            batteryLife: 7,
            originalPrice: 229.99,
            currentPrice: 179.99
        },
        {
            name: 'FreeBuds Pro 2',
            slug: 'freebuds-pro-2',
            brandSlug: 'huawei',
            hasANC: true,
            batteryLife: 6,
            originalPrice: 179.99,
            currentPrice: 119.99
        },
        // JBL - Popular Budget
        {
            name: 'Live Pro 2',
            slug: 'live-pro-2',
            brandSlug: 'jbl',
            hasANC: true,
            batteryLife: 10,
            originalPrice: 149.95,
            currentPrice: 99.95
        },
        {
            name: 'Tune 230NC TWS',
            slug: 'tune-230nc-tws',
            brandSlug: 'jbl',
            hasANC: true,
            batteryLife: 8,
            originalPrice: 99.95,
            currentPrice: 69.95
        },
        // Beats
        {
            name: 'Studio3 Wireless',
            slug: 'studio3-wireless',
            brandSlug: 'beats',
            hasANC: true,
            batteryLife: 40,
            originalPrice: 349.95,
            currentPrice: 199.95
        },
        {
            name: 'Powerbeats Pro',
            slug: 'powerbeats-pro',
            brandSlug: 'beats',
            hasANC: false,
            batteryLife: 9,
            originalPrice: 249.95,
            currentPrice: 179.95
        },
        // Sennheiser
        {
            name: 'Momentum True Wireless 3',
            slug: 'momentum-true-wireless-3',
            brandSlug: 'sennheiser',
            hasANC: true,
            batteryLife: 7,
            originalPrice: 249.95,
            currentPrice: 199.95
        },
        // Nothing
        {
            name: 'Ear (2)',
            slug: 'ear-2',
            brandSlug: 'nothing',
            hasANC: true,
            batteryLife: 6.3,
            originalPrice: 149.00,
            currentPrice: 119.00
        },
        // OnePlus
        {
            name: 'Buds Pro 2',
            slug: 'buds-pro-2',
            brandSlug: 'oneplus',
            hasANC: true,
            batteryLife: 6,
            originalPrice: 179.00,
            currentPrice: 129.00
        },
    ]
};
async function seedPopularEarbuds() {
    try {
        console.log('🎧 Seeding popular earbud brands and models...');
        // Create brands
        const createdBrands = new Map();
        for (const brandData of popularEarbudsData.brands) {
            const brand = await prisma.brand.upsert({
                where: { slug: brandData.slug },
                update: {},
                create: {
                    name: brandData.name,
                    slug: brandData.slug,
                    status: brandData.status,
                    isVerified: true,
                },
            });
            createdBrands.set(brandData.slug, brand);
            console.log(`✓ Created brand: ${brand.name}`);
        }
        // Create models
        let modelCount = 0;
        for (const modelData of popularEarbudsData.models) {
            const brand = createdBrands.get(modelData.brandSlug);
            if (brand) {
                // Check if model already exists with this brandId and name
                const existingModel = await prisma.model.findFirst({
                    where: {
                        brandId: brand.id,
                        name: modelData.name,
                    },
                });
                if (!existingModel) {
                    const model = await prisma.model.create({
                        data: {
                            name: modelData.name,
                            slug: modelData.slug,
                            brandId: brand.id,
                            status: client_1.ModelStatus.SYSTEM,
                            isVerified: true,
                            hasANC: modelData.hasANC,
                            batteryLife: modelData.batteryLife,
                            originalPrice: modelData.originalPrice,
                            currentPrice: modelData.currentPrice,
                        },
                    });
                    modelCount++;
                    console.log(`✓ Created model: ${model.name} (${brand.name})`);
                }
                else {
                    console.log(`⚠ Skipped model: ${modelData.name} (${brand.name}) - already exists`);
                }
            }
        }
        console.log(`\n🎉 Successfully seeded:`);
        console.log(`- ${createdBrands.size} popular earbud brands`);
        console.log(`- ${modelCount} popular earbud models`);
        console.log(`\n📋 Included brands:`);
        popularEarbudsData.brands.forEach(brand => console.log(`  • ${brand.name}`));
        console.log(`\n🔥 Featured Huawei models as requested:`);
        console.log(`  • FreeBuds Pro 3`);
        console.log(`  • FreeBuds Pro 4`);
    }
    catch (error) {
        console.error('❌ Error seeding popular earbuds:', error);
        throw error;
    }
    finally {
        await prisma.$disconnect();
    }
}
// Run seeding if this file is executed directly
if (require.main === module) {
    seedPopularEarbuds()
        .then(() => {
        console.log('\n✅ Popular earbuds seeding completed!');
        process.exit(0);
    })
        .catch((error) => {
        console.error('\n💥 Seeding failed:', error);
        process.exit(1);
    });
}
