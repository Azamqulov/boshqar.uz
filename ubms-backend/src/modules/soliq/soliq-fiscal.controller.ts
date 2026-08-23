import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { FiscalizeOrderDto, SoliqFiscalService } from './soliq-fiscal.service';

@ApiTags('soliq-fiscal')
@Controller('api/v1/soliq')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SoliqFiscalController {
  constructor(private readonly soliqFiscalService: SoliqFiscalService) {}

  @Post('fiscalize')
  @ApiOperation({ summary: 'Fiscalize a POS order with Soliq.uz Virtual Kassa API' })
  async fiscalizeOrder(@Request() req: any, @Body() dto: FiscalizeOrderDto) {
    const businessId = req.user.businessId;
    return this.soliqFiscalService.fiscalizeOrder(businessId, dto);
  }

  @Get('receipt/:orderId')
  @ApiOperation({ summary: 'Get fiscal receipt QR code details for a given order' })
  async getReceipt(@Request() req: any, @Param('orderId') orderId: string) {
    const businessId = req.user.businessId;
    return this.soliqFiscalService.getReceiptByOrder(businessId, orderId);
  }
}
