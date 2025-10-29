# Commands to Kill Ports and Restart

## Run These Commands in Your Terminal:

### Step 1: Go to Project Root
```powershell
cd C:\Users\daggu\OneDrive\Documents\RoleReady-FullStack
```

### Step 2: Kill All Node Processes
```powershell
npx kill-port 3000 3001 8000
```

### Step 3: Start Servers
```powershell
npm run dev:all:\\，
```

---

## Alternative: If kill-port Doesn't Work

### Kill Node Processes Manually
```powershell
Stop-Process -Name node -Force
```

### Then Start Servers
```powershell
npm run dev:all
```

---

## All in One Command
```powershell
cd C:\Users\daggu\OneDrive\Documents\RoleReady-FullStack; npx kill-port 3000 3001 8000; npm run dev:all
```

