# GDPR Compliance Implementation Guide

## Overview
Implement General Data Protection Regulation (GDPR) compliance for your file storage system if serving users in the European Union.

**Implementation Time**: 12-16 hours
**Priority**: P0 if serving EU users (legal requirement)
**Cost**: Free (technical implementation)
**Legal Review Required**: Yes (consult with lawyer)

⚠️ **DISCLAIMER**: This guide provides technical implementation guidance only. Always consult with a qualified lawyer for legal compliance.

---

## 1️⃣ GDPR Principles & Requirements

### Key Principles

1. **Lawfulness, Fairness, and Transparency**
   - Clear consent mechanisms
   - Transparent privacy policy
   - Legitimate processing basis

2. **Purpose Limitation**
   - Only collect data for specific purposes
   - Don't use data for other purposes without consent

3. **Data Minimization**
   - Only collect necessary data
   - Don't store excessive information

4. **Accuracy**
   - Keep data up-to-date
   - Allow users to correct information

5. **Storage Limitation**
   - Don't keep data longer than necessary
   - Implement retention policies

6. **Integrity and Confidentiality**
   - Secure data with encryption
   - Prevent unauthorized access

7. **Accountability**
   - Document compliance measures
   - Maintain audit logs

### User Rights

- ✅ Right to Access (Article 15)
- ✅ Right to Rectification (Article 16)
- ✅ Right to Erasure / "Right to be Forgotten" (Article 17)
- ✅ Right to Data Portability (Article 20)
- ✅ Right to Object (Article 21)
- ✅ Right to Restrict Processing (Article 18)

---

## 2️⃣ Consent Management

### Cookie Consent Banner

```typescript
// CookieConsent.tsx
import { useState, useEffect } from 'react';

export default function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem('cookie_consent', JSON.stringify({
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString()
    }));
    setShowBanner(false);
    // Initialize analytics
    initializeAnalytics();
  };

  const acceptNecessary = () => {
    localStorage.setItem('cookie_consent', JSON.stringify({
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString()
    }));
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-6 z-50">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-semibold mb-2">We value your privacy</h3>
          <p className="text-sm text-gray-300">
            We use cookies to enhance your experience, analyze site usage, and assist in
            our marketing efforts. By clicking "Accept All", you consent to our use of cookies.
            <a href="/privacy" className="underline ml-1">Learn more</a>
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={acceptNecessary}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
          >
            Necessary Only
          </button>
          <button
            onClick={() => setShowCookieSettings(true)}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
          >
            Customize
          </button>
          <button
            onClick={acceptAll}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Consent Logging

```javascript
// Prisma schema
model UserConsent {
  id        String   @id @default(cuid())
  userId    String
  type      String   // "cookie", "terms", "privacy", "marketing"
  granted   Boolean
  ipAddress String?
  userAgent String?
  timestamp DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([type])
  @@map("user_consents")
}

// API endpoint
fastify.post('/api/consent', {
  preHandler: [authenticate]
}, async (request, reply) => {
  const { type, granted } = request.body;
  const userId = request.user.id;

  await prisma.userConsent.create({
    data: {
      userId,
      type,
      granted,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
      timestamp: new Date()
    }
  });

  return { success: true };
});
```

---

## 3️⃣ Right to Access (Data Export)

### Export User Data

```javascript
// apps/api/routes/gdpr.routes.js
fastify.get('/api/user/export', {
  preHandler: [authenticate]
}, async (request, reply) => {
  const userId = request.user.id;

  // Gather all user data
  const userData = {
    personalInfo: await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        subscriptionTier: true
      }
    }),

    files: await prisma.storageFile.findMany({
      where: { userId, isDeleted: false },
      select: {
        id: true,
        name: true,
        type: true,
        size: true,
        createdAt: true,
        metadata: true
      }
    }),

    shares: await prisma.fileShare.findMany({
      where: {
        file: { userId }
      },
      select: {
        id: true,
        fileName: true,
        permission: true,
        createdAt: true,
        expiresAt: true
      }
    }),

    comments: await prisma.fileComment.findMany({
      where: { userId },
      select: {
        id: true,
        content: true,
        fileName: true,
        createdAt: true
      }
    }),

    consents: await prisma.userConsent.findMany({
      where: { userId },
      select: {
        type: true,
        granted: true,
        timestamp: true
      }
    }),

    auditLog: await prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 1000, // Last 1000 activities
      select: {
        action: true,
        resourceType: true,
        resourceId: true,
        ipAddress: true,
        createdAt: true
      }
    })
  };

  // Generate export package
  const exportData = {
    exportDate: new Date().toISOString(),
    format: 'JSON',
    data: userData
  };

  reply.header('Content-Disposition', `attachment; filename="rolerabbit-data-export-${userId}.json"`);
  reply.header('Content-Type', 'application/json');
  return exportData;
});
```

### Self-Service Data Export UI

```typescript
// DataExportPage.tsx
export default function DataExportPage() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const response = await fetch('/api/user/export', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'my-data-export.json';
      a.click();

      toast.success('Data exported successfully!');
    } catch (error) {
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Export Your Data</h1>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-900">
          Under GDPR Article 15 (Right to Access), you can download a copy of all
          your personal data we hold.
        </p>
      </div>

      <div className="space-y-4 mb-6">
        <h3 className="font-semibold">Your export will include:</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Account information (email, name, subscription)</li>
          <li>All your files (metadata only, not file contents)</li>
          <li>Share links you've created</li>
          <li>Comments you've posted</li>
          <li>Consent records</li>
          <li>Recent activity log (last 1000 activities)</li>
        </ul>
      </div>

      <button
        onClick={handleExport}
        disabled={isExporting}
        className="
          px-6 py-3 bg-blue-600 text-white rounded-lg
          hover:bg-blue-700 disabled:opacity-50
          font-medium
        "
      >
        {isExporting ? 'Exporting...' : 'Export My Data'}
      </button>

      <p className="text-xs text-gray-500 mt-4">
        Export format: JSON. To download your actual files, use the bulk download feature.
      </p>
    </div>
  );
}
```

---

## 4️⃣ Right to Erasure ("Right to be Forgotten")

### Delete Account & All Data

```javascript
// API endpoint
fastify.delete('/api/user/account', {
  preHandler: [authenticate]
}, async (request, reply) => {
  const userId = request.user.id;
  const { confirm, reason } = request.body;

  if (!confirm) {
    return reply.status(400).send({ error: 'Confirmation required' });
  }

  // Log deletion request
  await prisma.gdprRequest.create({
    data: {
      userId,
      type: 'deletion',
      reason,
      status: 'processing',
      requestedAt: new Date()
    }
  });

  // Process deletion (in background job)
  await deleteUserDataQueue.add('delete-user', { userId });

  return {
    success: true,
    message: 'Account deletion initiated. You will receive confirmation within 30 days.'
  };
});

// Background job (apps/api/jobs/deleteUserData.js)
async function deleteUserData(userId) {
  try {
    // 1. Delete all files from storage
    const files = await prisma.storageFile.findMany({
      where: { userId }
    });

    for (const file of files) {
      await storageHandler.deleteFile(file.storagePath);
      // Delete all versions
      const versions = await prisma.fileVersion.findMany({
        where: { fileId: file.id }
      });
      for (const version of versions) {
        await storageHandler.deleteFile(version.storagePath);
      }
    }

    // 2. Delete database records (in transaction)
    await prisma.$transaction([
      // Delete file-related data
      prisma.fileVersion.deleteMany({ where: { file: { userId } } }),
      prisma.fileComment.deleteMany({ where: { userId } }),
      prisma.fileShare.deleteMany({ where: { file: { userId } } }),
      prisma.storageFile.deleteMany({ where: { userId } }),

      // Delete user-related data
      prisma.userConsent.deleteMany({ where: { userId } }),
      prisma.session.deleteMany({ where: { userId } }),

      // Anonymize audit logs (don't delete for compliance)
      prisma.auditLog.updateMany({
        where: { userId },
        data: {
          userId: 'DELETED_USER',
          metadata: { anonymized: true, deletedAt: new Date() }
        }
      }),

      // Delete user account
      prisma.user.delete({ where: { id: userId } })
    ]);

    // 3. Update GDPR request status
    await prisma.gdprRequest.updateMany({
      where: { userId, type: 'deletion' },
      data: {
        status: 'completed',
        completedAt: new Date()
      }
    });

    // 4. Send confirmation email
    await sendEmail({
      to: user.email, // Saved before deletion
      subject: 'Account Deletion Completed',
      body: 'Your account and all associated data have been permanently deleted.'
    });

    logger.info(`User data deleted: ${userId}`);
  } catch (error) {
    logger.error(`Failed to delete user data: ${userId}`, error);

    await prisma.gdprRequest.updateMany({
      where: { userId, type: 'deletion' },
      data: { status: 'failed', error: error.message }
    });
  }
}
```

### Delete Account UI

```typescript
// DeleteAccountPage.tsx
export default function DeleteAccountPage() {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [reason, setReason] = useState('');
  const [typedConfirmation, setTypedConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (typedConfirmation !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    setIsDeleting(true);

    try {
      await fetch('/api/user/account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ confirm: true, reason })
      });

      toast.success('Account deletion initiated');
      // Log out user
      logout();
    } catch (error) {
      toast.error('Failed to delete account');
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-red-50 border-2 border-red-500 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-red-900 mb-4">
          ⚠️ Delete Account
        </h1>

        <div className="mb-6 space-y-3 text-red-800">
          <p className="font-semibold">This action is permanent and cannot be undone!</p>
          
          <p>When you delete your account, we will:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Permanently delete all your files</li>
            <li>Delete all file versions</li>
            <li>Revoke all share links</li>
            <li>Remove all comments</li>
            <li>Delete your account information</li>
            <li>Anonymize your activity logs</li>
          </ul>

          <p className="font-semibold mt-4">
            Deletion will be completed within 30 days as required by GDPR.
          </p>
        </div>

        {!showConfirmation ? (
          <button
            onClick={() => setShowConfirmation(true)}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            I Understand, Delete My Account
          </button>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Why are you leaving? (optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-3 border rounded-lg"
                rows={3}
                placeholder="Help us improve..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Type <span className="font-mono font-bold">DELETE</span> to confirm
              </label>
              <input
                type="text"
                value={typedConfirmation}
                onChange={(e) => setTypedConfirmation(e.target.value)}
                className="w-full p-3 border rounded-lg font-mono"
                placeholder="DELETE"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-6 py-3 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={typedConfirmation !== 'DELETE' || isDeleting}
                className="
                  px-6 py-3 bg-red-600 text-white rounded-lg
                  hover:bg-red-700 disabled:opacity-50
                  font-medium
                "
              >
                {isDeleting ? 'Deleting...' : 'Permanently Delete Account'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 5️⃣ Data Retention Policies

```javascript
// Data retention configuration
const RETENTION_POLICIES = {
  // User data
  deletedUsers: { days: 30, autoDelete: true },
  
  // File data
  deletedFiles: { days: 30, autoDelete: true },
  fileVersions: { days: 365, autoDelete: false }, // Keep 1 year
  
  // Audit logs
  auditLogs: { days: 2555, autoDelete: false }, // 7 years (compliance)
  
  // Temporary data
  sessions: { days: 90, autoDelete: true },
  uploadTokens: { hours: 24, autoDelete: true }
};

// Scheduled job (runs daily)
async function cleanupExpiredData() {
  const now = new Date();

  // 1. Permanently delete soft-deleted files older than 30 days
  const deletedFilesCutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const expiredFiles = await prisma.storageFile.findMany({
    where: {
      isDeleted: true,
      deletedAt: { lt: deletedFilesCutoff }
    }
  });

  for (const file of expiredFiles) {
    // Delete from storage
    await storageHandler.deleteFile(file.storagePath);
    
    // Delete metadata
    await prisma.storageFile.delete({ where: { id: file.id } });
    
    logger.info(`Permanently deleted file: ${file.id}`);
  }

  // 2. Delete old sessions
  const sessionsCutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  await prisma.session.deleteMany({
    where: { lastActive: { lt: sessionsCutoff } }
  });

  // 3. Archive old audit logs (move to cold storage)
  const auditLogsCutoff = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
  const oldLogs = await prisma.auditLog.findMany({
    where: { createdAt: { lt: auditLogsCutoff } }
  });

  // Export to S3 for long-term storage
  await archiveToS3('audit-logs', oldLogs);
  
  // Delete from primary database
  await prisma.auditLog.deleteMany({
    where: { createdAt: { lt: auditLogsCutoff } }
  });

  logger.info('Data retention cleanup completed');
}

// Schedule with cron
cron.schedule('0 2 * * *', cleanupExpiredData); // 2 AM daily
```

---

## 6️⃣ Data Processing Records

```javascript
// Prisma schema
model DataProcessingRecord {
  id          String   @id @default(cuid())
  purpose     String   // "file_storage", "analytics", "marketing"
  legalBasis  String   // "consent", "contract", "legitimate_interest"
  dataTypes   Json     // ["email", "ip_address", "files"]
  recipients  Json     // ["Supabase", "AWS"]
  retention   String   // "30 days after account deletion"
  security    Json     // ["encryption", "access_controls"]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("data_processing_records")
}

// Example records
const processingRecords = [
  {
    purpose: 'File Storage Service',
    legalBasis: 'contract',
    dataTypes: ['email', 'files', 'file_metadata'],
    recipients: ['Supabase (USA)', 'AWS S3 (EU-West)'],
    retention: '30 days after account deletion',
    security: ['end_to_end_encryption', 'access_controls', 'audit_logs']
  },
  {
    purpose: 'Analytics',
    legalBasis: 'consent',
    dataTypes: ['ip_address', 'usage_patterns', 'device_info'],
    recipients: ['Google Analytics'],
    retention: '26 months',
    security: ['pseudonymization', 'ip_anonymization']
  }
];
```

---

## 7️⃣ Breach Notification System

```javascript
// Detect and report data breaches
async function reportDataBreach(incident) {
  const breach = await prisma.dataBreach.create({
    data: {
      description: incident.description,
      affectedUsers: incident.affectedUsers,
      dataTypes: incident.dataTypes,
      discoveredAt: new Date(),
      severity: incident.severity,
      status: 'investigating'
    }
  });

  // 1. Notify Data Protection Officer (DPO)
  await sendEmail({
    to: 'dpo@rolerabbit.com',
    subject: `🚨 Data Breach Detected - ${incident.severity}`,
    body: `
      Breach ID: ${breach.id}
      Description: ${incident.description}
      Affected Users: ${incident.affectedUsers.length}
      Data Types: ${incident.dataTypes.join(', ')}
    `
  });

  // 2. If high severity, notify supervisory authority within 72 hours
  if (incident.severity === 'high' || incident.affectedUsers.length > 100) {
    // Schedule notification task
    await notifyRegulatorQueue.add('notify-regulator', {
      breachId: breach.id,
      deadline: new Date(Date.now() + 72 * 60 * 60 * 1000) // 72 hours
    });
  }

  // 3. Notify affected users if high risk to rights and freedoms
  if (incident.severity === 'high') {
    for (const userId of incident.affectedUsers) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      
      await sendEmail({
        to: user.email,
        subject: 'Important Security Notification',
        body: `
          Dear ${user.name},
          
          We are writing to inform you of a security incident that may have
          affected your personal data. [Details of incident]
          
          Actions you should take:
          1. Change your password immediately
          2. Enable two-factor authentication
          3. Monitor your account for suspicious activity
          
          For more information: https://rolerabbit.com/security-incident
        `
      });
    }
  }

  logger.critical(`Data breach reported: ${breach.id}`);
}
```

---

## 8️⃣ GDPR Compliance Checklist

### Technical Implementation

- ⬜ Cookie consent banner
- ⬜ Data export functionality
- ⬜ Account deletion (Right to erasure)
- ⬜ Data retention policies
- ⬜ Audit logging
- ⬜ Encryption at rest
- ⬜ Encryption in transit (HTTPS)
- ⬜ Access controls
- ⬜ Breach notification system

### Legal Documentation

- ⬜ Privacy Policy (see next guide)
- ⬜ Terms of Service (see next guide)
- ⬜ Cookie Policy
- ⬜ Data Processing Agreement (DPA)
- ⬜ Subprocessor list (Supabase, AWS, etc.)
- ⬜ Data Protection Impact Assessment (DPIA)

### Organizational

- ⬜ Appoint Data Protection Officer (DPO) if required
- ⬜ Register with supervisory authority (if required)
- ⬜ Train staff on GDPR compliance
- ⬜ Document processing activities
- ⬜ Review vendor contracts (ensure GDPR compliance)

---

## 9️⃣ Sub-processors & Data Transfers

Document all third-party services processing EU user data:

```markdown
# Sub-Processors

| Provider | Service | Data Processed | Location | Safeguards |
|----------|---------|----------------|----------|------------|
| Supabase | File storage | Files, metadata | USA | Standard Contractual Clauses (SCCs) |
| AWS S3 | Backup storage | File backups | EU-West-1 | GDPR-compliant, data in EU |
| Sentry | Error tracking | Error logs, IP (pseudonymized) | USA | SCCs, data minimization |
| Stripe | Payments | Name, email, payment info | USA | SCCs, PCI-DSS compliant |
| SendGrid | Email delivery | Email addresses | USA | SCCs |

## Data Transfer Mechanisms

For transfers to USA (post-Schrems II):
- Standard Contractual Clauses (SCCs) - 2021 version
- Additional technical measures: encryption, pseudonymization
- Transfer Impact Assessments (TIAs) completed
```

---

## 🔟 Penalties for Non-Compliance

**GDPR Fines**:
- Up to €20 million OR 4% of global annual revenue (whichever is higher)
- For serious violations (e.g., no consent, no legal basis, data breaches)

**Lesser Fines**:
- Up to €10 million OR 2% of global annual revenue
- For procedural violations (e.g., no DPO, no documentation)

**Risk Mitigation**:
- Implement all technical measures in this guide
- Have legal documentation reviewed by lawyer
- Maintain compliance documentation
- Respond to user requests within 30 days
- Report breaches within 72 hours

---

## Resources

- **GDPR Official Text**: https://gdpr-info.eu/
- **ICO Guidance**: https://ico.org.uk/for-organisations/guide-to-data-protection/
- **EU Commission**: https://ec.europa.eu/info/law/law-topic/data-protection_en
- **GDPR Checklist**: https://gdpr.eu/checklist/

---

## Implementation Time: 12-16 hours

- Cookie consent (2-3h)
- Data export (3-4h)
- Account deletion (3-4h)
- Retention policies (2-3h)
- Audit logging (2-3h)
- Documentation (1-2h)

---

## Cost: $0 (technical) + Legal review fees

**Legal Costs** (estimates):
- Privacy Policy review: $500-$1,500
- Data Processing Agreement: $1,000-$3,000
- Full GDPR audit: $5,000-$15,000

---

**IMPORTANT**: This guide provides technical implementation only. **Always consult with a qualified lawyer** to ensure full legal compliance.
