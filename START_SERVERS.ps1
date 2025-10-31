# RoleReady - Start All Servers
# This script starts the backend and frontend servers

Write-Host "`n==========================================`n" -ForegroundColor Cyan
Write-Host "🚀 RoleReady - Starting Servers" -ForegroundColor Green
Write-Host "==========================================`n" -ForegroundColor Cyan

# Check if we're in the right directory
if (-not (Test-Path "apps/api")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

# Check if database exists
if (-not (Test-Path "apps/api/prisma/dev.db")) {
    Write-Host "⚠️  Database not found. Running migrations..." -ForegroundColor Yellow
    Set-Location "apps/api"
    npx prisma migrate dev --name init
    Set-Location "../.."
    Write-Host "✅ Database created!" -ForegroundColor Green
}

# Check if .env files exist
if (-not (Test-Path "apps/api/.env")) {
    Write-Host "⚠️  Creating .env file for backend..." -ForegroundColor Yellow
    @"
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="$(Get-Random -Minimum 1000000000000000 -Maximum 9999999999999999)"
PORT=3001
HOST=localhost
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
"@ | Out-File -FilePath "apps/api/.env" -Encoding UTF8
    Write-Host "✅ Created apps/api/.env" -ForegroundColor Green
}

if (-not (Test-Path "apps/web/.env.local")) {
    Write-Host "⚠️  Creating .env.local file for frontend..." -ForegroundColor Yellow
    @"
NEXT_PUBLIC_API_URL=http://localhost:3001
"@ | Out-File -FilePath "apps/web/.env.local" -Encoding UTF8
    Write-Host "✅ Created apps/web/.env.local" -ForegroundColor Green
}

Write-Host "`n📦 Installing dependencies..." -ForegroundColor Yellow

# Install dependencies if needed
if (-not (Test-Path "apps/api/node_modules")) {
    Write-Host "Installing API dependencies..." -ForegroundColor White
    Set-Location "apps/api"
    npm install
    Set-Location "../.."
}

if (-not (Test-Path "apps/web/node_modules")) {
    Write-Host "Installing web dependencies..." -ForegroundColor White
    Set-Location "apps/web"
    npm install
    Set-Location "../.."
}

Write-Host "`n✅ Starting servers..." -ForegroundColor Green
Write-Host "`n📡 Backend API: http://localhost:3001" -ForegroundColor Cyan
Write-Host "🌐 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "`nPress Ctrl+C to stop all servers`n" -ForegroundColor Yellow

# Get the current directory (project root)
$projectRoot = $PWD

# Start Node.js API
$apiScript = "-NoExit", "-Command", "cd '$projectRoot\apps\api'; Write-Host '🚀 Backend Server Starting...' -ForegroundColor Green; if (Test-Path 'simple-server.js') { node simple-server.js } else { node server.js }"
Start-Process powershell -ArgumentList $apiScript -WindowStyle Normal
Start-Sleep -Seconds 2

# Start Python API
$pythonScript = "-NoExit", "-Command", "cd '$projectRoot\apps\api-python'; Write-Host '🐍 Python API Starting...' -ForegroundColor Green; python start.py"
Start-Process powershell -ArgumentList $pythonScript -WindowStyle Normal
Start-Sleep -Seconds 1

# Start Next.js Web
$webScript = "-NoExit", "-Command", "cd '$projectRoot\apps\web'; Write-Host '🌐 Frontend Server Starting...' -ForegroundColor Green; npm run dev"
Start-Process powershell -ArgumentList $webScript -WindowStyle Normal

Write-Host "`n✅ Servers started! Check the terminal windows for output." -ForegroundColor Green
Write-Host "==========================================`n" -ForegroundColor Cyan

