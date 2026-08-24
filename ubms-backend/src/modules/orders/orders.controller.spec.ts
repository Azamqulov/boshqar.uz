import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { ShiftsService } from '../shifts/shifts.service';

describe('OrdersController', () => {
  let controller: OrdersController;
  let ordersService: OrdersService;
  let shiftsService: ShiftsService;

  const mockOrdersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    completeOrder: jest.fn(),
    cancel: jest.fn(),
  };

  const mockShiftsService = {
    getCurrentShift: jest.fn(),
    openShift: jest.fn(),
    closeShift: jest.fn(),
    getShiftSummary: jest.fn(),
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        { provide: OrdersService, useValue: mockOrdersService },
        { provide: ShiftsService, useValue: mockShiftsService },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    ordersService = module.get<OrdersService>(OrdersService);
    shiftsService = module.get<ShiftsService>(ShiftsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('buyurtma yaratish metodini to\'g\'ri chaqirishi kerak', async () => {
      const dto = {
        branchId: 'br-1',
        type: 'pos',
        items: [{ productId: 'p1', quantity: 1, unitPrice: 10000 }],
        payments: [{ methodId: 'm1', amount: 10000 }],
      };
      const mockResult = { id: 'o-1', ...dto };
      mockOrdersService.create.mockResolvedValue(mockResult);

      const mockUser = { userId: 'u-1' };
      const res = await controller.create('biz-1', 'br-1', 'u-1', mockUser, dto as any);
      expect(res).toEqual(mockResult);
      expect(mockOrdersService.create).toHaveBeenCalledWith('biz-1', 'br-1', 'u-1', dto, mockUser);
    });
  });

  describe('findAll', () => {
    it('buyurtmalar ro\'yxatini qaytarishi kerak', async () => {
      const mockList = [{ id: 'o-1', totalAmount: 10000 }];
      mockOrdersService.findAll.mockResolvedValue({ items: mockList, total: 1 });

      const res = await controller.findAll('biz-1', 'br-1', {});
      expect(res.items).toHaveLength(1);
      expect(mockOrdersService.findAll).toHaveBeenCalledWith('biz-1', 'br-1', {});
    });
  });

  describe('cancel', () => {
    it('buyurtmani bekor qilish metodini chaqirishi kerak', async () => {
      const mockCancelled = { id: 'o-1', status: 'cancelled' };
      mockOrdersService.cancel.mockResolvedValue(mockCancelled);

      const res = await controller.cancel('biz-1', 'o-1');
      expect(res).toEqual(mockCancelled);
      expect(mockOrdersService.cancel).toHaveBeenCalledWith('biz-1', 'o-1');
    });
  });
});
