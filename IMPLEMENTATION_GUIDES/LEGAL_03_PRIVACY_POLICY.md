# Privacy Policy Template for File Storage

## Overview
Privacy Policy template explaining how you collect, use, and protect user data.

⚠️ **DISCLAIMER**: This is a TEMPLATE ONLY. **You MUST have a qualified lawyer review and customize** this for GDPR, CCPA, and other privacy laws.

**Priority**: P0 (Legal requirement before launch)
**Cost**: $500-$1,500 for lawyer review
**Update Frequency**: Annually or when practices change

---

## Privacy Policy Template

```markdown
# Privacy Policy

**Last Updated**: [DATE]

**Effective Date**: [DATE]

## Introduction

RoleRabbit ("we", "us", or "our") operates [website] and provides file storage services. This Privacy Policy explains how we collect, use, disclose, and protect your personal information.

By using our Service, you agree to the collection and use of information in accordance with this policy.

## Information We Collect

### 1. Information You Provide

**Account Information**:
- Email address
- Name
- Password (encrypted)
- Profile information (optional)

**Payment Information** (processed by Stripe):
- Billing address
- Payment method details
- We do NOT store credit card numbers

**Files and Content**:
- Files you upload
- File metadata (name, size, type, dates)
- Folders and organization
- Comments and annotations

### 2. Automatically Collected Information

**Usage Data**:
- IP address
- Browser type and version
- Device information
- Operating system
- Pages visited
- Time and date of visits
- Time spent on pages
- Referral source

**Cookies and Tracking**:
- Essential cookies (required for service)
- Analytics cookies (with consent)
- Preference cookies (with consent)

### 3. Information from Third Parties

- OAuth providers (Google, Microsoft) if you sign in with them
- Payment processor (Stripe) for billing information

## How We Use Your Information

We use your information to:

### Essential Service Functions
- Create and manage your account
- Store and deliver your files
- Process payments
- Provide customer support
- Send service notifications
- Enforce our Terms of Service

### Service Improvement
- Analyze usage patterns
- Improve features and performance
- Fix bugs and technical issues
- Develop new features

### Marketing (with consent)
- Send promotional emails
- Show relevant features
- Conduct surveys

### Legal Compliance
- Comply with legal obligations
- Respond to legal requests
- Prevent fraud and abuse
- Protect our rights

## Legal Basis for Processing (GDPR)

We process your data based on:

1. **Contract**: Necessary to provide the Service
2. **Consent**: For marketing and optional features
3. **Legitimate Interest**: Service improvement, fraud prevention
4. **Legal Obligation**: Compliance with laws

## Data Sharing and Disclosure

We share your data with:

### Service Providers
- **Supabase**: File storage (USA)
- **AWS S3**: Backup storage (EU-West-1)
- **Stripe**: Payment processing (USA)
- **SendGrid**: Email delivery (USA)
- **Sentry**: Error tracking (USA)

### Legal Requirements
- Law enforcement (with valid legal process)
- Court orders or subpoenas
- Protection of rights and safety

### Business Transfers
- Mergers or acquisitions
- Asset sales
- Bankruptcy proceedings

### With Your Consent
- Third-party integrations you enable
- Sharing features you use

We do NOT:
- Sell your personal information
- Share for advertising purposes
- Use for unrelated purposes without consent

## Data Security

### Security Measures
- Encryption in transit (HTTPS/TLS)
- Encryption at rest (AES-256)
- Access controls and authentication
- Regular security audits
- Employee training

### Limitations
- No system is 100% secure
- You are responsible for password security
- Report security issues to: security@rolerabbit.com

## Data Retention

We retain your data:

- **Account Data**: Until you delete your account + 30 days
- **Files**: Until you delete them + 30 days (soft delete)
- **File Versions**: 30 days to 1 year (depending on plan)
- **Audit Logs**: 7 years (legal compliance)
- **Payment Records**: 7 years (tax compliance)
- **Deleted Data**: Permanently deleted after retention period

## Your Privacy Rights

### All Users

**Access**: View your personal data
**Correction**: Update inaccurate information
**Deletion**: Delete your account and data
**Data Portability**: Export your data (JSON format)
**Objection**: Object to certain processing

### EU/EEA Users (GDPR)

**Additional Rights**:
- Right to restrict processing
- Right to object to automated decisions
- Right to lodge a complaint with supervisory authority
- Right to withdraw consent

**Data Protection Officer**: dpo@rolerabbit.com

### California Users (CCPA)

**Additional Rights**:
- Know what personal information is collected
- Know if personal information is sold or disclosed
- Say no to sale of personal information (we don't sell)
- Non-discrimination for exercising rights

**Contact**: privacy@rolerabbit.com

### How to Exercise Rights

1. Log into your account: Settings > Privacy
2. Email us: privacy@rolerabbit.com
3. Use our Data Request form: [link]

We will respond within:
- 30 days (GDPR)
- 45 days (CCPA)

## Cookies and Tracking

### Types of Cookies

**Essential** (Required):
- Authentication
- Security
- Session management

**Analytics** (Optional):
- Usage statistics
- Feature popularity
- Performance monitoring
- Tool: Google Analytics (anonymized IP)

**Preferences** (Optional):
- UI settings
- Language preference
- Theme selection

### Managing Cookies

- Use our cookie settings: [link]
- Browser settings to block cookies
- Opt-out of Google Analytics: https://tools.google.com/dlpage/gaoptout

Note: Blocking essential cookies will break the Service.

## Third-Party Links

Our Service may contain links to third-party websites. We are not responsible for their privacy practices. Review their privacy policies before providing information.

## Children's Privacy

Our Service is not intended for users under 18. We do not knowingly collect data from children. If you believe we have collected a child's data, contact us immediately.

## International Data Transfers

### Data Storage Locations
- USA (Supabase, primary storage)
- EU (AWS S3, backups)

### Transfer Safeguards
- Standard Contractual Clauses (SCCs)
- Encryption in transit and at rest
- Access controls
- Transfer Impact Assessments (TIAs)

### EU-US Data Privacy Framework
[If applicable] We comply with the EU-US Data Privacy Framework.

## Changes to This Privacy Policy

- We may update this policy at any time
- Material changes will be notified via:
  - Email notification
  - Banner on website
  - 30 days before taking effect

- Continued use after changes = acceptance
- Review regularly: https://rolerabbit.com/privacy

## Contact Us

### Privacy Questions
**Email**: privacy@rolerabbit.com
**Form**: https://rolerabbit.com/privacy/contact

### Data Protection Officer (EU)
**Email**: dpo@rolerabbit.com

### Mailing Address
[Your Company Name]
[Street Address]
[City, State, ZIP]
[Country]

### Supervisory Authority (EU)
You have the right to lodge a complaint with your local data protection authority. Find your authority: https://edpb.europa.eu/about-edpb/board/members_en

---

**Last Reviewed**: [DATE]
**Version**: 1.0
```

---

## Implementation

### 1. Create Privacy Page

```typescript
// app/privacy/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | RoleRabbit',
  description: 'Learn how RoleRabbit collects, uses, and protects your personal information.'
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
        <p className="text-sm">
          <strong>Last Updated</strong>: {new Date().toLocaleDateString()}
        </p>
        <p className="text-sm mt-2">
          <strong>TL;DR</strong>: We respect your privacy, don't sell your data,
          and give you full control over your information.
        </p>
      </div>

      <div className="prose prose-lg max-w-none">
        {/* Privacy Policy content */}
      </div>

      <div className="mt-12 p-6 bg-gray-50 border rounded-lg">
        <h3 className="font-bold mb-3">Questions about your privacy?</h3>
        <p className="text-sm text-gray-700 mb-4">
          We're here to help. Contact our privacy team anytime.
        </p>
        <a
          href="mailto:privacy@rolerabbit.com"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Contact Privacy Team
        </a>
      </div>
    </div>
  );
}
```

### 2. Privacy Settings Page

```typescript
// app/settings/privacy/page.tsx
export default function PrivacySettingsPage() {
  const [settings, setSettings] = useState({
    analytics: true,
    marketing: false,
    shareUsageData: false
  });

  const handleExportData = async () => {
    const response = await fetch('/api/user/export');
    const blob = await response.blob();
    // Download file
  };

  const handleDeleteAccount = async () => {
    // Show confirmation modal
    if (confirm('Are you sure? This cannot be undone.')) {
      await fetch('/api/user/account', { method: 'DELETE' });
      // Log out user
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-8">Privacy Settings</h1>

      {/* Cookie Preferences */}
      <section className="mb-8 p-6 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Cookie Preferences</h2>
        
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <div>
              <div className="font-medium">Essential Cookies</div>
              <div className="text-sm text-gray-600">Required for the service to work</div>
            </div>
            <input type="checkbox" checked disabled className="w-5 h-5" />
          </label>

          <label className="flex items-center justify-between">
            <div>
              <div className="font-medium">Analytics Cookies</div>
              <div className="text-sm text-gray-600">Help us improve the service</div>
            </div>
            <input
              type="checkbox"
              checked={settings.analytics}
              onChange={(e) => updateSettings({ analytics: e.target.checked })}
              className="w-5 h-5"
            />
          </label>

          <label className="flex items-center justify-between">
            <div>
              <div className="font-medium">Marketing Emails</div>
              <div className="text-sm text-gray-600">Product updates and tips</div>
            </div>
            <input
              type="checkbox"
              checked={settings.marketing}
              onChange={(e) => updateSettings({ marketing: e.target.checked })}
              className="w-5 h-5"
            />
          </label>
        </div>
      </section>

      {/* Data Export */}
      <section className="mb-8 p-6 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Download Your Data</h2>
        <p className="text-gray-700 mb-4">
          Get a copy of all your personal data in JSON format (GDPR Article 15).
        </p>
        <button
          onClick={handleExportData}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Export My Data
        </button>
      </section>

      {/* Delete Account */}
      <section className="mb-8 p-6 border-2 border-red-200 rounded-lg bg-red-50">
        <h2 className="text-xl font-semibold text-red-900 mb-4">Delete Account</h2>
        <p className="text-red-800 mb-4">
          Permanently delete your account and all data (GDPR Article 17).
          This action cannot be undone.
        </p>
        <button
          onClick={handleDeleteAccount}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Delete My Account
        </button>
      </section>
    </div>
  );
}
```

### 3. Privacy Audit Log

```javascript
// Log all privacy-related actions
async function logPrivacyAction(userId, action, details) {
  await prisma.privacyAuditLog.create({
    data: {
      userId,
      action, // 'data_export', 'account_delete', 'consent_update'
      details: JSON.stringify(details),
      ipAddress: request.ip,
      timestamp: new Date()
    }
  });
}

// Examples
await logPrivacyAction(userId, 'data_export', { format: 'JSON', fileCount: 247 });
await logPrivacyAction(userId, 'consent_update', { analytics: true, marketing: false });
await logPrivacyAction(userId, 'account_delete', { reason: 'User requested' });
```

---

## Compliance Checklist

### GDPR (EU) Compliance
- ⬜ Legal basis documented
- ⬜ Data export functionality
- ⬜ Account deletion (30-day processing)
- ⬜ Cookie consent banner
- ⬜ Right to object
- ⬜ Data Protection Officer (if required)
- ⬜ Standard Contractual Clauses for US transfers
- ⬜ Breach notification system (72 hours)

### CCPA (California) Compliance
- ⬜ "Do Not Sell My Info" link (if applicable)
- ⬜ Right to know disclosures
- ⬜ Right to delete
- ⬜ Non-discrimination policy
- ⬜ Privacy notice at collection
- ⬜ Respond to requests within 45 days

### General Best Practices
- ⬜ Clear, plain language
- ⬜ Easy to find (footer link)
- ⬜ Mobile-friendly
- ⬜ Version control
- ⬜ Notification of changes
- ⬜ Contact information
- ⬜ Last updated date

---

## Key Sections to Customize

1. **Data Collection** (Section 1)
   - Your actual data collection practices
   - Any additional data types

2. **Third-Party Services** (Section 3)
   - Your actual service providers
   - Correct locations (USA, EU, etc.)

3. **Data Retention** (Section 5)
   - Your actual retention periods
   - Legal requirements for your industry

4. **Rights** (Section 6)
   - Applicable laws (GDPR, CCPA, etc.)
   - Your process for handling requests

5. **Contact Information** (Section 10)
   - Your actual contact details
   - DPO information if required

---

## Privacy by Design

Implement privacy principles in your architecture:

```javascript
// 1. Data Minimization
// Only collect what you need
const userSchema = {
  id: String,
  email: String, // Required
  name: String, // Required
  // DON'T collect: DOB, SSN, phone unless necessary
};

// 2. Purpose Limitation
// Only use data for stated purposes
async function sendMarketingEmail(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  // Check consent first!
  const consent = await prisma.userConsent.findFirst({
    where: { userId, type: 'marketing', granted: true }
  });
  
  if (!consent) {
    logger.warn(`No marketing consent for user ${userId}`);
    return;
  }
  
  await sendEmail(user.email, marketingContent);
}

// 3. Storage Limitation
// Auto-delete old data
cron.schedule('0 0 * * *', async () => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  
  await prisma.storageFile.deleteMany({
    where: {
      isDeleted: true,
      deletedAt: { lt: cutoff }
    }
  });
});

// 4. Accuracy
// Allow users to update their data
fastify.put('/api/user/profile', async (request, reply) => {
  const { name, email } = request.body;
  
  await prisma.user.update({
    where: { id: request.user.id },
    data: { name, email }
  });
});
```

---

## Privacy Tools

| Tool | Purpose | Cost |
|------|---------|------|
| **Termly** | Privacy Policy generator | Free-$200/year |
| **Iubenda** | Privacy compliance platform | €27-€299/month |
| **OneTrust** | Enterprise privacy management | Custom pricing |
| **Osano** | Cookie consent & privacy | $0-$399/month |
| **CookieYes** | Cookie consent banner | $0-$25/month |

---

## Legal Review Cost

- **Template Review**: $500-$1,000
- **Custom Privacy Policy**: $1,000-$2,500
- **Full Privacy Audit**: $3,000-$10,000
- **DPO Service** (if required): $2,000-$10,000/year

---

## Update Schedule

**Review Privacy Policy**:
- ⬜ Annually (minimum)
- ⬜ When adding new features
- ⬜ When changing data practices
- ⬜ When new laws take effect
- ⬜ When third-party services change

**Notify Users of Changes**:
- Email to all users
- Banner on website
- 30 days notice for material changes
- Version control in database

---

## Common Mistakes to Avoid

1. ❌ Using outdated template (pre-GDPR)
2. ❌ Not listing all third-party services
3. ❌ Claiming you "never share data" (you share with service providers)
4. ❌ Not implementing stated practices (saying you delete after 30 days but not doing it)
5. ❌ Not updating when practices change
6. ❌ Making policy too complex (use plain language)
7. ❌ Not providing easy way to exercise rights
8. ❌ Not having lawyer review

---

## Penalties for Non-Compliance

**GDPR**: Up to €20M or 4% of global revenue
**CCPA**: Up to $7,500 per violation
**Reputation Damage**: Loss of user trust

---

## Resources

- **GDPR Text**: https://gdpr-info.eu/
- **CCPA Text**: https://oag.ca.gov/privacy/ccpa
- **Privacy Policy Generator**: https://www.termsfeed.com/privacy-policy-generator/
- **IAPP (Privacy Professionals)**: https://iapp.org/

---

**CRITICAL**: Do NOT launch without lawyer-reviewed Privacy Policy. Privacy laws have serious penalties.

**This template is NOT legal advice. Consult a qualified privacy lawyer in your jurisdiction.**
