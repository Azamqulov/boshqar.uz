import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegramController } from './telegram.controller';
import { TelegramAccountService } from './services/telegram-account.service';
import { TelegramReportsService } from './services/telegram-reports.service';
import { TelegramNotificationService } from './services/telegram-notification.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TelegramController],
  providers: [
    TelegramService,
    TelegramAccountService,
    TelegramReportsService,
    TelegramNotificationService,
  ],
  exports: [
    TelegramService,
    TelegramAccountService,
    TelegramReportsService,
    TelegramNotificationService,
  ],
})
export class TelegramModule {}
