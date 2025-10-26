# RoleReady Development Startup Script for PowerShell
Write-Host "Starting RoleReady Full Stack Development Environment..." -ForegroundColor Green
Write-Host ""

Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host ""
Write-Host "Starting all services..." -ForegroundColor Yellow
Write-Host "- Node.js API: http://localhost:3001" -ForegroundColor Cyan
Write-Host "- Python API: http://localhost:8000" -ForegroundColor Cyan  
Write-Host "- Next.js Web: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""

# Start Node.js API
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd apps/api; npm run dev" -WindowStyle Normal

# Start Python API
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd apps/api-python; python start.py" -WindowStyle Normal

# Start Next.js Web
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd apps/web; npm run dev" -WindowStyle Normal

Write-Host "All services started! Check the opened windows for status." -ForegroundColor Green
Read-Host "Press Enter to continue"
