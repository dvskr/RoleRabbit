#!/bin/bash
# ============================================================================
# Database Restore Script
# Section 3.13: Backup & Recovery (DB-073)
# ============================================================================
# Description: Restore database from backup
# Usage: ./scripts/restore-database.sh <backup_file>
# Example: ./scripts/restore-database.sh ./backups/database/backup_20250115_020000.sql.gz
# ============================================================================

set -e  # Exit on error
set -u  # Exit on undefined variable
set -o pipefail  # Exit on pipe failure

# ============================================================================
# Configuration
# ============================================================================

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Check if backup file is provided
if [ $# -eq 0 ]; then
  echo "Usage: $0 <backup_file>"
  echo "Example: $0 ./backups/database/backup_20250115_020000.sql.gz"
  exit 1
fi

BACKUP_FILE="$1"

# Database connection
DB_HOST="${DB_HOST:-db.supabase.co}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-postgres}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD}"

# ============================================================================
# Functions
# ============================================================================

log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

error() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1" >&2
}

# ============================================================================
# Pre-restore checks
# ============================================================================

log "Starting database restore..."

# Check if pg_restore is installed
if ! command -v pg_restore &> /dev/null; then
  error "pg_restore is not installed. Please install PostgreSQL client tools."
  exit 1
fi

# Check if backup file exists
if [ ! -f "${BACKUP_FILE}" ]; then
  error "Backup file not found: ${BACKUP_FILE}"
  exit 1
fi

# Check database credentials
if [ -z "${DB_PASSWORD}" ]; then
  error "DB_PASSWORD is not set"
  exit 1
fi

log "Backup file: ${BACKUP_FILE}"
log "Target database: ${DB_NAME}@${DB_HOST}"

# Check if metadata file exists
META_FILE="${BACKUP_FILE}.meta"
if [ -f "${META_FILE}" ]; then
  log "Backup metadata:"
  cat "${META_FILE}"

  # Verify checksum
  STORED_CHECKSUM=$(jq -r '.checksum' "${META_FILE}" 2>/dev/null || echo "")
  if [ -n "${STORED_CHECKSUM}" ]; then
    ACTUAL_CHECKSUM=$(sha256sum "${BACKUP_FILE}" | cut -d' ' -f1)
    if [ "${STORED_CHECKSUM}" = "${ACTUAL_CHECKSUM}" ]; then
      log "✓ Checksum verified"
    else
      error "Checksum mismatch! Backup file may be corrupted."
      exit 1
    fi
  fi
fi

# ============================================================================
# Confirmation prompt
# ============================================================================

echo ""
echo "WARNING: This will restore the database from backup."
echo "All current data will be replaced with the backup data."
echo ""
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "${CONFIRM}" != "yes" ]; then
  log "Restore cancelled by user"
  exit 0
fi

# ============================================================================
# Create pre-restore backup
# ============================================================================

log "Creating pre-restore backup of current database..."

PRE_RESTORE_BACKUP="./backups/pre-restore_$(date +"%Y%m%d_%H%M%S").sql.gz"
mkdir -p ./backups

export PGPASSWORD="${DB_PASSWORD}"

pg_dump \
  -h "${DB_HOST}" \
  -p "${DB_PORT}" \
  -U "${DB_USER}" \
  -d "${DB_NAME}" \
  --format=custom \
  --file="${PRE_RESTORE_BACKUP}.tmp"

if [ $? -eq 0 ]; then
  gzip "${PRE_RESTORE_BACKUP}.tmp"
  mv "${PRE_RESTORE_BACKUP}.tmp.gz" "${PRE_RESTORE_BACKUP}"
  log "✓ Pre-restore backup saved: ${PRE_RESTORE_BACKUP}"
else
  error "Failed to create pre-restore backup"
  exit 1
fi

# ============================================================================
# Decompress backup if needed
# ============================================================================

RESTORE_FILE="${BACKUP_FILE}"

if [[ "${BACKUP_FILE}" == *.gz ]]; then
  log "Decompressing backup..."
  RESTORE_FILE="${BACKUP_FILE%.gz}"
  gunzip -c "${BACKUP_FILE}" > "${RESTORE_FILE}"
fi

# ============================================================================
# Perform restore
# ============================================================================

log "Restoring database from backup..."

# Drop existing connections (optional, requires superuser)
# psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d postgres -c \
#   "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${DB_NAME}' AND pid <> pg_backend_pid();"

# Perform restore
pg_restore \
  -h "${DB_HOST}" \
  -p "${DB_PORT}" \
  -U "${DB_USER}" \
  -d "${DB_NAME}" \
  --verbose \
  --clean \
  --if-exists \
  --no-owner \
  --no-acl \
  "${RESTORE_FILE}" \
  2>&1 | tee "./backups/restore_$(date +"%Y%m%d_%H%M%S").log"

RESTORE_EXIT_CODE=$?

# Cleanup decompressed file if we created it
if [[ "${BACKUP_FILE}" == *.gz ]]; then
  rm -f "${RESTORE_FILE}"
fi

# ============================================================================
# Post-restore checks
# ============================================================================

if [ ${RESTORE_EXIT_CODE} -eq 0 ]; then
  log "✓ Database restored successfully"

  # Verify restoration
  log "Verifying restoration..."

  TABLE_COUNT=$(psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -t -c \
    "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d '[:space:]')

  log "Tables restored: ${TABLE_COUNT}"

  if [ "${TABLE_COUNT}" -gt 0 ]; then
    log "✓ Restoration verified"
  else
    error "No tables found after restoration. Restore may have failed."
    exit 1
  fi

  # Refresh materialized views
  log "Refreshing materialized views..."
  psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -c \
    "SELECT refresh_analytics_views();" 2>/dev/null || log "⚠ Could not refresh materialized views (function may not exist)"

  log "Restore completed successfully!"
  log "Pre-restore backup saved at: ${PRE_RESTORE_BACKUP}"
else
  error "Database restore failed"
  log "Pre-restore backup is available at: ${PRE_RESTORE_BACKUP}"
  log "You can restore the previous state using this backup."
  exit 1
fi

# ============================================================================
# Cleanup
# ============================================================================

unset PGPASSWORD

exit 0
