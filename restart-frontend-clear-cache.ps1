# Restart Frontend with Cache Clear
# Run this script to see the latest changes

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  RESTARTING FRONTEND" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to web directory
Set-Location "C:\Users\sathish.kumar\RoleReady-FullStack\apps\web"

# Step 1: Clear Next.js cache
Write-Host "Step 1: Clearing Next.js cache..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next
    Write-Host "✓ Cache cleared" -ForegroundColor Green
} else {
    Write-Host "✓ No cache to clear" -ForegroundColor Green
}
Write-Host ""

# Step 2: Instructions for user
Write-Host "Step 2: Manual actions needed:" -ForegroundColor Yellow
Write-Host "  1. Stop the current dev server (Ctrl+C)" -ForegroundColor White
Write-Host "  2. Run: npm run dev" -ForegroundColor White
Write-Host "  3. Hard refresh browser (Ctrl+Shift+R)" -ForegroundColor White
Write-Host ""

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Changes you should see:" -ForegroundColor Cyan
Write-Host "  ✓ No 'View Changes' link in status bar" -ForegroundColor Green
Write-Host "  ✓ 'Discard Draft' opens diff viewer" -ForegroundColor Green
Write-Host "  ✓ Inline confirmation with animation" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan


