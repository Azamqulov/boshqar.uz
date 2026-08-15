import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { ShiftsModule } from '../shifts/shifts.module';
import { TelegramModule } from '../telegram/telegram.module';

@Module({
  imports: [ShiftsModule, TelegramModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}

