# Comprehensive Testing Script - Auto-runs after fixes
$ErrorActionPreference = "Continue"
$results = @()

function Log-Test {
    param($name, $status, $details = "")
    $results += [PSCustomObject]@{
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

Write-Host "`n══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "RoleReady Comprehensive CRUD Testing Suite" -ForegroundColor Cyan
Write-Host "══════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

# Check server health
Write-Host "Checking server status..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3001/health" -TimeoutSec 5
    Log-Test "Server Health" "✅ PASS" "Server is running"
} catch {
    Log-Test "Server Health" "❌ FAIL" "Server not responding - please start API server"
    Write-Host "`n⚠️ Cannot continue - server must be running`n" -ForegroundColor Red
    exit 1
}

# Step 1: Login
Write-Host "`n1. AUTHENTICATION" -ForegroundColor Yellow
$loginBody = '{"email":"test@example.com","password":"Test1234!"}'
try {
    $login = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $token = $login.token
    $headers = @{
        Authorization = "Bearer $token"
        "Content-Type" = "application/json"
    }
    Log-Test "Login" "✅ PASS" "Token: $($token.Substring(0,20))..."
} catch {
    Log-Test "Login" "❌ FAIL" $_.Exception.Message
    exit 1
}

# Step 2: Resume CRUD
Write-Host "`n2. RESUME CRUD OPERATIONS" -ForegroundColor Yellow
$resumeBody = '{"name":"Test Resume ' + (Get-Date -Format 'HHmmss') + '","data":"{\"name\":\"Test User\",\"email\":\"test@test.com\",\"title\":\"Software Engineer\"}","templateId":"ats-friendly"}'

try {
    $resume = Invoke-RestMethod -Uri "http://localhost:3001/api/resumes" -Method POST -Headers $headers -Body $resumeBody
    $resumeId = $resume.resume.id
    Log-Test "Resume CREATE" "✅ PASS" "ID: $resumeId"
    
    # READ
    $readResume = Invoke-RestMethod -Uri "http://localhost:3001/api/resumes/$resumeId" -Method GET -Headers $headers
    Log-Test "Resume READ" "✅ PASS" "Resume retrieved"
    
    # UPDATE
    $updateBody = '{"name":"Updated Resume Name","data":"{\"name\":\"Updated User\"}"}'
    $updated = Invoke-RestMethod -Uri "http://localhost:3001/api/resumes/$resumeId" -Method PUT -Headers $headers -Body $updateBody
    Log-Test "Resume UPDATE" "✅ PASS" "Resume updated"
    
    # DELETE
    Invoke-RestMethod -Uri "http://localhost:3001/api/resumes/$resumeId" -Method DELETE -Headers $headers | Out-Null
    Log-Test "Resume DELETE" "✅ PASS" "Resume deleted"
    
} catch {
    $errorMsg = if ($_.ErrorDetails.Message) { 
        ($_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue).error 
    } else { 
        $_.Exception.Message 
    }
    Log-Test "Resume CREATE" "❌ FAIL" $errorMsg
}

# Step 3: Profile Update
Write-Host "`n3. PROFILE UPDATE" -ForegroundColor Yellow
$profileBody = '{"name":"Updated Test User ' + (Get-Date -Format 'HHmmss') + '"}'
try {
    $profile = Invoke-RestMethod -Uri "http://localhost:3001/api/users/profile" -Method PUT -Headers $headers -Body $profileBody
    Log-Test "Profile UPDATE" "✅ PASS" "Name: $($profile.user.name)"
} catch {
    $errorMsg = if ($_.ErrorDetails.Message) { 
        ($_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue).error 
    } else { 
        $_.Exception.Message 
    }
    Log-Test "Profile UPDATE" "❌ FAIL" $errorMsg
}

# Step 4: Job CRUD
Write-Host "`n4. JOB CRUD OPERATIONS" -ForegroundColor Yellow
$jobBody = '{"title":"Software Engineer","company":"Test Company ' + (Get-Date -Format 'HHmmss') + '","status":"applied","location":"Remote"}'

try {
    $job = Invoke-RestMethod -Uri "http://localhost:3001/api/jobs" -Method POST -Headers $headers -Body $jobBody
    $jobId = $job.job.id
    Log-Test "Job CREATE" "✅ PASS" "ID: $jobId"
    
    # UPDATE
    $jobUpdateBody = '{"status":"interview"}'
    $updatedJob = Invoke-RestMethod -Uri "http://localhost:3001/api/jobs/$jobId" -Method PUT -Headers $headers -Body $jobUpdateBody
    Log-Test "Job UPDATE" "✅ PASS" "Status updated to interview"
    
    # DELETE
    Invoke-RestMethod -Uri "http://localhost:3001/api/jobs/$jobId" -Method DELETE -Headers $headers | Out-Null
    Log-Test "Job DELETE" "✅ PASS" "Job deleted"
    
} catch {
    $errorMsg = if ($_.ErrorDetails.Message) { 
        ($_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue).error 
    } else { 
        $_.Exception.Message 
    }
    Log-Test "Job CREATE" "❌ FAIL" $errorMsg
}

# Step 5: Cover Letter Create
Write-Host "`n5. COVER LETTER OPERATIONS" -ForegroundColor Yellow
$coverLetterBody = '{"title":"Cover Letter for Test","content":"This is a test cover letter","jobId":null}'
try {
    $cl = Invoke-RestMethod -Uri "http://localhost:3001/api/cover-letters" -Method POST -Headers $headers -Body $coverLetterBody
    $clId = $cl.coverLetter.id
    Log-Test "Cover Letter CREATE" "✅ PASS" "ID: $clId"
} catch {
    $errorMsg = if ($_.ErrorDetails.Message) { 
        ($_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue).error 
    } else { 
        $_.Exception.Message 
    }
    Log-Test "Cover Letter CREATE" "❌ FAIL" $errorMsg
}

# Summary
Write-Host "`n══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "TEST SUMMARY" -ForegroundColor Cyan
Write-Host "══════════════════════════════════════════════════════════" -ForegroundColor Cyan
$passed = ($results | Where-Object { $_.Status -eq "✅ PASS" }).Count
$failed = ($results | Where-Object { $_.Status -eq "❌ FAIL" }).Count
$total = $results.Count
$percentage = [math]::Round(($passed / $total) * 100, 1)

Write-Host "`nTotal Tests: $total" -ForegroundColor White
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor $(if ($failed -gt 0) { "Red" } else { "Green" })
Write-Host "Success Rate: $percentage%" -ForegroundColor $(if ($percentage -ge 80) { "Green" } elseif ($percentage -ge 50) { "Yellow" } else { "Red" })

Write-Host "`nDetailed Results:" -ForegroundColor Cyan
$results | Format-Table -AutoSize | Out-String | Write-Host

# Save results
$results | Export-Csv -Path "test-results-$(Get-Date -Format 'yyyyMMdd-HHmmss').csv" -NoTypeInformation
Write-Host "Results saved to CSV file" -ForegroundColor Gray

