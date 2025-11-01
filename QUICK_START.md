# Quick Start Guide

## Start the Application

### Step 1: Start Backend API
```powershell
npm run dev:api
```
Or if you're in the workspace root:
```powershell
cd apps/api
npm run dev
```

The API should start on **http://localhost:3001**

### Step 2: Start Frontend
```powershell
npm run dev
```
Or if you're in the workspace root:
```powershell
cd apps/web
npm run dev
```

The frontend should start on **http://localhost:3000**

### Step 3: Start Python AI Service (Optional)
```powershell
npm run dev:python
```

## Verify Everything is Running

1. **Backend**: http://localhost:3001/health
2. **Frontend**: http://localhost:3000
3. **Python AI**: http://localhost:8000/docs

## Common Issues

### "Unexpected error" on login
- **Problem**: Backend not running
- **Solution**: Start with `npm run dev:api`

### Redirected back to landing page after login
- **Problem**: Fixed in latest update
- **Solution**: Clear browser cache and cookies

### "Cannot connect to server"
- **Problem**: Backend not running or on wrong port
- **Solution**: Check backend is running on port 3001

## Quick Test

1. Open http://localhost:3000
2. Click "Sign Up"
3. Create an account
4. Should stay on dashboard (not redirect)

## Stopping Services

Press `Ctrl+C` in each terminal window to stop the services.

