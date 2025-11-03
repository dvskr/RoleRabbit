# Database Setup Script for RoleReady API
# This script sets up the database for the Profile component

Write-Host "`n=== RoleReady Database Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "prisma\schema.prisma")) {
    Write-Host "❌ Error: prisma\schema.prisma not found. Please run this script from apps/api directory." -ForegroundColor Red
    exit 1
}

# Check if .env file exists
$envFile = ".env"
if (-not (Test-Path $envFile)) {
    Write-Host "⚠️  .env file not found. Creating one..." -ForegroundColor Yellow
    
    # Check if .env.example exists
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "✅ Created .env from .env.example" -ForegroundColor Green
    } else {
        # Create basic .env file
        @"
# Database Configuration
# For PostgreSQL (production/recommended):
# DATABASE_URL="postgresql://user:password@localhost:5432/roleready?schema=public"

# For SQLite (development - easier setup):
DATABASE_URL="file:./prisma/dev.db"

# JWT Secret
JWT_SECRET="your-secret-key-change-in-production"

# Node Environment
NODE_ENV="development"
"@ | Out-File -FilePath $envFile -Encoding utf8
        Write-Host "✅ Created basic .env file" -ForegroundColor Green
    }
}

# Load environment variables
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]*)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            if ($value -match '^["\'](.*)["\']$') {
                $value = $matches[1]
            }
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
}

# Check DATABASE_URL
$dbUrl = $env:DATABASE_URL
if (-not $dbUrl) {
    Write-Host "⚠️  DATABASE_URL not set. Using SQLite for development..." -ForegroundColor Yellow
    $dbUrl = "file:./prisma/dev.db"
    [Environment]::SetEnvironmentVariable("DATABASE_URL", $dbUrl, "Process")
}

Write-Host "📊 Database URL: $dbUrl" -ForegroundColor Cyan
Write-Host ""

# Determine database type
$dbType = "Unknown"
if ($dbUrl -match "postgresql://") {
    $dbType = "PostgreSQL"
} elseif ($dbUrl -match "file:") {
    $dbType = "SQLite"
}

Write-Host "🔍 Detected database type: $dbType" -ForegroundColor Cyan
Write-Host ""

# Step 1: Install dependencies if needed
Write-Host "Step 1: Checking Prisma dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules\@prisma\client")) {
    Write-Host "   Installing Prisma dependencies..." -ForegroundColor Gray
    npm install @prisma/client prisma
} else {
    Write-Host "   ✅ Prisma dependencies already installed" -ForegroundColor Green
}
Write-Host ""

# Step 2: Generate Prisma Client
Write-Host "Step 2: Generating Prisma Client..." -ForegroundColor Yellow
try {
    npx prisma generate
    Write-Host "   ✅ Prisma Client generated successfully" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Failed to generate Prisma Client: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 3: Check PostgreSQL connection (if using PostgreSQL)
if ($dbType -eq "PostgreSQL") {
    Write-Host "Step 3: Checking PostgreSQL connection..." -ForegroundColor Yellow
    Write-Host "   ⚠️  Please ensure PostgreSQL is running and accessible" -ForegroundColor Yellow
    Write-Host "   You can test with: psql -U postgres -c 'SELECT version();'" -ForegroundColor Gray
    Write-Host ""
}

# Step 4: Run migrations
Write-Host "Step 4: Running database migrations..." -ForegroundColor Yellow
try {
    if ($dbType -eq "SQLite") {
        Write-Host "   Using SQLite - migrations will create dev.db if it doesn't exist" -ForegroundColor Gray
    }
    
    npx prisma migrate dev --name init_profile_setup
    Write-Host "   ✅ Migrations completed successfully" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Migration failed: $_" -ForegroundColor Red
    Write-Host "   💡 Tip: If using PostgreSQL, ensure the database exists:" -ForegroundColor Yellow
    Write-Host "      CREATE DATABASE roleready;" -ForegroundColor Gray
    exit 1
}
Write-Host ""

# Step 5: Verify database connection
Write-Host "Step 5: Verifying database connection..." -ForegroundColor Yellow
try {
    node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.\$queryRaw\`SELECT 1\`.then(() => { console.log('✅ Database connection successful'); process.exit(0); }).catch(e => { console.error('❌ Database connection failed:', e.message); process.exit(1); });"
    Write-Host "   ✅ Database connection verified" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  Could not verify connection automatically" -ForegroundColor Yellow
    Write-Host "   You can test manually by starting the server" -ForegroundColor Gray
}
Write-Host ""

# Step 6: Summary
Write-Host "=== Setup Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Database setup completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Verify .env file has correct DATABASE_URL" -ForegroundColor White
Write-Host "  2. Start the API server: npm run dev" -ForegroundColor White
Write-Host "  3. Test profile endpoints" -ForegroundColor White
Write-Host ""
Write-Host "Database type: $dbType" -ForegroundColor Cyan
Write-Host "Database URL: $dbUrl" -ForegroundColor Cyan
Write-Host ""

