import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { ShiftsModule } from '../shifts/shifts.module';
import { TelegramModule } from '../telegram/telegram.module';
import { WebSocketsModule } from '../websockets/websockets.module';

@Module({
  imports: [ShiftsModule, TelegramModule, WebSocketsModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}

