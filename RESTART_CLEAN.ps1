# Complete Clean Restart Script
# This kills all node processes, clears caches, and restarts fresh

Write-Host "`n🧹 COMPLETE CLEAN RESTART`n" -ForegroundColor Cyan

# Step 1: Kill ALL node processes
Write-Host "1️⃣ Killing all Node.js processes..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2
Write-Host "✅ All Node processes killed`n" -ForegroundColor Green

# Step 2: Clear Next.js cache
Write-Host "2️⃣ Clearing Next.js build cache..." -ForegroundColor Yellow
if (Test-Path "apps\web\.next") {
    Remove-Item -Path "apps\web\.next" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Next.js cache cleared`n" -ForegroundColor Green
} else {
    Write-Host "⚠️ No .next folder found (already clean)`n" -ForegroundColor Yellow
}

# Step 3: Clear node_modules cache (optional - comment out if slow)
# Write-Host "3️⃣ Clearing node_modules cache..." -ForegroundColor Yellow
# Remove-Item -Path "apps\api\node_modules\.cache" -Recurse -Force -ErrorAction SilentlyContinue
# Remove-Item -Path "apps\web\node_modules\.cache" -Recurse -Force -ErrorAction SilentlyContinue
# Write-Host "✅ node_modules cache cleared`n" -ForegroundColor Green

# Step 4: Verify files have changes
Write-Host "3️⃣ Verifying changes are in files..." -ForegroundColor Yellow
$maxDuration = Select-String -Path "apps\web\src\app\api\proxy\editor\ai\[...segments]\route.ts" -Pattern "maxDuration.*120"
$maxTokens = Select-String -Path "apps\api\services\ai\tailorService.js" -Pattern "max_tokens.*2000"
$timeout = Select-String -Path "apps\api\utils\openAI.js" -Pattern "timeout.*150000"

if ($maxDuration -and $maxTokens -and $timeout) {
    Write-Host "✅ All changes verified in files:`n" -ForegroundColor Green
    Write-Host "   - Frontend timeout: 120s ✅" -ForegroundColor Green
    Write-Host "   - Backend tokens: 2000 ✅" -ForegroundColor Green
    Write-Host "   - OpenAI timeout: 150s ✅`n" -ForegroundColor Green
} else {
    Write-Host "❌ ERROR: Changes not found in files!" -ForegroundColor Red
    Write-Host "   maxDuration: $($maxDuration -ne $null)" -ForegroundColor Red
    Write-Host "   maxTokens: $($maxTokens -ne $null)" -ForegroundColor Red
    Write-Host "   timeout: $($timeout -ne $null)`n" -ForegroundColor Red
    exit 1
}

# Step 5: Start Backend
Write-Host "4️⃣ Starting Backend API (port 3001)..." -ForegroundColor Yellow
cd apps\api
$apiJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; Write-Host '🚀 BACKEND STARTING...' -ForegroundColor Green; node server.js" -PassThru -WindowStyle Normal
cd ..\..
Write-Host "✅ Backend starting (PID: $($apiJob.Id))`n" -ForegroundColor Green

# Step 6: Wait for backend to be ready
Write-Host "5️⃣ Waiting for backend to be ready..." -ForegroundColor Yellow
$maxRetries = 30
$retryCount = 0
$backendReady = $false

while ($retryCount -lt $maxRetries -and -not $backendReady) {
    Start-Sleep -Seconds 1
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 503) {
            $backendReady = $true
            Write-Host "✅ Backend is ready!`n" -ForegroundColor Green
        }
    } catch {
        $retryCount++
        Write-Host "." -NoNewline
    }
}

if (-not $backendReady) {
    Write-Host "`n❌ Backend failed to start after 30 seconds!" -ForegroundColor Red
    exit 1
}

# Step 7: Start Frontend
Write-Host "6️⃣ Starting Frontend (port 3000)..." -ForegroundColor Yellow
cd apps\web
$webJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; Write-Host '🌐 FRONTEND STARTING...' -ForegroundColor Green; npm run dev" -PassThru -WindowStyle Normal
cd ..\..
Write-Host "✅ Frontend starting (PID: $($webJob.Id))`n" -ForegroundColor Green

# Step 8: Wait for frontend to compile
Write-Host "7️⃣ Waiting for frontend to compile (this takes 30-60s)..." -ForegroundColor Yellow
Start-Sleep -Seconds 40

Write-Host "`n✅ CLEAN RESTART COMPLETE!`n" -ForegroundColor Green
Write-Host "📝 IMPORTANT NEXT STEPS:" -ForegroundColor Cyan
Write-Host "   1. Open a NEW Incognito/Private browser window" -ForegroundColor White
Write-Host "   2. Go to: http://localhost:3000/dashboard" -ForegroundColor White
Write-Host "   3. Try the 'Auto-Tailor Resume' feature" -ForegroundColor White
Write-Host "   4. Wait 30-60 seconds (be patient!)" -ForegroundColor White
Write-Host "`nBackend PID: $($apiJob.Id)" -ForegroundColor Yellow
Write-Host "Frontend PID: $($webJob.Id)" -ForegroundColor Yellow
Write-Host ""

