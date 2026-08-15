#!/usr/bin/env bash
# -------------------------------------------------------------
# boshqar.uz — Database Disaster Recovery / Restore Script
# Usage: ./scripts/restore-db.sh <backup_file_path.sql.gz>
# -------------------------------------------------------------

set -eo pipefail

BACKUP_FILE="$1"

if [ -z "${BACKUP_FILE}" ] || [ ! -f "${BACKUP_FILE}" ]; then
  echo "❌ Xatolik: Tiklash uchun zaxira fayli ko'rsatilmadi yoki fayl topilmadi!"
  echo "👉 Ishlatish: ./scripts/restore-db.sh ./backups/boshqar_backup_YYYYMMDD_HHMMSS.sql.gz"
  exit 1
fi

echo "🚨 [boshqar.uz] Database tiklash (Restore) jarayoni boshlandi!"
echo "📂 Fayl: ${BACKUP_FILE}"
read -p "⚠️  DIQQAT: Joriy ma'lumotlar ustiga yoziladi. Davom etasizmi? (ha/yoq): " CONFIRM

if [ "${CONFIRM}" != "ha" ]; then
  echo "❌ Bekor qilindi."
  exit 0
fi

if [ -z "${DATABASE_URL}" ]; then
  DB_HOST="${DB_HOST:-localhost}"
  DB_PORT="${DB_PORT:-5432}"
  DB_USER="${DB_USER:-postgres}"
  DB_NAME="${DB_NAME:-boshqar_db}"

  echo "🔄 Ma'lumotlar bazasi tozalanib tiklanmoqda..."
  gunzip -c "${BACKUP_FILE}" | PGPASSWORD="${DB_PASSWORD:-postgres123}" pg_restore -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" --clean --if-exists -v
else
  gunzip -c "${BACKUP_FILE}" | pg_restore "${DATABASE_URL}" --clean --if-exists -v
fi

echo "✅ [boshqar.uz] Ma'lumotlar bazasi muvaffaqiyatli tiklandi!"
