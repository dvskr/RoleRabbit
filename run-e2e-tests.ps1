# E2E Test Execution Script
Write-Host "`n════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "E2E Testing - Resume CRUD" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════`n" -ForegroundColor Cyan

# Login
$loginBody = '{"email":"test@example.com","password":"Test1234!"}'
try {
    $login = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $token = $login.token
    $headers = @{
        Authorization = "Bearer $token"
        "Content-Type" = "application/json"
    }
    Write-Host "✅ Login successful" -ForegroundColor Green
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 1: Resume CREATE
Write-Host "`n[TEST 1] Resume CREATE" -ForegroundColor Yellow
$resumeBody = @{
    name = "E2E Test Resume $(Get-Date -Format 'HHmmss')"
    data = '{"name":"Test User","email":"test@test.com","title":"Software Engineer"}'
    templateId = "ats-friendly"
} | ConvertTo-Json -Depth 10

try {
    $resume = Invoke-RestMethod -Uri "http://localhost:3001/api/resumes" -Method POST -Headers $headers -Body $resumeBody
    $resumeId = $resume.resume.id
    Write-Host "✅ PASS - Resume created: $resumeId" -ForegroundColor Green
    
    # Test 2: Resume READ
    Write-Host "`n[TEST 2] Resume READ" -ForegroundColor Yellow
    $readResume = Invoke-RestMethod -Uri "http://localhost:3001/api/resumes/$resumeId" -Method GET -Headers $headers
    Write-Host "✅ PASS - Resume retrieved" -ForegroundColor Green
    
    # Test 3: Resume UPDATE
    Write-Host "`n[TEST 3] Resume UPDATE" -ForegroundColor Yellow
    $updateBody = @{
        name = "Updated Resume Name"
        data = '{"name":"Updated User","email":"updated@test.com"}'
    } | ConvertTo-Json -Depth 10
    $updated = Invoke-RestMethod -Uri "http://localhost:3001/api/resumes/$resumeId" -Method PUT -Headers $headers -Body $updateBody
    Write-Host "✅ PASS - Resume updated" -ForegroundColor Green
    
    # Test 4: Resume DELETE
    Write-Host "`n[TEST 4] Resume DELETE" -ForegroundColor Yellow
    Invoke-RestMethod -Uri "http://localhost:3001/api/resumes/$resumeId" -Method DELETE -Headers $headers | Out-Null
    Write-Host "✅ PASS - Resume deleted" -ForegroundColor Green
    
} catch {
    $errorData = if ($_.ErrorDetails.Message) { 
        ($_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue)
    } else { 
        @{error = $_.Exception.Message}
    }
    Write-Host "❌ FAIL - $($errorData.error)" -ForegroundColor Red
    if ($errorData.details) {
        Write-Host "   Details: $($errorData.details | ConvertTo-Json)" -ForegroundColor Yellow
    }
}

# Test 5: Profile UPDATE
Write-Host "`n[TEST 5] Profile UPDATE" -ForegroundColor Yellow
$profileBody = @{
    name = "Updated Test User $(Get-Date -Format 'HHmmss')"
} | ConvertTo-Json

try {
    $profile = Invoke-RestMethod -Uri "http://localhost:3001/api/users/profile" -Method PUT -Headers $headers -Body $profileBody
    Write-Host "✅ PASS - Profile updated: $($profile.user.name)" -ForegroundColor Green
} catch {
    $errorData = if ($_.ErrorDetails.Message) { 
        ($_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue)
    } else { 
        @{error = $_.Exception.Message}
    }
    Write-Host "❌ FAIL - $($errorData.error)" -ForegroundColor Red
}

# Test 6: Job CREATE
Write-Host "`n[TEST 6] Job CREATE" -ForegroundColor Yellow
$jobBody = @{
    title = "Software Engineer"
    company = "Test Company $(Get-Date -Format 'HHmmss')"
    status = "applied"
    location = "Remote"
} | ConvertTo-Json

try {
    $job = Invoke-RestMethod -Uri "http://localhost:3001/api/jobs" -Method POST -Headers $headers -Body $jobBody
    $jobId = $job.job.id
    Write-Host "✅ PASS - Job created: $jobId" -ForegroundColor Green
    
    # Test 7: Job UPDATE
    Write-Host "`n[TEST 7] Job UPDATE" -ForegroundColor Yellow
    $jobUpdateBody = @{status = "interview"} | ConvertTo-Json
    $updatedJob = Invoke-RestMethod -Uri "http://localhost:3001/api/jobs/$jobId" -Method PUT -Headers $headers -Body $jobUpdateBody
    Write-Host "✅ PASS - Job updated" -ForegroundColor Green
    
    # Test 8: Job DELETE
    Write-Host "`n[TEST 8] Job DELETE" -ForegroundColor Yellow
    Invoke-RestMethod -Uri "http://localhost:3001/api/jobs/$jobId" -Method DELETE -Headers $headers | Out-Null
    Write-Host "✅ PASS - Job deleted" -ForegroundColor Green
    
} catch {
    $errorData = if ($_.ErrorDetails.Message) { 
        ($_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue)
    } else { 
        @{error = $_.Exception.Message}
    }
    Write-Host "❌ FAIL - $($errorData.error)" -ForegroundColor Red
}

Write-Host "`n════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "E2E Tests Complete" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════`n" -ForegroundColor Cyan

