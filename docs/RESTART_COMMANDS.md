# Server Restart Commands

## Kill All Ports

### Option 1: Using kill-port (speedest)
```bash
npx kill-port 3000 3001 8000
```

### Option 2: Windows PowerShell (Manual)
```powershell
# Kill port 3000 (Frontend)
Get-Process -Name node | Where-Object {$_.Path -like "*node.exe*"} | Stop-Process -Force

# Or check specific port
netstat -ano | findstr :3000
netstat -ano | findstr :3001
netstat -ano | findstr :8000
```

### Option 3: Task Manager
1. Press `Ctrl+Shift+Esc` to open Task Manager
2. Find Node.js processes
3. End all Node.js tasks

---

## Navigate to Project
```bash
cd C:\Users\daggu\OneDrive\Documents\RoleReady-FullStack
```

## Start Servers
```bash
npm run dev:all
```

---

## Quick One-Liner (All Commands)
```powershell
npx kill-port 3000 3001 8000; cd C:\Users\daggu\OneDrive\Documents\RoleReady-FullStack; npm run dev:all
```

---

## If Still Not Working

### Check What's Running
```powershell
Get-Process -Name node
```

### Force Kill All Node
```powershell
Stop-Process -Name node -Force
```

### Then Start Again
```bash
npm run dev:all
```

---

## Alternative: Start Individual Servers

If `dev:all` doesn't work, start them separately:

**Terminal 1 (Frontend):**
```bash
cd apps/web
npm run dev
```

**Terminal 2 (Backend API):**
```bash
cd apps/api
npm run dev
```

**Terminal 3 (Python API - optional):**
```bash
cd apps/api-python
python start.py
```

