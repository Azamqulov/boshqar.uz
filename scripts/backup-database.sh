#!/usr/bin/env bash
# ==============================================================================
# BOSHQAR.UZ — Automated PostgreSQL Database Backup Script
# Creates timestamped compressed SQL dumps and retains last 7 days of backups
# ==============================================================================

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/var/backups/boshqar-db}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/boshqar_backup_${TIMESTAMP}.sql.gz"
RETENTION_DAYS=7

mkdir -p "${BACKUP_DIR}"

echo "📦 [Boshqar.uz] Starting PostgreSQL database backup..."

if [ -n "${DATABASE_URL:-}" ]; then
  pg_dump "${DATABASE_URL}" | gzip > "${BACKUP_FILE}"
else
  PGHOST="${PGHOST:-localhost}"
  PGPORT="${PGPORT:-5432}"
  PGUSER="${PGUSER:-postgres}"
  PGDATABASE="${PGDATABASE:-ubms_db}"

  pg_dump -h "${PGHOST}" -p "${PGPORT}" -U "${PGUSER}" "${PGDATABASE}" | gzip > "${BACKUP_FILE}"
fi

BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
echo "✅ [Boshqar.uz] Backup created successfully: ${BACKUP_FILE} (${BACKUP_SIZE})"

# Remove backups older than 7 days
echo "🧹 [Boshqar.uz] Cleaning up backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -type f -name "boshqar_backup_*.sql.gz" -mtime +${RETENTION_DAYS} -delete

echo "🎉 [Boshqar.uz] Backup process completed."
