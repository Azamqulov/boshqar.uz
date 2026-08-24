import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { FiscalService } from './fiscal.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Fiscal (Soliq OFD)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('fiscal')
export class FiscalController {
  constructor(private readonly fiscalService: FiscalService) {}

  @Post('generate')
  @ApiOperation({ summary: "Buyurtma uchun Soliq OFD fiskal chekini shakllantirish" })
  async generateReceipt(@Req() req: any, @Body('orderId') orderId: string) {
    return this.fiscalService.generateFiscalReceipt(req.user.businessId, orderId);
  }

  @Get('z-report')
  @ApiOperation({ summary: "Z-Hisobot olish (Kassa kunlik fiskal yopilishi)" })
  async getZReport(@Req() req: any) {
    return this.fiscalService.getZReport(req.user.businessId);
  }
}
