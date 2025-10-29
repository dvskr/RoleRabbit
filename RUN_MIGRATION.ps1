# Run Prisma Migration Script

Write-Host "Starting Prisma Migration..." -ForegroundColor Green
Write-Host ""

# Navigate to API directory
Set-Location "apps\api"

# Remove old migration lock if exists
if (Test-Path "prisma\migration_lock.toml") {
    Remove-Item "prisma\migration_lock.toml"
    Write-Host "✓ Removed old migration_lock.toml" -ForegroundColor Yellow
}

# Remove old migrations if exist
if (Test-Path "prisma\migrations") {
    Remove-Item -Recurse -Force "prisma\migrations"
    Write-Host "✓ Removed old migrations" -ForegroundColor Yellow
}

# Run migration
Write-Host ""
Write-Host "Running Prisma migration..." -ForegroundColor Cyan
npx prisma migrate dev --name init

# Generate Prisma client
Write-Host ""
Write-Host "Generating Prisma client..." -ForegroundColor Cyan
npx prisma generate

Write-Host ""
Write-Host "✅ Migration Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

