# Quick Fix: "Not Found" Error (404)

## 🔧 Most Common Fix

**Restart your API server!**

After adding routes, you must restart:

```bash
# In your API terminal
# Press Ctrl+C to stop
# Then:
npm run dev
```

---

## ✅ Verify Route is Registered

When server starts, you should see:
```
📁 Storage routes registered: /api/storage/*
✅ Supabase Storage initialized with bucket: roleready-file
```

---

## 🧪 Quick Test

### Test 1: Check if endpoint exists

```bash
# Should return 401 (unauthorized) NOT 404 (not found)
curl http://localhost:3001/api/storage/files/upload
```

- **404 = Route not registered** → Restart server
- **401 = Route works!** → Just needs authentication

### Test 2: With authentication

```bash
curl -X POST http://localhost:3001/api/storage/files/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test.pdf"
```

---

## 🔍 Check These

1. **Server Running?**
   - Check terminal where you ran `npm run dev`
   - Should show server listening on port 3001

2. **Route Registered?**
   - Look for log: `📁 Storage routes registered`
   - Check `server.js` line 283 has the register call

3. **Correct URL?**
   - Frontend calls: `/api/storage/files/upload`
   - Backend route: `/files/upload` (with prefix `/api/storage`)

---

**99% of the time: Just restart the server!** 🔄

