import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface BackupFileInfo {
  filename: string;
  sizeBytes: number;
  sizeFormatted: string;
  createdAt: string;
  type: 'pg_dump' | 'json_snapshot';
}

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);
  private readonly backupDir = path.resolve(process.cwd(), 'backups');

  constructor(private prisma: PrismaService) {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  // 1. Har kuni soat 03:00 da avtomatik zaxira olish (Auto Cron)
  @Cron('0 3 * * *')
  async handleScheduledNightlyBackup() {
    this.logger.log('⏰ [BackupService] Rejali tungi zaxira olish (03:00) boshlandi...');
    try {
      const backup = await this.createBackup();
      this.logger.log(`✅ [BackupService] Tungi zaxira muvaffaqiyatli yakunlandi: ${backup.filename} (${backup.sizeFormatted})`);
      this.cleanupOldBackups(14); // 14 kundan eskilarini tozalash
    } catch (err: any) {
      this.logger.error(`❌ [BackupService] Tungi zaxira olishda xatolik: ${err.message}`, err.stack);
    }
  }

  // 2. Talab bo'yicha zaxira yaratish (Manual or Scheduled)
  async createBackup(): Promise<BackupFileInfo> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const databaseUrl = process.env.DATABASE_URL;

    // A) Try pg_dump if pg_dump is available in system path
    if (databaseUrl) {
      try {
        const sqlFilename = `boshqar_backup_${timestamp}.sql`;
        const sqlFilePath = path.join(this.backupDir, sqlFilename);
        
        await execAsync(`pg_dump "${databaseUrl}" -f "${sqlFilePath}"`);
        
        if (fs.existsSync(sqlFilePath)) {
          const stats = fs.statSync(sqlFilePath);
          return {
            filename: sqlFilename,
            sizeBytes: stats.size,
            sizeFormatted: this.formatBytes(stats.size),
            createdAt: stats.birthtime.toISOString(),
            type: 'pg_dump',
          };
        }
      } catch (pgDumpError: any) {
        this.logger.warn(`pg_dump ishlamadi, Prisma to'liq ma'lumotlar bazasi snapshotiga o'tilmoqda: ${pgDumpError.message}`);
      }
    }

    // B) Fallback / Universal Snapshot: Structured JSON Data Export
    const snapshotFilename = `boshqar_snapshot_${timestamp}.json`;
    const snapshotFilePath = path.join(this.backupDir, snapshotFilename);

    const [
      businesses,
      users,
      businessUsers,
      branches,
      plans,
      products,
      categories,
      inventory,
      orders,
      shifts,
      customers,
      suppliers,
      billingRequests,
      systemSettings,
    ] = await Promise.all([
      this.prisma.business.findMany(),
      this.prisma.user.findMany({ select: { id: true, phone: true, fullName: true, email: true, isSuperAdmin: true, status: true, createdAt: true } }),
      this.prisma.businessUser.findMany(),
      this.prisma.branch.findMany(),
      this.prisma.plan.findMany(),
      this.prisma.product.findMany(),
      this.prisma.category.findMany(),
      this.prisma.inventory.findMany(),
      this.prisma.order.findMany({ include: { items: true, payments: true } }),
      this.prisma.posShift.findMany(),
      this.prisma.customer.findMany(),
      this.prisma.supplier.findMany(),
      this.prisma.billingRequest.findMany(),
      this.prisma.systemSetting.findMany(),
    ]);

    const backupPayload = {
      meta: {
        app: 'boshqar.uz',
        version: '2.0.0',
        exportedAt: new Date().toISOString(),
        tablesCount: 14,
        recordsSummary: {
          businesses: businesses.length,
          users: users.length,
          products: products.length,
          orders: orders.length,
          customers: customers.length,
        },
      },
      data: {
        plans,
        systemSettings,
        businesses,
        users,
        businessUsers,
        branches,
        categories,
        products,
        inventory,
        customers,
        suppliers,
        shifts,
        orders,
        billingRequests,
      },
    };

    fs.writeFileSync(snapshotFilePath, JSON.stringify(backupPayload, null, 2), 'utf8');
    const stats = fs.statSync(snapshotFilePath);

    return {
      filename: snapshotFilename,
      sizeBytes: stats.size,
      sizeFormatted: this.formatBytes(stats.size),
      createdAt: stats.birthtime.toISOString(),
      type: 'json_snapshot',
    };
  }

  // 3. Barcha mavjud zaxira fayllari ro'yxati
  async listBackups(): Promise<BackupFileInfo[]> {
    if (!fs.existsSync(this.backupDir)) {
      return [];
    }

    const files = fs.readdirSync(this.backupDir);
    const backupFiles: BackupFileInfo[] = [];

    for (const file of files) {
      if (file.startsWith('boshqar_') && (file.endsWith('.sql') || file.endsWith('.json') || file.endsWith('.sql.gz'))) {
        const filePath = path.join(this.backupDir, file);
        try {
          const stats = fs.statSync(filePath);
          backupFiles.push({
            filename: file,
            sizeBytes: stats.size,
            sizeFormatted: this.formatBytes(stats.size),
            createdAt: stats.mtime.toISOString(),
            type: file.endsWith('.json') ? 'json_snapshot' : 'pg_dump',
          });
        } catch {}
      }
    }

    return backupFiles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // 4. Zaxira faylini olish yo'li (Download)
  getBackupFilePath(filename: string): string {
    // Path traversal himoyasi
    const sanitized = path.basename(filename);
    const fullPath = path.join(this.backupDir, sanitized);

    if (!fs.existsSync(fullPath)) {
      throw new NotFoundException('Zaxira fayli topilmadi');
    }

    return fullPath;
  }

  // 5. Zaxira faylini o'chirish
  async deleteBackup(filename: string): Promise<{ success: boolean; message: string }> {
    const filePath = this.getBackupFilePath(filename);
    try {
      fs.unlinkSync(filePath);
      return { success: true, message: 'Zaxira fayli muvaffaqiyatli o\'chirildi' };
    } catch (err: any) {
      throw new BadRequestException(`Faylni o'chirishda xatolik: ${err.message}`);
    }
  }

  // 6. Eski zaxiralarni avtomatik tozalash (Retention)
  private cleanupOldBackups(retentionDays = 14) {
    try {
      const files = fs.readdirSync(this.backupDir);
      const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;

      for (const file of files) {
        if (file.startsWith('boshqar_')) {
          const filePath = path.join(this.backupDir, file);
          const stats = fs.statSync(filePath);
          if (stats.mtimeMs < cutoff) {
            fs.unlinkSync(filePath);
            this.logger.log(`🧹 [BackupService] Eski zaxira tozalandi: ${file}`);
          }
        }
      }
    } catch {}
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
