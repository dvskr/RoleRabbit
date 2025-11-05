# Marketing Email Implementation Guide

## Overview

The email system now supports a two-tier notification system:
- **Security Emails**: Always sent (OTP, password reset, email change)
- **Marketing Emails**: Respect user preferences (product updates, tips, features)

## Email Types

### Security Emails (Always Sent)
These emails **always** bypass user preferences:
- ✅ OTP verification codes
- ✅ Password reset emails
- ✅ Email change notifications
- ✅ Email change confirmations

### Marketing Emails (Respect Preferences)
These emails check `user.emailNotifications` preference:
- 📧 Welcome emails
- 📧 Product updates
- 📧 Tips and tutorials
- 📧 New feature announcements
- 📧 Weekly/monthly digests

## Usage

### Sending Marketing Emails

```javascript
const { sendMarketingEmail } = require('./utils/emailService');

// Send marketing email
await sendMarketingEmail({
  to: user.email,
  subject: 'New Feature: AI Resume Builder',
  html: '<h1>Check out our new feature!</h1>',
  text: 'Check out our new feature!',
  userId: user.id, // Required - checks preferences
  prisma: prisma,  // Optional - pass existing instance
  from: 'updates@rolerabbit.com' // Optional
});
```

### Checking Preferences Manually

```javascript
const { shouldSendMarketingEmail } = require('./utils/emailService');

const canSend = await shouldSendMarketingEmail(userId, prisma);
if (canSend) {
  // Send marketing email
}
```

## User Preferences

Users can control marketing emails via:
- **UI**: Preferences & Security → "Product Updates & Tips" toggle
- **Database**: `user.emailNotifications` (Boolean, default: `true`)

## Email Functions

### `sendEmail(options)`
Generic email sending function with preference checking.

**Options:**
- `to` (string, required): Recipient email
- `subject` (string, required): Email subject
- `html` (string, required): HTML content
- `text` (string, required): Plain text content
- `from` (string, optional): From address
- `isSecurityEmail` (boolean, default: `false`): If `true`, always sends
- `userId` (string, optional): User ID for preference checking
- `prisma` (PrismaClient, optional): Prisma instance

### `sendMarketingEmail(options)`
Convenience function for marketing emails.

**Options:**
- `to` (string, required): Recipient email
- `subject` (string, required): Email subject
- `html` (string, required): HTML content
- `text` (string, required): Plain text content
- `userId` (string, required): User ID for preference checking
- `prisma` (PrismaClient, optional): Prisma instance
- `from` (string, optional): From address

### `sendWelcomeEmail(user, prisma)`
Sends welcome email (respects preferences).

### `sendOTPEmail(email, otp, purpose)`
Sends OTP email (always sends - security).

### `sendPasswordResetEmail(email, resetToken)`
Sends password reset email (always sends - security).

## Examples

### Example 1: Product Update Email

```javascript
const { sendMarketingEmail } = require('./utils/emailService');

async function sendProductUpdate(userId, prisma) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  await sendMarketingEmail({
    to: user.email,
    subject: 'New Feature: Resume Templates',
    html: `
      <h1>New Resume Templates Available!</h1>
      <p>Check out our new professional templates...</p>
    `,
    text: 'New Resume Templates Available! Check them out...',
    userId: user.id,
    prisma: prisma
  });
}
```

### Example 2: Weekly Digest

```javascript
async function sendWeeklyDigest(userId, prisma) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  // Check if user wants emails
  const { shouldSendMarketingEmail } = require('./utils/emailService');
  const canSend = await shouldSendMarketingEmail(userId, prisma);
  
  if (!canSend) {
    logger.info(`Skipping weekly digest for ${user.email}`);
    return;
  }
  
  // Build digest content...
  await sendMarketingEmail({
    to: user.email,
    subject: 'Your Weekly RoleReady Digest',
    html: digestHtml,
    text: digestText,
    userId: user.id,
    prisma: prisma
  });
}
```

## Testing

To test marketing email preferences:

1. **Enable notifications** (default):
   ```sql
   UPDATE users SET "emailNotifications" = true WHERE email = 'test@example.com';
   ```
   - Marketing emails will be sent ✅

2. **Disable notifications**:
   ```sql
   UPDATE users SET "emailNotifications" = false WHERE email = 'test@example.com';
   ```
   - Marketing emails will be skipped ✅
   - Security emails still sent ✅

## Important Notes

1. **Security emails always send** - OTP, password reset, email change emails bypass preferences
2. **Default is enabled** - New users have `emailNotifications = true` by default
3. **User control** - Users can toggle via UI in Preferences & Security
4. **Graceful handling** - If preference check fails, defaults to sending (failsafe)

## Future Enhancements

- [ ] Email frequency preferences (immediate, daily, weekly)
- [ ] Category-based preferences (product updates, tips, announcements)
- [ ] Unsubscribe link in marketing emails
- [ ] Email analytics and tracking

