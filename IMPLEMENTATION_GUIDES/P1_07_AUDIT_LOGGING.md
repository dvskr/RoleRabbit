# Audit Logging Implementation

## Overview
Implement comprehensive audit logging for compliance (GDPR, SOC2, HIPAA) with FileAccessLog tracking.

## What to Log
- ✅ File uploads/downloads
- ✅ File sharing/unsharing
- ✅ Permission changes
- ✅ File deletions/restorations
- ✅ Login/logout events
- ✅ Failed access attempts

## Implementation

### Enhance FileAccessLog Service

Create `apps/api/utils/auditLogger.js`:

```javascript
const { prisma } = require('./db');
const logger = require('./logger');

/**
 * Log file access event
 */
async function logFileAccess(data) {
  const {
    fileId,
    userId,
    action, // view, download, share, edit, delete, restore
    ipAddress,
    userAgent,
    metadata = {}
  } = data;

  try {
    await prisma.fileAccessLog.create({
      data: {
        fileId,
        userId,
        action,
        ipAddress,
        userAgent,
        createdAt: new Date()
      }
    });

    // Also log to external service for compliance
    await logToExternalAuditService({
      ...data,
      timestamp: new Date().toISOString(),
      level: 'audit'
    });

    logger.info(`📝 Audit: ${action} on file ${fileId} by user ${userId}`);
  } catch (error) {
    logger.error('Failed to log file access:', error);
    // Don't throw - audit logging should not break operations
  }
}

/**
 * Log to external audit service (e.g., Loggly, Splunk)
 */
async function logToExternalAuditService(event) {
  if (!process.env.AUDIT_LOG_ENDPOINT) return;

  try {
    await fetch(process.env.AUDIT_LOG_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.AUDIT_LOG_API_KEY}`
      },
      body: JSON.stringify(event)
    });
  } catch (error) {
    logger.error('Failed to log to external audit service:', error);
  }
}

/**
 * Log security event
 */
async function logSecurityEvent(event) {
  logger.warn('🚨 SECURITY EVENT:', event);

  // Store in database
  await prisma.securityEvent.create({
    data: {
      ...event,
      severity: event.severity || 'medium',
      createdAt: new Date()
    }
  });

  // Send to external service
  await logToExternalAuditService({
    ...event,
    level: 'security',
    timestamp: new Date().toISOString()
  });

  // Send alert for high severity
  if (event.severity === 'high' || event.severity === 'critical') {
    const alertService = require('./alerts');
    await alertService.sendAlert({
      level: 'critical',
      type: 'security_event',
      title: event.type,
      message: event.message,
      context: event
    });
  }
}

/**
 * Get audit trail for a file
 */
async function getFileAuditTrail(fileId, options = {}) {
  const {
    limit = 100,
    offset = 0,
    action = null,
    userId = null,
    startDate = null,
    endDate = null
  } = options;

  const where = {
    fileId,
    ...(action && { action }),
    ...(userId && { userId }),
    ...(startDate && { createdAt: { gte: new Date(startDate) } }),
    ...(endDate && { createdAt: { lte: new Date(endDate) } })
  };

  const logs = await prisma.fileAccessLog.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset
  });

  return logs.map(log => ({
    id: log.id,
    action: log.action,
    timestamp: log.createdAt.toISOString(),
    user: {
      id: log.user.id,
      name: log.user.name,
      email: log.user.email
    },
    ipAddress: log.ipAddress,
    userAgent: log.userAgent
  }));
}

/**
 * Get user audit trail
 */
async function getUserAuditTrail(userId, options = {}) {
  const { limit = 100, startDate, endDate } = options;

  const where = {
    userId,
    ...(startDate && { createdAt: { gte: new Date(startDate) } }),
    ...(endDate && { createdAt: { lte: new Date(endDate) } })
  };

  return await prisma.fileAccessLog.findMany({
    where,
    include: {
      file: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: limit
  });
}

/**
 * Export audit logs (for compliance)
 */
async function exportAuditLogs(startDate, endDate, format = 'json') {
  const logs = await prisma.fileAccessLog.findMany({
    where: {
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    },
    include: {
      user: true,
      file: true
    },
    orderBy: { createdAt: 'asc' }
  });

  if (format === 'csv') {
    return convertLogsToCSV(logs);
  }

  return JSON.stringify(logs, null, 2);
}

function convertLogsToCSV(logs) {
  const headers = ['Timestamp', 'User', 'Action', 'File', 'IP Address'];
  const rows = logs.map(log => [
    log.createdAt.toISOString(),
    log.user.email,
    log.action,
    log.file.name,
    log.ipAddress
  ]);

  return [headers, ...rows]
    .map(row => row.join(','))
    .join('\n');
}

module.exports = {
  logFileAccess,
  logSecurityEvent,
  getFileAuditTrail,
  getUserAuditTrail,
  exportAuditLogs
};
```

### Integrate into Routes

```javascript
const auditLogger = require('../utils/auditLogger');

// In download endpoint
fastify.get('/files/:id/download', async (request, reply) => {
  // ... permission check ...

  // Log download
  await auditLogger.logFileAccess({
    fileId,
    userId,
    action: 'download',
    ipAddress: request.ip,
    userAgent: request.headers['user-agent']
  });

  // ... send file ...
});

// In share endpoint
fastify.post('/files/:id/share', async (request, reply) => {
  // ... create share ...

  await auditLogger.logFileAccess({
    fileId,
    userId,
    action: 'share',
    ipAddress: request.ip,
    userAgent: request.headers['user-agent'],
    metadata: { sharedWith: userEmail, permission }
  });
});
```

### Add Audit Trail Endpoint

```javascript
// Get audit trail for file
fastify.get('/files/:id/audit', {
  preHandler: [authenticate, adminOnly]
}, async (request, reply) => {
  const fileId = request.params.id;
  const trail = await auditLogger.getFileAuditTrail(fileId, request.query);

  return reply.send({
    success: true,
    trail,
    count: trail.length
  });
});

// Export audit logs (admin only)
fastify.get('/admin/audit/export', {
  preHandler: [authenticate, adminOnly]
}, async (request, reply) => {
  const { startDate, endDate, format } = request.query;

  const logs = await auditLogger.exportAuditLogs(
    startDate,
    endDate,
    format
  );

  if (format === 'csv') {
    reply.type('text/csv');
    reply.header('Content-Disposition', 'attachment; filename="audit-logs.csv"');
  }

  return reply.send(logs);
});
```

## Retention Policy

```javascript
// Cron job to archive old logs (run monthly)
async function archiveOldLogs() {
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - 12); // Keep 12 months

  // Archive to S3/cold storage
  const oldLogs = await prisma.fileAccessLog.findMany({
    where: {
      createdAt: { lt: cutoffDate }
    }
  });

  // Upload to S3
  await uploadToS3('audit-archives', `logs-${cutoffDate.toISOString()}.json`, JSON.stringify(oldLogs));

  // Delete from database
  await prisma.fileAccessLog.deleteMany({
    where: {
      createdAt: { lt: cutoffDate }
    }
  });
}
```

## Environment Variables

```env
AUDIT_LOG_ENDPOINT=https://audit-service.example.com/logs
AUDIT_LOG_API_KEY=your-api-key
AUDIT_RETENTION_MONTHS=12
```

## Compliance Features

### GDPR: Right to Access
```javascript
// User can export their audit trail
GET /api/users/me/audit
```

### GDPR: Right to Erasure
```javascript
// Anonymize user in audit logs
await prisma.fileAccessLog.updateMany({
  where: { userId },
  data: {
    userId: 'DELETED_USER',
    ipAddress: '0.0.0.0'
  }
});
```

## Cost
- Database storage: $0.10/GB/month
- External audit service: $20-100/month
- S3 archive: $0.02/GB/month

## Implementation Time: 5-6 hours
