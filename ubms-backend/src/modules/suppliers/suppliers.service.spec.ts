import { Test, TestingModule } from '@nestjs/testing';
import { SuppliersService } from './suppliers.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('SuppliersService', () => {
  let service: SuppliersService;
  let prisma: PrismaService;

  const mockPrismaService = {
    supplier: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
    supplierPayment: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    expense: {
      create: jest.fn(),
    },
    supplyInvoice: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    inventory: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    inventoryTransaction: {
      create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuppliersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<SuppliersService>(SuppliersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('biznesga tegishli barcha ta\'minotchilar ro\'yxatini qaytarishi kerak', async () => {
      const mockSuppliers = [
        { id: 's1', businessId: 'biz-1', name: 'Nestle UZ', balance: -500000 },
        { id: 's2', businessId: 'biz-1', name: 'Coca-Cola', balance: 0 },
      ];
      mockPrismaService.supplier.findMany.mockResolvedValue(mockSuppliers);

      const result = await service.findAll('biz-1');
      expect(result).toHaveLength(2);
      expect(mockPrismaService.supplier.findMany).toHaveBeenCalledWith({
        where: { businessId: 'biz-1' },
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { payments: true } } },
      });
    });
  });

  describe('findOne', () => {
    it('mavjud ta\'minotchini qaytarishi kerak', async () => {
      const mockSupplier = { id: 's1', businessId: 'biz-1', name: 'Nestle' };
      mockPrismaService.supplier.findFirst.mockResolvedValue(mockSupplier);

      const result = await service.findOne('biz-1', 's1');
      expect(result.name).toBe('Nestle');
    });

    it('topilmagan ta\'minotchi uchun NotFoundException tashlashi kerak', async () => {
      mockPrismaService.supplier.findFirst.mockResolvedValue(null);

      await expect(service.findOne('biz-1', 'invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('ta\'minotchi yaratishi va audit log yozishi kerak', async () => {
      const newSupplier = {
        id: 's-new',
        businessId: 'biz-1',
        name: 'Artel',
        companyName: 'Artel MCHJ',
        balance: 0,
      };
      mockPrismaService.supplier.create.mockResolvedValue(newSupplier);
      mockPrismaService.auditLog.create.mockResolvedValue({});

      const result = await service.create('biz-1', 'user-1', {
        name: 'Artel',
        companyName: 'Artel MCHJ',
      });

      expect(result.id).toBe('s-new');
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      expect(mockPrismaService.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'SUPPLIER_CREATED',
            entity: 'supplier',
            entityId: 's-new',
          }),
        }),
      );
    });
  });

  describe('update', () => {
    it('ta\'minotchi ma\'lumotlarini yangilashi va audit log yozishi kerak', async () => {
      const mockSupplier = { id: 's1', businessId: 'biz-1', name: 'Nestle', balance: 50000 };
      const updatedSupplier = { id: 's1', businessId: 'biz-1', name: 'Nestle UZ', balance: 50000 };
      mockPrismaService.supplier.findFirst.mockResolvedValue(mockSupplier);
      mockPrismaService.supplier.update.mockResolvedValue(updatedSupplier);
      mockPrismaService.auditLog.create.mockResolvedValue({});

      const result = await service.update('biz-1', 'user-1', 's1', { name: 'Nestle UZ' });

      expect(result.name).toBe('Nestle UZ');
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      expect(mockPrismaService.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'SUPPLIER_UPDATED',
            entity: 'supplier',
            entityId: 's1',
          }),
        }),
      );
    });
  });

  describe('remove', () => {
    it('ta\'minotchini o\'chirishi va audit log yozishi kerak', async () => {
      const mockSupplier = { id: 's1', businessId: 'biz-1', name: 'Nestle', balance: 0 };
      mockPrismaService.supplier.findFirst.mockResolvedValue(mockSupplier);
      mockPrismaService.supplier.delete.mockResolvedValue(mockSupplier);
      mockPrismaService.auditLog.create.mockResolvedValue({});

      const result = await service.remove('biz-1', 'user-1', 's1');

      expect(result.success).toBe(true);
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      expect(mockPrismaService.supplier.delete).toHaveBeenCalledWith({ where: { id: 's1' } });
      expect(mockPrismaService.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'SUPPLIER_DELETED',
            entity: 'supplier',
            entityId: 's1',
          }),
        }),
      );
    });
  });

  describe('paySupplier', () => {
    it('ta\'minotchiga to\'lov qilinganda balans yangilanishi va payment yozuvi yaratilishi kerak', async () => {
      const mockSupplier = { id: 's1', name: 'Nestle', businessId: 'biz-1', balance: -100000 };
      mockPrismaService.supplier.findUnique.mockResolvedValue(mockSupplier);
      mockPrismaService.supplier.update.mockResolvedValue({ ...mockSupplier, balance: -200000 });
      mockPrismaService.supplierPayment.create.mockResolvedValue({ id: 'sp-1', amount: 100000 });
      mockPrismaService.expense.create.mockResolvedValue({});

      const result = await service.paySupplier('biz-1', 'br-1', 'user-1', 's1', {
        amount: 100000,
        paymentSource: 'bank',
        description: 'Hisob-kitob',
      });

      expect(result.payment.id).toBe('sp-1');
      expect(mockPrismaService.supplier.update).toHaveBeenCalledWith({
        where: { id: 's1' },
        data: { balance: -200000 },
      });
    });
  });
});
