# Security Testing Guide

## Quick Start

### 1. Automated Test Suite

Run the automated test suite to verify all security endpoints:

```bash
# Set test credentials (optional)
export TEST_USER_EMAIL="your-email@example.com"
export TEST_USER_PASSWORD="YourPassword123!"
export API_URL="http://localhost:3001"

# Run tests
npm run test:security
```

Or directly:
```bash
node test-security-endpoints.js
```

### 2. Check OTP Tokens in Database

Check OTP tokens for debugging:

```bash
# Check all recent OTP tokens
npm run check:otp

# Check OTP tokens for specific user
npm run check:otp <userId>
```

Or directly:
```bash
node scripts/check-otp-tokens.js [userId]
```

---

## Manual Testing Checklist

### ✅ Test 1: Password Reset Flow (OTP-based)

**Scenario:** User forgot password and needs to reset it

1. **Login** (to get authenticated session)
   ```bash
   curl -X POST http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com", "password": "password123"}' \
     -c cookies.txt
   ```

2. **Request OTP for Password Reset**
   ```bash
   curl -X POST http://localhost:3001/api/auth/send-otp \
     -H "Content-Type: application/json" \
     -b cookies.txt \
     -d '{"purpose": "password_reset"}'
   ```
   ✅ **Verify:** Status 200, OTP sent to email

3. **Check OTP in Database**
   ```bash
   npm run check:otp
   ```
   ✅ **Verify:** New OTP token created with purpose 'password_reset'

4. **Reset Password with OTP**
   ```bash
   curl -X POST http://localhost:3001/api/auth/verify-otp-reset-password \
     -H "Content-Type: application/json" \
     -b cookies.txt \
     -d '{
       "otp": "123456",
       "newPassword": "NewPassword123!",
       "confirmPassword": "NewPassword123!"
     }'
   ```
   ✅ **Verify:** Status 200, password reset successfully

5. **Verify OTP Used**
   ```bash
   npm run check:otp
   ```
   ✅ **Verify:** OTP marked as `used: true`

6. **Try to Use Same OTP Again**
   ```bash
   curl -X POST http://localhost:3001/api/auth/verify-otp-reset-password \
     -H "Content-Type: application/json" \
     -b cookies.txt \
     -d '{
       "otp": "123456",
       "newPassword": "AnotherPassword123!",
       "confirmPassword": "AnotherPassword123!"
     }'
   ```
   ✅ **Verify:** Status 400, "Invalid or expired OTP"

---

### ✅ Test 2: Email Update Flow (Two-Step Verification)

**Scenario:** User wants to change their login email

1. **Login**
   ```bash
   curl -X POST http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "old@example.com", "password": "password123"}' \
     -c cookies.txt
   ```

2. **Step 1: Request OTP to Current Email**
   ```bash
   curl -X POST http://localhost:3001/api/auth/send-otp \
     -H "Content-Type: application/json" \
     -b cookies.txt \
     -d '{"purpose": "email_update"}'
   ```
   ✅ **Verify:** Status 200, OTP sent to current email

3. **Step 2: Verify Current Email OTP**
   ```bash
   curl -X POST http://localhost:3001/api/auth/verify-otp-update-email \
     -H "Content-Type: application/json" \
     -b cookies.txt \
     -d '{
       "otp": "123456",
       "newEmail": "new@example.com",
       "step": "verify_current"
     }'
   ```
   ✅ **Verify:** Status 200, "Current email verified. Please verify your new email address."
   ✅ **Verify:** Notification sent to old email
   ✅ **Verify:** Pending email change stored (check server logs)

4. **Step 3: Request OTP to New Email**
   ```bash
   curl -X POST http://localhost:3001/api/auth/send-otp-to-new-email \
     -H "Content-Type: application/json" \
     -b cookies.txt \
     -d '{"newEmail": "new@example.com"}'
   ```
   ✅ **Verify:** Status 200, OTP sent to new email

5. **Step 4: Verify New Email OTP**
   ```bash
   curl -X POST http://localhost:3001/api/auth/verify-otp-update-email \
     -H "Content-Type: application/json" \
     -b cookies.txt \
     -d '{
       "otp": "654321",
       "newEmail": "new@example.com",
       "step": "verify_new"
     }'
   ```
   ✅ **Verify:** Status 200, "Email updated successfully"
   ✅ **Verify:** Email changed in database
   ✅ **Verify:** Confirmation emails sent to both old and new email

6. **Verify Login with New Email**
   ```bash
   curl -X POST http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "new@example.com", "password": "password123"}'
   ```
   ✅ **Verify:** Status 200, login successful with new email

---

### ✅ Test 3: Password Change (Current Password Required)

**Scenario:** User knows current password and wants to change it

1. **Login**
   ```bash
   curl -X POST http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com", "password": "oldpassword123"}' \
     -c cookies.txt
   ```

2. **Change Password**
   ```bash
   curl -X POST http://localhost:3001/api/auth/password/change \
     -H "Content-Type: application/json" \
     -b cookies.txt \
     -d '{
       "currentPassword": "oldpassword123",
       "newPassword": "NewPassword123!",
       "confirmPassword": "NewPassword123!"
     }'
   ```
   ✅ **Verify:** Status 200, password changed successfully

3. **Try Login with Old Password**
   ```bash
   curl -X POST http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com", "password": "oldpassword123"}'
   ```
   ✅ **Verify:** Status 401, login failed

4. **Login with New Password**
   ```bash
   curl -X POST http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com", "password": "NewPassword123!"}'
   ```
   ✅ **Verify:** Status 200, login successful

---

## Security Edge Cases to Test

### ❌ Invalid OTP
- [ ] Wrong OTP code → Should fail
- [ ] Expired OTP (wait 10+ minutes) → Should fail
- [ ] Already used OTP → Should fail
- [ ] OTP for wrong purpose → Should fail

### ❌ Email Update Edge Cases
- [ ] Try Step 2 without Step 1 → Should fail
- [ ] Use wrong new email in Step 2 → Should fail
- [ ] Try to change to existing email → Should fail
- [ ] Invalid email format → Should fail

### ❌ Password Edge Cases
- [ ] Weak password (< 8 chars) → Should fail
- [ ] Password without uppercase → Should fail
- [ ] Password without lowercase → Should fail
- [ ] Password without number → Should fail
- [ ] Mismatched passwords → Should fail
- [ ] Wrong current password → Should fail

### ❌ Authentication Edge Cases
- [ ] Access protected endpoint without auth → Should fail
- [ ] Use invalid/expired token → Should fail
- [ ] Use token after logout → Should fail

---

## Database Verification Queries

### Check Recent OTP Tokens
```sql
SELECT 
  prt.id,
  prt."userId",
  u.email,
  prt.token,
  CASE 
    WHEN SUBSTRING(prt.token, 1, 1) = 'e' THEN 'email_update'
    WHEN SUBSTRING(prt.token, 1, 1) = 'p' THEN 'password_reset'
    ELSE 'unknown'
  END as purpose,
  SUBSTRING(prt.token, 3) as otp_code,
  prt.used,
  prt."expiresAt",
  prt."createdAt",
  CASE 
    WHEN prt.used THEN 'Used'
    WHEN prt."expiresAt" < NOW() THEN 'Expired'
    ELSE 'Valid'
  END as status
FROM password_reset_tokens prt
JOIN users u ON u.id = prt."userId"
ORDER BY prt."createdAt" DESC
LIMIT 20;
```

### Check User Email History
```sql
SELECT 
  id,
  email,
  "createdAt",
  "updatedAt"
FROM users
WHERE email LIKE '%@example.com'
ORDER BY "updatedAt" DESC;
```

### Check Pending Email Changes
**Note:** Currently stored in memory. Check server logs or add database table.

---

## Troubleshooting

### Issue: OTP Not Received
1. Check email service configuration
2. Check server logs for OTP codes (development mode)
3. Verify email address is correct
4. Check spam folder

### Issue: OTP Expired
- OTPs expire after 10 minutes
- Request a new OTP

### Issue: "Pending change not found"
- Server restart clears in-memory pending changes
- Complete Step 1 again (verify current email)

### Issue: Email Update Fails
- Ensure both steps completed in order
- Check if email already exists
- Verify OTP codes are correct

---

## Expected Security Behaviors

✅ **OTP Security:**
- OTP expires after 10 minutes
- OTP can only be used once
- Multiple OTP requests invalidate previous ones
- Purpose prefix prevents cross-purpose use

✅ **Email Update Security:**
- Requires current email verification first
- Requires new email verification before change
- Prevents email change without both verifications
- Sends notifications to both emails

✅ **Password Security:**
- Password validation enforced
- Current password required for change
- OTP required for reset (when forgotten)
- Secure password hashing

✅ **Authentication Security:**
- Tokens invalidated on logout
- Sessions tracked correctly
- Unauthorized access blocked

