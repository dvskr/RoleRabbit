# Troubleshooting "Failed to Fetch" Error When Saving Profile

## Quick Fixes

### 1. Check if API Server is Running

**Problem:** The Node.js API server might not be running.

**Solution:**
```bash
# Check if server is running
curl http://localhost:3001/health

# If it fails, start the server:
cd apps/api
npm run dev
```

You should see:
```
Server listening on http://localhost:3001
```

### 2. Verify API URL Configuration

**Check:** `apps/web/.env.local` or `apps/web/.env`
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Check Browser Console

Open browser DevTools (F12) → Console tab and look for:
- Network errors
- CORS errors
- 401/403 authentication errors

### 4. Check Network Tab

1. Open DevTools (F12)
2. Go to Network tab
3. Try saving profile again
4. Look for the `/api/users/profile` PUT request
5. Check:
   - Status code (should be 200)
   - Request URL (should be http://localhost:3001/api/users/profile)
   - Response (check for error messages)

### 5. Verify Authentication

Make sure you're logged in:
- Check if you have an auth cookie
- Try logging out and logging back in
- Check if `/api/users/profile` GET request works

### 6. Check CORS Settings

**File:** `apps/api/server.js`

CORS should allow your frontend origin:
```javascript
fastify.register(require('@fastify/cors'), {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  // ...
});
```

### 7. Check Database Connection

**Problem:** Database might not be connected.

**Solution:**
```bash
cd apps/api
npx prisma db push
# or
npx prisma migrate dev
```

### 8. Restart Both Servers

**Sometimes a restart fixes issues:**
```bash
# Stop both servers (Ctrl+C)
# Then restart:

# Terminal 1 - API Server
cd apps/api
npm run dev

# Terminal 2 - Frontend
cd apps/web
npm run dev
```

## Common Error Messages and Solutions

### "Failed to fetch"
- **Cause:** API server not running or network issue
- **Fix:** Start the API server on port 3001

### "401 Unauthorized"
- **Cause:** Not logged in or session expired
- **Fix:** Log in again

### "404 Not Found"
- **Cause:** Route not registered
- **Fix:** Check `apps/api/server.js` - make sure `userRoutes` is registered

### "413 Payload Too Large"
- **Cause:** Profile data too large (especially with base64 profile picture)
- **Fix:** Profile pictures are now excluded from general save - upload separately

### "500 Internal Server Error"
- **Cause:** Database error or server crash
- **Fix:** Check API server console logs for details

## Debug Steps

1. **Check API server logs:**
   - Look at the terminal running `npm run dev` in `apps/api`
   - See if there are any error messages

2. **Check browser console:**
   - Open DevTools (F12)
   - Look for red error messages
   - Check Network tab for failed requests

3. **Test API directly:**
   ```bash
   # Test if API is responding
   curl http://localhost:3001/health
   
   # Test profile endpoint (requires authentication)
   curl http://localhost:3001/api/users/profile \
     -H "Cookie: auth_token=your_token_here"
   ```

4. **Check environment variables:**
   - Verify `NEXT_PUBLIC_API_URL` in frontend
   - Verify `PORT` and `DATABASE_URL` in backend

## Still Not Working?

1. Share the exact error message from browser console
2. Share API server logs
3. Share Network tab details (status code, response body)
4. Verify both servers are running and accessible

