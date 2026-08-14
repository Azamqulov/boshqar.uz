import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OpenShiftDto, CloseShiftDto } from './dto/shift.dto';

@Injectable()
export class ShiftsService {
  constructor(private readonly prisma: PrismaService) {}

  // Helper to ensure today's unlinked orders get assigned to an open shift
  private async autoLinkOrphanOrders(businessId: string, branchId?: string) {
    try {
      let resolvedBranchId = branchId;
      if (!resolvedBranchId) {
        const defaultBranch = await this.prisma.branch.findFirst({ where: { businessId } });
        resolvedBranchId = defaultBranch?.id;
      }
      if (!resolvedBranchId) return null;

      // Find active open shift
      let activeShift = await this.prisma.posShift.findFirst({
        where: {
          businessId,
          branchId: resolvedBranchId,
          status: 'open',
        },
      });

      // Find completed orders without a shift
      const unlinkedOrders = await this.prisma.order.findMany({
        where: {
          businessId,
          shiftId: null,
          status: 'completed',
        },
        orderBy: { createdAt: 'asc' },
      });

      if (unlinkedOrders.length > 0) {
        if (!activeShift) {
          const defaultUser = await this.prisma.user.findFirst({
            where: {
              OR: [
                { businessUsers: { some: { businessId } } },
                { ownedBusinesses: { some: { id: businessId } } },
              ],
            },
          });
          if (!defaultUser) return null;

          const earliestDate = unlinkedOrders[0].createdAt || new Date();
          activeShift = await this.prisma.posShift.create({
            data: {
              businessId,
              branchId: resolvedBranchId,
              userId: defaultUser.id,
              openedAt: earliestDate,
              startingCash: 0,
              expectedCash: 0,
              status: 'open',
              notes: 'Bugungi savdo smenasi (Avtomatik)',
            },
          });
        }

        // Link orders to active shift
        await this.prisma.order.updateMany({
          where: {
            id: { in: unlinkedOrders.map((o) => o.id) },
          },
          data: {
            shiftId: activeShift.id,
          },
        });
      }

      return activeShift;
    } catch (e) {
      console.error('autoLinkOrphanOrders error:', e);
      return null;
    }
  }

  // 1. Get current active open shift
  async getCurrentShift(businessId: string, branchId?: string, userId?: string) {
    if (!businessId) return null;

    await this.autoLinkOrphanOrders(businessId, branchId);

    const where: any = {
      businessId,
      status: 'open',
    };

    if (branchId) {
      where.branchId = branchId;
    }

    const shift = await this.prisma.posShift.findFirst({
      where,
      orderBy: { openedAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            phone: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!shift) return null;

    // Calculate real-time summary for this shift
    const summary = await this.getShiftSummary(businessId, shift.id);
    return {
      ...shift,
      cashSales: summary.cashSales,
      cardSales: summary.cardSales,
      otherSales: summary.otherSales,
      totalSales: summary.totalSales,
      cashExpenses: summary.cashExpenses,
      expectedCash: summary.expectedCash,
      ordersCount: summary.ordersCount || 0,
      liveSummary: summary,
    };
  }

  // 2. Open new shift
  async openShift(businessId: string, branchId: string, userId: string, dto: OpenShiftDto) {
    if (!branchId) {
      const defaultBranch = await this.prisma.branch.findFirst({ where: { businessId } });
      if (!defaultBranch) {
        throw new BadRequestException('Filial topilmadi. Avval filial yarating.');
      }
      branchId = defaultBranch.id;
    }

    // Check if there is already an open shift for this branch
    const existingOpenShift = await this.prisma.posShift.findFirst({
      where: {
        businessId,
        branchId,
        status: 'open',
      },
    });

    if (existingOpenShift) {
      throw new BadRequestException('Ushbu filialda faol smena allaqachon ochiq! Avval joriy smenani yoping.');
    }

    const startingCash = Number(dto.startingCash) || 0;

    const newShift = await this.prisma.posShift.create({
      data: {
        businessId,
        branchId,
        userId,
        startingCash,
        expectedCash: startingCash,
        notes: dto.notes || null,
        status: 'open',
      },
      include: {
        user: {
          select: { id: true, fullName: true, phone: true },
        },
        branch: {
          select: { id: true, name: true },
        },
      },
    });

    return newShift;
  }

  // 3. Get Real-time Shift Summary & Breakdown
  async getShiftSummary(businessId: string, shiftId: string) {
    const shift = await this.prisma.posShift.findFirst({
      where: { id: shiftId, businessId },
      include: {
        business: { select: { businessType: true } },
      },
    });

    if (!shift) {
      throw new NotFoundException('Smena topilmadi');
    }

    const isRestaurant = shift.business?.businessType === 'restaurant' || shift.business?.businessType === 'cafe';

    // Find all completed orders in this shift
    const orders = await this.prisma.order.findMany({
      where: {
        shiftId: shift.id,
        status: 'completed',
      },
      include: {
        payments: {
          include: {
            paymentMethod: true,
          },
        },
      },
    });

    let cashSales = 0;
    let cardSales = 0;
    let otherSales = 0;
    let totalSales = 0;

    for (const order of orders) {
      totalSales += Number(order.total || 0);
      for (const payment of order.payments) {
        const amt = Number(payment.amount || 0);
        const type = payment.paymentMethod?.type;
        if (type === 'cash') {
          cashSales += amt;
        } else if (type === 'card') {
          cardSales += amt;
        } else {
          otherSales += amt;
        }
      }
    }

    // Find all cash expenses recorded during this shift time range
    const shiftEndTime = shift.closedAt || new Date();
    const expenses = await this.prisma.expense.findMany({
      where: {
        businessId,
        branchId: shift.branchId,
        recordedAt: {
          gte: shift.openedAt,
          lte: shiftEndTime,
        },
      },
    });

    let cashExpenses = 0;
    for (const exp of expenses) {
      cashExpenses += Number(exp.amount || 0);
    }

    const startingCash = Number(shift.startingCash || 0);
    const rawExpectedCash = startingCash + cashSales - cashExpenses;
    const expectedCash = Math.max(0, rawExpectedCash);
    const actualCash = shift.actualCash !== null ? Number(shift.actualCash) : null;
    const difference = actualCash !== null ? actualCash - (startingCash + cashSales - cashExpenses) : null;

    // Check for pending/held/draft orders in this shift
    const pendingOrders = await this.prisma.order.findMany({
      where: {
        businessId,
        shiftId: shift.id,
        status: { notIn: ['completed', 'cancelled'] },
      },
      select: {
        id: true,
        orderNumber: true,
        total: true,
        status: true,
        table: { select: { name: true } },
      },
    });

    // Check for occupied tables in this branch (Only for restaurant / cafe)
    const occupiedTables = isRestaurant
      ? await this.prisma.table.findMany({
          where: {
            branchId: shift.branchId,
            status: 'occupied',
          },
          select: {
            id: true,
            name: true,
            status: true,
          },
        })
      : [];

    // Check for pending/preparing kitchen items in this shift (Only for restaurant / cafe)
    const pendingKitchenItems = isRestaurant
      ? await this.prisma.orderItem.findMany({
          where: {
            order: {
              businessId,
              branchId: shift.branchId,
              shiftId: shift.id,
              status: { not: 'completed' },
            },
            status: { in: ['pending', 'preparing'] },
          },
          include: {
            product: { select: { name: true } },
            order: {
              select: {
                orderNumber: true,
                table: { select: { name: true } },
              },
            },
          },
        })
      : [];

    const canClose = occupiedTables.length === 0 && pendingKitchenItems.length === 0 && pendingOrders.length === 0;

    return {
      shiftId: shift.id,
      status: shift.status,
      openedAt: shift.openedAt,
      closedAt: shift.closedAt,
      ordersCount: orders.length,
      startingCash,
      cashSales,
      cardSales,
      otherSales,
      totalSales,
      cashExpenses,
      expectedCash,
      actualCash,
      difference,
      isDifferenceZero: difference === 0,
      isDeficit: difference !== null && difference < 0,
      isSurplus: difference !== null && difference > 0,
      pendingOrders,
      occupiedTables,
      pendingKitchenItems,
      canClose,
    };
  }

  // 4. Close Shift
  async closeShift(businessId: string, shiftId: string, userId: string, dto: CloseShiftDto) {
    const shift = await this.prisma.posShift.findFirst({
      where: { id: shiftId, businessId },
    });

    if (!shift) {
      throw new NotFoundException('Smena topilmadi');
    }

    if (shift.status === 'closed') {
      throw new BadRequestException('Ushbu smena allaqachon yopilgan!');
    }

    // Calculate final metrics
    const summary = await this.getShiftSummary(businessId, shiftId);

    // Prevent closing if there are pending orders, occupied tables, or unfinished kitchen items
    if (!summary.canClose) {
      const issues: string[] = [];
      if (summary.pendingOrders?.length > 0) {
        issues.push(`${summary.pendingOrders.length} ta yopilmagan yoki kutilayotgan buyurtma mavjud`);
      }
      if (summary.occupiedTables?.length > 0) {
        issues.push(`${summary.occupiedTables.length} ta band stol hisobi yopilmagan (${summary.occupiedTables.map((t: any) => t.name).join(', ')})`);
      }
      if (summary.pendingKitchenItems?.length > 0) {
        issues.push(`${summary.pendingKitchenItems.length} ta taom oshxonada tayyorlanmoqda`);
      }

      throw new BadRequestException(
        `Smenani yopib bo'lmaydi! Quyidagilarni yakunlang: ${issues.join('; ')}.`
      );
    }
    const actualCash = Number(dto.actualCash) || 0;
    const difference = actualCash - summary.expectedCash;

    const updatedShift = await this.prisma.posShift.update({
      where: { id: shift.id },
      data: {
        status: 'closed',
        closedAt: new Date(),
        actualCash,
        difference,
        cashSales: summary.cashSales,
        cardSales: summary.cardSales,
        otherSales: summary.otherSales,
        totalSales: summary.totalSales,
        cashExpenses: summary.cashExpenses,
        expectedCash: summary.expectedCash,
        ordersCount: summary.ordersCount,
        notes: dto.notes ? `${shift.notes ? shift.notes + '\n' : ''}Yopish izohi: ${dto.notes}` : shift.notes,
      },
      include: {
        user: {
          select: { id: true, fullName: true, phone: true },
        },
        branch: {
          select: { id: true, name: true },
        },
      },
    });

    return {
      ...updatedShift,
      summary: {
        ...summary,
        actualCash,
        difference,
      },
    };
  }

  // 5. Shift History List
  async findAll(businessId: string, branchId?: string, status?: string) {
    await this.autoLinkOrphanOrders(businessId, branchId);

    const where: any = { businessId };
    if (branchId) where.branchId = branchId;
    if (status) where.status = status;

    const shifts = await this.prisma.posShift.findMany({
      where,
      orderBy: { openedAt: 'desc' },
      take: 50,
      include: {
        user: {
          select: { id: true, fullName: true, phone: true },
        },
        branch: {
          select: { id: true, name: true },
        },
      },
    });

    const populated = await Promise.all(
      shifts.map(async (s) => {
        try {
          const summary = await this.getShiftSummary(businessId, s.id);
          return {
            ...s,
            cashSales: summary.cashSales,
            cardSales: summary.cardSales,
            otherSales: summary.otherSales,
            totalSales: summary.totalSales,
            cashExpenses: summary.cashExpenses,
            expectedCash: summary.expectedCash,
            ordersCount: summary.ordersCount || 0,
            liveSummary: summary,
          };
        } catch {
          return s;
        }
      })
    );

    return populated;
  }

  // 6. Detailed Printable Z-Report
  async getShiftReport(businessId: string, shiftId: string) {
    const shift = await this.prisma.posShift.findFirst({
      where: { id: shiftId, businessId },
      include: {
        user: { select: { id: true, fullName: true, phone: true } },
        branch: { select: { id: true, name: true, phone: true, address: true } },
        business: { select: { id: true, name: true } },
      },
    });

    if (!shift) {
      throw new NotFoundException('Smena topilmadi');
    }

    const summary = await this.getShiftSummary(businessId, shiftId);

    // List top sold items during this shift
    const orders = await this.prisma.order.findMany({
      where: { shiftId: shift.id, status: 'completed' },
      include: {
        items: {
          include: {
            product: true,
            service: true,
          },
        },
      },
    });

    const itemMap = new Map<string, { name: string; qty: number; total: number }>();
    for (const ord of orders) {
      for (const item of ord.items) {
        const name = item.product?.name || item.service?.name || 'Mahsulot';
        const current = itemMap.get(name) || { name, qty: 0, total: 0 };
        current.qty += Number(item.quantity || 0);
        current.total += Number(item.total || 0);
        itemMap.set(name, current);
      }
    }

    const topItems = Array.from(itemMap.values()).sort((a, b) => b.total - a.total);

    return {
      shift,
      summary,
      topItems,
    };
  }
}
