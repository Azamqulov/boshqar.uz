import { Test, TestingModule } from '@nestjs/testing';
import { FinanceService } from './finance.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('FinanceService - Financial Calculations & Tenant Isolation', () => {
  let service: FinanceService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      revenue: {
        findMany: jest.fn(),
      },
      expense: {
        findMany: jest.fn(),
        create: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
      },
      order: {
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinanceService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<FinanceService>(FinanceService);
  });

  it('should calculate P&L, COGS, and profit margins accurately', async () => {
    prisma.revenue.findMany.mockResolvedValue([
      { id: 'rev-1', amount: 100000, businessId: 'tenant-1' },
      { id: 'rev-2', amount: 50000, businessId: 'tenant-1' },
    ]);

    prisma.expense.findMany.mockResolvedValue([
      { id: 'exp-1', category: 'utilities', amount: 20000, businessId: 'tenant-1' },
      { id: 'exp-2', category: 'rent', amount: 30000, businessId: 'tenant-1' },
    ]);

    prisma.order.findMany.mockResolvedValue([
      {
        id: 'ord-1',
        total: 150000,
        payments: [{ amount: 150000, paymentMethod: { type: 'cash' } }],
        items: [
          {
            quantity: 2,
            total: 100000,
            product: { id: 'prod-1', name: 'Burger', purchasePrice: 30000 },
          },
          {
            quantity: 1,
            total: 50000,
            service: { id: 'serv-1', name: 'Yetkazib berish', price: 50000 },
          },
        ],
      },
    ]);

    const result = await service.getSummary('tenant-1', 'branch-1');

    // Total Revenue: 150,000
    expect(result.totalRevenue).toBe(150000);
    // Total Expenses: 50,000
    expect(result.totalExpenses).toBe(50000);
    // COGS: 2 * 30,000 = 60,000
    expect(result.cogs).toBe(60000);
    // Net Profit: 150,000 - 60,000 - 50,000 = 40,000
    expect(result.netProfit).toBe(40000);
    // Profit margin: (40,000 / 150,000) * 100 = 26.7%
    expect(result.profitMargin).toBe(26.7);
    expect(result.expenseBreakdown).toEqual({ utilities: 20000, rent: 30000 });
    expect(result.paymentBreakdown.cash).toBe(150000);
  });

  it('should enforce businessId in all summary queries', async () => {
    prisma.revenue.findMany.mockResolvedValue([]);
    prisma.expense.findMany.mockResolvedValue([]);
    prisma.order.findMany.mockResolvedValue([]);

    await service.getSummary('tenant-isolated', 'branch-a');

    expect(prisma.revenue.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ businessId: 'tenant-isolated', branchId: 'branch-a' }),
      }),
    );
    expect(prisma.expense.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ businessId: 'tenant-isolated', branchId: 'branch-a' }),
      }),
    );
    expect(prisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ businessId: 'tenant-isolated', branchId: 'branch-a' }),
      }),
    );
  });

  it('should create an expense with business context', async () => {
    const expenseData = {
      category: 'rent' as any,
      amount: 500000,
      description: 'Ofis ijarasi',
    };

    prisma.expense.create.mockResolvedValue({
      id: 'exp-new',
      ...expenseData,
      businessId: 'tenant-1',
      branchId: 'branch-1',
    });

    const created = await service.createExpense('tenant-1', 'branch-1', 'user-1', expenseData);

    expect(created).toBeDefined();
    expect(prisma.expense.create).toHaveBeenCalledWith({
      data: {
        businessId: 'tenant-1',
        branchId: 'branch-1',
        category: 'rent',
        amount: 500000,
        description: 'Ofis ijarasi',
        createdBy: 'user-1',
      },
    });
  });

  it('should prevent deleting an expense belonging to another business (IDOR Protection)', async () => {
    prisma.expense.findFirst.mockResolvedValue(null);

    await expect(service.deleteExpense('tenant-attacker', 'exp-other-tenant')).rejects.toThrow(
      NotFoundException,
    );
    expect(prisma.expense.delete).not.toHaveBeenCalled();
  });
});
