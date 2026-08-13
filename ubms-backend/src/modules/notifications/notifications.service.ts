import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(businessId: string, userId: string) {
    return this.prisma.notification.findMany({
      where: { businessId, userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markAsRead(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(businessId: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { businessId, userId, isRead: false },
      data: { isRead: true },
    });
  }
}
