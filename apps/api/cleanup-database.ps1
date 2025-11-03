# Cleanup Database - Remove Unnecessary Tables
# This script drops all tables except profile-related ones

Write-Host "`n=== Database Cleanup ===" -ForegroundColor Cyan
Write-Host "Removing unnecessary tables, keeping only profile-related tables...`n" -ForegroundColor Yellow

# Read DATABASE_URL from .env
$envPath = ".env"
if (-not (Test-Path $envPath)) {
    Write-Host "❌ Error: .env file not found" -ForegroundColor Red
    exit 1
}

$envContent = Get-Content $envPath -Raw
if ($envContent -match 'DATABASE_URL=(.+)') {
    $dbUrl = $matches[1].Trim()
    
    Write-Host "✅ Found DATABASE_URL" -ForegroundColor Green
    Write-Host "`n⚠️  WARNING: This will DROP tables:" -ForegroundColor Red
    Write-Host "  - resumes" -ForegroundColor Gray
    Write-Host "  - jobs" -ForegroundColor Gray
    Write-Host "  - cover_letters" -ForegroundColor Gray
    Write-Host "  - emails" -ForegroundColor Gray
    Write-Host "  - portfolios" -ForegroundColor Gray
    Write-Host "  - cloud_files" -ForegroundColor Gray
    Write-Host "  - cloud_folders" -ForegroundColor Gray
    Write-Host "  - file_shares" -ForegroundColor Gray
    Write-Host "  - credentials" -ForegroundColor Gray
    Write-Host "  - analytics" -ForegroundColor Gray
    Write-Host "  - discussion_posts" -ForegroundColor Gray
    Write-Host "  - discussion_comments" -ForegroundColor Gray
    Write-Host "  - ai_agents" -ForegroundColor Gray
    Write-Host "  - ai_agent_tasks" -ForegroundColor Gray
    Write-Host "  - audit_logs" -ForegroundColor Gray
    Write-Host "  - job_descriptions" -ForegroundColor Gray
    Write-Host "  - analytics_snapshots" -ForegroundColor Gray
    Write-Host "  - ai_usage" -ForegroundColor Gray
    Write-Host "  - notifications`n" -ForegroundColor Gray
    
    Write-Host "✅ KEEPING tables:" -ForegroundColor Green
    Write-Host "  - users (profile data)" -ForegroundColor White
    Write-Host "  - sessions (authentication)" -ForegroundColor White
    Write-Host "  - refresh_tokens (authentication)" -ForegroundColor White
    Write-Host "  - password_reset_tokens (security)`n" -ForegroundColor White
    
    $confirm = Read-Host "Type 'yes' to continue"
    if ($confirm -ne 'yes') {
        Write-Host "`n❌ Cancelled" -ForegroundColor Yellow
        exit 0
    }
    
    Write-Host "`nDropping tables..." -ForegroundColor Yellow
    
    # Execute SQL script
    Get-Content "drop-unnecessary-tables.sql" | psql $dbUrl
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Tables dropped successfully!" -ForegroundColor Green
        Write-Host "`nSyncing Prisma schema..." -ForegroundColor Yellow
        npx prisma db push --accept-data-loss
        
        Write-Host "`n✅ Database cleanup complete!" -ForegroundColor Green
    } else {
        Write-Host "`n❌ Error dropping tables" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ DATABASE_URL not found in .env" -ForegroundColor Red
    exit 1
}

