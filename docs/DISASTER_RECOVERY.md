# Disaster Recovery Runbook

**Database Disaster Recovery Procedures for RoleRabbit**

Section 3.13: Backup & Recovery (DB-074)

---

## Table of Contents

1. [Overview](#overview)
2. [Backup Strategy](#backup-strategy)
3. [Recovery Scenarios](#recovery-scenarios)
4. [Step-by-Step Recovery Procedures](#step-by-step-recovery-procedures)
5. [Verification & Testing](#verification--testing)
6. [Contacts & Escalation](#contacts--escalation)

---

## Overview

### Purpose

This runbook provides step-by-step instructions for recovering the RoleRabbit database in the event of data loss, corruption, or disaster.

### RPO & RTO Targets

- **Recovery Point Objective (RPO)**: 24 hours
  - Maximum acceptable data loss: data from the last 24 hours
  - Daily backups at 2:00 AM UTC

- **Recovery Time Objective (RTO)**: 4 hours
  - Target time to restore service: within 4 hours of incident detection

### Backup Schedule

- **Daily Full Backups**: 2:00 AM UTC
- **Retention**: 30 days
- **Storage Locations**:
  - Primary: Local filesystem (`./backups/database/`)
  - Secondary: S3 Glacier (if configured)

---

## Backup Strategy

### Automated Backups

Backups are automated via cron:

```bash
# /etc/crontab or crontab -e
0 2 * * * /path/to/RoleRabbit/scripts/backup-database.sh >> /var/log/rolerabbit/backup.log 2>&1
```

### Backup Types

1. **Daily Automated Backups**
   - Full database dump
   - Compressed with gzip
   - Stored with metadata and checksum

2. **Pre-Migration Backups**
   - Created before running database migrations
   - Manual trigger: `./scripts/backup-database.sh`

3. **Pre-Restore Backups**
   - Created automatically before restoring from backup
   - Safety net for recovery operations

### Backup Verification

**Monthly Testing** (First Monday of each month):
1. Download latest backup
2. Verify checksum
3. Restore to test environment
4. Run smoke tests
5. Document results

---

## Recovery Scenarios

### Scenario 1: Accidental Data Deletion

**Symptoms:**
- User reports missing data
- Records deleted from specific tables
- Application still functioning

**Recovery Approach:**
- Point-in-time recovery using WAL archives (if available)
- Restore specific tables from latest backup

### Scenario 2: Database Corruption

**Symptoms:**
- Database errors in logs
- Index corruption
- Inconsistent query results

**Recovery Approach:**
- Restore from most recent verified backup
- Verify data integrity post-restore

### Scenario 3: Complete Database Loss

**Symptoms:**
- Database server unreachable
- Data center failure
- Catastrophic hardware failure

**Recovery Approach:**
- Provision new database instance
- Restore from latest backup
- Update application connection strings
- Restore point-in-time (if WAL available)

### Scenario 4: Ransomware/Security Incident

**Symptoms:**
- Encrypted database files
- Unauthorized data modifications
- Suspicious admin activity

**Recovery Approach:**
- Isolate affected systems
- Restore from clean backup (pre-incident)
- Security audit before reconnecting

---

## Step-by-Step Recovery Procedures

### Procedure 1: Full Database Restore

**Time Estimate**: 30-60 minutes

**Prerequisites:**
- Access to backup files
- Database credentials (`DB_HOST`, `DB_USER`, `DB_PASSWORD`)
- PostgreSQL client tools installed

**Steps:**

1. **Identify Recovery Point**

   ```bash
   # List available backups
   ls -lh ./backups/database/backup_*.sql.gz

   # Check backup metadata
   cat ./backups/database/backup_20250115_020000.sql.gz.meta
   ```

2. **Verify Backup Integrity**

   ```bash
   # Extract checksum from metadata
   STORED_CHECKSUM=$(jq -r '.checksum' backup.sql.gz.meta)

   # Calculate actual checksum
   ACTUAL_CHECKSUM=$(sha256sum backup.sql.gz | cut -d' ' -f1)

   # Compare
   if [ "$STORED_CHECKSUM" = "$ACTUAL_CHECKSUM" ]; then
     echo "✓ Backup verified"
   else
     echo "✗ Backup corrupted - try another backup"
   fi
   ```

3. **Notify Team**

   ```
   Subject: DATABASE RESTORE IN PROGRESS

   Team,

   Database restore has been initiated from backup.
   - Backup: backup_20250115_020000.sql.gz
   - Recovery Point: 2025-01-15 02:00:00 UTC
   - Estimated completion: [TIME]
   - Impact: [DESCRIBE]

   Status updates will be provided every 15 minutes.
   ```

4. **Enable Maintenance Mode** (Optional)

   ```bash
   # Set maintenance mode in application
   # This prevents new data writes during restore
   ```

5. **Run Restore Script**

   ```bash
   # Make script executable
   chmod +x ./scripts/restore-database.sh

   # Execute restore
   ./scripts/restore-database.sh ./backups/database/backup_20250115_020000.sql.gz

   # Script will:
   # - Verify backup
   # - Create pre-restore backup
   # - Prompt for confirmation
   # - Restore database
   # - Verify restoration
   ```

6. **Post-Restore Verification**

   ```bash
   # Connect to database
   psql -h $DB_HOST -U $DB_USER -d $DB_NAME

   # Verify table counts
   SELECT
     schemaname,
     tablename,
     pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
   FROM pg_stat_user_tables
   WHERE schemaname = 'public'
   ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

   # Verify recent data
   SELECT COUNT(*), MAX(created_at), MAX(updated_at)
   FROM portfolios;

   # Check for errors
   SELECT * FROM pg_stat_database WHERE datname = 'postgres';
   ```

7. **Refresh Materialized Views**

   ```sql
   SELECT refresh_analytics_views();
   ```

8. **Test Application Functionality**

   - Login to application
   - View portfolios
   - Create test portfolio
   - Update existing data
   - Verify analytics display

9. **Disable Maintenance Mode**

   ```bash
   # Remove maintenance mode
   ```

10. **Document Recovery**

    ```
    RECOVERY LOG

    Date: [DATE]
    Incident: [DESCRIPTION]
    Recovery Point: [TIMESTAMP]
    Data Loss: [HOURS/MINUTES]
    Downtime: [DURATION]
    Issues Encountered: [NOTES]
    Resolved By: [NAME]
    ```

### Procedure 2: Point-in-Time Recovery (PITR)

**Time Estimate**: 60-90 minutes

**Prerequisites:**
- WAL (Write-Ahead Log) archiving enabled
- WAL archives available
- Target recovery point known

**Steps:**

1. **Identify Recovery Target**

   ```bash
   # Find WAL files
   ls -lh ./backups/wal/

   # Determine recovery point
   # Example: 2025-01-15 14:30:00
   ```

2. **Restore Base Backup**

   ```bash
   # Restore latest backup before target time
   ./scripts/restore-database.sh ./backups/database/backup_20250115_020000.sql.gz
   ```

3. **Configure Recovery**

   Create `recovery.conf` (PostgreSQL < 12) or add to `postgresql.conf`:

   ```ini
   # recovery.conf (PostgreSQL < 12)
   restore_command = 'cp ./backups/wal/%f %p'
   recovery_target_time = '2025-01-15 14:30:00'
   recovery_target_action = 'promote'
   ```

   Or for PostgreSQL 12+:

   ```bash
   # Create recovery signal file
   touch $PGDATA/recovery.signal

   # Add to postgresql.conf
   echo "restore_command = 'cp ./backups/wal/%f %p'" >> $PGDATA/postgresql.conf
   echo "recovery_target_time = '2025-01-15 14:30:00'" >> $PGDATA/postgresql.conf
   ```

4. **Start PostgreSQL**

   ```bash
   pg_ctl start

   # Monitor recovery
   tail -f $PGDATA/log/postgresql-*.log
   ```

5. **Verify Recovery Point**

   ```sql
   SELECT pg_last_wal_replay_lsn();
   SELECT pg_wal_lsn_diff(pg_current_wal_lsn(), pg_last_wal_replay_lsn());
   ```

### Procedure 3: Partial Data Recovery

**Time Estimate**: 15-30 minutes

**Use Case**: Restore specific tables or data

**Steps:**

1. **Restore to Temporary Database**

   ```bash
   # Create temporary database
   createdb -h $DB_HOST -U $DB_USER temp_restore

   # Restore backup to temp database
   pg_restore \
     -h $DB_HOST \
     -U $DB_USER \
     -d temp_restore \
     --clean \
     ./backups/database/backup_20250115_020000.sql.gz
   ```

2. **Export Specific Data**

   ```bash
   # Export specific table
   pg_dump \
     -h $DB_HOST \
     -U $DB_USER \
     -d temp_restore \
     -t portfolios \
     -t portfolio_versions \
     --data-only \
     > restore_portfolios.sql
   ```

3. **Import to Production**

   ```bash
   # Import specific data
   psql -h $DB_HOST -U $DB_USER -d $DB_NAME < restore_portfolios.sql
   ```

4. **Cleanup**

   ```bash
   dropdb -h $DB_HOST -U $DB_USER temp_restore
   ```

---

## Verification & Testing

### Monthly Testing Checklist

**Date**: ____________
**Tester**: ____________

- [ ] Latest backup exists
- [ ] Backup size is reasonable
- [ ] Checksum verified
- [ ] Restore to test environment succeeded
- [ ] Application connects to restored database
- [ ] Sample queries return correct data
- [ ] No errors in logs
- [ ] Performance is acceptable
- [ ] Documented results

### Test Environment Setup

```bash
# 1. Provision test database
createdb -h test-db.example.com -U postgres rolerabbit_test

# 2. Restore latest backup
./scripts/restore-database.sh \
  --host test-db.example.com \
  --database rolerabbit_test \
  ./backups/database/backup_latest.sql.gz

# 3. Run smoke tests
npm run test:smoke -- --db test-db.example.com
```

---

## Contacts & Escalation

### Incident Response Team

| Role | Name | Contact | Availability |
|------|------|---------|--------------|
| Primary DBA | [NAME] | [EMAIL/PHONE] | 24/7 |
| Backup DBA | [NAME] | [EMAIL/PHONE] | Business hours |
| DevOps Lead | [NAME] | [EMAIL/PHONE] | 24/7 |
| CTO | [NAME] | [EMAIL/PHONE] | Emergency only |

### Escalation Path

1. **Level 1**: DevOps engineer attempts recovery (0-30 min)
2. **Level 2**: Primary DBA engaged (30-60 min)
3. **Level 3**: Backup DBA + DevOps Lead (1-2 hours)
4. **Level 4**: CTO notification + External support (2+ hours)

### Communication Channels

- **Incident Channel**: `#incident-response`
- **Status Updates**: `#status-updates`
- **Customer Communication**: [PROCEDURE]

---

## Appendix

### Quick Reference Commands

```bash
# List backups
ls -lh ./backups/database/

# Verify backup
sha256sum backup.sql.gz

# Restore database
./scripts/restore-database.sh backup.sql.gz

# Check database size
psql -c "SELECT pg_size_pretty(pg_database_size('postgres'));"

# Check table sizes
psql -c "SELECT * FROM get_table_sizes();"

# Check active connections
psql -c "SELECT * FROM pg_stat_activity;"
```

### Common Issues

**Issue**: Restore fails with "role does not exist"
**Solution**: Use `--no-owner` flag or create missing roles

**Issue**: Restore is very slow
**Solution**: Disable indexes, restore data, rebuild indexes

**Issue**: Out of disk space during restore
**Solution**: Increase disk space or restore to external storage

---

**Last Updated**: 2025-01-15
**Next Review Date**: 2025-02-15
**Version**: 1.0
