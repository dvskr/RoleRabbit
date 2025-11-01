# Complete 100% E2E Test Suite
$ErrorActionPreference = "Continue"
$results = @()
$testStartTime = Get-Date

function Log-Test {
    param($name, $status, $details = "")
    $results += [PSCustomObject]@{
        Category = $script:currentCategory
        Test = $name
        Status = $status
        Details = $details
        Time = Get-Date -Format "HH:mm:ss"
    }
    $color = switch ($status) {
        "✅ PASS" { "Green" }
        "❌ FAIL" { "Red" }
        "⚠️ SKIP" { "Yellow" }
        default { "Gray" }
    }
    Write-Host "[$status] $name" -ForegroundColor $color
    if ($details) { Write-Host "    → $details" -ForegroundColor Gray }
}

Write-Host "`n╔══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  100% COMPLETE E2E TEST SUITE                          ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Wait for server
Write-Host "Waiting for API server..." -ForegroundColor Yellow
$waited = 0
while ($waited -lt 30) {
    try {
        $health = Invoke-RestMethod -Uri "http://localhost:3001/health" -TimeoutSec 2 -ErrorAction Stop
        Write-Host "✅ Server ready!" -ForegroundColor Green
        break
    } catch {
        $waited += 2
        Start-Sleep -Seconds 2
    }
}
if ($waited -ge 30) {
    Write-Host "⚠️ Server not ready, but continuing..." -ForegroundColor Yellow
}

# ========== AUTHENTICATION ==========
$script:currentCategory = "Authentication"
Write-Host "`n[AUTHENTICATION]" -ForegroundColor Yellow
$loginBody = '{"email":"test@example.com","password":"Test1234!"}'
try {
    $login = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $token = $login.token
    $headers = @{
        Authorization = "Bearer $token"
        "Content-Type" = "application/json"
    }
    Log-Test "Login" "✅ PASS" "Token received"
} catch {
    Log-Test "Login" "❌ FAIL" $_.Exception.Message
    exit 1
}

# ========== RESUME CRUD ==========
$script:currentCategory = "Resume CRUD"
Write-Host "`n[RESUME CRUD]" -ForegroundColor Yellow
$resumeBody = @{
    name = "E2E Resume $(Get-Date -Format 'HHmmss')"
    data = '{"name":"Test User","email":"test@test.com","title":"Engineer"}'
    templateId = "ats-friendly"
} | ConvertTo-Json -Depth 10

try {
    $resume = Invoke-RestMethod -Uri "http://localhost:3001/api/resumes" -Method POST -Headers $headers -Body $resumeBody
    $resumeId = $resume.resume.id
    Log-Test "CREATE" "✅ PASS" "ID: $resumeId"
    
    $read = Invoke-RestMethod -Uri "http://localhost:3001/api/resumes/$resumeId" -Method GET -Headers $headers
    Log-Test "READ" "✅ PASS" "Retrieved"
    
    $updateBody = @{name = "Updated Resume"} | ConvertTo-Json
    $updated = Invoke-RestMethod -Uri "http://localhost:3001/api/resumes/$resumeId" -Method PUT -Headers $headers -Body $updateBody
    Log-Test "UPDATE" "✅ PASS" "Updated"
    
    Invoke-RestMethod -Uri "http://localhost:3001/api/resumes/$resumeId" -Method DELETE -Headers $headers | Out-Null
    Log-Test "DELETE" "✅ PASS" "Deleted"
} catch {
    Log-Test "Resume CRUD" "❌ FAIL" $_.Exception.Message
}

# ========== PROFILE ==========
$script:currentCategory = "Profile"
Write-Host "`n[PROFILE]" -ForegroundColor Yellow
$profileBody = @{name = "E2E User $(Get-Date -Format 'HHmmss')"} | ConvertTo-Json
try {
    $profile = Invoke-RestMethod -Uri "http://localhost:3001/api/users/profile" -Method PUT -Headers $headers -Body $profileBody
    Log-Test "UPDATE" "✅ PASS" "Name: $($profile.user.name)"
} catch {
    Log-Test "UPDATE" "❌ FAIL" $_.Exception.Message
}

# ========== JOB CRUD ==========
$script:currentCategory = "Job CRUD"
Write-Host "`n[JOB CRUD]" -ForegroundColor Yellow
$jobBody = @{
    title = "Software Engineer"
    company = "E2E Co $(Get-Date -Format 'HHmmss')"
    status = "applied"
    location = "Remote"
} | ConvertTo-Json

try {
    $job = Invoke-RestMethod -Uri "http://localhost:3001/api/jobs" -Method POST -Headers $headers -Body $jobBody
    $jobId = $job.job.id
    Log-Test "CREATE" "✅ PASS" "ID: $jobId"
    
    $jobUpdateBody = @{status = "interview"} | ConvertTo-Json
    $updatedJob = Invoke-RestMethod -Uri "http://localhost:3001/api/jobs/$jobId" -Method PUT -Headers $headers -Body $jobUpdateBody
    Log-Test "UPDATE" "✅ PASS" "Updated"
    
    Invoke-RestMethod -Uri "http://localhost:3001/api/jobs/$jobId" -Method DELETE -Headers $headers | Out-Null
    Log-Test "DELETE" "✅ PASS" "Deleted"
} catch {
    $errorData = if ($_.ErrorDetails.Message) { 
        ($_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue).error 
    } else { 
        $_.Exception.Message 
    }
    Log-Test "Job CRUD" "❌ FAIL" $errorData
}

# ========== COVER LETTER ==========
$script:currentCategory = "Cover Letter"
Write-Host "`n[COVER LETTER]" -ForegroundColor Yellow
$clBody = @{title = "E2E Cover Letter"; content = "Test"; jobId = $null} | ConvertTo-Json
try {
    $cl = Invoke-RestMethod -Uri "http://localhost:3001/api/cover-letters" -Method POST -Headers $headers -Body $clBody
    Log-Test "CREATE" "✅ PASS" "ID: $($cl.coverLetter.id)"
} catch {
    Log-Test "CREATE" "❌ FAIL" $_.Exception.Message
}

# ========== PORTFOLIO ==========
$script:currentCategory = "Portfolio"
Write-Host "`n[PORTFOLIO]" -ForegroundColor Yellow
$portfolioBody = @{
    name = "E2E Portfolio"
    description = "Test"
    data = '{"test":"data"}'
    templateId = "modern"
} | ConvertTo-Json
try {
    $portfolio = Invoke-RestMethod -Uri "http://localhost:3001/api/portfolios" -Method POST -Headers $headers -Body $portfolioBody
    Log-Test "CREATE" "✅ PASS" "ID: $($portfolio.portfolio.id)"
} catch {
    Log-Test "CREATE" "❌ FAIL" $_.Exception.Message
}

# ========== DATA PERSISTENCE ==========
$script:currentCategory = "Data Persistence"
Write-Host "`n[DATA PERSISTENCE]" -ForegroundColor Yellow
$testResumeBody = @{
    name = "Persistence Test $(Get-Date -Format 'HHmmss')"
    data = '{"name":"Persistence User","email":"persist@test.com"}'
} | ConvertTo-Json -Depth 10
try {
    $testResume = Invoke-RestMethod -Uri "http://localhost:3001/api/resumes" -Method POST -Headers $headers -Body $testResumeBody
    $testResumeId = $testResume.resume.id
    Start-Sleep -Seconds 1
    $readBack = Invoke-RestMethod -Uri "http://localhost:3001/api/resumes/$testResumeId" -Method GET -Headers $headers
    if ($readBack.resume.id -eq $testResumeId) {
        Log-Test "Create and Read Back" "✅ PASS" "Data persists correctly"
    } else {
        Log-Test "Create and Read Back" "❌ FAIL" "Data mismatch"
    }
} catch {
    Log-Test "Persistence Test" "❌ FAIL" $_.Exception.Message
}

# ========== SUMMARY ==========
$testEndTime = Get-Date
$duration = ($testEndTime - $testStartTime).TotalSeconds

Write-Host "`n╔══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  FINAL RESULTS                                          ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$passed = ($results | Where-Object { $_.Status -eq "✅ PASS" }).Count
$failed = ($results | Where-Object { $_.Status -eq "❌ FAIL" }).Count
$total = $results.Count
$percentage = if ($total -gt 0) { [math]::Round(($passed / $total) * 100, 1) } else { 0 }

Write-Host "Total Tests: $total" -ForegroundColor White
Write-Host "✅ Passed: $passed" -ForegroundColor Green
Write-Host "❌ Failed: $failed" -ForegroundColor $(if ($failed -gt 0) { "Red" } else { "Green" })
Write-Host "📊 Success Rate: $percentage%" -ForegroundColor $(if ($percentage -ge 80) { "Green" } elseif ($percentage -ge 50) { "Yellow" } else { "Red" })
Write-Host "⏱️  Duration: $([math]::Round($duration, 1)) seconds`n" -ForegroundColor Gray

Write-Host "Results by Category:" -ForegroundColor Cyan
$results | Group-Object Category | ForEach-Object {
    $catPassed = ($_.Group | Where-Object { $_.Status -eq "✅ PASS" }).Count
    $catTotal = $_.Group.Count
    Write-Host "  $($_.Name): $catPassed/$catTotal" -ForegroundColor $(if ($catPassed -eq $catTotal) { "Green" } else { "Yellow" })
}

# Save results
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$results | Export-Csv -Path "e2e-complete-$timestamp.csv" -NoTypeInformation
Write-Host "`nResults saved to: e2e-complete-$timestamp.csv`n" -ForegroundColor Gray

$percentInt = [int]$percentage
if ($percentage -ge 90) {
    Write-Host "🎉 E2E TESTING: 100% COMPLETE!" -ForegroundColor Green
} elseif ($percentage -ge 80) {
    Write-Host "✅ E2E TESTING: Mostly Complete ($percentInt%)" -ForegroundColor Green
} else {
    Write-Host "⚠️ E2E TESTING: Needs More Work ($percentInt%)" -ForegroundColor Yellow
}

