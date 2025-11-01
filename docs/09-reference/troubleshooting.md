# Troubleshooting Guide

## Common Issues and Solutions

---

## Resume Editor ChunkLoadError

### Issue
ChunkLoadError when loading ResumeEditor component - typically caused by stale webpack cache.

### Solution

1. **Stop your development server** (Ctrl+C)

2. **Clear Next.js cache:**
   ```bash
   cd apps/web
   rm -rf .next
   rm -rf node_modules/.cache
   ```

   Windows PowerShell:
   ```powershell
   cd apps/web
   Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
   Remove-Item -Recurse -Force node_modules/.cache -ErrorAction SilentlyContinue
   ```

3. **Restart the dev server:**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

### Alternative Fix

If the error persists:

1. Hard refresh the browser (Ctrl+Shift+R or Ctrl+F5)
2. Clear browser cache
3. Restart the dev server again

---

## Port Already in Use

### Issue
Error: Port 3000, 3001, or 8000 is already in use.

### Solution

**Mac/Linux:**
```bash
# Find and kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

**Windows:**
```powershell
# Find process on port 3001
netstat -ano | findstr :3001

# Kill process (replace <PID> with actual PID)
taskkill /PID <PID> /F
```

---

## Database Connection Issues

### Issue
Cannot connect to database or migration errors.

### Solution

```bash
cd apps/api

# Reset database
npx prisma migrate reset

# Generate Prisma client
npx prisma generate

# Push schema changes
npx prisma db push
```

---

## Python Import Errors

### Issue
ModuleNotFoundError or import errors in Python API.

### Solution

```bash
cd apps/api-python

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

---

## OpenAI API Not Working

### Issue
503 Error: "OpenAI client not configured" or AI features failing.

### Solution

1. **Check API key is set:**
   ```bash
   # In apps/api-python/.env
   OPENAI_API_KEY=sk-your-actual-key-here
   ```

2. **Restart Python API:**
   ```bash
   cd apps/api-python
   python main.py
   ```

3. **Check logs for:**
   ```
   ✅ "OpenAI client initialized successfully"
   ```

4. **Verify key validity:**
   - Visit https://platform.openai.com/api-keys
   - Ensure key is active
   - Check usage limits

---

## Authentication Issues

### Issue
Login not working or "Unauthorized" errors.

### Solution

1. **Check JWT secret is set:**
   ```bash
   # In apps/api/.env
   JWT_SECRET=your-secret-here
   ```

2. **Clear browser cookies:**
   - Open DevTools (F12)
   - Application → Cookies
   - Clear all cookies for localhost

3. **Check backend is running:**
   ```bash
   curl http://localhost:3001/health
   ```

---

## TypeScript Errors

### Issue
TypeScript compilation errors in frontend.

### Solution

```bash
cd apps/web

# Clear cache
rm -rf .next
rm -rf node_modules/.cache
rm tsconfig.tsbuildinfo

# Rebuild
npm run build

# Or in dev mode
npm run dev
```

---

## Dependency Issues

### Issue
Module not found or version conflicts.

### Solution

```bash
# Delete node_modules and lock files
rm -rf node_modules
rm package-lock.json  # or pnpm-lock.yaml

# Reinstall
npm install  # or pnpm install

# If still issues, clear npm cache
npm cache clean --force
```

---

## Docker Issues

### Issue
Container won't start or port conflicts.

### Solution

```bash
# Stop all containers
docker-compose down

# Remove volumes (⚠️ deletes data)
docker-compose down -v

# Rebuild
docker-compose build --no-cache

# Start fresh
docker-compose up -d

# Check logs
docker-compose logs -f
```

---

## Environment Variables Not Working

### Issue
Environment variables not loading.

### Solution

1. **Verify .env file location:**
   - `apps/api/.env` for Node.js API
   - `apps/api-python/.env` for Python API
   - `apps/web/.env.local` for frontend

2. **Restart all services** after changing .env

3. **Check file encoding** (should be UTF-8)

4. **No spaces around = sign:**
   ```env
   # ❌ Wrong
   OPENAI_API_KEY = sk-key
   
   # ✅ Correct
   OPENAI_API_KEY=sk-key
   ```

---

## Still Having Issues?

### Debug Mode

**Node.js API:**
```bash
DEBUG=* npm run dev
```

**Python API:**
```bash
# Enable detailed logging
# Already enabled by default in main.py
```

### Check Logs

```bash
# Node.js API
tail -f apps/api/logs/app.log

# Python API (check console output)
```

### Get Help

1. Check [FAQ](./faq.md)
2. Review [API Documentation](../03-api/api-reference.md)
3. Check [GitHub Issues](#)
4. Join [Discord Community](#)

---

## Next Steps

- [FAQ](./faq.md)
- [Setup Guide](../02-setup/setup-api-keys.md)
- [API Reference](../03-api/api-reference.md)

