# Start server and test it
Write-Host "Starting server..." -ForegroundColor Yellow
$serverJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    node server.js
}

# Wait for server to start
Start-Sleep -Seconds 8

Write-Host "Testing server..." -ForegroundColor Yellow

# Test health endpoint
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -Method GET -TimeoutSec 5
    Write-Host "✓ Health check passed: Status $($response.StatusCode)" -ForegroundColor Green
    Write-Host "  Response: $($response.Content.Substring(0, [Math]::Min(100, $response.Content.Length)))" -ForegroundColor Gray
} catch {
    Write-Host "✗ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test API status
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/status" -Method GET -TimeoutSec 5
    Write-Host "✓ API status check passed: Status $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "✗ API status check failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test protected route (should return 401)
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/users/profile" -Method GET -TimeoutSec 5
    if ($response.StatusCode -eq 401) {
        Write-Host "✓ Authentication middleware working: Status 401 (Unauthorized)" -ForegroundColor Green
    } else {
        Write-Host "⚠ Authentication middleware: Status $($response.StatusCode) (expected 401)" -ForegroundColor Yellow
    }
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✓ Authentication middleware working: Status 401 (Unauthorized)" -ForegroundColor Green
    } else {
        Write-Host "✗ Authentication test failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`nServer is running in background. Stop it with: Stop-Job $($serverJob.Id); Remove-Job $($serverJob.Id)" -ForegroundColor Cyan
Write-Host "Or test with: node test-refactored-server.js" -ForegroundColor Cyan

