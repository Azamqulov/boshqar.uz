import { Controller, Get } from "@nestjs/common";
import { PrismaService } from "./prisma/prisma.service";
import { Public } from "./common/decorators/custom.decorator";
import { getMaintenanceConfig } from "./modules/super-admin/services/super-admin-tenants.service";

@Controller("health")
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  async check() {
    const start = Date.now();
    let dbStatus = "ok";
    let dbLatencyMs = 0;

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbLatencyMs = Date.now() - start;
    } catch {
      dbStatus = "error";
    }

    const memory = process.memoryUsage();

    return {
      status: dbStatus === "ok" ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      version: process.env.APP_VERSION || "2.0.0",
      environment: process.env.NODE_ENV || "development",
      uptimeSeconds: Math.floor(process.uptime()),
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
      },
      system: {
        memoryRssMb: Math.round(memory.rss / 1024 / 1024),
        memoryHeapUsedMb: Math.round(memory.heapUsed / 1024 / 1024),
        nodeVersion: process.version,
      },
    };
  }

  @Public()
  @Get("maintenance")
  getMaintenance() {
    return getMaintenanceConfig();
  }
}
