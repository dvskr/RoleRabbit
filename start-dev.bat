@echo off
echo Starting RoleReady Full Stack Development Environment...
echo.

echo Installing dependencies...
call npm install

echo.
echo Starting all services...
echo - Node.js API: http://localhost:3001
echo - Python API: http://localhost:8000  
echo - Next.js Web: http://localhost:3000
echo.

start "Node.js API" cmd /k "cd apps/api && npm run dev"
start "Python API" cmd /k "cd apps/api-python && python start.py"
start "Next.js Web" cmd /k "cd apps/web && npm run dev"

echo All services started! Check the opened windows for status.
pause
