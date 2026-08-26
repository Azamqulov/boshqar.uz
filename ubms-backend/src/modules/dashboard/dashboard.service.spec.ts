import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('DashboardService', () => {
  let service: DashboardService;
  let prisma: PrismaService;

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  const mockPrismaService = {
    order: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    expense: {
      findMany: jest.fn(),
    },
    customer: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    supplier: {
      findMany: jest.fn(),
    },
    inventory: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSummary', () => {
    it('should return cached summary if available in Redis', async () => {
      const cachedData = { todaySales: 500000, todayOrdersCount: 10 };
      mockCacheManager.get.mockResolvedValue(cachedData);

      const result = await service.getSummary('business-1');
      expect(result).toEqual(cachedData);
      expect(mockCacheManager.get).toHaveBeenCalledWith('dashboard:summary:business-1:all');
      expect(mockPrismaService.order.findMany).not.toHaveBeenCalled();
    });

    it('should calculate and cache summary when cache misses', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockPrismaService.order.findMany.mockResolvedValue([
        { total: 100000, items: [{ quantity: 1, product: { purchasePrice: 50000 } }] },
      ]);
      mockPrismaService.expense.findMany.mockResolvedValue([{ amount: 20000 }]);
      mockPrismaService.customer.count.mockResolvedValue(5);
      mockPrismaService.customer.findMany.mockResolvedValue([]);
      mockPrismaService.supplier.findMany.mockResolvedValue([]);
      mockPrismaService.inventory.findMany.mockResolvedValue([]);

      const result = (await service.getSummary('business-1')) as any;
      expect(result).toHaveProperty('todaySales');
      expect(result.todaySales).toBe(100000);
      expect(result.todayExpenses).toBe(20000);
      expect(mockCacheManager.set).toHaveBeenCalled();
    });
  });
});
