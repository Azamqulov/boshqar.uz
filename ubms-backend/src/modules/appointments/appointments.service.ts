import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AppointmentStatus } from '@prisma/client';

export interface CreateAppointmentDto {
  customerId: string;
  serviceId: string;
  employeeId: string;
  scheduledAt: string;
}

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async getServices(businessId: string) {
    return this.prisma.service.findMany({
      where: { businessId, status: 'active' },
      orderBy: { name: 'asc' },
    });
  }

  async createService(businessId: string, data: { name: string; price: number; durationMinutes?: number }) {
    return this.prisma.service.create({
      data: {
        businessId,
        name: data.name,
        price: data.price,
        durationMinutes: data.durationMinutes || 30,
        status: 'active',
      },
    });
  }

  async findAll(businessId: string, branchId?: string, date?: string) {
    const where: any = { businessId };
    if (branchId) where.branchId = branchId;

    if (date) {
      const d = new Date(date);
      const start = new Date(d.setHours(0, 0, 0, 0));
      const end = new Date(d.setHours(23, 59, 59, 999));
      where.scheduledAt = { gte: start, lte: end };
    }

    return this.prisma.appointment.findMany({
      where,
      include: {
        customer: true,
        service: true,
        employee: true,
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async create(businessId: string, branchId: string, dto: CreateAppointmentDto) {
    const service = await this.prisma.service.findFirst({
      where: { id: dto.serviceId, businessId },
    });

    if (!service) {
      throw new NotFoundException({ code: 'SERVICE_NOT_FOUND', message: 'Xizmat topilmadi' });
    }

    const scheduledStart = new Date(dto.scheduledAt);
    const scheduledEnd = new Date(scheduledStart.getTime() + service.durationMinutes * 60000);

    // Overlap check for employee
    const existingAppointments = await this.prisma.appointment.findMany({
      where: {
        employeeId: dto.employeeId,
        status: { in: ['booked', 'confirmed', 'in_progress'] },
      },
      include: { service: true },
    });

    for (const app of existingAppointments) {
      const appStart = new Date(app.scheduledAt);
      const appEnd = new Date(appStart.getTime() + app.service.durationMinutes * 60000);

      const isOverlap = scheduledStart < appEnd && scheduledEnd > appStart;
      if (isOverlap) {
        throw new ConflictException({
          code: 'OVERLAPPING_APPOINTMENT',
          message: 'Ushbu mutaxassisning belgilangan vaqtida boshqa bandlovi mavjud',
        });
      }
    }

    return this.prisma.appointment.create({
      data: {
        businessId,
        branchId,
        customerId: dto.customerId,
        serviceId: dto.serviceId,
        employeeId: dto.employeeId,
        scheduledAt: scheduledStart,
        status: 'booked',
      },
      include: {
        customer: true,
        service: true,
        employee: true,
      },
    });
  }

  async updateStatus(id: string, status: AppointmentStatus) {
    return this.prisma.appointment.update({
      where: { id },
      data: { status },
      include: {
        customer: true,
        service: true,
        employee: true,
      },
    });
  }
}
