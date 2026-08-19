import { Injectable, Logger } from '@nestjs/common';

export interface TerminalPaymentRequest {
  amount: number;
  orderNumber: string;
  terminalType: 'uzcard' | 'humo' | 'universal';
  portOrIp?: string;
}

export interface TerminalPaymentResponse {
  success: boolean;
  transactionId: string;
  panMasked: string; // masalan 8600 **** **** 1234
  rrn: string;
  authCode: string;
  amount: number;
  message: string;
}

@Injectable()
export class TerminalIntegrationService {
  private readonly logger = new Logger(TerminalIntegrationService.name);

  /**
   * Kassa apparatidan bank terminaliga (Uzcard / Humo) to'lov yuborish
   */
  async processTerminalPayment(req: TerminalPaymentRequest): Promise<TerminalPaymentResponse> {
    this.logger.log(`Terminal to'lovi yuborilmoqda: order=${req.orderNumber}, amount=${req.amount} UZS`);

    // Bank terminal protokoli simulyatsiyasi (TCP/IP yoki Serial COM port orqali)
    const transactionId = `TRX-${Date.now()}`;
    const rrn = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    const authCode = Math.floor(100000 + Math.random() * 900000).toString();
    const panPrefix = req.terminalType === 'humo' ? '9860' : '8600';
    const panMasked = `${panPrefix} **** **** ${Math.floor(1000 + Math.random() * 9000)}`;

    return {
      success: true,
      transactionId,
      panMasked,
      rrn,
      authCode,
      amount: req.amount,
      message: 'To\'lov muvaffaqiyatli qabul qilindi',
    };
  }
}
