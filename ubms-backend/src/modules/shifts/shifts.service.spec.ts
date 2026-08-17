import { Test, TestingModule } from '@nestjs/testing';
import { ShiftsService } from './shifts.service';
import { PrismaService } from '../../prisma/prisma.service';
import { TelegramService } from '../telegram/telegram.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ShiftsService - Cash Register & Shift Operations', () => {
  let service: ShiftsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      branch: {
        findFirst: jest.fn().mockResolvedValue({ id: 'branch-1', name: 'Bosh Filial' }),
      },
      posShift: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      order: {
        findMany: jest.fn().mockResolvedValue([]),
        updateMany: jest.fn(),
      },
      expense: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    };

    const mockTelegramService = {
      sendShiftSummaryNotification: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShiftsService,
        { provide: PrismaService, useValue: prisma },
        { provide: TelegramService, useValue: mockTelegramService },
      ],
    }).compile();

    service = module.get<ShiftsService>(ShiftsService);
  });

  it('should successfully open a new shift', async () => {
    prisma.posShift.findFirst.mockResolvedValue(null); // No active shift
    prisma.posShift.create.mockResolvedValue({
      id: 'shift-1',
      businessId: 'tenant-1',
      branchId: 'branch-1',
      userId: 'user-1',
      startingCash: 100000,
      status: 'open',
    });

    const result = await service.openShift('tenant-1', 'branch-1', 'user-1', {
      startingCash: 100000,
      notes: 'Ertalabki smena',
    });

    expect(result).toBeDefined();
    expect(result.status).toBe('open');
    expect(prisma.posShift.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          businessId: 'tenant-1',
          branchId: 'branch-1',
          userId: 'user-1',
          startingCash: 100000,
        }),
      }),
    );
  });

  it('should throw BadRequestException if an active shift is already open in the branch', async () => {
    prisma.posShift.findFirst.mockResolvedValue({
      id: 'shift-active',
      status: 'open',
    });

    await expect(
      service.openShift('tenant-1', 'branch-1', 'user-1', { startingCash: 50000 }),
    ).rejects.toThrow(BadRequestException);

    expect(prisma.posShift.create).not.toHaveBeenCalled();
  });

  it('should calculate shift summary and cash breakdown', async () => {
    prisma.posShift.findFirst.mockResolvedValue({
      id: 'shift-1',
      businessId: 'tenant-1',
      startingCash: 100000,
      openedAt: new Date(),
      business: { businessType: 'retail' },
    });

    prisma.order.findMany.mockResolvedValue([
      {
        id: 'ord-1',
        total: 70000,
        payments: [{ amount: 70000, paymentMethod: { type: 'cash' } }],
      },
      {
        id: 'ord-2',
        total: 50000,
        payments: [{ amount: 50000, paymentMethod: { type: 'card' } }],
      },
    ]);

    prisma.expense.findMany.mockResolvedValue([
      { id: 'exp-1', amount: 20000 },
    ]);

    const summary = await service.getShiftSummary('tenant-1', 'shift-1');

    expect(summary.totalSales).toBe(120000);
    expect(summary.cashSales).toBe(70000);
    expect(summary.cardSales).toBe(50000);
    expect(summary.cashExpenses).toBe(20000);
    // Expected Cash: startingCash (100,000) + cashSales (70,000) - cashExpenses (20,000) = 150,000
    expect(summary.expectedCash).toBe(150000);
  });

  it('should throw NotFoundException if shift does not exist or belongs to another business', async () => {
    prisma.posShift.findFirst.mockResolvedValue(null);

    await expect(service.getShiftSummary('tenant-attacker', 'shift-other')).rejects.toThrow(
      NotFoundException,
    );
  });
});
