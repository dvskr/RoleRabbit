# 2FA Quick Test Guide

## Prerequisites
- API server running on http://localhost:5000
- PostgreSQL database running
- Authenticator app installed (Google Authenticator or Authy)

## Quick Test Commands

### Step 1: Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@roleready.com","password":"Test1234!","name":"Test"}'
```

### Step 2: Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@roleready.com","password":"Test1234!"}' \
  -c cookies.txt
```

### Step 3: Setup 2FA
```bash
curl -X POST http://localhost:5000/api/auth/2fa/setup \
  -b cookies.txt
```

**Copy the `secret` and `qrCode` from response**

### Step 4: Enable 2FA
1. Open QR code URL in browser or scan with app
2. Get 6-digit code from authenticator app
3. Run:
```bash
curl -X POST http://localhost:5000/api/auth/2fa/enable \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"token":"123456","secret":"YOUR_SECRET","backupCodes":["CODE1","CODE2",...]}'
```

### Step 5: Test Login (should require 2FA)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@roleready.com","password":"Test1234!"}'
```

**Expected**: `{"success":true,"requires2FA":true}`

### Step 6: Verify 2FA Token
```bash
curl -X POST http://localhost:5000/api/auth/2fa/verify \
  -H "Content-Type: application/json" \
  -d '{"email":"test@roleready.com","twoFactorToken":"123456"}'
```

**Expected**: `{"success":true,"verified":true}`

## Success Criteria
✅ All 7 tasks working
✅ TOTP codes work
✅ Backup codes work
✅ Login enforces 2FA
✅ Can enable/disable

## Full Guide
See `docs/2FA_TESTING_GUIDE.md` for complete documentation.

