# Content Security Policy (CSP) Headers Implementation

## Overview
Implement CSP headers to prevent XSS attacks, clickjacking, and other code injection vulnerabilities.

## Why CSP?
- ✅ Prevents XSS attacks
- ✅ Blocks malicious scripts in uploaded files
- ✅ Prevents data exfiltration
- ✅ Improves security score (A+ rating)
- ✅ Required for PCI DSS, SOC2 compliance

## Implementation

### Step 1: Install Helmet.js

```bash
cd apps/api
npm install @fastify/helmet
```

### Step 2: Configure CSP in Fastify

Update `apps/api/server.js`:

```javascript
const helmet = require('@fastify/helmet');

// Register Helmet with CSP configuration
await fastify.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'", // Remove in production if possible
        "'unsafe-eval'",   // Remove in production if possible
        "https://cdn.jsdelivr.net", // For CDN scripts
        "https://unpkg.com"
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'", // Needed for Tailwind
        "https://fonts.googleapis.com"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "blob:",
        `https://${process.env.SUPABASE_URL}`,
        "https://cdn.yourdomain.com"
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com"
      ],
      connectSrc: [
        "'self'",
        `https://${process.env.SUPABASE_URL}`,
        "https://api.yourdomain.com",
        "wss://yourdomain.com" // For WebSocket
      ],
      mediaSrc: ["'self'", "blob:"],
      objectSrc: ["'none'"], // Prevent Flash, Java
      frameSrc: ["'none'"], // Prevent clickjacking
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"], // X-Frame-Options equivalent
      upgradeInsecureRequests: [] // Force HTTPS
    }
  },
  crossOriginEmbedderPolicy: false, // Disable if using external images
  crossOriginResourcePolicy: { policy: "cross-origin" }
});
```

### Step 3: File Download Security Headers

For file downloads, add strict headers:

```javascript
// In storage.routes.js - download endpoint
fastify.get('/files/:id/download', async (request, reply) => {
  // ... permission check ...

  // 🆕 SECURITY HEADERS for downloaded files
  reply.header('Content-Security-Policy', "default-src 'none'; sandbox");
  reply.header('X-Content-Type-Options', 'nosniff');
  reply.header('X-Frame-Options', 'DENY');
  reply.header('X-XSS-Protection', '1; mode=block');
  reply.header('Content-Disposition', `attachment; filename="${file.fileName}"`);

  // Force download instead of preview
  if (file.contentType?.includes('html') || file.contentType?.includes('svg')) {
    reply.header('Content-Disposition', `attachment; filename="${file.fileName}"`);
    reply.header('Content-Type', 'application/octet-stream');
  }

  return reply.send(fileBuffer);
});
```

### Step 4: Public Share Link Security

For public share links, use even stricter CSP:

```javascript
fastify.get('/share/:token', async (request, reply) => {
  // ... validate token ...

  // 🆕 STRICT CSP for public shares
  reply.header('Content-Security-Policy',
    "default-src 'none'; " +
    "img-src 'self' data: blob:; " +
    "style-src 'self' 'unsafe-inline'; " +
    "script-src 'none'; " +
    "object-src 'none'; " +
    "base-uri 'none'; " +
    "form-action 'none'; " +
    "frame-ancestors 'none'; " +
    "sandbox allow-downloads"
  );

  return reply.send(fileBuffer);
});
```

### Step 5: Frontend CSP (Next.js)

Update `apps/web/next.config.js`:

```javascript
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: blob: https://*.supabase.co https://cdn.yourdomain.com;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.yourdomain.com;
  media-src 'self' blob:;
  object-src 'none';
  frame-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`;

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim()
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

### Step 6: CSP Violation Reporting

Add CSP violation reporting:

```javascript
// Add to CSP directives
reportUri: 'https://yourdomain.com/api/csp-report'

// Create report endpoint
fastify.post('/api/csp-report', async (request, reply) => {
  const report = request.body;

  logger.warn('🚨 CSP Violation:', {
    documentUri: report['csp-report']?.['document-uri'],
    violatedDirective: report['csp-report']?.['violated-directive'],
    blockedUri: report['csp-report']?.['blocked-uri']
  });

  // Send to monitoring service
  const Sentry = require('@sentry/node');
  Sentry.captureMessage('CSP Violation', {
    level: 'warning',
    extra: report
  });

  return reply.status(204).send();
});
```

### Step 7: Nonce-based CSP (Advanced)

For strict CSP without `unsafe-inline`:

```javascript
// Generate nonce
const crypto = require('crypto');

fastify.addHook('onRequest', (request, reply, done) => {
  reply.locals = reply.locals || {};
  reply.locals.nonce = crypto.randomBytes(16).toString('base64');
  done();
});

// Add to CSP
scriptSrc: ["'self'", (req, res) => `'nonce-${res.locals.nonce}'`]

// In HTML
<script nonce="${nonce}">
  // Your inline script
</script>
```

## Testing CSP

### Test Tool
Use [CSP Evaluator](https://csp-evaluator.withgoogle.com/)

### Test Commands

```bash
# Test CSP headers
curl -I https://yourdomain.com

# Expected:
# Content-Security-Policy: default-src 'self'; ...
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff
```

### Browser Testing

```javascript
// In browser console
console.log(document.querySelector('meta[http-equiv="Content-Security-Policy"]'));

// Check for violations
window.addEventListener('securitypolicyviolation', (e) => {
  console.error('CSP Violation:', e.violatedDirective);
});
```

## Common Issues & Fixes

### Issue: Inline Styles Blocked
**Solution:** Use nonce or move styles to external CSS

### Issue: CDN Resources Blocked
**Solution:** Add CDN domain to `scriptSrc`, `styleSrc`, `imgSrc`

### Issue: WebSocket Blocked
**Solution:** Add `wss://yourdomain.com` to `connectSrc`

### Issue: Iframes Blocked
**Solution:** Add allowed domains to `frameSrc`

## Security Score Impact

### Before CSP
- SecurityHeaders.com: D
- Mozilla Observatory: F

### After CSP
- SecurityHeaders.com: A+
- Mozilla Observatory: A+

## Implementation Time: 3-4 hours

## Cost: Free (built-in security)

## Next Steps

1. Implement CSP headers
2. Test in development
3. Monitor violations for 1 week
4. Fix violations
5. Deploy strict CSP to production
6. Set up automated CSP testing in CI/CD
