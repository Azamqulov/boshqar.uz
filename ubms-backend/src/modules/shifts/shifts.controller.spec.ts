import { Test, TestingModule } from '@nestjs/testing';
import { ShiftsController } from './shifts.controller';
import { ShiftsService } from './shifts.service';

describe('ShiftsController', () => {
  let controller: ShiftsController;
  let service: ShiftsService;

  const mockShiftsService = {
    getCurrentShift: jest.fn(),
    openShift: jest.fn(),
    closeShift: jest.fn(),
    getShiftSummary: jest.fn(),
    getShiftReport: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShiftsController],
      providers: [
        {
          provide: ShiftsService,
          useValue: mockShiftsService,
        },
      ],
    }).compile();

    controller = module.get<ShiftsController>(ShiftsController);
    service = module.get<ShiftsService>(ShiftsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getCurrentShift', () => {
    it('should return currently open shift for user and branch', async () => {
      const shift = { id: 'shift-1', shiftNumber: 12, status: 'open', startingCash: 200000 };
      mockShiftsService.getCurrentShift.mockResolvedValue(shift);

      const result = await controller.getCurrentShift('bus-1', 'br-1', 'user-1');
      expect(result).toBe(shift);
      expect(mockShiftsService.getCurrentShift).toHaveBeenCalledWith('bus-1', 'br-1', 'user-1');
    });
  });

  describe('openShift', () => {
    it('should open new shift with starting cash', async () => {
      const dto = { startingCash: 150000, notes: 'Ertalabki kassa' };
      const created = { id: 'shift-2', ...dto, status: 'open' };
      mockShiftsService.openShift.mockResolvedValue(created);

      const result = await controller.openShift('bus-1', 'br-1', 'user-1', dto);
      expect(result).toBe(created);
      expect(mockShiftsService.openShift).toHaveBeenCalledWith('bus-1', 'br-1', 'user-1', dto);
    });
  });

  describe('closeShift', () => {
    it('should close shift with actual cash and difference calculation', async () => {
      const dto = { actualCash: 850000, notes: 'Smena yopildi' };
      const closed = { id: 'shift-1', status: 'closed', difference: 0 };
      mockShiftsService.closeShift.mockResolvedValue(closed);

      const result = await controller.closeShift('bus-1', 'shift-1', 'user-1', dto);
      expect(result).toBe(closed);
      expect(mockShiftsService.closeShift).toHaveBeenCalledWith('bus-1', 'shift-1', 'user-1', dto);
    });
  });
});
