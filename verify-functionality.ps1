# RoleReady Platform Verification Script
# Run this to verify all functionality works

Write-Host "`n═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ROLEREADY PLATFORM VERIFICATION" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

# Test 1: Backend Health Check
Write-Host "TEST 1: Backend Health Check" -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3001/health" -TimeoutSec 3
    Write-Host "  ✅ Backend is running" -ForegroundColor Green
    Write-Host "     Status: $($health.status)" -ForegroundColor Gray
    Write-Host "     Database: $($health.checks.database.status)" -ForegroundColor Gray
} catch {
    Write-Host "  ❌ Backend is NOT running" -ForegroundColor Red
    Write-Host "     Start it with: cd apps/api && npm run dev`n" -ForegroundColor Yellow
    exit
}

# Test 2: User Registration
Write-Host "`nTEST 2: User Registration" -ForegroundColor Yellow
$testEmail = "verify$(Get-Random)@test.com"
try {
    $body = @{
        email = $testEmail
        password = "SecurePass123!"
        name = "Test User"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/register" `
        -Method POST -Body $body -ContentType "application/json" -TimeoutSec 5
    
    Write-Host "  ✅ Registration successful" -ForegroundColor Green
    Write-Host "     User: $($response.user.email)" -ForegroundColor Gray
    Write-Host "     ID: $($response.user.id)" -ForegroundColor Gray
    $token = $response.token
    $hasToken = ![string]::IsNullOrEmpty($token)
    Write-Host "     Token received: $hasToken" -ForegroundColor $(if ($hasToken) { "Green" } else { "Red" })
} catch {
    Write-Host "  ❌ Registration failed" -ForegroundColor Red
    Write-Host "     Error: $($_.Exception.Message)" -ForegroundColor Gray
}

# Test 3: User Login
Write-Host "`nTEST 3: User Login" -ForegroundColor Yellow
try {
    $loginBody = @{
        email = $testEmail
        password = "SecurePass123!"
    } | ConvertTo-Json
    
    $loginResp = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" `
        -Method POST -Body $loginBody -ContentType "application/json" -TimeoutSec 5
    
    Write-Host "  ✅ Login successful" -ForegroundColor Green
    Write-Host "     User: $($loginResp.user.email)" -ForegroundColor Gray
    $token = $loginResp.token
    Write-Host "     Token received: $(![string]::IsNullOrEmpty($token))" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Login failed" -ForegroundColor Red
    Write-Host "     Error: $($_.Exception.Message)" -ForegroundColor Gray
}

# Test 4: Protected Endpoints (require auth)
Write-Host "`nTEST 4: Protected Endpoints (with Bearer token)" -ForegroundColor Yellow
if ([string]::IsNullOrEmpty($token)) {
    Write-Host "  ⚠️  Skipped - no token available" -ForegroundColor Yellow
} else {
    $headers = @{ Authorization = "Bearer $token" }
    
    # Test Resumes
    Write-Host "  Testing /api/resumes..." -ForegroundColor Cyan
    try {
        $resumes = Invoke-RestMethod -Uri "http://localhost:3001/api/resumes" `
            -Headers $headers -TimeoutSec 3
        Write-Host "    ✅ GET /api/resumes: $($resumes.resumes.Count) items" -ForegroundColor Green
    } catch {
        Write-Host "    ❌ GET /api/resumes failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Test Jobs
    Write-Host "  Testing /api/jobs..." -ForegroundColor Cyan
    try {
        $jobs = Invoke-RestMethod -Uri "http://localhost:3001/api/jobs" `
            -Headers $headers -TimeoutSec 3
        Write-Host "    ✅ GET /api/jobs: $($jobs.Count) items" -ForegroundColor Green
    } catch {
        Write-Host "    ❌ GET /api/jobs failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Test Cover Letters
    Write-Host "  Testing /api/cover-letters..." -ForegroundColor Cyan
    try {
        $letters = Invoke-RestMethod -Uri "http://localhost:3001/api/cover-letters" `
            -Headers $headers -TimeoutSec 3
        Write-Host "    ✅ GET /api/cover-letters: $($letters.Count) items" -ForegroundColor Green
    } catch {
        Write-Host "    ❌ GET /api/cover-letters failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 5: Frontend Availability
Write-Host "`nTEST 5: Frontend Availability" -ForegroundColor Yellow
try {
    $web = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 2 -UseBasicParsing
    Write-Host "  ✅ Frontend is running" -ForegroundColor Green
    Write-Host "     Status: $($web.StatusCode)" -ForegroundColor Gray
    Write-Host "     Access at: http://localhost:3000" -ForegroundColor Cyan
} catch {
    Write-Host "  ⚠️  Frontend is NOT running" -ForegroundColor Yellow
    Write-Host "     Start it with: cd apps/web && npm run dev" -ForegroundColor Gray
}

# Summary
Write-Host "`n═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  VERIFICATION COMPLETE" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════`n" -ForegroundColor Cyan
Write-Host "RECOMMENDED NEXT STEP:" -ForegroundColor Cyan
Write-Host "  1. Start frontend: cd apps/web && npm run dev" -ForegroundColor White
Write-Host "  2. Open browser: http://localhost:3000" -ForegroundColor White
Write-Host "  3. Test signup/login in UI" -ForegroundColor White
Write-Host "  4. Try creating a resume" -ForegroundColor White
Write-Host "  5. Test job tracking features`n" -ForegroundColor White

