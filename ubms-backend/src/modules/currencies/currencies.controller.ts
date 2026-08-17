import { Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { CurrenciesService } from './currencies.service';

@ApiTags('Currencies & Exchange Rates')
@Controller('currencies')
export class CurrenciesController {
  constructor(private readonly currenciesService: CurrenciesService) {}

  @Get('rates')
  @ApiOperation({ summary: "O'zbekiston Markaziy Banki (CBU) jonli valyuta kurslarini olish" })
  @ApiResponse({ status: 200, description: 'Markaziy bank valyuta kurslari (USD, EUR, RUB va h.k.)' })
  async getRates() {
    return this.currenciesService.getRates();
  }

  @Get('convert')
  @ApiOperation({ summary: "Ikki valyuta o'rtasida konvertatsiya qilish" })
  @ApiQuery({ name: 'amount', type: Number, example: 100 })
  @ApiQuery({ name: 'from', type: String, example: 'USD' })
  @ApiQuery({ name: 'to', type: String, example: 'UZS' })
  convert(
    @Query('amount') amount: string,
    @Query('from') from = 'UZS',
    @Query('to') to = 'UZS',
  ) {
    const numAmount = parseFloat(amount) || 0;
    return this.currenciesService.convert(numAmount, from, to);
  }

  @Post('refresh')
  @ApiOperation({ summary: "Markaziy Bank kurslarini majburiy qayta yangilash" })
  async refreshRates() {
    await this.currenciesService.fetchCbuRates();
    return this.currenciesService.getRates();
  }
}
