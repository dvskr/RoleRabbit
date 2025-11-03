# Connect to PostgreSQL using .env DATABASE_URL
# Run: .\connect-postgres.ps1

Write-Host "`n=== Connecting to PostgreSQL ===`n" -ForegroundColor Cyan

# Read DATABASE_URL from .env
$envPath = "apps/api/.env"
if (-not (Test-Path $envPath)) {
    Write-Host "❌ Error: .env file not found at $envPath" -ForegroundColor Red
    exit 1
}

$envContent = Get-Content $envPath -Raw
if ($envContent -match 'DATABASE_URL=(.+)') {
    $dbUrl = $matches[1].Trim()
    
    Write-Host "✅ Found DATABASE_URL" -ForegroundColor Green
    Write-Host "`nConnecting to PostgreSQL..." -ForegroundColor Yellow
    Write-Host "`nOnce connected, try these commands:" -ForegroundColor Cyan
    Write-Host "  \dt roleready.*          - List all tables" -ForegroundColor Gray
    Write-Host "  SELECT * FROM roleready.sessions;  - View sessions" -ForegroundColor Gray
    Write-Host "  \q                       - Quit`n" -ForegroundColor Gray
    
    # Connect using psql
    psql $dbUrl
} else {
    Write-Host "❌ DATABASE_URL not found in .env" -ForegroundColor Red
    exit 1
}

