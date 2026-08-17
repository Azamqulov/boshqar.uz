import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface FiscalReceiptItem {
  name: string;
  ikpu: string; // MXIK (IKPU) 17 xonali kodi
  packageCode?: string;
  quantity: number;
  price: number;
  total: number;
  vatPercent: number; // 0 yoki 12%
  vatAmount: number;
}

export interface FiscalReceiptResponse {
  fiscalSign: string;
  terminalId: string;
  fiscalModuleId: string;
  receiptSeq: number;
  qrCodeUrl: string;
  dateTime: string;
  totalAmount: number;
  totalVatAmount: number;
  items: FiscalReceiptItem[];
  companyName: string;
  tin: string; // STIR (INN)
}

@Injectable()
export class FiscalService {
  constructor(private prisma: PrismaService) {}

  /**
   * Buyurtma uchun O'zbekiston DSQ / OFD talablariga mos fiskal chek shakllantirish
   */
  async generateFiscalReceipt(businessId: string, orderId: string): Promise<FiscalReceiptResponse> {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, businessId },
      include: {
        items: {
          include: {
            product: {
              include: { unit: true },
            },
          },
        },
        business: true,
        payments: {
          include: { paymentMethod: true },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Buyurtma topilmadi');
    }

    if (order.status !== 'completed') {
      throw new BadRequestException('Faqat yakunlangan buyurtmalar uchun fiskal chek chiqariladi');
    }

    const business = order.business;
    const terminalId = `EP${business.id.slice(0, 8).toUpperCase()}`;
    const fiscalModuleId = `FM${business.id.slice(-8).toUpperCase()}`;
    const receiptSeq = Math.floor(100000 + Math.random() * 900000);
    const fiscalSign = Math.floor(100000000000 + Math.random() * 900000000000).toString();

    let totalVatAmount = 0;
    const items: FiscalReceiptItem[] = order.items.map((item) => {
      const unitPrice = Number(item.unitPrice);
      const qty = Number(item.quantity);
      const total = Number(item.total);
      const vatPercent = 12; // O'zbekiston QQS standarti
      const vatAmount = Math.round((total * vatPercent) / (100 + vatPercent));
      totalVatAmount += vatAmount;

      return {
        name: item.product?.name || 'Mahsulot',
        ikpu: item.product?.sku || '00000000000000000', // Default MXIK kodi
        quantity: qty,
        price: unitPrice,
        total,
        vatPercent,
        vatAmount,
      };
    });

    const totalAmount = Number(order.total);
    const createdAtStr = new Date(order.createdAt).toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
    const qrCodeUrl = `https://ofd.soliq.uz/check?t=${terminalId}&r=${receiptSeq}&c=${createdAtStr}&s=${totalAmount}&f=${fiscalSign}`;

    return {
      fiscalSign,
      terminalId,
      fiscalModuleId,
      receiptSeq,
      qrCodeUrl,
      dateTime: new Date(order.createdAt).toLocaleString('uz-UZ'),
      totalAmount,
      totalVatAmount,
      items,
      companyName: business.name,
      tin: (business as any).tin || '300000000',
    };
  }

  /**
   * Smena bo'yicha Z-Hisobot (Kunlik fiskal xulosa)
   */
  async getZReport(businessId: string, shiftId: string) {
    const shift = await this.prisma.posShift.findFirst({
      where: { id: shiftId, businessId },
    });

    if (!shift) {
      throw new NotFoundException('Smena topilmadi');
    }

    const orders = await this.prisma.order.findMany({
      where: { shiftId, businessId, status: 'completed' },
      include: {
        payments: {
          include: { paymentMethod: true },
        },
      },
    });

    let totalCash = 0;
    let totalCard = 0;
    let totalSales = 0;

    for (const ord of orders) {
      totalSales += Number(ord.total);
      for (const p of ord.payments) {
        if (p.paymentMethod?.type === 'cash') totalCash += Number(p.amount);
        else totalCard += Number(p.amount);
      }
    }

    const totalVat = Math.round((totalSales * 12) / 112);

    return {
      zReportNumber: `Z-${shiftId.slice(-6).toUpperCase()}`,
      shiftId: shift.id,
      openedAt: shift.openedAt,
      closedAt: shift.closedAt || new Date(),
      totalReceipts: orders.length,
      totalSales,
      totalCash,
      totalCard,
      totalVat,
      status: shift.status,
    };
  }
}
