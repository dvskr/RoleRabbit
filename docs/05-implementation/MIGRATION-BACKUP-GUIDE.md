# Database Backup Guide - Pre-Migration

**Date:** November 11, 2025  
**Purpose:** Backup database before running embedding migration  
**Status:** ✅ Guidance Document

---

## 🛡️ **BACKUP STRATEGY**

Since we're adding new data (embeddings) rather than modifying existing data, **the risk is minimal**. However, it's always good practice to have a backup.

---

## 📋 **WHAT WILL BE CHANGED**

### **Tables Affected:**
- `base_resumes` - Adding embedding vectors (new column, existing data unchanged)
- `job_embeddings` - New cache entries (separate table, no impact on existing data)

### **Risk Level:** 🟢 **LOW**
- No existing data will be modified
- No data will be deleted
- Only new columns being populated
- All operations are INSERT, not UPDATE

---

## 💾 **BACKUP OPTIONS**

### **Option 1: PostgreSQL Dump (Recommended for Production)**

```bash
# Full database backup
pg_dump -h localhost -U postgres -d roleready > backup_before_migration_$(date +%Y%m%d_%H%M%S).sql

# Or with compression
pg_dump -h localhost -U postgres -d roleready | gzip > backup_before_migration_$(date +%Y%m%d_%H%M%S).sql.gz
```

### **Option 2: Docker Volume Backup (If using Docker)**

```bash
# Stop containers
docker-compose down

# Backup volume
docker run --rm -v roleready_postgres_data:/data -v $(pwd):/backup ubuntu tar czf /backup/postgres_backup_$(date +%Y%m%d_%H%M%S).tar.gz /data

# Start containers
docker-compose up -d
```

### **Option 3: Cloud Provider Snapshot (If on AWS/Azure/GCP)**

```bash
# AWS RDS
aws rds create-db-snapshot \
  --db-instance-identifier roleready-db \
  --db-snapshot-identifier roleready-pre-migration-$(date +%Y%m%d)

# Azure
az postgres server restore \
  --resource-group roleready \
  --name roleready-db \
  --restore-point-in-time $(date -u +%Y-%m-%dT%H:%M:%SZ) \
  --source-server roleready-db

# GCP
gcloud sql backups create \
  --instance=roleready-db \
  --description="Pre-migration backup"
```

### **Option 4: Development/Staging - No Backup Needed**

For development or staging environments, you can proceed without backup since:
- Data is not production-critical
- Can be regenerated if needed
- Migration is additive only (no deletions)

---

## ✅ **BACKUP VERIFICATION**

### **After Creating Backup:**

```bash
# Verify backup file size (should be > 0)
ls -lh backup_before_migration_*.sql

# Test restoration (optional - on test database)
createdb roleready_test
psql -d roleready_test < backup_before_migration_*.sql
```

---

## 🔄 **ROLLBACK PLAN**

### **If Migration Fails:**

1. **The embeddings won't be generated** - that's it!
2. **Existing data remains unchanged**
3. **No rollback needed** - just fix the issue and re-run

### **If You Want to Remove Embeddings:**

```sql
-- Clear all embeddings (if needed)
UPDATE base_resumes SET embedding = NULL, embedding_updated_at = NULL;
TRUNCATE TABLE job_embeddings;

-- Or just the embeddings column data
UPDATE base_resumes SET embedding = NULL WHERE embedding IS NOT NULL;
```

---

## 📊 **PRE-MIGRATION CHECKLIST**

- [ ] **Database is accessible** - Can connect via psql/GUI
- [ ] **Backup created** (if production) - File exists and is >0 bytes
- [ ] **OpenAI API key set** - `OPENAI_API_KEY` in `.env`
- [ ] **Sufficient API credits** - Check OpenAI dashboard
- [ ] **Disk space available** - Check with `df -h` (need ~1GB per 1000 resumes)
- [ ] **Migration script tested** - Dry-run completed successfully

---

## 🚀 **READY TO MIGRATE**

Once you've completed your backup (or determined you don't need one for your environment), proceed with:

```bash
# 1. Dry run first (safe - no changes)
node scripts/migrate-embeddings.js --dry-run

# 2. Execute migration
node scripts/migrate-embeddings.js
```

---

## 📞 **SUPPORT**

If anything goes wrong:
1. Check logs in `apps/api/logs/`
2. Review error messages in terminal
3. Verify OpenAI API key and credits
4. Check database connectivity

---

**Status:** ✅ Backup guidance complete  
**Next Step:** Run dry-run migration  
**Risk Level:** 🟢 LOW (additive operations only)

