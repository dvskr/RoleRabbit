#!/bin/bash
# ============================================================================
# Database Backup Script
# Section 3.13: Backup & Recovery (DB-071 to DB-075)
# ============================================================================
# Description: Automated daily database backup with 30-day retention
# Usage: ./scripts/backup-database.sh
# Schedule: Run daily via cron: 0 2 * * * /path/to/backup-database.sh
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

# Backup configuration
BACKUP_DIR="${BACKUP_DIR:-./backups/database}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="backup_${TIMESTAMP}.sql.gz"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILE}"

# Database connection (Supabase or PostgreSQL)
DB_HOST="${DB_HOST:-db.supabase.co}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-postgres}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD}"

# S3/Cloud storage for offsite backups (optional)
S3_BUCKET="${BACKUP_S3_BUCKET:-}"
ENABLE_S3_UPLOAD="${ENABLE_S3_UPLOAD:-false}"

# Notification settings
ENABLE_NOTIFICATIONS="${ENABLE_BACKUP_NOTIFICATIONS:-false}"
NOTIFICATION_WEBHOOK="${BACKUP_NOTIFICATION_WEBHOOK:-}"

# ============================================================================
# Functions
# ============================================================================

log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

error() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1" >&2
}

send_notification() {
  local status=$1
  local message=$2

  if [ "${ENABLE_NOTIFICATIONS}" = "true" ] && [ -n "${NOTIFICATION_WEBHOOK}" ]; then
    curl -X POST "${NOTIFICATION_WEBHOOK}" \
      -H "Content-Type: application/json" \
      -d "{\"status\": \"${status}\", \"message\": \"${message}\", \"timestamp\": \"$(date -Iseconds)\"}" \
      2>/dev/null || true
  fi
}

# ============================================================================
# Pre-backup checks
# ============================================================================

log "Starting database backup..."

# Check if pg_dump is installed
if ! command -v pg_dump &> /dev/null; then
  error "pg_dump is not installed. Please install PostgreSQL client tools."
  send_notification "error" "pg_dump not found"
  exit 1
fi

# Check database credentials
if [ -z "${DB_PASSWORD}" ]; then
  error "DB_PASSWORD is not set"
  send_notification "error" "DB_PASSWORD not configured"
  exit 1
fi

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

log "Backup directory: ${BACKUP_DIR}"
log "Backup file: ${BACKUP_FILE}"

# ============================================================================
# Perform backup
# ============================================================================

log "Creating database dump..."

# Set password for pg_dump
export PGPASSWORD="${DB_PASSWORD}"

# Perform backup with pg_dump
# Options:
#   -h: host
#   -p: port
#   -U: user
#   -d: database
#   -F c: custom format (recommended for pg_restore)
#   --verbose: show progress
#   --no-owner: don't output commands to set ownership
#   --no-acl: don't output commands to set access privileges

pg_dump \
  -h "${DB_HOST}" \
  -p "${DB_PORT}" \
  -U "${DB_USER}" \
  -d "${DB_NAME}" \
  --format=custom \
  --verbose \
  --no-owner \
  --no-acl \
  --file="${BACKUP_PATH}.tmp" \
  2>&1 | tee "${BACKUP_DIR}/backup_${TIMESTAMP}.log"

# Check if backup was successful
if [ $? -eq 0 ]; then
  log "Database dump completed successfully"

  # Compress the backup
  log "Compressing backup..."
  gzip "${BACKUP_PATH}.tmp"
  mv "${BACKUP_PATH}.tmp.gz" "${BACKUP_PATH}"

  # Get backup size
  BACKUP_SIZE=$(du -h "${BACKUP_PATH}" | cut -f1)
  log "Backup size: ${BACKUP_SIZE}"

  # Calculate checksum
  CHECKSUM=$(sha256sum "${BACKUP_PATH}" | cut -d' ' -f1)
  log "Backup checksum (SHA256): ${CHECKSUM}"

  # Save metadata
  cat > "${BACKUP_PATH}.meta" <<EOF
{
  "timestamp": "${TIMESTAMP}",
  "file": "${BACKUP_FILE}",
  "size": "${BACKUP_SIZE}",
  "checksum": "${CHECKSUM}",
  "database": "${DB_NAME}",
  "host": "${DB_HOST}",
  "created_at": "$(date -Iseconds)"
}
EOF

  send_notification "success" "Database backup completed: ${BACKUP_FILE} (${BACKUP_SIZE})"
else
  error "Database dump failed"
  send_notification "error" "Database backup failed"
  rm -f "${BACKUP_PATH}.tmp"
  exit 1
fi

# ============================================================================
# Upload to S3 (optional)
# ============================================================================

if [ "${ENABLE_S3_UPLOAD}" = "true" ] && [ -n "${S3_BUCKET}" ]; then
  log "Uploading backup to S3..."

  if command -v aws &> /dev/null; then
    aws s3 cp "${BACKUP_PATH}" "s3://${S3_BUCKET}/database/${BACKUP_FILE}" \
      --storage-class GLACIER_IR \
      2>&1 | tee -a "${BACKUP_DIR}/backup_${TIMESTAMP}.log"

    if [ $? -eq 0 ]; then
      log "Backup uploaded to S3 successfully"
      aws s3 cp "${BACKUP_PATH}.meta" "s3://${S3_BUCKET}/database/${BACKUP_FILE}.meta"
    else
      error "Failed to upload backup to S3"
      send_notification "warning" "Backup created but S3 upload failed"
    fi
  else
    error "AWS CLI is not installed. Skipping S3 upload."
  fi
fi

# ============================================================================
# Cleanup old backups (retention policy)
# ============================================================================

log "Cleaning up old backups (retention: ${RETENTION_DAYS} days)..."

# Find and delete backups older than retention period
find "${BACKUP_DIR}" -name "backup_*.sql.gz" -type f -mtime +${RETENTION_DAYS} -exec rm -f {} \;
find "${BACKUP_DIR}" -name "backup_*.sql.gz.meta" -type f -mtime +${RETENTION_DAYS} -exec rm -f {} \;
find "${BACKUP_DIR}" -name "backup_*.log" -type f -mtime +${RETENTION_DAYS} -exec rm -f {} \;

# Count remaining backups
BACKUP_COUNT=$(find "${BACKUP_DIR}" -name "backup_*.sql.gz" -type f | wc -l)
log "Total backups: ${BACKUP_COUNT}"

# ============================================================================
# Cleanup
# ============================================================================

unset PGPASSWORD

log "Backup completed successfully!"
log "Backup location: ${BACKUP_PATH}"

# List recent backups
log "Recent backups:"
ls -lh "${BACKUP_DIR}"/backup_*.sql.gz | tail -n 5

exit 0
