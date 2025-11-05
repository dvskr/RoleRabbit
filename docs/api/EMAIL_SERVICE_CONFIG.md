# Email Service Configuration

## Current Setup: Multi-Provider Fallback System

The application uses **three email service options** in priority order:

### 1. **Resend** (Primary) ⭐
- **Service**: [Resend.com](https://resend.com)
- **Type**: API-based email service
- **Requires**: `RESEND_API_KEY` environment variable
- **Best for**: Production, reliable delivery, good API
- **Free tier**: 3,000 emails/month, 100 emails/day

### 2. **SendGrid** (Fallback)
- **Service**: [SendGrid](https://sendgrid.com) (Twilio)
- **Type**: API-based email service  
- **Requires**: `SENDGRID_API_KEY` environment variable
- **Best for**: Production, enterprise-grade
- **Free tier**: 100 emails/day forever

### 3. **SMTP** (Development Fallback)
- **Service**: Direct SMTP (Gmail, Outlook, custom SMTP server)
- **Type**: SMTP protocol via nodemailer
- **Requires**: 
  - `SMTP_HOST` (default: smtp.gmail.com)
  - `SMTP_PORT` (default: 587)
  - `SMTP_USER` (your email)
  - `SMTP_PASS` (your email password/app password)
- **Best for**: Development, testing
- **Note**: Gmail requires "App Password" for SMTP

## How It Works

The `sendEmail()` function tries providers in order:

```javascript
1. Try Resend (if RESEND_API_KEY set)
   ↓ (if fails)
2. Try SendGrid (if SENDGRID_API_KEY set)
   ↓ (if fails)
3. Try SMTP (always available)
```

## Configuration

### Option 1: Use Resend (Recommended)
```bash
# In apps/api/.env
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

Get API key: https://resend.com/api-keys

### Option 2: Use SendGrid
```bash
# In apps/api/.env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
```

Get API key: https://app.sendgrid.com/settings/api_keys

### Option 3: Use SMTP (Development)
```bash
# In apps/api/.env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**For Gmail:**
1. Enable 2-Step Verification
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use app password (not regular password)

## Current Status

Check which service is active by looking at server logs when sending emails:
- `Email sent via Resend to...` → Using Resend
- `Email sent via SendGrid to...` → Using SendGrid  
- `Email sent via SMTP to...` → Using SMTP

## Testing Email Configuration

### Quick Test Script
```javascript
// In Node.js console or test file
const { sendEmail } = require('./utils/emailService');

sendEmail({
  to: 'your-email@example.com',
  subject: 'Test Email',
  html: '<h1>Test</h1>',
  text: 'Test'
}).then(result => {
  console.log('Email sent via:', result.provider);
}).catch(error => {
  console.error('Email failed:', error);
});
```

## Email Types Sent

1. **Welcome Email** - When user registers
2. **Password Reset Email** - Link-based reset (legacy)
3. **OTP Email** - For email/password updates (new)
4. **Email Change Notification** - When email change initiated
5. **Email Change Confirmation** - When email change completed

## Production Recommendations

✅ **Recommended**: Use **Resend** for production
- Simple API
- Good deliverability
- Reasonable pricing
- Modern service

❌ **Not Recommended**: SMTP for production
- Rate limits
- Deliverability issues
- Security concerns
- Maintenance overhead

## Cost Estimate

**Resend Free Tier:**
- 3,000 emails/month
- 100 emails/day
- Enough for ~100 active users/month

**SendGrid Free Tier:**
- 100 emails/day forever
- Good for low-volume apps

**SMTP (Gmail):**
- Free but limited
- 500 emails/day limit
- Not recommended for production

## Setup Instructions

1. **Choose provider** (Resend recommended)
2. **Sign up** and get API key
3. **Add to `.env`** file:
   ```
   RESEND_API_KEY=your-api-key-here
   ```
4. **Restart API server**
5. **Test** by triggering password reset or email update

## Troubleshooting

### Emails Not Sending
1. Check API key is set correctly
2. Check server logs for errors
3. Verify email service account is active
4. Check rate limits (free tiers have limits)

### Gmail SMTP Issues
- Use App Password (not regular password)
- Enable "Less secure app access" OR use App Password
- Check 2-Step Verification is enabled

### Resend Issues
- Verify API key is correct
- Check domain verification (if using custom domain)
- Check account limits

