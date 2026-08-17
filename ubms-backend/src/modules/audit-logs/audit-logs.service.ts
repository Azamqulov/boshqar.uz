import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuditLogsService {
  constructor(private prisma: PrismaService) {}

  async findAll(businessId: string, limit = 100) {
    return this.prisma.auditLog.findMany({
      where: { businessId },
      include: {
        user: { select: { id: true, fullName: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async cleanup(businessId: string, period: '1d' | '7d' | '30d' | 'all' = '7d') {
    const where: Prisma.AuditLogWhereInput = { businessId };
    if (period !== 'all') {
      const cutoff = new Date();
      if (period === '1d') {
        cutoff.setDate(cutoff.getDate() - 1);
      } else if (period === '7d') {
        cutoff.setDate(cutoff.getDate() - 7);
      } else if (period === '30d') {
        cutoff.setDate(cutoff.getDate() - 30);
      }
      where.createdAt = { lte: cutoff };
    }

    const result = await this.prisma.auditLog.deleteMany({ where });
    return {
      success: true,
      count: result.count,
      message: `${result.count} ta audit yozuvi tozalandi`,
    };
  }
}
