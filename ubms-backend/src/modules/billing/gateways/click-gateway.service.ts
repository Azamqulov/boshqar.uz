import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export interface ClickPrepareDto {
  click_trans_id: string;
  service_id: string;
  click_paydoc_id: string;
  merchant_trans_id: string; // format: businessId:planId
  amount: string;
  action: string;
  error: string;
  error_note: string;
  sign_time: string;
  sign_string: string;
}

export interface ClickCompleteDto extends ClickPrepareDto {
  merchant_prepare_id: string;
}

@Injectable()
export class ClickGatewayService {
  private readonly logger = new Logger(ClickGatewayService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Click Prepare Webhook (To'lov tekshiruvi)
   */
  async handlePrepare(dto: ClickPrepareDto) {
    const [businessId, planId] = (dto.merchant_trans_id || '').split(':');

    if (!businessId || !planId) {
      return {
        error: -5,
        error_note: 'Biznes yoki tarif topilmadi',
      };
    }

    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
    if (!plan || Number(plan.priceMonthly) <= 0) {
      return {
        error: -6,
        error_note: 'Tarif mavjud emas',
      };
    }

    return {
      click_trans_id: dto.click_trans_id,
      merchant_trans_id: dto.merchant_trans_id,
      merchant_prepare_id: `${Date.now()}`,
      error: 0,
      error_note: 'Success',
    };
  }

  /**
   * Click Complete Webhook (To'lovni tasdiqlash va obunani faollashtirish)
   */
  async handleComplete(dto: ClickCompleteDto) {
    const [businessId, planId] = (dto.merchant_trans_id || '').split(':');

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

      this.logger.log(`Click orqali obuna avtomatik faollashtirildi: business=${businessId}`);
    }

    return {
      click_trans_id: dto.click_trans_id,
      merchant_trans_id: dto.merchant_trans_id,
      merchant_confirm_id: `${Date.now()}`,
      error: 0,
      error_note: 'Success',
    };
  }
}
