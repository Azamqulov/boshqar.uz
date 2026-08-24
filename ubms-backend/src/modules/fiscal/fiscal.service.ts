import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FiscalService {
  constructor(private readonly prisma: PrismaService) {}

  async generateFiscalReceipt(businessId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, businessId },
      include: { items: { include: { product: true } } },
    });

    if (!order) {
      throw new NotFoundException("Buyurtma topilmadi");
    }

    // Check if receipt already exists
    const existing = await this.prisma.soliqFiscalReceipt.findUnique({
      where: { orderId },
    });

    if (existing) {
      return existing;
    }

    // Generate mock Soliq OFD sign & QR code URL
    const receiptSeq = Date.now();
    const fiscalSign = `OFD-${Math.floor(100000000000 + Math.random() * 900000000000)}`;
    const qrCodeUrl = `https://ofd.soliq.uz/check?t=ST${receiptSeq}&s=${fiscalSign}&a=${order.total}`;

    const receipt = await this.prisma.soliqFiscalReceipt.create({
      data: {
        businessId,
        orderId,
        fiscalSign,
        qrCodeUrl,
        terminalId: 'TER-SOLIQ-001',
        receiptSeq: BigInt(receiptSeq),
        status: 'SUCCESS',
      },
    });

    return {
      ...receipt,
      receiptSeq: receipt.receiptSeq.toString(),
    };
  }

  async getZReport(businessId: string) {
    const totalReceipts = await this.prisma.soliqFiscalReceipt.count({
      where: { businessId, status: 'SUCCESS' },
    });

    const orders = await this.prisma.order.findMany({
      where: { businessId, status: 'completed' },
      select: { total: true },
    });

    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);
    const totalTax = Math.round(totalRevenue * 0.12); // 12% NDS

    return {
      zReportId: `Z-REP-${Date.now()}`,
      generatedAt: new Date().toISOString(),
      totalReceipts,
      totalRevenue,
      totalTax,
      currency: 'UZS',
    };
  }
}
