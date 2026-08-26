import { Test, TestingModule } from '@nestjs/testing';
import { SuppliersController } from './suppliers.controller';
import { SuppliersService } from './suppliers.service';

describe('SuppliersController', () => {
  let controller: SuppliersController;
  let service: SuppliersService;

  const mockSuppliersService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SuppliersController],
      providers: [
        {
          provide: SuppliersService,
          useValue: mockSuppliersService,
        },
      ],
    }).compile();

    controller = module.get<SuppliersController>(SuppliersController);
    service = module.get<SuppliersService>(SuppliersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all suppliers for business', async () => {
      const suppliers = [{ id: 'sup-1', name: 'Coca-Cola Bottlers', phone: '+998711234567' }];
      mockSuppliersService.findAll.mockResolvedValue(suppliers);

      const result = await controller.findAll('bus-1');
      expect(result).toBe(suppliers);
      expect(mockSuppliersService.findAll).toHaveBeenCalledWith('bus-1');
    });
  });

  describe('create', () => {
    it('should create supplier', async () => {
      const dto = { name: 'Nestle Tashkent', phone: '+998901112233' };
      mockSuppliersService.create.mockResolvedValue({ id: 'sup-2', ...dto });

      const result = await controller.create('bus-1', 'user-1', dto as any);
      expect(result).toEqual({ id: 'sup-2', ...dto });
      expect(mockSuppliersService.create).toHaveBeenCalledWith('bus-1', 'user-1', dto);
    });
  });
});
