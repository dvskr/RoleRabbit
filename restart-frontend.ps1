# Restart Frontend with Cache Clear
Write-Host "🔄 Restarting Frontend..." -ForegroundColor Cyan

# Navigate to frontend directory
Set-Location "apps\web"

# Clear Next.js cache
Write-Host "🗑️  Clearing Next.js cache..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "✅ Cache cleared!" -ForegroundColor Green
} else {
    Write-Host "ℹ️  No cache to clear" -ForegroundColor Gray
}

# Start dev server
Write-Host "🚀 Starting frontend..." -ForegroundColor Cyan
Write-Host ""
Write-Host "After frontend starts:" -ForegroundColor Yellow
Write-Host "  1. Open http://localhost:3000" -ForegroundColor White
Write-Host "  2. Press Ctrl+Shift+R to hard refresh" -ForegroundColor White
Write-Host "  3. Go to Resume Editor" -ForegroundColor White
Write-Host ""

npm run dev

