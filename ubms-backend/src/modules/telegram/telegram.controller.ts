import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { TelegramService, TelegramSettings } from './telegram.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentBusinessId } from '../../common/decorators/context.decorator';
import { Public } from '../../common/decorators/custom.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateTelegramSettingsDto {
  @IsOptional()
  @IsBoolean()
  notifyOnOrder?: boolean;

  @IsOptional()
  @IsBoolean()
  notifyOnLowStock?: boolean;

  @IsOptional()
  @IsBoolean()
  notifyDailySummary?: boolean;

  @IsOptional()
  @IsString()
  dailySummaryTime?: string;

  @IsOptional()
  @IsBoolean()
  notifyOnShiftClose?: boolean;

  @IsOptional()
  @IsBoolean()
  allowDebtsInBot?: boolean;

  @IsOptional()
  @IsBoolean()
  allowExpenseInBot?: boolean;

  @IsOptional()
  @IsBoolean()
  allowProductSearch?: boolean;

  @IsOptional()
  @IsBoolean()
  allowCashierControl?: boolean;
}

export class LinkChatDto {
  @IsOptional()
  @IsString()
  token?: string;

  @IsString()
  chatId: string;

  @IsOptional()
  @IsString()
  username?: string;
}

@ApiTags('telegram')
@Controller('telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @Get('status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current Telegram bot status and settings' })
  getStatus(@CurrentBusinessId() businessId: string) {
    return this.telegramService.getStatus(businessId);
  }

  @Post('generate-link')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate 1-click connect deep link for Telegram Bot' })
  generateLink(@CurrentBusinessId() businessId: string) {
    return this.telegramService.generateConnectLink(businessId);
  }

  @Patch('settings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update Telegram notification triggers' })
  updateSettings(
    @CurrentBusinessId() businessId: string,
    @Body() body: UpdateTelegramSettingsDto,
  ) {
    return this.telegramService.updateSettings(businessId, body);
  }

  @Post('settings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update Telegram notification triggers (POST alias)' })
  updateSettingsPost(
    @CurrentBusinessId() businessId: string,
    @Body() body: UpdateTelegramSettingsDto,
  ) {
    return this.telegramService.updateSettings(businessId, body);
  }

  @Post('disconnect')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Disconnect all Telegram bot accounts from business' })
  disconnect(@CurrentBusinessId() businessId: string) {
    return this.telegramService.disconnect(businessId);
  }

  @Post('disconnect-account')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Disconnect specific Telegram account from business' })
  disconnectAccount(
    @CurrentBusinessId() businessId: string,
    @Body() body: { chatId: string },
  ) {
    return this.telegramService.disconnectAccount(businessId, body.chatId);
  }

  @Post('test-message')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send test notification message to linked Telegram accounts' })
  sendTestMessage(@CurrentBusinessId() businessId: string) {
    return this.telegramService.sendTestMessage(businessId);
  }

  @Public()
  @Get('find-by-chat/:chatId')
  @ApiOperation({ summary: 'Find business and user by Telegram chat ID' })
  findByChatId(@Param('chatId') chatId: string) {
    return this.telegramService.findByChatId(chatId);
  }

  @Public()
  @Get('menu-settings/:chatId')
  @ApiOperation({ summary: 'Get realtime dynamic menu settings for bot' })
  getMenuSettings(@Param('chatId') chatId: string) {
    return this.telegramService.getMenuSettingsByChatId(chatId);
  }

  @Public()
  @Get('summary/:businessId')
  @ApiOperation({ summary: 'Get summary for Telegram Bot' })
  getSummary(
    @Param('businessId') businessId: string,
    @Query('chatId') chatId?: string,
  ) {
    return this.telegramService.getBotSummary(businessId, chatId);
  }

  @Public()
  @Get('inventory/:businessId')
  @ApiOperation({ summary: 'Get low stock inventory for Telegram Bot' })
  getInventory(@Param('businessId') businessId: string) {
    return this.telegramService.getBotInventory(businessId);
  }

  @Public()
  @Get('debts/:businessId')
  @ApiOperation({ summary: 'Get debts and customers for Telegram Bot' })
  getDebts(@Param('businessId') businessId: string) {
    return this.telegramService.getBotDebts(businessId);
  }

  @Public()
  @Post('expense')
  @ApiOperation({ summary: 'Create expense from Telegram Bot' })
  createExpense(@Body() body: { businessId: string; amount: number; description: string; category?: string }) {
    return this.telegramService.createBotExpense(body.businessId, Number(body.amount), body.description, body.category);
  }

  @Public()
  @Get('search-products/:businessId')
  @ApiOperation({ summary: 'Search products and stock for Telegram Bot' })
  searchProducts(
    @Param('businessId') businessId: string,
    @Query('q') q: string,
    @Query('chatId') chatId?: string,
  ) {
    return this.telegramService.searchBotProducts(businessId, q || '', chatId);
  }

  @Public()
  @Get('cashiers/:businessId')
  @ApiOperation({ summary: 'Get cashiers and shifts for Telegram Bot' })
  getCashiers(
    @Param('businessId') businessId: string,
    @Query('chatId') chatId?: string,
  ) {
    return this.telegramService.getBotCashiers(businessId, chatId);
  }

  @Post('link-by-query')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Link telegram by phone or chat ID from Web panel' })
  linkByQuery(@CurrentBusinessId() businessId: string, @Body() body: { query: string }) {
    return this.telegramService.linkByPhoneOrChatId(businessId, body.query);
  }

  /**
   * Internal / Public endpoint used by Telegram Bot when user starts with token or logs in with password
   */
  @Public()
  @Post('link-chat')
  @ApiOperation({ summary: 'Link chat endpoint for bot' })
  linkChat(@Body() body: { token?: string; businessId?: string; phone?: string; chatId: string; username?: string }) {
    if (body.phone) {
      return this.telegramService.linkUserBusinessesByPhone(body.phone, body.chatId, body.username);
    }
    if (body.businessId) {
      return this.telegramService.linkChatDirect(body.businessId, body.chatId, body.username);
    }
    return this.telegramService.linkChatWithToken(body.token || '', body.chatId, body.username);
  }

  @Public()
  @Post('dispatch-daily-summaries')
  @ApiOperation({ summary: 'Dispatch scheduled daily summaries to businesses matching current time' })
  dispatchDailySummariesPost() {
    return this.telegramService.dispatchScheduledDailySummaries();
  }

  @Public()
  @Get('dispatch-daily-summaries')
  @ApiOperation({ summary: 'Dispatch scheduled daily summaries (GET alias)' })
  dispatchDailySummariesGet() {
    return this.telegramService.dispatchScheduledDailySummaries();
  }
}
