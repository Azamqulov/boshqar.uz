import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
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
  @IsBoolean()
  notifyOnShiftClose?: boolean;
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

  @Post('disconnect')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Disconnect Telegram bot from business' })
  disconnect(@CurrentBusinessId() businessId: string) {
    return this.telegramService.disconnect(businessId);
  }

  @Post('test-message')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send test notification message to linked Telegram' })
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
  getSummary(@Param('businessId') businessId: string) {
    return this.telegramService.getBotSummary(businessId);
  }

  @Public()
  @Get('inventory/:businessId')
  @ApiOperation({ summary: 'Get low stock inventory for Telegram Bot' })
  getInventory(@Param('businessId') businessId: string) {
    return this.telegramService.getBotInventory(businessId);
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
}
