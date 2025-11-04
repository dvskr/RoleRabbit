# Account Recovery Flow Analysis & Recommendations

## Current Flow Evaluation

### ✅ What Works Well

1. **Password Reset Flow** - Standard and secure
   - OTP to registered email ✅
   - New password + confirmation ✅
   - Proper validation ✅

2. **Clear User Options** - Good UX
   - Separate options for password vs email ✅
   - Clear descriptions ✅

3. **Security Layer** - OTP verification adds security ✅

### ⚠️ Issues & Gaps

#### 1. **"Forgot Email" Paradox**
**Problem**: If user truly forgot their email, they can't receive OTP to reset it.

**Current Flow**:
- User selects "Reset Email"
- OTP sent to current email (which they forgot) ❌
- User can't proceed

**Industry Practice**:
- Platforms don't offer "forgot email" reset via email
- Instead: Use phone number, security questions, or account recovery form

**Recommendation**:
- Rename "Reset Email" → "Change Email" (if logged in) or "Update Email"
- Add disclaimer: "You must have access to your current email to change it"
- For true "forgot email" scenario, implement alternative recovery:
  - Phone number verification
  - Security questions
  - Account recovery form with personal info

#### 2. **Missing New Email Verification**
**Problem**: After changing email, new email is not verified before activation.

**Current Flow**:
- Verify identity (OTP to old email) ✅
- Change email immediately ❌
- No verification of new email ownership ❌

**Industry Practice** (Gmail, GitHub, Microsoft):
- Step 1: Verify identity (OTP to current email) ✅
- Step 2: Enter new email
- Step 3: Verify new email (OTP sent to NEW email) ✅
- Step 4: Email changed only after new email verified ✅

**Recommendation**:
```
Flow should be:
1. User selects "Change Email"
2. OTP sent to CURRENT email (verify identity)
3. User enters OTP + new email
4. OTP sent to NEW email (verify ownership)
5. User enters new email OTP
6. Email changed + notification to old email
```

#### 3. **Missing Security Notifications**
**Problem**: When email changes, old email should be notified for security.

**Current**: No notification sent ❌

**Industry Practice**: All platforms send notification to old email ✅

**Recommendation**:
- Send notification email to old address when change is initiated
- Send confirmation email to old address when change is completed
- Include security warning if change was unauthorized

## Comparison with Major Platforms

### Gmail (Google)
1. Enter new email
2. Verify current email (password or OTP)
3. Verify new email (OTP sent to new email)
4. Confirmation emails sent to both addresses

### GitHub
1. Enter new email
2. Verify current email (password or 2FA)
3. Verify new email (confirmation link to new email)
4. Email changed after new email verified

### Microsoft/Azure
1. Enter new email
2. Verify identity (password + 2FA if enabled)
3. Verify new email (OTP to new email)
4. Notification to old email

## Recommended Improved Flow

### Option A: Enhanced Two-Step Email Verification (Recommended)

```
Step 1: Identity Verification
├─ User selects "Change Email"
├─ OTP sent to CURRENT email
└─ User enters OTP

Step 2: New Email Verification
├─ User enters new email address
├─ OTP sent to NEW email
├─ User enters new email OTP
└─ Email changed

Step 3: Security Notifications
├─ Confirmation to old email
└─ Welcome email to new email
```

### Option B: Simplified (Current with Improvements)

```
Step 1: Identity Verification
├─ User selects "Change Email"
├─ OTP sent to CURRENT email
└─ User enters OTP

Step 2: New Email Entry
├─ User enters new email
├─ Save as "pending email change"
└─ Send verification OTP to NEW email

Step 3: New Email Verification
├─ User enters new email OTP
├─ Email changed
└─ Notifications sent to both emails
```

## Implementation Priority

### High Priority (Security)
1. ✅ Add new email verification step
2. ✅ Send notification to old email
3. ✅ Rename "Reset Email" → "Change Email" with disclaimer

### Medium Priority (UX)
4. ⚠️ Add "Forgot Email" alternative recovery method
5. ⚠️ Add email change pending state (don't change immediately)

### Low Priority (Enhancement)
6. 📋 Add change tracking/history
7. 📋 Add rate limiting on OTP requests
8. 📋 Add security audit log

## Code Changes Needed

1. **Email Change Flow**:
   - Add `pendingEmail` field to user model
   - Add `emailChangeToken` expiration
   - Add second OTP verification step

2. **Email Service**:
   - Add `sendEmailChangeNotification(oldEmail, newEmail)`
   - Add `sendNewEmailVerification(newEmail, token)`

3. **UI Updates**:
   - Update ForgotFlowModal to show two-step process
   - Add pending email verification step
   - Add security notification info

## Conclusion

**Current Flow**: ✅ Good foundation, but incomplete for email changes

**Recommendation**: Implement two-step email verification (verify old email, then verify new email) to match industry standards and improve security.

**Risk Level**: Medium - Without new email verification, users could change email to an address they don't own, potentially losing account access.

