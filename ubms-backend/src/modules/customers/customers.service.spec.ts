import { Test, TestingModule } from '@nestjs/testing';
import { CustomersService } from './customers.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('CustomersService', () => {
  let service: CustomersService;
  let prisma: PrismaService;

  const mockPrismaService = {
    customer: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    branch: {
      findFirst: jest.fn(),
    },
    revenue: {
      create: jest.fn(),
    },
    order: {
      findMany: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('biznesga tegishli mijozlar ro\'yxatini qaytarishi kerak', async () => {
      const mockCustomers = [
        { id: 'c1', businessId: 'biz-1', fullName: 'Ali Valiyev', debt: 50000, totalSpent: 200000 },
        { id: 'c2', businessId: 'biz-1', fullName: 'Gani Karimov', debt: 0, totalSpent: 500000 },
      ];
      mockPrismaService.customer.findMany.mockResolvedValue(mockCustomers);

      const result = await service.findAll('biz-1');
      expect(result).toHaveLength(2);
      expect(mockPrismaService.customer.findMany).toHaveBeenCalledWith({
        where: { businessId: 'biz-1' },
        orderBy: [{ debt: 'desc' }, { totalSpent: 'desc' }],
      });
    });

    it('qidiruv parametri bo\'yicha filter qilishi kerak', async () => {
      mockPrismaService.customer.findMany.mockResolvedValue([]);
      await service.findAll('biz-1', 'Ali');

      expect(mockPrismaService.customer.findMany).toHaveBeenCalledWith({
        where: {
          businessId: 'biz-1',
          OR: [
            { fullName: { contains: 'Ali', mode: 'insensitive' } },
            { phone: { contains: 'Ali', mode: 'insensitive' } },
          ],
        },
        orderBy: [{ debt: 'desc' }, { totalSpent: 'desc' }],
      });
    });
  });

  describe('findOne', () => {
    it('mavjud mijozni to\'liq bog\'langan ma\'lumotlari bilan qaytarishi kerak', async () => {
      const mockCustomer = {
        id: 'c1',
        businessId: 'biz-1',
        fullName: 'Ali Valiyev',
        orders: [],
        appointments: [],
      };
      mockPrismaService.customer.findFirst.mockResolvedValue(mockCustomer);

      const result = await service.findOne('biz-1', 'c1');
      expect(result.id).toBe('c1');
      expect(mockPrismaService.customer.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'c1', businessId: 'biz-1' },
        }),
      );
    });

    it('boshqa biznesga tegishli yoki mavjud bo\'lmagan mijoz uchun NotFoundException tashlashi kerak', async () => {
      mockPrismaService.customer.findFirst.mockResolvedValue(null);

      await expect(service.findOne('biz-1', 'invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('telefon raqamini +998 formatida normallashtirib mijoz yaratishi kerak', async () => {
      mockPrismaService.customer.create.mockImplementation(({ data }) =>
        Promise.resolve({ id: 'c-new', ...data }),
      );

      const result = await service.create('biz-1', {
        fullName: 'Botir Zokirov',
        phone: '90 123 45 67',
        debt: 20000,
      });

      expect(result.phone).toBe('+998901234567');
      expect(result.debt).toBe(20000);
      expect(result.businessId).toBe('biz-1');
    });
  });

  describe('addDebt and payDebt', () => {
    it('qarz qo\'shganda mijoz qarzi oshishi kerak', async () => {
      const mockCustomer = { id: 'c1', businessId: 'biz-1', debt: 50000 };
      mockPrismaService.customer.findFirst.mockResolvedValue(mockCustomer);
      mockPrismaService.customer.update.mockResolvedValue({ ...mockCustomer, debt: 80000 });

      const result = await service.addDebt('biz-1', 'c1', 30000);
      expect(mockPrismaService.customer.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'c1' },
          data: expect.objectContaining({ debt: 80000 }),
        }),
      );
      expect(result.debt).toBe(80000);
    });

    it('qarz to\'langanda mijoz qarzi kamayishi kerak (0 dan kamaymaydi)', async () => {
      const mockCustomer = { id: 'c1', businessId: 'biz-1', debt: 50000 };
      mockPrismaService.customer.findFirst.mockResolvedValue(mockCustomer);
      mockPrismaService.customer.update.mockResolvedValue({ ...mockCustomer, debt: 20000 });
      mockPrismaService.branch.findFirst.mockResolvedValue({ id: 'br-1' });
      mockPrismaService.revenue.create.mockResolvedValue({});

      const result = await service.payDebt('biz-1', 'br-1', 'c1', 30000);
      expect(mockPrismaService.customer.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'c1' },
          data: expect.objectContaining({ debt: 20000 }),
        }),
      );
      expect(result.remainingDebt).toBe(20000);
      expect(result.success).toBe(true);
    });
  });
});
