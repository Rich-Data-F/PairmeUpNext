import { ListingsController } from './listings.controller';

describe('ListingsController', () => {
  it('forwards create calls with extended fields to service', async () => {
    const mockService: any = { create: jest.fn().mockResolvedValue({ id: 'listing-1' }) };
    const mockUploadService: any = {};
    const controller = new ListingsController(mockService, mockUploadService);

    const dto = {
      title: 'Test create controller',
      description: 'Testing controller forwards extended fields',
      type: 'EARBUD_PAIR',
      condition: 'GOOD',
      price: 12.34,
      currency: 'USD',
      customBrand: 'ControllerBrand',
      customModel: 'ControllerModel',
      cityId: 'city-1',
      primaryIntent: 'SELLING',
      openToAlternate: true,
      hasLeftEarbud: true,
    } as any;

    const user = { user: { id: 'user-1' } } as any;
    await controller.create(dto, user);
    expect(mockService.create).toHaveBeenCalledWith('user-1', expect.objectContaining({ primaryIntent: 'SELLING', openToAlternate: true, hasLeftEarbud: true }));
  });
});
