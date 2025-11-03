# Profile Feature Setup Script
# This script sets up the environment for testing the profile feature

Write-Host "`n==========================================`n" -ForegroundColor Cyan
Write-Host "🚀 Profile Feature Setup" -ForegroundColor Green
Write-Host "==========================================`n" -ForegroundColor Cyan

# Check if we're in the right directory
if (-not (Test-Path "apps/api")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

# Step 1: Create backend .env file
if (-not (Test-Path "apps/api/.env")) {
    Write-Host "📝 Creating apps/api/.env file..." -ForegroundColor Yellow
    $backendEnv = @"
DATABASE_URL=postgresql://roleready:roleready_password@localhost:5432/roleready_db
JWT_SECRET=$(Get-Random -Minimum 1000000000000000 -Maximum 9999999999999999)
PORT=3001
HOST=localhost
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
"@
    $backendEnv | Out-File -FilePath "apps/api/.env" -Encoding UTF8
    Write-Host "✅ Created apps/api/.env" -ForegroundColor Green
} else {
    Write-Host "✅ apps/api/.env already exists" -ForegroundColor Green
}

# Step 2: Create frontend .env.local file
if (-not (Test-Path "apps/web/.env.local")) {
    Write-Host "📝 Creating apps/web/.env.local file..." -ForegroundColor Yellow
    $frontendEnv = @"
NEXT_PUBLIC_API_URL=http://localhost:3001
"@
    $frontendEnv | Out-File -FilePath "apps/web/.env.local" -Encoding UTF8
    Write-Host "✅ Created apps/web/.env.local" -ForegroundColor Green
} else {
    Write-Host "✅ apps/web/.env.local already exists" -ForegroundColor Green
}

# Step 3: Install dependencies
Write-Host "`n📦 Installing dependencies..." -ForegroundColor Yellow

if (-not (Test-Path "apps/api/node_modules")) {
    Write-Host "Installing backend dependencies..." -ForegroundColor White
    Set-Location "apps/api"
    npm install
    Set-Location "../.."
    Write-Host "✅ Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✅ Backend dependencies already installed" -ForegroundColor Green
}

if (-not (Test-Path "apps/web/node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor White
    Set-Location "apps/web"
    npm install
    Set-Location "../.."
    Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✅ Frontend dependencies already installed" -ForegroundColor Green
}

# Step 4: Setup database
Write-Host "`n🗄️  Setting up database..." -ForegroundColor Yellow
Set-Location "apps/api"

Write-Host "Generating Prisma client..." -ForegroundColor White
npx prisma generate

Write-Host "Running database migrations..." -ForegroundColor White
npx prisma migrate dev --name init

Set-Location "../.."
Write-Host "✅ Database setup complete" -ForegroundColor Green

Write-Host "`n==========================================`n" -ForegroundColor Cyan
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "==========================================`n" -ForegroundColor Cyan

Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Start backend:  cd apps/api && npm run dev" -ForegroundColor White
Write-Host "2. Start frontend: cd apps/web && npm run dev" -ForegroundColor White
Write-Host "3. Open browser:   http://localhost:3000" -ForegroundColor White
Write-Host "`nOr use START_SERVERS.ps1 to start both servers automatically" -ForegroundColor Cyan
Write-Host "==========================================`n" -ForegroundColor Cyan


