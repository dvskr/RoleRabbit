# Security Testing Guide

## Manual Testing Steps

### Prerequisites
1. API server running on `http://localhost:3001`
2. Database accessible
3. Email service configured (or check logs for OTP codes)

### Test 1: Password Reset Flow (OTP-based)

#### Step 1: Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com", "password": "your-password"}' \
  -c cookies.txt
```

#### Step 2: Request OTP for Password Reset
```bash
curl -X POST http://localhost:3001/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"purpose": "password_reset"}'
```

**Expected:** Status 200, OTP sent to email (check email or server logs)

#### Step 3: Verify OTP and Reset Password
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

**Expected:** Status 200, password reset successful

---

### Test 2: Email Update Flow (Two-Step Verification)

#### Step 1: Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com", "password": "your-password"}' \
  -c cookies.txt
```

#### Step 2: Request OTP to Current Email
```bash
curl -X POST http://localhost:3001/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"purpose": "email_update"}'
```

**Expected:** Status 200, OTP sent to current email

#### Step 3: Verify Current Email OTP (Step 1)
```bash
curl -X POST http://localhost:3001/api/auth/verify-otp-update-email \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "otp": "123456",
    "newEmail": "newemail@example.com",
    "step": "verify_current"
  }'
```

**Expected:** Status 200, current email verified, pending change stored

#### Step 4: Request OTP to New Email
```bash
curl -X POST http://localhost:3001/api/auth/send-otp-to-new-email \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"newEmail": "newemail@example.com"}'
```

**Expected:** Status 200, OTP sent to new email

#### Step 5: Verify New Email OTP (Step 2)
```bash
curl -X POST http://localhost:3001/api/auth/verify-otp-update-email \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "otp": "654321",
    "newEmail": "newemail@example.com",
    "step": "verify_new"
  }'
```

**Expected:** Status 200, email updated successfully

---

### Test 3: Password Change (Current Password Required)

#### Step 1: Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com", "password": "your-password"}' \
  -c cookies.txt
```

#### Step 2: Change Password
```bash
curl -X POST http://localhost:3001/api/auth/password/change \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "currentPassword": "your-current-password",
    "newPassword": "NewPassword123!",
    "confirmPassword": "NewPassword123!"
  }'
```

**Expected:** Status 200, password changed successfully

---

## Security Checks to Verify

### ✅ OTP Security
- [ ] OTP expires after 10 minutes
- [ ] OTP can only be used once
- [ ] Multiple OTPs invalidate previous ones
- [ ] OTP purpose prefix prevents cross-purpose use

### ✅ Email Update Security
- [ ] Requires current email verification first
- [ ] Requires new email verification before change
- [ ] Prevents email change without both verifications
- [ ] Sends notifications to both emails

### ✅ Password Security
- [ ] Password validation (8+ chars, uppercase, lowercase, number)
- [ ] Current password required for change
- [ ] OTP required for reset (when forgotten)
- [ ] Cannot reuse same password (if implemented)

### ✅ Authentication Security
- [ ] Tokens invalidated on logout
- [ ] Sessions tracked correctly
- [ ] Unauthorized access blocked
- [ ] Rate limiting (if implemented)

---

## Database Verification

### Check OTP Tokens
```sql
SELECT 
  id,
  "userId",
  token,
  "used",
  "expiresAt",
  "createdAt"
FROM password_reset_tokens
WHERE "userId" = 'your-user-id'
ORDER BY "createdAt" DESC
LIMIT 10;
```

### Check Pending Email Changes (in-memory)
Note: Pending email changes are stored in memory (Map). Check server logs or add database table if needed.

### Check User Email Changes
```sql
SELECT 
  id,
  email,
  "updatedAt"
FROM users
WHERE id = 'your-user-id';
```

---

## Common Issues

### Issue: OTP not received
- Check email service configuration
- Check server logs for OTP codes (development mode)
- Verify email address is correct

### Issue: OTP expired
- OTPs expire after 10 minutes
- Request a new OTP

### Issue: OTP already used
- OTPs can only be used once
- Request a new OTP

### Issue: Email update fails at Step 2
- Ensure Step 1 (current email verification) completed successfully
- Check if pending change exists in memory
- Server restart clears in-memory pending changes

---

## Production Considerations

1. **Pending Email Changes**: Currently stored in memory (Map). Consider:
   - Moving to Redis for persistence
   - Adding database table for pending changes
   - Adding expiration/cleanup for old pending changes

2. **OTP Storage**: Currently in `password_reset_tokens` table. Good for now.

3. **Rate Limiting**: Add rate limiting to prevent abuse:
   - Limit OTP requests per user/IP
   - Limit password reset attempts
   - Limit email change attempts

4. **Monitoring**: Add logging/monitoring for:
   - Failed OTP attempts
   - Email change attempts
   - Password reset attempts
   - Security events

