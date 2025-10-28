@echo off
echo Starting RoleReady Servers...
echo.

echo Step 1: Killing existing processes on ports 3000 and 3001
npx kill-port 3000 3001
timeout /t 2 /nobreak > nul

echo.
echo Step 2: Starting all servers
echo.
npm run dev:all

pause
