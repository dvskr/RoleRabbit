# Simple GitHub PR Creation Script
$owner = "dvskr"
$repo = "RoleReady-FullStack"
$base = "main"
$head = "feature_pro_2"
$title = "feat: Major refactoring and documentation cleanup"

# Read PR description
$body = Get-Content "PR_DESCRIPTION.md" -Raw

# Check for token
$token = $env:GITHUB_TOKEN

if (-not $token) {
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host "  GITHUB TOKEN REQUIRED" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To create PR, you need a GitHub Personal Access Token:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Go to: https://github.com/settings/tokens/new" -ForegroundColor White
    Write-Host "2. Give it a name like 'PR Creation Token'" -ForegroundColor White
    Write-Host "3. Select expiration (30 days is fine)" -ForegroundColor White
    Write-Host "4. Check the 'repo' scope (full control of private repositories)" -ForegroundColor White
    Write-Host "5. Click 'Generate token'" -ForegroundColor White
    Write-Host "6. COPY the token immediately (you won't see it again!)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Then run this command:" -ForegroundColor Cyan
    Write-Host '  $env:GITHUB_TOKEN = "paste_your_token_here"' -ForegroundColor Green
    Write-Host "  .\create-pr-simple.ps1" -ForegroundColor Green
    Write-Host ""
    Write-Host "OR run this one-liner:" -ForegroundColor Cyan
    Write-Host '  $env:GITHUB_TOKEN = "YOUR_TOKEN"; .\create-pr-simple.ps1' -ForegroundColor Green
    Write-Host ""
    exit
}

# Create PR via API
$uri = "https://api.github.com/repos/$owner/$repo/pulls"

$prData = @{
    title = $title
    head = "$owner`:$head"
    base = $base
    body = $body
} | ConvertTo-Json -Depth 10

$headers = @{
    "Authorization" = "Bearer $token"
    "Accept" = "application/vnd.github.v3+json"
}

Write-Host "Creating PR via GitHub API..." -ForegroundColor Cyan
Write-Host "Repository: $owner/$repo" -ForegroundColor Gray
Write-Host "Base: $base <- Head: $head" -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $uri `
        -Method Post `
        -Headers $headers `
        -Body $prData `
        -ContentType "application/json"
    
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ✅ PR CREATED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "PR Number: #$($response.number)" -ForegroundColor Cyan
    Write-Host "PR Title: $($response.title)" -ForegroundColor Cyan
    Write-Host "PR URL: $($response.html_url)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Opening PR in browser..." -ForegroundColor Yellow
    Start-Process $response.html_url
    
} catch {
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  ❌ ERROR CREATING PR" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $responseBody = $reader.ReadToEnd()
        Write-Host "GitHub Response:" -ForegroundColor Yellow
        Write-Host $responseBody -ForegroundColor Yellow
        Write-Host ""
    }
    
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "1. Invalid token - make sure token has 'repo' scope" -ForegroundColor White
    Write-Host "2. Token expired - generate a new token" -ForegroundColor White
    Write-Host "3. Branch name incorrect - verify feature_pro_2 exists" -ForegroundColor White
}

