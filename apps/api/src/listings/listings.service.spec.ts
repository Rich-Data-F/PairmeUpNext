import { ListingsService } from './listings.service';

describe('ListingsService', () => {
  it('passes extended listing fields through to prisma.listing.create', async () => {
    const mockPrisma: any = {
      proposedBrand: { findUnique: jest.fn(), findFirst: jest.fn(), create: jest.fn() },
      brand: { findFirst: jest.fn(), create: jest.fn() },
      proposedModel: { findFirst: jest.fn(), create: jest.fn() },
      model: { findFirst: jest.fn(), create: jest.fn() },
      city: { findUnique: jest.fn() },
      listing: { create: jest.fn() },
    };

    // Minimal mocks for the flows where customBrand/customModel create temp objects
    mockPrisma.proposedBrand.findUnique.mockResolvedValue(null);
    mockPrisma.proposedBrand.findFirst.mockResolvedValue(null);
    mockPrisma.proposedBrand.create.mockResolvedValue({ id: 'pb-1', name: 'TestBrand' });
    mockPrisma.brand.findFirst.mockResolvedValue(null);
    mockPrisma.brand.create.mockResolvedValue({ id: 'temp-brand-1' });
    mockPrisma.proposedModel.findFirst.mockResolvedValue(null);
    mockPrisma.proposedModel.create.mockResolvedValue({ id: 'pm-1', name: 'TestModel' });
    mockPrisma.model.findFirst.mockResolvedValue(null);
    mockPrisma.model.create.mockResolvedValue({ id: 'temp-model-1' });
    mockPrisma.city.findUnique.mockResolvedValue({ id: 'city-1', name: 'TestCity' });

    let capturedCreateArg: any = null;
    mockPrisma.listing.create.mockImplementation(async (args) => {
      capturedCreateArg = args;
      // Return the nested objects that formatListingResponse expects
      return {
        id: 'listing-1',
        ...args.data,
        isVerified: false,
        brand: { id: args.data.brandId || 'brand-id', name: 'BrandName', slug: 'brand-slug' },
        model: { id: args.data.modelId || 'model-id', name: 'ModelName', slug: 'model-slug' },
        city: { id: args.data.cityId || 'city-1', name: 'TestCity', displayName: 'TestCity, Earth', countryCode: 'US' },
        seller: { id: 'user-1', name: 'Test Seller', verificationBadge: null, trustLevel: 'basic', isVerified: true },
        views: 0,
        createdAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
      } as any;
    });

    // Mock services used by ListingsService
    const identifierService: any = { encrypt: (s: string) => `enc:${s}`, mask: (s: string) => `mask:${s}` };
    const uploadService: any = { getImageUrls: async (key: string) => ({ thumbnailUrl: key, fullUrl: key }) };
    const geoService: any = { findNearbyLocations: async () => [] };

    const svc = new ListingsService(mockPrisma, null as any, uploadService, geoService);
    // Replace private identifierService with our mock
    (svc as any).identifierService = identifierService;

    const createDto: any = {
      title: 'Test Title for Extended Fields',
      description: 'This listing tests extended fields are passed through',
      type: 'EARBUD_PAIR',
      condition: 'GOOD',
      price: 10.0,
      currency: 'USD',
      customBrand: 'MyCustomBrand',
      customModel: 'MyCustomModel',
      cityId: 'city-1',
      serialNumber: 'SN123456',
      sellerNotes: 'note',
      images: ['https://images.example/test.jpg'],
      primaryIntent: 'SELLING',
      openToAlternate: true,
      hasLeftEarbud: true,
      needsRightEarbud: false,
    };

    const result = await svc.create('user-1', createDto);
    expect(capturedCreateArg).not.toBeNull();
    // Verify the create call included the extended fields (in data payload)
    expect(capturedCreateArg.data.primaryIntent).toBe('SELLING');
    expect(capturedCreateArg.data.openToAlternate).toBe(true);
    expect(capturedCreateArg.data.hasLeftEarbud).toBe(true);
    expect(capturedCreateArg.data.needsRightEarbud).toBe(false);
    expect(capturedCreateArg.data.serialNumber).toBeUndefined(); // serialNumber is encrypted and stored in identifierFull
    expect(capturedCreateArg.data.identifierFull).toBe('enc:SN123456');
    expect(result.id).toBeDefined();
  });
});
