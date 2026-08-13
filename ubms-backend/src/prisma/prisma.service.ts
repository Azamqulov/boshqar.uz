import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('✅ PostgreSQL ma\'lumotlar bazasiga muvaffaqiyatli ulandi');
    } catch (error) {
      this.logger.warn(
        '⚠️ PostgreSQL bazasiga ulanib bo\'lmadi (localhost:5432). Iltimos, PostgreSQL xizmatini yoki Docker orqali bazani ishga tushiring.',
      );
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
