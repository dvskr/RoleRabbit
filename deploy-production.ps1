# ============================================================================
# RoleReady Resume Builder - Production Deployment Script
# ============================================================================
# This script handles the complete deployment process:
# 1. Run database migrations
# 2. Start background workers
# 3. Run tests
# 4. Start services
# ============================================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RoleReady Production Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$PROJECT_ROOT = "C:\Users\sathish.kumar\RoleReady-FullStack"
$API_DIR = "$PROJECT_ROOT\apps\api"
$WEB_DIR = "$PROJECT_ROOT\apps\web"

# ============================================================================
# STEP 1: VALIDATE ENVIRONMENT
# ============================================================================
Write-Host "[1/6] Validating Environment Variables..." -ForegroundColor Yellow

Set-Location $API_DIR

# Check if .env exists
if (-Not (Test-Path ".env")) {
    Write-Host "ERROR: .env file not found in $API_DIR" -ForegroundColor Red
    Write-Host "Please create .env file with required variables" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Environment file found" -ForegroundColor Green

# Validate environment variables (if validation script exists)
if (Test-Path "utils\validateEnv.js") {
    Write-Host "Running environment validation..." -ForegroundColor Cyan
    node utils\validateEnv.js
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Environment validation failed" -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ Environment variables validated" -ForegroundColor Green
} else {
    Write-Host "⚠ Environment validation script not found, skipping..." -ForegroundColor Yellow
}

Write-Host ""

# ============================================================================
# STEP 2: DATABASE MIGRATIONS
# ============================================================================
Write-Host "[2/6] Running Database Migrations..." -ForegroundColor Yellow

# Check Prisma migration status
Write-Host "Checking Prisma migration status..." -ForegroundColor Cyan
npx prisma migrate status
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Prisma migrations need to be applied" -ForegroundColor Red
    Write-Host "Running migrations..." -ForegroundColor Cyan
    npx prisma migrate deploy
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Prisma migration failed" -ForegroundColor Red
        exit 1
    }
}
Write-Host "✓ Prisma migrations up to date" -ForegroundColor Green

# Check if custom SQL migrations exist and need to be run
$customMigrations = @(
    "prisma\migrations\add_missing_tables_and_columns.sql",
    "prisma\migrations\add_constraints.sql"
)

Write-Host "Checking custom SQL migrations..." -ForegroundColor Cyan
$DATABASE_URL = $env:DATABASE_URL
if (-Not $DATABASE_URL) {
    # Try to read from .env file
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match 'DATABASE_URL="?([^"\r\n]+)"?') {
        $DATABASE_URL = $matches[1]
    }
}

if ($DATABASE_URL) {
    Write-Host "⚠ Custom SQL migrations detected but require manual execution" -ForegroundColor Yellow
    Write-Host "Please run the following commands manually if not already done:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  psql `$DATABASE_URL -f prisma\migrations\add_missing_tables_and_columns.sql" -ForegroundColor Cyan
    Write-Host "  psql `$DATABASE_URL -f prisma\migrations\add_constraints.sql" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Press any key to continue (assuming migrations are done)..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
} else {
    Write-Host "⚠ DATABASE_URL not found, skipping custom migrations" -ForegroundColor Yellow
}

# Generate Prisma Client
Write-Host "Generating Prisma Client..." -ForegroundColor Cyan
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Prisma client generation failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Prisma client generated" -ForegroundColor Green

Write-Host ""

# ============================================================================
# STEP 3: INSTALL DEPENDENCIES
# ============================================================================
Write-Host "[3/6] Installing Dependencies..." -ForegroundColor Yellow

# API dependencies
Write-Host "Installing API dependencies..." -ForegroundColor Cyan
Set-Location $API_DIR
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: API dependency installation failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ API dependencies installed" -ForegroundColor Green

# Web dependencies
Write-Host "Installing Web dependencies..." -ForegroundColor Cyan
Set-Location $WEB_DIR
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Web dependency installation failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Web dependencies installed" -ForegroundColor Green

Write-Host ""

# ============================================================================
# STEP 4: RUN TESTS
# ============================================================================
Write-Host "[4/6] Running Tests..." -ForegroundColor Yellow

# Run API tests
Write-Host "Running API tests..." -ForegroundColor Cyan
Set-Location $API_DIR
if (Test-Path "package.json") {
    $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
    if ($packageJson.scripts.test) {
        npm test
        if ($LASTEXITCODE -ne 0) {
            Write-Host "⚠ Some API tests failed" -ForegroundColor Yellow
            Write-Host "Continue anyway? (Y/N)" -ForegroundColor Yellow
            $response = Read-Host
            if ($response -ne "Y" -and $response -ne "y") {
                exit 1
            }
        } else {
            Write-Host "✓ API tests passed" -ForegroundColor Green
        }
    } else {
        Write-Host "⚠ No test script found in API package.json" -ForegroundColor Yellow
    }
}

# Run Web tests
Write-Host "Running Web tests..." -ForegroundColor Cyan
Set-Location $WEB_DIR
if (Test-Path "package.json") {
    $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
    if ($packageJson.scripts.test) {
        npm test
        if ($LASTEXITCODE -ne 0) {
            Write-Host "⚠ Some Web tests failed" -ForegroundColor Yellow
            Write-Host "Continue anyway? (Y/N)" -ForegroundColor Yellow
            $response = Read-Host
            if ($response -ne "Y" -and $response -ne "y") {
                exit 1
            }
        } else {
            Write-Host "✓ Web tests passed" -ForegroundColor Green
        }
    } else {
        Write-Host "⚠ No test script found in Web package.json" -ForegroundColor Yellow
    }
}

Write-Host ""

# ============================================================================
# STEP 5: START BACKGROUND WORKERS
# ============================================================================
Write-Host "[5/6] Starting Background Workers..." -ForegroundColor Yellow

Set-Location $API_DIR

# Check if workers exist
if (Test-Path "queues\startWorkers.js") {
    Write-Host "Starting BullMQ workers..." -ForegroundColor Cyan
    
    # Start workers in background
    $workersJob = Start-Job -ScriptBlock {
        param($apiDir)
        Set-Location $apiDir
        node queues\startWorkers.js
    } -ArgumentList $API_DIR
    
    Write-Host "✓ Background workers started (Job ID: $($workersJob.Id))" -ForegroundColor Green
    Write-Host "  Monitor with: Get-Job $($workersJob.Id)" -ForegroundColor Cyan
    Write-Host "  View output: Receive-Job $($workersJob.Id)" -ForegroundColor Cyan
    Write-Host "  Stop workers: Stop-Job $($workersJob.Id)" -ForegroundColor Cyan
} else {
    Write-Host "⚠ Worker startup script not found, skipping..." -ForegroundColor Yellow
}

Write-Host ""

# ============================================================================
# STEP 6: START SERVICES
# ============================================================================
Write-Host "[6/6] Starting Services..." -ForegroundColor Yellow

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Start API Server:" -ForegroundColor Cyan
Write-Host "   cd $API_DIR" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "2. Start Web App (in new terminal):" -ForegroundColor Cyan
Write-Host "   cd $WEB_DIR" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "3. Access Application:" -ForegroundColor Cyan
Write-Host "   Web: http://localhost:3000" -ForegroundColor White
Write-Host "   API: http://localhost:3001" -ForegroundColor White
Write-Host "   Health: http://localhost:3001/api/health" -ForegroundColor White
Write-Host "   Metrics: http://localhost:3001/api/metrics" -ForegroundColor White
Write-Host "   Queue Dashboard: http://localhost:3001/admin/queues" -ForegroundColor White
Write-Host ""
Write-Host "4. Monitor Background Workers:" -ForegroundColor Cyan
Write-Host "   Get-Job | Where-Object { `$_.State -eq 'Running' }" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# RoleReady Resume Builder - Production Deployment Script
# ============================================================================
# This script handles the complete deployment process:
# 1. Run database migrations
# 2. Start background workers
# 3. Run tests
# 4. Start services
# ============================================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RoleReady Production Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$PROJECT_ROOT = "C:\Users\sathish.kumar\RoleReady-FullStack"
$API_DIR = "$PROJECT_ROOT\apps\api"
$WEB_DIR = "$PROJECT_ROOT\apps\web"

# ============================================================================
# STEP 1: VALIDATE ENVIRONMENT
# ============================================================================
Write-Host "[1/6] Validating Environment Variables..." -ForegroundColor Yellow

Set-Location $API_DIR

# Check if .env exists
if (-Not (Test-Path ".env")) {
    Write-Host "ERROR: .env file not found in $API_DIR" -ForegroundColor Red
    Write-Host "Please create .env file with required variables" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Environment file found" -ForegroundColor Green

# Validate environment variables (if validation script exists)
if (Test-Path "utils\validateEnv.js") {
    Write-Host "Running environment validation..." -ForegroundColor Cyan
    node utils\validateEnv.js
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Environment validation failed" -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ Environment variables validated" -ForegroundColor Green
} else {
    Write-Host "⚠ Environment validation script not found, skipping..." -ForegroundColor Yellow
}

Write-Host ""

# ============================================================================
# STEP 2: DATABASE MIGRATIONS
# ============================================================================
Write-Host "[2/6] Running Database Migrations..." -ForegroundColor Yellow

# Check Prisma migration status
Write-Host "Checking Prisma migration status..." -ForegroundColor Cyan
npx prisma migrate status
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Prisma migrations need to be applied" -ForegroundColor Red
    Write-Host "Running migrations..." -ForegroundColor Cyan
    npx prisma migrate deploy
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Prisma migration failed" -ForegroundColor Red
        exit 1
    }
}
Write-Host "✓ Prisma migrations up to date" -ForegroundColor Green

# Check if custom SQL migrations exist and need to be run
$customMigrations = @(
    "prisma\migrations\add_missing_tables_and_columns.sql",
    "prisma\migrations\add_constraints.sql"
)

Write-Host "Checking custom SQL migrations..." -ForegroundColor Cyan
$DATABASE_URL = $env:DATABASE_URL
if (-Not $DATABASE_URL) {
    # Try to read from .env file
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match 'DATABASE_URL="?([^"\r\n]+)"?') {
        $DATABASE_URL = $matches[1]
    }
}

if ($DATABASE_URL) {
    Write-Host "⚠ Custom SQL migrations detected but require manual execution" -ForegroundColor Yellow
    Write-Host "Please run the following commands manually if not already done:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  psql `$DATABASE_URL -f prisma\migrations\add_missing_tables_and_columns.sql" -ForegroundColor Cyan
    Write-Host "  psql `$DATABASE_URL -f prisma\migrations\add_constraints.sql" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Press any key to continue (assuming migrations are done)..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
} else {
    Write-Host "⚠ DATABASE_URL not found, skipping custom migrations" -ForegroundColor Yellow
}

# Generate Prisma Client
Write-Host "Generating Prisma Client..." -ForegroundColor Cyan
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Prisma client generation failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Prisma client generated" -ForegroundColor Green

Write-Host ""

# ============================================================================
# STEP 3: INSTALL DEPENDENCIES
# ============================================================================
Write-Host "[3/6] Installing Dependencies..." -ForegroundColor Yellow

# API dependencies
Write-Host "Installing API dependencies..." -ForegroundColor Cyan
Set-Location $API_DIR
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: API dependency installation failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ API dependencies installed" -ForegroundColor Green

# Web dependencies
Write-Host "Installing Web dependencies..." -ForegroundColor Cyan
Set-Location $WEB_DIR
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Web dependency installation failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Web dependencies installed" -ForegroundColor Green

Write-Host ""

# ============================================================================
# STEP 4: RUN TESTS
# ============================================================================
Write-Host "[4/6] Running Tests..." -ForegroundColor Yellow

# Run API tests
Write-Host "Running API tests..." -ForegroundColor Cyan
Set-Location $API_DIR
if (Test-Path "package.json") {
    $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
    if ($packageJson.scripts.test) {
        npm test
        if ($LASTEXITCODE -ne 0) {
            Write-Host "⚠ Some API tests failed" -ForegroundColor Yellow
            Write-Host "Continue anyway? (Y/N)" -ForegroundColor Yellow
            $response = Read-Host
            if ($response -ne "Y" -and $response -ne "y") {
                exit 1
            }
        } else {
            Write-Host "✓ API tests passed" -ForegroundColor Green
        }
    } else {
        Write-Host "⚠ No test script found in API package.json" -ForegroundColor Yellow
    }
}

# Run Web tests
Write-Host "Running Web tests..." -ForegroundColor Cyan
Set-Location $WEB_DIR
if (Test-Path "package.json") {
    $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
    if ($packageJson.scripts.test) {
        npm test
        if ($LASTEXITCODE -ne 0) {
            Write-Host "⚠ Some Web tests failed" -ForegroundColor Yellow
            Write-Host "Continue anyway? (Y/N)" -ForegroundColor Yellow
            $response = Read-Host
            if ($response -ne "Y" -and $response -ne "y") {
                exit 1
            }
        } else {
            Write-Host "✓ Web tests passed" -ForegroundColor Green
        }
    } else {
        Write-Host "⚠ No test script found in Web package.json" -ForegroundColor Yellow
    }
}

Write-Host ""

# ============================================================================
# STEP 5: START BACKGROUND WORKERS
# ============================================================================
Write-Host "[5/6] Starting Background Workers..." -ForegroundColor Yellow

Set-Location $API_DIR

# Check if workers exist
if (Test-Path "queues\startWorkers.js") {
    Write-Host "Starting BullMQ workers..." -ForegroundColor Cyan
    
    # Start workers in background
    $workersJob = Start-Job -ScriptBlock {
        param($apiDir)
        Set-Location $apiDir
        node queues\startWorkers.js
    } -ArgumentList $API_DIR
    
    Write-Host "✓ Background workers started (Job ID: $($workersJob.Id))" -ForegroundColor Green
    Write-Host "  Monitor with: Get-Job $($workersJob.Id)" -ForegroundColor Cyan
    Write-Host "  View output: Receive-Job $($workersJob.Id)" -ForegroundColor Cyan
    Write-Host "  Stop workers: Stop-Job $($workersJob.Id)" -ForegroundColor Cyan
} else {
    Write-Host "⚠ Worker startup script not found, skipping..." -ForegroundColor Yellow
}

Write-Host ""

# ============================================================================
# STEP 6: START SERVICES
# ============================================================================
Write-Host "[6/6] Starting Services..." -ForegroundColor Yellow

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Start API Server:" -ForegroundColor Cyan
Write-Host "   cd $API_DIR" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "2. Start Web App (in new terminal):" -ForegroundColor Cyan
Write-Host "   cd $WEB_DIR" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "3. Access Application:" -ForegroundColor Cyan
Write-Host "   Web: http://localhost:3000" -ForegroundColor White
Write-Host "   API: http://localhost:3001" -ForegroundColor White
Write-Host "   Health: http://localhost:3001/api/health" -ForegroundColor White
Write-Host "   Metrics: http://localhost:3001/api/metrics" -ForegroundColor White
Write-Host "   Queue Dashboard: http://localhost:3001/admin/queues" -ForegroundColor White
Write-Host ""
Write-Host "4. Monitor Background Workers:" -ForegroundColor Cyan
Write-Host "   Get-Job | Where-Object { `$_.State -eq 'Running' }" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

