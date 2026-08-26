import { Test, TestingModule } from '@nestjs/testing';
import { RestaurantService } from './restaurant.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('RestaurantService', () => {
  let service: RestaurantService;
  let prisma: PrismaService;

  const mockPrismaService = {
    table: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    order: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    kitchenOrder: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RestaurantService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<RestaurantService>(RestaurantService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTables', () => {
    it('should return tables for a branch', async () => {
      const mockTables = [
        { id: 'table-1', name: 'Stol 1', capacity: 4, status: 'available', orders: [] },
        { id: 'table-2', name: 'Stol 2', capacity: 6, status: 'occupied', orders: [] },
      ];
      mockPrismaService.table.findMany.mockResolvedValue(mockTables);

      const result = await service.getTables('branch-1');
      expect(result).toEqual(mockTables);
      expect(mockPrismaService.table.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { branchId: 'branch-1' } }),
      );
    });
  });

  describe('createTable', () => {
    it('should create a new table', async () => {
      const mockCreated = { id: 'table-3', name: 'Stol 3', capacity: 4, status: 'available' };
      mockPrismaService.table.create.mockResolvedValue(mockCreated);

      const result = await service.createTable('branch-1', { name: 'Stol 3', capacity: 4 });
      expect(result).toEqual(mockCreated);
      expect(mockPrismaService.table.create).toHaveBeenCalledWith({
        data: {
          branchId: 'branch-1',
          name: 'Stol 3',
          capacity: 4,
          status: 'available',
        },
      });
    });
  });

  describe('updateTableStatus', () => {
    it('should update status of table', async () => {
      const mockUpdated = { id: 'table-1', status: 'occupied' };
      mockPrismaService.table.update.mockResolvedValue(mockUpdated);

      const result = await service.updateTableStatus('table-1', 'occupied');
      expect(result).toEqual(mockUpdated);
      expect(mockPrismaService.table.update).toHaveBeenCalledWith({
        where: { id: 'table-1' },
        data: { status: 'occupied' },
      });
    });
  });

  describe('getKitchenOrders', () => {
    it('should fetch active kitchen orders', async () => {
      const mockKitchenOrders = [
        { id: 'ko-1', status: 'new', orderItem: { id: 'item-1', product: { name: 'Osh' } } },
      ];
      mockPrismaService.kitchenOrder.findMany.mockResolvedValue(mockKitchenOrders);

      const result = await service.getKitchenOrders('branch-1');
      expect(result).toEqual(mockKitchenOrders);
      expect(mockPrismaService.kitchenOrder.findMany).toHaveBeenCalled();
    });
  });
});
