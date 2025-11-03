# Connect to Supabase PostgreSQL
# Run: .\connect-supabase.ps1

Write-Host "`n=== Connecting to Supabase PostgreSQL ===`n" -ForegroundColor Cyan

# Read DATABASE_URL from .env
$envPath = "apps/api/.env"
if (-not (Test-Path $envPath)) {
    Write-Host "❌ Error: .env file not found at $envPath" -ForegroundColor Red
    exit 1
}

$envContent = Get-Content $envPath -Raw
if ($envContent -match 'DATABASE_URL=(.+)') {
    $dbUrl = $matches[1].Trim()
    
    Write-Host "✅ Found Supabase DATABASE_URL" -ForegroundColor Green
    Write-Host "`nConnection Details:" -ForegroundColor Yellow
    Write-Host "  Host: db.oawxoirhnnvcomopxcdd.supabase.co" -ForegroundColor Gray
    Write-Host "  Database: postgres" -ForegroundColor Gray
    Write-Host "  Schema: roleready`n" -ForegroundColor Gray
    
    Write-Host "Connecting to Supabase..." -ForegroundColor Yellow
    Write-Host "`nOnce connected, try these commands:" -ForegroundColor Cyan
    Write-Host "  \dt roleready.*                              - List all tables" -ForegroundColor Gray
    Write-Host "  SELECT * FROM roleready.sessions;            - View all sessions" -ForegroundColor Gray
    Write-Host "  SELECT COUNT(*) FROM roleready.sessions WHERE `"isActive`" = true;  - Count active sessions" -ForegroundColor Gray
    Write-Host "  \q                                           - Quit`n" -ForegroundColor Gray
    
    # Connect using psql
    psql $dbUrl
} else {
    Write-Host "❌ DATABASE_URL not found in .env" -ForegroundColor Red
    exit 1
}

