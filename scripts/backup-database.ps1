# ==============================================================================
# BOSHQAR.UZ — Automated PostgreSQL Database Backup Script for Windows
# ==============================================================================

param (
    [string]$BackupDir = "C:\Backups\boshqar-db",
    [string]$DatabaseUrl = $env:DATABASE_URL,
    [int]$RetentionDays = 7
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupFile = Join-Path -Path $BackupDir -ChildPath "boshqar_backup_$Timestamp.sql"

Write-Host "📦 [Boshqar.uz] Starting database backup..." -ForegroundColor Cyan

if ($DatabaseUrl) {
    pg_dump "$DatabaseUrl" -f "$BackupFile"
} else {
    pg_dump -U postgres -d ubms_db -f "$BackupFile"
}

Write-Host "✅ [Boshqar.uz] Backup created: $BackupFile" -ForegroundColor Green

# Cleanup old backups
Write-Host "🧹 [Boshqar.uz] Cleaning up backups older than $RetentionDays days..." -ForegroundColor Yellow
$CutoffDate = (Get-Date).AddDays(-$RetentionDays)
Get-ChildItem -Path $BackupDir -Filter "boshqar_backup_*.sql" | Where-Object { $_.LastWriteTime -lt $CutoffDate } | Remove-Item -Force

Write-Host "🎉 [Boshqar.uz] Backup process completed successfully." -ForegroundColor Green
