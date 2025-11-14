# Penetration Testing Guide - RoleRabbit Templates API

## ⚠️ WARNING: Ethical Testing Only

This guide is for **AUTHORIZED SECURITY TESTING ONLY**. Only perform these tests on:
- Your own systems
- Systems you have explicit written permission to test
- Testing/staging environments, not production

Unauthorized testing is illegal and unethical.

---

## Overview

This guide covers penetration testing methodologies for the RoleRabbit Templates API, focusing on OWASP Top 10 vulnerabilities and API-specific security issues.

---

## Prerequisites

### Tools Required

**Essential Tools:**
- **OWASP ZAP** - https://www.zaproxy.org/
- **Burp Suite Community** - https://portswigger.net/burp
- **Postman** - https://www.postman.com/
- **curl** - Command line HTTP client
- **jq** - JSON processor

**Optional Tools:**
- **SQLMap** - SQL injection testing
- **Nikto** - Web server scanner
- **Nmap** - Network scanner
- **Metasploit** - Penetration testing framework

### Setup

```bash
# Install OWASP ZAP
brew install --cask owasp-zap  # macOS
# Or download from https://www.zaproxy.org/

# Install Burp Suite
# Download from https://portswigger.net/burp/communitydownload

# Install command line tools
brew install curl jq sqlmap nikto nmap  # macOS
```

---

## Testing Phases

### Phase 1: Reconnaissance

**Objective:** Gather information about the API

**Tasks:**
1. **Enumerate Endpoints**
   ```bash
   # Manual endpoint discovery
   curl http://localhost:8000/api/templates
   curl http://localhost:8000/api/templates/search
   curl http://localhost:8000/api/templates/stats

   # Check OpenAPI documentation
   curl http://localhost:8000/api/docs
   ```

2. **Identify Technologies**
   ```bash
   # Check headers
   curl -I http://localhost:8000/api/templates

   # Look for:
   # - Server: Fastify, Express, etc.
   # - X-Powered-By headers
   # - Framework-specific headers
   ```

3. **Map Attack Surface**
   - Public endpoints
   - Authenticated endpoints
   - Admin endpoints
   - File upload endpoints
   - Search/filter parameters

**Expected Findings:**
- List of all API endpoints
- Authentication requirements
- Technology stack
- Input parameters

---

### Phase 2: Authentication & Authorization Testing

#### Test 1: Authentication Bypass

**Objective:** Verify authentication cannot be bypassed

**Test Cases:**
```bash
# 1. Access protected endpoint without token
curl http://localhost:8000/api/templates/favorites

# Expected: 401 Unauthorized

# 2. Access with invalid token
curl -H "Authorization: Bearer invalid_token" \
  http://localhost:8000/api/templates/favorites

# Expected: 401 Unauthorized

# 3. Access with expired token
curl -H "Authorization: Bearer expired_token" \
  http://localhost:8000/api/templates/favorites

# Expected: 401 Unauthorized

# 4. Access with manipulated token
# Decode JWT, modify payload, encode
# Expected: 401 Unauthorized or 403 Forbidden
```

#### Test 2: Broken Object Level Authorization (BOLA)

**Objective:** Verify users can't access others' resources

**Test Cases:**
```bash
# 1. Get user A's favorites
TOKEN_A="user_a_token"
curl -H "Authorization: Bearer $TOKEN_A" \
  http://localhost:8000/api/templates/favorites

# Note user A's favorite IDs

# 2. Try to access user A's favorites as user B
TOKEN_B="user_b_token"
curl -H "Authorization: Bearer $TOKEN_B" \
  http://localhost:8000/api/templates/favorites/USER_A_FAVORITE_ID

# Expected: 403 Forbidden

# 3. Try to delete user A's favorite as user B
curl -X DELETE \
  -H "Authorization: Bearer $TOKEN_B" \
  http://localhost:8000/api/templates/favorites/USER_A_FAVORITE_ID

# Expected: 403 Forbidden
```

#### Test 3: Privilege Escalation

**Objective:** Verify regular users can't access admin functions

**Test Cases:**
```bash
# 1. Regular user tries to create template
curl -X POST \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Template","category":"ATS"}' \
  http://localhost:8000/api/templates

# Expected: 403 Forbidden

# 2. Regular user tries to delete template
curl -X DELETE \
  -H "Authorization: Bearer $USER_TOKEN" \
  http://localhost:8000/api/templates/tpl_123

# Expected: 403 Forbidden

# 3. Regular user tries to modify template
curl -X PUT \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Modified"}' \
  http://localhost:8000/api/templates/tpl_123

# Expected: 403 Forbidden
```

---

### Phase 3: Input Validation Testing

#### Test 4: SQL Injection

**Objective:** Test for SQL injection vulnerabilities

**Test Cases:**
```bash
# 1. Test search parameter
curl "http://localhost:8000/api/templates/search?q=test' OR '1'='1"

# Expected: Sanitized, no SQL error

# 2. Test filter parameters
curl "http://localhost:8000/api/templates?category=ATS' OR '1'='1-- "

# Expected: Sanitized or 400 Bad Request

# 3. Test numeric parameters
curl "http://localhost:8000/api/templates?page=1' AND 1=1-- "

# Expected: Sanitized or 400 Bad Request

# 4. Automated testing with SQLMap
sqlmap -u "http://localhost:8000/api/templates/search?q=test" \
  --batch --level=5 --risk=3

# Expected: No SQL injection found
```

#### Test 5: NoSQL Injection

**Objective:** Test for NoSQL injection (if using MongoDB/NoSQL)

**Test Cases:**
```bash
# 1. Test with MongoDB operators
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"category":{"$ne":null}}' \
  http://localhost:8000/api/templates

# Expected: Sanitized or rejected

# 2. Test with regex injection
curl "http://localhost:8000/api/templates/search?q=.*"

# Expected: Escaped properly
```

#### Test 6: Cross-Site Scripting (XSS)

**Objective:** Test for XSS vulnerabilities

**Test Cases:**
```bash
# 1. Reflected XSS in search
curl "http://localhost:8000/api/templates/search?q=<script>alert('XSS')</script>"

# Expected: Sanitized, script tags escaped

# 2. Stored XSS in template name (if writable)
curl -X POST \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"<script>alert(1)</script>","category":"ATS"}' \
  http://localhost:8000/api/templates

# Expected: Rejected or sanitized

# 3. DOM-based XSS
# Test in frontend with payloads like:
# javascript:alert(1)
# <img src=x onerror=alert(1)>
```

#### Test 7: Command Injection

**Objective:** Test for OS command injection

**Test Cases:**
```bash
# 1. Test file-based parameters
curl "http://localhost:8000/api/templates/export?file=test.pdf;whoami"

# Expected: Sanitized or rejected

# 2. Test shell metacharacters
curl "http://localhost:8000/api/templates?sort=name|ls"

# Expected: Sanitized or rejected

# 3. Test backticks
curl "http://localhost:8000/api/templates?category=\`whoami\`"

# Expected: Sanitized or rejected
```

#### Test 8: Path Traversal

**Objective:** Test for directory traversal

**Test Cases:**
```bash
# 1. Test file access
curl "http://localhost:8000/api/templates/preview?file=../../../../etc/passwd"

# Expected: Rejected or sanitized

# 2. Test image access
curl "http://localhost:8000/api/templates/image?path=../../../package.json"

# Expected: Rejected

# 3. URL encoding
curl "http://localhost:8000/api/templates/preview?file=..%2F..%2F..%2Fetc%2Fpasswd"

# Expected: Rejected
```

---

### Phase 4: Business Logic Testing

#### Test 9: Rate Limiting

**Objective:** Verify rate limiting prevents abuse

**Test Cases:**
```bash
# 1. Rapid requests
for i in {1..1000}; do
  curl http://localhost:8000/api/templates/search?q=test &
done

# Expected: 429 Too Many Requests after threshold

# 2. Check rate limit headers
curl -I http://localhost:8000/api/templates

# Expected headers:
# X-RateLimit-Limit: 100
# X-RateLimit-Remaining: 99
# X-RateLimit-Reset: 1234567890
```

#### Test 10: Mass Assignment

**Objective:** Test for unintended field modification

**Test Cases:**
```bash
# 1. Try to set admin fields
curl -X POST \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","isAdmin":true,"role":"ADMIN"}' \
  http://localhost:8000/api/templates/favorites

# Expected: Extra fields ignored or rejected

# 2. Try to modify timestamps
curl -X PUT \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"createdAt":"2020-01-01","updatedAt":"2020-01-01"}' \
  http://localhost:8000/api/templates/preferences

# Expected: Timestamp fields ignored
```

#### Test 11: Business Logic Bypass

**Objective:** Test business rule enforcement

**Test Cases:**
```bash
# 1. Negative pagination
curl "http://localhost:8000/api/templates?page=-1&limit=-10"

# Expected: Default values or 400 Bad Request

# 2. Excessive limit
curl "http://localhost:8000/api/templates?limit=99999"

# Expected: Capped at maximum (e.g., 100)

# 3. Invalid enum values
curl "http://localhost:8000/api/templates?category=INVALID_CATEGORY"

# Expected: 400 Bad Request or ignored
```

---

### Phase 5: API Security Testing

#### Test 12: Excessive Data Exposure

**Objective:** Verify sensitive data isn't leaked

**Test Cases:**
```bash
# 1. Check for sensitive fields in responses
curl http://localhost:8000/api/templates/tpl_123

# Should NOT contain:
# - password hashes
# - API keys
# - Internal IDs
# - Database metadata

# 2. Check error messages
curl http://localhost:8000/api/templates/invalid_id

# Should NOT expose:
# - Stack traces
# - Database queries
# - File paths
# - Server versions
```

#### Test 13: Lack of Resources & Rate Limiting

**Objective:** Test for resource exhaustion

**Test Cases:**
```bash
# 1. Large payload
curl -X POST \
  -H "Content-Type: application/json" \
  -d "$(head -c 100000000 </dev/urandom | base64)" \
  http://localhost:8000/api/templates/search

# Expected: 413 Payload Too Large

# 2. Deep nesting
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"a":{"b":{"c":{"d":{"e":{"f":{"g":"value"}}}}}}}' \
  http://localhost:8000/api/templates

# Expected: Rejected or depth limit enforced
```

#### Test 14: Security Misconfiguration

**Objective:** Check for security misconfigurations

**Test Cases:**
```bash
# 1. Check CORS headers
curl -H "Origin: https://evil.com" \
  -H "Access-Control-Request-Method: GET" \
  -I http://localhost:8000/api/templates

# Expected: Restricted origins only

# 2. Check security headers
curl -I http://localhost:8000/api/templates

# Should have:
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# Content-Security-Policy: ...
# Strict-Transport-Security: max-age=...

# 3. Check for debug endpoints
curl http://localhost:8000/debug
curl http://localhost:8000/admin
curl http://localhost:8000/console

# Expected: 404 Not Found
```

---

### Phase 6: Advanced Testing

#### Test 15: SSRF (Server-Side Request Forgery)

**Objective:** Test for SSRF vulnerabilities

**Test Cases:**
```bash
# 1. Internal network access
curl "http://localhost:8000/api/templates/import?url=http://localhost:8000/api/templates"

# Expected: Rejected or URL validated

# 2. Cloud metadata access
curl "http://localhost:8000/api/templates/import?url=http://169.254.169.254/latest/meta-data/"

# Expected: Rejected

# 3. Port scanning
curl "http://localhost:8000/api/templates/import?url=http://localhost:22"

# Expected: Rejected or timeout
```

#### Test 16: XXE (XML External Entity)

**Objective:** Test for XXE vulnerabilities (if XML is used)

**Test Cases:**
```bash
# 1. External entity injection
curl -X POST \
  -H "Content-Type: application/xml" \
  -d '<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><data>&xxe;</data>' \
  http://localhost:8000/api/templates/import

# Expected: Rejected or XML parsing disabled

# 2. Billion laughs attack
# Use deeply nested entities
# Expected: Rejected or entity expansion limited
```

#### Test 17: Deserialization

**Objective:** Test for insecure deserialization

**Test Cases:**
```bash
# 1. Malicious serialized object (if using serialization)
# Test with Python pickle, Java serialization, etc.

# 2. Prototype pollution (JavaScript)
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"__proto__":{"isAdmin":true}}' \
  http://localhost:8000/api/templates

# Expected: Prototype pollution prevented
```

---

## Automated Scanning

### OWASP ZAP Scan

```bash
# Run automated scan
zap.sh -cmd \
  -autorun security-tests/owasp-zap-config.yaml

# Or GUI mode
zap.sh

# In GUI:
# 1. Set target: http://localhost:8000
# 2. Spider the site
# 3. Active scan
# 4. Review alerts
```

### Burp Suite Scan

```bash
# Start Burp Suite
# Configure browser to use proxy (127.0.0.1:8080)
# Navigate through application
# Send requests to Scanner
# Run active scan
# Review issues
```

---

## Reporting

### Severity Levels

**Critical:**
- SQL injection
- Authentication bypass
- Remote code execution
- Sensitive data exposure

**High:**
- XSS
- CSRF
- Broken access control
- Command injection

**Medium:**
- Missing security headers
- Information disclosure
- Weak encryption

**Low:**
- Verbose error messages
- Missing rate limiting
- Weak password policy

### Report Template

```markdown
## Vulnerability: [Name]

**Severity:** Critical/High/Medium/Low

**Location:** GET /api/templates/search

**Description:**
The search parameter is vulnerable to SQL injection...

**Steps to Reproduce:**
1. Navigate to /api/templates/search
2. Enter payload: test' OR '1'='1
3. Observe SQL error in response

**Impact:**
Attacker can read/modify database, potentially gaining full access...

**Remediation:**
Use parameterized queries or ORM to prevent SQL injection.

**Affected Code:**
```javascript
// Before
const query = `SELECT * FROM templates WHERE name LIKE '%${req.query.q}%'`;

// After
const query = `SELECT * FROM templates WHERE name LIKE $1`;
const params = [`%${req.query.q}%`];
```

**References:**
- OWASP SQL Injection: https://owasp.org/www-community/attacks/SQL_Injection
- CWE-89: https://cwe.mitre.org/data/definitions/89.html
```

---

## Best Practices

1. **Test in isolated environment** - Never test production
2. **Document findings** - Keep detailed notes
3. **Report responsibly** - Follow responsible disclosure
4. **Retest after fixes** - Verify vulnerabilities are fixed
5. **Keep tools updated** - Use latest versions
6. **Stay legal** - Only test authorized systems
7. **Back up data** - Some tests may be destructive
8. **Use VPN** - For additional privacy
9. **Clean up** - Remove test accounts/data
10. **Educate team** - Share findings to improve security

---

## Resources

### OWASP Resources
- **OWASP Top 10:** https://owasp.org/www-project-top-ten/
- **API Security Top 10:** https://owasp.org/www-project-api-security/
- **Testing Guide:** https://owasp.org/www-project-web-security-testing-guide/

### Tools
- **OWASP ZAP:** https://www.zaproxy.org/
- **Burp Suite:** https://portswigger.net/burp
- **SQLMap:** https://sqlmap.org/
- **Metasploit:** https://www.metasploit.com/

### Learning
- **HackTheBox:** https://www.hackthebox.com/
- **PortSwigger Academy:** https://portswigger.net/web-security
- **OWASP WebGoat:** https://owasp.org/www-project-webgoat/

---

**Last Updated:** November 14, 2025
**Maintained By:** Security Team

**⚠️ REMINDER: Only test authorized systems!**
