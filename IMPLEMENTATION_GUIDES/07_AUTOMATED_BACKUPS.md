# Automated Backups Setup Guide

## Overview
Set up automated daily backups for Supabase storage and PostgreSQL database to ensure data recovery capability.

## 1. Supabase Storage Backups

### Option A: Supabase Native Backups
Supabase provides automatic backups on paid plans:

```
1. Go to Supabase Dashboard
2. Navigate to Settings → Backups
3. Enable automatic backups
4. Configure retention (7 days minimum recommended)
5. Set backup schedule (daily at low-traffic hours)
```

**Features:**
- ✅ Point-in-time recovery
- ✅ Automatic snapshots
- ✅ One-click restore
- ⚠️  Requires Pro plan ($25/month)

### Option B: Manual Backup Script
For custom backup solution, create `scripts/backup-storage.js`:

```javascript
const { createClient } = require('@supabase/supabase-js');
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

async function backupStorage() {
  console.log('🔄 Starting storage backup...');

  const bucket = process.env.SUPABASE_STORAGE_BUCKET;
  const timestamp = new Date().toISOString().split('T')[0];
  const backupName = `storage-backup-${timestamp}`;

  try {
    // 1. List all files in Supabase bucket
    const { data: files, error } = await supabase.storage
      .from(bucket)
      .list('', {
        limit: 10000,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) throw error;

    console.log(`Found ${files.length} files to backup`);

    // 2. Download and upload each file to S3
    for (const file of files) {
      const { data: fileData } = await supabase.storage
        .from(bucket)
        .download(file.name);

      if (fileData) {
        await s3.upload({
          Bucket: process.env.BACKUP_S3_BUCKET,
          Key: `${backupName}/${file.name}`,
          Body: fileData,
          ServerSideEncryption: 'AES256'
        }).promise();

        console.log(`✅ Backed up: ${file.name}`);
      }
    }

    // 3. Create manifest file
    const manifest = {
      backupDate: new Date().toISOString(),
      filesCount: files.length,
      files: files.map(f => ({ name: f.name, size: f.metadata?.size }))
    };

    await s3.upload({
      Bucket: process.env.BACKUP_S3_BUCKET,
      Key: `${backupName}/manifest.json`,
      Body: JSON.stringify(manifest, null, 2),
      ContentType: 'application/json'
    }).promise();

    console.log('✅ Storage backup completed');
    return { success: true, filesCount: files.length };
  } catch (error) {
    console.error('❌ Backup failed:', error);
    throw error;
  }
}

// Run backup
if (require.main === module) {
  backupStorage()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { backupStorage };
```

### Schedule with Cron (Linux/Mac)
```bash
# Add to crontab
crontab -e

# Run daily at 2 AM
0 2 * * * cd /path/to/project && node scripts/backup-storage.js >> /var/log/backup.log 2>&1
```

### Schedule with GitHub Actions
Create `.github/workflows/backup.yml`:

```yaml
name: Daily Backup

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
  workflow_dispatch:  # Manual trigger

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Run backup
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          BACKUP_S3_BUCKET: ${{ secrets.BACKUP_S3_BUCKET }}
        run: node scripts/backup-storage.js

      - name: Notify on failure
        if: failure()
        run: |
          curl -X POST ${{ secrets.SLACK_WEBHOOK_URL }} \
            -H 'Content-Type: application/json' \
            -d '{"text": "❌ Storage backup failed!"}'
```

## 2. PostgreSQL Database Backups

### Option A: Supabase Database Backups
```
1. Supabase Dashboard → Settings → Database
2. Enable automatic backups
3. Configure retention period
4. Test restore process quarterly
```

### Option B: Manual pg_dump
Create `scripts/backup-database.js`:

```javascript
const { exec } = require('child_process');
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

async function backupDatabase() {
  console.log('🔄 Starting database backup...');

  const timestamp = new Date().toISOString().split('T')[0];
  const backupFile = `/tmp/db-backup-${timestamp}.sql`;
  const dbUrl = process.env.DATABASE_URL;

  try {
    // 1. Create database dump
    await new Promise((resolve, reject) => {
      exec(
        `pg_dump ${dbUrl} -F p -f ${backupFile}`,
        (error, stdout, stderr) => {
          if (error) reject(error);
          else resolve();
        }
      );
    });

    console.log('✅ Database dump created');

    // 2. Compress the dump
    await new Promise((resolve, reject) => {
      exec(`gzip ${backupFile}`, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });

    const gzipFile = `${backupFile}.gz`;
    console.log('✅ Backup compressed');

    // 3. Upload to S3
    const fileStream = fs.createReadStream(gzipFile);
    await s3.upload({
      Bucket: process.env.BACKUP_S3_BUCKET,
      Key: `database-backups/db-backup-${timestamp}.sql.gz`,
      Body: fileStream,
      ServerSideEncryption: 'AES256'
    }).promise();

    console.log('✅ Backup uploaded to S3');

    // 4. Clean up local file
    fs.unlinkSync(gzipFile);

    // 5. Rotate old backups (keep last 30 days)
    await rotateOldBackups();

    console.log('✅ Database backup completed');
    return { success: true };
  } catch (error) {
    console.error('❌ Database backup failed:', error);
    throw error;
  }
}

async function rotateOldBackups() {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 30);

  const { Contents } = await s3.listObjectsV2({
    Bucket: process.env.BACKUP_S3_BUCKET,
    Prefix: 'database-backups/'
  }).promise();

  for (const object of Contents) {
    if (object.LastModified < cutoffDate) {
      await s3.deleteObject({
        Bucket: process.env.BACKUP_S3_BUCKET,
        Key: object.Key
      }).promise();

      console.log(`🗑️  Deleted old backup: ${object.Key}`);
    }
  }
}

if (require.main === module) {
  backupDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { backupDatabase };
```

## 3. Backup Verification

### Test Restore Process
Create `scripts/test-restore.js`:

```javascript
async function testRestore() {
  console.log('🧪 Testing restore process...');

  // 1. Download latest backup
  // 2. Restore to test database
  // 3. Verify data integrity
  // 4. Clean up

  console.log('✅ Restore test completed successfully');
}
```

### Schedule Quarterly Tests
```yaml
# .github/workflows/test-restore.yml
name: Quarterly Restore Test

on:
  schedule:
    - cron: '0 3 1 */3 *'  # First day of every quarter at 3 AM
```

## 4. Backup Monitoring

### Send Alerts on Failure
```javascript
// In backup script
const { sendEmail } = require('../apps/api/utils/emailService');

try {
  await backupDatabase();
  await backupStorage();
} catch (error) {
  await sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: '🚨 BACKUP FAILED',
    text: `Backup failed: ${error.message}`,
    html: `<h1>Backup Failed</h1><pre>${error.stack}</pre>`
  });

  // Also send to Slack/PagerDuty
  await sendSlackAlert(error);
}
```

## 5. Backup Checklist

### Daily Tasks (Automated)
- [ ] Storage files backup to S3
- [ ] Database dump to S3
- [ ] Verify backup completion
- [ ] Send success notification

### Weekly Tasks
- [ ] Review backup logs
- [ ] Check backup file sizes
- [ ] Verify rotation is working

### Monthly Tasks
- [ ] Test single file restore
- [ ] Review storage costs
- [ ] Update documentation

### Quarterly Tasks
- [ ] Full disaster recovery test
- [ ] Update restore procedures
- [ ] Review retention policies
- [ ] Audit access logs

## 6. Disaster Recovery Plan

### Recovery Time Objective (RTO)
- **Target:** 4 hours from incident to full recovery
- **Steps:**
  1. Identify issue and decide to restore (30 min)
  2. Provision new infrastructure (1 hour)
  3. Restore database from backup (1 hour)
  4. Restore storage files from backup (1.5 hours)
  5. Verify and test (30 min)

### Recovery Point Objective (RPO)
- **Target:** 24 hours maximum data loss
- **Method:** Daily backups at 2 AM
- **Acceptable:** Data created/modified in last 24 hours may be lost

## Cost Estimate

### Storage Costs (AWS S3)
- 100GB backups: ~$2.50/month
- Retrieval (rare): ~$1/GB
- **Monthly: ~$3-10**

### Supabase Backups
- Pro plan: $25/month (includes backups)
- **Monthly: $25**

### Total Backup Cost
- **$3-35/month depending on solution**

## Implementation Time
- Setup: 2-3 hours
- Testing: 1-2 hours
- Documentation: 1 hour
- **Total: 4-6 hours**
