# Auth Issue: Redirect Back to Landing Page

## Problem
After signup/login, user successfully reaches dashboard, but after a few seconds is redirected back to landing page.

## Root Cause Analysis

Based on the code investigation:

1. **Auth Context Behavior**: `AuthContext` immediately sets `isLoading = false` to prevent blocking
2. **Delayed Auth Check**: Then schedules an auth verification check 2-3 seconds later
3. **If Check Fails**: The check calls `/api/auth/verify` with cookies
4. **The Redirect**: When this check fails (cookies not set or invalid), AuthContext clears user state

## Potential Issues

### 1. Browser Cookie Settings
Cookies are set with `sameSite: 'lax'`, which should work for localhost. But:
- Could be blocked by browser privacy settings
- Could be cleared by user's cookie preferences

### 2. CORS/Cookie Domain Mismatch
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- Need to verify CORS is properly configured

### 3. Auth Check Failing
The `/api/auth/verify` endpoint might be failing because:
- JWT not being read correctly from cookies
- Cookie path/domain issues
- Fastify cookie parsing not working

## Quick Fixes to Try

### Fix 1: Check Browser Console
Open browser DevTools → Console tab during the issue:
1. Look for network errors
2. Check if cookies are being sent
3. Note any authentication errors

### Fix 2: Verify Backend CORS
Ensure `apps/api/server.js` has CORS configured:
```javascript
fastify.register(require('@fastify/cors'), {
  origin: 'http://localhost:3000',
  credentials: true
});
```

### Fix 3: Test Cookie Setting
Manual test:
```powershell
# Register a user
$body = @{ email = "test@test.com"; password = "Test123!"; name = "Test User" } | ConvertTo-Json
$resp = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/register" -Method POST -Body $body -ContentType "application/json" -SessionVariable session

# Check what was returned
$resp

# Try to use the session
$profile = Invoke-RestMethod -Uri "http://localhost:3001/api/users/profile" -WebSession $session
$profile
```

### Fix 4: Simplify Auth Check
The `AuthContext` has a complex delayed check. Consider simplifying it:

```typescript
useEffect(() => {
  // Check auth immediately on mount
  const checkAuth = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/verify', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setUser(data.user);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  checkAuth();
}, []);
```

### Fix 5: Add Debugging
Add console logs to see what's happening:

In `apps/web/src/contexts/AuthContext.tsx`, add:
```typescript
const checkAuth = async () => {
  console.log('🔍 Checking auth...');
  try {
    const response = await fetch('http://localhost:3001/api/auth/verify', {
      credentials: 'include',
      signal: controller.signal,
    });
    console.log('✅ Auth check response:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ User data:', data.user);
      if (data.user) {
        setUser(data.user);
      }
    } else {
      console.log('❌ Auth check failed, status:', response.status);
    }
  } catch (error) {
    console.error('❌ Auth check error:', error);
  }
};
```

## Testing Steps

1. **Open Browser DevTools** (F12)
2. **Go to Network tab**
3. **Clear all cookies** for localhost
4. **Sign up or login**
5. **Watch the network requests**:
   - POST /api/auth/register or /api/auth/login
   - Check Response Headers for `Set-Cookie`
   - Should see 3 cookies: `auth_token`, `refresh_token`, `session_id`
6. **After redirect to dashboard**:
   - Wait for the auth check
   - Look for GET /api/auth/verify request
   - Check if cookies were sent in Request Headers
   - Note the response status code

## Most Likely Issue

Given that the dashboard loads first, then redirects:
- **Cookies ARE being set** (initial dashboard load works)
- **Cookies ARE NOT being SENT** in subsequent requests
- This is likely a CORS or cookie domain issue

Check `apps/api/server.js` for CORS registration and ensure `credentials: true` is set.

## Next Steps

Run the debugging and share:
1. Browser console errors
2. Network tab for `/api/auth/verify` request
3. Whether cookies appear in DevTools → Application → Cookies

This will help pinpoint the exact issue.

