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
$apiScript = "-NoExit", "-Command", "cd '$PWD\apps\api'; if (Test-Path 'simple-server.js') { node simple-server.js } else { npm run dev }"
Start-Process powershell -ArgumentList $apiScript -WindowStyle Normal

# Start Python API
$pythonScript = "-NoExit", "-Command", "cd '$PWD\apps\api-python'; python start.py"
Start-Process powershell -ArgumentList $pythonScript -WindowStyle Normal

# Start Next.js Web
$webScript = "-NoExit", "-Command", "cd '$PWD\apps\web'; npm run dev"
Start-Process powershell -ArgumentList $webScript -WindowStyle Normal

Write-Host "All services started! Check the opened windows for status." -ForegroundColor Green
Read-Host "Press Enter to continue"
