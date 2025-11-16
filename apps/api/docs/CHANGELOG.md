# API Changelog

All notable changes to the RoleReady Resume Builder API will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Complete API documentation with OpenAPI/Swagger
- Interactive API explorer at `/api/docs`
- Code examples for JavaScript, Python, and cURL

## [1.0.0] - 2025-11-15

### Added - New Endpoints
- **Export Endpoint**: `POST /api/base-resumes/:id/export` - Export resumes to PDF, DOCX, TXT, or JSON
- **Duplicate Endpoint**: `POST /api/base-resumes/:id/duplicate` - Create a copy of an existing resume
- **History Endpoint**: `GET /api/base-resumes/:id/history` - Get all tailored versions for a resume
- **Restore Endpoint**: `POST /api/base-resumes/:id/restore/:versionId` - Restore resume from a tailored version
- **Share Endpoint**: `POST /api/base-resumes/:id/share` - Create public shareable links
- **Share Access**: `GET /api/share/:token` - Access shared resumes (no auth required)
- **Share List**: `GET /api/base-resumes/:id/shares` - List all share links for a resume
- **Share Deactivate**: `DELETE /api/share/:token` - Deactivate a share link
- **Analytics Endpoint**: `GET /api/base-resumes/:id/analytics` - Get resume usage statistics
- **Template List**: `GET /api/resume-templates` - List all available templates
- **Template Get**: `GET /api/resume-templates/:id` - Get a specific template
- **Template Create**: `POST /api/resume-templates` - Create custom template (admin only)
- **Tailored Version Get**: `GET /api/tailored-versions/:id` - Get specific tailored version
- **Tailored Version Delete**: `DELETE /api/tailored-versions/:id` - Delete tailored version
- **Tailored Version List**: `GET /api/tailored-versions` - List all tailored versions

### Added - Features
- **Resume Export**: Support for PDF, DOCX, TXT, and JSON formats
- **Resume Sharing**: Public links with optional password protection and expiration
- **Resume Analytics**: Track views, exports, tailors, and shares
- **Resume Templates**: 8 built-in templates with database support
- **Resume History**: Complete version history with restore capability
- **Resume Duplication**: Smart slot management when duplicating resumes

### Added - Security
- **RBAC**: Role-based access control (admin, user)
- **Share Permissions**: Owner, Viewer, Editor permissions for shared resumes
- **PII Encryption**: Encrypt sensitive data at rest
- **Safe Logging**: Automatic PII and secret redaction in logs
- **2FA Support**: Two-factor authentication for sensitive operations
- **Session Management**: JWT access/refresh tokens with expiration
- **Password Strength**: Enforced password policies
- **IP Rate Limiting**: Per-IP rate limiting for login and API requests
- **Suspicious Activity Detection**: Alerts for unusual login patterns

### Added - Database
- **New Tables**:
  - `resume_templates` - Template storage
  - `resume_share_links` - Share link management
  - `resume_analytics` - Usage tracking
  - `generated_documents` - Export tracking
- **New Columns**:
  - `users.role` - User role (admin/user)
  - `users.two_factor_secret` - 2FA secret
  - `users.two_factor_enabled` - 2FA status
  - `users.last_login_ip` - Last login IP
  - `users.last_login_country` - Last login country
  - `users.consent_ai_processing` - AI processing consent
  - `users.consent_analytics` - Analytics consent
  - `users.consent_marketing` - Marketing consent

### Changed
- **Export Format**: Exports now return download URLs instead of file buffers
- **Export Expiration**: Exported files expire after 1 hour
- **Duplicate Behavior**: Duplicated resumes now use first available slot instead of incrementing

### Improved
- **Error Handling**: Standardized error responses across all endpoints
- **Logging**: All routes now use safe logging to prevent PII leaks
- **Performance**: Added indexes for common query patterns
- **Documentation**: Complete OpenAPI specification with examples

### Fixed
- **Export Memory**: Fixed memory issues with large exports by using temporary files
- **Slot Management**: Fixed slot number conflicts when duplicating resumes
- **Analytics Tracking**: Graceful handling when analytics table doesn't exist

## [0.9.0] - 2025-11-01 (Previous Release)

### Added
- Base resume CRUD operations
- Working draft management
- AI-powered resume tailoring
- ATS score calculation
- Resume parsing from PDF/DOCX

### Known Issues
- Export functionality limited to basic formats
- No resume sharing capability
- No analytics tracking
- No template management

---

## Breaking Changes

### Version 1.0.0

#### Export Endpoint Response Format
**Before:**
```json
{
  "success": true,
  "file": "<base64_encoded_file>"
}
```

**After:**
```json
{
  "success": true,
  "fileUrl": "/api/exports/download/abc123",
  "fileName": "resume.pdf",
  "expiresAt": "2025-11-15T13:00:00Z"
}
```

**Migration**: Update your client code to download files from the provided URL instead of decoding base64.

#### Share Link Structure
**New Feature**: Share links are now managed through dedicated endpoints instead of being part of resume metadata.

**Migration**: If you were storing share information in resume metadata, migrate to the new `resume_share_links` table.

---

## Deprecation Notices

### None at this time

All endpoints are stable and fully supported.

---

## Upgrade Guide

### From 0.9.0 to 1.0.0

1. **Run Database Migrations**
   ```bash
   cd apps/api
   node scripts/run-all-migrations.js
   ```

2. **Install New Dependencies**
   ```bash
   npm install js-yaml
   ```

3. **Update Environment Variables**
   Add the following to your `.env`:
   ```
   FRONTEND_URL=http://localhost:3000
   ```

4. **Update Export Logic**
   If you're using the export functionality, update your client code to handle the new response format (download URL instead of file buffer).

5. **Regenerate Prisma Client**
   ```bash
   npx prisma generate
   ```

6. **Restart API Server**
   ```bash
   npm run dev
   ```

---

## API Versioning

We follow semantic versioning for our API:

- **Major version** (1.x.x): Breaking changes
- **Minor version** (x.1.x): New features, backwards compatible
- **Patch version** (x.x.1): Bug fixes, backwards compatible

### Current Version: 1.0.0

All endpoints are prefixed with `/api/` and are considered v1.

### Future Versioning

When we introduce breaking changes, we'll use URL versioning:
- v1: `/api/base-resumes`
- v2: `/api/v2/base-resumes`

v1 endpoints will be supported for at least 6 months after v2 is released.

---

## Support

For questions about API changes:
- Email: support@roleready.com
- Documentation: https://roleready.com/api/docs
- Changelog: https://roleready.com/api/docs/changelog

---

## Release Schedule

- **Major releases**: Quarterly (Q1, Q2, Q3, Q4)
- **Minor releases**: Monthly
- **Patch releases**: As needed

Next scheduled release: **v1.1.0** - December 2025

---

## Feedback

We welcome feedback on our API! Please submit:
- Bug reports: GitHub Issues
- Feature requests: support@roleready.com
- Documentation improvements: Pull requests welcome

