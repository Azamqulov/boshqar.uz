import { Test, TestingModule } from '@nestjs/testing';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';

describe('FinanceController', () => {
  let controller: FinanceController;
  let service: FinanceService;

  const mockFinanceService = {
    getSummary: jest.fn(),
    getExpenses: jest.fn(),
    createExpense: jest.fn(),
    deleteExpense: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FinanceController],
      providers: [
        {
          provide: FinanceService,
          useValue: mockFinanceService,
        },
      ],
    }).compile();

    controller = module.get<FinanceController>(FinanceController);
    service = module.get<FinanceService>(FinanceService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getSummary', () => {
    it('moliya xulosasini qaytarishi kerak', async () => {
      const mockSummary = { totalRevenue: 1000000, totalExpenses: 200000, netProfit: 800000 };
      mockFinanceService.getSummary.mockResolvedValue(mockSummary);

      const res = await controller.getSummary('biz-1', 'br-1');
      expect(res).toEqual(mockSummary);
      expect(mockFinanceService.getSummary).toHaveBeenCalledWith('biz-1', 'br-1', undefined, undefined);
    });
  });

  describe('createExpense', () => {
    it('yangi xarajat yaratishi kerak', async () => {
      const dto = { category: 'Arenda', amount: 500000, description: 'Ofis arendasi' };
      const mockResult = { id: 'exp-1', ...dto };
      mockFinanceService.createExpense.mockResolvedValue(mockResult);

      const res = await controller.createExpense('biz-1', 'br-1', 'user-1', dto as any);
      expect(res).toEqual(mockResult);
      expect(mockFinanceService.createExpense).toHaveBeenCalledWith('biz-1', 'br-1', 'user-1', dto);
    });
  });
});
