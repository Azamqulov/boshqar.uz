import { Test, TestingModule } from '@nestjs/testing';
import { RestaurantController } from './restaurant.controller';
import { RestaurantService } from './restaurant.service';
import { BadRequestException } from '@nestjs/common';

describe('RestaurantController', () => {
  let controller: RestaurantController;
  let service: RestaurantService;

  const mockRestaurantService = {
    getTables: jest.fn(),
    createTable: jest.fn(),
    updateTable: jest.fn(),
    deleteTable: jest.fn(),
    updateTableStatus: jest.fn(),
    getKitchenOrders: jest.fn(),
    updateKitchenOrderStatus: jest.fn(),
    submitTableOrder: jest.fn(),
    closeTableOrder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RestaurantController],
      providers: [
        {
          provide: RestaurantService,
          useValue: mockRestaurantService,
        },
      ],
    }).compile();

    controller = module.get<RestaurantController>(RestaurantController);
    service = module.get<RestaurantService>(RestaurantService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getTables', () => {
    it('should throw BadRequestException if branchId is missing', () => {
      expect(() => controller.getTables('')).toThrow(BadRequestException);
    });

    it('should return tables for active branch', async () => {
      const tables = [{ id: 'tbl-1', name: 'Stol 1', capacity: 4, status: 'available' }];
      mockRestaurantService.getTables.mockResolvedValue(tables);

      const result = await controller.getTables('branch-1');
      expect(result).toBe(tables);
      expect(mockRestaurantService.getTables).toHaveBeenCalledWith('branch-1', undefined);
    });
  });

  describe('createTable', () => {
    it('should create new table in branch', async () => {
      const dto = { name: 'VIP 1', capacity: 8 };
      mockRestaurantService.createTable.mockResolvedValue({ id: 'tbl-2', ...dto });

      const result = await controller.createTable('branch-1', dto);
      expect(result).toEqual({ id: 'tbl-2', name: 'VIP 1', capacity: 8 });
      expect(mockRestaurantService.createTable).toHaveBeenCalledWith('branch-1', dto);
    });
  });

  describe('kitchen orders', () => {
    it('should fetch kitchen orders for branch', async () => {
      const orders = [{ id: 'kds-1', status: 'pending', items: [] }];
      mockRestaurantService.getKitchenOrders.mockResolvedValue(orders);

      const result = await controller.getKitchenOrders('branch-1');
      expect(result).toBe(orders);
      expect(mockRestaurantService.getKitchenOrders).toHaveBeenCalledWith('branch-1');
    });
  });
});
