# Security Audit Checklist (Section 5.7)

Comprehensive security testing and remediation guide for RoleRabbit.

## Automated Security Scanning

### Tools Setup

```bash
# Install security scanning tools
npm install --save-dev @microsoft/eslint-plugin-security
npm install -g snyk
npm install -g retire

# Install OWASP ZAP (download from https://www.zaproxy.org/)
# Or use Docker
docker pull owasp/zap2docker-stable
```

### Running Scans

**1. Dependency Scanning**

```bash
# npm audit
npm audit --audit-level=high

# Snyk
snyk test
snyk monitor

# Check for outdated packages
npm outdated
```

**2. Retire.js (Check for vulnerable JavaScript libraries)**

```bash
retire --path ./apps/web --outputformat json
```

**3. OWASP ZAP Scan**

```bash
# Start ZAP in daemon mode
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t https://staging.rolerabbit.com \
  -r zap-report.html

# Or use ZAP GUI for manual testing
```

**4. ESLint Security Plugin**

```bash
npx eslint . --ext .js,.ts,.tsx --plugin security
```

## Manual Security Testing

### SQL Injection Checklist

- [x] Portfolio title field
- [x] Portfolio description field
- [x] Subdomain check
- [x] Search queries
- [x] Analytics date filters
- [x] All database queries use parameterized statements
- [x] ORM (Drizzle/Prisma) is used consistently
- [x] No raw SQL queries with string concatenation

### XSS Checklist

- [x] Portfolio title
- [x] Portfolio subtitle
- [x] Section content (About, Projects, etc.)
- [x] Custom HTML fields
- [x] URLs in social links
- [x] Markdown content
- [x] User-uploaded filenames
- [x] Error messages
- [x] All output is HTML-escaped
- [x] Content-Security-Policy headers set
- [x] React's built-in XSS protection utilized

### CSRF Checklist

- [x] CSRF tokens on all state-changing operations
- [x] POST/PUT/DELETE require CSRF token
- [x] SameSite cookie attribute set
- [x] Origin/Referer headers validated
- [x] Double-submit cookie pattern implemented

### Authentication Checklist

- [x] Passwords hashed with bcrypt (12+ rounds)
- [x] JWT tokens properly signed and verified
- [x] Token expiration enforced (< 24 hours)
- [x] Refresh tokens used for long sessions
- [x] Failed login attempts rate limited
- [x] Account lockout after N failed attempts
- [x] Password reset tokens expire (1 hour)
- [x] Multi-factor authentication supported (optional)

### Authorization Checklist

- [x] User ownership verified on all operations
- [x] Portfolio access requires user_id match
- [x] Admin endpoints protected by role check
- [x] No Insecure Direct Object References (IDOR)
- [x] API returns 403 for unauthorized access
- [x] Error messages don't leak information

### Sensitive Data Exposure Checklist

- [x] Passwords never in logs
- [x] Passwords never in responses
- [x] API keys not exposed in client code
- [x] Environment variables for secrets
- [x] Secrets not committed to git
- [x] HTTPS enforced in production
- [x] Strict-Transport-Security header set
- [x] Database credentials encrypted at rest

## Penetration Testing

### Burp Suite Testing

1. **Setup**
   - Configure browser to use Burp proxy (localhost:8080)
   - Import SSL certificate
   - Navigate to https://staging.rolerabbit.com

2. **Active Scan**
   - Run automated scan on all endpoints
   - Review findings
   - Test identified vulnerabilities manually

3. **Manual Testing**
   - Test authentication bypass
   - Test privilege escalation
   - Test business logic flaws

### Common Vulnerabilities Checklist

- [ ] **A01:2021 – Broken Access Control**
  - Tested vertical privilege escalation
  - Tested horizontal privilege escalation
  - Tested IDOR vulnerabilities

- [ ] **A02:2021 – Cryptographic Failures**
  - All data in transit encrypted (HTTPS)
  - Passwords hashed with strong algorithm
  - Sensitive data encrypted at rest

- [ ] **A03:2021 – Injection**
  - SQL injection tested and prevented
  - Command injection tested
  - LDAP injection (if applicable)

- [ ] **A04:2021 – Insecure Design**
  - Rate limiting implemented
  - Business logic reviewed
  - Abuse cases considered

- [ ] **A05:2021 – Security Misconfiguration**
  - Default credentials changed
  - Error messages don't reveal stack traces
  - Unnecessary features disabled
  - Security headers configured

- [ ] **A06:2021 – Vulnerable Components**
  - All dependencies up to date
  - No known vulnerable packages
  - npm audit passes

- [ ] **A07:2021 – Authentication Failures**
  - Session management secure
  - Password policy enforced
  - MFA available

- [ ] **A08:2021 – Software and Data Integrity Failures**
  - Code signing implemented
  - Subresource Integrity (SRI) for CDN
  - Supply chain attacks mitigated

- [ ] **A09:2021 – Security Logging Failures**
  - Security events logged
  - Logs monitored
  - Incident response plan exists

- [ ] **A10:2021 – Server-Side Request Forgery**
  - URL validation on all external requests
  - Whitelist of allowed domains
  - Network segmentation

## Security Headers

Ensure all pages include these security headers:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-{random}'; style-src 'self' 'unsafe-inline';
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

## Incident Response

### Security Incident Procedure

1. **Detection**
   - Monitor Sentry for unusual errors
   - Check logs for suspicious patterns
   - Alert on multiple failed logins

2. **Containment**
   - Revoke compromised credentials
   - Block malicious IPs
   - Disable affected features

3. **Investigation**
   - Review access logs
   - Identify scope of breach
   - Preserve evidence

4. **Remediation**
   - Patch vulnerabilities
   - Force password reset (if needed)
   - Deploy fixes

5. **Communication**
   - Notify affected users
   - Update status page
   - Document incident

## Remediation Priority

**Critical** (Fix immediately):
- SQL Injection
- Authentication bypass
- Sensitive data exposure
- RCE vulnerabilities

**High** (Fix within 7 days):
- XSS vulnerabilities
- CSRF vulnerabilities
- Authorization bypass
- Insecure dependencies

**Medium** (Fix within 30 days):
- Missing security headers
- Information disclosure
- Weak password policy

**Low** (Fix when possible):
- Non-security bugs
- Performance issues
- UI improvements

## Compliance

- [ ] OWASP Top 10 addressed
- [ ] GDPR compliance (if handling EU data)
- [ ] Security headers configured
- [ ] Regular security audits scheduled
- [ ] Penetration testing performed annually

## Security Contact

Report security vulnerabilities to: security@rolerabbit.com

Do not disclose publicly until patch is available.
