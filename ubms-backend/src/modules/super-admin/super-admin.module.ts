import { Module } from '@nestjs/common';
import { SuperAdminController } from './super-admin.controller';
import { SuperAdminService } from './super-admin.service';
import { SuperAdminAnalyticsService } from './services/super-admin-analytics.service';
import { SuperAdminTenantsService } from './services/super-admin-tenants.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SuperAdminController],
  providers: [
    SuperAdminService,
    SuperAdminAnalyticsService,
    SuperAdminTenantsService,
  ],
  exports: [
    SuperAdminService,
    SuperAdminAnalyticsService,
    SuperAdminTenantsService,
  ],
})
export class SuperAdminModule {}
