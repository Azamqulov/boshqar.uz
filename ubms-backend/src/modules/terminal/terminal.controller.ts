import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TerminalService, CreateTerminalDto } from './terminal.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Payment Terminals (Uzcard / Humo)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('terminals')
export class TerminalController {
  constructor(private readonly terminalService: TerminalService) {}

  @Get()
  @ApiOperation({ summary: "Biznesning barcha POS terminallari ro'yxatini olish" })
  async getTerminals(@Req() req: any) {
    return this.terminalService.getTerminals(req.user.businessId);
  }

  @Post()
  @ApiOperation({ summary: "Yangi Uzcard/Humo POS terminalini ulashtirish" })
  async createTerminal(@Req() req: any, @Body() dto: CreateTerminalDto) {
    return this.terminalService.createTerminal(req.user.businessId, dto);
  }

  @Post(':id/charge')
  @ApiOperation({ summary: "POS terminal orqali kartadan to'lov yechish" })
  async charge(
    @Req() req: any,
    @Param('id') terminalId: string,
    @Body('amount') amount: number,
    @Body('orderId') orderId?: string,
  ) {
    return this.terminalService.charge(req.user.businessId, terminalId, amount, orderId);
  }

  @Post('transactions/:id/cancel')
  @ApiOperation({ summary: "Terminal to'lovini bekor qilish" })
  async cancelTransaction(@Req() req: any, @Param('id') transactionId: string) {
    return this.terminalService.cancelTransaction(req.user.businessId, transactionId);
  }
}
