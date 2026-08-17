import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FiscalService } from './fiscal.service';
import { CurrentBusinessId } from '../../common/decorators/context.decorator';
import { RequirePermission } from '../../common/decorators/custom.decorator';

@ApiTags('Fiscal & Soliq OFD (Fiskal Kassa)')
@ApiBearerAuth()
@Controller('fiscal')
export class FiscalController {
  constructor(private readonly fiscalService: FiscalService) {}

  @Get('receipt/:orderId')
  @RequirePermission('orders.view')
  @ApiOperation({ summary: 'Buyurtma uchun Soliq OFD fiskal chekini generatsiya qilish' })
  getFiscalReceipt(
    @CurrentBusinessId() businessId: string,
    @Param('orderId') orderId: string,
  ) {
    return this.fiscalService.generateFiscalReceipt(businessId, orderId);
  }

  @Get('z-report/:shiftId')
  @RequirePermission('shifts.view')
  @ApiOperation({ summary: 'Smena bo\'yicha kunlik Z-hisobot (Fiskal xulosa)' })
  getZReport(
    @CurrentBusinessId() businessId: string,
    @Param('shiftId') shiftId: string,
  ) {
    return this.fiscalService.getZReport(businessId, shiftId);
  }
}
