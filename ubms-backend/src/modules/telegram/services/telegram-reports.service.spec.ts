import { Test, TestingModule } from '@nestjs/testing';
import { TelegramReportsService } from './telegram-reports.service';
import { TelegramAccountService } from './telegram-account.service';
import { PrismaService } from '../../../prisma/prisma.service';

describe('TelegramReportsService', () => {
  let service: TelegramReportsService;
  let prisma: any;
  let accountService: any;

  beforeEach(async () => {
    prisma = {
      business: {
        findUnique: jest.fn().mockResolvedValue({ id: 'biz-1', currency: 'UZS' }),
      },
      order: {
        findMany: jest.fn().mockResolvedValue([
          { id: 'o-1', total: 150000 },
          { id: 'o-2', total: 250000 },
        ]),
        count: jest.fn().mockResolvedValue(2),
        aggregate: jest.fn().mockResolvedValue({ _sum: { total: 400000 } }),
      },
      expense: {
        findMany: jest.fn().mockResolvedValue([]),
        create: jest.fn().mockResolvedValue({ id: 'exp-1', amount: 50000, description: 'Tushlik', recordedAt: new Date() }),
      },
      customer: {
        findMany: jest.fn().mockResolvedValue([
          { id: 'c-1', fullName: 'Vali Aka', debt: 500000, phone: '+998901112233', updatedAt: new Date() },
        ]),
        count: jest.fn().mockResolvedValue(5),
      },
      inventory: {
        findMany: jest.fn().mockResolvedValue([
          { id: 'inv-1', quantity: 2, product: { name: 'Sut 1L', minStock: 5, unit: { shortName: 'dona' } } },
        ]),
        count: jest.fn().mockResolvedValue(1),
      },
      branch: {
        findFirst: jest.fn().mockResolvedValue({ id: 'br-1' }),
      },
      posShift: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
      product: {
        findMany: jest.fn().mockResolvedValue([
          { id: 'p-1', name: 'Non', barcode: '4780001', salePrice: 4000 },
        ]),
      },
    };

    accountService = {
      getMenuSettingsByChatId: jest.fn().mockResolvedValue(null),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TelegramReportsService,
        { provide: PrismaService, useValue: prisma },
        { provide: TelegramAccountService, useValue: accountService },
      ],
    }).compile();

    service = module.get<TelegramReportsService>(TelegramReportsService);
  });

  it('should return real-time bot sales summary', async () => {
    const summary = await service.getBotSummary('biz-1');
    expect(summary).toBeDefined();
    expect(summary.currency).toBe('UZS');
    expect(summary.todaySalesTotal).toBe(400000);
  });

  it('should list low stock items', async () => {
    const lowStock = await service.getBotInventory('biz-1');
    expect(lowStock).toBeDefined();
    expect(lowStock.items.length).toBeGreaterThanOrEqual(1);
    expect(lowStock.items[0].name).toBe('Sut 1L');
  });

  it('should return top debtors list', async () => {
    const debts = await service.getBotDebts('biz-1');
    expect(debts).toBeDefined();
    expect(debts.customers.length).toBeGreaterThanOrEqual(1);
    expect(debts.customers[0].name).toBe('Vali Aka');
  });

  it('should create expense from bot', async () => {
    const res = await service.createBotExpense('biz-1', 50000, 'Tushlik');
    expect(res.success).toBe(true);
    expect(res.expense.amount).toBe(50000);
  });
});
