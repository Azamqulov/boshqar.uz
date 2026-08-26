import { Test, TestingModule } from '@nestjs/testing';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';

describe('CustomersController', () => {
  let controller: CustomersController;
  let service: CustomersService;

  const mockCustomersService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    addDebt: jest.fn(),
    payDebt: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomersController],
      providers: [
        {
          provide: CustomersService,
          useValue: mockCustomersService,
        },
      ],
    }).compile();

    controller = module.get<CustomersController>(CustomersController);
    service = module.get<CustomersService>(CustomersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return list of customers', async () => {
      const customers = [{ id: 'cust-1', name: 'Valijon', phone: '+998901234567', debt: 50000 }];
      mockCustomersService.findAll.mockResolvedValue(customers);

      const result = await controller.findAll('bus-1', 'Vali');
      expect(result).toBe(customers);
      expect(mockCustomersService.findAll).toHaveBeenCalledWith('bus-1', 'Vali');
    });
  });

  describe('addDebt and payDebt', () => {
    it('should add debt to customer balance', async () => {
      mockCustomersService.addDebt.mockResolvedValue({ id: 'cust-1', debt: 150000 });

      const result = await controller.addDebt('bus-1', 'cust-1', 100000, 'Nasiya tovar');
      expect(result).toEqual({ id: 'cust-1', debt: 150000 });
      expect(mockCustomersService.addDebt).toHaveBeenCalledWith('bus-1', 'cust-1', 100000, 'Nasiya tovar');
    });

    it('should pay debt and reduce customer balance', async () => {
      mockCustomersService.payDebt.mockResolvedValue({ id: 'cust-1', debt: 50000 });

      const result = await controller.payDebt('bus-1', 'branch-1', 'cust-1', 100000, 'Qarz tolandi');
      expect(result).toEqual({ id: 'cust-1', debt: 50000 });
      expect(mockCustomersService.payDebt).toHaveBeenCalledWith('bus-1', 'branch-1', 'cust-1', 100000, 'Qarz tolandi');
    });
  });
});
