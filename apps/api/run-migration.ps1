# Migration Script for RoleReady API
# This script creates and applies database migrations

Write-Host "`n=== Running Database Migrations ===" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "prisma\schema.prisma")) {
    Write-Host "❌ Error: prisma\schema.prisma not found. Please run this script from apps/api directory." -ForegroundColor Red
    exit 1
}

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ Error: .env file not found. Please create it first." -ForegroundColor Red
    exit 1
}

# Load environment variables
Get-Content ".env" | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]*)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        if ($value -match '^["\'](.*)["\']$') {
            $value = $matches[1]
        }
        [Environment]::SetEnvironmentVariable($key, $value, "Process")
    }
}

$dbUrl = $env:DATABASE_URL
if (-not $dbUrl) {
    Write-Host "❌ Error: DATABASE_URL not set in .env file" -ForegroundColor Red
    exit 1
}

Write-Host "📊 Database: $dbUrl" -ForegroundColor Cyan
Write-Host ""

# Check if Prisma Client exists
if (-not (Test-Path "node_modules\.prisma\client\index.js")) {
    Write-Host "⚠️  Prisma Client not found. Generating..." -ForegroundColor Yellow
    try {
        npx prisma generate
        Write-Host "✅ Prisma Client generated" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to generate Prisma Client" -ForegroundColor Red
        Write-Host "   Please stop the API server and try again" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "✅ Prisma Client found" -ForegroundColor Green
}

Write-Host ""

# Check migration status
Write-Host "Checking migration status..." -ForegroundColor Yellow
$migrationStatus = npx prisma migrate status 2>&1

if ($migrationStatus -match "No migration found") {
    Write-Host "⚠️  No migrations found. Creating initial migration..." -ForegroundColor Yellow
    Write-Host ""
    
    try {
        npx prisma migrate dev --name init_profile_setup
        Write-Host ""
        Write-Host "✅ Migrations created and applied successfully!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Migration failed: $_" -ForegroundColor Red
        exit 1
    }
} elseif ($migrationStatus -match "Database schema is up to date") {
    Write-Host "✅ Database schema is up to date" -ForegroundColor Green
} else {
    Write-Host "⚠️  Schema drift detected. Creating migration..." -ForegroundColor Yellow
    Write-Host ""
    
    try {
        npx prisma migrate dev --name fix_schema_drift
        Write-Host ""
        Write-Host "✅ Migration created and applied!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Migration failed: $_" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "=== Migration Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Verify database: npx prisma studio" -ForegroundColor White
Write-Host "  2. Start API server: npm run dev" -ForegroundColor White
Write-Host "  3. Test endpoints" -ForegroundColor White
Write-Host ""

