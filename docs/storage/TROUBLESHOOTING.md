# Storage Upload Troubleshooting

## ❌ Error: "Not Found" (404)

If you see "Not Found" when trying to upload, check:

### 1. Server Restart Required

After adding the storage routes, **restart your API server**:

```bash
# Stop the server (Ctrl+C)
# Then restart:
cd apps/api
npm run dev
```

Look for:
```
✅ Supabase Storage initialized with bucket: roleready-file
```

### 2. Verify Route Registration

Check that the route is registered in `apps/api/server.js`:

```javascript
fastify.register(require('./routes/storage.routes'), { prefix: '/api/storage' });
```

### 3. Check Endpoint URL

The endpoint should be:
- **Full URL:** `http://localhost:3001/api/storage/files/upload`
- **Method:** `POST`
- **Auth:** Bearer token in cookie or header

### 4. Test with cURL

Test if the endpoint exists:

```bash
curl -X POST http://localhost:3001/api/storage/files/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test.pdf"
```

If you get 404, the route isn't registered. If you get 401, auth is working but token is invalid.

### 5. Check Server Logs

Look for errors in server console:
- Route registration errors
- Module load errors
- Authentication errors

### 6. Verify File Path

In `apps/api/routes/storage.routes.js`:
```javascript
fastify.post('/files/upload', {  // ✅ Correct - no /api/storage prefix
  preHandler: [authenticate]
}, async (request, reply) => {
```

The route path should be `/files/upload` (not `/api/storage/files/upload`) because it's registered with prefix `/api/storage`.

---

## ✅ Quick Fix Checklist

1. [ ] Restarted API server after adding routes
2. [ ] Route registered in `server.js` with correct prefix
3. [ ] Storage handler initialized successfully
4. [ ] Endpoint URL is correct: `/api/storage/files/upload`
5. [ ] Authentication token is valid
6. [ ] Server is running on port 3001

---

## 🔍 Debug Steps

### Step 1: Check Route is Loaded

Add temporary log in `storage.routes.js`:
```javascript
async function storageRoutes(fastify, options) {
  console.log('✅ Storage routes registered');
  // ... rest of code
}
```

### Step 2: Check Server Starts

When server starts, you should see:
- ✅ Database connected
- ✅ Supabase Storage initialized
- No route registration errors

### Step 3: Test Health Endpoint

```bash
curl http://localhost:3001/health
```

Should return 200 OK.

### Step 4: Test Storage Endpoint

```bash
curl http://localhost:3001/api/storage/files/upload
```

Should return 401 (unauthorized) not 404 (not found).

If you get 404, route isn't registered.
If you get 401, route works but needs auth.

---

**Most likely fix: Restart your API server!** 🔄

