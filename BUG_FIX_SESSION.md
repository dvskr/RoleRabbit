# Session Bug Fix

## Problem
Backend was crashing on registration/login with 500 Internal Server Error.

## Root Cause
The `createSession` function in `apps/api/utils/sessionManager.js` was:
1. Missing a 4th parameter `daysToExpire` 
2. Returning a `session` object instead of `sessionId`

But auth routes were calling it with 4 parameters and expecting a sessionId string.

## Fix Applied
Updated `createSession` function signature:
```javascript
// Before
async function createSession(userId, ipAddress, userAgent) {
  // ... 
  return session; // Wrong! Returns object
}

// After  
async function createSession(userId, ipAddress, userAgent, daysToExpire = 7) {
  // ...
  return sessionId; // Correct! Returns string
}
```

## Testing
After restarting backend, test with:
```powershell
$body = @{ name = "Test User"; email = "test@example.com"; password = "TestPassword123!" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3001/api/auth/register" -Method POST -Body $body -ContentType "application/json"
```

Should return:
- `success: true`
- `user` object
- `token` string
- `refreshToken` string
- **Cookies set in response headers**

## Status
✅ Fixed - needs backend restart to apply

