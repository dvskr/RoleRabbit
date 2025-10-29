# 2FA Testing Guide - Complete Verification

## Prerequisites

1. **Database**: PostgreSQL running with migrated schema
2. **API Server**: Running on http://localhost:5000
3. **Tools Needed**: Postman, curl, or browser console
4. **Authenticator App**: Google Authenticator or Authy

## Step-by-Step Testing

### 1. Setup & Registration

```bash
# 1. Register a test user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@roleready.com",
    "password": "Test1234!",
    "name": "Test User"
  }'

# 2. Login to get auth token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@roleready.com",
    "password": "Test1234!"
  }' \
  -c cookies.txt
```

**Expected Response**: Login successful, cookies saved

---

### 2. Generate 2FA Setup (Task 1 & 2)

```bash
# Generate 2FA secret and QR code
curl -X POST http://hal_st_host:5000/api/auth/2fa/setup \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

**Expected Response**:
```json
{
  "success": true,
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANS...",
  "backupCodes": [
    "A1B2C3D4",
    "E5F6G7H8",
    ...
  ],
  "manualEntryKey": "JBSWY3DPEHPK3PXP"
}
```

**Verification**:
- ✅ Secret is generated
- ✅ QR code is a valid data URL
- ✅ 10 backup codes provided
- ✅ Manual entry key provided

---

### 3. Scan QR Code & Test TOTP (Task 1 & 2)

1. Copy the `qrCode` data URL
2. Open in a new browser tab or use `echo "<qrCode>" | base64 -d > qrcode.png`
3. Scan with Google Authenticator or Authy
4. Get the 6-digit code from your app

**Verification**:
- ✅ QR code scans successfully
- ✅ Authenticator app shows "RoleReady (test@roleready.com)"
- ✅ Generates 6-digit codes every 30 seconds

---

### 4. Enable 2FA (Task 3)

```bash
# Enable 2FA with the code from your authenticator app
curl -X POST http://localhost:5000/api/auth/2fa/enable \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "token": "123456",
    "secret": "JBSWY3DPEHPK3PXP",
    "backupCodes": ["A1B2C3D4", "E5F6G7H8", ...]
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "message": "2FA enabled successfully",
  "backupCodes": [...]
}
```

**Verification**:
- ✅ 2FA enabled successfully
- ✅ Backup codes returned
- ✅ Check your email for confirmation (if email service configured)

---

### 5. Test Login with 2FA (Task 6)

```bash
# First login attempt (password only)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@roleready.com",
    "password": "Test1234!"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "requires2FA": true,
  "message": "2FA verification required",
  "userId": "clx..."
}
```

**Verification**:
- ✅ Login returns `requires2FA: true`
- ✅ Does NOT grant full access
- ✅ No JWT token provided

---

### 6. Verify 2FA Token (Task 6)

```bash
# Verify with TOTP code
curl -X POST http://localhost:5000/api/auth/2fa/verify \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@roleready.com",
    "twoFactorToken": "123456"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "verified": true
}
```

**Verification**:
- ✅ Valid TOTP code verified
- ✅ Invalid codes rejected (test with wrong code)

---

### 7. Test Backup Codes (Task 5)

```bash
# Test with a backup code instead
curl -X POST http://localhost:5000/api/auth/2fa/verify \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@roleready.com",
    "twoFactorToken": "A1B2C3D4"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "verified": true
}
```

**Verification**:
- ✅ Backup code works
- ✅ Same backup code cannot be used twice
- ✅ Used backup code removed from list

---

### 8. Test Invalid Codes

```bash
# Test with wrong code
curl -X POST http://localhost:5000/api/auth/2fa/verify \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@roleready.com",
    "twoFactorToken": "999999"
  }'
```

**Expected Response**:
```json
{
  "error": "Invalid 2FA token or backup code"
}
```

**Verification**:
- ✅ Invalid codes rejected
- ✅ Returns error message

---

### 9. Get 2FA Status

```bash
# Check 2FA status
curl -X GET http://localhost:5000/api/auth/2fa/status \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

**Expected Response**:
```json
{
  "enabled": true,
  "hasBackupCodes": true
}
```

---

### 10. Disable 2FA (Task 6)

```bash
# Disable 2FA (requires current password + 2FA token)
curl -X POST http://localhost:5000/api/auth/2fa/disable \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "password": "Test1234!",
    "twoFactorToken": "123456"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "message": "2FA disabled successfully"
}
```

**Verification**:
- ✅ 2FA disabled
- ✅ Login now works without 2FA
- ✅ Email confirmation sent

---

## Complete Flow Test

### Full End-to-End Test Script

```bash
#!/bin/bash

API_URL="http://localhost:5000"
EMAIL="test@roleready.com"
PASSWORD="Test1234!"

echo "=== 2FA Complete Testing ==="
echo ""

# 1. Register user
echo "1. Registering user..."
curl -X POST $API_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"name\":\"Test User\"}"

echo -e "\n2. Logging in..."
# 2. Login
curl -X POST $API_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" \
  -c cookies.txt

echo -e "\n3. Setting up 2FA..."
# 3. Setup 2FA
SETUP_RESPONSE=$(curl -X POST $API_URL/api/auth/2fa/setup \
  -H "Content-Type: application/json" \
  -b cookies.txt)

echo $SETUP_RESPONSE
# Extract secret from response (use jq in real test)
SECRET=$(echo $SETUP_RESPONSE | jq -r '.secret')
BACKUP_CODES=$(echo $SETUP_RESPONSE | jq -r '.backupCodes')

echo -e "\n4. QR Code received! Scan with authenticator app."
echo "   Secret: $SECRET"
echo "   Backup Codes: $BACKUP_CODES"

read -p "Enter 6-digit code from authenticator: " TOTP_CODE

echo -e "\n5. Enabling 2FA..."
# 5. Enable 2FA
curl -X POST $API_URL/api/auth/2fa/enable \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d "{\"token\":\"$TOTP_CODE\",\"secret\":\"$SECRET\",\"backupCodes\":$BACKUP_CODES}"

echo -e "\n6. Testing login with 2FA..."
# 6. Test login (should require 2FA)
curl -X POST $API_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}"

read -p "Enter 6-digit code again: " TOTP_CODE2

echo -e "\n7. Verifying 2FA code..."
# 7. Verify 2FA
curl -X POST $API_URL/api/auth/2fa/verify \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"twoFactorToken\":\"$TOTP_CODE2\"}"

echo -e "\n=== All tests complete! ==="
```

## Frontend Testing

### Test with Browser Console

```javascript
// 1. Login (without 2FA)
const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'test@roleready.com', password: 'Test1234!' }),
  credentials: 'include'
});
const loginData = await loginResponse.json();

// 2. If requires2FA is true, show 2FA input
if (loginData.requires2FA) {
  const totpCode = prompt('Enter 6-digit code:');
  
  // 3. Verify 2FA
  const verifyResponse = await fetch('http://localhost:5000/api/auth/2fa/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      email: 'test@roleready.com', 
      twoFactorToken: totpCode 
    })
  });
  const verifyData = await verifyResponse.json();
  console.log('2FA Verification:', verifyData);
}
```

## Manual Database Verification

```sql
-- Check if 2FA is enabled
SELECT email, twoFactorEnabled, twoFactorSecret, twoFactorBackupCodes 
FROM users 
WHERE email = 'test@roleready.com';
```

## Success Criteria

✅ **All 7 Tasks Verified**:
1. Secret generation works
2. TOTP codes work with authenticator apps
3. Email notifications sent (if configured)
4. QR code renders and scans correctly
5. Backup codes generated and work
6. Login requires 2FA when enabled
7. Can enable/disable 2FA successfully

## Troubleshooting

**Issue**: "Invalid credentials"
- Check password is correct
- Check user exists in database

**Issue**: "Invalid 2FA token"
- Check code is current (not expired)
- Ensure authenticator app clock is synced
- Try using a backup code instead

**Issue**: "2FA not enabled"
- Call setup endpoint first
- Check database has twoFactorEnabled = true

**Issue**: Routes not found
- Verify server.js has 2FA routes registered
- Check server is running on correct port

## Quick Test Checklist

- [ ] Can register new user
- [ ] Can login without 2FA
- [ ] Can generate 2FA setup
- [ ] QR code displays correctly
- [ ] Authenticator app generates codes
- [ ] Can enable 2FA with valid code
- [ ] Login requires 2FA when enabled
- [ ] Can verify with TOTP code
- [ ] Can verify with backup code
- [ ] Invalid codes are rejected
- [ ] Can disable 2FA
- [ ] Login works after disabling

## Next Steps

Once testing passes, integrate with frontend:
1. Update SecurityTab.tsx to call real APIs
2. Add 2FA prompt to login page
3. Display QR code from response
4. Save backup codes for user

