import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PrismaService } from '../../prisma/prisma.service';
import { TelegramService } from '../telegram/telegram.service';
import { NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';

describe('OrdersService - Pricing Security & Tenant Isolation', () => {
  let service: OrdersService;
  let prisma: any;

  const mockProduct = {
    id: 'prod-100',
    businessId: 'tenant-a',
    name: 'Lavash Standart',
    salePrice: 28000,
    status: 'active',
    brand: 'goods',
  };

  const mockInventory = {
    id: 'inv-100',
    businessId: 'tenant-a',
    branchId: 'branch-1',
    productId: 'prod-100',
    quantity: 10,
    reservedQty: 0,
  };

  beforeEach(async () => {
    prisma = {
      order: {
        count: jest.fn().mockResolvedValue(5),
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
      },
      employee: {
        findFirst: jest.fn().mockResolvedValue({ id: 'emp-1' }),
      },
      product: {
        findFirst: jest.fn().mockImplementation(({ where }) => {
          if (where.id === 'prod-100' && where.businessId === 'tenant-a') {
            return Promise.resolve(mockProduct);
          }
          return Promise.resolve(null);
        }),
        findMany: jest.fn().mockImplementation(({ where }) => {
          if (where?.id?.in?.includes('prod-100') && where.businessId === 'tenant-a') {
            return Promise.resolve([mockProduct]);
          }
          return Promise.resolve([]);
        }),
        findUnique: jest.fn().mockResolvedValue(mockProduct),
      },
      service: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
      },
      inventory: {
        findUnique: jest.fn().mockResolvedValue(mockInventory),
        findMany: jest.fn().mockResolvedValue([mockInventory]),
        update: jest.fn(),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      inventoryTransaction: {
        create: jest.fn(),
      },
      paymentMethod: {
        findFirst: jest.fn().mockResolvedValue({ id: 'pm-1', name: 'Naqd' }),
        findMany: jest.fn().mockResolvedValue([{ id: 'pm-1', name: 'Naqd' }]),
      },
      payment: {
        create: jest.fn(),
      },
      posShift: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
      revenue: {
        create: jest.fn(),
      },
      customer: {
        update: jest.fn(),
      },
      $transaction: jest.fn().mockImplementation(async (callback) => {
        return callback(prisma);
      }),
    };

    const mockTelegramService = {
      sendOrderNotification: jest.fn().mockResolvedValue(true),
      sendLowStockNotification: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: prisma },
        { provide: TelegramService, useValue: mockTelegramService },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should successfully create an order with server-enforced product price', async () => {
    prisma.order.create.mockResolvedValue({
      id: 'order-1',
      orderNumber: '#0006',
      total: 56000,
      status: 'completed',
      items: [],
    });
    prisma.order.findUnique.mockResolvedValue({
      id: 'order-1',
      orderNumber: '#0006',
      total: 56000,
      status: 'completed',
      items: [],
    });

    const dto: any = {
      orderType: 'dine_in',
      branchId: 'branch-1',
      items: [{ productId: 'prod-100', quantity: 2 }],
      payments: [{ paymentMethodId: 'pm-1', amount: 56000 }],
    };

    const order = await service.create('tenant-a', 'branch-1', 'user-1', dto);
    expect(order).toBeDefined();
    expect(prisma.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          total: 56000, // 2 * 28000
        }),
      }),
    );
    expect(prisma.inventory.update).toHaveBeenCalledWith({
      where: { id: 'inv-100' },
      data: { quantity: 8 },
    });
  });

  it('should ignore client-supplied unitPrice and strictly enforce server DB price (Price Manipulation Guard)', async () => {
    prisma.order.create.mockResolvedValue({
      id: 'order-2',
      orderNumber: '#0007',
      total: 56000,
      status: 'completed',
      items: [],
    });
    prisma.order.findUnique.mockResolvedValue({
      id: 'order-2',
      orderNumber: '#0007',
      total: 56000,
      status: 'completed',
      items: [],
    });

    // Malicious or buggy client tries to pay 100 UZS instead of 28000 UZS
    const dto: any = {
      orderType: 'dine_in',
      branchId: 'branch-1',
      items: [{ productId: 'prod-100', quantity: 2, unitPrice: 100 }],
      payments: [{ paymentMethodId: 'pm-1', amount: 56000 }],
    };

    await service.create('tenant-a', 'branch-1', 'user-1', dto);

    // Server must calculate total as 56,000 (2 * 28,000 from DB), NOT 200 (2 * 100)
    expect(prisma.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          total: 56000,
        }),
      }),
    );
  });

  it('should allow custom price only when isManualPrice is set AND user has orders.manualPrice permission', async () => {
    prisma.order.create.mockResolvedValue({
      id: 'order-3',
      orderNumber: '#0008',
      total: 50000,
      status: 'completed',
      items: [],
    });
    prisma.order.findUnique.mockResolvedValue({
      id: 'order-3',
      orderNumber: '#0008',
      total: 50000,
      status: 'completed',
      items: [],
    });

    const dto: any = {
      orderType: 'dine_in',
      branchId: 'branch-1',
      items: [{ productId: 'prod-100', quantity: 2, unitPrice: 25000, isManualPrice: true }],
      payments: [{ paymentMethodId: 'pm-1', amount: 50000 }],
    };

    const permittedUser = { userId: 'user-1', permissions: ['orders.manualPrice'] };
    await service.create('tenant-a', 'branch-1', 'user-1', dto, permittedUser);

    expect(prisma.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          total: 50000, // 2 * 25000
        }),
      }),
    );
  });

  it('should reject isManualPrice from a cashier without orders.manualPrice permission (Manual Price Guard)', async () => {
    const dto: any = {
      orderType: 'dine_in',
      branchId: 'branch-1',
      items: [{ productId: 'prod-100', quantity: 2, unitPrice: 100, isManualPrice: true }],
      payments: [{ paymentMethodId: 'pm-1', amount: 200 }],
    };

    const cashierUser = { userId: 'user-1', permissions: ['orders.create'] };

    await expect(service.create('tenant-a', 'branch-1', 'user-1', dto, cashierUser)).rejects.toThrow(
      ForbiddenException,
    );
    expect(prisma.order.create).not.toHaveBeenCalled();
  });

  it('should fall back to server catalog price if isManualPrice is set but no user/permission context is provided', async () => {
    prisma.order.create.mockResolvedValue({
      id: 'order-4',
      orderNumber: '#0009',
      total: 56000,
      status: 'completed',
      items: [],
    });
    prisma.order.findUnique.mockResolvedValue({
      id: 'order-4',
      orderNumber: '#0009',
      total: 56000,
      status: 'completed',
      items: [],
    });

    const dto: any = {
      orderType: 'dine_in',
      branchId: 'branch-1',
      items: [{ productId: 'prod-100', quantity: 2, unitPrice: 1, isManualPrice: false }],
      payments: [{ paymentMethodId: 'pm-1', amount: 56000 }],
    };

    await service.create('tenant-a', 'branch-1', 'user-1', dto);

    expect(prisma.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          total: 56000, // 2 * 28000 catalog price, unitPrice/isManualPrice ignored
        }),
      }),
    );
  });

  it('should throw NotFoundException when trying to order a product belonging to another tenant (IDOR Protection)', async () => {
    const dto: any = {
      orderType: 'dine_in',
      branchId: 'branch-1',
      items: [{ productId: 'prod-100', quantity: 1 }],
    };

    // Tenant-B tries to order Tenant-A's product
    await expect(service.create('tenant-b', 'branch-1', 'user-1', dto)).rejects.toThrow(NotFoundException);
  });

  it('should throw ConflictException when stock is insufficient', async () => {
    prisma.inventory.findMany.mockResolvedValue([
      {
        ...mockInventory,
        quantity: 1, // Only 1 left
      },
    ]);
    prisma.inventory.findUnique.mockResolvedValue({
      ...mockInventory,
      quantity: 1, // Only 1 left
    });

    const dto: any = {
      orderType: 'dine_in',
      branchId: 'branch-1',
      items: [{ productId: 'prod-100', quantity: 5 }],
    };

    await expect(service.create('tenant-a', 'branch-1', 'user-1', dto)).rejects.toThrow(ConflictException);
  });
});
