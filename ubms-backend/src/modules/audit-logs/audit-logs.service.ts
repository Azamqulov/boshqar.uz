import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

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
}
