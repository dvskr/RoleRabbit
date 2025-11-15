# Data Retention Policy

**Document Version:** 1.0
**Effective Date:** January 1, 2025
**Last Review:** January 1, 2025
**Next Review:** January 1, 2026

## 1. Purpose

This Data Retention Policy defines how long RoleRabbit retains different types of data, ensuring compliance with:

- **GDPR** (General Data Protection Regulation)
- **CCPA** (California Consumer Privacy Act)
- **SOC 2** compliance requirements
- Legal and regulatory obligations

## 2. Retention Principles

### 2.1 Data Minimization

We collect and retain only data necessary for legitimate business purposes.

### 2.2 Purpose Limitation

Data is retained only as long as needed for the original purpose.

### 2.3 Storage Limitation

Data is automatically deleted when retention period expires.

### 2.4 Security

All retained data is encrypted and access-controlled.

## 3. Data Categories and Retention Periods

### 3.1 User Account Data

| Data Type | Retention Period | Notes |
|-----------|------------------|-------|
| Email, Name, Password | While account active + 30 days | Grace period for deletion |
| Profile information | While account active | User-controlled |
| Account creation date | While account active + 7 years | For audit compliance |
| Last login timestamp | While account active | Rolling 90 days |
| User preferences | While account active | Deleted with account |

**Deletion Trigger:** User requests account deletion
**Grace Period:** 30 days (user can cancel deletion)
**Permanent Deletion:** After 30 days, all data permanently deleted

### 3.2 Portfolio Data

| Data Type | Retention Period | Notes |
|-----------|------------------|-------|
| Portfolio content | While portfolio exists | User-controlled |
| Published portfolios | Until unpublished or deleted | User-controlled |
| Draft portfolios | Inactive 365 days → warning, 400 days → auto-delete | To free storage |
| Portfolio versions | 30 versions max, 90 days old | Auto-prune |
| Deleted portfolios | 30 days in soft-delete | Recoverable |

**Deletion Trigger:** User deletes portfolio or account
**Grace Period:** 30 days soft-delete (recoverable)
**Auto-Cleanup:** Inactive drafts after 400 days

### 3.3 Analytics Data

| Data Type | Retention Period | Notes |
|-----------|------------------|-------|
| Portfolio views (anonymized) | 12 months | IP/UA hashed |
| Aggregated analytics | 36 months | No PII |
| Real-time analytics | 7 days | Then aggregated |
| Session data | 24 hours | Ephemeral |
| Export events | 12 months | Anonymized |

**Anonymization:** All IPs and user agents hashed before storage
**Aggregation:** Individual events aggregated to daily/weekly/monthly stats
**Auto-Cleanup:** Cron job runs monthly to delete old data

### 3.4 Audit Logs

| Data Type | Retention Period | Notes |
|-----------|------------------|-------|
| Security events | 7 years | Compliance requirement |
| Authentication logs | 1 year | Login/logout |
| Admin actions | 7 years | Regulatory compliance |
| Data access logs | 3 years | GDPR requirement |
| API access logs | 90 days | Debugging |

**Compliance:** Audit logs retained even after account deletion
**PII Minimization:** Logs contain user ID only, no email/name

### 3.5 Payment Data

| Data Type | Retention Period | Notes |
|-----------|------------------|-------|
| Transaction records | 7 years | Tax/legal requirement |
| Payment methods | While active + 13 months | Stripe retains |
| Invoices | 7 years | Accounting requirement |
| Refund records | 7 years | Legal requirement |

**Note:** Full credit card numbers NEVER stored (Stripe PCI compliance)
**Deletion:** Transaction records retained even after account deletion

### 3.6 Communication Data

| Data Type | Retention Period | Notes |
|-----------|------------------|-------|
| Transactional emails | 90 days | Delivery logs |
| Support tickets | 3 years | Customer service |
| Newsletter subscriptions | Until unsubscribe + 30 days | Marketing |
| Email preferences | While account active | User-controlled |

**Deletion Trigger:** User unsubscribes or deletes account
**Compliance:** Unsubscribe requests honored within 48 hours

### 3.7 Backup Data

| Data Type | Retention Period | Notes |
|-----------|------------------|-------|
| Daily backups | 30 days | Point-in-time recovery |
| Weekly backups | 90 days | Extended recovery |
| Monthly backups | 12 months | Compliance |
| Deleted data in backups | Up to 90 days | Cannot be recovered |

**Note:** Deleted user data remains in backups for up to 90 days, then purged
**Security:** All backups encrypted at rest

### 3.8 File Uploads

| Data Type | Retention Period | Notes |
|-----------|------------------|-------|
| Profile images | While account active | CDN cached 30 days |
| Portfolio images | While portfolio exists | CDN cached 90 days |
| Deleted images | 30 days soft-delete | Recoverable |
| Orphaned files | Auto-cleanup after 7 days | No portfolio reference |

**CDN Purge:** Images purged from CDN within 24 hours of deletion
**Storage Cleanup:** Orphaned files auto-deleted weekly

### 3.9 Error Logs

| Data Type | Retention Period | Notes |
|-----------|------------------|-------|
| Application errors | 90 days | Debugging |
| Server logs | 30 days | Performance monitoring |
| Security alerts | 1 year | Incident response |

**PII Redaction:** Email addresses and IPs redacted from error logs

### 3.10 Third-Party Data

| Data Type | Retention Period | Notes |
|-----------|------------------|-------|
| OAuth tokens | Until revoked | Encrypted |
| API keys | Until revoked | Hashed |
| Webhooks | 30 days logs | Debugging |

## 4. Deletion Procedures

### 4.1 User-Initiated Deletion

**Account Deletion:**
1. User requests deletion via settings
2. 30-day grace period begins
3. Warning emails sent at 7, 14, 21 days
4. After 30 days, permanent deletion executed
5. Deletion audit log created

**Portfolio Deletion:**
1. User deletes portfolio
2. Soft-delete for 30 days (recoverable)
3. After 30 days, permanent deletion
4. CDN purge within 24 hours

### 4.2 Automated Deletion

**Cron Jobs:**
- **Daily:** Process expired soft-deletes
- **Weekly:** Cleanup orphaned files
- **Monthly:** Aggregate and delete old analytics
- **Quarterly:** Archive old audit logs

**Monitoring:**
- All deletions logged
- Failed deletions trigger alerts
- Monthly reports to compliance team

### 4.3 Right to be Forgotten

**GDPR/CCPA Compliance:**
1. User submits deletion request
2. Identity verification (email confirmation)
3. 30-day grace period (user can cancel)
4. After 30 days:
   - All personal data deleted
   - Audit logs anonymized (user ID retained)
   - Transaction records anonymized
   - Backups will purge within 90 days
5. Deletion certificate sent to user

**Exceptions:**
- Audit logs (regulatory requirement) - keep user ID only
- Financial records (legal requirement) - anonymize PII
- Legal holds (ongoing litigation) - retain until resolved

## 5. Data Archival

### 5.1 Archive Criteria

Data archived when:
- Older than 3 years
- Rarely accessed
- Must retain for compliance

### 5.2 Archive Storage

- Encrypted archive storage (AWS Glacier)
- Retrieval time: 3-5 hours
- Cost-optimized storage

### 5.3 Archive Retention

| Data Type | Archive Period |
|-----------|----------------|
| Audit logs | 4-7 years |
| Financial records | 4-7 years |
| Legal holds | Until case closed |

## 6. Data Disposal

### 6.1 Secure Deletion

**Database Records:**
- Hard delete from production database
- Overwrite with null/random data
- Cascade delete related records

**File Storage:**
- Delete from object storage (S3, Supabase Storage)
- Purge from CDN cache
- Remove from backups (within 90 days)

**Backups:**
- Exclude deleted data from new backups
- Purge from existing backups (rolling)
- Zero-out deleted data in archives

### 6.2 Verification

- Deletion jobs logged with status
- Random audits to verify deletion
- Quarterly compliance reports

## 7. Legal Holds

### 7.1 Legal Hold Process

When litigation or investigation requires data preservation:

1. Legal team issues hold notice
2. Automated deletions suspended for affected data
3. Data segregated and preserved
4. Hold released when case closed
5. Normal retention resumes

### 7.2 Hold Duration

- Duration: Until legal matter resolved
- Review: Quarterly by legal team
- Release: Within 30 days of case closure

## 8. Compliance and Auditing

### 8.1 Monthly Reviews

- Deletion job success rate
- Retention policy compliance
- Storage utilization trends

### 8.2 Quarterly Audits

- Random sample of deleted accounts verified
- Backup purge verification
- Third-party data processor audit

### 8.3 Annual Reviews

- Policy effectiveness review
- Legal requirement changes
- Retention period adjustments

## 9. Exceptions

### 9.1 Fraud Prevention

Data may be retained longer if:
- Suspected fraud or abuse
- Chargebacks or disputes
- Ongoing investigation

**Duration:** Until resolved + 90 days
**Approval:** Security team + legal

### 9.2 Legal Requirements

Data retained beyond policy when:
- Court order
- Subpoena
- Regulatory investigation

**Duration:** As specified by legal authority
**Oversight:** Legal team

## 10. Employee Responsibilities

### 10.1 Engineers

- Implement automated deletion
- Test deletion procedures
- Monitor deletion jobs

### 10.2 Support Team

- Process deletion requests within 48 hours
- Verify user identity
- Document exceptions

### 10.3 Legal/Compliance

- Review retention policy annually
- Approve exceptions
- Audit deletion processes

## 11. Contact

**Data Protection Officer:** dpo@rolerabbit.com
**Privacy Team:** privacy@rolerabbit.com
**Security Team:** security@rolerabbit.com

---

**Document Owner:** Chief Privacy Officer
**Approved By:** Legal & Compliance Team
**Next Review Date:** January 1, 2026

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-01-01 | Initial policy | Privacy Team |
