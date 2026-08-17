import { Controller, Get, Post, Delete, Param, UseGuards, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BackupService } from './backup.service';
import { SuperAdminGuard } from '../../common/guards/super-admin.guard';
import { Response } from 'express';

@ApiTags('SuperAdmin (Baza Zaxiralari & Backup)')
@ApiBearerAuth()
@UseGuards(SuperAdminGuard)
@Controller('superadmin/backups')
export class BackupController {
  constructor(private backupService: BackupService) {}

  @Get()
  @ApiOperation({ summary: 'Barcha mavjud zaxira (backup) fayllari ro\'yxati' })
  listBackups() {
    return this.backupService.listBackups();
  }

  @Post('create')
  @ApiOperation({ summary: 'Hozir zaxira nusxasi (Instant Backup) yaratish' })
  createBackup() {
    return this.backupService.createBackup();
  }

  @Get('download/:filename')
  @ApiOperation({ summary: 'Zaxira faylini kompyuterga yuklab olish' })
  downloadBackup(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = this.backupService.getBackupFilePath(filename);
    res.download(filePath, filename);
  }

  @Delete(':filename')
  @ApiOperation({ summary: 'Eski zaxira faylini o\'chirish' })
  deleteBackup(@Param('filename') filename: string) {
    return this.backupService.deleteBackup(filename);
  }
}
