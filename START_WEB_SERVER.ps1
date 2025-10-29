# Quick Start Script for Web Server
Write-Host "🚀 Starting RoleReady Web Server..." -ForegroundColor Cyan
Write-Host ""

# Navigate to web directory
Set-Location -Path "$PSScriptRoot\apps\web"

# Check if we're in the right place
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found!" -ForegroundColor Red
    Write-Host "   Make sure you're running this from the project root." -ForegroundColor Yellow
    exit 1
}

# Kill any existing process on port 3000
Write-Host "🔍 Checking port 3000..." -ForegroundColor Yellow
$existingProcess = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($existingProcess) {
    Write-Host "   Killing existing process..." -ForegroundColor Yellow
    $existingProcess | ForEach-Object { 
        Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue 
    }
    Start-Sleep -Seconds 1
}

# Start the server
Write-Host "✅ Starting Next.js dev server..." -ForegroundColor Green
Write-Host "   This may take 30-60 seconds on first run (compiling modules)" -ForegroundColor Yellow
Write-Host "   Please wait for '✓ Ready' message..." -ForegroundColor Yellow
Write-Host ""
npm run dev

