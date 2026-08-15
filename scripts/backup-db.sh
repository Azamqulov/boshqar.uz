#!/usr/bin/env bash
# -------------------------------------------------------------
# boshqar.uz — Automated PostgreSQL Database Backup Script
# Usage: ./scripts/backup-db.sh [backup_dir]
# -------------------------------------------------------------

set -eo pipefail

BACKUP_DIR="${1:-./backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/boshqar_backup_${TIMESTAMP}.sql.gz"
RETENTION_DAYS=14

mkdir -p "${BACKUP_DIR}"

echo "📦 [boshqar.uz] Database zaxira nusxasini olish boshlandi..."
echo "🕒 Vaqt: $(date)"

if [ -z "${DATABASE_URL}" ]; then
  echo "⚠️  DATABASE_URL topilmadi. Mahalliy Postgres o'zgaruvchilaridan foydalanilmoqda..."
  DB_HOST="${DB_HOST:-localhost}"
  DB_PORT="${DB_PORT:-5432}"
  DB_USER="${DB_USER:-postgres}"
  DB_NAME="${DB_NAME:-boshqar_db}"
  
  PGPASSWORD="${DB_PASSWORD:-postgres123}" pg_dump -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -F c -b -v | gzip > "${BACKUP_FILE}"
else
  pg_dump "${DATABASE_URL}" -F c -b -v | gzip > "${BACKUP_FILE}"
fi

BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
echo "✅ Zaxira nusxasi muvaffaqiyatli saqlandi: ${BACKUP_FILE} (Hajmi: ${BACKUP_SIZE})"

# Eski zaxiralarni tozalash (14 kundan eski)
echo "🧹 ${RETENTION_DAYS} kundan eski zaxira fayllari tozalanmoqda..."
find "${BACKUP_DIR}" -name "boshqar_backup_*.sql.gz" -mtime +${RETENTION_DAYS} -exec rm -f {} \;

echo "🎉 Database Backup jarayoni yakunlandi!"
