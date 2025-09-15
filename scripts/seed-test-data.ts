import { PrismaClient, Condition } from '@prisma/client';

const prisma = new PrismaClient();

const testData = {
  cities: [
    { name: 'New York', state: 'NY', country: 'USA' },
    { name: 'Los Angeles', state: 'CA', country: 'USA' },
    { name: 'Chicago', state: 'IL', country: 'USA' },
    { name: 'Houston', state: 'TX', country: 'USA' },
    { name: 'Phoenix', state: 'AZ', country: 'USA' },
    { name: 'Philadelphia', state: 'PA', country: 'USA' },
    { name: 'San Antonio', state: 'TX', country: 'USA' },
    { name: 'San Diego', state: 'CA', country: 'USA' },
  ],
  
  brands: [
    { name: 'Apple' },
    { name: 'Samsung' },
    { name: 'Sony' },
    { name: 'Bose' },
    { name: 'Sennheiser' },
    { name: 'JBL' },
    { name: 'Beats' },
    { name: 'Audio-Technica' },
    { name: 'Jabra' },
    { name: 'Anker' },
  ],
  
  models: [
    // Apple models
    { name: 'AirPods Pro (2nd generation)', brandName: 'Apple' },
    { name: 'AirPods (3rd generation)', brandName: 'Apple' },
    { name: 'AirPods Max', brandName: 'Apple' },
    { name: 'AirPods (2nd generation)', brandName: 'Apple' },
    
    // Samsung models
    { name: 'Galaxy Buds2 Pro', brandName: 'Samsung' },
    { name: 'Galaxy Buds2', brandName: 'Samsung' },
    { name: 'Galaxy Buds Live', brandName: 'Samsung' },
    { name: 'Galaxy Buds+', brandName: 'Samsung' },
    
    // Sony models
    { name: 'WF-1000XM4', brandName: 'Sony' },
    { name: 'WF-1000XM3', brandName: 'Sony' },
    { name: 'WH-1000XM5', brandName: 'Sony' },
    { name: 'WH-1000XM4', brandName: 'Sony' },
    
    // Bose models
    { name: 'QuietComfort Earbuds', brandName: 'Bose' },
    { name: 'Sport Earbuds', brandName: 'Bose' },
    { name: 'QuietComfort 45', brandName: 'Bose' },
    { name: 'SoundLink Revolve+', brandName: 'Bose' },
    
    // Other brands
    { name: 'Momentum True Wireless 3', brandName: 'Sennheiser' },
    { name: 'Live Pro 2', brandName: 'JBL' },
    { name: 'Studio3 Wireless', brandName: 'Beats' },
    { name: 'ATH-M50xBT2', brandName: 'Audio-Technica' },
  ],
  
  users: [
    {
      email: 'john.doe@example.com',
      name: 'John Doe',
      isVerified: true,
    },
    {
      email: 'jane.smith@example.com',
      name: 'Jane Smith',
      isVerified: true,
    },
    {
      email: 'mike.johnson@example.com',
      name: 'Mike Johnson',
      isVerified: false,
    },
    {
      email: 'sarah.wilson@example.com',
      name: 'Sarah Wilson',
      isVerified: true,
    },
    {
      email: 'david.brown@example.com',
      name: 'David Brown',
      isVerified: false,
    },
  ],
};

const listings = [
  {
    title: 'Apple AirPods Pro (2nd generation) - Excellent Condition',
    description: 'Barely used AirPods Pro with all original accessories. Excellent noise cancellation and sound quality.',
    price: 199.99,
    currency: 'USD',
    condition: 'LIKE_NEW' as Condition,
    brandName: 'Apple',
    modelName: 'AirPods Pro (2nd generation)',
    cityName: 'New York',
    sellerEmail: 'john.doe@example.com',
    images: ['/placeholder-airpods-pro.jpg'],
    tags: ['wireless', 'noise-cancelling', 'apple', 'premium'],
  },
  {
    title: 'Samsung Galaxy Buds2 Pro - Like New',
    description: 'Premium wireless earbuds with active noise cancellation. Used only a few times.',
    price: 149.99,
    currency: 'USD',
    condition: 'LIKE_NEW' as Condition,
    brandName: 'Samsung',
    modelName: 'Galaxy Buds2 Pro',
    cityName: 'Los Angeles',
    sellerEmail: 'jane.smith@example.com',
    images: ['/placeholder-galaxy-buds.jpg'],
    tags: ['wireless', 'samsung', 'anc', 'premium'],
  },
  {
    title: 'Sony WF-1000XM4 True Wireless Earbuds',
    description: 'Industry-leading noise canceling with dual microphones. Great for music and calls.',
    price: 179.99,
    currency: 'USD',
    condition: 'GOOD' as Condition,
    brandName: 'Sony',
    modelName: 'WF-1000XM4',
    cityName: 'Chicago',
    sellerEmail: 'mike.johnson@example.com',
    images: ['/placeholder-sony-wf.jpg'],
    tags: ['wireless', 'sony', 'noise-cancelling', 'premium'],
  },
  {
    title: 'Bose QuietComfort Earbuds - New in Box',
    description: 'Brand new, unopened Bose QuietComfort Earbuds. Amazing noise cancellation.',
    price: 199.99,
    currency: 'USD',
    condition: 'NEW' as Condition,
    brandName: 'Bose',
    modelName: 'QuietComfort Earbuds',
    cityName: 'Houston',
    sellerEmail: 'sarah.wilson@example.com',
    images: ['/placeholder-bose-qc.jpg'],
    tags: ['wireless', 'bose', 'new', 'noise-cancelling'],
  },
  {
    title: 'Apple AirPods (3rd generation) - Good Condition',
    description: 'Regular use but well maintained. All functions work perfectly.',
    price: 129.99,
    currency: 'USD',
    condition: 'GOOD' as Condition,
    brandName: 'Apple',
    modelName: 'AirPods (3rd generation)',
    cityName: 'Phoenix',
    sellerEmail: 'david.brown@example.com',
    images: ['/placeholder-airpods-3.jpg'],
    tags: ['wireless', 'apple', 'affordable'],
  },
  {
    title: 'JBL Live Pro 2 - Excellent Deal',
    description: 'Great sound quality with adaptive noise cancelling. Perfect for workouts.',
    price: 89.99,
    currency: 'USD',
    condition: 'GOOD' as Condition,
    brandName: 'JBL',
    modelName: 'Live Pro 2',
    cityName: 'Philadelphia',
    sellerEmail: 'john.doe@example.com',
    images: ['/placeholder-jbl-live.jpg'],
    tags: ['wireless', 'jbl', 'sports', 'affordable'],
  },
  {
    title: 'Beats Studio3 Wireless Over-Ear Headphones',
    description: 'Premium over-ear headphones with pure adaptive noise canceling.',
    price: 159.99,
    currency: 'USD',
    condition: 'LIKE_NEW' as Condition,
    brandName: 'Beats',
    modelName: 'Studio3 Wireless',
    cityName: 'San Antonio',
    sellerEmail: 'jane.smith@example.com',
    images: ['/placeholder-beats-studio.jpg'],
    tags: ['wireless', 'beats', 'over-ear', 'bass'],
  },
  {
    title: 'Sennheiser Momentum True Wireless 3',
    description: 'Audiophile-grade sound quality in a compact wireless design.',
    price: 169.99,
    currency: 'USD',
    condition: 'GOOD' as Condition,
    brandName: 'Sennheiser',
    modelName: 'Momentum True Wireless 3',
    cityName: 'San Diego',
    sellerEmail: 'mike.johnson@example.com',
    images: ['/placeholder-sennheiser.jpg'],
    tags: ['wireless', 'sennheiser', 'audiophile', 'premium'],
  },
  {
    title: 'Apple AirPods Max - Space Gray',
    description: 'Premium over-ear headphones with spatial audio and adaptive EQ.',
    price: 399.99,
    currency: 'USD',
    condition: 'LIKE_NEW' as Condition,
    brandName: 'Apple',
    modelName: 'AirPods Max',
    cityName: 'New York',
    sellerEmail: 'sarah.wilson@example.com',
    images: ['/placeholder-airpods-max.jpg'],
    tags: ['wireless', 'apple', 'premium', 'over-ear', 'spatial-audio'],
  },
  {
    title: 'Samsung Galaxy Buds+ - Cosmic Black',
    description: 'Long-lasting battery life and clear sound quality. Great for daily use.',
    price: 79.99,
    currency: 'USD',
    condition: 'FAIR' as Condition,
    brandName: 'Samsung',
    modelName: 'Galaxy Buds+',
    cityName: 'Los Angeles',
    sellerEmail: 'david.brown@example.com',
    images: ['/placeholder-galaxy-buds-plus.jpg'],
    tags: ['wireless', 'samsung', 'affordable', 'long-battery'],
  },
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Create cities
    console.log('Creating cities...');
    const createdCities = [];
    for (const city of testData.cities) {
      const createdCity = await prisma.city.upsert({
        where: { name: city.name },
        update: {},
        create: city,
      });
      createdCities.push(createdCity);
    }

    // Create brands
    console.log('Creating brands...');
    const createdBrands = [];
    for (const brand of testData.brands) {
      const createdBrand = await prisma.brand.upsert({
        where: { name: brand.name },
        update: {},
        create: brand,
      });
      createdBrands.push(createdBrand);
    }

    // Create models
    console.log('Creating models...');
    const createdModels = [];
    for (const model of testData.models) {
      const brand = createdBrands.find(b => b.name === model.brandName);
      if (brand) {
        const createdModel = await prisma.model.upsert({
          where: { 
            name_brandId: {
              name: model.name,
              brandId: brand.id
            }
          },
          update: {},
          create: {
            name: model.name,
            brandId: brand.id,
          },
        });
        createdModels.push(createdModel);
      }
    }

    // Create users
    console.log('Creating users...');
    const createdUsers = [];
    for (const user of testData.users) {
      const createdUser = await prisma.user.upsert({
        where: { email: user.email },
        update: {},
        create: user,
      });
      createdUsers.push(createdUser);
    }

    // Create listings
    console.log('Creating listings...');
    for (const listing of listings) {
      const brand = createdBrands.find(b => b.name === listing.brandName);
      const model = createdModels.find(m => m.name === listing.modelName);
      const city = createdCities.find(c => c.name === listing.cityName);
      const seller = createdUsers.find(u => u.email === listing.sellerEmail);

      if (brand && model && city && seller) {
        await prisma.listing.create({
          data: {
            title: listing.title,
            description: listing.description,
            price: listing.price,
            currency: listing.currency,
            condition: listing.condition,
            brandId: brand.id,
            modelId: model.id,
            cityId: city.id,
            sellerId: seller.id,
            images: listing.images,
            tags: listing.tags,
            isVerified: seller.isVerified,
            status: 'ACTIVE',
          },
        });
      }
    }

    console.log('✅ Database seeding completed successfully!');
    console.log(`Created:`);
    console.log(`- ${createdCities.length} cities`);
    console.log(`- ${createdBrands.length} brands`);
    console.log(`- ${createdModels.length} models`);
    console.log(`- ${createdUsers.length} users`);
    console.log(`- ${listings.length} listings`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('🎉 Seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

export { seedDatabase };
