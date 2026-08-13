import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private prisma: PrismaService) {}

  // 1. Har 15 daqiqada: Omborda kam qolgan tovarlarni tekshirish (Low-stock scan)
  @Cron(CronExpression.EVERY_30_MINUTES)
  async handleLowStockCheck() {
    this.logger.log('🔍 Kam qolgan tovarlar (Low-stock) monitoringi boshlandi...');

    try {
      const lowStockItems = await this.prisma.inventory.findMany({
        where: {
          product: {
            status: 'active',
          },
        },
        include: {
          product: {
            include: {
              business: {
                include: {
                  owner: true,
                },
              },
            },
          },
          branch: true,
        },
      });

      for (const inv of lowStockItems) {
        const currentQty = Number(inv.quantity);
        const minStock = Number(inv.product.minStock);

        if (minStock > 0 && currentQty <= minStock) {
          const businessId = inv.product.businessId;
          const ownerId = inv.product.business.ownerId;

          // Check if notification already created in last 24 hours
          const todayStart = new Date();
          todayStart.setHours(0, 0, 0, 0);

          const existingNotification = await this.prisma.notification.findFirst({
            where: {
              businessId,
              type: 'low_stock',
              body: { contains: inv.product.name },
              createdAt: { gte: todayStart },
            },
          });

          if (!existingNotification) {
            await this.prisma.notification.create({
              data: {
                businessId,
                userId: ownerId,
                type: 'low_stock',
                channel: 'in_app',
                title: '⚠️ Kam qolgan mahsulot ogohlantirishi',
                body: `"${inv.product.name}" (${inv.branch.name}) mahsuloti qoldig'i kam qoldi: ${currentQty} dona (Minimal me'yor: ${minStock} dona)`,
              },
            });
            this.logger.warn(`Ogohlantirish yuborildi: ${inv.product.name} (Qoldiq: ${currentQty})`);
          }
        }
      }
    } catch (err) {
      this.logger.error('Low-stock tekshiruvida xatolik:', err);
    }
  }

  // 2. Har kuni soat 21:00 da: Kunlik yakuniy hisobot (Daily summary report)
  @Cron('0 21 * * *')
  async handleDailySummaryReport() {
    this.logger.log('🌙 Kunlik 21:00 biznes xulosalari hisob-kitobi boshlandi...');

    try {
      const businesses = await this.prisma.business.findMany({
        where: { status: 'active' },
      });

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      for (const biz of businesses) {
        const [orders, expenses] = await Promise.all([
          this.prisma.order.findMany({
            where: {
              businessId: biz.id,
              status: 'completed',
              completedAt: { gte: todayStart, lte: todayEnd },
            },
            include: {
              items: { include: { product: true } },
            },
          }),
          this.prisma.expense.findMany({
            where: {
              businessId: biz.id,
              recordedAt: { gte: todayStart, lte: todayEnd },
            },
          }),
        ]);

        const totalSales = orders.reduce((sum, o) => sum + Number(o.total), 0);
        const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

        let totalCogs = 0;
        for (const order of orders) {
          for (const item of order.items) {
            if (item.product) {
              totalCogs += Number(item.quantity) * Number(item.product.purchasePrice);
            }
          }
        }

        const netProfit = totalSales - totalCogs - totalExpenses;

        await this.prisma.notification.create({
          data: {
            businessId: biz.id,
            userId: biz.ownerId,
            type: 'system',
            channel: 'in_app',
            title: `🌙 ${biz.name} — Kunlik Yakuniy Hisobot`,
            body: `Bugungi savdo: ${totalSales.toLocaleString()} so'm | Sof foyda: ${netProfit.toLocaleString()} so'm | Cheklar: ${orders.length} ta`,
          },
        });
      }
    } catch (err) {
      this.logger.error('Kunlik hisobot generatsiyasida xatolik:', err);
    }
  }

  // 3. Har 1 soatda: Yaqinlashayotgan bandlovlar eslatmasi (Appointments reminder)
  @Cron(CronExpression.EVERY_HOUR)
  async handleUpcomingAppointments() {
    try {
      const now = new Date();
      const nextHour = new Date(now.getTime() + 60 * 60 * 1000);

      const appointments = await this.prisma.appointment.findMany({
        where: {
          scheduledAt: { gte: now, lte: nextHour },
          status: { in: ['booked', 'confirmed'] },
        },
        include: {
          service: true,
          customer: true,
          employee: true,
          business: true,
        },
      });

      for (const app of appointments) {
        await this.prisma.notification.create({
          data: {
            businessId: app.businessId,
            userId: app.business.ownerId,
            type: 'appointment',
            channel: 'in_app',
            title: '⏰ Yaqinlashayotgan bandlov eslatmasi',
            body: `1 soat ichida: ${app.customer?.fullName} mijoz — ${app.service?.name} (Usta: ${app.employee?.fullName})`,
          },
        });
      }
    } catch (err) {
      this.logger.error('Bandlovlar eslatmasida xatolik:', err);
    }
  }
}
