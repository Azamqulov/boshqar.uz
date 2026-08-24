import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface CreateTerminalDto {
  branchId: string;
  name: string;
  provider: string; // uzcard, humo, multipay
  terminalId: string;
  merchantId: string;
  connectionType?: string;
  ipAddress?: string;
  port?: number;
}

@Injectable()
export class TerminalService {
  constructor(private readonly prisma: PrismaService) {}

  async getTerminals(businessId: string) {
    return this.prisma.paymentTerminal.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createTerminal(businessId: string, dto: CreateTerminalDto) {
    return this.prisma.paymentTerminal.create({
      data: {
        businessId,
        branchId: dto.branchId,
        name: dto.name,
        provider: dto.provider,
        terminalId: dto.terminalId,
        merchantId: dto.merchantId,
        connectionType: dto.connectionType || 'ethernet',
        ipAddress: dto.ipAddress || '192.168.1.150',
        port: dto.port || 8080,
      },
    });
  }

  async charge(businessId: string, terminalId: string, amount: number, orderId?: string) {
    const terminal = await this.prisma.paymentTerminal.findFirst({
      where: { id: terminalId, businessId },
    });

    if (!terminal) {
      throw new NotFoundException("POS Terminal topilmadi");
    }

    if (!terminal.isActive) {
      throw new BadRequestException("Tanlangan POS terminal faol emas");
    }

    // Simulate Uzcard/Humo Terminal transaction response
    const rrn = `RRN-${Math.floor(100000000000 + Math.random() * 900000000000)}`;
    const stan = `${Math.floor(100000 + Math.random() * 900000)}`;
    const cardMask = terminal.provider === 'uzcard' ? '8600 **** **** 1234' : '9860 **** **** 5678';

    const transaction = await this.prisma.terminalTransaction.create({
      data: {
        terminalId: terminal.id,
        orderId,
        amount,
        currency: 'UZS',
        rrn,
        stan,
        responseCode: '00',
        cardMask,
        status: 'APPROVED',
      },
    });

    return {
      success: true,
      transactionId: transaction.id,
      provider: terminal.provider,
      amount,
      rrn,
      stan,
      cardMask,
      message: `${terminal.provider.toUpperCase()} to'lov muvaffaqiyatli amalga oshirildi`,
    };
  }

  async cancelTransaction(businessId: string, transactionId: string) {
    const transaction = await this.prisma.terminalTransaction.findUnique({
      where: { id: transactionId },
      include: { terminal: true },
    });

    if (!transaction || transaction.terminal.businessId !== businessId) {
      throw new NotFoundException("Tranzaksiya topilmadi");
    }

    const updated = await this.prisma.terminalTransaction.update({
      where: { id: transactionId },
      data: { status: 'CANCELLED' },
    });

    return {
      success: true,
      transactionId: updated.id,
      status: 'CANCELLED',
      message: "To'lov bekor qilindi (Refund)",
    };
  }
}
