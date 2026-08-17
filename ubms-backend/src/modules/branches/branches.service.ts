import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BranchesService {
  constructor(private prisma: PrismaService) {}

  async findAll(businessId: string) {
    return this.prisma.branch.findMany({
      where: { businessId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(businessId: string, id: string) {
    const branch = await this.prisma.branch.findFirst({
      where: { id, businessId },
    });
    if (!branch) {
      throw new NotFoundException({ code: 'BRANCH_NOT_FOUND', message: 'Filial topilmadi' });
    }
    return branch;
  }

  async create(businessId: string, data: { name: string; address?: string; phone?: string; isMain?: boolean }) {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      include: {
        plan: true,
        branches: { select: { id: true } },
      },
    });

    if (!business) {
      throw new NotFoundException('Biznes topilmadi');
    }

    if (business.plan && business.plan.maxBranches !== null && business.branches.length >= business.plan.maxBranches) {
      throw new ForbiddenException({
        code: 'PLAN_LIMIT_BRANCHES',
        message: `Tarifingiz bo'yicha maksimal ${business.plan.maxBranches} ta filial ochish mumkin. Ko'proq filial ochish uchun tarifni yangilang.`,
        maxBranches: business.plan.maxBranches,
        currentBranchesCount: business.branches.length,
      });
    }

    return this.prisma.branch.create({
      data: {
        businessId,
        name: data.name,
        address: data.address,
        phone: data.phone,
        isMain: data.isMain || false,
      },
    });
  }

  async update(businessId: string, id: string, data: { name?: string; address?: string; phone?: string; status?: 'active' | 'closed' }) {
    return this.prisma.branch.update({
      where: { id },
      data,
    });
  }
}
