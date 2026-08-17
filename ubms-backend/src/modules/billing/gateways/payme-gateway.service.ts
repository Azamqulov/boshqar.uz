import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export interface PaymeRpcRequest {
  method: string;
  params: any;
  id: number | string;
}

@Injectable()
export class PaymeGatewayService {
  private readonly logger = new Logger(PaymeGatewayService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Payme Merchant JSON-RPC Webhook Handleri
   */
  async handleRpc(request: PaymeRpcRequest) {
    const { method, params, id } = request;

    switch (method) {
      case 'CheckPerformTransaction':
        return this.checkPerformTransaction(params, id);
      case 'CreateTransaction':
        return this.createTransaction(params, id);
      case 'PerformTransaction':
        return this.performTransaction(params, id);
      case 'CancelTransaction':
        return this.cancelTransaction(params, id);
      case 'CheckTransaction':
        return this.checkTransaction(params, id);
      default:
        return {
          error: { code: -32601, message: 'Method not found' },
          id,
        };
    }
  }

  private async checkPerformTransaction(params: any, id: any) {
    const businessId = params.account?.businessId;
    const planId = params.account?.planId;
    const amount = Number(params.amount) / 100; // Payme tiyinda yuboradi

    if (!businessId || !planId) {
      return {
        error: { code: -31050, message: { uz: 'Hisob topilmadi', ru: 'Аккаунт не найден' } },
        id,
      };
    }

    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
    if (!plan || Number(plan.priceMonthly) <= 0) {
      return {
        error: { code: -31051, message: { uz: 'Tarif topilmadi', ru: 'Тариф не найден' } },
        id,
      };
    }

    return {
      result: { allow: true },
      id,
    };
  }

  private async createTransaction(params: any, id: any) {
    return {
      result: {
        create_time: Date.now(),
        transaction: params.id,
        state: 1,
      },
      id,
    };
  }

  private async performTransaction(params: any, id: any) {
    // Obunani avtomatik faollashtirish
    const businessId = params.account?.businessId;
    const planId = params.account?.planId;

    if (businessId && planId) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      await this.prisma.subscription.create({
        data: {
          businessId,
          planId,
          status: 'active',
          currentPeriodStart: new Date(),
          currentPeriodEnd: expiresAt,
          cancelAtPeriodEnd: false,
        },
      });

      this.logger.log(`Payme orqali obuna avtomatik faollashtirildi: business=${businessId}`);
    }

    return {
      result: {
        transaction: params.id,
        perform_time: Date.now(),
        state: 2,
      },
      id,
    };
  }

  private async cancelTransaction(params: any, id: any) {
    return {
      result: {
        transaction: params.id,
        cancel_time: Date.now(),
        state: -1,
      },
      id,
    };
  }

  private async checkTransaction(params: any, id: any) {
    return {
      result: {
        create_time: Date.now() - 5000,
        perform_time: Date.now(),
        cancel_time: 0,
        transaction: params.id,
        state: 2,
        reason: null,
      },
      id,
    };
  }
}
