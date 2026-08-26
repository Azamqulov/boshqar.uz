import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  const mockProductsService = {
    findAll: jest.fn(),
    findLite: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    delete: jest.fn(),
    bulkDelete: jest.fn(),
    findAllCategories: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated products for business', async () => {
      const mockResult = { items: [{ id: 'prod-1', name: 'Non' }], total: 1 };
      mockProductsService.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll('bus-1', 'br-1', { page: 1, limit: 10 } as any);
      expect(result).toBe(mockResult);
      expect(mockProductsService.findAll).toHaveBeenCalledWith('bus-1', 'br-1', { page: 1, limit: 10 });
    });
  });

  describe('create', () => {
    it('should create product with given dto', async () => {
      const dto = { name: 'Lavash', salePrice: 28000, categoryId: 'cat-1' };
      const created = { id: 'prod-2', ...dto };
      mockProductsService.create.mockResolvedValue(created);

      const result = await controller.create('bus-1', 'br-1', 'user-1', dto as any);
      expect(result).toBe(created);
      expect(mockProductsService.create).toHaveBeenCalledWith('bus-1', 'br-1', 'user-1', dto);
    });
  });

  describe('remove', () => {
    it('should remove product by id', async () => {
      mockProductsService.remove = jest.fn().mockResolvedValue({ id: 'prod-1', deleted: true });

      const result = await controller.remove('bus-1', 'prod-1');
      expect(result).toEqual({ id: 'prod-1', deleted: true });
      expect(mockProductsService.remove).toHaveBeenCalledWith('bus-1', 'prod-1');
    });
  });
});
