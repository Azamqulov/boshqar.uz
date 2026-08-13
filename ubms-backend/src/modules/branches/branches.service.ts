import { Injectable, NotFoundException } from '@nestjs/common';
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
