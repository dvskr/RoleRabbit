# Create GitHub PR via API
$repo = "dvskr/RoleReady-FullStack"
$token = $env:GITHUB_TOKEN

if (-not $token) {
    Write-Host "GitHub token not found in environment."
    Write-Host "To create PR via API, set GITHUB_TOKEN environment variable."
    Write-Host ""
    Write-Host "Opening browser to create PR manually..."
    Start-Process "https://github.com/$repo/compare/main...feature_pro_2?expand=1&title=feat:%20Major%20refactoring%20and%20documentation%20cleanup"
    Write-Host "PR description saved to PR_DESCRIPTION.md - copy it to the PR when creating."
    exit
}

$body = Get-Content "PR_DESCRIPTION.md" -Raw

$prData = @{
    title = "feat: Major refactoring and documentation cleanup"
    head = "feature_pro_2"
    base = "main"
    body = $body
} | ConvertTo-Json -Depth 10

$headers = @{
    "Authorization" = "token $token"
    "Accept" = "application/vnd.github.v3+json"
}

try {
    $response = Invoke-RestMethod -Uri "https://api.github.com/repos/$repo/pulls" `
        -Method Post `
        -Headers $headers `
        -Body $prData `
        -ContentType "application/json"
    
    Write-Host "✅ PR created successfully!"
    Write-Host "PR URL: $($response.html_url)"
    Write-Host "PR Number: $($response.number)"
    Start-Process $response.html_url
} catch {
    Write-Host "❌ Error creating PR: $_"
    Write-Host "Opening browser to create PR manually..."
    Start-Process "https://github.com/$repo/compare/main...feature_pro_2?expand=1"
}

