# Fix Git History - Remove Invalid File Path (PowerShell Version)
# This script removes the problematic file from Git history

Write-Host "🔧 Fixing Git history..." -ForegroundColor Yellow
Write-Host ""

# Navigate to repo root
Set-Location "C:\Users\sathish.kumar\RoleReady-FullStack"

# Create a backup branch
Write-Host "📦 Creating backup branch..." -ForegroundColor Cyan
git branch backup-before-fix

# The problematic file path
$invalidFile = 'apps/api/prisma/migrations/$(ls -t prisma/migrations | head -1)/migration.sql'

Write-Host "🗑️  Removing invalid file from Git history..." -ForegroundColor Cyan
Write-Host "   File: $invalidFile" -ForegroundColor Gray
Write-Host ""

# Use git filter-branch to remove the file
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch '$invalidFile'" --prune-empty --tag-name-filter cat -- --all

Write-Host ""
Write-Host "✅ Invalid file removed from Git history!" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  IMPORTANT NEXT STEPS:" -ForegroundColor Yellow
Write-Host "   1. Force push to update the remote repository:" -ForegroundColor White
Write-Host "      git push origin --force --all" -ForegroundColor Cyan
Write-Host ""
Write-Host "   2. After confirming everything works, delete the backup:" -ForegroundColor White
Write-Host "      git branch -D backup-before-fix" -ForegroundColor Cyan
Write-Host ""
Write-Host "   3. Clean up filter-branch backup refs:" -ForegroundColor White
Write-Host "      git for-each-ref --format=`"delete %(refname)`" refs/original | git update-ref --stdin" -ForegroundColor Cyan
Write-Host "      git reflog expire --expire=now --all" -ForegroundColor Cyan
Write-Host "      git gc --prune=now --aggressive" -ForegroundColor Cyan
Write-Host ""

