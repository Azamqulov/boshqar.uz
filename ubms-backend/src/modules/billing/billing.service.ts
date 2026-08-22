import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface PaymentRequisitesDto {
  cardNumber: string;
  cardHolder: string;
  bankName: string;
  phone?: string;
  telegramContact?: string;
  instructions?: string;
  isEnabled?: boolean;
}

export interface CreateBillingRequestDto {
  planId: string;
  durationMonths?: number;
  amount?: number;
  senderCard?: string;
  senderName?: string;
  receiptUrl?: string;
  notes?: string;
}

const DEFAULT_REQUISITES: PaymentRequisitesDto = {
  cardNumber: '8600 0000 0000 0000',
  cardHolder: 'BOSHQAR UZ ADMIN',
  bankName: 'Kapitalbank / TBC Bank',
  phone: '+998 90 000 00 00',
  telegramContact: '@Boshqar_uzbot',
  instructions: "To'lovni amalga oshirgach, chek fotosuratini yoki o'tkazma ma'lumotlarini yuboring. Administrator tekshirgach, tarifingiz 5-15 daqiqa ichida faollashadi.",
  isEnabled: true,
};

@Injectable()
export class BillingService {
  constructor(private prisma: PrismaService) {}

  // 1. Get SuperAdmin Payment Requisites (Bank Card, Telegram, Instructions)
  async getRequisites(): Promise<PaymentRequisitesDto> {
    const setting = await this.prisma.systemSetting.findUnique({
      where: { key: 'billing_requisites' },
    });

    if (!setting || !setting.value) {
      return DEFAULT_REQUISITES;
    }

    return {
      ...DEFAULT_REQUISITES,
      ...(setting.value as Record<string, any>),
    };
  }

  // 2. Update Payment Requisites (SuperAdmin only)
  async updateRequisites(dto: Partial<PaymentRequisitesDto>): Promise<PaymentRequisitesDto> {
    const current = await this.getRequisites();
    const updated = {
      ...current,
      ...dto,
    };

    await this.prisma.systemSetting.upsert({
      where: { key: 'billing_requisites' },
      update: { value: updated as any },
      create: {
        key: 'billing_requisites',
        value: updated as any,
      },
    });

    return updated;
  }

  // 3. Get Tenant Subscription Status & Plan Details
  async getTenantBillingStatus(businessId: string) {
    const now = new Date();

    const [business, plans, requisites, pendingRequest, activeSubList, branchCount, userCount] =
      await Promise.all([
        this.prisma.business.findUnique({
          where: { id: businessId },
          include: {
            plan: true,
          },
        }),
        this.prisma.plan.findMany({
          orderBy: { priceMonthly: 'asc' },
        }),
        this.getRequisites(),
        this.prisma.billingRequest.findFirst({
          where: { businessId, status: 'pending' },
          orderBy: { createdAt: 'desc' },
          include: { plan: true },
        }),
        this.prisma.subscription.findMany({
          where: { businessId },
          orderBy: { createdAt: 'desc' },
          take: 3,
          include: { plan: true },
        }),
        this.prisma.branch.count({ where: { businessId } }),
        this.prisma.businessUser.count({ where: { businessId } }),
      ]);

    if (!business) {
      throw new NotFoundException('Biznes topilmadi');
    }

    const activeSub =
      activeSubList.find(
        (s) =>
          ['active', 'trialing'].includes(s.status) &&
          new Date(s.currentPeriodEnd) >= now,
      ) ||
      activeSubList[0] ||
      null;

    let daysLeft = 0;
    let isExpired = true;

    if (activeSub) {
      const endMs = new Date(activeSub.currentPeriodEnd).getTime();
      const diffMs = endMs - now.getTime();
      daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      isExpired = diffMs <= 0 || activeSub.status === 'cancelled';
    }

    return {
      business: {
        id: business.id,
        name: business.name,
        status: business.status,
        planId: business.planId,
        plan: business.plan,
      },
      subscription: activeSub
        ? {
            id: activeSub.id,
            status: activeSub.status,
            currentPeriodStart: activeSub.currentPeriodStart,
            currentPeriodEnd: activeSub.currentPeriodEnd,
            planId: activeSub.planId || business.planId,
            planName: activeSub.plan?.name || business.plan?.name,
            daysLeft,
            isExpired,
            isTrial: activeSub.status === 'trialing',
          }
        : null,
      usage: {
        branches: branchCount,
        users: userCount,
      },
      plans,
      requisites,
      pendingRequest,
    };
  }

  // 4. Submit Payment Verification Request (Tenant -> SuperAdmin)
  async submitBillingRequest(businessId: string, dto: CreateBillingRequestDto) {
    const plan = await this.prisma.plan.findUnique({
      where: { id: dto.planId },
    });

    if (!plan) {
      throw new NotFoundException('Tanlangan tarif rejasi topilmadi');
    }

    if (Number(plan.priceMonthly) <= 0) {
      throw new BadRequestException('Free tarif uchun to\'lov so\'rovi yuborish shart emas');
    }

    const durationMonths = dto.durationMonths && dto.durationMonths > 0 ? dto.durationMonths : 1;
    const baseTotal = Number(plan.priceMonthly) * durationMonths;
    let discountPercent = 0;
    if (durationMonths === 12) discountPercent = 15;
    else if (durationMonths === 6) discountPercent = 5;

    const calculatedAmount = Math.round(baseTotal * (1 - discountPercent / 100));
    // SECURITY: Always enforce calculatedAmount from server plan pricing. Never trust client-provided amount.
    const amount = calculatedAmount;
    const clientNote = dto.amount && dto.amount !== calculatedAmount
      ? ` [Klient ko'rsatgan summa: ${dto.amount.toLocaleString()} UZS]`
      : '';
    const finalNotes = dto.notes ? `${dto.notes}${clientNote}` : (clientNote ? clientNote.trim() : undefined);

    // Check if there is an existing pending request
    const existingPending = await this.prisma.billingRequest.findFirst({
      where: { businessId, status: 'pending' },
    });

    if (existingPending) {
      // Update existing pending request
      return this.prisma.billingRequest.update({
        where: { id: existingPending.id },
        data: {
          planId: dto.planId,
          amount,
          durationMonths,
          senderCard: dto.senderCard || existingPending.senderCard,
          senderName: dto.senderName || existingPending.senderName,
          receiptUrl: dto.receiptUrl || existingPending.receiptUrl,
          notes: finalNotes || existingPending.notes,
        },
        include: { plan: true },
      });
    }

    return this.prisma.billingRequest.create({
      data: {
        businessId,
        planId: dto.planId,
        amount,
        durationMonths,
        senderCard: dto.senderCard,
        senderName: dto.senderName,
        receiptUrl: dto.receiptUrl,
        notes: finalNotes,
        status: 'pending',
      },
      include: { plan: true },
    });
  }

  // 5. Get All Billing Requests (SuperAdmin)
  async getAllBillingRequests(status?: string) {
    const where: any = {};
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      where.status = status;
    }

    return this.prisma.billingRequest.findMany({
      where,
      include: {
        business: {
          select: {
            id: true,
            name: true,
            status: true,
            owner: {
              select: { id: true, fullName: true, phone: true, email: true },
            },
          },
        },
        plan: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 6. Approve Billing Request (SuperAdmin -> Activates Plan & Subscription)
  async approveBillingRequest(
    requestId: string,
    reviewerId: string,
    customDurationDays?: number,
    expiresAt?: string,
  ) {
    const request = await this.prisma.billingRequest.findUnique({
      where: { id: requestId },
      include: { business: true, plan: true },
    });

    if (!request) {
      throw new NotFoundException('To\'lov so\'rovi topilmadi');
    }

    if (request.status === 'approved') {
      throw new BadRequestException('Ushbu so\'rov allaqachon tasdiqlangan');
    }

    const now = new Date();
    let periodEnd: Date;

    if (expiresAt) {
      periodEnd = new Date(expiresAt);
    } else if (customDurationDays) {
      periodEnd = new Date(now.getTime() + customDurationDays * 24 * 60 * 60 * 1000);
    } else {
      periodEnd = new Date(now.getTime() + (request.durationMonths || 1) * 30 * 24 * 60 * 60 * 1000);
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Mark request approved
      const updatedReq = await tx.billingRequest.update({
        where: { id: requestId },
        data: {
          status: 'approved',
          reviewedBy: reviewerId,
          reviewedAt: now,
        },
      });

      // 2. Update Business status & planId
      await tx.business.update({
        where: { id: request.businessId },
        data: {
          planId: request.planId,
          status: 'active',
        },
      });

      // 3. Create active subscription
      await tx.subscription.create({
        data: {
          businessId: request.businessId,
          planId: request.planId,
          status: 'active',
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          cancelAtPeriodEnd: false,
        },
      });

      return {
        success: true,
        request: updatedReq,
        businessName: request.business.name,
        planName: request.plan.name,
        currentPeriodEnd: periodEnd,
      };
    });
  }

  // 7. Reject Billing Request (SuperAdmin)
  async rejectBillingRequest(requestId: string, reviewerId: string, rejectReason?: string) {
    const request = await this.prisma.billingRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('To\'lov so\'rovi topilmadi');
    }

    return this.prisma.billingRequest.update({
      where: { id: requestId },
      data: {
        status: 'rejected',
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
        rejectReason: rejectReason || 'To\'lov summasi yoki chek tasdiqlanmadi',
      },
    });
  }

  // 8. Delete Billing Request (SuperAdmin)
  async deleteBillingRequest(requestId: string) {
    const req = await this.prisma.billingRequest.findUnique({ where: { id: requestId } });
    if (!req) throw new NotFoundException('To\'lov so\'rovi topilmadi');
    return this.prisma.billingRequest.delete({ where: { id: requestId } });
  }

  // 9. Update Billing Request (SuperAdmin - change plan, duration, amount, expiry date)
  async updateBillingRequest(
    requestId: string,
    dto: {
      planId?: string;
      durationMonths?: number;
      amount?: number;
      notes?: string;
      expiresAt?: string;
      status?: string;
    },
  ) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.billingRequest.findUnique({
        where: { id: requestId },
        include: { business: true },
      });

      if (!existing) {
        throw new NotFoundException('To\'lov so\'rovi topilmadi');
      }

      const data: any = {};
      if (dto.planId) data.planId = dto.planId;
      if (dto.durationMonths) data.durationMonths = Number(dto.durationMonths);
      if (dto.amount !== undefined) data.amount = dto.amount;
      if (dto.notes !== undefined) data.notes = dto.notes;
      if (dto.status) data.status = dto.status;

      const updatedReq = await tx.billingRequest.update({
        where: { id: requestId },
        data,
        include: { plan: true, business: true },
      });

      const targetPlanId = dto.planId || existing.planId;

      if (dto.expiresAt || dto.planId || dto.status === 'approved') {
        const periodEnd = dto.expiresAt
          ? new Date(dto.expiresAt)
          : new Date(Date.now() + (dto.durationMonths || existing.durationMonths || 1) * 30 * 86400000);

        const activeSub = await tx.subscription.findFirst({
          where: { businessId: existing.businessId },
          orderBy: { createdAt: 'desc' },
        });

        if (activeSub) {
          await tx.subscription.update({
            where: { id: activeSub.id },
            data: {
              planId: targetPlanId,
              currentPeriodEnd: periodEnd,
              status: 'active',
            },
          });
        } else {
          await tx.subscription.create({
            data: {
              businessId: existing.businessId,
              planId: targetPlanId,
              status: 'active',
              currentPeriodStart: new Date(),
              currentPeriodEnd: periodEnd,
            },
          });
        }

        await tx.business.update({
          where: { id: existing.businessId },
          data: {
            planId: targetPlanId,
            status: 'active',
          },
        });
      }

      return updatedReq;
    });
  }
}

