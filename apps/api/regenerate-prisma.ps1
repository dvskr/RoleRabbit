# Script to regenerate Prisma client with file unlock handling
Write-Host "Attempting to regenerate Prisma client..." -ForegroundColor Yellow

# Wait a moment for any locks to clear
Start-Sleep -Seconds 2

# Try to remove locked files
$prismaClientPath = "..\..\node_modules\.prisma\client"
if (Test-Path $prismaClientPath) {
    Write-Host "Removing old Prisma client files..." -ForegroundColor Yellow
    Get-ChildItem -Path $prismaClientPath -Filter "*.dll.node*" -ErrorAction SilentlyContinue | 
        ForEach-Object {
            try {
                Remove-Item $_.FullName -Force -ErrorAction Stop
                Write-Host "Removed: $($_.Name)" -ForegroundColor Green
            } catch {
                Write-Host "Could not remove: $($_.Name) - File may be locked" -ForegroundColor Red
            }
        }
}

# Wait again
Start-Sleep -Seconds 2

# Generate Prisma client
Write-Host "`nGenerating Prisma client..." -ForegroundColor Yellow
npx prisma generate

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Prisma client generated successfully!" -ForegroundColor Green
} else {
    Write-Host "`n❌ Failed to generate Prisma client." -ForegroundColor Red
    Write-Host "`nTry these solutions:" -ForegroundColor Yellow
    Write-Host "1. Close Cursor/VS Code completely and try again" -ForegroundColor White
    Write-Host "2. Restart your computer" -ForegroundColor White
    Write-Host "3. Run as Administrator: Right-click PowerShell -> Run as Administrator" -ForegroundColor White
}

