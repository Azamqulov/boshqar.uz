import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { PaymeGatewayService } from './gateways/payme-gateway.service';
import { ClickGatewayService } from './gateways/click-gateway.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BillingController],
  providers: [BillingService, PaymeGatewayService, ClickGatewayService],
  exports: [BillingService, PaymeGatewayService, ClickGatewayService],
})
export class BillingModule {}


